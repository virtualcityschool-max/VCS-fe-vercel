// Cambridge exam timetables by administrative zone (one data file per zone,
// generated from Cambridge's PDFs by scripts/parse-cambridge-timetable.py).
// Plain data, safe to import from Node scripts (sitemap, prerender).

export const TIMETABLE_SERIES = "June 2027";
export const TIMETABLE_SERIES_LABEL = "May/June 2027";
// The day the PDFs were downloaded and checked (sitemap lastmod; bump on re-check).
export const TIMETABLE_CHECKED = "2026-11-09";
export const TIMETABLE_BASE_PATH = "/exam-dates/june-2027";
export const TIMETABLE_ZONES = [1, 2, 3, 4, 5, 6];
export const timetablePath = (zone) => `${TIMETABLE_BASE_PATH}/zone-${zone}`;

export const LEVEL_NAMES = {
  IG: "IGCSE",
  "9-1": "IGCSE (9–1)",
  OL: "O Level",
  AS: "AS Level",
  AL: "A Level",
};

// Cambridge's own page where it publishes the timetables and any changes.
export const TIMETABLES_PAGE_URL =
  "https://www.cambridgeinternational.org/exam-administration/cambridge-exams-officers-guide/phase-1-preparation/timetabling-exams/exam-timetables/";
