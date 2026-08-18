// server/vercel-api.ts
import express from "express";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: isSecureRequest(req) ? "none" : "lax",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";
import { createHash, randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

// server/db.ts
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// drizzle/schema.ts
import {
  bigint,
  bigserial,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar
} from "drizzle-orm/pg-core";
var users = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    openId: text("open_id").notNull(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("login_method", { length: 64 }),
    passwordHash: text("password_hash"),
    passwordSalt: text("password_salt"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    role: text("role").notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastSignedIn: timestamp("last_signed_in", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({ openIdUnique: uniqueIndex("users_open_id_unique").on(table.openId) })
);
var rampageUsers = pgTable(
  "rampage_users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    authOpenId: text("auth_open_id").notNull(),
    email: text("email"),
    name: text("name"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({ authOpenIdUnique: uniqueIndex("rampage_users_auth_open_id_unique").on(table.authOpenId) })
);
var rampageProgress = pgTable(
  "rampage_progress",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    courseId: text("course_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.courseId, table.lessonId] }),
    userIndex: index("rampage_progress_user_idx").on(table.userId)
  })
);
var rampageReaderState = pgTable(
  "rampage_reader_state",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    resourceId: text("resource_id").notNull(),
    currentPage: integer("current_page").notNull().default(1),
    progressPercent: numeric("progress_percent", { precision: 5, scale: 2 }).notNull().default("0"),
    note: text("note"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({ pk: primaryKey({ columns: [table.userId, table.resourceId] }) })
);
var rampageReaderBookmarks = pgTable(
  "rampage_reader_bookmarks",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    resourceId: text("resource_id").notNull(),
    page: integer("page").notNull(),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({ pk: primaryKey({ columns: [table.userId, table.resourceId, table.page] }) })
);
var rampageReaderHighlights = pgTable(
  "rampage_reader_highlights",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    resourceId: text("resource_id").notNull(),
    page: integer("page").notNull(),
    quote: text("quote").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({ userResourceIndex: index("rampage_reader_highlights_user_resource_idx").on(table.userId, table.resourceId) })
);
var rampageCertificates = pgTable(
  "rampage_certificates",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    certificateId: text("certificate_id").notNull(),
    publicRecordId: text("public_record_id").notNull(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    courseId: text("course_id").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
    completionHash: text("completion_hash").notNull(),
    metadata: jsonb("metadata").notNull().default({})
  },
  (table) => ({
    certificateUnique: uniqueIndex("rampage_certificates_certificate_id_unique").on(table.certificateId),
    publicRecordUnique: uniqueIndex("rampage_certificates_public_record_id_unique").on(table.publicRecordId),
    userCourseUnique: uniqueIndex("rampage_certificates_user_course_unique").on(table.userId, table.courseId)
  })
);
var rampageAuditEvents = pgTable(
  "rampage_audit_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }),
    eventType: text("event_type").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({ userCreatedIndex: index("rampage_audit_user_created_idx").on(table.userId, table.createdAt) })
);
var localAuthTokens = pgTable(
  "local_auth_tokens",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    tokenHash: text("token_hash").notNull(),
    purpose: text("purpose").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({ tokenUnique: uniqueIndex("local_auth_tokens_hash_unique").on(table.tokenHash), userPurposeIndex: index("local_auth_tokens_user_purpose_idx").on(table.userId, table.purpose) })
);
var rampageXpLedger = pgTable(
  "rampage_xp_ledger",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    eventKey: text("event_key").notNull(),
    amount: integer("amount").notNull(),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    courseId: text("course_id"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    eventUnique: uniqueIndex("rampage_xp_event_unique").on(table.userId, table.eventKey),
    userCreatedIndex: index("rampage_xp_user_created_idx").on(table.userId, table.createdAt)
  })
);
var rampageLearnerPreferences = pgTable(
  "rampage_learner_preferences",
  {
    userId: bigint("user_id", { mode: "number" }).primaryKey(),
    goal: text("goal").notNull().default("Build a durable systems practice"),
    weeklyTargetMinutes: integer("weekly_target_minutes").notNull().default(120),
    notificationsEnabled: integer("notifications_enabled").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  }
);
var rampageLessonState = pgTable(
  "rampage_lesson_state",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    courseId: text("course_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    currentSecond: integer("current_second").notNull().default(0),
    durationSecond: integer("duration_second").notNull().default(0),
    sourceComplete: integer("source_complete").notNull().default(0),
    labComplete: integer("lab_complete").notNull().default(0),
    evidenceComplete: integer("evidence_complete").notNull().default(0),
    evidenceNote: text("evidence_note"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({ pk: primaryKey({ columns: [table.userId, table.courseId, table.lessonId] }), userIndex: index("rampage_lesson_state_user_idx").on(table.userId, table.updatedAt) })
);
var rampageChapterCompletions = pgTable(
  "rampage_chapter_completions",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    courseId: text("course_id").notNull(),
    chapterId: text("chapter_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({ pk: primaryKey({ columns: [table.userId, table.courseId, table.chapterId] }) })
);
var rampageQuizAttempts = pgTable(
  "rampage_quiz_attempts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    courseId: text("course_id").notNull(),
    chapterId: text("chapter_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    score: integer("score").notNull().default(0),
    passed: integer("passed").notNull().default(0),
    answers: jsonb("answers").notNull().default({}),
    integrity: jsonb("integrity").notNull().default({}),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
  },
  (table) => ({ userCourseIndex: index("rampage_quiz_attempts_user_course_idx").on(table.userId, table.courseId, table.chapterId) })
);
var rampageAssessmentAttempts = pgTable(
  "rampage_assessment_attempts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    courseId: text("course_id").notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    score: integer("score").notNull().default(0),
    passed: integer("passed").notNull().default(0),
    answers: jsonb("answers").notNull().default({}),
    questionOrder: jsonb("question_order").notNull().default([]),
    integrity: jsonb("integrity").notNull().default({}),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
  },
  (table) => ({ userCourseIndex: index("rampage_assessment_attempts_user_course_idx").on(table.userId, table.courseId, table.startedAt) })
);

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.NEON_DATABASE_URL) {
    try {
      _db = drizzle(neon(process.env.NEON_DATABASE_URL));
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return result[0];
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function getOrCreateRampageUser(authOpenId, name, email) {
  const db = await getDb();
  if (!db) throw new Error("Neon database is not configured");
  await db.insert(rampageUsers).values({ authOpenId, name: name ?? null, email: email ?? null }).onConflictDoUpdate({
    target: rampageUsers.authOpenId,
    set: { name: name ?? null, email: email ?? null, updatedAt: /* @__PURE__ */ new Date() }
  });
  const rows = await db.select().from(rampageUsers).where(eq(rampageUsers.authOpenId, authOpenId)).limit(1);
  if (!rows[0]) throw new Error("Unable to resolve Rampage learner");
  return rows[0];
}
async function getLearnerState(authOpenId) {
  const learner = await getOrCreateRampageUser(authOpenId);
  const db = await getDb();
  if (!db) throw new Error("Neon database is not configured");
  const preferencesQuery = db.select().from(rampageLearnerPreferences).where(eq(rampageLearnerPreferences.userId, learner.id)).limit(1).catch((error) => {
    console.warn("[Database] Learner preferences unavailable; using defaults:", error instanceof Error ? error.message : error);
    return [];
  });
  const [progress, readerState, bookmarks, highlights, certificates, xpLedger, lessonState, preferences] = await Promise.all([
    db.select().from(rampageProgress).where(eq(rampageProgress.userId, learner.id)),
    db.select().from(rampageReaderState).where(eq(rampageReaderState.userId, learner.id)).orderBy(desc(rampageReaderState.updatedAt)),
    db.select().from(rampageReaderBookmarks).where(eq(rampageReaderBookmarks.userId, learner.id)).orderBy(desc(rampageReaderBookmarks.createdAt)),
    db.select().from(rampageReaderHighlights).where(eq(rampageReaderHighlights.userId, learner.id)).orderBy(desc(rampageReaderHighlights.createdAt)),
    db.select().from(rampageCertificates).where(eq(rampageCertificates.userId, learner.id)).orderBy(desc(rampageCertificates.issuedAt)).catch((error) => {
      console.warn("[Database] Certificates unavailable; continuing learner state without certificates:", error instanceof Error ? error.message : error);
      return [];
    }),
    db.select().from(rampageXpLedger).where(eq(rampageXpLedger.userId, learner.id)),
    db.select().from(rampageLessonState).where(eq(rampageLessonState.userId, learner.id)).orderBy(desc(rampageLessonState.updatedAt)),
    preferencesQuery
  ]);
  const xp = xpLedger.reduce((total, entry) => total + entry.amount, 0);
  return { learner, progress, readerState, bookmarks, highlights, certificates, xp, xpLedger, lessonState, preferences: preferences[0] ?? null };
}
async function writeAuditEvent(userId, eventType, entityType, entityId, metadata = {}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(rampageAuditEvents).values({ userId, eventType, entityType: entityType ?? null, entityId: entityId ?? null, metadata });
}

// shared/courseRules.ts
var COURSE_RULES = {
  "systems-fundamentals": { lessonCount: 13, chapterCount: 6, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 },
  "ai-systems": { lessonCount: 10, chapterCount: 5, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 },
  "systems-research-lab": { lessonCount: 8, chapterCount: 4, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 },
  "compiler-runtime-architecture": { lessonCount: 8, chapterCount: 4, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 },
  "networking-systems": { lessonCount: 12, chapterCount: 6, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 },
  "ai-product-systems": { lessonCount: 6, chapterCount: 3, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 },
  "ai-evaluation-engineering": { lessonCount: 6, chapterCount: 3, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 },
  "ai-data-infrastructure": { lessonCount: 6, chapterCount: 3, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 }
};
var COURSE_LESSON_COUNTS = Object.fromEntries(
  Object.entries(COURSE_RULES).map(([id, rule]) => [id, rule.lessonCount])
);
function isSupportedCourse(courseId) {
  return courseId in COURSE_RULES;
}
function getCourseRule(courseId) {
  return isSupportedCourse(courseId) ? COURSE_RULES[courseId] : void 0;
}
function isAssessmentWithinWindow(startedAt, submittedAt, maxSeconds = 16 * 60, clockSkewMs = 5e3) {
  if (startedAt > submittedAt + clockSkewMs) return false;
  return submittedAt - startedAt <= maxSeconds * 1e3;
}
function buildAttemptIntegrity(input) {
  return {
    startedAt: new Date(input.startedAt).toISOString(),
    submittedAt: new Date(input.submittedAt).toISOString(),
    elapsedSeconds: Math.max(0, Math.round((input.submittedAt - input.startedAt) / 1e3)),
    tabSwitches: Math.max(0, input.tabSwitches),
    fullscreenExits: Math.max(0, input.fullscreenExits),
    questionOrderHash: input.questionOrder.join("|").slice(0, 512)
  };
}

// shared/courseAssessments.ts
var chapterQuizBank = {
  "networking-systems": [
    { id: "net-q1", prompt: "What is the main purpose of layering in a network architecture?", options: ["To separate responsibilities behind stable interfaces", "To eliminate all latency", "To replace IP addresses", "To make every device identical"], answer: 0, explanation: "Layering keeps responsibilities and interfaces separate so a change in one part does not require rewriting every other part." },
    { id: "net-q2", prompt: "What does a router primarily use to make a forwarding decision?", options: ["A destination network prefix", "A browser cookie", "A CPU instruction", "A PDF bookmark"], answer: 0, explanation: "Routers compare the destination address with routing prefixes to choose the next hop." },
    { id: "net-q3", prompt: "What problem does TCP congestion control respond to?", options: ["Too much traffic competing for network capacity", "A missing HTML tag", "A broken keyboard", "A compiler syntax error"], answer: 0, explanation: "Congestion control adapts sending behavior when traffic competes for limited capacity and queues grow." }
  ],
  "systems-fundamentals": [
    { id: "sf-q1", prompt: "Which abstraction lets a process use addresses without directly naming physical RAM?", options: ["Virtual memory", "Git", "TCP", "A shell alias"], answer: 0, explanation: "Virtual memory maps process-visible addresses to physical memory." },
    { id: "sf-q2", prompt: "What does a system call cross?", options: ["The user/kernel boundary", "A DNS zone", "A compiler phase", "A CSS module"], answer: 0, explanation: "System calls are the controlled interface from user programs into the kernel." },
    { id: "sf-q3", prompt: "What problem does Raft primarily address?", options: ["Consensus among replicas", "Rendering pixels", "Compressing PDFs", "Parsing HTML"], answer: 0, explanation: "Raft is a consensus algorithm for replicated state machines." }
  ],
  "ai-systems": [
    { id: "ai-q1", prompt: "What is the most useful first boundary when explaining an AI product?", options: ["Data, model, evaluation, serving, and user goal", "Only the model size", "Only the prompt", "Only the GPU brand"], answer: 0, explanation: "A system view separates the model from the surrounding data, evaluation, serving, and goal." },
    { id: "ai-q2", prompt: "Why does sequence length affect inference cost?", options: ["More tokens create more memory and compute work", "It changes the keyboard layout", "It disables batching", "It removes evaluation"], answer: 0, explanation: "Longer sequences increase attention, memory, and generation work." },
    { id: "ai-q3", prompt: "What should be versioned before claiming an AI change improved quality?", options: ["An evaluation set and its results", "Only a screenshot", "Only a model name", "A random prompt"], answer: 0, explanation: "A versioned evaluation set makes comparisons reproducible." }
  ],
  "ai-product-systems": [
    { id: "aps-q1", prompt: "What should be defined before choosing a model for an AI product?", options: ["The user, task, constraint, and measurable outcome", "The largest available context window", "A brand palette", "A deployment region only"], answer: 0, explanation: "A useful AI product starts with a concrete user problem and a measurable outcome; model choice follows that boundary." },
    { id: "aps-q2", prompt: "What is the purpose of a retrieval evaluation?", options: ["To check whether selected context supports the answer and its evidence", "To make every answer longer", "To remove the need for source material", "To guarantee zero latency"], answer: 0, explanation: "Retrieval must be judged by whether it provides relevant, traceable context for the task." },
    { id: "aps-q3", prompt: "Which operating signal belongs in an AI product brief?", options: ["Latency, cost, failures, quality, and user impact", "Only the prompt text", "Only the model's parameter count", "Only a screenshot"], answer: 0, explanation: "A product brief should make the feature's behavior and operating envelope inspectable." }
  ],
  "ai-evaluation-engineering": [
    { id: "aee-q1", prompt: "What makes an evaluation metric useful?", options: ["It supports a decision about the intended task", "It is large and impressive", "It changes on every run", "It ignores difficult cases"], answer: 0, explanation: "A metric earns its place when it helps decide whether the system meets a stated quality goal." },
    { id: "aee-q2", prompt: "Why include ambiguous and harmful cases in an evaluation set?", options: ["They expose failure modes hidden by easy examples", "They make the score look higher", "They replace human review", "They remove the need for versioning"], answer: 0, explanation: "Representative evaluation includes the cases where the system may be unsafe, uncertain, or misleading." },
    { id: "aee-q3", prompt: "What should a regression harness compare?", options: ["A versioned system against a stable set and baseline", "Only the newest prompt", "Only one successful example", "A random sample with no record"], answer: 0, explanation: "Repeatable comparisons need a stable evaluation set, a known baseline, and versioned results." }
  ],
  "ai-data-infrastructure": [
    { id: "adi-q1", prompt: "Why write a data contract before scaling a pipeline?", options: ["To state provenance, ownership, quality expectations, and allowed use", "To avoid inspecting source data", "To guarantee perfect retrieval", "To replace monitoring"], answer: 0, explanation: "A data contract makes assumptions about source, ownership, quality, and use explicit." },
    { id: "adi-q2", prompt: "What is a key risk when choosing chunk boundaries?", options: ["Splitting context so the evidence needed for an answer is lost", "Making every document identical", "Removing all metadata automatically", "Eliminating the need for embeddings"], answer: 0, explanation: "Chunking changes which relationships and evidence survive into the model context." },
    { id: "adi-q3", prompt: "What does retrieval freshness require?", options: ["Defined invalidation, ownership, and a way to detect stale context", "A larger model only", "No source timestamps", "A fixed prompt forever"], answer: 0, explanation: "Freshness is an operational promise that needs ownership and observable invalidation behavior." }
  ],
  "systems-research-lab": [
    { id: "sr-q1", prompt: "What makes a systems experiment useful?", options: ["A falsifiable question and observable evidence", "A larger font", "A longer README only", "An unrecorded intuition"], answer: 0, explanation: "Systems claims need questions, measurements, and reproducible evidence." },
    { id: "sr-q2", prompt: "What should a failure matrix include?", options: ["Failure modes, expected behavior, and observed evidence", "Only successful runs", "Only latency", "Only source code"], answer: 0, explanation: "A failure matrix connects failure scenarios to expected and measured behavior." },
    { id: "sr-q3", prompt: "Why trace a syscall boundary?", options: ["To connect user intent to kernel work", "To change DNS", "To style a dashboard", "To hide a failure"], answer: 0, explanation: "Tracing reveals the path from a user operation into the kernel." }
  ],
  "compiler-runtime-architecture": [
    { id: "cr-q1", prompt: "Why use an intermediate representation?", options: ["To separate program meaning from a particular machine or source syntax", "To avoid parsing", "To remove tests", "To replace the runtime"], answer: 0, explanation: "IR creates a stable boundary for analysis, optimization, and code generation." },
    { id: "cr-q2", prompt: "What does a calling convention specify?", options: ["How calls use registers, stack frames, and return values", "How PDFs are indexed", "How packets route", "How CSS is themed"], answer: 0, explanation: "Calling conventions define the ABI contract between compiled functions." },
    { id: "cr-q3", prompt: "What makes a benchmark credible?", options: ["A repeatable workload and a baseline", "One fast run", "A subjective claim", "No measurement"], answer: 0, explanation: "Benchmarks need repeatable inputs and a comparison point." }
  ],
  "cpp-engineering": [
    { id: "cpp-q1", prompt: "What does RAII make explicit?", options: ["Resource ownership and cleanup tied to object lifetime", "The CPU brand", "The network route", "The HTML structure"], answer: 0, explanation: "RAII ties cleanup to scope and object lifetime, reducing manual ownership mistakes." },
    { id: "cpp-q2", prompt: "Why choose a standard container by its complexity guarantee?", options: ["The access pattern and cost shape the design", "It guarantees every program is faster", "It removes the need for tests", "It makes ownership irrelevant"], answer: 0, explanation: "Container choice affects operations, complexity, invalidation, and the resulting behavior of the program." },
    { id: "cpp-q3", prompt: "What do concepts add to a template interface?", options: ["Visible requirements on the types that may be used", "Automatic memory safety for every program", "A replacement for the linker", "A guarantee that all algorithms are optimal"], answer: 0, explanation: "Concepts state constraints at the interface and improve diagnostics and overload selection." },
    { id: "cpp-q4", prompt: "What is the strongest first step when diagnosing a C++ performance issue?", options: ["Define a workload, collect a baseline, and measure", "Rewrite the whole program", "Add threads immediately", "Trust a visual guess"], answer: 0, explanation: "A repeatable workload and baseline turn an intuition into an inspectable performance claim." },
    { id: "cpp-q5", prompt: "What should a reproducible CMake project make clear?", options: ["Targets, dependencies, compile features, and build steps", "Only the executable name", "Only the developer's machine", "Only the source file count"], answer: 0, explanation: "A target-oriented build describes how the project is assembled and reproduced on another machine." },
    { id: "cpp-q6", prompt: "What belongs in a concurrency design before adding threads?", options: ["Ownership, synchronization, shutdown, and observable invariants", "Only a larger thread count", "Only a mutex around everything", "Only a benchmark screenshot"], answer: 0, explanation: "Concurrency is a coordination contract; the shared state, lifecycle, and evidence need to be explicit." }
  ]
};
var finalAssessmentBank = {
  "cpp-engineering": [
    { id: "cpp-f1", prompt: "Which design best communicates ownership in a modern C++ program?", options: ["A type whose lifetime and cleanup follow scope, with ownership visible at the boundary", "Raw pointers everywhere with comments", "A global cleanup function called at exit", "A larger class hierarchy"], answer: 0, explanation: "Ownership should be visible in types and interfaces so lifetime is inspectable and testable." },
    { id: "cpp-f2", prompt: "What is a useful role for the C++ standard library?", options: ["Use well-specified containers and algorithms before rebuilding them", "Avoid learning complexity guarantees", "Replace all design decisions", "Guarantee no bugs"], answer: 0, explanation: "The library provides tested vocabulary, but engineers still choose by contract, complexity, and fit." },
    { id: "cpp-f3", prompt: "What makes a C++ test suite useful?", options: ["It states behavior across normal, boundary, and failure cases", "It only maximizes line coverage", "It records one successful run", "It hides implementation failures"], answer: 0, explanation: "Tests are evidence of behavior and should protect the contract, including important failure paths." },
    { id: "cpp-f4", prompt: "What should a performance claim include?", options: ["A repeatable workload, baseline, measurement method, result, and limits", "Only a faster-looking implementation", "Only a profiler image", "Only the compiler version"], answer: 0, explanation: "Performance evidence needs context so another engineer can reproduce and challenge the conclusion." },
    { id: "cpp-f5", prompt: "What is the capstone handoff meant to prove?", options: ["The tool can be built, tested, explained, and improved with known limits", "The code has no possible bugs", "The program uses every C++ feature", "The largest possible binary was produced"], answer: 0, explanation: "The handoff makes the artifact, evidence, trade-offs, and limitations legible to another engineer." }
  ],
  "ai-product-systems": [
    { id: "aps-f1", prompt: "What is the strongest first step for an AI feature?", options: ["Define the user problem, task, constraints, and quality bar", "Choose the biggest model", "Skip evaluation until launch", "Start with a dashboard"], answer: 0, explanation: "A bounded user problem and quality bar make later architecture and evaluation decisions testable." },
    { id: "aps-f2", prompt: "What should retrieval evidence let a reviewer do?", options: ["Trace an answer back to relevant source context", "Confirm that every answer is correct automatically", "Avoid reading source material", "Hide low-confidence results"], answer: 0, explanation: "Retrieval should improve inspectability and evidence, not create an unreviewable black box." },
    { id: "aps-f3", prompt: "Why version evaluation results?", options: ["To compare changes against a known set and baseline", "To make scores impossible to challenge", "To remove product judgment", "To avoid monitoring"], answer: 0, explanation: "Versioning preserves the comparison needed to understand whether a change actually helped." },
    { id: "aps-f4", prompt: "Which set of signals best describes operating an AI feature?", options: ["Quality, latency, cost, failures, and user impact", "Only token count", "Only uptime", "Only a model card"], answer: 0, explanation: "A production feature has technical and user-facing behavior that must be observed together." },
    { id: "aps-f5", prompt: "What belongs in a responsible AI system brief?", options: ["Data, model, evaluation, costs, failure modes, and next experiment", "Only a prompt", "Only a vendor name", "Only a launch date"], answer: 0, explanation: "The brief should make the system's evidence and limits legible to the next person." }
  ],
  "ai-evaluation-engineering": [
    { id: "aee-f1", prompt: "What is an evaluation contract?", options: ["A defined task, dataset, rubric, metric, and decision rule", "A model purchase order", "A prompt library without outcomes", "A dashboard theme"], answer: 0, explanation: "An evaluation contract states what is measured, how it is judged, and what decision follows." },
    { id: "aee-f2", prompt: "What makes a test set representative?", options: ["It covers normal, difficult, ambiguous, and risk-relevant cases", "It contains only easy examples", "It changes silently each run", "It excludes real failure modes"], answer: 0, explanation: "A useful set reflects the range of behavior the system will meet in practice." },
    { id: "aee-f3", prompt: "What does a rubric add beyond a raw score?", options: ["An explanation of why an output succeeds or fails", "A guarantee of truth", "A replacement for examples", "A way to remove human judgment"], answer: 0, explanation: "Rubrics make quality judgments more consistent and more useful for debugging." },
    { id: "aee-f4", prompt: "Why track evaluation drift?", options: ["Because data, users, and system behavior change over time", "Because scores never need context", "Because monitoring replaces testing", "Because old results are always wrong"], answer: 0, explanation: "A stable score can become misleading when the task or operating distribution changes." },
    { id: "aee-f5", prompt: "What makes an evaluation report reproducible?", options: ["Versioned data, procedure, environment, results, and stated limits", "Only a final number", "Only a chart", "Only a model name"], answer: 0, explanation: "Reproduction requires enough context to repeat and challenge the conclusion." }
  ],
  "ai-data-infrastructure": [
    { id: "adi-f1", prompt: "What should a data contract make explicit?", options: ["Source, ownership, provenance, quality, and permitted use", "Only file size", "Only embedding dimension", "Only a vendor"], answer: 0, explanation: "A contract turns hidden pipeline assumptions into inspectable responsibilities." },
    { id: "adi-f2", prompt: "Why is chunking a model-facing decision?", options: ["It determines which relationships and evidence reach the context window", "It only changes file names", "It removes retrieval", "It guarantees factuality"], answer: 0, explanation: "Chunk boundaries shape the context available to the model and therefore affect answer quality." },
    { id: "adi-f3", prompt: "What is the proper role of embeddings in retrieval?", options: ["Retrieve useful candidates that still require relevance and evidence checks", "Prove that a passage is true", "Replace source provenance", "Guarantee the best answer"], answer: 0, explanation: "Similarity helps find candidates; it is not the same as truth or task correctness." },
    { id: "adi-f4", prompt: "What does a freshness policy define?", options: ["When context is stale, who owns invalidation, and how it is observed", "A permanent cache with no expiry", "Only model temperature", "Only document color"], answer: 0, explanation: "Freshness is a measurable operational policy, not an assumption hidden in the pipeline." },
    { id: "adi-f5", prompt: "What should a retrieval runbook cover?", options: ["Empty, wrong, stale, and untraceable results with diagnostic steps", "Only successful queries", "Only database uptime", "Only prompt formatting"], answer: 0, explanation: "A runbook turns retrieval failure modes into repeatable operational actions." }
  ],
  "networking-systems": [
    { id: "net-f1", prompt: "Which sequence best describes a typical web request path?", options: ["Name resolution, transport connection, application request, response", "Compiler, kernel panic, PDF export, response", "Only DNS with no transport", "Only a switch lookup"], answer: 0, explanation: "A web request commonly resolves a name, establishes or reuses transport, sends an application request, and receives a response." },
    { id: "net-f2", prompt: "What is the role of a subnet prefix?", options: ["It identifies the network boundary used for local delivery and routing", "It encrypts every packet", "It assigns a process ID", "It replaces a port number"], answer: 0, explanation: "A prefix separates the network portion from the host portion and supports forwarding decisions." },
    { id: "net-f3", prompt: "What does TCP provide above IP?", options: ["Ordered, reliable byte-stream delivery with flow and congestion control", "A wireless radio signal", "A DNS zone", "A physical cable"], answer: 0, explanation: "TCP adds reliable ordered delivery and controls the sender based on receiver capacity and network congestion." },
    { id: "net-f4", prompt: "Which troubleshooting step is strongest?", options: ["Start from a concrete symptom, choose a measurement, and record the evidence", "Change several devices at once", "Trust a diagram without measuring", "Restart everything and record nothing"], answer: 0, explanation: "A defensible troubleshooting loop connects a symptom to a specific measurement and preserves the result for comparison." },
    { id: "net-f5", prompt: "What is a useful network security boundary?", options: ["A stated trust boundary with controls and expected failure behavior", "A larger logo", "An untested default password", "A hidden route"], answer: 0, explanation: "Security work is clearer when trust boundaries, controls, and failure behavior are explicit and testable." }
  ],
  "systems-fundamentals": [
    { id: "sf-f1", prompt: "Which boundary is protected by a system call?", options: ["User space and kernel space", "HTML and CSS", "DNS and HTTP", "Git and Vim"], answer: 0, explanation: "System calls cross the user/kernel boundary." },
    { id: "sf-f2", prompt: "What does virtual memory provide?", options: ["A process-visible address space mapped to physical memory", "A replacement for tests", "A network route", "A shell prompt"], answer: 0, explanation: "Virtual memory maps process addresses to physical storage." },
    { id: "sf-f3", prompt: "What does TCP add over an unreliable network?", options: ["Ordered, reliable byte-stream delivery", "A compiler", "A file system", "A CPU"], answer: 0, explanation: "TCP manages ordering, retransmission, flow, and congestion." },
    { id: "sf-f4", prompt: "What does a replicated state machine need?", options: ["A way for replicas to agree on an ordered log", "Only more RAM", "A CSS framework", "A PDF reader"], answer: 0, explanation: "Consensus orders commands consistently across replicas." },
    { id: "sf-f5", prompt: "What makes a project result defensible?", options: ["A reproducible procedure, evidence, and stated limits", "A confident claim", "A hidden test", "A larger UI"], answer: 0, explanation: "Defensible work explains how it was tested and where it may fail." }
  ],
  "ai-systems": [
    { id: "ai-f1", prompt: "Which component measures whether an AI system works for its intended use?", options: ["Evaluation", "Color palette", "Keyboard", "DNS"], answer: 0, explanation: "Evaluation compares behavior against an explicit goal." },
    { id: "ai-f2", prompt: "What does tokenization do?", options: ["Maps text into model-readable units", "Deploys a GPU", "Creates a database", "Runs a browser"], answer: 0, explanation: "Tokenization converts text into discrete units used by the model." },
    { id: "ai-f3", prompt: "Why monitor an AI service in production?", options: ["To observe latency, failures, cost, drift, and user impact", "To replace tests", "To hide errors", "To increase font size"], answer: 0, explanation: "Operational signals reveal whether the system remains useful and safe." },
    { id: "ai-f4", prompt: "What is a good first AI architecture decision?", options: ["Choose the smallest components that satisfy the goal and quality bar", "Choose the largest model by default", "Skip evaluation", "Avoid logging"], answer: 0, explanation: "Simple systems are easier to measure, operate, and improve." },
    { id: "ai-f5", prompt: "What should an AI system brief include?", options: ["Data, model, tests, costs, failure modes, and next experiment", "Only a prompt", "Only a screenshot", "Only a vendor name"], answer: 0, explanation: "A useful brief makes the system and its limits inspectable." }
  ],
  "systems-research-lab": [
    { id: "sr-f1", prompt: "What is the core unit of systems research?", options: ["A falsifiable question with evidence", "A slogan", "A screenshot", "An unmeasured intuition"], answer: 0, explanation: "Research needs a question and evidence that could change the conclusion." },
    { id: "sr-f2", prompt: "What should a trace help you do?", options: ["Answer a concrete operational question", "Collect noise forever", "Replace a test", "Hide a timing issue"], answer: 0, explanation: "Useful traces are designed around a question." },
    { id: "sr-f3", prompt: "What does replication require you to state?", options: ["A consistency promise and failure behavior", "Only the server brand", "Only the UI", "Only the happy path"], answer: 0, explanation: "Replication is a behavioral promise under failure." },
    { id: "sr-f4", prompt: "Why test restarts and partitions?", options: ["They expose behavior outside the happy path", "They improve typography", "They remove the need for logs", "They guarantee availability"], answer: 0, explanation: "Failure tests reveal whether the design matches its claims." },
    { id: "sr-f5", prompt: "What makes a systems report reproducible?", options: ["Procedure, environment, measurements, and limits", "Only conclusions", "Only code", "Only citations"], answer: 0, explanation: "Readers need enough context to repeat and assess the work." }
  ],
  "compiler-runtime-architecture": [
    { id: "cr-f1", prompt: "What does a parser produce?", options: ["A structured representation of program syntax", "A network packet", "A database row", "A certificate"], answer: 0, explanation: "Parsers turn tokens into structured syntax." },
    { id: "cr-f2", prompt: "Why compile through an IR?", options: ["It creates a stable boundary for analysis and optimization", "It removes the runtime", "It skips tests", "It replaces the lexer"], answer: 0, explanation: "IR decouples source meaning from target execution details." },
    { id: "cr-f3", prompt: "What does a runtime manage?", options: ["Execution concerns such as calls, memory, and object layout", "Only source formatting", "Only network routes", "Only documentation"], answer: 0, explanation: "A runtime implements the execution model behind language features." },
    { id: "cr-f4", prompt: "What should happen before optimizing?", options: ["Measure a reproducible baseline", "Guess", "Delete tests", "Hide the benchmark"], answer: 0, explanation: "Measurement prevents optimizing the wrong bottleneck." },
    { id: "cr-f5", prompt: "What is a calling convention?", options: ["An ABI contract for function calls", "A PDF standard", "A UI pattern", "A network protocol"], answer: 0, explanation: "It defines how compiled functions exchange arguments and results." }
  ]
};

// server/routers.ts
import { desc as desc2, sql } from "drizzle-orm";

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var LocalSessionSDK = class {
  parseCookies(cookieHeader) {
    return new Map(Object.entries(cookieHeader ? parseCookieHeader(cookieHeader) : {}));
  }
  secret() {
    return new TextEncoder().encode(ENV.cookieSecret);
  }
  async createSessionToken(openId, options = {}) {
    return this.signSession({ openId, appId: ENV.appId, name: options.name || "Rampage learner" }, options);
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    return new SignJWT(payload).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuedAt(Math.floor(issuedAt / 1e3)).setExpirationTime(Math.floor((issuedAt + expiresInMs) / 1e3)).sign(this.secret());
  }
  async verifySession(cookieValue) {
    if (!cookieValue) return null;
    try {
      const { payload } = await jwtVerify(cookieValue, this.secret(), { algorithms: ["HS256"] });
      const { openId, appId, name } = payload;
      if (typeof openId !== "string" || typeof appId !== "string" || typeof name !== "string") return null;
      return { openId, appId, name };
    } catch {
      return null;
    }
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authorization = req.headers.authorization;
      if (typeof authorization === "string" && authorization.startsWith("Bearer ")) sessionToken = authorization.slice(7);
    }
    const session = await this.verifySession(sessionToken);
    if (!session) throw ForbiddenError("Invalid local session");
    const user = await getUserByOpenId(session.openId);
    if (!user) throw ForbiddenError("Local user not found");
    return user;
  }
};
var sdk = new LocalSessionSDK();

// server/email.ts
function getEmailDeliveryStatus(config) {
  return config.apiKey?.trim() && config.from?.trim() ? { enabled: true, reason: "configured" } : { enabled: false, reason: "missing_credentials" };
}
function getEmailDeliveryConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM ?? ""
  };
}
function getRequestOrigin(req) {
  const forwardedProto = req.headers?.["x-forwarded-proto"];
  const forwardedHost = req.headers?.["x-forwarded-host"];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ?? req.protocol ?? "http";
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ?? req.get?.("host") ?? "localhost:3000";
  return `${protocol.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
}
function buildVerificationLink(origin, email, code) {
  const url = new URL("/verify", origin);
  url.searchParams.set("email", email);
  url.searchParams.set("code", code);
  return url.toString();
}
async function sendTransactionalEmail(message) {
  const config = getEmailDeliveryConfig();
  const status = getEmailDeliveryStatus(config);
  if (!status.enabled) return status;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from: config.from, to: [message.to], subject: message.subject, html: message.html, text: message.text })
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Transactional email delivery failed (${response.status})${detail ? `: ${detail.slice(0, 160)}` : ""}`);
  }
  return status;
}
function verificationMessage(origin, email, code) {
  const link = buildVerificationLink(origin, email, code);
  return {
    to: email,
    subject: "Verify your BlackVault Rampage account",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0a1d3a"><p>Your Rampage account is ready for verification.</p><p><a href="${link}">Verify your email address</a></p><p>This link expires in 15 minutes. If you did not create this account, you can ignore this message.</p></div>`,
    text: `Verify your BlackVault Rampage account: ${link}

This link expires in 15 minutes. If you did not create this account, you can ignore this message.`
  };
}
function passwordResetMessage(origin, email, code) {
  const link = buildVerificationLink(origin, email, code).replace("/verify", "/reset-password");
  return {
    to: email,
    subject: "Reset your BlackVault Rampage password",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0a1d3a"><p>A password reset was requested for your Rampage account.</p><p><a href="${link}">Continue to password recovery</a></p><p>This link expires in 15 minutes. If you did not request this, you can ignore this message.</p></div>`,
    text: `Reset your BlackVault Rampage password: ${link}

This link expires in 15 minutes. If you did not request this, you can ignore this message.`
  };
}

// server/routers.ts
var courseIdInput = z2.object({ courseId: z2.string().min(1).max(120) });
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
function serializeSessionCookie(name, value, options) {
  const sameSite = options.sameSite === true ? "Strict" : options.sameSite === "none" ? "None" : options.sameSite === "strict" ? "Strict" : "Lax";
  const attributes = [
    `Path=${options.path ?? "/"}`,
    options.httpOnly !== false ? "HttpOnly" : "",
    `SameSite=${sameSite}`,
    options.secure ? "Secure" : "",
    `Max-Age=${options.maxAge}`,
    options.expires ? `Expires=${options.expires.toUTCString()}` : ""
  ].filter(Boolean);
  return `${name}=${encodeURIComponent(value)}; ${attributes.join("; ")}`;
}
function passwordDigest(password, salt) {
  return scryptSync(password, salt, 64).toString("hex");
}
function verifyPassword(password, saltHex, hashHex) {
  const expected = Buffer.from(hashHex, "hex");
  const actual = Buffer.from(passwordDigest(password, Buffer.from(saltHex, "hex")), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
function createOneTimeCode() {
  return String(randomInt(1e5, 1e6));
}
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
async function issueAuthCode(userId, purpose) {
  const db = await getDb();
  if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  const [recent] = await db.select({ id: localAuthTokens.id }).from(localAuthTokens).where(and(eq(localAuthTokens.userId, userId), eq(localAuthTokens.purpose, purpose), sql`${localAuthTokens.consumedAt} IS NULL`, sql`${localAuthTokens.createdAt} > now() - interval '60 seconds'`)).orderBy(desc2(localAuthTokens.createdAt)).limit(1);
  if (recent) throw new TRPCError3({ code: "TOO_MANY_REQUESTS", message: "Please wait a minute before requesting another code." });
  await db.update(localAuthTokens).set({ consumedAt: /* @__PURE__ */ new Date() }).where(and(eq(localAuthTokens.userId, userId), eq(localAuthTokens.purpose, purpose), sql`${localAuthTokens.consumedAt} IS NULL`));
  const code = createOneTimeCode();
  await db.insert(localAuthTokens).values({ userId, tokenHash: hashToken(code), purpose, expiresAt: new Date(Date.now() + 15 * 60 * 1e3) });
  return code;
}
async function deliverAuthCode(ctx, user, code, purpose) {
  if (!user.email) return { delivered: false, reason: "missing_email" };
  const origin = getRequestOrigin(ctx.req);
  const message = purpose === "verify_email" ? verificationMessage(origin, user.email, code) : passwordResetMessage(origin, user.email, code);
  const delivery = await sendTransactionalEmail(message);
  return delivery.enabled ? { delivered: true, reason: "sent" } : { delivered: false, reason: delivery.reason };
}
async function setSessionCookie(ctx, user) {
  const token = await sdk.createSessionToken(user.openId, { name: user.name ?? "Rampage learner" });
  const serializedCookie = serializeSessionCookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 60 * 60 * 24 * 30 });
  ctx.res.setHeader("Set-Cookie", serializedCookie);
}
async function awardXp(db, userId, eventKey, amount, sourceType, sourceId, courseId, metadata = {}) {
  const inserted = await db.insert(rampageXpLedger).values({ userId, eventKey, amount, sourceType, sourceId, courseId, metadata }).onConflictDoNothing({ target: [rampageXpLedger.userId, rampageXpLedger.eventKey] }).returning({ amount: rampageXpLedger.amount });
  return inserted[0]?.amount ?? 0;
}
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    register: publicProcedure.input(z2.object({ name: z2.string().trim().min(2).max(80), email: z2.string().email().max(320), password: z2.string().min(10).max(128) })).mutation(async ({ ctx, input }) => {
      const email = normalizeEmail(input.email);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      if (await getUserByEmail(email)) throw new TRPCError3({ code: "CONFLICT", message: "An account with that email already exists" });
      const salt = randomBytes(16);
      const openId = `local_${randomUUID()}`;
      const [user] = await db.insert(users).values({ openId, name: input.name.trim(), email, loginMethod: "password", passwordHash: passwordDigest(input.password, salt), passwordSalt: salt.toString("hex") }).returning();
      if (!user) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Unable to create account" });
      const verificationCode = await issueAuthCode(user.id, "verify_email");
      const delivery = await deliverAuthCode(ctx, user, verificationCode, "verify_email");
      await setSessionCookie(ctx, user);
      return { ...user, delivery, developmentVerificationCode: process.env.NODE_ENV === "development" ? verificationCode : void 0 };
    }),
    requestVerification: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user?.email) throw new TRPCError3({ code: "BAD_REQUEST", message: "Add an email address before requesting verification." });
      if (user.emailVerifiedAt) return { sent: false, alreadyVerified: true };
      const code = await issueAuthCode(user.id, "verify_email");
      const delivery = await deliverAuthCode(ctx, user, code, "verify_email");
      return { sent: true, alreadyVerified: false, delivery, developmentCode: process.env.NODE_ENV === "development" ? code : void 0 };
    }),
    verifyEmail: publicProcedure.input(z2.object({ email: z2.string().email().max(320), code: z2.string().regex(/^\d{6}$/) })).mutation(async ({ input }) => {
      const user = await getUserByEmail(normalizeEmail(input.email));
      if (!user) throw new TRPCError3({ code: "NOT_FOUND", message: "Account not found" });
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [token] = await db.select().from(localAuthTokens).where(and(eq(localAuthTokens.userId, user.id), eq(localAuthTokens.purpose, "verify_email"), eq(localAuthTokens.tokenHash, hashToken(input.code)), sql`${localAuthTokens.consumedAt} IS NULL`, sql`${localAuthTokens.expiresAt} > now()`)).limit(1);
      if (!token) throw new TRPCError3({ code: "BAD_REQUEST", message: "That verification code is invalid or expired." });
      await db.update(localAuthTokens).set({ consumedAt: /* @__PURE__ */ new Date() }).where(eq(localAuthTokens.id, token.id));
      await db.update(users).set({ emailVerifiedAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, user.id));
      return { success: true };
    }),
    requestPasswordReset: publicProcedure.input(z2.object({ email: z2.string().email().max(320) })).mutation(async ({ ctx, input }) => {
      const user = await getUserByEmail(normalizeEmail(input.email));
      if (!user) return { sent: true };
      const code = await issueAuthCode(user.id, "reset_password");
      const delivery = await deliverAuthCode(ctx, user, code, "reset_password");
      return { sent: true, delivery, developmentCode: process.env.NODE_ENV === "development" ? code : void 0 };
    }),
    resetPassword: publicProcedure.input(z2.object({ email: z2.string().email().max(320), code: z2.string().regex(/^\d{6}$/), password: z2.string().min(10).max(128) })).mutation(async ({ input }) => {
      const user = await getUserByEmail(normalizeEmail(input.email));
      if (!user) throw new TRPCError3({ code: "BAD_REQUEST", message: "That reset code is invalid or expired." });
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [token] = await db.select().from(localAuthTokens).where(and(eq(localAuthTokens.userId, user.id), eq(localAuthTokens.purpose, "reset_password"), eq(localAuthTokens.tokenHash, hashToken(input.code)), sql`${localAuthTokens.consumedAt} IS NULL`, sql`${localAuthTokens.expiresAt} > now()`)).limit(1);
      if (!token) throw new TRPCError3({ code: "BAD_REQUEST", message: "That reset code is invalid or expired." });
      const salt = randomBytes(16);
      await db.update(users).set({ passwordHash: passwordDigest(input.password, salt), passwordSalt: salt.toString("hex"), updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, user.id));
      await db.update(localAuthTokens).set({ consumedAt: /* @__PURE__ */ new Date() }).where(eq(localAuthTokens.id, token.id));
      return { success: true };
    }),
    profile: protectedProcedure.query(async ({ ctx }) => getUserById(ctx.user.id)),
    updateProfile: protectedProcedure.input(z2.object({ name: z2.string().trim().min(2).max(80), email: z2.string().email().max(320) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const email = normalizeEmail(input.email);
      const existing = await getUserByEmail(email);
      if (existing && existing.id !== ctx.user.id) throw new TRPCError3({ code: "CONFLICT", message: "That email is already in use." });
      const [updated] = await db.update(users).set({ name: input.name, email, emailVerifiedAt: email === ctx.user.email ? void 0 : null, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, ctx.user.id)).returning();
      return updated;
    }),
    login: publicProcedure.input(z2.object({ email: z2.string().email().max(320), password: z2.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
      const user = await getUserByEmail(normalizeEmail(input.email));
      if (!user?.passwordHash || !user.passwordSalt || !verifyPassword(input.password, user.passwordSalt, user.passwordHash)) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      const db = await getDb();
      if (db) await db.update(users).set({ lastSignedIn: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, user.id));
      await setSessionCookie(ctx, user);
      return user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      if (typeof ctx.res.setHeader === "function") {
        const serializedCookie = serializeSessionCookie(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0, expires: /* @__PURE__ */ new Date(0) });
        ctx.res.setHeader("Set-Cookie", serializedCookie);
      } else if (typeof ctx.res.clearCookie === "function") {
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      }
      return { success: true };
    })
  }),
  learner: router({
    state: protectedProcedure.query(async ({ ctx }) => getLearnerState(ctx.user.openId)),
    savePreferences: protectedProcedure.input(z2.object({ goal: z2.string().trim().min(3).max(160), weeklyTargetMinutes: z2.number().int().min(15).max(2400), notificationsEnabled: z2.boolean() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      const [preferences] = await db.insert(rampageLearnerPreferences).values({ userId: learner.id, goal: input.goal, weeklyTargetMinutes: input.weeklyTargetMinutes, notificationsEnabled: input.notificationsEnabled ? 1 : 0 }).onConflictDoUpdate({ target: rampageLearnerPreferences.userId, set: { goal: input.goal, weeklyTargetMinutes: input.weeklyTargetMinutes, notificationsEnabled: input.notificationsEnabled ? 1 : 0, updatedAt: /* @__PURE__ */ new Date() } }).returning();
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
        preferences: state.preferences
      };
    }),
    completeLesson: protectedProcedure.input(z2.object({ courseId: z2.string().min(1), lessonId: z2.string().min(1) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError3({ code: "BAD_REQUEST", message: "Unsupported course" });
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageProgress).values({ userId: learner.id, courseId: input.courseId, lessonId: input.lessonId }).onConflictDoUpdate({
        target: [rampageProgress.userId, rampageProgress.courseId, rampageProgress.lessonId],
        set: { completedAt: /* @__PURE__ */ new Date() }
      });
      const xpAwarded = await awardXp(db, learner.id, `lesson:${input.courseId}:${input.lessonId}`, 10, "lesson_completion", input.lessonId, input.courseId);
      await writeAuditEvent(learner.id, "lesson_completed", "lesson", input.lessonId, { courseId: input.courseId, xpAwarded });
      return { success: true, xpAwarded };
    }),
    saveReaderState: protectedProcedure.input(z2.object({ resourceId: z2.string().min(1), currentPage: z2.number().int().min(1), progressPercent: z2.number().min(0).max(100), note: z2.string().max(5e3).nullable().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageReaderState).values({ userId: learner.id, resourceId: input.resourceId, currentPage: input.currentPage, progressPercent: String(input.progressPercent), note: input.note ?? null }).onConflictDoUpdate({
        target: [rampageReaderState.userId, rampageReaderState.resourceId],
        set: { currentPage: input.currentPage, progressPercent: String(input.progressPercent), note: input.note ?? null, updatedAt: /* @__PURE__ */ new Date() }
      });
      return { success: true };
    }),
    addBookmark: protectedProcedure.input(z2.object({ resourceId: z2.string().min(1), page: z2.number().int().min(1), label: z2.string().max(160).nullable().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageReaderBookmarks).values({ userId: learner.id, resourceId: input.resourceId, page: input.page, label: input.label ?? null }).onConflictDoNothing();
      return { success: true };
    }),
    removeBookmark: protectedProcedure.input(z2.object({ resourceId: z2.string().min(1), page: z2.number().int().min(1) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId);
      await db.delete(rampageReaderBookmarks).where(and(eq(rampageReaderBookmarks.userId, learner.id), eq(rampageReaderBookmarks.resourceId, input.resourceId), eq(rampageReaderBookmarks.page, input.page)));
      return { success: true };
    }),
    addHighlight: protectedProcedure.input(z2.object({ resourceId: z2.string().min(1), page: z2.number().int().min(1), quote: z2.string().min(1).max(5e3), note: z2.string().max(2e3).nullable().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageReaderHighlights).values({ userId: learner.id, resourceId: input.resourceId, page: input.page, quote: input.quote, note: input.note ?? null });
      return { success: true };
    }),
    saveTimeline: protectedProcedure.input(z2.object({ courseId: z2.string().min(1), lessonId: z2.string().min(1), currentSecond: z2.number().int().min(0), durationSecond: z2.number().int().min(0) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError3({ code: "BAD_REQUEST", message: "Unsupported course" });
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageLessonState).values({ userId: learner.id, courseId: input.courseId, lessonId: input.lessonId, currentSecond: input.currentSecond, durationSecond: input.durationSecond }).onConflictDoUpdate({ target: [rampageLessonState.userId, rampageLessonState.courseId, rampageLessonState.lessonId], set: { currentSecond: input.currentSecond, durationSecond: input.durationSecond, updatedAt: /* @__PURE__ */ new Date() } });
      return { success: true };
    }),
    saveLessonWorkflow: protectedProcedure.input(z2.object({ courseId: z2.string().min(1), lessonId: z2.string().min(1), currentSecond: z2.number().int().min(0), durationSecond: z2.number().int().min(0), sourceComplete: z2.boolean(), labComplete: z2.boolean(), evidenceComplete: z2.boolean(), evidenceNote: z2.string().max(280) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError3({ code: "BAD_REQUEST", message: "Unsupported course" });
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      await db.insert(rampageLessonState).values({ userId: learner.id, courseId: input.courseId, lessonId: input.lessonId, currentSecond: input.currentSecond, durationSecond: input.durationSecond, sourceComplete: input.sourceComplete ? 1 : 0, labComplete: input.labComplete ? 1 : 0, evidenceComplete: input.evidenceComplete ? 1 : 0, evidenceNote: input.evidenceNote.trim() || null }).onConflictDoUpdate({ target: [rampageLessonState.userId, rampageLessonState.courseId, rampageLessonState.lessonId], set: { currentSecond: input.currentSecond, durationSecond: input.durationSecond, sourceComplete: input.sourceComplete ? 1 : 0, labComplete: input.labComplete ? 1 : 0, evidenceComplete: input.evidenceComplete ? 1 : 0, evidenceNote: input.evidenceNote.trim() || null, updatedAt: /* @__PURE__ */ new Date() } });
      return { success: true };
    }),
    completeChapter: protectedProcedure.input(z2.object({ courseId: z2.string().min(1), chapterId: z2.string().min(1), lessonIds: z2.array(z2.string().min(1)).min(1) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError3({ code: "BAD_REQUEST", message: "Unsupported course" });
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      const completed = await db.select({ lessonId: rampageProgress.lessonId }).from(rampageProgress).where(and(eq(rampageProgress.userId, learner.id), eq(rampageProgress.courseId, input.courseId)));
      const completedIds = new Set(completed.map((row) => row.lessonId));
      if (!input.lessonIds.every((id) => completedIds.has(id))) throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Complete every lesson in this chapter first." });
      await db.insert(rampageChapterCompletions).values({ userId: learner.id, courseId: input.courseId, chapterId: input.chapterId }).onConflictDoUpdate({ target: [rampageChapterCompletions.userId, rampageChapterCompletions.courseId, rampageChapterCompletions.chapterId], set: { completedAt: /* @__PURE__ */ new Date() } });
      const xpAwarded = await awardXp(db, learner.id, `chapter:${input.courseId}:${input.chapterId}`, 50, "chapter_completion", input.chapterId, input.courseId);
      await writeAuditEvent(learner.id, "chapter_completed", "chapter", input.chapterId, { courseId: input.courseId, xpAwarded });
      return { success: true, xpAwarded };
    }),
    submitQuiz: protectedProcedure.input(z2.object({ courseId: z2.string().min(1), chapterId: z2.string().min(1), lessonId: z2.string().min(1), answers: z2.record(z2.string(), z2.number().int().min(0)), startedAt: z2.number().int().positive(), tabSwitches: z2.number().int().min(0).max(100), fullscreenExits: z2.number().int().min(0).max(100) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError3({ code: "BAD_REQUEST", message: "Unsupported course" });
      const questions = chapterQuizBank[input.courseId] ?? [];
      if (!questions.length) throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "This lesson has no verified quiz yet." });
      const expectedIds = new Set(questions.map((question) => question.id));
      const answerIds = Object.keys(input.answers);
      if (answerIds.length !== questions.length || answerIds.some((id) => !expectedIds.has(id)) || questions.some((question) => input.answers[question.id] === void 0 || input.answers[question.id] >= question.options.length)) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Submit exactly one valid answer for every checkpoint question." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      const previous = await db.select().from(rampageQuizAttempts).where(and(eq(rampageQuizAttempts.userId, learner.id), eq(rampageQuizAttempts.courseId, input.courseId), eq(rampageQuizAttempts.chapterId, input.chapterId), eq(rampageQuizAttempts.lessonId, input.lessonId)));
      const score = Math.round(questions.filter((question) => input.answers[question.id] === question.answer).length / questions.length * 100);
      const passed = score >= 80 ? 1 : 0;
      const submittedAt = Date.now();
      if (!isAssessmentWithinWindow(input.startedAt, submittedAt, 5 * 60)) throw new TRPCError3({ code: "TIMEOUT", message: "Knowledge-check window expired. Review the lesson source before retrying." });
      await db.insert(rampageQuizAttempts).values({ userId: learner.id, courseId: input.courseId, chapterId: input.chapterId, lessonId: input.lessonId, attemptNumber: previous.length + 1, score, passed, answers: input.answers, integrity: buildAttemptIntegrity({ startedAt: input.startedAt, submittedAt, tabSwitches: input.tabSwitches, fullscreenExits: input.fullscreenExits, questionOrder: questions.map((question) => question.id) }), startedAt: new Date(input.startedAt), submittedAt: new Date(submittedAt) });
      const xpAwarded = passed ? await awardXp(db, learner.id, `quiz-pass:${input.courseId}:${input.lessonId}`, 25, "quiz_pass", input.lessonId, input.courseId, { score }) : 0;
      await writeAuditEvent(learner.id, "quiz_submitted", "lesson", input.lessonId, { courseId: input.courseId, score, passed, xpAwarded });
      return { score, passed: Boolean(passed), xpAwarded, explanations: questions.map((question) => ({ id: question.id, explanation: question.explanation })) };
    }),
    submitFinalAssessment: protectedProcedure.input(z2.object({ courseId: z2.string().min(1), answers: z2.record(z2.string(), z2.number().int().min(0)), startedAt: z2.number().int().positive(), tabSwitches: z2.number().int().min(0).max(100), fullscreenExits: z2.number().int().min(0).max(100) })).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError3({ code: "BAD_REQUEST", message: "Unsupported course" });
      const rule = getCourseRule(input.courseId);
      const questions = finalAssessmentBank[input.courseId] ?? [];
      if (!rule || questions.length !== rule.finalQuestionCount) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Assessment configuration is incomplete." });
      const expectedIds = new Set(questions.map((question) => question.id));
      const answerIds = Object.keys(input.answers);
      if (answerIds.length !== questions.length || answerIds.some((id) => !expectedIds.has(id)) || questions.some((question) => input.answers[question.id] === void 0 || input.answers[question.id] >= question.options.length)) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Submit exactly one valid answer for every assessment question." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      const previous = await db.select().from(rampageAssessmentAttempts).where(and(eq(rampageAssessmentAttempts.userId, learner.id), eq(rampageAssessmentAttempts.courseId, input.courseId)));
      const recent = previous.filter((attempt) => attempt.startedAt.getTime() > Date.now() - 24 * 60 * 60 * 1e3);
      if (recent.length >= rule.maxAssessmentAttemptsPerDay) throw new TRPCError3({ code: "TOO_MANY_REQUESTS", message: "Daily assessment attempt limit reached. Return after the review window." });
      const score = Math.round(questions.filter((question) => input.answers[question.id] === question.answer).length / questions.length * 100);
      const passed = score >= rule.passScore ? 1 : 0;
      const submittedAt = Date.now();
      if (!isAssessmentWithinWindow(input.startedAt, submittedAt)) throw new TRPCError3({ code: "TIMEOUT", message: "Assessment time window expired or start time is invalid. Review the course before retrying." });
      await db.insert(rampageAssessmentAttempts).values({ userId: learner.id, courseId: input.courseId, attemptNumber: previous.length + 1, score, passed, answers: input.answers, questionOrder: questions.map((question) => question.id), integrity: buildAttemptIntegrity({ startedAt: input.startedAt, submittedAt, tabSwitches: input.tabSwitches, fullscreenExits: input.fullscreenExits, questionOrder: questions.map((question) => question.id) }), startedAt: new Date(input.startedAt), submittedAt: new Date(submittedAt) });
      const xpAwarded = passed ? await awardXp(db, learner.id, `final-pass:${input.courseId}`, 200, "final_assessment_pass", input.courseId, input.courseId, { score, attemptNumber: previous.length + 1 }) : 0;
      await writeAuditEvent(learner.id, "final_assessment_submitted", "course", input.courseId, { score, passed, xpAwarded, attemptNumber: previous.length + 1 });
      return { score, passed: Boolean(passed), xpAwarded, attemptNumber: previous.length + 1, review: questions.map((question) => ({ id: question.id, correctOption: question.answer, explanation: question.explanation })) };
    }),
    issueCertificate: protectedProcedure.input(courseIdInput).mutation(async ({ ctx, input }) => {
      if (!isSupportedCourse(input.courseId)) throw new TRPCError3({ code: "BAD_REQUEST", message: "Unsupported course" });
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const learner = await getOrCreateRampageUser(ctx.user.openId, ctx.user.name, ctx.user.email);
      const completed = await db.select({ lessonId: rampageProgress.lessonId }).from(rampageProgress).where(and(eq(rampageProgress.userId, learner.id), eq(rampageProgress.courseId, input.courseId)));
      const required = COURSE_LESSON_COUNTS[input.courseId];
      const rule = getCourseRule(input.courseId);
      if (completed.length < required) throw new TRPCError3({ code: "PRECONDITION_FAILED", message: `Complete all ${required} lessons before requesting a certificate.` });
      const chapters = await db.select().from(rampageChapterCompletions).where(and(eq(rampageChapterCompletions.userId, learner.id), eq(rampageChapterCompletions.courseId, input.courseId)));
      if (!rule || chapters.length < rule.chapterCount) throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Complete every chapter before requesting a certificate." });
      const assessments = await db.select().from(rampageAssessmentAttempts).where(and(eq(rampageAssessmentAttempts.userId, learner.id), eq(rampageAssessmentAttempts.courseId, input.courseId)));
      if (!assessments.some((attempt) => attempt.passed === 1)) throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Pass the final assessment before requesting a certificate." });
      const existing = await db.select().from(rampageCertificates).where(and(eq(rampageCertificates.userId, learner.id), eq(rampageCertificates.courseId, input.courseId))).limit(1);
      if (existing[0]) return existing[0];
      const certificateId = `RMP-${(/* @__PURE__ */ new Date()).getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const publicRecordId = `RMPV-${(/* @__PURE__ */ new Date()).getUTCFullYear()}-${randomBytes(10).toString("hex").toUpperCase()}`;
      const completionHash = createHash("sha256").update(`${learner.id}:${input.courseId}:${completed.length}:${process.env.JWT_SECRET ?? "rampage"}`).digest("hex");
      await db.insert(rampageCertificates).values({ certificateId, publicRecordId, userId: learner.id, courseId: input.courseId, completionHash, metadata: { learnerName: learner.name, lessonCount: completed.length, nonAccredited: true } });
      await writeAuditEvent(learner.id, "certificate_issued", "course", input.courseId, { certificateId });
      const issued = await db.select().from(rampageCertificates).where(eq(rampageCertificates.certificateId, certificateId)).limit(1);
      return issued[0];
    })
  }),
  certificate: router({
    verify: publicProcedure.input(z2.object({ recordId: z2.string().trim().regex(/^RMPV-\d{4}-[A-F0-9]{20}$/i) })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [certificate] = await db.select({ certificateId: rampageCertificates.certificateId, publicRecordId: rampageCertificates.publicRecordId, courseId: rampageCertificates.courseId, issuedAt: rampageCertificates.issuedAt, metadata: rampageCertificates.metadata }).from(rampageCertificates).where(eq(rampageCertificates.publicRecordId, input.recordId.toUpperCase())).limit(1);
      if (!certificate) throw new TRPCError3({ code: "NOT_FOUND", message: "Certificate record not found." });
      const metadata = certificate.metadata && typeof certificate.metadata === "object" ? certificate.metadata : {};
      return { certificateId: certificate.certificateId, publicRecordId: certificate.publicRecordId, courseId: certificate.courseId, issuedAt: certificate.issuedAt, learnerName: typeof metadata.learnerName === "string" ? metadata.learnerName : "Rampage learner", lessonCount: typeof metadata.lessonCount === "number" ? metadata.lessonCount : null, nonAccredited: metadata.nonAccredited === true };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/storageProxy.ts
function registerStorageProxy(app2) {
  app2.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.set("Cache-Control", "no-store");
      res.status(404).json({ error: "Optional asset unavailable" });
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(404).json({ error: "Optional asset unavailable" });
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(404).json({ error: "Optional asset unavailable" });
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(404).json({ error: "Optional asset unavailable" });
    }
  });
}

// server/vercel-api.ts
var app = express();
var staticPath = path.resolve(process.cwd(), "dist", "public");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
app.use(express.static(staticPath));
app.use((_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});
var vercel_api_default = app;
export {
  vercel_api_default as default
};
