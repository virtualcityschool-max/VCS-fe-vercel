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
      <div className="bg-green-500/5 p-8 rounded-[2.5rem] border-2 border-green-500/20 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition"></div>
        <h3 className="text-green-500 font-black uppercase tracking-[0.2em] text-[10px] mb-8">
          All Assignments Complete
        </h3>
        <div className="mb-10">
          <p className="text-4xl font-black text-white mb-2">0</p>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            Overdue Assignments • Great job!
          </p>
        </div>
        <div className="flex items-center justify-center text-green-400">
          <i className="fas fa-check-circle text-2xl mr-2"></i>
          <span className="font-semibold">You're all caught up</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-500/5 p-8 rounded-[2.5rem] border-2 border-red-500/20 shadow-2xl relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition"></div>
      <h3 className="text-red-500 font-black uppercase tracking-[0.2em] text-[10px] mb-8">
        Overdue Assignments
      </h3>
      <div className="mb-10">
        <p className="text-4xl font-black text-white mb-2">{overdueAssignments.count}</p>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          Assignment{overdueAssignments.count !== 1 ? 's' : ''} Past Due • Need Attention
        </p>
      </div>
      
      <div className="space-y-4 mb-8">
        {overdueAssignments.items?.slice(0, 3).map((assignment) => (
          <div key={assignment.id} className="border-b border-red-500/10 pb-3 last:border-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-semibold text-white text-sm flex-1 mr-2">
                {assignment.title}
              </h4>
              <span className="text-red-400 text-xs font-black uppercase tracking-widest whitespace-nowrap">
                {getDaysOverdue(assignment.due_date)}d late
              </span>
            </div>
            <p className="text-slate-500 text-xs">
              {assignment.course_title}
            </p>
            <p className="text-red-400/70 text-xs mt-1">
              Due: {formatDate(assignment.due_date)}
            </p>
          </div>
        ))}
        
        {overdueAssignments.count > 3 && (
          <p className="text-slate-500 text-xs text-center py-2">
            +{overdueAssignments.count - 3} more overdue assignment{overdueAssignments.count - 3 !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <button className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-lg shadow-red-900/30 active:scale-95">
        View All Overdue
      </button>
    </div>
  );
};

export default OverdueAssignmentsCard;
