// Cambridge International AS & A Level Mathematics 9709 — student guide.
// Facts from the official syllabus for exams in 2026 and 2027 (version 4,
// December 2025), the 2028–2030 syllabus ("no significant changes which affect
// teaching") and the June 2026 grade threshold table. See `sources`.

const mathematics9709 = {
  slug: "mathematics-9709",
  subject: "Mathematics",
  level: "AS & A Level",
  code: "9709",
  title: "Cambridge International AS & A Level Mathematics (9709)",
  tagline:
    "Calculus, vectors, complex numbers, mechanics and statistics — A Level Maths is one of the A Levels universities ask for most, because it trains exactly the kind of thinking they want.",
  syllabusYears: "2026 and 2027 — and unchanged in substance for 2028–2030",
  verifiedOn: "18 October 2026",
  accent: "amber",
  sibling: { slug: "mathematics-4024", label: "O Level Mathematics (4024)" },

  quickFacts: [
    { label: "Syllabus code", value: "9709", note: "Cambridge International AS & A Level Mathematics" },
    { label: "AS Level", value: "2 papers", note: "Paper 1 + one of Papers 2, 4 or 5 · grades a–e" },
    { label: "Full A Level", value: "4 papers", note: "Papers 1, 3, 5 + 4 or 6 · grades A*–E" },
    { label: "Exam sessions", value: "June & November", note: "(March is offered in India only)" },
    { label: "Teaching time", value: "about 180 h (AS) · 360 h (A Level)", note: "Cambridge's guide; usually 2 years" },
    { label: "Calculator", value: "Scientific, all papers", note: "Graphical or algebra calculators are not allowed" },
    { label: "Formula list", value: "MF19 given", note: "List of formulae and statistical tables" },
    { label: "Choice", value: "Mechanics or Statistics", note: "You choose which applied papers to take" },
  ],

  why: {
    intro: "Cambridge designs 9709 to give you the mathematics behind sciences, engineering, economics and computing. By the end you should be able to:",
    points: [
      "Use a wide range of techniques accurately and fluently — algebra, calculus, trigonometry, vectors.",
      "Model real situations: moving objects in Mechanics, uncertainty and data in Statistics.",
      "Solve unfamiliar, multi-step problems and choose your own strategy.",
      "Communicate mathematics clearly and justify each step.",
      "Move on confidently to Further Mathematics or a numerate degree.",
    ],
    source: "Based on the syllabus overview and assessment objectives.",
  },

  stories: [
    { title: "Pure Mathematics 1", topics: "Paper 1 — compulsory", story: "Quadratics, functions, coordinate geometry, radians, trigonometry, series — and your first calculus. Everything else in A Level Maths builds on this paper." },
    { title: "Pure Mathematics 2 & 3", topics: "Papers 2 and 3", story: "Logarithms, harder trigonometry, numerical methods and deeper calculus. Paper 3 adds vectors in 3D, differential equations and complex numbers — the maths of electronics, waves and quantum physics." },
    { title: "Mechanics", topics: "Paper 4", story: "Forces, equilibrium, motion, momentum, Newton's laws, energy and power — the maths of cars, lifts, bridges and projectiles. Perfect if you also study Physics." },
    { title: "Probability & Statistics", topics: "Papers 5 and 6", story: "Data, permutations, probability, distributions, the normal curve, then Poisson, sampling and hypothesis tests — how scientists, doctors and businesses decide whether a result is real or just chance." },
  ],

  topicGroups: [
    {
      label: "Pure Mathematics",
      groups: [
        { area: "Pure Mathematics 1 (Paper 1)", topics: [["1.1", "Quadratics"], ["1.2", "Functions"], ["1.3", "Coordinate geometry"], ["1.4", "Circular measure"], ["1.5", "Trigonometry"], ["1.6", "Series"], ["1.7", "Differentiation"], ["1.8", "Integration"]] },
        { area: "Pure Mathematics 2 (Paper 2 — AS only)", topics: [["2.1", "Algebra"], ["2.2", "Logarithmic and exponential functions"], ["2.3", "Trigonometry"], ["2.4", "Differentiation"], ["2.5", "Integration"], ["2.6", "Numerical solution of equations"]] },
        { area: "Pure Mathematics 3 (Paper 3 — A Level)", topics: [["3.1", "Algebra"], ["3.2", "Logarithmic and exponential functions"], ["3.3", "Trigonometry"], ["3.4", "Differentiation"], ["3.5", "Integration"], ["3.6", "Numerical solution of equations"], ["3.7", "Vectors"], ["3.8", "Differential equations"], ["3.9", "Complex numbers"]] },
      ],
    },
    {
      label: "Applied Mathematics",
      groups: [
        { area: "Mechanics (Paper 4)", topics: [["4.1", "Forces and equilibrium"], ["4.2", "Kinematics of motion in a straight line"], ["4.3", "Momentum"], ["4.4", "Newton's laws of motion"], ["4.5", "Energy, work and power"]] },
        { area: "Probability & Statistics 1 (Paper 5)", topics: [["5.1", "Representation of data"], ["5.2", "Permutations and combinations"], ["5.3", "Probability"], ["5.4", "Discrete random variables"], ["5.5", "The normal distribution"]] },
        { area: "Probability & Statistics 2 (Paper 6 — A Level)", topics: [["6.1", "The Poisson distribution"], ["6.2", "Linear combinations of random variables"], ["6.3", "Continuous random variables"], ["6.4", "Sampling and estimation"], ["6.5", "Hypothesis tests"]] },
      ],
    },
  ],

  compare: {
    intro: "Coming from O Level Maths (and ideally Additional Maths)? Here's what changes.",
    rows: [
      { idea: "Algebra", here: "Equations and simple functions", next: "Composite and inverse functions, partial fractions, binomial expansion" },
      { idea: "Calculus", here: "None (Add Maths: basic)", next: "Chain, product and quotient rules; integration techniques; differential equations" },
      { idea: "Trigonometry", here: "Triangles in degrees", next: "Radians, identities, compound angles, R sin(θ + α)" },
      { idea: "Vectors", here: "2D column vectors", next: "3D vectors, lines in space, scalar product" },
      { idea: "Statistics", here: "Averages and charts", next: "Distributions, normal approximation, hypothesis tests" },
      { idea: "New ideas", here: "—", next: "Complex numbers, numerical methods, Newton's laws in Mechanics" },
    ],
  },

  papers: [
    { name: "Paper 1 — Pure Mathematics 1", time: "1 hour 50 minutes", marks: 75, weight: "60% of AS · 30% of A Level", what: "10 to 12 structured questions. Compulsory for AS Level and A Level.", who: "Everyone" },
    { name: "Paper 2 — Pure Mathematics 2", time: "1 hour 15 minutes", marks: 50, weight: "40% of AS", what: "6 to 8 structured questions. AS Level only — this route cannot count towards A Level.", who: "AS only" },
    { name: "Paper 3 — Pure Mathematics 3", time: "1 hour 50 minutes", marks: 75, weight: "30% of A Level", what: "9 to 11 structured questions. Compulsory for A Level.", who: "A Level" },
    { name: "Paper 4 — Mechanics", time: "1 hour 15 minutes", marks: 50, weight: "40% of AS · 20% of A Level", what: "6 to 8 structured questions on Mechanics.", who: "AS or A Level option" },
    { name: "Paper 5 — Probability & Statistics 1", time: "1 hour 15 minutes", marks: 50, weight: "40% of AS · 20% of A Level", what: "6 to 8 structured questions. Compulsory for A Level.", who: "AS option · A Level" },
    { name: "Paper 6 — Probability & Statistics 2", time: "1 hour 15 minutes", marks: 50, weight: "20% of A Level", what: "6 to 8 structured questions. A Level only.", who: "A Level option" },
  ],
  papersNote: "All papers are written exams marked by Cambridge. A scientific calculator is expected in every paper, and the list of formulae and statistical tables (MF19) is supplied.",
  routes: [
    { name: "AS Level (choose one pair)", detail: "Papers 1 + 2 (pure only — cannot lead on to A Level), or 1 + 4 (pure + Mechanics), or 1 + 5 (pure + Statistics)." },
    { name: "A Level with Mechanics", detail: "Papers 1, 3, 4 and 5 — popular with Physics and engineering students." },
    { name: "A Level with Statistics", detail: "Papers 1, 3, 5 and 6 — popular with Biology, Economics and Psychology students." },
  ],

  questionTypes: [
    { type: "Pure: calculus", example: "Find the equation of the normal to the curve y = (2x − 1)^½ at the point where x = 5.", testing: "Differentiation (chain rule), then coordinate geometry — two topics in one." },
    { type: "Pure: show that", example: "Show that the equation 3 sin 2θ = 4 cos θ can be written as … and hence solve it for 0° ≤ θ ≤ 360°.", testing: "Identities with every step shown, then solving with all solutions in range." },
    { type: "Mechanics", example: "A box of mass 5 kg is pulled up a rough slope… Find the coefficient of friction.", testing: "Clear force diagrams, resolving forces, Newton's second law." },
    { type: "Statistics", example: "The heights of plants are normally distributed with mean 24 cm and standard deviation 3 cm. Find the probability that a plant is taller than 28 cm.", testing: "Standardising and using normal tables correctly." },
    { type: "Hypothesis test (Paper 6)", example: "Test at the 5% significance level whether the mean number of calls per hour has increased.", testing: "Hypotheses, the right distribution, a clear conclusion in context." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "Show (that)", meaning: "provide structured evidence that leads to a given result", tip: "Every step written — the result is given." },
    { word: "Verify", meaning: "confirm a given statement/result is true", tip: "Substitute, check, conclude." },
    { word: "Determine", meaning: "establish with certainty", tip: "Full justification required." },
    { word: "Justify", meaning: "support a case with evidence/argument", tip: "Give the mathematical reason." },
    { word: "Sketch", meaning: "make a simple freehand drawing showing the key features, taking care over proportions", tip: "Intercepts, turning points, asymptotes." },
    { word: "Evaluate", meaning: "judge or calculate the quality, importance, amount, or value of something", tip: "Often 'find the exact value' of an integral." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Knowledge and understanding", weight: "55 (AS) · 52 (A Level)", bar: 53, plain: "Use techniques accurately; recall and apply methods." },
    { code: "AO2", name: "Application and communication", weight: "45 (AS) · 48 (A Level)", bar: 47, plain: "Choose strategies, model situations, solve unfamiliar problems and explain." },
  ],
  aoNote: "Almost half the marks are for applying and communicating — a correct answer with no reasoning can lose marks.",

  grades: {
    scale: "AS Level: a, b, c, d, e. Full A Level: A*, A, B, C, D, E. 'Ungraded' means below the lowest grade and is not shown on the certificate.",
    thresholds: {
      series: "June 2026 (full A Level, four papers)",
      max: 250,
      rows: [
        { grade: "A*", range: "222–234", pct: "about 89–94%" },
        { grade: "A", range: "194–218", pct: "about 78–87%" },
        { grade: "B", range: "161–194", pct: "about 64–78%" },
        { grade: "C", range: "124–155", pct: "about 50–62%" },
        { grade: "D", range: "88–116", pct: "about 35–46%" },
        { grade: "E", range: "52–77", pct: "about 21–31%" },
      ],
      note: "Minimum weighted marks out of 250 in June 2026. The range is wide because each paper variant (and the Mechanics or Statistics route) has its own boundaries. For AS Level alone (out of 125) an 'a' needed about 98–107.",
    },
    meaning: "Engineering, computer science, economics and physics degrees usually ask for an A or A* in Mathematics. Maths A* boundaries are high — accuracy is everything.",
  },

  practicalTitle: "Exam toolkit",
  practical: [
    "Have a scientific calculator for every paper — graphical and algebra-solving calculators are not allowed.",
    "The list of formulae and statistical tables (MF19) is supplied — know what's on it, and learn what isn't.",
    "Give non-exact answers to 3 significant figures (angles in degrees to 1 decimal place) unless told otherwise.",
    "Draw clear force diagrams in Mechanics; define your variables in Statistics.",
    "Show every step: method marks reward correct working even if an arithmetic slip spoils the answer.",
  ],

  books: [
    { title: "Cambridge International AS & A Level Mathematics coursebooks (Pure 1; Pure 2 & 3; Mechanics; Probability & Statistics 1 and 2)", by: "Cambridge University Press", note: "Endorsed series supporting the syllabus from 2020, with practice books and worked solutions." },
    { title: "Official syllabus and MF19 formula list", by: "Cambridge International", note: "Shows exactly which techniques each paper can test." },
    { title: "Past papers and mark schemes", by: "Cambridge International", note: "Do them timed — and study how method marks are awarded." },
  ],
  booksNote: "Cambridge says textbooks endorsed for the syllabus from 2020 are still suitable — including for 2028–2030.",

  mistakes: [
    "Using degrees in calculus, where radians are required.",
    "Losing solutions in trig equations by not finding every angle in the range.",
    "Forgetting '+ c' in indefinite integration.",
    "In Statistics: not stating hypotheses or not concluding in the context of the question.",
    "In Mechanics: missing a force (often friction or the normal reaction) from the diagram.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Year 1 (AS), term 1", what: "Pure 1: quadratics, functions, coordinate geometry, circular measure (1.1–1.4)." },
    { when: "Year 1, term 2", what: "Pure 1: trigonometry, series, differentiation, integration (1.5–1.8); start Mechanics or Statistics 1." },
    { when: "Year 1, term 3", what: "Finish your AS applied paper; AS past papers; sit AS (or carry on to A Level)." },
    { when: "Year 2 (A2), term 1", what: "Pure 3: algebra, logs, trigonometry, calculus, numerical methods (3.1–3.6)." },
    { when: "Year 2, term 2", what: "Pure 3: vectors, differential equations, complex numbers (3.7–3.9); finish your second applied paper." },
    { when: "Final months", what: "Timed past papers for every paper you'll sit; daily 30-minute problem sets." },
  ],
  studyNote: "Cambridge designs AS for about 180 and full A Level for about 360 guided learning hours. Daily practice is the secret to Maths.",

  careers: {
    intro: "A Level Mathematics is required or preferred for a huge range of degrees.",
    paths: [
      { name: "Engineering (all branches)", need: "Maths + Physics (Mechanics route recommended)" },
      { name: "Computer science, AI, data science", need: "Maths (Statistics route useful)" },
      { name: "Economics, finance, accounting, actuarial science", need: "Maths essential or strongly preferred" },
      { name: "Physics, mathematics, astronomy", need: "Maths (Further Maths often recommended)" },
      { name: "Medicine, psychology, biology research", need: "Maths with Statistics helps" },
    ],
  },

  realWorld: [
    { title: "Omar Khayyam (1048–1131)", text: "The Persian poet-mathematician solved cubic equations geometrically and helped reform the calendar — algebra and geometry working together, as in Pure Mathematics." },
    { title: "Calculus runs the world", text: "Rocket trajectories, drug dosages and machine-learning algorithms all rely on differentiation and integration." },
    { title: "Complex numbers", text: "The 'imaginary' numbers of Paper 3 are essential for electrical engineering and describing waves." },
    { title: "Statistics in medicine", text: "Hypothesis tests decide whether a new medicine really works or the result was luck." },
  ],

  faqs: [
    { q: "Do I need Additional Maths before A Level?", a: "Cambridge recommends a course equivalent to IGCSE (Extended) or O Level Mathematics. Additional Maths isn't required but makes Pure Mathematics much easier." },
    { q: "Mechanics or Statistics — which should I choose?", a: "Mechanics suits Physics and engineering students; Statistics suits Biology, Economics, Psychology and business students. A Level routes are Papers 1, 3, 4, 5 or Papers 1, 3, 5, 6." },
    { q: "Can I do AS with Papers 1 and 2 and then continue to A Level?", a: "No — Cambridge says the Paper 1 + 2 AS route cannot count towards A Level. Choose Paper 4 or 5 if you plan to continue." },
    { q: "Calculator?", a: "A scientific calculator is expected in all papers; graphical and algebra-solving calculators are not allowed." },
    { q: "Is the syllabus changing?", a: "The 2028–2030 syllabus has no significant changes that affect teaching." },
  ],

  sources: [
    { label: "Official syllabus 9709 for exams in 2026 and 2027 (PDF)", url: "https://www.cambridgeinternational.org/Images/697427-2026-2027-syllabus.pdf" },
    { label: "Official syllabus 9709 for exams in 2028, 2029 and 2030 (PDF)", url: "https://www.cambridgeinternational.org/Images/744634-2028-2030-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/761530-mathematics-9709-june-2026-grade-threshold-table.pdf" },
    { label: "Endorsed resources for 9709", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-mathematics-9709/endorsed-resources/" },
  ],
};

export default mathematics9709;
