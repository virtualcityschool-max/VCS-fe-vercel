import React from "react";
import { useSelector } from "react-redux";
import { selectOverdueAssignments, selectAssignments, selectDashboardQuizzes } from "../../store/slices/studentDashboardSlice";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/validation";

const OverdueAssignmentsCard = () => {
  const navigate = useNavigate();
  const overdueAssignments = useSelector(selectOverdueAssignments);
  const allAssignments = useSelector(selectAssignments);
  const allQuizzes = useSelector(selectDashboardQuizzes);

  // Calculate pending counts (not submitted, not overdue)
  const pendingAssignments = (allAssignments || []).filter(a => a.status === "pending");
  const pendingQuizzes = (allQuizzes || []).filter(q => q.status === "pending");
  const totalPending = pendingAssignments.length + pendingQuizzes.length;
  
  const overdueCount = overdueAssignments?.count || 0;

  const getOverdueTimeLabel = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "1 day late";
    if (diffDays < 7) return `${diffDays} days late`;
    return `${Math.floor(diffDays / 7)} weeks late`;
  };

  // Case 1: Overdue Assignments (Critical - Red)
  if (overdueCount > 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[2rem] border border-red-500/10 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-red-500/30">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-500/10 rounded-full blur-[60px] animate-pulse"></div>
        
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <i className="fas fa-exclamation-triangle text-xl"></i>
            </div>
            <div>
              <h3 className="text-red-400 font-black uppercase tracking-[0.2em] text-[10px] mb-0.5">
                Past Due Action
              </h3>
              <p className="text-white font-black text-2xl tracking-tight leading-none">
                {overdueCount} <span className="text-red-500/80 text-sm uppercase tracking-widest ml-1">Overdue</span>
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate("/student/assessments?tab=assignments")}
            className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg shadow-red-900/20"
          >
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
        
        <div className="space-y-2 relative z-10">
          {overdueAssignments.items?.slice(0, 2).map((assignment) => (
            <div key={assignment.id} className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center justify-between gap-4 hover:bg-white/10 transition-colors duration-300">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-[11px] truncate tracking-tight mb-0.5">
                  {assignment.title}
                </h4>
                <p className="text-slate-500 text-[8px] uppercase tracking-wider font-black opacity-60">
                  {assignment.course_title}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-red-400 text-[9px] font-black uppercase tracking-widest block mb-0.5">
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
  }

  // Case 2: Pending Assignments (Warning - Amber)
  if (totalPending > 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[2rem] border border-amber-500/10 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-amber-500/30">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-[60px]"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-all duration-500 border border-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <i className="fas fa-clock text-xl"></i>
            </div>
            <div>
              <h3 className="text-amber-400 font-black uppercase tracking-[0.2em] text-[10px] mb-0.5">
                Upcoming Deadlines
              </h3>
              <p className="text-white font-black text-2xl tracking-tight leading-none">
                {totalPending} <span className="text-amber-500/80 text-sm uppercase tracking-widest ml-1">Pending</span>
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate("/student/assessments")}
            className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 hover:bg-amber-500 hover:text-white transition-all duration-300"
          >
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        </div>

        <p className="text-slate-400 text-[10px] font-medium leading-relaxed px-1">
          You have {totalPending} assignments waiting for submission. Stay on track!
        </p>
      </div>
    );
  }

  // Case 3: All Clear (Success - Green)
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-emerald-500/5 shadow-2xl flex items-center gap-6 transition-all duration-500 hover:border-emerald-500/20 group overflow-hidden relative">
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-[40px]"></div>
      <div className="w-14 h-14 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 border border-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
        <i className="fas fa-check-double text-xl"></i>
      </div>
      <div className="min-w-0 flex-1 relative z-10">
        <h3 className="text-lg font-black text-white mb-0.5 tracking-tight group-hover:text-emerald-400 transition-colors">
          All Caught Up!
        </h3>
        <p className="text-emerald-500/60 text-[9px] font-black uppercase tracking-[0.2em] leading-none">
          No pending assignments
        </p>
      </div>
    </div>
  );
};

export default OverdueAssignmentsCard;

