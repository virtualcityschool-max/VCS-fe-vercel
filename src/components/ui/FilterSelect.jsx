import React from "react";

/**
 * A styled <select> for filter bars — appearance-none with custom chevron.
 * Drop-in replacement for raw <select> elements.
 */
const FilterSelect = ({ className = "", children, ...props }) => (
  <div className="relative inline-flex items-center">
    <select
      {...props}
      className={`appearance-none bg-slate-900 border border-slate-700/70 rounded-xl pl-3.5 pr-8 py-2.5
        text-white text-sm font-medium
        hover:border-slate-600 hover:bg-slate-800/70
        focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer transition-all duration-150
        ${className}`} style={{width: "180px"}}
    >
      {children}
    </select>
    <i className="fas fa-chevron-down absolute right-2.5 text-slate-500 text-[10px] pointer-events-none" />
  </div>
);

export default FilterSelect;
