// Cambridge International AS & A Level Computer Science 9618 — student guide.
// Facts from the official syllabuses for exams in 2026 and in 2027–2029
// (version 2: "no significant changes which affect teaching") and the June 2026
// grade threshold table. See `sources`.

const computerScience9618 = {
  slug: "computer-science-9618",
  subject: "Computer Science",
  level: "AS & A Level",
  code: "9618",
  title: "Cambridge International AS & A Level Computer Science (9618)",
  tagline:
    "From logic gates to artificial intelligence, from assembly language to object-oriented programs — A Level Computer Science teaches you how computers really work and how to make them do remarkable things.",
  syllabusYears: "2026 and 2027–2029 (same papers)",
  verifiedOn: "18 October 2026",
  accent: "cyan",
  sibling: { slug: "computer-science-2210", label: "O Level Computer Science (2210)" },

  quickFacts: [
    { label: "Syllabus code", value: "9618", note: "Cambridge International AS & A Level Computer Science" },
    { label: "AS Level", value: "Papers 1 + 2", note: "3 h 30 min · grades a–e" },
    { label: "Full A Level", value: "Papers 1–4", note: "7 h 30 min · grades A*–E" },
    { label: "Exam sessions", value: "June & November", note: "Every year" },
    { label: "Practical exam", value: "Paper 4 on a computer", note: "Java, Visual Basic (.NET) or Python — console mode" },
    { label: "Calculator", value: "Not allowed", note: "In any paper" },
    { label: "Teaching time", value: "about 180 h (AS) · 360 h (A Level)", note: "Cambridge's guide" },
    { label: "Topics", value: "20", note: "12 at AS Level + 8 more for A Level" },
  ],

  why: {
    intro: "Cambridge designs 9618 so that you can:",
    points: [
      "Understand the principles of computer science — abstraction, logic, algorithms and data representation.",
      "Analyse problems in computational terms.",
      "Design, program and test solutions — and evaluate them with reasoned judgements.",
      "Think creatively through practical programming.",
      "Move on confidently to a computing, engineering or data-science degree.",
    ],
    source: "Based on the syllabus overview and assessment objectives.",
  },

  stories: [
    { title: "How computers represent and move data", topics: "AS 1–2, A Level 13–14", story: "Binary, two's complement, multimedia and compression, then floating-point numbers. Networks, the internet, protocols and packet switching — how a video call reaches you." },
    { title: "Hardware down to the gates", topics: "AS 3–4, A Level 15", story: "Logic gates and circuits, the CPU and assembly language, then Boolean algebra, RISC processors, parallel processing and virtual machines." },
    { title: "Software, security and ethics", topics: "AS 5–7, A Level 16–17", story: "Operating systems and translators, data security and integrity, ethics and ownership — then encryption protocols and digital certificates that keep the internet trustworthy." },
    { title: "Databases", topics: "AS 8", story: "Design relational databases and use SQL to define and query them — how every app stores its users and data." },
    { title: "Problem-solving and programming", topics: "AS 9–12, A Level 19–20", story: "Algorithms, data structures and the program development life cycle at AS; then recursion, stacks, queues, linked lists, binary trees, object-oriented and other programming paradigms, and exception handling." },
    { title: "Artificial intelligence", topics: "A Level 18", story: "Graphs, A* and Dijkstra's algorithms, and the categories of machine learning, including deep learning — the ideas behind route-finding apps and modern AI." },
  ],

  topicGroups: [
    {
      label: "AS Level",
      groups: [
        { area: "Theory (Paper 1)", topics: [[1, "Information representation"], [2, "Communication"], [3, "Hardware"], [4, "Processor Fundamentals"], [5, "System Software"], [6, "Security, privacy and data integrity"], [7, "Ethics and Ownership"], [8, "Databases"]] },
        { area: "Problem-solving and programming (Paper 2)", topics: [[9, "Algorithm Design and Problem-solving"], [10, "Data Types and Structures"], [11, "Programming"], [12, "Software Development"]] },
      ],
    },
    {
      label: "A Level (adds)",
      groups: [
        { area: "Advanced theory (Paper 3)", topics: [[13, "Data Representation"], [14, "Communication and internet technologies"], [15, "Hardware and Virtual Machines"], [16, "System Software"], [17, "Security"], [18, "Artificial Intelligence (AI)"]] },
        { area: "Advanced programming (Papers 3 and 4)", topics: [[19, "Computational thinking and Problem-solving"], [20, "Further Programming"]] },
      ],
    },
  ],

  compare: {
    intro: "Coming from O Level or IGCSE Computer Science? Here's what deepens.",
    rows: [
      { idea: "Data", here: "Binary, hex, file sizes", next: "Two's complement, floating-point, user-defined types, file organisation" },
      { idea: "Hardware", here: "CPU basics, logic gates", next: "Assembly language, Boolean algebra, RISC, parallel processing" },
      { idea: "Programming", here: "Pseudocode, arrays, files", next: "ADTs, recursion, OOP, exceptions — and a practical exam on a computer" },
      { idea: "Databases", here: "Simple SQL queries", next: "Normalisation, DDL and DML" },
      { idea: "AI", here: "What AI is", next: "Graph algorithms (A*, Dijkstra) and machine learning" },
    ],
  },

  papers: [
    { name: "Paper 1 — Theory Fundamentals", time: "1 hour 30 minutes", marks: 75, weight: "50% of AS · 25% of A Level", what: "Written paper on sections 1–8. All questions compulsory.", who: "AS & A Level" },
    { name: "Paper 2 — Fundamental Problem-solving and Programming Skills", time: "2 hours", marks: 75, weight: "50% of AS · 25% of A Level", what: "Written paper on sections 9–12. Answers are written in pseudocode.", who: "AS & A Level" },
    { name: "Paper 3 — Advanced Theory", time: "1 hour 30 minutes", marks: 75, weight: "25% of A Level", what: "Written paper on sections 13–20.", who: "A Level only" },
    { name: "Paper 4 — Practical", time: "2 hours 30 minutes", marks: 75, weight: "25% of A Level", what: "Programming on a computer (no internet or email) in Java, Visual Basic (.NET) or Python, console mode. You submit complete program code and evidence of testing.", who: "A Level only" },
  ],
  papersNote: "All papers are marked by Cambridge. Calculators must not be used in any paper. Paper 4 needs an exam centre that can run it on computers.",

  questionTypes: [
    { type: "Theory (Paper 1)", example: "Explain why a computer uses two's complement to represent negative integers.", testing: "Precise technical understanding." },
    { type: "Pseudocode (Paper 2)", example: "Write a pseudocode function that takes a string and returns TRUE if it is a palindrome.", testing: "Correct Cambridge pseudocode, logic and data structures." },
    { type: "Data structures (Paper 3)", example: "Describe how an item is added to a linked list implemented using arrays.", testing: "Understanding pointers and algorithms step by step." },
    { type: "Programming task (Paper 4)", example: "Write a program that reads records from a text file into an array of objects and sorts them using an insertion sort.", testing: "Working code, good structure and evidence of testing." },
    { type: "AI (Paper 3)", example: "Use Dijkstra's algorithm to find the shortest path between two nodes in the graph.", testing: "Applying a standard algorithm accurately." },
  ],
  questionNote: "Examples are written by our teachers in Cambridge style to show the type of question — they are not copied from past papers.",

  commandWords: [
    { word: "Describe", meaning: "state the points of a topic / give characteristics and main features", tip: "Step by step, with correct terms." },
    { word: "Explain", meaning: "set out purposes or reasons / make the relationships between things clear / say why and/or how and support with relevant evidence", tip: "Say why or how — not just what." },
    { word: "Complete", meaning: "add information to an incomplete diagram or table", tip: "Trace tables, truth tables, diagrams." },
    { word: "Compare", meaning: "identify/comment on similarities and/or differences", tip: "Both items in each point." },
    { word: "Evaluate", meaning: "judge or calculate the quality, importance, amount, or value of something", tip: "Weigh up, then conclude." },
    { word: "Analyse", meaning: "examine in detail to show meaning, identify elements and the relationship between them", tip: "Break the problem into parts." },
  ],
  commandSource: "Meanings are quoted from the 'Command words' table in the official syllabus.",

  aos: [
    { code: "AO1", name: "Knowledge and understanding", weight: "30 (AS) · 30 (A Level)", bar: 30, plain: "Principles and concepts — abstraction, logic, algorithms, data representation." },
    { code: "AO2", name: "Application", weight: "40 (AS) · 30 (A Level)", bar: 35, plain: "Applying concepts and analysing problems computationally." },
    { code: "AO3", name: "Design, program and evaluate", weight: "30 (AS) · 40 (A Level)", bar: 35, plain: "Designing, programming and evaluating solutions with reasoned judgements." },
  ],
  aoNote: "At full A Level, designing and programming solutions is the biggest single objective (40%).",

  grades: {
    scale: "AS Level: a, b, c, d, e. Full A Level: A*, A, B, C, D, E.",
    thresholds: {
      series: "June 2026 (full A Level, four papers)",
      max: 300,
      rows: [
        { grade: "A*", range: "240–250", pct: "about 80–83%" },
        { grade: "A", range: "206–216", pct: "about 69–72%" },
        { grade: "B", range: "172–182", pct: "about 57–61%" },
        { grade: "C", range: "142–153", pct: "about 47–51%" },
        { grade: "D", range: "112–124", pct: "about 37–41%" },
        { grade: "E", range: "83–96", pct: "about 28–32%" },
      ],
      note: "Minimum marks out of 300 in June 2026; the range covers the different paper variants. For AS Level alone (out of 150) an 'a' needed about 99–109.",
    },
    meaning: "Computer science and software engineering degrees often ask for Computer Science with A Level Mathematics.",
  },

  practicalTitle: "Programming practice",
  practical: [
    "Choose Python, Java or Visual Basic (.NET) early and use it for everything — Paper 4 is done in console mode.",
    "Master the Cambridge pseudocode format for Paper 2 (it's in the syllabus).",
    "Implement every data structure yourself: stack, queue, linked list, binary tree.",
    "Practise reading from and writing to text files, and handling exceptions.",
    "Always test with normal, abnormal and extreme/boundary data — Paper 4 asks for evidence of testing.",
  ],

  books: [
    { title: "Computer Science for Cambridge International AS & A Level", by: "Cambridge University Press (2019)", note: "Endorsed for the syllabus from 2021." },
    { title: "Cambridge International AS & A Level Computer Science Student's Book", by: "Hachette Learning (2019)", note: "Endorsed for the syllabus from 2021." },
    { title: "Official syllabus (pseudocode guide inside), past papers and mark schemes", by: "Cambridge International", note: "Essential practice for Papers 2 and 4." },
  ],
  booksNote: "Cambridge says textbooks endorsed for the syllabus from 2021 are still suitable for 2027–2029.",

  mistakes: [
    "Writing Python syntax in Paper 2 instead of Cambridge pseudocode.",
    "Forgetting base cases in recursion.",
    "Mixing up stacks (LIFO) and queues (FIFO).",
    "Submitting Paper 4 code without the required testing evidence.",
    "Memorising definitions without being able to apply them to a scenario.",
  ],
  mistakesNote: "Tips from our teachers.",

  studyPlan: [
    { when: "Year 1 (AS), term 1", what: "Information representation, communication, hardware (1–3); pseudocode basics (9, 11)." },
    { when: "Year 1, term 2", what: "Processor fundamentals, system software, security, ethics (4–7); data types and structures (10)." },
    { when: "Year 1, term 3", what: "Databases and SQL (8); software development (12); AS past papers." },
    { when: "Year 2 (A2), term 1", what: "Data representation, networks, hardware, system software, security (13–17)." },
    { when: "Year 2, term 2", what: "AI (18); computational thinking and further programming (19–20); Paper 4 practice on a computer." },
    { when: "Final months", what: "Timed Papers 3 and 4; build and test one complete program a week." },
  ],
  studyNote: "Cambridge designs AS for about 180 and full A Level for about 360 guided learning hours — plus lots of coding.",

  careers: {
    intro: "A Level Computer Science leads straight into the technology industry.",
    paths: [
      { name: "Software engineering", need: "Computer Science + Maths" },
      { name: "Artificial intelligence & data science", need: "Maths + Computer Science" },
      { name: "Cyber security & networking", need: "Computer Science" },
      { name: "Computer & electrical engineering", need: "Maths + Physics (+ Computer Science)" },
      { name: "Game development, fintech, freelancing", need: "Programming skill and a portfolio" },
    ],
  },

  realWorld: [
    { title: "Route-finding apps", text: "Map apps find the fastest route using graph algorithms like A* and Dijkstra's — Topic 18." },
    { title: "The padlock in your browser", text: "Digital certificates and encryption protocols (Topic 17) are why you can trust online banking." },
    { title: "Al-Khwarizmi", text: "The word 'algorithm' comes from his name; Topic 9 is all about algorithms." },
    { title: "Machine learning", text: "Recommendation systems and voice assistants use machine learning — the syllabus asks you to understand its categories, including deep learning." },
  ],

  faqs: [
    { q: "Do I need O Level Computer Science first?", a: "Cambridge recommends a course equivalent to IGCSE or O Level Computer Science." },
    { q: "Which language for Paper 4?", a: "Java, Visual Basic (any .NET version, not VB6) or Python, in console mode." },
    { q: "How is Paper 4 taken?", a: "On a computer without internet or email. You submit complete program code and evidence of testing. Your exam centre must be able to run it." },
    { q: "Calculator?", a: "Calculators must not be used in any paper." },
    { q: "Is the syllabus changing?", a: "The 2027–2029 syllabus has no significant changes that affect teaching." },
  ],

  sources: [
    { label: "Official syllabus 9618 for exams in 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf" },
    { label: "Official syllabus 9618 for exams in 2027, 2028 and 2029 (PDF)", url: "https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf" },
    { label: "Grade threshold table, June 2026 (PDF)", url: "https://www.cambridgeinternational.org/Images/761508-computer-science-9618-june-2026-grade-threshold-table.pdf" },
    { label: "Endorsed resources for 9618", url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-computer-science-9618/endorsed-resources/" },
  ],
};

export default computerScience9618;
