# C++ Spotlight Course Research

## Scope

The C++ Spotlight Course is designed as a beginner-first route that progresses toward modern C++ engineering. The route should teach the language as a tool for building and reasoning about software, not as a syntax survey. Each phase pairs a source layer with bounded implementation practice and a written observation.

## Verified primary and institutional sources

| Source | URL | Intended use |
|---|---|---|
| MIT OpenCourseWare 6.096 Introduction to C++ | https://ocw.mit.edu/courses/6-096-introduction-to-c-january-iap-2011/ | Beginner orientation, syntax, classes, pointers, and assignments. MIT describes this as a fast-paced introductory course for learners with little programming background and provides lecture notes and programming assignments. |
| MIT OpenCourseWare 6.S096 Effective Programming in C and C++ | https://ocw.mit.edu/courses/6-s096-effective-programming-in-c-and-c-january-iap-2014/ | Effective programming habits, memory, debugging, and C/C++ foundations. |
| cppreference | https://cppreference.com/ | Language and standard-library reference across C++11 through current revisions; use as a lookup layer rather than a first tutorial. |
| C++ Core Guidelines | https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines | Modern C++ design, interfaces, resource management, memory safety, error handling, templates, performance, and concurrency. The document is maintained by Bjarne Stroustrup and Herb Sutter and explicitly targets effective modern C++. |
| Google C++ Style Guide | https://google.github.io/styleguide/cppguide.html | Readability, maintainability, header discipline, portability, and production conventions. The current guide targets C++20 for Google codebases. |
| LLVM CMake documentation | https://llvm.org/docs/CMake.html | Build-system and toolchain practice for a real multi-target C++ project. |
| Catch2 CMake integration | https://github.com/catchorg/Catch2/blob/devel/docs/cmake-integration.md | Test-project integration and automated verification. |
| CppCon Back to Basics: Smart Pointers and RAII | https://www.youtube.com/watch?v=07rJOzFRs6M | Source-backed lecture context for ownership, RAII, and smart pointers. |
| CppCon Back to Basics: Initialization in C++ | https://www.youtube.com/watch?v=_23qmZtDBxg | Initialization, invariants, and predictable object construction. |
| CppCon What Makes Modern C++ Compelling For Programmers? | https://www.youtube.com/watch?v=nmQ0wbdY1ZU | Modern-language orientation and trade-offs across C++11–C++23. |
| CppCon Template-less Metaprogramming in C++ | https://www.youtube.com/watch?v=yriNqhv-oM0 | Advanced compile-time design context after the core templates phase. |

## Content decisions

The route will use MIT OCW as the beginner spine, cppreference as the durable lookup layer, and the C++ Core Guidelines plus Google’s style guide as review criteria. CppCon videos will be labelled as lecture context and will not be represented as official standards documentation. Labs will use local or hosted compiler workflows and may include Compiler Explorer links only where a stable, public, read-only or user-owned execution surface is appropriate; Rampage will record completion and evidence but will not claim to sandbox arbitrary native code in the browser.

## References

[1]: https://ocw.mit.edu/courses/6-096-introduction-to-c-january-iap-2011/ "MIT OpenCourseWare: Introduction to C++"
[2]: https://ocw.mit.edu/courses/6-s096-effective-programming-in-c-and-c-january-iap-2014/ "MIT OpenCourseWare: Effective Programming in C and C++"
[3]: https://cppreference.com/ "cppreference.com"
[4]: https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines "C++ Core Guidelines"
[5]: https://google.github.io/styleguide/cppguide.html "Google C++ Style Guide"
[6]: https://llvm.org/docs/CMake.html "LLVM CMake documentation"
[7]: https://github.com/catchorg/Catch2/blob/devel/docs/cmake-integration.md "Catch2 CMake integration"
[8]: https://www.youtube.com/watch?v=07rJOzFRs6M "CppCon: Smart Pointers and RAII"
[9]: https://www.youtube.com/watch?v=_23qmZtDBxg "CppCon: Initialization in C++"
[10]: https://www.youtube.com/watch?v=nmQ0wbdY1ZU "CppCon: What Makes Modern C++ Compelling"
[11]: https://www.youtube.com/watch?v=yriNqhv-oM0 "CppCon: Template-less Metaprogramming in C++"
