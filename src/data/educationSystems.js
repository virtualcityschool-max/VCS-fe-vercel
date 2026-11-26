// Content for /compare-education-systems: school systems compared for
// students in Pakistan and the Gulf. Every number and incident here comes from
// the board's own page or a named news report (see SOURCES). When something
// changes, update the fact, its source and LAST_CHECKED together.

export const LAST_CHECKED = "26 November 2026";

// The systems, in the order the page shows them. `accent` is a Tailwind colour
// name used for the card tint (see DESIGN.md §3).
export const SYSTEMS = [
  {
    id: "cambridge",
    name: "Cambridge International",
    short: "Cambridge",
    quals: "O Level · IGCSE · AS & A Level",
    accent: "indigo",
    icon: "fa-landmark",
    who: "Run by Cambridge University Press & Assessment, part of the University of Cambridge (UK).",
    size: "10,000+ schools in 160+ countries. Pakistan is one of its biggest markets.",
    style: "Subject-by-subject exams at the end of the course. Choose your own subjects (usually 8–9 at O Level / IGCSE, 3–4 at A Level).",
    goodFor: "Students who want depth in a few subjects, UK / Commonwealth universities, and Pakistani universities through IBCC equivalence.",
    watchOut: "Grades rest almost entirely on final exams, so one bad day matters. Pakistan saw paper leaks in 2024, 2025 and 2026 (details below).",
  },
  {
    id: "edexcel",
    name: "Pearson Edexcel",
    short: "Edexcel",
    quals: "International GCSE · International AS & A Level (IAL)",
    accent: "cyan",
    icon: "fa-building-columns",
    who: "Run by Pearson, a UK company that also sets exams taken in England.",
    size: "Taken by 100,000+ students a year in 80+ countries, popular in the Gulf.",
    style: "Like Cambridge, but IAL is split into units you can sit in different sessions (January, May/June, October), so you can spread exams out and resit one unit.",
    goodFor: "Students who want A Levels with more exam dates and unit resits; very common in UAE and Saudi schools.",
    watchOut: "Fewer schools offer it in Pakistan than Cambridge. Pearson also had leaks (UK A Level Maths 2025; an International A Level notice in 2025).",
  },
  {
    id: "ib",
    name: "International Baccalaureate",
    short: "IB",
    quals: "Diploma Programme (DP), ages 16–19",
    accent: "emerald",
    icon: "fa-globe",
    who: "Run by the IB Organization, a non-profit foundation based in Geneva, Switzerland.",
    size: "About 6,100+ IB schools in 160 countries; 128,000+ Diploma students sat the May 2025 exams.",
    style: "One full diploma: 6 subjects (3 at higher level) plus an Extended Essay, Theory of Knowledge and CAS (creativity, activity, service). Coursework counts toward the grade.",
    goodFor: "All-rounders who like writing, projects and breadth. Well known to US, European and Canadian universities.",
    watchOut: "Heavy workload and the most expensive schools. Few IB schools in Pakistan. The May 2024 exams had 'time-zone' leaks of questions on social media.",
  },
  {
    id: "american",
    name: "American system",
    short: "American",
    quals: "High School Diploma + AP exams + SAT / ACT",
    accent: "amber",
    icon: "fa-flag",
    who: "The diploma comes from your school; AP and SAT are run by the College Board (USA).",
    size: "120,000+ students in 139 countries took AP exams in 2024 (outside the USA).",
    style: "Grades from coursework and tests across four years (GPA), plus optional AP exams for advanced subjects and the SAT for admissions.",
    goodFor: "Students set on US or Canadian universities. Many US universities give credit for AP scores of 3+ (as they do for good A Level and IB results).",
    watchOut: "A diploma alone is weak for UK and Pakistani admissions; you usually need APs or SAT as well. Check IBCC rules early if you may study in Pakistan.",
  },
  {
    id: "national",
    name: "Pakistan national boards",
    short: "Matric / FSc",
    quals: "SSC (Matric) · HSSC (FSc / ICS / I.Com)",
    accent: "rose",
    icon: "fa-book",
    who: "Federal Board (FBISE), the provincial BISE boards and the Aga Khan University Examination Board (AKU-EB).",
    size: "The route most students in Pakistan take; low fees.",
    style: "Fixed groups (Pre-Medical, Pre-Engineering, ICS…) with board exams each year.",
    goodFor: "MDCAT / ECAT and Pakistani public universities: no equivalence certificate needed and the syllabus matches local entry tests.",
    watchOut: "Less known abroad; foreign universities often ask for extra tests (SAT, IELTS, a foundation year). National boards have had their own leaks too.",
  },
];

// Rows of the side-by-side table. Each row has a value per system id.
export const COMPARE_ROWS = [
  {
    label: "Age range",
    cambridge: "O Level / IGCSE 14–16 · A Level 16–18",
    edexcel: "Int. GCSE 14–16 · IAL 16–18",
    ib: "Diploma 16–19",
    american: "Grades 9–12 (14–18)",
    national: "Matric 14–16 · FSc 16–18",
  },
  {
    label: "How you're graded",
    cambridge: "Mostly final exams",
    edexcel: "Unit exams across the year",
    ib: "Exams + coursework, out of 45 points",
    american: "GPA from coursework + AP / SAT",
    national: "Annual board exams (marks out of 1,100 / 1,200)",
  },
  {
    label: "Exam sessions a year",
    cambridge: "2 (May/June, Oct/Nov) + March in some countries",
    edexcel: "Up to 3 (Jan, May/June, Oct)",
    ib: "2 (May, November)",
    american: "AP once (May); SAT several dates",
    national: "1 annual + supplementary",
  },
  {
    label: "Subject choice",
    cambridge: "Free choice",
    edexcel: "Free choice",
    ib: "6 subjects across fixed groups + core",
    american: "Wide, set by your school",
    national: "Fixed groups",
  },
  {
    label: "Pakistan universities",
    cambridge: "Yes, with IBCC equivalence",
    edexcel: "Yes, with IBCC equivalence",
    ib: "Yes, with IBCC equivalence",
    american: "Yes, with IBCC equivalence (extra conditions)",
    national: "Direct",
  },
  {
    label: "UK universities",
    cambridge: "Excellent",
    edexcel: "Excellent",
    ib: "Excellent",
    american: "Needs APs (often 3–5) or a foundation year",
    national: "Usually a foundation year",
  },
  {
    label: "US universities",
    cambridge: "Very good (A Level credit at many)",
    edexcel: "Very good",
    ib: "Excellent",
    american: "Excellent (home system)",
    national: "Accepted, SAT strongly advised",
  },
  {
    label: "Cost (private schools)",
    cambridge: "Medium–high",
    edexcel: "Medium–high",
    ib: "Highest",
    american: "High",
    national: "Lowest",
  },
];

// The page's honest answer to "which is best?": by goal, not by brand.
export const GOALS = [
  {
    id: "uk",
    label: "University in the UK",
    icon: "fa-graduation-cap",
    pick: "A Levels (Cambridge or Edexcel) or the IB Diploma",
    why: "UK offers are written in A Level grades (e.g. AAA) or IB points. Both are equally welcome. Choose A Levels if you want depth in 3 subjects; IB if you like breadth.",
  },
  {
    id: "us",
    label: "University in the USA / Canada",
    icon: "fa-flag",
    pick: "Any of them + a strong SAT, activities and essays",
    why: "US admissions look at the whole person. A Levels, IB and APs all earn credit at many universities. What wins scholarships there is grades + test scores + leadership and service.",
  },
  {
    id: "pk",
    label: "Medicine / engineering in Pakistan",
    icon: "fa-heart-pulse",
    pick: "FSc is simplest; O / A Level works too",
    why: "Public medical and engineering colleges take MDCAT / ECAT. O / A Level students need IBCC equivalence and the right subjects (e.g. Urdu, Islamiyat, Pakistan Studies at O Level), and must prepare for the entry test separately.",
  },
  {
    id: "gulf",
    label: "Staying in the Gulf",
    icon: "fa-mosque",
    pick: "Cambridge, Edexcel or IB, all well known",
    why: "Gulf universities accept British and IB qualifications; Saudi and UAE universities may ask for an equivalency from their education ministry. Check the university's own page.",
  },
  {
    id: "europe",
    label: "Europe / Asia / anywhere",
    icon: "fa-earth-asia",
    pick: "IB or A Levels",
    why: "Both are recognised widely. Some European countries ask for a fixed number of A Levels (often 3–4) or specific subjects, so check the country's rules before you choose subjects.",
  },
];

// Scholarships: what actually decides them.
export const SCHOLARSHIP_POINTS = [
  {
    title: "The board doesn't win the scholarship. Your grades do.",
    text: "No major scholarship we list prefers Cambridge over IB or Edexcel. Committees look at how well you did in whatever you took, plus your essays, activities and interviews.",
  },
  {
    title: "Top grades unlock merit awards",
    text: "Straight A*/A at A Level, a high IB score (often 38+) or 4–5 on several APs open the door to many merit scholarships in the UK, USA, Türkiye, Malaysia and the Gulf.",
  },
  {
    title: "Country programmes are open to all systems",
    text: "Türkiye Burslari, Stipendium Hungaricum, the Chinese Government Scholarship, KAUST and others accept every system above, as long as you meet the grade and age rules.",
  },
  {
    title: "Credit saves money too",
    text: "Many US universities give course credit for good A Level, IB or AP results. Fewer courses to pay for works like a scholarship.",
  },
];

// Exam-security incidents, newest first. Facts only, with the board's response.
export const INCIDENTS = [
  {
    year: "2026",
    board: "Cambridge",
    what: "AS Level Maths 9709/12 cancelled after it was shared in Pakistan; a second Maths paper (9709/52) and Computer Science 9618/12 were also shared early.",
    response: "Retake of 9709/12 in June; assessed marks for 9618/12 with a free resit in November 2026; Cambridge called the incidents 'unprecedented' and Pakistan's cybercrime agency opened an investigation.",
    source: "https://www.arabnews.pk/pakistan/pakistan-orders-cybercrime-probe-after-diplomat-cites-cambridge-exam-paper-theft-2643557",
    sourceName: "Arab News, 14 May 2026",
  },
  {
    year: "2025",
    board: "Cambridge",
    what: "Parts of questions from AS & A Level Maths Papers 12 and 42 and Computer Science Paper 22 were shared before the exam in Pakistan.",
    response: "Cambridge found no evidence whole papers leaked; the affected questions were not counted and students were offered free November 2025 resits.",
    source: "https://www.dawn.com/news/1918186/cambridge-confirms-partial-leak-of-3-a-level-papers-for-june-2025-exams",
    sourceName: "Dawn, June 2025",
  },
  {
    year: "2025",
    board: "Pearson Edexcel",
    what: "UK A Level Maths paper questions circulated online before the exam; arrests followed. Pearson also warned of International A Level material on social media.",
    response: "Investigation with police; a Further Maths paper was replaced.",
    source: "https://feweek.co.uk/edexcel-maths-a-level-leak-bigger-than-first-thought-admits-pearson",
    sourceName: "FE Week",
  },
  {
    year: "2024",
    board: "IB",
    what: "'Time-zone cheating': questions from May 2024 exams (including Maths) were posted online by students in earlier time zones.",
    response: "The IB threatened disqualification, kept grade boundaries unchanged and promised to review its time-zone arrangements.",
    source: "https://www.ibo.org/news/news-list/update-on-may-2024-exams/",
    sourceName: "IB statement, May 2024",
  },
  {
    year: "2024",
    board: "Cambridge",
    what: "AS Level Maths 9709 Paper 12 was seen by many students in Pakistan before the exam.",
    response: "The paper was not marked; grades came from the other papers, with a free November retake for anyone who wanted it.",
    source: "https://www.geo.tv/latest/556221-cambridge-decides-against-marking-students-on-leaked-as-level-maths-paper",
    sourceName: "Geo News, July 2024",
  },
];

export const FAQS = [
  {
    q: "Is IGCSE the same as O Level?",
    a: "They are different qualifications at the same level. Cambridge offers both; Pearson Edexcel offers International GCSE. In Pakistan, IBCC gives Cambridge IGCSE the same equivalence as Cambridge O Level, so either works for A Level and university admission.",
  },
  {
    q: "Which is better: Cambridge, Edexcel or IB?",
    a: "None is better for everyone. A Levels (Cambridge or Edexcel) suit students who want depth in 3–4 subjects; the IB suits all-rounders who enjoy essays and projects. Universities in the UK, USA, Europe, Pakistan and the Gulf accept all three. Choose by your goal, your strengths and which schools you can reach.",
  },
  {
    q: "Which system gives more scholarships?",
    a: "Scholarships are given for results, not for the board. A*/A grades at A Level, a high IB score or strong APs plus SAT all qualify for the same merit scholarships. What matters most is your grades, essays, activities and applying on time.",
  },
  {
    q: "Have the Cambridge paper leaks made Cambridge results worthless?",
    a: "No. Universities still accept Cambridge results worldwide, and Cambridge cancelled or discounted the affected papers so that grades stay fair. The leaks in Pakistan (2024, 2025, 2026) are serious and hurt honest students, and every big board (IB in 2024, Pearson in 2025) has faced leaks. The safest protection is real preparation: students who know the syllabus do well whichever paper they sit.",
  },
  {
    q: "Do O / A Level students need an IBCC equivalence certificate?",
    a: "Yes, for admission to universities and colleges in Pakistan. You need one for O Level (or IGCSE) and one for A Level, and you must have studied Urdu, Islamiyat and Pakistan Studies at O Level if you sat your exams in Pakistan. Check the current rules on ibcc.edu.pk.",
  },
  {
    q: "Can I switch from Matric to A Levels, or from O Level to FSc?",
    a: "Yes. Matric students can join AS / A Level, and O Level students can join FSc after getting IBCC equivalence. Switching is easiest at age 16, between the two stages.",
  },
];

export const SOURCES = [
  { name: "Cambridge International: global recognition", url: "https://www.cambridgeinternational.org/why-choose-us/where-do-cambridge-qualifications-take-you/" },
  { name: "Cambridge: IGCSE and O Level equivalence in Pakistan", url: "https://help.cambridgeinternational.org/hc/en-gb/articles/203494122-What-equivalence-does-Cambridge-IGCSE-have-to-Cambridge-O-Level-in-Pakistan" },
  { name: "IB: facts and figures", url: "https://www.ibo.org/about-the-ib/facts-and-figures/" },
  { name: "Pearson: International A Level university recognition", url: "https://qualifications.pearson.com/en/support/Services/progress-to-university.html" },
  { name: "College Board: universities outside the US that recognise AP", url: "https://apstudents.collegeboard.org/ap-around-the-world/find-universities-that-recognize-ap-scores" },
  { name: "IBCC: equivalence of foreign qualifications", url: "https://ibcc.edu.pk/" },
];
