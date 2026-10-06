import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Users,
  GraduationCap,
  DollarSign,
  Calendar,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Info,
  Check,
  Video,
  Plus,
  ChevronDown,
  UserPlus,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { StatusPill } from '../components/common/StatusPill';
import { DEPARTMENT_CONFIG } from '../data/mockData';
import { DepartmentName } from '../types';

export const DashboardView: React.FC = () => {
  const {
    students,
    teachers,
    subjects,
    approvals,
    sessions,
    subscriptions,
    meetings,
    activities,
    setCurrentView,
    openDetailDrawer,
    openQuickAdd,
    approveItem,
    renewSubscription,
    timezone,
    tzIana,
    enrollments,
    analytics,
    rawAttendance,
    profile,
    parents,
    allUsers,
  } = useApp();

  const [roleBreakdownOpen, setRoleBreakdownOpen] = useState(false);
  const [dashboardQuickAddOpen, setDashboardQuickAddOpen] = useState(false);
  const [allActivityModalOpen, setAllActivityModalOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateStr(
        new Intl.DateTimeFormat('en-US', { ...(tzIana ? { timeZone: tzIana } : {}),
          weekday: 'long',
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

  // Derived counts for Action Center
  const pendingAccounts = approvals.filter(
    (a) => a.type === 'account_signup' && a.status === 'pending'
  );
  const pendingEnrollments = approvals.filter(
    (a) => a.type === 'enrollment_request' && a.status === 'pending'
  );
  const expiringSubs = subscriptions.filter((s) => s.status === 'Expiring soon');
  const todayKey = new Date().toLocaleDateString('en-CA', tzIana ? { timeZone: tzIana } : undefined);
  const todaysSessions = sessions
    .filter((s) => s.date === todayKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  // Only today's classes still to come can be fixed by assigning a teacher.
  const classesWithoutTeacher = todaysSessions.filter(
    (s) => s.status === 'upcoming' && (!s.hasTeacherAssigned || !s.teacherId)
  );
  const chronicAbsentees = students.filter((s) => s.absencesThisWeek >= 2);

  const totalActionItems =
    pendingAccounts.length +
    pendingEnrollments.length +
    expiringSubs.length +
    classesWithoutTeacher.length +
    chronicAbsentees.length;

  // Monthly fees of all active paid enrollments (same figure as /admin/dashboard/).
  const monthlyRevenue =
    analytics?.revenue?.total ??
    enrollments.filter((e) => e.status === 'Active').reduce((sum, e) => sum + (e.monthlyFeeUSD || 0), 0);
  const activeEnrollmentCount = enrollments.filter((e) => e.status === 'Active').length;

  // Monthly fees added by new enrollments, last 6 months (real enrollment dates).
  const revenueChartData = (() => {
    const out: { key: string; month: string; revenue: number; count: number }[] = [];
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 5);
    for (let i = 0; i < 6; i += 1) {
      out.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, month: d.toLocaleString('en-US', { month: 'short' }), revenue: 0, count: 0 });
      d.setMonth(d.getMonth() + 1);
    }
    enrollments.forEach((e) => {
      const m = out.find((x) => (e.enrollmentDate || '').startsWith(x.key));
      if (!m) return;
      m.count += 1;
      m.revenue += e.monthlyFeeUSD || 0;
    });
    return out;
  })();

  // Share of this week's marked student attendances that were present/late.
  const attendanceRate = (() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    const marked = (rawAttendance || []).filter(
      (r: any) => ['present', 'late', 'absent'].includes(r.status) && new Date(r.scheduled_at) >= weekStart
    );
    if (!marked.length) return null;
    return Math.round((marked.filter((r: any) => r.status !== 'absent').length / marked.length) * 1000) / 10;
  })();
  const departmentCount = new Set(subjects.map((s) => s.department)).size;
  const engagedTeachers = teachers.filter((t) => t.status === 'Engaged').length;
  const enrolledStudents = students.filter((s) => s.enrolledSubjectIds.length > 0).length;
  const hour = Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, ...(tzIana ? { timeZone: tzIana } : {}) }));
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const adminFirstName = profile?.first_name || 'Admin';
  const todaysMeetings = meetings.filter((m) => m.date === todayKey);

  // Top subjects sorted by student count
  const topSubjects = [...subjects]
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 5);

  const maxStudents = Math.max(...topSubjects.map((s) => s.studentCount), 1);

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      {/* 0. Greeting Bar: "Good afternoon, Admin" + date + time + Quick add ▾ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#232D52] bg-gradient-to-r from-[#121831] via-[#10152c] to-[#121831] shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{greeting}, {adminFirstName}</span>
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-mono font-medium">
              Live School Ops
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
            <span>{currentDateStr}</span>
            <span>·</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentTimeStr}</span>
            <span>·</span>
            <span className="text-indigo-300 font-semibold">{timezone}</span>
          </div>
        </div>

        {/* Quick add ▾ (Student, Teacher, Subject, Class, Blog post) */}
        <div className="relative">
          <button
            onClick={() => setDashboardQuickAddOpen(!dashboardQuickAddOpen)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Quick add</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {dashboardQuickAddOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#232D52] bg-[#121831] p-1.5 shadow-2xl z-40 text-xs animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setDashboardQuickAddOpen(false);
                  openQuickAdd('student');
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Student</span>
              </button>
              <button
                onClick={() => {
                  setDashboardQuickAddOpen(false);
                  openQuickAdd('teacher');
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Teacher</span>
              </button>
              <button
                onClick={() => {
                  setDashboardQuickAddOpen(false);
                  openQuickAdd('parent' as any);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-pink-400" />
                <span>Parent</span>
              </button>
              <button
                onClick={() => {
                  setDashboardQuickAddOpen(false);
                  openQuickAdd('subject');
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Subject</span>
              </button>
              <button
                onClick={() => {
                  setDashboardQuickAddOpen(false);
                  openQuickAdd('session');
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Class</span>
              </button>
              <button
                onClick={() => {
                  setDashboardQuickAddOpen(false);
                  openQuickAdd('post');
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-rose-400" />
                <span>Blog post</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1. Action Center (Topmost & Most Prominent) */}
      <div className="rounded-2xl border border-[#232D52] bg-[#121831] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2648]">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                totalActionItems > 0
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
              }`}
            >
              {totalActionItems > 0 ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Action Center</span>
                {totalActionItems > 0 ? (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                    {totalActionItems} need attention
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                    All caught up ✓
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Immediate administrative decisions required for live Cambridge operations today.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('approvals')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Review all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {totalActionItems === 0 ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-200">Everything is up to date</p>
            <p className="text-xs text-slate-400 mt-0.5">
              No pending registrations, missing teachers, or critical subscription alerts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
            {/* Card 1: Pending account approvals */}
            {pendingAccounts.length > 0 && (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 text-xs font-mono font-bold flex items-center justify-center">
                      {pendingAccounts.length}
                    </span>
                    <span className="text-xs font-bold text-slate-200">Pending Account Approvals</span>
                  </div>
                  <span className="text-[10px] text-amber-300/80 font-mono">New sign-ups</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {pendingAccounts[0]?.requesterName}
                  {pendingAccounts.length > 1 ? ` and ${pendingAccounts.length - 1} other${pendingAccounts.length > 2 ? 's' : ''}` : ''} waiting for account approval.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => approveItem(pendingAccounts[0].id)}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title={`Approve ${pendingAccounts[0]?.requesterName}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('approvals')}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Review</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Card 2: Enrollment / elective requests */}
            {pendingEnrollments.length > 0 && (
              <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500 text-white text-xs font-mono font-bold flex items-center justify-center">
                      {pendingEnrollments.length}
                    </span>
                    <span className="text-xs font-bold text-slate-200">Enrollment / Access Requests</span>
                  </div>
                  <span className="text-[10px] text-indigo-300/80 font-mono">Subjects & scholarships</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {pendingEnrollments[0]?.requesterName} → {pendingEnrollments[0]?.targetEntityName}
                  {pendingEnrollments.length > 1 ? ` and ${pendingEnrollments.length - 1} more request${pendingEnrollments.length > 2 ? 's' : ''}` : ''}.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => approveItem(pendingEnrollments[0].id)}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title={`Approve ${pendingEnrollments[0]?.requesterName}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('approvals')}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-[#6D5BFF] text-white hover:bg-[#5B47FB] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Requests</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Card 3: Expiring subscriptions in 7 days */}
            {expiringSubs.length > 0 && (
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-500 text-white text-xs font-mono font-bold flex items-center justify-center">
                      {expiringSubs.length}
                    </span>
                    <span className="text-xs font-bold text-slate-200">Subscriptions Expiring &lt; 7 Days</span>
                  </div>
                  <span className="text-[10px] text-rose-300/80 font-mono font-bold">Fees</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {expiringSubs
                    .slice(0, 3)
                    .map((s: any) => `${s.studentName} (${s.subjectName?.split(' (')[0]})`)
                    .join(', ')}
                  {expiringSubs.length > 3 ? ` and ${expiringSubs.length - 3} more` : ''} — access ends within 7 days.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => renewSubscription(expiringSubs[0].id, 1)}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title={`Record next month for ${(expiringSubs[0] as any)?.studentName}`}
                  >
                    <span>Renew</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('subscriptions')}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Card 4: Classes today without teacher */}
            {classesWithoutTeacher.length > 0 && (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 text-xs font-mono font-bold flex items-center justify-center">
                      {classesWithoutTeacher.length}
                    </span>
                    <span className="text-xs font-bold text-slate-200">Classes Need Teacher</span>
                  </div>
                  <span className="text-[10px] text-amber-300/80 font-mono">Today</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {classesWithoutTeacher[0]?.title} at {classesWithoutTeacher[0]?.startTime} today has no teacher assigned yet.
                </p>
                <button
                  onClick={() => setCurrentView('timetable')}
                  className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Fix / Assign Teacher</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Card 5: Chronic Absentees (2+ absences this week) */}
            {chronicAbsentees.length > 0 && (
              <div className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-950/20 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-500 text-slate-950 text-xs font-mono font-bold flex items-center justify-center">
                      {chronicAbsentees.length}
                    </span>
                    <span className="text-xs font-bold text-slate-200">Students Absent 2+ Times</span>
                  </div>
                  <span className="text-[10px] text-sky-300/80 font-mono">This Week</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {chronicAbsentees.map((s) => s.name).join(', ')} flagged for follow-up with parents.
                </p>
                <button
                  onClick={() => setCurrentView('attendance')}
                  className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Attendance</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. KPI Strip (4 tiles only, neutral style, small trend vs last month) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active students */}
        <div className="p-4 rounded-2xl border border-[#232D52] bg-[#121831] shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Students</span>
            <div className="relative">
              <button
                onClick={() => setRoleBreakdownOpen(!roleBreakdownOpen)}
                className="text-slate-500 hover:text-slate-300"
                title="View role breakdown"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-100">
            {students.length}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
            <Users className="w-3.5 h-3.5" />
            <span className="font-semibold">{enrolledStudents}</span>
            <span className="text-slate-400">enrolled in subjects</span>
          </div>
        </div>

        {/* KPI 2: Active teachers */}
        <div className="p-4 rounded-2xl border border-[#232D52] bg-[#121831] shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Faculty & Teachers</span>
            <span className="text-[10px] text-indigo-400 font-mono">{departmentCount} Departments</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-100">
            {teachers.length}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="font-semibold">{engagedTeachers}</span>
            <span className="text-slate-400">engaged · {teachers.length - engagedTeachers} standby</span>
          </div>
        </div>

        {/* KPI 3: Monthly revenue USD */}
        <div className="p-4 rounded-2xl border border-[#232D52] bg-[#121831] shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Revenue</span>
            <span className="text-[10px] text-emerald-400 font-mono">USD</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-100">
            ${monthlyRevenue.toLocaleString()}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-semibold">{activeEnrollmentCount}</span>
            <span className="text-slate-400">active paid & free enrollments</span>
          </div>
        </div>

        {/* KPI 4: Attendance rate */}
        <div className="p-4 rounded-2xl border border-[#232D52] bg-[#121831] shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Attendance Rate</span>
            <span className="text-[10px] text-sky-400 font-mono">This Week</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-100">
            {attendanceRate === null ? '—' : `${attendanceRate}%`}
          </div>
          <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${chronicAbsentees.length ? 'text-amber-400' : 'text-emerald-400'}`}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-semibold">{chronicAbsentees.length}</span>
            <span className="text-slate-400">missed 2+ classes</span>
          </div>
        </div>
      </div>

      {/* Role breakdown popover if toggled */}
      {roleBreakdownOpen && (
        <div className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428] text-xs flex items-center justify-between text-slate-300 animate-in fade-in">
          <div>
            <span className="font-semibold text-white">Full User Base Breakdown: </span>
            <span className="font-mono">
              {allUsers.filter((u: any) => u.role === 'admin').length} Admins · {teachers.length} Faculty ({engagedTeachers} Engaged, {teachers.length - engagedTeachers} Standby) · {students.length} Students ({enrolledStudents} enrolled) · {parents.length} Parents = {allUsers.length} Total Accounts
            </span>
          </div>
          <button
            onClick={() => setRoleBreakdownOpen(false)}
            className="text-slate-400 hover:text-white underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Today's Classes & Sessions Timeline */}
      <div className="rounded-2xl border border-[#232D52] bg-[#121831] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2648]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Today's Class Schedule</h3>
            <span className="text-xs text-slate-400 font-mono">({timezone})</span>
          </div>
          <button
            onClick={() => setCurrentView('timetable')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Timetable</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {todaysSessions.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400">No classes scheduled today.</p>
          )}
          {todaysSessions.map((sess) => {
            const sub = subjects.find((s) => s.id === sess.subjectId);
            const teacher = teachers.find((t) => t.id === sess.teacherId);
            const dept = DEPARTMENT_CONFIG[sess.department as DepartmentName] || DEPARTMENT_CONFIG.General;

            return (
              <div
                key={sess.id}
                className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[70px] py-1 px-2 rounded-lg bg-slate-800/80 font-mono text-xs border border-slate-700">
                    <div className="font-bold text-slate-200">{sess.startTime}</div>
                    <div className="text-[10px] text-slate-400">{sess.endTime}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">{sub?.code || 'VCS'}</span>
                      <span className="text-xs font-bold text-slate-100">{sess.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{sess.level}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-300">{sess.department}</span>
                      <span>·</span>
                      <span className={teacher ? 'text-slate-300' : 'text-amber-400 font-semibold'}>
                        {teacher ? teacher.name : 'Teacher unassigned!'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <StatusPill status={sess.status} />

                  {sess.meetingLink && sess.status === 'live' ? (
                    <a
                      href={sess.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Live</span>
                    </a>
                  ) : sess.meetingLink ? (
                    <a
                      href={sess.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Link</span>
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}

          {/* Small line for today's teacher meetings if any exist */}
          {todaysMeetings.length > 0 && (
            <div className="px-3.5 py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 flex items-center justify-between text-xs text-indigo-200">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-400" />
                <span>
                  <strong>Consultation scheduled today:</strong>{' '}
                  {todaysMeetings[0]?.title} at {todaysMeetings[0]?.time} ({(todaysMeetings[0] as any)?.invitedNames || 'teachers'})
                </span>
              </div>
              <button
                onClick={() => setCurrentView('ptm-meetings')}
                className="text-xs font-semibold text-indigo-300 hover:underline cursor-pointer"
              >
                View
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Two-Column Row: Top Subjects & Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ranked Subjects */}
        <div className="rounded-2xl border border-[#232D52] bg-[#121831] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2648]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">Top Enrolled Subjects</h3>
              </div>
              <button
                onClick={() => setCurrentView('subjects')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Catalogue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {topSubjects.map((sub, idx) => {
                const percentage = Math.round((sub.studentCount / maxStudents) * 100);
                const dept = DEPARTMENT_CONFIG[sub.department as DepartmentName] || DEPARTMENT_CONFIG.General;

                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 font-bold text-[11px]">0{idx + 1}.</span>
                        <span className="font-bold text-slate-200">{sub.name}</span>
                        {sub.code && <span className="text-[10px] text-slate-400 font-mono">({sub.code})</span>}
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="font-semibold text-slate-300">{sub.studentCount} students</span>
                        <span className="text-emerald-400 font-bold">
                          {sub.priceUSD > 0 ? `$${(sub.studentCount * sub.priceUSD).toLocaleString()}/mo` : 'Free'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: dept.hex }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#1E2648] flex items-center justify-between text-xs text-slate-400">
            <span>{subjects.length} total curriculum offerings</span>
            <span className="font-mono font-semibold text-slate-300">Cambridge O/A Level & National</span>
          </div>
        </div>

        {/* Revenue 6 Months Chart */}
        <div className="rounded-2xl border border-[#232D52] bg-[#121831] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2648]">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">New Monthly Fees (Last 6 Months)</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">From new enrollments</span>
            </div>

            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2648" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `$${Math.round(val / 100) / 10}k` : `$${val}`)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1428',
                      borderColor: '#232D52',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, _n: any, item: any) => [`$${Number(val).toLocaleString()}/mo · ${item?.payload?.count || 0} enrollments`, 'Fees added']}
                  />
                  <Bar dataKey="revenue" fill="#6D5BFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#1E2648] flex items-center justify-between text-xs text-slate-400">
            <span>Total monthly fees now: <strong className="text-slate-200">${Number(monthlyRevenue).toLocaleString()}</strong></span>
            <button
              onClick={() => setCurrentView('enrollments')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Enrollments →
            </button>
          </div>
        </div>
      </div>

      {/* 5. Recent Activity Feed (8 Items) */}
      <div className="rounded-2xl border border-[#232D52] bg-[#121831] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2648]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Recent School Operations Log</h3>
          </div>
          <button
            onClick={() => setAllActivityModalOpen(true)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-[#1E2648]/60">
          {activities.slice(0, 8).map((act) => (
            <div key={act.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">{act.title}: </span>
                  <span className="text-slate-400">{act.description}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-mono whitespace-nowrap shrink-0">
                {act.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Activities Audit Modal */}
      {allActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#121831] border border-[#232D52] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#1E2648]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Full School Operations & Audit Log</h3>
              </div>
              <button
                onClick={() => setAllActivityModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 divide-y divide-[#1E2648]/60">
              {activities.map((act) => (
                <div key={act.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <div>
                      <span className="font-semibold text-slate-200">{act.title}: </span>
                      <span className="text-slate-400">{act.description}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap shrink-0">
                    {act.timestamp}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[#1E2648] bg-[#0E1428] flex justify-end rounded-b-2xl">
              <button
                onClick={() => setAllActivityModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
