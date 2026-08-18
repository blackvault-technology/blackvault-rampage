import { ArrowRight, ArrowUpRight, BookOpen, Check, Compass, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Shell } from "@/components/AcademyShell";
import { courses } from "@/data/catalog";
import { topSkillCourseIds } from "@/data/topSkillCourses";

type Track = "all" | "skills" | "technical";

const routeCopy: Record<Track, { title: string; body: string }> = {
  all: { title: "Choose the work worth understanding.", body: "Each Rampage course begins with a clear route: original material, focused practice, a small proof of work, and a next move when the first explanation stops being enough." },
  skills: { title: "Human skills are technical skills.", body: "Build the language, reasoning, communication, and learning habits that make every other capability easier to use with care." },
  technical: { title: "Trace the systems underneath.", body: "Work from source material, build mental models, and create evidence through small, deliberate technical practice." },
};

function lessonCount(course: (typeof courses)[number]) {
  return course.phases.reduce((total, phase) => total + phase.lessons.length, 0);
}

function typeLabel(course: (typeof courses)[number]) {
  const isSpotlight = Boolean((course as (typeof course & { spotlight?: boolean })).spotlight);
  return isSpotlight ? "SPOTLIGHT COURSE" : topSkillCourseIds.includes(course.id) ? "TOP-TIER SKILL" : "TECHNICAL SYSTEM";
}

export default function Courses() {
  const [track, setTrack] = useState<Track>("all");
  const [query, setQuery] = useState("");
  const [onlyNew, setOnlyNew] = useState(false);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return courses.filter((course) => {
      const isSkill = topSkillCourseIds.includes(course.id);
      const inTrack = track === "all" || (track === "skills" ? isSkill : !isSkill);
      const inSearch = !normalized || [course.title, course.subtitle, course.description, course.sourceLabel].join(" ").toLowerCase().includes(normalized);
      const isNew = !onlyNew || course.status === "NEW ROUTE";
      return inTrack && inSearch && isNew;
    });
  }, [onlyNew, query, track]);
  const copy = routeCopy[track];
  const skillCount = courses.filter((course) => topSkillCourseIds.includes(course.id)).length;
  const spotlight = courses.find((course) => Boolean((course as (typeof course & { spotlight?: boolean })).spotlight));

  return <Shell><main className="courses-page">
    <section className="courses-hero" aria-labelledby="courses-title">
      <div className="courses-hero-grid" aria-hidden="true" />
      <div className="courses-hero-copy">
        <p className="eyebrow"><span className="lime-dot" /> COURSE MAP / CURATED ROUTES</p>
        <div className="courses-kicker"><Compass size={15} /> BEGINNER FRIENDLY. SERIOUS BY DESIGN.</div>
        <h1 id="courses-title">Build the skills<br /><em>that compound.</em></h1>
        <p>Rampage is built for learners starting from the beginning and aiming higher than passive consumption. Every route pairs clear sequence with original resources, practice, and a record of what you can now explain or do.</p>
        <div className="courses-hero-actions"><Link className="primary-cta" href="#course-explorer">Explore all courses <ArrowDownIcon /></Link><Link className="text-cta" href="/paths">Start with a guided path <ArrowUpRight size={16} /></Link></div>
      </div>
      <aside className="courses-signal-card" aria-label="Catalogue composition">
        <div className="signal-card-head"><span>RAMPAGE / COURSE MAP</span><b>01—∞</b></div>
        <div className="signal-count"><strong>{courses.length.toString().padStart(2, "0")}</strong><span>CURATED<br />ROUTES</span></div>
        <div className="signal-rows"><div><BookOpen size={16} /><span>{skillCount} top-tier skill routes</span></div><div><Check size={16} /><span>Source-led practice briefs</span></div><div><ArrowRight size={16} /><span>Beginner-first learning flow</span></div></div>
        <small>Open source material remains attributed and visible. No ratings theatre. No borrowed authority.</small>
      </aside>
    </section>

    {spotlight && <section className="spotlight-launch-panel" aria-labelledby="spotlight-launch-title"><div className="spotlight-launch-panel__signal"><span className="lime-dot" /> NEW / FLAGSHIP ROUTE</div><div><p className="eyebrow">SPOTLIGHT COURSE / {spotlight.title}</p><h2 id="spotlight-launch-title">Learn C++ without skipping the first principles.</h2><p>{spotlight.description}</p><div className="spotlight-launch-panel__proof"><span>{lessonCount(spotlight)} lessons</span><span>{spotlight.phases.length} phases</span><span>Source-led labs</span><span>Beginner → Advanced</span></div></div><Link className="primary-cta" href={`/course/${spotlight.id}`}>Open Spotlight Course <ArrowUpRight size={17} /></Link></section>}

    <section className="course-explorer" id="course-explorer" aria-labelledby="course-explorer-title">
      <div className="course-explorer-head"><div><div className="section-index">01 <span>/</span> FIND A ROUTE</div><h2 id="course-explorer-title">{copy.title}</h2><p>{copy.body}</p></div><div className="course-explorer-count"><span>ROUTES MATCHING</span><strong>{filtered.length.toString().padStart(2, "0")}</strong></div></div>
      <div className="course-controls" aria-label="Course filters">
        <div className="track-tabs" role="tablist" aria-label="Course track">
          {(["all", "skills", "technical"] as Track[]).map((item) => <button key={item} role="tab" aria-selected={track === item} className={track === item ? "is-active" : ""} onClick={() => setTrack(item)}>{item === "all" ? "All routes" : item === "skills" ? "Top-tier skills" : "Technical systems"}</button>)}
        </div>
        <div className="course-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a skill, system, or source…" aria-label="Search courses" /><kbd>⌘ K</kbd></div>
        <button className={onlyNew ? "new-filter is-active" : "new-filter"} onClick={() => setOnlyNew((value) => !value)} aria-pressed={onlyNew}><SlidersHorizontal size={15} /> New routes</button>
      </div>

      {filtered.length ? <div className="courses-catalogue-grid">{filtered.map((course, index) => {
        const isSkill = topSkillCourseIds.includes(course.id);
        const isSpotlight = Boolean((course as (typeof course & { spotlight?: boolean })).spotlight);
        const lessonTotal = lessonCount(course);
        return <article className={`course-explorer-card ${isSkill ? "skill-route" : "technical-route"} ${course.status === "NEW ROUTE" ? "is-new-route" : ""} ${isSpotlight ? "is-spotlight-course" : ""}`} key={course.id}>
          <div className="course-explorer-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{typeLabel(course)}</span><span className={course.status === "NEW ROUTE" ? "route-status is-new" : "route-status"}>{course.status}</span></div>
          <div className="course-explorer-signal"><span aria-hidden="true">{isSkill ? "↗" : "↳"}</span><i /><b>ROUTE / {String(index + 1).padStart(2, "0")}</b></div>
          <h3>{course.title}</h3><p>{course.subtitle}</p>
          <div className="course-explorer-meta"><span>{course.level}</span><span>{lessonTotal} lessons</span><span>{course.time}</span></div>
          <div className="course-explorer-source"><small>PRIMARY MATERIAL</small><b>{course.sourceLabel}</b></div>
          <div className="course-explorer-foot"><span>{course.phases.length} phases / applied evidence</span><Link href={`/course/${course.id}`} aria-label={`Open ${course.title}`}>Enter route <ArrowUpRight size={16} /></Link></div>
        </article>;
      })}</div> : <div className="course-empty"><BookOpen size={26} /><h3>No route matches that filter.</h3><p>Clear the search or return to every route to find a sensible place to begin.</p><button onClick={() => { setQuery(""); setTrack("all"); setOnlyNew(false); }}>Reset course filters</button></div>}
    </section>

    <section className="course-approach"><div className="section-index">02 <span>/</span> HOW A ROUTE WORKS</div><div className="approach-grid"><div><span>01</span><h3>Start from where you are</h3><p>Each route opens with foundational concepts, not status games or assumed knowledge.</p></div><div><span>02</span><h3>Study the source layer</h3><p>Read or watch material in context, with a specific question and an inline place to continue.</p></div><div><span>03</span><h3>Leave evidence</h3><p>Use a brief, artifact, explanation, or practice record to turn study into visible capability.</p></div></div><Link className="primary-cta" href="/paths">Choose a guided path <ArrowUpRight size={18} /></Link></section>
  </main></Shell>;
}

function ArrowDownIcon() {
  return <span aria-hidden="true" className="cta-arrow-down">↓</span>;
}
