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
import { showApiError } from "../../utils/apiErrorHandler";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { getWindowLabel, isWithinSessionWindow } from "../../components/common/StartSession";


const TeacherPortal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [studentsModal, setStudentsModal] = useState(null);
  const [endSessionConfirm, setEndSessionConfirm] = useState({ open: false, sessionId: null });

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
    const sessionId = session?.id ?? session?.session_id;
    const fallbackLink = session?.meeting_link;
    try {
      const result = await dispatch(startLiveSession(sessionId)).unwrap();
      const meetingLink = result?.meeting_link || fallbackLink;

      if (meetingLink && meetingLink.startsWith("http")) {
        try {
          new URL(meetingLink);
          window.open(meetingLink, "_blank", "noopener,noreferrer");
        } catch {
          toastManager.error("Invalid meeting link format");
        }
      } else {
        toastManager.error("No valid meeting link found");
      }

      await dispatch(fetchTeacherDashboard()).unwrap();
    } catch (err) {
      showApiError(err);
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const result = await dispatch(joinLiveSession(sessionId)).unwrap();
      const meetingLink = result?.meeting_link;

      if (meetingLink && meetingLink.startsWith("http")) {
        try {
          new URL(meetingLink);
          window.open(meetingLink, "_blank", "noopener,noreferrer");
        } catch {
          toastManager.error("Invalid meeting link format");
        }
      } else {
        toastManager.error("No valid meeting link found");
      }
      await dispatch(fetchTeacherDashboard()).unwrap();
    } catch (err) {
      showApiError(err);
    }
  };

  const handleEndSession = (sessionId) => {
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
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-32 bg-slate-800 rounded-3xl" />
          <div className="h-32 bg-slate-800 rounded-3xl" />
          <div className="h-32 bg-slate-800 rounded-3xl" />
        </div>
        <div className="h-64 bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (errorDashboard && !dashboard) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-400">
        {errorDashboard}
      </div>
    );
  }

  return (
    <div id="teacher-view" className="text-white space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-4">
        <div className="xl:col-span-6 bg-linear-to-br from-indigo-600 to-indigo-700 px-6 py-5 rounded-2xl shadow-xl relative overflow-hidden border border-indigo-400/20">
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-black font-poppins mb-1 text-white">
              Welcome, {dashboard?.teacher?.username || "Instructor"}!
            </h2>
            <p className="text-indigo-100 text-sm font-medium">
              You have {dashboard?.upcoming_sessions_count || 0} Live Sessions.
            </p>
          </div>
          <i className="fas fa-sparkles absolute top-4 right-5 text-5xl text-white/10"></i>
        </div>

        {/* <div className="lg:col-span-3 bg-slate-900 border border-slate-800 px-6 py-5 rounded-2xl flex flex-col justify-center text-center">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4">
            Total Students
          </p>
          <h3 className="text-4xl font-black text-white leading-none">
            {dashboard?.total_students || 0}
          </h3>
        </div> */}
        <div className="lg:col-span-2 flex items-center lg:justify-start ml-4">
          <button
            type="button"
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="w-full lg:w-auto self-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <i className="fas fa-bullhorn"></i>
            <span>Post Announcement</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-10 gap-4">
        <div className="xl:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-poppins">Today's Schedule</h3>
            <span className="text-xs text-slate-400">
              {dashboard?.todays_schedule?.length || 0} sessions
            </span>
          </div>

          {dashboard?.todays_schedule?.length ? (
            dashboard.todays_schedule.map((session) => (
              <div
                key={session.id}
                className="bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-indigo-500/60 transition group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="text-indigo-400 font-black text-xs sm:text-sm whitespace-nowrap">
                    {new Date(session.schedule_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-white group-hover:text-indigo-400 transition truncate">
                      {session.title}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">
                      {session.course_title} • {session.total_learners} Learners
                    </p>
                  </div>
                </div>

                {session.status === "scheduled" && (() => {
                  // const canStart = isWithinSessionWindow(session.schedule_at);
                  let canStart = true
                  const windowLabel = getWindowLabel(session.schedule_at);
                  return (
                    <div className="relative group">
                      <button
                        onClick={() => canStart && handleStartSession(session)}
                        disabled={isJoiningSession || !canStart}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                          canStart
                            ? "bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
                            : "border border-slate-600 text-slate-500 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <i className="fas fa-play"></i>
                        <span>Start Session</span>
                      </button>
                      {canStart && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-700 border border-slate-600 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                          <p className="font-semibold text-slate-300 mb-0.5">Time to start</p>
                          <p className="text-white font-bold">{windowLabel || "Check schedule"}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {session.status === "live" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleJoinSession(session.id)}
                      disabled={isJoiningSession}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                    >
                      <i className="fas fa-video"></i>
                      <span>Join Session</span>
                    </button>
                    <button
                      onClick={() => handleEndSession(session.id)}
                      disabled={isJoiningSession}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <i className="fas fa-stop"></i>
                      <span>End Session</span>
                    </button>
                  </div>
                )}

                {session.status === "ended" && (
                  <span className="text-slate-400 text-sm font-medium">
                    Session Ended
                  </span>
                )}

                {session.status === "cancelled" && (
                  <span className="text-rose-400 text-sm font-medium">
                    Cancelled
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-400 text-sm">
              No sessions scheduled for today.
            </div>
          )}

          <h2 className="text-lg font-black font-poppins pt-2 flex items-center gap-3">
            <i className="fas fa-book text-indigo-400"></i>
            My Courses
          </h2>

          <div className="space-y-4">
            {loadingCourses ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-slate-800 rounded-2xl" />
                <div className="h-20 bg-slate-800 rounded-2xl" />
              </div>
            ) : myCourses?.length ? (
              myCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-indigo-500 transition cursor-pointer group"
                  onClick={() =>
                    setStudentsModal({ id: course.id, title: course.title })
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white group-hover:text-indigo-400 transition">
                        {course.title}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                        {course.category} • {course.total_enrolled} students
                      </p>
                    </div>

                    <div className="text-right">
                      {/* <p className="text-yellow-400 font-bold text-xs sm:text-sm">
                        ⭐ {Number(course.rating || 0).toFixed(1)}
                      </p> */}
                      <p className="text-[10px] text-slate-500 uppercase">
                        {course.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-400 text-sm">
                No courses available.
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
          {/* <h3 className="text-lg font-bold font-poppins text-rose-500">
            Risk Alerts
          </h3> */}

          {/* <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-2xl space-y-3 shadow-xl">
            {dashboard?.risk_alerts?.length ? (
              dashboard.risk_alerts.map((alert, i) => (
                <div
                  key={`${alert.student_id}-${i}`}
                  // onClick={() => navigate(`/student/${alert.student_id}`)}
                  className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-rose-500/20 cursor-pointer hover:bg-rose-500/10 transition group"
                >
                  <div>
                    <p className="font-bold text-white group-hover:text-rose-400">
                      {alert.student_name}
                    </p>
                    <p className="text-[10px] text-rose-500 uppercase font-black tracking-widest">
                      {alert.alert_type?.replaceAll("_", " ") || "Risk Alert"}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      {alert.course_title} • {alert.attendance_percentage}%
                      attendance
                    </p>
                  </div>

                  <button
                    type="button"
                    className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-md"
                  >
                    Review
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-400 text-sm">
                No risk alerts right now.
              </div>
            )}
          </div> */}

          <h2 className="text-lg font-black font-poppins pt-2 flex items-center gap-3">
            <i className="fas fa-tasks text-indigo-400"></i>
            Assignments
          </h2>

          <div className="space-y-4">
            {loadingAssignments ? null : assignments?.length ? (
              assignments.map((a) => (
                <div
                  key={a.id}
                  className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-indigo-500 transition group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white group-hover:text-indigo-400 transition">
                        {a.title}
                      </p>

                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                        {a.course_title}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        {a.submissions_count} submission(s) • Total{" "}
                        {a.max_score}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-xs font-bold ${
                          a.is_overdue ? "text-rose-500" : "text-emerald-400"
                        }`}
                      >
                        {a.is_overdue ? "Overdue" : "Active"}
                      </p>

                      <p className="text-[10px] text-slate-500">
                        Due: {new Date(a.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-400 text-sm">
                No assignments available.
              </div>
            )}
          </div>
        </div>
      </div>

      {studentsModal && (
        <CourseStudentsModal
          courseId={studentsModal.id}
          courseTitle={studentsModal.title}
          onClose={() => setStudentsModal(null)}
          canUnenroll={false}
        />
      )}

      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Post Announcement</h3>
              <button
                type="button"
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
              />

              <textarea
                placeholder="Write announcement..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white"
                >
                  <option value="">School-wide</option>
                  {myCourses?.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleCreateAnnouncement}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={endSessionConfirm.open}
        variant="warning"
        title="End Session"
        message="Are you sure you want to end this session? This cannot be undone and students will not be able to rejoin."
        confirmLabel="End Session"
        cancelLabel="Cancel"
        onConfirm={confirmEndSession}
        onCancel={() => setEndSessionConfirm({ open: false, sessionId: null })}
      />
    </div>
  );
};

export default TeacherPortal;
