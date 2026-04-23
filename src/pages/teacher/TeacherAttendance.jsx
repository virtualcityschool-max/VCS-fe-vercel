import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllAttendance,
  fetchMyCourses,
  fetchTeacherSessions,
  fetchSessionAttendance,
  updateSessionAttendance,
} from "../../store/slices/teacherSlice";
import { toastManager } from "../../utils/toastManager";
import { FilterSelect } from "../../components/ui";
import { showApiError } from "../../utils/apiErrorHandler";

const STATUS_CONFIG = {
  present: { label: "Present", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  absent:  { label: "Absent",  color: "bg-red-500/20 text-red-400 border-red-500/30" },
  late:    { label: "Late",    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const fmt = (d) => d ? new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

const TeacherAttendance = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("overview");         // "overview" | "update"
  const [courseFilter, setCourseFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [editingStatus, setEditingStatus] = useState({});
  const [editingNote, setEditingNote] = useState({});

  const {
    myCourses,
    allAttendance,
    loadingAllAttendance,
    sessions,
    loadingSessions,
    attendanceRecords,
    loadingAttendance,
    updatingAttendanceId,
  } = useSelector((state) => state.teachers);

  // Overview tab: fetch whenever filters change
  useEffect(() => {
    if (tab !== "overview") return;
    const params = {};
    if (courseFilter) params.course = courseFilter;
    if (studentFilter) params.student = studentFilter;
    dispatch(fetchAllAttendance(params));
  }, [dispatch, tab, courseFilter, studentFilter]);

  // Courses for filter dropdown
  useEffect(() => {
    if (!myCourses?.length) dispatch(fetchMyCourses());
  }, [dispatch, myCourses?.length]);

  // Update tab: load sessions list
  useEffect(() => {
    if (tab === "update") dispatch(fetchTeacherSessions());
  }, [dispatch, tab]);

  // Update tab: load attendance for selected session
  useEffect(() => {
    if (tab === "update" && selectedSessionId) {
      dispatch(fetchSessionAttendance(selectedSessionId));
      setEditingStatus({});
      setEditingNote({});
    }
  }, [dispatch, tab, selectedSessionId]);

  const handleUpdate = (record) => {
    const data = {};
    if (editingStatus[record.id]) data.status = editingStatus[record.id];
    if (editingNote[record.id] !== undefined) data.note = editingNote[record.id];
    if (!Object.keys(data).length) return;

    dispatch(updateSessionAttendance({ sessionId: selectedSessionId, attendanceId: record.id, data }))
      .unwrap()
      .then(() => {
        toastManager.success("Attendance updated");
        setEditingStatus((p) => { const n = { ...p }; delete n[record.id]; return n; });
        setEditingNote((p) => { const n = { ...p }; delete n[record.id]; return n; });
      })
      .catch(showApiError);
  };

  // Derive unique students from allAttendance for student filter
  const uniqueStudents = React.useMemo(() => {
    const seen = new Map();
    (allAttendance || []).forEach((r) => {
      if (!seen.has(r.student)) seen.set(r.student, r.student_name);
    });
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [allAttendance]);

  return (
    <div className="text-white px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black font-poppins mb-1">Attendance</h1>
        <p className="text-slate-400 text-sm">View all attendance or update session records.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-0">
        {[
          { id: "overview", label: "Overview", icon: "fa-table" },
          { id: "update",   label: "Update Session", icon: "fa-pen" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
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

      {/* ── Overview Tab ── */}
      {tab === "overview" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <FilterSelect
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setStudentFilter(""); }}
              className="min-w-[200px]"
            >
              <option value="">All Courses</option>
              {myCourses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </FilterSelect>

            <FilterSelect
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="min-w-[200px]"
            >
              <option value="">All Students</option>
              {uniqueStudents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </FilterSelect>

            {(courseFilter || studentFilter) && (
              <button
                onClick={() => { setCourseFilter(""); setStudentFilter(""); }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-sm transition-all"
              >
                <i className="fas fa-times text-xs"></i> Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {loadingAllAttendance ? (
              <div className="divide-y divide-slate-800">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="px-6 py-4 animate-pulse flex gap-4">
                    <div className="h-4 bg-slate-700 rounded w-40" />
                    <div className="h-4 bg-slate-700 rounded w-32" />
                    <div className="h-4 bg-slate-700 rounded w-24 ml-auto" />
                  </div>
                ))}
              </div>
            ) : !allAttendance?.length ? (
              <div className="p-16 text-center">
                <i className="fas fa-calendar-times text-slate-600 text-3xl mb-3"></i>
                <p className="text-slate-400">No attendance records found.</p>
              </div>
            ) : (
              <>
                {/* Mobile */}
                <div className="lg:hidden divide-y divide-slate-800">
                  {allAttendance.map((r) => {
                    const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.absent;
                    return (
                      <div key={r.id} className="px-4 py-4">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-white text-sm">{r.student_name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <p className="text-xs text-indigo-400">{r.session_title}</p>
                        <p className="text-xs text-slate-500 mt-1">{fmt(r.joined_at)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950/60 border-b border-slate-800">
                      <tr>
                        {["Student", "Session", "Joined At", "Left At", "Status", "Note"].map((h) => (
                          <th key={h} className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {allAttendance.map((r) => {
                        const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.absent;
                        return (
                          <tr key={r.id} className="hover:bg-slate-800/30 transition">
                            <td className="px-5 py-4 font-semibold text-white text-sm">{r.student_name}</td>
                            <td className="px-5 py-4 text-slate-300 text-sm">{r.session_title}</td>
                            <td className="px-5 py-4 text-slate-400 text-sm font-mono">{fmtTime(r.joined_at)}</td>
                            <td className="px-5 py-4 text-slate-400 text-sm font-mono">{fmtTime(r.left_at)}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs border font-semibold ${cfg.color}`}>{cfg.label}</span>
                            </td>
                            <td className="px-5 py-4 text-slate-500 text-xs italic">{r.note || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Update Session Tab ── */}
      {tab === "update" && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Session</label>
            <FilterSelect
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full md:w-96"
            >
              <option value="">Choose a session…</option>
              {sessions?.map((s) => (
                <option key={s.id} value={s.id}>{s.title || `Session ${s.id}`}</option>
              ))}
            </FilterSelect>
          </div>

          {loadingSessions && (
            <div className="flex justify-center py-12"><i className="fas fa-spinner animate-spin text-slate-400 text-xl"></i></div>
          )}

          {selectedSessionId && loadingAttendance && (
            <div className="flex justify-center py-12"><i className="fas fa-spinner animate-spin text-slate-400 text-xl"></i></div>
          )}

          {selectedSessionId && !loadingAttendance && !attendanceRecords?.length && (
            <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 text-center text-slate-400">
              No attendance records for this session.
            </div>
          )}

          {selectedSessionId && !loadingAttendance && attendanceRecords?.length > 0 && (
            <div className="space-y-3">
              {attendanceRecords.map((record) => (
                <div key={record.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Student</p>
                      <p className="font-semibold text-white">{record.student_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {fmtTime(record.joined_at)}{record.left_at ? ` – ${fmtTime(record.left_at)}` : ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Status</p>
                      <FilterSelect
                        value={editingStatus[record.id] ?? record.status}
                        onChange={(e) => setEditingStatus((p) => ({ ...p, [record.id]: e.target.value }))}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </FilterSelect>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Note</p>
                      <input
                        type="text"
                        value={editingNote[record.id] ?? record.note ?? ""}
                        onChange={(e) => setEditingNote((p) => ({ ...p, [record.id]: e.target.value }))}
                        placeholder="Optional note…"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      onClick={() => handleUpdate(record)}
                      disabled={
                        updatingAttendanceId === record.id ||
                        (!editingStatus[record.id] && editingNote[record.id] === undefined)
                      }
                      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
                    >
                      {updatingAttendanceId === record.id
                        ? <i className="fas fa-spinner animate-spin"></i>
                        : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherAttendance;
