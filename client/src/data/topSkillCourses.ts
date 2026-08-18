import type { Course, Resource } from "./catalog";

const source = (type: string, label: string, url: string, sourceName: string, note: string, readingFocus?: string): Resource => ({ type, label, url, source: sourceName, note, readingFocus });

const sources = {
  britishCouncil: source("READ", "British Council LearnEnglish", "https://learnenglish.britishcouncil.org/free-resources", "British Council", "Open English practice organised by skill level.", "Choose one writing or speaking task, notice the model, then draft or record a response of your own."),
  googleWriting: source("GUIDE", "Google Technical Writing", "https://developers.google.com/tech-writing", "Google", "Free technical-writing courses and exercises.", "Use the units on active voice, short sentences, lists, and editing as a deliberate revision checklist."),
  mitCommKit: source("GUIDE", "MIT EECS Communication Lab CommKit", "https://mitcommlab.mit.edu/eecs/use-the-commkit/", "MIT EECS Communication Lab", "Practical guides for professional communication.", "Study one template, then create a version for a real audience and ask what decision it should enable."),
  purdueOwl: source("READ", "Purdue OWL: General Writing", "https://owl.purdue.edu/owl/general_writing/index.html", "Purdue University", "Open guidance on clarity, style, and revision.", "Use one style guide at a time; revise a paragraph until the reader can identify its claim and next action."),
  learningScientists: source("READ", "The Learning Scientists: Downloadable Materials", "https://www.learningscientists.org/downloadable-materials", "The Learning Scientists", "Research-informed study strategy posters and explanations.", "Turn one technique into a seven-day practice schedule, then record whether retrieval was effortful and useful."),
  cmuEvidence: source("COURSE", "Evidence-Based Management", "https://oli.cmu.edu/courses/evidence-based-management-o-f/", "Carnegie Mellon University OLI", "Open course material for evidence-informed management.", "Separate a claim, the evidence behind it, and the decision it should change before you accept a recommendation."),
  criticalThinking: source("READ", "Critical Thinking Basics", "https://www.criticalthinking.org/pages/critical-thinking-basics/410", "Foundation for Critical Thinking", "Foundational prompts for examining reasoning.", "Use the elements of reasoning to inspect a single important claim instead of trying to analyse everything at once."),
  openLearnCareer: source("COURSE", "OpenLearn Career Ready", "https://www.open.edu/openlearn/miscellaneous/career-ready-courses", "The Open University", "Open career learning collection spanning applications, interview preparation, and workplace skills.", "Treat the material as a prompt to build your own evidence: role map, portfolio story, and questions for an informational conversation."),
  mitCapd: source("GUIDE", "MIT Career Advising & Professional Development", "https://capd.mit.edu/resources/", "MIT CAPD", "Practical career-development resources and frameworks.", "Use a resource to turn one past project into a concise capability story backed by evidence."),
  negotiation: source("COURSE", "Successful Negotiation", "https://www.coursera.org/learn/negotiation-skills", "University of Michigan", "A university negotiation course hosted by Coursera; access and certificate terms are platform-dependent.", "Use the preparation concepts for an ethical practice scenario; this is not legal, employment, or contract advice."),
  cmuCollaboration: source("GUIDE", "Collaborative Problem-Solving", "https://www.cmu.edu/teaching/solveproblem/strat-collaborative.html", "Carnegie Mellon University", "Guidance for structuring collaborative learning and problem-solving.", "Write an agreement that names the shared goal, decision rule, responsibilities, and how disagreement will be handled."),
};

const course = (id: string, title: string, subtitle: string, eyebrow: string, description: string, sourceLabel: string, sourceUrl: string, time: string, phases: Course["phases"], color: Course["color"] = "lime"): Course => ({
  id, title, subtitle, eyebrow, description, status: "NEW ROUTE", color, sourceLabel, sourceUrl, time, level: "Beginner → Capable", phases,
});

export const topSkillCourses: Course[] = [
  course("english-for-technical-work", "English for Technical Work", "Speak, write, and clarify with intent", "NEW ROUTE / LANGUAGE", "Build practical English for technical learning and work: explain a process, ask a useful question, write a clear update, and repair a misunderstanding without pretending to be fluent overnight.", "British Council · Google · Purdue", sources.britishCouncil.url, "5–8h guided route + practice", [
    { id: "eng-foundations", number: "00", title: "Make Meaning Clear", description: "Start with sentence control, vocabulary in context, and the courage to ask for clarification.", project: "Create a personal clarification kit", lessons: [
      { id: "eng-plain", title: "Plain English is a technical skill", duration: "32 min", summary: "Turn dense wording into a sentence another learner can act on.", resources: [sources.britishCouncil, sources.googleWriting] },
      { id: "eng-clarify", title: "Ask the question that moves work forward", duration: "28 min", summary: "Use context, a precise gap, and a next step to ask useful questions in study and work.", resources: [sources.mitCommKit, sources.britishCouncil] },
    ] },
    { id: "eng-explain", number: "01", title: "Explain the Work", description: "Build confidence through short technical explanations and useful progress updates.", project: "Record a 90-second explainer", lessons: [
      { id: "eng-process", title: "Explain one process end to end", duration: "36 min", summary: "Use sequence, cause, and concrete examples to make a technical process legible.", resources: [sources.googleWriting, sources.purdueOwl] },
      { id: "eng-update", title: "Write an update people can use", duration: "34 min", summary: "Write a concise status update that names context, progress, risk, and the requested decision.", resources: [sources.mitCommKit, sources.googleWriting] },
    ] },
    { id: "eng-practice", number: "02", title: "Practice in Public", description: "Create repeatable routines for listening, speaking, feedback, and revision.", project: "Publish a revised learning note", lessons: [
      { id: "eng-feedback", title: "Feedback is data, not a verdict", duration: "30 min", summary: "Ask for one targeted piece of feedback, revise once, and document what changed.", resources: [sources.mitCommKit, sources.purdueOwl] },
      { id: "eng-routine", title: "Build your language loop", duration: "26 min", summary: "Create a small weekly loop for input, output, correction, and reflection.", resources: [sources.learningScientists, sources.britishCouncil] },
    ] },
  ]),
  course("clear-communication", "Clear Communication", "Turn thought into a shared decision", "NEW ROUTE / COMMUNICATION", "Learn to structure messages, meetings, presentations, and feedback so people can understand the point, the evidence, and the next move.", "MIT EECS Communication Lab · Purdue", sources.mitCommKit.url, "5–7h guided route + practice", [
    { id: "comm-message", number: "00", title: "Message Design", description: "Make the audience, decision, and evidence visible before you draft.", project: "Write a one-page message map", lessons: [
      { id: "comm-audience", title: "Audience changes the message", duration: "34 min", summary: "Map what a reader knows, needs, and can decide before choosing structure.", resources: [sources.mitCommKit, sources.purdueOwl] },
      { id: "comm-structure", title: "Lead with the decision", duration: "31 min", summary: "Use a claim–evidence–next-step structure for messages that do not bury the point.", resources: [sources.googleWriting, sources.mitCommKit] },
    ] },
    { id: "comm-live", number: "01", title: "Live Communication", description: "Run a meeting or presentation that leaves a usable record.", project: "Facilitate a 15-minute decision meeting", lessons: [
      { id: "comm-meeting", title: "Meetings need an artifact", duration: "38 min", summary: "Prepare an agenda, decision question, and capture format before conversation begins.", resources: [sources.mitCommKit, sources.cmuCollaboration] },
      { id: "comm-present", title: "Present the signal, not every fact", duration: "40 min", summary: "Build a short presentation around one claim, proof, and action.", resources: [sources.mitCommKit, sources.googleWriting] },
    ] },
    { id: "comm-feedback", number: "02", title: "Feedback and Repair", description: "Make feedback specific, usable, and safe enough to improve the work.", project: "Create a feedback protocol", lessons: [
      { id: "comm-review", title: "Review the work, not the person", duration: "29 min", summary: "Frame feedback around observable behavior, impact, and a concrete revision route.", resources: [sources.mitCommKit, sources.cmuCollaboration] },
      { id: "comm-repair", title: "Repair a misunderstanding", duration: "27 min", summary: "Recognise ambiguity, restate the shared goal, and write the next clean message.", resources: [sources.purdueOwl, sources.mitCommKit] },
    ] },
  ], "orange"),
  course("professional-presence", "Professional Presence", "Build trust through preparation", "NEW ROUTE / PERSONAL EFFECTIVENESS", "Develop the visible habits behind reliable collaboration: preparation, follow-through, self-awareness, boundaries, and a professional record that matches the quality of your work.", "MIT Communication Lab · OpenLearn", sources.mitCommKit.url, "4–6h guided route + practice", [
    { id: "presence-basics", number: "00", title: "Reliable Signals", description: "Make preparation and follow-through visible without trying to perform a personality.", project: "Create a weekly operating note", lessons: [
      { id: "presence-prepare", title: "Preparation is a respect signal", duration: "30 min", summary: "Build a pre-meeting checklist that makes your contribution easier to trust.", resources: [sources.mitCommKit, sources.learningScientists] },
      { id: "presence-follow", title: "Close the loop", duration: "28 min", summary: "Turn a conversation into an owner, a deadline, and a written follow-up.", resources: [sources.mitCommKit, sources.openLearnCareer] },
    ] },
    { id: "presence-self", number: "01", title: "Self-Awareness", description: "Notice how energy, uncertainty, and defaults show up in your work.", project: "Write a personal work manual", lessons: [
      { id: "presence-patterns", title: "Name the patterns", duration: "31 min", summary: "Identify a recurring work pattern and design one small countermeasure.", resources: [sources.criticalThinking, sources.learningScientists] },
      { id: "presence-boundaries", title: "Boundaries make commitments real", duration: "29 min", summary: "Use scope, time, and trade-offs to make commitments that can be kept.", resources: [sources.mitCommKit, sources.openLearnCareer] },
    ] },
    { id: "presence-proof", number: "02", title: "Professional Proof", description: "Make your contribution legible through evidence rather than adjectives.", project: "Publish a capability story", lessons: [
      { id: "presence-story", title: "Tell one capability story", duration: "35 min", summary: "Describe a real problem, your action, the evidence, and what you learned.", resources: [sources.mitCapd, sources.openLearnCareer] },
      { id: "presence-review", title: "Ask for useful feedback", duration: "26 min", summary: "Request feedback that can improve one behaviour or artifact next week.", resources: [sources.mitCommKit, sources.openLearnCareer] },
    ] },
  ]),
  course("critical-thinking", "Critical Thinking", "See the claim beneath the confidence", "NEW ROUTE / REASONING", "Learn to break a problem into claims, assumptions, evidence, alternatives, and consequences so you can reason carefully without becoming paralysed by analysis.", "CMU OLI · Foundation for Critical Thinking", sources.cmuEvidence.url, "6–9h guided route + practice", [
    { id: "think-claims", number: "00", title: "Claims and Evidence", description: "Separate what is being asserted from the reasons offered for believing it.", project: "Build a claim audit", lessons: [
      { id: "think-claim", title: "A claim is not its evidence", duration: "38 min", summary: "Mark the conclusion, evidence, and missing support in a short argument.", resources: [sources.criticalThinking, sources.cmuEvidence] },
      { id: "think-source", title: "Check the source before the conclusion", duration: "42 min", summary: "Ask who produced a source, what it measures, and what it cannot establish.", resources: [sources.cmuEvidence, sources.criticalThinking] },
    ] },
    { id: "think-alternatives", number: "01", title: "Alternatives and Assumptions", description: "Test the story you are telling yourself against realistic alternatives.", project: "Write an assumption map", lessons: [
      { id: "think-assumption", title: "Find the load-bearing assumption", duration: "35 min", summary: "Identify the assumption that would most change a decision if it proved false.", resources: [sources.criticalThinking, sources.cmuEvidence] },
      { id: "think-alternative", title: "Generate a credible alternative", duration: "37 min", summary: "Create alternatives that improve a decision rather than simply multiplying options.", resources: [sources.cmuEvidence, sources.cmuCollaboration] },
    ] },
    { id: "think-brief", number: "02", title: "Reasoned Briefs", description: "Turn a complex question into a transparent recommendation.", project: "Publish a one-page evidence brief", lessons: [
      { id: "think-brief-write", title: "Write the recommendation last", duration: "40 min", summary: "Make reasoning traceable from question to evidence to a bounded recommendation.", resources: [sources.googleWriting, sources.cmuEvidence] },
      { id: "think-revise", title: "Invite a challenge", duration: "28 min", summary: "Use an outside perspective to test your logic and make uncertainty explicit.", resources: [sources.mitCommKit, sources.criticalThinking] },
    ] },
  ], "orange"),
  course("high-signal-writing", "High-Signal Writing", "Write work people can act on", "NEW ROUTE / WRITING", "Go beyond grammar: learn how to make a memo, documentation page, proposal, or technical explanation precise, concise, and easy to verify.", "Google · Purdue OWL · MIT", sources.googleWriting.url, "5–8h guided route + practice", [
    { id: "write-clarity", number: "00", title: "Clarity Before Style", description: "Create direct sentences, useful headings, and information architecture that earns attention.", project: "Rewrite a dense page", lessons: [
      { id: "write-sentences", title: "Short sentences carry more signal", duration: "31 min", summary: "Edit for active voice, concrete verbs, and a reader who needs to act.", resources: [sources.googleWriting, sources.purdueOwl] },
      { id: "write-structure", title: "Headings are a decision tree", duration: "34 min", summary: "Use headings and lists to let a reader navigate an argument before reading every word.", resources: [sources.googleWriting, sources.mitCommKit] },
    ] },
    { id: "write-docs", number: "01", title: "Documentation That Works", description: "Write explanations around intent, constraints, examples, and recovery paths.", project: "Publish a small technical guide", lessons: [
      { id: "write-howto", title: "A how-to needs a proof point", duration: "38 min", summary: "Create a guide with a testable outcome, safe prerequisites, and a troubleshooting branch.", resources: [sources.googleWriting, sources.purdueOwl] },
      { id: "write-example", title: "Examples carry the hidden rules", duration: "30 min", summary: "Choose examples that expose the real decision rather than decorate an explanation.", resources: [sources.googleWriting, sources.mitCommKit] },
    ] },
    { id: "write-edit", number: "02", title: "Revision Discipline", description: "Make revision a deliberate quality loop, not a last-minute cleanup.", project: "Deliver an edited memo", lessons: [
      { id: "write-edit-pass", title: "Edit in passes", duration: "29 min", summary: "Separate structure, clarity, evidence, and copy-editing so revisions do not cancel each other out.", resources: [sources.purdueOwl, sources.googleWriting] },
      { id: "write-reader", title: "Test with a real reader", duration: "27 min", summary: "Ask a reader to state the claim, evidence, and next step before you revise.", resources: [sources.mitCommKit, sources.purdueOwl] },
    ] },
  ]),
  course("learning-systems", "Learning Systems", "Build the practice that compounds", "NEW ROUTE / LEARNING", "Replace motivation-only study with a practical system for choosing material, retrieving it, spacing it, seeking feedback, and recovering when a plan slips.", "The Learning Scientists · CMU", sources.learningScientists.url, "5–7h guided route + practice", [
    { id: "learn-design", number: "00", title: "Design the Loop", description: "Choose a focused goal and a study action that produces evidence of learning.", project: "Create a two-week learning plan", lessons: [
      { id: "learn-goal", title: "Study goals need observable evidence", duration: "30 min", summary: "Turn “learn X” into a small capability you can demonstrate.", resources: [sources.learningScientists, sources.cmuEvidence] },
      { id: "learn-retrieve", title: "Retrieval beats re-reading", duration: "34 min", summary: "Use recall before review to identify what is actually available in memory.", resources: [sources.learningScientists] },
    ] },
    { id: "learn-schedule", number: "01", title: "Space and Interleave", description: "Create schedules that revisit important ideas without pretending every day will go perfectly.", project: "Build a spaced review queue", lessons: [
      { id: "learn-space", title: "Space the return", duration: "28 min", summary: "Plan short returns to a concept and record what you can retrieve before checking notes.", resources: [sources.learningScientists] },
      { id: "learn-interleave", title: "Mix the right problems", duration: "31 min", summary: "Choose when switching between related problem types improves discrimination and when it just creates noise.", resources: [sources.learningScientists, sources.cmuEvidence] },
    ] },
    { id: "learn-feedback", number: "02", title: "Feedback and Recovery", description: "Use mistakes, review, and restarts as part of the system rather than proof you are failing.", project: "Write a learning retro", lessons: [
      { id: "learn-feedback-loop", title: "Make feedback specific", duration: "29 min", summary: "Ask for feedback on one artifact or explanation and turn it into the next practice task.", resources: [sources.mitCommKit, sources.learningScientists] },
      { id: "learn-retro", title: "Recover the plan", duration: "25 min", summary: "Review what worked, remove one barrier, and restart from the smallest viable next session.", resources: [sources.learningScientists, sources.openLearnCareer] },
    ] },
  ], "orange"),
  course("career-navigation", "Career Navigation", "Make opportunity legible", "NEW ROUTE / CAREER", "Build a grounded way to explore roles, describe your work, prepare for conversations, and make next-step choices without chasing generic career advice.", "OpenLearn · MIT CAPD", sources.openLearnCareer.url, "4–7h guided route + practice", [
    { id: "career-map", number: "00", title: "Map the Work", description: "Start with roles, problems, environments, and evidence rather than titles alone.", project: "Create a role map", lessons: [
      { id: "career-signal", title: "Read the role beneath the title", duration: "33 min", summary: "Identify the recurring problems, tools, and proof a role actually appears to require.", resources: [sources.openLearnCareer, sources.mitCapd] },
      { id: "career-gap", title: "Choose the next capability", duration: "31 min", summary: "Compare your current evidence to one role and choose a small capability to build next.", resources: [sources.mitCapd, sources.learningScientists] },
    ] },
    { id: "career-story", number: "01", title: "Show the Work", description: "Turn real projects and learning into concise, credible stories.", project: "Build a small evidence portfolio", lessons: [
      { id: "career-story-write", title: "Write the project story", duration: "37 min", summary: "Use context, action, evidence, and learning to explain work without inflating your role.", resources: [sources.mitCapd, sources.googleWriting] },
      { id: "career-portfolio", title: "Choose proof over claims", duration: "29 min", summary: "Select artifacts that demonstrate a capability and explain what they do and do not show.", resources: [sources.openLearnCareer, sources.mitCapd] },
    ] },
    { id: "career-conversation", number: "02", title: "Conversations and Next Moves", description: "Prepare for a professional conversation with curiosity, boundaries, and useful follow-through.", project: "Run an informational conversation plan", lessons: [
      { id: "career-questions", title: "Ask useful career questions", duration: "27 min", summary: "Prepare questions that help you understand work, not extract promises or shortcuts.", resources: [sources.openLearnCareer, sources.mitCommKit] },
      { id: "career-followup", title: "Follow up with evidence", duration: "24 min", summary: "Write a respectful follow-up that names one insight and one next action.", resources: [sources.mitCommKit, sources.openLearnCareer] },
    ] },
  ]),
  course("decision-making", "Decision-Making", "Choose with evidence and reversibility", "NEW ROUTE / DECISIONS", "Build a disciplined decision habit: define the question, collect enough evidence, compare trade-offs, document uncertainty, and learn from the outcome.", "CMU OLI · Foundation for Critical Thinking", sources.cmuEvidence.url, "5–8h guided route + practice", [
    { id: "decision-frame", number: "00", title: "Frame the Decision", description: "Make the question, owner, scope, and reversibility explicit before researching everything.", project: "Write a decision frame", lessons: [
      { id: "decision-question", title: "Name the decision", duration: "31 min", summary: "Turn a vague problem into a decision statement with an owner and a deadline.", resources: [sources.cmuEvidence, sources.criticalThinking] },
      { id: "decision-reversible", title: "Match effort to reversibility", duration: "30 min", summary: "Distinguish decisions that can be tested and reversed from those that require deeper scrutiny.", resources: [sources.cmuEvidence, sources.criticalThinking] },
    ] },
    { id: "decision-evidence", number: "01", title: "Compare Evidence", description: "Collect enough signal, investigate uncertainty, and compare options fairly.", project: "Create a trade-off table", lessons: [
      { id: "decision-criteria", title: "Choose criteria before options", duration: "36 min", summary: "Create criteria that reflect the problem rather than conveniently rewarding your favourite option.", resources: [sources.cmuEvidence, sources.criticalThinking] },
      { id: "decision-uncertainty", title: "Document what you do not know", duration: "33 min", summary: "Identify the uncertainty that could change the outcome and decide how to test it.", resources: [sources.cmuEvidence, sources.googleWriting] },
    ] },
    { id: "decision-record", number: "02", title: "Record and Learn", description: "Create decision records that make future review possible.", project: "Publish a decision record", lessons: [
      { id: "decision-write", title: "Write the decision record", duration: "35 min", summary: "Document context, options, trade-offs, choice, and the evidence that should trigger review.", resources: [sources.googleWriting, sources.cmuEvidence] },
      { id: "decision-review", title: "Review the outcome without hindsight", duration: "27 min", summary: "Compare the outcome to the information available at the time and improve the next process.", resources: [sources.criticalThinking, sources.cmuEvidence] },
    ] },
  ], "orange"),
  course("negotiation-and-collaboration", "Negotiation & Collaboration", "Prepare well. Work the problem together.", "NEW ROUTE / COLLABORATION", "Practice ethical negotiation and collaboration: prepare interests and boundaries, ask better questions, structure joint problem-solving, and leave a clear record of the agreement.", "University of Michigan · Carnegie Mellon", sources.negotiation.url, "5–8h guided route + practice", [
    { id: "collab-prepare", number: "00", title: "Prepare the Conversation", description: "Know the goal, interests, alternatives, constraints, and questions before you negotiate or collaborate.", project: "Create a preparation brief", lessons: [
      { id: "collab-interests", title: "Interests are not positions", duration: "35 min", summary: "Separate the underlying need from the first solution someone proposes.", resources: [sources.negotiation, sources.cmuCollaboration] },
      { id: "collab-boundaries", title: "Name your constraints honestly", duration: "30 min", summary: "Write time, scope, and ethical boundaries that keep a conversation grounded.", resources: [sources.negotiation, sources.mitCommKit] },
    ] },
    { id: "collab-work", number: "01", title: "Work the Problem Together", description: "Use questions, options, and shared criteria to improve the conversation.", project: "Run a low-stakes practice conversation", lessons: [
      { id: "collab-questions", title: "Questions create room", duration: "31 min", summary: "Ask questions that discover constraints and alternatives without treating the conversation as a trap.", resources: [sources.negotiation, sources.mitCommKit] },
      { id: "collab-options", title: "Generate options before closing", duration: "33 min", summary: "Create possible routes, compare them against shared criteria, and make trade-offs visible.", resources: [sources.cmuCollaboration, sources.cmuEvidence] },
    ] },
    { id: "collab-agree", number: "02", title: "Agree and Follow Through", description: "Turn a conversation into a clear, reviewable next move.", project: "Write a collaboration agreement", lessons: [
      { id: "collab-record", title: "Write what was agreed", duration: "27 min", summary: "Capture owners, actions, assumptions, and a review date in plain language.", resources: [sources.mitCommKit, sources.googleWriting] },
      { id: "collab-retro", title: "Review the collaboration", duration: "25 min", summary: "Reflect on preparation, communication, outcomes, and the next improvement without assigning blame.", resources: [sources.cmuCollaboration, sources.learningScientists] },
    ] },
  ], "orange"),
];

export const topSkillCourseIds = topSkillCourses.map((course) => course.id);
