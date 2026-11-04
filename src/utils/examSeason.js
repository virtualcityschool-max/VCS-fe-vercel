// Which Cambridge exam series are coming up, worked out from the date, so page
// titles always name the next series without anyone editing them. The browser
// works it out on every visit; the pre-built HTML catches up at the next deploy.
//
// Cambridge runs two main series every year: May/June and Oct/Nov (March is
// India only, so it is left out). A series counts as "coming up" until the end
// of its last exam month.

const SERIES = [
  { type: "may-june", label: "May/June", lastMonth: 5 }, // June (0-based month)
  { type: "oct-nov", label: "Oct/Nov", lastMonth: 10 }, // November
];

// The next `count` series from `today`, e.g. on 4 Nov 2026:
// [{ label: "Oct/Nov 2026", year: 2026 }, { label: "May/June 2027", year: 2027 }].
export function upcomingSeries(today = new Date(), count = 2) {
  const out = [];
  for (let year = today.getUTCFullYear(); out.length < count; year += 1) {
    for (const s of SERIES) {
      const ends = Date.UTC(year, s.lastMonth + 1, 1); // first day after the series' last month
      if (ends > today.getTime() && out.length < count) {
        out.push({ type: s.type, year, label: `${s.label} ${year}` });
      }
    }
  }
  return out;
}

// The exam years a guide's syllabus covers from now on, e.g. "2027–2030", read
// from the guide's own syllabusYears text (which comes from Cambridge's syllabus).
// Years already examined are dropped; if none are left, the last year is used.
export function syllabusYearRange(syllabusYearsText, today = new Date()) {
  const years = [...String(syllabusYearsText || "").matchAll(/\b(20\d\d)\b/g)].map((m) => Number(m[1]));
  if (!years.length) return "";
  const from = upcomingSeries(today, 2).find((s) => s.type === "may-june").year;
  const last = Math.max(...years);
  const first = Math.max(Math.min(...years), Math.min(from, last));
  return first === last ? String(last) : `${first}–${last}`;
}

// The Mock Exams page for a syllabus code, or null while the subject has no live
// mock yet (Urdu 9866, listed there under its old code 9686, is "coming soon").
const NO_MOCK_YET = new Set(["9866"]);
export const mockExamsHref = (code) => (NO_MOCK_YET.has(String(code)) ? null : `/mocks/exams/${code}`);
