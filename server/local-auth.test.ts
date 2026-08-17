import { describe, expect, it } from "vitest";
import { sdk } from "./_core/sdk";
import { serializeSessionCookie } from "./routers";

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

  it("serializes secure and local-compatible session cookies", () => {
    const secure = serializeSessionCookie("rampage_session", "token value", { maxAge: 900, httpOnly: true, path: "/", sameSite: "none", secure: true });
    expect(secure).toContain("rampage_session=token%20value");
    expect(secure).toContain("HttpOnly");
    expect(secure).toContain("SameSite=None");
    expect(secure).toContain("Secure");

    const local = serializeSessionCookie("rampage_session", "", { maxAge: 0, httpOnly: true, path: "/", sameSite: "lax", secure: false });
    expect(local).toContain("SameSite=Lax");
    expect(local).toContain("Max-Age=0");
    expect(local).not.toContain("; Secure");
  });
});
