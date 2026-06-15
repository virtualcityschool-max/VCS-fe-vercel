import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudentSessions,
  fetchStudentDashboard,
} from "../../store/slices/studentDashboardSlice";
import SessionCalendarView from "../../components/common/SessionCalendarView";
import axiosInstance from "../../utils/axiosInstance";
import { FilterSelect } from "../../components/ui";
import TimezoneTag from "../../components/ui/TimezoneTag";
import { useDateFormatters } from "../../hooks";

const STATUS_COLORS = {
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  live:      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ended:     "bg-slate-500/10 text-slate-400 border-slate-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const SessionListView = ({ sessions, formatTime, formatDate }) => {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)
  );

  if (!sorted.length) return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
      <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-calendar text-slate-400 text-xl" />
      </div>
      <p className="text-white font-bold mb-1">No Classes Found</p>
      <p className="text-slate-400 text-sm">No sessions available yet.</p>
    </div>
  );

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="divide-y divide-slate-800/40">
        {sorted.map((session) => (
          <div key={session.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/20 transition">
            <div className={`w-0.5 h-10 rounded-full shrink-0 ${
              session.status === "live" ? "bg-emerald-400/70" :
              session.status === "ended" ? "bg-slate-500/50" : "bg-indigo-400/70"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{session.title}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {session.course?.title || session.course_title || "General"}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold text-slate-300 tabular-nums">
                {formatTime(session.scheduled_at)} <TimezoneTag />
              </p>
              <p className="hidden sm:block text-[10px] text-slate-500 mt-0.5">
                {formatDate(session.scheduled_at)}
              </p>
            </div>
            <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${
              STATUS_COLORS[session.status] || STATUS_COLORS.scheduled
            }`}>
              {session.status || "scheduled"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StudentClasses = () => {
  const dispatch = useDispatch();
  const { sessions, isFetchingSessions, enrolledCourses } = useSelector(
    (state) => state.studentDashboard,
  );
  const { formatTime, formatDate } = useDateFormatters();

  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [view, setView] = useState("table");

  // Fetch courses from /courses/ for the dropdown
  useEffect(() => {
    setCoursesLoading(true);
    axiosInstance
      .get("/courses/")
      .then((res) => {
        const data = res.data?.results || res.data?.data || res.data;
        const all = Array.isArray(data) ? data : [];
        setCourses(all.filter((c) => c.is_enrolled === true));
      })
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  // Re-fetch sessions whenever course filter changes
  useEffect(() => {
    const params = selectedCourse ? { course: selectedCourse } : {};
    dispatch(fetchStudentSessions(params));
  }, [dispatch, selectedCourse]);

  const sessionList = Array.isArray(sessions) ? sessions : [];

  return (
    <div className="p-3 sm:p-6 lg:p-12 space-y-6 py-4">
      {/* Header + controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">My Classes</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your scheduled sessions</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          

          <FilterSelect
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={coursesLoading}
            className="min-w-[160px]"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </FilterSelect>
          {selectedCourse && (
            <button
              onClick={() => setSelectedCourse("")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-sm transition-all duration-150"
            >
              <i className="fas fa-times text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile: always table */}
      {/* View toggle — hidden on mobile (always table there) */}
      <div className="flex items-center gap-2 flex-wrap">
          <TimezoneTag className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400" />
          <div className="hidden sm:flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("table")}
              className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 ${view === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <i className="fas fa-list text-xs" /> Table
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 ${view === "calendar" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <i className="fas fa-calendar-alt text-xs" /> Calendar
            </button>
          </div>
      </div>
      <div className="sm:hidden">
        <SessionListView sessions={sessionList} formatTime={formatTime} formatDate={formatDate} />
      </div>

      {/* sm+: selected view */}
      <div className="hidden sm:block">
        {view === "calendar" ? (
          <SessionCalendarView sessions={sessionList} loading={!!isFetchingSessions} />
        ) : (
          <SessionListView sessions={sessionList} formatTime={formatTime} formatDate={formatDate} />
        )}
      </div>
    </div>
  );
};

export default StudentClasses;
