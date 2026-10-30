// When each page whose content lives in this repo last changed — the sitemap's
// <lastmod> for subject guides, country pages, About, Privacy and Terms, and
// the shared layout of tutor and course pages.
//
// scripts/page-dates.json stores a fingerprint of each page's content and the
// date it last changed. `npm run build` runs this file: if a page's content is
// different from its stored fingerprint, today's date is saved for that page.
// Commit page-dates.json along with the content change, so the date stays put
// on later deploys. (Vercel builds from a shallow clone, so git history can't
// be used for this; and stamping today's date on every page teaches Google to
// ignore lastmod.)
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STORE = join(ROOT, "scripts/page-dates.json");
const file = (p) => readFileSync(join(ROOT, p), "utf8");
const hash = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);

async function pageContents() {
  const pages = {
    "/about": file("src/pages/public/AboutPage.jsx"),
    "/privacy-policy": file("src/pages/public/PrivacyPolicy.jsx"),
    "/terms": file("src/pages/public/TermsAndConditions.jsx"),
    "/play-area": file("src/pages/public/PlayArea.jsx") + file("src/data/playArea/games.js"),
    "/play-area/personality-test": file("src/pages/public/PersonalityTest.jsx") + file("src/data/playArea/personality.js"),
    // The layout every tutor / course page shares: when it changes, every
    // one of those pages changed (the sitemap takes the newer of this and
    // the backend's updated_at for each page).
    "/teachers/:id": file("src/pages/public/TeacherProfile.jsx"),
    "/courses/:id": file("src/pages/public/CourseDetails.jsx"),
  };
  // A guide or country page is its own content plus the layout every page of
  // that kind shares (so a new section on all guides dates all of them).
  const guideLayout = ["src/pages/public/SubjectGuidePage.jsx", "src/components/subjects/GuideBody.jsx"].map(file).join("");
  const countryLayout = ["src/pages/public/CountryLandingPage.jsx", "src/components/public/CountrySubjects.jsx"].map(file).join("");
  const { GUIDE_CATALOG } = await import(pathToFileURL(join(ROOT, "src/data/subjectGuides/catalog.js")).href);
  for (const g of GUIDE_CATALOG) pages[`/subjects/${g.slug}`] = file(`src/data/subjectGuides/${g.slug}.js`) + guideLayout;
  const { COUNTRY_PAGES } = await import(pathToFileURL(join(ROOT, "src/data/countryLandingPages.js")).href);
  for (const c of COUNTRY_PAGES) pages[`/online-school/${c.slug}`] = JSON.stringify(c) + countryLayout;
  return pages;
}

// Hub pages list their children, so they changed when any child did.
const HUBS = { "/subjects": "/subjects/", "/online-school": "/online-school/" };

/** { loc: "YYYY-MM-DD" } for every tracked page. `write` saves changed fingerprints. */
export async function pageDates({ write = false } = {}) {
  const today = new Date().toISOString().slice(0, 10);
  let store = {};
  try { store = JSON.parse(readFileSync(STORE, "utf8")); } catch { /* first run */ }
  const pages = await pageContents();
  const next = {};
  const changed = [];
  for (const [loc, text] of Object.entries(pages)) {
    const h = hash(text);
    if (store[loc]?.hash === h) next[loc] = store[loc];
    else { next[loc] = { hash: h, date: today }; changed.push(loc); }
  }
  if (write && (changed.length || Object.keys(store).length !== Object.keys(next).length)) {
    writeFileSync(STORE, JSON.stringify(next, null, 2) + "\n");
  }
  const dates = Object.fromEntries(Object.entries(next).map(([loc, v]) => [loc, v.date]));
  for (const [hub, prefix] of Object.entries(HUBS)) {
    dates[hub] = Object.entries(dates).filter(([loc]) => loc.startsWith(prefix)).map(([, d]) => d).sort().pop();
  }
  return { dates, changed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { changed } = await pageDates({ write: true });
  console.log(changed.length
    ? `Page dates: ${changed.length} page(s) changed today, saved in scripts/page-dates.json (commit it): ${changed.join(", ")}`
    : "Page dates OK (no page content changed).");
}
