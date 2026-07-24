import React from "react";

/**
 * Styled date <input> for filter bars - matches FilterSelect visually.
 * Props: label, value, min, max, onChange, className
 */
const FilterDateInput = ({ label, className = "", ...props }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">
        {label}
      </span>
    )}
    <div className="relative inline-flex items-center">
      <i className="fas fa-calendar-alt absolute left-3 text-slate-500 text-xs pointer-events-none" />
      <input
        type="date"
        {...props}
        className={`appearance-none bg-slate-900 border border-slate-700/70 rounded-xl pl-8 pr-3.5 py-2.5
          text-white text-sm font-medium
          hover:border-slate-600 hover:bg-slate-800/70
          focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15
          disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer transition-all duration-150
          [color-scheme:dark]
          ${className}`}
      />
    </div>
  </div>
);

export default FilterDateInput;
