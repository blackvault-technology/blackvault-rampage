import { useEffect, useMemo, useState } from "react";
import { Award, BadgeCheck, BookOpen, CalendarDays, Check, ChevronRight, Clock3, KeyRound, Mail, Save, Settings2, ShieldCheck, Sparkles, UserRound, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLauncher } from "@/components/AuthModal";
import { courses } from "@/data/catalog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Account() {
  const profile = trpc.auth.profile.useQuery();
  const dashboard = trpc.learner.dashboard.useQuery();
  const utils = trpc.useUtils();
  const { logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const update = trpc.auth.updateProfile.useMutation({ onSuccess: async () => { setMessage("Account details saved."); await utils.auth.profile.invalidate(); await utils.auth.me.invalidate(); } });
  const resend = trpc.auth.requestVerification.useMutation({ onSuccess: result => setMessage(result.developmentCode ? `Development verification code: ${result.developmentCode}` : "A fresh verification code has been requested.") });
  const user = profile.data;
  const state = dashboard.data;
  const progressByCourse = useMemo(() => courses.filter(course => course.phases.length).map(course => {
    const total = course.phases.reduce((sum, phase) => sum + phase.lessons.length, 0);
    const completed = state?.progress.filter(item => item.courseId === course.id).length ?? 0;
    return { course, total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
  }).filter(item => item.completed > 0 || item.course.id === "ai-systems").slice(0, 3), [state?.progress]);
  const totalLessons = progressByCourse.reduce((sum, item) => sum + item.completed, 0);
  const initials = (user?.name || user?.email || "R").split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "Rampage learner";

  useEffect(() => { if (user) { setName(current => current || user.name || ""); setEmail(current => current || user.email || ""); } }, [user]);
  async function submit(event: React.FormEvent) { event.preventDefault(); setError(""); setMessage(""); try { await update.mutateAsync({ name, email }); } catch (cause: any) { setError(cause?.message || "Could not save account details."); } }

  return <main className="account-page"><div className="account-wrap">
    <div className="account-topline"><p className="eyebrow"><span className="signal-dot" /> RAMPAGE / LEARNER PROFILE</p><Link href="/learn" className="auth-back">Return to My Learning <ChevronRight size={15} /></Link></div>
    <section className="profile-hero"><div className="profile-avatar" aria-hidden="true">{initials}</div><div className="profile-identity"><span className="panel-kicker">FIRST-PARTY ACCOUNT <ShieldCheck size={14} /></span><h1>{user?.name || "Your learner profile"}<em>.</em></h1><p>{user?.email}</p><div className="profile-meta"><span><CalendarDays size={14} /> Learner since {joined}</span><span className={user?.emailVerifiedAt ? "is-positive" : ""}><BadgeCheck size={14} /> {user?.emailVerifiedAt ? "Email verified" : "Email needs verification"}</span></div></div><div className="profile-actions"><Link href="/learn" className="primary-cta"><BookOpen size={15} /> Continue learning</Link><button className="profile-quiet-action" onClick={() => logout()}>Sign out</button></div></section>
    <section className="profile-stat-grid" aria-label="Learning summary"><div><Zap size={17} /><strong>{state?.xp ?? 0}</strong><span>verified XP</span></div><div><BookOpen size={17} /><strong>{totalLessons}</strong><span>lessons completed</span></div><div><Award size={17} /><strong>{state?.certificates?.length ?? 0}</strong><span>certificates issued</span></div><div><Clock3 size={17} /><strong>{state?.progress?.length ?? 0}</strong><span>progress records</span></div></section>
    <div className="account-grid account-grid--profile"><section className="account-panel"><div className="panel-kicker"><Settings2 size={16} /> Profile details</div><p className="panel-intro">Use a name you would want printed on a future Rampage certificate. Your email is the anchor for verification and account recovery.</p><form onSubmit={submit} className="auth-form"><label><span><Sparkles size={15} /> Display name</span><Input value={name} onChange={event => setName(event.target.value)} minLength={2} required /></label><label><span><Mail size={15} /> Email address</span><Input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label><div className="account-verification"><BadgeCheck size={17} /><span>{user?.emailVerifiedAt ? "Email verified — account is ready for certificates" : "Email not verified — verify to protect your record"}</span>{!user?.emailVerifiedAt && <button type="button" onClick={() => resend.mutate()}>{resend.isPending ? "Requesting…" : "Send code"}</button>}</div>{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}<Button type="submit" disabled={update.isPending}><Save size={15} /> {update.isPending ? "Saving…" : "Save profile"}</Button></form></section>
    <section className="account-panel account-panel--dark"><div className="panel-kicker"><ShieldCheck size={16} /> Account security</div><h2>Your record, under your control.</h2><p className="panel-intro">Rampage uses a first-party account so progress, assessment attempts, and certificate issuance stay attached to one verified learner identity.</p><div className="security-list"><div><Check size={15} /><span>Signed session active</span><small>Protected by the Rampage account layer</small></div><div><Check size={15} /><span>Server-verified learning</span><small>Completion and certificates are checked on the server</small></div><div><KeyRound size={15} /><span>Password recovery</span><small>Request a secure reset code when needed</small></div></div><AuthLauncher redirect="/account"><span>Open account recovery</span><ChevronRight size={15} /></AuthLauncher></section></div>
    <section className="account-section"><div className="section-heading compact"><div><div className="section-index">01 <span>/</span> WORK IN MOTION</div><h2>Your routes.</h2></div><Link className="text-cta" href="/paths">Find another route <ChevronRight size={15} /></Link></div>{progressByCourse.length ? <div className="profile-course-grid">{progressByCourse.map(item => <Link className="profile-course-card" key={item.course.id} href={`/course/${item.course.id}`}><div className="profile-course-top"><span>{item.course.status}</span><strong>{item.percent}%</strong></div><h3>{item.course.title}</h3><p>{item.course.subtitle}</p><div className="mini-track"><i style={{ width: `${item.percent}%` }} /></div><small>{item.completed} of {item.total} lessons complete <ChevronRight size={13} /></small></Link>)}</div> : <div className="empty-account"><BookOpen size={24} /><p>Your first route is waiting.</p><small>Open a course and your progress will appear here as a durable learner record.</small><Link href="/paths">Choose a guided path</Link></div>}</section>
    <section className="account-section"><div className="section-heading compact"><div><div className="section-index">02 <span>/</span> VERIFIED PROOF</div><h2>Certificates.</h2></div><span className="aside-label">ISSUED ONLY</span></div>{state?.certificates?.length ? <div className="certificate-list certificate-list--wide">{state.certificates.map(certificate => <Link key={certificate.certificateId} href={`/certificate/${certificate.courseId}`} className="certificate-row"><span><strong>{certificate.courseId}</strong><small>{certificate.certificateId} · issued {new Date(certificate.issuedAt).toLocaleDateString()}</small></span><BadgeCheck size={18} /></Link>)}</div> : <div className="certificate-locked"><Award size={25} /><strong>Nothing issued yet.</strong><p>Complete the course lessons, chapter gates, and server-verified final assessment. Until then, the certificate remains intentionally sealed.</p><Link className="text-cta" href="/learn">See your completion path <ChevronRight size={15} /></Link></div>}</section>
  </div></main>;
}
