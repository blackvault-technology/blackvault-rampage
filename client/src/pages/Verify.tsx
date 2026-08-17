import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, BadgeCheck, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export default function Verify() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const verify = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setMessage("Account verified. Your learner record is now active.");
      window.setTimeout(() => navigate("/learn"), 700);
    },
  });
  const resend = trpc.auth.requestVerification.useMutation({
    onSuccess: result => setMessage(result.developmentCode ? `Development verification code: ${result.developmentCode}` : "Email delivery is disabled; request a code from the current development session."),
  });
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await verify.mutateAsync({ email, code });
    } catch (cause: any) {
      setError(cause?.message || "That code could not be accepted.");
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="verify-title">
        <div className="eyebrow"><span className="signal-dot" /> RAMPAGE / VERIFY</div>
        <h1 id="verify-title">Confirm the<br /><em>account signal.</em></h1>
        <p className="auth-lede">Enter the six-digit code for this account. Verification keeps certificates and account recovery tied to the right learner.</p>
        <form onSubmit={submit} className="auth-form">
          <label><span><MailCheck size={15} /> Email</span><Input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label><span><BadgeCheck size={15} /> Verification code</span><Input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))} required /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <Button type="submit" disabled={verify.isPending} className="auth-submit">{verify.isPending ? "Checking code…" : "Verify account"}<ArrowRight size={16} /></Button>
        </form>
        <button className="auth-back" onClick={() => resend.mutate()} disabled={resend.isPending}>Request a development code</button>
        <Link href="/login" className="auth-back">Back to account access</Link>
      </section>
    </main>
  );
}
