import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAssignments } from "../../store/slices/studentDashboardSlice";

const AssignmentOverviewList = () => {
  const navigate = useNavigate();
  const assignments = useSelector(selectAssignments);

  const getStatusConfig = (status) => {
    switch (status) {
      case "overdue":
        return {
          color: "text-red-500 bg-red-500/10",
          icon: "fa-exclamation-circle",
          label: "Overdue",
        };
      case "graded":
        return {
          color: "text-green-500 bg-green-500/10",
          icon: "fa-check-circle",
          label: "Graded",
        };
      case "submitted":
        return {
          color: "text-blue-500 bg-blue-500/10",
          icon: "fa-paper-plane",
          label: "Submitted",
        };
      case "pending":
        return {
          color: "text-yellow-500 bg-yellow-500/10",
          icon: "fa-clock",
          label: "Pending",
        };
      default:
        return {
          color: "text-slate-500 bg-slate-500/10",
          icon: "fa-question-circle",
          label: "Unknown",
        };
    }
  };

  const getAssignmentsByStatus = () => {
    const statusCounts = {};
    assignments.forEach((assignment) => {
      statusCounts[assignment.status] =
        (statusCounts[assignment.status] || 0) + 1;
    });
    return statusCounts;
  };

  const statusCounts = getAssignmentsByStatus();

  if (!assignments || assignments.length === 0) {
    return (
      <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
            Assignments
          </h3>
          <i className="fas fa-tasks text-slate-600 text-xs"></i>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-clipboard-check text-2xl text-slate-500"></i>
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">
            No Assignments
          </h4>
          <p className="text-slate-500 text-sm">
            You don't have any assignments yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
          Assignments
        </h3>
        <i className="fas fa-tasks text-slate-600 text-xs"></i>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = getStatusConfig(status);
          return (
            <div
              key={status}
              className={`${config.color} p-3 rounded-xl text-center`}
            >
              <div className="text-2xl font-bold mb-1">{count}</div>
              <div className="text-xs font-black uppercase tracking-widest">
                {config.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment List */}
      <div className="space-y-6">
        {assignments.slice(0, 6).map((assignment) => {
          const config = getStatusConfig(assignment.status);

          return (
            <div
              key={assignment.id}
              onClick={() => navigate("/student/assignments")}
              className="cursor-pointer flex flex-col gap-1.5 border-b border-slate-700/30 pb-4 last:border-0 last:pb-0 hover:bg-slate-700/20 rounded-xl p-2 transition"
            >
              <div className="flex justify-between items-start">
                <p className="font-semibold text-slate-300 text-sm line-clamp-1 flex-1 mr-2">
                  {assignment.title}
                </p>

                <span
                  className={`${config.color} px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1`}
                >
                  <i className={`fas ${config.icon} text-xs`}></i>
                  {config.label}
                </span>
              </div>

              {/* Optional CTA */}
              <div className="mt-2">
                <button
                  type="button"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent double navigation
                    navigate("/student/assignments");
                  }}
                >
                  View →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      {assignments.length > 6 && (
        <button
          type="button"
          onClick={() => navigate("/student/assignments")}
          className="w-full mt-8 py-3 bg-slate-900 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition active:scale-95"
        >
          View All {assignments.length} Assignments
        </button>
      )}
    </div>
  );
};

export default AssignmentOverviewList;
