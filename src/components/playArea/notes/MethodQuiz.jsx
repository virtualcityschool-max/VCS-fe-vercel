import { useState } from "react";
import { QUIZ, METHODS, scoreQuiz } from "../../../data/playArea/notes";
import { ACCENT_CLASSES } from "../../../data/playArea/games";

const MethodQuiz = ({ onSeeMethod }) => {
  const [picks, setPicks] = useState([]);
  const [step, setStep] = useState(0);
  const done = step >= QUIZ.length;
  const [first, second] = done ? scoreQuiz(picks) : [];

  const pick = (i) => {
    const next = [...picks];
    next[step] = i;
    setPicks(next);
    setStep(step + 1);
  };

  if (done) {
    const m = METHODS[first];
    const a = ACCENT_CLASSES[m.color];
    return (
      <div className={`p-6 md:p-8 rounded-3xl border ${a.ring} ${a.bg}`} role="status">
        <p className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${a.text}`}>Your best method for this</p>
        <h3 className="flex items-center gap-3 text-3xl font-black text-white mb-2">
          <i className={`${m.icon} ${a.text}`} aria-hidden="true" />{m.name}
        </h3>
        <p className="text-lg text-slate-200 mb-1">{m.tagline}.</p>
        <p className="text-base text-slate-300 mb-5">Also good: <strong className="text-white">{METHODS[second].name}</strong>. Many students take notes one way in class, then rewrite them another way at home.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => onSeeMethod(first)} className="px-5 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
            See how {m.name} works <i className="fas fa-arrow-up ml-2" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => { setPicks([]); setStep(0); }} className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
            Try for another subject
          </button>
        </div>
      </div>
    );
  }

  const q = QUIZ[step];
  return (
    <div className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-sm font-bold text-slate-300">Question {step + 1} of {QUIZ.length}</p>
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="text-sm font-bold text-cyan-300 hover:text-white">
            <i className="fas fa-arrow-left mr-1.5" aria-hidden="true" />Back
          </button>
        )}
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-6" aria-hidden="true">
        <div className="h-full bg-violet-500 transition-all" style={{ width: `${(step / QUIZ.length) * 100}%` }} />
      </div>
      <p className="text-xl md:text-2xl font-bold text-white mb-5">{q.q}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {q.options.map(([label], i) => (
          <button
            key={label}
            type="button"
            onClick={() => pick(i)}
            className={`text-left px-4 py-3.5 rounded-2xl border-2 text-base md:text-lg font-semibold transition ${picks[step] === i ? "border-violet-400 bg-violet-500/15 text-white" : "border-white/15 bg-white/[0.04] text-white hover:border-violet-400 hover:bg-violet-500/10"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MethodQuiz;
