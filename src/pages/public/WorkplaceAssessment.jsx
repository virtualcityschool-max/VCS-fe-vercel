import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import {
  QUESTIONS, PER_STEP, STEPS, SCALE, FACTORS, FACTOR_ORDER, TEXT, ROLES, SOURCE,
  scoreFactors, level, LEVEL_LABEL, responseCheck, headline, topFactors,
} from "../../data/playArea/workplace";
import { ACCENT_CLASSES } from "../../data/playArea/games";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/play-area/workplace-assessment`;
const STORE_KEY = "vcs_play_workplace_v1";

const MODES = {
  general: { label: "Job seeker", icon: "fas fa-briefcase", text: "Applying for a job in an organisation" },
  teacher: { label: "Teacher candidate", icon: "fas fa-chalkboard-user", text: "Applying for a teaching post" },
};

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (s && typeof s === "object" && s.answers) return s;
  } catch { /* private mode or bad data */ }
  return null;
};
const save = (state) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* private mode */ }
};

const CIRCLE = [
  "w-11 h-11 sm:w-14 sm:h-14 border-violet-400/80",
  "w-9 h-9 sm:w-11 sm:h-11 border-violet-400/80",
  "w-7 h-7 sm:w-9 sm:h-9 border-slate-400",
  "w-9 h-9 sm:w-11 sm:h-11 border-emerald-400/80",
  "w-11 h-11 sm:w-14 sm:h-14 border-emerald-400/80",
];
const FILL = ["bg-violet-500 border-violet-400", "bg-violet-500 border-violet-400", "bg-slate-400 border-slate-300", "bg-emerald-500 border-emerald-400", "bg-emerald-500 border-emerald-400"];
const HOVER = ["hover:bg-violet-500/30", "hover:bg-violet-500/30", "hover:bg-slate-400/30", "hover:bg-emerald-500/30", "hover:bg-emerald-500/30"];

const fmtDuration = (s) => {
  if (typeof s !== "number" || s <= 0) return "—";
  const m = Math.round(s / 60);
  return m < 1 ? "under 1 minute" : `${m} minute${m === 1 ? "" : "s"}`;
};

// ---------------------------------------------------------------- Intro ----

const Intro = ({ saved, form, setForm, onStart, onResume, onReport }) => {
  const answered = saved ? Object.keys(saved.answers).length : 0;
  return (
    <div className="grid lg:grid-cols-[3fr_2fr] gap-10">
      <div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
          Play Area · For job seekers
        </span>
        <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
          VCS Workplace <span className="text-gradient">Personality Assessment</span>
        </h1>
        <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
          A pre-interview personality assessment built on the <strong className="text-indigo-300 font-semibold">International Personality Item Pool (IPIP)</strong> — 100 statements written and tested by psychology researchers on thousands of people. Your report shows your work style, strengths, development areas and the interview questions to prepare for.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl">
          {[["100", "statements", "text-indigo-300"], ["~15", "minutes", "text-cyan-300"], ["5", "work traits", "text-emerald-300"]].map(([n, l, c]) => (
            <div key={l} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
              <div className={`text-2xl md:text-3xl font-black ${c}`}>{n}</div>
              <div className="text-xs text-slate-300 font-semibold mt-1">{l}</div>
            </div>
          ))}
        </div>

        <fieldset className="mb-6">
          <legend className="text-base font-bold text-white mb-3">Who is taking this assessment?</legend>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
            {Object.entries(MODES).map(([key, m]) => {
              const on = form.mode === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setForm({ ...form, mode: key })}
                  className={`text-left p-4 rounded-2xl border-2 transition flex gap-4 items-center ${on ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 hover:border-white/30 bg-white/[0.03]"}`}
                >
                  <span className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-lg ${on ? "bg-indigo-500 text-white" : "bg-indigo-500/15 text-indigo-300"}`}>
                    <i className={m.icon} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-base font-bold text-white">{m.label}</span>
                    <span className="block text-sm text-slate-300">{m.text}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mb-8">
          <label className="block">
            <span className="block text-sm font-semibold text-slate-200 mb-1.5">Your name (shown on your report)</span>
            <input
              type="text"
              value={form.name}
              maxLength={60}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-base text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400"
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-slate-200 mb-1.5">Position applied for</span>
            <input
              type="text"
              value={form.position}
              maxLength={80}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-base text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400"
              placeholder={form.mode === "teacher" ? "e.g. O Level Physics Teacher" : "e.g. Customer Service Officer"}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          {saved?.done ? (
            <>
              <button type="button" onClick={onReport} className="px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold transition">
                See my report <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
              </button>
              <button type="button" onClick={onStart} className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
                Take it again
              </button>
            </>
          ) : answered > 0 ? (
            <>
              <button type="button" onClick={onResume} className="px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold transition">
                Continue ({answered} of {QUESTIONS.length} done) <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
              </button>
              <button type="button" onClick={onStart} className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
                Start over
              </button>
            </>
          ) : (
            <button type="button" onClick={onStart} className="px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold transition">
              Start the assessment <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="p-6 rounded-3xl border-t-4 border border-amber-500/30 bg-amber-500/[0.05]">
          <h2 className="text-lg font-bold text-white mb-3"><i className="fas fa-lightbulb text-amber-300 mr-2" aria-hidden="true" />How to answer</h2>
          <ul className="space-y-2 text-base text-slate-200">
            <li>• Describe yourself as you <strong className="text-amber-300 font-semibold">generally are now</strong>, not as you wish to be.</li>
            <li>• Compare yourself with people you know of the same sex and roughly your age.</li>
            <li>• Answer honestly — the report checks for rushed, patterned or inconsistent answers.</li>
            <li>• Your answers stay on this device; nothing is sent to VCS.</li>
          </ul>
        </div>
        <div className="p-6 rounded-3xl border-t-4 border border-indigo-500/30 bg-indigo-500/[0.05]">
          <h2 className="text-lg font-bold text-white mb-3"><i className="fas fa-flask text-indigo-300 mr-2" aria-hidden="true" />The science</h2>
          <p className="text-sm text-slate-200 leading-relaxed mb-3">
            The statements are the 100-item IPIP Big-Five Factor Markers (Goldberg, 1992), a public-domain measure used in hundreds of research studies. Each trait is measured by 20 statements, with reported reliability of 0.88–0.91 (0.80+ is considered good).
          </p>
          <a href={SOURCE.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-300 hover:text-white">ipip.ori.org <i className="fas fa-arrow-up-right-from-square ml-1 text-xs" aria-hidden="true" /></a>
        </div>
      </aside>
    </div>
  );
};

// ---------------------------------------------------------------- Test -----

const Question = ({ q, n, value, onAnswer, current, missing, innerRef }) => (
  <div
    ref={innerRef}
    className={`py-6 sm:py-8 border-b border-white/10 scroll-mt-40 ${missing ? "rounded-2xl ring-2 ring-rose-500/60 px-3 sm:px-5 -mx-3 sm:-mx-5" : ""}`}
  >
    <p id={`w-${q.id}`} className={`text-lg md:text-xl font-bold mb-5 ${current ? "text-white" : "text-slate-300"}`}>
      <span className="text-slate-400 font-semibold mr-2">{n}.</span>{q.text}
    </p>
    <div role="radiogroup" aria-labelledby={`w-${q.id}`} className="grid grid-cols-5 gap-1 sm:gap-3 max-w-2xl">
      {SCALE.map((s, i) => {
        const selected = value === s.value;
        return (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={s.label}
            onClick={() => onAnswer(q.id, s.value)}
            className="flex flex-col items-center gap-2 group"
          >
            <span className="h-11 sm:h-14 flex items-center">
              <span className={`rounded-full border-2 transition flex items-center justify-center ${CIRCLE[i]} ${selected ? FILL[i] : HOVER[i]}`}>
                {selected && <i className="fas fa-check text-white text-xs sm:text-sm" aria-hidden="true" />}
              </span>
            </span>
            <span className={`text-xs leading-tight text-center ${selected ? "text-white font-bold" : "text-slate-300"}`}>{s.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const Test = ({ answers, step, setStep, onAnswer, onFinish, onExit }) => {
  const topRef = useRef(null);
  const qRefs = useRef({});
  const [missing, setMissing] = useState(false);
  const pageQs = QUESTIONS.slice(step * PER_STEP, step * PER_STEP + PER_STEP);
  const firstOpen = pageQs.find((q) => typeof answers[q.id] !== "number");
  const pct = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const moveTo = (s) => {
    setMissing(false);
    setStep(s);
  };

  const answer = (id, v) => {
    const wasOpen = typeof answers[id] !== "number";
    onAnswer(id, v);
    if (!wasOpen) return;
    const idx = pageQs.findIndex((q) => q.id === id);
    const next = pageQs.slice(idx + 1).find((q) => typeof answers[q.id] !== "number");
    if (next) setTimeout(() => qRefs.current[next.id]?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
  };

  const goNext = () => {
    if (firstOpen) {
      setMissing(true);
      qRefs.current[firstOpen.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (step + 1 < STEPS) moveTo(step + 1);
    else onFinish();
  };

  return (
    <div ref={topRef} className="scroll-mt-28">
      <div className="sticky top-2 z-30 mb-2 flex items-center gap-4 justify-between px-4 sm:px-6 py-4 rounded-2xl border border-white/10 bg-[#0b1224]/95 backdrop-blur">
        <button
          type="button"
          onClick={() => (step > 0 ? moveTo(step - 1) : onExit())}
          className="text-xs sm:text-sm font-black uppercase tracking-widest text-cyan-300 hover:text-white transition whitespace-nowrap"
        >
          <i className="fas fa-arrow-left mr-2" aria-hidden="true" />
          {step > 0 ? "Previous step" : "Back"}
        </button>
        <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
          <div className="hidden sm:block w-40 md:w-64 h-2 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Statements answered">
            <div className="h-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">Step {step + 1} of {STEPS}</span>
        </div>
      </div>
      <div className="sm:hidden h-1.5 rounded-full bg-white/10 overflow-hidden mb-2" aria-hidden="true">
        <div className="h-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm text-slate-300 mt-4">How accurately does each statement describe you?</p>

      {pageQs.map((q, i) => (
        <Question
          key={q.id}
          q={q}
          n={step * PER_STEP + i + 1}
          value={answers[q.id]}
          onAnswer={answer}
          current={firstOpen ? firstOpen.id === q.id : false}
          missing={missing && typeof answers[q.id] !== "number"}
          innerRef={(el) => { qRefs.current[q.id] = el; }}
        />
      ))}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="button" onClick={goNext} className="px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold transition">
          {step + 1 < STEPS ? "Next" : "See my report"} <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
        </button>
        {missing && firstOpen && (
          <p className="text-sm font-semibold text-rose-300" role="alert">Please answer every statement on this step to continue.</p>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Report ---

const LEVEL_STYLE = {
  high: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  moderate: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  low: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

const FactorBar = ({ f, pct }) => {
  const info = FACTORS[f];
  const lv = level(pct);
  const a = ACCENT_CLASSES[info.color];
  return (
    <div className="print-break-avoid">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-base font-bold text-white">{info.name}</span>
        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-black ${LEVEL_STYLE[lv]}`}>{LEVEL_LABEL[lv]} · {pct}</span>
      </div>
      <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
        <div className={`absolute inset-y-0 left-0 ${a.bar} rounded-full`} style={{ width: `${Math.max(pct, 2)}%` }} />
        <div className="absolute inset-y-0 left-[35%] w-0.5 bg-slate-950/70" aria-hidden="true" />
        <div className="absolute inset-y-0 left-[65%] w-0.5 bg-slate-950/70" aria-hidden="true" />
      </div>
      <div className="grid grid-cols-[35fr_30fr_35fr] mt-1 text-xs text-slate-400">
        <span>Low</span><span className="text-center">Moderate</span><span className="text-right">High</span>
      </div>
    </div>
  );
};

const Report = ({ state, onRetake }) => {
  const { answers, mode = "general", name, position, startedAt, finishedAt } = state;
  const scores = useMemo(() => scoreFactors(answers), [answers]);
  const seconds = startedAt && finishedAt ? Math.round((new Date(finishedAt) - new Date(startedAt)) / 1000) : undefined;
  const flags = responseCheck(answers, seconds);
  const top = topFactors(scores, 2);
  const text = TEXT[mode];
  const roles = [...new Set(top.flatMap((f) => ROLES[mode][f]))];
  const date = finishedAt ? new Date(finishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

  const print = () => {
    const html = document.documentElement;
    const wasLight = html.classList.contains("theme-light");
    html.classList.add("vcs-print", "theme-light");
    const done = () => {
      html.classList.remove("vcs-print");
      if (!wasLight) html.classList.remove("theme-light");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <section className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-cyan-600/10 p-6 md:p-10 mb-8 print-break-avoid">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300 mb-3">VCS Workplace Personality Assessment · {MODES[mode].label}</p>
        <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-2">
          {name?.trim() || "Candidate report"}
        </h1>
        {position?.trim() && <p className="text-lg text-slate-200 mb-4">Position applied for: <strong className="text-white font-semibold">{position.trim()}</strong></p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            ["Work style", headline(scores)],
            ["Completed", date || "—"],
            ["Time taken", fmtDuration(seconds)],
            ["Response check", flags.length ? `${flags.length} concern${flags.length > 1 ? "s" : ""}` : "No concerns"],
          ].map(([k, v]) => (
            <div key={k} className="p-4 rounded-2xl border border-white/10 bg-white/[0.04]">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1">{k}</div>
              <div className={`text-base font-bold ${k === "Response check" ? (flags.length ? "text-amber-300" : "text-emerald-300") : "text-white"}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="print-hide flex flex-wrap gap-3 mt-8">
          <button type="button" onClick={print} className="px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition">
            <i className="fas fa-print mr-2" aria-hidden="true" /> Print or save as PDF
          </button>
          <button type="button" onClick={onRetake} className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold transition">
            <i className="fas fa-rotate-left mr-2" aria-hidden="true" /> Take it again
          </button>
          <Link to="/play-area" className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold transition">Play Area</Link>
        </div>
      </section>

      {flags.length > 0 && (
        <section className="mb-8 p-6 rounded-3xl border-l-4 border border-amber-500/40 bg-amber-500/[0.06] print-break-avoid" role="note">
          <h2 className="text-lg font-bold text-amber-300 mb-2"><i className="fas fa-triangle-exclamation mr-2" aria-hidden="true" />Response check</h2>
          <ul className="space-y-1 text-base text-slate-200">{flags.map((f) => <li key={f}>• {f}</li>)}</ul>
          <p className="text-sm text-slate-300 mt-3">Read this report with care, or retake the assessment answering each statement thoughtfully.</p>
        </section>
      )}

      {/* Profile + roles */}
      <section className="grid lg:grid-cols-[2fr_3fr] gap-6 mb-8">
        <div className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03] print-break-avoid">
          <h2 className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">Profile at a glance</h2>
          <p className="text-sm text-slate-300 mb-6">Score 0–100 on each trait's scale. Low (0–35) and high (65–100) are not good or bad: every level suits some roles better than others.</p>
          <div className="space-y-6">{FACTOR_ORDER.map((f) => <FactorBar key={f} f={f} pct={scores[f]} />)}</div>
        </div>
        <div className="grid gap-6">
          <div className="p-6 md:p-8 rounded-3xl border-t-4 border border-emerald-500/30 bg-emerald-500/[0.05] print-break-avoid">
            <h2 className="text-lg font-bold text-white mb-2"><i className="fas fa-star text-emerald-300 mr-2" aria-hidden="true" />Strongest traits</h2>
            <p className="text-base text-slate-200 mb-4">
              <strong className="text-emerald-300 font-semibold">{FACTORS[top[0]].name}</strong> and <strong className="text-emerald-300 font-semibold">{FACTORS[top[1]].name}</strong> stand out most in this profile.
            </p>
            <ul className="space-y-2">
              {top.flatMap((f) => text[f][level(scores[f])].strengths.slice(0, 2)).map((s) => (
                <li key={s} className="flex gap-3 text-base text-slate-200"><i className="fas fa-check text-emerald-400 mt-1" aria-hidden="true" />{s}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 md:p-8 rounded-3xl border-t-4 border border-cyan-500/30 bg-cyan-500/[0.05] print-break-avoid">
            <h2 className="text-lg font-bold text-white mb-3">
              <i className={`${mode === "teacher" ? "fas fa-chalkboard-user" : "fas fa-briefcase"} text-cyan-300 mr-2`} aria-hidden="true" />
              {mode === "teacher" ? "Teaching roles that may suit this profile" : "Roles that often suit this profile"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => <span key={r} className="px-3 py-1.5 rounded-full text-sm font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">{r}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* Detail */}
      <section className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black font-poppins text-white mb-6">
          {mode === "teacher" ? "What this means in the classroom" : "What this means at work"}
        </h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {FACTOR_ORDER.map((f) => {
            const lv = level(scores[f]);
            const t = text[f][lv];
            const a = ACCENT_CLASSES[FACTORS[f].color];
            return (
              <article key={f} className={`p-6 md:p-7 rounded-3xl border-t-4 border ${a.ring} bg-white/[0.03] print-break-avoid`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className={`text-lg font-bold ${a.text}`}>{FACTORS[f].name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-black ${LEVEL_STYLE[lv]}`}>{LEVEL_LABEL[lv]} · {scores[f]}</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">IPIP: {FACTORS[f].ipip}</p>
                <p className="text-base text-slate-200 leading-relaxed mb-4">{t.meaning}</p>
                <p className="text-sm font-bold text-emerald-300 mb-2">Strengths</p>
                <ul className="space-y-1.5 mb-4">{t.strengths.map((s) => <li key={s} className="text-sm text-slate-200">• {s}</li>)}</ul>
                <p className="text-sm font-bold text-amber-300 mb-2">Development areas</p>
                <ul className="space-y-1.5 mb-4">{t.develop.map((s) => <li key={s} className="text-sm text-slate-200">• {s}</li>)}</ul>
                <p className="text-sm font-bold text-cyan-300 mb-2">Interview questions to prepare for</p>
                <ul className="space-y-1.5">{t.interview.map((s) => <li key={s} className="text-sm text-slate-200">• {s}</li>)}</ul>
              </article>
            );
          })}
          <article className="p-6 md:p-7 rounded-3xl border-t-4 border border-slate-400/30 bg-white/[0.03] print-break-avoid">
            <h3 className="text-lg font-bold text-white mb-3"><i className="fas fa-scale-balanced text-indigo-300 mr-2" aria-hidden="true" />For employers: fair use</h3>
            <ul className="space-y-2 text-sm text-slate-200">
              <li>• Use this report to guide interview questions, alongside skills tests, references and {mode === "teacher" ? "a demonstration lesson" : "work samples"}.</li>
              <li>• Do not accept or reject a candidate on this report alone. Personality explains only part of job performance.</li>
              <li>• Scores are self-reported and are not compared with a norm group; 50 is the middle of the scale, not the average candidate.</li>
              <li>• This report was produced on the candidate's own device and cannot be verified by VCS.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03] print-break-avoid">
        <h2 className="text-lg font-bold text-white mb-2"><i className="fas fa-flask text-indigo-300 mr-2" aria-hidden="true" />About this assessment</h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          Statements: {SOURCE.name} (public domain, {SOURCE.url}). {SOURCE.citation} Reported reliability (Cronbach's alpha) of the 20-item scales: Dependability {SOURCE.alpha.C}, Composure {SOURCE.alpha.S}, Collaboration {SOURCE.alpha.A}, Social Confidence {SOURCE.alpha.E}, Intellect &amp; Ideas {SOURCE.alpha.O}. Work-trait names, interpretations and role suggestions are by Virtual City School. This is not a clinical or psychological diagnosis.
        </p>
      </section>
    </div>
  );
};

// ---------------------------------------------------------------- Page -----

const WorkplaceAssessment = () => {
  useSeo({
    title: "Free Workplace Personality Assessment (IPIP Big Five) for Job Seekers & Teachers",
    description:
      "Free pre-interview personality assessment using the research-validated IPIP 100-item Big Five markers. Get a professional report on your work style, strengths, development areas and interview questions — with a version for teacher candidates.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Play Area", item: `${SITE_URL}/play-area` },
          { "@type": "ListItem", position: 3, name: "Workplace Personality Assessment", item: PAGE_URL },
        ],
      },
    ],
  });

  const [saved, setSaved] = useState(load);
  const [phase, setPhase] = useState("intro");
  const [state, setState] = useState(() => saved || { answers: {}, step: 0, mode: "general", name: "", position: "" });
  const [form, setForm] = useState(() => ({ mode: saved?.mode || "general", name: saved?.name || "", position: saved?.position || "" }));
  const topRef = useRef(null);

  const toTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const update = (patch) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  };

  const start = () => {
    const fresh = { ...form, answers: {}, step: 0, startedAt: new Date().toISOString(), done: false };
    save(fresh);
    setState(fresh);
    setSaved(null);
    setPhase("test");
  };
  const resume = () => {
    update({ ...form, startedAt: state.startedAt || new Date().toISOString() });
    setPhase("test");
  };
  const finish = () => {
    const done = { ...state, done: true, finishedAt: new Date().toISOString() };
    save(done);
    setState(done);
    setSaved(done);
    setPhase("report");
    toTop();
  };
  const showReport = () => {
    // Name / position edited on the intro screen also update the saved report.
    update({ name: form.name, position: form.position });
    setPhase("report");
    toTop();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 print-hide">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <div ref={topRef} className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-10 md:pt-14 pb-24 scroll-mt-28">
        <nav aria-label="Breadcrumb" className="print-hide flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/play-area" className="hover:text-white transition">Play Area</Link>
          <span>/</span>
          <span className="text-slate-200">Workplace Assessment</span>
        </nav>

        {phase === "intro" && (
          <Intro saved={saved} form={form} setForm={setForm} onStart={start} onResume={resume} onReport={showReport} />
        )}
        {phase === "test" && (
          <Test
            answers={state.answers}
            step={state.step}
            setStep={(s) => update({ step: s })}
            onAnswer={(id, v) => setState((prev) => {
              const next = { ...prev, answers: { ...prev.answers, [id]: v } };
              save(next);
              return next;
            })}
            onFinish={finish}
            onExit={() => { setSaved(load()); setPhase("intro"); toTop(); }}
          />
        )}
        {phase === "report" && <Report state={state} onRetake={start} />}
      </div>
    </div>
  );
};

export default WorkplaceAssessment;
