# BlackVault Rampage Python Course Research

## Scope

The proposed Python route should progress from first syntax and problem solving through testing, data modelling, packaging, concurrency, web/API work, and production-quality software. The course will use official external lecture/source pages as contextual material and Rampage-authored lab briefs as the learner’s work record. It will not claim that external providers endorse Rampage.

## Verified sources

| Source | Verified facts and intended use |
|---|---|
| [Harvard CS50P](https://cs50.harvard.edu/python/) | Official free course for learners with or without prior programming experience. Covers functions, variables/types, conditionals, loops, exceptions, debugging, unit tests, third-party libraries, regular expressions, classes/objects/properties, files, and a final project. The page describes ten weeks of material, browser-accessible study, problem sets, and a final project. Use for fundamentals, testing, OOP, files, and project framing. |
| [MIT 6.0001 OCW](https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/) | Official undergraduate course intended for little or no programming experience. Provides lecture notes, lecture videos, problem sets, and programming assignments. Use for computational thinking, algorithms, complexity intuition, and foundational problem solving. |
| [Google's Python Class](https://developers.google.com/edu/python) | Official free material for learners with some programming experience. Includes written material, lecture videos, and coding exercises progressing from setup and strings/lists to full programs involving text files, processes, and HTTP connections. Content is published under stated Creative Commons and Apache code licenses. Use for intermediate scripting, files, processes, and HTTP. |
| [Python Tutorial](https://docs.python.org/3/tutorial/) | Official Python documentation tutorial. It is designed for programmers new to Python rather than complete beginners to programming. Use for language reference, control flow, data structures, modules, errors/exceptions, classes, and virtual environments/packages. |
| [Pyodide quickstart](https://pyodide.org/en/stable/usage/quickstart.html) | Official documentation for running Python in the browser through WebAssembly. It documents `loadPyodide`, `runPython`, standard-library availability, package loading, and a browser REPL. Use as the technical basis for an optional client-side lab surface, not as a server-side evaluator. |
| [JupyterLite documentation](https://jupyterlite.readthedocs.io/) | Official documentation for JupyterLab running entirely in the browser, built from JupyterLab components and extensions. Use as a possible notebook-style external lab link or future embedded lab surface. |
| [CodePen Embedded Pens](https://blog.codepen.io/documentation/embedded-pens/) | Official CodePen documentation states that Pens can be embedded using copied embed code. CodePen is primarily a web front-end environment; it should not be represented as a Python execution environment. For Python, use a clearly labelled Pyodide/JupyterLite-compatible surface instead. |
| [Stanford Code in Place](https://codeinplace.stanford.edu/) | Official Stanford course experience covering Python fundamentals including control flow, loops, conditionals, and console programs. Use as an additional beginner practice reference where appropriate. |

## Content decisions

The initial route will contain 15 lessons across five phases: Python foundations; data and program design; reliable software; systems and services; and advanced Python architecture. Each lesson will include a real external lecture or official source hub where available, at least two authoritative resources, a concrete lab brief, and a proof-of-work prompt. Source URLs will remain visible and attribution will be preserved.

A Python code-lab metadata field will be added to the JSON model with a provider, URL, mode, and safety note. The first implementation should support an external browser-code link or a provider embed URL without executing arbitrary user code on the Rampage server. If a client-side Pyodide runner is later added, it must be isolated, explicitly labelled as browser-only, and kept separate from authenticated progress and assessment scoring.

## References

[1]: https://cs50.harvard.edu/python/ "Harvard CS50's Introduction to Programming with Python"
[2]: https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/ "MIT OpenCourseWare 6.0001"
[3]: https://developers.google.com/edu/python "Google's Python Class"
[4]: https://docs.python.org/3/tutorial/ "The Python Tutorial"
[5]: https://pyodide.org/en/stable/usage/quickstart.html "Pyodide Getting Started"
[6]: https://jupyterlite.readthedocs.io/ "JupyterLite documentation"
[7]: https://blog.codepen.io/documentation/embedded-pens/ "CodePen Embedded Pens"
[8]: https://codeinplace.stanford.edu/ "Stanford Code in Place"
