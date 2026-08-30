import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://virtualcityschool.com";
const API_BASE_URL = process.env.VITE_API_BASE_URL || "https://virtualschool.grayphite.com/api/v1";

// Bump this when the country landing page content is meaningfully edited -
// it's the lastmod value Google uses to gauge freshness for these pages,
// since (unlike blogs/courses) they have no API-side updated_at to read.
const COUNTRY_PAGES_LAST_UPDATED = "2026-08-30";

// Today's build date, in UTC. Used only for pages whose content is a live
// aggregate of everything else (the homepage's course list, /courses,
// /teachers, /blogs) - it's honest to say those changed "today" because the
// build did just regenerate them from current data. NOT used for /about,
// /privacy-policy, /terms below: those have no genuine tracked edit date,
// and stamping every deploy's date on a page that didn't actually change
// is exactly the kind of inaccurate lastmod that makes Google start
// ignoring a sitemap's lastmod signal site-wide - better to omit it than
// fake it.
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0", lastmod: BUILD_DATE },
  { loc: "/about", changefreq: "monthly" },
  { loc: "/courses", changefreq: "weekly", lastmod: BUILD_DATE },
  { loc: "/teachers", changefreq: "weekly", lastmod: BUILD_DATE },
  { loc: "/blogs", changefreq: "daily", lastmod: BUILD_DATE },
  { loc: "/privacy-policy", changefreq: "yearly" },
  { loc: "/terms", changefreq: "yearly" },
  { loc: "/online-school", changefreq: "monthly", lastmod: COUNTRY_PAGES_LAST_UPDATED },
  { loc: "/online-school/saudi-arabia", changefreq: "monthly", lastmod: COUNTRY_PAGES_LAST_UPDATED },
  { loc: "/online-school/uae", changefreq: "monthly", lastmod: COUNTRY_PAGES_LAST_UPDATED },
  { loc: "/online-school/qatar", changefreq: "monthly", lastmod: COUNTRY_PAGES_LAST_UPDATED },
  { loc: "/online-school/kuwait", changefreq: "monthly", lastmod: COUNTRY_PAGES_LAST_UPDATED },
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
    return items.filter(mapper.filter).map(mapper.toEntry).map(urlEntry);
  } catch (err) {
    console.error(`Failed to fetch ${label} for sitemap, skipping:`, err.message);
    return [];
  }
}

async function main() {
  const staticEntries = STATIC_PAGES.map(urlEntry);

  const blogEntries = await fetchEntries(
    "blogs",
    `${API_BASE_URL}/blogs/?ordering=-published_at`,
    {
      filter: (b) => b.status === "published" && b.slug,
      // updated_at is the real "last modified" signal when present; fall
      // back to published_at for posts that have never been edited since.
      toEntry: (b) => ({
        loc: `/blogs/${b.slug}`,
        changefreq: "monthly",
        lastmod: (b.updated_at || b.published_at || "").slice(0, 10) || undefined,
      }),
    },
  );

  const courseEntries = await fetchEntries(
    "courses",
    `${API_BASE_URL}/courses/`,
    {
      filter: (c) => c.id != null,
      // The courses API only exposes created_at, not updated_at, so this is
      // "when the course was added," not "when it last changed" - the best
      // real signal available today. Worth asking the backend to add
      // updated_at if course details get edited after creation.
      toEntry: (c) => ({
        loc: `/courses/${c.id}`,
        changefreq: "weekly",
        lastmod: (c.created_at || "").slice(0, 10) || undefined,
      }),
    },
  );

  const teacherEntries = await fetchEntries(
    "teachers",
    `${API_BASE_URL}/courses/teachers/`,
    {
      filter: (t) => t.id != null,
      // No date field at all comes back from this endpoint (checked live:
      // id, teacher_name, avatar, experience, expertise, courses, rating -
      // nothing else), so there's no honest lastmod to set here. Flagging
      // for the backend team rather than fabricating one.
      toEntry: (t) => ({ loc: `/teachers/${t.id}`, changefreq: "monthly" }),
    },
  );

  const allEntries = [...staticEntries, ...courseEntries, ...teacherEntries, ...blogEntries];

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
