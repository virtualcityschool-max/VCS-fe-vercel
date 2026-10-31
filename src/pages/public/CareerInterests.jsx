import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { ACCENT_CLASSES } from "../../data/playArea/games";
import {
  STORE_KEY, ATTRIBUTION, QUESTIONS, PER_STEP, STEPS, AREA_ORDER, AREAS, GUIDES, PAIR_TIPS, SOURCES,
  scoreAreas, ranked,
} from "../../data/playArea/career";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/mind-lab/career-interests`;

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

const printPage = () => {
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

const Attribution = () => (
  <p className="text-sm text-slate-400 leading-relaxed">
    {ATTRIBUTION.text}{" "}
    <a href={ATTRIBUTION.toolUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">About the Interest Profiler</a>
    {" · "}
    <a href={ATTRIBUTION.licenceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">CC BY-ND 4.0</a>
  </p>
);

// ---------------------------------------------------------------- Test -----

const Test = ({ answers, step, setStep, onAnswer, onFinish, onExit }) => {
  const topRef = useRef(null);
  const [missing, setMissing] = useState(false);
  const pageQs = QUESTIONS.slice(step * PER_STEP, step * PER_STEP + PER_STEP);
  const open = pageQs.filter((q) => answers[q.id] === undefined);
  const doneCount = Object.keys(answers).length;
  const pct = Math.round((doneCount / QUESTIONS.length) * 100);

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
          <div className="hidden sm:block w-40 md:w-64 h-2 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Activities answered">
            <div className="h-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">Step {step + 1} of {STEPS}</span>
        </div>
      </div>

      <p className="text-base text-slate-300 mb-4">Would you <strong className="text-white">like</strong> to do this activity? Don't think about the training needed or the money.</p>
      <ul className="space-y-3">
        {pageQs.map((q) => {
          const v = answers[q.id];
          const isMissing = missing && v === undefined;
          return (
            <li key={q.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 rounded-2xl border transition ${isMissing ? "border-rose-500/60 ring-2 ring-rose-500/40" : "border-white/10 bg-white/[0.03]"}`}>
              <p id={`a-${q.id}`} className="flex-1 text-lg font-bold text-white">{q.text}</p>
              <div className="flex gap-2 shrink-0" role="radiogroup" aria-labelledby={`a-${q.id}`}>
                <button type="button" role="radio" aria-checked={v === true} onClick={() => onAnswer(q.id, true)} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-full border-2 text-base font-bold transition ${v === true ? "border-emerald-400 bg-emerald-500 text-white" : "border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/15"}`}>
                  <i className="fas fa-thumbs-up mr-2" aria-hidden="true" />Like
                </button>
                <button type="button" role="radio" aria-checked={v === false} onClick={() => onAnswer(q.id, false)} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-full border-2 text-base font-bold transition ${v === false ? "border-slate-300 bg-slate-500 text-white" : "border-slate-400/50 text-slate-200 hover:bg-white/10"}`}>
                  Not for me
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={next} className="px-8 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
          {step + 1 < STEPS ? "Next" : "See my results"} <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
        </button>
        {missing && open.length > 0 && (
          <p className="text-sm font-semibold text-rose-300" role="alert">Please choose Like or Not for me for every activity ({open.length} left).</p>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------- Report -----

const AreaCard = ({ id, rank, score }) => {
  const a = AREAS[id];
  const c = ACCENT_CLASSES[a.color];
  return (
    <article className={`p-6 md:p-8 rounded-3xl border-t-4 border ${c.ring} bg-white/[0.03] print-break-avoid`}>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${c.icon}`}><i className={a.icon} aria-hidden="true" /></div>
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.2em] ${c.text}`}>{["Strongest", "Second", "Third"][rank]} interest · {score} of 10</p>
          <h3 className="text-2xl font-black text-white">{a.name}: {a.nick}</h3>
        </div>
      </div>
      <p className="text-base text-slate-200 leading-relaxed mb-5 max-w-3xl">{a.summary}</p>
      <div className="grid md:grid-cols-3 gap-5">
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-2">Careers to explore</h4>
          <ul className="space-y-1 text-base text-slate-200">{a.careers.map((x) => <li key={x}><i className={`fas fa-circle text-[6px] align-middle mr-2 ${c.text}`} aria-hidden="true" />{x}</li>)}</ul>
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-2">A Level subjects that help</h4>
          <ul className="flex flex-wrap gap-2">
            {a.subjects.map((s) => (
              <li key={s}>
                {GUIDES[s] ? (
                  <Link to={GUIDES[s]} className={`inline-flex px-3 py-1.5 rounded-full text-sm font-bold border ${c.ring} ${c.bg} ${c.text} hover:text-white`}>{s} <i className="fas fa-arrow-right ml-1.5 text-xs self-center" aria-hidden="true" /></Link>
                ) : (
                  <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-bold border border-white/15 text-slate-200">{s}</span>
                )}
              </li>
            ))}
          </ul>
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-300 mt-4 mb-2">Degrees to look at</h4>
          <ul className="space-y-1 text-base text-slate-200">{a.degrees.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-2">Your strengths</h4>
          <ul className="space-y-1 text-base text-slate-200 mb-4">{a.strengths.map((x) => <li key={x}><i className="fas fa-check text-emerald-400 mr-2" aria-hidden="true" />{x}</li>)}</ul>
          <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-100"><i className="fas fa-lightbulb mr-1.5 text-amber-300" aria-hidden="true" />{a.tip}</p>
        </div>
      </div>
    </article>
  );
};

const Report = ({ answers, onRetake }) => {
  const scores = useMemo(() => scoreAreas(answers), [answers]);
  const order = ranked(scores);
  const top = order.slice(0, 3);
  const code = top.join("");
  const ties = order.filter((x) => scores[x] === scores[top[2]] && !top.includes(x));
  const total = Object.values(scores).reduce((s, v) => s + v, 0);
  const pair = PAIR_TIPS[top[0] + top[1]];

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/15 via-cyan-600/10 to-violet-600/10 p-6 md:p-10 mb-8 print-break-avoid">
        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-[0.2em] mb-4">Your interest code</span>
        <h1 className="text-5xl md:text-7xl font-black font-poppins tracking-widest text-white mb-3">{code}</h1>
        <p className="text-lg md:text-xl font-semibold text-cyan-300 mb-4">{top.map((x) => AREAS[x].name).join(" · ")}</p>
        <p className="text-base md:text-lg text-slate-200 leading-relaxed max-w-3xl">
          You're most drawn to <strong className="text-white">{AREAS[top[0]].name.toLowerCase()}</strong> work ({AREAS[top[0]].nick.replace("The ", "the ").toLowerCase()}), then {AREAS[top[1]].name.toLowerCase()} and {AREAS[top[2]].name.toLowerCase()}.
          {pair && <> Careers that combine your top two interests: <strong className="text-emerald-300 font-semibold">{pair}</strong></>}
        </p>
        {total <= 8 && <p className="mt-4 text-base text-amber-200">You liked only {total} of 60 activities. That's fine — your code is still useful, but try again later, or with a friend, to see if it changes.</p>}
        {ties.length > 0 && <p className="mt-4 text-base text-amber-200">Tie: {ties.map((x) => AREAS[x].name).join(", ")} scored the same as {AREAS[top[2]].name}. Read both and choose the one that feels more like you.</p>}
        <div className="print-hide flex flex-wrap gap-3 mt-8">
          <button type="button" onClick={printPage} className="px-5 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold"><i className="fas fa-print mr-2" aria-hidden="true" />Print or save as PDF</button>
          <button type="button" onClick={onRetake} className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold"><i className="fas fa-rotate-left mr-2" aria-hidden="true" />Take it again</button>
        </div>
      </section>

      <section aria-labelledby="scores-heading" className="mb-8 p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03] print-break-avoid">
        <h2 id="scores-heading" className="text-2xl font-black font-poppins text-white mb-1">Your six interest areas</h2>
        <p className="text-base text-slate-300 mb-6">Number of activities you liked in each area, out of 10.</p>
        <div className="space-y-4">
          {AREA_ORDER.map((id) => {
            const a = AREAS[id];
            const c = ACCENT_CLASSES[a.color];
            return (
              <div key={id} className="grid grid-cols-[minmax(0,150px)_1fr_auto] sm:grid-cols-[220px_1fr_auto] items-center gap-3">
                <span className="flex items-center gap-2 text-base font-bold text-white"><i className={`${a.icon} ${c.text} w-5`} aria-hidden="true" />{a.name}</span>
                <div className="h-4 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${scores[id] * 10}%` }} />
                </div>
                <span className="text-base font-black text-white w-8 text-right">{scores[id]}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="space-y-6 mb-10">
        {top.map((id, i) => <AreaCard key={id} id={id} rank={i} score={scores[id]} />)}
      </div>

      <section className="mb-10 grid md:grid-cols-3 gap-5 print-hide">
        <Link to="/mind-lab/personality-test" className="p-6 rounded-3xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300 mb-2">Next</p>
          <p className="text-lg font-bold text-white mb-1">Personality Test</p>
          <p className="text-sm text-slate-300">Interests say what you enjoy; personality says how you work. Together they point the way.</p>
        </Link>
        <Link to="/mind-lab/aptitude-practice" className="p-6 rounded-3xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300 mb-2">Get ready</p>
          <p className="text-lg font-bold text-white mb-1">Aptitude Test Practice</p>
          <p className="text-sm text-slate-300">Universities and employers often test numerical, verbal and abstract reasoning.</p>
        </Link>
        <Link to="/courses" className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300 mb-2">Study with VCS</p>
          <p className="text-lg font-bold text-white mb-1">A Level courses</p>
          <p className="text-sm text-slate-300">Live online classes with Cambridge teachers for the subjects your career needs.</p>
        </Link>
      </section>
      <Attribution />
    </div>
  );
};

// ---------------------------------------------------------------- Page -----

const CareerInterests = () => {
  useSeo({
    title: "Career Interest Finder — Free Career Test for Students (O*NET Interest Profiler)",
    description:
      "Find your career interests with the 60-activity O*NET Interest Profiler. Get your Holland interest code (RIASEC), careers to explore, the A Level subjects that help and degrees to look at. Free, instant, no sign-up.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: `${SITE_URL}/mind-lab` },
          { "@type": "ListItem", position: 3, name: "Career Interest Finder", item: PAGE_URL },
        ],
      },
    ],
  });

  const [state, setState] = useState(load);
  const [view, setView] = useState(() => (load().done ? "report" : "intro"));
  const [step, setStep] = useState(0);
  const answered = Object.keys(state.answers).length;

  const update = (next) => { setState(next); save(next); };
  const start = () => { update({ answers: {}, done: false }); setStep(0); setView("test"); };
  const resume = () => {
    const firstOpen = QUESTIONS.findIndex((q) => state.answers[q.id] === undefined);
    setStep(Math.max(0, Math.floor(firstOpen / PER_STEP)));
    setView("test");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 print-hide">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-emerald-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="print-hide flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link><span>/</span>
          <Link to="/mind-lab" className="hover:text-white transition">Mind Lab</Link><span>/</span>
          <span className="text-slate-200">Career Interest Finder</span>
        </nav>

        {view === "intro" && (
          <>
            <header className="grid lg:grid-cols-2 gap-10 items-center mb-14">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-[0.2em] mb-5">Mind Lab · Career Interest Finder</span>
                <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
                  What kind of work <span className="text-gradient">would you love?</span>
                </h1>
                <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
                  Tell us which of 60 work activities you'd like to do. You'll get your <strong className="text-emerald-300 font-semibold">interest code</strong>, careers to explore, the A Level subjects that help, and degrees to look at.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6 max-w-xl">
                  {[["60", "activities", "text-emerald-300"], ["~8", "minutes", "text-cyan-300"], ["6", "interest areas", "text-violet-300"]].map(([n, l, c]) => (
                    <div key={l} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
                      <div className={`text-2xl md:text-3xl font-black ${c}`}>{n}</div>
                      <div className="text-xs text-slate-300 font-semibold mt-1">{l}</div>
                    </div>
                  ))}
                </div>
                <p className="text-base text-slate-300 mb-8 max-w-3xl">
                  It uses the <strong className="text-white">O*NET Interest Profiler</strong>, a free career questionnaire from the U.S. Department of Labor, built on John Holland's six interest types and tested with thousands of people.
                </p>
                <div className="flex flex-wrap gap-3">
                  {state.done ? (
                    <>
                      <button type="button" onClick={() => setView("report")} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">See my results <i className="fas fa-arrow-right ml-2" aria-hidden="true" /></button>
                      <button type="button" onClick={start} className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold">Take it again</button>
                    </>
                  ) : answered > 0 ? (
                    <>
                      <button type="button" onClick={resume} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">Continue ({answered} of 60) <i className="fas fa-arrow-right ml-2" aria-hidden="true" /></button>
                      <button type="button" onClick={start} className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold">Start over</button>
                    </>
                  ) : (
                    <button type="button" onClick={start} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">Find my career interests <i className="fas fa-arrow-right ml-2" aria-hidden="true" /></button>
                  )}
                </div>
              </div>
              <figure>
                <img src="/images/play-area/career.webp" alt="A student in safety glasses working with machinery in an engineering workshop" width="1600" height="1067" className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10" />
                <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
              </figure>
            </header>

            <section aria-labelledby="riasec-heading" className="mb-12">
              <h2 id="riasec-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">The six interest types</h2>
              <p className="text-base text-slate-300 mb-6 max-w-3xl">Psychologist John Holland found that most people's interests fit a mix of six types, often called RIASEC. Your top three make your interest code.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {AREA_ORDER.map((id) => {
                  const a = AREAS[id];
                  const c = ACCENT_CLASSES[a.color];
                  return (
                    <div key={id} className={`p-6 rounded-3xl border-t-4 border ${c.ring} bg-white/[0.03]`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${c.icon}`}><i className={a.icon} aria-hidden="true" /></span>
                        <div>
                          <h3 className="text-lg font-bold text-white">{a.name}</h3>
                          <p className={`text-xs font-black uppercase tracking-wider ${c.text}`}>{id} · {a.nick}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{a.summary}</p>
                    </div>
                  );
                })}
              </div>
            </section>
            <section aria-labelledby="sources-heading">
              <h2 id="sources-heading" className="text-lg font-bold text-white mb-3">Sources</h2>
              <ul className="space-y-1.5 text-sm text-slate-300 list-disc pl-5 mb-4">{SOURCES.map((s) => <li key={s}>{s}</li>)}</ul>
              <Attribution />
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

export default CareerInterests;
