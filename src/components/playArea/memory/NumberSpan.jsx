import { useRef, useState } from "react";
import { NORMS } from "../../../data/playArea/memory";
import { useTimers, rand } from "./utils";
import { GameOver, GhostButton, PrimaryButton, Stat, Status } from "./shared";

const ON_MS = 800;
const GAP_MS = 250;
const TRIES = 2; // two misses at the same length ends the game

const makeDigits = (n) => {
  const d = [];
  while (d.length < n) {
    const x = rand(10);
    if (x !== d[d.length - 1]) d.push(x);
  }
  return d;
};

const NumberSpan = ({ bestF, bestB, onResult, onExit }) => {
  const { later, clearAll } = useTimers();
  const inputRef = useRef(null);
  const [mode, setMode] = useState(null); // "F" forwards | "B" backwards
  const [phase, setPhase] = useState("ready"); // ready | show | input | right | wrong | over
  const [digits, setDigits] = useState([]);
  const [shown, setShown] = useState(null); // index of digit on screen
  const [typed, setTyped] = useState("");
  const [misses, setMisses] = useState(0);
  const [longest, setLongest] = useState(0);
  const [result, setResult] = useState(null);

  const best = mode === "B" ? bestB : bestF;
  const answer = mode === "B" ? [...digits].reverse() : digits;

  const show = (n) => {
    const d = makeDigits(n);
    setDigits(d);
    setTyped("");
    setShown(null);
    setPhase("show");
    d.forEach((_, i) => {
      later(() => setShown(i), 600 + i * (ON_MS + GAP_MS));
      later(() => setShown(null), 600 + i * (ON_MS + GAP_MS) + ON_MS);
    });
    later(() => {
      setPhase("input");
      setTimeout(() => inputRef.current?.focus(), 30);
    }, 600 + n * (ON_MS + GAP_MS));
  };

  const start = (m) => {
    clearAll();
    setMode(m);
    setMisses(0);
    setLongest(0);
    setResult(null);
    show(m === "B" ? 2 : 3);
  };

  const submit = (e) => {
    e.preventDefault();
    if (phase !== "input" || typed.length !== digits.length) return;
    const n = digits.length;
    if (typed === answer.join("")) {
      setLongest(n);
      setMisses(0);
      setPhase("right");
      later(() => show(n + 1), 1100);
    } else if (misses + 1 < TRIES) {
      setMisses(misses + 1);
      setPhase("wrong");
      later(() => show(n), 2200);
    } else {
      const isNewBest = onResult(mode, longest);
      setResult({ score: longest, isNewBest });
      setPhase("over");
    }
  };

  if (!mode) {
    return (
      <div className="text-center py-4">
        <p className="text-lg text-slate-200 mb-6 max-w-xl mx-auto">
          Digits appear one at a time. When they stop, type them in. Each correct answer adds one more digit.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[
            ["F", "Forwards", "Type them in the order you saw.", "fas fa-arrow-right", bestF],
            ["B", "Backwards", "Type them in reverse — much harder!", "fas fa-arrow-left", bestB],
          ].map(([m, name, text, icon, b]) => (
            <button
              key={m}
              type="button"
              onClick={() => start(m)}
              className="p-6 rounded-3xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-left transition"
            >
              <i className={`${icon} text-2xl text-indigo-300 mb-3`} aria-hidden="true" />
              <span className="block text-lg font-bold text-white">{name}</span>
              <span className="block text-sm text-slate-300">{text}</span>
              <span className="block text-sm font-bold text-amber-300 mt-2">Best: {b ? `${b} digits` : "not played yet"}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "over") {
    return (
      <GameOver
        title={`Longest number you remembered ${mode === "B" ? "backwards" : "forwards"}`}
        score={result.score}
        unit="digits"
        best={Math.max(best || 0, result.score)}
        isNewBest={result.isNewBest}
        note={mode === "B" ? NORMS.spanB : NORMS.spanF}
        shareText={`I remembered ${result.score} digits${mode === "B" ? " backwards" : ""} on the VCS Memory Challenge!`}
        onAgain={() => start(mode)}
        onExit={onExit}
      >
        <button type="button" onClick={() => start(mode === "B" ? "F" : "B")} className="text-base font-bold text-cyan-300 hover:text-white underline underline-offset-4">
          Try {mode === "B" ? "forwards" : "backwards"} instead
        </button>
      </GameOver>
    );
  }

  const status = {
    show: ["info", "Remember the digits…"],
    input: ["go", mode === "B" ? "Type them BACKWARDS" : "Type them in order"],
    right: ["good", "Correct! One more digit…"],
    wrong: ["bad", `Not quite — it was ${answer.join(" ")}. One more try.`],
  }[phase] || ["info", ""];

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5">
        <Stat label="Digits" value={digits.length} color="text-indigo-300" />
        <Stat label="Mode" value={mode === "B" ? "← Back" : "Fwd →"} color="text-cyan-300" />
        <Stat label="Best" value={best || "–"} color="text-amber-300" />
      </div>
      <Status tone={status[0]}>{status[1]}</Status>
      <div className="flex items-center justify-center h-44 md:h-56 my-4" aria-live="polite">
        {phase === "show" && shown !== null && (
          <span key={shown} className="text-8xl md:text-9xl font-black text-white tabular-nums">{digits[shown]}</span>
        )}
        {phase === "show" && shown === null && <span className="w-4 h-4 rounded-full bg-indigo-400/60" aria-hidden="true" />}
        {(phase === "input" || phase === "right" || phase === "wrong") && (
          <form onSubmit={submit} className="flex flex-col items-center gap-4 w-full">
            <label htmlFor="span-answer" className="sr-only">Type the digits</label>
            <input
              id="span-answer"
              ref={inputRef}
              inputMode="numeric"
              autoComplete="off"
              value={typed}
              disabled={phase !== "input"}
              maxLength={digits.length}
              onChange={(e) => setTyped(e.target.value.replace(/\D/g, ""))}
              className={`w-full max-w-md text-center text-4xl md:text-5xl font-black tracking-[0.3em] tabular-nums rounded-2xl border-2 bg-white/5 text-white py-4 outline-none ${
                phase === "right" ? "border-emerald-400" : phase === "wrong" ? "border-rose-400" : "border-indigo-400/60 focus:border-indigo-300"
              }`}
            />
            <PrimaryButton type="submit" disabled={phase !== "input" || typed.length !== digits.length}>
              Check
            </PrimaryButton>
          </form>
        )}
      </div>
      <div className="text-center">
        <GhostButton onClick={() => { clearAll(); setMode(null); setPhase("ready"); }}>Change mode</GhostButton>
      </div>
    </div>
  );
};

export default NumberSpan;
