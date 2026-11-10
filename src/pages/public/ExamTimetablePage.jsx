import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { SITE_URL, ZONE_INFO } from "../../data/examDates";
import {
  LEVEL_NAMES,
  TIMETABLE_SERIES_LABEL,
  TIMETABLE_ZONES,
  TIMETABLES_PAGE_URL,
  timetablePath,
} from "../../data/examTimetable";
import { loadTimetable, loadedTimetable } from "../../data/examTimetable/load";
import { formatIsoDate } from "../../utils/examTimeline";

// One Cambridge administrative zone's paper-by-paper timetable for the May/June
// series (/exam-dates/june-2027/zone-N). The data is Cambridge's own final
// timetable PDF, read twice (weekly view and syllabus view) and kept only where
// both agree - see scripts/parse-cambridge-timetable.py. Like the rest of
// /exam-dates, it never says which country is in which zone: the exam centre
// decides, and a wrong zone means a missed exam.

const SESSION = {
  AM: { label: "Morning", cls: "bg-cyan-500/15 border-cyan-400/40 text-cyan-300" },
  PM: { label: "Afternoon", cls: "bg-indigo-500/15 border-indigo-400/40 text-indigo-300" },
  EV: { label: "Evening", cls: "bg-violet-500/15 border-violet-400/40 text-violet-300" },
};
const LEVEL_CLS = {
  OL: "text-emerald-300",
  IG: "text-amber-300",
  "9-1": "text-amber-300",
  AS: "text-cyan-300",
  AL: "text-rose-300",
};
const LEVEL_ORDER = ["OL", "IG", "9-1", "AS", "AL"];

const weekday = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });

const ExamTimetablePage = () => {
  const { zone: zoneSlug } = useParams();
  const zone = Number(String(zoneSlug || "").replace(/^zone-/, ""));
  const key = `zone-${zone}`;

  // Already loaded by src/main.jsx on a first visit; loaded here when the
  // visitor arrives from another page. undefined = loading, null = no such zone.
  const [loadedFor, setLoadedFor] = useState(() => ({ key, t: loadedTimetable(key) }));
  const t = loadedFor.key === key ? loadedFor.t : loadedTimetable(key);
  useEffect(() => {
    if (loadedTimetable(key) !== undefined) return undefined;
    let live = true;
    loadTimetable(key)
      .then((data) => live && setLoadedFor({ key, t: data }))
      .catch(() => live && setLoadedFor({ key, t: null }));
    return () => { live = false; };
  }, [key]);

  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");

  const levels = useMemo(() => (t ? LEVEL_ORDER.filter((l) => t.papers.some((p) => p[0] === l)) : []), [t]);
  const levelWords = levels.filter((l) => l !== "9-1").map((l) => LEVEL_NAMES[l]);
  const levelText = levelWords.length > 1 ? `${levelWords.slice(0, -1).join(", ")} and ${levelWords.at(-1)}` : levelWords[0] || "";

  const days = useMemo(() => {
    if (!t) return [];
    const q = query.trim().toLowerCase();
    const out = new Map();
    for (const p of t.papers) {
      if (level !== "all" && p[0] !== level) continue;
      if (q && !`${p[2]} ${p[1]} ${LEVEL_NAMES[p[0]]}`.toLowerCase().includes(q)) continue;
      if (!out.has(p[4])) out.set(p[4], []);
      out.get(p[4]).push(p);
    }
    return [...out.entries()];
  }, [t, level, query]);
  const shown = days.reduce((n, [, ps]) => n + ps.length, 0);

  const url = `${SITE_URL}${timetablePath(zone)}`;
  useSeo(
    t
      ? {
          title: `Cambridge June 2027 Timetable Zone ${zone} – ${levels.includes("OL") ? "O Level, IGCSE" : "IGCSE"} & A Level Date Sheet`,
          description: `Every ${levelText} paper in the Cambridge ${TIMETABLE_SERIES_LABEL} final timetable for administrative zone ${zone}${zone === 3 ? " (and the UK)" : ""}: date, morning or afternoon session and duration, with a level filter and subject search.`,
          url,
          jsonLd: [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Exam Dates & Deadlines", item: `${SITE_URL}/exam-dates` },
                { "@type": "ListItem", position: 3, name: `June 2027 timetable – Zone ${zone}`, item: url },
              ],
            },
          ],
        }
      : { title: "Cambridge June 2027 timetable", description: "", url, noindex: t === null },
  );

  if (t === undefined) return <main className="min-h-screen bg-[#020617]" aria-busy="true" />;
  if (!t) {
    return (
      <main className="min-h-screen bg-[#020617] text-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-24">
          <h1 className="text-3xl md:text-5xl font-black mb-4">No such zone</h1>
          <p className="text-slate-300 text-base mb-6">Cambridge has six administrative zones (1 to 6).</p>
          <Link to="/exam-dates" className="text-indigo-300 hover:text-white font-bold">Back to exam dates</Link>
        </div>
      </main>
    );
  }

  const first = t.papers[0][4];
  const last = t.papers[t.papers.length - 1][4];

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <article className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/exam-dates" className="hover:text-white transition">Exam Dates</Link>
          <span>/</span>
          <span className="text-slate-300">June 2027 · Zone {zone}</span>
        </nav>

        <header className="mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
            {t.final ? "Final timetable" : "Provisional timetable"} · {t.version}
          </span>
          <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-5">
            Cambridge {TIMETABLE_SERIES_LABEL} Timetable <span className="text-gradient">Zone {zone}</span>
          </h1>
          <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl">
            Every {levelText} paper for administrative zone {zone}
            {zone === 3 ? " (Cambridge's UK timetable has the same dates)" : ""}: the date, whether it is a{" "}
            <strong className="text-cyan-300 font-semibold">morning</strong> or{" "}
            <strong className="text-indigo-300 font-semibold">afternoon</strong> paper, and how long it lasts, from Cambridge's own final timetable.
          </p>
        </header>

        {/* Zone switch */}
        <nav aria-label="Administrative zones" className="flex flex-wrap gap-2 mb-8">
          {TIMETABLE_ZONES.map((z) => (
            <Link
              key={z}
              to={timetablePath(z)}
              aria-current={z === zone ? "page" : undefined}
              className={`px-4 py-2 rounded-xl text-sm font-black border transition ${
                z === zone
                  ? "bg-indigo-600 border-transparent text-white"
                  : "border-white/10 text-slate-300 hover:text-white hover:border-indigo-400/50"
              }`}
            >
              Zone {z}
            </Link>
          ))}
        </nav>

        {/* Key facts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            ["Written papers", String(t.papers.length), "text-indigo-300"],
            ["First paper", formatIsoDate(first), "text-cyan-300"],
            ["Last paper", formatIsoDate(last), "text-rose-300"],
            ["Levels", levels.map((l) => LEVEL_NAMES[l]).join(" · "), "text-emerald-300"],
          ].map(([label, value, cls]) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-[#1a2235]/60 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
              <p className={`text-lg font-black ${cls}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Which zone */}
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 mb-10 flex items-start gap-3">
          <i className="fas fa-circle-info text-amber-400 mt-1" aria-hidden="true" />
          <p className="text-slate-200 text-sm leading-relaxed">
            <strong className="text-amber-300 font-semibold">Check your zone first.</strong> Your exam centre (your school or the British Council) decides which zone you sit in, not your country or nationality, so ask them before planning around these dates. Start times are set by your centre.{" "}
            <a href={ZONE_INFO.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:text-white underline">
              Cambridge's zone tool
            </a>
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by level">
            {["all", ...levels].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                aria-pressed={level === l}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border transition ${
                  level === l ? "bg-indigo-600 border-transparent text-white" : "border-white/10 text-slate-300 hover:text-white"
                }`}
              >
                {l === "all" ? "All levels" : LEVEL_NAMES[l]}
              </button>
            ))}
          </div>
          <label className="md:ml-auto relative block w-full md:w-80">
            <span className="sr-only">Search subject or paper code</span>
            <i className="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Subject or code, e.g. 5054"
              className="w-full rounded-xl bg-slate-900/80 border border-white/10 pl-9 pr-3 py-2.5 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </label>
        </div>
        <p className="text-slate-400 text-sm mb-6" aria-live="polite">
          {shown === t.papers.length ? `${shown} papers` : `${shown} of ${t.papers.length} papers`}
        </p>

        {/* Day by day */}
        <div className="space-y-8">
          {days.map(([date, papers]) => (
            <section key={date} aria-labelledby={`d-${date}`}>
              <h2 id={`d-${date}`} className="text-xl md:text-2xl font-black font-poppins tracking-tight text-white mb-3">
                {weekday(date)} {formatIsoDate(date)}
              </h2>
              <ul className="rounded-2xl border border-white/5 bg-[#1a2235]/60 divide-y divide-white/5">
                {papers.map(([lv, code, name, duration, , session]) => (
                  <li key={code} className="px-4 py-3 grid grid-cols-[auto_1fr] sm:grid-cols-[7.5rem_7rem_1fr_6rem_5rem] items-center gap-x-4 gap-y-1">
                    <span className={`justify-self-start inline-flex px-2.5 py-0.5 rounded-full border text-xs font-black ${SESSION[session].cls}`}>
                      {SESSION[session].label}
                    </span>
                    <span className={`text-xs font-black uppercase tracking-wide ${LEVEL_CLS[lv]}`}>{LEVEL_NAMES[lv]}</span>
                    <span className="col-span-2 sm:col-span-1 text-base text-slate-100">{name}</span>
                    <span className="text-sm font-bold text-slate-300 tabular-nums">{code}</span>
                    <span className="text-sm text-slate-400 sm:text-right">{duration}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {shown === 0 && (
            <p className="text-slate-300 text-base">No papers match. Try another subject name or code, or choose "All levels".</p>
          )}
        </div>

        {/* Test windows */}
        {t.windows.length > 0 && (
          <section aria-labelledby="windows" className="mt-16">
            <h2 id="windows" className="text-2xl md:text-3xl font-black font-poppins tracking-tight text-white mb-2">
              Practicals, speaking tests and coursework windows
            </h2>
            <p className="text-slate-300 text-sm mb-5">These are not fixed-day papers: your centre runs them on a day it chooses inside the window.</p>
            <ul className="rounded-2xl border border-white/5 bg-[#1a2235]/60 divide-y divide-white/5">
              {[...t.windows]
                .sort((a, b) => LEVEL_ORDER.indexOf(a[0]) - LEVEL_ORDER.indexOf(b[0]) || a[2].localeCompare(b[2]))
                .map(([lv, code, name, from, to]) => (
                  <li key={code} className="px-4 py-3 grid grid-cols-[auto_1fr] sm:grid-cols-[7rem_1fr_6rem_16rem] items-center gap-x-4 gap-y-1">
                    <span className={`text-xs font-black uppercase tracking-wide ${LEVEL_CLS[lv]}`}>{LEVEL_NAMES[lv]}</span>
                    <span className="text-base text-slate-100">{name}</span>
                    <span className="text-sm font-bold text-slate-300 tabular-nums">{code}</span>
                    <span className="text-sm text-amber-300 sm:text-right">
                      {from === to ? formatIsoDate(from) : `${formatIsoDate(from)} – ${formatIsoDate(to)}`}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        <p className="text-slate-400 text-sm mt-12 pt-6 border-t border-white/5 leading-relaxed">
          Source: Cambridge Final Exam Timetable June 2027, administrative zone {zone} ({t.version}),{" "}
          <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-white underline">PDF</a>
          {t.ukSourceUrl && (
            <>
              {" "}and the{" "}
              <a href={t.ukSourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-white underline">UK version</a>
            </>
          )}
          . Cambridge publishes any changes on its{" "}
          <a href={TIMETABLES_PAGE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-white underline">timetables page</a>
          ; always confirm with your exam centre. Registration deadlines and results days:{" "}
          <Link to="/exam-dates" className="text-indigo-300 hover:text-white underline">Cambridge exam dates</Link>.
        </p>
      </article>
    </main>
  );
};

export default ExamTimetablePage;
