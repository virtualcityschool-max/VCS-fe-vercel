import React from "react";
import { useSelector } from "react-redux";
import { selectOverdueAssignments } from "../../store/slices/studentDashboardSlice";

const OverdueAssignmentsCard = () => {
  const overdueAssignments = useSelector(selectOverdueAssignments);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getDaysOverdue = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!overdueAssignments || overdueAssignments.count === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl flex items-center gap-6 transition-all duration-300 hover:border-emerald-500/20 group">
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
    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group transition-all duration-300 hover:border-red-500/20">
      {/* Premium Red Glow Effect */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-500/10 rounded-full blur-[60px]"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 group-hover:scale-110 transition-all duration-500 border border-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <i className="fas fa-exclamation-circle text-lg"></i>
          </div>
          <div>
            <h3 className="text-red-500 font-black uppercase tracking-[0.2em] text-[9px]">
              Past Due Assignments • Need Attention
            </h3>
            <p className="text-white font-black text-lg tracking-tight">
              {overdueAssignments.count} Overdue
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 relative z-10">
        {overdueAssignments.items?.slice(0, 2).map((assignment) => (
          <div key={assignment.id} className="bg-white/5 rounded-[1.25rem] p-4 border border-white/5 flex items-center justify-between gap-6 hover:bg-white/10 transition-colors duration-300">
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white text-[13px] truncate tracking-tight mb-0.5">
                {assignment.title}
              </h4>
              <p className="text-slate-500 text-[9px] uppercase tracking-wider font-black opacity-60">
                {assignment.course_title}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-red-400 text-[10px] font-black uppercase tracking-widest block mb-0.5">
                {getDaysOverdue(assignment.due_date)}d late
              </span>
              <span className="text-slate-500 text-[9px] font-bold block opacity-40">
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
