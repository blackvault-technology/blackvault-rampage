// BlackVault Rampage content model: all course, lesson, video, and resource metadata lives here so pages remain reusable.
export type Resource = { type: string; label: string; url: string; source: string; note?: string };
export type Lesson = { id: string; title: string; duration: string; summary: string; video?: string; videoLabel?: string; resources: Resource[] };
export type Phase = { id: string; number: string; title: string; description: string; project: string; lessons: Lesson[] };
export type Course = { id: string; title: string; subtitle: string; eyebrow: string; description: string; status: string; color: string; sourceLabel: string; sourceUrl: string; time: string; level: string; phases: Phase[] };

const mitPlaylist = "https://www.youtube-nocookie.com/embed/videoseries?list=PLTsf9UeqkReZHXWY9yJvTwLJWYYPcKEqK";
const resources = {
  missing: { type: "LAB", label: "MIT Missing Semester", url: "https://missing.csail.mit.edu/2026/course-shell/", source: "MIT", note: "Shell, tools, editors, and debugging." },
  xv6: { type: "REPO", label: "xv6-riscv", url: "https://github.com/mit-pdos/xv6-riscv", source: "MIT", note: "Teaching OS source and labs." },
  mitOs: { type: "COURSE", label: "MIT 6.S081", url: "https://pdos.csail.mit.edu/6.828/2021/overview.html", source: "MIT", note: "Operating System Engineering." },
  stanford: { type: "COURSE", label: "Stanford CS144", url: "https://cs144.github.io/", source: "Stanford", note: "TCP/IP stack checkpoints." },
  sponge: { type: "REPO", label: "Stanford Sponge", url: "https://github.com/PKUFlyingPig/CS144-Computer-Network", source: "Stanford", note: "Community mirror; verify against current handout." },
  nand: { type: "COURSE", label: "Nand2Tetris projects", url: "https://www.nand2tetris.org/course", source: "Nand2Tetris", note: "12 first-principles projects." },
  distributed: { type: "COURSE", label: "MIT 6.5840", url: "https://pdos.csail.mit.edu/6.824/", source: "MIT", note: "Distributed systems labs." },
  raft: { type: "PAPER", label: "Raft paper", url: "https://raft.github.io/raft.pdf", source: "USENIX", note: "Understandable consensus." },
  cs61c: { type: "COURSE", label: "Berkeley CS61C", url: "https://cs61c.org/", source: "Berkeley", note: "RISC-V and computer architecture." },
};

export const courses: Course[] = [
  {
    id: "systems-fundamentals", title: "System Fundamentals", subtitle: "Zero to Top 1%", eyebrow: "SPOTLIGHT COURSE / SYSTEMS", description: "Build a shell, a CPU, a kernel, a TCP stack, and a distributed store. A project-first systems path stitched from the strongest open university materials.", status: "SPOTLIGHT", color: "lime", sourceLabel: "MIT · Stanford · Berkeley · Nand2Tetris", sourceUrl: "https://pdos.csail.mit.edu/6.828/2021/overview.html", time: "40–60 hours", level: "Foundational → Advanced",
    phases: [
      { id: "foundations", number: "00", title: "Foundations & Tools", description: "Make the machine legible. Learn the shell, C, memory, Git, Vim, and GDB.", project: "Write a shell", lessons: [
        { id: "shell", title: "The shell is your first interface", duration: "35 min", summary: "Processes, files, streams, and the tools that let you inspect a running machine.", video: mitPlaylist, videoLabel: "MIT Missing Semester / official course", resources: [resources.missing, { type: "READ", label: "The Missing Semester", url: "https://missing.csail.mit.edu/", source: "MIT" }] },
        { id: "memory", title: "Memory is not an abstraction", duration: "48 min", summary: "Trace pointers through stack and heap, then watch the machine change under a debugger.", video: "https://www.youtube-nocookie.com/embed/w7efr8-MRPQ", videoLabel: "Berkeley CS61C / RISC-V intro", resources: [resources.cs61c, resources.missing] },
        { id: "debugging", title: "Debugging as a systems skill", duration: "42 min", summary: "Use GDB, assertions, traces, and small experiments to turn uncertainty into evidence.", video: mitPlaylist, videoLabel: "MIT Missing Semester / debugging and profiling", resources: [resources.missing, { type: "DOC", label: "GDB reference", url: "https://sourceware.org/gdb/documentation/", source: "GNU" }] },
      ] },
      { id: "architecture", number: "01", title: "Architecture", description: "Assemble a computer from logic gates to instruction sets and see where software becomes hardware.", project: "Build a CPU in Logisim", lessons: [
        { id: "nand", title: "From NAND to a computer", duration: "52 min", summary: "Compose universal logic into an ALU, memory, CPU, and a small software hierarchy.", resources: [resources.nand, resources.cs61c] },
        { id: "riscv", title: "RISC-V is a contract", duration: "44 min", summary: "Read instruction encoding, calling conventions, and control flow at the ISA boundary.", video: "https://www.youtube-nocookie.com/embed/1jplJRDB0TI", videoLabel: "Berkeley CS61C / RISC-V and CALL", resources: [resources.cs61c] },
      ] },
      { id: "operating-systems", number: "02", title: "Operating Systems", description: "Enter the kernel: processes, traps, virtual memory, file systems, and concurrency.", project: "Extend xv6", lessons: [
        { id: "os-organization", title: "The kernel is a boundary", duration: "58 min", summary: "Understand system calls, traps, processes, and the hardware/software contract inside xv6.", video: mitPlaylist, videoLabel: "MIT 6.S081 / official lecture playlist", resources: [resources.mitOs, resources.xv6] },
        { id: "page-tables", title: "Page tables and address translation", duration: "66 min", summary: "Walk a virtual address through page tables and implement a memory feature in xv6.", resources: [resources.mitOs, resources.xv6] },
      ] },
      { id: "networking", number: "03", title: "Networking", description: "Build the layers that move bytes from one process to another across an unreliable world.", project: "Build a TCP stack", lessons: [
        { id: "byte-stream", title: "Turn fragments into a byte stream", duration: "45 min", summary: "Start with Stanford CS144 Checkpoint 0 and make an interface that can survive fragmentation.", resources: [resources.stanford, resources.sponge] },
        { id: "tcp", title: "Reliability, flow, and congestion", duration: "70 min", summary: "Implement a TCP sender and receiver, then measure the real world instead of trusting diagrams.", resources: [resources.stanford, { type: "READ", label: "CS144 lecture notes", url: "https://cs144.github.io/", source: "Stanford" }] },
      ] },
      { id: "distributed", number: "04", title: "Distributed Systems", description: "Reason about failure, replication, consistency, and the limits of coordination.", project: "Implement Raft", lessons: [
        { id: "mapreduce", title: "MapReduce and the shape of scale", duration: "62 min", summary: "Build a distributed data-processing model and confront work distribution and failure.", resources: [resources.distributed] },
        { id: "raft", title: "Make replicas agree", duration: "76 min", summary: "Implement Raft’s leader election, log replication, and safety invariants.", resources: [resources.distributed, resources.raft] },
      ] },
      { id: "capstone", number: "05", title: "Capstone", description: "Combine the ideas into a distributed key-value store you can explain and test.", project: "Ship a distributed KV store", lessons: [
        { id: "design", title: "Design the store before you code", duration: "54 min", summary: "Define the API, consistency model, failure modes, and tests before implementation begins.", resources: [resources.distributed, resources.raft] },
        { id: "ship", title: "The proof is in the failure tests", duration: "88 min", summary: "Integrate, benchmark, break, and document your system until the behavior is defensible.", resources: [resources.distributed] },
      ] },
    ],
  },
  { id: "networking-systems", title: "Networking Systems", subtitle: "Packets, Protocols, and Real Servers", eyebrow: "COMING SOON / NETWORKS", description: "A dedicated path through protocols, routing, congestion, and production network behavior.", status: "COMING SOON", color: "orange", sourceLabel: "Stanford CS144 · MIT", sourceUrl: "https://cs144.github.io/", time: "32 hours", level: "Intermediate", phases: [] },
  { id: "ai-systems", title: "AI Systems", subtitle: "Build the Inference Stack", eyebrow: "COMING SOON / AI", description: "A systems-first route through tensors, kernels, compilers, serving, and evaluation infrastructure.", status: "COMING SOON", color: "lime", sourceLabel: "Open research curriculum", sourceUrl: "https://docs.pytorch.org/", time: "48 hours", level: "Intermediate → Advanced", phases: [] },
];

export const resourceCatalog = [resources.missing, resources.xv6, resources.mitOs, resources.stanford, resources.sponge, resources.nand, resources.distributed, resources.raft, resources.cs61c, { type: "DOC", label: "MIT OpenCourseWare", url: "https://ocw.mit.edu/search/?d=Electrical%20Engineering%20and%20Computer%20Science", source: "MIT", note: "Broader open course archive." }];
export const spotlightCourse = courses[0];
export function findLesson(courseId: string, lessonId: string) { return courses.find((course) => course.id === courseId)?.phases.flatMap((phase) => phase.lessons).find((lesson) => lesson.id === lessonId); }
export function findPhase(courseId: string, phaseId: string) { return courses.find((course) => course.id === courseId)?.phases.find((phase) => phase.id === phaseId); }
