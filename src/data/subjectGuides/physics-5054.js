// Cambridge O Level Physics 5054 — student guide.
// Facts from the official syllabus for exams in 2026, 2027 and 2028 (version 2,
// December 2025) and the June 2026 grade threshold table. See `sources`.

const physics5054 = {
  slug: "physics-5054",
  subject: "Physics",
  level: "O Level",
  code: "5054",
  title: "Cambridge O Level Physics (5054)",
  tagline:
    "How light races through glass fibres to bring you the internet, how a dam lights a city, how we know the Universe is expanding — physics is the rulebook of everything that moves, shines and spins.",
  syllabusYears: "2026, 2027 and 2028",
  verifiedOn: "18 October 2026",
  accent: "sky",
  sibling: { slug: "physics-9702", label: "AS & A Level Physics (9702)" },

  quickFacts: [
    { label: "Syllabus code", value: "5054", note: "Cambridge O Level Physics" },
    { label: "Exams you sit", value: "3 papers", note: "Paper 1 + Paper 2 + one practical paper (3 or 4)" },
    { label: "Total exam time", value: "3 h 45 min – 4 h 15 min", note: "Depends on which practical paper you take" },
    { label: "Exam sessions", value: "June & November", note: "Every year" },
    { label: "Grades", value: "A* to E", note: "A* is the highest" },
    { label: "Teaching time", value: "about 130 hours", note: "Cambridge's guide; usually 2 school years" },
    { label: "Calculator", value: "Allowed", note: "In all parts of the exam" },
    { label: "Topics", value: "6 big areas", note: "From motion to space physics" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. By the end you should be able to:",
    points: [
      "Explain how the physical world works using real laws and theories — not guesses.",
      "Do experiments properly: measure carefully, control variables, work safely.",
      "Use data and evidence to solve problems, and say where a method has limits.",
      "Speak the language of physics: quantities, units, symbols and equations.",
      "See how physics helps people and the planet — energy, medicine, communication.",
      "Enjoy science and feel ready for A Level and beyond.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Motion, forces and energy", topics: "Topic 1", story: "Why does a heavy truck need longer to stop? How can a rocket move in empty space? Speed, forces, momentum, energy and pressure explain cricket balls, car brakes and why dams are thicker at the bottom. This is the biggest topic — and the base for everything else." },
    { title: "Heat and particles", topics: "Topic 2 — Thermal physics", story: "Why does a metal spoon feel colder than a wooden one at the same temperature? Why do Gulf buildings use white roofs and thick walls? The particle model explains melting, evaporation and how heat travels by conduction, convection and radiation." },
    { title: "Waves: light and sound", topics: "Topic 3", story: "Rainbows, glasses, fibre-optic internet, ultrasound scans, mobile phone signals and X-rays are all waves. Learn reflection, refraction and the electromagnetic spectrum and you understand how most modern technology carries information." },
    { title: "Electricity and magnetism", topics: "Topic 4", story: "Circuits, fuses and earthing keep homes safe; motors spin fans and cars; generators and transformers bring power from Tarbela Dam to your socket. You'll even learn to read an oscilloscope, the screen engineers use to 'see' electricity." },
    { title: "Inside the atom", topics: "Topic 5 — Nuclear physics", story: "What holds the nucleus together, what makes something radioactive, and how fission and fusion release huge energy — the physics behind nuclear power stations, cancer treatment, smoke detectors and the Sun itself." },
    { title: "Space physics", topics: "Topic 6", story: "Why we have days, seasons and Moon phases; how stars are born and die; and how the redshift of distant galaxies tells us the Universe is expanding — evidence for the Big Bang." },
  ],

  topics: [
    { n: 1, name: "Motion, forces and energy", parts: ["Physical quantities and measurement techniques", "Motion", "Mass and weight", "Density", "Forces", "Momentum", "Energy, work and power", "Pressure"] },
    { n: 2, name: "Thermal physics", parts: ["Kinetic particle model of matter", "Thermal properties and temperature", "Transfer of thermal energy"] },
    { n: 3, name: "Waves", parts: ["General properties of waves", "Light", "Electromagnetic spectrum", "Sound"] },
    { n: 4, name: "Electricity and magnetism", parts: ["Simple magnetism and magnetic fields", "Electrical quantities", "Electric circuits", "Practical electricity", "Electromagnetic effects", "Uses of an oscilloscope"] },
    { n: 5, name: "Nuclear physics", parts: ["The nuclear model of the atom", "Radioactivity"] },
    { n: 6, name: "Space physics", parts: ["Earth and the Solar System", "Stars and the Universe"] },
  ],

  compare: {
    intro: "O Level gives you the laws; A Level (9702) explains where they come from and adds whole new areas.",
    rows: [
      { idea: "Motion", here: "Speed, acceleration, forces, momentum", next: "Equations of motion, projectiles, circular motion, gravitational fields" },
      { idea: "Energy", here: "Work, power, efficiency, energy resources", next: "Thermodynamics, ideal gases, internal energy" },
      { idea: "Waves", here: "Reflection, refraction, EM spectrum, sound", next: "Superposition, interference, diffraction, stationary waves" },
      { idea: "Electricity", here: "Circuits, resistance, motors, transformers", next: "Electric fields, capacitors, magnetic fields, alternating currents" },
      { idea: "Atoms", here: "Nuclear model, radioactivity, half-life", next: "Particle physics (quarks), quantum physics, nuclear binding energy" },
      { idea: "Space & medicine", here: "Solar System, life cycle of stars, redshift", next: "Astronomy and cosmology; medical physics (X-rays, ultrasound, PET scans)" },
    ],
  },

  papers: [
    { name: "Paper 1 — Multiple Choice", time: "1 hour", marks: 40, weight: "30%", what: "40 questions, each with four options. Covers the whole syllabus.", who: "Everyone" },
    { name: "Paper 2 — Theory", time: "1 hour 45 minutes", marks: 80, weight: "50%", what: "Short-answer and structured questions — calculations, explanations, graphs.", who: "Everyone" },
    { name: "Paper 3 — Practical Test", time: "1 hour 30 minutes", marks: 40, weight: "20%", what: "Real experiments in a lab, based on the experimental skills in the syllabus.", who: "Either Paper 3 or Paper 4" },
    { name: "Paper 4 — Alternative to Practical", time: "1 hour", marks: 40, weight: "20%", what: "A written paper about experiments: reading instruments, recording and processing data, planning and improving methods.", who: "Either Paper 3 or Paper 4" },
  ],
  papersNote: "Every paper is marked by Cambridge. Students who study online usually sit Paper 4, as it needs no lab — your exam centre confirms which practical paper it offers.",

  questionTypes: [
    { type: "Multiple choice (Paper 1)", example: "A car travels 120 m in 8.0 s at constant speed. What is its speed?  A 0.067 m/s  B 9.6 m/s  C 15 m/s  D 960 m/s", testing: "Quick, accurate use of equations and units — one mark each." },
    { type: "Calculation (Paper 2)", example: "A 1200 kg car accelerates from rest to 15 m/s in 10 s. Calculate the resultant force on the car.", testing: "Choose the right equations, substitute with units, show each step." },
    { type: "Explain (Paper 2)", example: "Explain, using the particle model, why the pressure of a gas in a sealed container increases when it is heated.", testing: "Linking a law or model to what happens — always give the reason." },
    { type: "Graphs and data (Papers 2 and 4)", example: "Use the speed–time graph to find the distance travelled in the first 20 s.", testing: "Reading gradients and areas under graphs — a favourite in every series." },
    { type: "Practical skills (Paper 3 or 4)", example: "Suggest why the student timed 20 oscillations rather than one.", testing: "Precision, reducing uncertainty, planning and improving experiments." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "State", meaning: "express in clear terms", tip: "Short and exact." },
    { word: "Define", meaning: "give precise meaning", tip: "Learn definitions word-for-word (e.g. momentum, power)." },
    { word: "Describe", meaning: "state the points of a topic / give characteristics and main features", tip: "Say what happens." },
    { word: "Explain", meaning: "set out purposes or reasons / make the relationships between things clear / say why and/or how and support with relevant evidence", tip: "Say why, using physics laws." },
    { word: "Calculate", meaning: "work out from given facts, figures or information", tip: "Equation → substitute → answer with unit." },
    { word: "Determine", meaning: "establish an answer using the information available", tip: "Often from a graph or table you are given." },
    { word: "Suggest", meaning: "apply knowledge and understanding to situations where there are a range of valid responses in order to make proposals / put forward considerations", tip: "New situation — apply what you know." },
    { word: "Sketch", meaning: "make a simple freehand drawing showing the key features, taking care over proportions", tip: "Shape and key points matter, not artistry." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Knowledge with understanding", weight: 50, plain: "Laws, definitions, units, apparatus — and understanding them." },
    { code: "AO2", name: "Handling information and problem-solving", weight: 30, plain: "Calculations, graphs and applying physics to new situations." },
    { code: "AO3", name: "Experimental skills and investigations", weight: 20, plain: "Measuring, recording, planning and evaluating (Paper 3 or 4)." },
  ],
  aoNote: "Half the marks are not memory: problem-solving and experimental skills make up the other 50%.",

  grades: {
    scale: "A*, A, B, C, D, E. 'Ungraded' means below E and is not shown on the certificate. Your certificate says GCE O LEVEL.",
    thresholds: {
      series: "June 2026",
      max: 200,
      rows: [
        { grade: "A*", range: "163–168", pct: "about 82–84%" },
        { grade: "A", range: "132–137", pct: "about 66–68%" },
        { grade: "B", range: "101–105", pct: "about 50–52%" },
        { grade: "C", range: "70–73", pct: "about 35–36%" },
        { grade: "D", range: "58–62", pct: "about 29–31%" },
        { grade: "E", range: "47–51", pct: "about 24–26%" },
      ],
      note: "Minimum weighted marks out of 200 in June 2026 (the range covers the different paper variants). Boundaries move every series — aim well above them.",
    },
    meaning: "An A or A* is the usual target for A Level Physics, engineering and medicine routes.",
  },

  practical: [
    "Know your instruments — metre rule, stopwatch, thermometer, ammeter, voltmeter, measuring cylinder — and how precisely each one reads.",
    "Time many oscillations or measure many sheets, then divide — it reduces uncertainty.",
    "Tables: quantity and unit in every column heading; consistent decimal places.",
    "Graphs: label axes with units, use more than half the grid, draw a smooth line or curve of best fit, and use a large triangle for gradients.",
    "Evaluate honestly: name a real source of error and a specific improvement.",
    "No lab at home? Paper 4 (Alternative to Practical) is a written paper — videos of real experiments and real data sets build the same skills.",
  ],

  books: [
    { title: "Cambridge O Level Physics Student's Book", by: "Hachette Learning (2021)", note: "Endorsed by Cambridge for the syllabus from 2023." },
    { title: "Physics for Cambridge O Level — Third Edition", by: "Danesh Publications (2024)", note: "Endorsed by Cambridge for the syllabus from 2023." },
    { title: "The official syllabus (PDF)", by: "Cambridge International", note: "Your checklist — every learning point you can be asked about." },
    { title: "Past papers, mark schemes and examiner reports", by: "Cambridge International", note: "The best practice there is — do them timed and mark them with the mark schemes." },
  ],
  booksNote: "Cambridge says textbooks endorsed for the syllabus from 2023 are still suitable for 2026–2028.",

  mistakes: [
    "Missing or wrong units (N, J, W, Pa, Ω) — and mixing g with kg, or cm with m.",
    "Confusing mass and weight, or speed and velocity.",
    "Reading a graph's gradient when the question needs the area under it (or the other way round).",
    "Writing 'heat rises' instead of explaining convection in terms of density.",
    "Rounding too early in multi-step calculations.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Year 1, term 1", what: "Measurement, motion, mass, weight and density (Topic 1, first half). Practise graphs from day one." },
    { when: "Year 1, term 2", what: "Forces, momentum, energy, work, power and pressure (rest of Topic 1)." },
    { when: "Year 1, term 3", what: "Thermal physics (Topic 2) and waves (Topic 3). First full past paper." },
    { when: "Year 2, term 1", what: "Electricity and magnetism (Topic 4) — the second-largest topic." },
    { when: "Year 2, term 2", what: "Nuclear physics (Topic 5) and space physics (Topic 6); practical-paper practice." },
    { when: "Final months", what: "Timed past papers weekly, marked with mark schemes; revise weak topics with your teacher." },
  ],
  studyNote: "Cambridge designs the course for about 130 guided learning hours. Add 2–3 hours a week of your own practice.",

  careers: {
    intro: "Physics opens the widest range of technical careers.",
    paths: [
      { name: "Engineering (electrical, mechanical, civil, aerospace)", need: "Physics + Mathematics" },
      { name: "Computer science & electronics", need: "Physics and Maths help hugely" },
      { name: "Medicine & medical physics / radiography", need: "Physics often with Chemistry + Biology" },
      { name: "Architecture & renewable energy", need: "Physics + Maths" },
      { name: "Aviation & pilots", need: "Physics + Maths" },
      { name: "Research, astronomy, data science", need: "Physics + strong Maths" },
    ],
  },

  realWorld: [
    { title: "Dr Abdus Salam (1926–1996)", text: "Pakistan's first Nobel laureate in science — he shared the 1979 Nobel Prize in Physics for work unifying two of nature's fundamental forces." },
    { title: "Ibn al-Haytham (c. 965–1040)", text: "His Book of Optics explained vision as light entering the eye and relied on careful experiment — the reflection and refraction you study in Topic 3." },
    { title: "Power for a nation", text: "Tarbela Dam's turbines and generators turn falling water into electricity; transformers then step the voltage up for long-distance transmission — Topic 4 in action." },
    { title: "Sun-powered Gulf", text: "Huge solar parks in the UAE and Saudi Arabia turn sunlight into electricity — energy resources and efficiency from Topic 1." },
  ],

  faqs: [
    { q: "Is O Level Physics hard?", a: "It needs steady maths — rearranging equations and reading graphs. Students who practise calculations every week do well; the A* boundary in June 2026 was about 82–84%." },
    { q: "Which practical paper will I take?", a: "Everyone takes Papers 1 and 2, plus either Paper 3 (lab) or Paper 4 (written Alternative to Practical). Online and private students usually take Paper 4 — confirm with your exam centre." },
    { q: "Can I use a calculator?", a: "Yes — the syllabus allows calculators in all parts of the exam." },
    { q: "Is O Level 5054 the same as IGCSE Physics 0625?", a: "No. They are separate Cambridge syllabuses with different papers. This guide is for O Level 5054." },
    { q: "When can I sit the exam?", a: "Every June and November." },
  ],

  sources: [
    { label: "Official syllabus 5054 for exams in 2026, 2027 and 2028 (PDF)", url: "https://www.cambridgeinternational.org/Images/697324-2026-2028-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/762919-physics-5054-june-2026-grade-threshold-table.pdf" },
    { label: "Endorsed resources for 5054", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-physics-5054/endorsed-resources/" },
  ],
};

export default physics5054;
