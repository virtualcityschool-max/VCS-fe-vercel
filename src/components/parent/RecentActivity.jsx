import React from "react";

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "grade":
      case "assignment_grade":
        return "fas fa-file-check text-indigo-500";
      case "quiz_grade":
        return "fas fa-clipboard-list text-violet-500";
      case "assignment":
        return "fas fa-file-alt text-blue-500";
      case "attendance":
        return "fas fa-calendar-check text-emerald-500";
      case "announcement":
        return "fas fa-bullhorn text-amber-500";
      default:
        return "fas fa-circle text-slate-500";
    }
  };

  const getActivityAccentColor = (type) => {
    switch (type) {
      case "quiz_grade":
        return "group-hover/item:border-violet-500";
      case "assignment_grade":
      case "grade":
        return "group-hover/item:border-indigo-500";
      default:
        return "group-hover/item:border-indigo-500";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "0";
    
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "Day" : "Days"} ago`;
    return `${diffWeeks} ${diffWeeks === 1 ? "Week" : "Weeks"} ago`;
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-[#1e293b]/90 backdrop-blur-xl p-8 rounded-[1.5rem] border border-slate-700/50 shadow-2xl">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
            <i className="fas fa-clock text-slate-500 text-xl"></i>
          </div>
          <p className="text-slate-400 text-sm font-medium text-center">
            No recent activity to show
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b]/90 backdrop-blur-xl p-6 rounded-[1.5rem] border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col">
      <div className="relative pl-6 space-y-6 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-indigo-500/30 via-slate-700 to-transparent"></div>
        
        {activities.map((activity, index) => (
          <div key={index} className="relative group/item">
            {/* Timeline dot */}
            <div
              className={`absolute -left-[23px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 z-10 ${getActivityAccentColor(activity.type)} transition-colors duration-300`}
            >
              <div className={`absolute inset-0.5 rounded-full ${getActivityIcon(
                activity.type
              ).split(" ")[2]} opacity-40`}></div>
            </div>
            
            {/* Activity content */}
            <div className="space-y-2 group/card">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {(activity.type === "assignment_grade" || activity.type === "quiz_grade") && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border border-white/5 ${
                          activity.type === "quiz_grade"
                            ? "text-violet-400 bg-violet-400/10"
                            : "text-indigo-400 bg-indigo-400/10"
                        }`}
                      >
                        {activity.type === "quiz_grade" ? "Quiz" : "Assignment"}
                      </span>
                    )}
                    <p className="text-xs font-bold text-slate-200 leading-relaxed">
                      <span className={activity.type === "quiz_grade" ? "text-violet-400 font-black" : "text-indigo-400 font-black"}>{activity.child}</span>:{" "}
                      {activity.message}
                    </p>
                  </div>
                  {activity.course && (
                    <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-wider">
                      {activity.course}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                <i className="far fa-clock text-[9px]" />
                {formatTime(activity.time)}
              </p>
            </div>
            
            {index !== activities.length - 1 && (
              <div className="h-px bg-white/5 mt-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
