import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyAttendance,
  fetchStudentDashboard,
  selectMyAttendance,
  selectMyAttendanceLoading,
  selectEnrolledCourses,
} from "../../store/slices/studentDashboardSlice";

const STATUS_CONFIG = {
  present: { label: "Present", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  absent:  { label: "Absent",  color: "bg-red-500/20 text-red-400 border-red-500/30" },
  late:    { label: "Late",    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDuration = (joinedAt, leftAt) => {
  if (!joinedAt || !leftAt) return "—";
  const diff = new Date(leftAt) - new Date(joinedAt);
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const StudentAttendance = () => {
  const dispatch = useDispatch();
  const attendance = useSelector(selectMyAttendance);
  const isLoading = useSelector(selectMyAttendanceLoading);
  const enrolledCourses = useSelector(selectEnrolledCourses);

  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Fetch enrolled courses if not yet loaded
  useEffect(() => {
    if (!enrolledCourses?.length) {
      dispatch(fetchStudentDashboard());
    }
  }, [dispatch, enrolledCourses?.length]);

  // Fetch attendance whenever course filter changes
  useEffect(() => {
    const params = selectedCourseId ? { course_id: selectedCourseId } : {};
    dispatch(fetchMyAttendance(params));
  }, [dispatch, selectedCourseId]);

  // Stats
  const total   = attendance?.length || 0;
  const present = attendance?.filter((r) => r.status === "present").length || 0;
  const absent  = attendance?.filter((r) => r.status === "absent").length || 0;
  const late    = attendance?.filter((r) => r.status === "late").length || 0;
  const rate    = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  const rateColor =
    rate >= 90 ? "text-emerald-400" :
    rate >= 75 ? "text-yellow-400"  :
    rate >= 60 ? "text-orange-400"  :
                 "text-red-400";

  return (
    <div className="text-white px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-poppins mb-1">My Attendance</h1>
        <p className="text-slate-400 text-sm">Track your session attendance across all courses</p>
      </div>

      {/* Stats */}
      {!isLoading && total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Sessions", value: total,   icon: "fa-calendar-check", color: "text-indigo-400",  bg: "bg-indigo-500/10"  },
            { label: "Present",        value: present, icon: "fa-check-circle",   color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Absent",         value: absent,  icon: "fa-times-circle",   color: "text-red-400",     bg: "bg-red-500/10"     },
            { label: "Late",           value: late,    icon: "fa-clock",          color: "text-yellow-400",  bg: "bg-yellow-500/10"  },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <i className={`fas ${s.icon} ${s.color}`}></i>
              </div>
              <div>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Rate Bar */}
      {!isLoading && total > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-300">Overall Attendance Rate</p>
            <p className={`text-2xl font-black ${rateColor}`}>{rate}%</p>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                rate >= 90 ? "bg-emerald-500" :
                rate >= 75 ? "bg-yellow-500"  :
                rate >= 60 ? "bg-orange-500"  :
                             "bg-red-500"
              }`}
              style={{ width: `${rate}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {rate >= 75 ? "You're on track. Keep it up!" : "Your attendance needs improvement."}
          </p>
        </div>
      )}

      {/* Course Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition min-w-[200px]"
        >
          <option value="">All Courses</option>
          {enrolledCourses?.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>

        {selectedCourseId && (
          <button
            onClick={() => setSelectedCourseId("")}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-sm transition-all"
          >
            <i className="fas fa-times text-xs"></i>
            Clear Filter
          </button>
        )}
      </div>

      {/* Records */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="divide-y divide-slate-800/50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-5 animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-700 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-56" />
                  <div className="h-3 bg-slate-700/60 rounded w-36" />
                </div>
                <div className="h-6 bg-slate-700 rounded-full w-20" />
              </div>
            ))}
          </div>
        ) : !attendance?.length ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-calendar-times text-slate-400 text-xl"></i>
            </div>
            <p className="text-white font-bold mb-1">No Attendance Records</p>
            <p className="text-slate-400 text-sm">
              {selectedCourseId ? "No records for the selected course." : "No sessions attended yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-slate-800/50">
              {attendance.map((record) => {
                const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.absent;
                return (
                  <div key={record.id} className="px-4 py-4 hover:bg-slate-800/30 transition">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{record.session_title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(record.joined_at)}</p>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500 mt-2">
                      <span><i className="fas fa-sign-in-alt mr-1"></i>{formatTime(record.joined_at)}</span>
                      {record.left_at && (
                        <span><i className="fas fa-sign-out-alt mr-1"></i>{formatTime(record.left_at)}</span>
                      )}
                      <span><i className="fas fa-hourglass mr-1"></i>{formatDuration(record.joined_at, record.left_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    {["Session", "Date", "Joined At", "Left At", "Duration", "Status"].map((h) => (
                      <th key={h} className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {attendance.map((record) => {
                    const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.absent;
                    return (
                      <tr key={record.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white text-sm">{record.session_title}</p>
                          {record.note && (
                            <p className="text-xs text-slate-500 mt-0.5 italic">{record.note}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-400 text-sm">{formatDate(record.joined_at)}</td>
                        <td className="px-5 py-4 text-slate-300 text-sm font-mono">{formatTime(record.joined_at)}</td>
                        <td className="px-5 py-4 text-slate-300 text-sm font-mono">{formatTime(record.left_at)}</td>
                        <td className="px-5 py-4 text-slate-400 text-sm">{formatDuration(record.joined_at, record.left_at)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
