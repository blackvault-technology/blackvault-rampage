// Source-first lesson workspace: the original material is opened explicitly; the lesson page organizes the work around it.
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ExternalLink, FileText, Flag, Github, Link2, LockKeyhole, MessageSquare, ScrollText, ShieldCheck, Terminal } from "lucide-react";
import { Link, useRoute } from "wouter";
import { findLesson, findPhase, courses } from "@/data/catalog";
import { Shell, useProgress } from "@/components/AcademyShell";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type WorkState = { source: boolean; lab: boolean; evidence: boolean; note: string };
const blankWork: WorkState = { source: false, lab: false, evidence: false, note: "" };
function getWork(key: string): WorkState { try { return { ...blankWork, ...JSON.parse(localStorage.getItem(`rampage-work-${key}`) || "{}") }; } catch { return blankWork; } }

export default function Lesson() {
  const [, params] = useRoute("/course/:courseId/lesson/:lessonId");
  const course = courses.find((item) => item.id === params?.courseId) || courses[0];
  const lesson = findLesson(course.id, params?.lessonId || "") || course.phases[0].lessons[0];
  const phase = course.phases.find((item) => item.lessons.some((item) => item.id === lesson.id)) || findPhase(course.id, course.phases[0].id)!;
  const { done, mark } = useProgress();
  const { isAuthenticated } = useAuth();
  const completeLesson = trpc.learner.completeLesson.useMutation();
  const progressKey = `${course.id}:${lesson.id}`;
  const [work, setWork] = useState<WorkState>(() => getWork(progressKey));
  const flatLessons = useMemo(() => course.phases.flatMap((item) => item.lessons.map((lessonItem) => ({ ...lessonItem, phaseId: item.id, phaseTitle: item.title }))), [course]);
  const lessonIndex = flatLessons.findIndex((item) => item.id === lesson.id);
  const current = flatLessons[lessonIndex];
  const next = flatLessons[lessonIndex + 1];
  const previous = flatLessons[lessonIndex - 1];
  const stepCount = [work.source, work.lab, work.evidence].filter(Boolean).length;
  useEffect(() => { localStorage.setItem(`rampage-work-${progressKey}`, JSON.stringify(work)); }, [progressKey, work]);
  const set = (patch: Partial<WorkState>) => setWork((value) => ({ ...value, ...patch }));
  const toggleStep = (key: "source" | "lab" | "evidence") => set({ [key]: !work[key] });
  const finish = async () => {
    mark(progressKey);
    if (isAuthenticated) {
      try {
        await completeLesson.mutateAsync({ courseId: course.id, lessonId: lesson.id });
        toast.success("Lesson synced to your Rampage account. Your next move is ready.");
      } catch {
        toast.error("Saved locally, but account sync failed. Try again when you are online.");
      }
    } else {
      toast.success("Lesson logged locally. Sign in later to sync progress and unlock certification.");
    }
  };
  return <Shell><main className="deep-lesson-page"><div className="lesson-breadcrumb"><Link href={`/course/${course.id}`}><ArrowLeft size={15} /> {course.title}</Link><span>/</span><span>{phase.title}</span><span>/</span><b>{lesson.title}</b></div><div className="lesson-console"><aside className="course-sidebar"><div className="course-sidebar-head"><span className="aside-label">COURSE CONSOLE</span><Link href={`/course/${course.id}`}><strong>{course.title}</strong><ArrowRight size={14} /></Link></div><div className="course-progress-line"><i style={{ width: `${Math.round((done.filter((id) => id.startsWith(`${course.id}:`)).length / Math.max(flatLessons.length, 1)) * 100)}%` }} /></div><span className="course-progress-copy">{done.filter((id) => id.startsWith(`${course.id}:`)).length}/{flatLessons.length} lessons complete</span><div className="course-outline">{course.phases.map((item) => <div key={item.id} className={item.id === phase.id ? "outline-phase is-current" : "outline-phase"}><span>{item.number}</span><div><b>{item.title}</b><small>{item.lessons.length} lessons</small></div>{item.lessons.every((lessonItem) => done.includes(`${course.id}:${lessonItem.id}`)) && <Check size={14} />}</div>)}</div><Link className="sidebar-path-link" href="/learn"><BookOpen size={14} /> My learning</Link></aside><article className="deep-lesson-main"><header className="deep-lesson-header"><div className="deep-lesson-kicker"><span>PHASE {phase.number}</span><span>/</span><span>{phase.title.toUpperCase()}</span><span className="lesson-kind">READ + LAB</span></div><h1>{lesson.title}</h1><p>{lesson.summary}</p><div className="lesson-meta-row"><span><ClockIcon /> {lesson.duration}</span><span><ScrollText size={14} /> {stepCount}/3 work steps</span><span><Flag size={14} /> {phase.project}</span></div></header><section className="source-first-panel"><div className="source-first-mark"><ShieldCheck size={20} /></div><div><span className="aside-label">SOURCE-FIRST LESSON</span><h2>Read the material. Then make it behave.</h2><p>This is not a video player. Open the original source, complete the small lab, and return here to record evidence. Your progress stays private in this browser.</p></div></section><section className="lesson-steps"><div className="step-heading"><div><span className="section-index">01 <span>/</span> WORKFLOW</span><h2>Three moves, one durable idea.</h2></div><span className="step-counter">{stepCount}/3 DONE</span></div><div className={work.source ? "work-step is-done" : "work-step"}><div className="work-step-number">01</div><div className="work-step-copy"><span className="aside-label"><BookOpen size={13} /> READ THE SOURCE</span><h3>Open the original material before you build.</h3><p>Use the source panel to choose the official course page, paper, repository, or documentation behind this lesson.</p><div className="source-chips">{lesson.resources.map((resource) => <a href={resource.url} target="_blank" rel="noreferrer" key={resource.label} onClick={() => set({ source: true })}><b>{resource.type}</b><span>{resource.label}</span><ExternalLink size={13} /></a>)}</div></div><button className="step-check" onClick={() => toggleStep("source")} aria-label="Mark source step complete">{work.source ? <Check size={16} /> : <span />}</button></div><div className={work.lab ? "work-step is-done" : "work-step"}><div className="work-step-number">02</div><div className="work-step-copy"><span className="aside-label"><Terminal size={13} /> RUN THE LAB</span><h3>{phase.project}</h3><p>Make the smallest working experiment. Prefer a trace, test, or failure you can explain over a large unfinished build.</p><div className="lab-brief"><div><Github size={14} /> LAB BRIEF</div><code>{lesson.id === "shell" ? "$ mkdir rampage-lab && cd rampage-lab\n$ printf 'signal acquired\\n'" : lesson.id === "riscv" ? "addi t0, zero, 42\njal ra, function\nret" : "make grade\n# inspect the failure\n# change one thing"}</code></div></div><button className="step-check" onClick={() => toggleStep("lab")} aria-label="Mark lab step complete">{work.lab ? <Check size={16} /> : <span />}</button></div><div className={work.evidence ? "work-step is-done" : "work-step"}><div className="work-step-number">03</div><div className="work-step-copy"><span className="aside-label"><MessageSquare size={13} /> WRITE THE EVIDENCE</span><h3>Leave one sentence for your future self.</h3><p>What did you observe? What failed? What will you change next? A tiny record turns a lab into a learning loop.</p><textarea value={work.note} maxLength={280} onChange={(event) => set({ note: event.target.value })} placeholder="Observed: ... / Next: ..." /><small>{work.note.length}/280 · saved privately</small></div><button className="step-check" onClick={() => toggleStep("evidence")} aria-label="Mark evidence step complete">{work.evidence ? <Check size={16} /> : <span />}</button></div></section><div className="lesson-bottom-actions"><button className={done.includes(progressKey) ? "complete-button completed" : "complete-button"} onClick={finish}>{done.includes(progressKey) ? <><Check size={16} /> Completed</> : <>Complete lesson <Check size={16} /></>}</button>{next && <Link className="next-lesson" href={`/course/${course.id}/lesson/${next.id}`}>Next: {next.title} <ArrowRight size={17} /></Link>}</div></article><aside className="deep-lesson-aside"><div className="aside-card source-card"><div className="aside-label"><Link2 size={15} /> SOURCE PANEL</div><p>Real material, opened directly from the original publisher or course site.</p>{lesson.resources.map((resource) => <a href={resource.url} target="_blank" rel="noreferrer" key={resource.label}><span><b>{resource.type}</b>{resource.source}</span><strong>{resource.label}</strong><ExternalLink size={14} /></a>)}</div><div className="aside-card"><div className="aside-label"><LockKeyhole size={15} /> YOUR PROGRESS</div><strong className="aside-progress-number">{stepCount}/3</strong><p>Work steps complete. Finish the evidence note before you close the loop.</p><Link className="project-link" href={`/course/${course.id}`}>View phase brief <ArrowRight size={15} /></Link></div><div className="lesson-jump">{previous && <Link href={`/course/${course.id}/lesson/${previous.id}`}><ArrowLeft size={14} /> Previous</Link>}<span>LESSON {String(lessonIndex + 1).padStart(2, "0")} / {flatLessons.length}</span></div></aside></div></main></Shell>;
}
function ClockIcon() { return <span className="clock-icon">◷</span>; }
