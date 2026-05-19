import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectAssignments,
  selectDashboardQuizzes,
} from "../../store/slices/studentDashboardSlice";

const AssignmentOverviewList = () => {
  const navigate = useNavigate();
  const assignments = useSelector(selectAssignments);
  const quizzes = useSelector(selectDashboardQuizzes);

  const getStatusConfig = (status) => {
    switch (status) {
      case "overdue":
        return {
          color: "text-red-400 bg-red-400/10",
          icon: "fa-exclamation-circle",
          label: "Overdue",
        };
      case "graded":
      case "auto_graded":
        return {
          color: "text-emerald-400 bg-emerald-400/10",
          icon: "fa-check-circle",
          label: "Graded",
        };
      case "submitted":
        return {
          color: "text-blue-400 bg-blue-400/10",
          icon: "fa-paper-plane",
          label: "Submitted",
        };
      case "pending":
        return {
          color: "text-amber-400 bg-amber-400/10",
          icon: "fa-clock",
          label: "Pending",
        };
      default:
        return {
          color: "text-slate-400 bg-slate-400/10",
          icon: "fa-question-circle",
          label: "Unknown",
        };
    }
  };

  const allItems = [
    ...(assignments || []).map((a) => ({ ...a, itemType: "assignment" })),
    ...(quizzes || []).map((q) => ({ ...q, itemType: "quiz" })),
  ].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  const getStatusCounts = () => {
    const counts = {};
    allItems.forEach((item) => {
      const status = item.status === "auto_graded" ? "graded" : item.status;
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (allItems.length === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/5 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Assessments
          </h3>
          <i className="fas fa-tasks text-slate-700 text-xs"></i>
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/5">
            <i className="fas fa-clipboard-check text-xl text-slate-600"></i>
          </div>
          <h4 className="text-sm font-black text-white/80 mb-1">
            Workspace Clear
          </h4>
          <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
            No active assessments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/5 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          Assessments
        </h3>
        <button
          onClick={() => navigate("/student/assessments")}
          className="text-slate-700 hover:text-white transition-colors"
        >
          <i className="fas fa-external-link-alt text-[10px]"></i>
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = getStatusConfig(status);
          return (
            <div
              key={status}
              className={`${config.color} p-2.5 rounded-2xl border border-white/5 backdrop-blur-sm flex items-center justify-between px-4 transition-transform hover:scale-[1.02]`}
            >
              <span className="text-[9px] font-black uppercase tracking-widest opacity-80">
                {config.label}
              </span>
              <span className="text-sm font-black tracking-tight">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Assessment List */}
      <div className="space-y-3">
        {allItems.slice(0, 4).map((item) => {
          const config = getStatusConfig(item.status);
          const isQuiz = item.itemType === "quiz";

          return (
            <div
              key={`${item.itemType}-${item.id}`}
              onClick={() =>
                navigate(
                  isQuiz
                    ? `/student/quizzes/${item.id}`
                    : `/student/assignments/${item.id}`
                )
              }
              className="group cursor-pointer flex flex-col gap-1 bg-white/5 hover:bg-white/10 rounded-2xl p-3 border border-transparent hover:border-white/5 transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className={`shrink-0 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border border-white/5 ${
                      isQuiz
                        ? "text-violet-400 bg-violet-400/10"
                        : "text-sky-400 bg-sky-400/10"
                    }`}
                  >
                    {isQuiz ? "Quiz" : "Task"}
                  </span>
                  <p className="font-bold text-slate-200 text-xs truncate tracking-tight">
                    {item.title}
                  </p>
                </div>
                <span
                  className={`${config.color} px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/5 shrink-0`}
                >
                  <i className={`fas ${config.icon} text-[9px]`}></i>
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                  View Detail
                </span>
                <i className="fas fa-chevron-right text-[7px] text-slate-700 group-hover:text-white group-hover:translate-x-0.5 transition-all"></i>
              </div>
            </div>
          );
        })}
      </div>

      {/* See All Button */}
      {allItems.length > 4 && (
        <button
          type="button"
          onClick={() => navigate("/student/assessments")}
          className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all active:scale-95 shadow-lg"
        >
          View All ({allItems.length})
        </button>
      )}
    </div>
  );
};

export default AssignmentOverviewList;
