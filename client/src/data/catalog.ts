// Canonical Rampage content model. Course and source records are maintained in curriculum.json.
import curriculum from "./curriculum.json";
import { arxivResources } from "./arxivResources";

export type Resource = {
  type: string;
  label: string;
  url: string;
  source: string;
  note?: string;
  readingFocus?: string;
};

export type LessonLab = {
  title: string;
  brief: string;
  deliverable: string;
  difficulty?: string;
};

export type CodeLab = {
  provider: string;
  mode: string;
  embedUrl?: string;
  label: string;
  safetyNote: string;
  starter: string;
  prompt: string;
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  summary: string;
  video?: string;
  videoLabel?: string;
  resources: Resource[];
  lab?: LessonLab;
  codeLab?: CodeLab;
};

export type Phase = {
  id: string;
  number: string;
  title: string;
  description: string;
  project: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  description: string;
  status: string;
  color: string;
  sourceLabel: string;
  sourceUrl: string;
  time: string;
  level: string;
  phases: Phase[];
};

export type PdfResource = {
  id: string;
  title: string;
  author: string;
  institution: string;
  url: string;
  topic: string;
  level: string;
  pages: string;
  readTime: string;
  tags: string[];
  relatedCourse: string;
  note: string;
};

type CurriculumPayload = {
  schemaVersion: number;
  generatedAt: string;
  courses: Course[];
  resourceCatalog: Resource[];
};

const content = curriculum as CurriculumPayload;
export const courses: Course[] = content.courses;
export const resourceCatalog: Resource[] = content.resourceCatalog;
export const spotlightCourse = courses.find((course) => (course as Course & { spotlight?: boolean }).spotlight) || courses.find((course) => course.id === "ai-systems") || courses[0];

export function findLesson(courseId: string, lessonId: string) {
  return courses.find((course) => course.id === courseId)?.phases.flatMap((phase) => phase.lessons).find((lesson) => lesson.id === lessonId);
}

export function findPhase(courseId: string, phaseId: string) {
  return courses.find((course) => course.id === courseId)?.phases.find((phase) => phase.id === phaseId);
}

export const pdfCatalog: PdfResource[] = [
  { id: "ostep", title: "Operating Systems: Three Easy Pieces", author: "Remzi H. Arpaci-Dusseau & Andrea C. Arpaci-Dusseau", institution: "University of Wisconsin–Madison", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", topic: "Operating Systems", level: "Foundational", pages: "Free web/PDF book", readTime: "12–18 hours", tags: ["os", "processes", "memory", "filesystems"], relatedCourse: "systems-fundamentals", note: "Free official book site with chapter PDFs and lab references." },
  { id: "xv6-book", title: "xv6: a simple, Unix-like teaching operating system", author: "Russ Cox et al.", institution: "MIT PDOS", url: "https://pdos.csail.mit.edu/6.828/2014/xv6/book-rev8.pdf", topic: "Operating Systems", level: "Intermediate", pages: "120+ pages", readTime: "5 hours", tags: ["xv6", "kernel", "risc-v"], relatedCourse: "systems-research-lab", note: "Official MIT teaching text; use alongside the current xv6 repository." },
  { id: "cambridge-distributed", title: "Concurrent and Distributed Systems Notes", author: "Tim Harris", institution: "University of Cambridge", url: "https://www.cl.cam.ac.uk/teaching/2223/ConcDisSys/dist-sys-notes.pdf", topic: "Distributed Systems", level: "Advanced", pages: "92 pages", readTime: "6 hours", tags: ["concurrency", "distributed", "consensus"], relatedCourse: "systems-research-lab", note: "Official course notes PDF with a broad distributed-systems sequence." },
  { id: "raft", title: "In Search of an Understandable Consensus Algorithm", author: "Diego Ongaro & John Ousterhout", institution: "USENIX", url: "https://raft.github.io/raft.pdf", topic: "Distributed Systems", level: "Advanced", pages: "17 pages", readTime: "90 min", tags: ["raft", "consensus", "replication"], relatedCourse: "systems-research-lab", note: "Primary research paper for the Raft consensus algorithm." },
  { id: "nand-projects", title: "From Nand to Tetris: Project Materials", author: "Noam Nisan & Shimon Schocken", institution: "Nand2Tetris", url: "https://www.nand2tetris.org/course", topic: "Compilers & Architecture", level: "Foundational", pages: "12 projects", readTime: "20–40 hours", tags: ["hardware", "compiler", "vm", "architecture"], relatedCourse: "compiler-runtime-architecture", note: "Official project guidelines and lecture slides across hardware and software." },
  { id: "cs61c-notes", title: "CS61C Course Materials", author: "UC Berkeley CS61C staff", institution: "UC Berkeley", url: "https://cs61c.org/", topic: "Computer Architecture", level: "Intermediate", pages: "Course archive", readTime: "10–20 hours", tags: ["risc-v", "c", "architecture"], relatedCourse: "compiler-runtime-architecture", note: "Official course notes, projects, and architecture resources." },
  { id: "cs144-notes", title: "CS144: Introduction to Computer Networking", author: "Keith Winstein et al.", institution: "Stanford University", url: "https://cs144.github.io/", topic: "Networking", level: "Intermediate", pages: "Course notes", readTime: "8–14 hours", tags: ["tcp", "routing", "congestion"], relatedCourse: "networking-systems", note: "Official lecture notes and checkpoint-based networking labs." },
  { id: "missing", title: "The Missing Semester", author: "MIT staff", institution: "MIT CSAIL", url: "https://missing.csail.mit.edu/", topic: "Developer Tools", level: "Foundational", pages: "9 lectures", readTime: "8 hours", tags: ["shell", "git", "debugging", "vim"], relatedCourse: "systems-fundamentals", note: "Official practical computing course." },
  { id: "mit-ocw-824", title: "Distributed Computer Systems Engineering Lecture Notes", author: "MIT course staff", institution: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/6-824-distributed-computer-systems-engineering-spring-2006/pages/lecture-notes/", topic: "Distributed Systems", level: "Advanced", pages: "Lecture notes", readTime: "6–10 hours", tags: ["rpc", "fault tolerance", "storage"], relatedCourse: "systems-research-lab", note: "Official archive of lecture notes and handouts." },
];

pdfCatalog.push(...arxivResources);
export function findPdf(id: string) { return pdfCatalog.find((item) => item.id === id); }
