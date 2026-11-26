import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import Reveal from "../../components/ui/Reveal";
import {
  LAST_CHECKED,
  SYSTEMS,
  COMPARE_ROWS,
  GOALS,
  SCHOLARSHIP_POINTS,
  INCIDENTS,
  FAQS,
  SOURCES,
} from "../../data/educationSystems";

const PAGE_URL = "https://virtualcityschool.com/compare-education-systems";

// Full class strings (Tailwind only keeps classes it can see written out).
const TONE = {
  indigo: { card: "from-indigo-600/20 to-indigo-950/10 border-indigo-400/30", icon: "bg-indigo-500/20 text-indigo-200", text: "text-indigo-300" },
  cyan: { card: "from-cyan-600/20 to-cyan-950/10 border-cyan-400/30", icon: "bg-cyan-500/20 text-cyan-200", text: "text-cyan-300" },
  emerald: { card: "from-emerald-600/20 to-emerald-950/10 border-emerald-400/30", icon: "bg-emerald-500/20 text-emerald-200", text: "text-emerald-300" },
  amber: { card: "from-amber-600/20 to-amber-950/10 border-amber-400/30", icon: "bg-amber-500/20 text-amber-200", text: "text-amber-300" },
  rose: { card: "from-rose-600/20 to-rose-950/10 border-rose-400/30", icon: "bg-rose-500/20 text-rose-200", text: "text-rose-300" },
};

const BOARD_TONE = {
  Cambridge: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30",
  "Pearson Edexcel": "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
  IB: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
};

function SectionHead({ eyebrow, icon, title, intro, tone = "text-cyan-300" }) {
  return (
    <div className="mb-8">
      <span className={`inline-flex items-center gap-2 ${tone} text-xs font-bold uppercase tracking-widest mb-3`}>
        <i className={`fas ${icon}`} /> {eyebrow}
      </span>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{title}</h2>
      {intro && <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl">{intro}</p>}
    </div>
  );
}

export default function CompareEducationSystemsPage() {
  const [goalId, setGoalId] = useState(GOALS[0].id);
  const [openFaq, setOpenFaq] = useState(0);
  const goal = GOALS.find((g) => g.id === goalId) || GOALS[0];

  useSeo({
    title: "O Level vs IGCSE vs A Level vs IB vs Matric: Which System Is Best?",
    description:
      "Cambridge, Edexcel, IB, American and Pakistan's Matric / FSc compared in plain words: how each is graded, which universities accept it, scholarships, exam leaks and which to choose for your goal.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://virtualcityschool.com" },
          { "@type": "ListItem", position: 2, name: "Compare education systems", item: PAGE_URL },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <article className="relative max-w-[1920px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-24">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-cyan-400 transition">Home</Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-semibold">Compare education systems</span>
        </nav>

        {/* Hero */}
        <header className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-xs font-bold uppercase tracking-widest text-cyan-300 mb-4">
              <i className="fas fa-scale-balanced" /> Free, independent guide
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-5">
              O Level, IGCSE, A Level, IB or Matric: <span className="text-cyan-400">which is right for you?</span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-4">
              Five school systems, explained in plain words: who runs them, how you're graded, which universities accept them,
              how they affect <strong className="text-emerald-300 font-semibold">scholarships</strong>, and what really happened with the
              exam paper leaks. Every fact links to its source.
            </p>
            <p className="text-sm text-slate-400">Last checked: {LAST_CHECKED}</p>
          </div>
          <figure className="relative">
            <img
              src="/images/about/students.webp"
              srcSet="/images/about/students-800.webp 800w, /images/about/students.webp 1600w"
              sizes="(max-width: 1024px) 100vw, 800px"
              alt="Students studying together with laptops"
              width="1400"
              height="1000"
              className="w-full aspect-[7/5] object-cover rounded-3xl border border-white/10 shadow-2xl shadow-indigo-950/50"
            />
            <figcaption className="theme-keep absolute bottom-3 right-4 text-xs text-white/70">Photo: Unsplash</figcaption>
          </figure>
        </header>

        {/* Quick answer */}
        <Reveal className="mb-16 rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-600/15 to-slate-900/40 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-emerald-500/20 text-emerald-200">
              <i className="fas fa-lightbulb text-lg" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white mb-2">The short answer</h2>
              <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-4xl">
                There is <strong className="text-emerald-300 font-semibold">no single best system</strong>. Cambridge, Edexcel and the IB are all
                accepted by top universities worldwide. Pick by <strong className="text-cyan-300 font-semibold">where you want to study</strong> and how
                you like to learn, then aim for top grades: that is what wins admissions and scholarships.
              </p>
            </div>
          </div>
        </Reveal>

        {/* The five systems */}
        <section className="mb-20">
          <SectionHead
            eyebrow="The systems"
            icon="fa-layer-group"
            title="The five systems at a glance"
            intro="Note: IGCSE isn't a separate system. Cambridge and Pearson Edexcel each offer their own IGCSE, at the same level as O Level."
          />
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {SYSTEMS.map((s) => {
              const t = TONE[s.accent];
              return (
                <Reveal key={s.id} className={`rounded-3xl border bg-gradient-to-br ${t.card} p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.icon}`}>
                      <i className={`fas ${s.icon} text-lg`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{s.name}</h3>
                      <p className={`text-sm font-semibold ${t.text}`}>{s.quals}</p>
                    </div>
                  </div>
                  <dl className="space-y-3 text-base text-slate-200">
                    <div><dt className="text-xs font-bold uppercase tracking-widest text-slate-400">Who runs it</dt><dd>{s.who}</dd></div>
                    <div><dt className="text-xs font-bold uppercase tracking-widest text-slate-400">How big</dt><dd>{s.size}</dd></div>
                    <div><dt className="text-xs font-bold uppercase tracking-widest text-slate-400">How it works</dt><dd>{s.style}</dd></div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-emerald-300"><i className="fas fa-check mr-1" />Best for</dt>
                      <dd>{s.goodFor}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-amber-300"><i className="fas fa-triangle-exclamation mr-1" />Watch out</dt>
                      <dd>{s.watchOut}</dd>
                    </div>
                  </dl>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Side-by-side table */}
        <section className="mb-20">
          <SectionHead eyebrow="Side by side" icon="fa-table" title="Compare them point by point" tone="text-indigo-300" />
          {/* Phones: one card per row; wide screens: a table */}
          <div className="hidden lg:block rounded-3xl border border-white/10 overflow-hidden">
            <table className="w-full text-left text-base">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="p-4 text-sm text-slate-400 font-bold w-[14%]"> </th>
                  {SYSTEMS.map((s) => (
                    <th key={s.id} className={`p-4 text-sm font-black ${TONE[s.accent].text}`}>{s.short}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label} className="bg-slate-900/60 border-t border-white/10">
                    <th scope="row" className="p-4 text-sm font-bold text-white align-top">{row.label}</th>
                    {SYSTEMS.map((s) => (
                      <td key={s.id} className="p-4 text-slate-200 align-top">{row[s.id]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden space-y-4">
            {COMPARE_ROWS.map((row) => (
              <div key={row.label} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <h3 className="text-lg font-black text-white mb-3">{row.label}</h3>
                <dl className="space-y-2">
                  {SYSTEMS.map((s) => (
                    <div key={s.id} className="grid grid-cols-[6.5rem_1fr] gap-3">
                      <dt className={`text-sm font-bold ${TONE[s.accent].text}`}>{s.short}</dt>
                      <dd className="text-base text-slate-200">{row[s.id]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>

        {/* Which one for me? */}
        <section className="mb-20">
          <SectionHead
            eyebrow="Your choice"
            icon="fa-compass"
            title="Which one should I choose?"
            intro="Pick your goal. We'll tell you what works best, and why."
            tone="text-violet-300"
          />
          <div className="flex flex-wrap gap-3 mb-6" role="tablist" aria-label="Your goal">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={g.id === goalId}
                onClick={() => setGoalId(g.id)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition flex items-center gap-2 ${
                  g.id === goalId
                    ? "bg-indigo-500 border-indigo-400 text-white"
                    : "bg-slate-900/60 border-white/10 text-slate-200 hover:border-indigo-400/60"
                }`}
              >
                <i className={`fas ${g.icon}`} /> {g.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" className="rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-600/20 to-slate-900/40 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-300 mb-2">Best choice</p>
            <p className="text-xl md:text-2xl font-black text-white mb-3">{goal.pick}</p>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-4xl">{goal.why}</p>
          </div>
        </section>

        {/* Scholarships */}
        <section className="mb-20">
          <SectionHead
            eyebrow="Scholarships"
            icon="fa-award"
            title="Which system gets more scholarships?"
            intro="This is the question we hear most. Here is the honest answer."
            tone="text-emerald-300"
          />
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
            {SCHOLARSHIP_POINTS.map((p, i) => (
              <Reveal key={p.title} className="rounded-3xl border border-emerald-400/25 bg-slate-900/60 p-6 border-t-4 border-t-emerald-400">
                <div className="text-4xl font-black text-emerald-300/80 mb-3">{i + 1}</div>
                <h3 className="text-lg font-black text-white mb-2">{p.title}</h3>
                <p className="text-base text-slate-200 leading-relaxed">{p.text}</p>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-base text-slate-200">
            See 41 scholarships that open every year, with their usual months and official links:{" "}
            <Link to="/scholarships" className="text-cyan-300 font-semibold underline underline-offset-4 hover:text-cyan-200">
              Scholarships for Pakistani &amp; Gulf students
            </Link>
          </p>
        </section>

        {/* Paper leaks */}
        <section className="mb-20">
          <SectionHead
            eyebrow="Exam security"
            icon="fa-shield-halved"
            title="Paper leaks: what really happened"
            intro="Leaks in Pakistan have shaken many families' trust in Cambridge. They are real and they hurt honest students. But they are not only a Cambridge problem, and results are still accepted by universities. Here are the facts, newest first."
            tone="text-amber-300"
          />
          <ol className="relative border-l-2 border-amber-400/40 ml-3 space-y-8">
            {INCIDENTS.map((x) => (
              <li key={`${x.year}-${x.board}`} className="pl-6 relative">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-[#020617]" />
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-lg font-black text-white">{x.year}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${BOARD_TONE[x.board] || "bg-slate-800 text-slate-200 border-white/10"}`}>
                    {x.board}
                  </span>
                </div>
                <p className="text-base text-slate-200 leading-relaxed max-w-4xl mb-1">
                  <strong className="text-rose-300 font-semibold">What happened: </strong>{x.what}
                </p>
                <p className="text-base text-slate-200 leading-relaxed max-w-4xl mb-1">
                  <strong className="text-emerald-300 font-semibold">What the board did: </strong>{x.response}
                </p>
                <a href={x.source} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-300 hover:text-cyan-200 underline underline-offset-4">
                  Source: {x.sourceName}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-8 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 max-w-5xl">
            <h3 className="text-lg font-black text-white mb-2"><i className="fas fa-circle-info text-amber-300 mr-2" />What this means for you</h3>
            <ul className="space-y-2 text-base text-slate-200 list-disc pl-5">
              <li>Never pay for or open a "leaked paper". Most are fakes, and real ones get papers cancelled and candidates banned.</li>
              <li>When a paper is compromised, boards cancel it, discount the questions or offer a free retake. Students who know the whole syllabus are safe either way.</li>
              <li>Universities still accept Cambridge, Edexcel and IB results. A strong, honest grade keeps its value.</li>
            </ul>
          </div>
        </section>

        {/* How VCS helps */}
        <Reveal className="mb-20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/40 border border-indigo-500/30 rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Chose Cambridge O / A Level? Prepare properly, for free.</h2>
              <p className="text-slate-200 text-base md:text-lg leading-relaxed">
                Every subject guide has the full 2027 syllabus, paper structure and grade boundaries. Then test yourself with
                <strong className="text-cyan-300 font-semibold"> timed mock exams</strong> on real past papers, and check your zone's exam dates.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
              <Link to="/subjects" className="btn-glow px-6 py-3.5 rounded-xl text-white font-bold text-base text-center">
                Free subject guides <i className="fas fa-arrow-right text-xs ml-1" />
              </Link>
              <Link to="/exam-dates" className="px-6 py-3.5 rounded-xl border border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/10 text-white font-bold text-base text-center transition">
                Exam dates 2027
              </Link>
              <Link to="/online-school" className="px-6 py-3.5 rounded-xl border border-white/15 hover:border-indigo-400 bg-slate-900/60 text-white font-bold text-base text-center transition">
                Live online classes
              </Link>
            </div>
          </div>
        </Reveal>

        {/* FAQ */}
        <section className="mb-20">
          <SectionHead eyebrow="FAQ" icon="fa-circle-question" title="Questions students and parents ask" tone="text-indigo-300" />
          <div className="space-y-3 max-w-5xl">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className="border border-white/10 rounded-2xl bg-slate-900/60 overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-white font-semibold text-base hover:text-cyan-300 transition"
                  >
                    <span>{f.q}</span>
                    <i className={`fas fa-chevron-down text-xs text-slate-400 transition-transform shrink-0 ${open ? "rotate-180 text-cyan-400" : ""}`} />
                  </button>
                  {/* Always in the HTML (for search engines); hidden when closed */}
                  <div hidden={!open} className="px-5 pb-5 pt-1 text-base text-slate-200 leading-relaxed">
                    {f.a}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sources */}
        <section>
          <SectionHead eyebrow="Sources" icon="fa-link" title="Where these facts come from" tone="text-slate-300" />
          <ul className="grid gap-2 md:grid-cols-2 text-base">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-400 max-w-3xl">
            Rules change. Always confirm entry requirements on the university's own website and equivalence rules on ibcc.edu.pk.
          </p>
        </section>
      </article>
    </main>
  );
}
