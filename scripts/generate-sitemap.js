import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://virtualcityschool.com";
const API_BASE_URL = process.env.VITE_API_BASE_URL || "https://virtualschool.grayphite.com/api/v1";

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/about", changefreq: "monthly" },
  { loc: "/courses", changefreq: "weekly" },
  { loc: "/teachers", changefreq: "weekly" },
  { loc: "/blogs", changefreq: "daily" },
];

function urlEntry({ loc, changefreq, priority }) {
  let entry = `<url><loc>${SITE_URL}${loc}</loc>`;
  if (changefreq) entry += `<changefreq>${changefreq}</changefreq>`;
  if (priority) entry += `<priority>${priority}</priority>`;
  entry += `</url>`;
  return entry;
}

async function main() {
  const staticEntries = STATIC_PAGES.map(urlEntry);
  let blogEntries = [];

  try {
    const res = await fetch(`${API_BASE_URL}/blogs/?ordering=-published_at`);
    if (!res.ok) throw new Error(`Blogs API returned ${res.status}`);
    const blogs = await res.json();
    blogEntries = blogs
      .filter((b) => b.status === "published" && b.slug)
      .map((b) => urlEntry({ loc: `/blogs/${b.slug}` }));
  } catch (err) {
    console.error("Failed to fetch blogs for sitemap, keeping static pages only:", err.message);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...blogEntries].join("\n")}
</urlset>
`;

  writeFileSync(join(__dirname, "..", "public", "sitemap.xml"), xml);
  console.log(`sitemap.xml written with ${staticEntries.length + blogEntries.length} URLs`);
}

main();
