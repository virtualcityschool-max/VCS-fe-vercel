import { useState } from "react";
import { useWidth } from "../utils";
import { SERIAL, TESTING_EFFECT } from "../../../data/playArea/revision";

// Serial position curve: start and end of a list are remembered best.
export const SerialPositionChart = () => {
  const [ref, W] = useWidth(500);
  const [hover, setHover] = useState(null);
  const H = 240;
  const M = { l: 44, r: 12, t: 24, b: 40 };
  const x = (i) => M.l + (i / (SERIAL.length - 1)) * (W - M.l - M.r);
  const y = (p) => M.t + (1 - p / 100) * (H - M.t - M.b);
  return (
    <div ref={ref} className="relative">
      <svg width={W} height={H} className="block" role="img" aria-label="Serial position curve: about 72% recall for the first word, around 32% in the middle, 82% for the last word.">
        {[0, 50, 100].map((p) => (
          <g key={p}>
            <line x1={M.l} x2={W - M.r} y1={y(p)} y2={y(p)} className="stroke-slate-500/25" />
            <text x={M.l - 8} y={y(p) + 5} textAnchor="end" fontSize="13" className="fill-slate-400">{p}%</text>
          </g>
        ))}
        <rect x={x(0) - 6} y={M.t} width={x(2) - x(0) + 12} height={H - M.t - M.b} rx="8" className="fill-emerald-500/10" />
        <rect x={x(12) - 6} y={M.t} width={x(14) - x(12) + 12} height={H - M.t - M.b} rx="8" className="fill-emerald-500/10" />
        <text x={x(1)} y={M.t - 6} textAnchor="middle" fontSize="13" fontWeight="700" className="fill-emerald-300">Start</text>
        <text x={x(13)} y={M.t - 6} textAnchor="middle" fontSize="13" fontWeight="700" className="fill-emerald-300">End</text>
        <text x={x(7)} y={y(32) + 26} textAnchor="middle" fontSize="13" fontWeight="700" className="fill-rose-300">Middle: forgotten most</text>
        <path d={SERIAL.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p)}`).join("")} fill="none" className="stroke-cyan-400" strokeWidth="2.5" strokeLinejoin="round" />
        {SERIAL.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p)}
            r={hover === i ? 7 : 5}
            className="fill-cyan-400 stroke-[#0b1224]"
            strokeWidth="2"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        <text x={(M.l + W - M.r) / 2} y={H - 8} textAnchor="middle" fontSize="13" className="fill-slate-400">Position of the word in the list (1 to 15)</text>
      </svg>
      {hover !== null && (
        <div className="absolute pointer-events-none rounded-lg border border-white/15 bg-[#0b1224]/95 px-2.5 py-1.5 text-sm text-white" style={{ left: Math.min(x(hover), W - 130), top: 0 }}>
          Word {hover + 1}: about {SERIAL[hover]}% remembered
        </div>
      )}
    </div>
  );
};

// Testing effect: reading again wins after 5 minutes, testing yourself wins after a week.
export const TestingEffectChart = () => {
  const [ref, W] = useWidth(500);
  const rowH = 64;
  const H = TESTING_EFFECT.length * rowH + 40;
  const labelW = W < 440 ? 0 : 170;
  const M = { l: labelW + 8, r: 44, t: 8 };
  const bx = (p) => (p / 100) * (W - M.l - M.r);
  return (
    <div ref={ref}>
      <div className="flex flex-wrap gap-4 mb-2 text-sm font-bold text-slate-200">
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-slate-400" aria-hidden="true" />After 5 minutes</span>
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-emerald-600" aria-hidden="true" />After 1 week</span>
      </div>
      <svg width={W} height={H} className="block" role="img" aria-label="Testing effect results">
        {TESTING_EFFECT.map((r, i) => {
          const top = M.t + i * rowH + (labelW ? 0 : 18);
          return (
            <g key={r.code}>
              <text x={labelW ? 0 : M.l} y={labelW ? top + 26 : top - 4} fontSize="14" fontWeight="700" className="fill-slate-200">{r.label}</text>
              <rect x={M.l} y={top + 4} width={bx(r.fiveMin)} height="16" rx="4" className="fill-slate-400" />
              <text x={M.l + bx(r.fiveMin) + 6} y={top + 17} fontSize="13" className="fill-slate-300">{r.fiveMin}%</text>
              <rect x={M.l} y={top + 24} width={bx(r.week)} height="16" rx="4" fill="#059669" />
              <text x={M.l + bx(r.week) + 6} y={top + 37} fontSize="13" fontWeight="700" className="fill-emerald-300">{r.week}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
