import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyAttendance, selectMyAttendance } from "../../../store/slices/studentDashboardSlice";
import { useDateFormatters } from "../../../hooks/useDateFormatters";

const THRESHOLD = 85;
const isPresent = (s) => s === "present" || s === "attended";
// present = 1, late = 0.5, absent = 0
const scoreOf = (s) => (isPresent(s) ? 1 : s === "late" ? 0.5 : 0);
const STATUS_STYLE = {
  present: "bg-emerald-500/15 text-emerald-400",
  attended: "bg-emerald-500/15 text-emerald-400",
  late: "bg-amber-500/15 text-amber-400",
  absent: "bg-rose-500/15 text-rose-400",
};

const AttendanceTab = ({ onRequestLeave }) => {
  const dispatch = useDispatch();
  const rawAttendance = useSelector(selectMyAttendance);
  const { formatDate, formatTime } = useDateFormatters();

  useEffect(() => {
    dispatch(fetchMyAttendance());
  }, [dispatch]);

  const records = useMemo(
    () => (Array.isArray(rawAttendance) ? rawAttendance : []).filter((r) => r.status),
    [rawAttendance]
  );

  const total = records.length;
  const attended = records.filter((r) => isPresent(r.status) || r.status === "late").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const overall = total ? Math.round((records.reduce((a, r) => a + scoreOf(r.status), 0) / total) * 100) : null;
  const punctuality = attended ? Math.round(((attended - lateCount) / attended) * 100) : null;

  const bySubject = useMemo(() => {
    const map = new Map();
    records.forEach((r) => {
      const key = r.course_title || r.session_title || "Class";
      const m = map.get(key) || { name: key, attended: 0, total: 0, score: 0 };
      m.total += 1;
      m.score += scoreOf(r.status);
      if (isPresent(r.status) || r.status === "late") m.attended += 1;
      map.set(key, m);
    });
    return [...map.values()]
      .map((m) => ({ ...m, percent: Math.round((m.score / m.total) * 100) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [records]);

  const recent = useMemo(
    () => [...records].sort((a, b) => new Date(b.scheduled_at || b.created_at) - new Date(a.scheduled_at || a.created_at)).slice(0, 8),
    [records]
  );

  const good = overall != null && overall >= THRESHOLD;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: overall gauge & leave action */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <i className="fas fa-user-check text-indigo-400 text-sm" />
              <h3 className="text-sm font-bold text-white tracking-tight">Attendance Standing</h3>
            </div>
            {overall != null && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${good ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                {good ? "Good Standing" : "Below 85%"}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {overall != null && (
                  <path
                    className={good ? "text-emerald-500" : "text-amber-500"}
                    strokeDasharray={`${overall}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white font-poppins leading-none">
                  {overall != null ? `${overall}%` : "—"}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Overall</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-xs uppercase font-bold text-slate-400">Attended</span>
                <p className="text-lg font-black text-white mt-0.5">{attended} / {total}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-xs uppercase font-bold text-slate-400">On time</span>
                <p className="text-lg font-black text-emerald-400 mt-0.5">{punctuality != null ? `${punctuality}%` : "—"}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-amber-300">
              <i className="fas fa-calendar-times mt-0.5 text-amber-400 shrink-0 text-sm" />
              <span>Expecting to miss a class? Send your teachers an advance notice.</span>
            </div>
            <button
              onClick={onRequestLeave}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <i className="fas fa-file-medical text-xs" />
              <span>Request Leave / Absence Notice</span>
            </button>
          </div>
        </div>

        {/* Right: per-subject rates & recent classes */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <i className="fas fa-chart-pie text-indigo-400 text-sm" />
                <h3 className="text-sm font-bold text-white tracking-tight">Attendance by Subject</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Target: &gt;= {THRESHOLD}%</span>
            </div>

            {bySubject.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No attendance has been recorded for you yet.</p>
            ) : (
              <div className="space-y-4">
                {bySubject.map((sub) => (
                  <div key={sub.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs gap-3">
                      <span className="font-semibold text-slate-200 truncate">{sub.name}</span>
                      <span className="text-slate-400 font-mono text-xs shrink-0">
                        {sub.attended} / {sub.total} classes &nbsp;|&nbsp;{" "}
                        <strong className={sub.percent >= THRESHOLD ? "text-emerald-400" : "text-amber-400"}>{sub.percent}%</strong>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sub.percent >= THRESHOLD ? "bg-emerald-400" : "bg-amber-400"}`}
                        style={{ width: `${sub.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recent.length > 0 && (
            <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <i className="fas fa-clock-rotate-left text-indigo-400 text-sm" />
                <h3 className="text-sm font-bold text-white tracking-tight">Recent Classes</h3>
              </div>
              <div className="divide-y divide-white/5">
                {recent.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                    <div className="min-w-0">
                      <p className="text-slate-200 font-semibold truncate">{r.session_title || r.course_title}</p>
                      <p className="text-slate-500 text-xs">
                        {r.scheduled_at ? `${formatDate(r.scheduled_at)} · ${formatTime(r.scheduled_at)}` : ""}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase shrink-0 ${STATUS_STYLE[r.status] || "bg-slate-700/40 text-slate-300"}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTab;
