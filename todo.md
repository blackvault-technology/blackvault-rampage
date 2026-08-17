# Rampage Guided Learning Upgrade

- [x] Research and define a beginner-friendly AI Systems learning sequence using top-tier official sources.
- [x] Create curated learning paths that group courses, resources, projects, and progression levels.
- [x] Add a simple AI Systems course with clear prerequisites, short steps, source context, and practical checkpoints.
- [x] Add reader state for bookmarks, highlights, notes, and continue-reading position.
- [x] Add a simple reader toolbar and saved-items views without making the interface feel complex.
- [x] Improve navigation, onboarding language, course discovery, and next-action UX.
- [x] Validate AI Systems routes, path navigation, reader persistence, responsive layouts, type checking, and production build.
- [x] Save the upgraded ecosystem checkpoint and report the result.

## Continue: My Learning Dashboard
- [x] Inspect existing progress, reader persistence, and navigation structures.
- [x] Design a simple dashboard with prioritized next actions and saved-state summaries.
- [x] Implement My Learning route, progress cards, saved paths, and continue-reading cards.
- [x] Add the dashboard to primary navigation without increasing complexity.
- [x] Validate responsive behavior and local persistence.
- [x] Save the My Learning checkpoint and report the result.

## Major Update: Source-First Deep Course Flow
- [x] Inspect the current lesson player, course structure, and source-panel behavior.
- [x] Define deeper course navigation, lesson states, checkpoints, and lab progression.
- [x] Remove visible video embeds from reading-and-lab lessons; keep original sources as explicit links.
- [x] Implement a course sidebar, lesson progress rail, source panel, lab brief, checkpoint state, and next-lesson guidance.
- [x] Add deeper onboarding and course-level UX inspired by modern learning platforms without copying their interfaces.
- [x] Validate lesson routes, source links, local progress, responsive layouts, and production build.
- [x] Save the major learning-flow checkpoint and report the result.

## Major Update: Neon Full-Stack + UX Polish
- [x] Audit the current frontend, auth readiness, project structure, and UX bug surface.
- [x] Upgrade the static project to full-stack capability without using a built-in AI backend.
- [x] Define Neon-backed user, progress, reading-state, certificate, and audit data models.
- [x] Implement authenticated account flow and protect certificate issuance behind login.
- [x] Persist course progress, reader bookmarks, highlights, notes, and resume state in Neon.
- [x] Implement server-verified certificate eligibility and certificate records after course completion.
- [x] Apply a targeted UX and micro-interaction polish pass across onboarding, navigation, lessons, resources, reader, My Learning, and certificates.
- [x] Test auth gates, protected procedure boundaries, certificate rules, responsive behavior, visual states, and production build; document authenticated-session limitations.
- [x] Save the full-stack UX upgrade checkpoint and report the result.

## Rebuild: Real Course System

- [x] Audit and remove placeholder or mock course data, links, embeds, durations, and completion claims.
- [x] Research and verify real course pages, lesson videos, notes, PDFs, labs, and durations for every active course. (Completed URL and record-level metadata audit; catalog maintenance remains ongoing.)
- [x] Define a normalized course > chapter > lesson > quiz > final assessment content model.
- [x] Rebuild course entry flow with prerequisites, outcomes, chapters, progress, and a clear start/resume action.
- [x] Add real lesson sources, optional video links, notes, reading resources, and verified durations.
- [x] Add lesson quizzes and chapter completion gates with persistent state.
- [x] Add a final course assessment required before certificate eligibility.
- [x] Add defensible anti-cheating controls: authenticated attempts, randomized question order, time window, attempt limits, server-side scoring, and audit events; do not claim impossible cheat prevention.
- [x] Add local timeline resume with last position, continue lesson, and cross-device-safe fallback messaging.
- [x] Validate every active course route, source link, embed, duration, quiz, assessment, certificate gate, responsive state, and security boundary.
- [x] Save the rebuilt course-system checkpoint and report implementation limits and next steps.

## Continue: Premium UI/UX and Course Design Polish
- [x] Audit current academy, course, lesson, assessment, certificate, and My Learning screens for hierarchy, friction, and responsive polish.
- [x] Refine the Swiss technical-manual visual system with stronger geometry, signal colors, typography, spacing, and state treatment.
- [x] Improve course storytelling with clearer module arcs, lesson intent, evidence checkpoints, and next-step guidance.
- [x] Simplify learner flows while preserving authenticated persistence and server-verified certification.
- [x] Validate representative desktop/mobile routes, tests, production build, and save a polished checkpoint.
- [x] Add explicit simplified learner-flow cues across course, lesson, assessment, and certificate pages.
- [x] Verify the authenticated learner journey in code-visible UI states, including persistence and certificate eligibility boundaries; full OAuth-session replay remains a manual verification step because no authenticated browser session was available.

## Continue: Udemy-Style Course Workspace Upgrade
- [x] Audit the current course, lesson, video, progress, quiz, and next-lesson architecture.
- [x] Design a smart course workspace with persistent navigation, media-first lesson layout, and clear progress states.
- [x] Add verified video playback where lesson metadata contains real video sources, with source-first fallback for reading/lab lessons.
- [x] Improve next-lesson, chapter completion, quiz, timeline, and certificate handoff cues across multiple courses.
- [x] Validate desktop/mobile flows, tests, production build, and save a new checkpoint.

## Continue: Full Ecosystem Polish Pass
- [x] Audit the full learner surface area across home, catalog, course, lesson, My Learning, resources, assessment, and certificate routes.
- [x] Refine shared navigation, progress indicators, and workspace hierarchy for a coherent Udemy-style flow.
- [x] Polish media-first video and source-led lesson states across multiple courses without inventing content.
- [x] Review dashboard, assessment, certificate, empty, loading, and mobile states for compatibility with the workspace polish; no new backend or certificate behavior was required in this pass.
- [x] Validate representative routes, tests, production build, and save the full polish checkpoint.

## Continue: Full Lesson Page Upgrade
- [x] Audit lesson-page hierarchy, metadata, navigation, media, source, lab, quiz, and completion friction.
- [x] Upgrade lesson workspace navigation with stronger chapter context, previous/next movement, and progress visibility.
- [x] Polish video, reading-room, lab, evidence, timeline, quiz, and completion states using only real lesson data.
- [x] Improve responsive lesson layouts and handoffs into chapter completion, assessment, and certification.
- [x] Validate representative video and reading lessons on desktop/mobile, run tests/build, and save a checkpoint.
- [x] Fix lesson quiz submission so the handler is invoked and verify its state transitions.
- [x] Replace the generic lab fallback with clearly labeled course-authored instructions tied to lesson metadata.
- [x] Add explicit state-aware lesson-end handoffs into final assessment and certificate eligibility.
- [x] Save a recoverable checkpoint after the corrected lesson-page validation.
- [x] Review lesson quiz pass/fail/retry rendering branches in the lesson UI; automated server tests pass, while interactive browser replay remains a manual QA recommendation.
- [x] Add and verify an explicit certificate-eligibility cue at the final lesson handoff: pass the final assessment to unlock the Rampage digital certificate.
- [x] Save a new checkpoint after resolving the final lesson-page validation gaps.

## Continue: Quiz and Timeline Checkpoint Area
- [x] Audit current quiz and timeline copy, controls, states, and persistence messaging.
- [x] Redesign the two sections as a unified learning checkpoint area with clearer hierarchy and next actions.
- [x] Improve quiz selection, submission, passed/retry feedback, and timeline resume controls using existing real data.
- [x] Validate desktop/mobile states, tests, production build, and save a checkpoint.
- [x] Format timeline position as mm:ss and remove the incorrect minutes label.
- [x] Base the checkpoint rail on lesson duration data, with a safe 3-minute fallback for lessons lacking parseable duration metadata.
- [x] Save a recoverable checkpoint after the timeline correction.
- [x] Save a new recoverable checkpoint after the validated mm:ss and duration-based timeline changes.

## Continue: Gamified Secure Assessment and SEO Upgrade
- [ ] Audit assessment, quiz, progress, SEO metadata, sitemap/robots, and repository readiness.
- [ ] Design a non-monetary learning XP system with secure server-verified awards and transparent learner states.
- [ ] Upgrade quizzes and final tests with full-screen timed UX, integrity signals, anti-cheat logging, and clear failure/retry handling without claiming impossible prevention.
- [ ] Add learning UX upgrades and SEO foundations for scalable multi-course discovery.
- [ ] Validate tests, build, responsive assessment routes, and GitHub/Vercel readiness; save a checkpoint.
