import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeacherDashboard,
  fetchMyCourses,
  fetchAssignments,
  joinLiveSession,
  startLiveSession,
  endLiveSession,
} from "../../store/slices/teacherSlice";
import { createAnnouncement } from "../../store/slices/announcementsSlice";
import { toastManager } from "../../utils/toastManager";
import CourseStudentsModal from "../../components/courses/CourseStudentsModal";
import { showApiError, extractApiErrorMessage } from "../../utils/apiErrorHandler";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { getWindowLabel, isWithinSessionWindow, isSessionExpired, handleJoinSession } from "../../utils/helper/StartSession";
import { useDateFormatters } from "../../hooks";
import { adminTeacherSessionService } from "../../services/adminTeacherSessionService";
import TimezoneTag from "../../components/ui/TimezoneTag";
import SessionCountdown from "../../components/common/SessionCountdown";
import StudentSessionCard from "../../components/sessions/StudentSessionCard";
import TeacherSessionCard from "../../components/sessions/TeacherSessionCard";
import CourseCard from "../../components/courses/CourseCard";

const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const fmtDate = (d) => {
  if (!d) return "";
  const [y, mo, day] = d.split("-").map(Number);
  return new Date(y, mo - 1, day).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
};

// Convert a naive date+time string that lives in `tz` into UTC milliseconds.
// Uses Intl.DateTimeFormat.formatToParts — reliable across all browsers.
const tzToUTCMs = (dateStr, timeStr, tz) => {
  if (!tz) return new Date(`${dateStr}T${timeStr}`).getTime();
  const naiveUTC = new Date(`${dateStr}T${timeStr}Z`).getTime();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(new Date(naiveUTC));
  const g = (t) => parts.find((p) => p.type === t)?.value ?? "00";
  const h = g("hour") === "24" ? "00" : g("hour");
  const tzUTC = Date.parse(`${g("year")}-${g("month")}-${g("day")}T${h}:${g("minute")}:${g("second")}Z`);
  return naiveUTC + (naiveUTC - tzUTC);
};

const isSlotJoinable = (slot, tz) => {
  const now      = Date.now();
  const startUTC = tzToUTCMs(slot.date, slot.start_time, tz);
  const endUTC   = tzToUTCMs(slot.date, slot.end_time,   tz);
  return now >= startUTC - 30 * 60 * 1000 && now <= endUTC + 30 * 60 * 1000;
};

const isSlotExpired = (slot, tz) =>
  Date.now() > tzToUTCMs(slot.date, slot.end_time, tz) + 30 * 60 * 1000;

const openMeetLink = (link) => {
  if (!link || !link.startsWith("http")) return;
  try { new URL(link); window.open(link, "_blank", "noopener,noreferrer"); } catch {}
};

const fmtSlotDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric",
  });


const TeacherPortal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { timezone, formatDate, formatTime, timezoneAbbr } = useDateFormatters();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [studentsModal, setStudentsModal] = useState(null);
  const [endSessionConfirm, setEndSessionConfirm] = useState({ open: false, sessionId: null });
  const [activeSessionTab, setActiveSessionTab] = useState("classes");
  const [tooEarlyOpen, setTooEarlyOpen] = useState(false);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [adminLoadingSessionId, setAdminLoadingSessionId] = useState(null);
  const [adminLoadingAction, setAdminLoadingAction] = useState(null);
  const [leaveAdminConfirm, setLeaveAdminConfirm] = useState({ open: false, sessionId: null });

  const {
    dashboard,
    myCourses,
    assignments,
    loadingDashboard,
    loadingCourses,
    loadingAssignments,
    errorDashboard,
    isJoiningSession,
  } = useSelector((state) => state.teachers);

  const bookedSlots = (dashboard?.upcoming_slots || [])
    .filter((s) => Date.now() <= tzToUTCMs(s.date, "23:59:59", timezone))
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));

  const handleCreateAnnouncement = async () => {
    if (!title.trim() || !body.trim()) {
      toastManager.error("Title and body are required");
      return;
    }

    try {
      setIsSubmitting(true);

      await dispatch(
        createAnnouncement({
          title: title.trim(),
          body: body.trim(),
          ...(courseId ? { course_id: Number(courseId) } : {}),
        }),
      ).unwrap();

      toastManager.success("Announcement posted");

      // reset
      setTitle("");
      setBody("");
      setCourseId("");
      setIsAnnouncementModalOpen(false);
    } catch (err) {
      showApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSession = async (session) => {
    debugger
    if (isSessionExpired(session?.schedule_at)) {
      setSessionExpiredOpen(true);
      return;
    }
    if (!isWithinSessionWindow(session?.schedule_at)) {
      setTooEarlyOpen(true);
      return;
    }
    const sessionId = session?.id ?? session?.session_id;
    const fallbackLink = session?.meeting_link;
    const isMobile = /Mobi|Android|iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const meetWin = isMobile ? null : window.open("", "_blank");
    try {
      const result = await dispatch(startLiveSession(sessionId)).unwrap();
      const meetingLink = result?.meeting_link || fallbackLink;

      if (meetingLink && meetingLink.startsWith("http")) {
        try {
          new URL(meetingLink);
          if (meetWin) meetWin.location.href = meetingLink;
          else window.open(meetingLink, "_blank", "noopener,noreferrer");
        } catch {
          meetWin?.close();
          toastManager.error("Invalid meeting link format");
        }
      } else {
        meetWin?.close();
        toastManager.error("No valid meeting link found");
      }

      await dispatch(fetchTeacherDashboard()).unwrap();
    } catch (err) {
      meetWin?.close();
      const msg = extractApiErrorMessage(err);
      if (msg === "You cannot join before the scheduled time." || msg === "You can join up to 30 minutes before the scheduled time.") {
        setTooEarlyOpen(true);
      } else {
        showApiError(err);
      }
    }
  };

  // const handleJoinSession = async (sessionId, meeting_link, scheduled_at) => {
  //   if (isSessionExpired(scheduled_at)) {
  //     setSessionExpiredOpen(true);
  //     return;
  //   }
  //   if(meeting_link) {
  //     const meetWin = window.open(meeting_link, "_blank");
  //   }
  // };

  const handleEndSession = (sessionId, scheduled_at) => {
    if (isSessionExpired(scheduled_at)) {
      setSessionExpiredOpen(true);
      return;
    }
    setEndSessionConfirm({ open: true, sessionId });
  };

  const confirmEndSession = async () => {
    const { sessionId } = endSessionConfirm;
    setEndSessionConfirm({ open: false, sessionId: null });
    try {
      await dispatch(endLiveSession(sessionId)).unwrap();
      toastManager.success("Session ended successfully");
      await dispatch(fetchTeacherDashboard()).unwrap();
    } catch (err) {
      showApiError(err);
    }
  };

  const handleJoinAdminSession = async (session) => {
    if (isSessionExpired(session?.scheduled_at)) {
      setSessionExpiredOpen(true);
      return;
    }
    if (!isWithinSessionWindow(session?.scheduled_at)) {
      setTooEarlyOpen(true);
      return;
    }
    const sessionId = session?.id ?? session?.session_id;
    setAdminLoadingSessionId(sessionId);
    setAdminLoadingAction("join");
    const isMobile = /Mobi|Android|iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const meetWin = isMobile ? null : window.open("", "_blank");
    try {
      const result = await adminTeacherSessionService.joinSession(sessionId);
      const meetingLink = result?.meeting_link || session?.meeting_link;
      if (meetingLink && meetingLink.startsWith("http")) {
        try {
          new URL(meetingLink);
          if (meetWin) meetWin.location.href = meetingLink;
          else window.open(meetingLink, "_blank", "noopener,noreferrer");
        } catch {
          meetWin?.close();
          toastManager.error("Invalid meeting link format");
        }
      } else {
        meetWin?.close();
        toastManager.error("No valid meeting link found");
      }
      await dispatch(fetchTeacherDashboard()).unwrap();
    } catch (err) {
      meetWin?.close();
      const msg = extractApiErrorMessage(err);
      if (msg === "You cannot join before the scheduled time." || msg === "You can join up to 30 minutes before the scheduled time.") {
        setTooEarlyOpen(true);
      } else {
        showApiError(err);
      }
    } finally {
      setAdminLoadingSessionId(null);
      setAdminLoadingAction(null);
    }
  };

  const handleLeaveAdminSession = (session) => {
    setLeaveAdminConfirm({ open: true, sessionId: session?.id ?? session?.session_id ?? session });
  };

  const confirmLeaveAdminSession = async () => {
    const { sessionId } = leaveAdminConfirm;
    setLeaveAdminConfirm({ open: false, sessionId: null });
    setAdminLoadingSessionId(sessionId);
    setAdminLoadingAction("leave");
    try {
      await adminTeacherSessionService.leaveSession(sessionId);
      toastManager.success("Left session");
      await dispatch(fetchTeacherDashboard()).unwrap();
    } catch (err) {
      showApiError(err);
    } finally {
      setAdminLoadingSessionId(null);
      setAdminLoadingAction(null);
    }
  };

  useEffect(() => {
    dispatch(fetchTeacherDashboard());
    dispatch(fetchMyCourses());
    dispatch(fetchAssignments());

    // const interval = setInterval(() => {
    //   dispatch(fetchTeacherDashboard());
    // }, 3000);

    // return () => clearInterval(interval);
  }, [dispatch]);

  if (loadingDashboard && !dashboard) {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Header Skeleton */}
        <div className="h-48 bg-slate-800/30 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
          <div className="h-full flex flex-col justify-center px-10 space-y-4">
            <div className="w-64 h-8 bg-slate-700/50 rounded-xl" />
            <div className="w-48 h-4 bg-slate-700/30 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Content Skeleton */}
          <div className="xl:col-span-8 space-y-8">
            <div className="space-y-4">
              <div className="w-40 h-6 bg-slate-800/50 rounded-lg ml-2" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-800/30 rounded-3xl border border-white/5" />
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="w-40 h-6 bg-slate-800/50 rounded-lg ml-2" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-32 bg-slate-800/30 rounded-[2rem] border border-white/5" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="xl:col-span-4 space-y-8">
            <div className="w-40 h-6 bg-slate-800/50 rounded-lg ml-2" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-800/30 rounded-3xl border border-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // if (errorDashboard && !dashboard) {
  //   return (
  //     <div className="min-h-[60vh] flex items-center justify-center text-red-400">
  //       {errorDashboard}
  //     </div>
  //   );
  // }

  return (
    <div id="teacher-view" className="text-white space-y-8 pb-12 animate-fadeIn">
      {/* --- Dashboard Header --- */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur-xl opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative grid grid-cols-1 xl:grid-cols-10 gap-6 bg-slate-900/50 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] overflow-hidden shadow-2xl">
          {/* Animated Background Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
          
          <div className="xl:col-span-7 relative z-10 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
                <i className="fas fa-chalkboard-teacher text-2xl text-white"></i>
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-black font-poppins tracking-tight text-white">
                  Welcome, {dashboard?.teacher?.display_name || dashboard?.teacher?.username || "Tutor"}!
                </h2>
              </div>
            </div>
          </div>

          <div className="xl:col-span-3 flex items-center justify-center xl:justify-end relative z-10">
            <button
              type="button"
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="group/btn relative px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-indigo-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              <i className="fas fa-bullhorn relative z-10"></i>
              <span className="relative z-10">Post Announcement</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* --- Main Content Area (Sessions & Courses) --- */}
        <div className="xl:col-span-8 space-y-10">
          
          {/* Sessions Section */}
          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3 px-2">
              <div>
                <h3 className="text-2xl font-black font-poppins tracking-tight flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm border border-emerald-500/20">
                    <i className="fas fa-calendar-alt"></i>
                  </span>
                  Upcoming Sessions
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-900/60 border border-white/5 rounded-xl p-1">
                  <button
                    onClick={() => setActiveSessionTab("admin")}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                      activeSessionTab === "admin"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <i className="fas fa-user-shield" />
                    Admin Session
                    {(dashboard?.admin_sessions?.length || 0) > 0 && (
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                        activeSessionTab === "admin" ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-400"
                      }`}>
                        {dashboard.admin_sessions.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveSessionTab("classes")}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                      activeSessionTab === "classes"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <i className="fas fa-chalkboard" />
                    Classes
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                      activeSessionTab === "classes" ? "bg-white/20 text-white" : "bg-slate-700 text-slate-400"
                    }`}>
                      {dashboard?.todays_schedule?.length || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveSessionTab("booked")}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                      activeSessionTab === "booked"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <i className="fas fa-user-clock" />
                    Reserved Slots
                    {bookedSlots.length > 0 && (
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                        activeSessionTab === "booked" ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-400"
                      }`}>
                        {bookedSlots.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Admin Sessions tab ── */}
            {activeSessionTab === "admin" && (
              <div className="max-h-[480px] overflow-y-auto custom-scrollbar pr-1 space-y-4">
                {dashboard?.admin_sessions?.length ? (
                  dashboard.admin_sessions.map((session) => (
                    <StudentSessionCard
                      key={session.id}
                      session={session}
                      isLoading={adminLoadingSessionId === session.id}
                      loadingAction={adminLoadingAction}
                      onJoin={(s) => handleJoinAdminSession(s)}
                      onLeave={(s) => handleLeaveAdminSession(s)}
                      subtitle={<><i className="fas fa-shield-alt text-indigo-500/50" /> Admin Session</>}
                    />
                  ))
                ) : (
                  <div className="bg-slate-900/30 backdrop-blur-md p-12 rounded-[2rem] border border-white/5 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 text-2xl">
                      <i className="fas fa-user-shield"></i>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold text-lg">No Admin Sessions</p>
                      <p className="text-slate-500 text-sm">No admin-scheduled sessions assigned to you.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Booked Students tab ── */}
            {activeSessionTab === "booked" && (
              <div>
                {loadingDashboard ? (
                  <div className="flex items-center gap-3 text-slate-500 text-xs py-8 justify-center">
                    <i className="fas fa-spinner fa-spin" />
                    Loading booked slots…
                  </div>
                ) : bookedSlots.length === 0 ? (
                  <div className="bg-slate-900/30 backdrop-blur-md p-12 rounded-[2rem] border border-white/5 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 text-2xl">
                      <i className="fas fa-user-clock"></i>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold text-lg">No Booked Slots</p>
                      <p className="text-slate-500 text-sm">Students haven't booked any upcoming tutoring slots.</p>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-[480px] overflow-y-auto custom-scrollbar pr-1 space-y-4">
                    {bookedSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="relative group bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-6 shadow-2xl overflow-hidden"
                      >
                        {/* Student avatar */}
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xl shadow-lg">
                          {slot.booked_by_name?.[0]?.toUpperCase() || "S"}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight mb-0.5">
                            {slot.booked_by_name || "Student"}
                          </h4>
                          {slot.booked_by_email && (
                            <p className="text-slate-500 text-xs font-bold tracking-widest mb-3 opacity-60">
                              {slot.booked_by_email}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              <i className="fas fa-calendar text-indigo-400/60" />
                              <span>{fmtDate(slot.date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <i className="fas fa-clock text-indigo-400/60" />
                              <span>{fmt12(slot.start_time)} – {fmt12(slot.end_time)}{" "}<TimezoneTag /></span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <SessionCountdown scheduledAt={new Date(tzToUTCMs(slot.date, slot.start_time, timezone)).toISOString()} status="scheduled" />
                          </div>
                          {slot.note && (
                            <p className="mt-2 text-[11px] text-slate-500 italic truncate max-w-sm">
                              "{slot.note}"
                            </p>
                          )}
                        </div>

                        {/* Badge + Join */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-3">
                          {slot.meeting_link && (
                            <div className="relative group/tip">
                              <button
                                onClick={() => {
                                  if (!isSlotJoinable(slot, timezone)) {
                                    isSlotExpired(slot, timezone) ? setSessionExpiredOpen(true) : setTooEarlyOpen(true);
                                    return;
                                  }
                                  openMeetLink(slot.meeting_link);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                              >
                                <i className="fas fa-video text-[9px]" />
                                Join Session
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 border border-white/10 text-white text-[10px] rounded-xl whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none z-20 shadow-xl">
                                Available 30 min before the session
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Classes tab ── */}
            {activeSessionTab === "classes" && (() => {
              const adminIds = new Set((dashboard?.admin_sessions || []).map((s) => s.id));
              const classSessions = (dashboard?.todays_schedule || []).filter((s) => !adminIds.has(s.id));
              return (
            <div className="max-h-[480px] overflow-y-auto custom-scrollbar pr-1 space-y-4">
              {classSessions.length ? (
                classSessions.map((session) => (
                  <TeacherSessionCard
                    key={session.id}
                    session={session}
                    isLoading={isJoiningSession}
                    onStart={(s) => handleStartSession(s)}
                    onJoin={(s) => handleJoinSession(s.id, s.meeting_link, s.schedule_at)}
                    onEnd={(s) => handleEndSession(s.id, s.schedule_at)}
                    subtitle={
                      <>
                        <i className="fas fa-layer-group text-indigo-500/50" />
                        {session.course_title}
                        <span className="text-slate-700">•</span>
                        <i className="fas fa-users text-indigo-500/50" />
                        {session.total_learners} Learners
                      </>
                    }
                  />
                ))
              ) : (
                <div className="bg-slate-900/30 backdrop-blur-md p-12 rounded-[2rem] border border-white/5 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 text-2xl">
                    <i className="fas fa-calendar-times"></i>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold text-lg">No sessions scheduled</p>
                    <p className="text-slate-500 text-sm">You have no upcoming sessions scheduled.</p>
                  </div>
                </div>
              )}
            </div>
              );
            })()}
          </section>

          {/* My Courses Section */}
          <section className="space-y-6">
            <h3 className="text-2xl font-black font-poppins tracking-tight flex items-center gap-3 px-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm border border-indigo-500/20">
                <i className="fas fa-layer-group"></i>
              </span>
              Academic Portfolio
            </h3>
              {loadingCourses ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />
                ))
              ) : myCourses?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCourses.map((course, i) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    index={i}
                    mode="teacher"
                    onClick={() => setStudentsModal({ id: course.id, title: course.title })}
                  />
                ))}
            </div>
              ) : (
                <div className="bg-slate-900/30 backdrop-blur-md p-12 rounded-[2rem] border border-white/5 text-center flex flex-col items-center gap-4">
                  <p className="text-slate-400 font-bold text-lg">No active courses found</p>
                </div>
              )}
          </section>
        </div>

        {/* --- Sidebar (Assignments) --- */}
        <div className="xl:col-span-4 space-y-10">
          <section className="space-y-6">
            <h3 className="text-2xl font-black font-poppins tracking-tight flex items-center gap-3 px-2">
              <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm border border-purple-500/20">
                <i className="fas fa-tasks"></i>
              </span>
              Task Center
            </h3>

            <div className="space-y-4">
              {loadingAssignments ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-800/50 rounded-3xl animate-pulse" />
                ))
              ) : assignments?.length ? (
                assignments.map((a) => (
                  <div
                    key={a.id}
                    className="group bg-slate-900/60 backdrop-blur-md p-5 rounded-3xl border border-white/5 hover:border-purple-500/40 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white group-hover:text-purple-400 transition truncate">
                          {a.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 truncate">
                          {a.course_title}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        a.is_overdue 
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}>
                        {a.is_overdue ? "Overdue" : "Active"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Submissions</p>
                        <p className="text-sm font-black text-white">{a.submissions_count}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Due Date</p>
                        <p className="text-sm font-black text-white">{formatDate(a.due_date)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-900/30 p-8 rounded-3xl border border-white/5 text-center text-slate-500 font-bold italic">
                  No assignments queued
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* --- Modals & Dialogs --- */}
      {studentsModal && (
        <CourseStudentsModal
          courseId={studentsModal.id}
          courseTitle={studentsModal.title}
          onClose={() => setStudentsModal(null)}
          canUnenroll={false}
        />
      )}

      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden glass">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
                    <i className="fas fa-bullhorn text-white"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-poppins text-white">Broadcast Announcement</h3>
                    <p className="text-sm text-slate-500">Post a message to your students</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition flex items-center justify-center"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Announcement Title</label>
                  <input
                    type="text"
                    placeholder="Enter a descriptive title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Message Content</label>
                  <textarea
                    placeholder="Compose your announcement message here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Audience Range</label>
                    <div className="relative">
                      <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full appearance-none bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                      >
                        <option value="">Global (School-wide)</option>
                        {myCourses?.map((course) => (
                          <option key={course.id} value={course.id}>
                            Course: {course.title}
                          </option>
                        ))}
                      </select>
                      <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none text-xs"></i>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleCreateAnnouncement}
                      disabled={isSubmitting}
                      className="w-full sm:w-40 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                      <span>{isSubmitting ? "Posting" : "Publish"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={leaveAdminConfirm.open}
        variant="warning"
        title="Leave Session"
        message="Are you sure you want to leave this session?"
        confirmLabel="Confirm Leave"
        cancelLabel="Cancel"
        onConfirm={confirmLeaveAdminSession}
        onCancel={() => setLeaveAdminConfirm({ open: false, sessionId: null })}
      />

      <ConfirmDialog
        open={endSessionConfirm.open}
        variant="warning"
        title="Terminate Live Session"
        message="This action will immediately disconnect all active students and conclude the recording. This cannot be reversed. Are you sure?"
        confirmLabel="Terminate Now"
        cancelLabel="Abort"
        onConfirm={confirmEndSession}
        onCancel={() => setEndSessionConfirm({ open: false, sessionId: null })}
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

      <ConfirmDialog
        open={sessionExpiredOpen}
        variant="warning"
        title="Session Time Has Passed"
        message="This session's time has already passed. The session window (1 hour from the scheduled time) has ended."
        confirmLabel="Got it"
        cancelLabel={null}
        onConfirm={() => setSessionExpiredOpen(false)}
        onCancel={() => setSessionExpiredOpen(false)}
      />
    </div>
  );

};

export default TeacherPortal;
