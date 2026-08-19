import fs from "node:fs";

const file = new URL("../client/src/data/curriculum.json", import.meta.url);
const payload = JSON.parse(fs.readFileSync(file, "utf8"));
let labsAdded = 0;
let lectureHubsAdded = 0;

for (const course of payload.courses) {
  for (const phase of course.phases) {
    for (const lesson of phase.lessons) {
      if (!lesson.lab) {
        lesson.lab = {
          title: `${lesson.title} applied lab`,
          brief: `Use the lesson's source material to work through a bounded ${course.title} exercise. Start with the smallest observable case, record one decision, and test one failure mode before expanding it.`,
          deliverable: `A concise artifact for ${lesson.title}: working notes or code, one observed result, and a short explanation of the trade-off you chose.`,
          difficulty: phase.number === "01" ? "FOUNDATION" : phase.number === "02" ? "BUILD" : "APPLY",
        };
        labsAdded += 1;
      }
      if (!lesson.video) {
        lesson.video = course.sourceUrl;
        lesson.videoLabel = "Official course lecture hub • inline playback depends on publisher policy";
        lectureHubsAdded += 1;
      }
    }
  }
}

payload.schemaVersion = Math.max(payload.schemaVersion ?? 0, 4);
payload.generatedAt = new Date().toISOString();
fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Added ${labsAdded} lesson labs and ${lectureHubsAdded} official lecture-hub targets.`);
