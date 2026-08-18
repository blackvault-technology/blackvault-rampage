# Curriculum Research Notes

## Systems and Operating Systems

| Source | Verified learning value | Rampage use |
|---|---|---|
| [MIT 6.S081: Operating System Engineering](https://pdos.csail.mit.edu/6.828/2021/overview.html) | Official course uses xv6 on RISC-V to cover virtual memory, file systems, threads, context switching, kernels, interrupts, system calls, IPC, coordination, and hardware/software interaction. It includes individual labs that extend xv6. | Retain as the canonical source for OS lessons; replace generic xv6 references with explicit, official lab tasks and the official xv6 book/source links. |
| [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/) | Official free online/PDF book organized around virtualization, concurrency, and persistence, with chapters, homework, projects, and systems/xv6 lab material. | Use as the embedded-first reading spine for process, memory, concurrency, file-system, and distributed-systems prerequisites. |

> Research principle: Rampage should describe a lab only when it maps to a named official lab, documented exercise, or a clearly scoped course-authored observation task. Ambiguous “worksheets” and generic placeholder snippets are candidates for removal or replacement.

## Networking

| Source | Verified learning value | Rampage use |
|---|---|---|
| [Stanford CS144](https://cs144.github.io/) | Official course lists progressive checkpoints for a networking warmup, byte stream, TCP receiver/sender, real-world measurement, network interface, IP router, and a creative Internet project; it also exposes lecture notes on reliability, TCP, congestion control, routing, and security. | Replace the community “Sponge” mirror with the official CS144 course and sequence the Rampage implementation path around named checkpoints, without reproducing protected solutions. |
| [Kurose–Ross Wireshark Labs](https://gaia.cs.umass.edu/kurose_ross/wireshark.php) | Freely available, source-attributed packet-analysis labs cover HTTP, DNS, TCP, UDP, IP, NAT, DHCP, ICMP, Ethernet/ARP, Wi-Fi, 5G, and TLS; the authors provide PDF and Word lab formats plus trace files. | Replace generic “performance/address-resolution/HTTP trace worksheets” with explicit, topic-matched Wireshark observation labs and embed direct PDF lab material where the source permits it. |

## AI Systems, Product, Evaluation, and Data

| Source | Verified learning value | Rampage use |
|---|---|---|
| [Full Stack Deep Learning](https://fullstackdeeplearning.com/) | Official material frames AI-powered product work as a lifecycle: problem definition, model or GPU choice, deployment, continual learning, LLMOps, and user-experience design. | Use as the practical spine for AI Product Systems and AI Data Infrastructure; connect each Rampage lab to a concrete design, evaluation, or operating artifact rather than a generic prototype. |
| [Stanford CS329S: Machine Learning Systems Design](https://stanford-cs329s.github.io/) | Official course supplies slides, intensive notes, assignments, and final-project instructions for deployable, reliable, scalable ML systems; its scope includes data management/engineering, feature engineering, model selection, training, scaling, monitoring, deployment, privacy, fairness, security, team structure, and business metrics. | Use as a source-first route for evaluation contracts, data contracts, deployment checks, monitoring, and systems-design lab artifacts. Respect its prohibition on posting assignment solutions. |

## Compiler and Runtime Architecture

| Source | Verified learning value | Rampage use |
|---|---|---|
| [Nand2Tetris Project 7: Virtual Machine I](https://www.nand2tetris.org/project07) | Official project requires a VM-to-Hack translator that implements stack arithmetic and memory-access commands and passes supplied emulator tests; later work extends it to a full VM translator. | Replace generic bytecode and stack-machine exercises with an explicit implementation milestone built around the public project contract and original learner work. |
| [Crafting Interpreters](https://craftinginterpreters.com/introduction.html) | Free online text builds two complete interpreters step by step; the second path in C includes a compiler to bytecode, a VM, runtime data structures, memory management, garbage collection, benchmarking, and optimization. | Use as the embedded reading spine for lexing, parsing, ASTs, bytecode, VM internals, object representation, garbage collection, and performance reasoning. |
