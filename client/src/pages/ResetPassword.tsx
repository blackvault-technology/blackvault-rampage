import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState(() => new URLSearchParams(window.location.search).get("email") ?? "");
  const [code, setCode] = useState(() => new URLSearchParams(window.location.search).get("code")?.replace(/\D/g, "").slice(0, 6) ?? "");
  const [password, setPassword] = useState("");
  const [requested, setRequested] = useState(() => Boolean(new URLSearchParams(window.location.search).get("code")));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const request = trpc.auth.requestPasswordReset.useMutation({ onSuccess: result => { setRequested(true); setMessage(result.developmentCode ? `Development reset code: ${result.developmentCode}` : result.delivery?.delivered ? "Recovery link sent. Check your inbox to continue." : "Recovery request recorded, but transactional email is not configured yet."); } });
  const reset = trpc.auth.resetPassword.useMutation({ onSuccess: () => { setMessage("Password updated. You can sign in now."); window.setTimeout(() => navigate("/login"), 800); } });
  async function submit(event: React.FormEvent) { event.preventDefault(); setError(""); try { if (!requested) await request.mutateAsync({ email }); else await reset.mutateAsync({ email, code, password }); } catch (cause: any) { setError(cause?.message || "We could not complete that request."); } }
  return <main className="auth-page"><section className="auth-card" aria-labelledby="reset-title"><div className="eyebrow"><span className="signal-dot" /> RAMPAGE / RECOVERY</div><h1 id="reset-title">Return to your<br /><em>learning record.</em></h1><p className="auth-lede">Use a short-lived reset code, then choose a new password. Codes expire quickly and are consumed after one successful use.</p><form onSubmit={submit} className="auth-form"><label><span><Mail size={15} /> Email</span><Input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>{requested && <><label><span><KeyRound size={15} /> Reset code</span><Input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))} required /></label><label><span><KeyRound size={15} /> New password</span><Input type="password" minLength={10} value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" required /></label></>}{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}<Button type="submit" disabled={request.isPending || reset.isPending} className="auth-submit">{request.isPending || reset.isPending ? "Working…" : requested ? "Set new password" : "Send recovery link"}<ArrowRight size={16} /></Button></form><Link href="/login" className="auth-back">Back to account access</Link></section></main>;
}
