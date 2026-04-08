import React from "react";

const ChildCard = ({ child }) => {
  const getInitials = (username) => {
    if (!username) return "?";
    return username
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "risk_alert":
        return "bg-red-500/20 text-red-500 border-red-500/20 animate-pulse";
      case "excellent_performance":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      case "good_performance":
        return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/20";
    }
  };

  const getBadgeText = (badge) => {
    switch (badge) {
      case "risk_alert":
        return "Risk Alert";
      case "excellent_performance":
        return "Excellent Performance";
      case "good_performance":
        return "Good Performance";
      default:
        return "Normal";
    }
  };

  const getGpaColor = (gpa) => {
    if (gpa >= 3.7) return "text-emerald-400";
    if (gpa >= 3.0) return "text-blue-400";
    if (gpa >= 2.5) return "text-amber-500";
    return "text-rose-500";
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 95) return "text-emerald-400";
    if (percentage >= 85) return "text-blue-400";
    if (percentage >= 75) return "text-amber-500";
    return "text-rose-500";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-indigo-500/30 transition-all duration-300">
      {/* Header with avatar and badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {child.avatar ? (
            <img
              src={child.avatar}
              alt={child.username}
              className="w-16 h-16 rounded-2xl border-2 border-indigo-500 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-2xl border-2 border-indigo-500 shadow-md flex items-center justify-center text-xl font-bold">
              {getInitials(child.username)}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-white">{child.username}</h3>
            <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">
              {child.grade_level}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getBadgeColor(
            child.badge
          )}`}
        >
          {getBadgeText(child.badge)}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-1">
            GPA
          </p>
          <p className={`text-lg font-black ${getGpaColor(child.gpa)}`}>
            {child.gpa?.toFixed(2) || "N/A"}
          </p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-1">
            Attendance
          </p>
          <p className={`text-lg font-black ${getAttendanceColor(
            child.attendance?.percentage
          )}`}>
            {child.attendance?.percentage?.toFixed(1) || "N/A"}%
          </p>
        </div>
      </div>

      {/* Attendance Breakdown */}
      {child.attendance && (
        <div className="mb-4">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-2">
            Attendance Details
          </p>
          <div className="flex justify-between text-xs">
            <span className="text-emerald-400">
              Present: {child.attendance.present}
            </span>
            <span className="text-amber-400">Late: {child.attendance.late}</span>
            <span className="text-rose-400">
              Absent: {child.attendance.absent}
            </span>
          </div>
        </div>
      )}

      {/* Assignment Progress */}
      <div className="mb-4">
        <p className="text-[10px] text-slate-500 font-black uppercase mb-2">
          Assignments
        </p>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400">
            Progress: {child.submitted_count}/{child.total_assignments}
          </span>
          <span className="text-slate-400">
            Graded: {child.graded_count}
          </span>
        </div>
        {child.overdue_count > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            <p className="text-red-400 text-xs font-bold">
              {child.overdue_count} Overdue
            </p>
          </div>
        )}
      </div>

      {/* Recent Grades */}
      {child.recent_grades && child.recent_grades.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-2">
            Recent Grades
          </p>
          <div className="space-y-2">
            {child.recent_grades.slice(0, 2).map((grade, index) => (
              <div
                key={index}
                className="bg-slate-900/30 border border-slate-700 rounded-lg p-2"
              >
                <p className="text-xs font-medium text-white truncate">
                  {grade.assignment}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {grade.course}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-indigo-400 font-bold">
                    {grade.score}/{grade.max_score} ({grade.percentage}%)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {formatDate(grade.graded_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
        <p className="text-slate-500 text-[10px] uppercase tracking-widest">
          Active Student
        </p>
        <button className="text-indigo-400 hover:text-white transition-colors">
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default ChildCard;
