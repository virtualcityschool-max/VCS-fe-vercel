import { useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { ACCENT_CLASSES } from "../../data/playArea/games";
import { COMMAND_WORDS, DOMAINS, DOMAIN_ORDER, HEART_HABITS, KEY_FACTS, LEVELS, NOTES, ONE_TOPIC, PAGE_PATH, SOURCES } from "../../data/playArea/domains";
import DomainsDiagram from "../../components/playArea/domains/DomainsDiagram";
import LevelLadder from "../../components/playArea/domains/LevelLadder";
import DomainGames from "../../components/playArea/domains/DomainGames";
import TeacherToolkit from "../../components/playArea/domains/TeacherToolkit";

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

const ROW_TEXT = { head: "text-violet-300", hands: "text-amber-300", heart: "text-rose-300" };

const LearningDomains = () => {
  useSeo({
    title: "Learning Domains — Bloom's Taxonomy for Knowledge, Skills and Attitudes",
    description:
      "Head, Hands and Heart: understand the cognitive, psychomotor and affective domains and their levels (remember, understand, apply, analyze, evaluate, create) with examples, games, and free tools for teachers.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: `${SITE_URL}/mind-lab` },
          { "@type": "ListItem", position: 3, name: "Learning Domains", item: PAGE_URL },
        ],
      },
    ],
  });

  const [active, setActive] = useState("head");
  const levelCount = DOMAIN_ORDER.reduce((n, k) => n + LEVELS[k].levels.length, 0);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-violet-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/mind-lab" className="hover:text-white transition">Mind Lab</Link>
          <span>/</span>
          <span className="text-slate-200">Learning Domains</span>
        </nav>

        <header className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
              Mind Lab · For students and teachers
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
              Learn with your <span className="text-violet-300">Head</span>, <span className="text-amber-300">Hands</span> and <span className="text-rose-300">Heart</span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-4">
              Knowing when Pakistan was made is <strong className="text-violet-300 font-semibold">knowledge</strong>. Riding a horse is a <strong className="text-amber-300 font-semibold">skill</strong>. Being honest when nobody is watching is an <strong className="text-rose-300 font-semibold">attitude</strong>.
            </p>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
              Bloom's taxonomy, used by teachers all over the world, sorts learning into these three domains, each with its own levels. Good education grows all three: a sharp mind, skilled hands, and an honest, disciplined character.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl">
              {[["3", "domains", "text-violet-300"], [String(levelCount), "levels", "text-amber-300"], ["2", "games", "text-rose-300"]].map(([n, l, c]) => (
                <div key={l} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
                  <div className={`text-2xl md:text-3xl font-black ${c}`}>{n}</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">{l}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#games" className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
                Play the games <i className="fas fa-arrow-down ml-2" aria-hidden="true" />
              </a>
              <a href="#teachers" className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
                Teacher toolkit
              </a>
            </div>
          </div>
          <figure>
            <img
              src="/images/play-area/domains.webp"
              alt="A teacher reading a book with a young student in a library"
              width="1600"
              height="1067"
              className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10"
            />
            <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
          </figure>
        </header>

        <Section
          id="domains"
          eyebrow="1 · Three domains"
          color="violet"
          title="Head, Hands, Heart: what's the difference?"
          intro="Every lesson teaches something to the head, the hands or the heart, and the best lessons teach all three."
        >
          <DomainsDiagram active={active} onChange={setActive} />

          <h3 className="text-xl md:text-2xl font-black text-white mt-12 mb-2">One topic, three domains</h3>
          <p className="text-base text-slate-300 max-w-3xl mb-5">The same topic can be learned with the head, the hands or the heart. Knowing a rule is not the same as obeying it.</p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {ONE_TOPIC.map((t) => (
              <div key={t.topic} className="p-5 rounded-3xl border border-white/10 bg-white/[0.03]">
                <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <i className={`${t.icon} text-cyan-300`} aria-hidden="true" />{t.topic}
                </h4>
                <ul className="space-y-3">
                  {DOMAIN_ORDER.map((k) => (
                    <li key={k} className={`pl-3 border-l-4 ${ACCENT_CLASSES[DOMAINS[k].color].ring}`}>
                      <span className={`block text-xs font-black uppercase tracking-widest ${ROW_TEXT[k]}`}>
                        <i className={`${DOMAINS[k].icon} mr-1.5`} aria-hidden="true" />{DOMAINS[k].short}
                      </span>
                      <span className="text-base text-slate-100">{t[k]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="head"
          eyebrow="2 · Head: knowledge"
          color="violet"
          title="Six levels of thinking"
          intro="This is the famous part of Bloom's taxonomy. Tap each step to climb from remembering facts to creating something new."
        >
          <LevelLadder domain="head" />
          <div className="mt-6 p-5 md:p-6 rounded-3xl border border-violet-500/30 bg-violet-500/10">
            <h3 className="text-lg font-bold text-white mb-1"><i className="fas fa-file-pen text-violet-300 mr-2" aria-hidden="true" />Exam tip: the command word tells you the level</h3>
            <p className="text-base text-slate-300 mb-4">Cambridge questions start with command words. Spot the word and you know how deeply to answer.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {COMMAND_WORDS.map((c) => (
                <div key={c.level} className="p-3 rounded-2xl border border-white/10 bg-white/[0.04]">
                  <p className="text-xs font-black uppercase tracking-widest text-violet-300 mb-1">{c.level + 1}. {LEVELS.head.levels[c.level].name}</p>
                  <p className="text-base text-white font-semibold">{c.words.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          id="hands"
          eyebrow="3 · Hands: skill"
          color="amber"
          title="Five levels of skill"
          intro="Nobody learns to ride, swim or do a titration from a book alone. Skills grow from copying to doing without thinking."
        >
          <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
            <LevelLadder domain="hands" />
            <figure className="hidden lg:block">
              <img
                src="/images/play-area/domains-rider.webp"
                alt="A skilled rider in a helmet sitting calmly on a dark horse in an arena"
                width="1200"
                height="1500"
                loading="lazy"
                className="w-full aspect-[4/5] object-cover rounded-3xl border border-white/10"
              />
              <figcaption className="mt-2 text-sm text-slate-300">Level 5, Automatic: years of practice make it look easy. <span className="text-xs text-slate-400">Photo: Unsplash</span></figcaption>
            </figure>
          </div>
        </Section>

        <Section
          id="heart"
          eyebrow="4 · Heart: attitude"
          color="rose"
          title="Five levels of character"
          intro="Values grow from the outside in: first you hear about honesty, then you practise it when asked, until one day it is simply who you are."
        >
          <LevelLadder domain="heart" />
        </Section>

        <Section
          id="games"
          eyebrow="5 · Test yourself"
          color="cyan"
          title="Can you spot the difference?"
          intro="Two quick games. The cards change every time you play."
        >
          <DomainGames />
        </Section>

        <Section
          id="teachers"
          eyebrow="6 · For teachers"
          color="indigo"
          title="Teacher toolkit"
          intro="Plan lessons that reach the head, the hands and the heart. Write objectives, build question ladders and track character, all free."
        >
          <TeacherToolkit />
        </Section>

        <Section
          id="beyond-marks"
          eyebrow="7 · Beyond marks"
          color="rose"
          title="Teach the whole person, not just the memory"
          intro="Exams mostly test the head. Our country also needs people who are honest, disciplined and obey the law. That is the heart, and teachers grow it every day."
        >
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {KEY_FACTS.map((f) => {
              const a = ACCENT_CLASSES[f.color];
              return (
                <div key={f.title} className={`p-6 rounded-3xl border-t-4 border ${a.ring} bg-white/[0.03]`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 ${a.icon}`}>
                    <i className={f.icon} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-base text-slate-200 leading-relaxed">{f.text}</p>
                </div>
              );
            })}
          </div>

          <figure className="mb-10 p-6 md:p-8 rounded-3xl border border-violet-500/30 bg-violet-500/10">
            <figcaption className="text-lg font-bold text-white mb-1">Grade 5 Science textbook questions</figcaption>
            <p className="text-sm text-slate-300 mb-5">Gul (2024): 147 questions in the exercises, by type of thinking</p>
            {[
              ["Lower-order thinking", 127, "bg-violet-400"],
              ["Higher-order thinking", 20, "bg-rose-400"],
            ].map(([label, n, bar]) => (
              <div key={label} className="mb-4 last:mb-0">
                <div className="flex justify-between gap-4 text-base text-slate-100 mb-1.5">
                  <span>{label}</span>
                  <strong className="text-white">{n}</strong>
                </div>
                <div className="h-5 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${(n / 147) * 100}%` }} />
                </div>
              </div>
            ))}
          </figure>

          <h3 className="text-xl md:text-2xl font-black text-white mb-5">Five habits that grow the heart</h3>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            {HEART_HABITS.map((h, n) => (
              <li key={h.title} className="p-5 rounded-3xl border-l-4 border border-rose-500/30 bg-white/[0.03]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-300 flex items-center justify-center"><i className={h.icon} aria-hidden="true" /></span>
                  <span className="text-xs font-black uppercase tracking-widest text-rose-300">Habit {n + 1}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-1">{h.title}</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{h.text}</p>
              </li>
            ))}
          </ol>

          <div className="p-6 rounded-3xl border border-amber-500/30 bg-amber-500/10">
            <h3 className="text-lg font-bold text-white mb-3"><i className="fas fa-lightbulb text-amber-300 mr-2" aria-hidden="true" />Good to know</h3>
            <ul className="space-y-2 text-base text-slate-100 list-disc pl-5">
              {NOTES.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        </Section>

        <section aria-labelledby="next-heading" className="mb-16 grid md:grid-cols-2 gap-5">
          <h2 id="next-heading" className="sr-only">More in the Mind Lab</h2>
          <Link to="/mind-lab/smart-revision" className="p-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-300 mb-2">Next step</p>
            <p className="text-lg font-bold text-white mb-1">Smart Revision</p>
            <p className="text-sm text-slate-300">Remembering is level 1. Make it stick with a revision plan.</p>
          </Link>
          <Link to="/mind-lab/eq-check" className="p-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-2">Explore the heart</p>
            <p className="text-lg font-bold text-white mb-1">EQ Self-Check</p>
            <p className="text-sm text-slate-300">How well do you notice, show and understand emotions?</p>
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

export default LearningDomains;
