// Cambridge O Level Second Language Urdu 3248 — student guide.
// Facts from the official syllabuses for exams in 2024–2026 and 2027–2029
// (Cambridge: "no significant changes"), and the June 2026 grade threshold
// table. See `sources`.

const urdu3248 = {
  slug: "urdu-3248",
  subject: "Urdu (Second Language)",
  level: "O Level",
  code: "3248",
  title: "Cambridge O Level Second Language Urdu (3248)",
  tagline:
    "Read it, write it, translate it — Second Language Urdu builds practical, confident Urdu for school, family and work, wherever you live.",
  syllabusYears: "2024–2026 and 2027–2029 (same papers)",
  verifiedOn: "18 October 2026",
  accent: "amber",
  sibling: { slug: "urdu-3247", label: "O Level First Language Urdu (3247)" },

  quickFacts: [
    { label: "Syllabus code", value: "3248", note: "Cambridge O Level Second Language Urdu" },
    { label: "Exams you sit", value: "2 papers", note: "Reading & Writing + Grammar, Writing & Translation" },
    { label: "Total exam time", value: "3 h 15 min", note: "1 h 45 min + 1 h 30 min · 50 marks each" },
    { label: "Exam sessions", value: "June & November", note: "Every year" },
    { label: "Grades", value: "A* to E", note: "A* is the highest" },
    { label: "Teaching time", value: "about 130 hours", note: "Cambridge's guide" },
    { label: "Dictionaries", value: "Not allowed", note: "In either paper" },
    { label: "Who is it for?", value: "Learners with some Urdu", note: "From school and/or the community" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. It helps you to:",
    points: [
      "Use Urdu effectively for practical, everyday communication.",
      "Build a base for further study or work that uses Urdu.",
      "Understand how language works and how to learn languages well.",
      "Expand your Urdu vocabulary.",
      "Grow as a person through language.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Reading for information", topics: "Paper 1, Exercises 1–3", story: "Short answers on a short text, matching people to paragraphs, and making notes from a longer text — reading the way you do in real life." },
    { title: "Summary and functional writing", topics: "Paper 1, Exercises 4–5", story: "A summary of no more than 100 words, then a short practical piece of about 150 words — an email, for example — for a given purpose and reader." },
    { title: "Grammar in context", topics: "Paper 2, Exercises 1–2", story: "Transform sentences without changing their meaning, and fill gaps in a passage — verbs, agreement, comparatives, postpositions and vocabulary." },
    { title: "Writing and translation", topics: "Paper 2, Exercises 3–4", story: "A piece of continuous prose of about 200 words, and translating a passage of about 150 words from English into Urdu." },
  ],

  topics: [
    { n: 1, name: "Paper 1 — Reading and Writing", parts: ["Short-answer questions", "Multiple matching", "Note-making", "Summary (no more than 100 words)", "Writing exercise (about 150 words, e.g. an email)"] },
    { n: 2, name: "Paper 2 — Grammar, Writing and Translation", parts: ["Sentence transformation", "Multiple-choice cloze passage", "Extended writing (about 200 words)", "Translation from English into Urdu (about 150 words)"] },
  ],

  papers: [
    { name: "Paper 1 — Reading and Writing", time: "1 hour 45 minutes", marks: 50, weight: "50%", what: "Five exercises: short answers, multiple matching, note-making, a summary and a short functional writing task.", who: "Everyone" },
    { name: "Paper 2 — Grammar, Writing and Translation", time: "1 hour 30 minutes", marks: 50, weight: "50%", what: "Four exercises: sentence transformation, a multiple-choice cloze passage, extended writing and translation from English into Urdu.", who: "Everyone" },
  ],
  papersNote: "Both papers are marked by Cambridge. Dictionaries may not be used.",

  questionTypes: [
    { type: "Note-making (Paper 1)", example: "Read the article about a city library and make brief notes under the headings given.", testing: "Picking out the key points quickly and accurately." },
    { type: "Functional writing (Paper 1)", example: "Write an email (about 150 words) to a friend inviting them to a family wedding, using the prompts.", testing: "Purpose, format and audience — and accurate Urdu." },
    { type: "Sentence transformation (Paper 2)", example: "Rewrite the sentence using the word given, without changing its meaning.", testing: "Grammar control." },
    { type: "Translation (Paper 2)", example: "Translate the English passage about a school trip into Urdu.", testing: "Meaning, grammar and natural Urdu expression." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  aos: [
    { code: "AO1", name: "Reading", weight: 35, plain: "Identify, select and understand information and ideas in Urdu texts." },
    { code: "AO2", name: "Writing", weight: 65, plain: "Communicate clearly and accurately in written Urdu, with a range of vocabulary and structures." },
  ],
  aoNote: "Writing carries almost two-thirds of the marks — daily writing practice pays off most.",

  grades: {
    scale: "A*, A, B, C, D, E. 'Ungraded' means below E and is not shown on the certificate.",
    thresholds: {
      series: "June 2026",
      max: 100,
      rows: [
        { grade: "A*", range: "88", pct: "88%" },
        { grade: "A", range: "77", pct: "77%" },
        { grade: "B", range: "66", pct: "66%" },
        { grade: "C", range: "55", pct: "55%" },
        { grade: "D", range: "44", pct: "44%" },
        { grade: "E", range: "34", pct: "34%" },
      ],
      note: "Minimum marks out of 100 in June 2026.",
    },
    meaning: "A strong Urdu grade helps students living abroad keep their language and connection with Pakistan.",
  },

  practicalTitle: "How to improve fast",
  practical: [
    "Read Urdu every day — news, stories, signs and messages.",
    "Keep a vocabulary notebook by topic: family, school, travel, health, technology.",
    "Practise translating short English paragraphs into Urdu.",
    "Learn grammar patterns: verb forms, gender agreement, postpositions.",
    "Write one short email or paragraph a day and ask your teacher to correct it.",
  ],

  books: [
    { title: "Urdu for Cambridge O Level", by: "Danesh Publications (2024)", note: "Endorsed for the syllabus from 2024." },
    { title: "Past papers and mark schemes", by: "Cambridge International", note: "Learn the exercise formats." },
  ],

  mistakes: [
    "Going over the word limit in the summary.",
    "Translating word-for-word so the Urdu sounds unnatural.",
    "Gender and number agreement errors.",
    "Ignoring the purpose and audience in the writing task.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Term 1", what: "Reading skills and vocabulary building; grammar review." },
    { when: "Term 2", what: "Note-making and summary writing." },
    { when: "Term 3", what: "Functional and extended writing." },
    { when: "Term 4", what: "Translation and grammar exercises in exam format." },
    { when: "Final months", what: "Timed past papers; daily reading and writing." },
  ],
  studyNote: "Cambridge designs the course for about 130 guided learning hours.",

  careers: {
    intro: "Urdu connects you to more than 200 million speakers and to Pakistan's culture.",
    paths: [
      { name: "Translation & interpreting", need: "Strong Urdu and English" },
      { name: "Media & journalism", need: "Urdu writing skills" },
      { name: "Teaching", need: "Urdu proficiency" },
      { name: "Business with Pakistan", need: "Practical Urdu" },
    ],
  },

  realWorld: [
    { title: "A language of poetry", text: "Urdu is the language of great poets such as Mirza Ghalib, Allama Iqbal and Faiz Ahmed Faiz." },
    { title: "Pakistan's national language", text: "Urdu is Pakistan's national language and a link between people from every province." },
    { title: "Urdu abroad", text: "For families in the Gulf, the UK and beyond, Urdu keeps children connected with grandparents, culture and faith." },
  ],

  faqs: [
    { q: "Is this the right Urdu for me?", a: "Second Language Urdu (3248) is for learners who have had contact with Urdu at school or in the community. If Urdu is your first language, look at First Language Urdu (3247)." },
    { q: "Can I use a dictionary?", a: "No — dictionaries may not be used." },
    { q: "When can I sit the exam?", a: "Every June and November." },
    { q: "Is the syllabus changing?", a: "The 2027–2029 syllabus has no significant changes that affect teaching." },
  ],

  sources: [
    { label: "Official syllabus 3248 for exams in 2024, 2025 and 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/634455-2024-2026-syllabus.pdf" },
    { label: "Official syllabus 3248 for exams in 2027, 2028 and 2029 (PDF)", url: "https://www.cambridgeinternational.org/Images/721465-2027-2029-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/762920-second-language-urdu-3248-june-2026-grade-threshold-table.pdf" },
  ],
};

export default urdu3248;
