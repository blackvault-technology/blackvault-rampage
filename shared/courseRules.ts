export const COURSE_RULES = {
  "systems-fundamentals": { lessonCount: 13, chapterCount: 6, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 },
  "ai-systems": { lessonCount: 10, chapterCount: 5, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 },
  "systems-research-lab": { lessonCount: 8, chapterCount: 4, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 },
  "compiler-runtime-architecture": { lessonCount: 8, chapterCount: 4, passScore: 80, finalQuestionCount: 5, maxAssessmentAttemptsPerDay: 3 },
} as const;

export const COURSE_LESSON_COUNTS = Object.fromEntries(
  Object.entries(COURSE_RULES).map(([id, rule]) => [id, rule.lessonCount]),
) as { [K in keyof typeof COURSE_RULES]: (typeof COURSE_RULES)[K]["lessonCount"] };

export type SupportedCourseId = keyof typeof COURSE_RULES;

export function isSupportedCourse(courseId: string): courseId is SupportedCourseId {
  return courseId in COURSE_RULES;
}

export function getCourseRule(courseId: string) {
  return isSupportedCourse(courseId) ? COURSE_RULES[courseId] : undefined;
}

export function isAssessmentWithinWindow(startedAt: number, submittedAt: number, maxSeconds = 16 * 60, clockSkewMs = 5_000) {
  if (startedAt > submittedAt + clockSkewMs) return false;
  return submittedAt - startedAt <= maxSeconds * 1000;
}

export function buildAttemptIntegrity(input: { startedAt: number; submittedAt: number; tabSwitches: number; fullscreenExits: number; questionOrder: string[] }) {
  return {
    startedAt: new Date(input.startedAt).toISOString(),
    submittedAt: new Date(input.submittedAt).toISOString(),
    elapsedSeconds: Math.max(0, Math.round((input.submittedAt - input.startedAt) / 1000)),
    tabSwitches: Math.max(0, input.tabSwitches),
    fullscreenExits: Math.max(0, input.fullscreenExits),
    questionOrderHash: input.questionOrder.join("|").slice(0, 512),
  };
}
