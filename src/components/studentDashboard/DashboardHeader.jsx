import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  selectStudent,
  selectDashboardStats,
} from "../../store/slices/studentDashboardSlice";

const InfoChip = ({ icon, value }) => {
  const [state, setState] = useState("idle"); // idle | copied

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2 text-left"
      title={`Click to copy`}
    >
      <span className="text-white/30 text-xs">
        <i className={`fas fa-${icon}`} />
      </span>
      <span className="text-white/70 text-xs font-mono tracking-wide truncate max-w-[180px] lg:max-w-xs group-hover:text-white transition-colors duration-150">
        {value}
      </span>
      <span
        className={`text-xs transition-all duration-200 ${
          state === "copied"
            ? "text-green-400 opacity-100 translate-x-0"
            : "text-white/20 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
        }`}
      >
        <i className={`fas fa-${state === "copied" ? "check" : "copy"}`} />
      </span>
    </button>
  );
};

const DashboardHeader = () => {
  const student = useSelector(selectStudent);
  const stats = useSelector(selectDashboardStats);
  const authProfile = useSelector((s) => s.auth.profile);
  const studentId = student?.id ?? authProfile?.id;
  const email = student?.email ?? authProfile?.email;

  const formatGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  console.log("📊 Dashboard Header: Student:", student, "Stats:", stats);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-800 p-6 lg:p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between min-h-[160px] border border-white/10 gap-4">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold font-poppins mb-1 line-clamp-2">
          {formatGreeting()}, {student?.username || "Student"}!
        </h1>
        <p className="text-blue-100/80 text-sm">
          Focus on your goals today at VirtualCitySchool.
        </p>
        {student?.grade_level && (
          <p className="text-white/40 text-xs mt-1">
            Grade {student.grade_level}
          </p>
        )}
      </div>

      {(studentId || email) && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-3">
          <span className="text-[11px]">Student ID:</span>{studentId && <InfoChip icon="id-badge" value={String(studentId)} />}
          {email && <InfoChip icon="envelope" value={email} />}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
