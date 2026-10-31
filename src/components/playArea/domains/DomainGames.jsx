import { useState } from "react";
import { DOMAINS, DOMAIN_ORDER, LEVELS, LEVEL_QUIZ, QUIZ_ROUND, SORT_CARDS, SORT_ROUND, loadBest, saveBest, shareLink } from "../../../data/playArea/domains";
import { ACCENT_CLASSES } from "../../../data/playArea/games";
import { shuffle } from "../utils";

const GAMES = {
  sort: {
    title: "Head, Hands or Heart?",
    icon: "fas fa-shapes",
    blurb: `${SORT_ROUND} cards. Is it knowledge, a skill or an attitude?`,
    round: SORT_ROUND,
    deck: SORT_CARDS,
    prompt: "Which domain is this?",
  },
  level: {
    title: "Which thinking level?",
    icon: "fas fa-stairs",
    blurb: `${QUIZ_ROUND} exam questions. Which level of thinking does each one ask for?`,
    round: QUIZ_ROUND,
    deck: LEVEL_QUIZ,
    prompt: "Which thinking level does this question ask for?",
  },
};

const HOVER = { violet: "hover:border-violet-400", amber: "hover:border-amber-400", rose: "hover:border-rose-400" };

const HEAD_LEVELS = LEVELS.head.levels.map((l) => l.name);

const DomainGames = () => {
  const [game, setGame] = useState("sort");
  const [cards, setCards] = useState(null); // null = start screen
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const G = GAMES[game];

  const start = (g = game) => {
    setGame(g);
    setCards(shuffle(GAMES[g].deck).slice(0, GAMES[g].round));
    setI(0);
    setPick(null);
    setScore(0);
    setResult(null);
  };

  const choose = (answer) => {
    if (pick !== null) return;
    setPick(answer);
    const card = cards[i];
    if (answer === (game === "sort" ? card.domain : card.level)) setScore((s) => s + 1);
  };

  const next = () => {
    if (i + 1 < cards.length) {
      setI(i + 1);
      setPick(null);
      return;
    }
    const best = loadBest()[game];
    const isNewBest = saveBest(game, score);
    setResult({ best: Math.max(score, best ?? 0), isNewBest });
  };

  const tabs = (
    <div className="flex flex-wrap gap-3 mb-6" role="group" aria-label="Choose a game">
      {Object.entries(GAMES).map(([k, g]) => (
        <button
          key={k}
          type="button"
          aria-pressed={game === k}
          onClick={() => { setGame(k); setCards(null); setResult(null); }}
          className={`px-4 py-2.5 rounded-full border-2 text-base font-bold transition ${game === k ? "border-cyan-400 bg-cyan-500/15 text-white" : "border-white/15 text-slate-200 hover:border-white/40"}`}
        >
          <i className={`${g.icon} mr-2`} aria-hidden="true" />{g.title}
        </button>
      ))}
    </div>
  );

  const box = "p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03]";

  if (!cards) {
    const best = loadBest()[game];
    return (
      <div>
        {tabs}
        <div className={`${box} text-center`}>
          <span className="w-16 h-16 mx-auto rounded-full bg-cyan-500/15 text-cyan-300 text-2xl flex items-center justify-center mb-4">
            <i className={G.icon} aria-hidden="true" />
          </span>
          <h3 className="text-2xl font-black text-white mb-2">{G.title}</h3>
          <p className="text-base text-slate-200 mb-2">{G.blurb}</p>
          <p className="text-sm text-slate-300 mb-6">Every answer comes with a short reason.{best != null && <> Your best: <strong className="text-white">{best}/{G.round}</strong></>}</p>
          <button type="button" onClick={() => start()} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
            Start <i className="fas fa-play ml-2" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const pct = score / cards.length;
    const msg = pct === 1 ? "Perfect! You can spot the difference every time." : pct >= 0.75 ? "Great work. Read the reasons for the ones you missed." : pct >= 0.5 ? "Good start. Play again: the cards change each time." : "Scroll up to the ladders, then try again.";
    return (
      <div>
        {tabs}
        <div className={`${box} text-center`} role="status">
          {result.isNewBest && (
            <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-black uppercase tracking-widest mb-4">
              <i className="fas fa-trophy" aria-hidden="true" /> New personal best!
            </p>
          )}
          <p className="text-base font-bold text-slate-300 mb-1">{G.title}</p>
          <p className="text-5xl md:text-6xl font-black text-white mb-2">{score}/{cards.length}</p>
          <p className="text-base text-slate-200 mb-1">{msg}</p>
          <p className="text-sm text-slate-300 mb-6">Your best: <strong className="text-white">{result.best}/{cards.length}</strong></p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => start()} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
              <i className="fas fa-rotate-right mr-2" aria-hidden="true" /> Play again
            </button>
            <a
              href={shareLink(`I scored ${score}/${cards.length} in "${G.title}" on the VCS Mind Lab.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold transition"
            >
              <i className="fab fa-whatsapp mr-2" aria-hidden="true" /> Share score
            </a>
            <button type="button" onClick={() => start(game === "sort" ? "level" : "sort")} className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
              Try the other game
            </button>
          </div>
        </div>
      </div>
    );
  }

  const card = cards[i];
  const right = game === "sort" ? card.domain : card.level;
  const options = game === "sort"
    ? DOMAIN_ORDER.map((k) => ({ value: k, label: `${DOMAINS[k].short} · ${DOMAINS[k].name}`, icon: DOMAINS[k].icon, color: DOMAINS[k].color }))
    : HEAD_LEVELS.map((name, n) => ({ value: n, label: `${n + 1}. ${name}`, color: "violet" }));

  return (
    <div>
      {tabs}
      <div className={box}>
        <div className="flex items-center justify-between gap-4 mb-3">
          <p className="text-sm font-bold text-slate-300">Card {i + 1} of {cards.length}</p>
          <p className="text-sm font-bold text-emerald-300">Score {score}</p>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-6" aria-hidden="true">
          <div className="h-full bg-cyan-500 transition-all" style={{ width: `${(i / cards.length) * 100}%` }} />
        </div>
        <p className="text-sm font-bold text-slate-300 mb-2">{G.prompt}</p>
        <p className="text-2xl md:text-3xl font-black text-white leading-snug mb-6">{card.text || card.q}</p>

        <div className={`grid gap-3 ${game === "sort" ? "sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-3"}`}>
          {options.map((o) => {
            const a = ACCENT_CLASSES[o.color];
            const state = pick === null ? "idle" : o.value === right ? "right" : o.value === pick ? "wrong" : "dim";
            const cls = {
              idle: `border-white/15 bg-white/[0.04] hover:bg-white/[0.08] ${HOVER[o.color]}`,
              right: "border-emerald-400 bg-emerald-500/20",
              wrong: "border-rose-400 bg-rose-500/20",
              dim: "border-white/10 opacity-60",
            }[state];
            return (
              <button
                key={o.value}
                type="button"
                disabled={pick !== null}
                onClick={() => choose(o.value)}
                className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 text-left text-base md:text-lg font-bold text-white transition ${cls}`}
              >
                {o.icon && (
                  <span className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${a.icon}`}>
                    <i className={o.icon} aria-hidden="true" />
                  </span>
                )}
                <span className="min-w-0">{o.label}</span>
                {state === "right" && <i className="fas fa-check ml-auto text-emerald-300" aria-hidden="true" />}
                {state === "wrong" && <i className="fas fa-xmark ml-auto text-rose-300" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {pick !== null && (
          <div className={`mt-6 p-5 rounded-2xl border ${pick === right ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10"}`} role="status">
            <p className={`text-lg font-black mb-1 ${pick === right ? "text-emerald-300" : "text-rose-300"}`}>
              {pick === right ? "Correct!" : `Not quite. It's ${game === "sort" ? `${DOMAINS[right].short} (${DOMAINS[right].name})` : HEAD_LEVELS[right]}.`}
            </p>
            <p className="text-base text-slate-100 mb-4">{card.why}</p>
            <button type="button" onClick={next} className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
              {i + 1 < cards.length ? "Next card" : "See my score"} <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainGames;
