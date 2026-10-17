// Cambridge International AS & A Level Chemistry 9701 — student guide.
// Facts are from the official syllabus for exams in 2025, 2026 and 2027, the
// 2028–2030 syllabus (Cambridge: "no significant changes which affect
// teaching") and the June 2026 grade threshold table. See `sources`.

const chemistry9701 = {
  slug: "chemistry-9701",
  subject: "Chemistry",
  level: "AS & A Level",
  code: "9701",
  title: "Cambridge International AS & A Level Chemistry (9701)",
  tagline:
    "How medicines are designed, how a lab identifies an unknown molecule, why some reactions happen on their own — A Level Chemistry is where chemistry stops being facts and starts being reasoning.",
  syllabusYears: "2025, 2026 and 2027 — and unchanged in substance for 2028–2030",
  verifiedOn: "18 October 2026",
  accent: "violet",
  sibling: { slug: "chemistry-5070", label: "O Level Chemistry (5070)" },

  quickFacts: [
    { label: "Syllabus code", value: "9701", note: "Cambridge International AS & A Level Chemistry" },
    { label: "AS Level", value: "Papers 1, 2, 3", note: "4 h 30 min in total · grades a–e" },
    { label: "Full A Level", value: "Papers 1–5", note: "7 h 45 min in total · grades A*–E" },
    { label: "Exam sessions", value: "June & November", note: "(March is offered in India only)" },
    { label: "Teaching time", value: "about 180 h (AS) · 360 h (A Level)", note: "Cambridge's guide; usually 2 years" },
    { label: "Topics", value: "37", note: "22 at AS Level + 15 more for A Level" },
    { label: "Practical", value: "Paper 3 in a lab", note: "Plus Paper 5: planning & evaluation (written)" },
    { label: "Can be staged", value: "AS in Year 1 → A2 in Year 2", note: "AS result is carried forward" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. By the end you should be able to:",
    points: [
      "Understand chemistry deeply and do practical work accurately, efficiently and safely.",
      "Apply the scientific method — and know where a theory or model stops working.",
      "Analyse data, judge how good it is and draw sound conclusions — with honesty and curiosity.",
      "Communicate like a scientist, using the right terms and conventions.",
      "Understand your responsibility to other people and to the environment.",
      "Enjoy chemistry and feel ready for a degree that uses it.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    {
      title: "Inside the atom, properly",
      topics: "AS Topics 1–4",
      story:
        "At O Level electrons sat in neat shells. Now you meet orbitals — s, p and d — and the evidence for them from ionisation energies. This is why molecules have the shapes they do, why water is a liquid at room temperature, and why the ideal gas equation pV = nRT works (and when it doesn't).",
    },
    {
      title: "Energy, equilibrium and speed — with numbers",
      topics: "AS 5–8 → A Level 23–26",
      story:
        "Hess's law lets you find energy changes you could never measure directly. Born–Haber cycles explain why some salts form and others don't; entropy and Gibbs free energy tell you whether a reaction can happen at all. Kc, Kp, Ka, pH and buffers — the chemistry behind blood, medicines and industry.",
    },
    {
      title: "The Periodic Table, explained",
      topics: "AS 9–12 → A Level 27–28",
      story:
        "Why do properties repeat across Period 3? Why are transition-metal compounds so colourful, and why do metals like platinum, palladium and rhodium make good catalysts — such as in car exhausts, where they help remove oxides of nitrogen? You move from 'learn the trend' to 'explain the trend'.",
    },
    {
      title: "Organic chemistry: building molecules",
      topics: "AS 13–21 → A Level 29–36",
      story:
        "You learn the step-by-step mechanisms of reactions, then use them like Lego to plan routes to new molecules. Aromatic compounds, amines and the azo dyes that colour fabrics; polyesters and polyamides; why a drug molecule's 3D 'handedness' (chirality) can matter for medicines.",
    },
    {
      title: "How real labs identify molecules",
      topics: "AS 22 → A Level 37",
      story:
        "Infrared and mass spectrometry at AS; chromatography and NMR spectroscopy at A Level. These are the tools forensic, pharmaceutical and hospital labs use every day — and the questions feel like solving a puzzle.",
    },
  ],

  topicGroups: [
    {
      label: "AS Level",
      groups: [
        { area: "Physical chemistry", topics: [[1, "Atomic structure"], [2, "Atoms, molecules and stoichiometry"], [3, "Chemical bonding"], [4, "States of matter"], [5, "Chemical energetics"], [6, "Electrochemistry"], [7, "Equilibria"], [8, "Reaction kinetics"]] },
        { area: "Inorganic chemistry", topics: [[9, "The Periodic Table: chemical periodicity"], [10, "Group 2"], [11, "Group 17"], [12, "Nitrogen and sulfur"]] },
        { area: "Organic chemistry", topics: [[13, "An introduction to AS Level organic chemistry"], [14, "Hydrocarbons"], [15, "Halogen compounds"], [16, "Hydroxy compounds"], [17, "Carbonyl compounds"], [18, "Carboxylic acids and derivatives"], [19, "Nitrogen compounds"], [20, "Polymerisation"], [21, "Organic synthesis"]] },
        { area: "Analysis", topics: [[22, "Analytical techniques"]] },
      ],
      note: "AS Level students also study practical skills.",
    },
    {
      label: "A Level (adds to all the AS topics)",
      groups: [
        { area: "Physical chemistry", topics: [[23, "Chemical energetics"], [24, "Electrochemistry"], [25, "Equilibria"], [26, "Reaction kinetics"]] },
        { area: "Inorganic chemistry", topics: [[27, "Group 2"], [28, "Chemistry of transition elements"]] },
        { area: "Organic chemistry", topics: [[29, "An introduction to A Level organic chemistry"], [30, "Hydrocarbons"], [31, "Halogen compounds"], [32, "Hydroxy compounds"], [33, "Carboxylic acids and derivatives"], [34, "Nitrogen compounds"], [35, "Polymerisation"], [36, "Organic synthesis"]] },
        { area: "Analysis", topics: [[37, "Analytical techniques"]] },
      ],
      note: "A Level students also study practical skills.",
    },
  ],

  compare: {
    intro: "Coming from O Level or IGCSE? The ideas are familiar — the depth is new.",
    rows: [
      { idea: "Atoms", here: "Protons, neutrons, electron shells", next: "Orbitals, electron configurations, ionisation energy evidence" },
      { idea: "Calculations", here: "Moles and titrations", next: "Multi-step problems, pV = nRT, Kc, Kp, Ka, pH, E°cell, Nernst equation" },
      { idea: "Energy", here: "Exothermic / endothermic", next: "Hess's law, lattice energy, entropy, Gibbs free energy" },
      { idea: "Organic", here: "Name and recognise families", next: "Explain mechanisms and plan synthesis routes" },
      { idea: "Analysis", here: "Test-tube tests, chromatography", next: "IR, mass spectrometry, 13C and 1H NMR" },
      { idea: "Exams", here: "Mostly 'state' and 'describe'", next: "Much more 'explain', 'suggest' and 'deduce' on unfamiliar data" },
    ],
  },

  papers: [
    { name: "Paper 1 — Multiple Choice", time: "1 hour 15 minutes", marks: 40, weight: "31% of AS · 15.5% of A Level", what: "40 multiple-choice questions on AS content.", who: "AS & A Level" },
    { name: "Paper 2 — AS Level Structured Questions", time: "1 hour 15 minutes", marks: 60, weight: "46% of AS · 23% of A Level", what: "Structured questions on AS content.", who: "AS & A Level" },
    { name: "Paper 3 — Advanced Practical Skills", time: "2 hours", marks: 40, weight: "23% of AS · 11.5% of A Level", what: "Practical work in a lab plus structured questions on experimental skills.", who: "AS & A Level" },
    { name: "Paper 4 — A Level Structured Questions", time: "2 hours", marks: 100, weight: "38.5% of A Level", what: "Structured questions on A Level content — AS knowledge is needed too.", who: "A Level only" },
    { name: "Paper 5 — Planning, Analysis and Evaluation", time: "1 hour 15 minutes", marks: 30, weight: "11.5% of A Level", what: "Written questions on planning experiments, analysing data and evaluating — the context may be outside the syllabus.", who: "A Level only" },
  ],
  papersNote: "All papers are marked by Cambridge. Paper 3 is done in a laboratory at your exam centre — book your centre early and ask about Paper 3 when you register.",
  routes: [
    { name: "AS Level only", detail: "Papers 1, 2 and 3 in the same exam series." },
    { name: "A Level, staged over two years", detail: "Year 1: Papers 1, 2, 3 (AS). Year 2: Papers 4 and 5. Your AS result is carried forward (Cambridge rules and time limits apply)." },
    { name: "A Level in one go", detail: "All five papers in the same exam series." },
  ],

  questionTypes: [
    {
      type: "Multiple choice (Paper 1)",
      example: "Which molecule has a bond angle of approximately 107°?",
      testing: "Fast reasoning about shapes, energetics, trends and organic reactions — often two ideas in one question.",
    },
    {
      type: "Structured calculation (Papers 2 and 4)",
      example: "Calculate the pH of a buffer made by mixing ethanoic acid with sodium ethanoate, given Ka.",
      testing: "Choosing the right equation, carrying units through and showing every step.",
    },
    {
      type: "Mechanism (Papers 2 and 4)",
      example: "Draw the mechanism for the reaction of bromoethane with hydroxide ions. Show curly arrows, charges and lone pairs.",
      testing: "Precise drawing — each curly arrow and dipole earns marks.",
    },
    {
      type: "Deduce a structure (Paper 4)",
      example: "Use the 1H NMR spectrum and the molecular formula C3H6O to deduce the structure of compound X.",
      testing: "Putting several clues together, like a detective.",
    },
    {
      type: "Plan and evaluate (Paper 5)",
      example: "Plan an experiment to find how temperature affects the rate of this reaction. Identify the variables and the safety precautions.",
      testing: "Thinking like a research chemist — no lab needed, but real experimental understanding.",
    },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "Explain", meaning: "set out purposes or reasons / make the relationships between things clear / say why and/or how and support with relevant evidence", tip: "The most common A Level command — always give the reason." },
    { word: "Suggest", meaning: "apply knowledge and understanding to situations where there are a range of valid responses", tip: "Expect unfamiliar molecules and reactions." },
    { word: "Deduce", meaning: "conclude from available information", tip: "Spectra, test results, data — the answer is in front of you." },
    { word: "Calculate", meaning: "work out from given facts, figures or information", tip: "Show working; units and significant figures count." },
    { word: "Evaluate", meaning: "judge or calculate the quality, importance, amount, or value of something", tip: "Paper 5 favourite: weigh up, then judge." },
    { word: "Predict", meaning: "suggest what may happen based on available information", tip: "Use the trend, then justify." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Knowledge and understanding", weight: 40, plain: "Facts, definitions, theories, apparatus — and reasoned explanations." },
    { code: "AO2", name: "Handling, applying and evaluating information", weight: 40, plain: "Use chemistry on new situations, data and problems; judge hypotheses and models." },
    { code: "AO3", name: "Experimental skills and investigations", weight: 20, plain: "Plan, record, analyse and evaluate experiments (Papers 3 and 5)." },
  ],
  aoNote: "At A Level, 'applying' is worth as much as 'knowing' (40% each). Memorising notes alone rarely reaches an A.",

  grades: {
    scale: "AS Level: a, b, c, d, e. Full A Level: A*, A, B, C, D, E. 'Ungraded' means below the lowest grade and is not shown on the certificate.",
    thresholds: {
      series: "June 2026 (full A Level, all five papers)",
      max: 260,
      rows: [
        { grade: "A*", range: "201–219", pct: "about 77–84%" },
        { grade: "A", range: "168–187", pct: "about 65–72%" },
        { grade: "B", range: "135–161", pct: "about 52–62%" },
        { grade: "C", range: "110–133", pct: "about 42–51%" },
        { grade: "D", range: "86–106", pct: "about 33–41%" },
        { grade: "E", range: "62–79", pct: "about 24–30%" },
      ],
      note: "Minimum weighted marks out of 260 in June 2026; the range covers the different paper variants. Boundaries change every series — aim well above them.",
    },
    meaning: "Medicine, pharmacy and top engineering programmes usually ask for an A or A* in Chemistry. Check each university's own requirements.",
  },

  practical: [
    "Paper 3 is a real lab exam: titrations, rates, energy changes and tests for ions — practise the techniques until they feel routine.",
    "Record every reading to the precision of the apparatus (e.g. burette to 0.05 cm³) in a clear table with units.",
    "Plot graphs carefully: sensible scales, labelled axes with units, line of best fit.",
    "Paper 5 tests planning, analysis and evaluation in writing — learn to identify variables, risks and sources of error.",
    "Calculate percentage errors and say which measurement limits accuracy the most.",
  ],

  books: [
    { title: "Cambridge International AS & A Level Chemistry Coursebook", by: "Ryan & Norris — Cambridge University Press", note: "On Cambridge's endorsed list for the syllabus from 2022." },
    { title: "Cambridge International AS & A Level Chemistry Student's Book (2nd edition)", by: "Hodder Education", note: "Endorsed for the full syllabus from 2022." },
    { title: "Cambridge International AS & A Level Chemistry Student's Book", by: "Collins", note: "Endorsed for the full syllabus from 2022." },
    { title: "Official syllabus, past papers, mark schemes and examiner reports", by: "Cambridge International", note: "The best practice there is — do them timed and mark them with the mark schemes." },
  ],
  booksNote: "Cambridge says textbooks endorsed for the syllabus from 2022 are still suitable — including for 2028–2030.",

  mistakes: [
    "Curly arrows starting from the wrong place — they must start at a lone pair or a bond.",
    "Mixing up enthalpy signs, or forgetting the direction of a Hess cycle.",
    "Writing a trend without explaining it (e.g. 'ionisation energy increases' with no reason).",
    "Not stating the units of Kc or Kp, or using concentrations where partial pressures are needed.",
    "Giving a 'suggest' answer that ignores the new information in the question.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Year 1 (AS), term 1", what: "Atomic structure, moles, bonding, states of matter (1–4). Start organic basics (13–14)." },
    { when: "Year 1, term 2", what: "Energetics, redox, equilibria, kinetics (5–8); periodicity and Groups 2 & 17 (9–11)." },
    { when: "Year 1, term 3", what: "Nitrogen & sulfur (12), remaining AS organic (15–21), IR and mass spectra (22). AS past papers; sit AS (or carry on)." },
    { when: "Year 2 (A2), term 1", what: "Lattice energy, entropy, electrochemistry, equilibria, kinetics (23–26)." },
    { when: "Year 2, term 2", what: "Group 2 & transition elements (27–28); A Level organic (29–36); NMR & chromatography (37)." },
    { when: "Final months", what: "Timed Papers 4 and 5 every week, mechanisms drill, and practical rehearsal for Paper 3 if not done in Year 1." },
  ],
  studyNote: "Cambridge designs AS for about 180 and full A Level for about 360 guided learning hours. Add 4–5 hours a week of your own practice.",

  careers: {
    intro: "A Level Chemistry is the gateway subject for most medical and science degrees.",
    paths: [
      { name: "Medicine (MBBS), dentistry, veterinary", need: "Chemistry + Biology (often + Physics or Maths)" },
      { name: "Pharmacy & pharmacology", need: "Chemistry essential" },
      { name: "Chemical / petroleum / biomedical engineering", need: "Chemistry + Maths + Physics" },
      { name: "Chemistry, biochemistry, forensic science", need: "Chemistry essential" },
      { name: "Environmental & materials science", need: "Chemistry + one other science" },
      { name: "Industry", need: "Pharmaceuticals, petrochemicals, fertilisers, water and food labs — across Pakistan and the Gulf" },
    ],
  },

  realWorld: [
    { title: "Catalytic converters", text: "Platinum, palladium and rhodium help remove oxides of nitrogen from car exhaust — transition-metal chemistry from Topic 28." },
    { title: "Molecules have 'hands'", text: "Many drug molecules exist as mirror-image forms; the syllabus asks why this matters when medicines are made." },
    { title: "Colour from chemistry", text: "Azo compounds are widely used as dyes — the colours in textiles, a major industry in Pakistan." },
    { title: "Ibn al-Haytham and Al-Razi", text: "Scholars of the Islamic Golden Age insisted on careful observation and experiment; Al-Razi described laboratory apparatus and classified substances — the same habits Paper 5 rewards." },
  ],

  faqs: [
    { q: "Can I take A Level Chemistry without O Level Chemistry?", a: "Cambridge recommends that you have first completed Chemistry or Co-ordinated Science at IGCSE / O Level standard. Starting without it is very hard — talk to us about a bridging plan first." },
    { q: "Should I sit AS first or everything at the end?", a: "Both are allowed. Sitting AS after Year 1 spreads the load and gives you a real grade for university applications; your AS result carries forward into the A Level." },
    { q: "How do online students do Paper 3?", a: "Paper 3 is taken in your exam centre's lab, so register with a centre that runs it. Learn each technique step by step (videos of real experiments help), and practise with past Paper 3 data before the day." },
    { q: "Is the syllabus changing?", a: "The 2028–2030 syllabus has no significant changes that affect teaching, so what you learn now stays valid." },
    { q: "How hard is an A*?", a: "In June 2026 the A* boundary was about 77–84% of the weighted total, depending on the paper variant." },
  ],

  sources: [
    { label: "Official syllabus 9701 for exams in 2025, 2026 and 2027 (PDF)", url: "https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf" },
    { label: "Official syllabus 9701 for exams in 2028, 2029 and 2030 (PDF)", url: "https://www.cambridgeinternational.org/Images/744624-2028-2030-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/761525-chemistry-9701-june-2026-grade-threshold-table.pdf" },
    { label: "Cambridge AS & A Level Chemistry 9701 — subject page", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-chemistry-9701/" },
    { label: "Endorsed resources for 9701", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-chemistry-9701/endorsed-resources" },
  ],
};

export default chemistry9701;
