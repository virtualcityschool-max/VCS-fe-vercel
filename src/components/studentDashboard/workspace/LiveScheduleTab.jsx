import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectLiveSchedule,
  selectNextSession,
  selectSessions,
  joinLiveSession,
} from "../../../store/slices/studentDashboardSlice";
import { useDateFormatters } from "../../../hooks/useDateFormatters";
import TimezoneTag from "../../ui/TimezoneTag";
import { toastManager } from "../../../utils/toastManager";
import DigitalSessionClock from "../../common/DigitalSessionClock";
import IssueInJoiningClassBanner from "../../common/IssueInJoiningClassBanner";
import { getSessionPhase, isSessionOver } from "../../../utils/helper/StartSession";

const LiveScheduleTab = ({ onOpenWeeklyPlanner }) => {
  const dispatch = useDispatch();
  const liveSchedule = useSelector(selectLiveSchedule) || [];
  const allSessions = useSelector(selectSessions) || [];
  const nextSession = useSelector(selectNextSession);
  const { timezone, timezoneAbbr, formatTime, formatDate } = useDateFormatters();

  const [activeFilter, setActiveFilter] = useState("all");
  const [joiningId, setJoiningId] = useState(null);

  // Merge and deduplicate sessions from /classroom/sessions/ and live_schedule
  const sessions = useMemo(() => {
    const map = new Map();
    (allSessions || []).forEach((s) => {
      const id = s.id || s.session_id;
      if (id) map.set(id, s);
    });
    (liveSchedule || []).forEach((s) => {
      const id = s.id || s.session_id;
      if (id) {
        map.set(id, { ...(map.get(id) || {}), ...s });
      }
    });
    const list = Array.from(map.values());
    return list.sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      return new Date(b.scheduled_at) - new Date(a.scheduled_at);
    });
  }, [allSessions, liveSchedule]);

  // The immediate next class spotlight
  const nextClass = useMemo(() => {
    if (nextSession && !isSessionOver(nextSession)) return nextSession;
    const upcoming = [...sessions]
      .filter((s) => s.scheduled_at && !isSessionOver(s))
      .sort((a, b) => {
        if (a.status === "live" && b.status !== "live") return -1;
        if (b.status === "live" && a.status !== "live") return 1;
        return new Date(a.scheduled_at) - new Date(b.scheduled_at);
      });
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [nextSession, sessions]);

  // Real-time minutes remaining calculation for the spotlight class
  const [minsToNext, setMinsToNext] = useState(null);

  useEffect(() => {
    if (!nextClass?.scheduled_at) {
      setMinsToNext(null);
      return;
    }
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

  const nextPhase = nextClass ? getSessionPhase(nextClass) : null;
  const isNextJoinable = Boolean(
    nextClass && nextPhase !== "ended" && nextPhase !== "cancelled" && (
      nextClass.meeting_link ||
      nextPhase === "live" ||
      nextClass.can_join === true
    )
  );

  const handleJoinClass = async (sessionToJoin) => {
    if (!sessionToJoin) return;
    const sId = sessionToJoin.id || sessionToJoin.session_id;
    if (!sId) {
      toastManager.error("Invalid session identifier");
      return;
    }

    setJoiningId(sId);
    try {
      const result = await dispatch(joinLiveSession(sId)).unwrap();
      const link = result?.meeting_link || sessionToJoin.meeting_link;
      if (link && typeof link === "string" && link.startsWith("http")) {
        window.open(link, "_blank", "noopener,noreferrer");
      } else {
        toastManager.error("Google Meet link not available yet. Please notify admin or faculty.");
      }
    } catch (err) {
      const fallbackLink = sessionToJoin.meeting_link;
      if (fallbackLink && typeof fallbackLink === "string" && fallbackLink.startsWith("http")) {
        window.open(fallbackLink, "_blank", "noopener,noreferrer");
      } else {
        toastManager.error(
          typeof err === "string" ? err : err?.message || "Failed to join session. Meet link unavailable."
        );
      }
    } finally {
      setJoiningId(null);
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "today") {
      if (!s.scheduled_at) return false;
      try {
        const todayStr = new Intl.DateTimeFormat("en-CA", {
          timeZone: timezone || undefined,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());
        const sessionDateStr = new Intl.DateTimeFormat("en-CA", {
          timeZone: timezone || undefined,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(s.scheduled_at));
        return todayStr === sessionDateStr && !isSessionOver(s);
      } catch (e) {
        const date = new Date(s.scheduled_at);
        const today = new Date();
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      }
    }
    if (activeFilter === "upcoming") {
      return !isSessionOver(s);
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
              Live classes are initiated by VCS Administration and Faculty. Students can enter the Google Meet room starting <strong>20 minutes before each class</strong>.
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

      {/* Prominent Flashing Trouble-Joining Banner */}
      <IssueInJoiningClassBanner variant="banner" />

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
                {nextClass.course_title || (nextClass.course && nextClass.course.title) || nextClass.title}
              </h2>

              <p className="text-sm font-semibold text-indigo-200">
                {nextClass.title || nextClass.course_title}
              </p>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-user-tie text-indigo-400" />
                  Faculty: <strong className="text-white">{nextClass.teacher_name || nextClass.instructor_name || "Assigned Instructor"}</strong>
                </span>

                <span className="flex items-center gap-1.5 font-mono">
                  <i className="far fa-clock text-indigo-400" />
                  {nextClass.scheduled_at ? (
                    `${formatTime(nextClass.scheduled_at, timezone)} (${timezoneAbbr}) • ${formatDate(nextClass.scheduled_at, timezone)}`
                  ) : (
                    "Schedule Pending"
                  )}
                </span>
              </div>
            </div>

            {/* Action Join Box with Digital Clock */}
            <div className="shrink-0 flex flex-col items-start lg:items-end gap-3">
              <DigitalSessionClock
                scheduledAt={nextClass.scheduled_at}
                status={nextClass.status}
                variant="hero"
              />

              {isNextJoinable && (
                <div className="space-y-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleJoinClass(nextClass)}
                    disabled={joiningId === (nextClass.id || nextClass.session_id) || nextPhase === "upcoming"}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-black transition ${
                      nextPhase === "upcoming"
                        ? "bg-slate-700/60 text-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-xl shadow-emerald-900/40 cursor-pointer"
                    }`}
                  >
                    <i className="fas fa-video text-base" />
                    <span>
                      {joiningId === (nextClass.id || nextClass.session_id)
                        ? "Entering Class..."
                        : nextPhase === "upcoming"
                        ? `Join opens at ${formatTime(new Date(new Date(nextClass.scheduled_at).getTime() - 20 * 60000).toISOString(), timezone)}`
                        : nextPhase === "live"
                        ? "Join Google Meet (Live Now)"
                        : minsToNext !== null && minsToNext > 0
                        ? `Join Google Meet (Starts in ${minsToNext}m)`
                        : "Join Google Meet"}
                    </span>
                  </button>
                  {nextPhase !== "upcoming" && (
                    <p className="text-[11px] text-emerald-400 text-center lg:text-right font-medium">
                      <i className="fas fa-check-circle mr-1" />
                      Direct classroom link active
                    </p>
                  )}
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
                  Live classes initiated by administration or faculty will appear here. Links unlock 20 minutes before start.
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
              const sId = session.id || session.session_id;
              const diffMins = session.scheduled_at
                ? Math.floor((new Date(session.scheduled_at).getTime() - Date.now()) / 60000)
                : null;
              const phase = getSessionPhase(session);
              const isOver = phase === "ended" || phase === "cancelled";

              return (
                <div
                  key={sId}
                  className="p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                        {session.course_title || (session.course && session.course.title) || session.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {phase === "live"
                          ? "LIVE NOW"
                          : isOver
                          ? phase.toUpperCase()
                          : diffMins !== null && diffMins > 0
                          ? `STARTS IN ${diffMins}M`
                          : "JOIN CLASS"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate">
                      {session.title || session.course_title}
                    </h4>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Faculty: <span className="text-slate-200 font-semibold">{session.teacher_name || session.instructor_name || "Assigned Faculty"}</span> • {session.room || "Google Meet"}
                    </p>

                    <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                      <i className="far fa-clock text-slate-500" />
                      {session.scheduled_at ? (
                        <>
                          <span>{formatTime(session.scheduled_at, timezone)} <TimezoneTag /></span>
                          <span>•</span>
                          <span>{formatDate(session.scheduled_at, timezone)}</span>
                        </>
                      ) : (
                        <span>Schedule Pending</span>
                      )}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    {session.scheduled_at && (
                      <DigitalSessionClock
                        scheduledAt={session.scheduled_at}
                        status={session.status}
                        variant="card"
                      />
                    )}

                    {!isOver && (
                    <button
                      onClick={() => handleJoinClass(session)}
                      disabled={joiningId === sId || phase === "upcoming"}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                        phase === "upcoming"
                          ? "bg-slate-700/60 text-slate-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-900/30 cursor-pointer"
                      }`}
                    >
                      <i className="fas fa-video text-xs" />
                      <span>
                        {joiningId === sId
                          ? "Entering Class..."
                          : phase === "upcoming"
                          ? `Join opens at ${formatTime(new Date(new Date(session.scheduled_at).getTime() - 20 * 60000).toISOString(), timezone)}`
                          : phase === "live"
                          ? "Join Class (Live Now)"
                          : "Join Class (Google Meet)"}
                      </span>
                    </button>
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
            <div className="pt-2">
              <IssueInJoiningClassBanner variant="alert" className="max-w-lg mx-auto text-left" />
            </div>
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
