import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCourses,
  selectCourses,
} from "../../store/slices/adminSlice";
import {
  fetchTeacherSessions,
  fetchSessionAttendance,
  updateStudentAttendance,
} from "../../store/slices/teacherSlice";
import AttendanceEditModal from "../../components/common/AttendanceEditModal";
import {
  StatusBadge, SessionBanner, fmtTime,
} from "../../components/common/attendanceShared";
import { FilterSelect } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";

// ── Teacher attendance table ──────────────────────────────────────────────────
const TeacherAttendanceTable = ({ records, session, onEdit }) => {
  if (!records.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <i className="fas fa-calendar-times text-slate-600 text-3xl mb-3" />
        <p className="text-slate-300 font-semibold">No attendance to show</p>
        <p className="text-slate-500 text-sm mt-1">Select a session to view attendance.</p>
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
                <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[200px]">Session</th>
                <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[140px]">Instructor</th>
                <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[120px]">Date</th>
                <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[110px]">Joined At</th>
                <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[110px]">Left At</th>
                <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[100px]">Status</th>
                <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Note</th>
                {onEdit && <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold w-14">Edit</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r.id ?? idx}
                  className={`border-b border-slate-800/40 last:border-0 transition-colors group ${
                    onEdit ? "cursor-pointer hover:bg-indigo-900/10" : "hover:bg-slate-800/20"
                  }`}
                  onClick={() => onEdit?.(r)}
                >
                  <td className="px-5 py-3.5">
                    <p className="text-white text-xs font-semibold">{r.session_title || "—"}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-400 text-[10px] font-bold">
                          {(r.teacher_name || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs truncate">{r.teacher_name || "—"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <p className="text-slate-400 text-xs">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-center">{fmtTime(r.joined_at)}</td>
                  <td className="px-4 py-3.5 text-center">{fmtTime(r.left_at)}</td>
                  <td className="px-4 py-3.5 text-center"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-500 text-xs italic">{r.note || "—"}</p>
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
            Click a row to edit attendance
          </p>
        )}
      </div>
    </div>
  );
};

// ── Student session attendance table ─────────────────────────────────────────
const StudentSessionTable = ({ attendanceRecords, session, onEdit }) => {
  const rows = useMemo(
    () => (attendanceRecords || []).filter((r) => r.participant_role === "student"),
    [attendanceRecords]
  );

  if (!rows.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <i className="fas fa-user-slash text-slate-600 text-3xl mb-3" />
        <p className="text-slate-300 font-semibold">No attendance records</p>
        <p className="text-slate-500 text-sm mt-1">Select a session to view attendance.</p>
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
                <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Note</th>
                {onEdit && <th className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold w-14">Edit</th>}
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
                  <td className="px-4 py-3.5 text-center"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-500 text-xs italic">{r.note || "—"}</p>
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
            Click a row to edit attendance
          </p>
        )}
      </div>
    </div>
  );
};

// ── Stats bar ─────────────────────────────────────────────────────────────────
const StatsBar = ({ records }) => {
  const stats = useMemo(() => {
    const present = records.filter((r) => r.status === "present").length;
    const absent  = records.filter((r) => r.status === "absent").length;
    const total   = records.length;
    const rate    = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, rate };
  }, [records]);

  if (!records.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Total",   value: stats.total,      color: "text-white" },
        { label: "Present", value: stats.present,    color: "text-emerald-400" },
        { label: "Absent",  value: stats.absent,     color: "text-rose-400" },
        { label: "Rate",    value: `${stats.rate}%`, color: stats.rate >= 75 ? "text-emerald-400" : "text-rose-400" },
      ].map((s) => (
        <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center">
          <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const AdminAttendance = () => {
  const dispatch = useDispatch();

  const coursesState = useSelector(selectCourses);
  const {
    sessions, loadingSessions,
    attendanceRecords, loadingAttendance,
    patchingStudentAttendance,
  } = useSelector((s) => s.teachers);

  const courses = coursesState?.data ?? [];

  const [tab,        setTab]        = useState("teacher");
  const [courseId,   setCourseId]   = useState("");
  const [sessionId,  setSessionId]  = useState("");
  const [editRecord, setEditRecord] = useState(null);

  const activeCourseId = courseId || (courses[0] ? String(courses[0].id) : "");

  // Sessions filtered to top-level only
  const parentSessions = useMemo(
    () => (sessions || []).filter((s) => s.is_child === false || s.is_child == null),
    [sessions]
  );

  // Load courses on mount
  useEffect(() => {
    if (!courses.length) dispatch(fetchCourses());
  }, [dispatch]);

  // Reset session when course or tab changes
  useEffect(() => {
    setSessionId("");
  }, [activeCourseId, tab]);

  // Fetch sessions for both tabs
  useEffect(() => {
    if (activeCourseId) {
      dispatch(fetchTeacherSessions({ course: activeCourseId }));
    }
  }, [activeCourseId, dispatch]);

  // Auto-select first session when sessions load
  useEffect(() => {
    if (parentSessions.length > 0 && !sessionId) {
      setSessionId(String(parentSessions[0].id));
    }
  }, [parentSessions]);

  // Fetch session attendance for both tabs
  useEffect(() => {
    if (sessionId) {
      dispatch(fetchSessionAttendance(sessionId));
    }
  }, [sessionId, dispatch]);

  const handleEditSave = async (form) => {
    if (!editRecord) return;
    const sId = editRecord.student?.id ?? editRecord.student_id ?? editRecord.student
             ?? editRecord.teacher?.id ?? editRecord.teacher_id ?? editRecord.teacher;
    if (!sessionId || !sId) { toastManager.error("Missing session or person info"); return; }
    try {
      await dispatch(updateStudentAttendance({ sessionId, studentId: sId, data: { status: form.status, note: form.note } })).unwrap();
      toastManager.success("Attendance updated");
      setEditRecord(null);
      dispatch(fetchSessionAttendance(sessionId));
    } catch {
      toastManager.error("Failed to update attendance");
    }
  };

  const handleTabChange = (t) => {
    setTab(t);
    setCourseId("");
    setSessionId("");
  };

  const isLoading = loadingAttendance;
  const activeSession = parentSessions.find((s) => String(s.id) === sessionId);

  return (
    <div className="text-white px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black font-poppins">Attendance</h1>
        <p className="text-slate-400 text-sm mt-1">View teacher and student attendance across courses.</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-slate-800">
        {[
          { id: "teacher", label: "Teacher Attendance", icon: "fa-chalkboard-teacher" },
          { id: "student", label: "Student Attendance", icon: "fa-user-graduate" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.id ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <i className={`fas ${t.icon} text-xs`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Course */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Course</span>
          <FilterSelect
            value={activeCourseId}
            onChange={(e) => { setCourseId(e.target.value); setSessionId(""); }}
            style={{ width: 220 }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </FilterSelect>
        </div>

        {/* Session — both tabs */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Session</span>
          <FilterSelect
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            style={{ width: 240 }}
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
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl" />
        </div>
      ) : (
        <div className="space-y-4">
          {tab === "teacher" && (() => {
            const teacherRows = (attendanceRecords || []).filter((r) => r.participant_role === "teacher");
            return (
              <>
                <StatsBar records={teacherRows} />
                <TeacherAttendanceTable
                  records={teacherRows}
                  session={activeSession}
                  onEdit={setEditRecord}
                />
              </>
            );
          })()}

          {tab === "student" && (
            <>
              <StatsBar records={(attendanceRecords || []).filter((r) => r.participant_role === "student")} />
              <StudentSessionTable
                attendanceRecords={attendanceRecords || []}
                session={activeSession}
                onEdit={setEditRecord}
              />
            </>
          )}
        </div>
      )}

      <AttendanceEditModal
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSave={handleEditSave}
        saving={patchingStudentAttendance}
      />
    </div>
  );
};

export default AdminAttendance;
