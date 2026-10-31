import { TEACHER_CHART, TESTING_CHART } from "../../../data/playArea/smartLearning";

// Grouped bars: re-reading vs testing yourself, after 5 minutes and after 1 week.
export const TestingChart = () => (
  <figure className="mt-5">
    <figcaption className="text-sm font-bold text-white mb-1">How much of a passage students remembered</figcaption>
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-200 mb-4">
      {TESTING_CHART.series.map((s) => (
        <li key={s.label} className="flex items-center gap-2"><span className={`w-3 h-3 rounded-sm ${s.dot}`} aria-hidden="true" />{s.label}</li>
      ))}
    </ul>
    <div className="grid grid-cols-2 gap-4">
      {TESTING_CHART.groups.map((g, gi) => (
        <div key={g}>
          <div className="h-44 flex items-end gap-2 border-b border-white/20 pb-0.5">
            {TESTING_CHART.series.map((s) => (
              <div key={s.label} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-sm font-black text-white mb-1">{s.values[gi]}%</span>
                <div className={`w-full rounded-t-[4px] ${s.bar}`} style={{ height: `${s.values[gi]}%` }} title={`${s.label}, ${g}: ${s.values[gi]}%`} />
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-slate-200 text-center mt-2">{g}</p>
        </div>
      ))}
    </div>
    <p className="text-sm text-slate-300 mt-3">{TESTING_CHART.note}</p>
  </figure>
);

// Horizontal bars: effect of different kinds of online learning.
export const TeacherChart = () => (
  <figure className="mt-5">
    <figcaption className="text-sm font-bold text-white mb-3">Gain compared with face-to-face classes</figcaption>
    <ul className="space-y-3">
      {TEACHER_CHART.rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between gap-3 text-sm text-slate-100 mb-1">
            <span>{r.label}</span>
            <strong className="text-white">+{r.value.toFixed(2)}</strong>
          </div>
          <div className="h-4 rounded-full bg-white/10 overflow-hidden">
            <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${(r.value / TEACHER_CHART.max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
    <p className="text-sm text-slate-300 mt-3">{TEACHER_CHART.note}</p>
  </figure>
);
