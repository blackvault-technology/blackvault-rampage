import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Flag,
  Github,
  Link2,
  ListChecks,
  LockKeyhole,
  MessageSquare,
  MonitorUp,
  Play,
  ShieldCheck,
  Terminal,
  Trophy,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { courses, findLesson, findPhase, type Resource } from "@/data/catalog";
import { canStudyInline, classifyInlineSource, getVerifiedPractice, sourceHost } from "@/data/learningSources";
import { Shell } from "@/components/AcademyShell";
import { useProgress } from "@/hooks/useProgress";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { chapterQuizBank } from "@shared/courseAssessments";
import { Reveal } from "@/components/MotionPrimitives";

type WorkState = { source: boolean; lab: boolean; evidence: boolean; note: string };
const blankWork: WorkState = { source: false, lab: false, evidence: false, note: "" };

function getWork(key: string): WorkState {
  try { return { ...blankWork, ...JSON.parse(localStorage.getItem(`rampage-work-${key}`) || "{}") }; }
  catch { return blankWork; }
}

function SourceBadge({ resource }: { resource: Resource }) {
  const type = classifyInlineSource(resource.url);
  return <span className={`embedded-source-badge embedded-source-badge--${type}`}>{type === "pdf" ? "PDF" : type === "web" ? "INLINE" : type === "repository" ? "REPO" : type === "video" ? "VIDEO" : "LINK"}</span>;
}

function SourceStudio({
  lessonTitle,
  resources,
  selectedResource,
  onSelect,
  onOpenOriginal,
}: {
  lessonTitle: string;
  resources: Resource[];
  selectedResource: Resource;
  onSelect: (resource: Resource) => void;
  onOpenOriginal: () => void;
}) {
  const inline = canStudyInline(selectedResource.url);
  const kind = classifyInlineSource(selectedResource.url);
  const isPdf = kind === "pdf";

  return <section className="embedded-source-studio" aria-label="Embedded source study panel">
    <header className="embedded-source-studio__head">
      <div>
        <span className="aside-label"><BookOpen size={13} /> STUDY THE PRIMARY SOURCE</span>
        <h2>Stay with the material, not another tab.</h2>
        <p>Select an official reading, paper, or course page. Compatible sources open here; your source checkpoint is preserved as you learn.</p>
      </div>
      <div className="embedded-source-studio__state"><MonitorUp size={15} /> {inline ? "INLINE READING" : "SOURCE LINK"}</div>
    </header>

    <div className="embedded-source-picker" role="list" aria-label="Lesson sources">
      {resources.map((resource) => {
        const active = resource.url === selectedResource.url && resource.label === selectedResource.label;
        return <button type="button" role="listitem" key={`${resource.label}-${resource.url}`} className={active ? "is-active" : ""} onClick={() => onSelect(resource)}>
          <span><SourceBadge resource={resource} /><small>{resource.source}</small></span>
          <strong>{resource.label}</strong>
          <em>{canStudyInline(resource.url) ? "Study here" : "Publisher link"}</em>
        </button>;
      })}
    </div>

    <div className="embedded-source-viewer">
      <div className="embedded-source-viewer__bar">
        <span><SourceBadge resource={selectedResource} /> {sourceHost(selectedResource.url)}</span>
        <div>
          {selectedResource.readingFocus && <small>{selectedResource.readingFocus}</small>}
          <a href={selectedResource.url} target="_blank" rel="noreferrer" onClick={onOpenOriginal}>Open original <ExternalLink size={13} /></a>
        </div>
      </div>
      {inline ? <iframe
        title={`${selectedResource.label} — embedded source for ${lessonTitle}`}
        src={isPdf ? `${selectedResource.url}${selectedResource.url.includes("#") ? "" : "#view=FitH"}` : selectedResource.url}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="clipboard-read; clipboard-write"
      /> : <div className="embedded-source-viewer__fallback">
        <Link2 size={22} />
        <div>
          <span className="aside-label">PUBLISHER-LINKED SOURCE</span>
          <h3>This publisher does not allow a stable inline reader.</h3>
          <p>Rampage keeps the source context, practice brief, and your learning record here. Use the original only when the publisher’s own policy requires it.</p>
        </div>
        <a className="complete-button" href={selectedResource.url} target="_blank" rel="noreferrer" onClick={onOpenOriginal}>Open source <ExternalLink size={15} /></a>
      </div>}
    </div>
  </section>;
}

export default function Lesson() {
  const [, params] = useRoute("/course/:courseId/lesson/:lessonId");
  const course = courses.find((item) => item.id === params?.courseId) || courses[0];
  const lesson = findLesson(course.id, params?.lessonId || "") || course.phases[0].lessons[0];
  const phase = course.phases.find((item) => item.lessons.some((item) => item.id === lesson.id)) || findPhase(course.id, course.phases[0].id)!;
  const { done, mark } = useProgress();
  const { isAuthenticated } = useAuth();
  const completeLesson = trpc.learner.completeLesson.useMutation();
  const saveTimeline = trpc.learner.saveTimeline.useMutation();
  const completeChapter = trpc.learner.completeChapter.useMutation();
  const submitQuiz = trpc.learner.submitQuiz.useMutation();
  const saveWorkflow = trpc.learner.saveLessonWorkflow.useMutation();
  const learnerState = trpc.learner.state.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const progressKey = `${course.id}:${lesson.id}`;
  const [work, setWork] = useState<WorkState>(() => getWork(progressKey));
  const [currentSecond, setCurrentSecond] = useState(() => Number(localStorage.getItem(`rampage-timeline-${progressKey}`) || 0));
  const [selectedSource, setSelectedSource] = useState<Resource>(() => lesson.resources[0]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [quizStartedAt] = useState(() => Date.now());
  const [quizTabSwitches, setQuizTabSwitches] = useState(0);
  const [quizFullscreenExits, setQuizFullscreenExits] = useState(0);
  const quizQuestions = chapterQuizBank[course.id] ?? [];
  const practice = getVerifiedPractice(phase.id, phase.title);
  const flatLessons = useMemo(() => course.phases.flatMap((item) => item.lessons.map((lessonItem) => ({ ...lessonItem, phaseId: item.id, phaseTitle: item.title }))), [course]);
  const lessonIndex = flatLessons.findIndex((item) => item.id === lesson.id);
  const next = flatLessons[lessonIndex + 1];
  const previous = flatLessons[lessonIndex - 1];
  const stepCount = [work.source, work.lab, work.evidence].filter(Boolean).length;
  const timelineDurationSeconds = Math.max((Number.parseInt(lesson.duration, 10) || 3) * 60, 60);
  const timelinePercent = Math.min(Math.round((currentSecond / timelineDurationSeconds) * 100), 100);
  const activeQuizQuestion = quizQuestions[quizQuestionIndex];
  const quizAnswered = Object.keys(quizAnswers).length;
  const quizProgressPercent = quizQuestions.length ? Math.round((quizAnswered / quizQuestions.length) * 100) : 0;

  useEffect(() => { setSelectedSource(lesson.resources[0]); setQuizAnswers({}); setQuizQuestionIndex(0); setQuizResult(null); }, [lesson.id]);
  useEffect(() => { localStorage.setItem(`rampage-work-${progressKey}`, JSON.stringify(work)); }, [progressKey, work]);
  useEffect(() => { localStorage.setItem(`rampage-timeline-${progressKey}`, String(currentSecond)); }, [progressKey, currentSecond]);
  useEffect(() => {
    const serverWork = learnerState.data?.lessonState?.find((item) => item.courseId === course.id && item.lessonId === lesson.id);
    if (serverWork) setWork({ source: serverWork.sourceComplete === 1, lab: serverWork.labComplete === 1, evidence: serverWork.evidenceComplete === 1, note: serverWork.evidenceNote ?? "" });
  }, [course.id, learnerState.data, lesson.id]);
  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState === "hidden") setQuizTabSwitches((value) => value + 1); };
    const onFullscreen = () => { if (!document.fullscreenElement) setQuizFullscreenExits((value) => value + 1); };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => { document.removeEventListener("visibilitychange", onVisibility); document.removeEventListener("fullscreenchange", onFullscreen); };
  }, []);

  const persistWorkflow = async (nextWork: WorkState, second = currentSecond) => {
    if (!isAuthenticated) return;
    try {
      await saveWorkflow.mutateAsync({ courseId: course.id, lessonId: lesson.id, currentSecond: second, durationSecond: Math.max(second, 1), sourceComplete: nextWork.source, labComplete: nextWork.lab, evidenceComplete: nextWork.evidence, evidenceNote: nextWork.note });
      void learnerState.refetch();
    } catch { toast.error("Your checkpoint could not sync to Neon. It remains saved locally; try again when online."); }
  };
  const set = (patch: Partial<WorkState>) => {
    const nextWork = { ...work, ...patch };
    setWork(nextWork);
    void persistWorkflow(nextWork);
  };
  const saveStudyPosition = async (value: number) => {
    setCurrentSecond(value);
    if (isAuthenticated) {
      try { await saveTimeline.mutateAsync({ courseId: course.id, lessonId: lesson.id, currentSecond: value, durationSecond: timelineDurationSeconds }); }
      catch { /* The local resume point remains available offline. */ }
    }
  };
  const chooseSource = (resource: Resource) => { setSelectedSource(resource); if (!work.source) set({ source: true }); };
  const submitLessonQuiz = async () => {
    if (quizQuestions.length === 0 || quizAnswered < quizQuestions.length) { toast.error("Answer every checkpoint question first."); return; }
    if (!isAuthenticated) { toast.error("Sign in to submit a scored quiz and sync your result."); return; }
    try {
      const result = await submitQuiz.mutateAsync({ courseId: course.id, chapterId: phase.id, lessonId: lesson.id, answers: quizAnswers, startedAt: quizStartedAt, tabSwitches: quizTabSwitches, fullscreenExits: quizFullscreenExits });
      setQuizResult({ score: result.score, passed: result.passed });
      toast[result.passed ? "success" : "error"](result.passed ? "Checkpoint passed." : "Review the source and try again.");
    } catch { toast.error("The quiz could not be submitted. Try again when you are online."); }
  };
  const finishChapter = async () => {
    if (!isAuthenticated) { toast.error("Sign in to record chapter completion."); return; }
    try { await completeChapter.mutateAsync({ courseId: course.id, chapterId: phase.id, lessonIds: phase.lessons.map(item => item.id) }); toast.success("Chapter complete. Continue to the next phase."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Complete every lesson first."); }
  };
  const finishLesson = async () => {
    mark(progressKey);
    if (!isAuthenticated) { toast.success("Lesson logged locally. Sign in later to sync progress and unlock certification."); return; }
    try { await completeLesson.mutateAsync({ courseId: course.id, lessonId: lesson.id }); toast.success("Lesson synced to your Rampage account. Your next move is ready."); }
    catch { toast.error("Saved locally, but account sync failed. Try again when you are online."); }
  };

  return <Shell><main className="deep-lesson-page">
    <div className="lesson-breadcrumb"><Link href={`/course/${course.id}`}><ArrowLeft size={15} /> {course.title}</Link><span>/</span><span>{phase.title}</span><span>/</span><b>{lesson.title}</b></div>
    <div className="lesson-console">
      <Reveal className="lesson-reveal lesson-reveal--left"><aside className="course-sidebar">
        <div className="course-sidebar-head"><span className="aside-label">COURSE CONSOLE</span><Link href={`/course/${course.id}`}><strong>{course.title}</strong><ArrowRight size={14} /></Link></div>
        <div className="course-progress-line"><i style={{ width: `${Math.round((done.filter((id) => id.startsWith(`${course.id}:`)).length / Math.max(flatLessons.length, 1)) * 100)}%` }} /></div>
        <span className="course-progress-copy">{done.filter((id) => id.startsWith(`${course.id}:`)).length}/{flatLessons.length} lessons complete</span>
        <div className="course-outline">{course.phases.map((item) => <div key={item.id} className={item.id === phase.id ? "outline-phase is-current" : "outline-phase"}><span>{item.number}</span><div><b>{item.title}</b><small>{item.lessons.length} lessons</small></div>{item.lessons.every((lessonItem) => done.includes(`${course.id}:${lessonItem.id}`)) && <Check size={14} />}</div>)}</div>
        <Link className="sidebar-path-link" href="/learn"><BookOpen size={14} /> My learning</Link>
      </aside></Reveal>

      <Reveal className="lesson-reveal lesson-reveal--main"><article className="deep-lesson-main">
        <header className="deep-lesson-header">
          <div className="deep-lesson-kicker"><span>PHASE {phase.number}</span><span>/</span><span>{phase.title.toUpperCase()}</span><span className="lesson-kind">{lesson.video ? "VIDEO + SOURCE" : "SOURCE + PRACTICE"}</span></div>
          <h1>{lesson.title}</h1><p>{lesson.summary}</p>
          <div className="lesson-meta-row"><span><Clock3 size={14} /> {lesson.duration}</span><span><ShieldCheck size={14} /> {stepCount}/3 learning record</span><span><Flag size={14} /> {phase.project}</span></div>
        </header>

        <div className="lesson-command-rail"><div><span>LESSON {String(lessonIndex + 1).padStart(2, "0")} / {flatLessons.length}</span><strong>{lesson.video ? "WATCH + STUDY" : "STUDY + PRACTICE"}</strong></div><div><span>VERIFIED PRACTICE</span><strong>{practice.label.toUpperCase()}</strong></div><div className="lesson-command-next"><span>NEXT MOVE</span><strong>{next ? next.title : "Final assessment"}</strong></div></div>

        {lesson.video && <section className="lesson-media-stage"><div className="lesson-media-frame"><iframe src={lesson.video} title={lesson.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><div className="lesson-media-meta"><div><span className="aside-label">OPTIONAL CONTEXT / VERIFIED VIDEO</span><strong>{lesson.videoLabel || "Official lesson video"}</strong><small>Video supports the primary reading and practice rather than replacing them.</small></div><span className="lesson-media-signal"><Play size={14} /> VIDEO SOURCE</span></div></section>}

        <div className="lesson-flow-strip"><span><b>01</b> STUDY</span><span><b>02</b> PRACTICE</span><span><b>03</b> EVIDENCE</span><strong>{stepCount === 3 ? "Ready to complete this lesson" : `${3 - stepCount} work step${3 - stepCount === 1 ? "" : "s"} before the lesson closes`}</strong></div>

        <SourceStudio lessonTitle={lesson.title} resources={lesson.resources} selectedResource={selectedSource} onSelect={chooseSource} onOpenOriginal={() => { if (!work.source) set({ source: true }); }} />

        <section className="study-resume-card">
          <div><span className="aside-label"><Clock3 size={13} /> CONTINUE FROM YOUR TIMELINE</span><h2>{currentSecond > 0 ? "Your study checkpoint is ready." : "Set a deliberate study checkpoint."}</h2><p>{isAuthenticated ? "This point syncs to your Rampage account and stays available locally." : "This point is saved privately in this browser. Sign in to carry it between devices."}</p></div>
          <div className="study-resume-card__control"><strong>{Math.floor(currentSecond / 60)} min <small>· {timelinePercent}% of planned study</small></strong><input aria-label="Study timeline checkpoint" type="range" min="0" max={timelineDurationSeconds} value={Math.min(currentSecond, timelineDurationSeconds)} onChange={(event) => void saveStudyPosition(Number(event.target.value))} /><button type="button" className="text-cta" onClick={() => void saveStudyPosition(Math.min(currentSecond + 300, timelineDurationSeconds))}>Save +5 min <ChevronRight size={14} /></button></div>
        </section>

        <section className="lesson-steps">
          <div className="step-heading"><div><span className="section-index">01 <span>/</span> VERIFIED WORKFLOW</span><h2>One source, one bounded practice, one durable observation.</h2></div><span className="step-counter">{stepCount}/3 DONE</span></div>
          <div className={work.source ? "work-step is-done" : "work-step"}><div className="work-step-number">01</div><div className="work-step-copy"><span className="aside-label"><BookOpen size={13} /> STUDY THE SOURCE</span><h3>{selectedSource.label}</h3><p>{selectedSource.readingFocus || `Study the original ${selectedSource.source} material in the inline reader above before moving into the practice brief.`}</p><button type="button" className="source-continue-button" onClick={() => document.querySelector(".embedded-source-studio")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Return to source studio <ArrowRight size={14} /></button></div><button className="step-check" onClick={() => set({ source: !work.source })} aria-label="Mark source step complete">{work.source ? <Check size={16} /> : <span />}</button></div>
          <div className={work.lab ? "work-step is-done" : "work-step"}><div className="work-step-number">02</div><div className="work-step-copy"><span className="aside-label"><Terminal size={13} /> VERIFIED PRACTICE</span><h3>{practice.label}</h3><p>{practice.objective}</p><div className="verified-practice-brief"><div><Github size={14} /> SOURCE: <a href={practice.sourceUrl} target="_blank" rel="noreferrer">{practice.source} <ExternalLink size={12} /></a></div><ol>{practice.steps.map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, "0")}</b>{step}</li>)}</ol>{practice.safetyNote && <small><ShieldCheck size={13} /> {practice.safetyNote}</small>}</div></div><button className="step-check" onClick={() => set({ lab: !work.lab })} aria-label="Mark practice step complete">{work.lab ? <Check size={16} /> : <span />}</button></div>
          <div className={work.evidence ? "work-step is-done" : "work-step"}><div className="work-step-number">03</div><div className="work-step-copy"><span className="aside-label"><MessageSquare size={13} /> WRITE THE EVIDENCE</span><h3>Record one thing the source or practice made observable.</h3><p>{practice.evidencePrompt}</p><textarea value={work.note} maxLength={280} onChange={(event) => setWork((value) => ({ ...value, note: event.target.value }))} onBlur={() => void persistWorkflow(work)} placeholder="Observed: ... / Next: ..." /><small>{work.note.length}/280 · {isAuthenticated ? "syncs to your account" : "saved locally; sign in to sync"}</small></div><button className="step-check" onClick={() => set({ evidence: !work.evidence })} aria-label="Mark evidence step complete">{work.evidence ? <Check size={16} /> : <span />}</button></div>
        </section>

        <section className="lesson-quiz-panel"><div className="checkpoint-card-head"><div><span className="aside-label"><ListChecks size={13} /> KNOWLEDGE CHECK</span><h3>Prove the idea before you move on.</h3></div><strong className="quiz-state-label">{quizQuestions.length ? `${quizAnswered}/${quizQuestions.length} ANSWERED` : "SOURCE-LED"}</strong></div>{quizQuestions.length ? <>{quizResult ? <div className={`lesson-quiz-scorecard ${quizResult.passed ? "passed" : "retry"}`}><span className="aside-label">CHECKPOINT SCORE / {quizResult.passed ? "PASSED" : "RETRY AVAILABLE"}</span><strong>{quizResult.score}%</strong><p>{quizResult.passed ? "The lesson concept is recorded. Continue to the next lesson." : "Review the embedded source, then take another focused pass."}</p><button className="text-cta" onClick={() => { setQuizResult(null); setQuizAnswers({}); setQuizQuestionIndex(0); }}>Retry checkpoint <ArrowRight size={15} /></button></div> : <><p className="quiz-instruction">Start a short, one-question-at-a-time check. Rampage scores completed checkpoints server-side when you are signed in.</p><div className="quiz-progress"><i style={{ width: `${quizProgressPercent}%` }} /></div><div className="quiz-step-label"><span>QUESTION {String(quizQuestionIndex + 1).padStart(2, "0")} / {quizQuestions.length}</span><b>{quizAnswered}/{quizQuestions.length} answered</b></div>{activeQuizQuestion && <fieldset className="quiz-question quiz-question--active"><legend><span>{String(quizQuestionIndex + 1).padStart(2, "0")}</span>{activeQuizQuestion.prompt}</legend>{activeQuizQuestion.options.map((option, optionIndex) => <label key={option} className={quizAnswers[activeQuizQuestion.id] === optionIndex ? "is-selected" : ""}><input type="radio" name={activeQuizQuestion.id} checked={quizAnswers[activeQuizQuestion.id] === optionIndex} onChange={() => setQuizAnswers((answers) => ({ ...answers, [activeQuizQuestion.id]: optionIndex }))} /> <span>{option}</span></label>)}</fieldset>}<div className="quiz-actions"><button className="text-cta" onClick={() => setQuizQuestionIndex((index) => Math.max(0, index - 1))} disabled={quizQuestionIndex === 0}><ArrowLeft size={15} /> Previous</button>{quizQuestionIndex < quizQuestions.length - 1 ? <button className="complete-button" onClick={() => { if (quizAnswers[activeQuizQuestion?.id || ""] === undefined) { toast.error("Choose an answer before continuing."); return; } setQuizQuestionIndex((index) => index + 1); }}>Save answer & next <ArrowRight size={15} /></button> : <button className="complete-button" onClick={() => void submitLessonQuiz()} disabled={submitQuiz.isPending || quizAnswered < quizQuestions.length}><ListChecks size={16} /> {submitQuiz.isPending ? "Scoring…" : "Review answers & submit"}</button>}</div></>}</> : <p className="empty-state">This lesson is source-and-practice led. The course assessment covers the verified concepts at the end.</p>}</section>

        <div className="lesson-bottom-actions"><button className="chapter-complete-button" onClick={() => void finishChapter()}><Trophy size={16} /> Complete chapter</button><button className={done.includes(progressKey) ? "complete-button completed" : "complete-button"} onClick={() => void finishLesson()}>{done.includes(progressKey) ? <><Check size={16} /> Completed</> : <>Complete lesson <Check size={16} /></>}</button>{next ? <Link className="next-lesson" href={`/course/${course.id}/lesson/${next.id}`}>Next: {next.title} <ArrowRight size={17} /></Link> : <div className="final-handoff"><Link className="next-lesson next-lesson--assessment" href={`/course/${course.id}/assessment`}><Trophy size={16} /> Final assessment <ArrowRight size={17} /></Link><small>Pass the assessment to unlock your Rampage digital certificate.</small></div>}</div>
      </article></Reveal>

      <Reveal className="lesson-reveal lesson-reveal--right"><aside className="deep-lesson-aside"><div className="aside-card source-card"><div className="aside-label"><Link2 size={15} /> ACTIVE SOURCE</div><p>Official material stays inside the lesson whenever the publisher allows it.</p><button type="button" className="active-source-card" onClick={() => document.querySelector(".embedded-source-studio")?.scrollIntoView({ behavior: "smooth", block: "start" })}><span><SourceBadge resource={selectedSource} /> {selectedSource.source}</span><strong>{selectedSource.label}</strong><ArrowRight size={14} /></button></div><div className="aside-card"><div className="aside-label"><LockKeyhole size={15} /> YOUR PROGRESS</div><strong className="aside-progress-number">{stepCount}/3</strong><p>Study, practice, and evidence are one durable learning record.</p><Link className="project-link" href={`/course/${course.id}`}>View phase brief <ArrowRight size={15} /></Link></div><div className="aside-card practice-aside-card"><div className="aside-label"><Terminal size={15} /> PRACTICE STANDARD</div><p>{practice.objective}</p><a href={practice.sourceUrl} target="_blank" rel="noreferrer">Verify source <ExternalLink size={14} /></a></div><div className="lesson-jump">{previous && <Link href={`/course/${course.id}/lesson/${previous.id}`}><ArrowLeft size={14} /> Previous</Link>}<span>LESSON {String(lessonIndex + 1).padStart(2, "0")} / {flatLessons.length}</span></div></aside></Reveal>
    </div>
  </main></Shell>;
}
