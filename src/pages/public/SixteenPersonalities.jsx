import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import {
  QUESTIONS, PER_STEP, STEPS, SCALE, SCALE_LABELS, ROLES, STORE_KEY,
  scoreTraits,
} from "../../data/playArea/sixteenPersonalities";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/mind-lab/16-personalities`;

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (s && typeof s === "object" && s.answers) return s;
  } catch { /* private mode */ }
  return null;
};

const save = (state) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* private mode */ }
};

const clear = () => {
  try { localStorage.removeItem(STORE_KEY); } catch { /* private mode */ }
};

const CIRCLE_SIZES = [
  "w-12 h-12 sm:w-14 sm:h-14", // Agree strongly (big)
  "w-10 h-10 sm:w-11 sm:h-11", // Agree (med)
  "w-8 h-8 sm:w-9 sm:h-9",     // Agree a little (small)
  "w-6 h-6 sm:w-7 sm:h-7",     // Neutral (smallest)
  "w-8 h-8 sm:w-9 sm:h-9",     // Disagree a little (small)
  "w-10 h-10 sm:w-11 sm:h-11", // Disagree (med)
  "w-12 h-12 sm:w-14 sm:h-14", // Disagree strongly (big)
];

const circleStyle = (index, selected) => {
  if (index < 3) {
    // Green (Agree)
    return selected
      ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
      : "border-emerald-500/70 hover:border-emerald-400 hover:bg-emerald-500/20";
  }
  if (index > 3) {
    // Purple (Disagree)
    return selected
      ? "border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/30"
      : "border-purple-400/70 hover:border-purple-300 hover:bg-purple-500/20";
  }
  // Neutral
  return selected
    ? "border-slate-300 bg-slate-300 text-slate-900 shadow-md"
    : "border-slate-500 hover:border-slate-300 hover:bg-slate-400/20";
};

// ---------------------------------------------------------------- Intro ----

const Intro = ({ saved, onStart, onResume, onReport }) => {
  const answered = saved ? Object.keys(saved.answers).length : 0;
  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
          VCS Mind Lab · 16 Personalities Assessment
        </span>
        <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
          Discover your <span className="text-gradient">personality type.</span>
        </h1>
        <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
          Answer 60 straightforward statements about how you think, interact, plan, and feel. In under 10 minutes, unlock your <strong className="text-indigo-300 font-semibold">16-Personalities profile</strong> (e.g., Architect INTJ, Campaigner ENFP, Commander ENTJ) with an executive 1-page report on your strengths, study habits, relationships, and ideal Cambridge subjects.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl">
          {[
            ["60", "statements", "text-emerald-300"],
            ["~8", "minutes", "text-cyan-300"],
            ["16", "types + 1-page report", "text-indigo-300"],
          ].map(([n, l, c]) => (
            <div key={l} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
              <div className={`text-2xl md:text-3xl font-black ${c}`}>{n}</div>
              <div className="text-xs text-slate-300 font-semibold mt-1">{l}</div>
            </div>
          ))}
        </div>

        <ul className="space-y-2 mb-8 text-base text-slate-200">
          <li className="flex gap-3"><i className="fas fa-check text-emerald-400 mt-1" aria-hidden="true" /> Be completely honest — there are no right or wrong answers.</li>
          <li className="flex gap-3"><i className="fas fa-check text-emerald-400 mt-1" aria-hidden="true" /> Follow your immediate instinct; try not to pick "Neutral" too often.</li>
          <li className="flex gap-3"><i className="fas fa-check text-emerald-400 mt-1" aria-hidden="true" /> Your progress saves locally in your browser automatically.</li>
        </ul>

        <div className="flex flex-wrap gap-3">
          {saved?.done ? (
            <>
              <button
                type="button"
                onClick={onReport}
                className="px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold transition shadow-lg shadow-indigo-600/30"
              >
                View my report <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onStart}
                className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition"
              >
                Take test again
              </button>
            </>
          ) : answered > 0 ? (
            <>
              <button
                type="button"
                onClick={onResume}
                className="px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold transition"
              >
                Continue ({answered} of {QUESTIONS.length} done) <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onStart}
                className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition"
              >
                Start over
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold transition shadow-xl shadow-indigo-600/30 hover:scale-105"
            >
              Start the assessment <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <figure className="relative">
        <img
          src="/images/play-area/classroom.webp"
          alt="Students in a classroom listening to their teacher"
          width="1600"
          height="996"
          className="w-full aspect-[16/10] object-cover rounded-3xl border border-white/10 shadow-2xl"
        />
        <figcaption className="mt-2 text-xs text-slate-400 text-right">Virtual City School · Mind Lab</figcaption>
      </figure>
    </div>
  );
};

// ---------------------------------------------------------------- Test -----

const QuestionItem = ({ q, value, onAnswer, missing, innerRef }) => (
  <div
    ref={innerRef}
    className={`py-8 border-b border-white/10 scroll-mt-36 transition-all duration-300 ${
      missing ? "rounded-2xl ring-2 ring-rose-500/70 bg-rose-500/5 px-4 -mx-4" : ""
    }`}
  >
    <div className="text-center mb-2">
      <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
        Question {q.id} of {QUESTIONS.length}
      </span>
    </div>
    <p id={`q-${q.id}`} className="text-lg sm:text-xl font-bold text-white mb-6 text-center max-w-2xl mx-auto leading-snug">
      {q.text}
    </p>

    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-xl px-2 sm:px-4">
        <span className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-400">
          Agree
        </span>
        <span className="text-sm sm:text-base font-black uppercase tracking-wider text-purple-400">
          Disagree
        </span>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={`q-${q.id}`}
        className="flex items-center justify-between w-full max-w-xl gap-2 sm:gap-4 px-1 py-2"
      >
        {SCALE.map((v, i) => {
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={SCALE_LABELS[i]}
              title={SCALE_LABELS[i]}
              onClick={() => onAnswer(q.id, v)}
              className={`shrink-0 rounded-full border-2 transition-transform transform active:scale-95 flex items-center justify-center ${CIRCLE_SIZES[i]} ${circleStyle(i, selected)}`}
            >
              {selected && (
                <i
                  className={`fas fa-check text-xs ${i === 3 ? "text-slate-900" : "text-white"}`}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

const Test = ({ answers, step, setStep, onAnswer, onFinish, onExit }) => {
  const topRef = useRef(null);
  const qRefs = useRef({});
  const [missing, setMissing] = useState(false);

  const pageQs = QUESTIONS.slice(step * PER_STEP, step * PER_STEP + PER_STEP);
  const firstOpen = pageQs.find((q) => typeof answers[q.id] !== "number");
  const doneTotal = Object.keys(answers).length;
  const pct = Math.round((doneTotal / QUESTIONS.length) * 100);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const handleAnswer = (id, val) => {
    onAnswer(id, val);
    const currentIndex = pageQs.findIndex((q) => q.id === id);
    const nextOpen = pageQs.slice(currentIndex + 1).find((q) => typeof answers[q.id] !== "number" && q.id !== id);
    if (nextOpen) {
      setTimeout(() => {
        qRefs.current[nextOpen.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  const handleNext = () => {
    if (firstOpen) {
      setMissing(true);
      qRefs.current[firstOpen.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setMissing(false);
    if (step + 1 < STEPS) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div ref={topRef} className="scroll-mt-28 max-w-3xl mx-auto">
      <div className="sticky top-2 z-30 mb-8 flex items-center justify-between px-4 sm:px-6 py-4 rounded-2xl border border-white/10 bg-[#0b1224]/95 backdrop-blur shadow-xl">
        <button
          type="button"
          onClick={() => (step > 0 ? setStep(step - 1) : onExit())}
          className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-300 hover:text-white transition flex items-center gap-2"
        >
          <i className="fas fa-arrow-left text-xs" aria-hidden="true" />
          {step > 0 ? "Previous step" : "Exit"}
        </button>

        <div className="flex items-center gap-4">
          <div
            className="w-28 sm:w-48 h-2 rounded-full bg-white/10 overflow-hidden"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-300 whitespace-nowrap">
            Step {step + 1} of {STEPS} <span className="text-indigo-400 font-semibold">({step * PER_STEP + 1}–{Math.min((step + 1) * PER_STEP, QUESTIONS.length)} of {QUESTIONS.length})</span>
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {pageQs.map((q) => (
          <QuestionItem
            key={q.id}
            q={q}
            value={answers[q.id]}
            onAnswer={handleAnswer}
            missing={missing && typeof answers[q.id] !== "number"}
            innerRef={(el) => { qRefs.current[q.id] = el; }}
          />
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleNext}
          className="px-10 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-base font-black transition shadow-xl shadow-indigo-600/30 hover:scale-105"
        >
          {step + 1 < STEPS ? "Next" : "See my report"} <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
        </button>

        {missing && firstOpen && (
          <p className="text-sm font-semibold text-rose-300 animate-pulse" role="alert">
            Please answer all 6 statements on this step to proceed.
          </p>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Report ---

const TraitBar = ({ trait, roleBarColor }) => {
  const isLeft = trait.dominant === trait.left.code;
  const dominant = isLeft ? trait.left : trait.right;
  const other = isLeft ? trait.right : trait.left;

  return (
    <div className="space-y-1.5 print:space-y-1">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-bold text-white">
          {trait.name}: <strong className="text-cyan-300 font-extrabold">{dominant.label}</strong> ({dominant.pct}%)
        </span>
        <span className="text-xs text-slate-400 print:text-slate-600">
          vs {other.label} ({other.pct}%)
        </span>
      </div>

      <div className="relative h-2.5 sm:h-3 rounded-full bg-white/10 print:bg-slate-200 overflow-hidden">
        <div
          className={`h-full ${roleBarColor} rounded-full transition-all duration-700`}
          style={{ width: `${dominant.pct}%` }}
        />
      </div>

      <p className="text-[11px] sm:text-xs text-slate-300 print:text-slate-700 leading-tight">
        {trait.desc}
      </p>
    </div>
  );
};

const Report = ({ answers, onRetake }) => {
  const result = useMemo(() => scoreTraits(answers), [answers]);
  const { profile, role, traits, fullCode } = result;

  const handlePrint = () => {
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

  const shareText = `I took the Virtual City School 16-Personalities Assessment and my type is ${profile.name} (${fullCode})! Take yours free at https://virtualcityschool.com/mind-lab/16-personalities`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="max-w-4xl mx-auto print:max-w-none print:p-0 print:text-black">
      {/* Print Stylesheet Injection to Guarantee Clean 1-Page Layout */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm 12mm; }
          body, html { background: #ffffff !important; color: #0f172a !important; font-size: 11px !important; }
          .print-hide { display: none !important; }
          .one-page-report { box-shadow: none !important; border: none !important; padding: 0 !important; background: transparent !important; }
          .print-border { border: 1px solid #cbd5e1 !important; background: #f8fafc !important; }
          .print-text-dark { color: #0f172a !important; }
          .print-text-muted { color: #475569 !important; }
          .print-break-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
        }
      `}</style>

      {/* Main Single-Page Report Container */}
      <div className="one-page-report space-y-6 print:space-y-3">
        {/* Header Hero Card */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 sm:p-8 print-border print:p-4 print-break-avoid">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${role.badge} print:border-slate-400 print:text-slate-800`}>
                <i className="fas fa-layer-group mr-1.5" aria-hidden="true" />
                {role.name} · {role.label}
              </span>
              <span className="text-xs font-bold text-slate-400 print:text-slate-600">
                VCS Mind Lab Official Assessment
              </span>
            </div>

            <span className="text-xs font-black tracking-widest px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 print:border-slate-400 print:text-slate-800">
              {fullCode}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-poppins text-white print:text-slate-900 tracking-tight mb-1">
            {profile.name} <span className="text-slate-400 font-bold text-2xl">({fullCode})</span>
          </h1>

          <p className="text-base sm:text-lg font-semibold text-cyan-300 print:text-cyan-800 mb-3">
            "{profile.tagline}"
          </p>

          <p className="text-sm sm:text-base text-slate-200 print:text-slate-800 leading-relaxed mb-4">
            {profile.summary}
          </p>

          {profile.quote && (
            <blockquote className="border-l-2 border-indigo-400 pl-4 py-1 italic text-xs sm:text-sm text-slate-300 print:text-slate-700 bg-white/[0.02] print:bg-slate-100 rounded-r-lg">
              "{profile.quote.text}" — <span className="font-semibold not-italic">{profile.quote.author}</span>
            </blockquote>
          )}
        </section>

        {/* 5 Trait Dimensions (Visual Meters) */}
        <section className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-white/[0.02] print-border print:p-4 print-break-avoid">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 print:text-slate-700 mb-4">
            Your 5 Personality Dimensions
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 print:gap-2">
            {traits.map((t) => (
              <TraitBar key={t.id} trait={t} roleBarColor={role.barColor} />
            ))}
          </div>
        </section>

        {/* Core 2x2 Grid: Strengths, Weaknesses, Study Style, Relationships */}
        <section className="grid sm:grid-cols-2 gap-4 print:gap-3 print-break-avoid">
          {/* Card 1: Strengths */}
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] print-border print:p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                <i className="fas fa-bolt" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-300 print:text-emerald-800">
                Top Strengths
              </h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-200 print:text-slate-800">
              {profile.strengths.map((s) => (
                <li key={s.title} className="leading-snug">
                  <strong className="text-white print:text-slate-900">{s.title}:</strong> {s.desc}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Growth Areas */}
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] print-border print:p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                <i className="fas fa-lightbulb" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 print:text-amber-800">
                Blindspots & Growth Areas
              </h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-200 print:text-slate-800">
              {profile.weaknesses.map((w) => (
                <li key={w.title} className="leading-snug">
                  <strong className="text-white print:text-slate-900">{w.title}:</strong> {w.desc}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Study Style */}
          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.04] print-border print:p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                <i className="fas fa-graduation-cap" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-cyan-300 print:text-cyan-800">
                How You Study Best
              </h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-200 print:text-slate-800">
              {profile.studyStyle.map((tip, idx) => (
                <li key={idx} className="flex gap-2 leading-snug">
                  <i className="fas fa-check text-cyan-400 text-xs mt-1 shrink-0" aria-hidden="true" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 4: Relationships & Friends */}
          <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-500/[0.04] print-border print:p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">
                <i className="fas fa-heart" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-purple-300 print:text-purple-800">
                Friends & Dating
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 print:text-slate-800 leading-relaxed">
              {profile.relationships}
            </p>
          </div>
        </section>

        {/* Subjects & Careers Footer */}
        <section className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] print-border print:p-3 print-break-avoid">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400 print:text-slate-700 mb-2">
                Ideal Cambridge Subjects
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.subjects.map((sub) => (
                  <span
                    key={sub}
                    className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-slate-200 print:border-slate-300 print:text-slate-800"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400 print:text-slate-700 mb-2">
                High-Potential Career Paths
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.careers.map((car) => (
                  <span
                    key={car}
                    className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-cyan-300 print:border-slate-300 print:text-cyan-900"
                  >
                    {car}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Actions Bar (Hidden on print) */}
        <div className="print-hide flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <i className="fas fa-print" aria-hidden="true" />
              Print / Save 1-Page PDF
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition flex items-center gap-2"
            >
              <i className="fab fa-whatsapp" aria-hidden="true" />
              Share on WhatsApp
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRetake}
              className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-200 text-sm font-bold transition"
            >
              <i className="fas fa-rotate-left mr-2" aria-hidden="true" />
              Retake Test
            </button>

            <Link
              to="/mind-lab"
              className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-200 text-sm font-bold transition"
            >
              All Mind Lab Games
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------- Page Root ---

const SixteenPersonalities = () => {
  useSeo({
    title: "16-Personalities Assessment — Free Test for Students & Young Adults | Mind Lab",
    description:
      "Take the free 60-question 16-Personalities assessment: discover if you are an Architect (INTJ), Campaigner (ENFP), or Advocate (INFJ), with an executive 1-page report on your strengths, study habits, relationships, and ideal Cambridge subjects.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: `${SITE_URL}/mind-lab` },
          { "@type": "ListItem", position: 3, name: "16-Personalities Assessment", item: PAGE_URL },
        ],
      },
    ],
  });

  const [saved, setSaved] = useState(load);
  const [phase, setPhase] = useState(() => (saved?.done ? "report" : "intro"));
  const [step, setStep] = useState(() => saved?.step || 0);
  const [answers, setAnswers] = useState(() => saved?.answers || {});
  const topRef = useRef(null);

  const toTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onAnswer = (id, val) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: val };
      save({ answers: next, step, done: false, updatedAt: new Date().toISOString() });
      return next;
    });
  };

  const changeStep = (s) => {
    setStep(s);
    save({ answers, step: s, done: false, updatedAt: new Date().toISOString() });
    toTop();
  };

  const start = () => {
    clear();
    setSaved(null);
    setAnswers({});
    setStep(0);
    setPhase("test");
    toTop();
  };

  const finish = () => {
    const state = { answers, step, done: true, finishedAt: new Date().toISOString() };
    save(state);
    setSaved(state);
    setPhase("report");
    toTop();
  };

  const exit = () => {
    setSaved(load());
    setPhase("intro");
    toTop();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 print-hide">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <div ref={topRef} className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-10 md:pt-14 pb-24 scroll-mt-28">
        <nav aria-label="Breadcrumb" className="print-hide flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/mind-lab" className="hover:text-white transition">Mind Lab</Link>
          <span>/</span>
          <span className="text-slate-200">16-Personalities Assessment</span>
        </nav>

        {phase === "intro" && (
          <Intro
            saved={saved}
            onStart={start}
            onResume={() => { setPhase("test"); toTop(); }}
            onReport={() => { setPhase("report"); toTop(); }}
          />
        )}
        {phase === "test" && (
          <Test
            answers={answers}
            step={step}
            setStep={changeStep}
            onAnswer={onAnswer}
            onFinish={finish}
            onExit={exit}
          />
        )}
        {phase === "report" && (
          <Report answers={answers} onRetake={start} />
        )}
      </div>
    </div>
  );
};

export default SixteenPersonalities;
