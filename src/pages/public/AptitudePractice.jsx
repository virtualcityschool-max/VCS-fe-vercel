import { useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { ACCENT_CLASSES } from "../../data/playArea/games";
import { APTITUDE, SOURCES } from "../../data/playArea/reasoning";
import TimedTest, { Review } from "../../components/playArea/tests/TimedTest";
import { todayKey } from "../../data/playArea/memory";
import { nowMs } from "../../components/playArea/utils";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/mind-lab/aptitude-practice`;
const STORE_KEY = "vcs_play_aptitude_v1";
const ORDER = ["numerical", "verbal", "abstract"];
const SECTION_NAMES = Object.fromEntries(ORDER.map((k) => [k, { name: APTITUDE[k].name }]));

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (s && typeof s === "object") return { numerical: [], verbal: [], abstract: [], ...s };
  } catch { /* private mode or bad data */ }
  return { numerical: [], verbal: [], abstract: [] };
};
const save = (s) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* private mode */ }
};

const TIPS = {
  numerical: ["Read the question first, then find only the numbers you need.", "Percentage change = (new − old) ÷ old × 100. Always divide by the OLD value.", "Estimate first: if the answer should be about 30%, rule out 3% and 300%."],
  verbal: ["Use ONLY the passage — not what you know from outside.", "'Cannot say' means the passage doesn't give enough information either way.", "Watch for strong words like 'all', 'never', 'only' — they often make a statement false."],
  abstract: ["Look for one change at a time: turning, moving, counting, shading.", "Check two or three rules together — wrong options usually break just one.", "The small dot on each shape shows which way it is pointing."],
};

const WHO = [
  { icon: "fas fa-building", color: "indigo", title: "Employers", text: "Banks, oil and gas companies, consultancies and graduate schemes often send an online aptitude test before the interview." },
  { icon: "fas fa-building-columns", color: "emerald", title: "Universities", text: "Admission tests such as Saudi Arabia's GAT, Pakistan's NTS and the UCAT for medicine include reasoning sections like these." },
  { icon: "fas fa-chalkboard-user", color: "amber", title: "Teaching jobs", text: "Many schools test numerical and verbal reasoning when hiring teachers — reading data and writing clearly matter in the classroom." },
];

const AptitudePractice = () => {
  useSeo({
    title: "Aptitude Test Practice — Free Numerical, Verbal and Abstract Reasoning Tests",
    description:
      "Free timed aptitude test practice for job seekers and students: numerical reasoning with data tables, verbal reasoning (True / False / Cannot say) and abstract reasoning. New questions every time, with answers explained.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: `${SITE_URL}/mind-lab` },
          { "@type": "ListItem", position: 3, name: "Aptitude Test Practice", item: PAGE_URL },
        ],
      },
    ],
  });

  const [store, setStore] = useState(load);
  const [run, setRun] = useState(null); // { section, questions }
  const [result, setResult] = useState(null); // { section, questions, answers, score, seconds, timedOut, best }

  const start = (section) => {
    const seed = nowMs() % 2147483647;
    setResult(null);
    setRun({ section, questions: APTITUDE[section].make(seed) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDone = (answers, seconds, timedOut) => {
    const { section, questions } = run;
    const sc = questions.filter((q) => answers[q.id] === q.answer).length;
    const prevBest = Math.max(0, ...store[section].map((a) => a.pct));
    const pct = Math.round((sc / questions.length) * 100);
    const next = { ...store, [section]: [...store[section], { date: todayKey(), score: sc, total: questions.length, pct, seconds }].slice(-10) };
    setStore(next);
    save(next);
    setResult({ section, questions, answers, score: sc, pct, seconds, timedOut, newBest: store[section].length > 0 && pct > prevBest });
    setRun(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link><span>/</span>
          <Link to="/mind-lab" className="hover:text-white transition">Mind Lab</Link><span>/</span>
          <span className="text-slate-200">Aptitude Test Practice</span>
        </nav>

        {run && (
          <TimedTest
            key={run.questions[0]?.id + run.section}
            questions={run.questions}
            minutes={APTITUDE[run.section].minutes}
            title={APTITUDE[run.section].name}
            onDone={onDone}
            onQuit={() => setRun(null)}
          />
        )}

        {!run && result && (() => {
          const a = APTITUDE[result.section];
          const c = ACCENT_CLASSES[a.color];
          const hist = store[result.section];
          return (
            <div className="mb-14">
              <section className={`rounded-3xl border ${c.ring} ${c.bg} p-6 md:p-10 mb-8`}>
                {result.newBest && <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-black uppercase tracking-widest mb-4"><i className="fas fa-trophy" aria-hidden="true" />New personal best!</p>}
                <p className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${c.text}`}>{a.name}</p>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-2">{result.score} / {result.questions.length}</h1>
                <p className="text-xl font-bold text-cyan-300 mb-4">{result.pct}% · {Math.floor(result.seconds / 60)} min {result.seconds % 60} s{result.timedOut ? " (time ran out)" : ""}</p>
                <p className="text-base text-slate-200 max-w-3xl mb-4">
                  {result.pct >= 80 ? "Excellent — you'd be in a strong position in a real test. Try another set to keep it consistent." : result.pct >= 60 ? "Good result. Read the explanations for the ones you missed, then try a fresh set." : "Keep going — these tests get much easier with practice. Read every explanation below, then try again."}
                </p>
                {hist.length > 1 && (
                  <div className="flex items-end gap-2 h-20 mb-2" aria-label="Your recent scores">
                    {hist.map((h, n) => (
                      <div key={n} className="flex flex-col items-center gap-1">
                        <div className={`w-8 rounded-t-md ${n === hist.length - 1 ? c.bar : "bg-white/25"}`} style={{ height: `${Math.max(6, h.pct * 0.6)}px` }} title={`${h.pct}% on ${h.date}`} />
                        <span className="text-xs text-slate-400">{h.pct}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button type="button" onClick={() => start(result.section)} className="px-5 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold"><i className="fas fa-rotate-right mr-2" aria-hidden="true" />New set of questions</button>
                  <button type="button" onClick={() => setResult(null)} className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold">All sections</button>
                </div>
              </section>
              <Review questions={result.questions} answers={result.answers} sections={SECTION_NAMES} />
            </div>
          );
        })()}

        {!run && !result && (
          <>
            <header className="grid lg:grid-cols-2 gap-10 items-center mb-14">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-[0.2em] mb-5">Mind Lab · Aptitude Test Practice</span>
                <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
                  Practise the test <span className="text-gradient">before the interview</span>
                </h1>
                <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
                  Many employers and universities use timed aptitude tests. Practise the three most common types with <strong className="text-indigo-300 font-semibold">new questions every time</strong>, a real countdown, and every answer explained.
                </p>
                <p className="text-sm text-slate-400 max-w-3xl">Questions are written and generated by VCS for practice. They are not taken from any company's real test.</p>
              </div>
              <figure>
                <img src="/images/play-area/aptitude.webp" alt="A job candidate being interviewed at an office desk" width="1600" height="1067" className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10" />
                <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
              </figure>
            </header>

            <section aria-labelledby="sections-heading" className="mb-14">
              <h2 id="sections-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-6">Choose a section</h2>
              <div className="grid lg:grid-cols-3 gap-5">
                {ORDER.map((k) => {
                  const a = APTITUDE[k];
                  const c = ACCENT_CLASSES[a.color];
                  const hist = store[k];
                  const best = hist.length ? Math.max(...hist.map((h) => h.pct)) : null;
                  return (
                    <div key={k} className={`flex flex-col p-6 rounded-3xl border-t-4 border ${c.ring} bg-white/[0.03]`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${c.icon}`}><i className={a.icon} aria-hidden="true" /></span>
                        <div>
                          <h3 className="text-lg font-bold text-white">{a.name}</h3>
                          <p className={`text-xs font-black uppercase tracking-wider ${c.text}`}>{a.count} questions · {a.minutes} minutes</p>
                        </div>
                      </div>
                      <p className="text-base text-slate-200 leading-relaxed mb-4">{a.text}</p>
                      <ul className="space-y-1.5 mb-5">
                        {TIPS[k].map((t) => <li key={t} className="flex gap-2 text-sm text-slate-300"><i className="fas fa-lightbulb text-amber-300 mt-0.5" aria-hidden="true" />{t}</li>)}
                      </ul>
                      <p className="mt-auto text-sm font-bold text-amber-300 mb-3"><i className="fas fa-trophy mr-1.5" aria-hidden="true" />{best === null ? "Not tried yet" : `Best: ${best}% · ${hist.length} tr${hist.length === 1 ? "y" : "ies"}`}</p>
                      <button type="button" onClick={() => start(k)} className="px-5 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">
                        Start {a.name.split(" ")[0].toLowerCase()} test <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="who-heading" className="mb-12">
              <h2 id="who-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-6">Who uses aptitude tests?</h2>
              <div className="grid md:grid-cols-3 gap-5">
                {WHO.map((w) => {
                  const c = ACCENT_CLASSES[w.color];
                  return (
                    <div key={w.title} className={`p-6 rounded-3xl border-l-4 border ${c.ring} bg-white/[0.03]`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 ${c.icon}`}><i className={w.icon} aria-hidden="true" /></div>
                      <h3 className="text-lg font-bold text-white mb-2">{w.title}</h3>
                      <p className="text-base text-slate-200 leading-relaxed">{w.text}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mb-12 grid md:grid-cols-2 gap-5">
              <Link to="/mind-lab/workplace-assessment" className="p-6 rounded-3xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300 mb-2">Also for job seekers</p>
                <p className="text-lg font-bold text-white mb-1">Workplace Personality Assessment</p>
                <p className="text-sm text-slate-300">The other test many employers ask for — with a printable report.</p>
              </Link>
              <Link to="/mind-lab/reasoning-test" className="p-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-2">Challenge yourself</p>
                <p className="text-lg font-bold text-white mb-1">Reasoning Test (IQ-style)</p>
                <p className="text-sm text-slate-300">24 puzzles in 20 minutes: series, matrices, verbal logic and spatial rotation.</p>
              </Link>
            </section>
            <section aria-labelledby="sources-heading">
              <h2 id="sources-heading" className="text-lg font-bold text-white mb-3">Sources</h2>
              <ul className="space-y-1.5 text-sm text-slate-300 list-disc pl-5">{SOURCES.slice(0, 2).map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AptitudePractice;
