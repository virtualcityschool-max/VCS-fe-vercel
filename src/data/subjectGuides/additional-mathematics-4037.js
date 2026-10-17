// Cambridge O Level Additional Mathematics 4037 — student guide.
// Facts from the official syllabus for exams in 2025, 2026 and 2027, the
// 2028–2030 syllabus ("no significant changes which affect teaching") and the
// June 2026 grade threshold table. See `sources`.

const additionalMathematics4037 = {
  slug: "additional-mathematics-4037",
  subject: "Additional Mathematics",
  level: "O Level",
  code: "4037",
  title: "Cambridge O Level Additional Mathematics (4037)",
  tagline:
    "Calculus, logarithms, vectors and trigonometry a year or two early — Additional Maths is the bridge from O Level to A Level, and a favourite of future engineers, doctors and coders.",
  syllabusYears: "2025, 2026 and 2027 — and unchanged in substance for 2028–2030",
  verifiedOn: "18 October 2026",
  accent: "rose",
  sibling: { slug: "mathematics-9709", label: "AS & A Level Mathematics (9709)" },

  quickFacts: [
    { label: "Syllabus code", value: "4037", note: "Cambridge O Level Additional Mathematics" },
    { label: "Exams you sit", value: "2 papers", note: "Paper 1 (no calculator) + Paper 2 (calculator)" },
    { label: "Total exam time", value: "4 hours", note: "2 hours each · 80 marks each" },
    { label: "Exam sessions", value: "June & November", note: "Every year" },
    { label: "Grades", value: "A* to E", note: "A* is the highest" },
    { label: "Teaching time", value: "about 130 hours", note: "Cambridge's guide" },
    { label: "Assumed", value: "O Level Maths content", note: "Including indices and surds" },
    { label: "Formula list", value: "Given", note: "On page 2 of each paper" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. It helps you to:",
    points: [
      "Build on the maths you already know and go further.",
      "Develop a mathematician's curiosity and use it flexibly.",
      "Tackle harder, multi-step problems with creativity and resilience.",
      "Become fluent and confident with techniques, with and without a calculator.",
      "Justify your reasoning with clear, structured arguments.",
      "Build a solid foundation for A Level Mathematics and other highly numerate subjects.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Functions and polynomials", topics: "Topics 1–5", story: "Functions are machines that turn inputs into outputs; quadratics model the path of a ball; the factor theorem cracks open cubics. This is the algebra A Level is built on." },
    { title: "Logs and exponentials", topics: "Topic 6", story: "Logarithms turn huge growth into straight lines — they measure earthquakes, sound and acidity, and they let you solve equations where the unknown is a power." },
    { title: "Geometry with algebra", topics: "Topics 7–10, 13", story: "Straight lines, circles, radians, trigonometric identities and vectors — the toolkit for engineering drawings, robotics and computer graphics." },
    { title: "Counting and series", topics: "Topics 11–12", story: "How many passwords or team line-ups are possible? Permutations and combinations answer it. Series and the binomial expansion describe patterns that grow." },
    { title: "Calculus", topics: "Topic 14", story: "The maths of change — finding the steepest point, the maximum profit, the speed of a moving object, and the area under a curve. Newton and Leibniz's idea that powers modern physics and economics." },
  ],

  topics: [
    { n: 1, name: "Functions", parts: [] },
    { n: 2, name: "Quadratic functions", parts: [] },
    { n: 3, name: "Factors of polynomials", parts: [] },
    { n: 4, name: "Equations, inequalities and graphs", parts: [] },
    { n: 5, name: "Simultaneous equations", parts: [] },
    { n: 6, name: "Logarithmic and exponential functions", parts: [] },
    { n: 7, name: "Straight-line graphs", parts: [] },
    { n: 8, name: "Coordinate geometry of the circle", parts: [] },
    { n: 9, name: "Circular measure", parts: [] },
    { n: 10, name: "Trigonometry", parts: [] },
    { n: 11, name: "Permutations and combinations", parts: [] },
    { n: 12, name: "Series", parts: [] },
    { n: 13, name: "Vectors in two dimensions", parts: [] },
    { n: 14, name: "Calculus", parts: [] },
  ],

  compareTitle: "Maths → Add Maths → A Level",
  compare: {
    intro: "Additional Maths sits between O Level Mathematics (4024) and A Level Mathematics (9709). Much of it reappears in A Level Pure Mathematics 1.",
    cols: ["At O Level Mathematics (4024)", "In Additional Mathematics (this course)"],
    rows: [
      { idea: "Algebra", here: "Linear and quadratic equations", next: "Polynomials, factor and remainder theorems, modulus functions" },
      { idea: "Graphs", here: "Gradient of a straight line", next: "Gradient of a curve by differentiation; area by integration" },
      { idea: "Trigonometry", here: "Degrees, triangles", next: "Radians, identities, trig equations and graphs" },
      { idea: "Growth", here: "Exponential growth and decay", next: "Laws of logarithms, solving exponential equations" },
      { idea: "Counting", here: "Simple probability", next: "Permutations, combinations, binomial expansion" },
    ],
  },

  papers: [
    { name: "Paper 1 — Non-calculator", time: "2 hours", marks: 80, weight: "50%", what: "Structured and unstructured questions. A calculator is not allowed.", who: "Everyone" },
    { name: "Paper 2 — Calculator", time: "2 hours", marks: 80, weight: "50%", what: "Structured and unstructured questions. A scientific calculator is required.", who: "Everyone" },
  ],
  papersNote: "Both papers are marked by Cambridge.",

  questionTypes: [
    { type: "Show that", example: "Show that (x − 2) is a factor of x³ − 3x² − 4x + 12, and hence solve the equation.", testing: "Complete, logical working — the answer is given, the method earns the marks." },
    { type: "Calculus", example: "Find the coordinates of the stationary points of y = x³ − 6x² + 9x and determine their nature.", testing: "Differentiate, solve, then use the second derivative or a sign test." },
    { type: "Logarithms (non-calculator)", example: "Solve 2 log₃ x − log₃ (x + 6) = 1.", testing: "Laws of logs and exact algebra — no calculator to rescue you." },
    { type: "Trigonometry in radians", example: "Find the area of the shaded segment, giving your answer in terms of π.", testing: "Arc length and sector area formulas with exact values." },
    { type: "Counting", example: "How many different 4-digit codes can be formed from the digits 1 to 7 if no digit is repeated?", testing: "Choosing between permutations and combinations." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "Show (that)", meaning: "provide structured evidence that leads to a given result", tip: "Show every line; never skip to the given answer." },
    { word: "Verify", meaning: "confirm a given statement/result is true", tip: "Substitute and check — conclude clearly." },
    { word: "Determine", meaning: "establish with certainty", tip: "Justify fully (e.g. the nature of a stationary point)." },
    { word: "Sketch", meaning: "make a simple freehand drawing showing the key features", tip: "Intercepts, turning points, asymptotes." },
    { word: "Calculate", meaning: "work out from given facts, figures or information", tip: "Clear working; exact or 3 s.f. as asked." },
    { word: "Write down", meaning: "give an answer without significant working", tip: "One step — usually an easy mark." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Knowledge and understanding of mathematical techniques", weight: "45–55", bar: 50, plain: "Use the techniques accurately and fluently." },
    { code: "AO2", name: "Analyse, interpret and communicate mathematically", weight: "45–55", bar: 50, plain: "Choose methods, solve multi-step problems and justify reasoning." },
  ],
  aoNote: "About half the marks are for reasoning and problem-solving — learn methods, then practise mixed questions.",

  grades: {
    scale: "A*, A, B, C, D, E. 'Ungraded' means below E and is not shown on the certificate.",
    thresholds: {
      series: "June 2026",
      max: 160,
      rows: [
        { grade: "A*", range: "138–141", pct: "about 86–88%" },
        { grade: "A", range: "117–122", pct: "about 73–76%" },
        { grade: "B", range: "88–92", pct: "about 55–57%" },
        { grade: "C", range: "59–62", pct: "about 37–39%" },
        { grade: "D", range: "46–49", pct: "about 29–31%" },
        { grade: "E", range: "33–36", pct: "about 21–22%" },
      ],
      note: "Minimum marks out of 160 in June 2026 (the range covers the different paper variants).",
    },
    meaning: "A good Additional Maths grade shows universities you can handle A Level-style mathematics early.",
  },

  practicalTitle: "Exam toolkit",
  practical: [
    "Paper 1 has no calculator: practise exact values (surds, π, trig ratios of special angles) and log laws by hand.",
    "A List of formulas is printed in the papers — know where everything is so you don't waste time.",
    "Work in radians for calculus and circular measure unless told otherwise.",
    "Write each step on a new line; examiners award method marks for correct working.",
    "Check answers by substituting back — a great habit for 'verify' and 'show that'.",
  ],

  books: [
    { title: "Cambridge IGCSE and O Level Additional Mathematics Coursebook (3rd edition)", by: "Cambridge University Press (2023)", note: "Endorsed for the syllabus from 2025." },
    { title: "Cambridge IGCSE and O Level Additional Mathematics Student's Book (2nd edition)", by: "Hachette Learning (2023)", note: "Endorsed for 0606/4037 from 2025." },
    { title: "MCE Cambridge IGCSE and O Level Additional Mathematics", by: "Marshall Cavendish Education (2023)", note: "Endorsed for the syllabus from 2025." },
    { title: "Past papers and mark schemes", by: "Cambridge International", note: "Do them timed — check the mark scheme for method marks." },
  ],
  booksNote: "Cambridge's syllabus says textbooks endorsed for IGCSE Additional Mathematics are also suitable for this course.",

  mistakes: [
    "Using degrees when the question is in radians.",
    "Breaking log laws — log(a + b) is not log a + log b.",
    "Forgetting the constant of integration, or the ± when square-rooting.",
    "Losing a solution when dividing both sides by an expression that could be zero.",
    "Not stating the nature (maximum or minimum) of a stationary point when asked.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Start", what: "Make sure O Level Maths algebra, indices and surds are secure — they are assumed." },
    { when: "Block 1", what: "Functions, quadratics, polynomials, equations and inequalities (1–5)." },
    { when: "Block 2", what: "Logarithms and exponentials, straight lines and circles (6–8)." },
    { when: "Block 3", what: "Circular measure and trigonometry (9–10); permutations, combinations, series (11–12)." },
    { when: "Block 4", what: "Vectors (13) and calculus (14) — the largest and most rewarding topic." },
    { when: "Final months", what: "Timed Paper 1 and Paper 2 practice every week; mixed-topic problems." },
  ],
  studyNote: "Cambridge designs the course for about 130 guided learning hours. Many students take it alongside O Level Mathematics.",

  careers: {
    intro: "Additional Maths gives you a head start for the most maths-heavy degrees.",
    paths: [
      { name: "Engineering & architecture", need: "A Level Maths + Physics" },
      { name: "Computer science & AI", need: "A Level Maths" },
      { name: "Economics, finance, actuarial science", need: "A Level Maths" },
      { name: "Physics & astronomy", need: "A Level Maths + Physics" },
      { name: "Medicine (shows strong numeracy)", need: "Helpful alongside the sciences" },
    ],
  },

  realWorld: [
    { title: "Al-Khwarizmi", text: "His 9th-century book on solving equations gave us the word 'algebra' — Topics 2–5 are his legacy." },
    { title: "Logarithms in nature", text: "Earthquake magnitude, sound in decibels and pH all use logarithmic scales — one step means ten times more." },
    { title: "Calculus in action", text: "Engineers use differentiation to find maximum strength or minimum cost; integration gives areas and distances travelled." },
    { title: "Counting and security", text: "Permutations tell you how many passwords are possible — and why longer passwords are so much safer." },
  ],

  faqs: [
    { q: "Do I need O Level Mathematics first?", a: "Cambridge assumes you know the content of O Level / IGCSE Mathematics, including indices and surds. Many students take both together." },
    { q: "Is Additional Maths hard?", a: "It's more demanding than O Level Maths — the A* boundary in June 2026 was about 86–88%. Regular practice makes the difference." },
    { q: "Do I need it for A Level Maths?", a: "It isn't required, but students who have done it usually find AS Pure Mathematics much easier." },
    { q: "Calculator?", a: "Not allowed in Paper 1; a scientific calculator is required for Paper 2." },
    { q: "Is the syllabus changing?", a: "The 2028–2030 syllabus has no significant changes that affect teaching." },
  ],

  sources: [
    { label: "Official syllabus 4037 for exams in 2025, 2026 and 2027 (PDF)", url: "https://www.cambridgeinternational.org/Images/662720-2025-2027-syllabus.pdf" },
    { label: "Official syllabus 4037 for exams in 2028, 2029 and 2030 (PDF)", url: "https://www.cambridgeinternational.org/Images/744873-2028-2030-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/762890-additional-mathematics-4037-june-2026-grade-threshold-table.pdf" },
    { label: "Endorsed resources for 4037", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-mathematics-additional-4037/endorsed-resources/" },
  ],
};

export default additionalMathematics4037;
