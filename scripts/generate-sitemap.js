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

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/about", changefreq: "monthly" },
  { loc: "/courses", changefreq: "weekly" },
  { loc: "/teachers", changefreq: "weekly" },
  { loc: "/blogs", changefreq: "daily" },
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
      toEntry: (b) => ({ loc: `/blogs/${b.slug}`, changefreq: "monthly" }),
    },
  );

  const courseEntries = await fetchEntries(
    "courses",
    `${API_BASE_URL}/courses/`,
    {
      filter: (c) => c.id != null,
      toEntry: (c) => ({ loc: `/courses/${c.id}`, changefreq: "weekly" }),
    },
  );

  const teacherEntries = await fetchEntries(
    "teachers",
    `${API_BASE_URL}/courses/teachers/`,
    {
      filter: (t) => t.id != null,
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
