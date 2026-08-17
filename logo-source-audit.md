# Logo source audit

## Sources reviewed

- Simple Icons: https://simpleicons.org/ — public catalog of 3,453 SVG brand icons. Suitable for deterministic, CDN-delivered brand marks where the project can use the icon slug. Review the project/license terms before bundling individual marks.
- CompanyEnrich Logo API: https://companyenrich.com/free-tools/logo-api — public domain endpoint `https://api.companyenrich.com/logo/{domain}`. The page states no API key, transparent PNG output, global CDN delivery, and a fair-use limit of 500,000 requests/month; it recommends caching locally. These are provider claims and should not be treated as a guarantee.
- Hunter Logo API: https://hunter.io/api/logo — public domain endpoint `https://logos.hunter.io/{domain}`. The page states no API key, high-quality PNG/WEBP/AVIF, free/fair-use access, and encourages local caching. It also says trademarks remain owned by their respective holders and availability/accuracy are not guaranteed.
- Logo.dev: https://www.logo.dev/ — high-quality CDN-backed brand API, but the public page requires an API key and advertises a free tier rather than an unlimited unauthenticated endpoint.

## Decision

Prefer deterministic Simple Icons or a single provider endpoint with lazy loading, fixed dimensions, `decoding="async"`, and an initials fallback. Do not claim an API is unlimited unless the provider explicitly states that and the usage remains within fair-use terms. Do not present displayed universities or companies as endorsers, partners, or hiring pipelines without explicit permission.

## Additional official provenance sources reviewed

- MIT OpenCourseWare Computer Networks (6.829): https://ocw.mit.edu/courses/6-829-computer-networks-fall-2002/ — official course page describing large-scale networked systems, routing, congestion control, network security, and performance, with lecture notes, problem sets, and projects. The page explicitly warns that third-party links do not imply endorsement.
- Stanford Online Computer Systems Architecture (EE282): https://online.stanford.edu/courses/ee282-computer-systems-architecture — official course page describing modern computing systems, memory hierarchy, I/O, virtualization, fault tolerance, performance, and security. The page states the course is not currently open for enrollment.
- MIT OpenCourseWare Computer System Architecture (6.823): https://ocw.mit.edu/courses/6-823-computer-system-architecture-fall-2005/ — official course page covering instruction sets, microarchitecture, pipelining, caches, virtual memory, I/O, multiprocessors, and parallel computers, with notes, assignments, exams, and programming assignments.
- MIT OpenCourseWare: https://ocw.mit.edu/ — official open-learning hub describing freely available lecture notes, exams, and videos.

These sources support “reference shelf” or “drawn from public materials” language only. The landing page must not imply partnership, endorsement, enrollment, or credentialing by any listed institution.
