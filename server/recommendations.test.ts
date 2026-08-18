import { describe, expect, it } from "vitest";
import { learningPaths } from "@/data/paths";
import { recommendNextSource } from "@/data/recommendations";

describe("progress-aware source recommendations", () => {
  it("recommends the first unfinished step in the selected path", () => {
    const path = learningPaths[0];
    const recommendation = recommendNextSource(path, new Set(), new Set());
    expect(recommendation).not.toBeNull();
    expect(recommendation?.stepIndex).toBe(0);
    expect(recommendation?.pathId).toBe(path.id);
  });

  it("moves past completed lessons and read sources", () => {
    const path = learningPaths[0];
    const first = recommendNextSource(path, new Set(), new Set());
    expect(first).not.toBeNull();
    const completed = first?.kind === "course" ? new Set([first.id]) : new Set<string>();
    const read = first?.kind === "resource" ? new Set([first.id]) : new Set<string>();
    const next = recommendNextSource(path, completed, read);
    expect(next).not.toBeNull();
    expect(next?.id).not.toBe(first?.id);
  });
});
