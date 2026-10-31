import { useState } from "react";
import { STORE_KEY, schedule, addDays, daysBetween, toIcs } from "../../../data/playArea/revision";
import { todayKey } from "../../../data/playArea/memory";

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (Array.isArray(s)) return s;
  } catch { /* private mode or bad data */ }
  return [];
};
const save = (topics) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(topics)); } catch { /* private mode */ }
};
const nice = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const newId = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const STATUS = {
  done: { cls: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200", icon: "fas fa-check", word: "Done" },
  today: { cls: "border-amber-400 bg-amber-500/20 text-amber-100", icon: "fas fa-bell", word: "Due today" },
  late: { cls: "border-rose-500/50 bg-rose-500/15 text-rose-200", icon: "fas fa-triangle-exclamation", word: "Overdue" },
  soon: { cls: "border-white/10 bg-white/[0.03] text-slate-300", icon: "far fa-calendar", word: "Planned" },
};

const Planner = () => {
  const today = todayKey();
  const [topics, setTopics] = useState(load);
  const [name, setName] = useState("");
  const [learned, setLearned] = useState(today);
  const [exam, setExam] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const update = (next) => {
    setTopics(next);
    save(next);
  };

  const add = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Type the topic name first.");
    if (exam && daysBetween(learned, exam) < 2) return setError("The exam date must be at least 2 days after you learned the topic.");
    setError("");
    update([{ id: newId(), name: name.trim(), learned, exam: exam || null, done: [] }, ...topics]);
    setName("");
    return undefined;
  };

  const addExample = () => {
    update([
      { id: newId(), name: "Photosynthesis (Biology)", learned: addDays(today, -3), exam: addDays(today, 60), done: [addDays(today, -2)] },
      ...topics,
    ]);
  };

  const status = (t, r) => (t.done.includes(r.date) ? "done" : r.date === today ? "today" : r.date < today ? "late" : "soon");
  const toggleDone = (t, r) => {
    if (r.date > today) return;
    update(topics.map((x) => (x.id !== t.id ? x : { ...x, done: x.done.includes(r.date) ? x.done.filter((d) => d !== r.date) : [...x.done, r.date] })));
  };

  const due = topics.flatMap((t) => schedule(t.learned, t.exam).filter((r) => r.date <= today && !t.done.includes(r.date)).map((r) => ({ t, r })));
  const icsHref = topics.length ? `data:text/calendar;charset=utf-8,${encodeURIComponent(toIcs(topics))}` : null;

  return (
    <div className="grid xl:grid-cols-[380px_1fr] gap-6">
      <form onSubmit={add} className="p-5 md:p-6 rounded-3xl border border-violet-500/30 bg-violet-500/5 space-y-4 h-fit">
        <h3 className="text-lg font-bold text-white">Add a topic you've learned</h3>
        <label className="block">
          <span className="block text-sm font-bold text-slate-200 mb-1">Topic</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Quadratic equations (Maths)" className="w-full rounded-xl border border-white/15 bg-white/5 text-white text-base px-4 py-3 outline-none focus:border-violet-400 placeholder:text-slate-400" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-slate-200 mb-1">When did you learn it?</span>
          <input type="date" value={learned} max={today} onChange={(e) => setLearned(e.target.value || today)} className="w-full rounded-xl border border-white/15 bg-white/5 text-white text-base px-4 py-3 outline-none focus:border-violet-400" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-slate-200 mb-1">Exam date <span className="font-normal text-slate-400">(optional)</span></span>
          <input type="date" value={exam} min={addDays(learned, 2)} onChange={(e) => setExam(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 text-white text-base px-4 py-3 outline-none focus:border-violet-400" />
        </label>
        {error && <p className="text-sm font-semibold text-rose-300" role="alert">{error}</p>}
        <button type="submit" className="w-full px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition">
          <i className="fas fa-plus mr-2" aria-hidden="true" />Make my revision plan
        </button>
        <p className="text-sm text-slate-400">Saved on this device only. Reviews: after 1, 3, 7, 14 and 30 days, then monthly, plus the day before your exam.</p>
      </form>

      <div>
        {topics.length === 0 ? (
          <div className="p-8 rounded-3xl border border-dashed border-white/20 text-center h-full flex flex-col items-center justify-center">
            <i className="fas fa-calendar-days text-4xl text-violet-300 mb-4" aria-hidden="true" />
            <p className="text-lg font-bold text-white mb-2">No topics yet</p>
            <p className="text-base text-slate-300 mb-5 max-w-md">Add a topic you studied this week, and we'll tell you exactly which days to revise it.</p>
            <button type="button" onClick={addExample} className="px-5 py-3 rounded-full border border-violet-500/40 text-violet-200 text-sm font-bold hover:bg-violet-500/10">
              Show me an example
            </button>
          </div>
        ) : (
          <>
            <div className={`p-5 rounded-3xl border mb-5 ${due.length ? "border-amber-500/40 bg-amber-500/10" : "border-emerald-500/40 bg-emerald-500/10"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={`text-lg font-black ${due.length ? "text-amber-200" : "text-emerald-200"}`}>
                  <i className={`fas ${due.length ? "fa-bell" : "fa-circle-check"} mr-2`} aria-hidden="true" />
                  {due.length ? `${due.length} review${due.length > 1 ? "s" : ""} to do today` : "Nothing due today — well done!"}
                </p>
                {icsHref && (
                  <a href={icsHref} download="vcs-revision-plan.ics" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold">
                    <i className="fas fa-calendar-plus mr-2" aria-hidden="true" />Add all to my calendar
                  </a>
                )}
              </div>
              {due.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {due.map(({ t, r }) => (
                    <li key={`${t.id}-${r.date}`} className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-base text-white">
                        <strong>{t.name}</strong> <span className="text-slate-300">— day {r.day}{r.date < today ? ` (was due ${nice(r.date)})` : ""}</span>
                      </span>
                      <button type="button" onClick={() => toggleDone(t, r)} className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold">
                        <i className="fas fa-check mr-1.5" aria-hidden="true" />I revised it
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-4">
              {topics.map((t) => {
                const plan = schedule(t.learned, t.exam);
                const doneCount = plan.filter((r) => t.done.includes(r.date)).length;
                return (
                  <div key={t.id} className="p-5 rounded-3xl border border-white/10 bg-white/[0.03]">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">{t.name}</h4>
                        <p className="text-sm text-slate-300">
                          Learned {nice(t.learned)}{t.exam ? ` · Exam ${nice(t.exam)} (${Math.max(0, daysBetween(today, t.exam))} days to go)` : ""} · {doneCount} of {plan.length} reviews done
                        </p>
                      </div>
                      {confirmDelete === t.id ? (
                        <span className="flex gap-2">
                          <button type="button" onClick={() => { update(topics.filter((x) => x.id !== t.id)); setConfirmDelete(null); }} className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-sm font-bold">Delete</button>
                          <button type="button" onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-full border border-white/20 text-slate-200 text-sm font-bold">Keep</button>
                        </span>
                      ) : (
                        <button type="button" onClick={() => setConfirmDelete(t.id)} className="text-sm font-bold text-slate-400 hover:text-rose-300" aria-label={`Delete ${t.name}`}>
                          <i className="fas fa-trash-can" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <ol className="flex flex-wrap gap-2">
                      {plan.map((r) => {
                        const st = STATUS[status(t, r)];
                        return (
                          <li key={r.date}>
                            <button
                              type="button"
                              onClick={() => toggleDone(t, r)}
                              disabled={r.date > today}
                              title={r.date > today ? "Planned" : "Tap to mark done / not done"}
                              className={`flex flex-col items-start px-3 py-2 rounded-xl border text-left ${st.cls} ${r.date > today ? "cursor-default" : "hover:brightness-125"}`}
                            >
                              <span className="text-xs font-black uppercase tracking-wider">
                                <i className={`${st.icon} mr-1`} aria-hidden="true" />{r.last ? "Final" : `Day ${r.day}`}
                              </span>
                              <span className="text-sm font-bold">{nice(r.date)}</span>
                              <span className="sr-only">{st.word}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Planner;
