import React from 'react';
import { Link } from 'react-router-dom';

const BreadcrumbNavigation = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center space-x-3 text-sm backdrop-blur-sm bg-white/5 rounded-full px-6 py-3 w-fit border border-white/10 ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        if (item.to && !isLast) {
          return (
            <React.Fragment key={index}>
              <Link
                to={item.to}
                className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
              >
                {item.icon && <i className={`${item.icon} text-xs`}></i>}
                {item.label}
              </Link>
              <i className="fas fa-chevron-right text-slate-600 text-xs"></i>
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={index}>
              {item.icon && !isLast && <i className={`${item.icon} text-xs`}></i>}
              <span className="text-white font-medium truncate max-w-xs">
                {item.label}
              </span>
            </React.Fragment>
          );
        }
      })}
    </nav>
  );
};

export default BreadcrumbNavigation;
