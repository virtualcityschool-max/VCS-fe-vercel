import React from "react";

const StatCard = ({ label, value, icon, trend, color = "indigo" }) => {
  const colorClasses = {
    indigo: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/20 text-indigo-400",
    emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/20 text-emerald-400",
    amber: "from-amber-500/20 to-amber-600/20 border-amber-500/20 text-amber-400",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/20 text-purple-400",
    rose: "from-rose-500/20 to-rose-600/20 border-rose-500/20 text-rose-400",
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/20 text-blue-400",
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <i className={`${icon} text-lg`}></i>
            </div>
            <p className="text-xs uppercase tracking-widest opacity-80">
              {label}
            </p>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <i className={`fas fa-arrow-${trend > 0 ? 'up' : 'down'}`}></i>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
