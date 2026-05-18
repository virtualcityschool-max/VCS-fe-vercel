import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../common/ConfirmDialog";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChildAttendance,
} from "../../store/slices/parentSlice";
import { toastManager } from "../../utils/toastManager";
import {
  selectChildAttendance,
  selectChildAttendanceLoading,
  selectChildAttendanceError,
} from "../../store/slices/parentSlice";
import { unlinkChildLinks } from "../../store/slices/childLinksSlice";
import {
  selectChildLinksUnlinking,
} from "../../store/slices/childLinksSlice";
import { showApiError } from "../../utils/apiErrorHandler";

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg animate-pulse">
    {/* Header skeleton */}
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-slate-700 rounded-2xl border-2 border-slate-600"></div>
        <div>
          <div className="w-32 h-6 bg-slate-700 rounded mb-2"></div>
          <div className="w-20 h-4 bg-slate-700 rounded"></div>
        </div>
      </div>
      <div className="w-24 h-8 bg-slate-700 rounded-full"></div>
    </div>

    {/* Stats Grid skeleton */}
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="w-full h-20 bg-slate-700 rounded-2xl"></div>
      <div className="w-full h-20 bg-slate-700 rounded-2xl"></div>
    </div>

    <div className="w-full h-32 bg-slate-700/50 rounded-2xl mb-4"></div>
    
    {/* Footer skeleton */}
    <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
      <div className="w-full h-10 bg-slate-700 rounded-xl"></div>
    </div>
  </div>
);

const ChildCard = ({ child }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Select child-specific data from Redux
  const childAttendance = useSelector(selectChildAttendance);
  const attendanceLoading = useSelector(selectChildAttendanceLoading(child.id));
  const attendanceError = useSelector(selectChildAttendanceError(child.id));
  const isUnlinking = useSelector(selectChildLinksUnlinking);

  // Fetch data on component mount if not already loaded
  useEffect(() => {
    if (!child.id) return;
    if (!childAttendance[child.id]) {
      dispatch(fetchChildAttendance(child.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.id]);

  // Get data for this specific child
  const attendance = childAttendance[child.id];

  // Show skeleton loader if initial data is loading
  const isInitialLoading = attendanceLoading && !attendance;

  // Return skeleton loader if initial loading
  if (isInitialLoading) {
    return <SkeletonLoader />;
  }
  const getInitials = (username) => {
    if (!username) return "?";
    return username
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const BADGE_CONFIG = {
    risk_alert: { label: "Risk Alert",  cls: "bg-red-500/20 text-red-500 border-red-500/20 animate-pulse" },
    on_track:   { label: "On Track",    cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" },
  };

  const fmtPct   = (val) => val == null ? "N/A" : `${Math.round(val)}%`;
  const fmtCount = (val) => val == null ? "N/A" : val;

  const getAttendanceColor = (percentage) => {
    if (percentage == null) return "text-slate-500";
    if (percentage >= 95) return "text-emerald-400";
    if (percentage >= 85) return "text-blue-400";
    if (percentage >= 75) return "text-amber-500";
    return "text-rose-500";
  };

  const handleUnlink = async () => {
    try {
      await dispatch(unlinkChildLinks([child.id])).unwrap();
      toastManager.success("Child unlinked successfully!");
      window.location.reload();
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-indigo-500/30 transition-all duration-300 flex flex-col h-[600px] group/card">
      <div className="flex-grow flex flex-col min-h-0">
        {/* Header with avatar and badge */}
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          {child.avatar ? (
            <img
              src={child.avatar}
              alt={child.username}
              className="w-16 h-16 rounded-2xl border-2 border-indigo-500/30 shadow-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-indigo-600/10 text-indigo-400 rounded-2xl border-2 border-indigo-500/30 shadow-xl flex items-center justify-center text-xl font-black shrink-0">
              {getInitials(child.username)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-xl font-black text-white truncate leading-tight mb-1">{child.username}</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <p className="text-indigo-400/80 text-[10px] font-black uppercase tracking-[0.2em] truncate">
                {child.grade_level || "Student"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0 pt-1">
          {BADGE_CONFIG[child.badge] && (
            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border whitespace-nowrap shadow-lg ${BADGE_CONFIG[child.badge].cls}`}>
              {BADGE_CONFIG[child.badge].label}
            </span>
          )}

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                showDropdown 
                  ? "bg-slate-700 text-white" 
                  : "bg-slate-800/50 text-slate-500 hover:text-white hover:bg-slate-700"
              }`}
            >
              <i className="fas fa-ellipsis-v text-xs"></i>
            </button>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setConfirmUnlink(true);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                  >
                    <i className="fas fa-user-minus text-[10px]"></i>
                    Unlink Child Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 transition-colors group-hover/card:border-slate-600">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1">
            Total Courses
          </p>
          <p className="text-xl font-black text-white">
            {child.courses?.length || 0}
          </p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 transition-colors group-hover/card:border-slate-600 relative">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1">
            Total Attendance
            <span className="group/tt relative inline-flex items-center justify-center">
              <i className="fas fa-info-circle text-[10px] text-slate-400 hover:text-indigo-400 transition-colors cursor-help"></i>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-950 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-lg opacity-0 group-hover/tt:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/5 z-30 shadow-2xl translate-y-1 group-hover/tt:translate-y-0">
                All courses combined attendance
              </div>
            </span>
          </p>
          
          {attendanceLoading ? (
            <div className="w-8 h-6 bg-slate-700 rounded-lg animate-pulse"></div>
          ) : attendanceError ? (
            <p className="text-rose-400 text-sm font-black">Error</p>
          ) : (
            <p className={`text-xl font-black ${getAttendanceColor(attendance?.percentage ?? child.attendance?.percentage ?? null)}`}>
              {fmtPct(attendance?.percentage ?? child.attendance?.percentage ?? null)}
            </p>
          )}
        </div>
      </div>

      {/* Attendance Breakdown */}
      {(attendance || child.attendance) && (
        <div className="mb-6 px-1 shrink-0">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-3 flex items-center gap-1">
            Attendance Details
            <span className="group/tt2 relative inline-flex items-center justify-center">
              <i className="fas fa-info-circle text-[10px] text-slate-400 hover:text-indigo-400 transition-colors cursor-help"></i>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-950 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-lg opacity-0 group-hover/tt2:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/5 z-30 shadow-2xl translate-y-1 group-hover/tt2:translate-y-0">
                Combined attendance of all courses
              </div>
            </span>
          </p>
          {attendanceLoading ? (
            <div className="flex justify-between">
              {[...Array(3)].map((_, i) => <div key={i} className="w-16 h-4 bg-slate-700 rounded animate-pulse"></div>)}
            </div>
          ) : (
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-400/80">
                Present: {fmtCount(attendance?.present ?? child.attendance?.present ?? null)}
              </span>
              <span className="text-amber-400/80">
                Late: {fmtCount(attendance?.late ?? child.attendance?.late ?? null)}
              </span>
              <span className="text-rose-400/80">
                Absent: {fmtCount(attendance?.absent ?? child.attendance?.absent ?? null)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Enrolled Courses Section */}
      <div className="mb-4 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3 px-1 shrink-0">
          <p className="text-[10px] text-slate-500 font-black uppercase">
            Courses
          </p>
          <button 
            onClick={() => navigate(`/parent/child/${child.id}`)}
            className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View Detail <i className="fas fa-arrow-right text-[7px] ml-1"></i>
          </button>
        </div>
        
        {/* Scrollable Container */}
        <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar space-y-2 pb-2">
          {(child.courses || []).map((course, index) => (
            <div
              key={index}
              className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-3 hover:border-indigo-500/30 transition-all duration-300 group/course"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-slate-200 truncate group-hover/course:text-white transition-colors">
                    {course.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                    <div className="flex items-center gap-1.5">
                       <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">
                          Attendance:
                       </span>
                       <span className={`text-[9px] font-black ${getAttendanceColor(course.attendance?.percentage ?? null)}`}>
                          {fmtPct(course.attendance?.percentage ?? null)}
                       </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                       <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">
                          Assignments:
                       </span>
                       <span className="text-[9px] font-black text-slate-300">
                          {course.assignments_submitted || 0}/{course.assignments_total || 0}
                       </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                       <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">
                          Quizzes:
                       </span>
                       <span className="text-[9px] font-black text-slate-300">
                          {course.quizzes_submitted || 0}/{course.quizzes_total || 0}
                       </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/parent/child/${child.id}`, { state: { activeCourseId: course.id } })}
                  className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 transition-colors"
                >
                  Details <i className="fas fa-chevron-right text-[7px]"></i>
                </button>
              </div>
            </div>
          ))}
          
          {(!child.courses || child.courses.length === 0) && (
            <p className="text-[10px] text-slate-600 font-black uppercase text-center py-4 border border-dashed border-slate-700 rounded-xl">
              No enrolled courses
            </p>
          )}
        </div>
      </div>
      </div>

      <div className="pt-4 mt-auto border-t border-slate-700/50 shrink-0">
        <button
          onClick={() => navigate(`/parent/child/${child.id}`)}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-2"
        >
          View Full Report
          <i className="fas fa-arrow-right text-[8px]"></i>
        </button>
      </div>

      <ConfirmDialog
        open={confirmUnlink}
        variant="danger"
        title="Unlink Child"
        message={`Are you sure you want to unlink ${child.name || child.username || "this child"}? You will lose access to their dashboard.`}
        confirmLabel="Unlink"
        cancelLabel="Cancel"
        loading={isUnlinking}
        onConfirm={() => { setConfirmUnlink(false); handleUnlink(); }}
        onCancel={() => setConfirmUnlink(false)}
      />
    </div>
  );
};

export default ChildCard;
