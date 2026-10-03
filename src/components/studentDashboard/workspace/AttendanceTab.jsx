import React from "react";
import { useSelector } from "react-redux";
import { selectMyAttendance } from "../../../store/slices/studentDashboardSlice";

const AttendanceTab = ({ onRequestLeave }) => {
  const myAttendance = useSelector(selectMyAttendance) || [];

  // Subject attendance breakdown
  const subjectsAttendance = [
    { name: "Mathematics", attended: 24, total: 24, percent: 100, color: "bg-emerald-400" },
    { name: "Physics", attended: 22, total: 24, percent: 92, color: "bg-emerald-400" },
    { name: "Chemistry", attended: 20, total: 22, percent: 91, color: "bg-emerald-400" },
    { name: "English", attended: 18, total: 20, percent: 90, color: "bg-emerald-400" },
    { name: "History", attended: 16, total: 18, percent: 89, color: "bg-emerald-400" },
    { name: "Urdu", attended: 15, total: 18, percent: 83, color: "bg-amber-400" },
    { name: "Islamic Study", attended: 14, total: 14, percent: 100, color: "bg-emerald-400" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Grid: Circular Gauge & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Circular Gauge & Leave Action */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <i className="fas fa-user-check text-indigo-400 text-sm" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Attendance Standing
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
              Good Standing
            </span>
          </div>

          {/* Circular Gauge */}
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
                <path
                  className="text-emerald-500"
                  strokeDasharray="92, 100"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white font-poppins leading-none">
                  92%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Overall Term
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Attended</span>
                <p className="text-lg font-black text-white mt-0.5">129 / 140</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Punctuality</span>
                <p className="text-lg font-black text-emerald-400 mt-0.5">98.5%</p>
              </div>
            </div>
          </div>

          {/* Absence Alert & Request Leave */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-amber-300">
              <i className="fas fa-calendar-times mt-0.5 text-amber-400 shrink-0 text-sm" />
              <span>
                Anticipating an absence or medical leave? Submit an advance notice to your course instructors.
              </span>
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

        {/* Right Column (7 Cols): Subject-by-Subject Rates & Policy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <i className="fas fa-chart-pie text-indigo-400 text-sm" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Subject-Wise Attendance Breakdown
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Threshold: &gt;= 85%
              </span>
            </div>

            <div className="space-y-4">
              {subjectsAttendance.map((sub, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{sub.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {sub.attended} / {sub.total} classes &nbsp;|&nbsp;{" "}
                      <strong className={sub.percent >= 85 ? "text-emerald-400" : "text-amber-400"}>
                        {sub.percent}%
                      </strong>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${sub.color} rounded-full`}
                      style={{ width: `${sub.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cambridge Regulations Note */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <i className="fas fa-shield-alt text-base" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Cambridge Assessment Academic Policy
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Regular attendance is mandatory for official Cambridge IGCSE / A-Level exam board registration. Students maintaining &gt;85% attendance standing are eligible for internal assessment recommendations and honors transcripts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTab;
