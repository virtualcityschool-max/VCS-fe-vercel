import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../common/ConfirmDialog";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChildGrades,
  fetchChildAttendance,
} from "../../store/slices/parentSlice";
import { toastManager } from "../../utils/toastManager";
import {
  selectChildGrades,
  selectChildGradesLoading,
  selectChildGradesError,
  selectChildAttendance,
  selectChildAttendanceLoading,
  selectChildAttendanceError,
} from "../../store/slices/parentSlice";
import { unlinkChildLinks } from "../../store/slices/childLinksSlice";
import {
  selectChildLinksUnlinking,
  selectChildLinksError,
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
      <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
        <div className="w-12 h-3 bg-slate-600 rounded mb-2"></div>
        <div className="w-16 h-5 bg-slate-600 rounded"></div>
      </div>
      <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
        <div className="w-20 h-3 bg-slate-600 rounded mb-2"></div>
        <div className="w-16 h-5 bg-slate-600 rounded"></div>
      </div>
    </div>

    {/* Attendance Details skeleton */}
    <div className="mb-4">
      <div className="w-28 h-3 bg-slate-600 rounded mb-2"></div>
      <div className="flex justify-between">
        <div className="w-16 h-4 bg-slate-700 rounded"></div>
        <div className="w-12 h-4 bg-slate-700 rounded"></div>
        <div className="w-16 h-4 bg-slate-700 rounded"></div>
      </div>
    </div>

    {/* Assignment Progress skeleton */}
    <div className="mb-4">
      <div className="w-20 h-3 bg-slate-600 rounded mb-2"></div>
      <div className="flex justify-between mb-2">
        <div className="w-20 h-4 bg-slate-700 rounded"></div>
        <div className="w-16 h-4 bg-slate-700 rounded"></div>
      </div>
    </div>

    {/* Recent Grades skeleton */}
    <div className="mb-4">
      <div className="w-24 h-3 bg-slate-600 rounded mb-2"></div>
      <div className="space-y-2">
        <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-2">
          <div className="w-32 h-3 bg-slate-700 rounded mb-1"></div>
          <div className="w-24 h-3 bg-slate-700 rounded mb-1"></div>
          <div className="w-20 h-3 bg-slate-700 rounded"></div>
        </div>
        <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-2">
          <div className="w-28 h-3 bg-slate-700 rounded mb-1"></div>
          <div className="w-20 h-3 bg-slate-700 rounded mb-1"></div>
          <div className="w-24 h-3 bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>

    {/* Footer skeleton */}
    <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
      <div className="w-20 h-3 bg-slate-600 rounded"></div>
      <div className="w-6 h-6 bg-slate-600 rounded"></div>
    </div>
  </div>
);

const ChildCard = ({ child }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isGradesExpanded, setIsGradesExpanded] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Select child-specific data from Redux
  const childGrades = useSelector(selectChildGrades);
  const childAttendance = useSelector(selectChildAttendance);
  const gradesLoading = useSelector(selectChildGradesLoading(child.id));
  const attendanceLoading = useSelector(selectChildAttendanceLoading(child.id));
  const gradesError = useSelector(selectChildGradesError(child.id));
  const attendanceError = useSelector(selectChildAttendanceError(child.id));
  const isUnlinking = useSelector(selectChildLinksUnlinking);
  const childLinksError = useSelector(selectChildLinksError);

  // Fetch data on component mount if not already loaded
  useEffect(() => {
    if (!child.id) return;

    // if (!childGrades[child.id]) {
    //   dispatch(fetchChildGrades(child.id));
    // }

    if (!childAttendance[child.id]) {
      dispatch(fetchChildAttendance(child.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.id]);

  // Get data for this specific child
  const grades = childGrades[child.id];
  const attendance = childAttendance[child.id];

  // Show skeleton loader if initial data is loading
  const isInitialLoading =
    (gradesLoading || attendanceLoading) && !grades && !attendance;

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
    if (!dateString) return "0";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-indigo-500/30 transition-all duration-300 flex flex-col h-full">
      <div className="flex-grow">
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
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border whitespace-nowrap shadow-lg ${getBadgeColor(
              child.badge,
            )}`}
          >
            {getBadgeText(child.badge)}
          </span>

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
                      navigate(`/parent/child/${child.id}`);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <i className="fas fa-chart-line text-[10px] text-indigo-400"></i>
                    View Academic Details
                  </button>
                  <div className="h-px bg-slate-800 my-1"></div>
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
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-1">
            GPA
          </p>
          <p className={`text-lg font-black ${getGpaColor(child.gpa)}`}>
            {child.gpa?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-1">
            Attendance
          </p>
          {attendanceLoading ? (
            <div className="w-6 h-6 bg-slate-700 rounded animate-pulse"></div>
          ) : attendanceError ? (
            <p className="text-rose-400 text-sm">Error</p>
          ) : (
            <p
              className={`text-lg font-black ${getAttendanceColor(
                attendance?.percentage,
              )}`}
            >
              {attendance?.percentage?.toFixed(1) ||
                child.attendance?.percentage?.toFixed(1) ||
                "0"}
              %
            </p>
          )}
        </div>
      </div>

      {/* Attendance Breakdown */}
      {(attendance || child.attendance) && (
        <div className="mb-4">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-2">
            Attendance Details
          </p>
          {attendanceLoading ? (
            <div className="flex justify-between text-xs">
              <div className="w-12 h-4 bg-slate-700 rounded animate-pulse"></div>
              <div className="w-12 h-4 bg-slate-700 rounded animate-pulse"></div>
              <div className="w-12 h-4 bg-slate-700 rounded animate-pulse"></div>
            </div>
          ) : attendanceError ? (
            <p className="text-rose-400 text-xs">No data available</p>
          ) : (
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400">
                Present: {attendance?.present || child.attendance?.present || 0}
              </span>
              <span className="text-amber-400">
                Late: {attendance?.late || child.attendance?.late || 0}
              </span>
              <span className="text-rose-400">
                Absent: {attendance?.absent || child.attendance?.absent || 0}
              </span>
            </div>
          )}
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
          <span className="text-slate-400">Graded: {child.graded_count}</span>
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
      {(grades?.length > 0 || child.recent_grades?.length > 0) && (
        <div className="mb-4">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-2">
            Recent Grades
          </p>
          {gradesLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900/30 border border-slate-700 rounded-lg p-2"
                >
                  <div className="w-24 h-3 bg-slate-700 rounded animate-pulse mb-1"></div>
                  <div className="w-16 h-3 bg-slate-700 rounded animate-pulse mb-1"></div>
                  <div className="w-20 h-3 bg-slate-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : gradesError ? (
            <p className="text-rose-400 text-xs">No data available</p>
          ) : (
            <div className="space-y-2">
              {/* Hide button on top when expanded */}
              {isGradesExpanded && (
                <button
                  onClick={() => setIsGradesExpanded(false)}
                  className="w-full py-1 text-[9px] font-black uppercase tracking-widest text-indigo-400/60 hover:text-indigo-400 flex items-center justify-center gap-2 transition-colors group mb-2"
                >
                  Hide Grades <i className="fas fa-chevron-up text-[7px] transition-transform group-hover:-translate-y-0.5"></i>
                </button>
              )}

              {/* Grades List */}
              <div 
                className={`space-y-2 overflow-y-auto custom-scrollbar transition-all duration-300 ${
                  isGradesExpanded ? "max-h-[160px]" : ""
                }`}
              >
                {(grades || child.recent_grades || [])
                  .slice(0, isGradesExpanded ? undefined : 1)
                  .map((grade, index) => (
                    <div
                      key={index}
                      className="bg-slate-900/30 border border-slate-700 rounded-lg p-2 hover:border-slate-600 transition-colors"
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

              {/* View All button at bottom when collapsed */}
              {!isGradesExpanded && (grades || child.recent_grades || []).length > 1 && (
                <button
                  onClick={() => setIsGradesExpanded(true)}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-slate-700 rounded-lg group"
                >
                  View All ({(grades || child.recent_grades || []).length}){" "}
                  <i className="fas fa-chevron-down text-[8px] transition-transform group-hover:translate-y-0.5"></i>
                </button>
              )}
            </div>
          )}
        </div>
      )}
      </div>

      <div className="pt-4 mt-auto border-t border-slate-700/50">
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
