# Expansion QA Notes

- `/course/networking-systems` rendered as a full six-chapter, twelve-lesson curriculum with final-assessment handoff and source-backed chapter metadata.
- `/learn` rendered the new server/local evidence progress matrix, course cards, verified badge grid, reading queue, and route strip.
- `/assessment/ai-systems` rendered the branded 404 fallback in this capture, so the assessment route pattern must be checked against `App.tsx` before claiming scorecard/share visual verification.
- The capture was desktop full-page at 1280px; a separate mobile capture remains required for the new surfaces.

The corrected mobile capture verified `/course/networking-systems`, `/learn`, and `/course/networking-systems/assessment` at 390×844. Networking remains legible and contained; My Learning stacks the course cards, progress matrix, badges, reading queue, and routes; the assessment gate is branded, login-gated, and readable. The previous `/assessment/ai-systems` 404 was a wrong route test, not an application defect: the registered route is `/course/:courseId/assessment`.
