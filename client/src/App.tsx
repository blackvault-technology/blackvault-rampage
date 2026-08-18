// BlackVault Rampage route map: ecosystem pages are data-driven and share one branded shell.
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Course from "./pages/Course";
import Lesson from "./pages/Lesson";
import Resources from "./pages/Resources";
import ResourceReader from "./pages/ResourceReader";
import Certificate from "./pages/Certificate";
import CertificateVerify from "./pages/CertificateVerify";
import Paths from "./pages/Paths";
import MyLearning from "@/pages/MyLearning";
import Assessment from "@/pages/Assessment";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Verify from "@/pages/Verify";
import ResetPassword from "@/pages/ResetPassword";
import Account from "@/pages/Account";
import { Terms, Privacy, Cookies, AcceptableUse } from "@/pages/Legal";
import { courses } from "@/data/catalog";
import { useLocation } from "wouter";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Shell } from "@/components/AcademyShell";
import { AuthLauncher } from "@/components/AuthModal";
import { useAuth } from "@/_core/hooks/useAuth";

function RouteSeo() {
  const [location] = useLocation();
  useEffect(() => {
    const cleanPath = location.split("?")[0];
    const pageNames: Record<string, string> = {
      "/": "Learn the systems behind the surface",
      "/courses": "Courses",
      "/resources": "Reading Room",
      "/paths": "Learning Paths",
      "/learn": "My Learning",
      "/about": "About BlackVault Foundation",
      "/terms": "Terms of Use",
      "/privacy": "Privacy Notice",
      "/cookies": "Cookie Notice",
      "/acceptable-use": "Acceptable Use",
      "/certificate/verify": "Certificate Verification",
    };
    const section = pageNames[cleanPath] || (cleanPath.includes("assessment") ? "Final Assessment" : cleanPath.includes("certificate") ? "Digital Certificate" : cleanPath.includes("lesson") ? "Lesson Workspace" : cleanPath.includes("course") ? "Course Overview" : "Academy");
    const description = cleanPath.includes("assessment") ? "A timed, server-scored BlackVault Rampage learning assessment with transparent integrity signals." : cleanPath === "/courses" ? "Explore source-backed BlackVault Rampage courses in technical systems, communication, English, writing, decision-making, and high-leverage professional skills." : cleanPath.includes("resources") ? "A structured reading room for verified technical papers, books, and institutional sources." : cleanPath === "/about" ? "Meet BlackVault Foundation, the people and principles behind BlackVault Rampage’s structured approach to technical learning." : cleanPath.includes("course") ? "A source-backed BlackVault Rampage course with guided lessons, labs, and real technical resources." : "BlackVault Rampage is a source-first technical academy for building systems fluency through guided courses and real resources.";
    const pageTitle = cleanPath === "/" ? "BlackVault Rampage — Learn the systems behind the surface" : `BlackVault Rampage — ${section}`;
    document.title = pageTitle;
    const setMeta = (name: string, content: string) => { let tag = document.querySelector(`meta[name="${name}"]`); if (!tag) { tag = document.createElement("meta"); tag.setAttribute("name", name); document.head.appendChild(tag); } tag.setAttribute("content", content); };
    setMeta("description", description);
    const setProperty = (property: string, content: string) => { let tag = document.querySelector(`meta[property="${property}"]`); if (!tag) { tag = document.createElement("meta"); tag.setAttribute("property", property); document.head.appendChild(tag); } tag.setAttribute("content", content); };
    setProperty("og:title", pageTitle); setProperty("og:description", description); setProperty("og:type", cleanPath.includes("course") ? "article" : "website"); setProperty("og:url", `${window.location.origin}${cleanPath}`);
    setMeta("twitter:card", "summary"); setMeta("twitter:title", pageTitle); setMeta("twitter:description", description);
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link"); canonical.setAttribute("rel", "canonical"); canonical.setAttribute("href", `${window.location.origin}${cleanPath}`); if (!canonical.parentNode) document.head.appendChild(canonical);
    const courseId = cleanPath.match(/^\/course\/([^/]+)/)?.[1]; const course = courseId ? courses.find((item) => item.id === courseId) : undefined;
    const ld = course ? { "@context": "https://schema.org", "@type": "Course", name: course.title, description: course.subtitle, provider: { "@type": "Organization", name: "BlackVault Rampage", url: window.location.origin }, url: `${window.location.origin}${cleanPath}` } : cleanPath === "/about" ? { "@context": "https://schema.org", "@type": "AboutPage", name: "About BlackVault Foundation", description, url: `${window.location.origin}/about`, isPartOf: { "@type": "WebSite", name: "BlackVault Rampage", url: window.location.origin } } : { "@context": "https://schema.org", "@type": "WebSite", name: "BlackVault Rampage", description, url: window.location.origin, publisher: { "@type": "Organization", name: "BlackVault Foundation" } };
    let script = document.getElementById("rampage-structured-data") as HTMLScriptElement | null; if (!script) { script = document.createElement("script"); script.id = "rampage-structured-data"; script.type = "application/ld+json"; document.head.appendChild(script); } script.textContent = JSON.stringify(ld);
  }, [location]);
  return null;
}
function AccountRequired({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <Shell><main className="account-gate account-gate--loading"><div className="account-gate-card"><span className="signal-dot" /><p>Checking your learner record…</p></div></main></Shell>;
  }
  if (!user) {
    return <Shell><main className="account-gate"><div className="account-gate-card"><div className="account-gate-icon"><LockKeyhole size={22} /></div><p className="eyebrow"><span className="signal-dot" /> RAMPAGE / ACCOUNT REQUIRED</p><h1>Make the work<br /><em>yours.</em></h1><p className="account-gate-copy">Create a free Rampage account before you enter the learning workspace. It keeps progress, reading state, assessment attempts, and certificates tied to one learner record.</p><AuthLauncher redirect={typeof window === "undefined" ? "/learn" : window.location.pathname}><span>Create or sign in</span><ArrowRight size={16} /></AuthLauncher><small>Public course previews and the resource index remain open. The learning record is not.</small></div></main></Shell>;
  }
  return <>{children}</>;
}

function Router() { return <><RouteSeo /><Switch><Route path="/" component={Home} /><Route path="/courses" component={Courses} /><Route path="/resources" component={Resources} /><Route path="/paths" component={Paths} /><Route path="/learn"><AccountRequired><MyLearning /></AccountRequired></Route><Route path="/about" component={About} /><Route path="/terms" component={Terms} /><Route path="/privacy" component={Privacy} /><Route path="/cookies" component={Cookies} /><Route path="/acceptable-use" component={AcceptableUse} /><Route path="/login" component={Login} /><Route path="/verify" component={Verify} /><Route path="/reset-password" component={ResetPassword} /><Route path="/account"><AccountRequired><Account /></AccountRequired></Route><Route path="/settings"><AccountRequired><Account /></AccountRequired></Route>
		<Route path="/paths/:pathId" component={Paths} /><Route path="/resources/read/:resourceId" component={ResourceReader} /><Route path="/course/:courseId" component={Course} /><Route path="/course/:courseId/lesson/:lessonId"><AccountRequired><Lesson /></AccountRequired></Route><Route path="/course/:courseId/assessment"><AccountRequired><Assessment /></AccountRequired></Route><Route path="/certificate/verify/:recordId" component={CertificateVerify} /><Route path="/certificate/verify" component={CertificateVerify} /><Route path="/certificate/:courseId"><AccountRequired><Certificate /></AccountRequired></Route><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></>; }

export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster theme="dark" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
