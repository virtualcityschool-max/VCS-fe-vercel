// Cambridge O Level Mathematics (Syllabus D) 4024 — student guide.
// Facts from the official syllabus for exams in 2025, 2026 and 2027 (version 2),
// the 2028–2030 syllabus ("no significant changes which affect teaching") and
// the June 2026 grade threshold table. See `sources`.

const mathematics4024 = {
  slug: "mathematics-4024",
  subject: "Mathematics",
  level: "O Level",
  code: "4024",
  title: "Cambridge O Level Mathematics — Syllabus D (4024)",
  tagline:
    "Shop discounts, bank interest, the shortest route on a map, the chance of rain — mathematics is the language every other subject borrows, and a subject almost every university asks about.",
  syllabusYears: "2025, 2026 and 2027 — and unchanged in substance for 2028–2030",
  verifiedOn: "18 October 2026",
  accent: "amber",
  sibling: { slug: "mathematics-9709", label: "AS & A Level Mathematics (9709)" },

  quickFacts: [
    { label: "Syllabus code", value: "4024", note: "Cambridge O Level Mathematics (Syllabus D)" },
    { label: "Exams you sit", value: "2 papers", note: "Paper 1 (no calculator) + Paper 2 (calculator)" },
    { label: "Total exam time", value: "4 hours", note: "2 hours each" },
    { label: "Exam sessions", value: "June & November", note: "Every year" },
    { label: "Grades", value: "A* to E", note: "A* is the highest" },
    { label: "Teaching time", value: "about 130 hours", note: "Cambridge's guide; usually 2 school years" },
    { label: "Calculator", value: "Paper 2 only", note: "Not allowed in Paper 1" },
    { label: "Formula list", value: "Given", note: "On page 2 of each paper — but not every formula" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. By the end you should:",
    points: [
      "Enjoy mathematics and feel confident with it.",
      "Have a real feel for numbers — and know whether an answer makes sense.",
      "Use maths in your own life and the world around you.",
      "Solve problems with creativity and resilience.",
      "Communicate mathematics clearly, and reason logically to reach conclusions.",
      "See how different areas of maths connect, and be ready for further study.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Number sense", topics: "Topic 1 — Number", story: "Percentages, ratio, rates, standard form, money and time — the maths of shopping, salaries, recipes and travel. New in this syllabus: surds and exponential growth and decay, the maths of interest, population and viruses spreading." },
    { title: "Algebra and graphs", topics: "Topics 2–3", story: "Algebra lets you solve thousands of problems at once with one rule. Graphs turn equations into pictures you can read — speed, cost, growth. Coordinate geometry links the two." },
    { title: "Shape and space", topics: "Topics 4–7", story: "Angles, circle theorems, similarity, area and volume, Pythagoras and trigonometry — used by builders, engineers, pilots and game designers. Transformations and vectors describe movement and direction." },
    { title: "Chance and data", topics: "Topics 8–9", story: "Probability and statistics help you judge risk and read the news critically — averages, spread, histograms and cumulative frequency are how organisations make decisions from data." },
  ],

  topics: [
    { n: 1, name: "Number", parts: ["Types of number", "Sets", "Powers and roots", "Fractions, decimals and percentages", "Ordering", "The four operations", "Indices I", "Standard form", "Estimation", "Limits of accuracy", "Ratio and proportion", "Rates", "Percentages", "Using a calculator", "Time", "Money", "Exponential growth and decay", "Surds"] },
    { n: 2, name: "Algebra and graphs", parts: ["Introduction to algebra", "Algebraic manipulation", "Algebraic fractions", "Indices II", "Equations", "Inequalities", "Sequences", "Proportion", "Graphs in practical situations", "Graphs of functions", "Sketching curves", "Functions"] },
    { n: 3, name: "Coordinate geometry", parts: ["Coordinates", "Drawing linear graphs", "Gradient of linear graphs", "Length and midpoint", "Equations of linear graphs", "Parallel lines", "Perpendicular lines"] },
    { n: 4, name: "Geometry", parts: ["Geometrical terms", "Geometrical constructions", "Scale drawings", "Similarity", "Symmetry", "Angles", "Circle theorems I", "Circle theorems II"] },
    { n: 5, name: "Mensuration", parts: ["Units of measure", "Area and perimeter", "Circles, arcs and sectors", "Surface area and volume", "Compound shapes and parts of shapes"] },
    { n: 6, name: "Trigonometry", parts: ["Pythagoras' theorem", "Right-angled triangles", "Non-right-angled triangles"] },
    { n: 7, name: "Transformations and vectors", parts: ["Transformations", "Vectors in two dimensions", "Magnitude of a vector", "Vector geometry"] },
    { n: 8, name: "Probability", parts: ["Introduction to probability", "Relative and expected frequencies", "Probability of combined events"] },
    { n: 9, name: "Statistics", parts: ["Classifying statistical data", "Interpreting statistical data", "Averages and measures of spread", "Statistical charts and diagrams", "Scatter diagrams", "Cumulative frequency diagrams", "Histograms"] },
  ],

  compareTitle: "O Level → Additional Maths → A Level",
  compare: {
    intro: "O Level Mathematics is the foundation. Many strong students add Additional Mathematics (4037) alongside it as a bridge to A Level (9709).",
    cols: ["At O Level Mathematics (this course)", "At A Level Mathematics (9709)"],
    rows: [
      { idea: "Algebra", here: "Equations, inequalities, sequences, functions", next: "Polynomials, partial fractions, binomial expansion" },
      { idea: "Graphs", here: "Linear and simple curves; gradients", next: "Differentiation and integration (calculus)" },
      { idea: "Trigonometry", here: "Right-angled and non-right-angled triangles", next: "Radians, identities, trig equations and graphs" },
      { idea: "Growth", here: "Exponential growth and decay", next: "Logarithms, exponential functions, differential equations" },
      { idea: "Data & chance", here: "Averages, charts, probability", next: "Probability distributions, the normal distribution, hypothesis tests" },
    ],
  },

  papers: [
    { name: "Paper 1 — Non-calculator", time: "2 hours", marks: 100, weight: "50%", what: "Structured and unstructured questions on the whole syllabus. A calculator is not allowed.", who: "Everyone" },
    { name: "Paper 2 — Calculator", time: "2 hours", marks: 100, weight: "50%", what: "Structured and unstructured questions on the whole syllabus. A scientific calculator is required.", who: "Everyone" },
  ],
  papersNote: "Both papers are marked by Cambridge. Bring a pair of compasses, a protractor and a ruler to both papers.",

  questionTypes: [
    { type: "Short skill question", example: "Write 0.000 307 in standard form.", testing: "Accurate basic technique — quick marks you must not drop." },
    { type: "Non-calculator working (Paper 1)", example: "Without a calculator, work out 3¾ ÷ 1⅞, giving your answer in its simplest form.", testing: "Fractions, surds and mental strategies — Paper 1 has no calculator." },
    { type: "Multi-step problem", example: "A shop increases a price by 20% and then reduces the new price by 20%. Show that the final price is 4% less than the original.", testing: "Planning several steps and showing clear working." },
    { type: "Geometry with reasons", example: "Find angle x, giving a geometrical reason for each step.", testing: "Circle theorems and angle facts — reasons earn marks." },
    { type: "Statistics", example: "Use the cumulative frequency diagram to estimate the median and the interquartile range.", testing: "Reading graphs accurately and interpreting the result." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "Calculate", meaning: "work out from given facts, figures or information", tip: "Show your working." },
    { word: "Show (that)", meaning: "provide structured evidence that leads to a given result", tip: "Every step written — the answer is given, the working is the mark." },
    { word: "Work out", meaning: "calculate from given facts, figures or information with or without the use of a calculator", tip: "Check whether the paper allows a calculator." },
    { word: "Construct", meaning: "make an accurate drawing", tip: "Ruler and compasses; leave construction arcs visible." },
    { word: "Sketch", meaning: "make a simple freehand drawing showing the key features", tip: "Correct shape, intercepts and turning points." },
    { word: "Write down", meaning: "give an answer without significant working", tip: "One step — don't overthink it." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Knowledge and understanding of mathematical techniques", weight: "40–50", bar: 45, plain: "Recall and use techniques accurately, with and without a calculator." },
    { code: "AO2", name: "Analyse, interpret and communicate mathematically", weight: "50–60", bar: 55, plain: "Choose a strategy, solve unfamiliar problems, reason and explain." },
  ],
  aoNote: "More than half the marks are for problem-solving and reasoning, not just routine methods — practise questions you haven't seen before.",

  grades: {
    scale: "A*, A, B, C, D, E. 'Ungraded' means below E and is not shown on the certificate. Your certificate says GCE O LEVEL.",
    thresholds: {
      series: "June 2026",
      max: 200,
      rows: [
        { grade: "A*", range: "173–175", pct: "about 86–88%" },
        { grade: "A", range: "147–150", pct: "about 74–75%" },
        { grade: "B", range: "104–109", pct: "about 52–55%" },
        { grade: "C", range: "62–68", pct: "about 31–34%" },
        { grade: "D", range: "49–53", pct: "about 25–27%" },
        { grade: "E", range: "37–38", pct: "about 19%" },
      ],
      note: "Minimum marks out of 200 in June 2026 (the range covers the different paper variants). Note how high the A* bar is — accuracy matters.",
    },
    meaning: "Almost every university course asks for at least a C in Mathematics; science, engineering, business and computing usually want an A or A*.",
  },

  practicalTitle: "Exam toolkit",
  practical: [
    "Paper 1 has no calculator: practise fractions, decimals, percentages and surds by hand every week.",
    "Bring a pair of compasses, a protractor and a ruler to both papers.",
    "A List of formulas is printed in the papers, but not every formula is given — learn the rest.",
    "Show working in every question: method marks are awarded even when the final answer is wrong.",
    "Give answers to the accuracy asked (often 3 significant figures, angles to 1 decimal place).",
  ],

  books: [
    { title: "Cambridge O Level Mathematics Coursebook (3rd edition)", by: "Cambridge University Press (2023)", note: "Endorsed for the syllabus from 2025." },
    { title: "Cambridge O Level Mathematics Student's Book (2nd edition)", by: "Hodder Education (2023)", note: "Endorsed for the syllabus from 2025." },
    { title: "The official syllabus (PDF)", by: "Cambridge International", note: "Shows which formulas are given and which you must learn." },
    { title: "Past papers and mark schemes", by: "Cambridge International", note: "Do them timed — and check the mark scheme for method marks." },
  ],
  booksNote: "Cambridge says textbooks endorsed for the syllabus from 2025 are still suitable for 2028–2030.",

  mistakes: [
    "Rounding in the middle of a calculation instead of only at the end.",
    "Writing answers without working — losing method marks.",
    "Forgetting units (cm², cm³) or giving the wrong accuracy.",
    "Mixing up the median position and the median value.",
    "Leaving circle-theorem answers without reasons when they are asked for.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Year 1, term 1", what: "Number (1) — including non-calculator skills, standard form and percentages." },
    { when: "Year 1, term 2", what: "Algebra and graphs (2); coordinate geometry (3)." },
    { when: "Year 1, term 3", what: "Geometry and mensuration (4–5). First full past papers (one of each)." },
    { when: "Year 2, term 1", what: "Trigonometry, transformations and vectors (6–7)." },
    { when: "Year 2, term 2", what: "Probability and statistics (8–9); mixed-topic revision." },
    { when: "Final months", what: "A timed Paper 1 and Paper 2 every week; fix weak skills with short daily drills." },
  ],
  studyNote: "Cambridge designs the course for about 130 guided learning hours. Maths rewards little-and-often practice: 20–30 minutes a day beats one long session.",

  careers: {
    intro: "Almost every university course asks for a Mathematics grade — and many ask for a high one.",
    paths: [
      { name: "Engineering & architecture", need: "A Level Maths + Physics" },
      { name: "Computer science, AI & data science", need: "A Level Maths" },
      { name: "Accounting, finance, economics", need: "Strong Maths grades" },
      { name: "Medicine & sciences", need: "At least a good O Level Maths grade" },
      { name: "Business & management", need: "Usually O Level Maths, often A Level" },
      { name: "Actuarial science & statistics", need: "A Level Maths (Further Maths helps)" },
    ],
  },

  realWorld: [
    { title: "Al-Khwarizmi (c. 780–850)", text: "The scholar of Baghdad whose book gave us the word 'algebra' — and whose name gave us 'algorithm'." },
    { title: "Exponential growth", text: "Savings with compound interest, a growing population or a spreading virus all follow the same pattern — now a full topic in this syllabus." },
    { title: "Statistics in the news", text: "Histograms and averages help you see when a headline uses data fairly — or misleadingly." },
    { title: "Trigonometry everywhere", text: "Surveyors, pilots and engineers use the sine and cosine rules to measure heights and distances they cannot reach." },
  ],

  faqs: [
    { q: "Do I need a calculator?", a: "Yes for Paper 2 (a scientific calculator is required). Paper 1 is a non-calculator paper." },
    { q: "Are formulas given?", a: "A List of formulas is printed in the papers, but not every formula you need is on it — the syllabus says which ones you must learn." },
    { q: "Should I also take Additional Mathematics?", a: "If you enjoy maths and plan A Level Maths, Physics, engineering or computing, Additional Maths (4037) is an excellent bridge." },
    { q: "Is O Level 4024 the same as IGCSE Mathematics 0580?", a: "No. They are separate Cambridge syllabuses. This guide is for O Level 4024." },
    { q: "Is the syllabus changing?", a: "The 2028–2030 syllabus has no significant changes that affect teaching." },
  ],

  sources: [
    { label: "Official syllabus 4024 for exams in 2025, 2026 and 2027 (PDF)", url: "https://www.cambridgeinternational.org/Images/662480-2025-2027-syllabus.pdf" },
    { label: "Official syllabus 4024 for exams in 2028, 2029 and 2030 (PDF)", url: "https://www.cambridgeinternational.org/Images/744869-2028-2030-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/762917-mathematics-syllabus-d-4024-june-2026-grade-threshold-table.pdf" },
    { label: "Endorsed resources for 4024", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-mathematics-d-4024/endorsed-resources/" },
  ],
};

export default mathematics4024;
