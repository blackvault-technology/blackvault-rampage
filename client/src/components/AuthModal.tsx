import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthMode = "login" | "register" | "verify" | "recovery";
type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirect?: string;
};

const modeCopy: Record<AuthMode, { eyebrow: string; title: string; emphasis: string }> = {
  login: { eyebrow: "ACCOUNT ACCESS", title: "Keep your place.", emphasis: "Build the stack." },
  register: { eyebrow: "NEW LEARNER", title: "Start with intent.", emphasis: "Build the stack." },
  verify: { eyebrow: "ACCOUNT VERIFICATION", title: "Confirm the signal.", emphasis: "Protect the record." },
  recovery: { eyebrow: "ACCOUNT RECOVERY", title: "Recover your record.", emphasis: "Find the way back." },
};

export function AuthModal({ open, onOpenChange, redirect = "/learn" }: AuthModalProps) {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetRequested, setResetRequested] = useState(false);
  const utils = trpc.useUtils();
  const login = trpc.auth.login.useMutation();
  const register = trpc.auth.register.useMutation();
  const verify = trpc.auth.verifyEmail.useMutation();
  const requestReset = trpc.auth.requestPasswordReset.useMutation();
  const reset = trpc.auth.resetPassword.useMutation();
  const pending = [login, register, verify, requestReset, reset].some((item) => item.isPending);
  const copy = modeCopy[mode];

  useEffect(() => {
    if (open) {
      setError("");
      setMessage("");
      setResetRequested(false);
    }
  }, [open, mode]);

  const closeAndContinue = async () => {
    await utils.auth.me.invalidate();
    onOpenChange(false);
    navigate(redirect);
  };

  const switchMode = (nextMode: AuthMode) => {
    setError("");
    setMessage("");
    setResetRequested(false);
    setMode(nextMode);
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      if (mode === "login") {
        await login.mutateAsync({ email, password });
        await closeAndContinue();
        return;
      }
      if (mode === "register") {
        const result = await register.mutateAsync({ name, email, password });
        setMessage(
          result.developmentVerificationCode
            ? `Account created. Development code: ${result.developmentVerificationCode}`
            : "Account created. Use the verification code available in this session.",
        );
        setMode("verify");
        return;
      }
      if (mode === "verify") {
        await verify.mutateAsync({ email, code });
        setMessage("Email verified. Your account is ready.");
        await closeAndContinue();
        return;
      }
      if (!code) {
        await requestReset.mutateAsync({ email });
        setResetRequested(true);
        return;
      }
      await reset.mutateAsync({ email, code, password });
      setMessage("Password updated. You can sign in now.");
      switchMode("login");
      setCode("");
      setPassword("");
    } catch (cause: any) {
      setError(cause?.message || "We could not complete that request.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="auth-dialog" aria-describedby="auth-dialog-description">
        <aside className="auth-brand-panel" aria-label="BlackVault Rampage account benefits">
          <div className="auth-brand-lockup">
            <span className="auth-brand-mark" aria-hidden="true"><span /></span>
            <span>BLACKVAULT <b>RAMPAGE</b></span>
          </div>
          <div className="auth-brand-copy">
            <p className="auth-brand-kicker">FIRST-PARTY LEARNER RECORD</p>
            <h2>Keep the signal.<br /><em>Build the proof.</em></h2>
            <p>Your account connects lessons, reading states, assessment attempts, XP, and verified certificates without an external identity provider.</p>
          </div>
          <div className="auth-brand-grid" aria-label="Account capabilities">
            <span><strong>01</strong><small>Progress<br />saved</small></span>
            <span><strong>02</strong><small>Sources<br />remembered</small></span>
            <span><strong>03</strong><small>Proof<br />verified</small></span>
          </div>
          <p className="auth-brand-foot">RAMPAGE / 2026<br />STRUCTURE OVER NOISE</p>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-panel-topline">
            <span className="auth-dialog-mark"><span className="signal-dot" /> {copy.eyebrow}</span>
            <span className="auth-panel-index">{mode === "login" ? "01" : mode === "register" ? "02" : mode === "verify" ? "03" : "04"} / 04</span>
          </div>
          <DialogTitle className="auth-dialog-title">{copy.title}<br /><em>{copy.emphasis}</em></DialogTitle>
          <DialogDescription id="auth-dialog-description" className="auth-dialog-copy">
            {mode === "verify"
              ? "Enter the six-digit code for this account. Verification keeps certificates and account recovery tied to the right learner."
              : "Save lesson progress, assessment attempts, reading state, and verified certificates in one first-party account."}
          </DialogDescription>

          <div className="auth-mode-switch" role="tablist" aria-label="Account access mode">
            <button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => switchMode("login")} role="tab" aria-selected={mode === "login"}>Sign in</button>
            <button type="button" className={mode === "register" ? "is-active" : ""} onClick={() => switchMode("register")} role="tab" aria-selected={mode === "register"}>Create account</button>
          </div>

          {mode === "recovery" && resetRequested ? (
            <div className="auth-inbox-success" role="status" aria-live="polite">
              <div className="auth-inbox-icon"><CheckCircle2 size={28} /></div>
              <p className="auth-inbox-kicker">RECOVERY REQUESTED</p>
              <h3>Recovery request recorded.</h3>
              <p>Email delivery is disabled in this deployment. If you have a valid six-digit recovery code, enter it here to choose a new password.</p>
              <button type="button" className="auth-text-action" onClick={() => { setResetRequested(false); setCode(""); }}>Enter a reset code <ArrowRight size={15} /></button>
              <button type="button" className="auth-secondary-action" onClick={() => { setResetRequested(false); setCode(""); }}>Use a different email</button>
            </div>
          ) : (
            <form className="auth-form auth-modal-form" onSubmit={submit}>
              {mode === "register" && <label><span><UserRound size={15} /> Display name</span><Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} /></label>}
              <label><span><Mail size={15} /> Email address</span><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
              {mode === "verify" && <label><span><ShieldCheck size={15} /> Verification code</span><Input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} required /></label>}
              {mode !== "verify" && mode !== "recovery" && <label><span><LockKeyhole size={15} /> Password</span><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 10 : 1} /></label>}
              {mode === "recovery" && code && <><label><span><KeyRound size={15} /> Reset code</span><Input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} required /></label><label><span><LockKeyhole size={15} /> New password</span><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} required /></label></>}
              {error && <p className="auth-error" role="alert">{error}</p>}
              {message && <p className="auth-success" role="status">{message}</p>}
              <Button type="submit" disabled={pending} aria-busy={pending} className="auth-submit"><span>{pending ? "Working…" : mode === "login" ? "Enter Rampage" : mode === "register" ? "Create account" : mode === "verify" ? "Verify email" : code ? "Set new password" : "Send reset code"}</span>{pending ? <span className="auth-button-loader" aria-hidden="true" /> : <ArrowRight size={16} />}</Button>
            </form>
          )}

          <div className="auth-links">
            <button type="button" onClick={() => switchMode("recovery")}>Forgot password?</button>
            <button type="button" onClick={() => switchMode("verify")}>Have a verification code?</button>
          </div>
          <p className="auth-note">No external identity provider or email service is required. Your learner record stays tied to this first-party account.</p>
          <p className="auth-legal-copy">By continuing, you agree to the <a href="/terms">Terms</a> and acknowledge the <a href="/privacy">Privacy</a> and <a href="/acceptable-use">Acceptable Use</a> policies.</p>
        </section>
      </DialogContent>
    </Dialog>
  );
}


export function AuthLauncher({ children, redirect }: { children: React.ReactNode; redirect?: string }) {
  return <button type="button" className="auth-launcher" onClick={() => window.dispatchEvent(new CustomEvent("rampage:auth", { detail: { redirect: redirect || window.location.pathname } }))}>{children}</button>;
}

export function AuthIcon() { return <UserRound size={17} />; }
export default AuthModal;

/* Auth modal intentionally owns only presentation and mutation orchestration; server procedures remain the source of truth. */
const _authModalContract = { AuthMode: "login" as AuthMode };
void _authModalContract;
