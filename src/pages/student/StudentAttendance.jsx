import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyAttendance,
  fetchStudentDashboard,
  selectMyAttendance,
  selectMyAttendanceLoading,
  selectEnrolledCourses,
} from "../../store/slices/studentDashboardSlice";
import { FilterSelect, FilterDateInput } from "../../components/ui";

const toDateStr = (d) => d.toISOString().slice(0, 10);
const monthStart = () => {
  const d = new Date();
  d.setDate(1);
  return toDateStr(d);
};
const todayStr = () => toDateStr(new Date());

const STATUS_CONFIG = {
  present: { label: "Present", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  absent:  { label: "Absent",  badge: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  late:    { label: "Late",    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.absent;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border font-semibold whitespace-nowrap ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
};

const fmtDateTime = (iso) => {
  if (!iso) return <span className="text-slate-600 italic text-xs">—</span>;
  const d = new Date(iso);
  return (
    <span className="text-slate-300 text-xs tabular-nums">
      {d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
      <span className="text-slate-600 mx-1">·</span>
      {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
};

const fmtTime = (iso) => {
  if (!iso) return <span className="text-slate-600 italic text-xs">—</span>;
  return (
    <span className="text-slate-300 text-xs tabular-nums">
      {new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
};

const StudentAttendance = () => {
  const dispatch        = useDispatch();
  const attendance      = useSelector(selectMyAttendance);
  const isLoading       = useSelector(selectMyAttendanceLoading);
  const enrolledCourses = useSelector(selectEnrolledCourses);

  const [courseId,  setCourseId]  = useState("");
  const [fromDate,  setFromDate]  = useState(monthStart());
  const [toDate,    setToDate]    = useState(todayStr());

  useEffect(() => {
    if (!enrolledCourses?.length) dispatch(fetchStudentDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (enrolledCourses?.length && !courseId) {
      setCourseId(String(enrolledCourses[0].id));
    }
  }, [enrolledCourses]);

  useEffect(() => {
    if (!courseId) return;
    dispatch(fetchMyAttendance({ course: courseId, from: fromDate, to: toDate }));
  }, [dispatch, courseId, fromDate, toDate]);

  const stats = useMemo(() => {
    const all     = attendance || [];
    const present = all.filter((r) => r.status === "present").length;
    const absent  = all.filter((r) => r.status === "absent").length;
    const late    = all.filter((r) => r.status === "late").length;
    const total   = all.length;
    return {
      total, present, absent, late,
      rate: total ? Math.round(((present + late) / total) * 100) : 0,
    };
  }, [attendance]);

  const rateColor =
    stats.rate >= 90 ? "text-emerald-400" :
    stats.rate >= 75 ? "text-yellow-400"  :
    stats.rate >= 60 ? "text-orange-400"  :
                       "text-rose-400";

  return (
    <div className="text-white px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black font-poppins">My Attendance</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track your session attendance across all courses.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Course</span>
          <FilterSelect
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            style={{ width: 200 }}
          >
            {enrolledCourses?.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </FilterSelect>
        </div>

        <FilterDateInput
          label="From"
          value={fromDate}
          max={toDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <FilterDateInput
          label="To"
          value={toDate}
          min={fromDate}
          max={todayStr()}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl" />
        </div>
      ) : !attendance?.length ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <i className="fas fa-calendar-times text-slate-600 text-3xl mb-3" />
          <p className="text-slate-300 font-semibold">No attendance to show</p>
          <p className="text-slate-500 text-sm mt-1">No records found for the selected filters.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",   value: stats.total,      color: "text-white" },
              { label: "Present", value: stats.present,    color: "text-emerald-400" },
              { label: "Absent",  value: stats.absent,     color: "text-rose-400" },
              { label: "Rate",    value: `${stats.rate}%`, color: rateColor },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Rate bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400">Attendance Rate</p>
              <p className={`text-sm font-black ${rateColor}`}>{stats.rate}%</p>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  stats.rate >= 90 ? "bg-emerald-500" :
                  stats.rate >= 75 ? "bg-yellow-500"  :
                  stats.rate >= 60 ? "bg-orange-500"  :
                                     "bg-rose-500"
                }`}
                style={{ width: `${stats.rate}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              {stats.rate >= 75 ? "You're on track. Keep it up!" : "Your attendance needs improvement."}
            </p>
          </div>

          {/* Table */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[180px]">Session</th>
                    <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[200px]">Date &amp; Time</th>
                    <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[110px]">Joined At</th>
                    <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[110px]">Left At</th>
                    <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[100px]">Status</th>
                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {(attendance || []).map((r, idx) => (
                    <tr
                      key={r.id ?? idx}
                      className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-white text-xs font-semibold">{r.session_title || "—"}</p>
                        {r.course_title && (
                          <p className="text-indigo-400 text-[10px] mt-0.5">{r.course_title}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {fmtDateTime(r.created_at || r.joined_at)}
                      </td>
                      <td className="px-4 py-3.5 text-center">{fmtTime(r.joined_at)}</td>
                      <td className="px-4 py-3.5 text-center">{fmtTime(r.left_at)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-500 text-xs italic">{r.note || "—"}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAttendance;
