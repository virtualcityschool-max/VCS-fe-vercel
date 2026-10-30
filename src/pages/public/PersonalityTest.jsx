import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import {
  QUESTIONS, PER_STEP, STEPS, SCALE, TRAITS, TRAIT_ORDER, TRAIT_TEXT, PROFILES,
  scoreTraits, lean, profileKey,
} from "../../data/playArea/personality";
import { ACCENT_CLASSES } from "../../data/playArea/games";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/play-area/personality-test`;
const STORE_KEY = "vcs_play_personality_v1";

// Saved progress lives only in this browser (no login needed).
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
const clear = () => {
  try { localStorage.removeItem(STORE_KEY); } catch { /* private mode */ }
};

const SCALE_LABELS = ["Agree strongly", "Agree", "Agree a little", "Not sure", "Disagree a little", "Disagree", "Disagree strongly"];
const CIRCLE_SIZE = [
  "w-11 h-11 sm:w-14 sm:h-14",
  "w-9 h-9 sm:w-12 sm:h-12",
  "w-8 h-8 sm:w-10 sm:h-10",
  "w-6 h-6 sm:w-8 sm:h-8",
  "w-8 h-8 sm:w-10 sm:h-10",
  "w-9 h-9 sm:w-12 sm:h-12",
  "w-11 h-11 sm:w-14 sm:h-14",
];
const circleClass = (i, selected) => {
  if (i < 3) return selected ? "border-emerald-400 bg-emerald-500" : "border-emerald-400/80 hover:bg-emerald-500/30";
  if (i > 3) return selected ? "border-violet-400 bg-violet-500" : "border-violet-400/80 hover:bg-violet-500/30";
  return selected ? "border-slate-300 bg-slate-400" : "border-slate-400 hover:bg-slate-400/30";
};

// ---------------------------------------------------------------- Intro ----

const Intro = ({ saved, onStart, onResume, onReport }) => {
  const answered = saved ? Object.keys(saved.answers).length : 0;
  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
          Play Area · Personality Test
        </span>
        <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
          Who are you, <span className="text-gradient">really?</span>
        </h1>
        <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
          Answer 100 short statements about how you think, feel and study. You'll get a free report with your <strong className="text-violet-300 font-semibold">personality profile</strong>, your strengths, the way you learn best, and the <strong className="text-emerald-300 font-semibold">subjects and careers</strong> that may suit you.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl">
          {[["100", "statements", "text-violet-300"], ["~12", "minutes", "text-cyan-300"], ["5", "traits measured", "text-emerald-300"]].map(([n, l, c]) => (
            <div key={l} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
              <div className={`text-2xl md:text-3xl font-black ${c}`}>{n}</div>
              <div className="text-xs text-slate-300 font-semibold mt-1">{l}</div>
            </div>
          ))}
        </div>
        <ul className="space-y-2 mb-8 text-base text-slate-200">
          <li className="flex gap-3"><i className="fas fa-check text-emerald-400 mt-1" aria-hidden="true" /> There are no right or wrong answers — be honest, not ideal.</li>
          <li className="flex gap-3"><i className="fas fa-check text-emerald-400 mt-1" aria-hidden="true" /> Go with your first feeling; try not to pick "Not sure" too often.</li>
          <li className="flex gap-3"><i className="fas fa-check text-emerald-400 mt-1" aria-hidden="true" /> Your answers save on this device, so you can stop and come back.</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          {saved?.done ? (
            <>
              <button type="button" onClick={onReport} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
                See my report <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
              </button>
              <button type="button" onClick={onStart} className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
                Take it again
              </button>
            </>
          ) : answered > 0 ? (
            <>
              <button type="button" onClick={onResume} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
                Continue ({answered} of {QUESTIONS.length} done) <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
              </button>
              <button type="button" onClick={onStart} className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
                Start over
              </button>
            </>
          ) : (
            <button type="button" onClick={onStart} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
              Start the test <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <figure>
        <img
          src="/images/play-area/classroom.webp"
          alt="Students in a classroom listening to their teacher"
          width="1600"
          height="996"
          className="w-full aspect-[16/10] object-cover rounded-3xl border border-white/10"
        />
        <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
      </figure>
    </div>
  );
};

// ---------------------------------------------------------------- Test -----

const Question = ({ q, value, onAnswer, current, missing, innerRef }) => (
  <div
    ref={innerRef}
    className={`py-7 sm:py-9 border-b border-white/10 scroll-mt-40 transition-opacity ${missing ? "rounded-2xl ring-2 ring-rose-500/60 px-3 sm:px-5 -mx-3 sm:-mx-5" : ""}`}
  >
    <p id={`q-${q.id}`} className={`text-lg md:text-xl font-bold mb-5 ${current ? "text-white" : "text-slate-300"}`}>
      {q.text}
    </p>
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      <div className="flex justify-between sm:hidden text-sm font-bold">
        <span className="text-emerald-300">Agree</span>
        <span className="text-violet-300">Disagree</span>
      </div>
      <span className="hidden sm:block w-20 text-right text-base font-bold text-emerald-300">Agree</span>
      <div role="radiogroup" aria-labelledby={`q-${q.id}`} className="flex items-center justify-between sm:justify-center gap-1 sm:gap-5 w-full sm:w-auto">
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
              className={`shrink-0 rounded-full border-2 transition flex items-center justify-center ${CIRCLE_SIZE[i]} ${circleClass(i, selected)}`}
            >
              {selected && <i className="fas fa-check text-white text-xs sm:text-sm" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <span className="hidden sm:block w-24 text-base font-bold text-violet-300">Disagree</span>
    </div>
  </div>
);

const Test = ({ answers, step, setStep, onAnswer, onFinish, onExit }) => {
  const topRef = useRef(null);
  const qRefs = useRef({});
  const [missing, setMissing] = useState(false);
  const pageQs = QUESTIONS.slice(step * PER_STEP, step * PER_STEP + PER_STEP);
  const firstOpen = pageQs.find((q) => typeof answers[q.id] !== "number");
  const doneCount = Object.keys(answers).length;
  const pct = Math.round((doneCount / QUESTIONS.length) * 100);

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
    // Move gently to the next unanswered statement on this page.
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
      <div className="sticky top-2 z-30 mb-4 flex items-center gap-4 justify-between px-4 sm:px-6 py-4 rounded-2xl border border-white/10 bg-[#0b1224]/95 backdrop-blur">
        <button
          type="button"
          onClick={() => (step > 0 ? moveTo(step - 1) : onExit())}
          className="text-xs sm:text-sm font-black uppercase tracking-widest text-cyan-300 hover:text-white transition whitespace-nowrap"
        >
          <i className="fas fa-arrow-left mr-2" aria-hidden="true" />
          {step > 0 ? "Previous step" : "Back"}
        </button>
        <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
          <div
            className="hidden sm:block w-40 md:w-64 h-2 rounded-full bg-white/10 overflow-hidden"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Questions answered"
          >
            <div className="h-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">Step {step + 1} of {STEPS}</span>
        </div>
      </div>
      <div className="sm:hidden h-1.5 rounded-full bg-white/10 overflow-hidden mb-2" aria-hidden="true">
        <div className="h-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div>
        {pageQs.map((q) => (
          <Question
            key={q.id}
            q={q}
            value={answers[q.id]}
            onAnswer={answer}
            current={firstOpen ? firstOpen.id === q.id : false}
            missing={missing && typeof answers[q.id] !== "number"}
            innerRef={(el) => { qRefs.current[q.id] = el; }}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={goNext}
          className="px-8 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition"
        >
          {step + 1 < STEPS ? "Next" : "See my report"} <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
        </button>
        {missing && firstOpen && (
          <p className="text-sm font-semibold text-rose-300" role="alert">
            Please answer every statement on this step to continue.
          </p>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Report ---

const TraitBar = ({ t, pct }) => {
  const info = TRAITS[t];
  const l = lean(pct);
  const side = l.high ? info.high : info.low;
  const a = ACCENT_CLASSES[side.color];
  return (
    <div className="print-break-avoid">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-base font-bold text-white">{info.name}</span>
        <span className={`text-base font-black ${a.text}`}>{l.strength}% {side.label}</span>
      </div>
      <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" aria-hidden="true" />
        <div
          className={`absolute inset-y-0 ${a.bar} rounded-full`}
          style={l.high ? { left: 0, width: `${l.strength}%` } : { right: 0, width: `${l.strength}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs font-bold">
        <span className={l.high ? ACCENT_CLASSES[info.high.color].text : "text-slate-400"}>{info.high.label}</span>
        <span className={!l.high ? ACCENT_CLASSES[info.low.color].text : "text-slate-400"}>{info.low.label}</span>
      </div>
    </div>
  );
};

const BAND_WORD = { strong: "strongly", clear: "clearly", slight: "slightly" };

const Report = ({ answers, onRetake }) => {
  const scores = useMemo(() => scoreTraits(answers), [answers]);
  const profile = PROFILES[profileKey(scores)];
  const steady = lean(scores.S);

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
      {/* Profile */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-cyan-600/10 p-6 md:p-10 mb-8 print-break-avoid">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-black uppercase tracking-[0.2em] mb-4">
          Your personality profile
        </span>
        <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-3">
          {profile.name}
        </h1>
        <p className="text-lg md:text-xl font-semibold text-cyan-300 mb-4">{profile.tagline}</p>
        <p className="text-base md:text-lg text-slate-200 leading-relaxed max-w-3xl mb-6">{profile.summary}</p>
        <div className="flex flex-wrap gap-2">
          {TRAIT_ORDER.map((t) => {
            const l = lean(scores[t]);
            const side = l.high ? TRAITS[t].high : TRAITS[t].low;
            const a = ACCENT_CLASSES[side.color];
            return (
              <span key={t} className={`px-3 py-1.5 rounded-full text-sm font-bold border ${a.ring} ${a.bg} ${a.text}`}>
                {side.label}
              </span>
            );
          })}
        </div>
        <div className="print-hide flex flex-wrap gap-3 mt-8">
          <button type="button" onClick={print} className="px-5 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition">
            <i className="fas fa-print mr-2" aria-hidden="true" /> Print or save as PDF
          </button>
          <button type="button" onClick={onRetake} className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold transition">
            <i className="fas fa-rotate-left mr-2" aria-hidden="true" /> Take the test again
          </button>
          <Link to="/play-area" className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold transition">
            More tests and puzzles
          </Link>
        </div>
      </section>

      {/* Traits */}
      <section className="grid lg:grid-cols-[2fr_3fr] gap-6 mb-8">
        <div className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03] print-break-avoid">
          <h2 className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">Your five traits</h2>
          <p className="text-sm text-slate-300 mb-6">Each bar shows which side you lean to and how strongly. Near the middle means you are balanced.</p>
          <div className="space-y-6">
            {TRAIT_ORDER.map((t) => <TraitBar key={t} t={t} pct={scores[t]} />)}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 md:p-8 rounded-3xl border-t-4 border border-emerald-500/30 bg-emerald-500/[0.05] print-break-avoid">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 bg-emerald-500/15 text-emerald-300">
              <i className="fas fa-book-open" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-white mb-3">Subjects you may enjoy</h2>
            <ul className="space-y-2">
              {profile.subjects.map((s) => (
                <li key={s} className="flex gap-3 text-base text-slate-200"><i className="fas fa-check text-emerald-400 mt-1" aria-hidden="true" />{s}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 md:p-8 rounded-3xl border-t-4 border border-cyan-500/30 bg-cyan-500/[0.05] print-break-avoid">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 bg-cyan-500/15 text-cyan-300">
              <i className="fas fa-briefcase" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-white mb-3">Careers to explore</h2>
            <ul className="space-y-2">
              {profile.careers.map((c) => (
                <li key={c} className="flex gap-3 text-base text-slate-200"><i className="fas fa-arrow-right text-cyan-400 mt-1" aria-hidden="true" />{c}</li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-2 p-6 md:p-8 rounded-3xl border-t-4 border border-amber-500/30 bg-amber-500/[0.05] print-break-avoid">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 bg-amber-500/15 text-amber-300">
              <i className="fas fa-lightbulb" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-white mb-3">Your personal study plan</h2>
            <ol className="space-y-2 list-decimal list-inside">
              {TRAIT_ORDER.map((t) => {
                const side = lean(scores[t]).high ? "high" : "low";
                return <li key={t} className="text-base text-slate-200">{TRAIT_TEXT[t][side].study[0]}</li>;
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Trait details */}
      <section className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black font-poppins text-white mb-6">What your results mean</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {TRAIT_ORDER.map((t) => {
            const l = lean(scores[t]);
            const side = l.high ? "high" : "low";
            const info = TRAITS[t];
            const label = info[side].label;
            const a = ACCENT_CLASSES[info[side].color];
            const txt = TRAIT_TEXT[t][side];
            return (
              <article key={t} className={`p-6 md:p-7 rounded-3xl border-t-4 border ${a.ring} bg-white/[0.03] print-break-avoid`}>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 mb-1">{info.name}</p>
                <h3 className={`text-lg font-bold mb-3 ${a.text}`}>
                  {l.band === "slight" ? `Balanced, leaning ${label}` : `${BAND_WORD[l.band][0].toUpperCase()}${BAND_WORD[l.band].slice(1)} ${label}`}
                </h3>
                <p className="text-base text-slate-200 leading-relaxed mb-4">
                  {l.band === "slight" && "You show both sides of this trait, depending on the situation. "}
                  {txt.about}
                </p>
                <p className="text-sm font-bold text-emerald-300 mb-2"><i className="fas fa-star mr-2" aria-hidden="true" />Strengths</p>
                <ul className="space-y-1.5 mb-4">
                  {txt.strengths.map((s) => <li key={s} className="text-sm text-slate-200">• {s}</li>)}
                </ul>
                <p className="text-sm font-bold text-amber-300 mb-2"><i className="fas fa-triangle-exclamation mr-2" aria-hidden="true" />Watch out for</p>
                <ul className="space-y-1.5 mb-4">
                  {txt.watch.map((s) => <li key={s} className="text-sm text-slate-200">• {s}</li>)}
                </ul>
                <p className="text-sm font-bold text-cyan-300 mb-2"><i className="fas fa-graduation-cap mr-2" aria-hidden="true" />Study tips</p>
                <ul className="space-y-1.5">
                  {txt.study.map((s) => <li key={s} className="text-sm text-slate-200">• {s}</li>)}
                </ul>
              </article>
            );
          })}
          <article className="p-6 md:p-7 rounded-3xl border-t-4 border border-indigo-500/30 bg-indigo-500/[0.05] print-break-avoid">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 mb-1">Exam day</p>
            <h3 className="text-lg font-bold mb-3 text-indigo-300">
              {steady.high ? "Use your calm, back it with practice" : "Turn nerves into energy"}
            </h3>
            <p className="text-base text-slate-200 leading-relaxed mb-4">
              {steady.high
                ? "You keep your head in exams. Make sure that calm is backed by real preparation: timed past papers in the last six weeks will show you exactly where you stand."
                : "Feeling nervous shows you care. The more often you practise under real exam conditions, the less scary the real exam feels."}
            </p>
            <ul className="space-y-1.5">
              <li className="text-sm text-slate-200">• Sleep at least 7 hours the night before</li>
              <li className="text-sm text-slate-200">• Read the whole paper first and start with a question you like</li>
              <li className="text-sm text-slate-200">• Stuck? Mark it, move on, and come back later</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Next steps */}
      <section className="p-6 md:p-10 rounded-3xl border border-white/10 bg-white/[0.03] print-break-avoid">
        <h2 className="text-2xl md:text-3xl font-black font-poppins text-white mb-3">What next?</h2>
        <p className="text-base text-slate-200 leading-relaxed max-w-3xl mb-6">
          Personality is only one part of choosing your path — your interests, your grades and your goals matter too. Share this report with your parents and teachers, and read our subject guides to see what each subject really involves.
        </p>
        <div className="print-hide flex flex-wrap gap-3 mb-6">
          <Link to="/subjects" className="px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition">Read the subject guides</Link>
          <Link to="/courses" className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold transition">Explore VCS courses</Link>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          <i className="fas fa-circle-info text-indigo-300 mr-2" aria-hidden="true" />
          This test is for self-discovery and fun. It is based on the widely used "Big Five" model of personality, but it is not a medical or psychological diagnosis. Personality can grow and change as you do.
        </p>
      </section>
    </div>
  );
};

// ---------------------------------------------------------------- Page -----

const PersonalityTest = () => {
  useSeo({
    title: "Free Personality Test for Students — Strengths, Study Style & Careers",
    description:
      "Take Virtual City School's free 100-question personality test for O and A Level students. Get an instant report on your personality profile, strengths, best study style, and the subjects and careers that may suit you.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Play Area", item: `${SITE_URL}/play-area` },
          { "@type": "ListItem", position: 3, name: "Personality Test", item: PAGE_URL },
        ],
      },
    ],
  });

  // Saved progress from this browser (prerendering has none, so its HTML is the intro).
  const [saved, setSaved] = useState(load);
  const [phase, setPhase] = useState("intro");
  const [answers, setAnswers] = useState(() => saved?.answers || {});
  const [step, setStep] = useState(() => Math.min(Math.max(0, saved?.step || 0), STEPS - 1));
  const topRef = useRef(null);

  const toTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const onAnswer = (id, v) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: v };
      save({ answers: next, step, done: false });
      return next;
    });
  };

  const changeStep = (s) => {
    setStep(s);
    save({ answers, step: s, done: false });
  };

  const start = () => {
    clear();
    setSaved(null);
    setAnswers({});
    setStep(0);
    setPhase("test");
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
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-violet-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <div ref={topRef} className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-10 md:pt-14 pb-24 scroll-mt-28">
        <nav aria-label="Breadcrumb" className="print-hide flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/play-area" className="hover:text-white transition">Play Area</Link>
          <span>/</span>
          <span className="text-slate-200">Personality Test</span>
        </nav>

        {phase === "intro" && (
          <Intro
            saved={saved}
            onStart={start}
            onResume={() => setPhase("test")}
            onReport={() => { setPhase("report"); toTop(); }}
          />
        )}
        {phase === "test" && (
          <Test answers={answers} step={step} setStep={changeStep} onAnswer={onAnswer} onFinish={finish} onExit={exit} />
        )}
        {phase === "report" && <Report answers={answers} onRetake={start} />}
      </div>
    </div>
  );
};

export default PersonalityTest;
