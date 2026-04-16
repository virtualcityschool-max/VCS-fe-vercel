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

const TeacherPortal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } catch (err) {
      toastManager.error(
        err?.message || err?.error || "Failed to post announcement",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSession = async (sessionId) => {
    try {
      const result = await dispatch(startLiveSession(sessionId)).unwrap();
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
      toastManager.error(
        err?.error || err?.message || "Failed to start session",
      );
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
      toastManager.error(
        err?.error || err?.message || "Failed to join teacher session",
      );
    }
  };

  const handleEndSession = async (sessionId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to end this session? This action cannot be undone.",
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await dispatch(endLiveSession(sessionId)).unwrap();
      toastManager.success("Session ended successfully");
      // refresh dashboard
      await dispatch(fetchTeacherDashboard()).unwrap();
    } catch (err) {
      toastManager.error(err?.error || err?.message || "Failed to end session");
    }
  };

  useEffect(() => {
    dispatch(fetchTeacherDashboard());
    dispatch(fetchMyCourses());
    dispatch(fetchAssignments());
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
    <div id="teacher-view" className="text-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-linear-to-br from-indigo-600 to-indigo-800 p-8 sm:p-10 rounded-5xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black font-poppins mb-2 text-white">
              Welcome, {dashboard?.teacher?.username || "Instructor"}!
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base font-medium">
              You have {dashboard?.upcoming_sessions_count || 0} Live Sessions.
            </p>
          </div>
          <i className="fas fa-sparkles absolute top-6 sm:top-10 right-6 sm:right-10 text-6xl sm:text-8xl text-white/10"></i>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-5xl flex flex-col justify-center text-center">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4">
            Total Students
          </p>
          <h3 className="text-4xl sm:text-5xl font-black text-white">
            {dashboard?.total_students || 0}
          </h3>
        </div>
      </div>
      {/* CREATE ANNOUNCEMENT */}
      <div className="bg-slate-900 border border-slate-800 rounded-5xl p-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black font-poppins text-white">
            Post Announcement
          </h2>
          <span className="text-[10px] uppercase tracking-widest text-slate-500">
            Teacher Panel
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Title */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="md:col-span-3 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
          />

          {/* Body */}
          <textarea
            placeholder="Write announcement..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="md:col-span-3 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
          />

          {/* Course select */}
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
          >
            <option value="">School-wide</option>
            {myCourses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          {/* Submit */}
          <button
            type="button"
            onClick={handleCreateAnnouncement}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-10">
        <div className="lg:col-span-6 space-y-8">
          <h3 className="text-xl font-bold font-poppins">Today's Schedule</h3>

          {dashboard?.todays_schedule?.length ? (
            dashboard.todays_schedule.map((session) => (
              <div
                key={session.id}
                className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center justify-between hover:border-indigo-500 transition group"
              >
                <div className="flex items-center gap-6">
                  <div className="text-indigo-400 font-black text-sm whitespace-nowrap">
                    {new Date(session.schedule_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <div>
                    <p className="font-bold text-white group-hover:text-indigo-400 transition">
                      {session.title}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      {session.course_title} • {session.total_learners} Learners
                    </p>
                  </div>
                </div>

                {session.status === "scheduled" && (
                  <button
                    onClick={() => handleStartSession(session.id)}
                    disabled={isJoiningSession}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <i className="fas fa-play"></i>
                    <span>Start Session</span>
                  </button>
                )}

                {session.status === "live" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleJoinSession(session.id)}
                      disabled={isJoiningSession}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <i className="fas fa-video"></i>
                      <span>Join Session</span>
                    </button>

                    <button
                      onClick={() => handleEndSession(session.id)}
                      disabled={isJoiningSession}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
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
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-400 text-sm">
              No sessions scheduled for today.
            </div>
          )}

          <h2 className="text-xl font-black font-poppins mb-6 flex items-center gap-3">
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
                  className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500 transition cursor-pointer group"
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
                      <p className="text-yellow-400 font-bold text-sm">
                        ⭐ {Number(course.rating || 0).toFixed(1)}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase">
                        {course.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-400 text-sm">
                No courses available.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <h3 className="text-xl font-bold font-poppins text-rose-500">
            Risk Alerts
          </h3>

          <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-5xl space-y-6 shadow-2xl">
            {dashboard?.risk_alerts?.length ? (
              dashboard.risk_alerts.map((alert, i) => (
                <div
                  key={`${alert.student_id}-${i}`}
                  // onClick={() => navigate(`/student/${alert.student_id}`)}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-rose-500/20 cursor-pointer hover:bg-rose-500/10 transition group"
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
                    className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase shadow-lg"
                  >
                    Review
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-400 text-sm">
                No risk alerts right now.
              </div>
            )}
          </div>

          <h2 className="text-xl font-black font-poppins mt-10 mb-6 flex items-center gap-3">
            <i className="fas fa-tasks text-indigo-400"></i>
            Assignments
          </h2>

          <div className="space-y-4">
            {loadingAssignments ? null : assignments?.length ? (
              assignments.map((a) => (
                <div
                  key={a.id}
                  className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500 transition group"
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
                        {a.submissions_count} submissions • Max Score{" "}
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
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-400 text-sm">
                No assignments available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPortal;
