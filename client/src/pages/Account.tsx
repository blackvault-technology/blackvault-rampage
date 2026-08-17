import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Award, BadgeCheck, Mail, Save, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export default function Account() {
  const profile = trpc.auth.profile.useQuery();
  const dashboard = trpc.learner.dashboard.useQuery();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const update = trpc.auth.updateProfile.useMutation({ onSuccess: async () => { setMessage("Account details saved."); await utils.auth.profile.invalidate(); } });
  const resend = trpc.auth.requestVerification.useMutation({ onSuccess: result => setMessage(result.developmentCode ? `Development verification code: ${result.developmentCode}` : "A fresh verification code has been requested.") });
  const user = profile.data;
  useEffect(() => { if (user) { setName(current => current || user.name || ""); setEmail(current => current || user.email || ""); } }, [user]);
  async function submit(event: React.FormEvent) { event.preventDefault(); setError(""); setMessage(""); try { await update.mutateAsync({ name, email }); } catch (cause: any) { setError(cause?.message || "Could not save account details."); } }
  return <main className="account-page"><div className="account-wrap"><div className="eyebrow"><span className="signal-dot" /> RAMPAGE / ACCOUNT CONTROL</div><div className="account-heading"><div><h1>Account <em>settings.</em></h1><p>Keep your identity, learning record, and issued certificates in one place.</p></div><Link href="/learn" className="auth-back">Return to My Learning</Link></div><div className="account-grid"><section className="account-panel"><div className="panel-kicker"><Settings2 size={16} /> Profile details</div><form onSubmit={submit} className="auth-form"><label><span><Sparkles size={15} /> Display name</span><Input value={name} onChange={event => setName(event.target.value)} minLength={2} required /></label><label><span><Mail size={15} /> Email address</span><Input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label><div className="account-verification"><BadgeCheck size={17} /><span>{user?.emailVerifiedAt ? "Email verified" : "Email not verified"}</span>{!user?.emailVerifiedAt && <button type="button" onClick={() => resend.mutate()}>{resend.isPending ? "Requesting…" : "Send code"}</button>}</div>{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}<Button type="submit" disabled={update.isPending}><Save size={15} /> {update.isPending ? "Saving…" : "Save details"}</Button></form></section><section className="account-panel"><div className="panel-kicker"><Award size={16} /> Earned certificates</div>{dashboard.data?.certificates?.length ? <div className="certificate-list">{dashboard.data.certificates.map(certificate => <Link key={certificate.certificateId} href={`/certificate/${certificate.courseId}`} className="certificate-row"><span><strong>{certificate.courseId}</strong><small>{certificate.certificateId}</small></span><BadgeCheck size={18} /></Link>)}</div> : <div className="empty-account"><Award size={26} /><p>No certificate has been issued yet.</p><small>Complete every lesson, chapter, and the server-verified final assessment. Unissued certificates remain blocked.</small><Link href="/learn">Continue learning</Link></div>}<div className="account-stats"><span><strong>{dashboard.data?.xp ?? 0}</strong><small>learning XP</small></span><span><strong>{dashboard.data?.progress?.length ?? 0}</strong><small>lesson records</small></span></div></section></div></div></main>;
}
