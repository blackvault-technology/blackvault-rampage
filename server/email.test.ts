import { describe, expect, it, afterEach } from "vitest";
import { sendAuthCodeEmail } from "./email";

describe("transactional email adapter", () => {
  const originalKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.EMAIL_FROM;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    if (originalFrom === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = originalFrom;
  });

  it("falls back safely when production credentials are not configured", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    await expect(sendAuthCodeEmail("learner@example.com", "verify_email", "123456")).resolves.toEqual({ delivered: false, reason: "not_configured" });
  });
});
