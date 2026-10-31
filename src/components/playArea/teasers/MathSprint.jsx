import { useEffect, useRef, useState } from "react";
import { shareLink } from "../../../data/playArea/teasers";
import { rand, nowMs } from "../utils";
import { GameOver, PrimaryButton, Stat, Status } from "../shared";

const SECONDS = 60;
const between = (lo, hi) => lo + rand(hi - lo + 1);

// Questions get harder as the score grows.
const makeQuestion = (score) => {
  const level = score < 5 ? 0 : score < 12 ? 1 : 2;
  const kind = rand(level === 0 ? 2 : 4);
  if (kind === 0) {
    const max = [20, 100, 200][level];
    const a = between(1, max / 2);
    const b = between(1, max / 2);
    return { text: `${a} + ${b}`, answer: a + b };
  }
  if (kind === 1) {
    const max = [20, 100, 200][level];
    const a = between(2, max);
    const b = between(1, a - 1);
    return { text: `${a} − ${b}`, answer: a - b };
  }
  const top = level === 1 ? 10 : 12;
  const a = between(2, top);
  const b = between(2, top);
  if (kind === 2) return { text: `${a} × ${b}`, answer: a * b };
  return { text: `${a * b} ÷ ${a}`, answer: b };
};

const MathSprint = ({ best, onResult, onExit }) => {
  const inputRef = useRef(null);
  const doneRef = useRef(false);
  const [phase, setPhase] = useState("ready"); // ready | run | over
  const [q, setQ] = useState(null);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState(null); // "good" | "bad"
  const [endAt, setEndAt] = useState(0);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState(null);

  // Latest values for the clock callback.
  const live = useRef({ score: 0, wrong: 0, onResult });
  useEffect(() => {
    live.current.onResult = onResult;
  });

  // Clock: ends the round and saves the score when time is up.
  useEffect(() => {
    if (phase !== "run") return undefined;
    const id = setInterval(() => {
      const t = nowMs();
      setNow(t);
      if (t >= endAt && !doneRef.current) {
        doneRef.current = true;
        const { score: s, wrong: w } = live.current;
        const isNewBest = live.current.onResult(s);
        setResult({ score: s, wrong: w, isNewBest });
        setPhase("over");
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase, endAt]);

  const start = () => {
    const t = nowMs();
    doneRef.current = false;
    live.current.score = 0;
    live.current.wrong = 0;
    setScore(0);
    setWrong(0);
    setTyped("");
    setResult(null);
    setQ(makeQuestion(0));
    setNow(t);
    setEndAt(t + SECONDS * 1000);
    setPhase("run");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const next = (good) => {
    const s = good ? score + 1 : score;
    if (good) setScore(s);
    else setWrong(wrong + 1);
    live.current.score = s;
    live.current.wrong = good ? wrong : wrong + 1;
    setFlash(good ? "good" : "bad");
    setTimeout(() => setFlash(null), 250);
    setTyped("");
    setQ(makeQuestion(s));
  };

  const onType = (v) => {
    const clean = v.replace(/[^\d]/g, "");
    setTyped(clean);
    if (clean !== "" && Number(clean) === q.answer) next(true);
  };

  const submit = (e) => {
    e.preventDefault();
    if (phase !== "run" || typed === "") return;
    next(Number(typed) === q.answer);
  };

  if (phase === "over" && result) {
    return (
      <GameOver
        title="Correct answers in 60 seconds"
        score={result.score}
        unit="correct"
        best={Math.max(best || 0, result.score)}
        isNewBest={result.isNewBest}
        note={result.wrong ? `${result.wrong} wrong. Speed comes from practice — try again and beat your score!` : "No mistakes — brilliant!"}
        shareText={`I got ${result.score} right in the 60-second Maths Sprint on VCS Brain Teasers!`}
        shareLink={shareLink}
        onAgain={start}
        onExit={onExit}
      />
    );
  }

  const left = phase === "run" ? Math.max(0, Math.ceil((endAt - now) / 1000)) : SECONDS;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5">
        <Stat label="Score" value={score} color="text-emerald-300" />
        <Stat label="Seconds" value={left} color={left <= 10 ? "text-rose-300" : "text-cyan-300"} />
        <Stat label="Best" value={best || "–"} color="text-amber-300" />
      </div>
      {phase === "ready" ? (
        <div className="text-center py-6">
          <Status tone="info">Answer as many sums as you can in 60 seconds.</Status>
          <p className="text-base text-slate-300 mb-6 mt-2">Type the answer — it moves on by itself when you're right. Press Enter to skip.</p>
          <PrimaryButton onClick={start}>
            <i className="fas fa-play mr-2" aria-hidden="true" /> Start the sprint
          </PrimaryButton>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col items-center gap-5 py-4">
          <div className="w-full max-w-md h-2 rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
            <div className="h-full bg-cyan-400 transition-all duration-200" style={{ width: `${(left / SECONDS) * 100}%` }} />
          </div>
          <p className={`text-5xl md:text-7xl font-black tabular-nums transition-colors ${flash === "good" ? "text-emerald-300" : flash === "bad" ? "text-rose-300" : "text-white"}`}>
            {q?.text} = ?
          </p>
          <label htmlFor="sprint-answer" className="sr-only">Your answer</label>
          <input
            id="sprint-answer"
            ref={inputRef}
            inputMode="numeric"
            autoComplete="off"
            value={typed}
            onChange={(e) => onType(e.target.value)}
            className="w-48 text-center text-4xl font-black tabular-nums rounded-2xl border-2 border-emerald-400/60 focus:border-emerald-300 bg-white/5 text-white py-3 outline-none"
          />
        </form>
      )}
    </div>
  );
};

export default MathSprint;
