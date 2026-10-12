import React, { useState, useEffect } from "react";

/**
 * DigitalSessionClock
 * Displays a futuristic, glowing digital LED-style clock indicating
 * remaining time to go in Days, Hours, Minutes, and Seconds.
 *
 * Variants:
 *  - "hero": Prominent luxury digital clock readout with glowing LED unit boxes
 *  - "card": Elegant inline digital timer badge for session cards and feeds
 *  - "inline": Minimal digital tag for tables and lists
 */
export const DigitalSessionClock = ({
  scheduledAt,
  status,
  variant = "hero",
  showSeconds = true,
  className = "",
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!scheduledAt) return null;

  const targetMs = new Date(scheduledAt).getTime();
  const diffMs = targetMs - now;
  const unlockDiffMs = diffMs - 20 * 60 * 1000;
  const isStarted = diffMs <= 0;
  const isUnlockOpen = diffMs <= 20 * 60 * 1000;
  const isLive = status === "live";

  // Hide for completed or cancelled sessions
  if (status === "ended" || status === "cancelled") {
    return null;
  }

  const totalSeconds = Math.max(0, Math.floor(Math.abs(diffMs) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const totalHours = Math.floor(totalSeconds / 3600);
  const hours = days > 0 ? Math.floor((totalSeconds % 86400) / 3600) : totalHours;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");

  // Format unlock diff for notice
  const unlockSec = Math.max(0, Math.floor(unlockDiffMs / 1000));
  const unlockHrs = Math.floor(unlockSec / 3600);
  const unlockMins = Math.floor((unlockSec % 3600) / 60);

  // ─────────────────────────────────────────────────────────────
  // HERO VARIANT (Featured spotlight card in student/teacher hero)
  // ─────────────────────────────────────────────────────────────
  if (variant === "hero") {
    if (isLive) {
      return (
        <div
          className={`p-4 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl ${className}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
              Live Classroom Active
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-emerald-300 text-base font-black">
            <i className="fas fa-broadcast-tower text-emerald-400 text-sm animate-pulse" />
            <span>Class in Progress</span>
          </div>
        </div>
      );
    }

    if (isUnlockOpen && !isStarted) {
      return (
        <div
          className={`p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/50 shadow-2xl backdrop-blur-md ${className}`}
        >
          <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                Join Room Open
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-300 font-mono">
              Class begins in
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            {hours > 0 && (
              <>
                <div className="flex flex-col items-center bg-slate-950/90 border border-emerald-500/40 rounded-xl px-3 py-1.5 shadow-inner min-w-[3.2rem]">
                  <span className="text-xl font-black text-white tabular-nums tracking-tight">
                    {pad(hours)}
                  </span>
                  <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest mt-0.5">
                    HRS
                  </span>
                </div>
                <span className="text-emerald-400 font-black text-lg">:</span>
              </>
            )}

            <div className="flex flex-col items-center bg-slate-950/90 border border-emerald-500/40 rounded-xl px-3 py-1.5 shadow-inner min-w-[3.2rem]">
              <span className="text-xl font-black text-emerald-300 tabular-nums tracking-tight">
                {pad(minutes)}
              </span>
              <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest mt-0.5">
                MIN
              </span>
            </div>

            <span className="text-emerald-400 font-black text-lg animate-pulse">:</span>

            <div className="flex flex-col items-center bg-slate-950/90 border border-emerald-500/40 rounded-xl px-3 py-1.5 shadow-inner min-w-[3.2rem]">
              <span className="text-xl font-black text-emerald-200 tabular-nums tracking-tight">
                {pad(seconds)}
              </span>
              <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest mt-0.5">
                SEC
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-emerald-500/20 text-[10px] text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <i className="fas fa-check-circle text-emerald-400" />
              Direct Meet link unlocked
            </span>
            <span className="font-semibold text-slate-300">Enter room now</span>
          </div>
        </div>
      );
    }

    // Default upcoming (>30 mins to go)
    return (
      <div
        className={`p-4 rounded-2xl bg-gradient-to-br from-slate-900/95 via-indigo-950/60 to-slate-900/95 border border-indigo-500/30 shadow-2xl backdrop-blur-md ${className}`}
      >
        <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
              Time Until Session
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-cyan-300">
            {days > 0 ? `${days}d ${hours}h ${minutes}m to go` : `${hours}h ${minutes}m to go`}
          </span>
        </div>

        {/* Digital LED readout */}
        <div className="flex items-center gap-1.5 font-mono">
          {days > 0 && (
            <>
              <div className="flex flex-col items-center bg-slate-950/90 border border-indigo-500/40 rounded-xl px-3 py-1.5 shadow-inner min-w-[3.2rem]">
                <span className="text-xl font-black text-white tabular-nums tracking-tight">
                  {pad(days)}
                </span>
                <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mt-0.5">
                  DAYS
                </span>
              </div>
              <span className="text-indigo-400 font-black text-lg">:</span>
            </>
          )}

          <div className="flex flex-col items-center bg-slate-950/90 border border-indigo-500/40 rounded-xl px-3 py-1.5 shadow-inner min-w-[3.2rem]">
            <span className="text-xl font-black text-white tabular-nums tracking-tight">
              {pad(hours)}
            </span>
            <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mt-0.5">
              HRS
            </span>
          </div>

          <span className="text-indigo-400 font-black text-lg animate-pulse">:</span>

          <div className="flex flex-col items-center bg-slate-950/90 border border-indigo-500/40 rounded-xl px-3 py-1.5 shadow-inner min-w-[3.2rem]">
            <span className="text-xl font-black text-cyan-300 tabular-nums tracking-tight">
              {pad(minutes)}
            </span>
            <span className="text-[8px] font-black uppercase text-cyan-400/80 tracking-widest mt-0.5">
              MIN
            </span>
          </div>

          {showSeconds && (
            <>
              <span className="text-indigo-400 font-black text-lg animate-pulse">:</span>

              <div className="flex flex-col items-center bg-slate-950/90 border border-indigo-500/40 rounded-xl px-3 py-1.5 shadow-inner min-w-[3.2rem]">
                <span className="text-xl font-black text-amber-300 tabular-nums tracking-tight">
                  {pad(seconds)}
                </span>
                <span className="text-[8px] font-black uppercase text-amber-400/80 tracking-widest mt-0.5">
                  SEC
                </span>
              </div>
            </>
          )}
        </div>

        {/* Room unlock notice */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <i className="fas fa-lock text-indigo-400 text-[10px]" />
            Room unlocks 20m prior
          </span>
          <span className="font-mono text-indigo-300 font-bold">
            {unlockDiffMs > 0
              ? `Unlocks in ${unlockHrs > 0 ? `${unlockHrs}h ` : ""}${unlockMins}m`
              : "Unlocks shortly"}
          </span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CARD VARIANT (Inline glowing digital badge on session cards)
  // ─────────────────────────────────────────────────────────────
  if (variant === "card") {
    if (isLive) {
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold shadow-sm ${className}`}>
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-wider">Live Now</span>
        </div>
      );
    }

    if (isUnlockOpen && !isStarted) {
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold shadow-md ${className}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Room Open</span>
          <span className="text-slate-400">·</span>
          <span className="text-white font-black">{pad(minutes)}m {pad(seconds)}s to start</span>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-white font-mono text-xs shadow-md ${className}`}>
        <i className="far fa-clock text-indigo-400 text-xs animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
          Time to go:
        </span>
        <div className="flex items-center gap-1 font-black text-cyan-300 tabular-nums">
          {days > 0 ? (
            <span>{days}d {pad(hours)}h {pad(minutes)}m</span>
          ) : (
            <span>{pad(hours)}h {pad(minutes)}m</span>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // INLINE VARIANT (Compact badge for tables, sidebars, grids)
  // ─────────────────────────────────────────────────────────────
  if (isLive) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 font-mono text-[11px] text-rose-300 font-bold ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
        <span>LIVE</span>
      </span>
    );
  }

  if (isUnlockOpen && !isStarted) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 font-mono text-[11px] text-emerald-300 font-bold ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Open · {pad(minutes)}m</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900/90 border border-indigo-500/30 font-mono text-[11px] text-slate-200 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
      <span className="text-slate-400 text-[9px] uppercase tracking-wider">In:</span>
      <span className="font-bold text-cyan-300 tabular-nums">
        {days > 0 ? `${days}d ${pad(hours)}h` : `${pad(hours)}h ${pad(minutes)}m`}
      </span>
    </span>
  );
};

export default DigitalSessionClock;
