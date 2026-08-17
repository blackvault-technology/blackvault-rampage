// BlackVault Rampage design reminder: reference-led Swiss technical editorial layout; midnight navy, cream, orange, BlackVault Lime; asymmetric rail and signal-first interactions.
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, ChevronRight, Command, Cpu, ExternalLink, Github, Menu, Play, Search, Shield, Terminal, X } from "lucide-react";
import { toast } from "sonner";

const symbol = "/manus-storage/rampage-symbol_0c3dbff7.png";
const heroArt = "/manus-storage/rampage-hero_2f7d220f.jpg";
const roadmapArt = "/manus-storage/rampage-roadmap_0c197154.jpg";

const phases = [
  { id: "p0", index: "00", title: "Foundations & Tools", kicker: "Start here", project: "Write a shell", lessons: ["The Programmer's Environment", "C, Memory & Pointers", "Git, Vim & GDB"] },
  { id: "p1", index: "01", title: "Architecture", kicker: "Build the machine", project: "Build a CPU in Logisim", lessons: ["Boolean Logic & ALU", "Nand2Tetris", "RISC-V Assembly"] },
  { id: "p2", index: "02", title: "Operating Systems", kicker: "Own the runtime", project: "Extend xv6", lessons: ["Processes & System Calls", "Page Tables", "File Systems"] },
  { id: "p3", index: "03", title: "Networking", kicker: "Talk to the world", project: "Build a TCP stack", lessons: ["The Network Layer", "Reliable Byte Streams", "TCP in the Real World"] },
  { id: "p4", index: "04", title: "Distributed Systems", kicker: "Coordinate chaos", project: "Implement Raft", lessons: ["Time, Failure & Replication", "MapReduce", "Consensus"] },
  { id: "p5", index: "05", title: "Capstone", kicker: "Prove mastery", project: "Distributed key-value store", lessons: ["System Design", "Integration Lab", "Ship the Store"] },
];

const lessonNotes: Record<string, { eyebrow: string; title: string; body: string; code: string }> = {
  "The Programmer's Environment": { eyebrow: "Phase 00 / Chapter 01", title: "The shell is your first interface", body: "Before you build kernels or distributed databases, you need a reliable relationship with the machine. This lesson builds a mental model for processes, files, streams, and the tools that let you inspect them.", code: "$ mkdir rampage-lab\n$ cd rampage-lab\n$ printf 'signal acquired\\n'" },
  "C, Memory & Pointers": { eyebrow: "Phase 00 / Chapter 02", title: "Memory is not an abstraction", body: "Pointers are addresses with consequences. Trace values through the stack and heap, then use a debugger to watch the machine change under your program.", code: "int value = 42;\nint *address = &value;\nprintf(\"%d\\n\", *address);" },
  "Boolean Logic & ALU": { eyebrow: "Phase 01 / Chapter 01", title: "Build the machine from first principles", body: "Every high-level system eventually becomes gates, wires, and state. Start with the smallest useful unit and assemble an arithmetic logic unit you can explain line by line.", code: "CHIP ALU {\n  IN x[16], y[16];\n  OUT out[16];\n}" },
};

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand"><img src={symbol} alt="BlackVault starburst" /><div><span>BLACKVAULT</span>{!compact && <small>TECHNOLOGY</small>}</div>{compact && <strong className="rampage-lockup"><i>/</i> RAMPAGE</strong>}</div>;
}

function Progress({ completed }: { completed: string[] }) {
  const total = phases.reduce((sum, phase) => sum + phase.lessons.length, 0);
  const value = Math.round((completed.length / total) * 100);
  return <div className="progress-wrap"><div className="progress-meta"><span>RAMPAGE PROGRESS</span><strong>{String(value).padStart(2, "0")} %</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${Math.max(value, 2)}%` }} /></div></div>;
}

export default function Home() {
  const [completed, setCompleted] = useState<string[]>(() => JSON.parse(localStorage.getItem("rampage-completed") || "[]"));
  const [activeLesson, setActiveLesson] = useState("The Programmer's Environment");
  const [openPhase, setOpenPhase] = useState("p0");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const active = lessonNotes[activeLesson] || lessonNotes["The Programmer's Environment"];
  const allLessons = useMemo(() => phases.flatMap((phase) => phase.lessons), []);

  useEffect(() => { localStorage.setItem("rampage-completed", JSON.stringify(completed)); }, [completed]);
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);

  const startCourse = () => { document.getElementById("academy")?.scrollIntoView({ behavior: "smooth" }); };
  const chooseLesson = (lesson: string) => { setActiveLesson(lesson); setSearchOpen(false); document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" }); };
  const markComplete = () => { if (!completed.includes(activeLesson)) { setCompleted([...completed, activeLesson]); toast.success("Lesson logged. Keep moving."); } else toast("Already complete — take the next gatekeeper."); };

  return <div className="app-shell">
    <header className="topbar"><a href="#top" className="brand-link"><Brand compact /></a><nav className={mobileNav ? "nav-links is-open" : "nav-links"}><a href="#academy">Academy</a><a href="#method">The method</a><a href="#resources">Resources</a><button onClick={() => setSearchOpen(true)} className="search-trigger"><Search size={15} /> Search <kbd>⌘ K</kbd></button></nav><div className="top-actions"><button className="icon-button" onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={18} /></button><button className="menu-button" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation">{mobileNav ? <X size={21} /> : <Menu size={21} />}</button><a className="github-link" href="https://github.com/new" target="_blank" rel="noreferrer"><Github size={17} /> GitHub</a></div></header>

    <main id="top">
      <section className="hero"><div className="hero-art" style={{ backgroundImage: `url(${heroArt})` }} /><div className="hero-grid" /><div className="hero-copy"><p className="eyebrow"><span className="lime-dot" /> BLACKVAULT ACADEMY / 02.0</p><div className="hero-lockup"><span>BLACKVAULT</span><b>/ RAMPAGE</b></div><h1>Build the systems<br /><em>you can't fake.</em></h1><p className="hero-intro">A rigorous, project-first path from absolute beginner to elite systems engineer. No passive watching. No shortcuts.</p><div className="hero-actions"><button className="primary-cta" onClick={startCourse}>Start the Rampage <ArrowUpRight size={18} /></button><a className="text-cta" href="#method">See the method <ChevronRight size={16} /></a></div></div><div className="hero-stamp"><span>BUILD</span><strong>TO<br />LEARN</strong><span>01—06</span></div><div className="hero-footer"><span>01 / SYSTEM FUNDAMENTALS</span><span>THE HARD WAY IS THE SHORTCUT</span><span>SCROLL TO ENTER ↓</span></div></section>

      <section className="manifesto" id="method"><div className="manifesto-rail"><div className="section-index">01 <span>/</span> WHY RAMPAGE</div><div className="rail-note">FIELD NOTE / 001<br /><strong>THE MACHINE<br />DOES NOT<br />CARE ABOUT<br />YOUR INTENT.</strong></div></div><div className="manifesto-copy"><h2>This is hard.<br /><span>That's why it matters.</span></h2><p>Rampage is not another library of disconnected tutorials. It is a six-phase engineering path built around the gold-standard labs from MIT, Stanford, Berkeley, and Nand2Tetris.</p><div className="manifesto-stats"><div><strong>06</strong><span>PHASES</span></div><div><strong>40+</strong><span>HARD LESSONS</span></div><div><strong>∞</strong><span>LOCAL PROGRESS</span></div></div></div><div className="manifesto-mark">R<br />/</div></section>

      <section className="academy" id="academy"><div className="section-heading"><div><div className="section-index">02 <span>/</span> THE ACADEMY</div><h2>System<br /><i>Fundamentals</i></h2></div><div className="heading-note"><span className="lime-dot" /> <p>ZERO TO TOP 1%<br /><small>One course. Six gates.<br />A different kind of confidence.</small></p></div></div><div className="academy-layout"><aside className="phase-rail"><Progress completed={completed} /><div className="phase-list angular-list">{phases.map((phase) => <button key={phase.id} className={openPhase === phase.id ? "phase-tab active" : "phase-tab"} onClick={() => setOpenPhase(phase.id)}><span>{phase.index}</span><div><b>{phase.title}</b><small>{phase.kicker}</small></div><ChevronRight size={16} /></button>)}</div></aside><div className="curriculum-panel"><div className="panel-top"><span>CURRICULUM MAP / 06 PHASES</span><span>EST. 40 HOURS</span></div>{phases.map((phase) => <div key={phase.id} className={openPhase === phase.id ? "phase-block expanded" : "phase-block"}><button className="phase-header" onClick={() => setOpenPhase(openPhase === phase.id ? "" : phase.id)}><span className="phase-number">{phase.index}</span><div><small>{phase.kicker}</small><h3>{phase.title}</h3></div><span className="phase-project">GATEKEEPER / {phase.project}</span><ChevronDown size={20} /></button>{openPhase === phase.id && <div className="lesson-list">{phase.lessons.map((lesson, index) => <button key={lesson} className="lesson-row" onClick={() => chooseLesson(lesson)}><span className={completed.includes(lesson) ? "lesson-check done" : "lesson-check"}>{completed.includes(lesson) ? <Check size={13} /> : String(index + 1).padStart(2, "0")}</span><span>{lesson}</span><small>{index === 0 ? "START" : `${12 + index * 8}:00`}</small><ArrowUpRight size={15} /></button>)}</div>}</div>)}</div></div></section>

      <section className="workspace" id="workspace"><div className="workspace-top"><div className="section-index">03 <span>/</span> LEARNING SPACE</div><span className="workspace-status"><span className="status-dot" /> LOCAL SESSION / PRIVATE BY DEFAULT</span></div><div className="workspace-grid"><article className="lesson-player"><div className="player-screen"><div className="screen-noise" /><button className="play-button" onClick={() => toast("Video embed is lazy-loaded — connect your lesson source to begin.")}><Play size={25} fill="currentColor" /></button><div className="player-label"><span>LESSON 01</span><strong>SYSTEMS / FOUNDATIONS</strong></div></div><div className="lesson-copy"><p className="eyebrow">{active.eyebrow}</p><h2>{active.title}</h2><p>{active.body}</p><button className={completed.includes(activeLesson) ? "complete-button completed" : "complete-button"} onClick={markComplete}>{completed.includes(activeLesson) ? <><Check size={17} /> Completed</> : <>Mark as complete <ArrowUpRight size={17} /></>}</button></div></article><aside className="notes-panel"><div className="notes-label"><Terminal size={16} /> FIELD NOTES</div><pre><code>{active.code}</code></pre><div className="resource-list"><a href="https://missing.csail.mit.edu/" target="_blank" rel="noreferrer"><span>LAB 01</span> MIT Missing Semester <ExternalLink size={14} /></a><a href="https://github.com/mit-pdos/xv6-riscv" target="_blank" rel="noreferrer"><span>REPO</span> xv6-riscv <ExternalLink size={14} /></a></div></aside></div></section>

      <section className="roadmap" id="resources"><div className="roadmap-art" style={{ backgroundImage: `url(${roadmapArt})` }} /><div className="roadmap-copy"><div className="section-index">04 <span>/</span> THE STANDARD</div><h2>Build the thing<br /><i>you can't fake.</i></h2><p>Every phase ends with a gatekeeper project. Write a shell. Build a CPU. Extend a kernel. Implement TCP. Make Raft agree. Ship a distributed store.</p><a href="#academy" className="primary-cta">View the roadmap <ArrowUpRight size={18} /></a></div><div className="roadmap-side"><Shield size={21} /><span>OPEN SOURCE<br />/ PRIVACY FIRST<br />/ NO ACCOUNT REQUIRED</span></div></section>
    </main>
    <footer><Brand /><div className="footer-links"><a href="#academy">Academy</a><a href="https://github.com/new" target="_blank" rel="noreferrer">Open source</a><a href="#top">Back to top ↑</a></div><p>© 2026 BLACKVAULT TECHNOLOGY. BUILD WITH INTENT.</p></footer>

    {searchOpen && <div className="search-overlay" onClick={() => setSearchOpen(false)}><div className="search-modal" onClick={(e) => e.stopPropagation()}><div className="search-head"><Search size={20} /><input autoFocus placeholder="Jump to a lesson..." onChange={(e) => { const hit = allLessons.find((lesson) => lesson.toLowerCase().includes(e.target.value.toLowerCase())); if (e.target.value && hit) chooseLesson(hit); }} /><kbd>ESC</kbd></div><div className="search-results">{allLessons.slice(0, 6).map((lesson, index) => <button key={lesson} onClick={() => chooseLesson(lesson)}><span>{String(index + 1).padStart(2, "0")}</span>{lesson}<ChevronRight size={16} /></button>)}</div><div className="search-foot"><Command size={14} /> SEARCH IS LOCAL / NOTHING LEAVES YOUR BROWSER</div></div></div>}
  </div>;
}
