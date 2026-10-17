// Cambridge O Level Chemistry 5070 — student guide.
// Facts (papers, marks, weightings, topics, command words, grades, hours) are
// taken from the official Cambridge syllabus for exams in 2026, 2027 and 2028
// and the June 2026 grade threshold table. Re-check when Cambridge publishes
// a new syllabus version (see `sources`).

const chemistry5070 = {
  slug: "chemistry-5070",
  subject: "Chemistry",
  level: "O Level",
  code: "5070",
  title: "Cambridge O Level Chemistry (5070)",
  tagline:
    "Why salt dissolves, why iron rusts, how medicines are measured and how a country grows its food — chemistry explains the stuff the world is made of.",
  syllabusYears: "2026, 2027 and 2028",
  verifiedOn: "18 October 2026",
  accent: "emerald",
  sibling: { slug: "chemistry-9701", label: "AS & A Level Chemistry (9701)" },

  quickFacts: [
    { label: "Syllabus code", value: "5070", note: "Cambridge O Level Chemistry" },
    { label: "Exams you sit", value: "3 papers", note: "Paper 1 + Paper 2 + one practical paper (3 or 4)" },
    { label: "Total exam time", value: "3 h 45 min – 4 h 15 min", note: "Depends on which practical paper you take" },
    { label: "Exam sessions", value: "June & November", note: "Every year" },
    { label: "Grades", value: "A* to E", note: "A* is the highest" },
    { label: "Teaching time", value: "about 130 hours", note: "Cambridge's guide; usually spread over 2 school years" },
    { label: "Calculator", value: "Allowed", note: "In all parts of the exam" },
    { label: "Leads to", value: "AS & A Level Chemistry", note: "Cambridge says A*–C prepares you well for 9701" },
  ],

  why: {
    intro:
      "Cambridge built this course so that you don't just remember chemistry — you can use it. In plain words, by the end you should be able to:",
    points: [
      "Explain what things are made of and why they behave the way they do — using real scientific ideas, not guesses.",
      "Do experiments safely and properly: measure, control what changes, and record what you see.",
      "Use data to solve problems — and say honestly where an experiment or a method has limits.",
      "Speak the language of chemistry: symbols, equations, units and the right words.",
      "See how chemistry helps people and the planet — clean water, food, fuels and materials.",
      "Enjoy science and feel ready for A Level and beyond.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    {
      title: "What is everything made of?",
      topics: "Topics 1–2",
      story:
        "Ice, water and steam are the same particles moving differently. Diamond and pencil 'lead' (graphite) are both pure carbon — one is the hardest natural material, the other slides on paper. Table salt melts at over 800 °C while sugar melts in a pan. Bonding explains every one of these. Learn it once and the whole subject starts to make sense.",
    },
    {
      title: "Counting atoms you can't see",
      topics: "Topic 3 — Stoichiometry",
      story:
        "A pharmacist needs the exact amount of medicine in a tablet; a factory needs exactly enough of each ingredient so nothing is wasted. Atoms are far too small to count one by one, so chemists count them in 'moles'. This is the maths of chemistry — and the topic that most often separates an A from a B.",
    },
    {
      title: "Electricity meets chemistry",
      topics: "Topic 4 — Electrochemistry",
      story:
        "Electricity can pull compounds apart: that is how aluminium for cans and aircraft is made, and how a thin shiny metal coat is put on objects (electroplating). Run it the other way and a hydrogen–oxygen fuel cell makes electricity with only water as the waste.",
    },
    {
      title: "Energy, speed and balance",
      topics: "Topics 5–6",
      story:
        "Why does a cold pack get cold and a hand warmer get hot? Why does food go off faster in the heat, and why do factories use catalysts? Some reactions run both ways and settle into a balance — understanding that balance is how industry makes ammonia (Haber process) and sulfuric acid (Contact process) on a huge scale.",
    },
    {
      title: "Acids, salts and the Periodic Table",
      topics: "Topics 7–8",
      story:
        "Stomach acid, antacid tablets, soil that is too acidic for crops — acids and bases are everywhere. The Periodic Table is chemistry's map: once you see its patterns you can predict how an element will behave before you have ever seen it react.",
    },
    {
      title: "Metals that build the world",
      topics: "Topic 9 — Metals",
      story:
        "Why is steel used for bridges and aluminium for aircraft? Why do we coat iron with zinc (galvanising)? You'll learn how metals are pulled out of their ores — iron in a blast furnace, aluminium from bauxite — and how alloys make metals stronger.",
    },
    {
      title: "Chemistry of our environment",
      topics: "Topic 10",
      story:
        "Making water safe to drink, feeding a country with NPK fertilisers, and understanding air pollution, acid rain and climate change. Pakistan is a big producer of urea fertiliser — this topic is chemistry that feeds millions.",
    },
    {
      title: "Carbon chemistry: fuels to plastics",
      topics: "Topic 11 — Organic chemistry",
      story:
        "Crude oil is separated into petrol, diesel and more by fractional distillation; big molecules are 'cracked' into useful small ones. Ethanol, vinegar (ethanoic acid), plastics like poly(ethene) and fibres like nylon — all from carbon chemistry, a huge industry across the Gulf.",
    },
    {
      title: "Being a chemical detective",
      topics: "Topic 12 — Experimental techniques",
      story:
        "How do you know which metal is in a salt, or whether a drink contains a banned colouring? Flame tests, tests for ions and gases, chromatography and titration are the detective's toolkit — and they are exactly what the practical paper tests.",
    },
  ],

  topics: [
    { n: 1, name: "States of matter", parts: ["Solids, liquids and gases", "Diffusion"] },
    { n: 2, name: "Atoms, elements and compounds", parts: ["Elements, compounds and mixtures", "Atomic structure and the Periodic Table", "Isotopes", "Ions and ionic bonds", "Simple molecules and covalent bonds", "Giant covalent structures", "Metallic bonding"] },
    { n: 3, name: "Stoichiometry", parts: ["Formulae", "Relative masses of atoms and molecules", "The mole and the Avogadro constant"] },
    { n: 4, name: "Electrochemistry", parts: ["Electrolysis", "Hydrogen–oxygen fuel cells"] },
    { n: 5, name: "Chemical energetics", parts: ["Exothermic and endothermic reactions"] },
    { n: 6, name: "Chemical reactions", parts: ["Physical and chemical changes", "Rate of reaction", "Reversible reactions and equilibrium", "Redox"] },
    { n: 7, name: "Acids, bases and salts", parts: ["The characteristic properties of acids and bases", "Oxides", "Preparation of salts"] },
    { n: 8, name: "The Periodic Table", parts: ["Arrangement of elements", "Group I properties", "Group VII properties", "Transition elements", "Noble gases"] },
    { n: 9, name: "Metals", parts: ["Properties of metals", "Uses of metals", "Alloys and their properties", "Reactivity series", "Corrosion of metals", "Extraction of metals"] },
    { n: 10, name: "Chemistry of the environment", parts: ["Water", "Fertilisers", "Air quality and climate"] },
    { n: 11, name: "Organic chemistry", parts: ["Formulae, functional groups and terminology", "Naming organic compounds", "Fuels", "Alkanes", "Alkenes", "Alcohols", "Carboxylic acids", "Polymers"] },
    { n: 12, name: "Experimental techniques and chemical analysis", parts: ["Experimental design", "Acid–base titrations", "Chromatography", "Separation and purification", "Identification of ions and gases"] },
  ],

  compare: {
    intro: "O Level gives you the big ideas. A Level (9701) takes the same ideas much deeper and adds new ones.",
    rows: [
      { idea: "Atoms", here: "Protons, neutrons, electrons; isotopes", next: "Orbitals (s, p, d), ionisation energies, why trends happen" },
      { idea: "Bonding", here: "Ionic, covalent, metallic; giant structures", next: "Shapes of molecules, electronegativity, intermolecular forces" },
      { idea: "Moles", here: "Moles, masses, gas volumes, titrations", next: "Harder multi-step calculations, ideal gas equation pV = nRT" },
      { idea: "Energy", here: "Exothermic vs endothermic", next: "Hess's law, Born–Haber cycles, entropy and Gibbs free energy" },
      { idea: "Equilibrium", here: "Reversible reactions; Haber and Contact processes", next: "Kc, Kp, Ka, pH and buffer calculations" },
      { idea: "Organic", here: "Alkanes, alkenes, alcohols, acids, polymers", next: "Reaction mechanisms, aromatic compounds, amines, synthesis routes" },
      { idea: "Analysis", here: "Tests for ions, chromatography", next: "Infrared, mass spectrometry and NMR — how real labs identify molecules" },
    ],
  },

  papers: [
    { name: "Paper 1 — Multiple Choice", time: "1 hour", marks: 40, weight: "30%", what: "40 questions, each with four options (A–D). Covers the whole syllabus.", who: "Everyone" },
    { name: "Paper 2 — Theory", time: "1 hour 45 minutes", marks: 80, weight: "50%", what: "Short-answer and structured questions — calculations, equations, explanations.", who: "Everyone" },
    { name: "Paper 3 — Practical Test", time: "1 hour 30 minutes", marks: 40, weight: "20%", what: "Real experiments in a lab, based on the experimental skills in the syllabus.", who: "Either Paper 3 or Paper 4" },
    { name: "Paper 4 — Alternative to Practical", time: "1 hour", marks: 40, weight: "20%", what: "A written paper about experiments: reading apparatus, recording results, planning and improving methods.", who: "Either Paper 3 or Paper 4" },
  ],
  papersNote:
    "Every paper is marked by Cambridge (externally assessed). Students who study online usually sit Paper 4, as it needs no lab — your exam centre confirms which practical paper it offers.",

  questionTypes: [
    {
      type: "Multiple choice (Paper 1)",
      example: "Which particle has the smallest mass?  A electron  B neutron  C proton  D hydrogen atom",
      testing: "Quick, exact recall and understanding. One mark each — read every option before you choose.",
    },
    {
      type: "Calculation (Paper 2)",
      example: "Calculate the mass of carbon dioxide made when 10.0 g of calcium carbonate is heated.",
      testing: "The mole: write the equation, convert to moles, use the ratio, convert back — show every step and the unit.",
    },
    {
      type: "Explain (Paper 2)",
      example: "Explain why graphite conducts electricity but diamond does not.",
      testing: "Linking structure to property — 'explain' always needs a reason (here: delocalised electrons that can move).",
    },
    {
      type: "Data and graphs (Papers 2 and 4)",
      example: "Use the graph to find the time taken for the reaction to finish, and suggest why the curve becomes flat.",
      testing: "Reading information you have never seen before and using syllabus ideas on it.",
    },
    {
      type: "Practical skills (Paper 3 or 4)",
      example: "Suggest one improvement to this method to make the results more accurate.",
      testing: "Planning, measuring, recording in tables, spotting errors and improving experiments.",
    },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "State", meaning: "express in clear terms", tip: "Short and exact. No explanation needed." },
    { word: "Describe", meaning: "state the points of a topic / give characteristics and main features", tip: "Say WHAT happens or what you see." },
    { word: "Explain", meaning: "set out purposes or reasons / make the relationships between things clear / say why and/or how and support with relevant evidence", tip: "Say WHY. Use 'because'." },
    { word: "Calculate", meaning: "work out from given facts, figures or information", tip: "Show working, give units and sensible significant figures." },
    { word: "Suggest", meaning: "apply knowledge and understanding to situations where there are a range of valid responses", tip: "The situation may be new — use what you know." },
    { word: "Predict", meaning: "suggest what may happen based on available information", tip: "Use a pattern or trend you have been given." },
    { word: "Deduce", meaning: "conclude from available information", tip: "The answer is in the data — work it out." },
    { word: "Compare", meaning: "identify/comment on similarities and/or differences", tip: "Mention BOTH things in every point." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Knowledge with understanding", weight: 50, plain: "Know the facts, definitions, equations and apparatus — and understand them." },
    { code: "AO2", name: "Handling information and problem-solving", weight: 30, plain: "Use what you know on new data, graphs and calculations." },
    { code: "AO3", name: "Experimental skills and investigations", weight: 20, plain: "Plan, measure, record, and evaluate experiments (tested in Paper 3 or 4)." },
  ],
  aoNote: "Half the marks are not memory. Papers 1 and 2 are 63% knowledge and 37% problem-solving, so practising unfamiliar questions matters as much as revising notes.",

  grades: {
    scale: "A*, A, B, C, D, E. 'Ungraded' means below E and is not shown on the certificate. Your certificate says GCE O LEVEL.",
    thresholds: {
      series: "June 2026",
      max: 200,
      rows: [
        { grade: "A*", range: "160–164", pct: "about 80–82%" },
        { grade: "A", range: "129–133", pct: "about 65–67%" },
        { grade: "B", range: "98–102", pct: "about 49–51%" },
        { grade: "C", range: "65–71", pct: "about 33–36%" },
        { grade: "D", range: "55–58", pct: "about 28–29%" },
        { grade: "E", range: "45–48", pct: "about 23–24%" },
      ],
      note: "Minimum weighted marks out of 200 in June 2026 (the range covers the different paper variants). Boundaries move a little every series — aim well above them.",
    },
    meaning: "Cambridge says students with A* to C are well prepared to go on to AS & A Level Chemistry. Medicine, pharmacy and engineering pathways usually expect an A or A*.",
  },

  practical: [
    "Know your apparatus: burette, pipette, measuring cylinder, gas syringe, thermometer — and how precisely each one reads.",
    "Record results in a table with units in the headings, to a consistent number of decimal places.",
    "Learn the tests for ions and gases (the syllabus gives the exact list) — they come up every year.",
    "Plan an investigation: what you change, what you measure, what you keep the same, and how you stay safe.",
    "Evaluate: name a source of error and give a real improvement (not just 'be more careful').",
    "No lab at home? Paper 4 (Alternative to Practical) is a written paper — videos of real experiments, virtual labs and real data sets build the same skills.",
  ],

  books: [
    { title: "Cambridge O Level Chemistry", by: "Bryan Earl — Hodder Education", note: "Endorsed by Cambridge for the syllabus from 2023 (still valid for 2026–2028)." },
    { title: "Chemistry for Cambridge O Level — Student Book", by: "Danesh Publications (2025)", note: "Listed on Cambridge's endorsed resources page." },
    { title: "The official syllabus (PDF)", by: "Cambridge International", note: "Your checklist — tick off every learning point." },
    { title: "Past papers, mark schemes and examiner reports", by: "Cambridge International", note: "The best practice there is — do them timed and mark them with the mark schemes." },
  ],
  booksNote: "Cambridge says textbooks endorsed for the 2023 syllabus are still suitable for exams in 2026–2028.",

  mistakes: [
    "Leaving out units, or giving too many significant figures in a calculation.",
    "Forgetting state symbols — (s), (l), (g), (aq) — when the question asks for them.",
    "Describing when the question says explain (or the other way round).",
    "Writing 'atoms' when you mean 'ions' or 'molecules' — the exact word earns the mark.",
    "Not balancing equations, or changing formulae to make them balance.",
    "In practical answers: saying 'repeat the experiment' without saying what it improves.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Year 1, term 1", what: "States of matter, atoms and bonding (Topics 1–2), then formulae and the mole (Topic 3). Get the mole solid early." },
    { when: "Year 1, term 2", what: "Acids, bases and salts (7), the Periodic Table (8), energetics (5)." },
    { when: "Year 1, term 3", what: "Rates, equilibrium and redox (6), electrochemistry (4). First full past paper." },
    { when: "Year 2, term 1", what: "Metals (9), environment (10), organic chemistry (11)." },
    { when: "Year 2, term 2", what: "Experimental techniques and analysis (12) alongside practical-paper practice; finish the syllabus." },
    { when: "Final months", what: "Timed past papers every week, mark them with mark schemes, and fix weak topics with your teacher." },
  ],
  studyNote: "Cambridge designs the course for about 130 guided learning hours. Add 2–3 hours a week of your own practice.",

  careers: {
    intro: "Chemistry is required or strongly preferred for many of the most popular degrees.",
    paths: [
      { name: "Medicine (MBBS) & dentistry", need: "Chemistry + Biology at A Level" },
      { name: "Pharmacy (Pharm-D)", need: "Chemistry is essential" },
      { name: "Chemical, petroleum & materials engineering", need: "Chemistry + Physics + Maths" },
      { name: "Environmental science & food science", need: "Chemistry + Biology" },
      { name: "Forensic science", need: "Chemistry is the core subject" },
      { name: "Petrochemicals, fertilisers, water treatment", need: "Big employers across Pakistan and the Gulf" },
    ],
  },

  realWorld: [
    { title: "Jabir ibn Hayyan (8th century)", text: "Often called the father of Arabic chemistry. Writings under his name describe distillation, crystallisation and evaporation — techniques you still use in Topic 12." },
    { title: "Fertiliser feeds nations", text: "Ammonia made by the Haber process becomes urea and NPK fertilisers — Pakistan's fertiliser plants make millions of tonnes for its farms." },
    { title: "Fuels from the Gulf", text: "Crude oil is separated by fractional distillation and cracked into fuels and plastics — the chemistry behind the Gulf's petrochemical industry." },
    { title: "Galvanised steel", text: "A coat of zinc protects iron even when scratched, because zinc corrodes first — the 'sacrificial protection' you learn in Topic 9." },
  ],

  faqs: [
    { q: "Is O Level Chemistry hard?", a: "It has more maths than Biology, mainly in the mole topic. Students who practise calculations little and often do very well — the A* boundary in June 2026 was about 80%." },
    { q: "Which practical paper will I take?", a: "Everyone takes Paper 1 and Paper 2, plus either Paper 3 (in a lab) or Paper 4 (written Alternative to Practical). Online and private students usually take Paper 4 — confirm with your exam centre." },
    { q: "Can I use a calculator?", a: "Yes — the syllabus allows calculators in all parts of the exam." },
    { q: "When can I sit the exam?", a: "Every June and November." },
    { q: "Is O Level 5070 the same as IGCSE Chemistry 0620?", a: "No. They are separate Cambridge syllabuses with different papers. This guide is for O Level 5070." },
    { q: "How many past papers should I do?", a: "Aim for at least the last 3 years of both series, timed, and marked with the official mark schemes." },
  ],

  sources: [
    { label: "Official syllabus 5070 for exams in 2026, 2027 and 2028 (PDF)", url: "https://www.cambridgeinternational.org/Images/697326-2026-2028-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/762898-chemistry-5070-june-2026-grade-threshold-table.pdf" },
    { label: "Cambridge O Level Chemistry 5070 — subject page", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-chemistry-5070/" },
    { label: "Endorsed resources for 5070", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-chemistry-5070/endorsed-resources" },
  ],
};

export default chemistry5070;
