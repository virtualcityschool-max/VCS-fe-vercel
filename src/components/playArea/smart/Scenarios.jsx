import { useState } from "react";
import { SCENARIOS } from "../../../data/playArea/smartLearning";

const Scenarios = () => {
  const [key, setKey] = useState(SCENARIOS[0].key);
  const s = SCENARIOS.find((x) => x.key === key);
  return (
    <div className="grid lg:grid-cols-[minmax(0,380px)_1fr] gap-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-2" role="tablist" aria-label="Choose a situation">
        {SCENARIOS.map((x) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            aria-selected={x.key === key}
            onClick={() => setKey(x.key)}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left text-base font-bold transition ${x.key === key ? "border-cyan-400 bg-cyan-500/15 text-white" : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/30"}`}
          >
            <span className="w-9 h-9 shrink-0 rounded-full bg-cyan-500/15 text-cyan-300 flex items-center justify-center"><i className={x.icon} aria-hidden="true" /></span>
            {x.title}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-live="polite" className="p-5 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-center">
        <h3 className="flex items-center gap-3 text-xl md:text-2xl font-black text-white mb-6">
          <i className={`${s.icon} text-cyan-300`} aria-hidden="true" />{s.title}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border-t-4 border border-slate-400/30 bg-white/[0.03]">
            <p className="text-xs font-black uppercase tracking-widest text-slate-300 mb-2"><i className="fas fa-chalkboard mr-2" aria-hidden="true" />In a typical classroom</p>
            <p className="text-lg text-slate-100 leading-snug">{s.classroom}</p>
          </div>
          <div className="p-5 rounded-2xl border-t-4 border border-emerald-500/40 bg-emerald-500/10">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-300 mb-2"><i className="fas fa-laptop mr-2" aria-hidden="true" />With smart online learning</p>
            <p className="text-lg text-white font-semibold leading-snug">{s.online}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scenarios;
