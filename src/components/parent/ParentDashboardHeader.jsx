import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "../ui";

const InfoChip = ({ label, value, icon, colorClass }) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-white/5 rounded-xl border border-white/5 transition-colors hover:bg-white/10">
      <i className={`${icon} ${colorClass} text-[9px] sm:text-[10px]`} />
      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-500">
        {label}:
      </span>
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-200">
        {value}
      </span>
    </div>
  );
};

const ParentDashboardHeader = ({ dashboardData, userName, onLinkRequest }) => {
  const formatGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const children = dashboardData?.children || [];
  const atRiskCount = children.filter(child => child.badge === "risk_alert").length;
  const totalOverdue = children.reduce((sum, child) => sum + (child.overdue_count || 0), 0);
  const totalGraded = children.reduce((sum, child) => sum + (child.graded_count || 0), 0);

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] bg-[#1e293b]/90 border border-slate-700/50 backdrop-blur-xl px-4 py-5 sm:px-8 sm:py-8 md:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-8 shadow-2xl transition-all duration-500 hover:border-indigo-500/10 mb-6 sm:mb-12">
      {/* Decorative gradients */}
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex items-center gap-4 sm:gap-6 relative z-10">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10">
          <span className="text-xl sm:text-2xl font-black text-indigo-400 font-poppins">
            {userName?.charAt(0) || "P"}
          </span>
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black font-poppins text-white tracking-tight">
              {formatGreeting()}, {userName}
            </h1>
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)] animate-pulse" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
            <InfoChip 
              label="Children" 
              value={children.length} 
              icon="fas fa-users" 
              colorClass="text-indigo-400" 
            />
            {atRiskCount > 0 && (
              <InfoChip 
                label="At Risk" 
                value={atRiskCount} 
                icon="fas fa-exclamation-triangle" 
                colorClass="text-red-400" 
              />
            )}
            {totalOverdue > 0 && (
              <InfoChip 
                label="Overdue" 
                value={totalOverdue} 
                icon="fas fa-clock" 
                colorClass="text-amber-400" 
              />
            )}
            {totalGraded > 0 && (
              <InfoChip 
                label="Graded" 
                value={totalGraded} 
                icon="fas fa-check-circle" 
                colorClass="text-emerald-400" 
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <Button
          onClick={onLinkRequest}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40 transition-all hover:scale-[1.02] active:scale-95 group"
        >
          <i className="fas fa-link mr-2 group-hover:rotate-12 transition-transform"></i>
         Request Child Access
        </Button>
      </div>
    </div>
  );
};

export default ParentDashboardHeader;
