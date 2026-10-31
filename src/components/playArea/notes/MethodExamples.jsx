import { METHODS, METHOD_ORDER, EXAMPLE_NOTE } from "../../../data/playArea/notes";
import { ACCENT_CLASSES } from "../../../data/playArea/games";

// A lined "paper" look that works in day and night mode.
const Paper = ({ title, children }) => (
  <div className="min-w-0 rounded-2xl border border-white/15 bg-white/[0.04] p-4 md:p-5">
    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">{title}</p>
    {children}
  </div>
);

const CornellExample = () => (
  <Paper title={`Cornell example · ${EXAMPLE_NOTE.subject}: ${EXAMPLE_NOTE.title}`}>
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,5fr)] border border-white/15 rounded-xl overflow-hidden">
      <div className="px-3 py-2 bg-violet-500/15 text-xs font-black uppercase tracking-wider text-violet-300 border-r border-white/15">Questions</div>
      <div className="px-3 py-2 bg-white/[0.04] text-xs font-black uppercase tracking-wider text-slate-300">Notes</div>
      {EXAMPLE_NOTE.rows.slice(0, 4).map((r) => (
        <div key={r.cue} className="contents">
          <div className="px-3 py-2.5 text-sm font-bold text-violet-200 border-t border-r border-white/10">{r.cue}</div>
          <div className="px-3 py-2.5 text-sm text-slate-200 border-t border-white/10">{r.note}</div>
        </div>
      ))}
      <div className="col-span-2 px-3 py-2.5 border-t-2 border-violet-500/40 bg-violet-500/5">
        <p className="text-xs font-black uppercase tracking-wider text-violet-300 mb-1">Summary</p>
        <p className="text-sm text-slate-200">{EXAMPLE_NOTE.summary}</p>
      </div>
    </div>
  </Paper>
);

const OutlineExample = () => (
  <Paper title="Outline example · Biology: Cell structure">
    <ol className="space-y-2 text-base text-slate-200">
      <li>
        <strong className="text-white">1. Animal and plant cells both have</strong>
        <ul className="ml-6 mt-1 space-y-1 list-disc">
          <li>Nucleus — contains DNA, controls the cell</li>
          <li>Cytoplasm — where most reactions happen</li>
          <li>Cell membrane — controls what enters and leaves</li>
          <li>Mitochondria — site of aerobic respiration</li>
          <li>Ribosomes — make proteins</li>
        </ul>
      </li>
      <li>
        <strong className="text-white">2. Only plant cells have</strong>
        <ul className="ml-6 mt-1 space-y-1 list-disc">
          <li>Cell wall — cellulose, supports the cell</li>
          <li>Chloroplasts — photosynthesis</li>
          <li>Large permanent vacuole — cell sap, keeps cell firm</li>
        </ul>
      </li>
    </ol>
  </Paper>
);

const BRANCHES = [
  { title: "Types", items: ["Contact: friction, tension", "Non-contact: gravity, magnetic"], pos: "md:col-start-1 md:row-start-1" },
  { title: "Newton's laws", items: ["1: no resultant force → no change", "2: F = m × a", "3: equal and opposite pairs"], pos: "md:col-start-3 md:row-start-1" },
  { title: "Units", items: ["Force in newtons (N)", "Weight = mass × g", "g ≈ 9.8 N/kg"], pos: "md:col-start-1 md:row-start-3" },
  { title: "Effects", items: ["Change speed", "Change direction", "Change shape"], pos: "md:col-start-3 md:row-start-3" },
];

const MindMapExample = () => (
  <Paper title="Mind map example · Physics: Forces">
    <div className="relative grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-3 md:gap-4">
      <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
        {[[150, 150, 50, 50], [150, 150, 250, 50], [150, 150, 50, 250], [150, 150, 250, 250]].map(([a, b, c, d]) => (
          <line key={`${c}${d}`} x1={a} y1={b} x2={c} y2={d} className="stroke-emerald-400/50" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="relative md:col-start-2 md:row-start-2 flex items-center justify-center">
        <span className="px-5 py-4 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-lg font-black text-white text-center">Forces</span>
      </div>
      {BRANCHES.map((b) => (
        <div key={b.title} className={`relative rounded-xl border border-emerald-500/30 bg-[#0b1224]/90 p-3 ${b.pos}`}>
          <p className="text-sm font-black text-emerald-300 mb-1">{b.title}</p>
          <ul className="space-y-0.5 text-sm text-slate-200">
            {b.items.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </div>
      ))}
    </div>
  </Paper>
);

const ChartExample = () => (
  <Paper title="Charting example · Chemistry: Periodic table groups">
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse min-w-[520px]">
        <thead>
          <tr className="bg-amber-500/15 text-amber-200">
            {["Group", "Name", "Properties", "Reactivity down the group", "Example"].map((h) => (
              <th key={h} className="px-3 py-2 font-black border border-white/10">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-slate-200">
          <tr><td className="px-3 py-2 border border-white/10 font-bold">1</td><td className="px-3 py-2 border border-white/10">Alkali metals</td><td className="px-3 py-2 border border-white/10">Soft, low density, react with water → alkali + H₂</td><td className="px-3 py-2 border border-white/10">Increases</td><td className="px-3 py-2 border border-white/10">Sodium (Na)</td></tr>
          <tr><td className="px-3 py-2 border border-white/10 font-bold">7</td><td className="px-3 py-2 border border-white/10">Halogens</td><td className="px-3 py-2 border border-white/10">Diatomic non-metals, coloured, form salts</td><td className="px-3 py-2 border border-white/10">Decreases</td><td className="px-3 py-2 border border-white/10">Chlorine (Cl₂)</td></tr>
          <tr><td className="px-3 py-2 border border-white/10 font-bold">0 / 18</td><td className="px-3 py-2 border border-white/10">Noble gases</td><td className="px-3 py-2 border border-white/10">Full outer shell, colourless gases</td><td className="px-3 py-2 border border-white/10">Unreactive</td><td className="px-3 py-2 border border-white/10">Argon (Ar)</td></tr>
        </tbody>
      </table>
    </div>
  </Paper>
);

const SentenceExample = () => (
  <Paper title="Sentence example · Economics: Demand">
    <ol className="space-y-1.5 text-base text-slate-200 list-decimal list-inside">
      <li>Demand = amount people are willing and able to buy at each price.</li>
      <li>Price ↑ → quantity demanded ↓ (law of demand).</li>
      <li>Shown as a movement along the demand curve.</li>
      <li>Income ↑ → demand for normal goods ↑ → curve shifts right.</li>
      <li>Substitutes: price of tea ↑ → demand for coffee ↑.</li>
      <li>Complements: price of cars ↑ → demand for petrol ↓.</li>
    </ol>
    <p className="text-sm text-rose-300 mt-3"><i className="fas fa-arrow-right mr-1.5" aria-hidden="true" />Later: rewrite as a chart — "movement vs shift".</p>
  </Paper>
);

const EXAMPLES = { cornell: CornellExample, outline: OutlineExample, mindmap: MindMapExample, chart: ChartExample, sentence: SentenceExample };

const MethodExamples = ({ active, onChange }) => {
  const m = METHODS[active];
  const a = ACCENT_CLASSES[m.color];
  const Example = EXAMPLES[active];
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Note-taking methods">
        {METHOD_ORDER.map((id) => {
          const mm = METHODS[id];
          const aa = ACCENT_CLASSES[mm.color];
          const on = id === active;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-base font-bold transition ${on ? `${aa.ring} ${aa.bg} text-white` : "border-white/15 text-slate-300 hover:border-white/30"}`}
            >
              <i className={`${mm.icon} ${aa.text}`} aria-hidden="true" />{mm.name}
            </button>
          );
        })}
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-6" role="tabpanel">
        <div className="min-w-0">
          <p className={`text-xs font-black uppercase tracking-[0.2em] mb-1 ${a.text}`}>{m.origin}</p>
          <h3 className="text-2xl font-black text-white mb-4">{m.name}: {m.tagline}</h3>
          <ol className="space-y-2.5 mb-5">
            {m.steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-base text-slate-200">
                <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm font-black ${a.icon}`}>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <p className="text-base text-slate-200 mb-2"><strong className="text-emerald-300 font-semibold">Best for:</strong> {m.best}</p>
          <p className="text-base text-slate-200"><strong className="text-amber-300 font-semibold">Watch out:</strong> {m.watch}</p>
        </div>
        <Example />
      </div>
    </div>
  );
};

export default MethodExamples;
