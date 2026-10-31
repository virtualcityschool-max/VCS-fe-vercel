import { useState } from "react";
import { DOMAINS, LEVELS } from "../../../data/playArea/domains";
import { ACCENT_CLASSES } from "../../../data/playArea/games";

// Tailwind needs full class names, so each colour's step shades are listed.
const STEPS = {
  violet: ["bg-violet-500/15", "bg-violet-500/25", "bg-violet-500/35", "bg-violet-500/50", "bg-violet-500/65", "bg-violet-500/80"],
  amber: ["bg-amber-500/15", "bg-amber-500/30", "bg-amber-500/45", "bg-amber-500/60", "bg-amber-500/75"],
  rose: ["bg-rose-500/15", "bg-rose-500/30", "bg-rose-500/45", "bg-rose-500/60", "bg-rose-500/75"],
};
const RING = { violet: "ring-violet-300", amber: "ring-amber-300", rose: "ring-rose-300" };
const CHIP = {
  violet: "border-violet-400 bg-violet-500/20 text-white",
  amber: "border-amber-400 bg-amber-500/20 text-white",
  rose: "border-rose-400 bg-rose-500/20 text-white",
};

const LevelLadder = ({ domain }) => {
  const d = DOMAINS[domain];
  const { threads, levels } = LEVELS[domain];
  const a = ACCENT_CLASSES[d.color];
  const [level, setLevel] = useState(0);
  const [thread, setThread] = useState(threads[0].key);
  const L = levels[level];
  const n = levels.length;

  return (
    <div className="p-5 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-end gap-1.5 sm:gap-2" role="tablist" aria-label={`${d.short} levels`}>
        {levels.map((lv, i) => (
          <button
            key={lv.name}
            type="button"
            role="tab"
            aria-selected={i === level}
            onClick={() => setLevel(i)}
            style={{ height: `${3.5 + i * 1.6}rem` }}
            className={`flex-1 min-w-0 rounded-t-2xl px-1 sm:px-2 pt-2 flex flex-col items-center justify-start text-center transition ${STEPS[d.color][i]} ${i === level ? `ring-2 ${RING[d.color]}` : "hover:brightness-125"}`}
          >
            <span className="text-lg sm:text-xl font-black text-white leading-none">{i + 1}</span>
            <span className="hidden sm:block text-xs md:text-sm font-bold text-white mt-1 leading-tight break-words">{lv.name}</span>
          </button>
        ))}
      </div>
      <div className="h-1.5 rounded-full bg-white/10 mb-2" aria-hidden="true" />
      <p className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-300 mb-6">
        <span>Simpler</span>
        <span>Deeper <i className="fas fa-arrow-right ml-1" aria-hidden="true" /></span>
      </p>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6" role="tabpanel" aria-live="polite">
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.2em] mb-1 ${a.text}`}>Level {level + 1} of {n}</p>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-2">{L.name}</h3>
          <p className="text-lg text-slate-100 mb-4">{L.meaning}</p>
          <p className="text-sm font-bold text-slate-300 mb-2">Action words</p>
          <ul className="flex flex-wrap gap-2">
            {L.verbs.map((v) => (
              <li key={v} className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${a.ring} ${a.bg} text-slate-100`}>{v}</li>
            ))}
          </ul>
        </div>

        <div className={`p-5 rounded-2xl border ${a.ring} ${a.bg}`}>
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Choose an example">
            {threads.map((t) => (
              <button
                key={t.key}
                type="button"
                aria-pressed={thread === t.key}
                onClick={() => setThread(t.key)}
                className={`px-3.5 py-2 rounded-full border-2 text-sm font-bold transition ${thread === t.key ? CHIP[d.color] : "border-white/15 text-slate-200 hover:border-white/40"}`}
              >
                <i className={`${t.icon} mr-1.5`} aria-hidden="true" />{t.label}
              </button>
            ))}
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-300 mb-2">Example</p>
          <p className="text-lg md:text-xl font-semibold text-white leading-snug">{L[thread]}</p>
        </div>
      </div>
    </div>
  );
};

export default LevelLadder;
