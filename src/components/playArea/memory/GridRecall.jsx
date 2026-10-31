import { useState } from "react";
import { useTimers, shuffle } from "../utils";
import { GameOver, PrimaryButton, Stat, Status } from "../shared";

const START = 3;
const LIVES = 3;
const MAX = 18;
const sizeFor = (n) => (n <= 4 ? 3 : n <= 7 ? 4 : n <= 10 ? 5 : 6);
const GRID_COLS = { 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" };

const GridRecall = ({ best, onResult, onExit }) => {
  const { later, clearAll } = useTimers();
  const [phase, setPhase] = useState("ready"); // ready | show | input | pass | fail | over
  const [n, setN] = useState(START);
  const [targets, setTargets] = useState(new Set());
  const [picked, setPicked] = useState(new Set());
  const [wrong, setWrong] = useState(null);
  const [lives, setLives] = useState(LIVES);
  const [longest, setLongest] = useState(0);
  const [result, setResult] = useState(null);
  const size = sizeFor(n);

  const round = (count) => {
    const cells = sizeFor(count) ** 2;
    setN(count);
    setTargets(new Set(shuffle([...Array(cells).keys()]).slice(0, count)));
    setPicked(new Set());
    setWrong(null);
    setPhase("show");
    later(() => setPhase("input"), 1100 + count * 150);
  };

  const start = () => {
    clearAll();
    setLives(LIVES);
    setLongest(0);
    setResult(null);
    round(START);
  };

  const tap = (i) => {
    if (phase !== "input" || picked.has(i)) return;
    if (!targets.has(i)) {
      setWrong(i);
      const left = lives - 1;
      setLives(left);
      if (left === 0) {
        setPhase("fail");
        later(() => {
          const isNewBest = onResult(longest);
          setResult({ score: longest, isNewBest });
          setPhase("over");
        }, 1600);
      } else {
        setPhase("fail");
        later(() => round(n), 1600);
      }
      return;
    }
    const next = new Set(picked).add(i);
    setPicked(next);
    if (next.size === targets.size) {
      setLongest(n);
      setPhase("pass");
      later(() => round(Math.min(MAX, n + 1)), 900);
    }
  };

  if (phase === "over") {
    return (
      <GameOver
        title="Most squares you remembered"
        score={result.score}
        unit="squares"
        best={Math.max(best || 0, result.score)}
        isNewBest={result.isNewBest}
        note="Tip: don't try to remember each square — see the shape they make together."
        shareText={`I remembered ${result.score} squares in Grid Recall on the VCS Memory Challenge!`}
        onAgain={start}
        onExit={onExit}
      />
    );
  }

  const status = {
    ready: ["info", "Squares will light up together. Remember where they are."],
    show: ["info", `Remember these ${n} squares…`],
    input: ["go", `Tap the squares — ${targets.size - picked.size} left`],
    pass: ["good", "Perfect! One more square…"],
    fail: ["bad", lives > 0 ? "Oops! Here are the ones you missed." : "Out of lives!"],
  }[phase];

  const cellClass = (i) => {
    const isT = targets.has(i);
    if (phase === "show" && isT) return "bg-cyan-400 border-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.8)]";
    if (picked.has(i)) return "bg-emerald-400 border-emerald-200";
    if (wrong === i) return "bg-rose-500 border-rose-300";
    if (phase === "fail" && isT) return "bg-cyan-500/40 border-cyan-300";
    return "bg-white/[0.06] border-white/15 hover:bg-white/[0.12]";
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5">
        <Stat label="Squares" value={n} color="text-cyan-300" />
        <Stat label="Lives" value={"♥".repeat(lives) || "–"} color="text-rose-300" />
        <Stat label="Best" value={best || "–"} color="text-amber-300" />
      </div>
      <Status tone={status[0]}>{status[1]}</Status>
      {phase === "ready" && (
        <div className="text-center mt-4">
          <PrimaryButton onClick={start}>
            <i className="fas fa-play mr-2" aria-hidden="true" /> Start
          </PrimaryButton>
        </div>
      )}
      <div className={`grid ${GRID_COLS[size]} gap-2 sm:gap-3 w-full max-w-[460px] mx-auto my-6`}>
        {[...Array(size * size).keys()].map((i) => (
          <button
            key={`${size}-${i}`}
            type="button"
            aria-label={`Square ${i + 1}`}
            disabled={phase !== "input"}
            onClick={() => tap(i)}
            className={`aspect-square rounded-xl border-2 transition-colors duration-150 ${cellClass(i)}`}
          />
        ))}
      </div>
    </div>
  );
};

export default GridRecall;
