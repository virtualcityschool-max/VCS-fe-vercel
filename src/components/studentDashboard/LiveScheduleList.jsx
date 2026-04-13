import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectLiveSchedule,
  joinLiveSession,
} from "../../store/slices/studentDashboardSlice";
import { toastManager } from "../../utils/toastManager";

const LiveScheduleList = () => {
  const dispatch = useDispatch();
  const liveSchedule = useSelector(selectLiveSchedule);
  const isJoiningSession = useSelector(
    (state) => state.studentDashboard.isJoiningSession,
  );

  const handleJoinSession = async (session) => {
    const sessionId = session?.id || session?.session_id;
    if (!sessionId) {
      toastManager.error("Session information is unavailable");
      return;
    }

    try {
      const result = await dispatch(joinLiveSession(sessionId)).unwrap();
      const meetingLink = result?.meeting_link;

      if (meetingLink && meetingLink.startsWith("http")) {
        // Validate URL format
        try {
          new URL(meetingLink);
          window.open(meetingLink, "_blank", "noopener,noreferrer");
        } catch (urlError) {
          toastManager.error("Invalid meeting link format");
          console.log("URL Error:", urlError);
        }
      } else {
        toastManager.error("No valid meeting link found");
      }
    } catch (error) {
      console.error("Failed to join session:", error);
      toastManager.error("Failed to join session");
    }
  };

  const formatScheduleTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status, canJoin) => {
    if (status === "live") {
      return (
        <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
          Live Now
        </span>
      );
    }
    if (canJoin) {
      return (
        <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          Join Now
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
        {liveSchedule.map((session) => (
          <div
            key={session.id || session.session_id}
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
                {getStatusBadge(session.status, session.can_join)}
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
                    <span
                      className={getAttendanceColor(session.attendance_rate)}
                    >
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

            {/* Action Button */}
            <div className="flex-shrink-0">
              {(() => {
                const canJoinNow =
                  session?.can_join ||
                  session?.status === "live" ||
                  session?.status === "ongoing";

                return canJoinNow ? (
                  <button
                    onClick={() => handleJoinSession(session)}
                    disabled={isJoiningSession}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/40 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isJoiningSession ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Joining...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-video mr-2"></i>
                        Join Live Room
                      </>
                    )}
                  </button>
                ) : (
                  <button className="w-full md:w-auto border border-slate-600 text-white hover:bg-slate-700 px-8 py-4 rounded-2xl font-bold text-sm transition active:scale-95">
                    <i className="fas fa-info-circle mr-2"></i>
                    View Details
                  </button>
                );
              })()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveScheduleList;
