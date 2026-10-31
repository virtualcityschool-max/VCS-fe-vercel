import { useState } from "react";
import { CHECKLIST } from "../../../data/playArea/smartLearning";

const verdict = (n, total) => {
  if (n === total) return { title: "Excellent: truly smart learning", text: "Your child's school ticks every box research supports.", tone: "text-emerald-300" };
  if (n >= 6) return { title: "Good, with a few gaps", text: "Ask the school about the boxes you couldn't tick.", tone: "text-cyan-300" };
  if (n >= 3) return { title: "Some smart learning", text: "Your child is missing several tools that help students learn and help you see progress.", tone: "text-amber-300" };
  return { title: "Mostly old-style learning", text: "Most research-backed tools are missing. It may be time to look at other options.", tone: "text-rose-300" };
};

const ParentChecklist = () => {
  const [ticks, setTicks] = useState([]);
  const toggle = (i) => setTicks((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i]));
  const n = ticks.length;
  const v = verdict(n, CHECKLIST.length);
  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
      <ul className="grid sm:grid-cols-2 gap-3">
        {CHECKLIST.map((item, i) => (
          <li key={item}>
            <label className={`h-full flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${ticks.includes(i) ? "border-emerald-400 bg-emerald-500/15" : "border-white/10 bg-white/[0.03] hover:border-white/30"}`}>
              <input type="checkbox" checked={ticks.includes(i)} onChange={() => toggle(i)} className="mt-1 w-5 h-5 accent-emerald-500 shrink-0" />
              <span className="text-base text-white">{item}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03] self-start text-center" aria-live="polite">
        <p className="text-sm font-bold text-slate-300 mb-1">Your child's school</p>
        <p className="text-5xl md:text-6xl font-black text-white mb-3">{n}<span className="text-2xl text-slate-300">/{CHECKLIST.length}</span></p>
        <div className="flex gap-1 mb-4" aria-hidden="true">
          {CHECKLIST.map((item, i) => (
            <div key={item} className={`h-3 flex-1 rounded-full ${i < n ? "bg-emerald-500" : "bg-white/10"}`} />
          ))}
        </div>
        {n > 0 ? (
          <>
            <p className={`text-xl font-black mb-1 ${v.tone}`}>{v.title}</p>
            <p className="text-base text-slate-200">{v.text}</p>
          </>
        ) : (
          <p className="text-base text-slate-200">Tick what your child's school offers today.</p>
        )}
      </div>
    </div>
  );
};

export default ParentChecklist;
