// Cambridge O Level First Language Urdu 3247 — student guide.
// Facts from the official syllabus for exams in 2027 (Cambridge: "no
// significant changes") and the June 2026 grade threshold table. Set texts
// rotate — students must use the list for their exam year. See `sources`.

const urdu3247 = {
  slug: "urdu-3247",
  subject: "Urdu (First Language)",
  level: "O Level",
  code: "3247",
  title: "Cambridge O Level First Language Urdu (3247)",
  tagline:
    "Read deeply, write powerfully and explore Urdu poetry and prose — First Language Urdu is for students who think and dream in Urdu.",
  syllabusYears: "2027 and 2028–2029 (same papers; new set texts from 2028)",
  verifiedOn: "18 October 2026",
  accent: "amber",
  sibling: { slug: "urdu-3248", label: "O Level Second Language Urdu (3248)" },

  quickFacts: [
    { label: "Syllabus code", value: "3247", note: "Cambridge O Level First Language Urdu" },
    { label: "Exams you sit", value: "2 papers", note: "Reading & Writing + Texts" },
    { label: "Total exam time", value: "3 h 30 min", note: "1 h 30 min + 2 h · 50 marks each" },
    { label: "Exam session", value: "June only", note: "Not offered in November" },
    { label: "Grades", value: "A* to E", note: "A* is the highest" },
    { label: "Answers in", value: "Urdu", note: "All questions" },
    { label: "Literature", value: "Set poetry and prose", note: "Set texts may not be taken into the exam" },
    { label: "Who is it for?", value: "First-language Urdu speakers", note: "Cambridge's recommendation" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. It helps you to:",
    points: [
      "Write accurately, appropriately and effectively.",
      "Understand and respond well to what you read.",
      "Enjoy and appreciate the variety of the Urdu language.",
      "Build general skills like analysis, synthesis and drawing inferences.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Reading with understanding", topics: "Paper 1, Part 1", story: "Comprehension questions on a non-literary text of about 400 words — understanding facts, opinions and the meanings between the lines." },
    { title: "Composition", topics: "Paper 1, Part 2", story: "One composition of 300–400 words from a choice of argumentative, discursive, descriptive and narrative titles." },
    { title: "Unseen literature", topics: "Paper 2, Part 1", story: "A poetry or prose extract you have never seen — how does the writer create effects?" },
    { title: "Set poetry and prose", topics: "Paper 2, Parts 2–3", story: "Essays on the prescribed poems and prose texts listed in the syllabus for your exam year." },
  ],

  topics: [
    { n: 1, name: "Paper 1 — Reading and Writing", parts: ["Part 1 Reading: comprehension on a ~400-word text (25 marks)", "Part 2 Writing: one composition of 300–400 words (25 marks)"] },
    { n: 2, name: "Paper 2 — Texts", parts: ["Part 1 Unseen passage (20 marks)", "Part 2 Poetry — one essay on set texts (15 marks)", "Part 3 Prose — one essay on set texts (15 marks)"] },
  ],

  papers: [
    { name: "Paper 1 — Reading and Writing", time: "1 hour 30 minutes", marks: 50, weight: "50%", what: "Part 1: answer all comprehension questions on a non-literary text. Part 2: one composition (300–400 words).", who: "Everyone" },
    { name: "Paper 2 — Texts", time: "2 hours", marks: 50, weight: "50%", what: "One question from each part: an unseen passage, poetry (set texts) and prose (set texts).", who: "Everyone" },
  ],
  papersNote: "Both papers are marked by Cambridge and all answers are written in Urdu. Set texts rotate — check the list for your exam year.",

  aos: [
    { code: "AO1", name: "Reading", weight: 25, plain: "Understand, order and evaluate information; recognise implicit meanings." },
    { code: "AO2", name: "Writing", weight: 25, plain: "Task achievement, structure and language in your composition." },
    { code: "AO3", name: "Literature (texts)", weight: 50, plain: "Personal, informed response to poetry and prose." },
  ],
  aoNote: "Half the qualification is literature — read the set texts several times and know them well.",

  grades: {
    scale: "A*, A, B, C, D, E. 'Ungraded' means below E and is not shown on the certificate.",
    thresholds: {
      series: "June 2026",
      max: 100,
      rows: [
        { grade: "A*", range: "93", pct: "93%" },
        { grade: "A", range: "87", pct: "87%" },
        { grade: "B", range: "80", pct: "80%" },
        { grade: "C", range: "73", pct: "73%" },
        { grade: "D", range: "54", pct: "54%" },
        { grade: "E", range: "35", pct: "35%" },
      ],
      note: "Minimum marks out of 100 in June 2026 — note how high the top grades are.",
    },
    meaning: "A high grade shows real mastery of written Urdu and its literature.",
  },

  practicalTitle: "How to score well",
  practical: [
    "Know your set poems and prose texts closely — set texts may not be taken into the exam.",
    "Learn short quotations to support your literature essays.",
    "For unseen passages, comment on how the writer creates effects, not just what happens.",
    "Plan compositions: clear structure, rich vocabulary, accurate grammar.",
    "Read Urdu newspapers and essays to build reading speed.",
  ],

  books: [
    { title: "The official syllabus — set texts list", by: "Cambridge International", note: "The poems and prose you will be examined on in your exam year." },
    { title: "Past papers and mark schemes", by: "Cambridge International", note: "Show what high-level literature answers look like." },
  ],

  mistakes: [
    "Retelling the story instead of discussing the writer's craft.",
    "Too few quotations in literature essays.",
    "Compositions outside the 300–400 word range.",
    "Studying the wrong year's set texts.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Term 1", what: "Reading comprehension skills; start the set poetry." },
    { when: "Term 2", what: "Compositions of all four types; continue set poetry." },
    { when: "Term 3", what: "Set prose; unseen-passage practice." },
    { when: "Final months", what: "Timed papers; quotation revision; essay plans for each set text." },
  ],
  studyNote: "Cambridge designs O Level courses for about 130 guided learning hours.",

  careers: {
    intro: "Excellent Urdu opens doors in media, education and public life in Pakistan.",
    paths: [
      { name: "Journalism, broadcasting & media", need: "Strong written Urdu" },
      { name: "Teaching & Urdu literature", need: "Literary study" },
      { name: "Law & civil services", need: "Formal written Urdu" },
      { name: "Translation & publishing", need: "Urdu and English" },
    ],
  },

  realWorld: [
    { title: "A great literary tradition", text: "Urdu literature includes giants such as Mirza Ghalib, Allama Iqbal and Faiz Ahmed Faiz." },
    { title: "Reading between the lines", text: "Recognising implicit meanings and attitudes — a Paper 1 skill — helps you read news and opinion critically." },
  ],

  faqs: [
    { q: "First or Second Language Urdu?", a: "Cambridge recommends First Language Urdu (3247) for students with first-language competence. Others should consider Second Language Urdu (3248)." },
    { q: "Can I take the set texts into the exam?", a: "No — set texts may not be taken into the examination." },
    { q: "When can I sit the exam?", a: "June only." },
    { q: "Do the set texts change?", a: "Yes — they rotate, and Cambridge has updated the list for 2028–2029. Always use the list for the year you sit the exam." },
  ],

  sources: [
    { label: "Official syllabus 3247 for exams in 2027 (PDF)", url: "https://www.cambridgeinternational.org/Images/721463-2027-syllabus.pdf" },
    { label: "Official syllabus 3247 for exams in 2028 and 2029 (PDF)", url: "https://www.cambridgeinternational.org/Images/744864-2028-2029-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/762907-first-language-urdu-3247-june-2026-grade-threshold-table.pdf" },
  ],
};

export default urdu3247;
