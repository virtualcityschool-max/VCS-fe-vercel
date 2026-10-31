// Smart Revision: memory curves, spaced-revision planner and Bayesian Knowledge Tracing.
// Planner topics are kept only in the student's browser (no login).

export const STORE_KEY = "vcs_play_revision_v1";

// Chart colours (validated for colour-blind separation on light and dark backgrounds;
// each line also has its own dash pattern and a direct label).
export const LINE = {
  none: { color: "#e11d48", dash: "6 5", label: "Learn once, never revise", short: "No revision" },
  cram: { color: "#d97706", dash: "2 4", label: "Cram the night before", short: "Cramming" },
  spaced: { color: "#059669", dash: "", label: "Spaced revision", short: "Spaced revision" },
};

// Ebbinghaus (1885): how much he still remembered, measured as time saved when relearning.
// [days after learning, % remembered]
export const EBBINGHAUS = [
  [0, 100], [20 / 1440, 58.2], [1 / 24, 44.2], [9 / 24, 35.8], [1, 33.7], [2, 27.8], [6, 25.4], [31, 21.1],
];

export const REVIEW_DAYS = [1, 3, 7, 14, 30];
export const EXAM_DAY = 35;

const linear = (pts, t) => {
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      return y0 + ((y1 - y0) * (t - x0)) / (x1 - x0);
    }
  }
  return pts[pts.length - 1][1];
};

// Illustration model: memory falls towards a floor of 20%; each review brings it back to 100%
// and makes it fade more slowly (stability × 2.5). Not exact for every person or topic.
const FLOOR = 20;
const fade = (t, stability) => FLOOR + (100 - FLOOR) * Math.exp(-t / stability);

export const retention = (strategy, t) => {
  if (strategy === "none") return t > 31 ? 21.1 : linear(EBBINGHAUS, t);
  if (strategy === "cram") {
    if (t < EXAM_DAY - 1) return linear(EBBINGHAUS, Math.min(t, 31));
    return fade(t - (EXAM_DAY - 1), 1.5);
  }
  let last = 0;
  let s = 1.5;
  for (const d of REVIEW_DAYS) {
    if (t < d) break;
    last = d;
    s *= 2.5;
  }
  return fade(t - last, s);
};

// Points for drawing a strategy's line (extra points right after each review).
export const curvePoints = (strategy, maxDay = 40) => {
  const ts = new Set();
  for (let t = 0; t <= maxDay; t += 0.25) ts.add(Number(t.toFixed(2)));
  [0.014, 0.04, 0.1, 0.2, 0.375].forEach((t) => ts.add(t));
  const resets = strategy === "spaced" ? REVIEW_DAYS : strategy === "cram" ? [EXAM_DAY - 1] : [];
  resets.forEach((d) => { ts.add(d - 0.001); ts.add(d); ts.add(d + 0.05); });
  return [...ts].sort((a, b) => a - b).map((t) => [t, retention(strategy, t)]);
};

// --------------------------------------------------------------- Planner --

export const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
export const daysBetween = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000);

// Review dates after learning a topic: 1, 3, 7, 14 and 30 days, then every 30 days,
// plus a last quick review the day before the exam.
export const schedule = (learned, exam) => {
  const out = [];
  const total = exam ? daysBetween(learned, exam) : 90;
  const steps = [...REVIEW_DAYS];
  for (let d = 60; d < total; d += 30) steps.push(d);
  steps.forEach((d) => {
    if (!exam || d < total - 1) out.push({ date: addDays(learned, d), day: d });
  });
  if (exam && total > 1) out.push({ date: addDays(exam, -1), day: total - 1, last: true });
  return out;
};

const icsDate = (iso) => iso.replaceAll("-", "");
const icsText = (s) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

// A calendar file (.ics) with every review as an all-day event.
export const toIcs = (topics) => {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Virtual City School//Smart Revision//EN", "CALSCALE:GREGORIAN"];
  topics.forEach((t) => {
    schedule(t.learned, t.exam).forEach((r, i) => {
      lines.push(
        "BEGIN:VEVENT",
        `UID:${t.id}-${i}@virtualcityschool.com`,
        `DTSTAMP:${icsDate(t.learned)}T000000Z`,
        `DTSTART;VALUE=DATE:${icsDate(r.date)}`,
        `DTEND;VALUE=DATE:${icsDate(addDays(r.date, 1))}`,
        `SUMMARY:${icsText(`Revise: ${t.name}${r.last ? " (final review)" : ""}`)}`,
        `DESCRIPTION:${icsText("Test yourself first, then check your notes. Planned with VCS Smart Revision: https://virtualcityschool.com/mind-lab/smart-revision")}`,
        "END:VEVENT",
      );
    });
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
};

// ------------------------------------------------- Knowledge Tracing -----

// Bayesian Knowledge Tracing (Corbett & Anderson, 1995).
export const BKT_DEFAULTS = { L0: 0.2, T: 0.15, S: 0.1, G: 0.2 };
export const MASTERY = 0.95;

export const bktStep = (pL, correct, { T, S, G }) => {
  const known = correct ? pL * (1 - S) : pL * S;
  const unknown = correct ? (1 - pL) * G : (1 - pL) * (1 - G);
  const posterior = known / (known + unknown);
  return posterior + (1 - posterior) * T;
};

export const bktTrace = (answers, p) => {
  const out = [p.L0];
  answers.forEach((a) => out.push(bktStep(out[out.length - 1], a, p)));
  return out;
};

export const BKT_PARAMS = [
  { key: "L0", name: "Already knew it", help: "Chance you knew the skill before practising.", min: 0, max: 0.9 },
  { key: "T", name: "Learning", help: "Chance you learn it from each practice question.", min: 0.01, max: 0.5 },
  { key: "S", name: "Slip", help: "Chance you get it wrong even though you know it (a careless mistake).", min: 0, max: 0.4 },
  { key: "G", name: "Guess", help: "Chance you get it right without knowing it (a lucky guess).", min: 0, max: 0.4 },
];

// ------------------------------------------------------- Other curves -----

// Serial position effect (shape after Murdock, 1962): words at the start and end of a list are remembered best.
export const SERIAL = [72, 60, 50, 43, 38, 35, 33, 32, 32, 33, 36, 42, 52, 66, 82];

// Roediger & Karpicke (2006), Experiment 2: % of a text recalled.
// S = a study period, T = a test (writing down what you remember).
export const TESTING_EFFECT = [
  { label: "Read it 4 times", code: "SSSS", fiveMin: 83, week: 40 },
  { label: "Read 3 times, test once", code: "SSST", fiveMin: 78, week: 56 },
  { label: "Read once, test 3 times", code: "STTT", fiveMin: 71, week: 61 },
];

export const RECIPE = [
  { icon: "fas fa-book-open", color: "violet", title: "Day 0: Learn", text: "Understand the topic in class or from your notes. Write 3–5 questions about it." },
  { icon: "fas fa-pen-to-square", color: "cyan", title: "Day 1: First review", text: "Answer your questions from memory BEFORE you look at notes. Fix what you got wrong." },
  { icon: "fas fa-rotate", color: "emerald", title: "Days 3 and 7", text: "Test yourself again — flashcards, a quick quiz or a past-paper question." },
  { icon: "fas fa-calendar-check", color: "amber", title: "Days 14 and 30", text: "Mix this topic with others. Do exam-style questions under time." },
  { icon: "fas fa-trophy", color: "rose", title: "Then monthly", text: "A short review each month keeps it fresh until exam day — no all-night cramming." },
];

export const SOURCES = [
  "Ebbinghaus, H. (1885). Über das Gedächtnis (Memory: A Contribution to Experimental Psychology). Savings data: 20 min 58.2%, 1 h 44.2%, 9 h 35.8%, 1 day 33.7%, 2 days 27.8%, 6 days 25.4%, 31 days 21.1%.",
  "Murre, J. M. J., & Dros, J. (2015). Replication and analysis of Ebbinghaus' forgetting curve. PLOS ONE, 10(7).",
  "Cepeda, N. J., et al. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354–380.",
  "Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. Psychological Science, 17(3), 249–255.",
  "Murdock, B. B. (1962). The serial position effect of free recall. Journal of Experimental Psychology, 64(5), 482–488.",
  "Corbett, A. T., & Anderson, J. R. (1995). Knowledge tracing: Modeling the acquisition of procedural knowledge. User Modeling and User-Adapted Interaction, 4, 253–278.",
];
