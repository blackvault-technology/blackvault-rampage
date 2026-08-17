export type PublicAssessmentQuestion = { id: string; prompt: string; options: string[] };

export const publicFinalAssessmentBank: Record<string, PublicAssessmentQuestion[]> = {
  "ai-product-systems": [
    { id: "aps-f1", prompt: "What is the strongest first step for an AI feature?", options: ["Define the user problem, task, constraints, and quality bar", "Choose the biggest model", "Skip evaluation until launch", "Start with a dashboard"] },
    { id: "aps-f2", prompt: "What should retrieval evidence let a reviewer do?", options: ["Trace an answer back to relevant source context", "Confirm that every answer is correct automatically", "Avoid reading source material", "Hide low-confidence results"] },
    { id: "aps-f3", prompt: "Why version evaluation results?", options: ["To compare changes against a known set and baseline", "To make scores impossible to challenge", "To remove product judgment", "To avoid monitoring"] },
    { id: "aps-f4", prompt: "Which set of signals best describes operating an AI feature?", options: ["Quality, latency, cost, failures, and user impact", "Only token count", "Only uptime", "Only a model card"] },
    { id: "aps-f5", prompt: "What belongs in a responsible AI system brief?", options: ["Data, model, evaluation, costs, failure modes, and next experiment", "Only a prompt", "Only a vendor name", "Only a launch date"] },
  ],
  "ai-evaluation-engineering": [
    { id: "aee-f1", prompt: "What is an evaluation contract?", options: ["A defined task, dataset, rubric, metric, and decision rule", "A model purchase order", "A prompt library without outcomes", "A dashboard theme"] },
    { id: "aee-f2", prompt: "What makes a test set representative?", options: ["It covers normal, difficult, ambiguous, and risk-relevant cases", "It contains only easy examples", "It changes silently each run", "It excludes real failure modes"] },
    { id: "aee-f3", prompt: "What does a rubric add beyond a raw score?", options: ["An explanation of why an output succeeds or fails", "A guarantee of truth", "A replacement for examples", "A way to remove human judgment"] },
    { id: "aee-f4", prompt: "Why track evaluation drift?", options: ["Because data, users, and system behavior change over time", "Because scores never need context", "Because monitoring replaces testing", "Because old results are always wrong"] },
    { id: "aee-f5", prompt: "What makes an evaluation report reproducible?", options: ["Versioned data, procedure, environment, results, and stated limits", "Only a final number", "Only a chart", "Only a model name"] },
  ],
  "ai-data-infrastructure": [
    { id: "adi-f1", prompt: "What should a data contract make explicit?", options: ["Source, ownership, provenance, quality, and permitted use", "Only file size", "Only embedding dimension", "Only a vendor"] },
    { id: "adi-f2", prompt: "Why is chunking a model-facing decision?", options: ["It determines which relationships and evidence reach the context window", "It only changes file names", "It removes retrieval", "It guarantees factuality"] },
    { id: "adi-f3", prompt: "What is the proper role of embeddings in retrieval?", options: ["Retrieve useful candidates that still require relevance and evidence checks", "Prove that a passage is true", "Replace source provenance", "Guarantee the best answer"] },
    { id: "adi-f4", prompt: "What does a freshness policy define?", options: ["When context is stale, who owns invalidation, and how it is observed", "A permanent cache with no expiry", "Only model temperature", "Only document color"] },
    { id: "adi-f5", prompt: "What should a retrieval runbook cover?", options: ["Empty, wrong, stale, and untraceable results with diagnostic steps", "Only successful queries", "Only database uptime", "Only prompt formatting"] },
  ],
  "networking-systems": [
    { id: "net-f1", prompt: "Which sequence best describes a typical web request path?", options: ["Name resolution, transport connection, application request, response", "Compiler, kernel panic, PDF export, response", "Only DNS with no transport", "Only a switch lookup"] },
    { id: "net-f2", prompt: "What is the role of a subnet prefix?", options: ["It identifies the network boundary used for local delivery and routing", "It encrypts every packet", "It assigns a process ID", "It replaces a port number"] },
    { id: "net-f3", prompt: "What does TCP provide above IP?", options: ["Ordered, reliable byte-stream delivery with flow and congestion control", "A wireless radio signal", "A DNS zone", "A physical cable"] },
    { id: "net-f4", prompt: "Which troubleshooting step is strongest?", options: ["Start from a concrete symptom, choose a measurement, and record the evidence", "Change several devices at once", "Trust a diagram without measuring", "Restart everything and record nothing"] },
    { id: "net-f5", prompt: "What is a useful network security boundary?", options: ["A stated trust boundary with controls and expected failure behavior", "A larger logo", "An untested default password", "A hidden route"] },
  ],
  "systems-fundamentals": [
    { id: "sf-f1", prompt: "Which boundary is protected by a system call?", options: ["User space and kernel space", "HTML and CSS", "DNS and HTTP", "Git and Vim"] },
    { id: "sf-f2", prompt: "What does virtual memory provide?", options: ["A process-visible address space mapped to physical memory", "A replacement for tests", "A network route", "A shell prompt"] },
    { id: "sf-f3", prompt: "What does TCP add over an unreliable network?", options: ["Ordered, reliable byte-stream delivery", "A compiler", "A file system", "A CPU"] },
    { id: "sf-f4", prompt: "What does a replicated state machine need?", options: ["A way for replicas to agree on an ordered log", "Only more RAM", "A CSS framework", "A PDF reader"] },
    { id: "sf-f5", prompt: "What makes a project result defensible?", options: ["A reproducible procedure, evidence, and stated limits", "A confident claim", "A hidden test", "A larger UI"] },
  ],
  "ai-systems": [
    { id: "ai-f1", prompt: "Which component measures whether an AI system works for its intended use?", options: ["Evaluation", "Color palette", "Keyboard", "DNS"] },
    { id: "ai-f2", prompt: "What does tokenization do?", options: ["Maps text into model-readable units", "Deploys a GPU", "Creates a database", "Runs a browser"] },
    { id: "ai-f3", prompt: "Why monitor an AI service in production?", options: ["To observe latency, failures, cost, drift, and user impact", "To replace tests", "To hide errors", "To increase font size"] },
    { id: "ai-f4", prompt: "What is a good first AI architecture decision?", options: ["Choose the smallest components that satisfy the goal and quality bar", "Choose the largest model by default", "Skip evaluation", "Avoid logging"] },
    { id: "ai-f5", prompt: "What should an AI system brief include?", options: ["Data, model, tests, costs, failure modes, and next experiment", "Only a prompt", "Only a screenshot", "Only a vendor name"] },
  ],
  "systems-research-lab": [
    { id: "sr-f1", prompt: "What is the core unit of systems research?", options: ["A falsifiable question with evidence", "A slogan", "A screenshot", "An unmeasured intuition"] },
    { id: "sr-f2", prompt: "What should a trace help you do?", options: ["Answer a concrete operational question", "Collect noise forever", "Replace a test", "Hide a timing issue"] },
    { id: "sr-f3", prompt: "What does replication require you to state?", options: ["A consistency promise and failure behavior", "Only the server brand", "Only the UI", "Only the happy path"] },
    { id: "sr-f4", prompt: "Why test restarts and partitions?", options: ["They expose behavior outside the happy path", "They improve typography", "They remove the need for logs", "They guarantee availability"] },
    { id: "sr-f5", prompt: "What makes a systems report reproducible?", options: ["Procedure, environment, measurements, and limits", "Only conclusions", "Only code", "Only citations"] },
  ],
  "compiler-runtime-architecture": [
    { id: "cr-f1", prompt: "What does a parser produce?", options: ["A structured representation of program syntax", "A network packet", "A database row", "A certificate"] },
    { id: "cr-f2", prompt: "Why compile through an IR?", options: ["It creates a stable boundary for analysis and optimization", "It removes the runtime", "It skips tests", "It replaces the lexer"] },
    { id: "cr-f3", prompt: "What does a runtime manage?", options: ["Execution concerns such as calls, memory, and object layout", "Only source formatting", "Only network routes", "Only documentation"] },
    { id: "cr-f4", prompt: "What should happen before optimizing?", options: ["Measure a reproducible baseline", "Guess", "Delete tests", "Hide the benchmark"] },
    { id: "cr-f5", prompt: "What is a calling convention?", options: ["An ABI contract for function calls", "A PDF standard", "A UI pattern", "A network protocol"] },
  ],
};
