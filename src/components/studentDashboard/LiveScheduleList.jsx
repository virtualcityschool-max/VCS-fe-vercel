import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectLiveSchedule,
  startStudentSession,
  endStudentSession,
  fetchStudentDashboard,
} from "../../store/slices/studentDashboardSlice";
import { toastManager } from "../../utils/toastManager";
import { formatDate, formatScheduleTime } from "../common/StartSession";
import { showApiError } from "../../utils/apiErrorHandler";
import ConfirmDialog from "../common/ConfirmDialog";

const LiveScheduleList = () => {
  const dispatch = useDispatch();
  const liveSchedule = useSelector(selectLiveSchedule);
  const isJoiningSession = useSelector(
    (state) => state.studentDashboard.isJoiningSession,
  );

  const [loadingSessionId, setLoadingSessionId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null); // 'join' | 'end'
  const [endConfirm, setEndConfirm] = useState({ open: false, session: null });

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
    setLoadingAction("join");
    try {
      const result = await dispatch(startStudentSession(sessionId)).unwrap();
      const meetingLink = result?.meeting_link || session?.meeting_link;
      openMeetingLink(meetingLink);
      dispatch(fetchStudentDashboard());
    } catch (err) {
      showApiError(err);
    } finally {
      setLoadingSessionId(null);
      setLoadingAction(null);
    }
  };

  const handleEndSession = (session) => {
    setEndConfirm({ open: true, session });
  };

  const confirmEndSession = async () => {
    const { session } = endConfirm;
    setEndConfirm({ open: false, session: null });
    const sessionId = session?.session_id ?? session?.id;
    setLoadingSessionId(sessionId);
    setLoadingAction("end");
    try {
      await dispatch(endStudentSession(sessionId)).unwrap();
      toastManager.success("Session ended");
      dispatch(fetchStudentDashboard());
    } catch (err) {
      toastManager.error(err?.error || err?.message || "Failed to end session");
    } finally {
      setLoadingSessionId(null);
      setLoadingAction(null);
    }
  };

  const getStatusBadge = (session) => {
    if (session.has_joined) {
      return (
        <span className="bg-red-600/10 text-red-400 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-red-500/10 animate-pulse">
          Live Now
        </span>
      );
    }
    if (session.left_at) {
      return (
        <span className="bg-slate-800/50 text-slate-500 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-white/5">
          Ended
        </span>
      );
    }
    return (
      <span className="bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-blue-500/10">
        Scheduled
      </span>
    );
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return "text-emerald-400";
    if (rate >= 75) return "text-amber-400";
    if (rate >= 60) return "text-orange-400";
    return "text-red-400";
  };

  if (!liveSchedule || liveSchedule.length === 0) {
    return (
      <section>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
         My Live Schedule
        </h2>
        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[1.5rem] border border-white/5 text-center shadow-2xl transition-all duration-500 hover:border-white/10">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
            <i className="fas fa-calendar-times text-xl text-slate-600"></i>
          </div>
          <h3 className="text-sm font-black text-white/80 mb-1">
            No Live Sessions Scheduled
          </h3>
          <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
            Check back later for upcoming live sessions
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
        Active Schedule
      </h2>
      <div className="space-y-4">
        {liveSchedule.map((session) => {
          const sessionId = session?.session_id ?? session?.id;
          const isThisLoading = loadingSessionId === sessionId;

          return (
            <div
              key={sessionId}
              className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-6 hover:bg-white/5 transition-all duration-300 group shadow-2xl relative overflow-hidden"
            >
              {/* Dynamic Glow Effect */}
              {session.has_joined && (
                <div className="absolute -left-10 -top-10 w-24 h-24 bg-red-500/5 rounded-full blur-[40px]"></div>
              )}

              {/* Instructor Avatar - Compact */}
              <div className="flex-shrink-0 relative z-10">
                {session.instructor_avatar ? (
                  <img
                    src={session.instructor_avatar}
                    alt={session.instructor_name}
                    className="w-16 h-16 rounded-2xl border border-white/10 object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-500 font-black text-xl shadow-lg">
                    {session.instructor_name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Session Info - Compact */}
              <div className="flex-1 min-w-0 relative z-10 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                  <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors truncate tracking-tight">
                    {session.course_title}
                  </h4>
                  {getStatusBadge(session)}
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 opacity-60">
                  {session.instructor_name}
                </p>

                {/* Schedule Info */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3">
                  <div className="flex items-center gap-1.5">
                    <i className="fas fa-calendar text-blue-400/60"></i>
                    <span>{formatDate(session.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="fas fa-clock text-indigo-400/60"></i>
                    <span>{formatScheduleTime(session.scheduled_at)}</span>
                  </div>
                </div>

                {/* Attendance Rate - Slim */}
                {session.attendance_rate !== null && (
                  <div className="w-full max-w-[200px] mx-auto md:mx-0">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.15em] mb-1.5">
                      <span className="text-slate-500 opacity-60">Presence</span>
                      <span className={getAttendanceColor(session.attendance_rate)}>
                        {session.attendance_rate}%
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          session.attendance_rate >= 90
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                            : session.attendance_rate >= 75
                              ? "bg-amber-500"
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

              {/* Action Buttons - Compact */}
              <div className="flex-shrink-0 flex flex-row md:flex-col gap-2 relative z-10">
                {session?.status === "ended" || session.left_at ? (
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 border border-white/5 rounded-xl">
                    {session.status}
                  </span>
                ) : session?.has_joined ? (
                  <>
                    <button
                      onClick={() => handleJoinSession(session)}
                      disabled={isThisLoading || isJoiningSession}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isThisLoading && loadingAction === "join" ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-video"></i>
                      )}
                      Resume
                    </button>
                    <button
                      onClick={() => handleEndSession(session)}
                      disabled={isThisLoading || isJoiningSession}
                      className="bg-red-600/10 hover:bg-red-600/20 text-red-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isThisLoading && loadingAction === "end" ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-stop-circle"></i>
                      )}
                      Exit
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleJoinSession(session)}
                    disabled={isThisLoading || isJoiningSession}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isThisLoading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-play text-[10px]"></i>
                    )}
                    Start Class
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={endConfirm.open}
        variant="warning"
        title="Exit Session"
        message="Are you sure you want to end this session? This will finalize your attendance for today."
        confirmLabel="Confirm Exit"
        cancelLabel="Cancel"
        onConfirm={confirmEndSession}
        onCancel={() => setEndConfirm({ open: false, session: null })}
      />
    </section>
  );
};

export default LiveScheduleList;
