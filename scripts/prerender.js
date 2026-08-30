// Prerenders public marketing pages into real static HTML after `vite build`,
// so crawlers that don't execute JavaScript see actual content instead of an
// empty <div id="root"></div>.
//
// How it fits together:
//   1. vite build produces dist/index.html - the plain SPA shell.
//   2. We copy that shell to dist/shell.html BEFORE touching anything, so
//      there's a permanent, never-rendered fallback for routes we don't
//      prerender (the authenticated app: /admin, /teacher, /student, /parent,
//      /profile, and anything not in ROUTES below).
//   3. vercel.json's catch-all rewrite is pointed at /shell.html instead of
//      /index.html, so those routes keep working exactly as before.
//   4. We serve dist/ locally, visit each public route in headless Chrome,
//      wait for the real app to fetch its data and render, and overwrite
//      that route's directory with the resulting HTML (dist/index.html for
//      "/", dist/courses/305/index.html for "/courses/305", etc.). Vercel
//      serves static files before falling back to a rewrite, so these take
//      priority automatically - no other vercel.json changes needed.
//
// Nothing about the authenticated app (admin/teacher/student/parent) changes:
// those routes are intentionally left out of ROUTES and keep loading via the
// client-only shell, same as before this script existed.

import { createServer } from "node:http";
import { existsSync, copyFileSync, mkdirSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

// Vercel's build environment blocks npm postinstall scripts by default
// (supply-chain protection), so plain `puppeteer` never gets to download its
// bundled Chromium there and puppeteer.launch() fails. `puppeteer-core` +
// `@sparticuz/chromium` need no postinstall download at all - a prebuilt
// binary made for exactly this kind of CI/serverless Linux environment - so
// that combination is what actually runs during the real Vercel build.
// Locally (no VERCEL env var) we just use the full `puppeteer` package and
// its already-downloaded local Chromium, which is faster to iterate with.
const ON_VERCEL = !!process.env.VERCEL;
const { default: puppeteer } = ON_VERCEL
  ? await import("puppeteer-core")
  : await import("puppeteer");
const chromium = ON_VERCEL ? (await import("@sparticuz/chromium")).default : null;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const API_BASE_URL = process.env.VITE_API_BASE_URL || "https://virtualschool.grayphite.com/api/v1";
const SITE_URL = "https://virtualcityschool.com";
const PORT = 4321;
const ORIGIN = `http://localhost:${PORT}`;
const CONCURRENCY = 4;
const NAV_TIMEOUT_MS = 30000;
const SETTLE_MS = 400; // small buffer after networkidle for final paint/DOM updates

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.results || [];
}

// Country landing pages are static content committed to the repo, not
// CMS-driven data - unlike courses/teachers/blogs below, they don't need
// the API to exist and are never stale between deploys.
const COUNTRY_LANDING_SLUGS = ["saudi-arabia", "uae", "qatar", "kuwait"];

async function buildRouteList() {
  const routes = [
    "/", "/courses", "/teachers", "/blogs", "/about", "/privacy-policy", "/terms",
    "/online-school",
    ...COUNTRY_LANDING_SLUGS.map((slug) => `/online-school/${slug}`),
    "/exam-dates",
  ];

  try {
    const courses = await fetchJson(`${API_BASE_URL}/courses/`);
    for (const c of courses) if (c.id != null) routes.push(`/courses/${c.id}`);
    console.log(`  + ${courses.length} course pages`);
  } catch (err) {
    console.error("  ! could not fetch courses, skipping course pages:", err.message);
  }

  try {
    const teachers = await fetchJson(`${API_BASE_URL}/courses/teachers/`);
    for (const t of teachers) if (t.id != null) routes.push(`/teachers/${t.id}`);
    console.log(`  + ${teachers.length} teacher pages`);
  } catch (err) {
    console.error("  ! could not fetch teachers, skipping teacher pages:", err.message);
  }

  try {
    const blogs = await fetchJson(`${API_BASE_URL}/blogs/?ordering=-published_at`);
    const published = blogs.filter((b) => b.status === "published" && b.slug);
    for (const b of published) routes.push(`/blogs/${b.slug}`);
    console.log(`  + ${published.length} blog/vlog pages`);
  } catch (err) {
    console.error("  ! could not fetch blogs, skipping blog pages:", err.message);
  }

  return routes;
}

// Minimal static file server for dist/, falling back to the ORIGINAL
// (pre-prerender) shell HTML for any path with no matching file - so the
// headless browser always gets a fresh, un-rendered SPA shell to boot from,
// never a page we already overwrote earlier in this same run.
function startServer(shellHtml) {
  const mimeTypes = {
    ".js": "text/javascript", ".css": "text/css", ".html": "text/html",
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml", ".otf": "font/otf", ".json": "application/json",
    ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain",
  };
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split("?")[0]);
      const filePath = join(DIST, urlPath);
      const ext = extname(filePath);
      if (ext && existsSync(filePath) && statSync(filePath).isFile()) {
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
        res.end(readFileSync(filePath));
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(shellHtml);
    });
    server.listen(PORT, () => resolve(server));
  });
}

function routeToOutputFile(route) {
  if (route === "/") return join(DIST, "index.html");
  return join(DIST, route.replace(/^\//, ""), "index.html");
}

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  try {
    await page.goto(`${ORIGIN}${route}`, { waitUntil: "networkidle0", timeout: NAV_TIMEOUT_MS });
    await new Promise((r) => setTimeout(r, SETTLE_MS));
    // useSeo() reads window.location.href for canonical/OG URLs, which during
    // this crawl is the local server - rewrite it to the real production
    // origin before writing the file, or every prerendered page's canonical
    // and og:url would point at an unreachable localhost address.
    const rawHtml = await page.content();
    const html = "<!doctype html>\n" + rawHtml.split(ORIGIN).join(SITE_URL);
    const outFile = routeToOutputFile(route);
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, html);
    return { route, ok: true };
  } catch (err) {
    return { route, ok: false, error: err.message };
  } finally {
    await page.close();
  }
}

async function runPool(items, worker, concurrency) {
  const results = [];
  let i = 0;
  async function next() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
}

async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    console.error("dist/index.html not found - run `vite build` before this script.");
    process.exit(1);
  }

  // Preserve the original, never-rendered shell for routes we don't prerender.
  const shellPath = join(DIST, "shell.html");
  copyFileSync(join(DIST, "index.html"), shellPath);
  const shellHtml = readFileSync(shellPath, "utf-8");

  console.log("Discovering routes to prerender...");
  const routes = await buildRouteList();
  console.log(`Prerendering ${routes.length} routes...`);

  const server = await startServer(shellHtml);
  const browser = ON_VERCEL
    ? await puppeteer.launch({
        headless: true,
        args: chromium.args,
        executablePath: await chromium.executablePath(),
      })
    : await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });

  const results = await runPool(routes, (route) => prerenderRoute(browser, route), CONCURRENCY);

  await browser.close();
  await new Promise((resolve) => server.close(resolve));

  const failed = results.filter((r) => !r.ok);
  const ok = results.filter((r) => r.ok);
  console.log(`Prerendered ${ok.length}/${routes.length} routes.`);
  if (failed.length) {
    console.warn(`${failed.length} route(s) failed and kept their client-rendered shell:`);
    for (const f of failed) console.warn(`  - ${f.route}: ${f.error}`);
  }
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
