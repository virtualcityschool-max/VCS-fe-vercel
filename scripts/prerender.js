/* global process */
// Prerenders public marketing pages into real static HTML after `vite build`,
// so crawlers that don't execute JavaScript see actual content instead of an
// empty <div id="root"></div>.
//
// How it fits together:
//   1. vite build produces dist/index.html - the plain SPA shell.
//   2. We copy that shell to dist/shell.html BEFORE touching anything, so
//      there's a permanent, never-rendered fallback for routes we don't
//      prerender (the authenticated app: /admin, /teacher, /student, /parent,
//      /profile).
//   3. vercel.json rewrites those known route prefixes (plus dynamic
//      /courses/:id, /blogs/:slug etc. for records too new to be in this
//      run's ROUTES list) to /shell.html instead of /index.html. Anything
//      NOT matching one of those prefixes has no rewrite and no static
//      file, so Vercel serves public/404.html with a real 404 status -
//      unmatched paths no longer silently 200 as the homepage.
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
import { existsSync, mkdirSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { TIMETABLE_ZONES, timetablePath } from "../src/data/examTimetable/index.js";

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
const STATE_ROUTES = /^\/(courses|teachers)\/?$/;
const SETTLE_MS = 400; // small buffer after networkidle for final paint/DOM updates
// Google Ads / Tag Manager addresses: blocked while pre-building, and any tag
// they add is removed from the saved HTML (index.html loads them later itself).
const AD_HOSTS = /^https?:\/\/([a-z0-9-]+\.)*(googletagmanager|doubleclick|googleadservices|google-analytics)\.(com|net)\//i;
const AD_SCRIPT_TAG = /<script\b[^>]*\bsrc="https?:\/\/([a-z0-9-]+\.)*(googletagmanager|doubleclick|googleadservices|google-analytics)\.(com|net)\/[^"]*"[^>]*><\/script>/gi;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.results || [];
}

// Country landing pages are static content committed to the repo, not
// CMS-driven data - unlike courses/teachers/blogs below, they don't need
// the API to exist and are never stale between deploys.
const COUNTRY_LANDING_SLUGS = [
  "saudi-arabia", "uae", "qatar", "kuwait", "bahrain", "oman",
  "uk", "us", "canada", "australia", "pakistan",
];

// Subject guides (src/data/subjectGuides) — keep in step with SUBJECT_GUIDES there
// and with generate-sitemap.js.
const SUBJECT_GUIDE_SLUGS = [
  "mathematics-4024", "additional-mathematics-4037", "physics-5054", "chemistry-5070", "biology-5090", "mathematics-9709", "physics-9702", "chemistry-9701", "biology-9700",
  "english-1123", "english-9093", "computer-science-2210", "computer-science-9618", "islamiyat-2058", "pakistan-studies-2059", "urdu-3248", "urdu-3247", "urdu-9866",
];

async function buildRouteList() {
  const routes = [
    "/", "/courses", "/teachers", "/blogs", "/about", "/privacy-policy", "/terms",
    "/online-school",
    ...COUNTRY_LANDING_SLUGS.map((slug) => `/online-school/${slug}`),
    "/exam-dates",
    ...TIMETABLE_ZONES.map((z) => timetablePath(z)),
    "/online-o-level", "/online-a-level", "/private-candidate",
    "/mind-lab", "/mind-lab/personality-test", "/mind-lab/16-personalities", "/mind-lab/workplace-assessment", "/mind-lab/star-signs", "/mind-lab/memory-challenge", "/mind-lab/brain-teasers", "/mind-lab/smart-revision", "/mind-lab/smart-notes", "/mind-lab/learning-domains", "/mind-lab/smart-learning", "/mind-lab/career-interests", "/mind-lab/eq-check", "/mind-lab/reasoning-test", "/mind-lab/aptitude-practice",
    "/subjects",
    ...SUBJECT_GUIDE_SLUGS.map((slug) => `/subjects/${slug}`),
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
    ".webp": "image/webp", ".woff2": "font/woff2",
  };
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split("?")[0]);
      // Vercel's image resizer only exists on Vercel. Send the browser to the
      // original picture instead, so the picture loads and the page keeps the
      // resized link in its HTML (a failed load would swap in the original).
      if (urlPath === "/_vercel/image") {
        const target = new URL(req.url, ORIGIN).searchParams.get("url") || "";
        if (/^https:\/\/virtual-city-school\.s3\.us-east-2\.amazonaws\.com\//.test(target)) {
          res.writeHead(302, { Location: target });
          res.end();
          return;
        }
      }
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

// SF Pro Regular and Bold cut down to basic Latin (7-8 KB each, made with
// pyftsubset from the full files), written into each pre-built page. The
// first paint then uses SF Pro's own letter shapes and sizes on every device,
// so the app's redraw a moment later (once the full files have loaded) is
// the same size, and Google counts the page as loaded at the first paint.
// With the device's own font the redraw came out bigger: LCP 3.9 s.
// font-display: block: the font is already in the page, so text waits only
// the few milliseconds the browser needs to unpack it (with swap it painted
// in the device's font first when the page was drawn very early).
const INLINE_FONTS = [["SF-Pro-Display-Regular-latin.woff2", "100 500"], ["SF-Pro-Display-Bold-latin.woff2", "600 900"]]
  .map(([file, weight]) => `@font-face{font-family:"SF Pro Inline";src:url(data:font/woff2;base64,${readFileSync(join(ROOT, "public/fonts", file)).toString("base64")}) format("woff2");font-weight:${weight};font-style:normal;font-display:block}`)
  .join("");

// Browsers unpack a font only when text first needs it, which here was the
// moment the full SF Pro file timed out: too late for the first paint. Start
// both straight away.
const INLINE_FONTS_LOAD = `<script>document.fonts&&document.fonts.load&&(document.fonts.load('400 16px "SF Pro Inline"'),document.fonts.load('900 16px "SF Pro Inline"'))</script>`;

const MAIN_CSS_LINK = /<link rel="stylesheet" crossorigin(?:="")? href="(\/assets\/index-[\w-]+\.css)">/;

// Runs inside the page: the rules of the site stylesheet that style something
// on this page, in day or night mode (hover/focus states and ::before/::after
// count as matching). Everything else (portals, admin, modals) comes with the
// full stylesheet a moment later.
function pageCriticalCss() {
  const sheet = [...document.styleSheets].find((s) => s.href && /\/assets\/index-[\w-]+\.css/.test(s.href));
  if (!sheet) return null;
  const DYNAMIC = /(?<!\\)::?(?:hover|focus-visible|focus-within|focus|active|visited|target|checked|disabled|enabled|placeholder-shown|autofill|invalid|valid|user-invalid|open|popover-open|before|after|placeholder|selection|marker|file-selector-button|backdrop|first-letter|first-line|-webkit-[a-z-]+|-moz-[a-z-]+)(?![\w-])/g;
  const splitList = (sel) => {
    const parts = []; let depth = 0, start = 0;
    for (let i = 0; i < sel.length; i++) {
      const c = sel[i];
      if (c === "\\") { i++; continue; }
      if (c === "(") depth++;
      else if (c === ")") depth--;
      else if (c === "," && depth === 0) { parts.push(sel.slice(start, i)); start = i + 1; }
    }
    parts.push(sel.slice(start));
    return parts;
  };
  const styleRules = [];
  const collect = (rules) => { for (const r of rules) { if (r instanceof CSSStyleRule) styleRules.push(r); else if (r.cssRules) collect(r.cssRules); } };
  collect(sheet.cssRules);
  const keep = new Set();
  const html = document.documentElement;
  const wasLight = html.classList.contains("theme-light");
  for (const light of [true, false]) {
    html.classList.toggle("theme-light", light);
    for (const r of styleRules) {
      if (keep.has(r)) continue;
      const hit = splitList(r.selectorText).some((part) => {
        let s = part.replace(DYNAMIC, "").trim();
        if (!s || /[>+~]$/.test(s)) s += "*";
        try { return !!document.querySelector(s); } catch { return true; }
      });
      if (hit) keep.add(r);
    }
  }
  html.classList.toggle("theme-light", wasLight);
  const keyframes = [];
  const write = (rules) => {
    let out = "";
    for (const r of rules) {
      if (r instanceof CSSStyleRule) { if (keep.has(r)) out += r.cssText; }
      else if (r instanceof CSSKeyframesRule) keyframes.push(r);
      else if (r instanceof CSSMediaRule || r instanceof CSSSupportsRule || r instanceof CSSLayerBlockRule) {
        const inner = write(r.cssRules);
        if (!inner) continue;
        const head = r instanceof CSSMediaRule ? `@media ${r.conditionText}`
          : r instanceof CSSSupportsRule ? `@supports ${r.conditionText}` : `@layer${r.name ? " " + r.name : ""}`;
        out += `${head}{${inner}}`;
      } else out += r.cssText; // @layer order, @property, @font-face
    }
    return out;
  };
  let css = write(sheet.cssRules);
  for (const k of keyframes) if (new RegExp(`\\b${k.name}\\b`).test(css)) css += k.cssText;
  return css;
}

// Runs inside the page, after React has drawn it. Writes into the DOM what
// React's own server rendering would have written, so the visitor's browser
// can adopt the saved HTML (hydrateRoot) instead of deleting and redrawing it.
// The redraw made Chrome count the page's main text as new: Google's LCP
// landed after the app had started (4 s instead of 1 s).
//  - <!--$--> ... <!--/$--> around what each Suspense boundary shows;
//  - <!-- --> between two text nodes React made separately (the saved HTML
//    would otherwise read them back as one);
//  - data-prebuilt on #root, which src/main.jsx checks.
function markForHydration() {
  const container = document.getElementById("root");
  const key = container && Object.keys(container).find((k) => k.startsWith("__reactContainer$"));
  if (!key) return false;
  const HOST = new Set([5, 6, 26, 27]); // HostComponent, HostText, HostHoistable, HostSingleton
  const PORTAL = 4, SUSPENSE = 13, HOST_ROOT = 3;
  const hostNodes = (first) => {
    const out = [];
    const visit = (f) => { for (let c = f; c; c = c.sibling) { if (HOST.has(c.tag)) out.push(c.stateNode); else if (c.tag !== PORTAL) visit(c.child); } };
    visit(first);
    return out;
  };
  const selfHostNodes = (f) => (HOST.has(f.tag) ? [f.stateNode] : f.tag === PORTAL ? [] : hostNodes(f.child));
  const parentDom = (f) => {
    for (let p = f.return; p; p = p.return) { if (p.tag === 5 || p.tag === 27) return p.stateNode; if (p.tag === HOST_ROOT) return p.stateNode.containerInfo; if (p.tag === PORTAL) return null; }
    return null;
  };
  const nextHostNode = (f) => {
    for (let cur = f; cur; cur = cur.return) {
      for (let s = cur.sibling; s; s = s.sibling) { const n = selfHostNodes(s); if (n.length) return n[0]; }
      const up = cur.return;
      if (!up || HOST.has(up.tag) || up.tag === HOST_ROOT || up.tag === PORTAL) return null;
    }
    return null;
  };
  const boundaries = [];
  const walk = (f) => { for (let c = f; c; c = c.sibling) { if (c.tag === PORTAL) continue; if (c.tag === SUSPENSE) boundaries.push(c); walk(c.child); } };
  walk(container[key].child);
  for (const b of boundaries) {
    const shown = b.memoizedState === null;
    const nodes = shown ? hostNodes(b.child) : [];
    const start = document.createComment(shown ? "$" : "$!");
    const end = document.createComment("/$");
    if (nodes.length) {
      nodes[0].parentNode.insertBefore(start, nodes[0]);
      nodes[nodes.length - 1].parentNode.insertBefore(end, nodes[nodes.length - 1].nextSibling);
    } else {
      const parent = parentDom(b);
      if (!parent) continue;
      const next = nextHostNode(b);
      parent.insertBefore(start, next && next.parentNode === parent ? next : null);
      parent.insertBefore(end, start.nextSibling);
    }
  }
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const texts = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.previousSibling && n.previousSibling.nodeType === 3) texts.push(n);
  for (const t of texts) t.parentNode.insertBefore(document.createComment(" "), t);
  container.setAttribute("data-prebuilt", "1");
  return true;
}

function routeToOutputFile(route) {
  if (route === "/") return join(DIST, "index.html");
  return join(DIST, route.replace(/^\//, ""), "index.html");
}

async function prerenderRoute(browser, route, timeout = NAV_TIMEOUT_MS) {
  const page = await browser.newPage();
  try {
    // Tell the app it is being pre-built for the live site (imageCdn.js then
    // writes resized picture links into the HTML, not the full-size originals).
    await page.evaluateOnNewDocument(() => { window.__VCS_PRERENDER__ = true; });
    // Every code file the page needed, so the HTML can ask for them all at once.
    const scripts = new Set();
    // Google's ad tag never runs here: it would be saved into the page (so every
    // visitor downloaded it at once, before index.html's delayed loader) and it
    // sent Google Ads a visit from "localhost" on every build.
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = req.url();
      if (AD_HOSTS.test(url)) { req.abort(); return; }
      if (req.resourceType() === "script" && url.startsWith(`${ORIGIN}/assets/`)) scripts.add(url.slice(ORIGIN.length));
      req.continue();
    });
    await page.goto(`${ORIGIN}${route}`, { waitUntil: "networkidle0", timeout });
    await new Promise((r) => setTimeout(r, SETTLE_MS));
    // List pages: the data they were drawn with (everything but sign-in and UI
    // state), so the app's first drawing in the visitor's browser already has
    // the list and the page doesn't jump (was CLS 0.86 on /teachers). Only
    // these pages: it adds ~50-70 KB compressed to their HTML.
    const stateJson = !STATE_ROUTES.test(route) ? null : await page.evaluate(() => {
      const s = window.__VCS_STORE__ && window.__VCS_STORE__.getState();
      if (!s) return null;
      // not sign-in/UI state, nor slices that load later with their own area
      const { auth: _a, ui: _u, admin: _ad, parent: _p, approvals: _ap, childLinks: _c, hire: _h, ...rest } = s;
      return JSON.stringify(rest);
    });
    // useSeo() reads window.location.href for canonical/OG URLs, which during
    // this crawl is the local server - rewrite it to the real production
    // origin before writing the file, or every prerendered page's canonical
    // and og:url would point at an unreachable localhost address.
    const criticalCss = await page.evaluate(pageCriticalCss);
    // Last DOM change before saving: React's markers, so the app can adopt
    // this HTML instead of redrawing it (see markForHydration).
    await page.evaluate(markForHydration);
    const rawHtml = await page.content();
    // Never publish the error screen as the page's content.
    if (rawHtml.includes("We encountered an unexpected error")) throw new Error("page showed the error screen");
    // The visitor's own day/night choice is applied by index.html's inline
    // script; don't bake the renderer's (light) setting into the page.
    const html = "<!doctype html>\n" + rawHtml.split(ORIGIN).join(SITE_URL).replace(/(<html[^>]*?)\s*\bclass="theme-light"/, "$1").replace(/\btheme-light\s?(?=[^"]*"[^>]*>\s*<head)/, "")
      // The icon stylesheet loads without blocking (media="print" until loaded);
      // the browser has flipped it to "all" by now, so put it back.
      .replace(/media="all"(\s+onload="this\.media='all'")/g, 'media="print"$1')
      .replace(AD_SCRIPT_TAG, "")
      // The page's own styles go inline; the full site stylesheet then loads
      // without holding up the first paint (it was 50 KB the phone had to
      // download before showing anything).
      .replace(MAIN_CSS_LINK, (tag, href) => criticalCss
        ? `<style>${INLINE_FONTS}${criticalCss.replace(/<\//g, "<\\/")}</style>${INLINE_FONTS_LOAD}<link rel="stylesheet" crossorigin="" href="${href}" media="print" onload="this.media='all'"><noscript>${tag}</noscript>`
        : tag)
      // Hand the data to the app ("<" escaped so the JSON can never close the
      // script tag). It goes at the very end of <body>: the page content above
      // shows first, and this still runs before the app's code (module scripts
      // run only once the whole document has been read).
      .replace(/<\/body>(?![\s\S]*<\/body>)/, (tag) => stateJson
        ? `<script>window.__VCS_STATE__=${stateJson.replace(/</g, "\\u003c")};</script>\n${tag}`
        : tag);
    // Code files the page loads that the HTML doesn't already list (e.g. a
    // subject guide's own content): add them so the browser (and Google's
    // renderer) fetches them straight away, in parallel.
    const missing = [...scripts].filter((src) => !html.includes(`"${src}"`));
    const withPreloads = missing.length
      ? html.replace("</head>", `${missing.map((src) => `<link rel="modulepreload" crossorigin="" href="${src}">`).join("")}</head>`)
      : html;
    const outFile = routeToOutputFile(route);
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, withPreloads);
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
  // The served fallback must not claim to be the home page: index.html's static
  // canonical/og:url point at "/", which told Google every page that wasn't
  // prerendered (e.g. /courses when it timed out) was a copy of the home page.
  // useSeo() sets the right canonical once the app runs.
  const shellPath = join(DIST, "shell.html");
  const shellHtml = readFileSync(join(DIST, "index.html"), "utf-8");
  writeFileSync(
    shellPath,
    shellHtml
      .replace(/<link rel="canonical"[^>]*>\s*/g, "")
      .replace(/<meta property="og:url"[^>]*>\s*/g, ""),
  );

  console.log("Discovering routes to prerender...");
  // PRERENDER_ONLY=/courses,/teachers renders just those (for checking locally).
  const routes = process.env.PRERENDER_ONLY ? process.env.PRERENDER_ONLY.split(",") : await buildRouteList();
  console.log(`Prerendering ${routes.length} routes...`);

  const server = await startServer(shellHtml);
  const browser = ON_VERCEL
    ? await puppeteer.launch({
        headless: true,
        args: chromium.args,
        executablePath: await chromium.executablePath(),
      })
    // --disable-web-security matches @sparticuz/chromium's args on Vercel, so the
    // page's API calls from localhost:4321 aren't blocked by CORS here either.
    : await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"] });

  const results = await runPool(routes, (route) => prerenderRoute(browser, route), CONCURRENCY);

  // Big pages (/courses, /teachers load 100+ images) can time out while four
  // pages render at once. Retry failures one at a time with more time.
  for (const [idx, r] of results.entries()) {
    if (r.ok) continue;
    console.log(`  retrying ${r.route} (${r.error})`);
    results[idx] = await prerenderRoute(browser, r.route, NAV_TIMEOUT_MS * 3);
  }

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
