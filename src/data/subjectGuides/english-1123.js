// Cambridge O Level English Language 1123 — student guide.
// Facts from the official syllabuses for exams in 2024–2026 and 2027–2028
// (Cambridge: "no significant changes"), and the June 2026 grade threshold
// table. See `sources`.

const english1123 = {
  slug: "english-1123",
  subject: "English Language",
  level: "O Level",
  code: "1123",
  title: "Cambridge O Level English Language (1123)",
  tagline:
    "Read between the lines, argue a point that convinces, tell a story people remember — English Language is the subject that makes you better at every other subject, every interview and every email you'll ever write.",
  syllabusYears: "2024–2026 and 2027–2028 (same papers)",
  verifiedOn: "18 October 2026",
  accent: "violet",
  sibling: { slug: "english-9093", label: "AS & A Level English Language (9093)" },

  quickFacts: [
    { label: "Syllabus code", value: "1123", note: "Cambridge O Level English Language" },
    { label: "Exams you sit", value: "2 papers", note: "Paper 1 Reading + Paper 2 Writing" },
    { label: "Total exam time", value: "4 hours", note: "2 hours each · 50 marks each" },
    { label: "Exam sessions", value: "June & November", note: "Every year" },
    { label: "Grades", value: "A* to E", note: "A* is the highest" },
    { label: "Teaching time", value: "about 130 hours", note: "Cambridge's guide" },
    { label: "Dictionaries", value: "Not allowed", note: "In either paper" },
    { label: "Marks split", value: "50% reading · 50% writing", note: "Equal weight" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. It helps you to:",
    points: [
      "Read a wide range of texts fluently, with understanding — and enjoy them.",
      "Read critically, and use what you read to improve your own writing.",
      "Write accurately and effectively in standard English.",
      "Analyse, evaluate and use information and ideas.",
      "Build a wide vocabulary and a real understanding of grammar.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Reading for meaning", topics: "Paper 1, Section A", story: "A story of about 900 words. Some answers are stated in the text (explicit), others you must work out from clues (implicit) — like a detective reading people's attitudes and feelings." },
    { title: "How writers create effects", topics: "Paper 1, Question 2", story: "Why does one word make a scene feel tense and another make it peaceful? You learn to explain how writers choose words to make readers feel something." },
    { title: "Summary: say more with less", topics: "Paper 1, Section B", story: "Pick out the key points from a 550–600 word text and write them as continuous writing of no more than 150 words. A skill every student, journalist and manager uses." },
    { title: "Writing with a purpose", topics: "Paper 2, Section A", story: "Turn information from one or two texts into a persuasive speech, email, report, letter or article of 250–350 words — matching your tone to your reader." },
    { title: "Your own voice", topics: "Paper 2, Section B", story: "A descriptive or narrative composition of 350–450 words. Paint a place so the reader can see it, or tell a story they can't stop reading." },
  ],

  topics: [
    { n: 1, name: "Paper 1, Q1 — Comprehension", parts: ["Explicit meanings", "Implicit meanings and attitudes"] },
    { n: 2, name: "Paper 1, Q2 — Use of language", parts: ["How writers achieve effects and influence readers"] },
    { n: 3, name: "Paper 1, Q3 — Summary and short response", parts: ["Summary in no more than 150 words", "Short response on implicit meaning"] },
    { n: 4, name: "Paper 2, Section A — Directed writing", parts: ["Speech, email, report, letter or article", "Discursive, argumentative or persuasive", "About 250–350 words"] },
    { n: 5, name: "Paper 2, Section B — Composition", parts: ["Choice of two descriptive and two narrative titles", "About 350–450 words"] },
  ],

  compare: {
    intro: "At AS & A Level (9093), English Language becomes the study of how language works.",
    cols: ["At O Level (this course)", "At AS & A Level English Language (9093)"],
    rows: [
      { idea: "Reading", here: "Comprehension, summary, writers' effects", next: "Analysing form, structure and language of many text types" },
      { idea: "Writing", here: "Directed writing and compositions", next: "Writing for specific audiences, with reflective commentaries on your own choices" },
      { idea: "New topics", here: "—", next: "Language change, how children learn to speak, English in the world, language and identity" },
      { idea: "Length", here: "250–450 words", next: "600–900 word extended writing" },
    ],
  },

  papers: [
    { name: "Paper 1 — Reading", time: "2 hours", marks: 50, weight: "50%", what: "Section A: comprehension and use of language on a ~900-word narrative text (25 marks). Section B: summary (no more than 150 words) and a short response on a 550–600 word text (25 marks).", who: "Everyone" },
    { name: "Paper 2 — Writing", time: "2 hours", marks: 50, weight: "50%", what: "Section A: one compulsory directed-writing task, about 250–350 words (25 marks). Section B: one composition from four titles (two descriptive, two narrative), about 350–450 words (25 marks).", who: "Everyone" },
  ],
  papersNote: "Both papers are marked by Cambridge. Dictionaries must not be used.",

  questionTypes: [
    { type: "Explicit meaning", example: "Give two reasons why the narrator went back to the village.", testing: "Finding information that is stated in the text." },
    { type: "Implicit meaning", example: "What does the phrase 'he kept his eyes on the floor' suggest about how the boy felt?", testing: "Inferring feelings and attitudes from clues." },
    { type: "Use of language", example: "Explain how the writer uses language to convey the danger of the storm.", testing: "Picking strong words and explaining their effect on the reader." },
    { type: "Summary", example: "Summarise the advantages of living in a big city, as described in the text. Write no more than 150 words.", testing: "Selecting the right points and writing them concisely as continuous prose." },
    { type: "Directed writing", example: "Write a speech for your school assembly persuading students to volunteer, using ideas from both texts.", testing: "Using and evaluating the texts, with the right tone for the audience." },
    { type: "Composition", example: "Describe a busy market at the moment it opens.  /  Write a story that begins: 'The message arrived at midnight…'", testing: "Vivid detail, structure, vocabulary and accuracy." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "Identify", meaning: "name/select/recognise", tip: "Pick it out of the text." },
    { word: "Explain", meaning: "set out purposes or reasons / make the relationships between things clear / say why and/or how and support with relevant evidence", tip: "Quote, then say why it works." },
    { word: "Describe", meaning: "state the points of a topic / give characteristics and main features", tip: "Give the main features clearly." },
    { word: "Summarise", meaning: "select and present the main points, without detail", tip: "Main points only, within the word limit." },
    { word: "Evaluate", meaning: "judge or calculate the quality, importance, amount, or value of something", tip: "In directed writing: judge the ideas, don't just copy them." },
    { word: "Consider", meaning: "review and respond to given information", tip: "Think about the text before you respond." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Reading", weight: 50, plain: "Explicit and implicit meanings; analysing ideas; how writers create effects; selecting information." },
    { code: "AO2", name: "Writing", weight: 50, plain: "Expressing ideas, organising them, vocabulary and sentences, register, and accurate spelling, punctuation and grammar." },
  ],
  aoNote: "Reading and writing count equally — and Paper 1's summary and Paper 2's directed writing test both at once.",

  grades: {
    scale: "A*, A, B, C, D, E. 'Ungraded' means below E and is not shown on the certificate.",
    thresholds: {
      series: "June 2026",
      max: 100,
      rows: [
        { grade: "A*", range: "80", pct: "80%" },
        { grade: "A", range: "72", pct: "72%" },
        { grade: "B", range: "64", pct: "64%" },
        { grade: "C", range: "56", pct: "56%" },
        { grade: "D", range: "50", pct: "50%" },
        { grade: "E", range: "44", pct: "44%" },
      ],
      note: "Minimum marks out of 100 in June 2026 (the same for both paper variants). Boundaries change every series.",
    },
    meaning: "Universities in Pakistan and abroad look closely at your English grade, and a strong grade can help with English-language entry requirements — check each university's rules.",
  },

  practicalTitle: "How to improve fast",
  practical: [
    "Read every day — newspapers, opinion columns, short stories. Good writers are first good readers.",
    "Keep a vocabulary notebook of precise, vivid words and use them in your own writing.",
    "Practise summaries against the clock and count your words.",
    "Plan every composition for 5 minutes: a clear structure beats a long one.",
    "Leave time to proofread — spelling, punctuation and grammar are marked in every writing task.",
  ],

  books: [
    { title: "Cambridge O Level English Language (2nd edition)", by: "Hachette Learning (2022)", note: "Endorsed for the syllabus from 2024." },
    { title: "English Language for Cambridge O Level (3rd edition)", by: "Cambridge (2022)", note: "Endorsed for the syllabus from 2024." },
    { title: "Past papers, inserts and mark schemes", by: "Cambridge International", note: "Practise with real texts — and study what top answers do." },
  ],
  booksNote: "Cambridge says textbooks endorsed for the syllabus from 2024 are still suitable for 2027–2028.",

  mistakes: [
    "Copying long stretches of the text instead of selecting and rephrasing the key points.",
    "Ignoring the summary word limit — Cambridge asks for no more than 150 words, so plan to fit.",
    "Naming a technique ('this is a simile') without explaining its effect.",
    "Directed writing that ignores the given texts or the audience.",
    "Compositions with no paragraphs, or a story that suddenly ends 'and it was all a dream'.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Term 1", what: "Comprehension skills: explicit and implicit meaning; building vocabulary." },
    { when: "Term 2", what: "Writers' effects and summary writing." },
    { when: "Term 3", what: "Directed writing: speeches, letters, reports, articles." },
    { when: "Term 4", what: "Descriptive and narrative compositions." },
    { when: "Final months", what: "Timed Paper 1 and Paper 2 practice every week; mark against the mark scheme; read daily." },
  ],
  studyNote: "Cambridge designs the course for about 130 guided learning hours. Daily reading makes the biggest difference.",

  careers: {
    intro: "Strong English opens every door — and some careers depend on it.",
    paths: [
      { name: "Law & civil services (CSS)", need: "Excellent written English" },
      { name: "Journalism, media & marketing", need: "Writing for different audiences" },
      { name: "Business & management", need: "Clear reports, emails and presentations" },
      { name: "Teaching & education", need: "English and communication skills" },
      { name: "Every university course", need: "Essays, reports and exams in English" },
    ],
  },

  realWorld: [
    { title: "Summary is a job skill", text: "Lawyers, doctors and managers turn long documents into short briefings every day — exactly Paper 1's summary task." },
    { title: "Persuasion everywhere", text: "Speeches, adverts and opinion columns use the techniques you study — and you learn to spot them." },
    { title: "Writers from Pakistan", text: "Writers such as Mohsin Hamid and Kamila Shamsie have reached readers worldwide in English — proof of how far good writing can travel." },
    { title: "Applications and interviews", text: "University personal statements, scholarship essays and job applications all reward clear, well-structured English." },
  ],

  faqs: [
    { q: "Can I use a dictionary?", a: "No — dictionaries must not be used in either paper." },
    { q: "Is there a literature or set-text part?", a: "No. Both papers use unseen texts printed in the exam. O Level English Language is about reading and writing skills, not set books." },
    { q: "How long should my composition be?", a: "About 350–450 words. Directed writing is about 250–350 words, and the summary must be no more than 150 words." },
    { q: "Is O Level 1123 the same as IGCSE First Language English 0500?", a: "No. They are separate Cambridge syllabuses with different papers. This guide is for O Level 1123." },
    { q: "Is the syllabus changing?", a: "The 2027–2028 syllabus has no significant changes that affect teaching." },
  ],

  sources: [
    { label: "Official syllabus 1123 for exams in 2024, 2025 and 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/634453-2024-2026-syllabus.pdf" },
    { label: "Official syllabus 1123 for exams in 2027 and 2028 (PDF)", url: "https://www.cambridgeinternational.org/Images/721416-2027-2028-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/762903-english-language-1123-june-2026-grade-threshold-table.pdf" },
    { label: "Endorsed resources for 1123", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-english-language-1123/endorsed-resources/" },
  ],
};

export default english1123;
