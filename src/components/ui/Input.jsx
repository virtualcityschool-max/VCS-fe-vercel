import React from "react";

const Input = ({
  label,
  error,
  showErrorMessage = true,
  variant = "default",
  size = "md",
  className = "",
  containerClassName = "",
  ...props
}) => {
  const baseClasses =
    "block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    default: error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500",
    glass: error
      ? "border-red-500/50 bg-red-500/10 backdrop-blur-sm focus:border-red-500/70 focus:ring-red-500/20 text-white placeholder-red-200/60"
      : "border-white/20 bg-white/10 backdrop-blur-sm focus:border-white/40 focus:ring-white/20 text-white placeholder-white/60",
    search: error
      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 pl-10"
      : "border-slate-300 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 pl-10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const inputClasses = `appearance-none bg-slate-900 border border-slate-700/70 rounded-xl pl-3.5 pr-8 py-2.5
    text-white text-sm font-medium
    hover:border-slate-600 hover:bg-slate-800/70
    focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15
    disabled:opacity-50 disabled:cursor-not-allowed
    cursor-pointer transition-all duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
    ${className}`
  // const inputClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  const containerClasses = containerClassName || (label ? "mb-4" : "");

  return (
    <div className={containerClasses}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {props.type === "search" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-slate-400"></i>
          </div>
        )}
        <input className={inputClasses} {...props} />
      </div>
      {error && showErrorMessage && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-2 animate-pulse">
          <i className="fas fa-exclamation-circle text-sm"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
