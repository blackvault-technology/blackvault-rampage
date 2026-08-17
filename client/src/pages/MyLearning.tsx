// My Learning dashboard: one calm home base for progress, saved paths, and private reading state.
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Bookmark, Check, Clock3, Compass, FileText, Highlighter, Play, Sparkles, Zap } from "lucide-react";
import { Link } from "wouter";
import { courses, pdfCatalog } from "@/data/catalog";
import { learningPaths } from "@/data/paths";
import { Shell, useProgress } from "@/components/AcademyShell";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type ReaderSnapshot = { id: string; page: string; bookmarks: string[]; highlights: string[]; note: string; read: boolean };

function readSnapshots(): ReaderSnapshot[] {
  const snapshots: ReaderSnapshot[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith("rampage-reader-")) continue;
    try {
      const id = key.replace("rampage-reader-", "");
      snapshots.push({ id, page: "1", bookmarks: [], highlights: [], note: "", read: false, ...JSON.parse(localStorage.getItem(key) || "{}") });
    } catch { /* Ignore malformed private browser state. */ }
  }
  return snapshots;
}

function courseStats(course: (typeof courses)[number], done: string[]) {
  const lessonIds = course.phases.flatMap((phase) => phase.lessons.map((lesson) => `${course.id}:${lesson.id}`));
  const completed = lessonIds.filter((id) => done.includes(id)).length;
  const nextLesson = course.phases.flatMap((phase) => phase.lessons.map((lesson) => ({ ...lesson, phase: phase.title }))).find((lesson) => !done.includes(`${course.id}:${lesson.id}`));
  return { completed, total: lessonIds.length, percent: lessonIds.length ? Math.round((completed / lessonIds.length) * 100) : 0, nextLesson };
}

export default function MyLearning() {
  const { done: localDone } = useProgress();
  const { isAuthenticated } = useAuth();
  const learnerState = trpc.learner.state.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const [snapshots, setSnapshots] = useState<ReaderSnapshot[]>([]);
  useEffect(() => { setSnapshots(readSnapshots()); }, []);
  const done = useMemo(() => learnerState.data?.progress.map(item => `${item.courseId}:${item.lessonId}`) ?? localDone, [learnerState.data, localDone]);
  const serverSnapshots = useMemo(() => learnerState.data?.readerState.map(item => ({ id: item.resourceId, page: String(item.currentPage), bookmarks: [], highlights: [], note: item.note ?? "", read: Number(item.progressPercent) >= 100 })) ?? [], [learnerState.data]);
  const visibleSnapshots = isAuthenticated && learnerState.data ? serverSnapshots : snapshots;
  const stats = useMemo(() => courses.filter((course) => course.phases.length).map((course) => ({ course, ...courseStats(course, done) })), [done]);
  const active = stats.find((item) => item.completed > 0 && item.completed < item.total) || stats.find((item) => item.course.id === "ai-systems") || stats[0];
  const reading = visibleSnapshots.map((snapshot) => ({ snapshot, item: pdfCatalog.find((resource) => resource.id === snapshot.id) })).filter((entry) => entry.item).sort((a, b) => Number(b.snapshot.read) - Number(a.snapshot.read));
  const totalCompleted = stats.reduce((sum, item) => sum + item.completed, 0);
  const totalLessons = stats.reduce((sum, item) => sum + item.total, 0);
  const savedPages = isAuthenticated && learnerState.data ? learnerState.data.bookmarks.length : snapshots.reduce((sum, item) => sum + item.bookmarks.length, 0);
  return <Shell><main className="learning-page"><section className="learning-hero"><div><p className="eyebrow"><span className="lime-dot" /> RAMPAGE / MY LEARNING</p><h1>Keep the thread.<br /><em>Build the habit.</em></h1><p>One home for the work you have started, the source you meant to return to, and the next small move worth making.</p></div><div className="learning-signal"><Sparkles size={18} /><strong>{totalCompleted}</strong><span>LESSONS<br />IN THE BANK</span></div><div className="learning-signal learning-xp-signal"><Zap size={18} /><strong>{learnerState.data?.xp ?? 0}</strong><span>LEARNING<br />XP / VERIFIED</span></div></section><section className="learning-content"><div className="next-action"><div className="section-index">01 <span>/</span> NEXT ACTION</div>{active?.nextLesson ? <div className="next-action-card"><div className="next-action-index"><span>{String(active.course.phases.findIndex((phase) => phase.lessons.some((lesson) => lesson.id === active.nextLesson?.id)) + 1).padStart(2, "0")}</span><Play size={17} /></div><div><span className="aside-label">CONTINUE / {active.course.title}</span><h2>{active.nextLesson.title}</h2><p>{active.nextLesson.summary}</p><div className="next-meta"><span><Clock3 size={13} /> {active.nextLesson.duration}</span><span>{active.completed}/{active.total} complete</span></div></div><Link className="primary-cta" href={`/course/${active.course.id}/lesson/${active.nextLesson.id}`}>Open lesson <ArrowRight size={16} /></Link></div> : <div className="empty-state"><Check size={20} /><h2>All active lessons complete.</h2><p>Choose another route to keep building your systems fluency.</p><Link className="text-cta" href="/paths">Choose a guided path <ArrowRight size={15} /></Link></div>}</div><div className="learning-stats"><div><strong>{Math.round((totalCompleted / Math.max(totalLessons, 1)) * 100)}%</strong><span>COURSE PROGRESS</span></div><div><strong>{stats.length}</strong><span>ACTIVE COURSES</span></div><div><strong>{savedPages}</strong><span>BOOKMARKED PAGES</span></div></div><section className="learning-section"><div className="section-heading compact"><div><div className="section-index">02 <span>/</span> YOUR COURSES</div><h2>Work in motion.</h2></div><Link className="text-cta" href="/paths">Find a new route <ArrowRight size={15} /></Link></div><div className="learning-course-grid">{stats.map(({ course, completed, total, percent, nextLesson }) => <Link className="learning-course-card" key={course.id} href={`/course/${course.id}`}><div className="learning-card-top"><span>{course.status}</span><span>{percent}%</span></div><h3>{course.title}</h3><p>{course.subtitle}</p><div className="mini-track"><i style={{ width: `${percent}%` }} /></div><div className="learning-card-foot"><span>{completed}/{total} lessons</span><span>{nextLesson ? "Continue" : "Complete"} <ArrowRight size={14} /></span></div></Link>)}</div></section><section className="learning-section reading-section"><div className="section-heading compact"><div><div className="section-index">03 <span>/</span> READING QUEUE</div><h2>Sources to return to.</h2></div><Link className="text-cta" href="/resources">Browse reading room <ArrowRight size={15} /></Link></div>{reading.length ? <div className="reading-queue">{reading.slice(0, 4).map(({ item, snapshot }) => <Link className="reading-queue-row" href={`/resources/read/${item!.id}`} key={item!.id}><div className="reading-icon"><FileText size={18} /></div><div><span>{item!.topic} / {item!.level}</span><h3>{item!.title}</h3><p>Continue at page {snapshot.page}{snapshot.highlights.length ? ` · ${snapshot.highlights.length} highlight${snapshot.highlights.length > 1 ? "s" : ""}` : ""}</p></div><ArrowRight size={17} /></Link>)}</div> : <div className="empty-reading"><Bookmark size={22} /><div><h3>Your reading queue is empty.</h3><p>Bookmark a page or save a note in any source and it will appear here.</p></div><Link className="text-cta" href="/resources">Open reading room <ArrowRight size={15} /></Link></div>}</section><section className="learning-section path-section"><div className="section-heading compact"><div><div className="section-index">04 <span>/</span> ROUTES</div><h2>Choose the next thread.</h2></div></div><div className="learning-path-strip">{learningPaths.map((path, index) => <Link key={path.id} href={`/paths/${path.id}`}><span>{String(index + 1).padStart(2, "0")} / {path.level}</span><strong>{path.title}</strong><ArrowRight size={16} /></Link>)}</div></section></section></main></Shell>;
}
