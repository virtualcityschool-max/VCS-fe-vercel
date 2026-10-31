import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { ACCENT_CLASSES } from "../../data/playArea/games";
import {
  STORE_KEY, EMPTY_RECORD, TYPES, GAMES, BADGES, SCIENCE, SOURCES,
  profileScores, levelWord, bestPairs, streak, todayKey, shareLink,
} from "../../data/playArea/memory";
import LightPath from "../../components/playArea/memory/LightPath";
import NumberSpan from "../../components/playArea/memory/NumberSpan";
import GridRecall from "../../components/playArea/memory/GridRecall";
import MatchPairs from "../../components/playArea/memory/MatchPairs";
import MemoryPalace from "../../components/playArea/memory/MemoryPalace";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/mind-lab/memory-challenge`;

// Records live only in this browser (no login needed).
const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (s && typeof s === "object" && s.best) return { ...EMPTY_RECORD, ...s };
  } catch { /* private mode or bad data */ }
  return EMPTY_RECORD;
};
const save = (r) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(r)); } catch { /* private mode */ }
};

// Raise a "higher is better" best. Returns true when an earlier best was beaten.
const raise = (best, key, score) => {
  const old = best[key] || 0;
  if (score <= old) return false;
  best[key] = score;
  return old > 0;
};

const bestText = (id, b) => {
  switch (id) {
    case "lightPath": return b.lightPath ? `${b.lightPath} steps` : null;
    case "numberSpan": return b.spanF || b.spanB ? [b.spanF && `${b.spanF} forwards`, b.spanB && `${b.spanB} backwards`].filter(Boolean).join(" · ") : null;
    case "grid": return b.grid ? `${b.grid} squares` : null;
    case "pairs": return bestPairs(b) ? `${bestPairs(b)} moves` : null;
    case "palace": return b.palaceAfter ? `${b.palaceAfter} / 15 words` : null;
    default: return null;
  }
};

// ------------------------------------------------------------ Profile ----

const MemoryProfile = ({ rec, onPlay }) => {
  const scores = profileScores(rec.best);
  const played = Object.entries(scores).filter(([, v]) => v !== null);
  const sorted = [...played].sort((a, b) => b[1] - a[1]);
  const strongest = sorted.length >= 2 ? sorted[0][0] : null;
  const weakest = sorted.length >= 2 ? sorted[sorted.length - 1][0] : null;
  const firstGameOf = (type) => GAMES.find((g) => g.type === type);

  return (
    <section id="profile" aria-labelledby="profile-heading" className="mb-16 scroll-mt-24">
      <h2 id="profile-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">Your Memory Profile</h2>
      <p className="text-base text-slate-300 mb-6">Built from your best scores. Play games of all three kinds to see where your memory is strongest.</p>
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
        <div className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03] space-y-6">
          {Object.entries(TYPES).map(([key, t]) => {
            const a = ACCENT_CLASSES[t.color];
            const v = scores[key];
            return (
              <div key={key}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="flex items-center gap-3 text-base font-bold text-white">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center ${a.icon}`}><i className={t.icon} aria-hidden="true" /></span>
                    {t.name}
                  </span>
                  {v === null ? (
                    <button type="button" onClick={() => onPlay(firstGameOf(key).id)} className={`text-sm font-bold ${a.text} hover:text-white`}>
                      Play {firstGameOf(key).title} to unlock <i className="fas fa-arrow-right ml-1" aria-hidden="true" />
                    </button>
                  ) : (
                    <span className={`text-base font-black ${a.text}`}>{levelWord(v)} · {v}%</span>
                  )}
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full ${a.bar} transition-all duration-700`} style={{ width: `${v || 0}%` }} />
                </div>
              </div>
            );
          })}
          <p className="text-sm text-slate-400">Percent = how far along you are from a beginner score to an excellent one in our games. It is for fun and practice, not a medical or IQ test.</p>
        </div>
        <div className="space-y-4">
          {strongest ? (
            <>
              <div className={`p-6 rounded-3xl border ${ACCENT_CLASSES[TYPES[strongest].color].ring} ${ACCENT_CLASSES[TYPES[strongest].color].bg}`}>
                <p className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${ACCENT_CLASSES[TYPES[strongest].color].text}`}>Your strongest memory</p>
                <h3 className="text-2xl font-black text-white mb-2">{TYPES[strongest].name}</h3>
                <p className="text-base text-slate-200 leading-relaxed">{TYPES[strongest].strong}</p>
              </div>
              {weakest !== strongest && (
                <div className="p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 text-amber-300">Room to grow: {TYPES[weakest].name}</p>
                  <p className="text-base text-slate-200 leading-relaxed">{TYPES[weakest].grow}</p>
                </div>
              )}
              <a
                href={shareLink(`My strongest memory is ${TYPES[strongest].name} (${scores[strongest]}%) on the VCS Memory Challenge!`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition"
              >
                <i className="fab fa-whatsapp mr-2" aria-hidden="true" /> Share my profile
              </a>
            </>
          ) : (
            <div className="p-6 md:p-8 rounded-3xl border border-dashed border-white/20 bg-white/[0.02] h-full flex flex-col justify-center">
              <i className="fas fa-brain text-4xl text-cyan-300 mb-4" aria-hidden="true" />
              <h3 className="text-lg font-bold text-white mb-2">
                {played.length ? "Nearly there!" : "Your profile is empty"}
              </h3>
              <p className="text-base text-slate-300">
                {played.length
                  ? "Play a game of another kind and we'll show your strongest kind of memory, with study tips that match it."
                  : "Play games of at least two kinds (numbers, pictures, words) and we'll show your strongest kind of memory, with study tips that match it."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// --------------------------------------------------------------- Page ----

const MemoryChallenge = () => {
  useSeo({
    title: "Memory Challenge — Free Memory Games for Students",
    description:
      "Five free memory games for students: Light Path, Number Span, Grid Recall, Match Pairs (chemistry, capitals, physics, biology) and the Memory Palace. Get your Memory Profile, badges and study tips from memory science.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: `${SITE_URL}/mind-lab` },
          { "@type": "ListItem", position: 3, name: "Memory Challenge", item: PAGE_URL },
        ],
      },
    ],
  });

  const [rec, setRec] = useState(load);
  const recRef = useRef(rec);
  const [active, setActive] = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  const playRef = useRef(null);

  useEffect(() => {
    if (active) playRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [active]);

  const open = (id) => {
    setNewBadges([]);
    setActive(id);
  };

  // Save a finished game. `apply` updates the bests and says whether a record was beaten.
  const commit = (gameId, apply) => {
    const prev = recRef.current;
    const best = { ...prev.best, pairs: { ...(prev.best.pairs || {}) } };
    const isNewBest = apply(best);
    const day = todayKey();
    const next = {
      ...prev,
      best,
      plays: { ...prev.plays, [gameId]: (prev.plays[gameId] || 0) + 1 },
      days: prev.days.includes(day) ? prev.days : [...prev.days, day].slice(-60),
    };
    const earned = BADGES.filter((b) => prev.badges.includes(b.id) || b.test(next)).map((b) => b.id);
    next.badges = earned;
    const fresh = earned.filter((id) => !prev.badges.includes(id));
    recRef.current = next;
    save(next);
    setRec(next);
    if (fresh.length) setNewBadges(fresh);
    return isNewBest;
  };

  const exit = () => {
    setActive(null);
    setTimeout(() => document.getElementById("games")?.scrollIntoView({ behavior: "smooth" }), 30);
  };

  const b = rec.best;
  const gameEl = {
    lightPath: <LightPath best={b.lightPath} onExit={exit} onResult={(s) => commit("lightPath", (x) => raise(x, "lightPath", s))} />,
    numberSpan: (
      <NumberSpan
        bestF={b.spanF}
        bestB={b.spanB}
        onExit={exit}
        onResult={(mode, s) => commit("numberSpan", (x) => raise(x, mode === "B" ? "spanB" : "spanF", s))}
      />
    ),
    grid: <GridRecall best={b.grid} onExit={exit} onResult={(s) => commit("grid", (x) => raise(x, "grid", s))} />,
    pairs: (
      <MatchPairs
        bestByDeck={b.pairs}
        onExit={exit}
        onResult={(deck, moves) =>
          commit("pairs", (x) => {
            const old = x.pairs[deck];
            if (old && moves >= old) return false;
            x.pairs[deck] = moves;
            return Boolean(old);
          })
        }
      />
    ),
    palace: (
      <MemoryPalace
        best={b.palaceAfter}
        onExit={exit}
        onResult={(before, after) =>
          commit("palace", (x) => {
            x.palaceBefore = Math.max(x.palaceBefore || 0, before);
            return raise(x, "palaceAfter", after);
          })
        }
      />
    ),
  };
  const activeGame = GAMES.find((g) => g.id === active);
  const days = streak(rec.days);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-cyan-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/mind-lab" className="hover:text-white transition">Mind Lab</Link>
          <span>/</span>
          <span className="text-slate-200">Memory Challenge</span>
        </nav>

        <header className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
              Mind Lab · Memory Challenge
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
              How strong is your <span className="text-gradient">memory?</span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
              Five quick games train your memory for numbers, pictures and words. Beat your best scores, earn badges, and get a <strong className="text-cyan-300 font-semibold">Memory Profile</strong> with study tips that match the way you remember.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl">
              {[
                ["5", "games", "text-cyan-300"],
                [days ? `${days}🔥` : "0", "day streak", "text-amber-300"],
                [`${rec.badges.length}/${BADGES.length}`, "badges", "text-emerald-300"],
              ].map(([n, l, c]) => (
                <div key={l} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
                  <div className={`text-2xl md:text-3xl font-black ${c}`}>{n}</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">{l}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#games" className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
                Start playing <i className="fas fa-arrow-down ml-2" aria-hidden="true" />
              </a>
              <a href="#profile" className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
                My Memory Profile
              </a>
            </div>
            <p className="text-sm text-slate-400 mt-4">Free, no sign-up. Your scores are saved on this device.</p>
          </div>
          <figure>
            <img
              src="/images/play-area/library.webp"
              alt="A student studying with a laptop in a large library"
              width="1600"
              height="1067"
              className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10"
            />
            <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
          </figure>
        </header>

        {activeGame && (
          <section ref={playRef} aria-label={activeGame.title} className="mb-16 scroll-mt-24">
            <div className={`rounded-3xl border-t-4 border ${ACCENT_CLASSES[activeGame.accent].ring} bg-[#0b1224]/80 p-5 md:p-8`}>
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-black font-poppins text-white">
                  <span className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl ${ACCENT_CLASSES[activeGame.accent].icon}`}>
                    <i className={activeGame.icon} aria-hidden="true" />
                  </span>
                  {activeGame.title}
                </h2>
                <button type="button" onClick={exit} className="text-sm font-black uppercase tracking-widest text-cyan-300 hover:text-white whitespace-nowrap">
                  <i className="fas fa-xmark mr-2" aria-hidden="true" /> Close
                </button>
              </div>
              {newBadges.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center justify-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30" role="status">
                  <span className="text-base font-black text-amber-300"><i className="fas fa-award mr-2" aria-hidden="true" />Badge earned:</span>
                  {newBadges.map((id) => {
                    const badge = BADGES.find((x) => x.id === id);
                    return (
                      <span key={id} className="px-3 py-1 rounded-full bg-amber-500/20 text-white text-sm font-bold">
                        <i className={`${badge.icon} mr-1.5 text-amber-300`} aria-hidden="true" />{badge.name}
                      </span>
                    );
                  })}
                </div>
              )}
              <div key={active}>{gameEl[active]}</div>
            </div>
          </section>
        )}

        <section id="games" aria-labelledby="games-heading" className="mb-16 scroll-mt-24">
          <h2 id="games-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">Pick a game</h2>
          <p className="text-base text-slate-300 mb-6">Each game takes 2 to 5 minutes and gets harder as you get better.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {GAMES.map((g) => {
              const a = ACCENT_CLASSES[g.accent];
              const t = TYPES[g.type];
              const bt = bestText(g.id, b);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => open(g.id)}
                  className={`text-left h-full flex flex-col p-6 rounded-3xl border-t-4 border ${a.ring} ${active === g.id ? a.bg : "bg-white/[0.03]"} hover:bg-white/[0.06] hover:-translate-y-1 transition`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 ${a.icon}`}>
                    <i className={g.icon} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{g.title}</h3>
                  <p className={`text-xs font-black uppercase tracking-widest mb-3 ${ACCENT_CLASSES[t.color].text}`}>
                    <i className={`${t.icon} mr-1.5`} aria-hidden="true" />{t.name} · {g.trains}
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed mb-5">{g.blurb}</p>
                  <p className="mt-auto text-sm font-bold text-amber-300 mb-3">
                    <i className="fas fa-trophy mr-1.5" aria-hidden="true" />{bt ? `Best: ${bt}` : "Not played yet"}
                  </p>
                  <span className={`inline-flex items-center gap-2 text-sm font-bold ${a.text}`}>
                    {rec.plays[g.id] ? "Play again" : "Play"} <i className="fas fa-arrow-right" aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <MemoryProfile rec={rec} onPlay={open} />

        <section aria-labelledby="badges-heading" className="mb-16">
          <h2 id="badges-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">Badges</h2>
          <p className="text-base text-slate-300 mb-6">
            You have <strong className="text-amber-300 font-semibold">{rec.badges.length} of {BADGES.length}</strong>. Come back every day to build your streak.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {BADGES.map((badge) => {
              const got = rec.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border text-center ${got ? "border-amber-500/40 bg-amber-500/10" : "border-white/10 bg-white/[0.02]"}`}
                >
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl mb-3 ${got ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-slate-400"}`}>
                    <i className={got ? badge.icon : "fas fa-lock"} aria-hidden="true" />
                  </div>
                  <p className={`text-base font-bold ${got ? "text-white" : "text-slate-300"}`}>{badge.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{badge.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="science-heading" className="mb-16">
          <h2 id="science-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">The science of memory</h2>
          <p className="text-base text-slate-300 mb-6">What researchers have found — and how to use it for your exams.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCIENCE.map((s) => {
              const a = ACCENT_CLASSES[s.color];
              return (
                <div key={s.title} className={`p-6 rounded-3xl border-l-4 border ${a.ring} bg-white/[0.03]`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 ${a.icon}`}>
                    <i className={s.icon} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-base text-slate-200 leading-relaxed">{s.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="next-heading" className="mb-16 grid md:grid-cols-2 gap-5">
          <h2 id="next-heading" className="sr-only">More in the Mind Lab</h2>
          <Link to="/mind-lab/personality-test" className="p-6 rounded-3xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300 mb-2">Next</p>
            <p className="text-lg font-bold text-white mb-1">Personality Test</p>
            <p className="text-sm text-slate-300">Find your study style and the subjects and careers that may suit you.</p>
          </Link>
          <Link to="/mind-lab" className="p-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-2">Explore</p>
            <p className="text-lg font-bold text-white mb-1">All Mind Lab tests and puzzles</p>
            <p className="text-sm text-slate-300">Star signs, workplace assessment and more.</p>
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

export default MemoryChallenge;
