// Cambridge O Level Biology 5090 — student guide.
// Facts from the official syllabus for exams in 2026, 2027 and 2028 and the
// June 2026 grade threshold table. See `sources`.

const biology5090 = {
  slug: "biology-5090",
  subject: "Biology",
  level: "O Level",
  code: "5090",
  title: "Cambridge O Level Biology (5090)",
  tagline:
    "How your heart pumps 7,000 litres a day, why antibiotics stop working, how one cell becomes a whole person — biology is the science of you and everything alive around you.",
  syllabusYears: "2026, 2027 and 2028",
  verifiedOn: "18 October 2026",
  accent: "lime",
  sibling: { slug: "biology-9700", label: "AS & A Level Biology (9700)" },

  quickFacts: [
    { label: "Syllabus code", value: "5090", note: "Cambridge O Level Biology" },
    { label: "Exams you sit", value: "3 papers", note: "Paper 1 + Paper 2 + one practical paper (3 or 4)" },
    { label: "Total exam time", value: "3 h 45 min – 4 h 15 min", note: "Depends on which practical paper you take" },
    { label: "Exam sessions", value: "June & November", note: "Every year" },
    { label: "Grades", value: "A* to E", note: "A* is the highest" },
    { label: "Teaching time", value: "about 130 hours", note: "Cambridge's guide; usually 2 school years" },
    { label: "Calculator", value: "Allowed", note: "In all parts of the exam" },
    { label: "Topics", value: "19", note: "From cells to ecosystems" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. By the end you should be able to:",
    points: [
      "Understand how living things work, using real scientific ideas.",
      "Carry out experiments properly — handling variables and working safely.",
      "Use data and evidence to solve problems and see where methods have limits.",
      "Communicate clearly with the right biological terms.",
      "See how biology helps people and the environment — health, food, conservation.",
      "Enjoy science and feel ready for A Level and beyond.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Cells: the units of life", topics: "Topics 1–5", story: "Every living thing is built from cells. You learn what's inside them, how substances move in and out by diffusion, osmosis and active transport, what we are made of chemically, and how enzymes speed up the reactions of life." },
    { title: "Plants feed the planet", topics: "Topics 6–7", story: "Photosynthesis turns sunlight, water and carbon dioxide into food and oxygen. You learn how leaves are built for it, what minerals plants need, and how water travels from roots to leaves." },
    { title: "The human machine", topics: "Topics 8–11, 13", story: "Digestion, breathing, respiration, the heart and blood, and the kidneys — how your body gets energy, moves materials around and removes waste. You'll also see why smoking and poor diet harm the heart and lungs." },
    { title: "Disease and defence", topics: "Topic 12", story: "How pathogens spread, how your immune system fights back, how vaccination protects whole communities, and why bacteria becoming resistant to antibiotics is one of medicine's biggest worries." },
    { title: "Control and coordination", topics: "Topics 14–15", story: "Nerves, eyes, hormones and homeostasis keep your body temperature and blood sugar just right — including what goes wrong in diabetes. Plants respond too, growing towards light and against gravity." },
    { title: "Life goes on", topics: "Topics 16–18", story: "Cell division, reproduction in plants and humans, DNA, inheritance and natural selection — then biotechnology and genetic modification, such as bacteria engineered to make human insulin." },
    { title: "Life on Earth", topics: "Topic 19", story: "Food chains, the carbon and nitrogen cycles, ecosystems and biodiversity — and how deforestation and pollution affect them, and what conservation can do." },
  ],

  topics: [
    { n: 1, name: "Cells", parts: ["Cell structure and function", "Specialised cells, tissues and organs"] },
    { n: 2, name: "Classification", parts: ["Concept and use of a classification system", "Features of organisms"] },
    { n: 3, name: "Movement into and out of cells", parts: ["Diffusion and osmosis", "Active transport"] },
    { n: 4, name: "Biological molecules", parts: ["Biological molecules"] },
    { n: 5, name: "Enzymes", parts: ["Enzyme action", "Effects of temperature and pH"] },
    { n: 6, name: "Plant nutrition", parts: ["Photosynthesis", "Leaf structure", "Mineral nutrition"] },
    { n: 7, name: "Transport in flowering plants", parts: ["Uptake and transport of water and ions", "Transpiration and translocation"] },
    { n: 8, name: "Human nutrition", parts: ["Diet", "Human digestive system", "Absorption and assimilation"] },
    { n: 9, name: "Human gas exchange", parts: ["Human gas exchange"] },
    { n: 10, name: "Respiration", parts: ["Respiration", "Aerobic respiration", "Anaerobic respiration"] },
    { n: 11, name: "Transport in humans", parts: ["Circulatory system", "Heart", "Blood vessels", "Blood"] },
    { n: 12, name: "Disease and immunity", parts: ["Disease", "Antibiotics", "Immunity"] },
    { n: 13, name: "Excretion", parts: ["Excretion", "Urinary system"] },
    { n: 14, name: "Coordination and control", parts: ["Mammalian nervous system", "Mammalian sense organs", "Mammalian hormones", "Homeostasis", "Temperature control", "Blood glucose control"] },
    { n: 15, name: "Coordination and response in plants", parts: ["Coordination and response in plants"] },
    { n: 16, name: "Development of organisms and continuity of life", parts: ["Nuclear division", "Asexual and sexual reproduction", "Sexual reproduction in plants", "Sexual reproduction in humans"] },
    { n: 17, name: "Inheritance", parts: ["Variation", "DNA", "Inheritance", "Selection"] },
    { n: 18, name: "Biotechnology and genetic modification", parts: ["Biotechnology", "Genetic modification"] },
    { n: 19, name: "Relationships of organisms with one another and with the environment", parts: ["Energy flow", "Nutrient cycles", "Ecosystems and biodiversity", "Effects of humans on ecosystems", "Conservation"] },
  ],

  compare: {
    intro: "O Level shows you how living things work; A Level (9700) shows you the molecules and mechanisms behind it.",
    rows: [
      { idea: "Cells", here: "Cell parts and their jobs", next: "Electron micrographs, organelles in detail, the cell cycle and mitosis" },
      { idea: "Molecules", here: "Food tests; carbohydrates, fats, proteins", next: "Structure of proteins, DNA, RNA and how protein synthesis works" },
      { idea: "Enzymes", here: "Lock-and-key, temperature and pH", next: "Enzyme kinetics, inhibitors, Vmax and Km" },
      { idea: "Energy", here: "Photosynthesis and respiration equations", next: "Krebs cycle, ATP, light-dependent and light-independent reactions" },
      { idea: "Health", here: "Disease, antibiotics, vaccination", next: "Infectious diseases (TB, malaria, HIV, cholera), antibodies and immunity" },
      { idea: "Genes", here: "Inheritance, simple genetic diagrams, GM", next: "Gene control, genetic technology, gene therapy, selection and evolution" },
    ],
  },

  papers: [
    { name: "Paper 1 — Multiple Choice", time: "1 hour", marks: 40, weight: "30%", what: "40 questions, each with four options. Covers the whole syllabus.", who: "Everyone" },
    { name: "Paper 2 — Theory", time: "1 hour 45 minutes", marks: 80, weight: "50%", what: "Short-answer and structured questions — diagrams, data, explanations.", who: "Everyone" },
    { name: "Paper 3 — Practical Test", time: "1 hour 30 minutes", marks: 40, weight: "20%", what: "Real experiments in a lab, based on the experimental skills in the syllabus.", who: "Either Paper 3 or Paper 4" },
    { name: "Paper 4 — Alternative to Practical", time: "1 hour", marks: 40, weight: "20%", what: "A written paper about experiments: food tests, drawing specimens, planning and evaluating.", who: "Either Paper 3 or Paper 4" },
  ],
  papersNote: "Every paper is marked by Cambridge. Students who study online usually sit Paper 4, as it needs no lab — your exam centre confirms which practical paper it offers.",

  questionTypes: [
    { type: "Multiple choice (Paper 1)", example: "Which blood vessel carries oxygenated blood from the lungs to the heart?  A aorta  B pulmonary artery  C pulmonary vein  D vena cava", testing: "Precise knowledge — the options are designed to catch near-misses." },
    { type: "Label and explain (Paper 2)", example: "Identify the structure labelled X on the diagram of the leaf and explain how it is adapted for gas exchange.", testing: "Linking structure to function — the heart of biology." },
    { type: "Data analysis (Papers 2 and 4)", example: "Using the graph, describe the effect of temperature on the rate of the enzyme reaction.", testing: "Describe the trend, quote data with units, then explain." },
    { type: "Genetic diagram (Paper 2)", example: "Use a genetic diagram to show the possible blood groups of children of these two parents.", testing: "Correct symbols, gametes and ratios." },
    { type: "Practical skills (Paper 3 or 4)", example: "Plan an investigation into the effect of light intensity on the rate of photosynthesis in pondweed.", testing: "Variables, method, measurements, safety and how to make results reliable." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "State", meaning: "express in clear terms", tip: "Short and exact." },
    { word: "Define", meaning: "give precise meaning", tip: "Learn key definitions word-for-word (e.g. osmosis)." },
    { word: "Describe", meaning: "state the points of a topic / give characteristics and main features", tip: "For graphs: the trend plus data with units." },
    { word: "Explain", meaning: "set out purposes or reasons / make the relationships between things clear / say why and/or how and support with relevant evidence", tip: "Give the biological reason." },
    { word: "Compare", meaning: "identify/comment on similarities and/or differences", tip: "Mention both things in every point." },
    { word: "Suggest", meaning: "apply knowledge and understanding to situations where there are a range of valid responses to make proposals / put forward considerations", tip: "Use biology on an unfamiliar example." },
    { word: "Discuss", meaning: "write about issue(s) or topic(s) in depth in a structured way", tip: "Give points for and against." },
    { word: "Evaluate", meaning: "judge or calculate the quality, importance, amount, or value of something", tip: "Weigh up, then reach a judgement." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Knowledge with understanding", weight: 50, plain: "Facts, terms, processes and structures — and understanding them." },
    { code: "AO2", name: "Handling information and problem-solving", weight: 30, plain: "Using data, graphs and biology on new situations." },
    { code: "AO3", name: "Experimental skills and investigations", weight: 20, plain: "Planning, observing, recording and evaluating (Paper 3 or 4)." },
  ],
  aoNote: "Biology has many terms to learn, but half the marks test using them — practise data questions as well as notes.",

  grades: {
    scale: "A*, A, B, C, D, E. 'Ungraded' means below E and is not shown on the certificate. Your certificate says GCE O LEVEL.",
    thresholds: {
      series: "June 2026",
      max: 200,
      rows: [
        { grade: "A*", range: "162–168", pct: "about 81–84%" },
        { grade: "A", range: "135–141", pct: "about 68–70%" },
        { grade: "B", range: "108–114", pct: "about 54–57%" },
        { grade: "C", range: "82–88", pct: "about 41–44%" },
        { grade: "D", range: "70–75", pct: "about 35–38%" },
        { grade: "E", range: "58–62", pct: "about 29–31%" },
      ],
      note: "Minimum weighted marks out of 200 in June 2026 (the range covers the different paper variants). Boundaries move every series — aim well above them.",
    },
    meaning: "Medicine, dentistry and pharmacy routes usually expect an A or A* in Biology and Chemistry.",
  },

  practical: [
    "Learn the food tests (starch, reducing sugars, protein, fats) and what a positive result looks like.",
    "Biological drawings: clear single lines, no shading, correct proportions, labels with ruled lines.",
    "Calculate magnification and convert between mm and µm.",
    "Plan fair tests: one independent variable, control the rest, repeat and calculate means.",
    "Describe results using numbers from the data, then explain them.",
    "No lab at home? Paper 4 (Alternative to Practical) is a written paper — videos of real experiments and real data build the same skills.",
  ],

  books: [
    { title: "Cambridge O Level Biology Student's Book", by: "Hachette Learning (2021)", note: "Endorsed by Cambridge for the syllabus from 2023." },
    { title: "Biology for Cambridge O Level — Third Edition", by: "Danesh Publications (2024)", note: "Endorsed by Cambridge for the syllabus from 2023." },
    { title: "The official syllabus (PDF)", by: "Cambridge International", note: "Your checklist — every learning point you can be asked about." },
    { title: "Past papers, mark schemes and examiner reports", by: "Cambridge International", note: "The best practice there is — do them timed and mark them with the mark schemes." },
  ],

  mistakes: [
    "Saying enzymes are 'killed' — they are denatured.",
    "Mixing up mitosis and meiosis, or genes and alleles.",
    "Describing a graph without quoting any numbers or units.",
    "Using everyday words ('food goes to the blood') instead of terms like 'absorption' and 'assimilation'.",
    "Writing that plants respire only at night — they respire all the time.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Year 1, term 1", what: "Cells, classification, movement in and out of cells, biological molecules, enzymes (1–5)." },
    { when: "Year 1, term 2", what: "Plant nutrition and transport (6–7); human nutrition and gas exchange (8–9)." },
    { when: "Year 1, term 3", what: "Respiration, transport in humans, disease and immunity (10–12). First full past paper." },
    { when: "Year 2, term 1", what: "Excretion, coordination and control in animals and plants (13–15)." },
    { when: "Year 2, term 2", what: "Reproduction, inheritance, biotechnology, ecology (16–19); practical-paper practice." },
    { when: "Final months", what: "Timed past papers weekly; key-term flashcards; data-analysis practice." },
  ],
  studyNote: "Cambridge designs the course for about 130 guided learning hours. Add 2–3 hours a week of your own practice.",

  careers: {
    intro: "Biology is the starting point for every health career.",
    paths: [
      { name: "Medicine (MBBS) & dentistry", need: "Biology + Chemistry (+ Physics or Maths)" },
      { name: "Pharmacy, nursing, physiotherapy", need: "Biology, usually with Chemistry" },
      { name: "Biotechnology & genetics", need: "Biology + Chemistry" },
      { name: "Veterinary science & agriculture", need: "Biology + Chemistry" },
      { name: "Environmental science & conservation", need: "Biology + Geography or Chemistry" },
      { name: "Psychology & public health", need: "Biology helps" },
    ],
  },

  realWorld: [
    { title: "Ibn Sina (980–1037)", text: "His Canon of Medicine was used as a medical textbook for centuries — he wrote about contagion and how diseases spread, ideas you meet in Topic 12." },
    { title: "Insulin from bacteria", text: "Bacteria given the human insulin gene make the insulin many people with diabetes rely on — genetic modification in Topic 18." },
    { title: "Indus river dolphin", text: "A rare, nearly blind dolphin found in Pakistan's Indus river. Protecting it is a real example of conservation and human effects on ecosystems (Topic 19)." },
    { title: "Antibiotic resistance", text: "Using antibiotics when they aren't needed helps resistant bacteria survive and spread — natural selection happening in hospitals today (Topics 12 and 17)." },
  ],

  faqs: [
    { q: "Is O Level Biology a lot of memorising?", a: "There are many terms, but half the marks test using them on data and new situations. Learn terms precisely, then practise applying them." },
    { q: "Which practical paper will I take?", a: "Everyone takes Papers 1 and 2, plus either Paper 3 (lab) or Paper 4 (written Alternative to Practical). Online and private students usually take Paper 4 — confirm with your exam centre." },
    { q: "Is there maths in Biology?", a: "Some — percentages, means, magnification, rates and reading graphs. A calculator is allowed in all parts of the exam." },
    { q: "Is O Level 5090 the same as IGCSE Biology 0610?", a: "No. They are separate Cambridge syllabuses with different papers. This guide is for O Level 5090." },
    { q: "When can I sit the exam?", a: "Every June and November." },
  ],

  sources: [
    { label: "Official syllabus 5090 for exams in 2026, 2027 and 2028 (PDF)", url: "https://www.cambridgeinternational.org/Images/697330-2026-2028-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/762896-biology-5090-june-2026-grade-threshold-table.pdf" },
    { label: "Endorsed resources for 5090", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-biology-5090/endorsed-resources/" },
  ],
};

export default biology5090;
