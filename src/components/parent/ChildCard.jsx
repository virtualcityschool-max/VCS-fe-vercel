import React, { useEffect } from "react";
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
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleUnlink = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to unlink this child?",
    );
    if (!confirmed) return;

    try {
      await dispatch(unlinkChildLinks([child.id])).unwrap();
      // Show success message
      toastManager.success("Child unlinked successfully!");
      // Refresh parent dashboard by reloading the page
      window.location.reload();
    } catch (error) {
      // Show error message
      showApiError(error);
    }
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
            child.badge,
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
                "N/A"}
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
              {(grades || child.recent_grades || [])
                .slice(0, 2)
                .map((grade, index) => (
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
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
        <p className="text-slate-500 text-[10px] uppercase tracking-widest">
          Active Student
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleUnlink}
            disabled={isUnlinking}
            className="px-3 py-1 text-xs font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnlinking ? "Unlinking..." : "Unlink"}
          </button>
          <button className="text-indigo-400 hover:text-white transition-colors">
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChildCard;
