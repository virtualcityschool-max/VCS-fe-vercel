// Build guard: stop the deploy if any page uses a name that does not exist.
// A missing import (e.g. TEACHING_AREAS on 2026-10-17) passes `vite build` and
// then crashes the whole page for users with "Something went wrong".
//   .ts/.tsx  → TypeScript "Cannot find name" style errors only
//   .js/.jsx  → ESLint no-undef and rules-of-hooks only
// Other type and style problems are left to `npm run lint`.
import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const SRC = "src";
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".d.ts")) files.push(p);
  }
})(SRC);

// 2304 cannot find name, 2552 cannot find name (did you mean), 2448/2454 used before declared,
// 2305/2724 module has no such export
const FATAL = new Set([2304, 2552, 2448, 2454, 2305, 2724]);
const program = ts.createProgram(files, {
  jsx: ts.JsxEmit.ReactJSX, allowJs: true, checkJs: false, noEmit: true, skipLibCheck: true,
  module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
  target: ts.ScriptTarget.ES2022, types: [],
});
const problems = ts.getPreEmitDiagnostics(program)
  .filter((d) => FATAL.has(d.code) && d.file && !d.file.fileName.includes("node_modules"))
  .map((d) => {
    const { line, character } = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
    return `${d.file.fileName}:${line + 1}:${character + 1}  ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`;
  });

// ESLint exits 1 when it finds problems; anything else (bad config, crash) must fail too.
let eslintOut;
try {
  eslintOut = execFileSync("npx", ["eslint", "src", "--no-warn-ignored", "-f", "json",
    "--no-config-lookup", "-c", "scripts/eslint.names.config.js"], { stdio: "pipe", maxBuffer: 64 << 20 });
} catch (e) {
  if (e.status !== 1 || !e.stdout?.length) {
    console.error("check-names: ESLint did not run:\n" + String(e.stderr || e.message));
    process.exit(1);
  }
  eslintOut = e.stdout;
}
for (const f of JSON.parse(String(eslintOut))) {
  for (const m of f.messages) {
    if (m.severity === 2) problems.push(`${f.filePath}:${m.line}:${m.column}  ${m.message} (${m.ruleId})`);
  }
}

if (problems.length) {
  console.error(`\n✖ check-names: ${problems.length} use(s) of a name that does not exist (would crash the page):\n`);
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`✓ check-names: ${files.length} TS files + JS files OK`);
