import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectMyAttendance,
  selectMyAttendanceLoading,
  selectDashboardError,
  fetchMyAttendance,
} from "../../store/slices/studentDashboardSlice";

const MyAttendanceList = () => {
  const dispatch = useDispatch();
  const attendance = useSelector(selectMyAttendance);
  const isLoading = useSelector(selectMyAttendanceLoading);
  const error = useSelector(selectDashboardError);

  // Fetch attendance on component mount
  useEffect(() => {
    dispatch(fetchMyAttendance());
  }, [dispatch]);

  // Format timestamp to readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid time";
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      present: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-500",
        label: "Present",
      },
      absent: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-500",
        label: "Absent",
      },
      late: {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        text: "text-yellow-500",
        label: "Late",
      },
    };

    return statusConfig[status] || statusConfig.absent;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-md p-6 lg:p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-slate-500"></i>
          </div>
          <h3 className="text-lg font-bold text-white">My Attendance</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-900/50 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-md p-6 lg:p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-500"></i>
          </div>
          <h3 className="text-lg font-bold text-white">My Attendance</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400">Unable to load attendance</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!attendance || attendance.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-md p-6 lg:p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <i className="fas fa-calendar-check text-blue-500"></i>
          </div>
          <h3 className="text-lg font-bold text-white">My Attendance</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-calendar-times text-slate-500 text-xl"></i>
          </div>
          <p className="text-slate-400">Attendance records will appear here</p>
        </div>
      </div>
    );
  }

  // Success state with attendance data
  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 lg:p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
          <i className="fas fa-calendar-check text-blue-500"></i>
        </div>
        <h3 className="text-lg font-bold text-white">My Attendance</h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {attendance.map((record, index) => {
          const statusConfig = getStatusBadge(record.status);

          return (
            <div
              key={index}
              className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold text-sm line-clamp-1 flex-1 mr-2">
                  {record.session_title || "Untitled Session"}
                </h4>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}
                >
                  {statusConfig.label}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <i className="fas fa-sign-in-alt text-green-500"></i>
                  <span>Joined: {formatTime(record.joined_at)}</span>
                </div>
                {record.left_at && (
                  <div className="flex items-center gap-1">
                    <i className="fas fa-sign-out-alt text-red-500"></i>
                    <span>Left: {formatTime(record.left_at)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAttendanceList;
