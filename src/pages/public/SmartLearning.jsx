import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { ACCENT_CLASSES } from "../../data/playArea/games";
import { COMPARE, FAQ, METHODS, MYTHS, PAGE_PATH, SOURCES, TEACHER_POINTS } from "../../data/playArea/smartLearning";
import { TeacherChart, TestingChart } from "../../components/playArea/smart/Charts";
import Scenarios from "../../components/playArea/smart/Scenarios";
import ParentChecklist from "../../components/playArea/smart/ParentChecklist";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

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

const SmartLearning = () => {
  useSeo({
    title: "Smart Learning — Online vs Classroom Learning: What Research Says",
    description:
      "Is online learning better than the classroom? See what research says about multimedia lessons, recorded classes, MCQ practice, fast feedback and live online teachers, with a free checklist for parents.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: `${SITE_URL}/mind-lab` },
          { "@type": "ListItem", position: 3, name: "Smart Learning", item: PAGE_URL },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-emerald-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/mind-lab" className="hover:text-white transition">Mind Lab</Link>
          <span>/</span>
          <span className="text-slate-200">Smart Learning</span>
        </nav>

        <header className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
              Mind Lab · For parents
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
              Blackboard or laptop? <span className="text-gradient">What research says</span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-4">
              In most classrooms one method rules: the teacher talks and writes on the board. Good online learning uses <strong className="text-emerald-300 font-semibold">slides, videos, recordings and instant quizzes</strong>, the methods research shows help students learn.
            </p>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
              Here's an honest look at what works and why, and a checklist to see how smart your child's learning is.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl">
              {[["6", "proven methods", "text-emerald-300"], ["24/7", "replay lessons", "text-cyan-300"], ["4", "myths checked", "text-amber-300"]].map(([n, l, c]) => (
                <div key={l} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
                  <div className={`text-2xl md:text-3xl font-black ${c}`}>{n}</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">{l}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#checklist" className="px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold transition">
                Check my child's school <i className="fas fa-arrow-down ml-2" aria-hidden="true" />
              </a>
              <a href="#compare" className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
                Compare side by side
              </a>
            </div>
          </div>
          <figure>
            <img
              src="/images/play-area/smart-learning.webp"
              alt="A laptop showing an online class with many students in a video call"
              width="1600"
              height="1067"
              className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10"
            />
            <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
          </figure>
        </header>

        <Section
          id="compare"
          eyebrow="1 · Side by side"
          color="emerald"
          title="A typical classroom vs smart online learning"
          intro="Not every classroom is the same, and not every online school is good. Here is what a typical classroom offers compared with well-run online learning."
        >
          <div className="rounded-3xl border border-white/10 overflow-hidden">
            <div className="hidden md:grid grid-cols-[minmax(0,0.9fr)_1fr_1fr] bg-white/[0.05] border-b border-white/10">
              <p className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-300">What matters</p>
              <p className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-300"><i className="fas fa-chalkboard mr-2" aria-hidden="true" />Typical classroom</p>
              <p className="px-5 py-4 text-xs font-black uppercase tracking-widest text-emerald-300"><i className="fas fa-laptop mr-2" aria-hidden="true" />Smart online learning</p>
            </div>
            {COMPARE.map((r, i) => (
              <div key={r.topic} className={`grid md:grid-cols-[minmax(0,0.9fr)_1fr_1fr] ${i % 2 ? "bg-white/[0.02]" : ""} ${i < COMPARE.length - 1 ? "border-b border-white/10" : ""}`}>
                <p className="px-5 pt-4 md:py-4 flex items-center gap-3 text-base font-bold text-white">
                  <span className="w-9 h-9 shrink-0 rounded-full bg-cyan-500/15 text-cyan-300 flex items-center justify-center"><i className={r.icon} aria-hidden="true" /></span>
                  {r.topic}
                </p>
                <p className="px-5 pt-3 md:py-4 text-base text-slate-300 flex gap-2">
                  <i className="fas fa-xmark text-rose-300 mt-1 md:hidden" aria-hidden="true" />
                  <span><span className="md:hidden font-bold text-slate-200">Classroom: </span>{r.classroom}</span>
                </p>
                <p className="px-5 pt-2 pb-4 md:py-4 text-base text-white font-semibold flex gap-2 md:bg-emerald-500/[0.06]">
                  <i className="fas fa-check text-emerald-300 mt-1" aria-hidden="true" />
                  <span><span className="md:hidden font-bold text-emerald-300">Online: </span>{r.online}</span>
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="methods"
          eyebrow="2 · The research"
          color="violet"
          title="Six methods research supports"
          intro="These are among the best-tested findings about how people learn. Each one is easier to use online than with a blackboard alone."
        >
          {[METHODS.filter((m) => !m.chart), METHODS.filter((m) => m.chart)].map((group, gi) => (
          <div key={gi} className={`grid gap-5 ${gi === 0 ? "sm:grid-cols-2 xl:grid-cols-4 mb-5" : "lg:grid-cols-2"}`}>
            {group.map((m) => {
              const i = METHODS.indexOf(m);
              const a = ACCENT_CLASSES[m.color];
              return (
                <article key={m.key} className={`p-6 rounded-3xl border-t-4 border ${a.ring} bg-white/[0.03] flex flex-col`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${a.icon}`}><i className={m.icon} aria-hidden="true" /></span>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-widest ${a.text}`}>Method {i + 1}</p>
                      <h3 className="text-xl font-black text-white">{m.title}</h3>
                    </div>
                  </div>
                  <p className="text-base text-slate-100 leading-relaxed mb-1">{m.finding}</p>
                  <p className="text-sm text-slate-400 mb-4">{m.who}</p>
                  {m.chart === "testing" && <TestingChart />}
                  {m.chart === "teacher" && <TeacherChart />}
                  <div className="mt-auto pt-4">
                    <div className={`p-4 rounded-2xl border ${a.ring} ${a.bg}`}>
                      <p className={`text-xs font-black uppercase tracking-widest mb-1 ${a.text}`}><i className="fas fa-laptop mr-1.5" aria-hidden="true" />Online</p>
                      <p className="text-base text-white">{m.online}</p>
                    </div>
                    {m.tip && <p className="text-sm text-slate-300 mt-3"><i className="fas fa-lightbulb text-amber-300 mr-1.5" aria-hidden="true" />{m.tip}</p>}
                  </div>
                </article>
              );
            })}
          </div>
          ))}
        </Section>

        <Section
          id="what-if"
          eyebrow="3 · Real life"
          color="cyan"
          title="What happens when…"
          intro="Pick a situation every parent knows and see how each kind of school handles it."
        >
          <Scenarios />
        </Section>

        <Section
          id="teachers"
          eyebrow="4 · Teachers"
          color="amber"
          title="Why teaching online takes more preparation"
          intro="In a classroom, a teacher can walk in and talk. Online, every lesson has to be planned, and the work can be seen."
        >
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {TEACHER_POINTS.map((p) => (
              <div key={p.title} className="p-6 rounded-3xl border-l-4 border border-amber-500/30 bg-white/[0.03]">
                <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-300 flex items-center justify-center text-xl mb-4"><i className={p.icon} aria-hidden="true" /></div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-base text-slate-200 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="myths"
          eyebrow="5 · Myth or fact?"
          color="rose"
          title="Popular claims, checked"
          intro="You'll see these on posters and social media. Here's what the evidence says."
        >
          <div className="grid md:grid-cols-2 gap-5">
            {MYTHS.map((m) => (
              <div key={m.myth} className="p-6 rounded-3xl border border-white/10 bg-white/[0.03]">
                <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-widest mb-3">
                  <i className="fas fa-xmark" aria-hidden="true" /> Myth
                </p>
                <p className="text-lg font-bold text-white mb-4">{m.myth}</p>
                <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-widest mb-2">
                  <i className="fas fa-check" aria-hidden="true" /> What's true
                </p>
                <p className="text-base text-slate-200 leading-relaxed">{m.truth}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="checklist"
          eyebrow="6 · For parents"
          color="emerald"
          title="How smart is your child's learning?"
          intro="Tick what your child's school offers today. These are the things research and experience say make the biggest difference."
        >
          <ParentChecklist />
        </Section>

        <Section id="faq" eyebrow="7 · Questions parents ask" color="indigo" title="Honest answers">
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group p-5 rounded-2xl border border-white/10 bg-white/[0.03] open:border-indigo-500/40">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-lg font-bold text-white">
                  {f.q}
                  <i className="fas fa-chevron-down text-indigo-300 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="text-base text-slate-200 leading-relaxed mt-3 max-w-4xl">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <section aria-labelledby="next-heading" className="mb-16 grid md:grid-cols-3 gap-5">
          <h2 id="next-heading" className="sr-only">Next steps</h2>
          <Link to="/courses" className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300 mb-2">See it in action</p>
            <p className="text-lg font-bold text-white mb-1">Explore our courses</p>
            <p className="text-sm text-slate-300">Live online O and A Level classes with recordings and quizzes.</p>
          </Link>
          <Link to="/teachers" className="p-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-2">Meet the teachers</p>
            <p className="text-lg font-bold text-white mb-1">Our tutors</p>
            <p className="text-sm text-slate-300">Qualified subject teachers who teach live online.</p>
          </Link>
          <Link to="/mind-lab/smart-revision" className="p-6 rounded-3xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300 mb-2">For your child</p>
            <p className="text-lg font-bold text-white mb-1">Smart Revision</p>
            <p className="text-sm text-slate-300">Spaced practice in action: a free revision planner.</p>
          </Link>
        </section>

        <section aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="text-lg font-bold text-white mb-3">Sources</h2>
          <ul className="space-y-1.5 text-sm text-slate-300 list-disc pl-5">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-white underline decoration-white/20 underline-offset-2">{s.label}</a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SmartLearning;
