import { courses, pdfCatalog } from "./catalog";
import type { LearningPath } from "./paths";

export type Recommendation = {
  pathId: string;
  stepIndex: number;
  id: string;
  kind: "course" | "resource";
  title: string;
  label: string;
  why: string;
  href: string;
  detail: string;
};

export function recommendNextSource(path: LearningPath, completed: Set<string>, readResources: Set<string>): Recommendation | null {
  for (let stepIndex = 0; stepIndex < path.steps.length; stepIndex += 1) {
    const step = path.steps[stepIndex];
    if (step.type === "resource") {
      if (readResources.has(step.id)) continue;
      const resource = pdfCatalog.find((item) => item.id === step.id);
      return {
        pathId: path.id,
        stepIndex,
        id: step.id,
        kind: "resource",
        title: resource?.title ?? step.label,
        label: step.label,
        why: step.why,
        href: `/resources/read/${step.id}`,
        detail: resource ? `${resource.topic} · ${resource.readTime}` : "Primary source",
      };
    }

    const course = courses.find((item) => item.id === step.id);
    if (!course) continue;
    const lessons = course.phases.flatMap((phase) => phase.lessons.map((lesson) => ({ ...lesson, phase: phase.title })));
    const nextLesson = lessons.find((lesson) => !completed.has(`${course.id}:${lesson.id}`));
    if (!nextLesson) continue;
    return {
      pathId: path.id,
      stepIndex,
      id: `${course.id}:${nextLesson.id}`,
      kind: "course",
      title: nextLesson.title,
      label: course.title,
      why: step.why,
      href: `/course/${course.id}/lesson/${nextLesson.id}`,
      detail: `${course.title} · ${nextLesson.duration}`,
    };
  }
  return null;
}

export function selectedPathId(): string {
  if (typeof window === "undefined") return "systems-builder";
  return localStorage.getItem("rampage-selected-path") || "systems-builder";
}
