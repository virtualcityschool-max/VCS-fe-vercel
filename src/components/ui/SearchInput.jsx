import React from "react";

/**
 * Search input with a left icon and optional clear button.
 * value/onChange/placeholder/onClear work the same as a plain <input>.
 */
const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  icon = "fas fa-search",
  className = "",
  inputClassName = "",
  ...props
}) => (
  <div className={`relative inline-flex items-center ${className}`}>
    <i className={`${icon} absolute left-3.5 text-slate-500 text-xs pointer-events-none`} />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
      className={`bg-slate-900 border border-slate-700/70 rounded-xl pl-9 pr-${onClear && value ? "9" : "4"} py-2.5
        text-white text-sm placeholder:text-slate-500
        hover:border-slate-600 hover:bg-slate-800/70
        focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15
        transition-all duration-150 w-full
        ${inputClassName}`}
    />
    {onClear && value && (
      <button
        type="button"
        onClick={onClear}
        className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
        tabIndex={-1}
      >
        <i className="fas fa-times text-xs" />
      </button>
    )}
  </div>
);

export default SearchInput;
