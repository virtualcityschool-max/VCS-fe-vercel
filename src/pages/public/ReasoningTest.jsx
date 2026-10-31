import { useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { ACCENT_CLASSES } from "../../data/playArea/games";
import { REASONING_TEST, REASONING_MINUTES, SECTIONS, SOURCES, reasoningLevel } from "../../data/playArea/reasoning";
import TimedTest, { Review } from "../../components/playArea/tests/TimedTest";
import { MatrixGrid, PolyShape } from "../../components/playArea/tests/Visuals";
import { todayKey } from "../../data/playArea/memory";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/mind-lab/reasoning-test`;
const STORE_KEY = "vcs_play_reasoning_v1";
const SECTION_ORDER = ["series", "matrix", "verbal", "spatial"];

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (s && Array.isArray(s.attempts)) return s;
  } catch { /* private mode or bad data */ }
  return { attempts: [] };
};
const save = (s) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* private mode */ }
};

const score = (answers) => {
  const bySection = Object.fromEntries(SECTION_ORDER.map((k) => [k, 0]));
  let total = 0;
  REASONING_TEST.forEach((q) => { if (answers[q.id] === q.answer) { total += 1; bySection[q.section] += 1; } });
  return { total, bySection };
};

const IQ_FACTS = [
  { icon: "fas fa-chart-simple", color: "violet", title: "What an IQ score means", text: "An IQ score compares you with people of the same age. The average is set at 100, and about two in three people score between 85 and 115." },
  { icon: "fas fa-user-check", color: "amber", title: "Why we don't give you a number", text: "A real IQ needs an official test (like the Wechsler or Raven's), taken under supervision and compared with thousands of people of your age. Any website that gives an exact IQ after a quick quiz is guessing." },
  { icon: "fas fa-arrow-trend-up", color: "emerald", title: "Reasoning can grow", text: "IQ scores rose about 3 points every 10 years in many countries during the 20th century (the Flynn effect), and research finds each extra year of education adds roughly 1 to 5 IQ points." },
  { icon: "fas fa-heart", color: "rose", title: "Not the whole story", text: "Reasoning is one strength among many. Effort, curiosity, kindness, creativity and emotional intelligence matter just as much for success and happiness." },
];

const SAMPLE_MATRIX = [
  [{ shape: "circle", count: 1, fill: "none" }, { shape: "circle", count: 2, fill: "none" }, { shape: "circle", count: 3, fill: "none" }],
  [{ shape: "square", count: 1, fill: "none" }, { shape: "square", count: 2, fill: "none" }, { shape: "square", count: 3, fill: "none" }],
  [{ shape: "triangle", count: 1, fill: "none" }, { shape: "triangle", count: 2, fill: "none" }, { shape: "triangle", count: 3, fill: "none" }],
];

const ReasoningTest = () => {
  useSeo({
    title: "Reasoning Test (IQ-style) — Free Logic and Pattern Test for Students",
    description:
      "A free 24-question IQ-style reasoning test: number series, pattern matrices, verbal reasoning and spatial rotation, in 20 minutes. See your reasoning level and strongest area, with every answer explained — and the truth about IQ scores.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: `${SITE_URL}/mind-lab` },
          { "@type": "ListItem", position: 3, name: "Reasoning Test", item: PAGE_URL },
        ],
      },
    ],
  });

  const [store, setStore] = useState(load);
  const [view, setView] = useState(() => (load().attempts.length ? "result" : "intro"));
  const last = store.attempts[store.attempts.length - 1];

  const onDone = (answers, seconds, timedOut) => {
    const s = score(answers);
    const next = { attempts: [...store.attempts, { date: todayKey(), seconds, timedOut, answers, ...s }].slice(-10) };
    setStore(next);
    save(next);
    setView("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-cyan-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link><span>/</span>
          <Link to="/mind-lab" className="hover:text-white transition">Mind Lab</Link><span>/</span>
          <span className="text-slate-200">Reasoning Test</span>
        </nav>

        {view === "intro" && (
          <>
            <header className="grid lg:grid-cols-2 gap-10 items-center mb-14">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-[0.2em] mb-5">Mind Lab · Reasoning Test (IQ-style)</span>
                <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
                  How sharp is your <span className="text-gradient">reasoning?</span>
                </h1>
                <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
                  24 puzzles of the kinds used in IQ tests: number series, pattern matrices, word logic and turning shapes. Find your <strong className="text-cyan-300 font-semibold">reasoning level</strong> and your strongest kind of thinking — with every answer explained.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6 max-w-xl">
                  {[["24", "puzzles", "text-cyan-300"], [String(REASONING_MINUTES), "minutes", "text-amber-300"], ["4", "types", "text-violet-300"]].map(([n, l, c]) => (
                    <div key={l} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
                      <div className={`text-2xl md:text-3xl font-black ${c}`}>{n}</div>
                      <div className="text-xs text-slate-300 font-semibold mt-1">{l}</div>
                    </div>
                  ))}
                </div>
                <ul className="space-y-2 mb-8 text-base text-slate-200">
                  <li className="flex gap-3"><i className="fas fa-check text-emerald-400 mt-1" aria-hidden="true" />Find a quiet place and 20 minutes. No calculator needed.</li>
                  <li className="flex gap-3"><i className="fas fa-check text-emerald-400 mt-1" aria-hidden="true" />Puzzles get harder. If you're stuck, flag it and come back.</li>
                  <li className="flex gap-3"><i className="fas fa-check text-emerald-400 mt-1" aria-hidden="true" />Your first try is the one that counts — retakes use the same puzzles.</li>
                </ul>
                <button type="button" onClick={() => setView("test")} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">
                  Start the 20-minute test <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
                </button>
              </div>
              <figure>
                <img src="/images/play-area/reasoning.webp" alt="Hands fitting colourful puzzle pieces together" width="1600" height="1067" className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10" />
                <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
              </figure>
            </header>

            <section aria-labelledby="types-heading" className="mb-12">
              <h2 id="types-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">The four types of puzzle</h2>
              <p className="text-base text-slate-300 mb-6 max-w-3xl">The same four types are used by ICAR, a free reasoning test built by university researchers and tested with nearly 97,000 people. Our puzzles are new, written for VCS.</p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {SECTION_ORDER.map((k) => {
                  const s = SECTIONS[k];
                  const c = ACCENT_CLASSES[s.color];
                  return (
                    <div key={k} className={`p-5 rounded-3xl border-t-4 border ${c.ring} bg-white/[0.03]`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg ${c.icon}`}><i className={s.icon} aria-hidden="true" /></span>
                        <h3 className="text-lg font-bold text-white">{s.name}</h3>
                      </div>
                      <div className="min-h-[120px] flex items-center justify-center text-slate-100 mb-2">
                        {k === "series" && <p className="text-2xl font-black tabular-nums">2, 4, 6, 8, <span className="text-amber-300">?</span></p>}
                        {k === "matrix" && <div className="scale-[0.6] origin-center -my-12"><MatrixGrid grid={SAMPLE_MATRIX} /></div>}
                        {k === "verbal" && <p className="text-lg font-bold text-center">Hot is to cold as up is to <span className="text-amber-300">…?</span></p>}
                        {k === "spatial" && <div className="flex items-center gap-2"><PolyShape cells={[[0, 0], [0, 1], [0, 2], [1, 2]]} size={70} /><i className="fas fa-rotate-right text-amber-300" aria-hidden="true" /><span className="text-2xl font-black text-amber-300">?</span></div>}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {k === "series" && "Find the rule that makes the numbers or letters, then continue it."}
                        {k === "matrix" && "Each row and column follows rules about shape, number and shading. Find the missing picture."}
                        {k === "verbal" && "Analogies, codes and logic: think carefully about what the words really say."}
                        {k === "spatial" && "Turn a shape in your mind. Watch out — mirror images (flipped shapes) are not the same."}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="iq-heading" className="mb-12">
              <h2 id="iq-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-6">The truth about IQ</h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {IQ_FACTS.map((f) => {
                  const c = ACCENT_CLASSES[f.color];
                  return (
                    <div key={f.title} className={`p-6 rounded-3xl border-l-4 border ${c.ring} bg-white/[0.03]`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 ${c.icon}`}><i className={f.icon} aria-hidden="true" /></div>
                      <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                      <p className="text-base text-slate-200 leading-relaxed">{f.text}</p>
                    </div>
                  );
                })}
              </div>
            </section>
            <section aria-labelledby="sources-heading">
              <h2 id="sources-heading" className="text-lg font-bold text-white mb-3">Sources</h2>
              <ul className="space-y-1.5 text-sm text-slate-300 list-disc pl-5">{SOURCES.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          </>
        )}

        {view === "test" && (
          <TimedTest questions={REASONING_TEST} minutes={REASONING_MINUTES} title="Reasoning Test (IQ-style)" onDone={onDone} onQuit={() => setView(store.attempts.length ? "result" : "intro")} />
        )}

        {view === "result" && last && (() => {
          const pct = Math.round((last.total / REASONING_TEST.length) * 100);
          const lv = reasoningLevel(pct);
          const c = ACCENT_CLASSES[lv.color];
          const first = store.attempts[0];
          const best = SECTION_ORDER.reduce((a, b) => (last.bySection[b] > last.bySection[a] ? b : a));
          return (
            <div>
              <section className={`rounded-3xl border ${c.ring} bg-gradient-to-br from-cyan-600/15 via-violet-600/10 to-emerald-600/10 p-6 md:p-10 mb-8`}>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 border ${c.ring} ${c.bg} ${c.text}`}>Your reasoning level</span>
                <h1 className="text-4xl md:text-6xl font-black font-poppins text-white mb-2">{lv.name}</h1>
                <p className="text-2xl font-black text-cyan-300 mb-4">{last.total} / {REASONING_TEST.length} correct · {Math.floor(last.seconds / 60)} min {last.seconds % 60} s{last.timedOut ? " (time ran out)" : ""}</p>
                <p className="text-base md:text-lg text-slate-200 leading-relaxed max-w-3xl mb-3">{lv.text}</p>
                <p className="text-base text-slate-200 max-w-3xl">Your strongest type today: <strong className="text-emerald-300 font-semibold">{SECTIONS[best].name}</strong>.</p>
                {store.attempts.length > 1 && <p className="text-sm text-slate-400 mt-3">This was try number {store.attempts.length}. Your first try ({first.total}/24 on {first.date}) is the fairest measure, because retakes use the same puzzles.</p>}
                <p className="text-sm text-slate-400 mt-3 max-w-3xl">This is not an official IQ score. It shows how many of these puzzles you solved today, for practice and self-discovery.</p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <button type="button" onClick={() => setView("test")} className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold"><i className="fas fa-rotate-left mr-2" aria-hidden="true" />Try again</button>
                  <Link to="/mind-lab/aptitude-practice" className="px-5 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold">Practise with Aptitude tests <i className="fas fa-arrow-right ml-2" aria-hidden="true" /></Link>
                  <button type="button" onClick={() => setView("intro")} className="px-5 py-3 rounded-full text-sm font-bold text-cyan-300 hover:text-white">About IQ and this test</button>
                </div>
              </section>
              <section className="mb-10 p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03]">
                <h2 className="text-2xl font-black font-poppins text-white mb-5">Your four types</h2>
                <div className="space-y-4">
                  {SECTION_ORDER.map((k) => {
                    const s = SECTIONS[k];
                    const cc = ACCENT_CLASSES[s.color];
                    return (
                      <div key={k} className="grid grid-cols-[minmax(0,170px)_1fr_auto] sm:grid-cols-[240px_1fr_auto] items-center gap-3">
                        <span className="flex items-center gap-2 text-base font-bold text-white"><i className={`${s.icon} ${cc.text} w-5`} aria-hidden="true" />{s.name}</span>
                        <div className="h-4 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full ${cc.bar}`} style={{ width: `${(last.bySection[k] / 6) * 100}%` }} /></div>
                        <span className="text-base font-black text-white">{last.bySection[k]}/6</span>
                      </div>
                    );
                  })}
                </div>
              </section>
              <Review questions={REASONING_TEST} answers={last.answers} sections={SECTIONS} />
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ReasoningTest;
