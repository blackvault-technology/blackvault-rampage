import { describe, expect, it } from "vitest";
import { courses, resourceCatalog } from "../client/src/data/catalog";
import { canStudyInline, classifyInlineSource, verifiedPracticeByPhase } from "../client/src/data/learningSources";
import { topSkillCourses } from "../client/src/data/topSkillCourses";
import curriculum from "../client/src/data/curriculum.json";
import { chapterQuizBank, finalAssessmentBank } from "../shared/courseAssessments";

describe("verified Rampage curriculum sources", () => {
  it("maps every active course phase to a bounded, source-backed practice brief", () => {
    for (const course of courses) {
      for (const phase of course.phases) {
        const brief = verifiedPracticeByPhase[phase.id];
        expect(brief, `${course.id}/${phase.id} needs verified practice`).toBeDefined();
        expect(brief.sourceUrl).toMatch(/^https:\/\//);
        expect(brief.steps.length).toBeGreaterThanOrEqual(3);
        expect(brief.evidencePrompt.length).toBeGreaterThan(20);
      }
    }
  });

  it("classifies study surfaces conservatively and keeps community mirrors out of the primary catalog", () => {
    expect(classifyInlineSource("https://pages.cs.wisc.edu/~remzi/OSTEP/")).toBe("web");
    expect(classifyInlineSource("https://raft.github.io/raft.pdf")).toBe("pdf");
    expect(classifyInlineSource("https://github.com/mit-pdos/xv6-riscv")).toBe("repository");
    expect(classifyInlineSource("https://www.youtube.com/watch?v=example")).toBe("video");
    expect(canStudyInline("https://example.invalid/unknown")).toBe(false);
    expect(resourceCatalog.some((resource) => /community mirror/i.test(resource.note ?? ""))).toBe(false);
  });

  it("keeps the JSON content model versioned and lesson media coverage complete", () => {
    expect(curriculum.schemaVersion).toBeGreaterThanOrEqual(2);
    expect(curriculum.courses.length).toBeGreaterThanOrEqual(courses.length);
    for (const course of topSkillCourses) {
      for (const phase of course.phases) {
        for (const lesson of phase.lessons) {
          expect(lesson.video, `${course.id}/${lesson.id} needs a video or official source hub`).toMatch(/^https:\/\//);
          expect(lesson.videoLabel?.length, `${course.id}/${lesson.id} needs provenance label`).toBeGreaterThan(10);
        }
      }
    }
  });

  it("gives every active course complete lesson media, source, and applied-lab coverage", () => {
    for (const course of courses) {
      for (const phase of course.phases) {
        for (const lesson of phase.lessons) {
          expect(lesson.video, `${course.id}/${lesson.id} needs an official lecture target`).toMatch(/^https:\/\//);
          expect(lesson.videoLabel?.length, `${course.id}/${lesson.id} needs lecture provenance`).toBeGreaterThan(10);
          expect(lesson.resources?.[0]?.url, `${course.id}/${lesson.id} needs a primary source`).toMatch(/^https:\/\//);
          expect(lesson.lab?.brief, `${course.id}/${lesson.id} needs an applied lab brief`).toBeTruthy();
          expect(lesson.lab?.deliverable, `${course.id}/${lesson.id} needs a lab deliverable`).toBeTruthy();
        }
      }
    }
  });

  it("gives every active course a working chapter quiz and final assessment bank", () => {
    for (const course of courses) {
      expect(chapterQuizBank[course.id], `${course.id} needs chapter quiz coverage`).toBeDefined();
      expect(chapterQuizBank[course.id].length, `${course.id} needs chapter questions`).toBeGreaterThanOrEqual(3);
      expect(finalAssessmentBank[course.id], `${course.id} needs final assessment coverage`).toBeDefined();
      expect(finalAssessmentBank[course.id].length, `${course.id} needs final questions`).toBeGreaterThanOrEqual(5);
      for (const question of [...chapterQuizBank[course.id], ...finalAssessmentBank[course.id]]) {
        expect(question.options).toHaveLength(4);
        expect(question.explanation.length).toBeGreaterThan(20);
        expect(question.answer).toBeGreaterThanOrEqual(0);
        expect(question.answer).toBeLessThan(question.options.length);
      }
    }
  });

  it("keeps the deep Python route beginner-to-advanced and browser-lab ready", () => {
    const python = courses.find((course) => course.id === "python-engineering");
    expect(python).toBeDefined();
    expect(python?.status).toBe("DEEP COURSE");
    expect(python?.phases).toHaveLength(5);
    const lessons = python?.phases.flatMap((phase) => phase.lessons) ?? [];
    expect(lessons).toHaveLength(15);
    expect(lessons[0]?.title).toMatch(/program|python/i);
    expect(lessons.at(-1)?.title).toMatch(/capstone/i);
    expect(lessons.every((lesson) => lesson.lab?.brief && lesson.lab.deliverable)).toBe(true);
    expect(lessons.every((lesson) => lesson.codeLab?.provider === "PYODIDE")).toBe(true);
    expect(lessons.every((lesson) => lesson.codeLab?.embedUrl === "https://pyodide.org/en/stable/console.html")).toBe(true);
    expect(lessons.every((lesson) => lesson.resources.length >= 2)).toBe(true);
  });

  it("keeps all nine high-leverage skill routes structured, source-backed, and evidence-led", () => {
    expect(topSkillCourses).toHaveLength(9);
    for (const course of topSkillCourses) {
      expect(courses.some((candidate) => candidate.id === course.id)).toBe(true);
      expect(course.status).toBe("NEW ROUTE");
      expect(course.sourceUrl).toMatch(/^https:\/\//);
      expect(course.phases).toHaveLength(3);
      for (const phase of course.phases) {
        expect(phase.project.length).toBeGreaterThan(12);
        expect(phase.lessons).toHaveLength(2);
        for (const lesson of phase.lessons) {
          expect(lesson.resources.length).toBeGreaterThan(0);
          expect(lesson.resources.every((resource) => resource.url.startsWith("https://"))).toBe(true);
        }
      }
    }
  });
});
