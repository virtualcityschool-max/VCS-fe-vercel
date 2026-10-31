import { useId } from "react";
import { cellText as describe } from "../../../data/playArea/reasoning";

// Shapes are drawn in the text colour (currentColor), so they work in day and night mode.
const poly = (cx, cy, r, n, start = -90) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((start + (360 / n) * i) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

const Shape = ({ shape, cx, cy, r, fill }) => {
  const common = { fill, stroke: "currentColor", strokeWidth: 2.2, strokeLinejoin: "round" };
  if (shape === "circle") return <circle cx={cx} cy={cy} r={r} {...common} />;
  if (shape === "square") return <rect x={cx - r * 0.85} y={cy - r * 0.85} width={r * 1.7} height={r * 1.7} {...common} />;
  if (shape === "triangle") return <polygon points={poly(cx, cy + r * 0.15, r * 1.1, 3)} {...common} />;
  if (shape === "diamond") return <polygon points={poly(cx, cy, r * 1.05, 4)} {...common} />;
  if (shape === "pentagon") return <polygon points={poly(cx, cy, r, 5)} {...common} />;
  if (shape === "arrow") {
    const p = [[0, -1], [0.7, -0.1], [0.28, -0.1], [0.28, 0.9], [-0.28, 0.9], [-0.28, -0.1], [-0.7, -0.1]];
    return <polygon points={p.map(([x, y]) => `${cx + x * r},${cy + y * r}`).join(" ")} {...common} />;
  }
  return null;
};

const Stripes = ({ id }) => (
  <defs>
    <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" strokeWidth="2" />
    </pattern>
  </defs>
);

// One cell of a matrix: 1–3 shapes with a fill.
export const MatrixCell = ({ cell, size = 84, label }) => {
  const id = useId().replace(/:/g, "");
  const fill = cell.fill === "solid" ? "currentColor" : cell.fill === "stripes" ? `url(#st${id})` : "none";
  const r = cell.count === 1 ? 17 : cell.count === 2 ? 13 : 11;
  const xs = cell.count === 1 ? [42] : cell.count === 2 ? [26, 58] : [17, 42, 67];
  return (
    <svg viewBox="0 0 84 84" width={size} height={size} role="img" aria-label={label}>
      <Stripes id={`st${id}`} />
      {xs.map((x) => <Shape key={x} shape={cell.shape} cx={x} cy={42} r={r} fill={fill} />)}
    </svg>
  );
};


export const MatrixGrid = ({ grid }) => (
  <div className="inline-grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-white/[0.04] border border-white/15 text-slate-100">
    {grid.flatMap((row, r) => row.map((cell, c) => (
      <div key={`${r}${c}`} className="w-[76px] h-[76px] sm:w-[92px] sm:h-[92px] rounded-xl border border-white/10 bg-[#0b1224]/60 flex items-center justify-center">
        {r === 2 && c === 2
          ? <span className="text-3xl font-black text-amber-300" aria-label="missing picture">?</span>
          : <MatrixCell cell={cell} size={70} label={describe(cell)} />}
      </div>
    )))}
  </div>
);

// A polyomino drawn from grid cells.
export const PolyShape = ({ cells, size = 96, label = "shape" }) => {
  const w = Math.max(...cells.map((c) => c[0])) + 1;
  const h = Math.max(...cells.map((c) => c[1])) + 1;
  const n = Math.max(w, h);
  const u = 80 / n;
  const ox = (84 - w * u) / 2;
  const oy = (84 - h * u) / 2;
  return (
    <svg viewBox="0 0 84 84" width={size} height={size} role="img" aria-label={label}>
      {cells.map(([x, y]) => (
        <rect key={`${x},${y}`} x={ox + x * u + 1} y={oy + y * u + 1} width={u - 2} height={u - 2} rx="2" fill="currentColor" fillOpacity="0.85" />
      ))}
    </svg>
  );
};

// One frame of an abstract sequence: a turning shape and dots in one corner.
const CORNERS = [[14, 14], [70, 14], [70, 70], [14, 70]];
export const SeqFrame = ({ frame, size = 84, label }) => {
  const [dx, dy] = CORNERS[frame.dot];
  return (
    <svg viewBox="0 0 84 84" width={size} height={size} role="img" aria-label={label || `shape turned ${frame.angle} degrees, ${frame.count} dot${frame.count > 1 ? "s" : ""} in corner ${frame.dot + 1}`}>
      <rect x="2" y="2" width="80" height="80" rx="10" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      <g transform={`rotate(${frame.angle} 42 42)`}>
        <Shape shape={frame.shape} cx={42} cy={42} r={18} fill="none" />
        <circle cx={42} cy={42 - 18} r="3.2" fill="currentColor" />
      </g>
      {Array.from({ length: frame.count }, (_, i) => (
        <circle key={i} cx={dx + (dx < 42 ? i * 7 : -i * 7)} cy={dy} r="4" fill="currentColor" />
      ))}
    </svg>
  );
};
