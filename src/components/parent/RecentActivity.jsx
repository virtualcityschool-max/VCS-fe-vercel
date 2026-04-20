import React from "react";

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "grade":
        return "fas fa-chart-line text-indigo-500";
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

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6">
          Recent Activity
        </h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 bg-slate-500/20 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-clock text-slate-400 text-lg"></i>
          </div>
          <p className="text-slate-400 text-sm text-center">
            No recent activity
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl">
      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6">
        Recent Activity
      </h3>
      <div className="relative pl-6 space-y-4">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-700"></div>
        
        {activities.map((activity, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div
              className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-slate-600 border-4 border-slate-800 shadow-sm`}
            >
              <div className={`absolute inset-1 rounded-full ${getActivityIcon(
                activity.type
              ).split(" ")[2]}`}></div>
            </div>
            
            {/* Activity content */}
            <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-3 hover:bg-slate-900/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-200 leading-tight mb-1">
                    <span className="text-indigo-400">{activity.child}</span>:{" "}
                    {activity.message}
                  </p>
                  {activity.course && (
                    <p className="text-[10px] text-slate-500 truncate">
                      {activity.course}
                    </p>
                  )}
                </div>
                <i className={`fas ${getActivityIcon(activity.type).split(" ")[1]} ${getActivityIcon(activity.type).split(" ")[2]} text-xs ml-2`}></i>
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                {formatTime(activity.time)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
