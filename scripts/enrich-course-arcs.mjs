import fs from "node:fs";

const file = new URL("../client/src/data/curriculum.json", import.meta.url);
const payload = JSON.parse(fs.readFileSync(file, "utf8"));

for (const course of payload.courses) {
  const phaseTitles = course.phases.map((phase) => phase.title);
  course.learningArc = [
    { stage: "ORIENT", label: "Absolute beginner", description: "Start with the vocabulary, mental model, and first observable example." },
    { stage: "BUILD", label: "Guided capability", description: `Build through ${phaseTitles.slice(0, Math.max(1, Math.ceil(phaseTitles.length / 2))).join(", ")}.` },
    { stage: "APPLY", label: "Evidence in practice", description: "Use source-backed exercises, critique, and a bounded artifact to make the skill inspectable." },
    { stage: "MASTER", label: "Mastery evidence", description: "Explain trade-offs, handle failure cases, and define the next independent project." },
  ];
  course.assessmentSummary = {
    chapterQuestions: course.id === "cpp-engineering" || course.id === "c-foundations" ? 6 : 3,
    finalQuestions: 5,
    format: "one-question-at-a-time with explanations and a final score report",
  };
}

payload.schemaVersion = Math.max(payload.schemaVersion ?? 0, 4);
payload.generatedAt = new Date().toISOString();
fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Enriched ${payload.courses.length} courses with learning arcs and assessment summaries.`);
