import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createHash, randomUUID } from "node:crypto";
import {
  eq,
  and,
  getDb,
  getLearnerState,
  getOrCreateRampageUser,
  rampageCertificates,
  rampageProgress,
  rampageReaderBookmarks,
  rampageReaderHighlights,
  rampageReaderState,
  writeAuditEvent,
} from "./db";
import { COURSE_LESSON_COUNTS, buildAttemptIntegrity, getCourseRule, isAssessmentWithinWindow, isSupportedCourse } from "@shared/courseRules";
import { chapterQuizBank, finalAssessmentBank } from "@shared/courseAssessments";
import { desc, sql } from "drizzle-orm";
import { rampageAssessmentAttempts, rampageChapterCompletions, rampageLessonState, rampageQuizAttempts, rampageXpLedger } from "./db";

const courseIdInput = z.object({ courseId: z.string().min(1).max(120) });

async function awardXp(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, eventKey: string, amount: number, sourceType: string, sourceId: string, courseId: string, metadata: Record<string, unknown> = {}) {
  const inserted = await db.insert(rampageXpLedger).values({ userId, eventKey, amount, sourceType, sourceId, courseId, metadata }).onConflictDoNothing({ target: [rampageXpLedger.userId, rampageXpLedger.eventKey] }).returning({ amount: rampageXpLedger.amount });
  return inserted[0]?.amount ?? 0;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  learner: router({
    state: protectedProcedure.query(async ({ ctx }) => getLearnerState(ctx.user.openId)),
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
      const completionHash = createHash("sha256").update(`${learner.id}:${input.courseId}:${completed.length}:${process.env.JWT_SECRET ?? "rampage"}`).digest("hex");
      await db.insert(rampageCertificates).values({ certificateId, userId: learner.id, courseId: input.courseId, completionHash, metadata: { learnerName: learner.name, lessonCount: completed.length, nonAccredited: true } });
      await writeAuditEvent(learner.id, "certificate_issued", "course", input.courseId, { certificateId });
      const issued = await db.select().from(rampageCertificates).where(eq(rampageCertificates.certificateId, certificateId)).limit(1);
      return issued[0];
    }),
  }),
});

export type AppRouter = typeof appRouter;
