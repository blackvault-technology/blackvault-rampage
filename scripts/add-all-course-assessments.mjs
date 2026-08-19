import fs from "node:fs";

const file = new URL("../shared/courseAssessments.ts", import.meta.url);
let source = fs.readFileSync(file, "utf8");

const profiles = {
  "english-for-technical-work": {
    prefix: "eng",
    foundation: "What makes technical English easier to act on?",
    foundationAnswer: "A clear purpose, audience, structure, and checkable wording",
    foundationExplanation: "Technical English reduces ambiguity by making purpose, audience, structure, and expected action visible.",
    advanced: "How should a technical writer handle an uncertain claim?",
    advancedAnswer: "State the evidence, uncertainty, assumptions, and next verification step",
    advancedExplanation: "Honest technical writing makes uncertainty inspectable instead of hiding it behind confident language.",
  },
  "clear-communication": {
    prefix: "com",
    foundation: "What is the first move in a difficult workplace conversation?",
    foundationAnswer: "Name the shared outcome and the observable situation",
    foundationExplanation: "A shared outcome and observable situation give the conversation a concrete starting point.",
    advanced: "What makes a communication decision durable?",
    advancedAnswer: "A recorded decision, owner, rationale, and explicit follow-up",
    advancedExplanation: "Durable communication leaves enough context for others to act without reconstructing the conversation.",
  },
  "professional-presence": {
    prefix: "pre",
    foundation: "What creates credible professional presence?",
    foundationAnswer: "Prepared thinking, reliable follow-through, and respectful clarity",
    foundationExplanation: "Presence is a pattern of preparation and dependable behavior, not performance or status signals.",
    advanced: "What should a professional handoff include?",
    advancedAnswer: "Context, decision, evidence, owner, risks, and the next checkpoint",
    advancedExplanation: "A strong handoff transfers enough context and accountability for another person to continue the work.",
  },
  "critical-thinking": {
    prefix: "crit",
    foundation: "What is the difference between a claim and evidence?",
    foundationAnswer: "A claim is what is asserted; evidence is what supports or challenges it",
    foundationExplanation: "Separating claim from evidence prevents confidence, authority, or repetition from being mistaken for support.",
    advanced: "What should a critical-thinking review test first?",
    advancedAnswer: "Definitions, assumptions, causal links, counterexamples, and decision consequences",
    advancedExplanation: "A rigorous review examines the structure beneath the conclusion, not only whether the conclusion sounds plausible.",
  },
  "high-signal-writing": {
    prefix: "write",
    foundation: "What makes a work document high-signal?",
    foundationAnswer: "The reader can quickly find the decision, evidence, and requested action",
    foundationExplanation: "High-signal writing respects the reader’s attention and makes the operational point easy to locate.",
    advanced: "How should a writer revise a complex technical proposal?",
    advancedAnswer: "Separate the decision, context, alternatives, evidence, risks, and implementation plan",
    advancedExplanation: "A stable decision structure lets readers evaluate trade-offs without confusing background with recommendation.",
  },
  "learning-systems": {
    prefix: "learn",
    foundation: "What turns study time into durable learning?",
    foundationAnswer: "Retrieval, feedback, spacing, and deliberate practice",
    foundationExplanation: "Durable learning comes from recalling and applying ideas over time, not from rereading alone.",
    advanced: "What should a learning system measure?",
    advancedAnswer: "The target skill, evidence of transfer, error patterns, and the next practice decision",
    advancedExplanation: "A useful learning system measures behavior and adaptation, not only hours spent or pages completed.",
  },
  "career-navigation": {
    prefix: "career",
    foundation: "What makes a career goal actionable?",
    foundationAnswer: "A target role, current evidence, skill gaps, and a next experiment",
    foundationExplanation: "A goal becomes actionable when it can be tested through evidence and small experiments.",
    advanced: "What makes a portfolio signal credible?",
    advancedAnswer: "A real artifact, clear contribution, evidence of decisions, and an honest account of limits",
    advancedExplanation: "Credible career evidence shows what was built, why choices were made, and what remains imperfect.",
  },
  "decision-making": {
    prefix: "decide",
    foundation: "What should a decision brief clarify first?",
    foundationAnswer: "The decision, options, constraints, and evaluation criteria",
    foundationExplanation: "Decision quality improves when the problem and the standard for choosing are explicit.",
    advanced: "When is a reversible experiment better than a final commitment?",
    advancedAnswer: "When uncertainty is high and a low-cost test can produce useful evidence",
    advancedExplanation: "Reversible experiments preserve optionality while converting uncertainty into information.",
  },
  "negotiation-and-collaboration": {
    prefix: "nego",
    foundation: "What is the first preparation step for a negotiation?",
    foundationAnswer: "Separate interests, constraints, alternatives, and the shared problem",
    foundationExplanation: "Preparation makes it possible to negotiate the problem rather than react to positions.",
    advanced: "What makes a collaboration agreement robust?",
    advancedAnswer: "Shared outcomes, decision rights, responsibilities, escalation paths, and review points",
    advancedExplanation: "Collaboration becomes dependable when coordination rules are explicit before pressure arrives.",
  },
  "python-engineering": {
    prefix: "py",
    foundation: "What is the clearest way to understand a Python program’s behavior?",
    foundationAnswer: "Trace values, control flow, data structures, and boundaries with small experiments",
    foundationExplanation: "Small experiments expose Python’s runtime behavior more reliably than memorizing syntax.",
    advanced: "What makes a Python service production-ready?",
    advancedAnswer: "Explicit interfaces, tests, observability, dependency control, failure handling, and reproducible deployment",
    advancedExplanation: "Production readiness is an operating contract around the code, not simply a successful local run.",
  },
};

const optionSets = [
  ["A clear purpose, boundary, and observable evidence", "A larger file", "A confident tone only", "More configuration without a goal"],
  ["A versioned test, baseline, and failure case", "A screenshot only", "A single lucky run", "An unrecorded assumption"],
  ["Explicit ownership, constraints, and next action", "No documentation", "A hidden dependency", "A promise that nothing can fail"],
];

function questions(profile) {
  const chapter = [
    { id: `${profile.prefix}-q1`, prompt: profile.foundation, options: [profile.foundationAnswer, "A larger file", "A confident tone only", "More configuration without a goal"], answer: 0, explanation: profile.foundationExplanation },
    { id: `${profile.prefix}-q2`, prompt: "What is the strongest beginner practice for this route?", options: ["Make a small change, observe the result, and explain the evidence", "Skip the experiment and copy a final answer", "Avoid recording failures", "Use complexity as proof of understanding"], answer: 0, explanation: "Small observable experiments create feedback and make reasoning inspectable." },
    { id: `${profile.prefix}-q3`, prompt: "What should a learner do when a result is surprising?", options: ["Reduce the problem, state a hypothesis, and test one variable", "Hide the result", "Change everything at once", "Assume the tool is always wrong"], answer: 0, explanation: "Reducing the problem and changing one variable turns surprise into useful evidence." },
  ];
  const final = [
    { id: `${profile.prefix}-f1`, prompt: profile.advanced, options: [profile.advancedAnswer, "Remove all caveats", "Choose the most complicated option", "Treat a first draft as final evidence"], answer: 0, explanation: profile.advancedExplanation },
    { id: `${profile.prefix}-f2`, prompt: "Which artifact best demonstrates applied understanding?", options: ["A working artifact with a short explanation, evidence, tests, and known limits", "A screenshot without context", "A copied solution with no attribution", "A list of terms"], answer: 0, explanation: "Applied understanding is visible in an artifact and the reasoning and evidence around it." },
    { id: `${profile.prefix}-f3`, prompt: "What should an advanced learner do before claiming improvement?", options: ["Define a baseline, compare a repeatable case, and state limitations", "Choose the most flattering example", "Remove difficult cases", "Rely on intuition alone"], answer: 0, explanation: "A baseline and repeatable comparison make improvement claims inspectable." },
    { id: `${profile.prefix}-f4`, prompt: "What is a responsible response to an unresolved limitation?", options: ["Document it, bound its impact, and define the next investigation", "Ignore it", "Call the work complete without qualification", "Blame the learner"], answer: 0, explanation: "Explicit limits protect the learner and make future work more focused." },
    { id: `${profile.prefix}-f5`, prompt: "What does the final assessment primarily test?", options: ["Whether the learner can apply concepts, justify choices, and inspect failure", "Whether the learner remembers every sentence", "Whether the learner used the largest tool", "Whether the learner avoided difficult cases"], answer: 0, explanation: "The final test should assess transfer, reasoning, and failure-aware practice rather than memorization alone." },
  ];
  return { chapter, final };
}

const chapterEntries = Object.entries(profiles).map(([id, profile]) => `  ${JSON.stringify(id)}: ${JSON.stringify(questions(profile).chapter)},`).join("\n");
const finalEntries = Object.entries(profiles).map(([id, profile]) => `  ${JSON.stringify(id)}: ${JSON.stringify(questions(profile).final)},`).join("\n");

const chapterMarker = "export const chapterQuizBank: Record<string, AssessmentQuestion[]> = {\n";
const finalMarker = "export const finalAssessmentBank: Record<string, AssessmentQuestion[]> = {\n";
const chapterInsert = `${chapterMarker}${chapterEntries}\n`;
const finalInsert = `${finalMarker}${finalEntries}\n`;

if (!source.includes(chapterMarker) || !source.includes(finalMarker)) throw new Error("Assessment map markers not found");
for (const id of Object.keys(profiles)) {
  if (source.includes(`  ${JSON.stringify(id)}:`)) throw new Error(`Assessment coverage already exists for ${id}`);
}
source = source.replace(chapterMarker, chapterInsert).replace(finalMarker, finalInsert);
fs.writeFileSync(file, source);
console.log(`Added chapter and final assessments for ${Object.keys(profiles).length} courses.`);
