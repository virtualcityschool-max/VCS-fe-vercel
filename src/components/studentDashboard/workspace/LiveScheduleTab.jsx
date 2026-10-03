import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectLiveSchedule,
  selectNextSession,
  joinLiveSession,
} from "../../../store/slices/studentDashboardSlice";
import { useDateFormatters } from "../../../hooks/useDateFormatters";
import TimezoneTag from "../../ui/TimezoneTag";

const LiveScheduleTab = ({ onOpenWeeklyPlanner }) => {
  const dispatch = useDispatch();
  const liveSchedule = useSelector(selectLiveSchedule) || [];
  const nextSession = useSelector(selectNextSession);
  const { timezone, timezoneAbbr, formatTime, formatDate } = useDateFormatters();

  const [activeFilter, setActiveFilter] = useState("all");

  // Real live schedule from Redux (no dummy fallbacks)
  const sessions = liveSchedule || [];

  // The immediate next class spotlight
  const nextClass = nextSession || (sessions.length > 0 ? sessions[0] : null);

  // Real-time minutes remaining calculation for the spotlight class
  const [minsToNext, setMinsToNext] = useState(null);

  useEffect(() => {
    if (!nextClass?.scheduled_at) return;
    const updateCountdown = () => {
      const diff = Math.floor(
        (new Date(nextClass.scheduled_at).getTime() - Date.now()) / 60000
      );
      setMinsToNext(diff);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);
    return () => clearInterval(interval);
  }, [nextClass]);

  const isNextJoinable = minsToNext <= 30 && minsToNext >= -60;

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "today") {
      const date = new Date(s.scheduled_at);
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }
    if (activeFilter === "upcoming") {
      return new Date(s.scheduled_at).getTime() > Date.now();
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Admin Initiation & 30-Minute Join Policy Alert */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-indigo-500/20 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <i className="fas fa-video text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Live Google Meet Class Schedule
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase">
                Admin Verified
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live classes are initiated by VCS Administration and Faculty. Students can enter the Google Meet room starting <strong>30 minutes before each class</strong>.
            </p>
          </div>
        </div>

        {onOpenWeeklyPlanner && (
          <button
            onClick={onOpenWeeklyPlanner}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <i className="fas fa-calendar-alt text-indigo-400" />
            <span>Weekly Planner &rarr;</span>
          </button>
        )}
      </div>

      {/* 2. "WHAT IS MY NEXT CLASS?" Spotlight Hero Card */}
      {nextClass ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isNextJoinable ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"}`} />
                <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
                  {isNextJoinable ? "WHAT IS MY NEXT CLASS? • JOIN ROOM NOW OPEN" : "WHAT IS MY NEXT CLASS?"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-mono font-bold">
                  {nextClass.room || "Google Meet Room"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {nextClass.course_title}
              </h2>

              <p className="text-sm font-semibold text-indigo-200">
                {nextClass.title}
              </p>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-user-tie text-indigo-400" />
                  Faculty: <strong className="text-white">{nextClass.teacher_name || "Assigned Instructor"}</strong>
                </span>

                <span className="flex items-center gap-1.5 font-mono">
                  <i className="far fa-clock text-indigo-400" />
                  {formatTime(nextClass.scheduled_at, timezone)} ({timezoneAbbr}) • {formatDate(nextClass.scheduled_at, timezone)}
                </span>
              </div>
            </div>

            {/* Action Join Box */}
            <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
              {isNextJoinable ? (
                <div className="space-y-1.5 w-full sm:w-auto">
                  <a
                    href={nextClass.meeting_link || "https://meet.google.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black transition shadow-xl shadow-emerald-900/40 cursor-pointer"
                  >
                    <i className="fas fa-video text-base" />
                    <span>Join Google Meet (Starts in {minsToNext}m)</span>
                  </a>
                  <p className="text-[11px] text-emerald-400 text-center lg:text-right font-medium">
                    <i className="fas fa-check-circle mr-1" />
                    Within 30-min window • Direct classroom link active
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1 text-right">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <i className="fas fa-lock text-indigo-400" />
                    <span>Google Meet opens 30 min before class</span>
                  </div>
                  <p className="text-[11px] text-indigo-300 font-mono">
                    Starts at {formatTime(nextClass.scheduled_at, timezone)} ({timezoneAbbr})
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-white/10 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <i className="fas fa-calendar-check text-xl" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  WHAT IS MY NEXT CLASS?
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  No Live Classes Scheduled Right Now
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live classes initiated by administration or faculty will appear here. Links unlock 30 minutes before start.
                </p>
              </div>
            </div>
            {onOpenWeeklyPlanner && (
              <button
                onClick={onOpenWeeklyPlanner}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 shrink-0 self-start sm:self-auto"
              >
                <span>View Weekly Timetable</span>
                <i className="fas fa-arrow-right text-[10px]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Scheduled Classes Feed */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <i className="fas fa-calendar-check text-indigo-400 text-sm" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Upcoming Live Sessions ({filteredSessions.length})
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl text-xs font-bold">
            {[
              { id: "all", label: "All Sessions" },
              { id: "today", label: "Today Only" },
              { id: "upcoming", label: "Upcoming" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeFilter === f.id
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredSessions.length > 0 ? (
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const diffMins = Math.floor(
                (new Date(session.scheduled_at).getTime() - Date.now()) / 60000
              );
              const canJoin = diffMins <= 30 && diffMins >= -60;
              const unlockDate = new Date(
                new Date(session.scheduled_at).getTime() - 30 * 60000
              );
              const unlockTimeStr = formatTime(unlockDate.toISOString(), timezone);

              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    canJoin
                      ? "bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          canJoin ? "bg-emerald-400 animate-pulse" : "bg-blue-400"
                        }`}
                      />
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                        {session.course_title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          canJoin
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-blue-500/15 text-blue-300 border border-blue-500/25"
                        }`}
                      >
                        {canJoin
                          ? diffMins <= 0
                            ? "LIVE NOW"
                            : `JOINABLE (IN ${diffMins}M)`
                          : `OPENS 30M PRIOR (${unlockTimeStr})`}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate">
                      {session.title}
                    </h4>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Faculty: <span className="text-slate-200 font-semibold">{session.teacher_name}</span> • {session.room || "Google Meet"}
                    </p>

                    <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                      <i className="far fa-clock text-slate-500" />
                      <span>{formatTime(session.scheduled_at, timezone)} <TimezoneTag /></span>
                      <span>•</span>
                      <span>{formatDate(session.scheduled_at, timezone)}</span>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {canJoin ? (
                      <a
                        href={session.meeting_link || "https://meet.google.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-900/30 cursor-pointer"
                      >
                        <i className="fas fa-video text-xs" />
                        <span>Join Class (Google Meet)</span>
                      </a>
                    ) : (
                      <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-medium flex items-center gap-2">
                        <i className="fas fa-lock text-indigo-400 text-xs" />
                        <span>Opens at {unlockTimeStr}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <i className="fas fa-video-slash text-base" />
            </div>
            <p className="text-sm font-bold text-white">No Live Sessions Scheduled</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are no live Google Meet classes scheduled under this filter. Check your weekly timetable for recurring curriculum periods.
            </p>
            {onOpenWeeklyPlanner && (
              <button
                onClick={onOpenWeeklyPlanner}
                className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Weekly Curriculum Planner</span>
                <i className="fas fa-arrow-right text-[10px]" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveScheduleTab;
