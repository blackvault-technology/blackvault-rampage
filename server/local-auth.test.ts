import { describe, expect, it } from "vitest";
import { sdk } from "./_core/sdk";

describe("local signed sessions", () => {
  it("round-trips a valid first-party session", async () => {
    const token = await sdk.createSessionToken("local_test_user", { name: "Test Learner", expiresInMs: 60_000 });
    await expect(sdk.verifySession(token)).resolves.toMatchObject({ openId: "local_test_user", name: "Test Learner" });
  });

  it("rejects malformed and tampered sessions", async () => {
    await expect(sdk.verifySession("not-a-jwt")).resolves.toBeNull();
    const token = await sdk.createSessionToken("local_test_user", { name: "Test Learner", expiresInMs: 60_000 });
    await expect(sdk.verifySession(`${token}tampered`)).resolves.toBeNull();
  });
});
