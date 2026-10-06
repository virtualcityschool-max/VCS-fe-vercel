import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { Check, X, Inbox, UserCheck, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const {
    approvals,
    approveItem,
    rejectItem,
    approvedTodayCount,
    rejectedTodayCount,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'accounts' | 'enrollments' | 'parent_links'>('all');

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  const filteredApprovals = pendingApprovals.filter((item) => {
    if (activeTab === 'accounts') return item.type === 'account_signup';
    if (activeTab === 'enrollments') return item.type === 'enrollment_request';
    if (activeTab === 'parent_links') return item.type === 'parent_link';
    return true;
  });

  const accountCount = pendingApprovals.filter((a) => a.type === 'account_signup').length;
  const enrollmentCount = pendingApprovals.filter((a) => a.type === 'enrollment_request').length;
  const parentLinkCount = pendingApprovals.filter((a) => a.type === 'parent_link').length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Approvals Inbox"
        subtitle="Manage pending account signups, elective enrollment additions, and parent-student linkages."
      />

      {/* Counters Bar: Approved today / Rejected today */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831] flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Pending Review</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">{pendingApprovals.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831] flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Approved Today</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{approvedTodayCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831] flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Rejected Today</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">{rejectedTodayCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <X className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#121831] border border-[#232D52] rounded-xl w-fit">
        {[
          { id: 'all', label: 'All Requests', count: pendingApprovals.length },
          { id: 'accounts', label: 'Accounts', count: accountCount },
          { id: 'enrollments', label: 'Enrollment Requests', count: enrollmentCount },
          { id: 'parent_links', label: 'Parent-Child Links', count: parentLinkCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#6D5BFF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Inbox List */}
      {filteredApprovals.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Inbox is clear"
          description="There are currently no pending approval requests in this category. All new registrations or elective changes will appear here."
        />
      ) : (
        <div className="space-y-3">
          {filteredApprovals.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-[#232D52] bg-[#121831] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                  {item.requesterName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-100">{item.requesterName}</span>
                    <span className="text-xs text-slate-400">({item.requesterEmail})</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                      {item.title}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-indigo-300 mt-1">
                    Target: {item.targetEntityName}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.details}</p>
                  <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Requested {item.requestedAt}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                <button
                  onClick={() => rejectItem(item.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => approveItem(item.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
