export type AssessmentQuestion = { id: string; prompt: string; options: string[]; answer: number; explanation: string };

export const chapterQuizBank: Record<string, AssessmentQuestion[]> = {
  "networking-systems": [
    { id: "net-q1", prompt: "What is the main purpose of layering in a network architecture?", options: ["To separate responsibilities behind stable interfaces", "To eliminate all latency", "To replace IP addresses", "To make every device identical"], answer: 0, explanation: "Layering keeps responsibilities and interfaces separate so a change in one part does not require rewriting every other part." },
    { id: "net-q2", prompt: "What does a router primarily use to make a forwarding decision?", options: ["A destination network prefix", "A browser cookie", "A CPU instruction", "A PDF bookmark"], answer: 0, explanation: "Routers compare the destination address with routing prefixes to choose the next hop." },
    { id: "net-q3", prompt: "What problem does TCP congestion control respond to?", options: ["Too much traffic competing for network capacity", "A missing HTML tag", "A broken keyboard", "A compiler syntax error"], answer: 0, explanation: "Congestion control adapts sending behavior when traffic competes for limited capacity and queues grow." },
  ],
  "systems-fundamentals": [
    { id: "sf-q1", prompt: "Which abstraction lets a process use addresses without directly naming physical RAM?", options: ["Virtual memory", "Git", "TCP", "A shell alias"], answer: 0, explanation: "Virtual memory maps process-visible addresses to physical memory." },
    { id: "sf-q2", prompt: "What does a system call cross?", options: ["The user/kernel boundary", "A DNS zone", "A compiler phase", "A CSS module"], answer: 0, explanation: "System calls are the controlled interface from user programs into the kernel." },
    { id: "sf-q3", prompt: "What problem does Raft primarily address?", options: ["Consensus among replicas", "Rendering pixels", "Compressing PDFs", "Parsing HTML"], answer: 0, explanation: "Raft is a consensus algorithm for replicated state machines." },
  ],
  "ai-systems": [
    { id: "ai-q1", prompt: "What is the most useful first boundary when explaining an AI product?", options: ["Data, model, evaluation, serving, and user goal", "Only the model size", "Only the prompt", "Only the GPU brand"], answer: 0, explanation: "A system view separates the model from the surrounding data, evaluation, serving, and goal." },
    { id: "ai-q2", prompt: "Why does sequence length affect inference cost?", options: ["More tokens create more memory and compute work", "It changes the keyboard layout", "It disables batching", "It removes evaluation"], answer: 0, explanation: "Longer sequences increase attention, memory, and generation work." },
    { id: "ai-q3", prompt: "What should be versioned before claiming an AI change improved quality?", options: ["An evaluation set and its results", "Only a screenshot", "Only a model name", "A random prompt"], answer: 0, explanation: "A versioned evaluation set makes comparisons reproducible." },
  ],
  "systems-research-lab": [
    { id: "sr-q1", prompt: "What makes a systems experiment useful?", options: ["A falsifiable question and observable evidence", "A larger font", "A longer README only", "An unrecorded intuition"], answer: 0, explanation: "Systems claims need questions, measurements, and reproducible evidence." },
    { id: "sr-q2", prompt: "What should a failure matrix include?", options: ["Failure modes, expected behavior, and observed evidence", "Only successful runs", "Only latency", "Only source code"], answer: 0, explanation: "A failure matrix connects failure scenarios to expected and measured behavior." },
    { id: "sr-q3", prompt: "Why trace a syscall boundary?", options: ["To connect user intent to kernel work", "To change DNS", "To style a dashboard", "To hide a failure"], answer: 0, explanation: "Tracing reveals the path from a user operation into the kernel." },
  ],
  "compiler-runtime-architecture": [
    { id: "cr-q1", prompt: "Why use an intermediate representation?", options: ["To separate program meaning from a particular machine or source syntax", "To avoid parsing", "To remove tests", "To replace the runtime"], answer: 0, explanation: "IR creates a stable boundary for analysis, optimization, and code generation." },
    { id: "cr-q2", prompt: "What does a calling convention specify?", options: ["How calls use registers, stack frames, and return values", "How PDFs are indexed", "How packets route", "How CSS is themed"], answer: 0, explanation: "Calling conventions define the ABI contract between compiled functions." },
    { id: "cr-q3", prompt: "What makes a benchmark credible?", options: ["A repeatable workload and a baseline", "One fast run", "A subjective claim", "No measurement"], answer: 0, explanation: "Benchmarks need repeatable inputs and a comparison point." },
  ],
};

export const finalAssessmentBank: Record<string, AssessmentQuestion[]> = {
  "networking-systems": [
    { id: "net-f1", prompt: "Which sequence best describes a typical web request path?", options: ["Name resolution, transport connection, application request, response", "Compiler, kernel panic, PDF export, response", "Only DNS with no transport", "Only a switch lookup"], answer: 0, explanation: "A web request commonly resolves a name, establishes or reuses transport, sends an application request, and receives a response." },
    { id: "net-f2", prompt: "What is the role of a subnet prefix?", options: ["It identifies the network boundary used for local delivery and routing", "It encrypts every packet", "It assigns a process ID", "It replaces a port number"], answer: 0, explanation: "A prefix separates the network portion from the host portion and supports forwarding decisions." },
    { id: "net-f3", prompt: "What does TCP provide above IP?", options: ["Ordered, reliable byte-stream delivery with flow and congestion control", "A wireless radio signal", "A DNS zone", "A physical cable"], answer: 0, explanation: "TCP adds reliable ordered delivery and controls the sender based on receiver capacity and network congestion." },
    { id: "net-f4", prompt: "Which troubleshooting step is strongest?", options: ["Start from a concrete symptom, choose a measurement, and record the evidence", "Change several devices at once", "Trust a diagram without measuring", "Restart everything and record nothing"], answer: 0, explanation: "A defensible troubleshooting loop connects a symptom to a specific measurement and preserves the result for comparison." },
    { id: "net-f5", prompt: "What is a useful network security boundary?", options: ["A stated trust boundary with controls and expected failure behavior", "A larger logo", "An untested default password", "A hidden route"], answer: 0, explanation: "Security work is clearer when trust boundaries, controls, and failure behavior are explicit and testable." },
  ],
  "systems-fundamentals": [
    { id: "sf-f1", prompt: "Which boundary is protected by a system call?", options: ["User space and kernel space", "HTML and CSS", "DNS and HTTP", "Git and Vim"], answer: 0, explanation: "System calls cross the user/kernel boundary." },
    { id: "sf-f2", prompt: "What does virtual memory provide?", options: ["A process-visible address space mapped to physical memory", "A replacement for tests", "A network route", "A shell prompt"], answer: 0, explanation: "Virtual memory maps process addresses to physical storage." },
    { id: "sf-f3", prompt: "What does TCP add over an unreliable network?", options: ["Ordered, reliable byte-stream delivery", "A compiler", "A file system", "A CPU"], answer: 0, explanation: "TCP manages ordering, retransmission, flow, and congestion." },
    { id: "sf-f4", prompt: "What does a replicated state machine need?", options: ["A way for replicas to agree on an ordered log", "Only more RAM", "A CSS framework", "A PDF reader"], answer: 0, explanation: "Consensus orders commands consistently across replicas." },
    { id: "sf-f5", prompt: "What makes a project result defensible?", options: ["A reproducible procedure, evidence, and stated limits", "A confident claim", "A hidden test", "A larger UI"], answer: 0, explanation: "Defensible work explains how it was tested and where it may fail." },
  ],
  "ai-systems": [
    { id: "ai-f1", prompt: "Which component measures whether an AI system works for its intended use?", options: ["Evaluation", "Color palette", "Keyboard", "DNS"], answer: 0, explanation: "Evaluation compares behavior against an explicit goal." },
    { id: "ai-f2", prompt: "What does tokenization do?", options: ["Maps text into model-readable units", "Deploys a GPU", "Creates a database", "Runs a browser"], answer: 0, explanation: "Tokenization converts text into discrete units used by the model." },
    { id: "ai-f3", prompt: "Why monitor an AI service in production?", options: ["To observe latency, failures, cost, drift, and user impact", "To replace tests", "To hide errors", "To increase font size"], answer: 0, explanation: "Operational signals reveal whether the system remains useful and safe." },
    { id: "ai-f4", prompt: "What is a good first AI architecture decision?", options: ["Choose the smallest components that satisfy the goal and quality bar", "Choose the largest model by default", "Skip evaluation", "Avoid logging"], answer: 0, explanation: "Simple systems are easier to measure, operate, and improve." },
    { id: "ai-f5", prompt: "What should an AI system brief include?", options: ["Data, model, tests, costs, failure modes, and next experiment", "Only a prompt", "Only a screenshot", "Only a vendor name"], answer: 0, explanation: "A useful brief makes the system and its limits inspectable." },
  ],
  "systems-research-lab": [
    { id: "sr-f1", prompt: "What is the core unit of systems research?", options: ["A falsifiable question with evidence", "A slogan", "A screenshot", "An unmeasured intuition"], answer: 0, explanation: "Research needs a question and evidence that could change the conclusion." },
    { id: "sr-f2", prompt: "What should a trace help you do?", options: ["Answer a concrete operational question", "Collect noise forever", "Replace a test", "Hide a timing issue"], answer: 0, explanation: "Useful traces are designed around a question." },
    { id: "sr-f3", prompt: "What does replication require you to state?", options: ["A consistency promise and failure behavior", "Only the server brand", "Only the UI", "Only the happy path"], answer: 0, explanation: "Replication is a behavioral promise under failure." },
    { id: "sr-f4", prompt: "Why test restarts and partitions?", options: ["They expose behavior outside the happy path", "They improve typography", "They remove the need for logs", "They guarantee availability"], answer: 0, explanation: "Failure tests reveal whether the design matches its claims." },
    { id: "sr-f5", prompt: "What makes a systems report reproducible?", options: ["Procedure, environment, measurements, and limits", "Only conclusions", "Only code", "Only citations"], answer: 0, explanation: "Readers need enough context to repeat and assess the work." },
  ],
  "compiler-runtime-architecture": [
    { id: "cr-f1", prompt: "What does a parser produce?", options: ["A structured representation of program syntax", "A network packet", "A database row", "A certificate"], answer: 0, explanation: "Parsers turn tokens into structured syntax." },
    { id: "cr-f2", prompt: "Why compile through an IR?", options: ["It creates a stable boundary for analysis and optimization", "It removes the runtime", "It skips tests", "It replaces the lexer"], answer: 0, explanation: "IR decouples source meaning from target execution details." },
    { id: "cr-f3", prompt: "What does a runtime manage?", options: ["Execution concerns such as calls, memory, and object layout", "Only source formatting", "Only network routes", "Only documentation"], answer: 0, explanation: "A runtime implements the execution model behind language features." },
    { id: "cr-f4", prompt: "What should happen before optimizing?", options: ["Measure a reproducible baseline", "Guess", "Delete tests", "Hide the benchmark"], answer: 0, explanation: "Measurement prevents optimizing the wrong bottleneck." },
    { id: "cr-f5", prompt: "What is a calling convention?", options: ["An ABI contract for function calls", "A PDF standard", "A UI pattern", "A network protocol"], answer: 0, explanation: "It defines how compiled functions exchange arguments and results." },
  ],
};
