import { describe, expect, it } from "vitest";
import { courses, resourceCatalog } from "../client/src/data/catalog";
import { canStudyInline, classifyInlineSource, verifiedPracticeByPhase } from "../client/src/data/learningSources";

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
});
