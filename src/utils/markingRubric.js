// Assignment marking checklist (founder, 2026-11-01): ten areas per subject, each rated on six levels written in
// full words, plus an optional note. From the ratings we write a one-or-two-paragraph report for the student.
//
// The server keeps one text field for remarks (AssignmentGrade.feedback), so the report, the area ratings and the
// teacher's own remarks are saved together as plain, readable text. readFeedback() turns that text back into parts,
// so the teacher can reopen a marked hand-in and the student page can show the ratings as a list. Old remarks
// written before the checklist simply come back as remarks.

export const LEVELS = ["Unsatisfactory", "Just Satisfactory", "Satisfactory", "Good", "Very Good", "Excellent"];

const AREAS = {
  english: [
    "Grammar", "Spelling", "Punctuation", "Vocabulary", "Sentence variety",
    "Paragraphing and structure", "Understanding of the task", "Content and ideas", "Tone and style", "Presentation and handwriting",
  ],
  urdu: [
    "Grammar (qawaid)", "Spelling (imla)", "Punctuation", "Vocabulary", "Sentence variety",
    "Paragraphing and structure", "Understanding of the task", "Content and ideas", "Style and expression", "Presentation and handwriting",
  ],
  maths: [
    "Understanding of concepts", "Choice of method", "Accuracy of working", "Final answers", "Showing all steps",
    "Use of formulae", "Units and notation", "Diagrams and graphs", "Problem solving", "Presentation and neatness",
  ],
  science: [
    "Subject knowledge", "Scientific terms", "Understanding of concepts", "Applying knowledge", "Calculations and units",
    "Diagrams and labelling", "Data and graphs", "Practical and method skills", "Answering the question asked", "Presentation and neatness",
  ],
  computing: [
    "Subject knowledge", "Technical terms", "Problem solving", "Algorithms and logic", "Code accuracy",
    "Testing and errors", "Data representation", "Applying knowledge", "Answering the question asked", "Presentation and neatness",
  ],
  commerce: [
    "Subject knowledge", "Key terms", "Application to the case", "Analysis", "Evaluation and judgement",
    "Calculations and accuracy", "Use of examples", "Diagrams and graphs", "Answering the question asked", "Structure and presentation",
  ],
  humanities: [
    "Subject knowledge", "Key terms", "Understanding of the question", "Use of evidence and examples", "Explanation",
    "Analysis", "Evaluation and judgement", "Maps, sources and diagrams", "Structure of the answer", "Presentation and handwriting",
  ],
  general: [
    "Subject knowledge", "Understanding of the task", "Accuracy", "Use of key terms", "Explanation",
    "Use of examples", "Effort and completeness", "Structure", "Following instructions", "Presentation and neatness",
  ],
};

const SUBJECT_MATCH = [
  ["urdu", /urdu/i],
  ["english", /english|literature|esl/i],
  ["maths", /math|algebra|statistic|calculus/i],
  ["computing", /computer|computing|\bict\b|information tech/i],
  ["science", /physic|chemi|biolog|science/i],
  ["commerce", /econom|business|account|commerce/i],
  ["humanities", /histor|geograph|pakistan|islam|sociolog|global|religio|law/i],
];

const SUBJECT_LABEL = {
  english: "English", urdu: "Urdu", maths: "Mathematics", science: "Science", computing: "Computer Science",
  commerce: "Business, Economics and Accounts", humanities: "Humanities", general: "General",
};

export function subjectFor(courseTitle) {
  const hit = SUBJECT_MATCH.find(([, re]) => re.test(courseTitle || ""));
  const key = hit ? hit[0] : "general";
  return { key, label: SUBJECT_LABEL[key], areas: AREAS[key] };
}

// A starting mark from the ratings, as a share of the assignment's marks. The teacher still chooses the mark.
const LEVEL_SHARE = [0.3, 0.45, 0.55, 0.68, 0.8, 0.95];
export function suggestedMark(ratings, max) {
  const picked = Object.values(ratings).map((l) => LEVELS.indexOf(l)).filter((i) => i >= 0);
  if (!picked.length || !max) return null;
  const share = picked.reduce((s, i) => s + LEVEL_SHARE[i], 0) / picked.length;
  return Math.max(0, Math.min(max, Math.round(share * max)));
}

// "a, b, and c" with the serial comma, because several area names contain "and" themselves.
const list = (items) => {
  const l = items.map((s) => s.charAt(0).toLowerCase() + s.slice(1));
  if (l.length === 2 && l.some((s) => s.includes(" and "))) return `${l[0]}, and ${l[1]}`;
  if (l.length <= 2) return l.join(" and ");
  return `${l.slice(0, -1).join(", ")}, and ${l[l.length - 1]}`;
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const OVERALL = [
  "This piece of work is unsatisfactory overall and needs a lot more care and effort.",
  "This piece of work is just satisfactory overall. The basics are partly there, but many areas need attention.",
  "This is a satisfactory piece of work overall, with a reasonable grasp of what was asked.",
  "This is a good piece of work overall, showing a sound understanding of the task.",
  "This is a very good piece of work overall, confident and well developed.",
  "This is an excellent piece of work overall, of a very high standard throughout.",
];

// One or two standard paragraphs written to the student from the ratings, in the order the areas appear.
export function writeReport(areas, ratings) {
  const rated = areas.filter((a) => LEVELS.includes(ratings[a]));
  if (!rated.length) return "";
  const idx = (a) => LEVELS.indexOf(ratings[a]);
  const avg = rated.reduce((s, a) => s + idx(a), 0) / rated.length;
  const all = (group) => group.length === rated.length && rated.length > 2;

  const best = rated.filter((a) => idx(a) >= 4);
  const solid = rated.filter((a) => idx(a) === 3);
  const fair = rated.filter((a) => idx(a) === 2);
  const weak = rated.filter((a) => idx(a) <= 1);

  const p1 = [OVERALL[Math.round(avg)]];
  if (all(best)) p1.push("You did well in every area.");
  else if (best.length) p1.push(`You show particular strength in ${list(best)}.`);
  if (all(solid)) p1.push("Every area is at a good level.");
  else if (solid.length) p1.push(`Your ${list(solid)} ${solid.length > 1 ? "are" : "is"} ${best.length ? "also good" : "good"}.`);
  if (!best.length && !solid.length && fair.length && !all(fair)) p1.push(`Your ${list(fair)} ${fair.length > 1 ? "are" : "is"} satisfactory.`);

  const p2 = [];
  if (all(weak)) {
    p2.push("Every area needs work. Read the task again carefully, look at your teacher's notes, and ask for help before your next piece of work.");
  } else if (weak.length) {
    p2.push(`The main areas to improve are ${list(weak)}.`);
    if (fair.length && (best.length || solid.length)) p2.push(`${cap(list(fair))} ${fair.length > 1 ? "are" : "is"} satisfactory but can be lifted further.`);
    p2.push("Go through your teacher's notes, correct these points in your next piece of work, and ask if anything is unclear.");
  } else if (fair.length && (best.length || solid.length)) {
    p2.push(`To move higher, focus next on ${list(fair)}.`);
    p2.push("Keep up your good habits and aim to bring every area up to the same standard.");
  } else if (avg >= 4.5) {
    p2.push("Keep working at this level and keep challenging yourself with harder tasks.");
  } else {
    p2.push("Keep practising regularly to move every area up to the next level.");
  }
  return `${p1.join(" ")}\n\n${p2.join(" ")}`;
}

// --- Saved text format --------------------------------------------------------------------------------------
const H_REPORT = "REPORT";
const H_AREAS = "AREA BY AREA";
const H_REMARKS = "TEACHER'S REMARKS";
const AREA_LINE = new RegExp(`^• (.+?): (${[...LEVELS].sort((a, b) => b.length - a.length).join("|")})(?: — (.*))?$`);

export function buildFeedback({ report, areas, ratings, notes, remarks }) {
  const rated = areas.filter((a) => LEVELS.includes(ratings[a]));
  if (!rated.length && !report.trim()) return remarks.trim();
  const parts = [];
  if (report.trim()) parts.push(`${H_REPORT}\n${report.trim()}`);
  if (rated.length) {
    parts.push(`${H_AREAS}\n${rated.map((a) => `• ${a}: ${ratings[a]}${notes[a]?.trim() ? ` — ${notes[a].trim().replace(/\s+/g, " ")}` : ""}`).join("\n")}`);
  }
  if (remarks.trim()) parts.push(`${H_REMARKS}\n${remarks.trim()}`);
  return parts.join("\n\n");
}

// Returns { report, areas: [{name, level, note}], remarks, structured }.
export function readFeedback(text) {
  const src = String(text || "").replace(/\r\n/g, "\n");
  if (!src.startsWith(`${H_REPORT}\n`) && !src.startsWith(`${H_AREAS}\n`)) {
    return { report: "", areas: [], remarks: src.trim(), structured: false };
  }
  // A heading starts a section when it is the first line or follows a blank line.
  const sections = { [H_REPORT]: [], [H_AREAS]: [], [H_REMARKS]: [] };
  let current = null;
  src.split("\n").forEach((line, i, all) => {
    if (line in sections && (i === 0 || all[i - 1] === "")) current = line;
    else if (current) sections[current].push(line);
  });
  const areas = sections[H_AREAS]
    .map((l) => l.match(AREA_LINE))
    .filter(Boolean)
    .map((m) => ({ name: m[1], level: m[2], note: m[3] || "" }));
  return {
    report: sections[H_REPORT].join("\n").trim(),
    areas,
    remarks: sections[H_REMARKS].join("\n").trim(),
    structured: true,
  };
}

// Colour for each level (text always says the level too).
export const LEVEL_TONE = [
  "border-rose-500/40 bg-rose-500/15 text-rose-300",
  "border-orange-500/40 bg-orange-500/15 text-orange-300",
  "border-amber-500/40 bg-amber-500/15 text-amber-300",
  "border-sky-500/40 bg-sky-500/15 text-sky-300",
  "border-indigo-500/40 bg-indigo-500/15 text-indigo-300",
  "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
];
export const LEVEL_ACTIVE = [
  "border-rose-500 bg-rose-600 text-white",
  "border-orange-500 bg-orange-600 text-white",
  "border-amber-500 bg-amber-600 text-white",
  "border-sky-500 bg-sky-600 text-white",
  "border-indigo-500 bg-indigo-600 text-white",
  "border-emerald-500 bg-emerald-600 text-white",
];
