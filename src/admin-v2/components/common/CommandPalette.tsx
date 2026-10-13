import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  LayoutDashboard,
  CheckSquare,
  Users,
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Calendar,
  Layers,
  CreditCard,
  TrendingUp,
  Share2,
  FileText,
  Star,
  Globe,
  Sliders,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { NavigationId } from '../../types';

interface SearchResultItem {
  id: string;
  title: string;
  category: 'Pages' | 'Students' | 'Teachers' | 'Parents' | 'Subjects';
  icon: any;
  action: () => void;
  meta?: string;
}

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setCurrentView,
    students,
    teachers,
    parents,
    subjects,
    openDetailDrawer,
    canView,
  } = useApp() as any;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!commandPaletteOpen) return null;

  const pages: { id: NavigationId; title: string; icon: any }[] = [
    // DASHBOARD
    { id: 'dashboard', title: 'Dashboard (/admin/overview)', icon: LayoutDashboard },
    // ADMISSIONS
    { id: 'approvals', title: 'Pending Approvals (/admin/approvals)', icon: CheckSquare },
    { id: 'students', title: 'Students (/admin/users?role=student)', icon: GraduationCap },
    { id: 'enrollments', title: 'Student Enrollments (/admin/enrollments)', icon: CheckSquare },
    // ACADEMICS
    { id: 'subjects', title: 'Subjects (/admin/courses)', icon: BookOpen },
    { id: 'teachers', title: 'Teachers (/admin/users?role=teacher)', icon: Users },
    { id: 'teacher-allocations', title: 'Teacher Allocations (/admin/teacher-allocations)', icon: Layers },
    { id: 'timetable', title: 'Timetable (/admin/sessions)', icon: Calendar },
    // PTM
    { id: 'ptm-meetings', title: 'Staff Meetings (/admin/staff-meetings)', icon: Calendar },
    { id: 'parents', title: 'Parents (/admin/users?role=parent)', icon: HeartHandshake },
    { id: 'attendance', title: 'Attendance (/admin/attendance)', icon: Calendar },
    { id: 'evaluations', title: 'Evaluations (/admin/evaluations)', icon: BookOpen },
    // FINANCE
    { id: 'subscriptions', title: 'Subscriptions (/admin/subscriptions)', icon: CreditCard },
    { id: 'referrals', title: 'Referrals (/admin/referrals)', icon: Share2 },
    // CONTENT
    { id: 'blogs', title: 'Blogs (/admin/blogs)', icon: FileText },
    { id: 'vlogs', title: 'Vlogs (/admin/vlogs)', icon: FileText },
    { id: 'testimonials', title: 'Testimonials (/admin/testimonials)', icon: Star },
    // SETTINGS
    { id: 'admin-users', title: 'Admin Users (/admin/users?role=admin)', icon: Users },
    { id: 'levels', title: 'Levels (/admin/course-levels)', icon: Layers },
    { id: 'about', title: 'About Us (/admin/about)', icon: Globe },
    { id: 'settings', title: 'Platform Settings (/admin/settings)', icon: Sliders },
  ];

  const q = query.toLowerCase();
  const filteredPages = pages.filter((p) => p.title.toLowerCase().includes(q) && canView(p.id));
  const showPeople = canView('students');

  // Parents: name, email or phone, and the children they are linked to.
  const filteredParents = !showPeople ? [] : (parents || []).filter((p: any) => {
    const kids = (p._raw?.linked_children || []).map((c: any) => `${c.name || ''} ${c.email || ''}`).join(' ');
    return `${p.name} ${p.email} ${p.phone || ''} ${kids}`.toLowerCase().includes(q);
  });

  const filteredStudents = !showPeople ? [] : students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTeachers = !showPeople ? [] : teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.department.toLowerCase().includes(query.toLowerCase())
  );

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase())
  );

  const results: SearchResultItem[] = [
    ...filteredPages.map((p) => ({
      id: `p-${p.id}`,
      title: p.title,
      category: 'Pages' as const,
      icon: p.icon,
      action: () => {
        setCurrentView(p.id);
        setCommandPaletteOpen(false);
      },
    })),
    ...filteredStudents.map((s) => ({
      id: `s-${s.id}`,
      title: s.name,
      category: 'Students' as const,
      icon: GraduationCap,
      meta: `${s.rollNo} · ${s.level}`,
      action: () => {
        setCurrentView('students');
        openDetailDrawer('student', s);
        setCommandPaletteOpen(false);
      },
    })),
    ...filteredTeachers.map((t) => ({
      id: `t-${t.id}`,
      title: t.name,
      category: 'Teachers' as const,
      icon: Users,
      meta: `${t.department} · ${t.status}`,
      action: () => {
        setCurrentView('teachers');
        openDetailDrawer('teacher', t);
        setCommandPaletteOpen(false);
      },
    })),
    ...filteredParents.map((p: any) => ({
      id: `par-${p.id}`,
      title: p.name,
      category: 'Parents' as const,
      icon: HeartHandshake,
      meta: [p.email, (p._raw?.linked_children || []).length ? `${p._raw.linked_children.length} child(ren)` : ''].filter(Boolean).join(' · '),
      action: () => {
        setCurrentView('parents');
        openDetailDrawer('parent', p);
        setCommandPaletteOpen(false);
      },
    })),
    ...filteredSubjects.map((s) => ({
      id: `sub-${s.id}`,
      title: `${s.code} ${s.name}`,
      category: 'Subjects' as const,
      icon: BookOpen,
      meta: `${s.level} · $${s.priceUSD}/mo`,
      action: () => {
        setCurrentView('subjects');
        openDetailDrawer('subject', s);
        setCommandPaletteOpen(false);
      },
    })),
  ];
  const visibleResults = results.slice(0, 15);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (visibleResults.length ? (prev + 1) % visibleResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (visibleResults.length ? (prev - 1 + visibleResults.length) % visibleResults.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (visibleResults[selectedIndex]) {
        visibleResults[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div
      onClick={() => setCommandPaletteOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl border border-[#232D52] bg-[#121831] shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[75vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1E2648] bg-[#0E1428]">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search students, teachers, parents, subjects, or jump to page... (esc to close)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {visibleResults.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No matching records or pages found for "{query}"
            </div>
          ) : (
            visibleResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-left transition-colors group cursor-pointer ${
                    isSelected ? 'bg-[#1A2346] ring-1 ring-indigo-500/50 text-white' : 'hover:bg-[#1A2346]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold transition-colors ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                        {item.title}
                      </div>
                      {item.meta && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{item.meta}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                      {item.category}
                    </span>
                    <ArrowRight className={`w-4 h-4 text-slate-500 transition-opacity ${isSelected ? 'opacity-100 text-indigo-300' : 'opacity-0 group-hover:opacity-100'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#0A0F22] border-t border-[#1E2648] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>esc Dismiss</span>
          </div>
          <span>Virtual City School Admin</span>
        </div>
      </div>
    </div>
  );
};
