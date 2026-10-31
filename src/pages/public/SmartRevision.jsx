import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { ACCENT_CLASSES } from "../../data/playArea/games";
import { LINE, EXAM_DAY, RECIPE, SOURCES, retention } from "../../data/playArea/revision";
import ForgettingChart from "../../components/playArea/revision/ForgettingChart";
import Planner from "../../components/playArea/revision/Planner";
import KnowledgeTracing from "../../components/playArea/revision/KnowledgeTracing";
import { SerialPositionChart, TestingEffectChart } from "../../components/playArea/revision/MemoryCurves";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/mind-lab/smart-revision`;

const Section = ({ id, eyebrow, color = "violet", title, intro, children }) => (
  <section id={id} aria-labelledby={`${id}-heading`} className="mb-16 scroll-mt-24">
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-3 border ${ACCENT_CLASSES[color].ring} ${ACCENT_CLASSES[color].bg} ${ACCENT_CLASSES[color].text}`}>
      {eyebrow}
    </span>
    <h2 id={`${id}-heading`} className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">{title}</h2>
    {intro && <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl mb-6">{intro}</p>}
    {children}
  </section>
);

const SmartRevision = () => {
  useSeo({
    title: "Smart Revision — Forgetting Curve, Spaced Revision Planner & Knowledge Tracing",
    description:
      "When should you revise? See the Ebbinghaus forgetting curve, plan spaced revision (1, 3, 7, 14 and 30 days) for every topic and add it to your calendar, and try Bayesian Knowledge Tracing to see when you've really mastered a skill. Free for students.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: `${SITE_URL}/mind-lab` },
          { "@type": "ListItem", position: 3, name: "Smart Revision", item: PAGE_URL },
        ],
      },
    ],
  });

  const examDay = ["none", "cram", "spaced"].map((k) => ({ k, v: Math.round(retention(k, EXAM_DAY)) }));

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-rose-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/mind-lab" className="hover:text-white transition">Mind Lab</Link>
          <span>/</span>
          <span className="text-slate-200">Smart Revision</span>
        </nav>

        <header className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
              Mind Lab · Smart Revision
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
              When should you revise? <span className="text-gradient">Let science decide.</span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
              Your brain forgets most of a new lesson within days — unless you review it at the right moments. Learn the science, then get a <strong className="text-emerald-300 font-semibold">revision plan</strong> for every topic, with reminders in your calendar.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl">
              {examDay.map(({ k, v }) => (
                <div key={k} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
                  <div className="text-2xl md:text-3xl font-black text-white">{v}%</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">{LINE[k].short}</div>
                  <svg width="40" height="6" className="mx-auto mt-2" aria-hidden="true">
                    <line x1="2" y1="3" x2="38" y2="3" stroke={LINE[k].color} strokeWidth="3" strokeDasharray={LINE[k].dash} strokeLinecap="round" />
                  </svg>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400 -mt-6 mb-8">How much of a topic you might still remember on exam day, 5 weeks later (see the curve below).</p>
            <div className="flex flex-wrap gap-3">
              <a href="#planner" className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
                Make my revision plan <i className="fas fa-arrow-down ml-2" aria-hidden="true" />
              </a>
              <a href="#curve" className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
                See the forgetting curve
              </a>
            </div>
          </div>
          <figure>
            <img
              src="/images/play-area/sticky-notes.webp"
              alt="Colourful sticky notes pinned to a board"
              width="1600"
              height="1067"
              className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10"
            />
            <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
          </figure>
        </header>

        <Section
          id="curve"
          eyebrow="1 · The forgetting curve"
          color="rose"
          title="Why you forget — and how revision stops it"
          intro="In 1885 Hermann Ebbinghaus tested his own memory for years. He found we forget fastest in the first hours and days. But every time you review, memory comes back stronger and fades more slowly. Tap the lines to compare."
        >
          <div className="p-4 md:p-6 rounded-3xl border border-white/10 bg-[#0b1224]/70">
            <ForgettingChart />
          </div>
        </Section>

        <Section
          id="recipe"
          eyebrow="2 · Your revision recipe"
          color="emerald"
          title="Study, revise, revise again — on these days"
          intro="This is called spaced revision. Each gap is a little longer than the last, because each review makes the memory last longer."
        >
          <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {RECIPE.map((r, i) => {
              const a = ACCENT_CLASSES[r.color];
              return (
                <li key={r.title} className={`relative p-5 rounded-3xl border-t-4 border ${a.ring} bg-white/[0.03]`}>
                  <span className="absolute top-4 right-4 text-xs font-black text-slate-400">{i + 1}</span>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg mb-3 ${a.icon}`}>
                    <i className={r.icon} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{r.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{r.text}</p>
                </li>
              );
            })}
          </ol>
        </Section>

        <Section
          id="planner"
          eyebrow="3 · Revision planner"
          color="violet"
          title="Your personal revision plan"
          intro="Add each topic when you learn it. We'll work out your review days, show what's due today, and you can add every review to your phone's calendar."
        >
          <Planner />
        </Section>

        <Section
          id="more-curves"
          eyebrow="4 · Two more memory curves"
          color="cyan"
          title="How to revise, not just when"
        >
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-5 md:p-6 rounded-3xl border border-white/10 bg-white/[0.03]">
              <h3 className="text-lg font-bold text-white mb-1">Test yourself, don't just re-read</h3>
              <p className="text-base text-slate-300 mb-4">
                Students read a text four times, or read it once and wrote down what they remembered three times (Roediger &amp; Karpicke, 2006). Re-reading looked better after 5 minutes. <strong className="text-emerald-300 font-semibold">One week later, testing won.</strong>
              </p>
              <TestingEffectChart />
              <p className="text-sm text-slate-400 mt-3">Tip: close the book and write or say everything you remember, then check.</p>
            </div>
            <div className="p-5 md:p-6 rounded-3xl border border-white/10 bg-white/[0.03]">
              <h3 className="text-lg font-bold text-white mb-1">Beginnings and endings stick</h3>
              <p className="text-base text-slate-300 mb-4">
                When people learn a list, they remember the first and last items best and forget the middle — the serial position effect (Murdock, 1962). <strong className="text-cyan-300 font-semibold">Short sessions with breaks</strong> give you more beginnings and endings.
              </p>
              <SerialPositionChart />
              <p className="text-sm text-slate-400 mt-3">Tip: study in 25–40 minute blocks, and put the hardest part at the start.</p>
            </div>
          </div>
        </Section>

        <Section
          id="bkt"
          eyebrow="5 · Bayesian Knowledge Tracing"
          color="amber"
          title="When have you really mastered a topic?"
          intro="Getting one question right doesn't prove you know it — it might be a lucky guess. Bayesian Knowledge Tracing (BKT) is the maths that smart tutoring systems use to decide when a student has truly mastered a skill. Try it: practise one skill and record each answer."
        >
          <div className="p-4 md:p-6 rounded-3xl border border-amber-500/20 bg-[#0b1224]/70 mb-6">
            <KnowledgeTracing />
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              ["fas fa-dice", "violet", "Guesses and slips", "BKT knows a right answer can be a guess and a wrong answer can be a slip. So one result never decides everything."],
              ["fas fa-stairs", "emerald", "Practise until 95%", "Keep practising a skill until you get several right in a row. Then move on — and space your reviews."],
              ["fas fa-robot", "cyan", "Used by real tutors", "BKT was created by Albert Corbett and John Anderson (1995) for computer tutors that taught maths and programming."],
            ].map(([icon, color, title, text]) => (
              <div key={title} className={`p-5 rounded-3xl border-l-4 border ${ACCENT_CLASSES[color].ring} bg-white/[0.03]`}>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg mb-3 ${ACCENT_CLASSES[color].icon}`}>
                  <i className={icon} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                <p className="text-base text-slate-200 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <details className="mt-6 p-5 rounded-3xl border border-white/10 bg-white/[0.02]">
            <summary className="cursor-pointer text-base font-bold text-white">For the curious: the formula</summary>
            <div className="mt-3 space-y-2 text-base text-slate-200 leading-relaxed">
              <p>After a right answer: P(know) = P(know) × (1 − slip) ÷ [P(know) × (1 − slip) + (1 − P(know)) × guess]</p>
              <p>After a wrong answer: P(know) = P(know) × slip ÷ [P(know) × slip + (1 − P(know)) × (1 − guess)]</p>
              <p>Then you may learn from the practice: P(know) = P(know) + (1 − P(know)) × learning</p>
              <p className="text-slate-300">This is Bayes' theorem, named after Thomas Bayes (1763) — the same idea used in spam filters and medical tests.</p>
            </div>
          </details>
        </Section>

        <section aria-labelledby="next-heading" className="mb-16 grid md:grid-cols-2 gap-5">
          <h2 id="next-heading" className="sr-only">More in the Mind Lab</h2>
          <Link to="/mind-lab/memory-challenge" className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300 mb-2">Train your memory</p>
            <p className="text-lg font-bold text-white mb-1">Memory Challenge</p>
            <p className="text-sm text-slate-300">Five memory games, including the memory palace trick.</p>
          </Link>
          <Link to="/mind-lab" className="p-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-2">Explore</p>
            <p className="text-lg font-bold text-white mb-1">Everything in the Mind Lab</p>
            <p className="text-sm text-slate-300">Personality test, brain teasers, star signs and more.</p>
          </Link>
        </section>

        <section aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="text-lg font-bold text-white mb-3">Sources</h2>
          <ul className="space-y-1.5 text-sm text-slate-300 list-disc pl-5">
            {SOURCES.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SmartRevision;
