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
        <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
          Live Now
        </span>
      );
    }
    if (session.left_at) {
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
          const isThisLoading = loadingSessionId === sessionId;

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
                  {getStatusBadge(session)}
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
                {session?.status === "ended" || session.left_at ? (
                  <span className="text-slate-500 text-sm font-semibold uppercase tracking-widest">
                    {session.status}
                  </span>
                ) : session?.has_joined ? (
                  <>
                    <button
                      onClick={() => handleJoinSession(session)}
                      disabled={isThisLoading || isJoiningSession}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/40 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isThisLoading && loadingAction === "join" ? (
                        <><i className="fas fa-spinner fa-spin"></i> Joining...</>
                      ) : (
                        <><i className="fas fa-video"></i> Join Session</>
                      )}
                    </button>
                    <button
                      onClick={() => handleEndSession(session)}
                      disabled={isThisLoading || isJoiningSession}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-rose-900/40 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isThisLoading && loadingAction === "end" ? (
                        <><i className="fas fa-spinner fa-spin"></i> Ending...</>
                      ) : (
                        <><i className="fas fa-stop-circle"></i> End Session</>
                      )}
                    </button>
                  </>
                ) : (
                  /* scheduled */
                  <button
                    onClick={() => handleJoinSession(session)}
                    disabled={isThisLoading || isJoiningSession}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/40 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isThisLoading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Joining...</>
                    ) : (
                      <><i className="fas fa-video"></i> Join Session</>
                    )}
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
        title="Leave Session"
        message="Are you sure you want to end this session? This cannot be undone and you will not be able to rejoin."
        confirmLabel="End Session"
        cancelLabel="Cancel"
        onConfirm={confirmEndSession}
        onCancel={() => setEndConfirm({ open: false, session: null })}
      />
    </section>
  );
};

export default LiveScheduleList;
