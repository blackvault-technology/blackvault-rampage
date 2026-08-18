import fs from "node:fs";

const path = new URL("../client/src/data/curriculum.json", import.meta.url);
const curriculum = JSON.parse(fs.readFileSync(path, "utf8"));

const resources = {
  cs50: { type: "COURSE", label: "Harvard CS50P", url: "https://cs50.harvard.edu/python/", source: "Harvard", note: "Browser-accessible Python course with problem sets and a final project." },
  mit: { type: "COURSE", label: "MIT 6.0001", url: "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/", source: "MIT OpenCourseWare", note: "Lecture videos, notes, problem sets, and programming assignments." },
  google: { type: "COURSE", label: "Google's Python Class", url: "https://developers.google.com/edu/python", source: "Google", note: "Written lessons, lecture videos, and coding exercises for scripting and HTTP." },
  docs: { type: "DOC", label: "The Python Tutorial", url: "https://docs.python.org/3/tutorial/", source: "Python Software Foundation", note: "Official language tutorial and reference path." },
  dataModel: { type: "DOC", label: "Python Data Model", url: "https://docs.python.org/3/reference/datamodel.html", source: "Python Software Foundation", note: "Authoritative reference for objects, protocols, special methods, and identity." },
  packaging: { type: "DOC", label: "Python Packaging User Guide", url: "https://packaging.python.org/en/latest/", source: "Python Packaging Authority", note: "Official guidance for environments, packaging, publishing, and dependency management." },
  pytest: { type: "DOC", label: "pytest documentation", url: "https://docs.pytest.org/en/stable/", source: "pytest", note: "Testing framework documentation and fixture patterns." },
  asyncio: { type: "DOC", label: "asyncio documentation", url: "https://docs.python.org/3/library/asyncio.html", source: "Python Software Foundation", note: "Official asynchronous I/O library reference." },
  jupyter: { type: "LAB", label: "JupyterLite", url: "https://jupyterlite.readthedocs.io/", source: "Project Jupyter", note: "JupyterLab distribution that runs in the browser." },
  pyodide: { type: "LAB", label: "Pyodide browser REPL", url: "https://pyodide.org/en/stable/console.html", source: "Pyodide", note: "Browser-only Python runtime for short experiments; not an authenticated assessment runner." },
  codeInPlace: { type: "COURSE", label: "Stanford Code in Place", url: "https://codeinplace.stanford.edu/", source: "Stanford", note: "Python fundamentals and console-program practice." },
};

const clone = (resource, extra = {}) => ({ ...resource, ...extra });
const lab = (title, brief, deliverable, difficulty = "BUILD") => ({ title, brief, deliverable, difficulty });
const codeLab = (starter, prompt, provider = "PYODIDE") => ({ provider, mode: "browser-repl", embedUrl: "https://pyodide.org/en/stable/console.html", label: "Open browser Python lab", safetyNote: "Runs in the external browser environment. Rampage records your checkpoint and evidence, not arbitrary code execution.", starter, prompt });
const lesson = (id, title, duration, summary, video, videoLabel, lessonResources, practice, code) => ({ id, title, duration, summary, video, videoLabel, resources: lessonResources, lab: practice, codeLab: code });

const phases = [
  {
    id: "python-foundations", number: "00", title: "Python Foundations", description: "Move from expressions to deliberate programs. Learn the language’s basic shapes while building a mental model for execution.", project: "Ship a command-line utility",
    lessons: [
      lesson("python-orientation", "A program is a small model of a problem", "58 min", "Set up a repeatable Python workflow, read expressions, and learn to turn a vague task into inputs, transformations, and outputs.", "https://www.youtube-nocookie.com/embed/JP7ITIXGpHk", "Harvard CS50P / functions and variables", [clone(resources.cs50), clone(resources.mit), clone(resources.docs)], lab("Input-to-output mapper", "Build a command-line converter that accepts a value, validates it, transforms it, and prints a useful result.", "A README with examples, edge cases, and one short design note."), codeLab("value = 21\nprint(value * 2)", "Rewrite the starter as a small converter with clear input and output.")),
      lesson("python-control-flow", "Control flow is a decision record", "64 min", "Use Boolean expressions, branches, loops, and invariants to make program behavior explainable rather than accidental.", "https://www.youtube-nocookie.com/embed/nLRL_NcnK-4", "Harvard CS50P / control flow and loops", [clone(resources.cs50), clone(resources.codeInPlace), clone(resources.docs)], lab("Robust text menu", "Implement a loop-driven terminal menu that handles invalid choices without crashing and exits predictably.", "A runnable script plus a table of tested input paths."), codeLab("choice = 'start'\nprint(choice)", "Add a loop, at least three commands, and a deliberate exit path.")),
      lesson("python-functions", "Functions are contracts", "62 min", "Design functions around responsibilities, parameters, return values, and testable boundaries.", "https://www.youtube-nocookie.com/embed/JP7ITIXGpHk", "Harvard CS50P / functions, arguments, and return values", [clone(resources.cs50), clone(resources.mit), clone(resources.docs, { readingFocus: "Definitions, parameters, return values, and scope." })], lab("Refactor a tangled script", "Split a single procedural script into small functions with explicit inputs and outputs.", "A before/after explanation and a function-level test checklist."), codeLab("def greet(name):\n    return f'Hello, {name}'\n\nprint(greet('Rampage'))", "Add validation and a second function without hiding state in globals.")),
  ]},
  {
    id: "python-data-design", number: "01", title: "Data and Program Design", description: "Learn the core containers, file boundaries, and object models that make Python programs useful beyond toy examples.", project: "Build a searchable records tool",
    lessons: [
      lesson("python-data-structures", "Choose the data shape before the algorithm", "70 min", "Work fluently with strings, lists, tuples, dictionaries, sets, comprehensions, and the trade-offs each shape implies.", "https://www.youtube-nocookie.com/embed/nLRL_NcnK-4", "Harvard CS50P / data structures", [clone(resources.cs50), clone(resources.google), clone(resources.docs)], lab("Evidence index", "Create an in-memory index that groups records by a meaningful key and reports missing or duplicate data.", "A small dataset, implementation, and complexity note."), codeLab("records = ['alpha', 'beta', 'alpha']\nprint(set(records))", "Turn the sample into a grouped record summary with deterministic output.")),
      lesson("python-files-csv-json", "Files are interfaces", "72 min", "Read and write text, CSV, and JSON while treating file formats as explicit contracts with failure modes.", "https://www.youtube-nocookie.com/embed/JP7ITIXGpHk", "Harvard CS50P / file I/O", [clone(resources.cs50), clone(resources.google), clone(resources.docs)], lab("Audit-ready report", "Read a JSON or CSV export, validate required fields, and produce a stable summary report.", "A sample input, output report, and validation policy."), codeLab("import json\ndata = {'status': 'draft'}\nprint(json.dumps(data, indent=2))", "Add file-shaped data validation without assuming every field exists.")),
      lesson("python-objects", "Objects make domain language executable", "78 min", "Model a small domain with classes, properties, methods, composition, and deliberate invariants.", "https://www.youtube-nocookie.com/embed/nLRL_NcnK-4", "Harvard CS50P / object-oriented programming", [clone(resources.cs50), clone(resources.mit), clone(resources.dataModel)], lab("Resource catalogue model", "Model resources, sources, and learner checkpoints with classes that protect valid state.", "A class diagram, implementation, and three invariants written as tests or assertions."), codeLab("class Source:\n    def __init__(self, label):\n        self.label = label\n\nprint(Source('Python docs').label)", "Add a method that refuses an empty label and returns a stable display record.")),
  ]},
  {
    id: "python-reliable-software", number: "02", title: "Reliable Software", description: "Turn working scripts into software you can change. Test behavior, handle errors, and package code so others can run it.", project: "Publish a tested Python package",
    lessons: [
      lesson("python-errors-debugging", "Errors are evidence, not embarrassment", "68 min", "Read tracebacks, separate expected failures from defects, and design exception handling that preserves useful context.", "https://www.youtube-nocookie.com/embed/JP7ITIXGpHk", "Harvard CS50P / exceptions and debugging", [clone(resources.cs50), clone(resources.docs, { readingFocus: "Exceptions, traceback reading, and custom error boundaries." }), clone(resources.google)], lab("Failure map", "Take a deliberately fragile utility and document its failure modes before improving its error messages.", "A failure matrix and a revised implementation with actionable errors."), codeLab("def parse_age(value):\n    return int(value)\n\nprint(parse_age('42'))", "Handle invalid input without swallowing the underlying meaning of the error.")),
      lesson("python-testing", "Tests are executable claims", "76 min", "Write focused tests, use fixtures and parametrization, and choose boundaries that make failures easy to localize.", "https://www.youtube-nocookie.com/embed/nLRL_NcnK-4", "Harvard CS50P / unit testing", [clone(resources.cs50), clone(resources.pytest), clone(resources.mit)], lab("Test the contract", "Build a pytest suite for the records tool, including valid cases, malformed data, and regression cases.", "A test suite with readable names and a short coverage-risk memo."), codeLab("def add(a, b):\n    return a + b\n\nassert add(2, 3) == 5", "Add boundary assertions and describe what each assertion protects.")),
      lesson("python-modules-packaging", "A package is a boundary around reuse", "84 min", "Organize modules, isolate environments, declare dependencies, and make a project installable without relying on a specific machine.", "https://www.youtube-nocookie.com/embed/JP7ITIXGpHk", "Google's Python Class / modules and packages", [clone(resources.google), clone(resources.packaging), clone(resources.docs)], lab("Installable utility", "Convert a script into a small package with a command entry point, metadata, and a reproducible environment.", "Project layout, pyproject.toml, install instructions, and a smoke test."), codeLab("from pathlib import Path\nprint(Path('.').resolve())", "Sketch the package boundary and identify which imports should be public.")),
  ]},
  {
    id: "python-systems-services", number: "03", title: "Systems and Services", description: "Use Python to talk to the outside world: processes, HTTP, APIs, structured data, and asynchronous work.", project: "Build a resilient data service",
    lessons: [
      lesson("python-processes-http", "The network is another failure boundary", "86 min", "Connect Python programs to processes and HTTP services while making timeouts, response validation, and retries explicit.", "https://www.youtube-nocookie.com/embed/nLRL_NcnK-4", "Google's Python Class / processes and HTTP", [clone(resources.google), clone(resources.cs50), clone(resources.docs)], lab("Source-backed fetcher", "Build a command-line fetcher for an openly licensed public endpoint with timeouts and structured output.", "A safe fetch script, sample response, and failure behavior documentation."), codeLab("from urllib.parse import urlparse\nprint(urlparse('https://example.com').hostname)", "Design the request boundary without embedding credentials or scraping restricted systems.")),
      lesson("python-iterators-generators", "Make large work lazy", "74 min", "Use iterators, generators, context managers, and streaming transformations to keep memory and control flow visible.", "https://www.youtube-nocookie.com/embed/JP7ITIXGpHk", "MIT 6.0001 / computational problem solving", [clone(resources.mit), clone(resources.docs, { readingFocus: "Iterators, generators, context managers, and resource lifetime." }), clone(resources.google)], lab("Streaming log analyzer", "Process a line-oriented log stream lazily and emit a summary without loading the entire file into memory.", "A generator-based pipeline and a memory-use explanation."), codeLab("def numbers():\n    yield from range(3)\n\nprint(list(numbers()))", "Turn the generator into a transformation pipeline with one filtering stage.")),
      lesson("python-asyncio-concurrency", "Concurrency is coordination", "92 min", "Understand event loops, tasks, cancellation, backpressure, and when asynchronous I/O is the right tool.", "https://www.youtube-nocookie.com/embed/nLRL_NcnK-4", "Google's Python Class / processes and HTTP context", [clone(resources.asyncio), clone(resources.docs), clone(resources.google)], lab("Bounded concurrent probe", "Write an async exercise that schedules bounded work against a local or public test endpoint and records failures.", "A cancellation-aware implementation and an explanation of the concurrency limit."), codeLab("import asyncio\n\nasync def main():\n    await asyncio.sleep(0)\n    return 'ready'\n\nprint(asyncio.run(main()))", "Add two tasks, preserve deterministic reporting, and handle cancellation explicitly.")),
  ]},
  {
    id: "python-advanced-architecture", number: "04", title: "Advanced Python Architecture", description: "Finish by reasoning about the object model, performance, observability, and the choices that separate a script from a durable system.", project: "Ship and defend a production-minded Python service",
    lessons: [
      lesson("python-data-model", "Protocols are the language beneath the syntax", "90 min", "Use special methods, descriptors, context managers, and protocols to understand how Python objects participate in the language.", "https://www.youtube-nocookie.com/embed/nLRL_NcnK-4", "Python documentation / object model study", [clone(resources.dataModel), clone(resources.docs), clone(resources.mit)], lab("Protocol-driven collection", "Implement a small collection type that supports iteration, length, readable representation, and a safe context boundary.", "A protocol table, implementation, and tests for each supported behavior."), codeLab("class Box:\n    def __init__(self, value):\n        self.value = value\n\nprint(Box(3).value)", "Add one special method and explain the user-facing behavior it unlocks.")),
      lesson("python-performance-observability", "Measure before you optimize", "88 min", "Profile a real bottleneck, distinguish algorithmic from I/O cost, and add logs or metrics that make behavior inspectable.", "https://www.youtube-nocookie.com/embed/JP7ITIXGpHk", "MIT 6.0001 / computational reasoning", [clone(resources.mit), clone(resources.docs, { readingFocus: "Profiling, algorithmic cost, and evidence-led optimization." }), clone(resources.google)], lab("Benchmark dossier", "Compare two implementations on a controlled dataset, record timing methodology, and explain the trade-off.", "A reproducible benchmark script and a one-page conclusion with limitations."), codeLab("import time\nstart = time.perf_counter()\n_ = sum(range(1000))\nprint(time.perf_counter() - start)", "Measure two approaches fairly and report the result without claiming universal performance.")),
      lesson("python-capstone", "A finished system explains its boundaries", "120 min", "Integrate the route into a capstone service with tests, packaging, source attribution, observability, and a failure-focused review.", "https://www.youtube-nocookie.com/embed/nLRL_NcnK-4", "Harvard CS50P / final project framing", [clone(resources.cs50), clone(resources.packaging), clone(resources.pytest), clone(resources.jupyter)], lab("Rampage Python capstone", "Ship a tested, installable data service or developer tool that reads a real public source, transforms it, and exposes a clear interface.", "Repository, architecture note, tests, runbook, source attribution, and a recorded failure review."), codeLab("def main():\n    return {'status': 'start'}\n\nprint(main())", "Define the capstone interface, one happy path, one failure path, and the evidence you will submit.")),
  ]},
];

const pythonCourse = {
  id: "python-engineering",
  title: "Python Engineering",
  subtitle: "From first script to production-minded systems",
  eyebrow: "DEEP COURSE / PYTHON",
  description: "A serious Python route for learners who want more than syntax. Start with expressions and control flow, move through data modelling, testing, packaging, HTTP, asynchronous work, and the object model, then finish with a defensible capstone.",
  status: "DEEP COURSE",
  color: "blue",
  sourceLabel: "Harvard CS50P · MIT 6.0001 · Google · Python Docs",
  sourceUrl: "https://cs50.harvard.edu/python/",
  time: "24–36h guided lessons + 35–55h lab work",
  level: "Beginner → Advanced",
  phases,
};

const existingIndex = curriculum.courses.findIndex((course) => course.id === pythonCourse.id);
if (existingIndex >= 0) curriculum.courses[existingIndex] = pythonCourse;
else curriculum.courses.push(pythonCourse);

for (const resource of Object.values(resources)) {
  if (!curriculum.resourceCatalog.some((item) => item.url === resource.url)) curriculum.resourceCatalog.push(resource);
}

curriculum.schemaVersion = Math.max(curriculum.schemaVersion, 3);
curriculum.generatedAt = new Date().toISOString();
fs.writeFileSync(path, `${JSON.stringify(curriculum, null, 2)}\n`);
console.log(`Python route written: ${pythonCourse.phases.length} phases, ${phases.flatMap((phase) => phase.lessons).length} lessons`);
