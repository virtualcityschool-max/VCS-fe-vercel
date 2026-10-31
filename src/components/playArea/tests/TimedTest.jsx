import { useEffect, useRef, useState } from "react";
import { nowMs } from "../utils";
import { MatrixGrid, MatrixCell, PolyShape, SeqFrame } from "./Visuals";
import { cellText as cellLabel } from "../../../data/playArea/reasoning";

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

// Extra material shown above a question: a data table, a passage or a picture.
export const QuestionStem = ({ q }) => (
  <>
    {q.table && (
      <div className="overflow-x-auto mb-5">
        <table className="min-w-[420px] w-full text-base border-collapse">
          <caption className="text-left text-sm font-black uppercase tracking-wider text-cyan-300 mb-2">{q.table.title}</caption>
          <thead>
            <tr className="bg-cyan-500/10 text-cyan-100">
              <th className="px-3 py-2 text-left border border-white/10" />
              {q.table.cols.map((c) => <th key={c} className="px-3 py-2 text-right border border-white/10 font-black">{c}</th>)}
            </tr>
          </thead>
          <tbody className="text-slate-100">
            {q.table.rows.map((row, i) => (
              <tr key={row}>
                <th className="px-3 py-2 text-left border border-white/10 font-bold">{row}</th>
                {q.table.data[i].map((v, j) => <td key={j} className="px-3 py-2 text-right border border-white/10 tabular-nums">{v.toLocaleString("en-GB")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-sm text-slate-400 mt-1">Values in {q.table.unit}.</p>
      </div>
    )}
    {q.passage && (
      <div className="mb-5 p-4 md:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
        <p className="text-sm font-black uppercase tracking-wider text-emerald-300 mb-2">{q.passage.title}</p>
        <p className="text-base md:text-lg text-slate-100 leading-relaxed">{q.passage.text}</p>
      </div>
    )}
    {q.type === "matrix" && <div className="mb-5"><MatrixGrid grid={q.grid} /></div>}
    {q.type === "rotation" && (
      <div className="mb-5 inline-flex flex-col items-center p-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-slate-100">
        <PolyShape cells={q.target} size={120} label="the shape to match" />
        <span className="text-xs font-black uppercase tracking-wider text-amber-300">This shape</span>
      </div>
    )}
    {q.type === "sequence" && (
      <div className="mb-5 flex flex-wrap items-center gap-2 text-slate-100">
        {q.frames.map((f, i) => (
          <div key={i} className="rounded-xl border border-white/15 bg-white/[0.04] p-1"><SeqFrame frame={f} size={76} /></div>
        ))}
        <div className="w-[86px] h-[86px] rounded-xl border-2 border-dashed border-amber-400/60 flex items-center justify-center text-3xl font-black text-amber-300" aria-label="next picture">?</div>
      </div>
    )}
  </>
);

export const OptionBody = ({ q, o }) => {
  if (q.type === "matrix") return <MatrixCell cell={o.cell} size={80} label={cellLabel(o.cell)} />;
  if (q.type === "rotation") return <PolyShape cells={o.cells} size={84} label={`option ${o.key}`} />;
  if (q.type === "sequence") return <SeqFrame frame={o.frame} size={76} />;
  return <span className="text-base md:text-lg font-semibold">{o.label}</span>;
};
const isPicture = (q) => q.type === "matrix" || q.type === "rotation" || q.type === "sequence";

const TimedTest = ({ questions, minutes, title, onDone, onQuit }) => {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [confirm, setConfirm] = useState(false);
  const [now, setNow] = useState(() => nowMs());
  const [startedAt] = useState(() => nowMs());
  const endAt = startedAt + minutes * 60000;
  const doneRef = useRef(false);
  const live = useRef({ answers, onDone });
  useEffect(() => { live.current = { answers, onDone }; });

  // Clock; submits automatically when time runs out.
  useEffect(() => {
    const id = setInterval(() => {
      const t = nowMs();
      setNow(t);
      if (t >= endAt && !doneRef.current) {
        doneRef.current = true;
        live.current.onDone(live.current.answers, Math.min(minutes * 60, Math.round((t - startedAt) / 1000)), true);
      }
    }, 500);
    return () => clearInterval(id);
  }, [endAt, startedAt, minutes]);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone(answers, Math.round((nowMs() - startedAt) / 1000), false);
  };

  const q = questions[i];
  const left = Math.max(0, Math.ceil((endAt - now) / 1000));
  const unanswered = questions.filter((x) => !answers[x.id]).length;
  const timerCls = left <= 30 ? "text-rose-300 border-rose-500/50 bg-rose-500/10" : left <= 120 ? "text-amber-300 border-amber-500/50 bg-amber-500/10" : "text-white border-white/15 bg-white/5";

  return (
    <div>
      <div className="sticky top-2 z-30 mb-5 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 rounded-2xl border border-white/10 bg-[#0b1224]/95 backdrop-blur">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 truncate">{title}</p>
          <p className="text-base font-bold text-white">Question {i + 1} of {questions.length}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border font-black text-xl tabular-nums ${timerCls}`} role="timer" aria-label={`${mmss(left)} left`}>
          <i className="far fa-clock mr-2" aria-hidden="true" />{mmss(left)}
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_260px] gap-6">
        <div className="min-w-0 p-5 md:p-7 rounded-3xl border border-white/10 bg-white/[0.03]">
          <QuestionStem q={q} />
          <p id={`tq-${q.id}`} className="text-xl md:text-2xl font-bold text-white mb-5">{q.prompt}</p>
          <div role="radiogroup" aria-labelledby={`tq-${q.id}`} className={isPicture(q) ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" : "grid sm:grid-cols-2 gap-3"}>
            {q.options.map((o) => {
              const on = answers[q.id] === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setAnswers({ ...answers, [q.id]: o.key })}
                  className={`flex items-center gap-3 rounded-2xl border-2 transition text-left text-white ${isPicture(q) ? "flex-col justify-center p-3" : "px-4 py-3.5"} ${on ? "border-violet-400 bg-violet-500/20" : "border-white/15 bg-white/[0.04] hover:border-violet-400/70"}`}
                >
                  <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-black ${on ? "bg-violet-500 text-white" : "bg-white/10 text-slate-200"}`}>{o.key}</span>
                  <span className={isPicture(q) ? "text-slate-100" : ""}><OptionBody q={q} o={o} /></span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button type="button" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="px-5 py-3 rounded-full border border-white/20 text-slate-100 font-bold disabled:opacity-40"><i className="fas fa-arrow-left mr-2" aria-hidden="true" />Back</button>
            {i + 1 < questions.length ? (
              <button type="button" onClick={() => setI(i + 1)} className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold">Next <i className="fas fa-arrow-right ml-2" aria-hidden="true" /></button>
            ) : (
              <button type="button" onClick={() => (unanswered ? setConfirm(true) : finish())} className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Finish <i className="fas fa-flag-checkered ml-2" aria-hidden="true" /></button>
            )}
            <button type="button" onClick={() => setFlags({ ...flags, [q.id]: !flags[q.id] })} aria-pressed={Boolean(flags[q.id])} className={`px-4 py-3 rounded-full text-sm font-bold border ${flags[q.id] ? "border-amber-400 text-amber-200 bg-amber-500/15" : "border-white/15 text-slate-300"}`}>
              <i className="fas fa-flag mr-1.5" aria-hidden="true" />{flags[q.id] ? "Flagged" : "Flag to check later"}
            </button>
          </div>
        </div>

        <aside className="p-4 rounded-3xl border border-white/10 bg-white/[0.02] h-fit">
          <p className="text-sm font-black text-white mb-3">Questions <span className="font-normal text-slate-400">· {questions.length - unanswered} answered</span></p>
          <div className="grid grid-cols-6 xl:grid-cols-5 gap-2">
            {questions.map((x, n) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setI(n)}
                aria-label={`Question ${n + 1}${answers[x.id] ? ", answered" : ""}${flags[x.id] ? ", flagged" : ""}`}
                className={`relative h-10 rounded-lg text-sm font-black ${answers[x.id] ? "bg-violet-500 text-white" : "bg-white/10 text-slate-200"} ${n === i ? "ring-2 ring-white" : ""}`}
              >
                {n + 1}
                {flags[x.id] && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400" aria-hidden="true" />}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => (unanswered ? setConfirm(true) : finish())} className="mt-4 w-full px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold">Finish test</button>
          <button type="button" onClick={onQuit} className="mt-2 w-full px-4 py-2 rounded-full text-sm font-bold text-slate-400 hover:text-white">Quit without saving</button>
        </aside>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="max-w-md w-full p-6 rounded-3xl border border-white/15 bg-[#0b1224] text-center">
            <p id="confirm-title" className="text-lg font-black text-white mb-2">{unanswered} question{unanswered > 1 ? "s" : ""} not answered</p>
            <p className="text-base text-slate-300 mb-5">Unanswered questions count as wrong. A guess is better than a blank!</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => { setConfirm(false); setI(questions.findIndex((x) => !answers[x.id])); }} className="px-5 py-3 rounded-full bg-violet-600 text-white font-bold">Go to first unanswered</button>
              <button type="button" onClick={finish} className="px-5 py-3 rounded-full border border-white/20 text-slate-100 font-bold">Finish anyway</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimedTest;

// Review of every question after the test.
export const Review = ({ questions, answers, sections }) => {
  const [onlyWrong, setOnlyWrong] = useState(false);
  const list = questions.filter((q) => !onlyWrong || answers[q.id] !== q.answer);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-black font-poppins text-white">Check your answers</h2>
        <label className="inline-flex items-center gap-2 text-base font-bold text-slate-200 cursor-pointer">
          <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} className="w-5 h-5 accent-violet-500" />
          Show only the ones I got wrong
        </label>
      </div>
      {list.length === 0 && <p className="text-base text-emerald-300">Nothing to show — all correct!</p>}
      <ol className="space-y-4">
        {list.map((q) => {
          const n = questions.indexOf(q) + 1;
          const mine = answers[q.id];
          const right = mine === q.answer;
          return (
            <li key={q.id} className={`p-5 rounded-3xl border ${right ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
              <p className="text-sm font-black uppercase tracking-wider text-slate-400 mb-2">
                {n}. {sections[q.section]?.name} · <span className={right ? "text-emerald-300" : "text-rose-300"}>{right ? "Correct" : mine ? "Wrong" : "Not answered"}</span>
              </p>
              <QuestionStem q={q} />
              <p className="text-lg font-bold text-white mb-3">{q.prompt}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {q.options.map((o) => (
                  <span key={o.key} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-slate-100 ${o.key === q.answer ? "border-emerald-400 bg-emerald-500/15" : o.key === mine ? "border-rose-400 bg-rose-500/15" : "border-white/10 opacity-70"}`}>
                    <strong className="text-sm">{o.key}</strong><OptionBody q={q} o={o} />
                    {o.key === q.answer && <i className="fas fa-check text-emerald-300" aria-label="correct answer" />}
                    {o.key === mine && o.key !== q.answer && <i className="fas fa-xmark text-rose-300" aria-label="your answer" />}
                  </span>
                ))}
              </div>
              <p className="text-base text-slate-200"><strong className="text-amber-300">Why:</strong> {q.why}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
