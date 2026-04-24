import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchParentDashboard,
  fetchChildCourses,
  fetchChildAttendanceRecords,
  selectChildCourses,
  selectChildCoursesLoading,
  selectChildAttendanceRecords,
  selectChildAttendanceRecordsLoading,
} from "../../store/slices/parentSlice";
import AttendanceCalendar from "../../components/common/AttendanceCalendar";
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

const ParentAttendance = () => {
  const dispatch = useDispatch();

  const { data: dashboardData, loading: dashLoading } = useSelector((s) => s.parent.dashboard);
  const childCoursesMap  = useSelector(selectChildCourses);
  const recordsMap       = useSelector(selectChildAttendanceRecords);

  const children = dashboardData?.children ?? [];

  const [childId,     setChildId]     = useState("");
  const [courseId,    setCourseId]    = useState("");
  const [fromDate,    setFromDate]    = useState(monthStart());
  const [toDate,      setToDate]      = useState(todayStr());
  const [calMonth,    setCalMonth]    = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const isCoursesLoading  = useSelector(selectChildCoursesLoading(childId));
  const isRecordsLoading  = useSelector(selectChildAttendanceRecordsLoading(childId));

  const courses    = childId ? (childCoursesMap[childId] ?? []) : [];
  const attendance = childId ? (recordsMap[childId] ?? []) : [];
  const isLoading  = dashLoading || isCoursesLoading || isRecordsLoading;

  // Load dashboard on mount
  useEffect(() => {
    if (!dashboardData) dispatch(fetchParentDashboard());
  }, [dispatch]);

  // Auto-select first child once dashboard loads
  useEffect(() => {
    if (children.length && !childId) {
      setChildId(String(children[0].id));
    }
  }, [children]);

  // When child changes: fetch courses and reset course selection
  useEffect(() => {
    if (!childId) return;
    setCourseId("");
    setSelectedDay(null);
    if (!childCoursesMap[childId]) dispatch(fetchChildCourses(childId));
  }, [childId]);

  // Auto-select first course once courses load for the active child
  useEffect(() => {
    if (courses.length && !courseId) {
      setCourseId(String(courses[0].id));
    }
  }, [courses]);

  // Fetch attendance records whenever filters change
  useEffect(() => {
    if (!childId || !courseId) return;
    dispatch(fetchChildAttendanceRecords({ childId, courseId, from: fromDate, to: toDate }));
  }, [dispatch, childId, courseId, fromDate, toDate]);

  const attendanceByDate = useMemo(() => {
    const map = {};
    attendance.forEach((r) => {
      const key = (r.created_at || r.joined_at || "").slice(0, 10);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [attendance]);

  const stats = useMemo(() => {
    const present = attendance.filter((r) => r.status === "present").length;
    const absent  = attendance.filter((r) => r.status === "absent").length;
    const late    = attendance.filter((r) => r.status === "late").length;
    const total   = attendance.length;
    return {
      total, present, absent, late,
      rate: total ? Math.round(((present + late) / total) * 100) : 0,
    };
  }, [attendance]);

  const prevMonth = () => {
    setCalMonth((c) => {
      const d = new Date(c.year, c.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setCalMonth((c) => {
      const d = new Date(c.year, c.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelectedDay(null);
  };

  const displayRecords = selectedDay
    ? attendanceByDate[selectedDay] || []
    : attendance;

  const rateColor =
    stats.rate >= 90 ? "text-emerald-400" :
    stats.rate >= 75 ? "text-yellow-400"  :
    stats.rate >= 60 ? "text-orange-400"  :
                       "text-rose-400";

  const activeChild = children.find((c) => String(c.id) === childId);

  return (
    <div className="text-white px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black font-poppins">Child Attendance</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor your child's session attendance.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Child */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Child</span>
          <FilterSelect
            value={childId}
            onChange={(e) => {
              setChildId(e.target.value);
              setCourseId("");
              setSelectedDay(null);
            }}
            style={{ width: 180 }}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.username || c.name || `Child ${c.id}`}
              </option>
            ))}
          </FilterSelect>
        </div>

        {/* Course */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Course</span>
          <FilterSelect
            value={courseId}
            onChange={(e) => { setCourseId(e.target.value); setSelectedDay(null); }}
            disabled={!courses.length}
            style={{ width: 200 }}
          >
            {courses.length === 0 ? (
              <option value="">No courses</option>
            ) : (
              courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))
            )}
          </FilterSelect>
        </div>

        <FilterDateInput
          label="From"
          value={fromDate}
          max={toDate}
          onChange={(e) => { setFromDate(e.target.value); setSelectedDay(null); }}
        />

        <FilterDateInput
          label="To"
          value={toDate}
          min={fromDate}
          max={todayStr()}
          onChange={(e) => { setToDate(e.target.value); setSelectedDay(null); }}
        />
      </div>

      {/* Active child badge */}
      {activeChild && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300">
            {(activeChild.username || "?")[0].toUpperCase()}
          </div>
          <span className="text-sm text-slate-400">
            Viewing <span className="text-white font-semibold">{activeChild.username || activeChild.name}</span>
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl"></i>
        </div>
      ) : !childId ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <i className="fas fa-user-friends text-slate-600 text-3xl mb-3"></i>
          <p className="text-slate-300 font-semibold">No children linked</p>
          <p className="text-slate-500 text-sm mt-1">Link a child account to view attendance.</p>
        </div>
      ) : !attendance.length ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <i className="fas fa-calendar-times text-slate-600 text-3xl mb-3"></i>
          <p className="text-slate-300 font-semibold">No attendance to show</p>
          <p className="text-slate-500 text-sm mt-1">No records found for the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: stats + rate bar + calendar */}
          <div className="xl:col-span-2 space-y-4">
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
                {stats.rate >= 75 ? "On track — keep it up!" : "Attendance needs improvement."}
              </p>
            </div>

            {/* Calendar */}
            <AttendanceCalendar
              attendanceByDate={attendanceByDate}
              fromDate={fromDate}
              toDate={toDate}
              calMonth={calMonth}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              selectedDay={selectedDay}
              onDaySelect={setSelectedDay}
            />
          </div>

          {/* Right: records panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300">
                {selectedDay
                  ? new Date(selectedDay + "T00:00:00").toLocaleDateString([], {
                      weekday: "short", month: "short", day: "numeric", year: "numeric",
                    })
                  : "All Records"}
              </h3>
              {selectedDay && (
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-xs text-slate-500 hover:text-white transition flex items-center gap-1"
                >
                  <i className="fas fa-times text-[10px]"></i> Clear
                </button>
              )}
            </div>

            {!displayRecords.length ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
                <i className="fas fa-calendar-times text-slate-600 text-2xl mb-3"></i>
                <p className="text-slate-400 text-sm">
                  {selectedDay ? "No records for this day." : "No records in selected range."}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
                {displayRecords.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.absent;
                  const dateKey = r.created_at || r.joined_at || "";
                  return (
                    <div
                      key={r.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">
                            {r.session_title}
                          </p>
                          {r.course_title && (
                            <p className="text-xs text-indigo-400 truncate mt-0.5">
                              {r.course_title}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-500 mt-1">
                            {dateKey
                              ? new Date(dateKey).toLocaleDateString([], {
                                  month: "short", day: "numeric", year: "numeric",
                                })
                              : "—"}
                          </p>
                        </div>
                        <span className={`mt-0.5 shrink-0 px-2 py-0.5 rounded-full text-xs border font-semibold ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                      {r.note && (
                        <p className="text-xs text-slate-500 italic mt-2 border-t border-slate-800 pt-1.5">
                          {r.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentAttendance;
