import { courses, type Course } from "./catalog";

/** The nine high-leverage routes are authored in curriculum.json and exposed here for catalogue filters. */
export const topSkillCourses: Course[] = courses.filter((course) => course.eyebrow.includes("NEW ROUTE") || course.eyebrow.includes("TOP-TIER SKILL"));
export const topSkillCourseIds = topSkillCourses.map((course) => course.id);
