import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllAttendance,
  fetchMyCourses,
  fetchTeacherSessions,
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

const StatusPill = ({ value, active, onClick }) => {
  const cfg = STATUS_CONFIG[value];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition capitalize ${
        active
          ? cfg.badge
          : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"
      }`}
    >
      {cfg.label}
    </button>
  );
};

const TeacherAttendance = () => {
  const dispatch = useDispatch();
  const profile = useSelector((s) => s.auth.profile);
  const teacherId = profile?.id;

  const { myCourses, allAttendance, loadingAllAttendance, sessions, loadingSessions,
    markingBulkAttendance, patchingStudentAttendance } = useSelector((s) => s.teachers);

  const [tab, setTab] = useState("mine");
  const [courseId, setCourseId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [fromDate, setFromDate] = useState(monthStart());
  const [toDate, setToDate] = useState(todayStr());
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState(null);

  // --- edit individual record modal ---
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm] = useState({ status: "present", note: "" });

  // --- day records picker (when a calendar day has >1 record) ---
  const [dayRecords, setDayRecords] = useState(null);

  // --- bulk mark session attendance modal ---
  const [markModal, setMarkModal] = useState(false);
  const [markSessionId, setMarkSessionId] = useState("");
  const [markStatuses, setMarkStatuses] = useState({});

  const activeCourseId   = courseId || (myCourses?.[0] ? String(myCourses[0].id) : "");
  const activeCourse     = myCourses?.find((c) => String(c.id) === activeCourseId);
  const enrolledStudents = activeCourse?.enrolled_students ?? [];
  const activeStudentId  = studentId || (enrolledStudents[0] ? String(enrolledStudents[0].id) : "");

  // Build current fetch params (used for both initial fetch and after mutations)
  const buildParams = () => {
    const params = { course: activeCourseId, from: fromDate, to: toDate };
    if (tab === "mine" && teacherId) {
      params.participant_role = "teacher";
      params.teacher = teacherId;
    } else if (tab === "students") {
      params.participant_role = "student";
      params.student = activeStudentId;
    }
    return params;
  };

  const refetchAttendance = () => {
    if (!activeCourseId) return;
    if (tab === "students" && !activeStudentId) return;
    dispatch(fetchAllAttendance(buildParams()));
  };

  useEffect(() => {
    if (!myCourses?.length) dispatch(fetchMyCourses());
  }, [dispatch]);

  useEffect(() => {
    if (!activeCourseId) return;
    if (tab === "students" && !activeStudentId) return;
    dispatch(fetchAllAttendance(buildParams()));
  }, [dispatch, tab, activeCourseId, activeStudentId, fromDate, toDate, teacherId]);

  // Fetch sessions when bulk mark modal opens
  useEffect(() => {
    if (markModal && activeCourseId) {
      dispatch(fetchTeacherSessions({ course: activeCourseId }));
      setMarkSessionId("");
      setMarkStatuses({});
    }
  }, [markModal, activeCourseId, dispatch]);

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
    const all = allAttendance || [];
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
  const isLoading = loadingAllAttendance;

  // --- calendar day click (students tab only) ---
  const handleCalendarDayClick = (records) => {
    if (tab !== "students" || !records?.length) return;
    if (records.length === 1) {
      openEdit(records[0]);
    } else {
      setDayRecords(records);
    }
  };

  // --- individual edit handlers ---
  const openEdit = (r) => {
    setEditRecord(r);
    setEditForm({ status: r.status || "present", note: r.note || "" });
  };

  const handleEditSave = async () => {
    if (!editRecord) return;
    const sessionId = editRecord.session?.id ?? editRecord.session_id ?? editRecord.session;
    const studentId = editRecord.student?.id ?? editRecord.student_id ?? editRecord.student;
    if (!sessionId || !studentId) {
      toastManager.error("Missing session or student info");
      return;
    }
    try {
      await dispatch(updateStudentAttendance({ sessionId, studentId, data: { status: editForm.status, note: editForm.note } })).unwrap();
      toastManager.success("Attendance updated");
      setEditRecord(null);
      refetchAttendance();
    } catch {
      toastManager.error("Failed to update attendance");
    }
  };

  // --- bulk mark handlers ---
  const handleBulkMark = async () => {
    if (!markSessionId) { toastManager.error("Select a session first"); return; }
    if (!enrolledStudents.length) { toastManager.error("No students enrolled"); return; }
    const records = enrolledStudents.map((s) => ({
      student: s.id,
      status: markStatuses[s.id] || "present",
    }));
    try {
      await dispatch(bulkMarkAttendance({ sessionId: markSessionId, records })).unwrap();
      toastManager.success("Attendance marked successfully");
      setMarkModal(false);
      refetchAttendance();
    } catch {
      toastManager.error("Failed to mark attendance");
    }
  };

  const parentSessions = useMemo(
    () => (sessions || []).filter((s) => s.is_child === false || s.is_child == null),
    [sessions]
  );

  return (
    <div className="text-white px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black font-poppins">Attendance</h1>
        <p className="text-slate-400 text-sm mt-1">Track your sessions and monitor student attendance.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        {[
          { id: "mine",     label: "My Attendance",       icon: "fa-user-check" },
          { id: "students", label: "Students Attendance", icon: "fa-users" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setCourseId(""); setStudentId(""); setSelectedDay(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.id ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <i className={`fas ${t.icon} text-xs`}></i>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Course</span>
          <FilterSelect
            value={activeCourseId}
            onChange={(e) => { setCourseId(e.target.value); setStudentId(""); setSelectedDay(null); }}
            style={{ width: 200 }}
          >
            {myCourses?.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </FilterSelect>
        </div>

        {tab === "students" && (
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
                enrolledStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.username}</option>
                ))
              )}
            </FilterSelect>
          </div>
        )}

        <FilterDateInput label="From" value={fromDate} max={toDate} onChange={(e) => { setFromDate(e.target.value); setSelectedDay(null); }} />
        <FilterDateInput label="To" value={toDate} min={fromDate} max={todayStr()} onChange={(e) => { setToDate(e.target.value); setSelectedDay(null); }} />

        {tab === "students" && enrolledStudents.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5 opacity-0 select-none">_</span>
            <button
              onClick={() => setMarkModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <i className="fas fa-clipboard-check text-xs"></i>
              Mark Attendance
            </button>
          </div>
        )}
      </div>

      {tab === "students" && enrolledStudents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <i className="fas fa-user-slash text-slate-600 text-3xl mb-3"></i>
          <p className="text-slate-300 font-semibold">No students enrolled</p>
          <p className="text-slate-500 text-sm mt-1">This course has no enrolled students yet.</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl"></i>
        </div>
      ) : !allAttendance?.length ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <i className="fas fa-calendar-times text-slate-600 text-3xl mb-3"></i>
          <p className="text-slate-300 font-semibold">No attendance to show</p>
          <p className="text-slate-500 text-sm mt-1">No records found for the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: stats + calendar */}
          <div className="xl:col-span-2 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total",   value: stats.total,   color: "text-white" },
                { label: "Present", value: stats.present, color: "text-emerald-400" },
                { label: "Absent",  value: stats.absent,  color: "text-rose-400" },
                { label: "Rate", value: `${stats.rate}%`, color: stats.rate >= 75 ? "text-emerald-400" : "text-rose-400" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
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

          {/* Right: records panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300">
                {selectedDay
                  ? new Date(selectedDay + "T00:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                  : "All Records"}
              </h3>
              {selectedDay && (
                <button onClick={() => setSelectedDay(null)} className="text-xs text-slate-500 hover:text-white transition flex items-center gap-1">
                  <i className="fas fa-times text-[10px]"></i> Clear
                </button>
              )}
            </div>

            {tab === "students" && displayRecords.length > 0 && (
              <p className="text-[10px] text-slate-600 italic px-0.5">Click a record to edit attendance</p>
            )}

            {!displayRecords.length ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
                <i className="fas fa-calendar-times text-slate-600 text-2xl mb-3"></i>
                <p className="text-slate-400 text-sm">{selectedDay ? "No records for this day." : "No records in selected range."}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
                {displayRecords.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.absent;
                  const editable = tab === "students";
                  return (
                    <div
                      key={r.id}
                      onClick={editable ? () => openEdit(r) : undefined}
                      className={`bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 transition ${
                        editable
                          ? "cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/40 group"
                          : "hover:border-slate-700"
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
                          <span className={`px-2 py-0.5 rounded-full text-xs border font-semibold ${cfg.badge}`}>{cfg.label}</span>
                          {editable && (
                            <i className="fas fa-chevron-right text-[10px] text-slate-600 group-hover:text-indigo-400 transition" />
                          )}
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
      )}

      {/* ── DAY RECORDS PICKER (multiple records on same day) ── */}
      {dayRecords && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Select Record</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(dayRecords[0].created_at + "").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
              <button onClick={() => setDayRecords(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <i className="fas fa-times text-sm" />
              </button>
            </div>
            <div className="px-4 py-3 space-y-2">
              {dayRecords.map((r) => {
                const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.absent;
                return (
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
                      <span className={`px-2 py-0.5 rounded-full text-xs border font-semibold ${cfg.badge}`}>{cfg.label}</span>
                      <i className="fas fa-chevron-right text-[10px] text-slate-600 group-hover:text-indigo-400 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT INDIVIDUAL ATTENDANCE MODAL ── */}
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
                  placeholder="Optional note (e.g. arrived late due to connectivity)"
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
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a session</option>
                    {parentSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} — {s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString([], { month: "short", day: "numeric" }) : ""}
                      </option>
                    ))}
                  </FilterSelect>
                )}
              </div>

              {/* Students list */}
              {enrolledStudents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Students ({enrolledStudents.length})</label>
                    <div className="flex gap-1.5">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            const all = {};
                            enrolledStudents.forEach((st) => { all[st.id] = s; });
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
                    {enrolledStudents.map((s) => {
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
