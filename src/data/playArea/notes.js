// Smart Notes: note-taking methods, the method quiz and research.
// Cornell notebooks are kept only in the student's browser (no login).

export const STORE_KEY = "vcs_play_notes_v1";
export const REVISION_KEY = "vcs_play_revision_v1"; // shared with the Smart Revision planner

export const METHODS = {
  cornell: {
    name: "Cornell",
    icon: "fas fa-table-columns",
    color: "violet",
    origin: "Walter Pauk, Cornell University, 1950s",
    tagline: "Notes that test you",
    steps: [
      "Split the page: a narrow cue column on the left, notes on the right, a summary box at the bottom.",
      "In class, write notes on the right in short phrases.",
      "After class, turn each block of notes into a question in the left column.",
      "Write 2–3 sentences at the bottom summarising the whole page in your own words.",
      "To revise, cover the right side and answer the questions out loud.",
    ],
    best: "Every subject, especially for revising: Biology, Chemistry, Economics, definitions and key terms.",
    watch: "Takes a few extra minutes after class to write the questions and summary — that's the part that helps.",
  },
  outline: {
    name: "Outline",
    icon: "fas fa-list-ul",
    color: "cyan",
    origin: "The classic hierarchy of headings and points",
    tagline: "Headings and indented points",
    steps: [
      "Write the main topic as a heading.",
      "Put each sub-topic underneath, a little indented.",
      "Add details and examples indented further.",
      "Use numbers or bullets so the structure is clear at a glance.",
    ],
    best: "Well-organised lessons and textbook chapters: History, Biology, Geography, Business.",
    watch: "Hard to keep up with when a teacher jumps between ideas, and it doesn't show links between topics.",
  },
  mindmap: {
    name: "Mind map",
    icon: "fas fa-diagram-project",
    color: "emerald",
    origin: "Popularised by Tony Buzan in the 1970s",
    tagline: "One idea in the middle, branches around it",
    steps: [
      "Write the topic in the centre of a blank page (landscape works best).",
      "Draw a branch for each main idea, using one or two words.",
      "Add smaller branches for details. Use colours and tiny drawings.",
      "Draw arrows between branches that are connected.",
    ],
    best: "Seeing the big picture, planning essays, brainstorming and revising a whole unit on one page.",
    watch: "Not great for long explanations or step-by-step methods. Keep words short.",
  },
  chart: {
    name: "Charting",
    icon: "fas fa-table",
    color: "amber",
    origin: "Columns for comparing facts",
    tagline: "A table that compares",
    steps: [
      "Decide what you are comparing (rows) and what you compare them on (columns).",
      "Draw the table before the lesson if you know the topic.",
      "Fill each cell with short facts, numbers or dates.",
      "Look across rows and down columns to spot patterns and trends.",
    ],
    best: "Comparisons, facts and figures: elements and groups, countries, historical events, types of cells.",
    watch: "Only works when the topic fits into categories. Not for long explanations.",
  },
  sentence: {
    name: "Sentence",
    icon: "fas fa-list-ol",
    color: "rose",
    origin: "The simplest method",
    tagline: "One numbered line per idea",
    steps: [
      "Number each new fact or idea on its own line.",
      "Keep each line short — shorthand is fine.",
      "Leave space between topics.",
      "Afterwards, rewrite the lines into an outline, chart or Cornell page.",
    ],
    best: "Fast lessons, lots of information, or when you don't yet know how the topic is organised.",
    watch: "Hard to revise from as it is. Rewrite it within a day — the rewriting is where you learn.",
  },
};

export const METHOD_ORDER = ["cornell", "outline", "mindmap", "chart", "sentence"];

// The 5 Rs of the Cornell method (Pauk).
export const FIVE_RS = [
  { name: "Record", text: "Write the main ideas on the right during the lesson." },
  { name: "Reduce", text: "After class, turn notes into short questions or key words on the left." },
  { name: "Recite", text: "Cover the notes. Answer each question out loud in your own words." },
  { name: "Reflect", text: "Ask: how does this connect to what I already know? Write the summary." },
  { name: "Review", text: "Spend a few minutes reviewing — on the days your revision plan says." },
];

// "Which method suits you?" Each option gives points to one or two methods.
export const QUIZ = [
  {
    q: "Which subject are these notes for?",
    options: [
      ["Biology or Chemistry", { cornell: 2, chart: 1 }],
      ["History, Pakistan Studies or English", { outline: 2, mindmap: 1 }],
      ["Maths or Physics", { cornell: 2, sentence: 1 }],
      ["Economics, Business or Geography", { outline: 1, chart: 2 }],
    ],
  },
  {
    q: "How is the lesson going?",
    options: [
      ["Slow and well organised", { outline: 2 }],
      ["Fast — lots of information", { sentence: 2 }],
      ["Lots of diagrams and links", { mindmap: 2 }],
      ["I'm reading a textbook at my own pace", { cornell: 2 }],
    ],
  },
  {
    q: "What do you want the notes for?",
    options: [
      ["Revising and testing myself", { cornell: 3 }],
      ["Seeing how ideas connect", { mindmap: 3 }],
      ["Comparing things side by side", { chart: 3 }],
      ["Just getting everything down", { sentence: 3 }],
    ],
  },
  {
    q: "How does your brain like information?",
    options: [
      ["Lists and headings", { outline: 2 }],
      ["Pictures and colours", { mindmap: 2 }],
      ["Tables and grids", { chart: 2 }],
      ["Questions and answers", { cornell: 2 }],
    ],
  },
  {
    q: "The topic is mostly…",
    options: [
      ["Steps or a sequence of facts", { outline: 2 }],
      ["Lots of things to compare", { chart: 2 }],
      ["One big idea with many parts", { mindmap: 2 }],
      ["Definitions and key terms to learn", { cornell: 2 }],
    ],
  },
];

export const scoreQuiz = (picks) => {
  const s = Object.fromEntries(METHOD_ORDER.map((m) => [m, 0]));
  picks.forEach((p, i) => {
    if (p === undefined) return;
    Object.entries(QUIZ[i].options[p][1]).forEach(([m, n]) => { s[m] += n; });
  });
  return [...METHOD_ORDER].sort((a, b) => s[b] - s[a]); // ties keep METHOD_ORDER (Cornell first)
};

export const RESEARCH = [
  {
    icon: "fas fa-pen-nib",
    color: "emerald",
    title: "Your own words beat copying",
    text: "Students typing on laptops wrote more and copied more word for word (Mueller & Oppenheimer, 2014 — confirmed by Morehead and colleagues, 2019). Copying doesn't build understanding. On paper or on screen: summarise in your own words.",
  },
  {
    icon: "fas fa-scale-balanced",
    color: "amber",
    title: "Pen or laptop? Still debated",
    text: "The 2014 study found handwritten notes were better for understanding. Repeat studies in 2019 and 2021 found no clear difference; a 2024 review again favoured handwriting. Use what works for you — and turn off notifications.",
  },
  {
    icon: "fas fa-rotate",
    color: "violet",
    title: "Review your notes",
    text: "Research by Kenneth Kiewra found that reviewing notes matters as much as taking them. Notes you never look at again don't help much on exam day.",
  },
  {
    icon: "fas fa-circle-question",
    color: "cyan",
    title: "Turn notes into questions",
    text: "Answering questions from memory is one of the strongest ways to learn (the testing effect). That's why the Cornell cue column works: it turns your notes into a quiz.",
  },
];

export const SOURCES = [
  "Pauk, W., & Owens, R. J. Q. How to Study in College (first edition 1962) — the Cornell note-taking system.",
  "Mueller, P. A., & Oppenheimer, D. M. (2014). The pen is mightier than the keyboard. Psychological Science, 25(6), 1159–1168.",
  "Morehead, K., Dunlosky, J., & Rawson, K. A. (2019). How much mightier is the pen than the keyboard for note-taking? Educational Psychology Review, 31, 753–780.",
  "Urry, H. L., et al. (2021). Don't ditch the laptop just yet. Psychological Science, 32(3), 326–339.",
  "Kiewra, K. A. (1985). Investigating notetaking and review: A depth of processing alternative. Educational Psychologist, 20(1), 23–32.",
  "Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. Psychological Science, 17(3), 249–255.",
];

// A ready-made example Cornell page.
export const EXAMPLE_NOTE = {
  title: "Photosynthesis",
  subject: "Biology",
  rows: [
    { cue: "What is photosynthesis?", note: "Plants make glucose from carbon dioxide and water using light energy. Oxygen is given off." },
    { cue: "Word equation?", note: "carbon dioxide + water → glucose + oxygen (light energy, chlorophyll)" },
    { cue: "Where does it happen?", note: "In chloroplasts, mainly in palisade cells of the leaf. Chlorophyll absorbs light." },
    { cue: "What limits the rate?", note: "Light intensity, CO₂ concentration, temperature. The factor in shortest supply limits the rate." },
    { cue: "How is glucose used?", note: "Respiration, stored as starch, made into cellulose, proteins (with nitrates) and fats." },
  ],
  summary: "Photosynthesis uses light energy, trapped by chlorophyll in chloroplasts, to turn CO₂ and water into glucose and oxygen. Its rate is limited by light, CO₂ or temperature — whichever is lowest. Glucose is used for energy, storage and building the plant.",
};
