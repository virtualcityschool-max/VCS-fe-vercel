// The student's marking report: the written report, the ten areas with their level in words, and the teacher's own
// remarks. Used on the student's assignment page and as the teacher's "what the student sees" preview.
import React from "react";
import { LEVELS, LEVEL_TONE, readFeedback } from "../../utils/markingRubric";

const MarkingReport = ({ feedback, parsed }) => {
  const fb = parsed || readFeedback(feedback);
  if (!fb.report && !fb.areas.length && !fb.remarks) {
    return <p className="text-sm text-slate-300">Your teacher gave marks without remarks.</p>;
  }
  return (
    <div className="space-y-4">
      {fb.report && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-300">Your report</p>
          {fb.report.split(/\n{2,}/).map((para, i) => (
            <p key={i} className="mt-2 max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-slate-100 first:mt-0">{para}</p>
          ))}
        </div>
      )}

      {fb.areas.length > 0 && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-indigo-300">Area by area</p>
          <ul>
            {fb.areas.map((a) => (
              <li key={a.name} className="border-t border-slate-800 first:border-t-0 flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-slate-100">{a.name}</span>
                  {a.note && <span className="mt-0.5 block text-sm text-slate-300">{a.note}</span>}
                </span>
                <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-sm font-bold ${LEVEL_TONE[LEVELS.indexOf(a.level)] || ""}`}>{a.level}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fb.remarks && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-300">Teacher&apos;s remarks</p>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-100">{fb.remarks}</p>
        </div>
      )}
    </div>
  );
};

export default MarkingReport;
