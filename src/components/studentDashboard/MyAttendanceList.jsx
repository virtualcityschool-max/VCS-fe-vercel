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
        hour12: true
      });
    } catch {
      return "Invalid time";
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      present: {
        bg: "bg-emerald-400/10",
        border: "border-emerald-500/10",
        text: "text-emerald-400",
        label: "Present",
        icon: "fa-check-circle"
      },
      absent: {
        bg: "bg-red-400/10",
        border: "border-red-500/10",
        text: "text-red-400",
        label: "Absent",
        icon: "fa-times-circle"
      },
      late: {
        bg: "bg-amber-400/10",
        border: "border-amber-500/10",
        text: "text-amber-400",
        label: "Late",
        icon: "fa-clock"
      },
    };

    return statusConfig[status] || statusConfig.absent;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/5 shadow-2xl animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
            <i className="fas fa-circle-notch fa-spin text-slate-500 text-xs"></i>
          </div>
          <div className="h-2 bg-white/5 rounded w-24"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/10">
            <i className="fas fa-exclamation-triangle text-red-500 text-xs"></i>
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Attendance Sync</h3>
        </div>
        <div className="text-center py-6">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Failed to load records</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!attendance || attendance.length === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/10">
            <i className="fas fa-calendar-check text-blue-500 text-xs"></i>
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">My Attendance</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/5">
            <i className="fas fa-ghost text-slate-600 text-sm"></i>
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Attendance records will appear here</p>
        </div>
      </div>
    );
  }

  // Success state with attendance data
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/5 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/10">
          <i className="fas fa-calendar-check text-blue-500 text-xs"></i>
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Presence History</h3>
      </div>

      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {attendance.map((record, index) => {
          const statusConfig = getStatusBadge(record.status);

          return (
            <div
              key={index}
              className="bg-white/5 rounded-xl p-3 border border-transparent hover:border-white/5 hover:bg-white/[0.08] transition-all duration-300 group"
            >
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <h4 className="text-slate-200 font-bold text-sm truncate flex-1 tracking-tight group-hover:text-white transition-colors">
                  {record.session_title || "Standard Session"}
                </h4>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/5 ${statusConfig.bg} ${statusConfig.text}`}
                >
                  <i className={`fas ${statusConfig.icon} text-[10px]`}></i>
                  {statusConfig.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1.5">
                  <i className="fas fa-sign-in-alt text-emerald-500/60 text-[10px]"></i>
                  <span>Joined: {formatTime(record.joined_at)}</span>
                </div>
                {record.left_at && (
                  <div className="flex items-center gap-1.5">
                    <i className="fas fa-sign-out-alt text-red-500/60 text-[10px]"></i>
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
