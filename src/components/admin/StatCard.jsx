import React from "react";

const StatCard = ({ label, value, icon, trend, color = "indigo", compact = false, onClick }) => {
  const colorClasses = {
    indigo: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/20 text-indigo-400",
    emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/20 text-emerald-400",
    amber: "from-amber-500/20 to-amber-600/20 border-amber-500/20 text-amber-400",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/20 text-purple-400",
    rose: "from-rose-500/20 to-rose-600/20 border-rose-500/20 text-rose-400",
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/20 text-blue-400",
    pink: "from-pink-500/20 to-pink-600/20 border-pink-500/20 text-pink-400"
  };

  if (compact) {
    return (
      <div onClick={onClick} className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} rounded-xl px-4 py-4 border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${onClick ? "cursor-pointer" : ""}`}>
        <div className="absolute top-0 right-0 w-14 h-14 bg-white/5 rounded-full -mr-6 -mt-6"></div>
        <div className="relative z-10 flex items-center gap-2.5 mb-2.5">
          <div className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center flex-shrink-0">
            <i className={`${icon} text-sm`}></i>
          </div>
          <p className="text-[10px] uppercase tracking-wider opacity-80 leading-tight">{label}</p>
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-bold leading-none">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-0.5 text-[10px] ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <i className={`fas fa-arrow-${trend > 0 ? 'up' : 'down'} text-[8px]`}></i>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }

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
