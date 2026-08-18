import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const coursePage = readFileSync(resolve(root, "client/src/pages/Course.tsx"), "utf8");
const styles = readFileSync(resolve(root, "client/src/index.css"), "utf8");
const routeMap = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");

describe("responsive learning console", () => {
  it("keeps the course command rail, chapter context, and central scroll workspace distinct", () => {
    expect(coursePage).toContain('className="course-command-bar"');
    expect(coursePage).toContain('className="course-side"');
    expect(coursePage).toContain('className="course-scroll-region"');
    expect(styles).toContain(".course-scroll-region { min-width: 0; min-height: 0; height: 100%; overflow-y: auto;");
  });

  it("uses a mobile fallback that releases the desktop console into touch-friendly flow", () => {
    expect(styles).toContain("@media (max-width: 760px)");
    expect(styles).toContain(".course-layout { display: flex; flex-direction: column; gap: 16px; }");
    expect(styles).toContain(".mobile-app-nav { right: 10px;");
    expect(styles).toContain(".lesson-console { display: block; }");
    expect(styles).toContain(".lesson-console { display: flex; flex-direction: column; gap: 16px; }");
    expect(styles).toContain(".lesson-console .lesson-reveal--main { order: -2; }");
    expect(styles).toContain(".lesson-bottom-actions { position: sticky;");
  });

  it("keeps wide-screen lesson context fixed around one independently scrollable study column", () => {
    expect(styles).toContain(".lesson-console { min-height: 0; height: 100%; gap: 0; grid-template-columns: 252px minmax(0,1fr) 276px;");
    expect(styles).toContain(".lesson-console .lesson-reveal--main { border-inline: 1px solid");
    expect(styles).toContain(".lesson-console .lesson-reveal { min-height: 0; height: 100%; overflow-y: auto;");
  });

  it("keeps overview browsing public while retaining the protected lesson workspace", () => {
    expect(routeMap).toContain('<Route path="/course/:courseId" component={Course} />');
    expect(routeMap).toContain('<Route path="/course/:courseId/lesson/:lessonId"><AccountRequired><Lesson /></AccountRequired></Route>');
  });
});
