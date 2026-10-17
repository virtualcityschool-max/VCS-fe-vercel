// Cambridge O Level Islamiyat 2058 — student guide.
// Facts from the official syllabus for exams in 2026 and 2027 and the 2028
// syllabus (Cambridge: reformatted, "no changes to the content or assessment"),
// and the June 2026 grade threshold table. See `sources`.

const islamiyat2058 = {
  slug: "islamiyat-2058",
  subject: "Islamiyat",
  level: "O Level",
  code: "2058",
  title: "Cambridge O Level Islamiyat (2058)",
  tagline:
    "The Qur'an, the life of the Prophet (pbuh), the Hadiths, the Rightly Guided Caliphs and the beliefs and practices of Islam — studied closely, with understanding of why they matter in Muslims' lives today.",
  syllabusYears: "2026–2027 and 2028 (same content and papers)",
  verifiedOn: "18 October 2026",
  accent: "emerald",

  quickFacts: [
    { label: "Syllabus code", value: "2058", note: "Cambridge O Level Islamiyat" },
    { label: "Exams you sit", value: "2 papers", note: "Both must be taken for a grade" },
    { label: "Total exam time", value: "3 hours", note: "1 h 30 min each · 50 marks each" },
    { label: "Answers in", value: "English", note: "Qur'an and Hadith passages are set in Arabic and English" },
    { label: "Exam sessions", value: "June & November", note: "Check availability for your exam centre" },
    { label: "Grades", value: "A* to E", note: "A* is the highest" },
    { label: "Teaching time", value: "about 130 hours", note: "Cambridge's guide" },
    { label: "Prior study", value: "Not needed", note: "No earlier Islamiyat or Islamic Studies expected" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. It helps you to:",
    points: [
      "Know the major sources of Islam, its main beliefs and its early history.",
      "Develop an enquiring approach to the study of Islam.",
      "Explore the religious, historical and moral questions raised by what you study.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "The Qur'an", topics: "Paper 1, Questions 1–2", story: "Set passages grouped around three themes — God in himself, God's relationship with the created world, and God's Messengers — studied in English with reference to the Arabic. Then the history of the revelation (610–632), its compilation under the Rightly Guided Caliphs, and its place in Islamic law alongside the Hadiths, ijma' and qiyas." },
    { title: "The life of the Prophet (pbuh)", topics: "Paper 1", story: "From his birth and call to prophethood, through Makka and Madina, to his character and actions — and why they are an example for Muslim individuals and communities today." },
    { title: "The first Islamic community", topics: "Paper 1", story: "The Prophet's wives and descendants, his leading Companions including the Ten Blessed Companions, his Scribes, the Emigrants and Helpers — who they were and why they matter." },
    { title: "The Hadiths", topics: "Paper 2, Questions 1–2", story: "Set Hadiths on individual conduct and life in the community, then how the Hadiths were compiled, the main collections, and how scholars tested reliability through the isnad and matn." },
    { title: "The Rightly Guided Caliphs", topics: "Paper 2", story: "The rules of the four Caliphs: their policies, leadership, achievements and difficulties — and their significance as examples of leadership." },
    { title: "Beliefs and practices", topics: "Paper 2", story: "The Six Articles of Faith, the Five Pillars of Islam, and Jihad in its range of meanings — physical, mental and spiritual." },
  ],

  topicGroups: [
    {
      label: "Paper 1",
      groups: [
        { area: "Paper 1 topics", topics: [[1, "Major themes of the Qur'an (set passages)"], [2, "The history and importance of the Qur'an"], [3, "The life and importance of the Prophet Muhammad (pbuh)"], [4, "The first Islamic community"]] },
      ],
    },
    {
      label: "Paper 2",
      groups: [
        { area: "Paper 2 topics", topics: [[1, "Major teachings in the Hadiths of the Prophet (set passages)"], [2, "The history and importance of the Hadiths"], [3, "The period of rule of the Rightly Guided Caliphs and their importance as leaders"], [4, "The Articles of Faith and the Pillars of Islam"]] },
      ],
    },
  ],

  papers: [
    { name: "Paper 1", time: "1 hour 30 minutes", marks: 50, weight: "50%", what: "Five questions; answer Question 1, Question 2 and two others. Q1: two of three set Qur'an passages (8 marks). Q2: history and importance of the Qur'an (14 marks). Other questions: the Prophet's life and the first Islamic community (14 marks each).", who: "Everyone" },
    { name: "Paper 2", time: "1 hour 30 minutes", marks: 50, weight: "50%", what: "Five questions; answer Question 1, Question 2 and two others. Q1: two of four set Hadiths (8 marks). Q2: history and importance of the Hadiths (14 marks). Other questions: the Rightly Guided Caliphs and the Articles of Faith and Pillars of Islam (14 marks each).", who: "Everyone" },
  ],
  papersNote: "Both papers are marked by Cambridge and answered in English. The set passages are listed in the syllabus appendices and are reviewed periodically — always use the list for your exam year.",

  questionTypes: [
    { type: "Set passage (Q1)", example: "Describe the main theme of this passage and explain its importance in the lives of Muslims today.", testing: "Knowing the set passages well and linking them to everyday life." },
    { type: "Essay — describe (part a)", example: "Write an account of the events of the Prophet's (pbuh) migration to Madina.", testing: "Accurate, well-organised factual knowledge (AO1)." },
    { type: "Essay — evaluate (part b)", example: "Why is the compilation of the Qur'an important to Muslims today?", testing: "Understanding significance and giving reasoned points (AO2)." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  aos: [
    { code: "AO1", name: "Recall, select and present", weight: 68, plain: "Relevant facts from the main elements of the faith and history of Islam." },
    { code: "AO2", name: "Understanding", weight: 32, plain: "The significance of those facts in the teachings of Islam and in Muslims' lives." },
  ],
  aoNote: "About two-thirds of the marks reward accurate, detailed knowledge; a third rewards explaining why it matters.",

  grades: {
    scale: "A*, A, B, C, D, E. 'Ungraded' means below E and is not shown on the certificate.",
    thresholds: {
      series: "June 2026",
      max: 100,
      rows: [
        { grade: "A*", range: "68", pct: "68%" },
        { grade: "A", range: "59–60", pct: "about 59–60%" },
        { grade: "B", range: "50–52", pct: "about 50–52%" },
        { grade: "C", range: "41–44", pct: "about 41–44%" },
        { grade: "D", range: "35–36", pct: "about 35–36%" },
        { grade: "E", range: "29", pct: "29%" },
      ],
      note: "Minimum marks out of 100 in June 2026 (the range covers the two paper variants).",
    },
    meaning: "Islamiyat is a compulsory O Level subject for many students in Pakistan and a widely taken subject in the Gulf.",
  },

  practicalTitle: "How to score well",
  practical: [
    "Learn every set Qur'an passage and Hadith for your exam year — their themes and how they apply to life today.",
    "For essay questions, give accurate detail: names, places, dates and events in order.",
    "Separate 'describe' (facts) from 'why is it important' (significance) — both earn marks.",
    "Use your four 14-mark answers to show depth: plan before writing.",
    "Practise timing: about 22 minutes per question in each 1 hour 30 minute paper.",
  ],

  books: [
    { title: "The official syllabus with Appendix 1 (Qur'an passages) and Appendix 2 (Hadiths)", by: "Cambridge International", note: "The exact passages you will be examined on." },
    { title: "Textbooks endorsed for Cambridge IGCSE Islamiyat", by: "Various publishers", note: "The syllabus says these are suitable for O Level 2058." },
    { title: "Past papers and mark schemes", by: "Cambridge International", note: "Show how marks are split between facts and significance." },
  ],

  mistakes: [
    "Writing only facts when the question asks about importance or significance.",
    "Mixing up events of the Makkan and Madinan periods.",
    "Not knowing the set passages for the correct exam year.",
    "Spending too long on one question and rushing the last.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Term 1", what: "Qur'an set passages and the history of the Qur'an." },
    { when: "Term 2", what: "Life of the Prophet (pbuh) and the first Islamic community." },
    { when: "Term 3", what: "Hadith set passages and the history of the Hadiths." },
    { when: "Term 4", what: "The Rightly Guided Caliphs; the Articles of Faith and the Pillars of Islam." },
    { when: "Final months", what: "Timed past papers; flashcards for set passages; essay plans for every topic." },
  ],
  studyNote: "Cambridge designs the course for about 130 guided learning hours.",

  careers: {
    intro: "Islamiyat builds knowledge, writing and analytical skills valued in many fields.",
    paths: [
      { name: "Islamic studies, theology & education", need: "Islamiyat foundation" },
      { name: "Law & Sharia studies", need: "Understanding sources and legal thinking" },
      { name: "Civil services (CSS) & public service", need: "Islamic studies features in many public exams" },
      { name: "History, humanities & social sciences", need: "Essay and analysis skills" },
    ],
  },

  realWorld: [
    { title: "Sources of Islamic law", text: "The syllabus explains how the Qur'an, Hadiths, ijma' (consensus) and qiyas (analogy) work together in Islamic legal thinking." },
    { title: "Testing a Hadith", text: "Scholars examined the chain of narrators (isnad) and the text (matn) to judge reliability — an early, careful method of checking sources." },
    { title: "Leadership lessons", text: "The rules of the Rightly Guided Caliphs are studied as examples of leadership and government." },
  ],

  faqs: [
    { q: "Do I need to have studied Islamiyat before?", a: "No — Cambridge does not expect previous study of Islamiyat, Islamic Studies or Religious Studies." },
    { q: "Do I answer in Arabic?", a: "No. All answers are in English. Passages are printed in both Arabic and English, and you should know the original as well as the translation." },
    { q: "How many questions do I answer?", a: "Four in each paper: Questions 1 and 2, plus two others from the remaining three." },
    { q: "Is the 2028 syllabus different?", a: "Cambridge says the 2028 syllabus is reformatted with no changes to the content or assessment. Always check the set passages for your exam year." },
  ],

  sources: [
    { label: "Official syllabus 2058 for exams in 2026 and 2027 (PDF)", url: "https://www.cambridgeinternational.org/Images/697279-2026-2027-syllabus.pdf" },
    { label: "Official syllabus 2058 for exams in 2028 (PDF)", url: "https://www.cambridgeinternational.org/Images/744846-2028-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/762915-islamiyat-2058-june-2026-grade-threshold-table.pdf" },
  ],
};

export default islamiyat2058;
