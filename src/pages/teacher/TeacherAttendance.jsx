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
import AttendanceMatrix from "../../components/common/AttendanceMatrix";
import AttendanceEditModal from "../../components/common/AttendanceEditModal";
import {
  STATUS_CONFIG, STATUS_OPTIONS,
  StatusPill,
} from "../../components/common/attendanceShared";
import { FilterSelect } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";
import { useDateFormatters } from "../../hooks";

const TeacherAttendance = () => {
  const dispatch  = useDispatch();
  const { timezone, formatTime } = useDateFormatters();

  const {
    myCourses, allAttendance, loadingAllAttendance,
    sessions, loadingSessions,
    attendanceRecords, loadingAttendance,
    markingBulkAttendance, patchingStudentAttendance,
  } = useSelector((s) => s.teachers);

  const [tab,      setTab]      = useState("mine");
  const [courseId, setCourseId] = useState("");
  const [editRecord, setEditRecord] = useState(null);

  const [markModal,          setMarkModal]          = useState(false);
  const [markSessionId,      setMarkSessionId]      = useState("");
  const [markStatuses,       setMarkStatuses]       = useState({});
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [enrolledStudents,   setEnrolledStudents]   = useState([]);

  const activeCourseId = courseId || (myCourses?.[0] ? String(myCourses[0].id) : "");

  const allSessions = useMemo(
    () => [...(sessions || [])].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)),
    [sessions]
  );

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!myCourses?.length) dispatch(fetchMyCourses());
  }, [dispatch]);

  useEffect(() => {
    if (!activeCourseId) { setEnrolledStudents([]); return; }
    coursesService.getCourseById(activeCourseId)
      .then((data) => setEnrolledStudents(data?.enrolled_students || []))
      .catch(() => setEnrolledStudents([]));
  }, [activeCourseId]);

  useEffect(() => {
    if (activeCourseId) dispatch(fetchTeacherSessions({ course: activeCourseId }));
  }, [activeCourseId, dispatch]);

  useEffect(() => {
    setMarkSessionId("");
  }, [activeCourseId]);

  useEffect(() => {
    if (!activeCourseId) return;
    dispatch(fetchAllAttendance({
      course: activeCourseId,
      participant_role: tab === "mine" ? "teacher" : "student",
    }));
  }, [dispatch, tab, activeCourseId]);

  useEffect(() => {
    if (markModal && markSessionId) dispatch(fetchSessionAttendance(markSessionId));
  }, [dispatch, markModal, markSessionId]);

  // ── Mark modal helpers ────────────────────────────────────────────────────────

  const markStudents = useMemo(() => {
    if (!markModal) return [];
    const fromRecords = (attendanceRecords || [])
      .filter((r) => r.participant_role === "student")
      .map((r) => ({
        id: String(r.student?.id ?? r.student),
        username: r.student_name || `Student #${r.student?.id ?? r.student}`,
        joinedAt: r.joined_at, leftAt: r.left_at,
        existingStatus: r.status, hasRecord: true,
      }));
    const recordedIds = new Set(fromRecords.map((s) => s.id));
    const fromEnrolled = enrolledStudents
      .filter((s) => !recordedIds.has(String(s.id)))
      .map((s) => ({
        id: String(s.id), username: s.username,
        joinedAt: null, leftAt: null, existingStatus: null, hasRecord: false,
      }));
    return [...fromRecords, ...fromEnrolled];
  }, [markModal, attendanceRecords, enrolledStudents]);

  useEffect(() => {
    if (markModal && markStudents.length > 0) {
      setSelectedStudentIds(new Set(markStudents.map((s) => s.id)));
    }
  }, [markModal, markStudents.length]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleEditSave = async (form) => {
    if (!editRecord) return;
    const sessionId = editRecord.session?.id ?? editRecord.session_id ?? editRecord.session;
    const sId       = editRecord.student?.id ?? editRecord.student_id ?? editRecord.student;
    if (!sessionId || !sId) { toastManager.error("Missing session or student info"); return; }
    try {
      await dispatch(updateStudentAttendance({ sessionId, studentId: sId, data: { status: form.status, note: form.note } })).unwrap();
      toastManager.success("Attendance updated");
      setEditRecord(null);
      dispatch(fetchAllAttendance({ course: activeCourseId, participant_role: "student" }));
    } catch {
      toastManager.error("Failed to update attendance");
    }
  };

  const handleBulkMark = async () => {
    if (!markSessionId) { toastManager.error("Select a session first"); return; }
    const selected = markStudents.filter((s) => selectedStudentIds.has(s.id));
    if (!selected.length) { toastManager.error("No students selected"); return; }
    const records = selected.map((s) => ({
      student: s.id,
      status: markStatuses[s.id] ?? s.existingStatus ?? "present",
    }));
    try {
      await dispatch(bulkMarkAttendance({ sessionId: markSessionId, records })).unwrap();
      toastManager.success("Attendance saved successfully");
      setMarkModal(false);
      dispatch(fetchAllAttendance({ course: activeCourseId, participant_role: "student" }));
    } catch {
      toastManager.error("Failed to save attendance");
    }
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
  };

  const isLoading = loadingSessions || loadingAllAttendance;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="text-white px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black font-poppins">Attendance</h1>
          <p className="text-slate-400 text-sm mt-1">Track your sessions and monitor student attendance.</p>
        </div>

        <div className="w-full sm:w-64">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5 mb-1.5 block">Course</label>
          <FilterSelect
            value={activeCourseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full"
          >
            {myCourses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </FilterSelect>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        {[
          { id: "mine",     label: "My Attendance",       icon: "fa-user-check" },
          { id: "students", label: "Students Attendance", icon: "fa-users" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.id ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <i className={`fas ${t.icon} text-xs`} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "students" && activeCourseId && (
        <div className="flex justify-end">
          <button
            onClick={openMarkModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <i className="fas fa-clipboard-check text-xs" />
            Edit Attendance
          </button>
        </div>
      )}

      {/* Matrix */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl" />
        </div>
      ) : (
        <AttendanceMatrix
          sessions={allSessions}
          attendanceRecords={(allAttendance || []).filter(
            (r) => r.participant_role === (tab === "mine" ? "teacher" : "student")
          )}
          participantRole={tab === "mine" ? "teacher" : "student"}
          onEditRecord={tab === "students" ? setEditRecord : undefined}
        />
      )}

      {/* Edit Modal */}
      <AttendanceEditModal
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSave={handleEditSave}
        saving={patchingStudentAttendance}
      />

      {/* Bulk Mark Modal */}
      {markModal && (() => {
        const activeCourse = myCourses?.find((c) => String(c.id) === activeCourseId);
        const hasExisting  = markStudents.some((s) => s.hasRecord);
        const allSelected  = markStudents.length > 0 && selectedStudentIds.size === markStudents.length;

        const toggleAll = () =>
          setSelectedStudentIds(allSelected ? new Set() : new Set(markStudents.map((s) => s.id)));
        const toggleOne = (id) =>
          setSelectedStudentIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
          });

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 shrink-0">
                <div>
                  <h3 className="text-base font-bold text-white">{hasExisting ? "Edit Attendance" : "Mark Attendance"}</h3>
                  {activeCourse && (
                    <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-lg font-medium mt-1 inline-block">
                      <i className="fas fa-book text-slate-600 mr-1" />{activeCourse.title}
                    </span>
                  )}
                </div>
                <button onClick={() => setMarkModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                  <i className="fas fa-times text-sm" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1.5">Session</label>
                  {loadingSessions ? (
                    <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
                  ) : (
                    <select
                      value={markSessionId}
                      onChange={(e) => setMarkSessionId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                    >
                      <option value="">— Select a session —</option>
                      {allSessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}{s.scheduled_at ? ` — ${new Date(s.scheduled_at).toLocaleDateString([], { month: "short", day: "numeric", ...(timezone ? { timeZone: timezone } : {}) })}` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Mark selected as</p>
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

                {markStudents.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        Students ({selectedStudentIds.size}/{markStudents.length} selected)
                      </label>
                      <button type="button" onClick={toggleAll} className="text-xs text-indigo-400 hover:text-indigo-300 transition font-medium">
                        {allSelected ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {markStudents.map((s) => {
                        const curStatus  = markStatuses[s.id] ?? s.existingStatus ?? "present";
                        const isSelected = selectedStudentIds.has(s.id);
                        return (
                          <div
                            key={s.id}
                            onClick={() => toggleOne(s.id)}
                            className={`border rounded-xl px-3 py-2.5 space-y-2 cursor-pointer transition ${
                              isSelected ? "bg-indigo-900/10 border-indigo-500/30" : "bg-slate-800/40 border-slate-700/50 opacity-60"
                            }`}
                          >
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
                                      {formatTime(s.joinedAt)}
                                    </span>
                                  )}
                                  {s.leftAt && (
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                      <i className="fas fa-sign-out-alt text-rose-500/70" />
                                      {formatTime(s.leftAt)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[10px] text-slate-600 font-medium shrink-0">
                                {s.hasRecord ? "Change to:" : "Mark as:"}
                              </span>
                              <div className="flex gap-1.5">
                                {STATUS_OPTIONS.map((opt) => (
                                  <StatusPill
                                    key={opt} value={opt} active={curStatus === opt}
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
                    {!markSessionId && (
                      <p className="text-slate-600 text-xs mt-1">Select a session above to load students</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-slate-800 shrink-0">
                <button onClick={() => setMarkModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
                  Cancel
                </button>
                <button
                  onClick={handleBulkMark}
                  disabled={markingBulkAttendance || !markSessionId || loadingAttendance || selectedStudentIds.size === 0}
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
