import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Command, Compass, Github, Home, Menu, Search, UserRound, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { courses } from "@/data/catalog";
import { useAuth } from "@/_core/hooks/useAuth";
import { AuthLauncher, AuthModal } from "@/components/AuthModal";
import { useAuthModal } from "@/hooks/useAuthModal";

export function Brand() {
  return <Link href="/"><div className="brand"><img className="brand-logo" src="https://github.com/blackvault-technology/blackvault-rampage/blob/main/rampage-symbol_0c3dbff7.webp?raw=true" alt="BlackVault Rampage symbol" width={31} height={31} decoding="async" /><div><span>BLACKVAULT</span><small>TECHNOLOGY</small></div><strong className="rampage-lockup"><i>/</i><b>RAMPAGE</b><small>OPEN LEARNING SYSTEM</small></strong></div></Link>;
}

function isActive(location: string, href: string) {
  if (href === "/") return location === "/";
  if (href === "/#catalog") return location === "/" && typeof window !== "undefined" && window.location.hash === "#catalog";
  return location === href || location.startsWith(`${href}/`);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const authModal = useAuthModal();
  const { user, logout } = useAuth();
  const matches = useMemo(() => courses.flatMap((course) => course.phases.flatMap((phase) => phase.lessons.map((lesson) => ({ ...lesson, courseId: course.id, courseTitle: course.title })))).filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 7), [query]);
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "Escape") { setSearchOpen(false); setOpen(false); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const navItems = [["/", "Academy"], ["/courses", "Courses"], ["/learn", "My learning"], ["/paths", "Guided paths"], ["/resources", "Resource library"], ["/about", "About"]] as const;
  return <div className="academy-shell">
    <header className="topbar"><Brand /><nav className={open ? "nav-links is-open" : "nav-links"} aria-label="Primary navigation">{navItems.map(([href, label]) => <Link key={href} href={href} className={isActive(location, href) ? "is-active" : ""} aria-current={isActive(location, href) ? "page" : undefined}>{label}</Link>)}<button className="search-trigger" onClick={() => setSearchOpen(true)} aria-haspopup="dialog" aria-expanded={searchOpen}><Search size={15} /> Search <kbd>⌘ K</kbd></button></nav><div className="top-actions"><button className="icon-button" onClick={() => setSearchOpen(true)} aria-label="Search lessons" aria-haspopup="dialog" aria-expanded={searchOpen}><Search size={18} /></button>{user ? <div className="header-account"><Link href="/account" className="header-account-link"><UserRound size={16} /><span className="header-account-name" title={user.name || user.email || "Account"}>{(user.name || user.email || "Account").trim().split(/\s+/)[0]}</span></Link><button className="header-signout" onClick={() => logout()}>Sign out</button></div> : <AuthLauncher redirect={location}><span className="header-auth-label">Sign in</span><UserRound size={16} /></AuthLauncher>}<button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">{open ? <X size={21} /> : <Menu size={21} />}</button><a className="github-link" href="https://github.com/blackvault-technology/blackvault-rampage" target="_blank" rel="noreferrer"><Github size={17} /> GitHub</a></div></header>
    {children}
    <nav className="mobile-app-nav" aria-label="Mobile app navigation"><Link href="/" aria-current={location === "/" ? "page" : undefined} className={location === "/" ? "is-active" : ""}><Home size={17} /><span>Home</span></Link><Link href="/courses" aria-current={location.startsWith("/courses") ? "page" : undefined} className={location.startsWith("/courses") ? "is-active" : ""}><Compass size={17} /><span>Courses</span></Link><Link href="/learn" aria-current={location === "/learn" || location.startsWith("/course/") ? "page" : undefined} className={location === "/learn" || location.startsWith("/course/") ? "is-active" : ""}><BookOpen size={17} /><span>Learn</span></Link>{user ? <Link href="/account" aria-current={location.startsWith("/account") ? "page" : undefined} className={location.startsWith("/account") ? "is-active" : ""}><UserRound size={17} /><span>Account</span></Link> : <AuthLauncher redirect={location}><UserRound size={17} /><span>Account</span></AuthLauncher>}</nav>
    <footer><Brand /><div className="footer-links"><Link href="/">Academy</Link><Link href="/courses">Courses</Link><Link href="/learn">My learning</Link><Link href="/paths">Guided paths</Link><Link href="/resources">Resources</Link><Link href="/about">About</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookies</Link><Link href="/acceptable-use">Acceptable use</Link><a href="https://github.com/blackvault-technology/blackvault-rampage" target="_blank" rel="noreferrer">Open source</a><Link href="/courses">Explore courses <ArrowUpRight size={13} /></Link></div><p>© 2026 BLACKVAULT TECHNOLOGY. BUILD WITH INTENT.</p></footer>
    {searchOpen && <div className="search-overlay" role="presentation" onClick={() => setSearchOpen(false)}><div className="search-modal" role="dialog" aria-modal="true" aria-labelledby="lesson-search-title" onClick={(e) => e.stopPropagation()}><div className="search-head"><Search size={20} /><label id="lesson-search-title" className="sr-only">Search Rampage lessons</label><input autoFocus aria-label="Search Rampage lessons" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search lessons, projects, and concepts..." /><kbd>ESC</kbd></div><div className="search-results">{matches.length ? matches.map((item) => <Link key={item.id} href={`/course/${item.courseId}/lesson/${item.id}`} onClick={() => setSearchOpen(false)}><span>{item.courseTitle.split(" ")[0].toUpperCase()}</span>{item.title}<ArrowUpRight size={15} /></Link>) : <p className="search-empty">No indexed lessons match that query.</p>}</div><div className="search-foot"><Command size={14} /> SEARCH IS LOCAL / NOTHING LEAVES YOUR BROWSER</div></div></div>}
    <AuthModal open={authModal.open} onOpenChange={authModal.setOpen} redirect={authModal.redirect} />
  </div>;
}
