import React from 'react';

const Card = ({ 
  children, 
  variant = 'default', 
  padding = 'md', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'rounded-lg border transition-all duration-200';
  
  const variants = {
    default: 'bg-white border-slate-200 shadow-sm',
    glass: 'bg-white/10 backdrop-blur-md border-white/20 shadow-xl',
    dark: 'bg-slate-800 border-slate-700 shadow-xl',
    gradient: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-200/20 shadow-xl'
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${className}`;

  return (
    <div
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
