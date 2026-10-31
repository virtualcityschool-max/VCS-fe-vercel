import { useEffect, useState } from "react";
import { PAIR_DECKS, PAIRS_PER_GAME } from "../../../data/playArea/memory";
import { useTimers, shuffle, nowMs } from "../utils";
import { GameOver, GhostButton, Stat, Status } from "../shared";

const deal = (deckId) => {
  const pairs = shuffle(PAIR_DECKS[deckId].pairs).slice(0, PAIRS_PER_GAME);
  const cards = pairs.flatMap(([a, b], p) => [
    { id: `${p}a`, pair: p, text: a, side: "a" },
    { id: `${p}b`, pair: p, text: b, side: "b" },
  ]);
  return { pairs, cards: shuffle(cards) };
};

const MatchPairs = ({ bestByDeck = {}, onResult, onExit }) => {
  const { later, clearAll } = useTimers();
  const [deck, setDeck] = useState(null);
  const [game, setGame] = useState(null); // { pairs, cards }
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState(null);

  const running = startedAt && !result;
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setNow(nowMs()), 500);
    return () => clearInterval(id);
  }, [running]);

  const start = (d) => {
    clearAll();
    setDeck(d);
    setGame(deal(d));
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setStartedAt(null);
    setResult(null);
  };

  const flip = (card) => {
    if (open.length === 2 || open.includes(card.id) || matched.has(card.pair)) return;
    const t = nowMs();
    if (!startedAt) {
      setStartedAt(t);
      setNow(t);
    }
    const next = [...open, card.id];
    setOpen(next);
    if (next.length < 2) return;
    setMoves(moves + 1);
    const [a, b] = next.map((id) => game.cards.find((c) => c.id === id));
    if (a.pair === b.pair) {
      const m = new Set(matched).add(a.pair);
      setMatched(m);
      setOpen([]);
      if (m.size === PAIRS_PER_GAME) {
        const secs = Math.round((nowMs() - (startedAt || t)) / 1000);
        const isNewBest = onResult(deck, moves + 1);
        later(() => setResult({ moves: moves + 1, secs, isNewBest }), 500);
      }
    } else {
      later(() => setOpen([]), 1000);
    }
  };

  if (!deck) {
    return (
      <div className="py-4">
        <p className="text-lg text-slate-200 mb-6 text-center max-w-xl mx-auto">
          Flip two cards at a time. Match each one with its partner — in as few moves as you can. Pick a topic:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {Object.entries(PAIR_DECKS).map(([id, d]) => (
            <button
              key={id}
              type="button"
              onClick={() => start(id)}
              className="flex items-center gap-4 p-5 rounded-3xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-left transition"
            >
              <span className="w-12 h-12 shrink-0 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl">
                <i className={d.icon} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-bold text-white">{d.name}</span>
                <span className="block text-sm font-bold text-amber-300">
                  {bestByDeck[id] ? `Best: ${bestByDeck[id]} moves` : "Not played yet"}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    const best = Math.min(bestByDeck[deck] || 99, result.moves);
    return (
      <GameOver
        title={`${PAIR_DECKS[deck].name} — cleared in ${result.secs} seconds`}
        score={result.moves}
        unit="moves"
        best={best}
        isNewBest={result.isNewBest}
        note={`A perfect game is ${PAIRS_PER_GAME} moves. 14 or fewer is excellent — fewer moves means you remembered where each card was.`}
        shareText={`I matched all ${PAIRS_PER_GAME} pairs (${PAIR_DECKS[deck].name}) in ${result.moves} moves on the VCS Memory Challenge!`}
        onAgain={() => start(deck)}
        onExit={onExit}
      >
        <div className="max-w-2xl mx-auto text-left rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5 md:p-6">
          <p className="text-sm font-black uppercase tracking-widest text-amber-300 mb-3">Revise the pairs you just matched</p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {game.pairs.map(([a, b]) => (
              <li key={a} className="text-base text-slate-200">
                <strong className="text-white">{a}</strong> → {b}
              </li>
            ))}
          </ul>
        </div>
        <button type="button" onClick={() => setDeck(null)} className="mt-5 text-base font-bold text-cyan-300 hover:text-white underline underline-offset-4">
          Choose another topic
        </button>
      </GameOver>
    );
  }

  const secs = startedAt ? Math.max(0, Math.round((now - startedAt) / 1000)) : 0;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5">
        <Stat label="Moves" value={moves} color="text-amber-300" />
        <Stat label="Pairs" value={`${matched.size}/${PAIRS_PER_GAME}`} color="text-emerald-300" />
        <Stat label="Time" value={`${secs}s`} color="text-cyan-300" />
      </div>
      <Status tone="info">{PAIR_DECKS[deck].name}</Status>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-[640px] mx-auto my-6">
        {game.cards.map((c) => {
          const isOpen = open.includes(c.id);
          const isDone = matched.has(c.pair);
          const face = isOpen || isDone;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => flip(c)}
              aria-label={face ? c.text : "Hidden card"}
              className={`aspect-[4/5] sm:aspect-[5/4] rounded-xl sm:rounded-2xl border-2 p-1.5 flex items-center justify-center text-center transition-all duration-200 ${
                isDone
                  ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-200"
                  : isOpen
                    ? "bg-amber-500/20 border-amber-300 text-white scale-[1.03]"
                    : "bg-gradient-to-br from-violet-600/40 to-indigo-600/40 border-violet-400/40 hover:border-violet-300"
              }`}
            >
              {face ? (
                <span className={`font-bold leading-tight break-words ${c.side === "a" ? "text-base sm:text-xl" : "text-xs sm:text-base"}`}>{c.text}</span>
              ) : (
                <i className="fas fa-question text-xl sm:text-2xl text-violet-200/70" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
      <div className="text-center">
        <GhostButton onClick={() => { clearAll(); setDeck(null); }}>Change topic</GhostButton>
      </div>
    </div>
  );
};

export default MatchPairs;
