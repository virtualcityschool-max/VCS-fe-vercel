import React from "react";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import { getWindowLabel } from "../../utils/helper/StartSession";
import TimezoneTag from "../ui/TimezoneTag";
import SessionCountdown from "../common/SessionCountdown";
import { getStatusBadge } from "../common/SessionBadge";

// View 1 - student-style flat card (avatar | info | join/leave actions)
// Used by: student classes tab, teacher "Admin Sessions" tab
const StudentSessionCard = ({
  session,
  isLoading = false,
  loadingAction = null, // 'join' | 'leave'
  onJoin,
  onLeave,
  renderAvatar,
  subtitle,
}) => {
  const { formatDate, formatTime, timezone, timezoneAbbr } = useDateFormatters();
  const scheduledAt = session.scheduled_at || session.schedule_at;
  const displayTitle = session.title || session.course_title;

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-6 hover:bg-white/5 transition-all duration-300 group shadow-2xl relative">
      {session.has_joined && (
        <div className="absolute -left-10 -top-10 w-24 h-24 bg-red-500/5 rounded-full blur-[40px]" />
      )}

      {renderAvatar && (
        <div className="flex-shrink-0 relative z-10">{renderAvatar()}</div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0 relative z-10 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
          <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors truncate tracking-tight">
            {displayTitle}
          </h4>
          {session.category == "special" && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/20">
              Special Session
            </span>
          )}
          {getStatusBadge(session,true)}
        </div>

        {subtitle != null && (
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 opacity-60">
            {subtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3">
          <div className="flex items-center gap-1.5">
            <i className="fas fa-calendar text-blue-400/60" />
            <span>{formatDate(scheduledAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="fas fa-clock text-indigo-400/60" />
            <span>{formatTime(scheduledAt)} <TimezoneTag /></span>
          </div>
        </div>

        {!session.has_joined && session.status !== "ended" && !session.left_at && (
          <div className="mb-3">
            <SessionCountdown scheduledAt={scheduledAt} status={session.status} hide_status={true} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex flex-row md:flex-col gap-2 relative z-10">
        {session.status === "ended" || session.left_at ? (
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 border border-white/5 rounded-xl">
            {session.status}
          </span>
        ) : session.has_joined ? (
          <>
            <button
              onClick={() => onJoin?.(session)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isLoading && loadingAction === "join" ? (
                <><i className="fas fa-spinner fa-spin" /><span>Joining...</span></>
              ) : (
                <><i className="fas fa-video" /><span>Join Session</span></>
              )}
            </button>
            <button
              onClick={() => onLeave?.(session)}
              disabled={isLoading}
              className="bg-red-600/10 hover:bg-red-600/20 text-red-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isLoading && loadingAction === "leave" ? (
                <><i className="fas fa-spinner fa-spin" /><span>Leaving...</span></>
              ) : (
                <><i className="fas fa-stop-circle" /><span>Leave Session</span></>
              )}
            </button>
          </>
        ) : (
          <div className="relative group/tooltip">
            <button
              onClick={() => onJoin?.(session)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[150px]"
            >
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin" /><span>Joining...</span></>
              ) : (
                <><i className="fas fa-play text-[10px]" /><span>Join Session</span></>
              )}
            </button>
            <div className="absolute bottom-full right-0 mb-2 px-4 py-2.5 bg-slate-900 border border-white/10 text-white text-[10px] rounded-xl whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-[9999] shadow-2xl">
              <div className="absolute top-full right-4 border-[5px] border-transparent border-t-slate-900" />
              <p className="text-slate-400 font-bold uppercase tracking-widest mb-0.5">Join Window</p>
              <p className="font-black text-white">
                {getWindowLabel(scheduledAt, timezone, timezoneAbbr) || "Check schedule"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSessionCard;
