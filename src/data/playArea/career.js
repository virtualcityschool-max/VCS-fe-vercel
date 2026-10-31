// Career Interest Finder.
//
// Activities: the 60 work activities of the O*NET Interest Profiler Short Form
// (Rounds, Su, Lewis & Rivkin, 2010), copied word for word from the official
// form (https://www.onetcenter.org/dl_tools/ipsf/Interest_Profiler.pdf,
// downloaded 2026-10-31). Used unmodified under CC BY-ND 4.0, the licence
// O*NET offers for verbatim use (https://www.onetcenter.org/license_tools.html).
// Scoring as on the official form: count the activities the person would like
// to do in each area (0-10); the three highest areas, in order, form the
// interest code. Shown on screen as Like / Not for me buttons instead of tick
// boxes (same instrument, different medium).
//
// Everything else on the page (area descriptions, careers, A Level subjects,
// degrees) is written by Virtual City School and is not part of O*NET.

export const STORE_KEY = "vcs_play_career_v1";

export const ATTRIBUTION = {
  text: "This page includes the O*NET Interest Profiler Short Form by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA), used under the CC BY-ND 4.0 licence. The 60 activities and the scoring are unchanged; they are shown on screen with Like / Not for me buttons, in mixed order. O*NET® is a trademark of USDOL/ETA. The descriptions, careers, subjects and degree ideas are written by Virtual City School; USDOL/ETA has not approved or endorsed them.",
  toolUrl: "https://www.onetcenter.org/IPSF.html",
  licenceUrl: "https://creativecommons.org/licenses/by-nd/4.0/",
  citation: "Rounds, J., Su, R., Lewis, P., & Rivkin, D. (2010). O*NET Interest Profiler Short Form psychometric characteristics: Summary. National Center for O*NET Development.",
};

// Official order on the form: left column, then right column, per area.
const ACTIVITIES = {
  R: [
    "Build kitchen cabinets", "Lay brick or tile", "Repair household appliances", "Raise fish in a fish hatchery", "Assemble electronic parts",
    "Drive a truck to deliver packages to offices and homes", "Test the quality of parts before shipment", "Repair and install locks", "Set up and operate machines to make products", "Put out forest fires",
  ],
  I: [
    "Develop a new medicine", "Study ways to reduce water pollution", "Conduct chemical experiments", "Study the movement of planets", "Examine blood samples using a microscope",
    "Investigate the cause of a fire", "Develop a way to better predict the weather", "Work in a biology lab", "Invent a replacement for sugar", "Do laboratory tests to identify diseases",
  ],
  A: [
    "Write books or plays", "Play a musical instrument", "Compose or arrange music", "Draw pictures", "Create special effects for movies",
    "Paint sets for plays", "Write scripts for movies or television shows", "Perform jazz or tap dance", "Sing in a band", "Edit movies",
  ],
  S: [
    "Teach an individual an exercise routine", "Help people with personal or emotional problems", "Give career guidance to people", "Perform rehabilitation therapy", "Do volunteer work at a non-profit organization",
    "Teach children how to play sports", "Teach sign language to people who are deaf or hard of hearing", "Help conduct a group therapy session", "Take care of children at a day-care center", "Teach a high-school class",
  ],
  E: [
    "Buy and sell stocks and bonds", "Manage a retail store", "Operate a beauty salon or barber shop", "Manage a department within a large company", "Start your own business",
    "Negotiate business contracts", "Represent a client in a lawsuit", "Market a new line of clothing", "Sell merchandise at a department store", "Manage a clothing store",
  ],
  C: [
    "Develop a spreadsheet using computer software", "Proofread records or forms", "Install software across computers on a large network", "Operate a calculator", "Keep shipping and receiving records",
    "Calculate the wages of employees", "Inventory supplies using a hand-held computer", "Record rent payments", "Keep inventory records", "Stamp, sort, and distribute mail for an organization",
  ],
};

export const AREA_ORDER = ["R", "I", "A", "S", "E", "C"];

// Shown mixed (R, I, A, S, E, C, R, I, …) so answers aren't influenced by long runs of one area.
export const QUESTIONS = Array.from({ length: 10 }, (_, i) =>
  AREA_ORDER.map((area) => ({ id: `${area}${i + 1}`, area, text: ACTIVITIES[area][i] })),
).flat();
export const PER_STEP = 10;
export const STEPS = QUESTIONS.length / PER_STEP;

export const scoreAreas = (likes) => {
  const s = Object.fromEntries(AREA_ORDER.map((a) => [a, 0]));
  QUESTIONS.forEach((q) => { if (likes[q.id]) s[q.area] += 1; });
  return s;
};

// Areas sorted by score; ties keep RIASEC order (the student can pick between tied areas).
export const ranked = (scores) => [...AREA_ORDER].sort((a, b) => scores[b] - scores[a]);

// ----------------------------------------------------------- VCS guidance --

// A Level guides that exist on the site.
export const GUIDES = {
  Mathematics: "/subjects/mathematics-9709",
  Physics: "/subjects/physics-9702",
  Chemistry: "/subjects/chemistry-9701",
  Biology: "/subjects/biology-9700",
  "Computer Science": "/subjects/computer-science-9618",
  English: "/subjects/english-9093",
  Urdu: "/subjects/urdu-9866",
};

export const AREAS = {
  R: {
    name: "Realistic",
    nick: "The Doer",
    icon: "fas fa-screwdriver-wrench",
    color: "amber",
    summary: "You like practical, hands-on work: building, fixing, operating machines and working outdoors. You'd rather do something than talk about it, and you like seeing real results.",
    strengths: ["Practical problem solving", "Working with tools and technology", "Staying calm and getting things done"],
    careers: ["Mechanical or civil engineer", "Petroleum or chemical engineer", "Aircraft maintenance engineer", "Pilot", "Electrician or electrical technician", "Surveyor", "Agricultural scientist", "Chef"],
    subjects: ["Mathematics", "Physics", "Chemistry", "Computer Science"],
    degrees: ["Mechanical, Civil or Electrical Engineering", "Aviation", "Agriculture", "Construction Management"],
    tip: "Join a robotics club, help with repairs at home, or try a weekend workshop. Hands-on projects look great on university applications.",
  },
  I: {
    name: "Investigative",
    nick: "The Thinker",
    icon: "fas fa-microscope",
    color: "cyan",
    summary: "You love ideas, science and solving puzzles. You ask 'why?', enjoy research and experiments, and like working things out for yourself.",
    strengths: ["Analysis and logical thinking", "Curiosity and research", "Working independently"],
    careers: ["Doctor (MBBS)", "Pharmacist", "Research scientist", "Data scientist", "Software engineer", "Biomedical scientist", "Environmental scientist", "Economist"],
    subjects: ["Biology", "Chemistry", "Physics", "Mathematics", "Computer Science"],
    degrees: ["Medicine (MBBS) or Dentistry", "Pharmacy", "Computer Science or Data Science", "Biotechnology", "Physics or Mathematics"],
    tip: "Medicine usually needs A Level Biology and Chemistry (often Physics too). Computing and data careers need strong Mathematics. Try a science fair or an online coding course.",
  },
  A: {
    name: "Artistic",
    nick: "The Creator",
    icon: "fas fa-palette",
    color: "violet",
    summary: "You're imaginative and expressive. You enjoy art, writing, music, design or film, and you like freedom to do things your own way.",
    strengths: ["Creativity and original ideas", "Visual or written communication", "Seeing things differently"],
    careers: ["Graphic or UX designer", "Architect", "Writer or journalist", "Film maker or video editor", "Animator or game designer", "Fashion designer", "Advertising creative", "Content creator"],
    subjects: ["English", "Urdu", "Mathematics", "Computer Science"],
    degrees: ["Graphic or Interaction Design", "Architecture", "Media and Film Studies", "English Literature or Journalism", "Animation"],
    tip: "Build a portfolio now — drawings, designs, writing or videos. Design and architecture courses often ask to see it. Art & Design A Level helps too if your school offers it.",
  },
  S: {
    name: "Social",
    nick: "The Helper",
    icon: "fas fa-hands-holding-child",
    color: "emerald",
    summary: "You care about people. You like teaching, helping, advising and working in teams, and you're good at listening and explaining.",
    strengths: ["Empathy and listening", "Explaining and teaching", "Teamwork"],
    careers: ["Teacher or lecturer", "Psychologist or counsellor", "Nurse or physiotherapist", "Doctor", "Speech or occupational therapist", "Social worker", "HR specialist", "Career adviser"],
    subjects: ["Biology", "English", "Urdu", "Chemistry"],
    degrees: ["Education", "Psychology", "Nursing or Physiotherapy", "Social Work", "Human Resource Management"],
    tip: "Volunteer, tutor a younger student, or help at a community project. Psychology and Sociology A Levels are useful if your school offers them.",
  },
  E: {
    name: "Enterprising",
    nick: "The Persuader",
    icon: "fas fa-briefcase",
    color: "rose",
    summary: "You like leading, persuading and making things happen. You enjoy business, competition, taking smart risks and convincing people of your ideas.",
    strengths: ["Leadership", "Persuasion and negotiation", "Confidence and drive"],
    careers: ["Entrepreneur", "Business or project manager", "Lawyer", "Marketing manager", "Banker or investment analyst", "Sales manager", "Diplomat", "Real estate developer"],
    subjects: ["Mathematics", "English", "Computer Science"],
    degrees: ["Business Administration (BBA)", "Law (LLB)", "Economics", "Marketing", "International Relations"],
    tip: "Start a small project — a school society, a stall or an online shop. Economics and Business A Levels help if your school offers them; Mathematics opens finance doors.",
  },
  C: {
    name: "Conventional",
    nick: "The Organiser",
    icon: "fas fa-table-list",
    color: "indigo",
    summary: "You like order, accuracy and clear systems. You're good with numbers, records and details, and people trust you to get things right.",
    strengths: ["Accuracy and attention to detail", "Organisation", "Working with numbers and data"],
    careers: ["Accountant (ACCA or CA)", "Auditor", "Actuary", "Data analyst", "Supply chain and logistics manager", "Banking operations", "IT systems administrator", "Islamic finance specialist"],
    subjects: ["Mathematics", "Computer Science", "English"],
    degrees: ["Accounting and Finance", "Actuarial Science", "Statistics", "Information Systems", "Supply Chain Management"],
    tip: "Learn spreadsheets properly (Excel or Google Sheets) — it's a skill employers love. Accounting and Economics A Levels help if your school offers them.",
  },
};

export const PAIR_TIPS = {
  // A few common two-letter combinations, with careers that use both interests.
  IR: "Engineering, medicine, laboratory science and software development.",
  RI: "Engineering, medicine, laboratory science and software development.",
  IS: "Medicine, nursing, psychology and science teaching.",
  SI: "Medicine, nursing, psychology and science teaching.",
  IA: "Architecture, UX research, science writing and game development.",
  AI: "Architecture, UX research, science writing and game development.",
  IC: "Data science, actuarial work, finance analytics and IT.",
  CI: "Data science, actuarial work, finance analytics and IT.",
  IE: "Medicine leadership, tech start-ups, economics and consulting.",
  EI: "Medicine leadership, tech start-ups, economics and consulting.",
  SE: "Teaching leadership, HR, law, public service and diplomacy.",
  ES: "Teaching leadership, HR, law, public service and diplomacy.",
  EC: "Banking, accounting firms, business management and real estate.",
  CE: "Banking, accounting firms, business management and real estate.",
  AE: "Marketing, advertising, media, fashion and design businesses.",
  EA: "Marketing, advertising, media, fashion and design businesses.",
  AS: "Teaching art or languages, therapy through art, media and communication.",
  SA: "Teaching art or languages, therapy through art, media and communication.",
  RC: "Engineering technology, logistics, quality control and IT networks.",
  CR: "Engineering technology, logistics, quality control and IT networks.",
  RE: "Construction management, aviation, farming businesses and manufacturing.",
  ER: "Construction management, aviation, farming businesses and manufacturing.",
  RS: "Physiotherapy, sports coaching, emergency services and vocational teaching.",
  SR: "Physiotherapy, sports coaching, emergency services and vocational teaching.",
  RA: "Architecture, product design, photography and set or game design.",
  AR: "Architecture, product design, photography and set or game design.",
  SC: "School administration, healthcare administration and HR.",
  CS: "School administration, healthcare administration and HR.",
  AC: "Publishing, web development and design for print and digital.",
  CA: "Publishing, web development and design for print and digital.",
};

export const SOURCES = [
  ATTRIBUTION.citation,
  "Holland, J. L. (1997). Making Vocational Choices: A Theory of Vocational Personalities and Work Environments (3rd ed.). Psychological Assessment Resources.",
];
