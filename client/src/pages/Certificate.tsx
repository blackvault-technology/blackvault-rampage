import { ArrowLeft, Check, Copy, Download, Linkedin, LockKeyhole, Printer, ShieldCheck, Sparkles, Twitter } from "lucide-react";
import { Link, useRoute } from "wouter";
import { courses } from "@/data/catalog";
import { Shell } from "@/components/AcademyShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { AuthLauncher } from "@/components/AuthModal";
import { trpc } from "@/lib/trpc";
import { buildCertificateShareText, buildCertificateShareUrls } from "@/lib/certificateShare";
import { useEffect, useMemo, useState } from "react";

export default function Certificate() {
  const [, params] = useRoute("/certificate/:courseId");
  const course = courses.find(item => item.id === params?.courseId) || courses[0];
  const { user, loading, isAuthenticated } = useAuth();
  const total = course.phases.reduce((sum, phase) => sum + phase.lessons.length, 0);
  const dashboard = trpc.learner.dashboard.useQuery(undefined, { enabled: isAuthenticated });
  const profile = trpc.auth.profile.useQuery(undefined, { enabled: isAuthenticated });
  const updateProfile = trpc.auth.updateProfile.useMutation();
  const completedIds = new Set((dashboard.data?.progress ?? []).filter((item) => item.courseId === course.id).map((item) => item.lessonId));
  const completed = course.phases.flatMap(phase => phase.lessons).filter((lesson) => completedIds.has(lesson.id)).length;
  const [name, setName] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const issue = trpc.learner.issueCertificate.useMutation();
  useEffect(() => {
    if (profile.data?.name || user?.name) setName(profile.data?.name || user?.name || "");
  }, [profile.data?.name, user?.name]);
  const saveName = async () => {
    const nextName = name.trim();
    if (!nextName || !profile.data || nextName === profile.data.name) return;
    setProfileMessage("");
    try {
      await updateProfile.mutateAsync({ name: nextName, email: profile.data.email ?? user?.email ?? "" });
      await profile.refetch();
      setProfileMessage("Learner name saved to your account.");
    } catch (cause: any) {
      setProfileMessage(cause?.message || "We could not save your learner name.");
    }
  };
  const issued = issue.data;
  const certificateId = issued?.certificateId ?? "LOCKED UNTIL VERIFIED";
  const date = issued?.issuedAt ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(issued.issuedAt)) : "Not issued";
  const canRequest = isAuthenticated && completed >= total;
  const [shareMessage, setShareMessage] = useState("");
  const statusCopy = useMemo(() => {
    if (!isAuthenticated) return "Sign in to create a server-verified learning record.";
    if (completed < total) return `${total - completed} lesson${total - completed === 1 ? "" : "s"} remaining before the final assessment.`;
    return issued ? "Your completion record is secured to your account." : "Complete the final assessment, then request server verification.";
  }, [completed, issued, isAuthenticated, total]);
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;
  const shareText = buildCertificateShareText(course.title, shareUrl);
  const openShare = (target: "linkedin" | "twitter") => {
    if (!issued || !shareUrl) return;
    const shareUrls = buildCertificateShareUrls(course.title, shareUrl);
    window.open(target === "linkedin" ? shareUrls.linkedIn : shareUrls.twitter, "_blank", "noopener,noreferrer,width=640,height=640");
    setShareMessage(`Opening ${target === "linkedin" ? "LinkedIn" : "X"} share…`);
  };
  const copyShare = async () => {
    if (!issued || !shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setShareMessage("Share text and certificate link copied.");
    } catch {
      setShareMessage("Copy is unavailable here. Use the LinkedIn or X buttons instead.");
    }
  };

  return <Shell><main className="certificate-page"><div className="certificate-toolbar"><Link href={`/course/${course.id}`}><ArrowLeft size={15} /> Back to course</Link><span><ShieldCheck size={15} /> INFORMAL DIGITAL RECORD</span></div><section className="certificate-layout"><div className="certificate-intro"><p className="eyebrow"><span className="lime-dot" /> RAMPAGE / COMPLETION STUDIO</p><h1>Make the<br /><em>work visible.</em></h1><p>Certificates are issued only after a signed-in learner completes every chapter and passes the server-scored final assessment. Rampage stores the record in Neon so it is not dependent on one browser session.</p>{!isAuthenticated && !loading ? <AuthLauncher redirect={typeof window === "undefined" ? "/learn" : window.location.pathname}><LockKeyhole size={15} /><span>Sign in to unlock certification</span></AuthLauncher> : <label className="name-field"><span>LEARNER NAME / SAVED TO ACCOUNT</span><input placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} onBlur={() => void saveName()} aria-describedby="certificate-name-status" /></label>}<div className="certificate-progress"><strong>{completed}/{total}</strong><span>LESSONS MARKED COMPLETE IN NEON</span></div>{profileMessage && <p id="certificate-name-status" className={profileMessage.includes("could not") ? "form-error" : "share-status"} role="status">{profileMessage}</p>}<p className="certificate-status">{statusCopy}</p>{isAuthenticated && completed >= total && !issued && <Link className="secondary-cta" href={`/course/${course.id}/assessment`}><ShieldCheck size={15} /> Take final assessment first</Link>}{isAuthenticated && <button className="primary-cta" disabled={!canRequest || issue.isPending} onClick={() => issue.mutate({ courseId: course.id })}>{issue.isPending ? "Verifying…" : issued ? "Certificate secured" : "Verify final completion"}</button>}{issue.error && <p className="form-error">{issue.error.message}</p>}</div>{issued ? <div className="certificate-card"><div className="certificate-card-grid" /><div className="certificate-mark"><Sparkles size={18} /></div><small>BLACKVAULT TECHNOLOGY / RAMPAGE</small><p className="certificate-kicker">DIGITAL COMPLETION RECORD</p><h2>{course.title}</h2><p className="certificate-recipient">{name || user?.name || "Your name here"}</p><p className="certificate-copy">has completed the documented learning path and project checkpoints verified by Rampage.</p><div className="certificate-footer"><span>{date}<b>DATE ISSUED</b></span><span>{certificateId}<b>RECORD ID</b></span></div><div className="certificate-disclaimer">Informal learning record · not accredited · not a legal or professional credential</div></div> : <div className="certificate-locked"><LockKeyhole size={28} /><strong>Certificate not issued</strong><p>The full completion record stays sealed until every lesson, chapter, and the server-verified final assessment are complete.</p><span>{completed}/{total} lessons recorded in Neon</span></div>}</section>{issued && <section className="certificate-share-panel" aria-labelledby="certificate-share-title"><div><span className="aside-label">SHARE THE WORK / OPTIONAL</span><h2 id="certificate-share-title">Make the milestone visible.</h2><p>Sharing opens the current certificate page. Your certificate remains attached to your Rampage account; do not share if the page contains information you want to keep private.</p></div><div className="certificate-share-actions"><button className="share-button share-button--linkedin" onClick={() => openShare("linkedin")}><Linkedin size={15} /> LinkedIn</button><button className="share-button share-button--twitter" onClick={() => openShare("twitter")}><Twitter size={15} /> X / Twitter</button><button className="share-button share-button--copy" onClick={() => void copyShare()}><Copy size={15} /> Copy link</button></div>{shareMessage && <p className="share-status" role="status"><Check size={14} /> {shareMessage}</p>}</section>}<div className="certificate-actions"><button className="primary-cta" disabled={!issued} onClick={() => window.print()}><Printer size={15} /> Print / save as PDF</button><button className="text-cta" disabled={!issued} onClick={() => window.print()}><Download size={15} /> Download through browser print</button></div></main></Shell>;
}
