import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../store/slices/authSlice';
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  Users,
  HeartHandshake,
  ShieldCheck,
  BookOpen,
  Layers,
  Calendar,
  Video,
  ClipboardCheck,
  Award,
  CreditCard,
  TrendingUp,
  Share2,
  FileText,
  MessageSquare,
  Globe,
  Sliders,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  School,
  GitFork,
  CalendarClock,
  UserCheck,
} from 'lucide-react';
import { NavigationId } from '../../types';

interface NavGroup {
  label: string;
  items: {
    id: NavigationId;
    label: string;
    icon: any;
    badge?: number;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    sidebarCollapsed,
    toggleSidebar,
    approvals,
    subscriptions,
    timezone,
    profile,
    mobileMenuOpen,
    setMobileMenuOpen,
    tzIana,
  } = useApp();

  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format AST / UTC / PKT
      const timeFormatter = new Intl.DateTimeFormat('en-US', { ...(tzIana ? { timeZone: tzIana } : {}),
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTimeStr(timeFormatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const reduxDispatch = useDispatch();
  const adminName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.username || 'School Admin';
  const adminInitials = adminName.split(/\s+/).slice(0, 2).map((p: string) => p[0]).join('').toUpperCase() || 'SA';
  const handleLogout = () => reduxDispatch(logoutUser() as any).finally(() => (window.location.href = '/'));

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
  const expiringSubsCount = subscriptions.filter((s) => s.status === 'Expiring soon').length;

  const navGroups: NavGroup[] = [
    {
      label: 'DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'ADMISSIONS',
      items: [
        {
          id: 'approvals',
          label: 'Pending Approvals',
          icon: CheckSquare,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { id: 'students', label: 'Students', icon: GraduationCap },
        { id: 'enrollments', label: 'Student Enrollments', icon: UserCheck },
      ],
    },
    {
      label: 'ACADEMICS',
      items: [
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'teachers', label: 'Teachers', icon: Users },
        { id: 'teacher-allocations', label: 'Teacher Allocations', icon: GitFork },
        { id: 'timetable', label: 'Timetable', icon: Calendar },
      ],
    },
    {
      label: 'PTM',
      items: [
        { id: 'ptm-meetings', label: 'PTM Meetings', icon: CalendarClock },
        { id: 'parents', label: 'Parents', icon: HeartHandshake },
        { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
        { id: 'evaluations', label: 'Evaluations', icon: Award },
      ],
    },
    {
      label: 'FINANCE',
      items: [
        {
          id: 'subscriptions',
          label: 'Subscriptions',
          icon: CreditCard,
          badge: expiringSubsCount > 0 ? expiringSubsCount : undefined,
          badgeColor: 'bg-amber-500 text-slate-950 font-bold',
        },
        { id: 'referrals', label: 'Referrals', icon: Share2 },
      ],
    },
    {
      label: 'CONTENT',
      items: [
        { id: 'blogs', label: 'Blogs', icon: FileText },
        { id: 'vlogs', label: 'Vlogs', icon: Video },
        { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
      ],
    },
    {
      label: 'SETTINGS',
      items: [
        { id: 'admin-users', label: 'Admin Users', icon: ShieldCheck },
        { id: 'levels', label: 'Levels', icon: Layers },
        { id: 'about', label: 'About Us', icon: Globe },
        { id: 'settings', label: 'Platform Settings', icon: Sliders },
      ],
    },
  ];

  const handleNavClick = (id: NavigationId) => {
    setCurrentView(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-40 flex flex-col border-r border-[#1E2648] bg-[#0E1428] text-slate-300 transition-all duration-300 ease-in-out h-screen ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[#1E2648] bg-[#090E1E] shrink-0">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6D5BFF] to-indigo-400 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30 shrink-0">
              <School className="w-5 h-5" />
            </div>

            {!sidebarCollapsed && (
              <div className="truncate">
                <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Virtual City School</span>
                </div>
                <div className="text-[10px] text-indigo-400/90 font-mono tracking-wider">
                  ADMIN COMMAND CENTER
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.label}
                </div>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`relative flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-[#6D5BFF] text-white shadow-md shadow-indigo-600/25 font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-[#151D3A]'
                      } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-300'
                        }`}
                      />

                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}

                      {item.badge !== undefined && (
                        <span
                          className={`flex items-center justify-center text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                            item.badgeColor || 'bg-indigo-500 text-white'
                          } ${sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Bottom Area: Admin profile + Timezone clock */}
        <div className="p-3 border-t border-[#1E2648] bg-[#090E1E] shrink-0">
          <div
            onClick={() => handleNavClick('timezone')}
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-[#151D3A] transition-colors cursor-pointer group ${
              sidebarCollapsed ? 'justify-center p-1' : ''
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                {adminInitials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#090E1E]" />
            </div>

            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                  {adminName}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>{currentTimeStr}</span>
                  <span>·</span>
                  <span className="truncate text-slate-400">{timezone.split(' ')[0]}</span>
                </div>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                title="Log out"
                aria-label="Log out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
