// BlackVault Rampage route map: distinct pages are data-driven and share one branded shell.
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

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/resources" component={Resources} /><Route path="/course/:courseId" component={Course} /><Route path="/course/:courseId/lesson/:lessonId" component={Lesson} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster theme="dark" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
