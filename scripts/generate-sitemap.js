import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { LAST_VERIFIED as EXAM_DATES_LAST_VERIFIED } from "../src/data/examDates.js";
import { pageDates } from "./page-dates.mjs";
import { buildCourseIndex, isThinCourse } from "../src/data/courseRules.js";
import { catalogGuideFor } from "../src/data/subjectGuides/catalog.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://virtualcityschool.com";
const API_BASE_URL = process.env.VITE_API_BASE_URL || "https://virtualschool.grayphite.com/api/v1";

// Last-changed dates of pages whose content lives in this repo (guides,
// countries, About, Privacy, Terms): see scripts/page-dates.mjs.
const { dates: PAGE_DATES, changed: CHANGED_PAGES } = await pageDates();
if (CHANGED_PAGES.length) {
  console.warn(`page-dates.json is out of date for ${CHANGED_PAGES.join(", ")} - using today's date; run npm run build and commit scripts/page-dates.json`);
}
const pageDate = (loc) => {
  if (!PAGE_DATES[loc]) throw new Error(`No page date for ${loc} (add it to scripts/page-dates.mjs)`);
  return PAGE_DATES[loc];
};

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" }, // lastmod: newest of everything, set in main()
  { loc: "/about", changefreq: "monthly", lastmod: pageDate("/about") },
  { loc: "/courses", changefreq: "weekly" }, // lastmod: newest course, set in main()
  { loc: "/teachers", changefreq: "weekly" }, // lastmod: newest tutor page, set in main()
  { loc: "/blogs", changefreq: "daily" }, // lastmod: newest post, set in main()
  { loc: "/privacy-policy", changefreq: "yearly", lastmod: pageDate("/privacy-policy") },
  { loc: "/terms", changefreq: "yearly", lastmod: pageDate("/terms") },
  { loc: "/online-school", changefreq: "monthly", lastmod: pageDate("/online-school") },
  { loc: "/exam-dates", changefreq: "weekly", lastmod: EXAM_DATES_LAST_VERIFIED },
  { loc: "/mind-lab", changefreq: "monthly", lastmod: pageDate("/mind-lab") },
  { loc: "/mind-lab/personality-test", changefreq: "monthly", lastmod: pageDate("/mind-lab/personality-test") },
  { loc: "/mind-lab/workplace-assessment", changefreq: "monthly", lastmod: pageDate("/mind-lab/workplace-assessment") },
  { loc: "/mind-lab/star-signs", changefreq: "monthly", lastmod: pageDate("/mind-lab/star-signs") },
  { loc: "/mind-lab/memory-challenge", changefreq: "monthly", lastmod: pageDate("/mind-lab/memory-challenge") },
  { loc: "/mind-lab/brain-teasers", changefreq: "monthly", lastmod: pageDate("/mind-lab/brain-teasers") },
  { loc: "/mind-lab/smart-revision", changefreq: "monthly", lastmod: pageDate("/mind-lab/smart-revision") },
  { loc: "/mind-lab/smart-notes", changefreq: "monthly", lastmod: pageDate("/mind-lab/smart-notes") },
  { loc: "/mind-lab/career-interests", changefreq: "monthly", lastmod: pageDate("/mind-lab/career-interests") },
  { loc: "/mind-lab/eq-check", changefreq: "monthly", lastmod: pageDate("/mind-lab/eq-check") },
  { loc: "/mind-lab/reasoning-test", changefreq: "monthly", lastmod: pageDate("/mind-lab/reasoning-test") },
  { loc: "/mind-lab/aptitude-practice", changefreq: "monthly", lastmod: pageDate("/mind-lab/aptitude-practice") },
  // Subject guides — keep in step with src/data/subjectGuides and scripts/prerender.js
  { loc: "/subjects", changefreq: "monthly", lastmod: pageDate("/subjects") },
  { loc: "/subjects/mathematics-4024", changefreq: "monthly", lastmod: pageDate("/subjects/mathematics-4024") },
  { loc: "/subjects/additional-mathematics-4037", changefreq: "monthly", lastmod: pageDate("/subjects/additional-mathematics-4037") },
  { loc: "/subjects/physics-5054", changefreq: "monthly", lastmod: pageDate("/subjects/physics-5054") },
  { loc: "/subjects/chemistry-5070", changefreq: "monthly", lastmod: pageDate("/subjects/chemistry-5070") },
  { loc: "/subjects/biology-5090", changefreq: "monthly", lastmod: pageDate("/subjects/biology-5090") },
  { loc: "/subjects/mathematics-9709", changefreq: "monthly", lastmod: pageDate("/subjects/mathematics-9709") },
  { loc: "/subjects/physics-9702", changefreq: "monthly", lastmod: pageDate("/subjects/physics-9702") },
  { loc: "/subjects/chemistry-9701", changefreq: "monthly", lastmod: pageDate("/subjects/chemistry-9701") },
  { loc: "/subjects/biology-9700", changefreq: "monthly", lastmod: pageDate("/subjects/biology-9700") },
  { loc: "/subjects/english-1123", changefreq: "monthly", lastmod: pageDate("/subjects/english-1123") },
  { loc: "/subjects/english-9093", changefreq: "monthly", lastmod: pageDate("/subjects/english-9093") },
  { loc: "/subjects/computer-science-2210", changefreq: "monthly", lastmod: pageDate("/subjects/computer-science-2210") },
  { loc: "/subjects/computer-science-9618", changefreq: "monthly", lastmod: pageDate("/subjects/computer-science-9618") },
  { loc: "/subjects/islamiyat-2058", changefreq: "monthly", lastmod: pageDate("/subjects/islamiyat-2058") },
  { loc: "/subjects/pakistan-studies-2059", changefreq: "monthly", lastmod: pageDate("/subjects/pakistan-studies-2059") },
  { loc: "/subjects/urdu-3248", changefreq: "monthly", lastmod: pageDate("/subjects/urdu-3248") },
  { loc: "/subjects/urdu-3247", changefreq: "monthly", lastmod: pageDate("/subjects/urdu-3247") },
  { loc: "/subjects/urdu-9866", changefreq: "monthly", lastmod: pageDate("/subjects/urdu-9866") },
  { loc: "/online-school/saudi-arabia", changefreq: "monthly", lastmod: pageDate("/online-school/saudi-arabia") },
  { loc: "/online-school/uae", changefreq: "monthly", lastmod: pageDate("/online-school/uae") },
  { loc: "/online-school/qatar", changefreq: "monthly", lastmod: pageDate("/online-school/qatar") },
  { loc: "/online-school/kuwait", changefreq: "monthly", lastmod: pageDate("/online-school/kuwait") },
  { loc: "/online-school/bahrain", changefreq: "monthly", lastmod: pageDate("/online-school/bahrain") },
  { loc: "/online-school/oman", changefreq: "monthly", lastmod: pageDate("/online-school/oman") },
  { loc: "/online-school/uk", changefreq: "monthly", lastmod: pageDate("/online-school/uk") },
  { loc: "/online-school/us", changefreq: "monthly", lastmod: pageDate("/online-school/us") },
  { loc: "/online-school/canada", changefreq: "monthly", lastmod: pageDate("/online-school/canada") },
  { loc: "/online-school/australia", changefreq: "monthly", lastmod: pageDate("/online-school/australia") },
  { loc: "/online-school/pakistan", changefreq: "monthly", lastmod: pageDate("/online-school/pakistan") },
];

function urlEntry({ loc, changefreq, priority, lastmod }) {
  let entry = `<url><loc>${SITE_URL}${loc}</loc>`;
  if (lastmod) entry += `<lastmod>${lastmod}</lastmod>`;
  if (changefreq) entry += `<changefreq>${changefreq}</changefreq>`;
  if (priority) entry += `<priority>${priority}</priority>`;
  entry += `</url>`;
  return entry;
}

async function fetchEntries(label, url, mapper) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${label} API returned ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.results || [];
    return items.filter(mapper.filter).map(mapper.toEntry);
  } catch (err) {
    console.error(`Failed to fetch ${label} for sitemap, skipping:`, err.message);
    return [];
  }
}

const day = (iso) => (iso || "").slice(0, 10) || undefined;
const later = (a, b) => [a, b].filter(Boolean).sort().pop();
const newest = (entries) => entries.map((e) => e.lastmod).filter(Boolean).sort().pop();
const setLastmod = (loc, lastmod) => {
  const page = STATIC_PAGES.find((p) => p.loc === loc);
  if (lastmod) page.lastmod = lastmod;
};

async function main() {
  const blogEntries = await fetchEntries(
    "blogs",
    `${API_BASE_URL}/blogs/?ordering=-published_at`,
    {
      filter: (b) => b.status === "published" && b.slug,
      // updated_at is the real "last modified" signal when present; fall
      // back to published_at for posts that have never been edited since.
      toEntry: (b) => ({ loc: `/blogs/${b.slug}`, changefreq: "monthly", lastmod: day(b.updated_at || b.published_at) }),
    },
  );

  // Thin courses (noindex) and second class batches (canonical → the main
  // batch) stay out of the sitemap: src/data/courseRules.js.
  const courseRows = await fetchEntries("courses", `${API_BASE_URL}/courses/`, { filter: () => true, toEntry: (c) => c });
  const courseIndex = buildCourseIndex(courseRows);
  const batchCopy = new Set(courseIndex.filter((x) => x.canonical).map((x) => x.id));
  if (courseIndex.length) {
    // The course page reads this list for its links (same level, AS ↔ A2,
    // the teacher's other courses) and the batch canonical. Kept in git so a
    // local build without the API still works; refreshed on every deploy.
    const slim = courseIndex.map((x) => { const row = { ...x }; delete row.words; return row; });
    writeFileSync(join(__dirname, "..", "src", "data", "courseIndex.json"), JSON.stringify(slim, null, 0).replace(/\},\{/g, "},\n{") + "\n");
  }

  const courseEntries = await fetchEntries(
    "courses",
    `${API_BASE_URL}/courses/`,
    {
      filter: (c) => c.id != null && !batchCopy.has(c.id) && !isThinCourse(c, Boolean(catalogGuideFor(c))),
      // Newer of: the course's last edit (created_at as fallback) and the
      // last change to the course page layout (scripts/page-dates.mjs).
      toEntry: (c) => ({ loc: `/courses/${c.id}`, changefreq: "weekly", lastmod: later(day(c.updated_at || c.created_at), pageDate("/courses/:id")) }),
    },
  );

  const teacherEntries = await fetchEntries(
    "teachers",
    `${API_BASE_URL}/courses/teachers/`,
    {
      // Tutors with no published course are noindex (TeacherProfile.jsx).
      filter: (t) => t.id != null && (t.courses || []).length > 0,
      // updated_at = newest of: joined, last profile edit, last edit of a
      // subject shown on the tutor page (worked out by the backend), or the
      // last change to the tutor page layout, whichever is newer.
      toEntry: (t) => ({ loc: `/teachers/${t.id}`, changefreq: "monthly", lastmod: later(day(t.updated_at), pageDate("/teachers/:id")) }),
    },
  );

  // List pages changed when the newest thing on them did; the home page
  // shows a bit of everything.
  setLastmod("/courses", newest(courseEntries));
  setLastmod("/teachers", newest(teacherEntries));
  setLastmod("/blogs", newest(blogEntries));
  setLastmod("/", newest([...STATIC_PAGES.filter((p) => p.loc !== "/"), ...courseEntries, ...teacherEntries, ...blogEntries]));

  const staticEntries = STATIC_PAGES.map(urlEntry);
  const allEntries = [...staticEntries, ...[...courseEntries, ...teacherEntries, ...blogEntries].map(urlEntry)];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.join("\n")}
</urlset>
`;

  writeFileSync(join(__dirname, "..", "public", "sitemap.xml"), xml);
  console.log(
    `sitemap.xml written with ${allEntries.length} URLs ` +
      `(${staticEntries.length} static, ${courseEntries.length} courses, ${teacherEntries.length} teachers, ${blogEntries.length} blogs)`,
  );
}

main();
