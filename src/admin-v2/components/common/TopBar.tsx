import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Bell,
  Menu,
  RotateCcw,
  UserPlus,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  ChevronDown,
  CheckCircle, Users } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    timezone,
    approvals,
    setCommandPaletteOpen,
    openQuickAdd,
    resetDemoData,
    setCurrentView,
    setMobileMenuOpen,
    tzIana,
    profile,
  } = useApp();

  const [quickAddMenuOpen, setQuickAddMenuOpen] = useState(false);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateStr(
        new Intl.DateTimeFormat('en-US', { ...(tzIana ? { timeZone: tzIana } : {}),
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(now)
      );
      setCurrentTimeStr(
        new Intl.DateTimeFormat('en-US', { ...(tzIana ? { timeZone: tzIana } : {}),
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(now)
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setQuickAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-16 border-b border-[#1E2648] bg-[#0E1428]/95 backdrop-blur-md">
      {/* Left zone: Mobile toggle + Greeting & Time */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>{(() => { const h = Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, ...(tzIana ? { timeZone: tzIana } : {}) })); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; })()}, {profile?.first_name || 'Admin'}</span>
            <span className="text-slate-500 font-normal">·</span>
            <span className="text-xs font-normal text-slate-400">{currentDateStr}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {currentTimeStr} ({timezone})
          </div>
        </div>
      </div>

      {/* Center / Right zone: ⌘K search bar + Quick add + Theme toggle + Bell */}
      <div className="flex items-center gap-3">
        {/* Global Search ⌘K */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#232D52] bg-[#121831] text-slate-400 hover:text-slate-200 hover:border-indigo-500/50 transition-all text-xs cursor-pointer max-w-[220px] sm:max-w-xs"
        >
          <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="hidden md:inline truncate">Search student, teacher, subject...</span>
          <span className="md:hidden">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700 ml-2 shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Quick Add ▾ dropdown */}
        <div className="relative" ref={quickAddRef}>
          <button
            onClick={() => setQuickAddMenuOpen(!quickAddMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Quick add</span>
            <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </button>

          {quickAddMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#232D52] bg-[#121831] p-1.5 shadow-2xl z-40 text-xs">
              <button
                onClick={() => {
                  setQuickAddMenuOpen(false);
                  openQuickAdd('student');
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Add student</span>
              </button>
              <button
                onClick={() => {
                  setQuickAddMenuOpen(false);
                  openQuickAdd('teacher');
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Add teacher</span>
              </button>
              <button
                onClick={() => {
                  setQuickAddMenuOpen(false);
                  openQuickAdd('parent' as any);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors"
              >
                <Users className="w-4 h-4 text-pink-400" />
                <span>Add parent</span>
              </button>
              <button
                onClick={() => {
                  setQuickAddMenuOpen(false);
                  openQuickAdd('subject');
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Add subject</span>
              </button>
              <button
                onClick={() => {
                  setQuickAddMenuOpen(false);
                  openQuickAdd('session');
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Plan a class</span>
              </button>
              <button
                onClick={() => {
                  setQuickAddMenuOpen(false);
                  openQuickAdd('post');
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors"
              >
                <FileText className="w-4 h-4 text-rose-400" />
                <span>Write blog / video</span>
              </button>
            </div>
          )}
        </div>

        {/* Approvals Bell with badge */}
        <button
          onClick={() => setCurrentView('approvals')}
          className="relative p-2 rounded-xl border border-[#232D52] bg-[#121831] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
          title={`${pendingCount} pending approvals`}
        >
          <Bell className="w-4 h-4" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white font-mono">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[#232D52] bg-[#121831] text-slate-400 hover:text-amber-400 hover:border-slate-600 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Reload data from the server */}
        <button
          onClick={resetDemoData}
          className="p-2 rounded-xl border border-[#232D52] bg-[#121831] text-slate-400 hover:text-sky-400 hover:border-slate-600 transition-colors"
          title="Reload latest data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
