// Guided paths: simple sequencing metadata that sits above individual courses.
import { courses, pdfCatalog } from "./catalog";
export type LearningPath = { id: string; title: string; subtitle: string; level: string; time: string; promise: string; steps: { type: "course" | "resource"; id: string; label: string; why: string }[] };
export const learningPaths: LearningPath[] = [
  { id: "systems-builder", title: "Systems Builder", subtitle: "Make the machine legible", level: "Beginner → Advanced", time: "100–140 hours", promise: "A deliberate route from command line confidence to kernels, networks, and distributed failure testing.", steps: [
    { type: "course", id: "systems-fundamentals", label: "System Fundamentals", why: "Build the vocabulary and first working systems." },
    { type: "resource", id: "ostep", label: "Operating Systems: Three Easy Pieces", why: "Strengthen the core mental models with an open textbook." },
    { type: "course", id: "systems-research-lab", label: "Systems Research Lab", why: "Move from implementation to evidence and failure analysis." },
  ] },
  { id: "ai-systems-builder", title: "AI Systems Builder", subtitle: "From tokens to a useful service", level: "Beginner → Intermediate", time: "28–40 hours", promise: "Learn the vocabulary first, then ship one small AI system with explicit evaluation, cost, and operating limits.", steps: [
    { type: "resource", id: "google-mlcc", label: "Google ML Crash Course", why: "Start with a gentle, official ML refresher." },
    { type: "course", id: "ai-systems", label: "AI Systems", why: "Follow one calm sequence from model mechanics to production evidence." },
    { type: "resource", id: "hf-llm", label: "Hugging Face LLM Course", why: "Go deeper into modern language-model tooling when ready." },
  ] },
  { id: "language-machine", title: "Language Machine", subtitle: "Understand what code becomes", level: "Intermediate → Advanced", time: "60–90 hours", promise: "Connect syntax, intermediate representations, runtime behavior, and performance without losing the plot.", steps: [
    { type: "course", id: "compiler-runtime-architecture", label: "Compiler & Runtime Architecture", why: "Build the toolchain in clear, small stages." },
    { type: "resource", id: "nand2tetris-book", label: "The Elements of Computing Systems", why: "Reconnect language decisions to the machine beneath them." },
  ] },
];
export function findPath(id: string) { return learningPaths.find((path) => path.id === id); }
export function pathItem(id: string, type: "course" | "resource") { return type === "course" ? courses.find((course) => course.id === id) : pdfCatalog.find((item) => item.id === id); }
