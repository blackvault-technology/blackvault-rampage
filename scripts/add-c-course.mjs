import fs from "node:fs";
import path from "node:path";

const file = path.resolve("client/src/data/curriculum.json");
const curriculum = JSON.parse(fs.readFileSync(file, "utf8"));
const existing = curriculum.courses.find((course) => course.id === "c-foundations");
if (existing) {
  console.log("C route already exists; leaving the canonical catalogue unchanged.");
  process.exit(0);
}

for (const course of curriculum.courses) course.spotlight = false;

const mit = "https://ocw.mit.edu/courses/6-087-practical-programming-in-c-january-iap-2010/";
const cs50Lecture = "https://www.youtube-nocookie.com/embed/SlqjA04_dpk";
const cRef = "https://en.cppreference.com/w/c";
const compiler = "https://godbolt.org/";
const cert = "https://wiki.sei.cmu.edu/confluence/display/c";
const gcc = "https://gcc.gnu.org/onlinedocs/";
const glibc = "https://www.gnu.org/software/libc/manual/";
const cs50 = "https://cs50.harvard.edu/x/";

const resource = (type, label, url, source, readingFocus) => ({ type, label, url, source, readingFocus });
const lab = (title, brief, deliverable, difficulty) => ({ title, brief, deliverable, difficulty });
const codeLab = (label, starter, prompt) => ({
  provider: "Compiler Explorer",
  mode: "external C compiler",
  embedUrl: compiler,
  label,
  starter,
  prompt,
  safetyNote: "Runs in the external compiler. Rampage records your checkpoint and evidence, not arbitrary native-code execution. Never paste secrets or personal data."
});

const lessons = [
  ["c-first-program", "Your first C program", "30 min", "Meet source files, main, headers, printf, compilation, and the edit-compile-run loop.", "Compile a hello program with warnings enabled and write a three-line explanation of source, compiler, and executable.", "Hello, C", "#include <stdio.h>\nint main(void) {\n  printf(\"hello, Rampage\\n\");\n  return 0;\n}", "Change the output, compile again, and explain one warning or error you encountered."],
  ["c-tools-errors", "The compiler is a teacher", "34 min", "Read compiler messages, use a terminal, and make small changes without losing your place.", "Create three intentional mistakes, record the diagnostic, fix each one, and keep a short debugging log.", "Compiler feedback drill", "#include <stdio.h>\nint main(void) {\n  printf(\"find the error\\n\")\n}", "Repair the program, then add -Wall -Wextra -std=c17 to your local compile command."],
  ["c-values-types", "Values, types, and format codes", "42 min", "Understand integers, characters, floating-point values, variables, constants, and printf formats.", "Build a unit converter that makes conversions explicit and documents its assumptions.", "Type boundaries", "#include <stdio.h>\nint main(void) {\n  int count = 7;\n  double ratio = 2.5;\n  printf(\"%d %.2f\\n\", count, ratio);\n}", "Add one intentional conversion and explain whether information can be lost."],
  ["c-control-flow", "Decisions and loops", "46 min", "Use if, else, switch, while, and for to express decisions and repetition.", "Implement a small number analyzer with clear branches and a loop invariant you can state.", "Control-flow drill", "#include <stdio.h>\nint main(void) {\n  for (int i = 1; i <= 10; ++i) printf(\"%d\\n\", i);\n}", "Add a classification branch and test boundary values."],
  ["c-functions", "Functions and decomposition", "45 min", "Turn a problem into small functions with parameters, return values, prototypes, and clear responsibilities.", "Refactor a command-line calculator into parsing, calculation, and reporting functions.", "Function boundaries", "int clamp(int value, int low, int high) {\n  return value;\n}", "Complete the function and write two edge-case tests."],
  ["c-arrays", "Arrays and indexed data", "48 min", "Work with contiguous collections, indices, lengths, and the common boundary errors beginners meet first.", "Write a fixed-size score analyzer that reports min, max, and average without reading beyond the array.", "Array inspection", "#include <stddef.h>\nint sum(const int values[], size_t length) {\n  return 0;\n}", "Implement sum and explain how the length travels with the array."],
  ["c-strings", "Strings are arrays of characters", "52 min", "Understand null termination, input boundaries, string functions, and why text handling needs discipline.", "Build a bounded line normalizer that rejects overlong input and reports its length safely.", "String boundary lab", "#include <stdio.h>\n#include <string.h>\nint main(void) {\n  char name[32] = \"Rampage\";\n  printf(\"%zu\\n\", strlen(name));\n}", "Replace the fixed example with bounded input and describe the terminator."],
  ["c-pointers", "Addresses, pointers, and indirection", "58 min", "See how addresses and dereferencing work through small, observable experiments.", "Write swap and min/max functions that modify caller-owned values through pointers.", "Pointer map", "void swap(int *left, int *right) {\n  int temporary = *left;\n  *left = *right;\n  *right = temporary;\n}", "Trace the values before and after the call and identify the dereference operations."],
  ["c-memory", "Dynamic memory without mystery", "64 min", "Introduce malloc, calloc, realloc, free, ownership, leaks, and failure paths with explicit contracts.", "Build a growable integer buffer that handles allocation failure and frees every successful allocation.", "Heap ownership", "#include <stdlib.h>\nint *values = malloc(4 * sizeof *values);\n/* define the owner and cleanup path */", "Add a cleanup path for both success and allocation failure."],
  ["c-structs", "Structs and data models", "48 min", "Represent related fields together and design records whose invariants are easy to explain.", "Create a small inventory record with validation and a function that prints one stable report.", "Record design", "struct Item {\n  unsigned id;\n  char name[32];\n  double price;\n};", "Add validation for the identifier, name, and price before reporting."],
  ["c-files", "Files, streams, and error handling", "58 min", "Read and write text files, inspect return values, and make failure visible to the user.", "Implement a line-oriented journal importer that reports malformed records without silently discarding them.", "File boundary lab", "#include <stdio.h>\nint main(void) {\n  FILE *file = fopen(\"notes.txt\", \"r\");\n  return file ? 0 : 1;\n}", "Add an explicit error message and close the file on every successful path."],
  ["c-modules", "Headers, modules, and separate compilation", "55 min", "Split a program into interfaces and implementations, then use a build command that makes dependencies visible.", "Turn the calculator into multiple .c files with a header that exposes only the intended functions.", "Module boundary", "/* calculator.h */\nint add(int left, int right);", "Define the interface, implementation, and compile command for the module."],
  ["c-debugging", "Debugging and tests as a habit", "62 min", "Use assertions, reproducible inputs, sanitizers, and small tests to replace guesswork.", "Create a test matrix for a parser and fix at least one memory or boundary defect with evidence.", "Failure review", "#include <assert.h>\nint clamp(int value, int low, int high);\nint main(void) {\n  assert(clamp(5, 0, 10) == 5);\n}", "Add boundary tests and write the smallest failing input you can find."],
  ["c-data-structures", "Linked lists, stacks, and queues", "72 min", "Use structs and pointers to build a small dynamic data structure while tracking ownership.", "Implement one linked structure with insert, remove, traversal, and complete cleanup.", "Data-structure lab", "struct Node {\n  int value;\n  struct Node *next;\n};", "Choose a representation, state its ownership rule, and test empty and one-item cases."],
  ["c-secure-c", "Secure C: boundaries are part of design", "66 min", "Review integer overflow, buffer limits, input validation, format strings, and undefined behavior.", "Audit an intentionally unsafe parser, classify each defect, and produce a safer revision with tests.", "Secure review", "#include <stdio.h>\nint main(void) {\n  char input[16];\n  /* design a bounded input path */\n}", "Name the trust boundary and show how your revision controls length and conversion."],
  ["c-unix-processes", "Processes and the Unix model", "74 min", "Connect C to operating-system concepts through arguments, exit status, environment, and process boundaries.", "Build a small command runner or pipeline sketch with explicit error propagation and a written safety boundary.", "Process model", "#include <stdio.h>\nint main(int argc, char **argv) {\n  printf(\"argc=%d\\n\", argc);\n  return 0;\n}", "Inspect arguments and return a meaningful status for invalid input."],
  ["c-build-review", "Build review and release discipline", "54 min", "Turn a working C program into a reproducible build with warnings, tests, sample data, and a short runbook.", "Prepare a clean build script or Makefile and verify the project from a fresh directory.", "Release checklist", "CC ?= cc\nCFLAGS ?= -std=c17 -Wall -Wextra -Wpedantic\nall:\n\t$(CC) $(CFLAGS) main.c -o app", "Add a reproducible target and document the exact command a new learner should run."],
  ["c-capstone", "Capstone: ship a small C system", "120 min", "Integrate compilation, modules, data modelling, validation, tests, debugging, and a failure-focused review.", "Ship a small command-line system such as a journal, inventory tool, or log indexer with a clear scope.", "C foundations capstone", "Repository, build instructions, tests, sample input/output, architecture note, source attribution, and failure review.", "Design the smallest complete system you can finish, then document one limitation and one next improvement."]
];

const phases = [
  ["c-orientation", "01", "Phase 01 / Start without fear", "Compile a small, inspectable program", "Learn the edit-compile-run loop, basic values, control flow, and how to read feedback."],
  ["c-functions-arrays", "02", "Phase 02 / Shape the problem", "Build a tested command-line utility", "Move from statements to functions, arrays, strings, and clear decomposition."],
  ["c-memory-model", "03", "Phase 03 / See memory", "Explain and control ownership", "Make addresses, pointers, dynamic memory, structs, and files observable rather than magical."],
  ["c-engineering", "04", "Phase 04 / Build with intent", "Split and test a small library", "Use modules, defensive interfaces, debugging tools, and repeatable tests."],
  ["c-systems", "05", "Phase 05 / Work closer to the machine", "Implement a small data structure and process tool", "Explore linked structures, secure C habits, Unix processes, and error propagation."],
  ["c-capstone-phase", "06", "Phase 06 / Make it explainable", "Ship a finished C system", "Bring the language, toolchain, testing, and systems thinking together in a bounded capstone."]
];

const course = {
  id: "c-foundations",
  title: "C Foundations",
  subtitle: "Start at zero. Learn what the machine is actually doing.",
  eyebrow: "SPOTLIGHT COURSE",
  color: "#ff5b2e",
  sourceUrl: mit,
  description: "A patient, beginner-first route into C that starts with your first compiled program and builds toward pointers, memory, files, data structures, secure coding, Unix processes, and a finished systems-minded capstone. No prior programming experience is assumed; every phase pairs a plain-language explanation with a guided lab, a quiz, and evidence you can review.",
  level: "Absolute Beginner → Systems Capable",
  time: "55–80h guided route + labs",
  status: "SPOTLIGHT COURSE",
  spotlight: true,
  spotlightLabel: "NEW BEGINNER FLAGSHIP",
  sourceLabel: "MIT OpenCourseWare · Harvard CS50 · cppreference · SEI CERT C",
  phases: []
};

for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
  const [id, number, title, project, description] = phases[phaseIndex];
  const start = phaseIndex * 3;
  const phaseLessons = lessons.slice(start, start + 3).map(([lessonId, titleText, duration, summary, practice, labTitle, starter, prompt]) => ({
    id: lessonId,
    title: titleText,
    duration,
    summary,
    video: phaseIndex === 0 && lessonId === "c-first-program" ? cs50Lecture : mit,
    videoLabel: phaseIndex === 0 && lessonId === "c-first-program" ? "Harvard CS50 / C lecture" : "MIT OpenCourseWare / Practical Programming in C course hub",
    resources: [
      resource("COURSE", "MIT Practical Programming in C", mit, "MIT OpenCourseWare", "Use the relevant lecture notes, assignment, or lab as the primary study surface."),
      resource("REFERENCE", "C language reference", cRef, "cppreference", "Check the exact language or library rule after attempting the exercise."),
      ...(phaseIndex >= 3 ? [resource("TOOLS", "GCC documentation", gcc, "GNU Project", "Review the warning, language-standard, or debugging flag used in the lab.")] : []),
      ...(phaseIndex >= 4 ? [resource("SECURITY", "SEI CERT C", cert, "Carnegie Mellon Software Engineering Institute", "Use the relevant rule to review the failure mode before submitting evidence.")] : [])
    ],
    practice,
    lab: lab(labTitle, practice, "Source code, compile/run instructions, tests or sample runs, a short explanation, and a failure note.", phaseIndex < 2 ? "FOUNDATION" : phaseIndex < 4 ? "BUILD" : "SYSTEMS"),
    codeLab: codeLab(labTitle, starter, prompt)
  }));
  course.phases.push({ id, number, title, project, description, lessons: phaseLessons });
}

course.phases[2].lessons[1].resources.push(resource("REFERENCE", "GNU C Library manual", glibc, "GNU Project", "Use the manual to compare standard-library behavior and error handling."));
course.phases[5].lessons[2].resources.push(resource("COURSE", "Harvard CS50", cs50, "Harvard University", "Use the problem-set and final-project framing as a second beginner-friendly perspective."));
course.phases[5].lessons[2].video = cs50Lecture;
course.phases[5].lessons[2].videoLabel = "Harvard CS50 / C foundations lecture context";

curriculum.courses.push(course);
fs.writeFileSync(file, JSON.stringify(curriculum, null, 2) + "\n");
console.log(JSON.stringify({ id: course.id, phases: course.phases.length, lessons: course.phases.flatMap((phase) => phase.lessons).length }, null, 2));
