import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, Expand, LockKeyhole, ShieldCheck, Share2, TriangleAlert, Trophy } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { AuthLauncher } from "@/components/AuthModal";
import { courses } from "@/data/catalog";
import { publicFinalAssessmentBank } from "@shared/courseAssessmentPublic";
import { trpc } from "@/lib/trpc";
import { Shell } from "@/components/AcademyShell";
import { toast } from "sonner";

const ASSESSMENT_SECONDS = 15 * 60;
const formatClock = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.max(0, seconds % 60).toString().padStart(2, "0")}`;

export default function Assessment() {
  const [, params] = useRoute("/course/:courseId/assessment");
  const course = courses.find((item) => item.id === params?.courseId) || courses[0];
  const questions = publicFinalAssessmentBank[course.id] || [];
  const { isAuthenticated } = useAuth();
  const submit = trpc.learner.submitFinalAssessment.useMutation();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(ASSESSMENT_SECONDS);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [result, setResult] = useState<{ score: number; passed: boolean; xpAwarded?: number; review: Array<{ id: string; correctOption: number; explanation: string }> } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const autoSubmitted = useRef(false);
  const orderedQuestions = useMemo(() => [...questions], [course.id]);
  const active = startedAt !== null && !result;
  const currentQuestion = orderedQuestions[questionIndex];
  const answered = Object.keys(answers).length;
  const percent = orderedQuestions.length ? Math.round((answered / orderedQuestions.length) * 100) : 0;

  const enterSecureMode = async () => {
    if (!isAuthenticated) { toast.error("Sign in before starting a scored assessment."); return; }
    setIsStarting(true);
    try {
      await document.documentElement.requestFullscreen?.();
      setIsFullscreen(Boolean(document.fullscreenElement));
      setStartedAt(Date.now());
      setRemainingSeconds(ASSESSMENT_SECONDS);
      setQuestionIndex(0);
    } catch {
      toast.error("Full-screen mode is required for this assessment. Please allow it and try again.");
    } finally { setIsStarting(false); }
  };

  const submitAssessment = async (timedOut = false) => {
    if (!startedAt || autoSubmitted.current || Object.keys(answers).length < questions.length) {
      if (!timedOut && Object.keys(answers).length < questions.length) toast.error("Answer every question before submitting.");
      return;
    }
    autoSubmitted.current = true;
    try {
      const response = await submit.mutateAsync({ courseId: course.id, answers, startedAt, tabSwitches, fullscreenExits });
      setResult({ score: response.score, passed: response.passed, xpAwarded: response.xpAwarded, review: response.review });
      if (document.fullscreenElement) await document.exitFullscreen?.();
      toast[response.passed ? "success" : "error"](response.passed ? `Assessment passed. ${response.xpAwarded ? `+${response.xpAwarded} XP earned.` : "Certificate eligibility unlocked."}` : "Assessment not passed. Review the course and try again.");
    } catch (error) {
      autoSubmitted.current = false;
      toast.error(error instanceof Error ? error.message : "Assessment submission failed.");
    }
  };

  useEffect(() => {
    if (!active) return;
    const onVisibility = () => { if (document.hidden) setTabSwitches((count) => count + 1); };
    const onFullscreen = () => { const fullscreen = Boolean(document.fullscreenElement); setIsFullscreen(fullscreen); if (!fullscreen) setFullscreenExits((count) => count + 1); };
    const onBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    window.addEventListener("beforeunload", onBeforeUnload);
    const timer = window.setInterval(() => setRemainingSeconds((seconds) => {
      if (seconds <= 1) { window.clearInterval(timer); void submitAssessment(true); return 0; }
      return seconds - 1;
    }), 1000);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisibility); document.removeEventListener("fullscreenchange", onFullscreen); window.removeEventListener("beforeunload", onBeforeUnload); };
  }, [active, answers, startedAt, tabSwitches, fullscreenExits]);

  const chooseAnswer = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((current) => ({ ...current, [currentQuestion.id]: optionIndex }));
  };
  const goNext = () => { if (!currentQuestion || answers[currentQuestion.id] === undefined) { toast.error("Choose an answer before continuing."); return; } setQuestionIndex((index) => Math.min(index + 1, orderedQuestions.length - 1)); };
  const goPrevious = () => setQuestionIndex((index) => Math.max(0, index - 1));
  const shareScore = async () => {
    const shareText = `${course.title} assessment: ${result?.score ?? 0}% ${result?.passed ? "passed" : "reviewing"} · BlackVault Rampage`;
    try {
      if (navigator.share) await navigator.share({ title: `${course.title} / Rampage result`, text: shareText, url: window.location.href });
      else { await navigator.clipboard.writeText(`${shareText} — ${window.location.href}`); toast.success("Scorecard link copied."); }
    } catch { toast.error("Share cancelled."); }
  };

  return <Shell><main className={`assessment-page ${active ? "assessment-live" : ""}`}><div className="assessment-breadcrumb"><Link href={`/course/${course.id}`}><ArrowLeft size={15} /> Back to course</Link><span>/ FINAL ASSESSMENT</span></div><section className="assessment-hero"><span className="section-index"><Trophy size={14} /> COURSE GATE</span><h1>Prove the system.<br /><em>Earn the record.</em></h1><p>{course.title} ends with a timed, server-scored assessment. This is a Rampage learning record, not a legal credential or accreditation.</p><div className="assessment-meta"><span><Clock3 size={15} /> 15 minute window</span><span><ShieldCheck size={15} /> Server-scored</span><span><LockKeyhole size={15} /> Login required</span></div></section>{!isAuthenticated ? <section className="assessment-lock"><LockKeyhole size={22} /><div><h2>Sign in to begin</h2><p>Your attempt, score, integrity signals, and certificate eligibility must be tied to an authenticated Rampage learner account.</p></div><AuthLauncher redirect={typeof window === "undefined" ? "/learn" : window.location.pathname}><span>Sign in securely</span><ArrowRight size={16} /></AuthLauncher></section> : !active && !result ? <section className="assessment-preflight"><div className="preflight-grid"><div><span className="aside-label">SECURE TEST ROOM / READY</span><h2>One focused pass.</h2><p>Enter to answer one question at a time in full-screen mode. Your timer starts immediately. Leaving the tab or full-screen mode is recorded as an integrity signal for the attempt.</p></div><div className="preflight-checks"><span><Check size={15} /> {questions.length} verified questions</span><span><Check size={15} /> 15:00 timed window</span><span><Check size={15} /> 3 daily attempts</span><span><Check size={15} /> +200 XP on first pass</span></div></div><button className="complete-button assessment-start" onClick={() => void enterSecureMode()} disabled={isStarting}><Expand size={16} /> {isStarting ? "Opening secure room…" : "Start final assessment"}</button></section> : result ? <section className={`assessment-result-panel ${result.passed ? "passed" : "retry"}`}><span className="section-index">FINAL SCORE / {result.passed ? "PASS RECORDED" : "REVIEW REQUIRED"}</span><strong>{result.score}%</strong><h2>{result.passed ? "The record is earned." : "The system needs another pass."}</h2><p>{result.passed ? `Your server-verified assessment passed${result.xpAwarded ? ` and awarded ${result.xpAwarded} XP` : ""}. You can now request the Rampage digital certificate.` : "Your attempt is recorded. Review the course, then return for another focused pass during the available assessment window."}</p><div className="score-card-grid"><span><b>{answered}/{orderedQuestions.length}</b> answers recorded</span><span><b>{formatClock(ASSESSMENT_SECONDS - remainingSeconds)}</b> time used</span><span><b>{tabSwitches + fullscreenExits}</b> integrity signals</span></div><div className="score-review"><span className="aside-label">REVIEW / WHY IT MATTERS</span>{result.review.filter((item) => answers[item.id] !== item.correctOption).length ? result.review.filter((item) => answers[item.id] !== item.correctOption).map((item) => <article key={item.id}><strong>Question {String(orderedQuestions.findIndex((question) => question.id === item.id) + 1).padStart(2, "0")}</strong><p>{item.explanation}</p></article>) : <p className="score-review-clear"><Check size={15} /> No incorrect answers to review. Keep the evidence trail.</p>}</div><div className="assessment-result-actions"><button className="text-cta" onClick={() => void shareScore()}><Share2 size={15} /> Share scorecard</button>{result.passed ? <Link className="complete-button" href={`/certificate/${course.id}`}>Open certificate gate <Trophy size={15} /></Link> : <Link className="text-cta" href={`/course/${course.id}`}>Review course <ArrowLeft size={15} /></Link>}</div></section> : <section className="assessment-console"><header className="assessment-livebar"><div><span className="aside-label">SECURE TEST ROOM / {course.title}</span><strong>QUESTION {String(questionIndex + 1).padStart(2, "0")} / {orderedQuestions.length}</strong></div><div className={`assessment-clock ${remainingSeconds <= 60 ? "danger" : ""}`}><Clock3 size={16} /> {formatClock(remainingSeconds)}</div></header><div className="assessment-progress-summary"><div><b>{percent}%</b><span>{answered} of {orderedQuestions.length} answered</span></div><div className="assessment-progress-track"><i style={{ width: `${percent}%` }} /></div></div><div className="assessment-integrity"><span><ShieldCheck size={14} /> Full-screen {isFullscreen ? "active" : "required"}</span>{tabSwitches > 0 && <span><TriangleAlert size={14} /> {tabSwitches} tab switch{tabSwitches > 1 ? "es" : ""} recorded</span>}{fullscreenExits > 0 && <span><TriangleAlert size={14} /> {fullscreenExits} full-screen exit{fullscreenExits > 1 ? "s" : ""} recorded</span>}</div>{currentQuestion && <fieldset className="assessment-question assessment-question--active"><legend><span>{String(questionIndex + 1).padStart(2, "0")}</span>{currentQuestion.prompt}</legend>{currentQuestion.options.map((option, optionIndex) => <label key={option} className={answers[currentQuestion.id] === optionIndex ? "is-selected" : ""}><input type="radio" name={currentQuestion.id} checked={answers[currentQuestion.id] === optionIndex} onChange={() => chooseAnswer(optionIndex)} /><span>{option}</span></label>)}</fieldset>}<div className="assessment-step-nav"><button className="text-cta" onClick={goPrevious} disabled={questionIndex === 0}><ArrowLeft size={15} /> Previous</button>{questionIndex < orderedQuestions.length - 1 ? <button className="complete-button" onClick={goNext}>Save answer & next <ArrowRight size={16} /></button> : <button className="complete-button" onClick={() => void submitAssessment()} disabled={submit.isPending || answered < orderedQuestions.length}>{submit.isPending ? "Scoring…" : "Review answers & submit"} <Check size={16} /></button>}</div><p className="assessment-submit-note">One question at a time keeps the room focused. Your answers remain private in this session until the server scores the completed attempt.</p></section>}</main></Shell>;
}
