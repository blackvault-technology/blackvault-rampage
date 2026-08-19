import fs from "node:fs";

const curriculum = JSON.parse(fs.readFileSync(new URL("../client/src/data/curriculum.json", import.meta.url), "utf8"));
const courses = curriculum.courses ?? curriculum;
const rows = courses.map((course) => {
  const phases = course.phases ?? [];
  const lessons = phases.flatMap((phase) => phase.lessons ?? []);
  const videos = lessons.filter((lesson) => typeof lesson.video === "string" || lesson.video?.url || lesson.videoUrl || lesson.video?.embedUrl);
  const sources = lessons.filter((lesson) => (lesson.sources ?? lesson.resources ?? []).length > 0);
  const labs = lessons.filter((lesson) => lesson.lab || lesson.practice || lesson.codeLab || lesson.labBrief);
  return {
    id: course.id,
    title: course.title,
    status: course.status,
    phases: phases.length,
    lessons: lessons.length,
    videos: videos.length,
    sources: sources.length,
    labs: labs.length,
    avgLessonsPerPhase: phases.length ? (lessons.length / phases.length).toFixed(1) : "0.0",
  };
});
console.log(JSON.stringify({ courseCount: rows.length, rows }, null, 2));
