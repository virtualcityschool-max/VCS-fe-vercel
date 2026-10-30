// Memory Challenge: content, scoring and badges.
// Records are kept only in the player's browser (no login).

export const STORE_KEY = "vcs_play_memory_v1";

export const EMPTY_RECORD = {
  best: {},      // lightPath, spanF, spanB, grid, palaceBefore, palaceAfter: higher is better; pairs: { deck: fewest moves }
  plays: {},     // game id -> times played
  days: [],      // local dates (YYYY-MM-DD) with at least one game
  badges: [],    // badge ids earned
};

// The three kinds of memory the games train.
export const TYPES = {
  numbers: {
    name: "Numbers",
    icon: "fas fa-hashtag",
    color: "violet",
    strong:
      "You hold digits well. Use it: learn formulas, dates and constants as short number chunks, and check your working by memory before you check the calculator.",
    grow:
      "Group numbers into chunks of 2 or 3 (like a phone number: 0300 123 4567), say them aloud with a rhythm, and test yourself the next day.",
  },
  pictures: {
    name: "Pictures",
    icon: "fas fa-shapes",
    color: "cyan",
    strong:
      "You remember what you see and where it was. Turn notes into mind maps, diagrams and colour-coded cards — your brain stores them better than lines of text.",
    grow:
      "Draw it. After reading a page, close the book and sketch a quick diagram from memory, then compare. Colours and arrows help a lot.",
  },
  words: {
    name: "Words",
    icon: "fas fa-font",
    color: "emerald",
    strong:
      "Words stick with you. Explain topics out loud, write short summaries, and teach a friend — you'll remember it even better.",
    grow:
      "Make words into pictures: link each key word to a funny image and a place (the memory palace). Then test yourself instead of re-reading.",
  },
};

export const GAMES = [
  {
    id: "lightPath",
    title: "Light Path",
    type: "pictures",
    icon: "fas fa-lightbulb",
    accent: "violet",
    blurb: "Tiles light up one after another. Tap them back in the same order. Each round adds one more step.",
    trains: "Order and position",
    unit: "steps",
  },
  {
    id: "numberSpan",
    title: "Number Span",
    type: "numbers",
    icon: "fas fa-hashtag",
    accent: "indigo",
    blurb: "Digits flash one at a time. Type them back — or, for a real challenge, type them backwards.",
    trains: "Holding numbers in mind",
    unit: "digits",
  },
  {
    id: "grid",
    title: "Grid Recall",
    type: "pictures",
    icon: "fas fa-table-cells",
    accent: "cyan",
    blurb: "Squares light up all at once. Tap every one you saw. The grid grows as you get better.",
    trains: "Visual memory",
    unit: "squares",
  },
  {
    id: "pairs",
    title: "Match Pairs",
    type: "pictures",
    icon: "fas fa-clone",
    accent: "amber",
    blurb: "Flip cards to match elements, capitals, physics units or organs. Revise while you play.",
    trains: "Where things are + facts",
    unit: "moves",
  },
  {
    id: "palace",
    title: "Memory Palace",
    type: "words",
    icon: "fas fa-house-chimney",
    accent: "emerald",
    blurb: "Remember 15 words. Then learn a 2,500-year-old trick and try again. Watch your score jump.",
    trains: "Words and lists",
    unit: "words",
  },
];

// What most people score (well-known research results).
export const NORMS = {
  spanF: "Most people remember about 7 digits forwards (Miller, 1956).",
  spanB: "Backwards is harder: most people manage about 5 digits.",
  lightPath: "In the classic block-tapping test (Corsi, 1972) most adults repeat about 5 to 6 steps.",
};

// ----------------------------------------------------------- Match Pairs --

export const PAIR_DECKS = {
  elements: {
    name: "Chemistry: element symbols",
    icon: "fas fa-flask",
    pairs: [
      ["H", "Hydrogen"], ["He", "Helium"], ["C", "Carbon"], ["N", "Nitrogen"], ["O", "Oxygen"],
      ["Na", "Sodium"], ["Mg", "Magnesium"], ["Cl", "Chlorine"], ["K", "Potassium"], ["Ca", "Calcium"],
      ["Fe", "Iron"], ["Cu", "Copper"], ["Ag", "Silver"], ["Au", "Gold"], ["Pb", "Lead"], ["Zn", "Zinc"],
    ],
  },
  capitals: {
    name: "Geography: capital cities",
    icon: "fas fa-earth-asia",
    pairs: [
      ["Saudi Arabia", "Riyadh"], ["UAE", "Abu Dhabi"], ["Qatar", "Doha"], ["Kuwait", "Kuwait City"],
      ["Bahrain", "Manama"], ["Oman", "Muscat"], ["Pakistan", "Islamabad"], ["Egypt", "Cairo"],
      ["Turkey", "Ankara"], ["Japan", "Tokyo"], ["Canada", "Ottawa"], ["Australia", "Canberra"],
      ["Malaysia", "Kuala Lumpur"], ["Jordan", "Amman"], ["Bangladesh", "Dhaka"], ["Nigeria", "Abuja"],
    ],
  },
  units: {
    name: "Physics: SI units",
    icon: "fas fa-bolt",
    pairs: [
      ["Force", "Newton (N)"], ["Energy", "Joule (J)"], ["Power", "Watt (W)"], ["Pressure", "Pascal (Pa)"],
      ["Current", "Ampere (A)"], ["Voltage", "Volt (V)"], ["Resistance", "Ohm (Ω)"], ["Frequency", "Hertz (Hz)"],
      ["Charge", "Coulomb (C)"], ["Temperature", "Kelvin (K)"], ["Mass", "Kilogram (kg)"], ["Time", "Second (s)"],
    ],
  },
  organs: {
    name: "Biology: organs and their jobs",
    icon: "fas fa-heart-pulse",
    pairs: [
      ["Heart", "Pumps blood"], ["Lungs", "Gas exchange"], ["Kidneys", "Filter the blood"], ["Liver", "Makes bile"],
      ["Stomach", "Starts protein digestion"], ["Brain", "Controls the body"], ["Pancreas", "Makes insulin"],
      ["Small intestine", "Absorbs food"], ["Skin", "Protects the body"], ["Skeleton", "Supports the body"],
    ],
  },
};
export const PAIRS_PER_GAME = 8;

// --------------------------------------------------------- Memory Palace --

// Concrete, easy-to-picture words. Each game uses two different lists.
export const WORD_LISTS = [
  ["camel", "umbrella", "pizza", "rocket", "guitar", "pillow", "volcano", "banana", "robot", "ladder", "kite", "candle", "octopus", "bicycle", "crown"],
  ["elephant", "mango", "telescope", "drum", "igloo", "scissors", "dolphin", "lantern", "football", "cactus", "piano", "helmet", "penguin", "anchor", "sandwich"],
  ["tiger", "balloon", "trumpet", "castle", "carrot", "whale", "compass", "teapot", "giraffe", "rainbow", "hammer", "parrot", "mirror", "train", "pineapple"],
  ["falcon", "cupcake", "bridge", "snowman", "violin", "lemon", "tractor", "butterfly", "clock", "dragon", "bucket", "magnet", "tortoise", "watermelon", "map"],
];

// A walk through any home: the student pictures their own.
export const PALACE_ROUTE = [
  "Front gate", "Front door", "Shoe rack", "Sofa", "Television", "Dining table", "Fridge", "Kitchen sink",
  "Stairs", "Bathroom mirror", "Your bed", "Wardrobe", "Study desk", "Window", "Roof",
];

// Example words are not in any WORD_LISTS list, so they never give an answer away.
export const PALACE_EXAMPLES = [
  ["Front gate", "lion", "A lion is sitting on your front gate, roaring at everyone who passes."],
  ["Front door", "book", "You open the front door and a giant book falls on your head."],
  ["Shoe rack", "egg", "Every shoe on the rack has a cracked egg inside. Yuck!"],
];

export const WORD_SECONDS = 4;

const clean = (w) => w.toLowerCase().replace(/[^a-z]/g, "");
const stem = (w) => w.replace(/(es|s)$/, "");
const editDistance = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
};

// Which list word (if any) a typed answer means. Forgives plurals and one typo in longer words.
export const matchWord = (typed, list) => {
  const t = clean(typed);
  if (!t) return null;
  return (
    list.find((w) => w === t || stem(w) === stem(t)) ||
    (t.length >= 5 ? list.find((w) => w.length >= 5 && editDistance(w, t) <= 1) : null) ||
    null
  );
};

// Words remembered (each list word counted once).
export const scoreRecall = (answers, list) => {
  const hit = new Set();
  answers.forEach((a) => {
    const m = matchWord(a, list);
    if (m) hit.add(m);
  });
  return hit;
};

// --------------------------------------------------------------- Profile --

const clamp = (x) => Math.max(0, Math.min(100, Math.round(x)));
const avg = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);

export const bestPairs = (best) => {
  const v = Object.values(best.pairs || {});
  return v.length ? Math.min(...v) : null;
};

// 0–100 for each memory type, or null if no game of that type was played yet.
export const profileScores = (best) => {
  const numbers = [];
  if (best.spanF) numbers.push(((best.spanF - 3) / 6) * 100); // 3 → 0, 9 → 100
  if (best.spanB) numbers.push(((best.spanB - 2) / 5) * 100); // 2 → 0, 7 → 100
  const pictures = [];
  if (best.lightPath) pictures.push(((best.lightPath - 2) / 8) * 100); // 2 → 0, 10 → 100
  if (best.grid) pictures.push(((best.grid - 3) / 9) * 100); // 3 → 0, 12 → 100
  const pm = bestPairs(best);
  if (pm) pictures.push(((28 - pm) / 18) * 100); // 28 moves → 0, 10 → 100
  const words = [];
  const w = Math.max(best.palaceBefore || 0, best.palaceAfter || 0);
  if (w) words.push((w / 15) * 100);
  const out = {};
  [["numbers", numbers], ["pictures", pictures], ["words", words]].forEach(([k, xs]) => {
    const a = avg(xs);
    out[k] = a === null ? null : clamp(a);
  });
  return out;
};

export const levelWord = (pct) => (pct >= 75 ? "Excellent" : pct >= 50 ? "Strong" : pct >= 25 ? "Growing" : "Just starting");

// ---------------------------------------------------------------- Badges --

export const todayKey = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

// Days in a row with at least one game, ending today (or yesterday, so it isn't lost before today's game).
export const streak = (days) => {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(todayKey(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
};

export const BADGES = [
  { id: "first", name: "First Step", icon: "fas fa-shoe-prints", text: "Play any game", test: (r) => Object.keys(r.plays).length > 0 },
  { id: "allRounder", name: "All-Rounder", icon: "fas fa-medal", text: "Play all 5 games", test: (r) => GAMES.every((g) => r.plays[g.id]) },
  { id: "numberNinja", name: "Number Ninja", icon: "fas fa-user-ninja", text: "Remember 8 digits forwards", test: (r) => (r.best.spanF || 0) >= 8 },
  { id: "backwards", name: "Backwards Brain", icon: "fas fa-rotate-left", text: "Remember 6 digits backwards", test: (r) => (r.best.spanB || 0) >= 6 },
  { id: "pathFinder", name: "Path Finder", icon: "fas fa-route", text: "Reach 8 steps in Light Path", test: (r) => (r.best.lightPath || 0) >= 8 },
  { id: "eagleEye", name: "Eagle Eye", icon: "fas fa-eye", text: "Recall 9 squares in Grid Recall", test: (r) => (r.best.grid || 0) >= 9 },
  { id: "pairPro", name: "Pair Pro", icon: "fas fa-clone", text: "Clear Match Pairs in 14 moves or fewer", test: (r) => (bestPairs(r.best) || 99) <= 14 },
  { id: "allDecks", name: "Fact Collector", icon: "fas fa-layer-group", text: "Finish all 4 Match Pairs topics", test: (r) => Object.keys(r.best.pairs || {}).length >= 4 },
  { id: "palace", name: "Palace Builder", icon: "fas fa-house-chimney", text: "Remember 12 words with the memory palace", test: (r) => (r.best.palaceAfter || 0) >= 12 },
  { id: "streak3", name: "On a Roll", icon: "fas fa-fire", text: "Play 3 days in a row", test: (r) => streak(r.days) >= 3 },
  { id: "streak7", name: "Memory Habit", icon: "fas fa-calendar-check", text: "Play 7 days in a row", test: (r) => streak(r.days) >= 7 },
];

// ------------------------------------------------------------ Science -----

export const SCIENCE = [
  {
    icon: "fas fa-7",
    color: "violet",
    title: "The magic number 7",
    text: "In 1956 psychologist George Miller showed that most people can hold about 7 items in mind at once. That's why phone numbers are split into chunks.",
  },
  {
    icon: "fas fa-chart-line",
    color: "rose",
    title: "The forgetting curve",
    text: "In 1885 Hermann Ebbinghaus found we forget much of what we learn within a day or two, unless we review it. Revising after 1 day, 3 days and 1 week beats one long session.",
  },
  {
    icon: "fas fa-bed",
    color: "indigo",
    title: "Sleep saves memories",
    text: "While you sleep, your brain replays and stores what you learned that day. Staying up all night before an exam makes you remember less, not more.",
  },
  {
    icon: "fas fa-pen-to-square",
    color: "emerald",
    title: "Test yourself",
    text: "Trying to remember (a quiz, flashcards, a past paper) strengthens memory far more than reading notes again. Psychologists call it the testing effect.",
  },
  {
    icon: "fas fa-house-chimney",
    color: "amber",
    title: "The memory palace",
    text: "A 2,500-year-old trick linked to the Greek poet Simonides. In a 2017 study (Dresler and colleagues), ordinary people who practised it for 6 weeks more than doubled the words they could remember.",
  },
  {
    icon: "fas fa-book-quran",
    color: "cyan",
    title: "The Huffaz",
    text: "For over 1,400 years, millions of Huffaz have memorised the whole Quran — more than 6,000 verses — through daily repetition and revision. Proof of how much a trained memory can hold.",
  },
];

export const SOURCES = [
  "Miller, G. A. (1956). The magical number seven, plus or minus two. Psychological Review, 63(2), 81–97.",
  "Corsi, P. M. (1972). Human memory and the medial temporal region of the brain. PhD thesis, McGill University (block-tapping test).",
  "Ebbinghaus, H. (1885). Über das Gedächtnis (Memory: A Contribution to Experimental Psychology).",
  "Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. Psychological Science, 17(3), 249–255.",
  "Dresler, M., et al. (2017). Mnemonic training reshapes brain networks to support superior memory. Neuron, 93(5), 1227–1235.",
];

export const shareLink = (text) =>
  `https://wa.me/?text=${encodeURIComponent(`${text} Can you beat me? https://virtualcityschool.com/play-area/memory-challenge`)}`;
