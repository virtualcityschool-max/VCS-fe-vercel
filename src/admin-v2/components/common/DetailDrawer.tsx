import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  MessageCircle,
  GraduationCap,
  Award,
  CheckCircle,
  Clock,
  Send,
} from 'lucide-react';
import { StatusPill } from './StatusPill';
import { DEPARTMENT_CONFIG } from '../../data/mockData';
import { DepartmentName } from '../../types';

export const DetailDrawer: React.FC = () => {
  const { detailDrawer, closeDetailDrawer, subjects, renewSubscription, cancelSubscription, setCurrentView, rawAttendance, subscriptions, tzIana, toggleUserStatus } =
    useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'attendance' | 'finance' | 'notes'>('overview');
  if (!detailDrawer.isOpen || !detailDrawer.data) return null;

  const data = detailDrawer.data;
  const type = detailDrawer.type;


  const getEntityTitle = () => {
    switch (type) {
      case 'student':
        return `Student: ${data.name}`;
      case 'teacher':
        return `Teacher: ${data.name}`;
      case 'parent':
        return `Parent: ${data.name}`;
      case 'subject':
        return `Subject: ${data.code} ${data.name}`;
      case 'subscription':
        return `Subscription: ${data.id}`;
      case 'session':
        return `Session: ${data.title}`;
      default:
        return 'Record Details';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDetailDrawer}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-[#121831] border-l border-[#232D52] shadow-2xl flex flex-col text-slate-100 z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2648] bg-[#0E1428]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
              {data.name ? data.name[0] : '#'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{getEntityTitle()}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{type.toUpperCase()}</span>
                {data.rollNo && <span>· Roll #{data.rollNo}</span>}
                {data.code && <span>· Cambridge {data.code}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data.status && <StatusPill status={data.status} />}
            <button
              onClick={closeDetailDrawer}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-[#1E2648] bg-[#121831] overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'subjects', label: 'Subjects & Academics', icon: BookOpen },
            { id: 'attendance', label: 'Attendance', icon: Calendar },
            { id: 'finance', label: 'Billing & Fees', icon: CreditCard },
          ]
            .filter((t) => (detailDrawer.type === 'student' ? true : t.id === 'overview' || t.id === 'subjects'))
            .map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#6D5BFF] text-[#6D5BFF]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Profile Card */}
              <div className="p-4 rounded-xl border border-[#232D52] bg-[#0E1428] space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Contact & Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {data.email && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{data.email}</span>
                    </div>
                  )}
                  {data.phone && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{data.phone}</span>
                    </div>
                  )}
                  {data.whatsappNumber && (
                    <a
                      href={`https://wa.me/${data.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-emerald-400 hover:underline"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Direct WhatsApp Chat</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {data.location && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Location: {data.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Specific Details */}
              {type === 'student' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428]">
                    <div className="text-xs text-slate-400">Academic Stage</div>
                    <div className="text-base font-bold text-slate-100 mt-1">{data.level}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Roll #{data.rollNo}</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428]">
                    <div className="text-xs text-slate-400">Fee Status</div>
                    <div className="mt-1">
                      <StatusPill status={data.feeStatus || 'Paid'} />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Monthly fees: ${data.totalPaidUSD || 0}</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428]">
                    <div className="text-xs text-slate-400">Attendance Rate</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">{data.attendanceRate == null ? '—' : `${data.attendanceRate}%`}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Absences this week: {data.absencesThisWeek || 0}</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428]">
                    <div className="text-xs text-slate-400">Guardian Contact</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">{data.guardianName || 'Not recorded'}</div>
                    <div className="text-xs text-slate-400">{data.guardianPhone || 'Not set'}</div>
                  </div>
                </div>
              )}

              {/* Teacher Specific Details */}
              {type === 'teacher' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428]">
                    <div className="text-xs text-slate-400">Department</div>
                    <div className="text-base font-bold text-slate-100 mt-1">{data.department}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{data.weeklyHours} teaching hours/wk</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428]">
                    <div className="text-xs text-slate-400">Experience</div>
                    <div className="text-base font-bold text-indigo-400 mt-1">{data.experienceYears} Years</div>
                    <div className="text-xs text-slate-500 mt-0.5">{data.qualification}</div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <a
                  href={`/admin/users/${data.id}`}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
                >
                  Open full profile / edit
                </a>
                {(type === 'student' || type === 'teacher' || type === 'parent' || type === 'user') && (
                  <button
                    onClick={() => toggleUserStatus(data.id)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
                  >
                    {data.status === 'Inactive' ? 'Activate account' : 'Deactivate account'}
                  </button>
                )}
                {type === 'teacher' && (
                  <button
                    onClick={() => {
                      closeDetailDrawer();
                      setCurrentView('teacher-allocations');
                    }}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
                  >
                    Manage allocations
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Enrolled / Assigned Subjects
              </h4>
              <div className="space-y-2.5">
                {subjects
                  .filter((sub) =>
                    type === 'student'
                      ? (data.enrolledSubjectIds || []).includes(sub.id)
                      : (data.assignedSubjectIds || []).includes(sub.id)
                  )
                  .map((sub) => {
                    const dept = DEPARTMENT_CONFIG[sub.department as DepartmentName] || DEPARTMENT_CONFIG.General;
                    return (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428] flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-400">{sub.code}</span>
                            <span className="text-sm font-semibold text-slate-100">{sub.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span>{sub.level}</span>
                            <span>·</span>
                            <span className="font-medium text-slate-300">{sub.department}</span>
                            <span>·</span>
                            <span>{sub.weeklySessions} sessions/week</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-slate-200">${sub.priceUSD}/mo</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Recent Session Log
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {data.attendanceRate == null ? '—' : `${data.attendanceRate}%`} last 30 days
                </span>
              </div>

              <div className="space-y-2">
                {(rawAttendance || [])
                  .filter((r: any) => String(r.student) === String(data.id))
                  .sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
                  .slice(0, 20)
                  .map((r: any) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-[#232D52] bg-[#0E1428] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium text-slate-200">{r.session_title}</span>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {new Date(r.scheduled_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', ...(tzIana ? { timeZone: tzIana } : {}) })}
                        </div>
                      </div>
                      <StatusPill status={r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : '—'} />
                    </div>
                  ))}
                {!(rawAttendance || []).some((r: any) => String(r.student) === String(data.id)) && (
                  <p className="text-xs text-slate-400">No classes recorded in the last 30 days.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-3">
              {subscriptions.filter((r: any) => r.studentId === String(data.id)).length === 0 && (
                <p className="text-xs text-slate-400">No paid subscription on record. Enrolled subjects without one are free or never expire.</p>
              )}
              {subscriptions
                .filter((r: any) => r.studentId === String(data.id))
                .map((r: any) => (
                  <div key={r.id} className="p-4 rounded-xl border border-[#232D52] bg-[#0E1428] space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-100 truncate">{r.subjectName}</span>
                      <StatusPill status={r.status} />
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap gap-x-3">
                      <span>Access until {r.accessUntil || '—'}</span>
                      {r.lastChargeDate && <span>Last paid {r.lastChargeDate}</span>}
                      <span>{r.source === 'Gumroad' ? 'Paid via Gumroad' : 'Paid to admin'}</span>
                      <span className="font-mono text-slate-300">${r.monthlyAmountUSD}/mo</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => renewSubscription(r.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#6D5BFF] hover:bg-[#5B47FB] text-white"
                      >
                        {r.hasAccess ? 'Add 1 month' : 'Restore access'}
                      </button>
                      {r.hasAccess && (
                        <button
                          onClick={() => cancelSubscription(r.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                        >
                          End access
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E2648] bg-[#0E1428] flex items-center justify-between">
          <span className="text-xs text-slate-500">Live data from the VCS server</span>
          <button
            onClick={closeDetailDrawer}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
