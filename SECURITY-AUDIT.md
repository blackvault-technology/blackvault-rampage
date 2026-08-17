# Security Audit Notes

## Review scope

The application-level review covered authenticated tRPC boundaries, lesson-quiz and final-assessment payload validation, server-side scoring, bounded assessment windows, certificate gates, and integrity logging. TypeScript compilation, whitespace checks, the Vitest suite, and the production build were also run.

## Changes completed

The learner quiz and final-assessment procedures now require exactly one answer for every configured question, reject unknown question identifiers, and reject answer indexes outside the configured option list before database access. Existing authentication, server-side scoring, bounded timing, attempt limits, certificate eligibility, and integrity logging remain in place.

The review also removed generated duplicate PDF records from the resource catalog. The index now contains canonical source records and explicitly authored research entries rather than presenting repeated source pointers as distinct resources.

## Dependency audit result

`pnpm audit --audit-level high` and `pnpm audit --prod --audit-level high` both reported advisories in the current dependency graph. The production audit reported 72 findings, including 17 high-severity findings, while the full graph reported 131 findings. These results are dependency-graph findings, not evidence of an exploitable application path in the reviewed learner procedures. They should be handled as a separate maintenance track: update the lockfile and affected packages in a controlled branch, then rerun tests and the production build before release.

The project does not claim that browser integrity signals make cheating impossible. They are audit signals and server checks that raise the cost of abuse while preserving a defensible, transparent certification workflow.

## Validation status

The Vitest suite passed with 7 tests. The production build passed. TypeScript compilation and `git diff --check` passed before the dependency-audit command returned its non-zero advisory status. Desktop and mobile lesson screenshots were reviewed, including the left navigation, central lesson surface, right context panel, source links, video state, and mobile collapse behavior.

## Vercel readiness review — 17 Aug 2026

The authenticated Vercel team scope was inspected through the configured integration. The available team is `webcrafterreal-9806's projects`; the project inventory did not contain a project named `blackvault-rampage`, so no existing Vercel deployment or runtime logs could be inspected. Publishing remains a manual setup step: import the synchronized GitHub repository into Vercel, configure the documented environment variables, and use the project Publish flow.

The local validation suite reached the production build successfully, but `pnpm audit --prod --audit-level=high` exits non-zero because the dependency graph reports 72 advisories: 17 high, 47 moderate, and 8 low, with no critical findings. Notable claim-matched production findings include `nanoid@5.1.6`, patched in `>=5.1.16` for a non-secure negative-size infinite-loop condition ([GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv)), and `dompurify` versions `<=3.4.12`, patched in `>=3.4.13`, for a non-default `IN_PLACE` plus ancestor-removal-hook XSS configuration ([GHSA-55q2-fjhq-7xh7](https://github.com/advisories/GHSA-55q2-fjhq-7xh7)). The application does not use DOMPurify’s unsafe `IN_PLACE` hook pattern in its current source, but the dependency graph should still be upgraded in a controlled maintenance pass.

Earlier modal replay showed a Radix dialog accessibility warning (`Missing Description or aria-describedby`). The current AuthModal supplies both `DialogDescription` and `aria-describedby="auth-dialog-description"`; this should be rechecked on the first Vercel preview.
