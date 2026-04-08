import React from "react";

const OverviewStats = ({ dashboardData }) => {
  if (!dashboardData || !dashboardData.children) {
    return null;
  }

  const children = dashboardData.children;
  const totalChildren = children.length;
  const atRiskCount = children.filter(child => child.badge === "risk_alert").length;
  const totalOverdue = children.reduce((sum, child) => sum + (child.overdue_count || 0), 0);
  const totalGraded = children.reduce((sum, child) => sum + (child.graded_count || 0), 0);

  const stats = [
    {
      label: "Total Children",
      value: totalChildren,
      icon: "fas fa-users",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/20",
    },
    {
      label: "At Risk",
      value: atRiskCount,
      icon: "fas fa-exclamation-triangle",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/20",
    },
    {
      label: "Overdue Tasks",
      value: totalOverdue,
      icon: "fas fa-clock",
      color: "text-amber-500",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Graded Items",
      value: totalGraded,
      icon: "fas fa-check-circle",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      borderColor: "border-emerald-500/20",
    },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl">
      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6">
        Overview
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border ${stat.bgColor} ${stat.borderColor} hover:border-opacity-50 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <i className={`fas ${stat.icon} ${stat.color} text-sm`}></i>
              </div>
              <span className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewStats;
