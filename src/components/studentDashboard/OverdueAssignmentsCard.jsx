import React from "react";
import { useSelector } from "react-redux";
import { selectOverdueAssignments } from "../../store/slices/studentDashboardSlice";
import { useNavigate } from "react-router-dom";

const OverdueAssignmentsCard = () => {
  const navigate = useNavigate();
  const overdueAssignments = useSelector(selectOverdueAssignments);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getOverdueTimeLabel = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Overdue Today";
    if (diffDays === 1) return "1 day late";
    if (diffDays < 7) return `${diffDays} days late`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return "1 week late";
    if (diffWeeks < 4) return `${diffWeeks} weeks late`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return "1 month late";
    return `${diffMonths} months late`;
  };

  if (!overdueAssignments || overdueAssignments.count === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/5 shadow-2xl flex items-center gap-6 transition-all duration-300 hover:border-emerald-500/20 group">
        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-all duration-500 border border-emerald-500/10">
          <i className="fas fa-check-circle text-xl"></i>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black text-white/90 mb-0.5 tracking-tight">
            Clear Workspace
          </h3>
          <p className="text-emerald-500/70 text-[10px] font-black uppercase tracking-[0.15em]">
            All assignments submitted
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl p-4 lg:p-5 rounded-[1.5rem] border border-white/5 shadow-2xl relative overflow-hidden group transition-all duration-300 hover:border-red-500/20">
      {/* Premium Red Glow Effect */}
      <div className="absolute -right-10 -top-10 w-24 h-24 bg-red-500/10 rounded-full blur-[50px]"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 group-hover:scale-105 transition-all duration-500 border border-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.1)]">
            <i className="fas fa-exclamation-circle text-base"></i>
          </div>
          <div>
            <h3 className="text-red-500 font-black uppercase tracking-[0.2em] text-[8px]">
              Past Due Assignments
            </h3>
            <p className="text-white font-black text-base tracking-tight">
              {overdueAssignments.count} Overdue
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate("/student/assessments")}
          className="text-[9px] cursor-pointer font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 group/link"
        >
          View All
          <i className="fas fa-arrow-right group-hover/link:translate-x-0.5 transition-transform text-[8px]"></i>
        </button>
      </div>
      
      <div className="space-y-2 relative z-10">
        {overdueAssignments.items?.slice(0, 2).map((assignment) => (
          <div key={assignment.id} className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-4 hover:bg-white/10 transition-colors duration-300">
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white text-[12px] truncate tracking-tight">
                {assignment.title}
              </h4>
              <p className="text-slate-500 text-[8px] uppercase tracking-wider font-black opacity-60">
                {assignment.course_title}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-red-400 text-[9px] font-black uppercase tracking-widest block">
                {getOverdueTimeLabel(assignment.due_date)}
              </span>
              <span className="text-slate-500 text-[8px] font-bold block opacity-40">
                {formatDate(assignment.due_date)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverdueAssignmentsCard;
