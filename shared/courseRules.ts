export const COURSE_LESSON_COUNTS = {
  "systems-fundamentals": 12,
  "ai-systems": 10,
  "distributed-systems": 8,
  "security-engineering": 8,
} as const;

export type SupportedCourseId = keyof typeof COURSE_LESSON_COUNTS;

export function isSupportedCourse(courseId: string): courseId is SupportedCourseId {
  return courseId in COURSE_LESSON_COUNTS;
}
