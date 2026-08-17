// Rampage certificate: an informal digital completion record, explicitly not an accredited credential.
import { ArrowLeft, Download, Printer, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useRoute } from "wouter";
import { courses } from "@/data/catalog";
import { Shell, useProgress } from "@/components/AcademyShell";
import { useMemo, useState } from "react";

export default function Certificate() {
  const [, params] = useRoute("/certificate/:courseId");
  const course = courses.find((item) => item.id === params?.courseId) || courses[0];
  const { done } = useProgress();
  const total = course.phases.reduce((sum, phase) => sum + phase.lessons.length, 0);
  const completed = course.phases.flatMap((phase) => phase.lessons.map((lesson) => `${course.id}:${lesson.id}`)).filter((id) => done.includes(id)).length;
  const [name, setName] = useState(() => localStorage.getItem("rampage-certificate-name") || "");
  const certificateId = useMemo(() => `RMP-${course.id.slice(0, 4).toUpperCase()}-${Math.abs(course.id.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)).toString(36).toUpperCase().slice(0, 7)}`, [course.id]);
  const date = new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date());
  return <Shell><main className="certificate-page"><div className="certificate-toolbar"><Link href={`/course/${course.id}`}><ArrowLeft size={15} /> Back to course</Link><span><ShieldCheck size={15} /> INFORMAL DIGITAL RECORD</span></div><section className="certificate-layout"><div className="certificate-intro"><p className="eyebrow"><span className="lime-dot" /> RAMPAGE / COMPLETION STUDIO</p><h1>Make the<br /><em>work visible.</em></h1><p>Generate a personal digital completion record when you finish a Rampage course. It is designed to document your learning journey—not to represent an accredited qualification, legal credential, or professional certification.</p><label className="name-field"><span>LEARNER NAME</span><input placeholder="Enter your name" value={name} onChange={(e) => { setName(e.target.value); localStorage.setItem("rampage-certificate-name", e.target.value); }} /></label><div className="certificate-progress"><strong>{completed}/{total}</strong><span>LESSONS MARKED COMPLETE IN THIS BROWSER</span></div></div><div className="certificate-card"><div className="certificate-card-grid" /><div className="certificate-mark"><Sparkles size={18} /></div><small>BLACKVAULT TECHNOLOGY / RAMPAGE</small><p className="certificate-kicker">DIGITAL COMPLETION RECORD</p><h2>{course.title}</h2><p className="certificate-recipient">{name || "Your name here"}</p><p className="certificate-copy">has completed the documented learning path and project checkpoints in this browser session.</p><div className="certificate-footer"><span>{date}<b>DATE ISSUED</b></span><span>{certificateId}<b>RECORD ID</b></span></div><div className="certificate-disclaimer">Informal learning record · not accredited · not a legal or professional credential</div></div></section><div className="certificate-actions"><button className="primary-cta" onClick={() => window.print()}><Printer size={15} /> Print / save as PDF</button><button className="text-cta" onClick={() => window.print()}><Download size={15} /> Download through browser print</button></div></main></Shell>;
}
