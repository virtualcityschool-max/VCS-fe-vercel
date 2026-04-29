import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCourses,
  fetchEnrollments,
  selectCourses,
  selectEnrollments,
} from "../../store/slices/adminSlice";
import {
  fetchAllAttendance,
} from "../../store/slices/teacherSlice";
import AttendanceCalendar from "../../components/common/AttendanceCalendar";
import { FilterSelect, FilterDateInput } from "../../components/ui";

const toDateStr = (d) => d.toISOString().slice(0, 10);
const monthStart = () => { const d = new Date(); d.setDate(1); return toDateStr(d); };
const todayStr  = () => toDateStr(new Date());

const STATUS_CONFIG = {
  present: { label: "Present", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  absent:  { label: "Absent",  badge: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  late:    { label: "Late",    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const AdminAttendance = () => {
  const dispatch = useDispatch();

  const coursesState     = useSelector(selectCourses);
  const enrollmentsState = useSelector(selectEnrollments);
  const { allAttendance, loadingAllAttendance } = useSelector((s) => s.teachers);

  const courses     = coursesState?.data     ?? [];
  const enrollments = enrollmentsState?.data ?? [];

  const [tab,         setTab]         = useState("teacher");
  const [courseId,    setCourseId]    = useState("");
  const [personId,    setPersonId]    = useState(""); // teacher or student id
  const [fromDate,    setFromDate]    = useState(monthStart());
  const [toDate,      setToDate]      = useState(todayStr());
  const [calMonth,    setCalMonth]    = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const isLoading = loadingAllAttendance || coursesState?.loading || enrollmentsState?.loading;

  // Load courses + enrollments on mount
  useEffect(() => {
    if (!courses.length)     dispatch(fetchCourses());
    if (!enrollments.length) dispatch(fetchEnrollments());
  }, [dispatch]);

  // Derive active course object
  const activeCourseId = courseId || (courses[0] ? String(courses[0].id) : "");
  const activeCourse   = courses.find((c) => String(c.id) === activeCourseId);

  // Teacher tab: instructor from the selected course (one per course)
  const instructor = activeCourse?.instructor ?? null;

  // Student tab: students enrolled in the selected course
  const enrolledStudents = useMemo(() => {
    if (!activeCourseId) return [];
    const seen = new Set();
    return enrollments
      .filter((e) => String(e.course?.id) === activeCourseId && e.student?.id)
      .filter((e) => { if (seen.has(e.student.id)) return false; seen.add(e.student.id); return true; })
      .map((e) => e.student);
  }, [enrollments, activeCourseId]);

  // Derive active person id
  const activePersonId = useMemo(() => {
    if (personId) return personId;
    if (tab === "teacher") return instructor ? String(instructor.id) : "";
    return enrolledStudents[0] ? String(enrolledStudents[0].id) : "";
  }, [personId, tab, instructor, enrolledStudents]);

  // Reset person when course or tab changes
  useEffect(() => {
    setPersonId("");
    setSelectedDay(null);
  }, [activeCourseId, tab]);

  // Fetch attendance
  useEffect(() => {
    if (!activeCourseId || !activePersonId) return;
    const params = { course: activeCourseId, from: fromDate, to: toDate };
    if (tab === "teacher") {
      params.participant_role = "teacher";
      params.teacher = activePersonId;
    } else {
      params.participant_role = "student";
      params.student = activePersonId;
    }
    dispatch(fetchAllAttendance(params));
  }, [dispatch, tab, activeCourseId, activePersonId, fromDate, toDate]);

  const attendanceByDate = useMemo(() => {
    const map = {};
    (allAttendance || []).forEach((r) => {
      const key = (r.created_at || "").slice(0, 10);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [allAttendance]);

  const stats = useMemo(() => {
    const all     = allAttendance || [];
    const present = all.filter((r) => r.status === "present").length;
    const absent  = all.filter((r) => r.status === "absent").length;
    const late    = all.filter((r) => r.status === "late").length;
    const total   = all.length;
    return { total, present, absent, late, rate: total ? Math.round((present / total) * 100) : 0 };
  }, [allAttendance]);

  const prevMonth = () => {
    setCalMonth((c) => { const d = new Date(c.year, c.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setCalMonth((c) => { const d = new Date(c.year, c.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
    setSelectedDay(null);
  };

  const displayRecords = selectedDay ? attendanceByDate[selectedDay] || [] : allAttendance || [];

  const rateColor =
    stats.rate >= 90 ? "text-emerald-400" :
    stats.rate >= 75 ? "text-yellow-400"  :
                       "text-rose-400";

  const handleTabChange = (t) => {
    setTab(t);
    setCourseId("");
    setPersonId("");
    setSelectedDay(null);
  };

  return (
    <div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        {[
          { id: "teacher", label: "Teacher Attendance", icon: "fa-chalkboard-teacher" },
          { id: "student", label: "Student Attendance", icon: "fa-user-graduate" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.id
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <i className={`fas ${t.icon} text-xs`}></i>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 my-2">
        {/* Course */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Course</span>
          <FilterSelect
            value={activeCourseId}
            onChange={(e) => { setCourseId(e.target.value); setPersonId(""); setSelectedDay(null); }}
            style={{ width: 220 }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </FilterSelect>
        </div>

        {/* Teacher tab — instructor auto-populated from course */}
        {tab === "teacher" && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Instructor</span>
            <FilterSelect
              value={activePersonId}
              onChange={(e) => { setPersonId(e.target.value); setSelectedDay(null); }}
              disabled={!instructor}
              style={{ width: 200 }}
            >
              {instructor ? (
                <option value={instructor.id}>{instructor.username}</option>
              ) : (
                <option value="">No instructor assigned</option>
              )}
            </FilterSelect>
          </div>
        )}

        {/* Student tab — students from enrollments for selected course */}
        {tab === "student" && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Student</span>
            <FilterSelect
              value={activePersonId}
              onChange={(e) => { setPersonId(e.target.value); setSelectedDay(null); }}
              disabled={!enrolledStudents.length}
              style={{ width: 200 }}
            >
              {enrolledStudents.length === 0 ? (
                <option value="">No students enrolled</option>
              ) : (
                enrolledStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.username}</option>
                ))
              )}
            </FilterSelect>
          </div>
        )}

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

      {/* No students empty state */}
      {tab === "student" && !enrolledStudents.length && !isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <i className="fas fa-user-slash text-slate-600 text-3xl mb-3"></i>
          <p className="text-slate-300 font-semibold">No students enrolled</p>
          <p className="text-slate-500 text-sm mt-1">This course has no enrolled students yet.</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl"></i>
        </div>
      ) : !(allAttendance?.length) ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <i className="fas fa-calendar-times text-slate-600 text-3xl mb-3"></i>
          <p className="text-slate-300 font-semibold">No attendance to show</p>
          <p className="text-slate-500 text-sm mt-1">No records found for the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: stats + calendar */}
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
                          {tab === "student" && r.student_name && (
                            <p className="text-xs text-indigo-400 truncate mt-0.5">{r.student_name}</p>
                          )}
                          {tab === "teacher" && r.teacher_name && (
                            <p className="text-xs text-indigo-400 truncate mt-0.5">{r.teacher_name}</p>
                          )}
                          <p className="text-[10px] text-slate-500 mt-1">
                            {r.created_at
                              ? new Date(r.created_at).toLocaleDateString([], {
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

export default AdminAttendance;
