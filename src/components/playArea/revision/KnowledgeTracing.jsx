import { useState } from "react";
import { useWidth } from "../utils";
import { BKT_DEFAULTS, BKT_PARAMS, MASTERY, bktStep, bktTrace } from "../../../data/playArea/revision";

const M = { l: 52, r: 24, t: 24, b: 40 };
const pct = (p) => Math.floor(p * 100 + 1e-9); // round down: never claims 100% certainty

const PRESETS = [
  { name: "Steady learner", answers: [false, true, false, true, true, true] },
  { name: "Lucky guess at the start", answers: [true, false, false, true, true, true, true] },
  { name: "Careless slip", answers: [true, true, true, false, true, true] },
];

// How many correct answers in a row are still needed to reach mastery.
const toMastery = (pL, p) => {
  let n = 0;
  let v = pL;
  while (v < MASTERY && n < 30) {
    v = bktStep(v, true, p);
    n += 1;
  }
  return n;
};

const KnowledgeTracing = () => {
  const [answers, setAnswers] = useState([]);
  const [params, setParams] = useState(BKT_DEFAULTS);
  const [boxRef, W] = useWidth();
  const H = W < 600 ? 260 : 300;
  const trace = bktTrace(answers, params);
  const now = trace[trace.length - 1];
  const prev = trace[trace.length - 2];
  const mastered = now >= MASTERY;
  const last = answers[answers.length - 1];
  const steps = Math.max(8, answers.length);
  const x = (i) => M.l + (i / steps) * (W - M.l - M.r);
  const y = (p) => M.t + (1 - p) * (H - M.t - M.b);
  const firstMastered = trace.findIndex((p) => p >= MASTERY);

  return (
    <div className="grid xl:grid-cols-[1.4fr_1fr] gap-6">
      <div>
        <div className="flex flex-wrap gap-3 mb-4">
          <button type="button" onClick={() => setAnswers([...answers, true])} className="px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold transition">
            <i className="fas fa-check mr-2" aria-hidden="true" />I got it right
          </button>
          <button type="button" onClick={() => setAnswers([...answers, false])} className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-base font-bold transition">
            <i className="fas fa-xmark mr-2" aria-hidden="true" />I got it wrong
          </button>
          <button type="button" onClick={() => setAnswers(answers.slice(0, -1))} disabled={!answers.length} className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition disabled:opacity-40">
            Undo
          </button>
          <button type="button" onClick={() => setAnswers([])} className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition">
            Reset
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-bold text-slate-300">Try an example:</span>
          {PRESETS.map((p) => (
            <button key={p.name} type="button" onClick={() => setAnswers(p.answers)} className="px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 text-sm font-bold hover:bg-cyan-500/20">
              {p.name}
            </button>
          ))}
        </div>

        <div ref={boxRef}>
        <svg width={W} height={H} className="block" role="img" aria-label={`Chance you have mastered the skill: ${pct(now)}% after ${answers.length} answers.`}>
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <line x1={M.l} x2={W - M.r} y1={y(p)} y2={y(p)} className="stroke-slate-500/25" />
              <text x={M.l - 8} y={y(p) + 5} textAnchor="end" fontSize="14" className="fill-slate-400">{pct(p)}%</text>
            </g>
          ))}
          <rect x={M.l} y={y(1)} width={W - M.l - M.r} height={y(MASTERY) - y(1)} className="fill-emerald-500/15" />
          <line x1={M.l} x2={W - M.r} y1={y(MASTERY)} y2={y(MASTERY)} className="stroke-emerald-400" strokeWidth="2" strokeDasharray="6 4" />
          <text x={W - M.r - 4} y={y(MASTERY) + 18} textAnchor="end" fontSize="14" fontWeight="700" className="fill-emerald-300">Mastered (95%)</text>
          {[...Array(steps + 1).keys()].map((i) => (
            <text key={i} x={x(i)} y={H - M.b + 22} textAnchor="middle" fontSize="14" className="fill-slate-400">{i === 0 ? "Start" : i}</text>
          ))}
          <path d={trace.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p)}`).join("")} fill="none" className="stroke-violet-400" strokeWidth="2.5" strokeLinejoin="round" />
          {trace.map((p, i) => {
            const a = answers[i - 1];
            return (
              <g key={i}>
                <circle cx={x(i)} cy={y(p)} r="9" className={i === 0 ? "fill-violet-400" : a ? "fill-emerald-500" : "fill-rose-500"} stroke="#0b1224" strokeWidth="2" />
                {i > 0 && (
                  <text x={x(i)} y={y(p) + 4.5} textAnchor="middle" fontSize="12" fontWeight="900" fill="#fff" aria-hidden="true">{a ? "✓" : "✗"}</text>
                )}
                {(i === trace.length - 1 || i === firstMastered) && (
                  <text x={x(i)} y={y(p) - 16} textAnchor="middle" fontSize="14" fontWeight="700" className="fill-slate-100">{pct(p)}%</text>
                )}
              </g>
            );
          })}
        </svg>
        </div>
        <p className="text-sm text-slate-400 mt-1">Line: the chance you have mastered the skill. Green dot = right answer, red dot = wrong answer.</p>
      </div>

      <div className="space-y-4">
        <div className={`p-5 rounded-3xl border ${mastered ? "border-emerald-500/40 bg-emerald-500/10" : "border-violet-500/30 bg-violet-500/10"}`} role="status" aria-live="polite">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 mb-1">Chance you've mastered it</p>
          <p className={`text-5xl font-black mb-2 ${mastered ? "text-emerald-300" : "text-white"}`}>{pct(now)}%</p>
          <p className="text-base text-slate-200 leading-relaxed">
            {!answers.length && "Answer a few practice questions on one skill (for example: solving simultaneous equations) and press a button after each one."}
            {answers.length > 0 && last && `Right answer: up from ${pct(prev)}% to ${pct(now)}%. Not straight to 100%, because a right answer could be a lucky guess (${pct(params.G)}% chance).`}
            {answers.length > 0 && !last && `Wrong answer: down from ${pct(prev)}% to ${pct(now)}%. Not to zero, because people who know it still slip sometimes (${pct(params.S)}% chance).`}
          </p>
          <p className="text-base font-bold mt-3 text-amber-300">
            {mastered ? "Mastered! Move on — and review it again in a few days." : `About ${toMastery(now, params)} more right answers in a row to reach mastery.`}
          </p>
        </div>
        <details className="p-5 rounded-3xl border border-white/10 bg-white/[0.03]">
          <summary className="cursor-pointer text-base font-bold text-white">Change the 4 numbers BKT uses</summary>
          <div className="space-y-4 mt-4">
            {BKT_PARAMS.map((p) => (
              <label key={p.key} className="block">
                <span className="flex justify-between text-sm font-bold text-slate-200">
                  <span>{p.name} — P({p.key === "L0" ? "L₀" : p.key})</span>
                  <span className="text-cyan-300">{pct(params[p.key])}%</span>
                </span>
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step="0.01"
                  value={params[p.key]}
                  onChange={(e) => setParams({ ...params, [p.key]: Number(e.target.value) })}
                  className="w-full accent-violet-500"
                />
                <span className="block text-sm text-slate-400">{p.help}</span>
              </label>
            ))}
            <button type="button" onClick={() => setParams(BKT_DEFAULTS)} className="text-sm font-bold text-cyan-300 hover:text-white">Reset numbers</button>
          </div>
        </details>
      </div>
    </div>
  );
};

export default KnowledgeTracing;
