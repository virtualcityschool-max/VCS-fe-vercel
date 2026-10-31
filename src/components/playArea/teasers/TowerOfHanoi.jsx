import { useState } from "react";
import { shareLink } from "../../../data/playArea/teasers";
import { GameOver, Stat, Status } from "../shared";

const DISC_COLORS = ["bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-cyan-400", "bg-violet-400"];
const PEG_NAMES = ["Left", "Middle", "Right"];
const fresh = (n) => [[...Array(n).keys()].map((i) => n - i), [], []]; // bottom → top, bigger number = bigger disc

const TowerOfHanoi = ({ bestByDiscs = {}, onResult, onExit }) => {
  const [n, setN] = useState(3);
  const [pegs, setPegs] = useState(fresh(3));
  const [sel, setSel] = useState(null);
  const [moves, setMoves] = useState(0);
  const [msg, setMsg] = useState(null);
  const [result, setResult] = useState(null);
  const min = 2 ** n - 1;

  const reset = (size = n) => {
    setN(size);
    setPegs(fresh(size));
    setSel(null);
    setMoves(0);
    setMsg(null);
    setResult(null);
  };

  const tap = (i) => {
    if (sel === null) {
      if (pegs[i].length) {
        setSel(i);
        setMsg(null);
      }
      return;
    }
    if (sel === i) {
      setSel(null);
      return;
    }
    const disc = pegs[sel][pegs[sel].length - 1];
    const top = pegs[i][pegs[i].length - 1];
    if (top !== undefined && top < disc) {
      setMsg("A bigger disc can't go on a smaller one.");
      setSel(null);
      return;
    }
    const next = pegs.map((p) => [...p]);
    next[sel].pop();
    next[i].push(disc);
    const m = moves + 1;
    setPegs(next);
    setMoves(m);
    setSel(null);
    setMsg(null);
    if (next[2].length === n) {
      const isNewBest = onResult(n, m);
      setResult({ moves: m, isNewBest });
    }
  };

  if (result) {
    const perfect = result.moves === min;
    return (
      <GameOver
        title={`You moved the ${n}-disc tower in`}
        score={result.moves}
        unit="moves"
        best={Math.min(bestByDiscs[n] || 999, result.moves)}
        isNewBest={result.isNewBest}
        note={perfect ? `Perfect — that's the fewest possible (2^${n} − 1 = ${min}).` : `The fewest possible is ${min} (2^${n} − 1). Can you find it?`}
        shareText={`I solved the ${n}-disc Tower of Hanoi in ${result.moves} moves on VCS Brain Teasers!`}
        shareLink={shareLink}
        onAgain={() => reset(n)}
        onExit={onExit}
      >
        {perfect && n < 5 && (
          <button type="button" onClick={() => reset(n + 1)} className="text-base font-bold text-cyan-300 hover:text-white underline underline-offset-4">
            Try {n + 1} discs
          </button>
        )}
      </GameOver>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4">
        <Stat label="Moves" value={moves} color="text-violet-300" />
        <Stat label="Fewest" value={min} color="text-emerald-300" />
        <Stat label="Best" value={bestByDiscs[n] || "–"} color="text-amber-300" />
      </div>
      <div className="flex justify-center gap-2 mb-4" role="group" aria-label="Number of discs">
        {[3, 4, 5].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => reset(k)}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition ${k === n ? "bg-violet-600 border-violet-500 text-white" : "border-white/20 text-slate-200 hover:border-white/40"}`}
          >
            {k} discs
          </button>
        ))}
      </div>
      <Status tone={msg ? "bad" : sel !== null ? "go" : "info"}>
        {msg || (sel !== null ? "Now tap where it should go." : "Move the whole tower to the right peg. Tap a peg to pick up its top disc.")}
      </Status>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto mt-4">
        {pegs.map((peg, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            aria-label={`${PEG_NAMES[i]} peg, ${peg.length} discs${sel === i ? ", selected" : ""}`}
            className={`relative h-48 sm:h-56 rounded-2xl border-2 transition flex flex-col-reverse items-center px-1 sm:px-3 pb-3 pt-6 ${sel === i ? "border-violet-400 bg-violet-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/30"}`}
          >
            <span className="absolute bottom-3 top-6 left-1/2 -translate-x-1/2 w-1.5 rounded-full bg-slate-500/60" aria-hidden="true" />
            {peg.map((d, j) => (
              <span
                key={d}
                className={`relative h-5 sm:h-7 rounded-full mt-1 ${DISC_COLORS[d - 1]} ${sel === i && j === peg.length - 1 ? "-translate-y-3 ring-2 ring-white" : ""} transition-transform`}
                style={{ width: `${30 + (70 * d) / n}%` }}
              />
            ))}
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-slate-300 mt-3">Rules: move one disc at a time, and never put a bigger disc on a smaller one.</p>
    </div>
  );
};

export default TowerOfHanoi;
