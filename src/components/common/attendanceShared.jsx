import React from "react";

export const STATUS_CONFIG = {
  present: { label: "Present", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  absent:  { label: "Absent",  badge: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  late:    { label: "Late",    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

export const STATUS_OPTIONS = ["present", "late", "absent"];

export const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.absent;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border font-semibold whitespace-nowrap ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
};

export const StatusPill = ({ value, active, onClick, disabled }) => {
  const cfg = STATUS_CONFIG[value];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition capitalize disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? cfg.badge
          : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"
      }`}
    >
      {cfg.label}
    </button>
  );
};

export const fmtTime = (iso) => {
  if (!iso) return <span className="text-slate-600 italic text-xs">-</span>;
  return (
    <span className="text-slate-300 text-xs tabular-nums">
      {new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
};

export const SessionBanner = ({ session }) => {
  if (!session?.scheduled_at) return null;
  const d = new Date(session.scheduled_at);
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
      <i className="fas fa-calendar-alt text-indigo-400 text-sm" />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-indigo-400/70 font-bold">Session Start</p>
        <p className="text-sm font-semibold text-indigo-300">
          {d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          <span className="text-indigo-400/70 mx-1.5">·</span>
          {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
};
