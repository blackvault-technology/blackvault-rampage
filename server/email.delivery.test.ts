import { describe, expect, it } from "vitest";
import { getEmailDeliveryStatus } from "./email";

describe("email delivery configuration", () => {
  it("reports disabled when production credentials are absent", () => {
    expect(getEmailDeliveryStatus({ apiKey: "", from: "" })).toEqual({
      enabled: false,
      reason: "missing_credentials",
    });
  });

  it("accepts a complete Resend configuration without exposing the key", () => {
    expect(getEmailDeliveryStatus({ apiKey: "re_test_key", from: "Rampage <verify@example.com>" })).toEqual({
      enabled: true,
      reason: "configured",
    });
  });
});

import { buildVerificationLink, passwordResetMessage, verificationMessage } from "./email";

describe("email links", () => {
  it("encodes the learner email and code in a verification link", () => {
    const link = buildVerificationLink("https://rampage.example", "learner+test@example.com", "123456");
    expect(link).toBe("https://rampage.example/verify?email=learner%2Btest%40example.com&code=123456");
  });

  it("creates recovery and verification messages without embedding credentials", () => {
    const verification = verificationMessage("https://rampage.example", "learner@example.com", "123456");
    const recovery = passwordResetMessage("https://rampage.example", "learner@example.com", "654321");
    expect(verification.subject).toContain("Verify");
    expect(recovery.subject).toContain("Reset");
    expect(verification.html).not.toContain("RESEND_API_KEY");
    expect(recovery.text).toContain("reset-password");
  });
});
