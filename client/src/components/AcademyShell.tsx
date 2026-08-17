import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Command, Compass, Github, Home, Menu, Search, UserRound, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { courses } from "@/data/catalog";
import { useAuth } from "@/_core/hooks/useAuth";
import { AuthLauncher, AuthModal } from "@/components/AuthModal";

const symbol = "/manus-storage/rampage-symbol_0c3dbff7.png";
export function Brand() { return <Link href="/"><div className="brand"><img src={symbol} alt="BlackVault starburst" /><div><span>BLACKVAULT</span><small>TECHNOLOGY</small></div><strong className="rampage-lockup"><i>/</i><b>RAMPAGE</b><small>OPEN LEARNING SYSTEM</small></strong></div></Link>; }
export function useProgress() { const [done, setDone] = useState<string[]>(() => JSON.parse(localStorage.getItem("rampage-completed") || "[]")); const mark = (id: string) => { const next = done.includes(id) ? done : [...done, id]; setDone(next); localStorage.setItem("rampage-completed", JSON.stringify(next)); }; return { done, mark }; }

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const authModal = useAuthModal();
  const { user, logout } = useAuth();
  const matches = useMemo(() => courses.flatMap((course) => course.phases.flatMap((phase) => phase.lessons.map((lesson) => ({ ...lesson, courseId: course.id, courseTitle: course.title })))).filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 7), [query]);
  useEffect(() => setOpen(false), [location]);
  return <div className="academy-shell">
    <header className="topbar"><Brand /><nav className={open ? "nav-links is-open" : "nav-links"}><Link href="/">Academy</Link><Link href="/learn">My learning</Link><Link href="/paths">Guided paths</Link><Link href="/resources">Resource library</Link><Link href="/about">About</Link><Link href="/#catalog">Courses</Link><button className="search-trigger" onClick={() => setSearchOpen(true)}><Search size={15} /> Search <kbd>⌘ K</kbd></button></nav><div className="top-actions"><button className="icon-button" onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={18} /></button>{user ? <div className="header-account"><Link href="/account" className="header-account-link"><UserRound size={16} /><span>{user.name || user.email || "Account"}</span></Link><button className="header-signout" onClick={() => logout()}>Sign out</button></div> : <AuthLauncher redirect={location}><span className="header-auth-label">Sign in</span><UserRound size={16} /></AuthLauncher>}<button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X size={21} /> : <Menu size={21} />}</button><a className="github-link" href="https://github.com/new" target="_blank" rel="noreferrer"><Github size={17} /> GitHub</a></div></header>
    {children}
    <nav className="mobile-app-nav" aria-label="Mobile app navigation"><Link href="/" aria-current={location === "/" ? "page" : undefined} className={location === "/" ? "is-active" : ""}><Home size={17} /><span>Home</span></Link><Link href="/learn" aria-current={location === "/learn" || location.startsWith("/course/") ? "page" : undefined} className={location === "/learn" || location.startsWith("/course/") ? "is-active" : ""}><BookOpen size={17} /><span>Learn</span></Link><Link href="/paths" aria-current={location.startsWith("/paths") ? "page" : undefined} className={location.startsWith("/paths") ? "is-active" : ""}><Compass size={17} /><span>Paths</span></Link>{user ? <Link href="/account" aria-current={location.startsWith("/account") ? "page" : undefined} className={location.startsWith("/account") ? "is-active" : ""}><UserRound size={17} /><span>Account</span></Link> : <AuthLauncher redirect={location}><UserRound size={17} /><span>Account</span></AuthLauncher>}</nav>
    <footer><Brand /><div className="footer-links"><Link href="/">Academy</Link><Link href="/learn">My learning</Link><Link href="/paths">Guided paths</Link><Link href="/resources">Resources</Link><Link href="/about">About</Link><a href="https://github.com/" target="_blank" rel="noreferrer">Open source</a><Link href="/#catalog">Explore courses <ArrowUpRight size={13} /></Link></div><p>© 2026 BLACKVAULT TECHNOLOGY. BUILD WITH INTENT.</p></footer>
    {searchOpen && <div className="search-overlay" onClick={() => setSearchOpen(false)}><div className="search-modal" onClick={(e) => e.stopPropagation()}><div className="search-head"><Search size={20} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search lessons, projects, and concepts..." /><kbd>ESC</kbd></div><div className="search-results">{matches.length ? matches.map((item) => <Link key={item.id} href={`/course/${item.courseId}/lesson/${item.id}`} onClick={() => setSearchOpen(false)}><span>{item.courseTitle.split(" ")[0].toUpperCase()}</span>{item.title}<ArrowUpRight size={15} /></Link>) : <p className="search-empty">No indexed lessons match that query.</p>}</div><div className="search-foot"><Command size={14} /> SEARCH IS LOCAL / NOTHING LEAVES YOUR BROWSER</div></div></div>}
    <AuthModal open={authModal.open} onOpenChange={authModal.setOpen} redirect={authModal.redirect} />
  </div>;
}

export function useAuthModal() { const [open, setOpen] = useState(false); const [redirect, setRedirect] = useState("/learn"); useEffect(() => { const handler = (event: Event) => { const detail = (event as CustomEvent<{ redirect?: string }>).detail; setRedirect(detail?.redirect || "/learn"); setOpen(true); }; window.addEventListener("rampage:auth", handler); return () => window.removeEventListener("rampage:auth", handler); }, []); return { open, setOpen, redirect }; }
