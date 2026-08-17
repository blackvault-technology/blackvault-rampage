# Course System Validation

## Implemented

The course system now exposes a normalized course → chapter → lesson → quiz → final assessment flow. Course overviews include a clear start/resume action, chapter progress, lesson durations, source context, chapter completion, and a final-assessment gate. Lesson state supports local timeline resume and the full-stack schema includes server-backed timelines, chapter completions, quiz attempts, and final-assessment attempts.

Final assessment procedures use authenticated attempts, server-side answer keys, randomized client question order, attempt records, time/eligibility checks, and audit events. Certificate issuance requires the server-recorded course completion and a passed final assessment. The implementation is intentionally described as defensible assessment integrity rather than impossible anti-cheating: no browser system can guarantee that a learner never receives outside assistance.

## Canonical source checks

The following active catalog source URLs returned HTTP 200 during validation:

| Source | URL | Status |
|---|---|---:|
| MIT 6.S081 / xv6 | https://pdos.csail.mit.edu/6.828/2021/overview.html | 200 |
| Stanford CS144 | https://cs144.github.io/ | 200 |
| Nand2Tetris | https://www.nand2tetris.org/course | 200 |
| UC Berkeley CS61C | https://cs61c.org/ | 200 |
| MIT Missing Semester | https://missing.csail.mit.edu/ | 200 |
| OSTEP | https://pages.cs.wisc.edu/~remzi/OSTEP/ | 200 |
| Cambridge distributed-systems notes | https://www.cl.cam.ac.uk/teaching/2223/ConcDisSys/dist-sys-notes.pdf | 200 |
| Raft paper | https://raft.github.io/raft.pdf | 200 |
| MIT OCW distributed-systems notes | https://ocw.mit.edu/courses/6-824-distributed-computer-systems-engineering-spring-2006/pages/lecture-notes/ | 200 |

## Remaining limitation

The main institutional URLs are live and source-backed. The generated arXiv index intentionally contains real paper records, but the catalog still needs a record-by-record human curation pass to certify every active lesson's exact video, PDF, lab, duration, and licensing/source note. The application must not claim that every generated chapter pointer is an individually verified lesson.

## Validation commands

`pnpm check`, `pnpm test`, and `pnpm build` completed successfully. The Vitest suite includes auth logout, Neon connection validation, and learner security tests. Desktop screenshots verified the course overview and final assessment route.

## Full catalog URL audit

A source-by-source URL sweep over the active catalog returned HTTP 200 for all 26 unique canonical URLs, including the MIT, Stanford, Berkeley, Nand2Tetris, OSTEP, Cambridge, Raft, Google ML, PyTorch, Hugging Face, Full Stack Deep Learning, GNU GDB, GitHub lab repositories, and four YouTube no-cookie lesson sources referenced by the course records. The sweep completed with no non-200 URLs.

The catalog uses real institutional and primary-source links. Generated arXiv records remain real paper metadata, but are labeled as an indexed research collection rather than pretending that every record is a hand-authored course lesson.

## Record-level lesson metadata audit

The active catalog was inspected at the normalized lesson-record level. Each active lesson record carries a concrete duration, summary, and one or more explicit resource records. Resource records carry a source label and canonical URL. Video-bearing lessons use real YouTube no-cookie embeds with a corresponding video label; reading-and-lab lessons intentionally omit a visible embed and route learners to the original source panel. Course-level time estimates are presented as ranges where the official material is open-ended; lesson-level durations are explicit learner estimates rather than claims made by the external providers.

The active course set is: System Fundamentals, AI Systems, Systems Research Lab, Compiler & Runtime Architecture, and Networking Systems. Networking Systems remains a catalog shell with no active phases and is clearly labeled `COMING SOON`, so it is not represented as a completed course or certificate-eligible path.
