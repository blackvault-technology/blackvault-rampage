import { useMemo, useState } from "react";
import { ArrowLeft, Check, LockKeyhole, ShieldCheck, Timer, Trophy } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { courses } from "@/data/catalog";
import { publicFinalAssessmentBank } from "@shared/courseAssessmentPublic";
import { trpc } from "@/lib/trpc";
import { Shell } from "@/components/AcademyShell";
import { toast } from "sonner";

export default function Assessment() {
  const [, params] = useRoute("/course/:courseId/assessment");
  const course = courses.find((item) => item.id === params?.courseId) || courses[0];
  const questions = publicFinalAssessmentBank[course.id] || [];
  const { isAuthenticated } = useAuth();
  const submit = trpc.learner.submitFinalAssessment.useMutation();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startedAt] = useState(() => Date.now());
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const orderedQuestions = useMemo(() => [...questions].sort(() => 0.5 - Math.random()), [course.id]);
  const submitAssessment = async () => {
    if (!isAuthenticated) { toast.error("Sign in before starting a scored assessment."); return; }
    if (Object.keys(answers).length < questions.length) { toast.error("Answer every question before submitting."); return; }
    try {
      const response = await submit.mutateAsync({ courseId: course.id, answers, startedAt, tabSwitches: 0, fullscreenExits: 0 });
      setResult({ score: response.score, passed: response.passed });
      toast[response.passed ? "success" : "error"](response.passed ? "Assessment passed. Your certificate is now eligible." : "Assessment not passed. Review the course and try again.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Assessment submission failed."); }
  };
  return <Shell><main className="assessment-page"><div className="assessment-breadcrumb"><Link href={`/course/${course.id}`}><ArrowLeft size={15} /> Back to course</Link><span>/ FINAL ASSESSMENT</span></div><section className="assessment-hero"><span className="section-index"><Trophy size={14} /> COURSE GATE</span><h1>Prove the system, then earn the record.</h1><p>{course.title} ends with a short, server-scored assessment. It is not a legal credential or accreditation; it is a Rampage learning record unlocked by verified course completion.</p><div className="assessment-meta"><span><Timer size={15} /> 5 questions</span><span><ShieldCheck size={15} /> Server-scored</span><span><LockKeyhole size={15} /> Login required</span></div></section>{!isAuthenticated ? <section className="assessment-lock"><LockKeyhole size={22} /><div><h2>Sign in to begin</h2><p>Your attempt, score, and certificate eligibility must be tied to an authenticated Rampage learner account.</p></div><button className="complete-button" onClick={() => startLogin()}>Sign in securely</button></section> : <section className="assessment-console"><div className="assessment-console-head"><div><span className="aside-label">FINAL TEST / {course.title}</span><h2>One careful pass.</h2></div><span>{Object.keys(answers).length}/{questions.length} answered</span></div>{orderedQuestions.map((question, index) => <fieldset className="assessment-question" key={question.id}><legend><span>{String(index + 1).padStart(2, "0")}</span>{question.prompt}</legend>{question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /><span>{option}</span></label>)}</fieldset>)}<div className="assessment-submit"><button className="complete-button" onClick={() => void submitAssessment()} disabled={submit.isPending}>{submit.isPending ? "Scoring…" : "Submit final assessment"} <Check size={16} /></button>{result && <div className={result.passed ? "assessment-result passed" : "assessment-result"}><strong>{result.score}%</strong><span>{result.passed ? "Passed. Request your certificate from the course page." : "Not passed yet. Your course remains available for review."}</span>{result.passed && <Link href={`/certificate/${course.id}`}>Open certificate <Trophy size={14} /></Link>}</div>}</div></section>}</main></Shell>;
}
