import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchParentDashboard,
  fetchChildAttendance,
} from "../../store/slices/parentSlice";

const STATUS_CONFIG = {
  present: { label: "Present", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  absent:  { label: "Absent",  color: "bg-red-500/20 text-red-400 border-red-500/30" },
  late:    { label: "Late",    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "—";
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "—";
const fmtDuration = (joined, left) => {
  if (!joined || !left) return "—";
  const mins = Math.round((new Date(left) - new Date(joined)) / 60000);
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const ParentAttendance = () => {
  const dispatch = useDispatch();
  const { data: dashboardData, loading: dashLoading } = useSelector((state) => state.parent.dashboard);
  const childAttendanceData  = useSelector((state) => state.parent.childAttendance.data);
  const childAttendanceLoading = useSelector((state) => state.parent.childAttendance.loading);

  const [selectedChildId, setSelectedChildId] = useState("");

  useEffect(() => {
    if (!dashboardData) dispatch(fetchParentDashboard());
  }, [dispatch, dashboardData]);

  // Auto-select first child
  useEffect(() => {
    const children = dashboardData?.children;
    if (children?.length && !selectedChildId) {
      setSelectedChildId(String(children[0].id));
    }
  }, [dashboardData, selectedChildId]);

  useEffect(() => {
    if (selectedChildId) dispatch(fetchChildAttendance(selectedChildId));
  }, [dispatch, selectedChildId]);

  const attendance = childAttendanceData[selectedChildId] ?? [];
  const isLoading  = childAttendanceLoading[selectedChildId] || dashLoading;

  const total   = attendance.length;
  const present = attendance.filter((r) => r.status === "present").length;
  const absent  = attendance.filter((r) => r.status === "absent").length;
  const late    = attendance.filter((r) => r.status === "late").length;
  const rate    = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
  const rateColor = rate >= 90 ? "text-emerald-400" : rate >= 75 ? "text-yellow-400" : rate >= 60 ? "text-orange-400" : "text-red-400";

  const children = dashboardData?.children ?? [];

  return (
    <div className="text-white px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black font-poppins mb-1">Child Attendance</h1>
        <p className="text-slate-400 text-sm">View your child's full attendance history.</p>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(String(child.id))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                selectedChildId === String(child.id)
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {child.username || child.name || `Child ${child.id}`}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      {!isLoading && total > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Total", value: total,   icon: "fa-calendar-check", color: "text-indigo-400",  bg: "bg-indigo-500/10"  },
              { label: "Present", value: present, icon: "fa-check-circle",   color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Absent",  value: absent,  icon: "fa-times-circle",   color: "text-red-400",     bg: "bg-red-500/10"     },
              { label: "Late",    value: late,    icon: "fa-clock",          color: "text-yellow-400",  bg: "bg-yellow-500/10"  },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <i className={`fas ${s.icon} ${s.color}`}></i>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-300">Attendance Rate</p>
              <p className={`text-2xl font-black ${rateColor}`}>{rate}%</p>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  rate >= 90 ? "bg-emerald-500" : rate >= 75 ? "bg-yellow-500" : rate >= 60 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Records */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-slate-800">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-5 animate-pulse flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-56" />
                  <div className="h-3 bg-slate-700/60 rounded w-32" />
                </div>
                <div className="h-6 bg-slate-700 rounded-full w-20" />
              </div>
            ))}
          </div>
        ) : !attendance.length ? (
          <div className="p-16 text-center">
            <i className="fas fa-calendar-times text-slate-600 text-3xl mb-3"></i>
            <p className="text-white font-bold mb-1">No Attendance Records</p>
            <p className="text-slate-400 text-sm">
              {!selectedChildId ? "Select a child to view attendance." : "No sessions attended yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="lg:hidden divide-y divide-slate-800">
              {attendance.map((r) => {
                const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.absent;
                return (
                  <div key={r.id} className="px-4 py-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-white text-sm">{r.session_title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-slate-400">{fmt(r.joined_at)}</p>
                    <div className="flex gap-3 text-xs text-slate-500 mt-1">
                      <span><i className="fas fa-sign-in-alt mr-1"></i>{fmtTime(r.joined_at)}</span>
                      {r.left_at && <span><i className="fas fa-sign-out-alt mr-1"></i>{fmtTime(r.left_at)}</span>}
                      <span><i className="fas fa-hourglass mr-1"></i>{fmtDuration(r.joined_at, r.left_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    {["Session", "Date", "Joined", "Left", "Duration", "Status"].map((h) => (
                      <th key={h} className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {attendance.map((r) => {
                    const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.absent;
                    return (
                      <tr key={r.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-5 py-4 font-semibold text-white text-sm">{r.session_title}</td>
                        <td className="px-5 py-4 text-slate-400 text-sm">{fmt(r.joined_at)}</td>
                        <td className="px-5 py-4 text-slate-300 text-sm font-mono">{fmtTime(r.joined_at)}</td>
                        <td className="px-5 py-4 text-slate-300 text-sm font-mono">{fmtTime(r.left_at)}</td>
                        <td className="px-5 py-4 text-slate-400 text-sm">{fmtDuration(r.joined_at, r.left_at)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs border font-semibold ${cfg.color}`}>{cfg.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParentAttendance;
