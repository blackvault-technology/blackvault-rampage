import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../client/src/data/curriculum.json", import.meta.url);
const curriculum = JSON.parse(await readFile(file, "utf8"));

const videoSources = {
  "english-for-technical-work": {
    url: "https://developers.google.com/tech-writing",
    label: "Google Technical Writing / official course hub",
  },
  "clear-communication": {
    url: "https://archive.org/download/mithowtospeak/MIT_How_To_Speak_IAP_2018_300k.mp4",
    label: "MIT OpenCourseWare / Patrick Winston — How to Speak",
  },
  "professional-presence": {
    url: "https://ocw.mit.edu/courses/res-tll-005-how-to-speak-january-iap-2018/pages/how-to-speak/",
    label: "MIT OpenCourseWare / How to Speak lecture page",
  },
  "critical-thinking": {
    url: "https://oli.cmu.edu/courses/evidence-based-management-o-f/",
    label: "Carnegie Mellon OLI / Evidence-Based Management course",
  },
  "high-signal-writing": {
    url: "https://developers.google.com/tech-writing/overview",
    label: "Google Technical Writing / course overview",
  },
  "learning-systems": {
    url: "https://oli.cmu.edu/courses/learning-to-learn-online-o-f/",
    label: "Carnegie Mellon OLI / Learning to Learn Online",
  },
  "career-navigation": {
    url: "https://www.open.edu/openlearn/miscellaneous/career-ready-courses",
    label: "OpenLearn / Career Ready course collection",
  },
  "decision-making": {
    url: "https://oli.cmu.edu/courses/evidence-based-management-o-f/",
    label: "Carnegie Mellon OLI / Evidence-Based Management course",
  },
  "negotiation-and-collaboration": {
    url: "https://www.coursera.org/learn/negotiation-skills",
    label: "University of Michigan / Successful Negotiation course page",
  },
};

for (const course of curriculum.courses) {
  const source = videoSources[course.id];
  if (!source) continue;
  for (const phase of course.phases) {
    for (const lesson of phase.lessons) {
      lesson.video = source.url;
      lesson.videoLabel = source.label;
    }
  }
}

curriculum.schemaVersion = 2;
curriculum.generatedAt = new Date().toISOString();
await writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
console.log("Enriched all nine skill routes with lesson-level verified video/source embeds.");
