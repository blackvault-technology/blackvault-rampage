export type EmailDeliveryStatus =
  | { enabled: true; reason: "configured" }
  | { enabled: false; reason: "missing_credentials" };

export type TransactionalMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export function getEmailDeliveryStatus(config: { apiKey?: string; from?: string }): EmailDeliveryStatus {
  return config.apiKey?.trim() && config.from?.trim()
    ? { enabled: true, reason: "configured" }
    : { enabled: false, reason: "missing_credentials" };
}

export function getEmailDeliveryConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM ?? "",
  };
}

export function getRequestOrigin(req: { headers?: Record<string, string | string[] | undefined>; protocol?: string; get?: (name: string) => string | undefined }) {
  const forwardedProto = req.headers?.["x-forwarded-proto"];
  const forwardedHost = req.headers?.["x-forwarded-host"];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ?? req.protocol ?? "http";
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ?? req.get?.("host") ?? "localhost:3000";
  return `${protocol.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
}

export function buildVerificationLink(origin: string, email: string, code: string) {
  const url = new URL("/verify", origin);
  url.searchParams.set("email", email);
  url.searchParams.set("code", code);
  return url.toString();
}

export async function sendTransactionalEmail(message: TransactionalMessage): Promise<EmailDeliveryStatus> {
  const config = getEmailDeliveryConfig();
  const status = getEmailDeliveryStatus(config);
  if (!status.enabled) return status;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: config.from, to: [message.to], subject: message.subject, html: message.html, text: message.text }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Transactional email delivery failed (${response.status})${detail ? `: ${detail.slice(0, 160)}` : ""}`);
  }

  return status;
}

export function verificationMessage(origin: string, email: string, code: string) {
  const link = buildVerificationLink(origin, email, code);
  return {
    to: email,
    subject: "Verify your BlackVault Rampage account",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0a1d3a"><p>Your Rampage account is ready for verification.</p><p><a href="${link}">Verify your email address</a></p><p>This link expires in 15 minutes. If you did not create this account, you can ignore this message.</p></div>`,
    text: `Verify your BlackVault Rampage account: ${link}\n\nThis link expires in 15 minutes. If you did not create this account, you can ignore this message.`,
  };
}

export function passwordResetMessage(origin: string, email: string, code: string) {
  const link = buildVerificationLink(origin, email, code).replace("/verify", "/reset-password");
  return {
    to: email,
    subject: "Reset your BlackVault Rampage password",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0a1d3a"><p>A password reset was requested for your Rampage account.</p><p><a href="${link}">Continue to password recovery</a></p><p>This link expires in 15 minutes. If you did not request this, you can ignore this message.</p></div>`,
    text: `Reset your BlackVault Rampage password: ${link}\n\nThis link expires in 15 minutes. If you did not request this, you can ignore this message.`,
  };
}
