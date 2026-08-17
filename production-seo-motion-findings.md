# Production SEO and Motion Findings

Inspected live production URL: https://edurampage.vercel.app/

Observed page title from the live deployment: `Rampage — Learn like the top 1%`, indicating the deployed site is still on an older bundle than the current local metadata change.

The live homepage renders the full public landing content, including the hero, catalog, resource provenance logo rail, technical-readiness company rail, guided paths, resource graph, and foundation section. The logo rail content is duplicated in the HTML as expected for a continuous loop.

Reported production auth failures from the user attachment include HTTP 500 for `/api/trpc/auth.me?batch=1` and `/api/trpc/auth.login?batch=1`, with `Unexpected token 'A', "A server e"... is not valid JSON`, indicating a non-JSON server error body. The local repair replaces Express-only `res.cookie`/`clearCookie` calls with direct Set-Cookie serialization and keeps a test-fixture fallback for logout.

Current local validation after the repair: 12 Vitest tests passed, TypeScript passed, and the Vite/server production build passed. A transient test failure was fixed by retaining the lightweight `clearCookie` fallback in logout.

Current local SEO updates include static description/author/robots/canonical/Open Graph/Twitter metadata in `client/index.html`, `client/public/robots.txt` sitemap declaration, and `client/public/sitemap.xml` covering public routes. Current local motion updates include IntersectionObserver-based `[data-motion]` reveal classes and a production-safe CSS logo rail animation with hover/focus/touch pause plus reduced-motion behavior.

## Follow-up validation

After the runtime title edit, the local preview reports the hydrated title `BlackVault Rampage — Learn the systems behind the surface`, and the complete homepage renders without a visible runtime error. The local `/sitemap.xml` endpoint is reachable and returns valid XML containing public routes only; the previous invalid `/courses` entry has been removed. The current live Vercel URL remains an older deployment until the new checkpoint is published.

## Supplied production console evidence

The user-provided report records repeated HTTP 500 responses for `GET /api/trpc/auth.me` and `POST /api/trpc/auth.login` on `https://edurampage.vercel.app`, followed by an invalid-JSON parse error in the client. It also records a Radix dialog warning for missing `Description`/`aria-describedby`. The local auth.me smoke check now returns `[{'result':{'data':{'json':null}}}]`, which is a valid JSON envelope.


## Repeated Auth JSON Failure — definitive production diagnosis

On 2026-08-17, `https://edurampage.vercel.app/api/trpc/auth.me?batch=1` still returned HTTP 500 with `content-type: text/plain` and `FUNCTION_INVOCATION_FAILED`. The connected Vercel project is `rampage`; its latest deployment for commit `49190f8c97cc5b5fc739be19cc0d3f187bc1c424` is READY at `rampage-efmoo9iq2-webcrafterreal-9806s-projects.vercel.app`, while the project reports `live: false`. The configured domains include `edurampage.vercel.app`, but that alias is still serving an older failed deployment. The code-level root cause has already been repaired in `api/index.ts` by importing Express before constructing the app. The remaining production action is to publish/promote the latest READY checkpoint from the Management UI, then re-test the custom alias.
