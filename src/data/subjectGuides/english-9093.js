// Cambridge International AS & A Level English Language 9093 — student guide.
// Facts from the official syllabuses for exams in 2024–2026 and 2027–2028
// (Cambridge: "no significant changes"), and the June 2026 grade threshold
// table. See `sources`.

const english9093 = {
  slug: "english-9093",
  subject: "English Language",
  level: "AS & A Level",
  code: "9093",
  title: "Cambridge International AS & A Level English Language (9093)",
  tagline:
    "Why do adverts work? How does a toddler learn to talk? Why is English changing so fast — and who owns it now? A Level English Language turns you into a sharp writer and a scientist of language.",
  syllabusYears: "2024–2026 and 2027–2028 (same papers)",
  verifiedOn: "18 October 2026",
  accent: "violet",
  sibling: { slug: "english-1123", label: "O Level English Language (1123)" },

  quickFacts: [
    { label: "Syllabus code", value: "9093", note: "Cambridge International AS & A Level English Language" },
    { label: "AS Level", value: "Papers 1 + 2", note: "Reading + Writing · 4 h 15 min · grades a–e" },
    { label: "Full A Level", value: "Papers 1–4", note: "Adds Language Analysis + Language Topics · grades A*–E" },
    { label: "Exam sessions", value: "June & November", note: "Every year" },
    { label: "Each paper", value: "50 marks", note: "Four papers, 25% each of the A Level" },
    { label: "Teaching time", value: "about 180 h (AS) · 360 h (A Level)", note: "Cambridge's guide" },
    { label: "Dictionaries", value: "Not allowed", note: "In any paper" },
    { label: "Can be staged", value: "AS in Year 1 → A2 in Year 2", note: "AS marks are carried forward" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. It helps you to:",
    points: [
      "Enjoy studying the English language.",
      "Respond critically to texts of many forms, styles and contexts.",
      "Write effectively, creatively, accurately and appropriately.",
      "Develop the linked skills of reading, analysis and research.",
      "Understand the concepts and techniques linguists use.",
      "Build a firm foundation for studying language and linguistics further.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Reading like a writer", topics: "Paper 1 — Reading (AS)", story: "Unseen texts of 550–750 words — adverts, blogs, speeches, travel writing. You write your own piece for a new audience, then compare your choices with the original, and analyse how writers use form, structure and language." },
    { title: "Writing for real audiences", topics: "Paper 2 — Writing (AS)", story: "A short text of no more than 400 words with a reflective commentary on your own choices, then 600–900 words of imaginative, argumentative or review writing." },
    { title: "How English changes", topics: "Paper 3 — Section A", story: "A text written any time from about 1500 to today, plus an n-gram graph and corpus data — you become a language detective tracing how words and grammar change over centuries." },
    { title: "How children learn to talk", topics: "Paper 3 — Section B", story: "Transcripts of children aged 0 to 8 talking. Why does a toddler say 'I goed'? You connect what you see to theories of how humans acquire language." },
    { title: "English in the world & language and the self", topics: "Paper 4", story: "Who owns English now that most speakers learned it as a second language? How does the way we speak shape our identity? Essays on real texts, using your wider study of these topics." },
  ],

  topicGroups: [
    {
      label: "AS Level",
      groups: [
        { area: "Paper 1 — Reading", topics: [["A", "Directed response + comparison"], ["B", "Text analysis"]] },
        { area: "Paper 2 — Writing", topics: [["A", "Shorter writing + reflective commentary"], ["B", "Extended writing: imaginative/descriptive, discursive/argumentative or review/critical"]] },
      ],
    },
    {
      label: "A Level (adds)",
      groups: [
        { area: "Paper 3 — Language Analysis", topics: [["A", "Language change"], ["B", "Child language acquisition"]] },
        { area: "Paper 4 — Language Topics", topics: [["A", "English in the world"], ["B", "Language and the self"]] },
      ],
    },
  ],

  compare: {
    intro: "Coming from O Level or IGCSE English? You keep reading and writing — and add linguistics.",
    rows: [
      { idea: "Reading", here: "Comprehension and writers' effects", next: "Analysing form, structure and language across many text types" },
      { idea: "Writing", here: "Directed writing, compositions (up to ~450 words)", next: "Writing for set audiences, reflective commentaries, 600–900 word pieces" },
      { idea: "Language study", here: "—", next: "Language change, child language acquisition, world Englishes, language and identity" },
      { idea: "Data", here: "—", next: "n-gram graphs, corpus tables and speech transcripts" },
    ],
  },

  papers: [
    { name: "Paper 1 — Reading", time: "2 hours 15 minutes", marks: 50, weight: "50% of AS · 25% of A Level", what: "Section A: directed response to a text, plus a comparison of your writing with the original. Section B: analysis of an unseen text (each text about 550–750 words).", who: "AS & A Level" },
    { name: "Paper 2 — Writing", time: "2 hours", marks: 50, weight: "50% of AS · 25% of A Level", what: "Section A: a text of no more than 400 words plus a reflective commentary. Section B: one extended piece of 600–900 words from a choice of three.", who: "AS & A Level" },
    { name: "Paper 3 — Language Analysis", time: "2 hours 15 minutes", marks: 50, weight: "25% of A Level", what: "Section A: language change (a prose text + n-gram graph + corpus word table). Section B: child language acquisition (a transcript, ages 0–8).", who: "A Level only" },
    { name: "Paper 4 — Language Topics", time: "2 hours 15 minutes", marks: 50, weight: "25% of A Level", what: "Two essays responding to 400–500 word texts: English in the world, and Language and the self.", who: "A Level only" },
  ],
  papersNote: "All papers are marked by Cambridge. Dictionaries may not be used.",
  routes: [
    { name: "AS Level only", detail: "Papers 1 and 2 in the same exam series." },
    { name: "A Level, staged over two years", detail: "Year 1: Papers 1 and 2. Year 2: Papers 3 and 4. AS marks carry forward (Cambridge rules and time limits apply)." },
    { name: "A Level in one go", detail: "All four papers in the same exam series." },
  ],

  questionTypes: [
    { type: "Directed response (Paper 1)", example: "Using the travel blog, write the opening of a leaflet for a tourism board (150–200 words), then compare its style with the original.", testing: "Adapting style to a new audience — and explaining your choices." },
    { type: "Text analysis (Paper 1)", example: "Analyse how the writer of this charity appeal uses form, structure and language to persuade readers.", testing: "Identifying features and linking them to purpose, audience and context." },
    { type: "Extended writing (Paper 2)", example: "Write a review of a place, event or product that has disappointed you (600–900 words).", testing: "Voice, structure and control of language for a chosen form." },
    { type: "Language change (Paper 3)", example: "Analyse how the 1820s letter shows ways in which English has changed, referring to the n-gram graph and the corpus table.", testing: "Using data as evidence alongside your wider study." },
    { type: "Child language (Paper 3)", example: "Analyse how the child in the transcript uses language when talking with her father.", testing: "Precise linguistic terms linked to theories and examples." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "Analyse", meaning: "examine in detail to show meaning, identify elements and the relationship between them", tip: "Feature → example → effect, every time." },
    { word: "Compare", meaning: "identify/comment on similarities and/or differences", tip: "Discuss both texts together, not one after the other." },
    { word: "Discuss", meaning: "write about issue(s) or topic(s) in depth in a structured way", tip: "Several viewpoints, organised, with evidence." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Read and understand a wide variety of texts", weight: "15 (AS) · 20 (A Level)", bar: 18, plain: "Understand what texts say and do." },
    { code: "AO2", name: "Write effectively, creatively, accurately and appropriately", weight: "45 (AS) · 30 (A Level)", bar: 38, plain: "Your own writing for different audiences and purposes." },
    { code: "AO3", name: "Analyse writers' and speakers' choices", weight: "40 (AS) · 20 (A Level)", bar: 30, plain: "How form, structure and language create meaning and style." },
    { code: "AO4", name: "Understand linguistic issues, concepts and methods", weight: "0 (AS) · 20 (A Level)", bar: 10, plain: "Theories and ideas about language (Papers 3 and 4)." },
    { code: "AO5", name: "Analyse and synthesise language data", weight: "0 (AS) · 10 (A Level)", bar: 5, plain: "Transcripts, n-grams and corpus data (Paper 3)." },
  ],
  aoNote: "At AS, writing and analysis dominate; the full A Level adds linguistics and data analysis.",

  grades: {
    scale: "AS Level: a, b, c, d, e. Full A Level: A*, A, B, C, D, E.",
    thresholds: {
      series: "June 2026 (full A Level, four papers)",
      max: 200,
      rows: [
        { grade: "A*", range: "159", pct: "about 80%" },
        { grade: "A", range: "138", pct: "69%" },
        { grade: "B", range: "117", pct: "about 59%" },
        { grade: "C", range: "100", pct: "50%" },
        { grade: "D", range: "84", pct: "42%" },
        { grade: "E", range: "68", pct: "34%" },
      ],
      note: "Minimum marks out of 200 in June 2026 (all paper variants had the same boundaries). For AS Level alone (out of 100) an 'a' needed 67 and an 'e' 37.",
    },
    meaning: "Useful for law, media, education, psychology and humanities degrees — and it proves strong academic English.",
  },

  practicalTitle: "How to improve fast",
  practical: [
    "Build a toolkit of terms (lexis, syntax, register, modality, pragmatics) and use them precisely.",
    "Read widely across text types — opinion pieces, adverts, speeches, blogs — and annotate them.",
    "For Paper 3, practise reading n-gram graphs and transcripts, and learn the transcription key printed in the syllabus.",
    "Keep a file of real examples of English around the world and of language and identity for Paper 4.",
    "Time your writing: 600–900 words in Paper 2 needs planning, drafting and proofreading.",
  ],

  books: [
    { title: "English Language for Cambridge International AS & A Level Coursebook", by: "Cambridge University Press (2019)", note: "Endorsed for the syllabus from 2021." },
    { title: "Cambridge International AS & A Level English Language Student's Book", by: "Collins (2019)", note: "Endorsed for the syllabus from 2021." },
    { title: "Past papers, inserts and mark schemes", by: "Cambridge International", note: "Essential for unseen-text practice." },
  ],
  booksNote: "Cambridge says textbooks endorsed for the syllabus from 2021 are still suitable for 2027–2028.",

  mistakes: [
    "Feature-spotting: naming techniques without explaining their effect.",
    "Writing about each text separately in a comparison question.",
    "Retelling a transcript instead of analysing the language in it.",
    "Ignoring the data (n-gram, corpus table) in the language-change question.",
    "Reflective commentaries that describe what you wrote rather than why.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Year 1 (AS), term 1", what: "Text types and analysis terms; Paper 1 text analysis." },
    { when: "Year 1, term 2", what: "Directed response and comparison; Paper 2 shorter writing and commentary." },
    { when: "Year 1, term 3", what: "Extended writing in all three categories; AS past papers." },
    { when: "Year 2 (A2), term 1", what: "Language change and child language acquisition (Paper 3)." },
    { when: "Year 2, term 2", what: "English in the world and Language and the self (Paper 4)." },
    { when: "Final months", what: "Timed essays every week; build case-study files; mark against mark schemes." },
  ],
  studyNote: "Cambridge designs AS for about 180 and full A Level for about 360 guided learning hours.",

  careers: {
    intro: "A Level English Language suits careers built on communication and analysis.",
    paths: [
      { name: "Law", need: "Close reading and argument" },
      { name: "Journalism, media & publishing", need: "Writing for audiences" },
      { name: "Linguistics, speech therapy, teaching", need: "Language study" },
      { name: "Marketing, advertising & PR", need: "Persuasive writing" },
      { name: "Psychology & social sciences", need: "Analysis and essay writing" },
    ],
  },

  realWorld: [
    { title: "English in Pakistan", text: "English is one of Pakistan's official languages alongside Urdu, and Pakistani English has its own words and expressions — exactly the kind of example Paper 4 rewards." },
    { title: "Words that travel", text: "English borrowed 'pyjamas' and 'shampoo' from South Asian languages — language change in action." },
    { title: "Children are linguists", text: "When a child says 'mouses' or 'I goed', they are applying a grammar rule they have worked out — evidence for child language acquisition theories." },
    { title: "Data and language", text: "n-gram graphs show how often words appear in millions of books over time — linguistics meets data science." },
  ],

  faqs: [
    { q: "Do I need O Level English first?", a: "Cambridge recommends a course in English equivalent to IGCSE or O Level." },
    { q: "Is there any literature?", a: "No set books — this is English Language. All texts are unseen and printed in the exam." },
    { q: "Can I stop at AS Level?", a: "Yes. AS Level is Papers 1 and 2 and is a qualification in its own right." },
    { q: "Dictionaries?", a: "Not allowed in any paper." },
    { q: "Is the syllabus changing?", a: "The 2027–2028 syllabus has no significant changes that affect teaching." },
  ],

  sources: [
    { label: "Official syllabus 9093 for exams in 2024, 2025 and 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/635901-2024-2026-syllabus.pdf" },
    { label: "Official syllabus 9093 for exams in 2027 and 2028 (PDF)", url: "https://www.cambridgeinternational.org/Images/721359-2027-2028-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/761494-english-language-9093-june-2026-grade-threshold-table.pdf" },
    { label: "Endorsed resources for 9093", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-english-language-9093/endorsed-resources/" },
  ],
};

export default english9093;
