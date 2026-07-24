import React from "react";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import SessionCountdown from "../common/SessionCountdown";
import { getStatusBadge } from "../common/SessionBadge";
import { getWindowLabel } from "../../utils/helper/StartSession";

// View 2 - teacher-style card (time widget | info | start/join/end actions)
// Used by: teacher "Classes" tab, admin overview sessions section
const TeacherSessionCard = ({
  session,
  isLoading = false,
  onStart,  // (session) => void - show Start button when scheduled
  onJoin,   // (session) => void - show Join button when live
  onEnd,    // (session) => void - show End/power button when live
  subtitle, // string or ReactNode - secondary info line (course, learners, teachers…)
}) => {
  const { formatTime, timezone, timezoneAbbr } = useDateFormatters();
  const scheduledAt = session.scheduled_at || session.schedule_at;
  const isLive = session.status === "live";

  const schedDate = new Date(scheduledAt);
  const dayLabel = schedDate.toLocaleDateString([], {
    weekday: "short", month: "short", day: "numeric",
    ...(timezone ? { timeZone: timezone } : {}),
  });
  const timeLabel = formatTime(scheduledAt) + (timezoneAbbr ? ` ${timezoneAbbr}` : "");

  return (
    <div
      className={`relative group bg-slate-900/40 backdrop-blur-md px-5 py-8 rounded-3xl border transition-all duration-300 ${
        isLive
          ? "border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.1)]"
          : "border-white/5 hover:border-white/10"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Time Widget */}
        <div
          className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-3 rounded-2xl border transition-colors ${
            isLive ? "bg-indigo-600 border-indigo-400/30" : "bg-slate-950 border-white/5"
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-widest ${isLive ? "text-indigo-100" : "text-slate-500"}`}>
            {dayLabel}
          </span>
          <span className={`text-xl font-black ${isLive ? "text-white" : "text-indigo-400"}`}>
            {timeLabel}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h4 className="font-bold text-lg text-white group-hover:text-indigo-400 transition truncate">
              {session.title}
            </h4>
            {session.category === "special" && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/20">
                Special Session
              </span>
            )}
           {getStatusBadge(session)}
          </div>
          {subtitle != null && (
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest flex items-center gap-2 flex-wrap">
              {subtitle}
            </p>
          )}
          {session.status === "scheduled" && (
            <div className="mt-2">
              <SessionCountdown scheduledAt={scheduledAt} status={session.status} hide_status={true} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {session.status === "scheduled" && onStart && (() => {
            const windowLabel = getWindowLabel(scheduledAt, timezone, timezoneAbbr);
            return (
              <div className="relative group/tooltip">
                <button
                  onClick={() => onStart(session)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin text-[10px]" />
                  ) : (
                    <i className="fas fa-play text-[10px]" />
                  )}
                  <span>Start</span>
                </button>
                {windowLabel && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-800 border border-white/10 text-white text-[10px] rounded-xl whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-20 shadow-2xl">
                    <p className="text-slate-400 font-bold uppercase mb-0.5">Start Window</p>
                    <p className="font-black text-white">{windowLabel}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {isLive && (
            <div className="flex items-center gap-2">
              {onJoin && (
                <button
                  onClick={() => onJoin(session)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-video text-[10px]" />
                  <span>Join</span>
                </button>
              )}
              {onEnd && (
                <button
                  onClick={() => onEnd(session)}
                  disabled={isLoading}
                  className="bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-500 p-3 rounded-2xl transition-all border border-white/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin" />
                  ) : (
                    <i className="fas fa-power-off" />
                  )}
                </button>
              )}
            </div>
          )}

          {session.status === "ended" && (
            <div className="px-4 py-2 rounded-xl bg-slate-950/50 border border-white/5 text-slate-600 text-[10px] font-black uppercase tracking-widest">
              Session Ended
            </div>
          )}

          {session.status === "cancelled" && (
            <div className="px-4 py-2 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500/50 text-[10px] font-black uppercase tracking-widest">
              Cancelled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherSessionCard;
