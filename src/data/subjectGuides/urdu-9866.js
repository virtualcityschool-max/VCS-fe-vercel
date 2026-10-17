// Cambridge International A Level Urdu Language & Literature 9866 (for centres
// in Pakistan) — student guide. Replaces A Level Urdu 9686 (last series
// November 2026); first exams 2027. Facts from the official syllabus for
// 2027–2029 (version 2, August 2025). No grade thresholds exist yet.

const urdu9866 = {
  slug: "urdu-9866",
  subject: "Urdu Language & Literature",
  level: "AS & A Level",
  code: "9866",
  // VCS still has courses titled with the old code; send them here.
  aliases: ["9686"],
  title: "Cambridge International A Level Urdu Language & Literature (9866)",
  tagline:
    "Advanced reading, confident writing and the great works of Urdu literature — the new A Level Urdu that replaces 9686 from 2027.",
  syllabusYears: "2027, 2028 and 2029",
  verifiedOn: "18 October 2026",
  accent: "rose",
  sibling: { slug: "urdu-3247", label: "O Level First Language Urdu (3247)" },

  notice: "This syllabus replaces Cambridge A Level Urdu (9686), whose last exam series is November 2026. Students sitting A Level Urdu from 2027 take Urdu Language & Literature (9866), offered to centres in Pakistan.",

  quickFacts: [
    { label: "Syllabus code", value: "9866", note: "A Level Urdu Language & Literature — for centres in Pakistan" },
    { label: "Replaces", value: "9686", note: "Last 9686 exams: November 2026" },
    { label: "First exams", value: "2027", note: "June and November series" },
    { label: "Exams you sit", value: "3 papers", note: "Reading + Writing + Literature, in the same series" },
    { label: "Total exam time", value: "5 h 30 min", note: "1 h 30 min + 2 h + 2 h · 40 marks each" },
    { label: "Grades", value: "A* to E", note: "Full A Level only" },
    { label: "Language level", value: "B2–C1 (CEFR)", note: "Start at about B1" },
    { label: "Teaching time", value: "about 360 hours", note: "Cambridge's guide" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. It helps you to:",
    points: [
      "Communicate effectively in Urdu at an advanced level (CEFR B2–C1).",
      "Explore and engage with the culture, society and literature of Urdu-speaking communities.",
      "Enjoy intellectual challenge and keep wanting to learn more.",
      "Develop intercultural awareness and an open approach to other languages and cultures.",
      "Build skills for higher education, work and life — communication, organisation, independence.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Reading", topics: "Paper 1", story: "Read a range of texts and answer multiple-choice and matching questions — understanding detail, opinion and the meaning of new words from context." },
    { title: "Writing", topics: "Paper 2", story: "Two essays of 300–400 words: one argumentative or discursive, one descriptive or narrative." },
    { title: "Literature", topics: "Paper 3", story: "Two questions on set texts: a passage-based question and an essay — responding personally and critically to Urdu literature." },
  ],

  topics: [
    { n: 1, name: "Paper 1 — Reading", parts: ["Multiple-choice and matching questions on several texts"] },
    { n: 2, name: "Paper 2 — Writing", parts: ["Argumentative/discursive essay (300–400 words)", "Descriptive or narrative essay (300–400 words)"] },
    { n: 3, name: "Paper 3 — Literature", parts: ["Section A: passage-based question on a set text", "Section B: essay question on a set text"] },
  ],

  papers: [
    { name: "Paper 1 — Reading", time: "1 hour 30 minutes", marks: 40, weight: "about 33%", what: "Read a number of texts and answer multiple-choice and matching questions.", who: "Everyone" },
    { name: "Paper 2 — Writing", time: "2 hours", marks: 40, weight: "about 33%", what: "Two writing tasks: one argumentative/discursive and one narrative or descriptive essay (300–400 words each).", who: "Everyone" },
    { name: "Paper 3 — Literature", time: "2 hours", marks: 40, weight: "about 33%", what: "Two questions, one from each section: Section A passage-based, Section B essay.", who: "Everyone" },
  ],
  papersNote: "All components are taken in the same exam series and marked by Cambridge. Dictionaries are not allowed. In Paper 3 you may take clean copies of the set texts (no notes, highlighting or underlining) into the exam room.",

  aos: [
    { code: "AO1", name: "Reading", weight: "c.33", bar: 33, plain: "Understanding a range of written texts." },
    { code: "AO2", name: "Writing", weight: "c.33", bar: 33, plain: "Writing accurately and effectively for different purposes." },
    { code: "AO3", name: "Literature", weight: "c.33", bar: 33, plain: "Critical, personal response to set literary texts." },
  ],
  aoNote: "Reading, writing and literature count about equally.",

  practicalTitle: "How to prepare",
  practical: [
    "Read set texts several times; you may take clean copies into Paper 3, but you must know them well.",
    "Practise both essay types under timed conditions (300–400 words each).",
    "Build advanced vocabulary and idioms; learn to work out new words from context.",
    "Read quality Urdu journalism and essays to strengthen Paper 1 skills.",
    "Check the set-text list for your exam year — set texts rotate.",
  ],

  books: [
    { title: "The official 9866 syllabus — set texts list", by: "Cambridge International", note: "Set texts may change between exam years." },
    { title: "Specimen papers", by: "Cambridge International", note: "Example Candidate Responses follow after the first exams in 2027." },
  ],

  mistakes: [
    "Using the old 9686 materials without checking the new 9866 format.",
    "Writing outside the 300–400 word range.",
    "Retelling a literary text instead of analysing it.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Year 1", what: "Advanced reading and both essay types; begin set texts." },
    { when: "Year 2", what: "Literature in depth (passage-based and essay questions); timed practice for all three papers." },
    { when: "Final months", what: "Specimen and past-paper practice; set-text revision." },
  ],
  studyNote: "Cambridge designs A Level courses for about 360 guided learning hours.",

  careers: {
    intro: "Advanced Urdu is valuable across Pakistan's public and creative life.",
    paths: [
      { name: "Journalism, broadcasting & media", need: "Advanced Urdu writing" },
      { name: "Teaching & literature", need: "Literary study" },
      { name: "Civil services & law", need: "Formal Urdu" },
      { name: "Translation & publishing", need: "Urdu and English" },
    ],
  },

  realWorld: [
    { title: "A living literature", text: "From Ghalib's ghazals to Iqbal's poetry and modern Urdu fiction, the literature paper connects you with a rich tradition." },
    { title: "International benchmark", text: "Cambridge aligns this syllabus to CEFR levels B2–C1 — a recognised international standard of language ability." },
  ],

  faqs: [
    { q: "What happened to A Level Urdu 9686?", a: "Cambridge is replacing it with 9866. The last 9686 exams are in November 2026; from 2027 students take 9866." },
    { q: "Is there an AS Level?", a: "No — 9866 is a full A Level, and all three papers are taken in the same series." },
    { q: "What level of Urdu do I need?", a: "Cambridge recommends having completed IGCSE or O Level Urdu, working at least at CEFR level B1." },
    { q: "Are there grade boundaries yet?", a: "Not yet — the first exams are in 2027." },
    { q: "What about AS Urdu Language (8686)?", a: "Cambridge's last June series for 8686 was June 2026; from 2027 it is offered only in November, to centres in Mauritius." },
  ],

  sources: [
    { label: "Official syllabus 9866 for exams in 2027, 2028 and 2029 (PDF)", url: "https://www.cambridgeinternational.org/Images/719330-2027-2029-syllabus.pdf" },
    { label: "Syllabus update, version 2 (PDF)", url: "https://www.cambridgeinternational.org/Images/741529-2027-2029-syllabus-update.pdf" },
    { label: "Cambridge 9866 subject page", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-urdu-language-literature-9866/" },
  ],
};

export default urdu9866;
