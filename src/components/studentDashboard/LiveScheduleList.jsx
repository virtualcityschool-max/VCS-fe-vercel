import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectLiveSchedule,
  startStudentSession,
  endStudentSession,
  fetchStudentDashboard,
} from "../../store/slices/studentDashboardSlice";
import { toastManager } from "../../utils/toastManager";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import { getWindowLabel, isWithinSessionWindow } from "../../utils/helper/StartSession";
import { extractApiErrorMessage, showApiError } from "../../utils/apiErrorHandler";
import ConfirmDialog from "../common/ConfirmDialog";
import { availabilityService } from "../../services/availabilityService";

const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric",
  });

const LiveScheduleList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const liveSchedule = useSelector(selectLiveSchedule);
  const { formatDate, formatTime, timezone, timezoneAbbr } = useDateFormatters();
  const isJoiningSession = useSelector(
    (state) => state.studentDashboard.isJoiningSession,
  );

  const [activeTab, setActiveTab] = useState("classes");
  const [tutorSlots, setTutorSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [loadingSessionId, setLoadingSessionId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null); // 'join' | 'end'
  const [endConfirm, setEndConfirm] = useState({ open: false, session: null });
  const [tooEarlyOpen, setTooEarlyOpen] = useState(false);

  useEffect(() => {
    setSlotsLoading(true);
    availabilityService.getMyBookings()
      .then((data) => {
        const upcoming = (Array.isArray(data) ? data : [])
          .filter((s) => new Date(s.date + "T23:59:59") >= new Date())
          .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
        setTutorSlots(upcoming);
      })
      .catch(() => setTutorSlots([]))
      .finally(() => setSlotsLoading(false));
  }, []);

  const openMeetingLink = (link, win) => {
    if (!link || !link.startsWith("http")) {
      win?.close();
      toastManager.error("No valid meeting link found");
      return;
    }
    try {
      new URL(link);
      if (win) win.location.href = link;
      else window.open(link, "_blank", "noopener,noreferrer");
    } catch {
      win?.close();
      toastManager.error("Invalid meeting link format");
    }
  };

  // Returns true when now is within 30 min before start through 1 hr after start
  const isSlotJoinable = (slot) => {
    const slotStart = new Date(slot.date + "T" + slot.start_time);
    const now = Date.now();
    return now >= slotStart.getTime() - 30 * 60 * 1000 &&
           now <= slotStart.getTime() + 60 * 60 * 1000;
  };

  const handleJoinSession = async (session) => {
    if (!isWithinSessionWindow(session.scheduled_at)) {
      setTooEarlyOpen(true);
      return;
    }
    const sessionId = session?.session_id ?? session?.id;
    setLoadingSessionId(sessionId);
    setLoadingAction("join");
    const meetWin = window.open("", "_blank");
    try {
      const result = await dispatch(startStudentSession(sessionId)).unwrap();
      const meetingLink = result?.meeting_link || session?.meeting_link;
      openMeetingLink(meetingLink, meetWin);
      dispatch(fetchStudentDashboard());
    } catch (err) {
      meetWin?.close();
      const msg = extractApiErrorMessage(err);
      if ((msg === "You cannot join before the scheduled time.") || (msg === "You can join up to 30 minutes before the scheduled time.")) {
        setTooEarlyOpen(true);
      } else {
        showApiError(err);
      }
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

  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 6);
  const fmtDay = (d) => d.toLocaleDateString([], { month: "short", day: "numeric", ...(timezone ? { timeZone: timezone } : {}) });
  const scheduleRangeLabel = `${fmtDay(today)} – ${fmtDay(end)}`;

  const hasLive = liveSchedule && liveSchedule.length > 0;

  return (
    <section>
      {/* Section header + tabs */}
      <div className="mb-6 border-b border-white/5 pb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-3">
          {hasLive && activeTab === "classes"
            ? <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            : <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />}
          Upcoming Sessions
        </h2>
        <div className="flex items-center gap-3">
          {activeTab === "classes" && (
            <span className="text-[10px] text-slate-600 font-semibold">{scheduleRangeLabel}</span>
          )}
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/60 border border-white/5 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("classes")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeTab === "classes"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <i className="fas fa-chalkboard mr-1.5" />
              Classes
            </button>
            <button
              onClick={() => setActiveTab("tutors")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                activeTab === "tutors"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <i className="fas fa-user-graduate mr-1.5" />
              Reserved Sessions
              {tutorSlots.length > 0 && (
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === "tutors" ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-400"
                }`}>
                  {tutorSlots.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tutors tab ── */}
      {activeTab === "tutors" && (
        <div>
          {slotsLoading ? (
            <div className="flex items-center gap-3 text-slate-500 text-xs py-8 justify-center">
              <i className="fas fa-spinner fa-spin" />
              Loading tutoring sessions…
            </div>
          ) : tutorSlots.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[1.5rem] border border-white/5 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                <i className="fas fa-chalkboard-teacher text-xl text-slate-600" />
              </div>
              <h3 className="text-sm font-black text-white/80 mb-1">No Upcoming Tutoring Sessions</h3>
              <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider mb-4">
                Book a session with a tutor to get started
              </p>
              <button
                onClick={() => navigate("/teachers")}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                <i className="fas fa-search" />
                Find a Tutor
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tutorSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-6 hover:bg-white/5 transition-all duration-300 group shadow-2xl relative overflow-hidden"
                >
                  {/* Teacher avatar */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xl shadow-lg">
                    {slot.teacher_name?.[0]?.toUpperCase() || "T"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 relative z-10 text-center md:text-left">
                    <h4 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight mb-0.5">
                      {slot.teacher_name}
                    </h4>
                    {slot.teacher_email && (
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 opacity-60">
                        {slot.teacher_email}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <i className="fas fa-calendar text-indigo-400/60" />
                        <span>{formatDate(slot.date + "T" + slot.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <i className="fas fa-clock text-indigo-400/60" />
                        <span>{formatTime(slot.date + "T" + slot.start_time)} – {formatTime(slot.date + "T" + slot.end_time)}{timezoneAbbr && ` ${timezoneAbbr}`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badge + actions */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-3 relative z-10">

                    {/* Join Session button (meeting link available) */}
                    {slot.meeting_link && (
                      <div className="relative group/tip">
                        <button
                          onClick={() => {
                            if (!isSlotJoinable(slot)) { setTooEarlyOpen(true); return; }
                            openMeetingLink(slot.meeting_link);
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                        >
                          <i className="fas fa-video text-[9px]" />
                          Join Session
                        </button>
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-800 border border-white/10 text-white text-[10px] rounded-xl whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none z-20 shadow-xl">
                          Available 30 min before the session
                        </div>
                      </div>
                    )}

                    {/* <button
                      onClick={() => navigate(`/teachers/${slot.teacher_id}`, { state: { openSlots: true } })}
                      className="px-5 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      View Tutor
                    </button> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Classes tab ── */}
      {activeTab === "classes" && !hasLive && (
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
      )}

      {activeTab === "classes" && hasLive && (
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
                  Instructor: {session.instructor_name}
                </p>

                {/* Schedule Info */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3">
                  <div className="flex items-center gap-1.5">
                    <i className="fas fa-calendar text-blue-400/60"></i>
                    <span>
                      {/* {new Date(session.scheduled_at).toLocaleDateString([], { weekday: "short" })},{" "} */}
                      {formatDate(session.scheduled_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="fas fa-clock text-indigo-400/60"></i>
                    <span>{formatTime(session.scheduled_at)}{timezoneAbbr && ` ${timezoneAbbr}`}</span>
                  </div>
                  {/* {session.recurring_schedule && (
                    <div className="flex items-center gap-1">
                      <i className="fas fa-repeat"></i>
                      <span>{session.recurring_schedule}</span>
                    </div>
                  )} */}
                </div>

                {/* Attendance Rate - Slim */}
                {session.attendance_rate !== null && (
                  <div className="w-full max-w-[200px] mx-auto md:mx-0">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.15em] mb-1.5">
                      <span className="text-slate-500 opacity-60">Attendance Rate</span>
                      <span className={getAttendanceColor(session.attendance_rate)}>
                        {session.attendance_rate}%
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${session.attendance_rate >= 90
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
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                    >
                      {isThisLoading && loadingAction === "join" ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-video"></i>
                          <span>Join Session</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEndSession(session)}
                      disabled={isThisLoading || isJoiningSession}
                      className="bg-red-600/10 hover:bg-red-600/20 text-red-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                    >
                      {isThisLoading && loadingAction === "end" ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Ending...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-stop-circle"></i>
                          <span>Leave Session</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="relative group/tooltip">
                    <button
                      onClick={() => handleJoinSession(session)}
                      disabled={isThisLoading || isJoiningSession}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[150px]"
                    >
                      {isThisLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-play text-[10px]"></i>
                          <span>Join Session</span>
                        </>
                      )}
                    </button>
                    <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-slate-800 border border-white/10 text-white text-[10px] rounded-xl whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-20 shadow-2xl">
                      <p className="text-slate-400 font-bold uppercase mb-0.5">Join Window</p>
                      <p className="font-black text-white">{getWindowLabel(session.scheduled_at, timezone, timezoneAbbr) || "Check schedule"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      <ConfirmDialog
        open={endConfirm.open}
        variant="warning"
        title="Leave Session"
        message="Are you sure you want to leave this session?"
        confirmLabel="Confirm Leave"
        cancelLabel="Cancel"
        onConfirm={confirmEndSession}
        onCancel={() => setEndConfirm({ open: false, session: null })}
      />

      <ConfirmDialog
        open={tooEarlyOpen}
        variant="primary"
        title="Too Early to Join"
        message="You can join 30 minutes earlier only."
        confirmLabel="Got it"
        cancelLabel={null}
        onConfirm={() => setTooEarlyOpen(false)}
        onCancel={() => setTooEarlyOpen(false)}
      />
    </section>
  );
};

export default LiveScheduleList;
