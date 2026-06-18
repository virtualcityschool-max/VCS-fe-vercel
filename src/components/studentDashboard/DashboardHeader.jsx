import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  selectStudent,
  selectDashboardStats,
} from "../../store/slices/studentDashboardSlice";

const InfoChip = ({ label, value, icon, isMono = false }) => {
  const [state, setState] = useState("idle");

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2 px-2.5 py-1.5 bg-white/5 border border-white/5 hover:border-indigo-500/30 rounded-lg transition-all duration-200"
      title="Click to copy"
    >
      <div className="flex items-center justify-center">
        <i className={`fas fa-${icon} text-indigo-400/60 text-[10px]`} />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-inter leading-none">
        {label}:
      </span>
      <span className={`text-[11px] ${isMono ? "font-mono translate-y-[0.5px]" : "font-inter"} font-semibold text-slate-300 group-hover:text-white transition-colors leading-none`}>
        {value}
      </span>
      <div className="w-4 flex items-center justify-center">
        {state === "copied" ? (
          <i className="fas fa-check text-[9px] text-green-400 animate-in fade-in zoom-in" />
        ) : (
          <i className="fas fa-copy text-[9px] text-white/10 group-hover:text-white/30 transition-opacity" />
        )}
      </div>
    </button>
  );
};

const DashboardHeader = () => {
  const student = useSelector(selectStudent);
  const stats = useSelector(selectDashboardStats);
  const authProfile = useSelector((s) => s.auth.profile);
  const studentId = student?.id ?? authProfile?.id;
  const rollNo = authProfile?.student_profile?.roll_no;
  const email = student?.email ?? authProfile?.email;

  const formatGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-indigo-900/30 border border-indigo-500/10 backdrop-blur-md px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-indigo-500/5">
      {/* Subtle accent glow */}
      <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex items-center gap-5 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <span className="text-xl font-black text-indigo-400 font-poppins">
            {student?.username?.charAt(0) || "S"}
          </span>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-bold font-poppins text-white flex items-center gap-2">
            {formatGreeting()}, {student?.username || "Scholar"}
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {studentId && <InfoChip label="Student ID" value={String(studentId)} icon="id-badge" isMono={true} />}
            {rollNo && <InfoChip label="Roll No" value={String(rollNo)} icon="hashtag" isMono={true} />}
            {email && <InfoChip label="Email" value={email} icon="envelope" />}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <Link 
          to="/courses" 
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <i className="fas fa-plus text-[10px]"></i>
          Explore Courses
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
