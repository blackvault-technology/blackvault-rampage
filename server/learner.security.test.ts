import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { isAssessmentWithinWindow } from "@shared/courseRules";
import type { TrpcContext } from "./_core/context";

function createContext(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

const authenticatedUser: NonNullable<TrpcContext["user"]> = {
  id: 9,
  openId: "security-test-user",
  email: "security-test@example.com",
  name: "Security Test",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("learner security boundaries", () => {
  it("rejects certificate issuance for anonymous callers", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.learner.issueCertificate({ courseId: "ai-systems" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects learner state and profile reads for anonymous callers", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.learner.state()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.auth.profile()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects unsupported certificate courses before database access", async () => {
    const caller = appRouter.createCaller(createContext(authenticatedUser));
    await expect(caller.learner.issueCertificate({ courseId: "not-a-real-course" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts only assessments inside the bounded server window", () => {
    const startedAt = 1_000_000;
    expect(isAssessmentWithinWindow(startedAt, startedAt + 15 * 60 * 1000)).toBe(true);
    expect(isAssessmentWithinWindow(startedAt, startedAt + 16 * 60 * 1000 + 1)).toBe(false);
    expect(isAssessmentWithinWindow(startedAt, startedAt - 6_000)).toBe(false);
  });

  it("rejects incomplete lesson quiz payloads before touching the database", async () => {
    const caller = appRouter.createCaller(createContext(authenticatedUser));
    await expect(caller.learner.submitQuiz({
      courseId: "networking-systems",
      chapterId: "net-foundations",
      lessonId: "net-internet",
      answers: {},
      startedAt: Date.now(),
      tabSwitches: 0,
      fullscreenExits: 0,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects answer indexes outside the verified question options", async () => {
    const caller = appRouter.createCaller(createContext(authenticatedUser));
    await expect(caller.learner.submitQuiz({
      courseId: "networking-systems",
      chapterId: "net-foundations",
      lessonId: "net-internet",
      answers: { "net-q1": 99, "net-q2": 0, "net-q3": 0 },
      startedAt: Date.now(),
      tabSwitches: 0,
      fullscreenExits: 0,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
