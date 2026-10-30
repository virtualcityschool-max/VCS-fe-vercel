import { useState } from "react";
import { NORMS } from "../../../data/playArea/memory";
import { useTimers, rand } from "./utils";
import { GameOver, PrimaryButton, Stat, Status } from "./shared";

const TILES = [
  ["bg-violet-500/20 border-violet-400/40", "bg-violet-400 border-violet-200 shadow-[0_0_40px_rgba(167,139,250,0.9)]"],
  ["bg-cyan-500/20 border-cyan-400/40", "bg-cyan-400 border-cyan-200 shadow-[0_0_40px_rgba(34,211,238,0.9)]"],
  ["bg-emerald-500/20 border-emerald-400/40", "bg-emerald-400 border-emerald-200 shadow-[0_0_40px_rgba(52,211,153,0.9)]"],
  ["bg-amber-500/20 border-amber-400/40", "bg-amber-400 border-amber-200 shadow-[0_0_40px_rgba(251,191,36,0.9)]"],
  ["bg-rose-500/20 border-rose-400/40", "bg-rose-400 border-rose-200 shadow-[0_0_40px_rgba(251,113,133,0.9)]"],
  ["bg-indigo-500/20 border-indigo-400/40", "bg-indigo-400 border-indigo-200 shadow-[0_0_40px_rgba(129,140,248,0.9)]"],
  ["bg-sky-500/20 border-sky-400/40", "bg-sky-400 border-sky-200 shadow-[0_0_40px_rgba(56,189,248,0.9)]"],
  ["bg-lime-500/20 border-lime-400/40", "bg-lime-400 border-lime-200 shadow-[0_0_40px_rgba(163,230,53,0.9)]"],
  ["bg-fuchsia-500/20 border-fuchsia-400/40", "bg-fuchsia-400 border-fuchsia-200 shadow-[0_0_40px_rgba(232,121,249,0.9)]"],
];
const START_LEN = 2;
const LIVES = 2;

// Next tile, never the same as the one before (two flashes of one tile are hard to see).
const nextTile = (prev) => {
  let t = rand(TILES.length);
  while (t === prev) t = rand(TILES.length);
  return t;
};
const makeSeq = (n) => {
  const s = [];
  for (let i = 0; i < n; i++) s.push(nextTile(s[i - 1]));
  return s;
};

const LightPath = ({ best, onResult, onExit }) => {
  const { later, clearAll } = useTimers();
  const [phase, setPhase] = useState("ready"); // ready | show | input | pass | oops | over
  const [seq, setSeq] = useState([]);
  const [lit, setLit] = useState(null);
  const [pos, setPos] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [result, setResult] = useState(null);

  const play = (s) => {
    setSeq(s);
    setPos(0);
    setLit(null);
    setPhase("show");
    const step = Math.max(450, 850 - s.length * 30);
    s.forEach((t, i) => {
      later(() => setLit(t), 500 + i * step);
      later(() => setLit(null), 500 + i * step + step * 0.65);
    });
    later(() => setPhase("input"), 500 + s.length * step);
  };

  const start = () => {
    clearAll();
    setLives(LIVES);
    setResult(null);
    play(makeSeq(START_LEN));
  };

  const finish = (score) => {
    const isNewBest = onResult(score);
    setResult({ score, isNewBest });
    setPhase("over");
  };

  const tap = (t) => {
    if (phase !== "input") return;
    setLit(t);
    later(() => setLit((x) => (x === t ? null : x)), 220);
    if (t === seq[pos]) {
      if (pos + 1 === seq.length) {
        setPhase("pass");
        later(() => play([...seq, nextTile(seq[seq.length - 1])]), 900);
      } else {
        setPos(pos + 1);
      }
      return;
    }
    if (lives > 1) {
      setLives(lives - 1);
      setPhase("oops");
      later(() => play(seq), 1300);
    } else {
      finish(seq.length - 1);
    }
  };

  if (phase === "over") {
    return (
      <GameOver
        title="Longest path you repeated"
        score={result.score}
        unit="steps"
        best={Math.max(best || 0, result.score)}
        isNewBest={result.isNewBest}
        note={NORMS.lightPath}
        shareText={`I repeated a ${result.score}-step Light Path on the VCS Memory Challenge!`}
        onAgain={start}
        onExit={onExit}
      />
    );
  }

  const status = {
    ready: ["info", "Watch the tiles light up, then tap them in the same order."],
    show: ["info", "Watch carefully…"],
    input: ["go", `Your turn — step ${pos + 1} of ${seq.length}`],
    pass: ["good", "Correct! One more step…"],
    oops: ["bad", "Not quite. Watch again."],
  }[phase];

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5">
        <Stat label="Steps" value={seq.length || START_LEN} color="text-violet-300" />
        <Stat label="Lives" value={"♥".repeat(lives)} color="text-rose-300" />
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
      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[420px] mx-auto my-6">
        {TILES.map(([off, on], i) => (
          <button
            key={i}
            type="button"
            aria-label={`Tile ${i + 1}`}
            disabled={phase !== "input"}
            onClick={() => tap(i)}
            className={`aspect-square rounded-2xl border-2 transition-all duration-150 ${lit === i ? `${on} scale-105` : off} ${phase === "input" ? "cursor-pointer hover:brightness-125" : "cursor-default"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default LightPath;
