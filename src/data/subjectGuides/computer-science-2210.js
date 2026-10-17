// Cambridge O Level Computer Science 2210 — student guide.
// Facts from the official syllabus for exams in 2026, 2027 and 2028 (version 6,
// September 2026) and the June 2026 grade threshold table. See `sources`.

const computerScience2210 = {
  slug: "computer-science-2210",
  subject: "Computer Science",
  level: "O Level",
  code: "2210",
  title: "Cambridge O Level Computer Science (2210)",
  tagline:
    "How a photo becomes ones and zeros, how a message crosses the world in milliseconds, how to make a computer solve your problem — Computer Science teaches you to think like a programmer.",
  syllabusYears: "2026, 2027 and 2028",
  verifiedOn: "18 October 2026",
  accent: "cyan",
  sibling: { slug: "computer-science-9618", label: "AS & A Level Computer Science (9618)" },

  quickFacts: [
    { label: "Syllabus code", value: "2210", note: "Cambridge O Level Computer Science" },
    { label: "Exams you sit", value: "2 papers", note: "Computer Systems + Algorithms, Programming and Logic" },
    { label: "Total exam time", value: "3 h 30 min", note: "1 h 45 min each · 75 marks each" },
    { label: "Exam sessions", value: "June & November", note: "Every year" },
    { label: "Grades", value: "A* to E", note: "A* is the highest" },
    { label: "Teaching time", value: "about 130 hours", note: "Cambridge's guide" },
    { label: "Calculator", value: "Not allowed", note: "In either paper" },
    { label: "Languages", value: "Python, Visual Basic or Java", note: "Or pseudocode, in the 15-mark scenario question" },
  ],

  why: {
    intro: "Cambridge's aims for this course, in plain words. You will develop:",
    points: [
      "Computational thinking — breaking problems into steps a computer can follow.",
      "The main principles of solving problems with computers.",
      "The skills to solve problems in a high-level programming language.",
      "An understanding of how the parts of a computer system work together.",
      "An understanding of the internet, how we communicate on it, and its risks.",
      "An understanding of automated and emerging technologies such as robotics and AI.",
    ],
    source: "Based on the 'Aims' in the official syllabus.",
  },

  stories: [
    { title: "Everything is data", topics: "Topic 1", story: "Numbers, text, sound and images all become binary. You learn binary and hexadecimal, how a photo's file size is worked out, and how compression makes it smaller." },
    { title: "Data on the move", topics: "Topics 2 and 5", story: "How data travels in packets, how errors are detected, why encryption keeps your bank details safe — and how the internet, the web and cyber threats really work." },
    { title: "Inside the machine", topics: "Topics 3–4", story: "The CPU's fetch–decode–execute cycle, memory and storage, input and output devices, operating systems and interrupts — what actually happens when you click." },
    { title: "Robots and AI", topics: "Topic 6", story: "Automated systems, robotics and artificial intelligence — where they are used and what they can and cannot do." },
    { title: "Thinking like a programmer", topics: "Topics 7–8", story: "Design algorithms with flowcharts and pseudocode, then write real programs with variables, loops, arrays, procedures and files. You must practise programming to do well." },
    { title: "Databases and logic", topics: "Topics 9–10", story: "Store and query data with simple SQL, and build logic circuits from AND, OR and NOT gates — the building blocks of every processor." },
  ],

  topics: [
    { n: 1, name: "Data representation", parts: ["Number systems", "Text, sound and images", "Data storage and compression"] },
    { n: 2, name: "Data transmission", parts: ["Types and methods of data transmission", "Methods of error detection", "Encryption"] },
    { n: 3, name: "Hardware", parts: ["Computer architecture", "Input and output devices", "Data storage", "Network hardware"] },
    { n: 4, name: "Software", parts: ["Types of software and interrupts", "Types of programming language, translators and IDEs"] },
    { n: 5, name: "The internet and its uses", parts: ["The internet and the world wide web", "Digital currency", "Cyber security"] },
    { n: 6, name: "Automated and emerging technologies", parts: ["Automated systems", "Robotics", "Artificial intelligence"] },
    { n: 7, name: "Algorithm design and problem-solving", parts: [] },
    { n: 8, name: "Programming", parts: ["Programming concepts", "Arrays", "File handling"] },
    { n: 9, name: "Databases", parts: [] },
    { n: 10, name: "Boolean logic", parts: [] },
  ],

  compare: {
    intro: "O Level gives you the foundations; A Level (9618) goes deeper and adds a practical programming exam on a computer.",
    rows: [
      { idea: "Data", here: "Binary, hex, file sizes, compression", next: "Two's complement, floating-point numbers, user-defined data types" },
      { idea: "Hardware", here: "CPU, memory, fetch–decode–execute", next: "Assembly language, parallel processing, virtual machines, Boolean algebra" },
      { idea: "Programming", here: "Pseudocode and one language; arrays and files", next: "Abstract data types, recursion, object-oriented programming, exceptions" },
      { idea: "Networks & security", here: "Packets, encryption, cyber threats", next: "Protocols, circuit and packet switching, digital certificates" },
      { idea: "AI", here: "What AI is and where it's used", next: "Graphs and machine learning in Artificial Intelligence" },
    ],
  },

  papers: [
    { name: "Paper 1 — Computer Systems", time: "1 hour 45 minutes", marks: 75, weight: "50%", what: "Short-answer and structured questions on Topics 1–6. All questions compulsory. No calculator.", who: "Everyone" },
    { name: "Paper 2 — Algorithms, Programming and Logic", time: "1 hour 45 minutes", marks: 75, weight: "50%", what: "Short-answer and structured questions plus a 15-mark scenario question on Topics 7–10. No calculator.", who: "Everyone" },
  ],
  papersNote: "Both papers are marked by Cambridge. In the 15-mark scenario question you may write pseudocode or use Python, Visual Basic or Java — solutions in other languages get no marks.",

  questionTypes: [
    { type: "Number conversion (Paper 1)", example: "Convert the denary number 179 into binary and into hexadecimal.", testing: "Accurate working without a calculator." },
    { type: "Explain (Paper 1)", example: "Explain how a parity check can detect an error in transmitted data.", testing: "Clear steps and correct technical terms." },
    { type: "Trace table (Paper 2)", example: "Complete the trace table for the algorithm using the input data given.", testing: "Following an algorithm exactly, line by line." },
    { type: "Write an algorithm (Paper 2)", example: "Write pseudocode to input 20 marks, store them in an array and output the highest and the average.", testing: "Loops, arrays, variables and clear logic." },
    { type: "Scenario question (Paper 2, 15 marks)", example: "A school needs a program to manage library loans… Write the program.", testing: "A full solution in pseudocode, Python, Visual Basic or Java." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "State", meaning: "express in clear terms", tip: "Short, precise answer." },
    { word: "Describe", meaning: "state the points of a topic / give characteristics and main features", tip: "Say what happens, step by step." },
    { word: "Explain", meaning: "set out purposes or reasons / make the relationships between things clear / say why and/or how and support with relevant evidence", tip: "Say why or how." },
    { word: "Identify", meaning: "name/select/recognise", tip: "Name it — no explanation needed." },
    { word: "Compare", meaning: "identify/comment on similarities and/or differences", tip: "Mention both things in each point." },
    { word: "Evaluate", meaning: "judge or calculate the quality, importance, amount, or value of something", tip: "Weigh up, then judge." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Knowledge and understanding", weight: 40, plain: "Principles and concepts of computer science." },
    { code: "AO2", name: "Application", weight: 40, plain: "Applying them to a context, including analysing and designing programs." },
    { code: "AO3", name: "Problem-solving and evaluation", weight: 20, plain: "Evaluating computer systems, making reasoned judgements and presenting conclusions." },
  ],
  aoNote: "60% of the marks are for applying and evaluating — you cannot pass well without real programming practice.",

  grades: {
    scale: "A*, A, B, C, D, E. 'Ungraded' means below E and is not shown on the certificate.",
    thresholds: {
      series: "June 2026",
      max: 150,
      rows: [
        { grade: "A*", range: "117–120", pct: "about 78–80%" },
        { grade: "A", range: "93–94", pct: "about 62–63%" },
        { grade: "B", range: "68–69", pct: "about 45–46%" },
        { grade: "C", range: "43–46", pct: "about 29–31%" },
        { grade: "D", range: "36–39", pct: "about 24–26%" },
        { grade: "E", range: "29–32", pct: "about 19–21%" },
      ],
      note: "Minimum marks out of 150 in June 2026 (the range covers the two paper variants).",
    },
    meaning: "A strong grade is a great start for A Level Computer Science, engineering and software careers.",
  },

  practicalTitle: "Programming practice",
  practical: [
    "Cambridge says Computer Science is a practical subject and the questions need real programming experience — code every week.",
    "Pick one language (Python, Visual Basic or Java) and stick with it; learn the exam pseudocode format too.",
    "Practise trace tables until you never skip a line.",
    "Learn the standard algorithms: linear search, bubble sort, totalling, counting, finding max/min/average.",
    "Practise binary, hex and logic-gate questions without a calculator.",
  ],

  books: [
    { title: "Cambridge IGCSE & O Level Computer Science Coursebook (2nd edition)", by: "Cambridge University Press (2021)", note: "Endorsed for the syllabus from 2023." },
    { title: "Cambridge IGCSE & O Level Computer Science Student's Book (2nd edition)", by: "Hachette Learning (2021)", note: "Endorsed for the syllabus from 2023." },
    { title: "Cambridge IGCSE & O Level Computer Science Student's Book", by: "Marshall Cavendish Education (2021)", note: "Endorsed for the syllabus from 2023." },
    { title: "The official syllabus — including the pseudocode section", by: "Cambridge International", note: "Shows exactly how pseudocode appears in the exam." },
  ],
  booksNote: "The syllabus says textbooks endorsed for IGCSE Computer Science (0478) are suitable for this course.",

  mistakes: [
    "Writing code in a language other than Python, Visual Basic, Java or pseudocode in the scenario question — it gets no marks.",
    "Off-by-one errors in loops and array indexes.",
    "Not initialising totals or counters before a loop.",
    "Vague answers like 'it's faster' with no explanation of why.",
    "Skipping rows in trace tables.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Term 1", what: "Data representation and transmission (1–2); start programming basics in your chosen language." },
    { when: "Term 2", what: "Hardware and software (3–4); algorithms, flowcharts and pseudocode (7)." },
    { when: "Term 3", what: "Internet, cyber security, emerging tech (5–6); programming: arrays, procedures, files (8)." },
    { when: "Term 4", what: "Databases and Boolean logic (9–10); scenario-question practice." },
    { when: "Final months", what: "Timed past papers; one scenario question every week; daily coding." },
  ],
  studyNote: "Cambridge designs the course for about 130 guided learning hours — plus regular hands-on programming.",

  careers: {
    intro: "Computer science skills are wanted in almost every industry.",
    paths: [
      { name: "Software engineering & app development", need: "A Level Computer Science + Maths" },
      { name: "Data science & AI", need: "A Level Maths (+ Computer Science)" },
      { name: "Cyber security", need: "Computer Science" },
      { name: "Game development & design", need: "Computer Science + Maths" },
      { name: "Freelancing & IT services", need: "Programming skills and a portfolio" },
    ],
  },

  realWorld: [
    { title: "Al-Khwarizmi and the 'algorithm'", text: "The word 'algorithm' comes from the name of the 9th-century mathematician al-Khwarizmi — Topic 7 is named after his legacy." },
    { title: "Arfa Karim (1995–2012)", text: "The Pakistani student became one of the youngest Microsoft Certified Professionals at the age of nine — a reminder of how far curiosity can go." },
    { title: "Encryption every day", text: "The padlock in your browser means your data is encrypted — the ideas you learn in Topic 2." },
    { title: "Digital currency", text: "The syllabus asks you to understand digital currency and how its records are kept secure (Topic 5)." },
  ],

  faqs: [
    { q: "Which programming language should I learn?", a: "Python, Visual Basic or Java — the only languages (besides pseudocode) accepted in the scenario question. Python is a popular first choice." },
    { q: "Is there a practical exam?", a: "No, both O Level papers are written. But Cambridge says the questions require practical programming experience." },
    { q: "Calculator?", a: "Not allowed in either paper." },
    { q: "Is O Level 2210 the same as IGCSE Computer Science 0478?", a: "They are separate syllabuses that share content — Cambridge says IGCSE-endorsed books suit both." },
    { q: "When can I sit the exam?", a: "Every June and November." },
  ],

  sources: [
    { label: "Official syllabus 2210 for exams in 2026, 2027 and 2028 (PDF)", url: "https://www.cambridgeinternational.org/Images/697287-2026-2028-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/762901-computer-science-2210-june-2026-grade-threshold-table.pdf" },
    { label: "Endorsed resources for 2210", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-computer-science-2210/endorsed-resources/" },
  ],
};

export default computerScience2210;
