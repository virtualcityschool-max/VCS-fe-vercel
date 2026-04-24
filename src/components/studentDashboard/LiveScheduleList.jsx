import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectLiveSchedule,
  startStudentSession,
  endStudentSession,
} from "../../store/slices/studentDashboardSlice";
import { toastManager } from "../../utils/toastManager";
import { formatDate, formatScheduleTime, getWindowLabel, isWithinSessionWindow } from "../common/StartSession";

const LiveScheduleList = () => {
  const dispatch = useDispatch();
  const liveSchedule = useSelector(selectLiveSchedule);
  const isJoiningSession = useSelector(
    (state) => state.studentDashboard.isJoiningSession,
  );

  // Track which sessions the student has started (session_id → true)
  const [activeSessionIds, setActiveSessionIds] = useState({});
  // Track which session is currently being acted on
  const [loadingSessionId, setLoadingSessionId] = useState(null);

  const openMeetingLink = (link) => {
    if (!link || !link.startsWith("http")) {
      toastManager.error("No valid meeting link found");
      return;
    }
    try {
      new URL(link);
      window.open(link, "_blank", "noopener,noreferrer");
    } catch {
      toastManager.error("Invalid meeting link format");
    }
  };

  const handleJoinSession = async (session) => {
    const sessionId = session?.session_id ?? session?.id;
    setLoadingSessionId(sessionId);
    try {
      const result = await dispatch(startStudentSession(sessionId)).unwrap();
      const meetingLink = result?.meeting_link || session?.meeting_link;
      openMeetingLink(meetingLink);
      setActiveSessionIds((prev) => ({ ...prev, [sessionId]: true }));
    } catch (err) {
      toastManager.error(err?.error || err?.message || "Failed to join session");
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleEndSession = async (session) => {
    const sessionId = session?.session_id ?? session?.id;
    setLoadingSessionId(sessionId);
    try {
      await dispatch(endStudentSession(sessionId)).unwrap();
      toastManager.success("Session ended");
      setActiveSessionIds((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
    } catch (err) {
      toastManager.error(err?.error || err?.message || "Failed to end session");
    } finally {
      setLoadingSessionId(null);
    }
  };

  

  const getStatusBadge = (session, isActive) => {
    if (isActive) {
      return (
        <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
          In Session
        </span>
      );
    }
    if (session.status === "live") {
      return (
        <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
          Live Now
        </span>
      );
    }
    if (session.status === "ended") {
      return (
        <span className="bg-slate-700 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          Ended
        </span>
      );
    }
    return (
      <span className="bg-slate-700 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
        Scheduled
      </span>
    );
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return "text-green-500";
    if (rate >= 75) return "text-yellow-500";
    if (rate >= 60) return "text-orange-500";
    return "text-red-500";
  };

  if (!liveSchedule || liveSchedule.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-bold font-poppins mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
          My Live Schedule
        </h2>
        <div className="bg-slate-800/50 p-12 rounded-[2.5rem] border border-slate-700 text-center">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-calendar-times text-2xl text-slate-500"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No Live Sessions Scheduled
          </h3>
          <p className="text-slate-500 text-sm">
            Check back later for upcoming live sessions
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-bold font-poppins mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
        My Live Schedule
      </h2>
      <div className="space-y-6">
        {liveSchedule.map((session) => {
          const sessionId = session?.session_id ?? session?.id;
          const isActive = !!activeSessionIds[sessionId];
          const isThisLoading = loadingSessionId === sessionId;
          const canJoin = isWithinSessionWindow(session.recurring_schedule);
          const windowLabel = getWindowLabel(session.recurring_schedule);

          return (
            <div
              key={sessionId}
              className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 flex flex-col md:flex-row items-center gap-8 hover:bg-slate-800/80 transition group shadow-lg"
            >
              {/* Instructor Avatar */}
              <div className="flex-shrink-0">
                {session.instructor_avatar ? (
                  <img
                    src={session.instructor_avatar}
                    alt={session.instructor_name}
                    className="w-20 h-20 rounded-2xl border-2 border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-2 border-slate-700 bg-slate-700 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-500">
                      {session.instructor_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Session Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h4 className="text-xl font-bold group-hover:text-blue-400 transition truncate">
                    {session.course_title}
                  </h4>
                  {getStatusBadge(session, isActive)}
                </div>
                <p className="text-slate-500 text-sm mb-4">
                  Instructor: {session.instructor_name}
                </p>

                {/* Schedule Info */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <i className="fas fa-calendar"></i>
                    <span>{formatDate(session.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="fas fa-clock"></i>
                    <span>{formatScheduleTime(session.scheduled_at)}</span>
                  </div>
                  {session.recurring_schedule && (
                    <div className="flex items-center gap-1">
                      <i className="fas fa-repeat"></i>
                      <span>{session.recurring_schedule}</span>
                    </div>
                  )}
                </div>

                {/* Attendance Rate */}
                {session.attendance_rate !== null && (
                  <div className="w-full max-w-sm">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                      <span className="text-slate-500">Attendance Rate</span>
                      <span className={getAttendanceColor(session.attendance_rate)}>
                        {session.attendance_rate}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          session.attendance_rate >= 90
                            ? "bg-green-500"
                            : session.attendance_rate >= 75
                              ? "bg-yellow-500"
                              : session.attendance_rate >= 60
                                ? "bg-orange-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${session.attendance_rate}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex flex-col gap-2">
                {session?.status === "ended" && !isActive ? (
                  <button
                    disabled
                    className="border border-slate-600 text-slate-500 cursor-not-allowed px-8 py-4 rounded-2xl font-bold text-sm"
                  >
                    <i className="fas fa-check-circle mr-2"></i>
                    Session Ended
                  </button>
                ) : isActive ? (
                  /* Student has joined — show End Session */
                  <button
                    onClick={() => handleEndSession(session)}
                    disabled={isThisLoading || isJoiningSession}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-rose-900/40 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isThisLoading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Ending...</>
                    ) : (
                      <><i className="fas fa-stop-circle"></i> End Session</>
                    )}
                  </button>
                ) : (
                  /* Join Session — gated by time window */
                  <div className="relative group/btn">
                    <button
                      onClick={() => canJoin && handleJoinSession(session)}
                      disabled={!canJoin || isThisLoading || isJoiningSession}
                      className={`px-8 py-4 rounded-2xl font-bold text-sm transition active:scale-95 flex items-center gap-2 ${
                        canJoin
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                          : "border border-slate-600 text-slate-500 cursor-not-allowed opacity-60"
                      }`}
                    >
                      {isThisLoading ? (
                        <><i className="fas fa-spinner fa-spin"></i> Joining...</>
                      ) : (
                        <><i className="fas fa-video"></i> Join Session</>
                      )}
                    </button>
                    {!canJoin && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-700 border border-slate-600 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                        <p className="font-semibold text-slate-300 mb-0.5">Time to join</p>
                        <p className="text-white font-bold">{windowLabel || session.recurring_schedule}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LiveScheduleList;
