import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  InsertUser,
  rampageAssessmentAttempts,
  rampageAuditEvents,
  rampageChapterCompletions,
  rampageCertificates,
  rampageProgress,
  rampageReaderBookmarks,
  rampageReaderHighlights,
  rampageReaderState,
  rampageLessonState,
  rampageQuizAttempts,
  rampageXpLedger,
  rampageUsers,
  localAuthTokens,
  rampageLearnerPreferences,
  users as authUsers,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

export { localAuthTokens };

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: Neon database not available");
    return;
  }

  const role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  await db.insert(authUsers).values({
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    role,
    lastSignedIn: user.lastSignedIn ?? new Date(),
  }).onConflictDoUpdate({
    target: authUsers.openId,
    set: {
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role,
      lastSignedIn: user.lastSignedIn ?? new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(authUsers).where(eq(authUsers.email, email.toLowerCase())).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(authUsers).where(eq(authUsers.id, id)).limit(1);
  return result[0];
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(authUsers).where(eq(authUsers.openId, openId)).limit(1);
  return result[0];
}

export async function getOrCreateRampageUser(authOpenId: string, name?: string | null, email?: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Neon database is not configured");
  await db.insert(rampageUsers).values({ authOpenId, name: name ?? null, email: email ?? null }).onConflictDoUpdate({
    target: rampageUsers.authOpenId,
    set: { name: name ?? null, email: email ?? null, updatedAt: new Date() },
  });
  const rows = await db.select().from(rampageUsers).where(eq(rampageUsers.authOpenId, authOpenId)).limit(1);
  if (!rows[0]) throw new Error("Unable to resolve Rampage learner");
  return rows[0];
}

export async function getLearnerState(authOpenId: string) {
  const learner = await getOrCreateRampageUser(authOpenId);
  const db = await getDb();
  if (!db) throw new Error("Neon database is not configured");
  const preferencesQuery = db.select().from(rampageLearnerPreferences).where(eq(rampageLearnerPreferences.userId, learner.id)).limit(1).catch(error => {
    console.warn("[Database] Learner preferences unavailable; using defaults:", error instanceof Error ? error.message : error);
    return [];
  });
  const [progress, readerState, bookmarks, highlights, certificates, xpLedger, lessonState, preferences] = await Promise.all([
    db.select().from(rampageProgress).where(eq(rampageProgress.userId, learner.id)),
    db.select().from(rampageReaderState).where(eq(rampageReaderState.userId, learner.id)).orderBy(desc(rampageReaderState.updatedAt)),
    db.select().from(rampageReaderBookmarks).where(eq(rampageReaderBookmarks.userId, learner.id)).orderBy(desc(rampageReaderBookmarks.createdAt)),
    db.select().from(rampageReaderHighlights).where(eq(rampageReaderHighlights.userId, learner.id)).orderBy(desc(rampageReaderHighlights.createdAt)),
    db.select().from(rampageCertificates).where(eq(rampageCertificates.userId, learner.id)).orderBy(desc(rampageCertificates.issuedAt)),
    db.select().from(rampageXpLedger).where(eq(rampageXpLedger.userId, learner.id)),
    db.select().from(rampageLessonState).where(eq(rampageLessonState.userId, learner.id)).orderBy(desc(rampageLessonState.updatedAt)),
    preferencesQuery,
  ]);
  const xp = xpLedger.reduce((total, entry) => total + entry.amount, 0);
  return { learner, progress, readerState, bookmarks, highlights, certificates, xp, xpLedger, lessonState, preferences: preferences[0] ?? null };
}

export async function writeAuditEvent(userId: number, eventType: string, entityType?: string, entityId?: string, metadata: Record<string, unknown> = {}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(rampageAuditEvents).values({ userId, eventType, entityType: entityType ?? null, entityId: entityId ?? null, metadata });
}

export { and, eq, rampageAssessmentAttempts, rampageChapterCompletions, rampageCertificates, rampageLearnerPreferences, rampageLessonState, rampageProgress, rampageQuizAttempts, rampageReaderBookmarks, rampageReaderHighlights, rampageReaderState, rampageXpLedger, authUsers as userTable };
