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
import { coursesService } from "../../services/coursesService";
import AttendanceCalendar from "../../components/common/AttendanceCalendar";
import AttendanceEditModal from "../../components/common/AttendanceEditModal";
import {
  STATUS_CONFIG, STATUS_OPTIONS,
  StatusBadge, StatusPill,
  fmtTime, SessionBanner,
} from "../../components/common/attendanceShared";
import { FilterSelect, FilterDateInput } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";

const toDateStr = (d) => d.toISOString().slice(0, 10);
const monthStart = () => { const d = new Date(); d.setDate(1); return toDateStr(d); };
const todayStr = () => toDateStr(new Date());

// ── Session attendance table ───────────────────────────────────────────────────
const SessionAttendanceTable = ({ attendanceRecords, onEdit, session }) => {
  const rows = useMemo(
    () => (attendanceRecords || []).filter((r) => r.participant_role === "student"),
    [attendanceRecords]
  );

  if (!rows.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <i className="fas fa-user-slash text-slate-600 text-3xl mb-3" />
        <p className="text-slate-300 font-semibold">No attendance records</p>
        <p className="text-slate-500 text-sm mt-1">Select a session or mark attendance first</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SessionBanner session={session} />
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[160px]">Student</th>
              <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[110px]">Joined At</th>
              <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[110px]">Left At</th>
              <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[100px]">Status</th>
              {onEdit && <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold w-16">Edit</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className={`border-b border-slate-800/40 last:border-0 transition-colors group ${
                  onEdit ? "cursor-pointer hover:bg-indigo-900/10" : "hover:bg-slate-800/20"
                }`}
                onClick={() => onEdit?.(r)}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-400 text-xs font-bold">
                        {(r.student_name || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white text-xs font-semibold truncate">{r.student_name || `Student #${r.student}`}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center">{fmtTime(r.joined_at)}</td>
                <td className="px-4 py-3.5 text-center">{fmtTime(r.left_at)}</td>
                <td className="px-4 py-3.5 text-center">
                  <StatusBadge status={r.status} />
                </td>
                {onEdit && (
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-600 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition">
                      <i className="fas fa-pencil-alt text-[10px]" />
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onEdit && (
        <p className="text-[10px] text-slate-600 italic px-5 py-2.5 border-t border-slate-800/50">
          Click a row to edit that student's attendance
        </p>
      )}
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

  const [editRecord, setEditRecord]         = useState(null);
  const [dayRecords, setDayRecords]         = useState(null);

  // Bulk mark modal
  const [markModal, setMarkModal]           = useState(false);
  const [markStatuses, setMarkStatuses]     = useState({});
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  const [enrolledStudents, setEnrolledStudents] = useState([]);

  const activeCourseId = courseId || (myCourses?.[0] ? String(myCourses[0].id) : "");

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

  // Fetch enrolled students from course detail whenever course changes
  useEffect(() => {
    if (!activeCourseId) { setEnrolledStudents([]); return; }
    coursesService.getCourseById(activeCourseId)
      .then((data) => setEnrolledStudents(data?.enrolled_students || []))
      .catch(() => setEnrolledStudents([]));
  }, [activeCourseId]);

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

  // Merged student list for the bulk modal (attendance records + unenrolled students)
  const markStudents = useMemo(() => {
    if (!markModal) return [];
    const fromRecords = (attendanceRecords || [])
      .filter((r) => r.participant_role === "student")
      .map((r) => ({
        id: String(r.student?.id ?? r.student),
        username: r.student_name || `Student #${r.student?.id ?? r.student}`,
        joinedAt: r.joined_at,
        leftAt: r.left_at,
        existingStatus: r.status,
        hasRecord: true,
      }));
    const recordedIds = new Set(fromRecords.map((s) => s.id));
    const fromEnrolled = enrolledStudents
      .filter((s) => !recordedIds.has(String(s.id)))
      .map((s) => ({
        id: String(s.id),
        username: s.username,
        joinedAt: null,
        leftAt: null,
        existingStatus: null,
        hasRecord: false,
      }));
    return [...fromRecords, ...fromEnrolled];
  }, [markModal, attendanceRecords, enrolledStudents]);

  // Auto-select all students when modal opens or when attendance data refreshes
  useEffect(() => {
    if (markModal && markStudents.length > 0) {
      setSelectedStudentIds(new Set(markStudents.map((s) => s.id)));
    }
  }, [markModal, markStudents.length]);


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

  const openEdit = (r) => setEditRecord(r);

  const handleEditSave = async (form) => {
    if (!editRecord) return;
    const sessionId = editRecord.session?.id ?? editRecord.session_id ?? editRecord.session;
    const sId       = editRecord.student?.id ?? editRecord.student_id ?? editRecord.student;
    if (!sessionId || !sId) { toastManager.error("Missing session or student info"); return; }
    try {
      await dispatch(updateStudentAttendance({ sessionId, studentId: sId, data: { status: form.status, note: form.note } })).unwrap();
      toastManager.success("Attendance updated");
      setEditRecord(null);
      if (tableSessionId) dispatch(fetchSessionAttendance(tableSessionId));
    } catch {
      toastManager.error("Failed to update attendance");
    }
  };

  const handleBulkMark = async () => {
    if (!tableSessionId) { toastManager.error("No session selected"); return; }
    const selected = markStudents.filter((s) => selectedStudentIds.has(s.id));
    if (!selected.length) { toastManager.error("No students selected"); return; }
    const records = selected.map((s) => ({
      student: s.id,
      status: markStatuses[s.id] ?? s.existingStatus ?? "present",
    }));
    try {
      await dispatch(bulkMarkAttendance({ sessionId: tableSessionId, records })).unwrap();
      toastManager.success("Attendance saved successfully");
      setMarkModal(false);
      dispatch(fetchSessionAttendance(tableSessionId));
    } catch {
      toastManager.error("Failed to save attendance");
    }
  };

  const openEditFromTable = (record) => {
    // Inject session ID since session-level records don't embed it
    openEdit({ ...record, session: tableSessionId });
  };

  const openMarkModal = () => {
    const initial = {};
    (attendanceRecords || []).filter((r) => r.participant_role === "student").forEach((r) => {
      const sid = r.student?.id ?? r.student;
      if (sid != null) initial[String(sid)] = r.status;
    });
    setMarkStatuses(initial);
    setSelectedStudentIds(new Set());
    setMarkModal(true);
    if (tableSessionId) dispatch(fetchSessionAttendance(tableSessionId));
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        {/* Left: View toggle */}
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

        {/* Right: Other filters */}
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

          {/* Mark Attendance button */}
          {tab === "students" && activeCourseId && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5 opacity-0 select-none">_</span>
              <button
                onClick={openMarkModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <i className="fas fa-clipboard-check text-xs" />
                Edit Attendance
              </button>
            </div>
          )}
        </div>
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
              attendanceRecords={attendanceRecords || []}
              onEdit={openEditFromTable}
              session={parentSessions.find((s) => String(s.id) === tableSessionId)}
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

      {/* ── EDIT ATTENDANCE MODAL ── */}
      <AttendanceEditModal
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSave={handleEditSave}
        saving={patchingStudentAttendance}
      />

      {/* ── BULK MARK / EDIT ATTENDANCE MODAL ── */}
      {markModal && (() => {
        const activeSession = parentSessions.find((s) => String(s.id) === tableSessionId);
        const activeCourse  = myCourses?.find((c) => String(c.id) === activeCourseId);
        const hasExisting   = markStudents.some((s) => s.hasRecord);
        const allSelected   = markStudents.length > 0 && selectedStudentIds.size === markStudents.length;

        const toggleAll = () => {
          setSelectedStudentIds(
            allSelected ? new Set() : new Set(markStudents.map((s) => s.id))
          );
        };

        const toggleOne = (id) => {
          setSelectedStudentIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
          });
        };

        return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">
                  {hasExisting ? "Edit Attendance" : "Mark Attendance"}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {activeCourse && (
                    <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-lg font-medium">
                      <i className="fas fa-book text-slate-600 mr-1" />{activeCourse.title}
                    </span>
                  )}
                  {activeSession ? (
                    <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-lg font-medium">
                      <i className="fas fa-chalkboard mr-1" />{activeSession.title}
                      {activeSession.scheduled_at && ` · ${new Date(activeSession.scheduled_at).toLocaleDateString([], { month: "short", day: "numeric" })}`}
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-400">No session selected</span>
                  )}
                </div>
              </div>
              <button onClick={() => setMarkModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <i className="fas fa-times text-sm" />
              </button>
            </div>

            {loadingAttendance ? (
              <div className="flex items-center justify-center py-16 flex-1">
                <div className="text-center">
                  <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl mb-3 block" />
                  <p className="text-slate-500 text-sm">Loading attendance…</p>
                </div>
              </div>
            ) : (
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              {/* ── Bulk status buttons (apply to selected) ── */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  Mark selected as
                </p>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={selectedStudentIds.size === 0}
                        onClick={() => {
                          const updated = { ...markStatuses };
                          markStudents.forEach((st) => {
                            if (selectedStudentIds.has(st.id)) updated[st.id] = s;
                          });
                          setMarkStatuses(updated);
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition capitalize disabled:opacity-30 disabled:cursor-not-allowed ${cfg.badge}`}
                      >
                        <i className={`fas ${s === "present" ? "fa-check-circle" : s === "absent" ? "fa-times-circle" : "fa-clock"} mr-1.5`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Student list ── */}
              {markStudents.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                      Students ({selectedStudentIds.size}/{markStudents.length} selected)
                    </label>
                    <button
                      type="button"
                      onClick={toggleAll}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition font-medium"
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {markStudents.map((s) => {
                      const curStatus = markStatuses[s.id] ?? s.existingStatus ?? "present";
                      const isSelected = selectedStudentIds.has(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => toggleOne(s.id)}
                          className={`border rounded-xl px-3 py-2.5 space-y-2 cursor-pointer transition ${
                            isSelected
                              ? "bg-indigo-900/10 border-indigo-500/30"
                              : "bg-slate-800/40 border-slate-700/50 opacity-60"
                          }`}
                        >
                          {/* Top row: checkbox + avatar + name + join/leave times */}
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleOne(s.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-slate-600 accent-indigo-500 cursor-pointer shrink-0"
                            />
                            <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                              <span className="text-indigo-400 text-[10px] font-bold">{s.username?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <p className="text-sm font-semibold text-white flex-1 truncate">{s.username}</p>
                            {s.hasRecord && (
                              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                {s.joinedAt && (
                                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <i className="fas fa-sign-in-alt text-emerald-500/70" />
                                    {new Date(s.joinedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                )}
                                {s.leftAt && (
                                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <i className="fas fa-sign-out-alt text-rose-500/70" />
                                    {new Date(s.leftAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Status pills */}
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] text-slate-600 font-medium shrink-0">
                              {s.hasRecord ? "Change to:" : "Mark as:"}
                            </span>
                            <div className="flex gap-1.5">
                              {STATUS_OPTIONS.map((opt) => (
                                <StatusPill
                                  key={opt}
                                  value={opt}
                                  active={curStatus === opt}
                                  onClick={() => setMarkStatuses((prev) => ({ ...prev, [s.id]: opt }))}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-users-slash text-slate-600 text-3xl mb-3 block" />
                  <p className="text-slate-400 text-sm font-semibold">No students found</p>
                  <p className="text-slate-600 text-xs mt-1">No attendance records or enrolled students for this session</p>
                </div>
              )}
            </div>
            )}

            <div className="flex gap-3 px-6 py-4 border-t border-slate-800 shrink-0">
              <button onClick={() => setMarkModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
                Cancel
              </button>
              <button
                onClick={handleBulkMark}
                disabled={markingBulkAttendance || !tableSessionId || loadingAttendance || selectedStudentIds.size === 0}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {markingBulkAttendance
                  ? <><i className="fas fa-spinner fa-spin text-xs" /> Saving…</>
                  : `${hasExisting ? "Save" : "Mark"} (${selectedStudentIds.size})`}
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default TeacherAttendance;
