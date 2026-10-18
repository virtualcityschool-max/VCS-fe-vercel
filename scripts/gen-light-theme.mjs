// Generates src/styles/light-theme.generated.css: day-mode colours for the
// public website. Runs before every build (package.json "build").
//
// The public pages are written with dark-theme Tailwind classes (bg-slate-950,
// text-white, text-emerald-300 ...). Rather than hand-editing hundreds of
// classes, this reads the colour classes the public files use and writes a
// light equivalent for each, active only when <html> has the class
// `light-public` (set by src/utils/theme.js on public pages in day mode):
//   - dark solid backgrounds  -> near-white / light shades
//   - light text              -> dark text (accent text 300 -> 700, so it stays readable)
//   - faint tints (/5 ... /30) keep their colour (they read fine on white)
//   - white tints/borders     -> slate tints/borders
// Anything inside an element with the class `theme-keep` (text over photos,
// the WhatsApp button ...) is left alone.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/styles/light-theme.generated.css");

// Public-facing source: pages and the parts they use.
const SCAN = [
  "src/pages/public", "src/components/public", "src/components/subjects", "src/components/courses",
  "src/components/blogs", "src/components/teachers", "src/components/layout/Navbar.jsx",
  "src/components/layout/TopBar.jsx", "src/components/layout/UserProfileDropdown.jsx", "src/components/ui",
  "src/components/forms", "src/components/common", "src/App.jsx",
];

const files = [];
const walk = (p) => {
  const abs = join(ROOT, p);
  if (statSync(abs).isDirectory()) readdirSync(abs).forEach((f) => walk(join(p, f)));
  else if (/\.(jsx?|tsx?)$/.test(p)) files.push(abs);
};
SCAN.forEach(walk);

// Tailwind's palette.
const theme = readFileSync(join(ROOT, "node_modules/tailwindcss/theme.css"), "utf8");
const palette = {};
for (const m of theme.matchAll(/--color-([a-z]+)-(\d+):\s*([^;]+);/g)) (palette[m[1]] ||= {})[m[2]] = m[3].trim();

const INVERT = { 50: 950, 100: 900, 200: 800, 300: 700, 400: 600, 500: 600, 600: 600, 700: 300, 800: 200, 900: 100, 950: 50 };
const NEUTRAL = new Set(["slate", "gray", "zinc", "neutral", "stone"]);
const LIGHT_BG = { "#020617": "#f8fafc", "#0f172a": "#f1f5f9", "#0a1024": "#ffffff", "#131c31": "#ffffff", "#1a2235": "#ffffff", "#0b1120": "#eef2ff", "#121831": "#ffffff", "#0e1428": "#ffffff", "#1a2346": "#e2e8f0", "#232d52": "#cbd5e1" };

// Light text colours written as hex (tutor names in gold).
const TEXT_HEX = { "#e8c48f": "#a16207", "#c7d2fe": "#3730a3" };

const withAlpha = (color, a) => (a == null ? color : `color-mix(in oklab, ${color} ${a}%, transparent)`);
const esc = (cls) => cls.replace(/([^a-zA-Z0-9_-])/g, "\\$1");

// Property for each utility prefix.
const PROPS = {
  bg: (c) => `background-color: ${c}`,
  text: (c) => `color: ${c}`,
  border: (c) => `border-color: ${c}`,
  "border-t": (c) => `border-top-color: ${c}`,
  "border-b": (c) => `border-bottom-color: ${c}`,
  "border-l": (c) => `border-left-color: ${c}`,
  "border-r": (c) => `border-right-color: ${c}`,
  divide: (c) => `--tw-divide-color: ${c}; border-color: ${c}`,
  ring: (c) => `--tw-ring-color: ${c}`,
  from: (c) => `--tw-gradient-from: ${c}`,
  via: (c) => `--tw-gradient-via: ${c}`,
  to: (c) => `--tw-gradient-to: ${c}`,
  fill: (c) => `fill: ${c}`,
  stroke: (c) => `stroke: ${c}`,
};

// The light colour for one utility, or null to leave it alone.
function lightValue(prefix, name, shade, alpha, hex) {
  const isText = prefix === "text" || prefix === "fill" || prefix === "stroke";
  if (hex) {
    if (isText) return TEXT_HEX[hex.toLowerCase()] ? withAlpha(TEXT_HEX[hex.toLowerCase()], alpha) : null;
    const l = LIGHT_BG[hex.toLowerCase()];
    return l ? withAlpha(l, alpha) : null;
  }
  if (name === "white") {
    if (isText) return withAlpha(palette.slate[900], alpha);
    if (prefix === "bg") return alpha == null || alpha >= 60 ? (alpha == null ? "#ffffff" : withAlpha("#ffffff", alpha)) : withAlpha(palette.slate[900], Math.max(3, Math.round(alpha * 0.9)));
    return withAlpha(palette.slate[900], alpha == null ? 15 : Math.min(30, Math.round(alpha * 1.6)));
  }
  if (name === "black") {
    if (isText) return null;
    return withAlpha(palette.slate[900], alpha == null ? 8 : Math.max(4, Math.round(alpha * 0.15)));
  }
  if (!palette[name] || !palette[name][shade]) return null;
  const s = Number(shade);
  // Faint tints keep their hue and shade: they already read as light washes.
  if (!isText && alpha != null && alpha <= 30) return null;
  if (isText) {
    const t = NEUTRAL.has(name) ? { 50: 950, 100: 900, 200: 800, 300: 700, 400: 600, 500: 500, 600: 600, 700: 700 }[s] : INVERT[s];
    return t ? withAlpha(palette[name][t], alpha) : null;
  }
  const t = INVERT[s];
  return t ? withAlpha(palette[name][t], alpha) : null;
}

const RE = /(?<![\w-])((?:hover|group-hover|focus|open):)?(bg|text|border(?:-[tblr])?|divide|ring|from|via|to|fill|stroke)-(?:([a-z]+)-(\d{2,3})|(white|black)|\[(#[0-9a-fA-F]{6})\])(?:\/(\d{1,3}|\[[\d.]+\]))?(?![\w-])/g;

// Solid coloured backgrounds (buttons, badges, gradient CTAs): text on them
// stays as written (white on indigo stays white).
const SOLID = new Set();
const SOLID_RE = /(?<![\w-])(?:hover:)?(?:bg|from|via|to)-(?:[a-z]+)-(?:400|500|600|700|800)(?![\w/-])/g;
for (const f of files) for (const m of readFileSync(f, "utf8").matchAll(SOLID_RE)) {
  if (!/-(slate|gray|zinc|neutral|stone)-/.test(m[0])) SOLID.add(m[0]);
}
// Plain white text is restored only on always-solid backgrounds; hover white
// text also on backgrounds that turn solid on hover.
const solidList = [...SOLID].filter((c) => !c.startsWith("hover:")).sort().map((c) => `.${esc(c)}`).join(", ");
const solidHoverList = [...SOLID].sort().map((c) => `.${esc(c)}`).join(", ");
const whiteText = new Set(); // white text classes seen, restored on solid backgrounds

const rules = new Map();
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(RE)) {
    const [cls, variant, prefix, name, shade, bw, hex, alphaRaw] = m;
    const color = bw || name;
    let alpha = alphaRaw == null ? null : Number(String(alphaRaw).replace(/[[\]]/g, ""));
    if (alpha != null && alpha <= 1 && String(alphaRaw).includes(".")) alpha = Math.round(alpha * 100);
    if (prefix === "text" && /^(xs|sm|base|lg|xl|\d)/.test(color || "")) continue;
    const value = lightValue(prefix, color, shade, alpha, hex);
    if (!value) continue;
    const decl = PROPS[prefix](value);
    const base = `.${esc(cls)}`;
    let sel;
    if (!variant) sel = base;
    else if (variant === "hover:") sel = `${base}:hover`;
    else if (variant === "focus:") sel = `${base}:focus`;
    else if (variant === "group-hover:") sel = `.group:hover ${base}`;
    else sel = `[open]${base}, [open] ${base}`;
    if (prefix === "text" && color === "white") whiteText.add(cls);
    const full = sel.split(", ").map((s) => `html.light-public ${s}:not(.theme-keep, .theme-keep *)`).join(",\n");
    rules.set(full, decl);
  }
}

// White text on solid coloured backgrounds stays white (later rule, same specificity).
const restore = [...whiteText].sort().map((cls) => {
  const m = cls.match(/^(?:(hover|group-hover|focus):)?text-white(?:\/(\d+))?$/);
  if (!m) return null;
  const val = m[2] ? `color-mix(in oklab, #fff ${m[2]}%, transparent)` : "#fff";
  const pseudo = m[1] === "hover" ? ":hover" : m[1] === "focus" ? ":focus" : "";
  const list = m[1] ? solidHoverList : solidList;
  const self = `html.light-public :is(${list}).${esc(cls)}${pseudo}`;
  const inner = m[1] === "group-hover" ? `html.light-public :is(${list}).group:hover .${esc(cls)}` : `html.light-public :is(${list}) .${esc(cls)}${pseudo}`;
  return `${self},\n${inner} { color: ${val} !important; }`;
}).filter(Boolean);

const out = [
  "/* Generated by scripts/gen-light-theme.mjs — do not edit by hand. */",
  "html.light-public { color-scheme: light; }",
  "html.light-public body { background-color: #f8fafc; color: #0f172a; }",
  "/* The logo has white lettering: show it on a navy badge in day mode. */",
  "html.light-public .theme-logo { background-color: #0f172a; border-radius: 0.75rem; padding: 0.25rem 0.5rem; }",
  ...[...rules].sort().map(([sel, decl]) => `${sel} { ${decl} !important; }`),
  ...restore,
].join("\n");
writeFileSync(OUT, out + "\n");
console.log(`Light theme: ${rules.size} rules from ${files.length} files.`);
