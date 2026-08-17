import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
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

  it("rejects unsupported certificate courses before database access", async () => {
    const caller = appRouter.createCaller(createContext(authenticatedUser));
    await expect(caller.learner.issueCertificate({ courseId: "not-a-real-course" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
