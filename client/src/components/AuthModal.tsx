import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type AuthMode = "login" | "register" | "verify" | "recovery";
type AuthModalProps = { open: boolean; onOpenChange: (open: boolean) => void; redirect?: string };

export function AuthModal({ open, onOpenChange, redirect = "/learn" }: AuthModalProps) {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();
  const login = trpc.auth.login.useMutation();
  const register = trpc.auth.register.useMutation();
  const verify = trpc.auth.verifyEmail.useMutation();
  const requestVerification = trpc.auth.requestVerification.useMutation();
  const requestReset = trpc.auth.requestPasswordReset.useMutation();
  const reset = trpc.auth.resetPassword.useMutation();
  const pending = [login, register, verify, requestVerification, requestReset, reset].some((item) => item.isPending);

  useEffect(() => { if (open) { setError(""); setMessage(""); } }, [open, mode]);
  const closeAndContinue = async () => { await utils.auth.me.invalidate(); onOpenChange(false); navigate(redirect); };
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    try {
      if (mode === "login") { await login.mutateAsync({ email, password }); await closeAndContinue(); return; }
      if (mode === "register") { const result = await register.mutateAsync({ name, email, password }); setMessage(result.developmentVerificationCode ? `Account created. Development code: ${result.developmentVerificationCode}` : "Account created. Check your email for the verification code."); setMode("verify"); return; }
      if (mode === "verify") { await verify.mutateAsync({ email, code }); setMessage("Email verified. Your account is ready."); await closeAndContinue(); return; }
      if (!code) { const result = await requestReset.mutateAsync({ email }); setMessage(result.developmentCode ? `Reset code requested. Development code: ${result.developmentCode}` : "Reset code requested. Enter it below with a new password."); return; }
      await reset.mutateAsync({ email, code, password }); setMessage("Password updated. You can sign in now."); setMode("login"); setCode(""); setPassword("");
    } catch (cause: any) { setError(cause?.message || "We could not complete that request."); }
  }
  const title = mode === "login" ? "Keep your place." : mode === "register" ? "Start with intent." : mode === "verify" ? "Confirm the signal." : "Recover your record.";
  const eyebrow = mode === "login" ? "ACCOUNT ACCESS" : mode === "register" ? "NEW LEARNER" : mode === "verify" ? "EMAIL VERIFICATION" : "ACCOUNT RECOVERY";
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="auth-dialog" aria-describedby="auth-dialog-description"><div className="auth-dialog-mark"><span className="signal-dot" /> RAMPAGE / {eyebrow}</div><DialogTitle className="auth-dialog-title">{title}<br /><em>{mode === "recovery" ? "Find the way back." : "Build the stack."}</em></DialogTitle><DialogDescription id="auth-dialog-description" className="auth-dialog-copy">{mode === "verify" ? "Enter the six-digit code sent to your email. Verification keeps certificates and account recovery tied to the right learner." : "Save lesson progress, assessment attempts, reading state, and verified certificates in one first-party account."}</DialogDescription><div className="auth-mode-switch" role="tablist"><button className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")} role="tab" aria-selected={mode === "login"}>Sign in</button><button className={mode === "register" ? "is-active" : ""} onClick={() => setMode("register")} role="tab" aria-selected={mode === "register"}>Create account</button></div><form className="auth-form auth-modal-form" onSubmit={submit}>{mode === "register" && <label><span><UserRound size={15} /> Display name</span><Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} /></label>}<label><span><Mail size={15} /> Email address</span><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>{mode === "verify" && <label><span><ShieldCheck size={15} /> Verification code</span><Input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} required /></label>}{mode !== "verify" && mode !== "recovery" && <label><span><LockKeyhole size={15} /> Password</span><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 10 : 1} /></label>}{mode === "recovery" && code && <><label><span><KeyRound size={15} /> Reset code</span><Input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} required /></label><label><span><LockKeyhole size={15} /> New password</span><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} required /></label></>}{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}<Button type="submit" disabled={pending} className="auth-submit">{pending ? "Working…" : mode === "login" ? "Enter Rampage" : mode === "register" ? "Create account" : mode === "verify" ? "Verify email" : code ? "Set new password" : "Send reset code"}<ArrowRight size={16} /></Button></form><div className="auth-links"><button type="button" onClick={() => { setMode("recovery"); setCode(""); }}>Forgot password?</button><button type="button" onClick={() => setMode("verify")}>Have a verification code?</button></div><p className="auth-note">No external identity provider is required. Your learner record stays tied to this first-party account.</p></DialogContent></Dialog>;
}

export function useAuthModal() {
  const [open, setOpen] = useState(false);
  const [redirect, setRedirect] = useState("/learn");
  useEffect(() => { const handler = (event: Event) => { const detail = (event as CustomEvent<{ redirect?: string }>).detail; setRedirect(detail?.redirect || "/learn"); setOpen(true); }; window.addEventListener("rampage:auth", handler); return () => window.removeEventListener("rampage:auth", handler); }, []);
  return { open, setOpen, redirect };
}

export function AuthLauncher({ children, redirect }: { children: React.ReactNode; redirect?: string }) { return <button type="button" className="auth-launcher" onClick={() => window.dispatchEvent(new CustomEvent("rampage:auth", { detail: { redirect: redirect || window.location.pathname } }))}>{children}</button>; }
export function AuthIcon() { return <UserRound size={17} />; }
export default AuthModal;

/* Auth modal intentionally owns only presentation and mutation orchestration; server procedures remain the source of truth. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _authModalContract = { AuthMode: "login" as AuthMode };
