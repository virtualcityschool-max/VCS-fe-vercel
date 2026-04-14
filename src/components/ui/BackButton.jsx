import React from 'react';
import { Link } from 'react-router-dom';

const BackButton = ({ 
  to, 
  label = 'Back', 
  className = '', 
  showIcon = true,
  icon = 'fas fa-arrow-left',
  variant = 'default' // default, outline, ghost
}) => {
  const baseClasses = "rounded-full px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-all group";
  
  const variantClasses = {
    default: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/20",
    outline: "border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-500/30 hover:text-white hover:bg-white/5 backdrop-blur-sm",
    ghost: "border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 backdrop-blur-sm"
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to}>
        <button className={buttonClasses}>
          {showIcon && <i className={`${icon} mr-2 group-hover:-translate-x-1 transition-transform`}></i>}
          {label}
        </button>
      </Link>
    );
  }

  return (
    <button className={buttonClasses} onClick={() => window.history.back()}>
      {showIcon && <i className={`${icon} mr-2 group-hover:-translate-x-1 transition-transform`}></i>}
      {label}
    </button>
  );
};

export default BackButton;
