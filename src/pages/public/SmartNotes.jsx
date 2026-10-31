import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { ACCENT_CLASSES } from "../../data/playArea/games";
import { FIVE_RS, RESEARCH, SOURCES } from "../../data/playArea/notes";
import MethodExamples from "../../components/playArea/notes/MethodExamples";
import MethodQuiz from "../../components/playArea/notes/MethodQuiz";
import CornellNotebook from "../../components/playArea/notes/CornellNotebook";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/mind-lab/smart-notes`;

const Section = ({ id, eyebrow, color, title, intro, children }) => (
  <section id={id} aria-labelledby={`${id}-heading`} className="mb-16 scroll-mt-24">
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-3 border ${ACCENT_CLASSES[color].ring} ${ACCENT_CLASSES[color].bg} ${ACCENT_CLASSES[color].text}`}>
      {eyebrow}
    </span>
    <h2 id={`${id}-heading`} className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">{title}</h2>
    {intro && <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl mb-6">{intro}</p>}
    {children}
  </section>
);

const SmartNotes = () => {
  useSeo({
    title: "Smart Notes — Cornell Method, Mind Maps & Note-Taking Techniques for Students",
    description:
      "Learn five note-taking methods (Cornell, outline, mind map, charting, sentence) with O and A Level examples, find the method that suits you, and use a free Cornell notebook that turns your notes into a quiz.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: `${SITE_URL}/mind-lab` },
          { "@type": "ListItem", position: 3, name: "Smart Notes", item: PAGE_URL },
        ],
      },
    ],
  });

  const [method, setMethod] = useState("cornell");
  const methodsRef = useRef(null);
  const seeMethod = (m) => {
    setMethod(m);
    methodsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-violet-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/mind-lab" className="hover:text-white transition">Mind Lab</Link>
          <span>/</span>
          <span className="text-slate-200">Smart Notes</span>
        </nav>

        <header className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
              Mind Lab · Smart Notes
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
              Take notes that <span className="text-gradient">teach you back</span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
              Copying the board word for word doesn't help you learn. Discover five note-taking methods, find the one that suits each subject, and use a <strong className="text-violet-300 font-semibold">Cornell notebook</strong> that turns your notes into a quiz.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl">
              {[["5", "methods", "text-violet-300"], ["1", "minute quiz", "text-cyan-300"], ["Free", "notebook", "text-emerald-300"]].map(([n, l, c]) => (
                <div key={l} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
                  <div className={`text-2xl md:text-3xl font-black ${c}`}>{n}</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">{l}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#notebook" className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
                Open my notebook <i className="fas fa-arrow-down ml-2" aria-hidden="true" />
              </a>
              <a href="#quiz" className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
                Which method suits me?
              </a>
            </div>
          </div>
          <figure>
            <img
              src="/images/play-area/notes.webp"
              alt="A student writing notes in a notebook next to a laptop"
              width="1600"
              height="1067"
              className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10"
            />
            <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
          </figure>
        </header>

        <div ref={methodsRef} className="scroll-mt-24">
          <Section
            id="methods"
            eyebrow="1 · Five methods"
            color="violet"
            title="Five ways to take notes — with real examples"
            intro="Each method suits different subjects and lessons. Tap a method to see how it works and an example from O and A Level."
          >
            <MethodExamples active={method} onChange={setMethod} />
          </Section>
        </div>

        <Section id="quiz" eyebrow="2 · Quick quiz" color="cyan" title="Which method suits you?" intro="Answer 5 questions about a subject you're studying. You can take it again for each subject.">
          <MethodQuiz onSeeMethod={seeMethod} />
        </Section>

        <Section
          id="five-rs"
          eyebrow="3 · The Cornell method"
          color="emerald"
          title="The 5 Rs: how to use Cornell notes"
          intro="Walter Pauk, who created the method at Cornell University, described five steps. The last three are where the learning happens."
        >
          <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FIVE_RS.map((r, i) => (
              <li key={r.name} className="p-5 rounded-3xl border-t-4 border border-emerald-500/30 bg-white/[0.03]">
                <span className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-300 font-black text-lg flex items-center justify-center mb-3">{i + 1}</span>
                <h3 className="text-lg font-bold text-white mb-1">{r.name}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{r.text}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="notebook"
          eyebrow="4 · Your Cornell notebook"
          color="violet"
          title="Write it, question it, test yourself"
          intro="Write short notes on the right and a question for each on the left. Press Test me to quiz yourself, then add the topic to your revision plan so you review it on the right days."
        >
          <CornellNotebook />
        </Section>

        <Section id="research" eyebrow="5 · The research" color="amber" title="What science says about notes">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {RESEARCH.map((r) => {
              const a = ACCENT_CLASSES[r.color];
              return (
                <div key={r.title} className={`p-6 rounded-3xl border-l-4 border ${a.ring} bg-white/[0.03]`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 ${a.icon}`}>
                    <i className={r.icon} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{r.title}</h3>
                  <p className="text-base text-slate-200 leading-relaxed">{r.text}</p>
                </div>
              );
            })}
          </div>
        </Section>

        <section aria-labelledby="next-heading" className="mb-16 grid md:grid-cols-2 gap-5">
          <h2 id="next-heading" className="sr-only">More in the Mind Lab</h2>
          <Link to="/mind-lab/smart-revision" className="p-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-300 mb-2">Next step</p>
            <p className="text-lg font-bold text-white mb-1">Smart Revision</p>
            <p className="text-sm text-slate-300">The forgetting curve and your revision planner — when to review your notes.</p>
          </Link>
          <Link to="/mind-lab" className="p-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-2">Explore</p>
            <p className="text-lg font-bold text-white mb-1">Everything in the Mind Lab</p>
            <p className="text-sm text-slate-300">Personality test, memory games, brain teasers and more.</p>
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

export default SmartNotes;
