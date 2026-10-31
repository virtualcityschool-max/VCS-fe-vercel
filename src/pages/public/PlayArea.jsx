import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import Reveal from "../../components/ui/Reveal";
import { PLAY_AREA_GAMES, ACCENT_CLASSES } from "../../data/playArea/games";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/mind-lab`;

const BENEFITS = [
  { icon: "fas fa-user-check", color: "bg-violet-500/15 text-violet-300", title: "Know yourself", text: "Discover your personality, strengths and the way you learn best." },
  { icon: "fas fa-route", color: "bg-emerald-500/15 text-emerald-300", title: "Find your path", text: "See which subjects and careers may suit the person you are." },
  { icon: "fas fa-brain", color: "bg-cyan-500/15 text-cyan-300", title: "Sharpen your mind", text: "Memory games and puzzles that build focus and problem solving." },
  { icon: "fas fa-calendar-check", color: "bg-amber-500/15 text-amber-300", title: "Study smarter", text: "Know exactly when to revise so you remember more on exam day. Free, no sign-up needed." },
];

const PlayArea = () => {
  useSeo({
    title: "Mind Lab — Free Personality Test, Brain Games & Smart Revision for Students",
    description:
      "Free tests and puzzles from Virtual City School: a 100-question personality test for students, a research-based workplace personality assessment for job seekers and teachers, five memory games with a Memory Profile, daily brain teasers, and a smart revision planner based on the forgetting curve.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: PAGE_URL },
        ],
      },
    ],
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-violet-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-slate-200">Mind Lab</span>
        </nav>

        <header className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
              VCS Mind Lab
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
              Discover yourself. <span className="text-gradient">Train your brain.</span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-8">
              Welcome to the VCS Mind Lab: tests, games and tools built on real science. Learn who you are, find the <strong className="text-emerald-300 font-semibold">right path</strong> for your future, and learn how to study smarter. Everything is free, with an instant personal report.
            </p>
            <Link
              to="/mind-lab/personality-test"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition"
            >
              Start the Personality Test <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
          <figure className="relative">
            <img
              src="/images/play-area/puzzle.webp"
              alt="A colourful pile of jigsaw puzzle pieces"
              width="1400"
              height="935"
              className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10"
            />
            <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
          </figure>
        </header>

        {[
          ["students", "games-heading", "For students: discover yourself", "Know yourself, find your path and sharpen your mind."],
          ["jobs", "jobs-heading", "For job seekers", "Preparing for interviews? Take the assessment many employers ask for, and print your report."],
        ].map(([group, id, heading, sub]) => (
          <section key={group} aria-labelledby={id} className="mb-16">
            <h2 id={id} className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">{heading}</h2>
            <p className="text-base text-slate-300 mb-6">{sub}</p>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {PLAY_AREA_GAMES.filter((g) => g.group === group).map((g, i) => {
                const a = ACCENT_CLASSES[g.accent];
                const body = (
                  <>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 ${a.icon}`}>
                      <i className={g.icon} aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{g.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-5">{g.blurb}</p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {g.meta.map((m) => (
                        <span key={m} className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.bg} ${a.text}`}>{m}</span>
                      ))}
                    </div>
                    {g.path && (
                      <span className={`mt-5 inline-flex items-center gap-2 text-sm font-bold ${a.text}`}>
                        Start now <i className="fas fa-arrow-right" aria-hidden="true" />
                      </span>
                    )}
                  </>
                );
                const cls = `h-full flex flex-col p-6 rounded-3xl border-t-4 border ${a.ring} bg-white/[0.03]`;
                return (
                  <Reveal key={g.slug} delay={i * 80}>
                    {g.path ? (
                      <Link to={g.path} className={`${cls} hover:bg-white/[0.06] hover:-translate-y-1 transition`}>{body}</Link>
                    ) : (
                      <div className={`${cls} opacity-80`} aria-label={`${g.title} (coming soon)`}>{body}</div>
                    )}
                  </Reveal>
                );
              })}
            </div>
          </section>
        ))}

        <section aria-labelledby="why-heading">
          <h2 id="why-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-6">
            Why use the Mind Lab?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-6 rounded-3xl border border-white/10 bg-white/[0.03]">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 ${b.color}`}>
                  <i className={b.icon} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{b.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlayArea;
