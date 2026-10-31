import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { ACCENT_CLASSES } from "../../data/playArea/games";
import {
  STORE_KEY, SOURCE, SCALE, AREAS, AREA_ORDER, QUESTIONS, PER_STEP, STEPS, MODEL, SOURCES, scoreAreas, level,
} from "../../data/playArea/eq";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/mind-lab/eq-check`;

const CIRCLE = [
  "w-11 h-11 sm:w-14 sm:h-14 border-violet-400/80",
  "w-9 h-9 sm:w-11 sm:h-11 border-violet-400/80",
  "w-7 h-7 sm:w-9 sm:h-9 border-slate-400",
  "w-9 h-9 sm:w-11 sm:h-11 border-emerald-400/80",
  "w-11 h-11 sm:w-14 sm:h-14 border-emerald-400/80",
];
const FILL = ["bg-violet-500 border-violet-400", "bg-violet-500 border-violet-400", "bg-slate-400 border-slate-300", "bg-emerald-500 border-emerald-400", "bg-emerald-500 border-emerald-400"];
const HOVER = ["hover:bg-violet-500/30", "hover:bg-violet-500/30", "hover:bg-slate-400/30", "hover:bg-emerald-500/30", "hover:bg-emerald-500/30"];

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (s && typeof s === "object" && s.answers) return s;
  } catch { /* private mode or bad data */ }
  return { answers: {}, done: false };
};
const save = (s) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* private mode */ }
};

// ---------------------------------------------------------------- Test -----

const Test = ({ answers, step, setStep, onAnswer, onFinish, onExit }) => {
  const topRef = useRef(null);
  const [missing, setMissing] = useState(false);
  const pageQs = QUESTIONS.slice(step * PER_STEP, step * PER_STEP + PER_STEP);
  const open = pageQs.filter((q) => typeof answers[q.id] !== "number");
  const pct = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const go = (s) => { setMissing(false); setStep(s); };
  const next = () => {
    if (open.length) return setMissing(true);
    if (step + 1 < STEPS) return go(step + 1);
    return onFinish();
  };

  return (
    <div ref={topRef} className="scroll-mt-28">
      <div className="sticky top-2 z-30 mb-6 flex items-center gap-4 justify-between px-4 sm:px-6 py-4 rounded-2xl border border-white/10 bg-[#0b1224]/95 backdrop-blur">
        <button type="button" onClick={() => (step > 0 ? go(step - 1) : onExit())} className="text-xs sm:text-sm font-black uppercase tracking-widest text-cyan-300 hover:text-white whitespace-nowrap">
          <i className="fas fa-arrow-left mr-2" aria-hidden="true" />{step > 0 ? "Previous" : "Back"}
        </button>
        <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
          <div className="hidden sm:block w-40 md:w-64 h-2 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Statements answered">
            <div className="h-full bg-rose-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">Step {step + 1} of {STEPS}</span>
        </div>
      </div>
      <p className="text-base text-slate-300 mb-2">How accurately does each statement describe you? Think of how you usually are, not how you'd like to be.</p>
      {pageQs.map((q) => {
        const value = answers[q.id];
        const isMissing = missing && typeof value !== "number";
        return (
          <div key={q.id} className={`py-6 sm:py-7 border-b border-white/10 ${isMissing ? "rounded-2xl ring-2 ring-rose-500/60 px-3 sm:px-5 -mx-3 sm:-mx-5" : ""}`}>
            <p id={`eq-${q.id}`} className="text-lg md:text-xl font-bold text-white mb-4">{q.text}</p>
            <div role="radiogroup" aria-labelledby={`eq-${q.id}`} className="grid grid-cols-5 gap-1 sm:gap-3 max-w-2xl">
              {SCALE.map((s, i) => {
                const selected = value === s.v;
                return (
                  <button key={s.v} type="button" role="radio" aria-checked={selected} aria-label={s.label} onClick={() => onAnswer(q.id, s.v)} className="flex flex-col items-center gap-2">
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
      })}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="button" onClick={next} className="px-8 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">
          {step + 1 < STEPS ? "Next" : "See my results"} <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
        </button>
        {missing && open.length > 0 && <p className="text-sm font-semibold text-rose-300" role="alert">Please answer every statement ({open.length} left).</p>}
      </div>
    </div>
  );
};

// -------------------------------------------------------------- Report -----

const AreaResult = ({ id, pct }) => {
  const a = AREAS[id];
  const c = ACCENT_CLASSES[a.color];
  const lv = level(pct);
  const tag = a.kind === "style"
    ? (lv === "high" ? "Mostly heart" : lv === "low" ? "Mostly head" : "Balanced")
    : a.kind === "balance"
      ? (lv === "high" ? "Very open" : lv === "low" ? "Holds back" : "Balanced")
      : (lv === "high" ? "Strength" : lv === "low" ? "Room to grow" : "Developing");
  const tagCls = a.kind === "level" ? (lv === "high" ? "bg-emerald-500/15 text-emerald-300" : lv === "low" ? "bg-amber-500/15 text-amber-300" : "bg-cyan-500/15 text-cyan-300") : "bg-white/10 text-slate-200";

  return (
    <article className={`p-6 rounded-3xl border-l-4 border ${c.ring} bg-white/[0.03]`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${c.icon}`}><i className={a.icon} aria-hidden="true" /></span>
          <div>
            <h3 className="text-lg font-bold text-white">{a.name}</h3>
            <p className={`text-xs font-black uppercase tracking-wider ${c.text}`}>{a.model}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-black ${tagCls}`}>{tag}</span>
      </div>
      <div className="relative h-3 rounded-full bg-white/10 overflow-hidden mb-1" aria-hidden="true">
        {a.kind === "level" && <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.max(4, pct)}%` }} />}
        {a.kind !== "level" && (
          <>
            <div className="absolute inset-y-0 left-[35%] w-[30%] bg-white/10" />
            <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ring-2 ring-white/80 ${c.bar}`} style={{ left: `calc(${pct}% - ${(pct / 100) * 16}px)` }} />
          </>
        )}
      </div>
      <div className="flex justify-between text-xs font-bold text-slate-400 mb-3">
        <span>{a.kind === "style" ? a.lowLabel : a.kind === "balance" ? "Holds back" : "Low"}</span>
        <span className="text-slate-200">{pct}%</span>
        <span>{a.kind === "style" ? a.highLabel : a.kind === "balance" ? "Very open" : "High"}</span>
      </div>
      <p className="text-base text-slate-200 leading-relaxed mb-3">{a[lv]}</p>
      <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-100"><i className="fas fa-lightbulb mr-1.5 text-amber-300" aria-hidden="true" /><strong>Try this:</strong> {a.tip}</p>
    </article>
  );
};

const Report = ({ answers, onRetake }) => {
  const s = useMemo(() => scoreAreas(answers), [answers]);
  const levelAreas = AREA_ORDER.filter((id) => AREAS[id].kind === "level");
  const strongest = [...levelAreas].sort((a, b) => s[b] - s[a])[0];
  const grow = [...levelAreas].sort((a, b) => s[a] - s[b])[0];
  return (
    <div>
      <section className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-600/15 via-violet-600/10 to-amber-600/10 p-6 md:p-10 mb-8">
        <span className="inline-flex px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-[0.2em] mb-4">Your EQ self-check</span>
        <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-4">
          Your emotional strength: <span className="text-gradient">{AREAS[strongest].name.toLowerCase()}</span>
        </h1>
        <p className="text-base md:text-lg text-slate-200 leading-relaxed max-w-3xl mb-2">
          {strongest !== grow
            ? <>The area that would help you most to grow: <strong className="text-amber-300 font-semibold">{AREAS[grow].name.toLowerCase()}</strong>. Read your five areas below — each one has a small thing to try this week.</>
            : <>Read your five areas below — each one has a small thing to try this week.</>}
        </p>
        <p className="text-sm text-slate-400 max-w-3xl">This is a self-reflection based on research scales, not a diagnosis or an official EQ score. Emotional skills can grow at any age.</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <button type="button" onClick={onRetake} className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold"><i className="fas fa-rotate-left mr-2" aria-hidden="true" />Take it again</button>
        </div>
      </section>
      <div className="grid lg:grid-cols-2 gap-5 mb-10">
        {AREA_ORDER.map((id) => <AreaResult key={id} id={id} pct={s[id]} />)}
      </div>
      <section className="mb-10 p-6 md:p-8 rounded-3xl border border-violet-500/30 bg-violet-500/5">
        <h2 className="text-xl font-black text-white mb-2">What this check doesn't measure</h2>
        <p className="text-base text-slate-200 leading-relaxed max-w-3xl">
          Managing your emotions (calming down, bouncing back) and reading other people's emotions are big parts of EQ too. They're best measured with tasks, not self-report questions. Practise them with the tips above, and with the "name it" habit: when a strong feeling comes, name it in one word, take three slow breaths, then decide what to do.
        </p>
      </section>
    </div>
  );
};

// ---------------------------------------------------------------- Page -----

const EQSelfCheck = () => {
  useSeo({
    title: "EQ Self-Check — Free Emotional Intelligence Test for Students (IPIP)",
    description:
      "How well do you notice, show and understand emotions? A free 46-statement emotional intelligence self-check using research scales from the International Personality Item Pool, with a personal report and tips for each area.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: `${SITE_URL}/mind-lab` },
          { "@type": "ListItem", position: 3, name: "EQ Self-Check", item: PAGE_URL },
        ],
      },
    ],
  });

  const [state, setState] = useState(load);
  const [view, setView] = useState(() => (load().done ? "report" : "intro"));
  const [step, setStep] = useState(0);
  const answered = Object.keys(state.answers).length;
  const update = (n) => { setState(n); save(n); };
  const start = () => { update({ answers: {}, done: false }); setStep(0); setView("test"); };
  const resume = () => {
    const firstOpen = QUESTIONS.findIndex((q) => typeof state.answers[q.id] !== "number");
    setStep(Math.max(0, Math.floor(firstOpen / PER_STEP)));
    setView("test");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-rose-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link><span>/</span>
          <Link to="/mind-lab" className="hover:text-white transition">Mind Lab</Link><span>/</span>
          <span className="text-slate-200">EQ Self-Check</span>
        </nav>

        {view === "intro" && (
          <>
            <header className="grid lg:grid-cols-2 gap-10 items-center mb-14">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-[0.2em] mb-5">Mind Lab · EQ Self-Check</span>
                <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
                  How well do you <span className="text-gradient">understand feelings?</span>
                </h1>
                <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
                  Emotional intelligence (EQ) is how well you notice, understand and handle emotions — yours and other people's. It helps with friendships, teamwork, leadership and staying calm in exams. Answer 46 statements to see your <strong className="text-rose-300 font-semibold">emotional strengths</strong>.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6 max-w-xl">
                  {[["46", "statements", "text-rose-300"], ["~6", "minutes", "text-amber-300"], ["5", "areas", "text-violet-300"]].map(([n, l, c]) => (
                    <div key={l} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
                      <div className={`text-2xl md:text-3xl font-black ${c}`}>{n}</div>
                      <div className="text-xs text-slate-300 font-semibold mt-1">{l}</div>
                    </div>
                  ))}
                </div>
                <p className="text-base text-slate-300 mb-8 max-w-3xl">
                  The statements come from emotional-intelligence scales by psychologist Kimberly Barchard, published free in the <strong className="text-white">International Personality Item Pool</strong> — the same trusted source as our Workplace Assessment.
                </p>
                <div className="flex flex-wrap gap-3">
                  {state.done ? (
                    <>
                      <button type="button" onClick={() => setView("report")} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">See my results <i className="fas fa-arrow-right ml-2" aria-hidden="true" /></button>
                      <button type="button" onClick={start} className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold">Take it again</button>
                    </>
                  ) : answered > 0 ? (
                    <>
                      <button type="button" onClick={resume} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">Continue ({answered} of {QUESTIONS.length}) <i className="fas fa-arrow-right ml-2" aria-hidden="true" /></button>
                      <button type="button" onClick={start} className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold">Start over</button>
                    </>
                  ) : (
                    <button type="button" onClick={start} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">Start the EQ check <i className="fas fa-arrow-right ml-2" aria-hidden="true" /></button>
                  )}
                </div>
              </div>
              <figure>
                <img src="/images/play-area/eq.webp" alt="A group of smiling students working together around a laptop" width="1600" height="1067" className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10" />
                <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
              </figure>
            </header>

            <section aria-labelledby="model-heading" className="mb-12">
              <h2 id="model-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">The four skills of emotional intelligence</h2>
              <p className="text-base text-slate-300 mb-6 max-w-3xl">Psychologists Peter Salovey and John Mayer first described emotional intelligence in 1990 as four connected skills. Daniel Goleman's 1995 book made the idea famous.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {MODEL.map((m, i) => (
                  <div key={m.name} className="p-6 rounded-3xl border-t-4 border border-rose-500/30 bg-white/[0.03]">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-11 h-11 rounded-full bg-rose-500/15 text-rose-300 flex items-center justify-center text-lg"><i className={m.icon} aria-hidden="true" /></span>
                      <h3 className="text-lg font-bold text-white">{i + 1}. {m.name}</h3>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="honest-heading" className="mb-12 p-6 md:p-8 rounded-3xl border border-amber-500/30 bg-amber-500/5">
              <h2 id="honest-heading" className="text-xl font-black text-white mb-2"><i className="fas fa-circle-info text-amber-300 mr-2" aria-hidden="true" />Can EQ really be measured?</h2>
              <p className="text-base text-slate-200 leading-relaxed max-w-4xl">
                Partly. The best EQ tests use tasks (like reading emotions in faces) and are paid, supervised tests. Questionnaires like this one measure how you <em>see</em> yourself — useful for reflection, but not an official score. We show five areas instead of one "EQ number", because they are different skills, and for some of them the healthy answer is in the middle.
              </p>
            </section>
            <section aria-labelledby="sources-heading">
              <h2 id="sources-heading" className="text-lg font-bold text-white mb-3">Sources</h2>
              <ul className="space-y-1.5 text-sm text-slate-300 list-disc pl-5">
                {SOURCES.map((x) => <li key={x}>{x}</li>)}
                <li>Scale reliabilities (alpha, women / men): {AREA_ORDER.map((id) => `${AREAS[id].name} ${AREAS[id].alpha}`).join(" · ")}. <a href={SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">IPIP key</a></li>
              </ul>
            </section>
          </>
        )}

        {view === "test" && (
          <Test
            answers={state.answers}
            step={step}
            setStep={setStep}
            onAnswer={(id, v) => update({ ...state, answers: { ...state.answers, [id]: v } })}
            onFinish={() => { update({ ...state, done: true }); setView("report"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onExit={() => setView("intro")}
          />
        )}
        {view === "report" && <Report answers={state.answers} onRetake={start} />}
      </div>
    </div>
  );
};

export default EQSelfCheck;
