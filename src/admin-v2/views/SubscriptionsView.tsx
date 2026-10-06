import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { Subscription } from '../types';
import { CreditCard, RotateCcw, XCircle, ExternalLink } from 'lucide-react';

export const SubscriptionsView: React.FC = () => {
  const {
    subscriptions,
    students,
    subjects,
    renewSubscription,
    cancelSubscription,
    openDetailDrawer,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCount = subscriptions.filter((s) => s.status === 'Active').length;
  const expiringCount = subscriptions.filter((s) => s.status === 'Expiring soon').length;
  const expiredCount = subscriptions.filter((s) => s.status === 'Expired').length;

  const filtered = subscriptions.filter((sub) => {
    const student = students.find((s) => s.id === sub.studentId);
    const subject = subjects.find((s) => s.id === sub.subjectId);

    const matchSearch =
      (student?.name.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (subject?.name.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (sub.gumroadSubscriptionId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'active' && sub.status === 'Active') ||
      (activeTab === 'expiring' && sub.status === 'Expiring soon') ||
      (activeTab === 'expired' && sub.status === 'Expired');

    return matchSearch && matchTab;
  });

  const columns: Column<Subscription>[] = [
    {
      header: 'Student',
      cell: (row) => {
        const student = students.find((s) => s.id === row.studentId);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              {student ? student.name[0] : 'S'}
            </div>
            <div>
              <div className="font-semibold text-slate-100">{student?.name || 'Student'}</div>
              <div className="text-[11px] text-slate-400 font-mono">{student?.rollNo}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Subject Seat',
      cell: (row) => {
        const subject = subjects.find((s) => s.id === row.subjectId);
        return (
          <div>
            <div className="font-semibold text-slate-200">{subject?.name || 'Curriculum Subject'}</div>
            <span className="text-[11px] font-mono text-indigo-400">{subject?.code || ''}</span>
          </div>
        );
      },
    },
    {
      header: 'Billing Source',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`px-2 py-0.5 rounded font-mono text-[11px] ${
              row.source === 'Gumroad'
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
            }`}
          >
            {row.source}
          </span>
          {row.gumroadSubscriptionId && (
            <span className="text-[10px] text-slate-500 font-mono">
              ({row.gumroadSubscriptionId})
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Access Valid Until',
      cell: (row) => (
        <span
          className={`font-mono text-xs font-semibold ${
            row.status === 'Expiring soon'
              ? 'text-amber-400 font-bold'
              : row.status === 'Expired'
              ? 'text-rose-400'
              : 'text-slate-300'
          }`}
        >
          {row.accessUntil}
        </span>
      ),
    },
    {
      header: 'Monthly Fee',
      cell: (row) => (
        <span className="font-mono text-xs text-emerald-400 font-bold">
          ${row.monthlyAmountUSD}/mo
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => renewSubscription(row.id, 1)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            title="Add 1 month of access"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Renew</span>
          </button>
          {row.status !== 'Expired' && (
            <button
              onClick={() => cancelSubscription(row.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="End access now"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Subscriptions"
        subtitle="Manage student recurring seats, gateway renewal sync, and expired access windows."
      />

      {/* Segmented Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#121831] border border-[#232D52] rounded-xl w-fit">
        {[
          { id: 'all', label: 'All Subscriptions', count: subscriptions.length },
          { id: 'active', label: 'Active', count: activeCount },
          { id: 'expiring', label: 'Expiring Soon (<7d)', count: expiringCount },
          { id: 'expired', label: 'Expired', count: expiredCount },
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

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search student or subject..."
      />

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => openDetailDrawer('subscription', row)}
      />
    </div>
  );
};
