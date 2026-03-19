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
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
    secondary:
      "bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500",
    outline:
      "border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700 focus:ring-indigo-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    ghost:
      "text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition whitespace-nowrap",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

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
