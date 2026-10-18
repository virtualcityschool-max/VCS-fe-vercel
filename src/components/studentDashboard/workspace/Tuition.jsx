import React from "react";
import { money, useTuition } from "./useTuition";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const TuitionPill = () => {
  const t = useTuition();
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold shadow-sm ${t.tone.pill}`}>
      <i className={`fas ${t.tone.icon} text-xs`} />
      <span>
        Tuition: {t.label}
        {t.amount ? ` (${t.amount})` : ""}
      </span>
    </span>
  );
};

export const TuitionCard = () => {
  const t = useTuition();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-xl space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h3 className="text-sm font-bold text-white tracking-tight leading-none">Fees</h3>
        <span className={`px-2 py-0.5 rounded-full border text-xs font-black uppercase tracking-wider ${t.tone.pill}`}>
          {t.label}
        </span>
      </div>

      {t.active.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-3">
          {t.loading ? "Checking your subjects…" : "You are not enrolled in any subject yet, so there is no fee to show."}
        </p>
      ) : (
        <>
          <div className="text-center py-2.5 bg-white/[0.02] rounded-xl border border-white/5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly fee</p>
            <p className={`text-2xl font-black tracking-tight mt-0.5 font-poppins ${t.tone.text}`}>
              {t.billed.length ? money(t.monthly) : "No fee"}
            </p>
            {t.nextRenewal && (
              <p className="text-xs text-slate-300 mt-1">Next renewal: {fmtDate(t.nextRenewal)}</p>
            )}
          </div>
          <ul className="space-y-1.5 text-xs">
            {t.active.map((e) => {
              const billed = t.billed.includes(e);
              const late = billed && e.has_access === false;
              return (
                <li key={e.id} className="flex items-start justify-between gap-2">
                  <span className="text-slate-300 leading-snug">{e.course?.subject_name || e.course?.title}</span>
                  <span className={`shrink-0 font-semibold ${late ? "text-rose-400" : billed ? "text-slate-200" : "text-emerald-400"}`}>
                    {billed ? `${money(e.course?.price)}${late ? " · overdue" : ""}` : "Free"}
                  </span>
                </li>
              );
            })}
          </ul>
          {t.overdue.length > 0 && (
            <p className="text-xs text-rose-300">
              Access to {t.overdue.length} subject{t.overdue.length === 1 ? " has" : "s have"} ended. Please contact the school office to renew.
            </p>
          )}
        </>
      )}
    </div>
  );
};
