// Fails the build if src/data/subjectGuides/catalog.js (the small list used by
// the menu and footer) doesn't match the guides in src/data/subjectGuides/index.js,
// or if scripts/prerender.js / generate-sitemap.js miss a guide, or if
// src/data/countryList.js doesn't match the country pages.
// `--print` writes a fresh catalog.js body to stdout instead.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "src/data/subjectGuides");
const index = readFileSync(join(DIR, "index.js"), "utf8");
const files = Object.fromEntries([...index.matchAll(/import (\w+) from "\.\/([\w-]+)";/g)].map((m) => [m[1], m[2]]));
const order = index.match(/SUBJECT_GUIDES = \[([^\]]*)\]/)[1].split(",").map((x) => x.trim()).filter(Boolean);
const guides = [];
for (const name of order) guides.push((await import(pathToFileURL(join(DIR, `${files[name]}.js`)).href)).default);
const rows = guides.map((g) => ({ slug: g.slug, subject: g.subject, level: g.level, code: g.code, ...(g.aliases ? { aliases: g.aliases } : {}) }));

if (process.argv.includes("--print")) {
  console.log(rows.map((r) => `  { slug: "${r.slug}", subject: ${JSON.stringify(r.subject)}, level: "${r.level}", code: "${r.code}"${r.aliases ? `, aliases: ${JSON.stringify(r.aliases)}` : ""} },`).join("\n"));
  process.exit(0);
}

const { GUIDE_CATALOG } = await import(pathToFileURL(join(DIR, "catalog.js")).href);
const problems = [];
if (JSON.stringify(GUIDE_CATALOG) !== JSON.stringify(rows)) problems.push("src/data/subjectGuides/catalog.js is out of step with index.js (run: node scripts/check-guide-catalog.mjs --print)");
for (const r of rows) {
  try { readFileSync(join(ROOT, "public/images/subjects", `${r.slug}.webp`)); } catch { problems.push(`public/images/subjects/${r.slug}.webp (guide photo) is missing`); }
}
for (const f of ["scripts/prerender.js", "scripts/generate-sitemap.js"]) {
  const src = readFileSync(join(ROOT, f), "utf8");
  for (const r of rows) if (!src.includes(`${r.slug}"`)) problems.push(`${f} is missing ${r.slug}`);
}
// The light country list (guides, home page) must match the country pages.
const { COUNTRY_PAGES } = await import(pathToFileURL(join(ROOT, "src/data/countryLandingPages.js")).href);
const { COUNTRY_LIST } = await import(pathToFileURL(join(ROOT, "src/data/countryList.js")).href);
const fullCountries = COUNTRY_PAGES.map((c) => ({ slug: c.slug, name: c.countryName, flagCode: c.flagCode }));
if (JSON.stringify(fullCountries) !== JSON.stringify(COUNTRY_LIST)) problems.push("src/data/countryList.js is out of step with COUNTRY_PAGES in src/data/countryLandingPages.js");

if (problems.length) {
  console.error("Subject guide lists don't match:\n  " + problems.join("\n  "));
  process.exit(1);
}
console.log(`Subject guide lists OK (${rows.length} guides).`);
