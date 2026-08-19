import fs from "node:fs";
import { chapterQuizBank, finalAssessmentBank } from "../shared/courseAssessments.ts";
const curriculum = JSON.parse(fs.readFileSync(new URL("../client/src/data/curriculum.json", import.meta.url), "utf8"));
const ids = curriculum.courses.map((course) => course.id);
const rows = ids.map((id) => ({ id, chapterQuestions: chapterQuizBank[id]?.length ?? 0, finalQuestions: finalAssessmentBank[id]?.length ?? 0 }));
console.log(JSON.stringify({ courseCount: rows.length, rows }, null, 2));
