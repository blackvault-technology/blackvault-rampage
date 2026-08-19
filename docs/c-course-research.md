# C Spotlight Course Research

## Research basis

The C Spotlight route is designed for absolute beginners, then moves into the language and systems concepts that make C durable. The sequence uses accessible teaching material first and reference material second; learners should not need to understand the C standard before writing their first program.

| Source | Role in Rampage | URL |
|---|---|---|
| MIT OpenCourseWare — Practical Programming in C | Primary course spine for syntax, practical programming, dynamic memory, concurrency, signals, process control, and library work. The course explicitly includes daily programming assignments and laboratory exercises. | https://ocw.mit.edu/courses/6-087-practical-programming-in-c-january-iap-2010/ |
| Harvard CS50x — Lecture 1 / C | Beginner-friendly introduction to compilation, `main`, headers, output, variables, conditionals, loops, functions, Linux, and debugging. | https://cs50.harvard.edu/x/2026/notes/1/ |
| Harvard CS50 course hub | Supporting lecture and problem-set ecosystem for an absolute-beginner entry point. | https://cs50.harvard.edu/x/ |
| cppreference — C reference | Lookup reference for language constructs, headers, dynamic memory, strings, I/O, numerics, and C11/C23 coverage. | https://en.cppreference.com/w/c |
| GNU C Library documentation | Reference for standard-library behavior and POSIX-adjacent programming practice where applicable. | https://www.gnu.org/software/libc/manual/ |
| SEI CERT C | Secure-coding review source for bounds, integer, string, memory, and input-validation hazards. | https://wiki.sei.cmu.edu/confluence/display/c |
| Compiler Explorer | External compiler surface for inspecting small C programs and generated assembly; used as an optional lab tool, not as Rampage's execution backend. | https://godbolt.org/ |
| Compiler documentation | Toolchain reading for warnings, standards selection, and debugging flags. | https://gcc.gnu.org/onlinedocs/ |

## Design decisions

C is presented as a calm, observable language rather than a syntax race. Early lessons use tiny programs and visible compiler feedback. Pointers and memory are introduced through diagrams, addresses, and controlled experiments before dynamic allocation. Every unsafe topic is paired with a failure mode, a debugging method, and a safer review habit.

The route should not claim that an embedded third-party page is always frameable. When a publisher or tool blocks embedding, the lesson uses the existing Source Studio fallback and opens the official material in its original context. External compiler surfaces are clearly labeled as external execution; Rampage stores learner progress and evidence, not arbitrary native-code execution.

## Planned progression

The proposed route moves through orientation and toolchain, values and control flow, functions and decomposition, arrays and strings, pointers and memory, structs and data modelling, files and error handling, modular compilation, debugging and tests, data structures, secure C, Unix processes and concurrency, and a final systems-oriented capstone. The final project should be small enough for a beginner to finish but rich enough to demonstrate compilation, modular design, input validation, testing, and a written failure review.

## References

[1]: https://ocw.mit.edu/courses/6-087-practical-programming-in-c-january-iap-2010/ "MIT OpenCourseWare — Practical Programming in C"
[2]: https://cs50.harvard.edu/x/2026/notes/1/ "Harvard CS50x — Lecture 1"
[3]: https://en.cppreference.com/w/c "cppreference — C reference"
[4]: https://www.gnu.org/software/libc/manual/ "GNU C Library documentation"
[5]: https://wiki.sei.cmu.edu/confluence/display/c "SEI CERT C Coding Standard"
[6]: https://godbolt.org/ "Compiler Explorer"
[7]: https://gcc.gnu.org/onlinedocs/ "GCC documentation"
