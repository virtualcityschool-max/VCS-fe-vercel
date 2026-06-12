import React from "react";
import { useCountdown } from "../../hooks/useCountdown";

const COLORS = {
  red:   { bg: "bg-rose-500/10",    border: "border-rose-500/20",    num: "text-rose-400",    lbl: "text-rose-500/60"    },
  amber: { bg: "bg-amber-500/10",   border: "border-amber-500/20",   num: "text-amber-400",   lbl: "text-amber-500/60"   },
  green: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", num: "text-emerald-400", lbl: "text-emerald-500/60" },
  slate: { bg: "bg-slate-800/60",   border: "border-white/5",        num: "text-white",       lbl: "text-slate-500"      },
};

function Unit({ value, singular, plural, color }) {
  const c = COLORS[color] || COLORS.slate;
  const label = value === 1 ? singular : plural;
  return (
    <div className={`flex flex-col items-center justify-center min-w-[2.4rem] px-1.5 py-1 rounded-xl border ${c.bg} ${c.border}`}>
      <span className={`text-sm font-black tabular-nums leading-none tracking-tight ${c.num}`}>
        {String(value).padStart(2, "0")}
      </span>
      <span className={`text-[7px] font-black uppercase tracking-widest mt-0.5 ${c.lbl}`}>
        {label}
      </span>
    </div>
  );
}

const SessionCountdown = ({ scheduledAt, status }) => {
  const { weeks, days, hours, minutes, seconds, total, isExpired, hide_status } = useCountdown(scheduledAt);

  if (status === "live" && !hide_status) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-xl">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-widest text-rose-400">Live Now</span>
      </div>
    );
  }

  if (status === "ended" || status === "cancelled" || isExpired) return null;

  const color =
    total < 60 * 60 * 1000          ? "red"   :
    total < 24 * 60 * 60 * 1000     ? "amber" :
    total < 3 * 24 * 60 * 60 * 1000 ? "green" :
    "slate";

  let units;
  if (weeks > 0) {
    units = [
      { v: weeks,   s: "week",  p: "weeks"   },
      { v: days,    s: "day",   p: "days"    },
      { v: hours,   s: "hr",    p: "hrs"     },
      { v: minutes, s: "min",   p: "mins"    },
      { v: seconds, s: "sec",   p: "secs"    },
    ];
  } else if (days > 0) {
    units = [
      { v: days,    s: "day",   p: "days"    },
      { v: hours,   s: "hr",    p: "hrs"     },
      { v: minutes, s: "min",   p: "mins"    },
      { v: seconds, s: "sec",   p: "secs"    },
    ];
  } else {
    units = [
      { v: hours,   s: "hr",    p: "hrs"     },
      { v: minutes, s: "min",   p: "mins"    },
      { v: seconds, s: "sec",   p: "secs"    },
    ];
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mr-0.5">
        Starts in
      </span>
      <div className="flex items-center gap-1">
        {units.map(({ v, s, p }) => (
          <Unit key={s} value={v} singular={s} plural={p} color={color} />
        ))}
      </div>
    </div>
  );
};

export default SessionCountdown;
