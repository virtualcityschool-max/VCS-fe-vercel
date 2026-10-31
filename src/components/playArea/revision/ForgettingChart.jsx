import { useRef, useState } from "react";
import { useWidth } from "../utils";
import { LINE, EBBINGHAUS, REVIEW_DAYS, EXAM_DAY, curvePoints, retention } from "../../../data/playArea/revision";

const MAX_DAY = 40;
const ORDER = ["none", "cram", "spaced"];

const ForgettingChart = () => {
  const svgRef = useRef(null);
  const [show, setShow] = useState({ none: true, cram: true, spaced: true });
  const [hover, setHover] = useState(null);
  const [table, setTable] = useState(false);
  const [boxRef, W] = useWidth();
  const narrow = W < 600;
  const H = narrow ? 300 : 380;
  const M = { l: 48, r: narrow ? 14 : 150, t: 20, b: 44 };
  const x = (d) => M.l + (d / MAX_DAY) * (W - M.l - M.r);
  const y = (p) => M.t + (1 - p / 100) * (H - M.t - M.b);
  const path = (pts) => pts.map(([d, p], i) => `${i ? "L" : "M"}${x(d).toFixed(1)},${y(p).toFixed(1)}`).join("");
  const TICKS = narrow ? [0, 7, 14, 21, 28, 35] : [0, 1, 3, 7, 14, 30, 35];

  const onMove = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const d = ((px - M.l) / (W - M.l - M.r)) * MAX_DAY;
    setHover(d < 0 || d > MAX_DAY ? null : Math.round(d * 2) / 2);
  };

  // Direct labels at the right edge, nudged apart so they never overlap.
  const labels = narrow ? [] : ORDER.filter((k) => show[k])
    .map((k) => ({ k, y: y(retention(k, MAX_DAY)) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) if (labels[i].y - labels[i - 1].y < 42) labels[i].y = labels[i - 1].y + 42;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4" role="group" aria-label="Show or hide lines">
        {ORDER.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={show[k]}
            onClick={() => setShow({ ...show, [k]: !show[k] })}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-bold transition ${show[k] ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-slate-400"}`}
          >
            <svg width="28" height="10" aria-hidden="true">
              <line x1="2" y1="5" x2="26" y2="5" stroke={LINE[k].color} strokeWidth="3" strokeDasharray={LINE[k].dash} strokeLinecap="round" />
            </svg>
            {LINE[k].label}
          </button>
        ))}
        <button type="button" onClick={() => setTable(!table)} className="ml-auto text-sm font-bold text-cyan-300 hover:text-white">
          <i className={`fas ${table ? "fa-chart-line" : "fa-table"} mr-1.5`} aria-hidden="true" />{table ? "Show chart" : "Show as table"}
        </button>
      </div>

      {table ? (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="text-left text-slate-300 border-b border-white/10">
                <th className="py-2 pr-4 font-bold">Day</th>
                {ORDER.map((k) => <th key={k} className="py-2 pr-4 font-bold">{LINE[k].label}</th>)}
              </tr>
            </thead>
            <tbody>
              {[1, 3, 7, 14, 30, 35].map((d) => (
                <tr key={d} className="border-b border-white/5 text-slate-200">
                  <td className="py-2 pr-4 font-bold">{d === EXAM_DAY ? "35 (exam)" : d}</td>
                  {ORDER.map((k) => <td key={k} className="py-2 pr-4">{Math.round(retention(k, d - 0.01))}%</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm text-slate-400 mt-2">Values just before that day's review.</p>
        </div>
      ) : (
        <div className="relative" ref={boxRef}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            width={W}
            height={H}
            className="block select-none"
            role="img"
            aria-label="Forgetting curve: memory falls fast without revision; spaced reviews keep it high until exam day."
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          >
            {[0, 25, 50, 75, 100].map((p) => (
              <g key={p}>
                <line x1={M.l} x2={W - M.r} y1={y(p)} y2={y(p)} className="stroke-slate-500/25" strokeWidth="1" />
                <text x={M.l - 8} y={y(p) + 5} textAnchor="end" className="fill-slate-400" fontSize="14">{p}%</text>
              </g>
            ))}
            {TICKS.map((d) => (
              <text key={d} x={x(d)} y={H - M.b + 22} textAnchor="middle" className="fill-slate-400" fontSize="14">{d}</text>
            ))}
            <text x={(M.l + W - M.r) / 2} y={H - 4} textAnchor="middle" className="fill-slate-400" fontSize="14">Days after first learning the topic</text>

            <line x1={x(EXAM_DAY)} x2={x(EXAM_DAY)} y1={M.t} y2={H - M.b} className="stroke-indigo-400" strokeWidth="2" strokeDasharray="4 4" />
            <text x={x(EXAM_DAY) + (narrow ? -6 : 6)} y={narrow ? H - M.b - 8 : M.t + 14} textAnchor={narrow ? "end" : "start"} className="fill-indigo-300" fontSize="14" fontWeight="700">Exam day</text>

            {show.spaced && REVIEW_DAYS.map((d) => (
              <line key={d} x1={x(d)} x2={x(d)} y1={y(100)} y2={H - M.b} className="stroke-emerald-500/20" strokeWidth="1" />
            ))}

            {ORDER.filter((k) => show[k]).map((k) => (
              <path key={k} d={path(curvePoints(k, MAX_DAY))} fill="none" stroke={LINE[k].color} strokeWidth="2.5" strokeDasharray={LINE[k].dash} strokeLinejoin="round" strokeLinecap="round" />
            ))}
            {show.spaced && REVIEW_DAYS.map((d) => (
              <circle key={d} cx={x(d)} cy={y(100)} r="5" fill={LINE.spaced.color} className="stroke-[#0b1224]" strokeWidth="2" />
            ))}
            {show.none && EBBINGHAUS.slice(1).map(([d, p]) => (
              <circle key={d} cx={x(d)} cy={y(p)} r="4.5" fill={LINE.none.color} className="stroke-[#0b1224]" strokeWidth="2" />
            ))}

            {labels.map(({ k, y: ly }) => (
              <text key={k} x={W - M.r + 10} y={ly + 5} fontSize="14" fontWeight="700" className="fill-slate-200">
                {LINE[k].short}
                <tspan x={W - M.r + 10} dy="16" className="fill-slate-400" fontWeight="400">{Math.round(retention(k, MAX_DAY))}% at day 40</tspan>
              </text>
            ))}

            {hover !== null && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={M.t} y2={H - M.b} className="stroke-slate-300/60" strokeWidth="1" />
                {ORDER.filter((k) => show[k]).map((k) => (
                  <circle key={k} cx={x(hover)} cy={y(retention(k, hover))} r="5" fill={LINE[k].color} className="stroke-white" strokeWidth="2" />
                ))}
              </g>
            )}
          </svg>
          {hover !== null && (
            <div
              className="absolute top-2 pointer-events-none rounded-xl border border-white/15 bg-[#0b1224]/95 px-3 py-2 text-sm shadow-lg"
              style={{ left: `${Math.min(70, (x(hover) / W) * 100)}%` }}
            >
              <p className="font-bold text-white mb-1">Day {hover}{hover === EXAM_DAY ? " — exam" : ""}</p>
              {ORDER.filter((k) => show[k]).map((k) => (
                <p key={k} className="text-slate-200">
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: LINE[k].color }} aria-hidden="true" />
                  {Math.round(retention(k, hover))}% · {LINE[k].label}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="text-sm text-slate-400 mt-3">
        Red dots: Ebbinghaus's own results (1885). The other lines are an illustration built on his curve — real memory varies by person and topic, but the pattern holds.
      </p>
    </div>
  );
};

export default ForgettingChart;
