// Cambridge International AS & A Level Biology 9700 — student guide.
// Facts from the official syllabus for exams in 2025, 2026 and 2027, the
// 2028–2030 syllabus ("no significant changes which affect teaching") and the
// June 2026 grade threshold table. See `sources`.

const biology9700 = {
  slug: "biology-9700",
  subject: "Biology",
  level: "AS & A Level",
  code: "9700",
  title: "Cambridge International AS & A Level Biology (9700)",
  tagline:
    "How a single gene builds a protein, how your immune system remembers a virus for years, how species change over millions of years — A Level Biology is the molecular story of life.",
  syllabusYears: "2025, 2026 and 2027 — and unchanged in substance for 2028–2030",
  verifiedOn: "18 October 2026",
  accent: "emerald",
  sibling: { slug: "biology-5090", label: "O Level Biology (5090)" },

  quickFacts: [
    { label: "Syllabus code", value: "9700", note: "Cambridge International AS & A Level Biology" },
    { label: "AS Level", value: "Papers 1, 2, 3", note: "4 h 30 min in total · grades a–e" },
    { label: "Full A Level", value: "Papers 1–5", note: "7 h 45 min in total · grades A*–E" },
    { label: "Exam sessions", value: "June & November", note: "(March is offered in India only)" },
    { label: "Teaching time", value: "about 180 h (AS) · 360 h (A Level)", note: "Cambridge's guide; usually 2 years" },
    { label: "Topics", value: "19", note: "11 at AS Level + 8 more for A Level" },
    { label: "Practical", value: "Paper 3 in a lab", note: "Plus Paper 5: planning, analysis & evaluation (written)" },
    { label: "Can be staged", value: "AS in Year 1 → A2 in Year 2", note: "AS result is carried forward" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. By the end you should be able to:",
    points: [
      "Understand biology deeply and do practical work accurately and safely.",
      "Use the scientific method — and know the limits of theories and models.",
      "Analyse data, judge its quality and draw sound conclusions.",
      "Communicate clearly with correct biological terms and conventions.",
      "Understand your responsibility to other people and to the environment.",
      "Enjoy biology and feel ready for a degree that uses it.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Inside the cell", topics: "AS Topics 1–6", story: "Electron micrographs show organelles in detail; you study the molecules of life, how enzymes really work, how membranes control what enters a cell, how cells divide — and how DNA is copied and read to make proteins." },
    { title: "Moving things around", topics: "AS 7–9", story: "How water climbs a 100-metre tree, how the heart and blood vessels deliver oxygen, and how the lungs are built for gas exchange — the physiology medicine is built on." },
    { title: "Fighting disease", topics: "AS 10–11", story: "Cholera, malaria, tuberculosis and HIV/AIDS — how they spread and how they are controlled — then antibodies, vaccination and why antibiotic resistance matters so much." },
    { title: "Energy for life", topics: "A Level 12–13", story: "Respiration and photosynthesis step by step — glycolysis, the Krebs cycle, ATP and the light-dependent reactions. This is how every cell is powered." },
    { title: "Control systems", topics: "A Level 14–15", story: "How the body keeps blood glucose and water balance steady, how nerve impulses and synapses work, and how plants respond to their environment." },
    { title: "Genes, evolution and the future", topics: "A Level 16–19", story: "Inheritance, natural selection and how new species arise; classification and conservation of endangered species; and genetic technology — from genetic engineering to gene therapy." },
  ],

  topicGroups: [
    {
      label: "AS Level",
      groups: [
        { area: "Cells & molecules", topics: [[1, "Cell structure"], [2, "Biological molecules"], [3, "Enzymes"], [4, "Cell membranes and transport"], [5, "The mitotic cell cycle"], [6, "Nucleic acids and protein synthesis"]] },
        { area: "Transport & exchange", topics: [[7, "Transport in plants"], [8, "Transport in mammals"], [9, "Gas exchange"]] },
        { area: "Health", topics: [[10, "Infectious diseases"], [11, "Immunity"]] },
      ],
      note: "AS Level students also study practical skills.",
    },
    {
      label: "A Level (adds to all the AS topics)",
      groups: [
        { area: "Energy", topics: [[12, "Energy and respiration"], [13, "Photosynthesis"]] },
        { area: "Control", topics: [[14, "Homeostasis"], [15, "Control and coordination"]] },
        { area: "Genes & evolution", topics: [[16, "Inheritance"], [17, "Selection and evolution"], [18, "Classification, biodiversity and conservation"], [19, "Genetic technology"]] },
      ],
      note: "A Level students also study practical skills.",
    },
  ],

  compare: {
    intro: "Coming from O Level or IGCSE? The topics sound familiar — the detail is new.",
    rows: [
      { idea: "Cells", here: "Cell parts and their jobs", next: "Ultrastructure from electron micrographs; mitosis and the cell cycle" },
      { idea: "Molecules", here: "Food tests", next: "Protein structure, DNA replication, transcription and translation" },
      { idea: "Enzymes", here: "Temperature and pH effects", next: "Inhibitors, Vmax and Km" },
      { idea: "Disease", here: "Pathogens, antibiotics, vaccines", next: "Named diseases (TB, malaria, HIV/AIDS, cholera), antibodies and immune memory" },
      { idea: "Energy", here: "Word equations", next: "Glycolysis, Krebs cycle, oxidative phosphorylation, Calvin cycle" },
      { idea: "Genes", here: "Simple genetic crosses", next: "Dihybrid crosses, chi-squared test, evolution, genetic technology" },
    ],
  },

  papers: [
    { name: "Paper 1 — Multiple Choice", time: "1 hour 15 minutes", marks: 40, weight: "31% of AS · 15.5% of A Level", what: "40 multiple-choice questions on AS content.", who: "AS & A Level" },
    { name: "Paper 2 — AS Level Structured Questions", time: "1 hour 15 minutes", marks: 60, weight: "46% of AS · 23% of A Level", what: "Structured questions on AS content.", who: "AS & A Level" },
    { name: "Paper 3 — Advanced Practical Skills", time: "2 hours", marks: 40, weight: "23% of AS · 11.5% of A Level", what: "Practical work in a lab plus structured questions on practical skills.", who: "AS & A Level" },
    { name: "Paper 4 — A Level Structured Questions", time: "2 hours", marks: 100, weight: "38.5% of A Level", what: "Structured questions on A Level content — AS knowledge is needed too.", who: "A Level only" },
    { name: "Paper 5 — Planning, Analysis and Evaluation", time: "1 hour 15 minutes", marks: 30, weight: "11.5% of A Level", what: "Written questions on planning investigations and analysing data — the context may be outside the syllabus.", who: "A Level only" },
  ],
  papersNote: "All papers are marked by Cambridge. Paper 3 is done in a laboratory at your exam centre — ask about it when you register.",
  routes: [
    { name: "AS Level only", detail: "Papers 1, 2 and 3 in the same exam series." },
    { name: "A Level, staged over two years", detail: "Year 1: Papers 1, 2, 3 (AS). Year 2: Papers 4 and 5. Your AS result is carried forward (Cambridge rules and time limits apply)." },
    { name: "A Level in one go", detail: "All five papers in the same exam series." },
  ],

  questionTypes: [
    { type: "Multiple choice (Paper 1)", example: "Which feature of a phospholipid allows it to form a bilayer in water?", testing: "Precise understanding — wrong options are common misconceptions." },
    { type: "Structured (Papers 2 and 4)", example: "Describe how the structure of haemoglobin is related to its function in transporting oxygen.", testing: "Structure–function links with correct terminology." },
    { type: "Data analysis (Papers 2 and 4)", example: "Use the oxygen dissociation curves to explain the effect of increased carbon dioxide on oxygen release.", testing: "Reading data accurately, then explaining it with biology." },
    { type: "Microscopy (Paper 3)", example: "Make a large plan diagram of the section of the leaf on the slide.", testing: "Accurate drawing, measuring with an eyepiece graticule, calculating actual size." },
    { type: "Plan and evaluate (Paper 5)", example: "Plan an investigation into the effect of substrate concentration on the rate of an enzyme-catalysed reaction.", testing: "Variables, method, risk, and how you would analyse and judge the results." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "Describe", meaning: "state the points of a topic / give characteristics and main features", tip: "For data: trend, key figures, units." },
    { word: "Explain", meaning: "set out purposes or reasons / make the relationships between things evident / provide why and/or how and support with relevant evidence", tip: "Give the biological mechanism." },
    { word: "Outline", meaning: "set out main points", tip: "Brief, but cover each stage." },
    { word: "Compare", meaning: "identify/comment on similarities and/or differences", tip: "Pair the points — 'X has…, whereas Y has…'." },
    { word: "Suggest", meaning: "apply knowledge and understanding to situations where there are a range of valid responses in order to make proposals / put forward considerations", tip: "Unfamiliar organism or data — reason it through." },
    { word: "Discuss", meaning: "write about issue(s) or topic(s) in depth in a structured way", tip: "Several sides, organised clearly." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Knowledge and understanding", weight: 40, plain: "Processes, structures, terms and apparatus." },
    { code: "AO2", name: "Handling, applying and evaluating information", weight: 40, plain: "Interpreting data and applying biology to new situations." },
    { code: "AO3", name: "Experimental skills and investigations", weight: 20, plain: "Practical work, planning and evaluation (Papers 3 and 5)." },
  ],
  aoNote: "Applying biology is worth as much as knowing it (40% each) — practise past-paper data questions, not just notes.",

  grades: {
    scale: "AS Level: a, b, c, d, e. Full A Level: A*, A, B, C, D, E. 'Ungraded' means below the lowest grade and is not shown on the certificate.",
    thresholds: {
      series: "June 2026 (full A Level, all five papers)",
      max: 260,
      rows: [
        { grade: "A*", range: "190–202", pct: "about 73–78%" },
        { grade: "A", range: "165–177", pct: "about 63–68%" },
        { grade: "B", range: "140–152", pct: "about 54–58%" },
        { grade: "C", range: "120–131", pct: "about 46–50%" },
        { grade: "D", range: "100–111", pct: "about 38–43%" },
        { grade: "E", range: "80–91", pct: "about 31–35%" },
      ],
      note: "Minimum weighted marks out of 260 in June 2026; the range covers the different paper variants. For AS Level alone (out of 130) an 'a' needed about 86–92.",
    },
    meaning: "Medicine and dentistry usually ask for A/A* grades in Biology and Chemistry. Check each university's own requirements.",
  },

  practical: [
    "Paper 3 includes microscopy: plan diagrams, cell drawings and measuring with an eyepiece graticule and stage micrometer.",
    "Practise the biochemical tests (e.g. Benedict's, biuret, iodine, emulsion) and semi-quantitative methods.",
    "Record raw data in tables with units; calculate means and rates correctly.",
    "Paper 5: identify variables, describe a clear method and risk assessment, and choose the right statistical test.",
    "Evaluate with specific, practical improvements — not just 'repeat it'.",
  ],

  books: [
    { title: "Cambridge International AS & A Level Biology Coursebook", by: "Cambridge University Press (2020)", note: "Endorsed for the syllabus from 2022." },
    { title: "Cambridge International AS & A Level Biology Student's Book", by: "Hodder Education (2020)", note: "Endorsed for the syllabus from 2022." },
    { title: "Collins Cambridge International AS & A Level Biology Student's Book", by: "Collins (2020)", note: "Endorsed for the syllabus from 2022." },
    { title: "Official syllabus, past papers, mark schemes and examiner reports", by: "Cambridge International", note: "The best practice there is — do them timed and mark them with the mark schemes." },
  ],
  booksNote: "Cambridge says textbooks endorsed for the syllabus from 2022 are still suitable — including for 2028–2030.",

  mistakes: [
    "Vague terms: 'energy is produced' instead of 'ATP is synthesised'.",
    "Describing data without quoting figures and units, or explaining when asked only to describe.",
    "Confusing transcription with translation, or DNA replication with protein synthesis.",
    "Drawing shaded or sketchy diagrams in Paper 3.",
    "Forgetting that the chi-squared test compares observed with expected results.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Year 1 (AS), term 1", what: "Cell structure, biological molecules, enzymes, membranes (1–4)." },
    { when: "Year 1, term 2", what: "Cell cycle, nucleic acids and protein synthesis, transport in plants and mammals (5–8)." },
    { when: "Year 1, term 3", what: "Gas exchange, infectious diseases, immunity (9–11); AS past papers and Paper 3 practice." },
    { when: "Year 2 (A2), term 1", what: "Respiration, photosynthesis, homeostasis (12–14)." },
    { when: "Year 2, term 2", what: "Control and coordination, inheritance, evolution, classification and conservation, genetic technology (15–19)." },
    { when: "Final months", what: "Timed Papers 4 and 5 weekly; essay-style answer practice; statistics drills." },
  ],
  studyNote: "Cambridge designs AS for about 180 and full A Level for about 360 guided learning hours. Add 4–5 hours a week of your own practice.",

  careers: {
    intro: "A Level Biology leads into medicine and the life sciences.",
    paths: [
      { name: "Medicine (MBBS), dentistry, veterinary", need: "Biology + Chemistry (often + Physics or Maths)" },
      { name: "Pharmacy, nursing, physiotherapy", need: "Biology + Chemistry" },
      { name: "Biotechnology, genetics, microbiology", need: "Biology + Chemistry" },
      { name: "Biomedical science & public health", need: "Biology + Chemistry" },
      { name: "Environmental science & conservation", need: "Biology + one other science or Geography" },
      { name: "Psychology & neuroscience", need: "Biology helps" },
    ],
  },

  realWorld: [
    { title: "Diseases that shaped history", text: "Cholera, malaria, TB and HIV/AIDS are all named in Topic 10 — you learn how each spreads and how communities control them." },
    { title: "Monoclonal antibodies", text: "Lab-made antibodies are used both to diagnose diseases and to treat them — the syllabus asks you to outline how (Topic 11)." },
    { title: "Gene therapy", text: "Treating genetic disease by delivering working genes into cells is part of Topic 19 — real medicine being developed today." },
    { title: "Conserving endangered species", text: "Topic 18 covers why species become endangered and how zoos, seed banks and protected areas help — think of Pakistan's Indus river dolphin." },
  ],

  faqs: [
    { q: "Do I need O Level Biology first?", a: "Cambridge recommends having completed Biology or Co-ordinated Science at IGCSE / O Level standard first." },
    { q: "Is A Level Biology just memorising?", a: "No — 40% of the marks are for applying, analysing and evaluating. Data questions and Paper 5 reward reasoning." },
    { q: "Should I take Chemistry too?", a: "For medicine, dentistry and pharmacy, yes — most universities ask for both." },
    { q: "How do online students do Paper 3?", a: "Paper 3 is taken in your exam centre's lab, so register with a centre that runs it and practise microscopy and tests beforehand." },
    { q: "Is the syllabus changing?", a: "The 2028–2030 syllabus has no significant changes that affect teaching." },
  ],

  sources: [
    { label: "Official syllabus 9700 for exams in 2025, 2026 and 2027 (PDF)", url: "https://www.cambridgeinternational.org/Images/664560-2025-2027-syllabus.pdf" },
    { label: "Official syllabus 9700 for exams in 2028, 2029 and 2030 (PDF)", url: "https://www.cambridgeinternational.org/Images/744622-2028-2030-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/761524-biology-9700-june-2026-grade-threshold-table.pdf" },
    { label: "Endorsed resources for 9700", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-biology-9700/endorsed-resources/" },
  ],
};

export default biology9700;
