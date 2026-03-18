import React from "react";
import { useSelector } from "react-redux";
import {
  selectStudent,
  selectDashboardStats,
} from "../../store/slices/studentDashboardSlice";

const DashboardHeader = () => {
  const student = useSelector(selectStudent);
  const stats = useSelector(selectDashboardStats);

  const formatGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  console.log("📊 Dashboard Header: Student:", student, "Stats:", stats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-800 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-center min-h-[160px] border border-white/10">
        <h1 className="text-2xl font-bold font-poppins mb-1">
          {formatGreeting()}, {student?.username || "Student"}!
        </h1>
        <p className="text-blue-100/80 text-sm">
          Focus on your goals today at VirtualCitySchool.
        </p>
        {student?.grade_level && (
          <p className="text-blue-200/60 text-xs mt-2">
            Grade Level: {student.grade_level}
          </p>
        )}
      </div>

      {/* Stats Overview */}
      <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-700 shadow-xl flex items-center gap-6">
        <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
          <i className="fas fa-book-open text-xl"></i>
        </div>
        <div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
            Enrolled Courses
          </p>
          <h3 className="text-xl font-bold">
            {stats?.enrolledCoursesCount || 0}
          </h3>
          <p className="text-xs text-slate-500">Active enrollments</p>
        </div>
      </div>

      {/* Assignments Alert */}
      <div
        className={`p-8 rounded-[2.5rem] border shadow-xl flex items-center gap-6 ${
          (stats?.overdueAssignmentsCount || 0) > 0
            ? "bg-red-500/5 border-red-500/20"
            : "bg-green-500/5 border-green-500/20"
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${
            (stats?.overdueAssignmentsCount || 0) > 0
              ? "bg-red-500/20 text-red-500 animate-pulse"
              : "bg-green-500/20 text-green-500"
          }`}
        >
          <i
            className={`fas ${(stats?.overdueAssignmentsCount || 0) > 0 ? "fa-exclamation-circle" : "fa-check-circle"}`}
          ></i>
        </div>
        <div>
          <p
            className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
              (stats?.overdueAssignmentsCount || 0) > 0
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {(stats?.overdueAssignmentsCount || 0) > 0
              ? "Attention Required"
              : "All Caught Up"}
          </p>
          <h3 className="text-xl font-bold text-white">
            {(stats?.overdueAssignmentsCount || 0) > 0
              ? `${stats.overdueAssignmentsCount} Assignment${(stats.overdueAssignmentsCount || 0) !== 1 ? "s" : ""}`
              : "No overdue work"}
          </h3>
          <p className="text-xs text-slate-400">
            {(stats?.overdueAssignmentsCount || 0) > 0
              ? `Past due: Need attention`
              : `Great job staying on track!`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
