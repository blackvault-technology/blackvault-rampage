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
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    openId: text("open_id").notNull(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("login_method", { length: 64 }),
    role: text("role").notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastSignedIn: timestamp("last_signed_in", { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({ openIdUnique: uniqueIndex("users_open_id_unique").on(table.openId) }),
);

export const rampageUsers = pgTable(
  "rampage_users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    authOpenId: text("auth_open_id").notNull(),
    email: text("email"),
    name: text("name"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({ authOpenIdUnique: uniqueIndex("rampage_users_auth_open_id_unique").on(table.authOpenId) }),
);

export const rampageProgress = pgTable(
  "rampage_progress",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    courseId: text("course_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({
    pk: primaryKey({ columns: [table.userId, table.courseId, table.lessonId] }),
    userIndex: index("rampage_progress_user_idx").on(table.userId),
  }),
);

export const rampageReaderState = pgTable(
  "rampage_reader_state",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    resourceId: text("resource_id").notNull(),
    currentPage: integer("current_page").notNull().default(1),
    progressPercent: numeric("progress_percent", { precision: 5, scale: 2 }).notNull().default("0"),
    note: text("note"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({ pk: primaryKey({ columns: [table.userId, table.resourceId] }) }),
);

export const rampageReaderBookmarks = pgTable(
  "rampage_reader_bookmarks",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    resourceId: text("resource_id").notNull(),
    page: integer("page").notNull(),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({ pk: primaryKey({ columns: [table.userId, table.resourceId, table.page] }) }),
);

export const rampageReaderHighlights = pgTable(
  "rampage_reader_highlights",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    resourceId: text("resource_id").notNull(),
    page: integer("page").notNull(),
    quote: text("quote").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({ userResourceIndex: index("rampage_reader_highlights_user_resource_idx").on(table.userId, table.resourceId) }),
);

export const rampageCertificates = pgTable(
  "rampage_certificates",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    certificateId: text("certificate_id").notNull(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    courseId: text("course_id").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
    completionHash: text("completion_hash").notNull(),
    metadata: jsonb("metadata").notNull().default({}),
  },
  table => ({
    certificateUnique: uniqueIndex("rampage_certificates_certificate_id_unique").on(table.certificateId),
    userCourseUnique: uniqueIndex("rampage_certificates_user_course_unique").on(table.userId, table.courseId),
  }),
);

export const rampageAuditEvents = pgTable(
  "rampage_audit_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }),
    eventType: text("event_type").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({ userCreatedIndex: index("rampage_audit_user_created_idx").on(table.userId, table.createdAt) }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type RampageUser = typeof rampageUsers.$inferSelect;

export const rampageLessonState = pgTable(
  "rampage_lesson_state",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    courseId: text("course_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    currentSecond: integer("current_second").notNull().default(0),
    durationSecond: integer("duration_second").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({ pk: primaryKey({ columns: [table.userId, table.courseId, table.lessonId] }), userIndex: index("rampage_lesson_state_user_idx").on(table.userId, table.updatedAt) }),
);

export const rampageChapterCompletions = pgTable(
  "rampage_chapter_completions",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    courseId: text("course_id").notNull(),
    chapterId: text("chapter_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({ pk: primaryKey({ columns: [table.userId, table.courseId, table.chapterId] }) }),
);

export const rampageQuizAttempts = pgTable(
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
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  table => ({ userCourseIndex: index("rampage_quiz_attempts_user_course_idx").on(table.userId, table.courseId, table.chapterId) }),
);

export const rampageAssessmentAttempts = pgTable(
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
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  table => ({ userCourseIndex: index("rampage_assessment_attempts_user_course_idx").on(table.userId, table.courseId, table.startedAt) }),
);
