type AuthEmailPurpose = "verify_email" | "reset_password";

function getEmailCopy(purpose: AuthEmailPurpose, code: string) {
  if (purpose === "verify_email") {
    return {
      subject: "Verify your BlackVault Rampage account",
      heading: "Confirm your learner account",
      intro: "Use this six-digit code to verify your email address and protect your learning record.",
    };
  }
  return {
    subject: "Reset your BlackVault Rampage password",
    heading: "Reset your password",
    intro: "Use this six-digit code to choose a new password. If you did not request this, you can ignore this email.",
  };
}

export async function sendAuthCodeEmail(to: string, purpose: AuthEmailPurpose, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(`[Email] Resend is not configured; ${purpose} code is available only through the development fallback.`);
    return { delivered: false as const, reason: "not_configured" as const };
  }

  const copy = getEmailCopy(purpose, code);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: copy.subject,
      text: `${copy.heading}\n\n${copy.intro}\n\nYour code: ${code}\n\nThis code expires in 15 minutes.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;color:#10264a"><p style="letter-spacing:.12em;text-transform:uppercase;color:#ff4d11;font-size:12px">BLACKVAULT RAMPAGE</p><h1>${copy.heading}</h1><p>${copy.intro}</p><p style="font-size:32px;letter-spacing:.2em;font-weight:700">${code}</p><p>This code expires in 15 minutes.</p></div>`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "unknown provider error");
    console.error("[Email] Resend delivery failed:", detail);
    return { delivered: false as const, reason: "provider_error" as const };
  }
  return { delivered: true as const, reason: "resend" as const };
}
