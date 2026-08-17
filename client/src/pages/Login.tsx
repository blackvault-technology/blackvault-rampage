import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [, navigate] = useLocation();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const redirect = params.get("redirect") || "/learn";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();
  const login = trpc.auth.login.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); navigate(redirect); } });
  const register = trpc.auth.register.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); navigate(redirect); } });
  const pending = login.isPending || register.isPending;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") await login.mutateAsync({ email, password });
      else await register.mutateAsync({ name, email, password });
    } catch (cause: any) {
      setError(cause?.message || "We could not complete that request.");
    }
  }

  return <main className="auth-page"><section className="auth-card" aria-labelledby="auth-title"><div className="eyebrow"><span className="signal-dot" /> BLACKVAULT RAMPAGE / ACCOUNT</div><h1 id="auth-title">Keep your place.<br /><em>Build the stack.</em></h1><p className="auth-lede">Create a Rampage account to save lesson progress, assessment attempts, reading state, and verified certificates.</p><div className="auth-tabs" role="tablist"><button className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")} role="tab" aria-selected={mode === "login"}>Sign in</button><button className={mode === "register" ? "is-active" : ""} onClick={() => setMode("register")} role="tab" aria-selected={mode === "register"}>Create account</button></div><form onSubmit={submit} className="auth-form">{mode === "register" && <label><span><UserRound size={15} /> Name</span><Input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required minLength={2} /></label>}<label><span><Mail size={15} /> Email</span><Input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label><label><span><LockKeyhole size={15} /> Password</span><Input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 10 : 1} /></label>{error && <p className="auth-error" role="alert">{error}</p>}<Button type="submit" disabled={pending} className="auth-submit">{pending ? "Opening your workspace…" : mode === "login" ? "Enter Rampage" : "Start learning"}<ArrowRight size={16} /></Button></form><div className="auth-links"><Link href="/reset-password">Forgot password?</Link><Link href="/verify">Have a verification code?</Link></div><p className="auth-note">By continuing, you are creating a first-party Rampage account. No external identity provider is required.</p><Link href="/" className="auth-back">Return to the academy</Link></section></main>;
}
