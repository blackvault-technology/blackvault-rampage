import { ArrowLeft, Download, Printer, ShieldCheck, Sparkles, LockKeyhole } from "lucide-react";
import { Link, useRoute } from "wouter";
import { courses } from "@/data/catalog";
import { Shell, useProgress } from "@/components/AcademyShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";

export default function Certificate() {
  const [, params] = useRoute("/certificate/:courseId");
  const course = courses.find(item => item.id === params?.courseId) || courses[0];
  const { done } = useProgress();
  const { user, loading, isAuthenticated } = useAuth();
  const total = course.phases.reduce((sum, phase) => sum + phase.lessons.length, 0);
  const completed = course.phases.flatMap(phase => phase.lessons.map(lesson => `${course.id}:${lesson.id}`)).filter(id => done.includes(id)).length;
  const [name, setName] = useState(() => localStorage.getItem("rampage-certificate-name") || user?.name || "");
  const issue = trpc.learner.issueCertificate.useMutation();
  const issued = issue.data;
  const certificateId = issued?.certificateId ?? "LOCKED UNTIL VERIFIED";
  const date = issued?.issuedAt ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(issued.issuedAt)) : "Not issued";
  const canRequest = isAuthenticated && completed >= total;
  const statusCopy = useMemo(() => {
    if (!isAuthenticated) return "Sign in to create a server-verified learning record.";
    if (completed < total) return `${total - completed} lesson${total - completed === 1 ? "" : "s"} remaining before the final assessment.`;
    return issued ? "Your completion record is secured to your account." : "Complete the final assessment, then request server verification.";
  }, [completed, issued, isAuthenticated, total]);

  return <Shell><main className="certificate-page"><div className="certificate-toolbar"><Link href={`/course/${course.id}`}><ArrowLeft size={15} /> Back to course</Link><span><ShieldCheck size={15} /> INFORMAL DIGITAL RECORD</span></div><section className="certificate-layout"><div className="certificate-intro"><p className="eyebrow"><span className="lime-dot" /> RAMPAGE / COMPLETION STUDIO</p><h1>Make the<br /><em>work visible.</em></h1><p>Certificates are issued only after a signed-in learner completes every chapter and passes the server-scored final assessment. Rampage stores the record in Neon so it is not dependent on one browser session.</p>{!isAuthenticated && !loading ? <button className="primary-cta" onClick={() => startLogin()}><LockKeyhole size={15} /> Sign in to unlock certification</button> : <label className="name-field"><span>LEARNER NAME</span><input placeholder="Enter your name" value={name} onChange={e => { setName(e.target.value); localStorage.setItem("rampage-certificate-name", e.target.value); }} /></label>}<div className="certificate-progress"><strong>{completed}/{total}</strong><span>LESSONS MARKED COMPLETE IN THIS BROWSER</span></div><p className="certificate-status">{statusCopy}</p>{isAuthenticated && completed >= total && !issued && <Link className="secondary-cta" href={`/course/${course.id}/assessment`}><ShieldCheck size={15} /> Take final assessment first</Link>}{isAuthenticated && <button className="primary-cta" disabled={!canRequest || issue.isPending} onClick={() => issue.mutate({ courseId: course.id })}>{issue.isPending ? "Verifying…" : issued ? "Certificate secured" : "Verify final completion"}</button>}{issue.error && <p className="form-error">{issue.error.message}</p>}</div><div className="certificate-card"><div className="certificate-card-grid" /><div className="certificate-mark"><Sparkles size={18} /></div><small>BLACKVAULT TECHNOLOGY / RAMPAGE</small><p className="certificate-kicker">DIGITAL COMPLETION RECORD</p><h2>{course.title}</h2><p className="certificate-recipient">{name || user?.name || "Your name here"}</p><p className="certificate-copy">has completed the documented learning path and project checkpoints verified by Rampage.</p><div className="certificate-footer"><span>{date}<b>DATE ISSUED</b></span><span>{certificateId}<b>RECORD ID</b></span></div><div className="certificate-disclaimer">Informal learning record · not accredited · not a legal or professional credential</div></div></section><div className="certificate-actions"><button className="primary-cta" disabled={!issued} onClick={() => window.print()}><Printer size={15} /> Print / save as PDF</button><button className="text-cta" disabled={!issued} onClick={() => window.print()}><Download size={15} /> Download through browser print</button></div></main></Shell>;
}
