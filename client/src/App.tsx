// BlackVault Rampage route map: ecosystem pages are data-driven and share one branded shell.
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Course from "./pages/Course";
import Lesson from "./pages/Lesson";
import Resources from "./pages/Resources";
import ResourceReader from "./pages/ResourceReader";
import Certificate from "./pages/Certificate";
import Paths from "./pages/Paths";
import MyLearning from "@/pages/MyLearning";
import Assessment from "@/pages/Assessment";
import { useLocation } from "wouter";

function RouteSeo() {
  const [location] = useLocation();
  useEffect(() => {
    const cleanPath = location.split("?")[0];
    const pageNames: Record<string, string> = {
      "/": "Learn like the top 1%",
      "/resources": "Reading Room",
      "/paths": "Learning Paths",
      "/learn": "My Learning",
    };
    const section = pageNames[cleanPath] || (cleanPath.includes("assessment") ? "Final Assessment" : cleanPath.includes("certificate") ? "Digital Certificate" : cleanPath.includes("lesson") ? "Lesson Workspace" : cleanPath.includes("course") ? "Course Overview" : "Academy");
    const description = cleanPath.includes("assessment") ? "A timed, server-scored Rampage learning assessment with transparent integrity signals." : cleanPath.includes("resources") ? "A structured reading room for verified technical papers, books, and institutional sources." : "BlackVault Rampage is a source-first technical academy for building systems fluency through guided courses and real resources.";
    document.title = `Rampage — ${section}`;
    const setMeta = (name: string, content: string) => { let tag = document.querySelector(`meta[name="${name}"]`); if (!tag) { tag = document.createElement("meta"); tag.setAttribute("name", name); document.head.appendChild(tag); } tag.setAttribute("content", content); };
    setMeta("description", description);
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link"); canonical.setAttribute("rel", "canonical"); canonical.setAttribute("href", `${window.location.origin}${cleanPath}`); if (!canonical.parentNode) document.head.appendChild(canonical);
    const ld = { "@context": "https://schema.org", "@type": "WebSite", name: "BlackVault Rampage", description, url: window.location.origin };
    let script = document.getElementById("rampage-structured-data") as HTMLScriptElement | null; if (!script) { script = document.createElement("script"); script.id = "rampage-structured-data"; script.type = "application/ld+json"; document.head.appendChild(script); } script.textContent = JSON.stringify(ld);
  }, [location]);
  return null;
}
function Router() { return <><RouteSeo /><Switch><Route path="/" component={Home} /><Route path="/resources" component={Resources} /><Route path="/paths" component={Paths} /><Route path="/learn" component={MyLearning} /><Route path="/paths/:pathId" component={Paths} /><Route path="/resources/read/:resourceId" component={ResourceReader} /><Route path="/course/:courseId" component={Course} /><Route path="/course/:courseId/lesson/:lessonId" component={Lesson} /><Route path="/course/:courseId/assessment" component={Assessment} /><Route path="/certificate/:courseId" component={Certificate} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster theme="dark" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
