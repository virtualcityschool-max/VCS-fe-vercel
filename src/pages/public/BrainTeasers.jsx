import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { ACCENT_CLASSES } from "../../data/playArea/games";
import {
  STORE_KEY, EMPTY_RECORD, CATEGORIES, PUZZLES, BADGES, THINKERS, SOURCES,
  dailySet, todayKey, streak, shareLink,
} from "../../data/playArea/teasers";
import PuzzleCard from "../../components/playArea/teasers/PuzzleCard";
import MathSprint from "../../components/playArea/teasers/MathSprint";
import TowerOfHanoi from "../../components/playArea/teasers/TowerOfHanoi";
import RiverCrossing from "../../components/playArea/teasers/RiverCrossing";
import { shuffle } from "../../components/playArea/utils";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/mind-lab/brain-teasers`;

// Records live only in this browser (no login needed).
const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (s && typeof s === "object" && Array.isArray(s.solved)) return { ...EMPTY_RECORD, ...s };
  } catch { /* private mode or bad data */ }
  return EMPTY_RECORD;
};
const save = (r) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(r)); } catch { /* private mode */ }
};

const GAMES = [
  { id: "sprint", title: "Maths Sprint", icon: "fas fa-stopwatch", color: "emerald", text: "60 seconds. How many sums can you answer? It gets harder as you go." },
  { id: "hanoi", title: "Tower of Hanoi", icon: "fas fa-layer-group", color: "violet", text: "Move the tower, one disc at a time. A puzzle from 1883 that computer scientists still study." },
  { id: "river", title: "River Crossing", icon: "fas fa-sailboat", color: "cyan", text: "Get the wolf, goat and cabbage across safely. Alcuin's puzzle from about 800 AD." },
];

const WHY = [
  { icon: "fas fa-file-pen", color: "violet", title: "Aptitude tests", text: "Patterns, logic and quick maths are the question types used in aptitude tests such as the SAT, Saudi Arabia's GAT and Pakistan's NTS. Practice makes them familiar." },
  { icon: "fas fa-triangle-exclamation", color: "amber", title: "Read the trap", text: "Three of our logic puzzles come from the Cognitive Reflection Test (Frederick, 2005). Many students at top universities got at least one wrong by answering too fast." },
  { icon: "fas fa-comments", color: "emerald", title: "Explain your thinking", text: "Every puzzle shows how to solve it. Try explaining the answer to a friend — teaching it is the best way to really understand it." },
];

// -------------------------------------------------------- Daily set ------

const DailyChallenge = ({ rec, today, onPick, onHint }) => {
  const set = dailySet(today);
  const day = rec.daily[today] || { picks: {}, hints: [] };
  const firstOpen = set.findIndex((p) => day.picks[p.id] === undefined);
  const [view, setView] = useState(firstOpen === -1 ? 5 : firstOpen);
  const answeredAll = firstOpen === -1;
  const score = set.filter((p) => day.picks[p.id] === p.a).length;
  const days = streak(rec.dailyDone);
  const p = set[view];

  return (
    <section id="daily" aria-labelledby="daily-heading" className="mb-16 scroll-mt-24">
      <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-600/15 via-indigo-600/10 to-cyan-600/10 p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300 mb-1">
              {new Date(`${today}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h2 id="daily-heading" className="text-2xl md:text-3xl font-black font-poppins text-white">Today's 5 puzzles</h2>
            <p className="text-base text-slate-300">One of each kind. Everyone gets the same 5 today, so compare with your friends!</p>
          </div>
          <div className="flex items-center gap-2" aria-label="Progress">
            {set.map((q, i) => {
              const pick = day.picks[q.id];
              const cls = pick === undefined ? "bg-white/10 text-slate-300" : pick === q.a ? "bg-emerald-500 text-white" : "bg-rose-500 text-white";
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setView(i)}
                  aria-label={`Puzzle ${i + 1}${pick === undefined ? "" : pick === q.a ? ", correct" : ", wrong"}`}
                  className={`w-9 h-9 rounded-full text-sm font-black transition ${cls} ${view === i ? "ring-2 ring-white" : ""}`}
                >
                  {i + 1}
                </button>
              );
            })}
            {answeredAll && (
              <button type="button" onClick={() => setView(5)} className={`h-9 px-3 rounded-full text-sm font-black bg-amber-500/20 text-amber-300 ${view === 5 ? "ring-2 ring-white" : ""}`}>
                Score
              </button>
            )}
          </div>
        </div>

        {view < 5 ? (
          <PuzzleCard
            key={p.id}
            puzzle={p}
            picked={day.picks[p.id]}
            hinted={day.hints.includes(p.id)}
            onPick={(ans) => onPick(p, ans)}
            onHint={() => onHint(p)}
            label={`Puzzle ${view + 1} of 5`}
          >
            {day.picks[p.id] !== undefined && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    const next = set.findIndex((q, i) => i > view && day.picks[q.id] === undefined);
                    const any = set.findIndex((q) => day.picks[q.id] === undefined);
                    setView(next !== -1 ? next : any !== -1 ? any : 5);
                  }}
                  className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition"
                >
                  {answeredAll ? "See my score" : "Next puzzle"} <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
                </button>
              </div>
            )}
          </PuzzleCard>
        ) : (
          <div className="text-center py-4">
            <p className="text-5xl mb-2" aria-hidden="true">{"⭐".repeat(score)}{"☆".repeat(5 - score)}</p>
            <p className="text-6xl font-black text-white">{score} / 5</p>
            <p className="text-lg font-bold text-cyan-300 mb-3">
              {score === 5 ? "Perfect day! 🏆" : score >= 3 ? "Great thinking!" : "Good try — read each explanation and you'll be ready tomorrow."}
            </p>
            <p className="text-base text-slate-200 mb-6">
              {days > 1 ? <>You're on a <strong className="text-amber-300 font-semibold">{days}-day streak</strong> 🔥 </> : null}
              New puzzles tomorrow. Meanwhile, play more below.
            </p>
            <a
              href={shareLink(`I scored ${score}/5 on today's VCS Brain Teasers ${"⭐".repeat(score)}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold transition"
            >
              <i className="fab fa-whatsapp mr-2" aria-hidden="true" /> Challenge a friend
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

// ---------------------------------------------------------- Practice -----

const Practice = ({ cat, rec, onSolved }) => {
  // Unsolved puzzles first, each group in a random order.
  const [queue] = useState(() => {
    const all = PUZZLES.filter((p) => p.cat === cat);
    return [...shuffle(all.filter((p) => !rec.solved.includes(p.id))), ...shuffle(all.filter((p) => rec.solved.includes(p.id)))];
  });
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(undefined);
  const [hinted, setHinted] = useState(false);
  const [right, setRight] = useState(0);
  const p = queue[i % queue.length];
  const solvedHere = queue.filter((q) => rec.solved.includes(q.id)).length;

  return (
    <div>
      <p className="text-base text-slate-300 mb-5">
        {CATEGORIES[cat].text} You've solved <strong className="text-white">{solvedHere} of {queue.length}</strong>. This session: {right} right.
      </p>
      <PuzzleCard
        key={`${p.id}-${i}`}
        puzzle={p}
        picked={picked}
        hinted={hinted}
        onHint={() => setHinted(true)}
        onPick={(ans) => {
          setPicked(ans);
          if (ans === p.a) {
            setRight(right + 1);
            onSolved(p);
          }
        }}
        label={`Puzzle ${(i % queue.length) + 1} of ${queue.length}`}
      >
        {picked !== undefined && (
          <button
            type="button"
            onClick={() => { setI(i + 1); setPicked(undefined); setHinted(false); }}
            className="mt-5 px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition"
          >
            Next puzzle <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
          </button>
        )}
      </PuzzleCard>
    </div>
  );
};

// -------------------------------------------------------------- Page -----

const BrainTeasers = () => {
  useSeo({
    title: "Brain Teasers — Daily Logic Puzzles, Riddles and Maths for Students",
    description:
      "Five new brain teasers every day: patterns, logic, riddles, quick maths and famous puzzles from history (Al-Khwarizmi, Fibonacci, Euler). Plus a 60-second Maths Sprint, Tower of Hanoi and the river-crossing puzzle. Free, with hints and explanations.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Mind Lab", item: `${SITE_URL}/mind-lab` },
          { "@type": "ListItem", position: 3, name: "Brain Teasers", item: PAGE_URL },
        ],
      },
    ],
  });

  const [rec, setRec] = useState(load);
  const recRef = useRef(rec);
  const [today] = useState(() => todayKey());
  const [active, setActive] = useState(null); // category id or game id
  const [newBadges, setNewBadges] = useState([]);
  const playRef = useRef(null);

  useEffect(() => {
    if (active) playRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [active]);

  const open = (id) => {
    setNewBadges([]);
    setActive(id);
  };
  const exit = () => {
    setActive(null);
    setTimeout(() => document.getElementById("more")?.scrollIntoView({ behavior: "smooth" }), 30);
  };

  // Apply a change to the record, award badges and save.
  const commit = (change) => {
    const prev = recRef.current;
    const next = change({
      ...prev,
      solved: [...prev.solved],
      daily: { ...prev.daily },
      dailyDone: [...prev.dailyDone],
      best: { ...prev.best, hanoi: { ...(prev.best.hanoi || {}) } },
    });
    const out = next.result;
    delete next.result;
    const earned = BADGES.filter((b) => prev.badges.includes(b.id) || b.test(next)).map((b) => b.id);
    const fresh = earned.filter((id) => !prev.badges.includes(id));
    next.badges = earned;
    recRef.current = next;
    save(next);
    setRec(next);
    if (fresh.length) setNewBadges(fresh);
    return out;
  };

  const markSolved = (r, p) => {
    if (!r.solved.includes(p.id)) r.solved.push(p.id);
  };

  const pickDaily = (p, ans) =>
    commit((r) => {
      const day = r.daily[today] || { picks: {}, hints: [] };
      if (day.picks[p.id] !== undefined) return r;
      r.daily[today] = { ...day, picks: { ...day.picks, [p.id]: ans } };
      // Keep the last 30 days only.
      Object.keys(r.daily).sort().slice(0, -30).forEach((d) => delete r.daily[d]);
      if (ans === p.a) markSolved(r, p);
      if (dailySet(today).every((q) => r.daily[today].picks[q.id] !== undefined) && !r.dailyDone.includes(today)) {
        r.dailyDone = [...r.dailyDone, today].slice(-60);
      }
      return r;
    });

  const hintDaily = (p) =>
    commit((r) => {
      const day = r.daily[today] || { picks: {}, hints: [] };
      r.daily[today] = { ...day, hints: [...day.hints, p.id] };
      return r;
    });

  const lower = (r, key, value) => {
    const old = r.best[key];
    if (old && value >= old) return false;
    r.best[key] = value;
    return Boolean(old);
  };

  const gameEl = {
    sprint: (
      <MathSprint
        best={rec.best.sprint}
        onExit={exit}
        onResult={(s) =>
          commit((r) => {
            const old = r.best.sprint || 0;
            if (s > old) r.best.sprint = s;
            r.result = s > old && old > 0;
            return r;
          })
        }
      />
    ),
    hanoi: (
      <TowerOfHanoi
        bestByDiscs={rec.best.hanoi}
        onExit={exit}
        onResult={(discs, moves) =>
          commit((r) => {
            const old = r.best.hanoi[discs];
            if (!old || moves < old) r.best.hanoi[discs] = moves;
            r.result = Boolean(old) && moves < old;
            return r;
          })
        }
      />
    ),
    river: (
      <RiverCrossing
        best={rec.best.river}
        onExit={exit}
        onResult={(trips) =>
          commit((r) => {
            r.result = lower(r, "river", trips);
            return r;
          })
        }
      />
    ),
  };

  const activeCat = CATEGORIES[active];
  const activeGame = GAMES.find((g) => g.id === active);
  const activeInfo = activeCat
    ? { title: `${activeCat.name} practice`, icon: activeCat.icon, color: activeCat.color }
    : activeGame
      ? { title: activeGame.title, icon: activeGame.icon, color: activeGame.color }
      : null;
  const days = streak(rec.dailyDone);
  const badgeBanner = newBadges.length > 0 && (
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
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-amber-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/mind-lab" className="hover:text-white transition">Mind Lab</Link>
          <span>/</span>
          <span className="text-slate-200">Brain Teasers</span>
        </nav>

        <header className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
              Mind Lab · Brain Teasers
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
              Five puzzles a day to <span className="text-gradient">sharpen your mind</span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
              Patterns, logic, riddles, quick maths and famous puzzles from history. Every puzzle has a hint and a clear explanation, so you <strong className="text-amber-300 font-semibold">learn the trick</strong> even when you get it wrong.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl">
              {[
                [rec.solved.length, "puzzles solved", "text-violet-300"],
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
              <a href="#daily" className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
                Today's puzzles <i className="fas fa-arrow-down ml-2" aria-hidden="true" />
              </a>
              <a href="#more" className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
                More puzzles and games
              </a>
            </div>
            <p className="text-sm text-slate-400 mt-4">Free, no sign-up. Your progress is saved on this device.</p>
          </div>
          <figure>
            <img
              src="/images/play-area/chess.webp"
              alt="Wooden chess pieces in play on a chessboard"
              width="1600"
              height="1067"
              className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10"
            />
            <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
          </figure>
        </header>

        {!activeInfo && badgeBanner}
        <DailyChallenge rec={rec} today={today} onPick={pickDaily} onHint={hintDaily} />

        {activeInfo && (
          <section ref={playRef} aria-label={activeInfo.title} className="mb-16 scroll-mt-24">
            <div className={`rounded-3xl border-t-4 border ${ACCENT_CLASSES[activeInfo.color].ring} bg-[#0b1224]/80 p-5 md:p-8`}>
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-black font-poppins text-white">
                  <span className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl ${ACCENT_CLASSES[activeInfo.color].icon}`}>
                    <i className={activeInfo.icon} aria-hidden="true" />
                  </span>
                  {activeInfo.title}
                </h2>
                <button type="button" onClick={exit} className="text-sm font-black uppercase tracking-widest text-cyan-300 hover:text-white whitespace-nowrap">
                  <i className="fas fa-xmark mr-2" aria-hidden="true" /> Close
                </button>
              </div>
              {badgeBanner}
              <div key={active}>
                {activeCat ? (
                  <Practice cat={active} rec={rec} onSolved={(p) => commit((r) => { markSolved(r, p); return r; })} />
                ) : (
                  gameEl[active]
                )}
              </div>
            </div>
          </section>
        )}

        <section id="more" aria-labelledby="more-heading" className="mb-16 scroll-mt-24">
          <h2 id="more-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">Practise by type</h2>
          <p className="text-base text-slate-300 mb-6">As many puzzles as you like. New ones first, then the ones you've already solved.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">
            {Object.entries(CATEGORIES).map(([id, c]) => {
              const a = ACCENT_CLASSES[c.color];
              const all = PUZZLES.filter((p) => p.cat === id);
              const done = all.filter((p) => rec.solved.includes(p.id)).length;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => open(id)}
                  className={`text-left h-full flex flex-col p-6 rounded-3xl border-t-4 border ${a.ring} ${active === id ? a.bg : "bg-white/[0.03]"} hover:bg-white/[0.06] hover:-translate-y-1 transition`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 ${a.icon}`}>
                    <i className={c.icon} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{c.name}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-5">{c.text}</p>
                  <div className="mt-auto">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                      <div className={`h-full ${a.bar}`} style={{ width: `${(done / all.length) * 100}%` }} />
                    </div>
                    <p className={`text-sm font-bold ${a.text}`}>{done} of {all.length} solved</p>
                  </div>
                </button>
              );
            })}
          </div>

          <h2 className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">Puzzle games</h2>
          <p className="text-base text-slate-300 mb-6">Hands-on puzzles you play, not just answer.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {GAMES.map((g) => {
              const a = ACCENT_CLASSES[g.color];
              const bestText =
                g.id === "sprint" ? (rec.best.sprint ? `${rec.best.sprint} correct` : null)
                  : g.id === "hanoi" ? (Object.keys(rec.best.hanoi || {}).length ? Object.entries(rec.best.hanoi).map(([d, m]) => `${d} discs: ${m}`).join(" · ") : null)
                    : rec.best.river ? `${rec.best.river} trips` : null;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => open(g.id)}
                  className={`text-left h-full flex flex-col p-6 rounded-3xl border-l-4 border ${a.ring} ${active === g.id ? a.bg : "bg-white/[0.03]"} hover:bg-white/[0.06] hover:-translate-y-1 transition`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${a.icon}`}>
                      <i className={g.icon} aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{g.title}</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">{g.text}</p>
                  <p className="mt-auto text-sm font-bold text-amber-300">
                    <i className="fas fa-trophy mr-1.5" aria-hidden="true" />{bestText ? `Best: ${bestText}` : "Not played yet"}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="history-heading" className="mb-16">
          <h2 id="history-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">Great puzzle thinkers</h2>
          <p className="text-base text-slate-300 mb-6">The people behind our puzzles — and why their ideas still matter today.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {THINKERS.map((t) => {
              const a = ACCENT_CLASSES[t.color];
              return (
                <div key={t.name} className={`p-6 rounded-3xl border-t-4 border ${a.ring} bg-white/[0.03]`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${a.icon}`}>
                      <i className={t.icon} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{t.name}</h3>
                      <p className={`text-xs font-bold uppercase tracking-wider ${a.text}`}>{t.when}</p>
                    </div>
                  </div>
                  <p className="text-base text-slate-200 leading-relaxed">{t.text}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <button type="button" onClick={() => open("history")} className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-base font-bold transition">
              <i className="fas fa-landmark mr-2" aria-hidden="true" /> Try their puzzles
            </button>
          </div>
        </section>

        <section aria-labelledby="badges-heading" className="mb-16">
          <h2 id="badges-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">Badges</h2>
          <p className="text-base text-slate-300 mb-6">
            You have <strong className="text-amber-300 font-semibold">{rec.badges.length} of {BADGES.length}</strong>. Finish the daily puzzles every day to build your streak.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {BADGES.map((badge) => {
              const got = rec.badges.includes(badge.id);
              return (
                <div key={badge.id} className={`p-4 rounded-2xl border text-center ${got ? "border-amber-500/40 bg-amber-500/10" : "border-white/10 bg-white/[0.02]"}`}>
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

        <section aria-labelledby="why-heading" className="mb-16">
          <h2 id="why-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-6">Why puzzles help</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {WHY.map((w) => {
              const a = ACCENT_CLASSES[w.color];
              return (
                <div key={w.title} className={`p-6 rounded-3xl border-l-4 border ${a.ring} bg-white/[0.03]`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 ${a.icon}`}>
                    <i className={w.icon} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{w.title}</h3>
                  <p className="text-base text-slate-200 leading-relaxed">{w.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="next-heading" className="mb-16 grid md:grid-cols-2 gap-5">
          <h2 id="next-heading" className="sr-only">More in the Mind Lab</h2>
          <Link to="/mind-lab/memory-challenge" className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300 mb-2">Next</p>
            <p className="text-lg font-bold text-white mb-1">Memory Challenge</p>
            <p className="text-sm text-slate-300">Five memory games and your Memory Profile.</p>
          </Link>
          <Link to="/mind-lab" className="p-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-2">Explore</p>
            <p className="text-lg font-bold text-white mb-1">All Mind Lab tests and puzzles</p>
            <p className="text-sm text-slate-300">Personality test, star signs, workplace assessment and more.</p>
          </Link>
        </section>

        <section aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="text-lg font-bold text-white mb-3">Sources</h2>
          <ul className="space-y-1.5 text-sm text-slate-300 list-disc pl-5">
            {SOURCES.map((s) => <li key={s}>{s}</li>)}
            <li>Frederick, S. (2005). Cognitive reflection and decision making. Journal of Economic Perspectives, 19(4), 25–42.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default BrainTeasers;
