import React from 'react';
import { AppView } from '../types';

const SimulatorBar = ({ currentView, setView }) => {
  const buttons = [
    { id: AppView.PUBLIC_HOME, label: 'Public Home', icon: 'fa-home' },
    { id: AppView.ADMIN, label: 'Admin', icon: 'fa-user-shield' },
    { id: AppView.STUDENT, label: 'Student', icon: 'fa-user-graduate' },
    { id: AppView.TEACHER, label: 'Teacher', icon: 'fa-chalkboard-teacher' },
    { id: AppView.PARENT, label: 'Parent', icon: 'fa-user-friends' },
    { id: AppView.CLASSROOM, label: 'Classroom', icon: 'fa-video' },
    { id: AppView.FEED, label: 'Student Feed', icon: 'fa-rss' },
    { id: AppView.MARKETPLACE, label: 'Courses', icon: 'fa-shopping-cart' },
    { id: AppView.TEACHER_PROFILE, label: 'T-Profile', icon: 'fa-id-card' },
    { id: AppView.INTERNAL_STUDENT_PROFILE, label: 'S-Risk', icon: 'fa-exclamation-triangle' },
  ];

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-60 flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-black/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 max-w-[95vw] overflow-x-auto no-scrollbar scroll-smooth">
      <div className="hidden sm:block text-[10px] text-white/50 absolute -top-4 left-4 font-bold uppercase tracking-widest whitespace-nowrap">Global Simulator Bar</div>
      {buttons.map((btn) => (
        <button
          key={btn.id}
          onClick={() => setView(btn.id)}
          className={`shrink-0 flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
            currentView === btn.id 
            ? 'bg-indigo-600 text-white scale-105' 
            : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
          title={btn.label}
        >
          <i className={`fas ${btn.icon}`}></i>
          <span className="hidden md:inline">{btn.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SimulatorBar;
