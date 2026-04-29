import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllAttendance,
  fetchMyCourses,
  fetchTeacherSessions,
  fetchSessionAttendance,
  bulkMarkAttendance,
  updateStudentAttendance,
} from "../../store/slices/teacherSlice";
import AttendanceCalendar from "../../components/common/AttendanceCalendar";
import { FilterSelect, FilterDateInput } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";

const toDateStr = (d) => d.toISOString().slice(0, 10);
const monthStart = () => { const d = new Date(); d.setDate(1); return toDateStr(d); };
const todayStr = () => toDateStr(new Date());

const STATUS_CONFIG = {
  present: { label: "Present", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  absent:  { label: "Absent",  badge: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  late:    { label: "Late",    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const STATUS_OPTIONS = ["present", "late", "absent"];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.absent;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border font-semibold whitespace-nowrap ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
};

const StatusPill = ({ value, active, onClick, disabled }) => {
  const cfg = STATUS_CONFIG[value];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition capitalize disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? cfg.badge
          : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"
      }`}
    >
      {cfg.label}
    </button>
  );
};

// ── Session attendance table — shows enrolled students with current status ────
const SessionAttendanceTable = ({ enrolledStudents, attendanceRecords, sessionId, dispatch, onRefresh }) => {
  const [savingId, setSavingId] = useState(null);

  const recordByStudent = useMemo(() => {
    const map = {};
    (attendanceRecords || []).forEach((r) => {
      const sid = r.student?.id ?? r.student_id ?? r.student;
      if (sid != null) map[String(sid)] = r;
    });
    return map;
  }, [attendanceRecords]);

  const handleStatus = async (student, newStatus) => {
    if (!sessionId || savingId === student.id) return;
    const existing = recordByStudent[String(student.id)];
    if (existing?.status === newStatus) return;
    setSavingId(student.id);
    try {
      if (existing) {
        await dispatch(updateStudentAttendance({
          sessionId,
          studentId: student.id,
          data: { status: newStatus },
        })).unwrap();
      } else {
        await dispatch(bulkMarkAttendance({
          sessionId,
          records: [{ student: student.id, status: newStatus }],
        })).unwrap();
      }
      onRefresh();
    } catch {
      toastManager.error("Failed to update attendance");
    } finally {
      setSavingId(null);
    }
  };

  if (!enrolledStudents.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <i className="fas fa-user-slash text-slate-600 text-3xl mb-3" />
        <p className="text-slate-300 font-semibold">No students enrolled</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="sticky left-0 z-10 bg-slate-900 px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[180px] border-r border-slate-800"
                  style={{ boxShadow: "4px 0 8px rgba(0,0,0,0.4)" }}>
                Student
              </th>
              <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[120px]">
                Current Status
              </th>
              <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Change Status
              </th>
            </tr>
          </thead>
          <tbody>
            {enrolledStudents.map((student) => {
              const record  = recordByStudent[String(student.id)];
              const isPending = savingId === student.id;
              return (
                <tr key={student.id} className="border-b border-slate-800/40 last:border-0 group">
                  {/* Student */}
                  <td className="sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800 px-5 py-3.5 border-r border-slate-800/50 transition-colors"
                      style={{ boxShadow: "4px 0 8px rgba(0,0,0,0.4)" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 text-xs font-bold">
                          {student.username?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white text-xs font-semibold truncate">{student.username}</p>
                    </div>
                  </td>

                  {/* Current status */}
                  <td className="px-4 py-3.5 text-center group-hover:bg-slate-800/10 transition-colors">
                    {isPending ? (
                      <i className="fas fa-spinner fa-spin text-slate-400 text-xs" />
                    ) : record ? (
                      <StatusBadge status={record.status} />
                    ) : (
                      <span className="text-slate-600 text-xs italic">Not marked</span>
                    )}
                  </td>

                  {/* Status pills to change */}
                  <td className="px-5 py-3.5 group-hover:bg-slate-800/10 transition-colors">
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <StatusPill
                          key={opt}
                          value={opt}
                          active={record?.status === opt}
                          disabled={isPending}
                          onClick={() => handleStatus(student, opt)}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── My attendance simple table ────────────────────────────────────────────────
const MyAttendanceTable = ({ records }) => {
  if (!records.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <i className="fas fa-calendar-times text-slate-600 text-3xl mb-3" />
        <p className="text-slate-300 font-semibold">No attendance to show</p>
        <p className="text-slate-500 text-sm mt-1">No records found for the selected filters.</p>
      </div>
    );
  }
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[200px]">Session</th>
              <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[120px]">Date</th>
              <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[110px]">Status</th>
              <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => (
              <tr key={r.id ?? idx} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-white text-xs font-semibold">{r.session_title}</p>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <p className="text-slate-400 text-xs">
                    {new Date(r.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </td>
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
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const TeacherAttendance = () => {
  const dispatch   = useDispatch();
  const profile    = useSelector((s) => s.auth.profile);
  const teacherId  = profile?.id;

  const {
    myCourses, allAttendance, loadingAllAttendance,
    sessions, loadingSessions,
    attendanceRecords, loadingAttendance,
    markingBulkAttendance, patchingStudentAttendance,
  } = useSelector((s) => s.teachers);

  const [tab, setTab]           = useState("mine");
  const [viewMode, setViewMode] = useState("table"); // "table" | "calendar"
  const [courseId, setCourseId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [tableSessionId, setTableSessionId] = useState(""); // session selected in table view
  const [fromDate, setFromDate] = useState(monthStart());
  const [toDate, setToDate]     = useState(todayStr());
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm]     = useState({ status: "present", note: "" });
  const [dayRecords, setDayRecords] = useState(null);

  // Bulk mark modal
  const [markModal, setMarkModal]     = useState(false);
  const [markCourseId, setMarkCourseId] = useState(""); // course dropdown inside mark modal
  const [markSessionId, setMarkSessionId] = useState("");
  const [markStatuses, setMarkStatuses]   = useState({});

  const activeCourseId   = courseId || (myCourses?.[0] ? String(myCourses[0].id) : "");
  const activeCourse     = myCourses?.find((c) => String(c.id) === activeCourseId);
  const enrolledStudents = activeCourse?.enrolled_students ?? [];

  // Calendar mode always needs a specific student; table mode defaults to "" (all)
  const activeStudentId = (viewMode === "calendar" && tab === "students")
    ? (studentId || (enrolledStudents[0] ? String(enrolledStudents[0].id) : ""))
    : studentId;

  // Sessions filtered to top-level only
  const parentSessions = useMemo(
    () => (sessions || []).filter((s) => s.is_child === false || s.is_child == null),
    [sessions]
  );

  // ── Effects ─────────────────────────────────────────────────────────────────

  // Load courses once
  useEffect(() => {
    if (!myCourses?.length) dispatch(fetchMyCourses());
  }, [dispatch]);

  // Fetch sessions whenever course changes (needed for table view + mark modal)
  useEffect(() => {
    if (activeCourseId) dispatch(fetchTeacherSessions({ course: activeCourseId }));
  }, [activeCourseId, dispatch]);

  // When sessions load, auto-select first session for table view
  useEffect(() => {
    if (parentSessions.length > 0 && !tableSessionId) {
      setTableSessionId(String(parentSessions[0].id));
    }
  }, [parentSessions]);

  // When course changes, reset session selection
  useEffect(() => {
    setTableSessionId("");
  }, [activeCourseId]);

  // Fetch session attendance for table view (students tab)
  useEffect(() => {
    if (tab === "students" && viewMode === "table" && tableSessionId) {
      dispatch(fetchSessionAttendance(tableSessionId));
    }
  }, [tab, viewMode, tableSessionId, dispatch]);

  // Fetch date-range attendance for: my tab (both views) + students calendar view
  useEffect(() => {
    if (!activeCourseId) return;
    if (tab === "students" && viewMode === "table") return; // session-based instead
    if (viewMode === "calendar" && tab === "students" && !activeStudentId) return;
    const params = { course: activeCourseId, from: fromDate, to: toDate };
    if (tab === "mine" && teacherId) {
      params.participant_role = "teacher";
      params.teacher = teacherId;
    } else if (tab === "students") {
      params.participant_role = "student";
      if (activeStudentId) params.student = activeStudentId;
    }
    dispatch(fetchAllAttendance(params));
  }, [dispatch, tab, viewMode, activeCourseId, activeStudentId, fromDate, toDate, teacherId]);

  // Mark modal — re-fetch sessions if course changes inside modal
  useEffect(() => {
    if (markModal && markCourseId && markCourseId !== activeCourseId) {
      dispatch(fetchTeacherSessions({ course: markCourseId }));
    }
  }, [markCourseId, markModal, dispatch]);

  // ── Computed ────────────────────────────────────────────────────────────────

  const attendanceByDate = useMemo(() => {
    const map = {};
    (allAttendance || []).forEach((r) => {
      const key = r.created_at.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [allAttendance]);

  const stats = useMemo(() => {
    const src = (tab === "students" && viewMode === "table")
      ? (attendanceRecords || [])
      : (allAttendance || []);
    const present = src.filter((r) => r.status === "present").length;
    const absent  = src.filter((r) => r.status === "absent").length;
    const total   = src.length;
    return { total, present, absent, rate: total ? Math.round((present / total) * 100) : 0 };
  }, [allAttendance, attendanceRecords, tab, viewMode]);

  // Students enrolled in the course selected inside the mark modal
  const markCourse          = myCourses?.find((c) => String(c.id) === markCourseId);
  const markEnrolledStudents = markCourse?.enrolled_students ?? enrolledStudents;
  // Sessions shown in the mark modal (re-fetched when markCourseId differs)
  const markSessions = parentSessions;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const prevMonth = () => {
    setCalMonth((c) => { const d = new Date(c.year, c.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setCalMonth((c) => { const d = new Date(c.year, c.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
    setSelectedDay(null);
  };

  const displayRecords = selectedDay ? (attendanceByDate[selectedDay] || []) : (allAttendance || []);

  const handleCalendarDayClick = (records) => {
    if (tab !== "students" || !records?.length) return;
    if (records.length === 1) openEdit(records[0]);
    else setDayRecords(records);
  };

  const openEdit = (r) => {
    setEditRecord(r);
    setEditForm({ status: r.status || "present", note: r.note || "" });
  };

  const handleEditSave = async () => {
    if (!editRecord) return;
    const sessionId = editRecord.session?.id ?? editRecord.session_id ?? editRecord.session;
    const sId       = editRecord.student?.id ?? editRecord.student_id ?? editRecord.student;
    if (!sessionId || !sId) { toastManager.error("Missing session or student info"); return; }
    try {
      await dispatch(updateStudentAttendance({ sessionId, studentId: sId, data: { status: editForm.status, note: editForm.note } })).unwrap();
      toastManager.success("Attendance updated");
      setEditRecord(null);
      if (tableSessionId) dispatch(fetchSessionAttendance(tableSessionId));
    } catch {
      toastManager.error("Failed to update attendance");
    }
  };

  const handleBulkMark = async () => {
    if (!markSessionId) { toastManager.error("Select a session first"); return; }
    if (!markEnrolledStudents.length) { toastManager.error("No students enrolled"); return; }
    const records = markEnrolledStudents.map((s) => ({ student: s.id, status: markStatuses[s.id] || "present" }));
    try {
      await dispatch(bulkMarkAttendance({ sessionId: markSessionId, records })).unwrap();
      toastManager.success("Attendance marked successfully");
      setMarkModal(false);
      if (tableSessionId) dispatch(fetchSessionAttendance(tableSessionId));
    } catch {
      toastManager.error("Failed to mark attendance");
    }
  };

  const openMarkModal = () => {
    setMarkCourseId(activeCourseId);
    setMarkSessionId("");
    setMarkStatuses({});
    setMarkModal(true);
  };

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setStudentId("");
    setSelectedDay(null);
    setViewMode("table");
  };

  const handleViewModeSwitch = (mode) => {
    setViewMode(mode);
    if (mode === "table") setStudentId("");
    setSelectedDay(null);
  };

  const isTableLoading = tab === "students" && viewMode === "table" ? loadingAttendance : loadingAllAttendance;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="text-white px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black font-poppins">Attendance</h1>
        <p className="text-slate-400 text-sm mt-1">Track your sessions and monitor student attendance.</p>
      </div>

      {/* ── Main tabs ── */}
      <div className="flex gap-1 border-b border-slate-800">
        {[
          { id: "mine",     label: "My Attendance",       icon: "fa-user-check" },
          { id: "students", label: "Students Attendance", icon: "fa-users" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabSwitch(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.id ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <i className={`fas ${t.icon} text-xs`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Course */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Course</span>
          <FilterSelect
            value={activeCourseId}
            onChange={(e) => { setCourseId(e.target.value); setStudentId(""); setSelectedDay(null); setTableSessionId(""); }}
            style={{ width: 200 }}
          >
            {myCourses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </FilterSelect>
        </div>

        {/* Session selector — only in students + table mode */}
        {tab === "students" && viewMode === "table" && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Session</span>
            <FilterSelect
              value={tableSessionId}
              onChange={(e) => setTableSessionId(e.target.value)}
              style={{ width: 220 }}
            >
              {loadingSessions ? (
                <option value="">Loading sessions…</option>
              ) : parentSessions.length === 0 ? (
                <option value="">No sessions found</option>
              ) : (
                parentSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}{s.scheduled_at ? ` — ${new Date(s.scheduled_at).toLocaleDateString([], { month: "short", day: "numeric" })}` : ""}
                  </option>
                ))
              )}
            </FilterSelect>
          </div>
        )}

        {/* Student — only in students + calendar mode */}
        {tab === "students" && viewMode === "calendar" && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Student</span>
            <FilterSelect
              value={activeStudentId}
              onChange={(e) => { setStudentId(e.target.value); setSelectedDay(null); }}
              style={{ width: 200 }}
            >
              {enrolledStudents.length === 0 ? (
                <option value="">No students enrolled</option>
              ) : (
                enrolledStudents.map((s) => <option key={s.id} value={s.id}>{s.username}</option>)
              )}
            </FilterSelect>
          </div>
        )}

        {/* Date range — only in calendar or my-attendance modes */}
        {(viewMode === "calendar" || tab === "mine") && (
          <>
            <FilterDateInput label="From" value={fromDate} max={toDate}       onChange={(e) => { setFromDate(e.target.value); setSelectedDay(null); }} />
            <FilterDateInput label="To"   value={toDate}   min={fromDate} max={todayStr()} onChange={(e) => { setToDate(e.target.value); setSelectedDay(null); }} />
          </>
        )}

        {/* View toggle */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">View</span>
          <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1">
            {[
              { id: "table",    label: "Table",    icon: "fa-table" },
              { id: "calendar", label: "Calendar", icon: "fa-calendar-alt" },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleViewModeSwitch(v.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === v.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <i className={`fas ${v.icon} text-[10px]`} />
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mark Attendance button */}
        {tab === "students" && enrolledStudents.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5 opacity-0 select-none">_</span>
            <button
              onClick={openMarkModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <i className="fas fa-clipboard-check text-xs" />
              Mark Attendance
            </button>
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      {isTableLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl" />
        </div>
      ) : (
        <>
          {/* Stats — shown when there's data */}
          {((tab === "students" && viewMode === "table" && attendanceRecords?.length > 0) ||
            ((tab === "mine" || viewMode === "calendar") && allAttendance?.length > 0)) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Total",   value: stats.total,   color: "text-white" },
                { label: "Present", value: stats.present, color: "text-emerald-400" },
                { label: "Rate",    value: `${stats.rate}%`, color: stats.rate >= 75 ? "text-emerald-400" : "text-rose-400" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── TABLE VIEW ── */}
          {viewMode === "table" && tab === "students" && (
            <SessionAttendanceTable
              enrolledStudents={enrolledStudents}
              attendanceRecords={attendanceRecords || []}
              sessionId={tableSessionId}
              dispatch={dispatch}
              onRefresh={() => tableSessionId && dispatch(fetchSessionAttendance(tableSessionId))}
            />
          )}

          {viewMode === "table" && tab === "mine" && (
            <MyAttendanceTable records={allAttendance || []} />
          )}

          {/* ── CALENDAR VIEW ── */}
          {viewMode === "calendar" && (
            tab === "students" && enrolledStudents.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <i className="fas fa-user-slash text-slate-600 text-3xl mb-3" />
                <p className="text-slate-300 font-semibold">No students enrolled</p>
              </div>
            ) : !allAttendance?.length ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <i className="fas fa-calendar-times text-slate-600 text-3xl mb-3" />
                <p className="text-slate-300 font-semibold">No attendance to show</p>
                <p className="text-slate-500 text-sm mt-1">No records found for the selected filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <AttendanceCalendar
                    attendanceByDate={attendanceByDate}
                    fromDate={fromDate}
                    toDate={toDate}
                    calMonth={calMonth}
                    onPrevMonth={prevMonth}
                    onNextMonth={nextMonth}
                    selectedDay={selectedDay}
                    onDaySelect={setSelectedDay}
                    onDayClick={handleCalendarDayClick}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-300">
                      {selectedDay
                        ? new Date(selectedDay + "T00:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                        : "All Records"}
                    </h3>
                    {selectedDay && (
                      <button onClick={() => setSelectedDay(null)} className="text-xs text-slate-500 hover:text-white transition flex items-center gap-1">
                        <i className="fas fa-times text-[10px]" /> Clear
                      </button>
                    )}
                  </div>
                  {tab === "students" && displayRecords.length > 0 && (
                    <p className="text-[10px] text-slate-600 italic px-0.5">Click a record to edit</p>
                  )}
                  {!displayRecords.length ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
                      <i className="fas fa-calendar-times text-slate-600 text-2xl mb-3" />
                      <p className="text-slate-400 text-sm">{selectedDay ? "No records for this day." : "No records in range."}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
                      {displayRecords.map((r) => {
                        const editable = tab === "students";
                        return (
                          <div
                            key={r.id}
                            onClick={editable ? () => openEdit(r) : undefined}
                            className={`bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 transition ${
                              editable ? "cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/40 group" : "hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-white text-sm truncate">{r.session_title}</p>
                                {tab === "students" && r.student_name && (
                                  <p className="text-xs text-indigo-400 truncate mt-0.5">{r.student_name}</p>
                                )}
                                <p className="text-[10px] text-slate-500 mt-1">
                                  {new Date(r.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                                <StatusBadge status={r.status} />
                                {editable && <i className="fas fa-chevron-right text-[10px] text-slate-600 group-hover:text-indigo-400 transition" />}
                              </div>
                            </div>
                            {r.note && (
                              <p className="text-xs text-slate-500 italic mt-2 border-t border-slate-800 pt-1.5">{r.note}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </>
      )}

      {/* ── DAY RECORDS PICKER ── */}
      {dayRecords && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Select Record</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(dayRecords[0].created_at).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
              <button onClick={() => setDayRecords(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <i className="fas fa-times text-sm" />
              </button>
            </div>
            <div className="px-4 py-3 space-y-2">
              {dayRecords.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setDayRecords(null); openEdit(r); }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800/60 transition text-left group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{r.session_title}</p>
                    {r.student_name && <p className="text-xs text-indigo-400 truncate mt-0.5">{r.student_name}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={r.status} />
                    <i className="fas fa-chevron-right text-[10px] text-slate-600 group-hover:text-indigo-400 transition" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT ATTENDANCE MODAL (calendar view) ── */}
      {editRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Edit Attendance</h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{editRecord.session_title}</p>
              </div>
              <button onClick={() => setEditRecord(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <i className="fas fa-times text-sm" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {editRecord.student_name && (
                <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                  <i className="fas fa-user-graduate text-indigo-400 text-xs w-4 text-center" />
                  <p className="text-sm font-semibold text-white">{editRecord.student_name}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Status</label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <StatusPill key={s} value={s} active={editForm.status === s} onClick={() => setEditForm((f) => ({ ...f, status: s }))} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Note</label>
                <textarea
                  rows={3}
                  placeholder="Optional note"
                  value={editForm.note}
                  onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={() => setEditRecord(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={patchingStudentAttendance}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {patchingStudentAttendance ? <><i className="fas fa-spinner fa-spin text-xs" /> Saving…</> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BULK MARK ATTENDANCE MODAL ── */}
      {markModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">Mark Session Attendance</h3>
                <p className="text-xs text-slate-400 mt-0.5">Set status for all enrolled students</p>
              </div>
              <button onClick={() => setMarkModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <i className="fas fa-times text-sm" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              {/* Course dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Course</label>
                <FilterSelect
                  value={markCourseId}
                  onChange={(e) => { setMarkCourseId(e.target.value); setMarkSessionId(""); setMarkStatuses({}); }}
                  className="w-full"
                >
                  {myCourses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </FilterSelect>
              </div>

              {/* Session picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Session</label>
                {loadingSessions ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                    <i className="fas fa-spinner animate-spin text-xs" /> Loading sessions…
                  </div>
                ) : (
                  <FilterSelect
                    value={markSessionId}
                    onChange={(e) => setMarkSessionId(e.target.value)}
                    className="w-full"
                  >
                    <option value="">Select a session</option>
                    {markSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}{s.scheduled_at ? ` — ${new Date(s.scheduled_at).toLocaleDateString([], { month: "short", day: "numeric" })}` : ""}
                      </option>
                    ))}
                  </FilterSelect>
                )}
              </div>

              {/* Students list */}
              {markEnrolledStudents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Students ({markEnrolledStudents.length})
                    </label>
                    <div className="flex gap-1.5">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            const all = {};
                            markEnrolledStudents.forEach((st) => { all[st.id] = s; });
                            setMarkStatuses(all);
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white transition capitalize"
                        >
                          All {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {markEnrolledStudents.map((s) => {
                      const status = markStatuses[s.id] || "present";
                      return (
                        <div key={s.id} className="flex items-center justify-between gap-3 px-3 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                              <i className="fas fa-user text-indigo-400 text-[10px]" />
                            </div>
                            <p className="text-sm font-medium text-white truncate">{s.username}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            {STATUS_OPTIONS.map((opt) => (
                              <StatusPill
                                key={opt}
                                value={opt}
                                active={status === opt}
                                onClick={() => setMarkStatuses((prev) => ({ ...prev, [s.id]: opt }))}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-800 shrink-0">
              <button onClick={() => setMarkModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
                Cancel
              </button>
              <button
                onClick={handleBulkMark}
                disabled={markingBulkAttendance || !markSessionId}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {markingBulkAttendance ? <><i className="fas fa-spinner fa-spin text-xs" /> Saving…</> : "Mark Attendance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
