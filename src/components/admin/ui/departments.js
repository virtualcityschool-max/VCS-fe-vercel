// Subject departments used across admin pages (colours from the redesign).
// A subject's department is guessed from its title and Cambridge code.
export const DEPARTMENTS = [
  { id: "mathematics", name: "Mathematics", hex: "#6366F1", keywords: ["math", "add math", "statistics", "0580", "4024", "4037", "9709", "0606"] },
  { id: "physics", name: "Physics", hex: "#0284C7", keywords: ["physics", "0625", "5054", "9702"] },
  { id: "chemistry", name: "Chemistry", hex: "#059669", keywords: ["chemistry", "0620", "5070", "9701"] },
  { id: "biology", name: "Biology", hex: "#16A34A", keywords: ["biology", "0610", "5090", "9700"] },
  { id: "english_urdu", name: "English & Urdu", hex: "#D97706", keywords: ["english", "urdu", "literature", "1123", "0500", "3248", "ielts"] },
  { id: "computer_science", name: "Computer Science", hex: "#9333EA", keywords: ["computer", "programming", "coding", "python", "ict", "0478", "2210", "9618"] },
  { id: "general", name: "General & Islamic", hex: "#E11D48", keywords: [] },
];

const GENERAL = DEPARTMENTS[DEPARTMENTS.length - 1];

export const departmentOf = (title = "") => {
  const t = title.toLowerCase();
  return DEPARTMENTS.find((d) => d.keywords.some((k) => t.includes(k))) || GENERAL;
};

// Most common department across a list of subject titles (null if empty).
export const mainDepartment = (titles = []) => {
  if (!titles.length) return null;
  const counts = new Map();
  titles.forEach((t) => {
    const d = departmentOf(t);
    counts.set(d.id, (counts.get(d.id) || 0) + 1);
  });
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  return DEPARTMENTS.find((d) => d.id === top);
};
