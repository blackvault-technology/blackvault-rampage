import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createHash, randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import {
  eq,
  and,
  getDb,
  getLearnerState,
  getUserByEmail,
  getUserById,
  getOrCreateRampageUser,
  rampageCertificates,
  rampageProgress,
  rampageReaderBookmarks,
  rampageReaderHighlights,
  rampageReaderState,
  rampageLearnerPreferences,
  writeAuditEvent,
} from "./db";
import { COURSE_LESSON_COUNTS, buildAttemptIntegrity, getCourseRule, isAssessmentWithinWindow, isSupportedCourse } from "@shared/courseRules";
import { chapterQuizBank, finalAssessmentBank } from "@shared/courseAssessments";
import { desc, sql } from "drizzle-orm";
import { localAuthTokens, rampageAssessmentAttempts, rampageChapterCompletions, rampageLessonState, rampageQuizAttempts, rampageXpLedger, userTable } from "./db";
import { sdk } from "./_core/sdk";
import { getRequestOrigin, passwordResetMessage, sendTransactionalEmail, verificationMessage } from "./email";

const courseIdInput = z.object({ courseId: z.string().min(1).max(120) });

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function serializeSessionCookie(name: string, value: string, options: { maxAge: number; expires?: Date; httpOnly?: boolean; path?: string; sameSite?: boolean | "none" | "lax" | "strict"; secure?: boolean }) {
  const sameSite = options.sameSite === true ? "Strict" : options.sameSite === "none" ? "None" : options.sameSite === "strict" ? "Strict" : "Lax";
  const attributes = [
    `Path=${options.path ?? "/"}`,
    options.httpOnly !== false ? "HttpOnly" : "",
    `SameSite=${sameSite}`,
    options.secure ? "Secure" : "",
    `Max-Age=${options.maxAge}`,
    options.expires ? `Expires=${options.expires.toUTCString()}` : "",
  ].filter(Boolean);
  return `${name}=${encodeURIComponent(value)}; ${attributes.join("; ")}`;
}

function passwordDigest(password: string, salt: Buffer) {
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, saltHex: string, hashHex: string) {
  const expected = Buffer.from(hashHex, "hex");
  const actual = Buffer.from(passwordDigest(password, Buffer.from(saltHex, "hex")), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function createOneTimeCode() {
  return String(randomInt(100000, 1000000));
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function issueAuthCode(userId: number, purpose: "verify_email" | "reset_password") {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  const [recent] = await db.select({ id: localAuthTokens.id }).from(localAuthTokens).where(and(eq(localAuthTokens.userId, userId), eq(localAuthTokens.purpose, purpose), sql`${localAuthTokens.consumedAt} IS NULL`, sql`${localAuthTokens.createdAt} > now() - interval '60 seconds'`)).orderBy(desc(localAuthTokens.createdAt)).limit(1);
  if (recent) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait a minute before requesting another code." });
  await db.update(localAuthTokens).set({ consumedAt: new Date() }).where(and(eq(localAuthTokens.userId, userId), eq(localAuthTokens.purpose, purpose), sql`${localAuthTokens.consumedAt} IS NULL`));
  const code = createOneTimeCode();
  await db.insert(localAuthTokens).values({ userId, tokenHash: hashToken(code), purpose, expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
  return code;
}

async function deliverAuthCode(ctx: { req: any }, user: { email: string | null }, code: string, purpose: "verify_email" | "reset_password") {
  if (!user.email) return { delivered: false as const, reason: "missing_email" as const };
  const origin = getRequestOrigin(ctx.req);
  const message = purpose === "verify_email" ? verificationMessage(origin, user.email, code) : passwordResetMessage(origin, user.email, code);
  const delivery = await sendTransactionalEmail(message);
  return delivery.enabled ? { delivered: true as const, reason: "sent" as const } : { delivered: false as const, reason: delivery.reason };
}

async function setSessionCookie(ctx: { req: any; res: any }, user: { openId: string; name: string | null }) {
  const token = await sdk.createSessionToken(user.openId, { name: user.name ?? "Rampage learner" });
  const serializedCookie = serializeSessionCookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 60 * 60 * 24 * 30 });
  ctx.res.setHeader("Set-Cookie", serializedCookie);
}

async function awardXp(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, eventKey: string, amount: number, sourceType: string, sourceId: string, courseId: string, metadata: Record<string, unknown> = {}) {
  const inserted = await db.insert(rampageXpLedger).values({ userId, eventKey, amount, sourceType, sourceId, courseId, metadata }).onConflictDoNothing({ target: [rampageXpLedger.userId, rampageXpLedger.eventKey] }).returning({ amount: rampageXpLedger.amount });
  return inserted[0]?.amount ?? 0;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(80), email: z.string().email().max(320), password: z.string().min(10).max(128) })).mutation(async ({ ctx, input }) => {
      const email = normalizeEmail(input.email);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      if (await getUserByEmail(email)) throw new TRPCError({ code: "CONFLICT", message: "An account with that email already exists" });
      const salt = randomBytes(16);
      const openId = `local_${randomUUID()}`;
      const [user] = await db.insert(userTable).values({ openId, name: input.name.trim(), email, loginMethod: "password", passwordHash: passwordDigest(input.password, salt), passwordSalt: salt.toString("hex") }).returning();
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to create account" });
      const verificationCode = await issueAuthCode(user.id, "verify_email");
      const delivery = await deliverAuthCode(ctx, user, verificationCode, "verify_email");
      await setSessionCookie(ctx, user);
      return { ...user, delivery, developmentVerificationCode: process.env.NODE_ENV === "development" ? verificationCode : undefined };
    }),
    requestVerification: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user?.email) throw new TRPCError({ code: "BAD_REQUEST", message: "Add an email address before requesting verification." });
      if (user.emailVerifiedAt) return { sent: false, alreadyVerified: true as const };
      const code = await issueAuthCode(user.id, "verify_email");
      const delivery = await deliverAuthCode(ctx, user, code, "verify_email");
      return { sent: true, alreadyVerified: false as const, delivery, developmentCode: process.env.NODE_ENV === "development" ? code : undefined };
    }),
    verifyEmail: publicProcedure.input(z.object({ email: z.string().email().max(320), code: z.string().regex(/^\d{6}$/) })).mutation(async ({ input }) => {
      const user = await getUserByEmail(normalizeEmail(input.email));
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [token] = await db.select().from(localAuthTokens).where(and(eq(localAuthTokens.userId, user.id), eq(localAuthTokens.purpose, "verify_email"), eq(localAuthTokens.tokenHash, hashToken(input.code)), sql`${localAuthTokens.consumedAt} IS NULL`, sql`${localAuthTokens.expiresAt} > now()`)).limit(1);
      if (!token) throw new TRPCError({ code: "BAD_REQUEST", message: "That verification code is invalid or expired." });
      await db.update(localAuthTokens).set({ consumedAt: new Date() }).where(eq(localAuthTokens.id, token.id));
      await db.update(userTable).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(userTable.id, user.id));
      return { success: true as const };
    }),
    requestPasswordReset: publicProcedure.input(z.object({ email: z.string().email().max(320) })).mutation(async ({ ctx, input }) => {
      const user = await getUserByEmail(normalizeEmail(input.email));
      if (!user) return { sent: true as const };
      const code = await issueAuthCode(user.id, "reset_password");
      const delivery = await deliverAuthCode(ctx, user, code, "reset_password");
      return { sent: true as const, delivery, developmentCode: process.env.NODE_ENV === "development" ? code : undefined };
    }),
    resetPassword: publicProcedure.input(z.object({ email: z.string().email().max(320), code: z.string().regex(/^\d{6}$/), password: z.string().min(10).max(128) })).mutation(async ({ input }) => {
      const user = await getUserByEmail(normalizeEmail(input.email));
      if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "That reset code is invalid or expired." });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [token] = await db.select().from(localAuthTokens).where(and(eq(localAuthTokens.userId, user.id), eq(localAuthTokens.purpose, "reset_password"), eq(localAuthTokens.tokenHash, hashToken(input.code)), sql`${localAuthTokens.consumedAt} IS NULL`, sql`${localAuthTokens.expiresAt} > now()`)).limit(1);
      if (!token) throw new TRPCError({ code: "BAD_REQUEST", message: "That reset code is invalid or expired." });
      const salt = randomBytes(16);
      await db.update(userTable).set({ passwordHash: passwordDigest(input.password, salt), passwordSalt: salt.toString("hex"), updatedAt: new Date() }).where(eq(userTable.id, user.id));
      await db.update(localAuthTokens).set({ consumedAt: new Date() }).where(eq(localAuthTokens.id, token.id));
      return { success: true as const };
    }),
    profile: protectedProcedure.query(async ({ ctx }) => getUserById(ctx.user.id)),
    updateProfile: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(80), email: z.string().email().max(320) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const email = normalizeEmail(input.email);
      const existing = await getUserByEmail(email);
      if (existing && existing.id !== ctx.user.id) throw new TRPCError({ code: "CONFLICT", message: "That email is already in use." });
      const [updated] = await db.update(userTable).set({ name: input.name, email, emailVerifiedAt: email === ctx.user.email ? undefined : null, updatedAt: new Date() }).where(eq(userTable.id, ctx.user.id)).returning();
      return updated;
    }),
    login: publicProcedure.input(z.object({ email: z.string().email().max(320), password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
      const user = await getUserByEmail(normalizeEmail(input.email));
      if (!user?.passwordHash || !user.passwordSalt || !verifyPassword(input.password, user.passwordSalt, user.passwordHash)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      const db = await getDb();
      if (db) await db.update(userTable).set({ lastSignedIn: new Date(), updatedAt: new Date() }).where(eq(userTable.id, user.id));
      await setSessionCookie(ctx, user);
      return user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      if (typeof ctx.res.setHeader === "function") {
        const serializedCookie = serializeSessionCookie(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0, expires: new Date(0) });
        ctx.res.setHeader("Set-Cookie", serializedCookie);
      } else if (typeof ctx.res.clearCookie === "function") {
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      }
      return { success: true } as const;
    }),
  }),

  learner: router({
    state: protectedProcedure.query(async ({ ctx }) => getLearnerState(ctx.user.openId)),
    savePreferences: protectedProcedure.input(z.object({ goal: z.string().trim().min(3).max(160), weeklyTargetMinutes: z.number().int().min(15).max(2400), notificationsEnabled: z.boolean() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      const [preferences] = await db.insert(rampageLearnerPreferences).values({ userId: learner.id, goal: input.goal, weeklyTargetMinutes: input.weeklyTargetMinutes, notificationsEnabled: input.notificationsEnabled ? 1 : 0 }).onConflictDoUpdate({ target: rampageLearnerPreferences.userId, set: { goal: input.goal, weeklyTargetMinutes: input.weeklyTargetMinutes, notificationsEnabled: input.notificationsEnabled ? 1 : 0, updatedAt: new Date() } }).returning();
      await writeAuditEvent(learner.id, "learner_preferences_updated", "learner", String(learner.id), { weeklyTargetMinutes: input.weeklyTargetMinutes, notificationsEnabled: input.notificationsEnabled });
      return preferences;
    }),
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      const state = await getLearnerState(ctx.user.openId);
      return {
        learner: state.learner,
        progress: state.progress,
        certificates: state.certificates,
        xp: state.xp,
        xpLedger: state.xpLedger.slice(0, 12),
        readerState: state.readerState,
        bookmarks: state.bookmarks,
        highlights: state.highlights,
        preferences: state.preferences,
      };
    }),
    completeLesson: protectedProcedure.input(z.object({ courseId: z.string().min(1), lessonId: z.string().min(1) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported course" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageProgress).values({ userId: learner.id, courseId: input.courseId, lessonId: input.lessonId }).onConflictDoUpdate({
        target: [rampageProgress.userId, rampageProgress.courseId, rampageProgress.lessonId],
        set: { completedAt: new Date() },
      });
      const xpAwarded = await awardXp(db, learner.id, `lesson:${input.courseId}:${input.lessonId}`, 10, "lesson_completion", input.lessonId, input.courseId);
      await writeAuditEvent(learner.id, "lesson_completed", "lesson", input.lessonId, { courseId: input.courseId, xpAwarded });
      return { success: true, xpAwarded } as const;
    }),
    saveReaderState: protectedProcedure.input(z.object({ resourceId: z.string().min(1), currentPage: z.number().int().min(1), progressPercent: z.number().min(0).max(100), note: z.string().max(5000).nullable().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageReaderState).values({ userId: learner.id, resourceId: input.resourceId, currentPage: input.currentPage, progressPercent: String(input.progressPercent), note: input.note ?? null }).onConflictDoUpdate({
        target: [rampageReaderState.userId, rampageReaderState.resourceId],
        set: { currentPage: input.currentPage, progressPercent: String(input.progressPercent), note: input.note ?? null, updatedAt: new Date() },
      });
      return { success: true } as const;
    }),
    addBookmark: protectedProcedure.input(z.object({ resourceId: z.string().min(1), page: z.number().int().min(1), label: z.string().max(160).nullable().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageReaderBookmarks).values({ userId: learner.id, resourceId: input.resourceId, page: input.page, label: input.label ?? null }).onConflictDoNothing();
      return { success: true } as const;
    }),
    removeBookmark: protectedProcedure.input(z.object({ resourceId: z.string().min(1), page: z.number().int().min(1) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId);
      await db.delete(rampageReaderBookmarks).where(and(eq(rampageReaderBookmarks.userId, learner.id), eq(rampageReaderBookmarks.resourceId, input.resourceId), eq(rampageReaderBookmarks.page, input.page)));
      return { success: true } as const;
    }),
    addHighlight: protectedProcedure.input(z.object({ resourceId: z.string().min(1), page: z.number().int().min(1), quote: z.string().min(1).max(5000), note: z.string().max(2000).nullable().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageReaderHighlights).values({ userId: learner.id, resourceId: input.resourceId, page: input.page, quote: input.quote, note: input.note ?? null });
      return { success: true } as const;
    }),
    saveTimeline: protectedProcedure.input(z.object({ courseId: z.string().min(1), lessonId: z.string().min(1), currentSecond: z.number().int().min(0), durationSecond: z.number().int().min(0) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported course" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageLessonState).values({ userId: learner.id, courseId: input.courseId, lessonId: input.lessonId, currentSecond: input.currentSecond, durationSecond: input.durationSecond }).onConflictDoUpdate({ target: [rampageLessonState.userId, rampageLessonState.courseId, rampageLessonState.lessonId], set: { currentSecond: input.currentSecond, durationSecond: input.durationSecond, updatedAt: new Date() } });
      return { success: true } as const;
    }),
    saveLessonWorkflow: protectedProcedure.input(z.object({ courseId: z.string().min(1), lessonId: z.string().min(1), currentSecond: z.number().int().min(0), durationSecond: z.number().int().min(0), sourceComplete: z.boolean(), labComplete: z.boolean(), evidenceComplete: z.boolean(), evidenceNote: z.string().max(280) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported course" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageLessonState).values({ userId: learner.id, courseId: input.courseId, lessonId: input.lessonId, currentSecond: input.currentSecond, durationSecond: input.durationSecond, sourceComplete: input.sourceComplete ? 1 : 0, labComplete: input.labComplete ? 1 : 0, evidenceComplete: input.evidenceComplete ? 1 : 0, evidenceNote: input.evidenceNote.trim() || null }).onConflictDoUpdate({ target: [rampageLessonState.userId, rampageLessonState.courseId, rampageLessonState.lessonId], set: { currentSecond: input.currentSecond, durationSecond: input.durationSecond, sourceComplete: input.sourceComplete ? 1 : 0, labComplete: input.labComplete ? 1 : 0, evidenceComplete: input.evidenceComplete ? 1 : 0, evidenceNote: input.evidenceNote.trim() || null, updatedAt: new Date() } });
      return { success: true } as const;
    }),
    completeChapter: protectedProcedure.input(z.object({ courseId: z.string().min(1), chapterId: z.string().min(1), lessonIds: z.array(z.string().min(1)).min(1) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported course" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      const completed = await db.select({ lessonId: rampageProgress.lessonId }).from(rampageProgress).where(and(eq(rampageProgress.userId, learner.id), eq(rampageProgress.courseId, input.courseId)));
      const completedIds = new Set(completed.map(row => row.lessonId));
      if (!input.lessonIds.every(id => completedIds.has(id))) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Complete every lesson in this chapter first." });
      await db.insert(rampageChapterCompletions).values({ userId: learner.id, courseId: input.courseId, chapterId: input.chapterId }).onConflictDoUpdate({ target: [rampageChapterCompletions.userId, rampageChapterCompletions.courseId, rampageChapterCompletions.chapterId], set: { completedAt: new Date() } });
      const xpAwarded = await awardXp(db, learner.id, `chapter:${input.courseId}:${input.chapterId}`, 50, "chapter_completion", input.chapterId, input.courseId);
      await writeAuditEvent(learner.id, "chapter_completed", "chapter", input.chapterId, { courseId: input.courseId, xpAwarded });
      return { success: true, xpAwarded } as const;
    }),
    submitQuiz: protectedProcedure.input(z.object({ courseId: z.string().min(1), chapterId: z.string().min(1), lessonId: z.string().min(1), answers: z.record(z.string(), z.number().int().min(0)), startedAt: z.number().int().positive(), tabSwitches: z.number().int().min(0).max(100), fullscreenExits: z.number().int().min(0).max(100) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported course" });
      const questions = chapterQuizBank[input.courseId] ?? [];
      if (!questions.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This lesson has no verified quiz yet." });
      const expectedIds = new Set(questions.map((question) => question.id));
      const answerIds = Object.keys(input.answers);
      if (answerIds.length !== questions.length || answerIds.some((id) => !expectedIds.has(id)) || questions.some((question) => input.answers[question.id] === undefined || input.answers[question.id] >= question.options.length)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Submit exactly one valid answer for every checkpoint question." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      const previous = await db.select().from(rampageQuizAttempts).where(and(eq(rampageQuizAttempts.userId, learner.id), eq(rampageQuizAttempts.courseId, input.courseId), eq(rampageQuizAttempts.chapterId, input.chapterId), eq(rampageQuizAttempts.lessonId, input.lessonId)));
      const score = Math.round((questions.filter(question => input.answers[question.id] === question.answer).length / questions.length) * 100);
      const passed = score >= 80 ? 1 : 0;
      const submittedAt = Date.now();
      if (!isAssessmentWithinWindow(input.startedAt, submittedAt, 5 * 60)) throw new TRPCError({ code: "TIMEOUT", message: "Knowledge-check window expired. Review the lesson source before retrying." });
      await db.insert(rampageQuizAttempts).values({ userId: learner.id, courseId: input.courseId, chapterId: input.chapterId, lessonId: input.lessonId, attemptNumber: previous.length + 1, score, passed, answers: input.answers, integrity: buildAttemptIntegrity({ startedAt: input.startedAt, submittedAt, tabSwitches: input.tabSwitches, fullscreenExits: input.fullscreenExits, questionOrder: questions.map(question => question.id) }), startedAt: new Date(input.startedAt), submittedAt: new Date(submittedAt) });
      const xpAwarded = passed ? await awardXp(db, learner.id, `quiz-pass:${input.courseId}:${input.lessonId}`, 25, "quiz_pass", input.lessonId, input.courseId, { score }) : 0;
      await writeAuditEvent(learner.id, "quiz_submitted", "lesson", input.lessonId, { courseId: input.courseId, score, passed, xpAwarded });
      return { score, passed: Boolean(passed), xpAwarded, explanations: questions.map(question => ({ id: question.id, explanation: question.explanation })) };
    }),
    submitFinalAssessment: protectedProcedure.input(z.object({ courseId: z.string().min(1), answers: z.record(z.string(), z.number().int().min(0)), startedAt: z.number().int().positive(), tabSwitches: z.number().int().min(0).max(100), fullscreenExits: z.number().int().min(0).max(100) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported course" });
      const rule = getCourseRule(input.courseId);
      const questions = finalAssessmentBank[input.courseId] ?? [];
      if (!rule || questions.length !== rule.finalQuestionCount) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Assessment configuration is incomplete." });
      const expectedIds = new Set(questions.map((question) => question.id));
      const answerIds = Object.keys(input.answers);
      if (answerIds.length !== questions.length || answerIds.some((id) => !expectedIds.has(id)) || questions.some((question) => input.answers[question.id] === undefined || input.answers[question.id] >= question.options.length)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Submit exactly one valid answer for every assessment question." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      const previous = await db.select().from(rampageAssessmentAttempts).where(and(eq(rampageAssessmentAttempts.userId, learner.id), eq(rampageAssessmentAttempts.courseId, input.courseId)));
      const recent = previous.filter(attempt => attempt.startedAt.getTime() > Date.now() - 24 * 60 * 60 * 1000);
      if (recent.length >= rule.maxAssessmentAttemptsPerDay) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Daily assessment attempt limit reached. Return after the review window." });
      const score = Math.round((questions.filter(question => input.answers[question.id] === question.answer).length / questions.length) * 100);
      const passed = score >= rule.passScore ? 1 : 0;
      const submittedAt = Date.now();
      if (!isAssessmentWithinWindow(input.startedAt, submittedAt)) throw new TRPCError({ code: "TIMEOUT", message: "Assessment time window expired or start time is invalid. Review the course before retrying." });
      await db.insert(rampageAssessmentAttempts).values({ userId: learner.id, courseId: input.courseId, attemptNumber: previous.length + 1, score, passed, answers: input.answers, questionOrder: questions.map(question => question.id), integrity: buildAttemptIntegrity({ startedAt: input.startedAt, submittedAt, tabSwitches: input.tabSwitches, fullscreenExits: input.fullscreenExits, questionOrder: questions.map(question => question.id) }), startedAt: new Date(input.startedAt), submittedAt: new Date(submittedAt) });
      const xpAwarded = passed ? await awardXp(db, learner.id, `final-pass:${input.courseId}`, 200, "final_assessment_pass", input.courseId, input.courseId, { score, attemptNumber: previous.length + 1 }) : 0;
      await writeAuditEvent(learner.id, "final_assessment_submitted", "course", input.courseId, { score, passed, xpAwarded, attemptNumber: previous.length + 1 });
      return { score, passed: Boolean(passed), xpAwarded, attemptNumber: previous.length + 1, review: questions.map(question => ({ id: question.id, correctOption: question.answer, explanation: question.explanation })) };
    }),
    issueCertificate: protectedProcedure.input(courseIdInput).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported course" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      const completed = await db.select({ lessonId: rampageProgress.lessonId }).from(rampageProgress).where(and(eq(rampageProgress.userId, learner.id), eq(rampageProgress.courseId, input.courseId)));
      const required = COURSE_LESSON_COUNTS[input.courseId];
      const rule = getCourseRule(input.courseId);
      if (completed.length < required) throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Complete all ${required} lessons before requesting a certificate.` });
      const chapters = await db.select().from(rampageChapterCompletions).where(and(eq(rampageChapterCompletions.userId, learner.id), eq(rampageChapterCompletions.courseId, input.courseId)));
      if (!rule || chapters.length < rule.chapterCount) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Complete every chapter before requesting a certificate." });
      const assessments = await db.select().from(rampageAssessmentAttempts).where(and(eq(rampageAssessmentAttempts.userId, learner.id), eq(rampageAssessmentAttempts.courseId, input.courseId)));
      if (!assessments.some(attempt => attempt.passed === 1)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Pass the final assessment before requesting a certificate." });
      const existing = await db.select().from(rampageCertificates).where(and(eq(rampageCertificates.userId, learner.id), eq(rampageCertificates.courseId, input.courseId))).limit(1);
      if (existing[0]) return existing[0];
      const certificateId = `RMP-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const publicRecordId = `RMPV-${new Date().getUTCFullYear()}-${randomBytes(10).toString("hex").toUpperCase()}`;
      const completionHash = createHash("sha256").update(`${learner.id}:${input.courseId}:${completed.length}:${process.env.JWT_SECRET ?? "rampage"}`).digest("hex");
      await db.insert(rampageCertificates).values({ certificateId, publicRecordId, userId: learner.id, courseId: input.courseId, completionHash, metadata: { learnerName: learner.name, lessonCount: completed.length, nonAccredited: true } });
      await writeAuditEvent(learner.id, "certificate_issued", "course", input.courseId, { certificateId });
      const issued = await db.select().from(rampageCertificates).where(eq(rampageCertificates.certificateId, certificateId)).limit(1);
      return issued[0];
    }),
  }),
  certificate: router({
    verify: publicProcedure.input(z.object({ recordId: z.string().trim().regex(/^RMPV-\d{4}-[A-F0-9]{20}$/i) })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [certificate] = await db.select({ certificateId: rampageCertificates.certificateId, publicRecordId: rampageCertificates.publicRecordId, courseId: rampageCertificates.courseId, issuedAt: rampageCertificates.issuedAt, metadata: rampageCertificates.metadata }).from(rampageCertificates).where(eq(rampageCertificates.publicRecordId, input.recordId.toUpperCase())).limit(1);
      if (!certificate) throw new TRPCError({ code: "NOT_FOUND", message: "Certificate record not found." });
      const metadata = (certificate.metadata && typeof certificate.metadata === "object" ? certificate.metadata : {}) as Record<string, unknown>;
      return { certificateId: certificate.certificateId, publicRecordId: certificate.publicRecordId, courseId: certificate.courseId, issuedAt: certificate.issuedAt, learnerName: typeof metadata.learnerName === "string" ? metadata.learnerName : "Rampage learner", lessonCount: typeof metadata.lessonCount === "number" ? metadata.lessonCount : null, nonAccredited: metadata.nonAccredited === true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
