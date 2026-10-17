// Cambridge International AS & A Level Physics 9702 — student guide.
// Facts from the official syllabus for exams in 2025, 2026 and 2027, the
// 2028–2030 syllabus ("no significant changes which affect teaching") and the
// June 2026 grade threshold table. See `sources`.

const physics9702 = {
  slug: "physics-9702",
  subject: "Physics",
  level: "AS & A Level",
  code: "9702",
  title: "Cambridge International AS & A Level Physics (9702)",
  tagline:
    "From quarks to galaxies, from hospital scanners to the light from distant stars — A Level Physics is where you learn to explain the Universe with a few powerful ideas and a lot of reasoning.",
  syllabusYears: "2025, 2026 and 2027 — and unchanged in substance for 2028–2030",
  verifiedOn: "18 October 2026",
  accent: "cyan",
  sibling: { slug: "physics-5054", label: "O Level Physics (5054)" },

  quickFacts: [
    { label: "Syllabus code", value: "9702", note: "Cambridge International AS & A Level Physics" },
    { label: "AS Level", value: "Papers 1, 2, 3", note: "4 h 30 min in total · grades a–e" },
    { label: "Full A Level", value: "Papers 1–5", note: "7 h 45 min in total · grades A*–E" },
    { label: "Exam sessions", value: "June & November", note: "(March is offered in India only)" },
    { label: "Teaching time", value: "about 180 h (AS) · 360 h (A Level)", note: "Cambridge's guide; usually 2 years" },
    { label: "Topics", value: "25", note: "11 at AS Level + 14 more for A Level" },
    { label: "Practical", value: "Paper 3 in a lab", note: "Plus Paper 5: planning, analysis & evaluation (written)" },
    { label: "Data & formulae", value: "Given in the papers", note: "Printed in Papers 1, 2 and 4" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. By the end you should be able to:",
    points: [
      "Understand physics deeply and carry out practical work accurately and safely.",
      "Use the scientific method — and know where a theory or model stops working.",
      "Analyse data, judge its quality and draw sound conclusions.",
      "Communicate clearly, using correct terms, units and conventions.",
      "Understand your responsibility to other people and to the environment.",
      "Enjoy physics and feel ready for a degree that uses it.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Mechanics, done properly", topics: "AS Topics 1–6", story: "Measurement and uncertainty, equations of motion, projectiles, forces, energy and how materials stretch and break. Engineers use exactly this to design bridges, aircraft and cranes." },
    { title: "Waves that add and cancel", topics: "AS 7–8", story: "Superposition explains why soap bubbles are coloured, how noise-cancelling headphones work and how a diffraction grating splits light into a spectrum." },
    { title: "Electricity and particles", topics: "AS 9–11", story: "Circuits, potential dividers and sensors — then down to quarks and leptons, the building blocks of everything." },
    { title: "Fields and forces", topics: "A Level 12–13, 18–21", story: "Circular motion and gravity keep satellites in orbit; electric and magnetic fields steer particle beams; capacitors and alternating currents run every electronic device." },
    { title: "Heat, gases and oscillations", topics: "A Level 14–17", story: "Why gases behave the way they do, the first law of thermodynamics, and simple harmonic motion — from car engines to earthquake-proof buildings." },
    { title: "Quantum, nuclear, medical, cosmic", topics: "A Level 22–25", story: "The photoelectric effect showed light comes in packets. Then nuclear binding energy, how ultrasound, X-ray CT and PET scanners see inside the body, and how standard candles and Hubble's law reveal an expanding Universe." },
  ],

  topicGroups: [
    {
      label: "AS Level",
      groups: [
        { area: "Mechanics & materials", topics: [[1, "Physical quantities and units"], [2, "Kinematics"], [3, "Dynamics"], [4, "Forces, density and pressure"], [5, "Work, energy and power"], [6, "Deformation of solids"]] },
        { area: "Waves", topics: [[7, "Waves"], [8, "Superposition"]] },
        { area: "Electricity & particles", topics: [[9, "Electricity"], [10, "D.C. circuits"], [11, "Particle physics"]] },
      ],
      note: "AS Level students also study practical skills.",
    },
    {
      label: "A Level (adds to all the AS topics)",
      groups: [
        { area: "Fields & motion", topics: [[12, "Motion in a circle"], [13, "Gravitational fields"], [17, "Oscillations"]] },
        { area: "Thermal physics", topics: [[14, "Temperature"], [15, "Ideal gases"], [16, "Thermodynamics"]] },
        { area: "Electricity & magnetism", topics: [[18, "Electric fields"], [19, "Capacitance"], [20, "Magnetic fields"], [21, "Alternating currents"]] },
        { area: "Modern physics & applications", topics: [[22, "Quantum physics"], [23, "Nuclear physics"], [24, "Medical physics"], [25, "Astronomy and cosmology"]] },
      ],
      note: "A Level students also study practical skills.",
    },
  ],

  compare: {
    intro: "Coming from O Level or IGCSE? The ideas are familiar — the depth and maths are new.",
    rows: [
      { idea: "Measurement", here: "Read instruments carefully", next: "Uncertainties, percentage errors and how they combine" },
      { idea: "Motion", here: "Speed–time graphs, F = ma", next: "Equations of motion, projectiles, circular motion, gravitational fields" },
      { idea: "Waves", here: "Reflection, refraction, EM spectrum", next: "Interference, diffraction gratings, stationary waves" },
      { idea: "Electricity", here: "Series and parallel circuits", next: "Potential dividers, electric fields, capacitors, a.c." },
      { idea: "Atoms", here: "Nuclear model, radioactivity", next: "Quarks, photons, the photoelectric effect, binding energy" },
      { idea: "Exams", here: "Mostly recall and direct calculation", next: "Multi-step problems and unfamiliar contexts; Paper 5 planning questions" },
    ],
  },

  papers: [
    { name: "Paper 1 — Multiple Choice", time: "1 hour 15 minutes", marks: 40, weight: "31% of AS · 15.5% of A Level", what: "40 multiple-choice questions on AS content.", who: "AS & A Level" },
    { name: "Paper 2 — AS Level Structured Questions", time: "1 hour 15 minutes", marks: 60, weight: "46% of AS · 23% of A Level", what: "Structured questions on AS content.", who: "AS & A Level" },
    { name: "Paper 3 — Advanced Practical Skills", time: "2 hours", marks: 40, weight: "23% of AS · 11.5% of A Level", what: "Practical work in a lab and structured questions on experimental skills.", who: "AS & A Level" },
    { name: "Paper 4 — A Level Structured Questions", time: "2 hours", marks: 100, weight: "38.5% of A Level", what: "Structured questions on A Level content — AS knowledge is needed too.", who: "A Level only" },
    { name: "Paper 5 — Planning, Analysis and Evaluation", time: "1 hour 15 minutes", marks: 30, weight: "11.5% of A Level", what: "Two compulsory written questions on planning an experiment and analysing data.", who: "A Level only" },
  ],
  papersNote: "All papers are marked by Cambridge. Paper 3 is done in a laboratory at your exam centre — ask about it when you register.",
  routes: [
    { name: "AS Level only", detail: "Papers 1, 2 and 3 in the same exam series." },
    { name: "A Level, staged over two years", detail: "Year 1: Papers 1, 2, 3 (AS). Year 2: Papers 4 and 5. Your AS result is carried forward (Cambridge rules and time limits apply)." },
    { name: "A Level in one go", detail: "All five papers in the same exam series." },
  ],

  questionTypes: [
    { type: "Multiple choice (Paper 1)", example: "A ball is thrown horizontally from a cliff. Which graph shows how its vertical velocity changes with time?", testing: "Fast reasoning with graphs, units and relationships." },
    { type: "Structured calculation (Papers 2 and 4)", example: "Calculate the speed of a satellite in a circular orbit 400 km above the Earth's surface.", testing: "Combining two or more ideas (here gravity and circular motion) in one problem." },
    { type: "Explain (Papers 2 and 4)", example: "Explain how the photoelectric effect provides evidence for the particulate nature of light.", testing: "Precise physics language — every key point earns a mark." },
    { type: "Practical (Paper 3)", example: "Measure the period of oscillation for different lengths, then plot a graph to test the suggested relationship.", testing: "Accurate measurement, uncertainty and drawing conclusions from your own data." },
    { type: "Plan (Paper 5)", example: "Plan an experiment to investigate how the resistance of a thermistor depends on temperature.", testing: "Variables, method, safety and how you would analyse the results." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "Define", meaning: "give precise meaning", tip: "Exact definitions earn easy marks — learn them." },
    { word: "Explain", meaning: "set out purposes or reasons / make the relationships between things evident / provide why and/or how and support with relevant evidence", tip: "Give the reason, using physics." },
    { word: "Calculate", meaning: "work out from given facts, figures or information", tip: "Show working; units and significant figures count." },
    { word: "Determine", meaning: "establish an answer using the information available", tip: "Often from a graph — show your gradient triangle." },
    { word: "Show (that)", meaning: "provide structured evidence that leads to a given result", tip: "Show every step and give the answer to one more significant figure than stated." },
    { word: "Suggest", meaning: "apply knowledge and understanding to situations where there are a range of valid responses in order to make proposals", tip: "Unfamiliar context — apply the principle." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Knowledge and understanding", weight: 40, plain: "Laws, definitions, quantities and apparatus." },
    { code: "AO2", name: "Handling, applying and evaluating information", weight: 40, plain: "Solving problems, using data and applying physics to new situations." },
    { code: "AO3", name: "Experimental skills and investigations", weight: 20, plain: "Practical work, planning and evaluation (Papers 3 and 5)." },
  ],
  aoNote: "Applying physics is worth as much as knowing it (40% each) — practise unfamiliar problems, not just notes.",

  grades: {
    scale: "AS Level: a, b, c, d, e. Full A Level: A*, A, B, C, D, E. 'Ungraded' means below the lowest grade and is not shown on the certificate.",
    thresholds: {
      series: "June 2026 (full A Level, all five papers)",
      max: 260,
      rows: [
        { grade: "A*", range: "196–210", pct: "about 75–81%" },
        { grade: "A", range: "174–186", pct: "about 67–72%" },
        { grade: "B", range: "150–162", pct: "about 58–62%" },
        { grade: "C", range: "125–136", pct: "about 48–52%" },
        { grade: "D", range: "100–110", pct: "about 38–42%" },
        { grade: "E", range: "76–84", pct: "about 29–32%" },
      ],
      note: "Minimum weighted marks out of 260 in June 2026; the range covers the different paper variants. For AS Level alone (out of 130) an 'a' needed about 94–104.",
    },
    meaning: "Engineering, physics and computer science degrees usually ask for an A or A* in Physics alongside Mathematics.",
  },

  practical: [
    "Paper 3 is a real lab exam: take repeated readings, record to the precision of the instrument, and estimate uncertainties.",
    "Learn to linearise relationships (e.g. plot T² against l) so a straight-line graph tests the equation.",
    "Draw lines of best fit and worst acceptable lines to find the uncertainty in a gradient.",
    "Paper 5 tests planning in writing — independent, dependent and control variables, method, safety and analysis.",
    "Know your limitations: name specific sources of error and specific improvements.",
  ],

  books: [
    { title: "Cambridge International AS & A Level Physics Coursebook (3rd edition)", by: "Cambridge University Press (2020)", note: "Endorsed for the syllabus from 2022." },
    { title: "Cambridge International AS & A Level Physics Student's Book", by: "Hachette Learning (2020)", note: "Endorsed for the syllabus from 2022." },
    { title: "Collins Cambridge International AS & A Level Physics Student's Book", by: "Collins (2020)", note: "Endorsed for the syllabus from 2022." },
    { title: "Official syllabus, past papers, mark schemes and examiner reports", by: "Cambridge International", note: "The best practice there is — do them timed and mark them with the mark schemes." },
  ],
  booksNote: "Cambridge says textbooks endorsed for the syllabus from 2022 are still suitable — including for 2028–2030.",

  mistakes: [
    "Ignoring significant figures and units, or forgetting to convert km, g or minutes to SI.",
    "In 'show that' questions, writing only the final number.",
    "Forgetting that velocity, force and momentum are vectors — directions and signs matter.",
    "Drawing graphs too small or using awkward scales.",
    "Vague evaluation in practical answers ('human error').",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Year 1 (AS), term 1", what: "Quantities, units and uncertainties; kinematics; dynamics (1–3)." },
    { when: "Year 1, term 2", what: "Forces, energy, materials, waves and superposition (4–8)." },
    { when: "Year 1, term 3", what: "Electricity, d.c. circuits, particle physics (9–11); AS past papers and Paper 3 practice." },
    { when: "Year 2 (A2), term 1", what: "Circular motion, gravitational fields, thermal physics, oscillations (12–17)." },
    { when: "Year 2, term 2", what: "Electric and magnetic fields, capacitance, a.c., quantum, nuclear, medical physics, astronomy (18–25)." },
    { when: "Final months", what: "Timed Papers 4 and 5 every week; mixed-topic problem sets; formula and definition drills." },
  ],
  studyNote: "Cambridge designs AS for about 180 and full A Level for about 360 guided learning hours. Add 4–5 hours a week of your own practice.",

  careers: {
    intro: "Physics with Mathematics is the classic route into engineering and technology.",
    paths: [
      { name: "All branches of engineering", need: "Physics + Mathematics" },
      { name: "Computer science, AI & data science", need: "Mathematics, often with Physics" },
      { name: "Physics, astrophysics, materials science", need: "Physics + Mathematics" },
      { name: "Medicine & medical physics / radiology", need: "Physics often with Chemistry + Biology" },
      { name: "Architecture, aviation, energy sector", need: "Physics + Mathematics" },
      { name: "Finance & actuarial work", need: "Strong Mathematics; Physics shows problem-solving" },
    ],
  },

  realWorld: [
    { title: "Hospital physics", text: "Ultrasound, X-ray CT and PET scanners are all in Topic 24 — PET uses positrons that annihilate with electrons to make gamma rays." },
    { title: "Measuring the Universe", text: "Astronomers use 'standard candles' — stars of known brightness — and Hubble's law to measure distances to galaxies (Topic 25)." },
    { title: "Dr Abdus Salam", text: "Pakistan's Nobel laureate in Physics (1979) helped show that electromagnetism and the weak nuclear force are two sides of one force — the world of particle physics you start in Topic 11." },
    { title: "Satellites everywhere", text: "GPS, weather and TV satellites stay up because gravity provides exactly the centripetal force needed — Topics 12 and 13." },
  ],

  faqs: [
    { q: "Do I need O Level Physics first?", a: "Cambridge recommends having completed Physics or Co-ordinated Science at IGCSE / O Level standard first." },
    { q: "Do I need A Level Maths with Physics?", a: "It isn't required by Cambridge, but it helps a lot — and most engineering degrees ask for both." },
    { q: "Are formulas given in the exam?", a: "Yes — a data and formulae sheet is printed in Papers 1, 2 and 4. You still need to know how and when to use each one." },
    { q: "How do online students do Paper 3?", a: "Paper 3 is taken in your exam centre's lab, so register with a centre that runs it and practise each technique beforehand." },
    { q: "Is the syllabus changing?", a: "The 2028–2030 syllabus has no significant changes that affect teaching." },
  ],

  sources: [
    { label: "Official syllabus 9702 for exams in 2025, 2026 and 2027 (PDF)", url: "https://www.cambridgeinternational.org/Images/664565-2025-2027-syllabus.pdf" },
    { label: "Official syllabus 9702 for exams in 2028, 2029 and 2030 (PDF)", url: "https://www.cambridgeinternational.org/Images/744626-2028-2030-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/761526-physics-9702-june-2026-grade-threshold-table.pdf" },
    { label: "Endorsed resources for 9702", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-physics-9702/endorsed-resources/" },
  ],
};

export default physics9702;
