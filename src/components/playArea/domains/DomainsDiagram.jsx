import { DOMAINS, DOMAIN_ORDER } from "../../../data/playArea/domains";
import { ACCENT_CLASSES } from "../../../data/playArea/games";

// Three overlapping circles: Head, Hands, Heart. The overlap is the whole person.
const CIRCLES = {
  head: { cx: 150, cy: 150, lx: 104, ly: 108, tone: "text-violet-400" },
  hands: { cx: 270, cy: 150, lx: 316, ly: 108, tone: "text-amber-400" },
  heart: { cx: 210, cy: 252, lx: 210, ly: 318, tone: "text-rose-400" },
};

const DomainsDiagram = ({ active, onChange }) => {
  const d = DOMAINS[active];
  const a = ACCENT_CLASSES[d.color];
  return (
    <div className="grid lg:grid-cols-[minmax(0,460px)_1fr] gap-8 items-center">
      <figure>
        <svg viewBox="0 0 420 400" className="w-full max-w-[460px] mx-auto" role="group" aria-label="Head, Hands and Heart: three overlapping circles. Where all three meet is the whole person.">
          {DOMAIN_ORDER.map((k) => {
            const c = CIRCLES[k];
            const on = k === active;
            return (
              <g
                key={k}
                className={`${c.tone} cursor-pointer focus:outline-none`}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`${DOMAINS[k].short}: ${DOMAINS[k].name}`}
                onClick={() => onChange(k)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onChange(k))}
              >
                <circle cx={c.cx} cy={c.cy} r="118" fill="currentColor" fillOpacity={on ? 0.32 : 0.14} stroke="currentColor" strokeWidth={on ? 4 : 2} />
                <text x={c.lx} y={c.ly} textAnchor="middle" fill="currentColor" className="font-black" fontSize="26">{DOMAINS[k].short}</text>
                <text x={c.lx} y={c.ly + 24} textAnchor="middle" fill="currentColor" fontSize="17" fontWeight="700">{DOMAINS[k].name}</text>
              </g>
            );
          })}
          <g className="text-white" pointerEvents="none">
            <text x="210" y="182" textAnchor="middle" fill="currentColor" fontSize="17" fontWeight="800">Whole</text>
            <text x="210" y="202" textAnchor="middle" fill="currentColor" fontSize="17" fontWeight="800">person</text>
          </g>
        </svg>
        <figcaption className="text-sm text-slate-300 text-center mt-2">Tap a circle. Good teaching grows all three.</figcaption>
      </figure>

      <div className={`p-6 md:p-8 rounded-3xl border ${a.ring} ${a.bg}`} aria-live="polite">
        <div className="flex items-center gap-4 mb-4">
          <span className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${a.icon}`}>
            <i className={d.icon} aria-hidden="true" />
          </span>
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.2em] ${a.text}`}>{d.tech}</p>
            <h3 className="text-2xl md:text-3xl font-black text-white">{d.short} = {d.name}</h3>
          </div>
        </div>
        <p className="text-lg text-white font-semibold mb-3">{d.question}</p>
        <p className="text-base text-slate-200 leading-relaxed mb-5">{d.summary}</p>
        <dl className="grid sm:grid-cols-3 gap-4">
          {[
            ["Example", d.example],
            ["Quick test", d.test],
            ["How it's checked", d.checked],
          ].map(([t, v]) => (
            <div key={t} className="p-4 rounded-2xl border border-white/10 bg-white/[0.04]">
              <dt className={`text-xs font-black uppercase tracking-widest mb-1.5 ${a.text}`}>{t}</dt>
              <dd className="text-base text-slate-100 leading-snug">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default DomainsDiagram;
