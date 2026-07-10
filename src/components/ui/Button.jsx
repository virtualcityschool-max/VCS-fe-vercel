import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer";

  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-900/30 hover:shadow-indigo-800/40 focus-visible:ring-indigo-500",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/70 hover:border-slate-600 focus-visible:ring-slate-500",
    outline:
      "border border-slate-600/80 bg-transparent hover:bg-white/5 hover:border-slate-400 text-slate-300 hover:text-white focus-visible:ring-indigo-500",
    danger:
      "bg-red-600/90 hover:bg-red-500 text-white shadow-lg shadow-red-900/25 focus-visible:ring-red-500",
    success:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/25 focus-visible:ring-emerald-500",
    ghost:
      "text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition whitespace-nowrap",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  const classes = `${baseClasses} ${variants[variant] ?? variants.primary} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
