import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { Referral } from '../types';
import { Share2, Users, TrendingUp, DollarSign, Copy, Check } from 'lucide-react';

export const ReferralsView: React.FC = () => {
  const { referrals, addToast } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const totalReferringUsers = referrals.length;
  const totalSignups = referrals.reduce((sum, r) => sum + r.signups, 0);
  const totalEnrolled = referrals.reduce((sum, r) => sum + r.enrolled, 0);
  const overallConversion = totalSignups > 0 ? ((totalEnrolled / totalSignups) * 100).toFixed(1) : '0';
  const topReferrer = [...referrals].sort((a, b) => b.enrolled - a.enrolled || b.signups - a.signups)[0];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Referral code ${code} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const columns: Column<Referral>[] = [
    {
      header: 'User',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-100">{row.userName}</div>
          <div className="text-[11px] text-slate-400 capitalize">{row.userRole}</div>
        </div>
      ),
    },
    {
      header: 'Referral Code',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30">
            {row.code}
          </span>
          <button
            onClick={() => handleCopy(row.code)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy Code"
          >
            {copiedCode === row.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      ),
    },
    {
      header: 'Sign-ups',
      cell: (row) => <span className="font-mono text-xs text-slate-300">{row.signups}</span>,
    },
    {
      header: 'Enrolled Students',
      cell: (row) => <span className="font-mono text-xs font-bold text-slate-100">{row.enrolled}</span>,
    },
    {
      header: 'Conversion %',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-emerald-400">
          {row.conversionRate.toFixed(1)}%
        </span>
      ),
    },
    {
      header: 'Joined Date',
      cell: (row) => <span className="font-mono text-xs text-slate-400">{row.createdAt}</span>,
    },
  ];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <PageHeader
        title="Referrals & Growth Network"
        subtitle="Track word-of-mouth student invitations, teacher ambassador codes, and enrolled conversions."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831]">
          <div className="text-xs text-slate-400">Referring Advocates</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{totalReferringUsers}</div>
          <div className="text-xs text-slate-500 mt-1">Users with a referral code</div>
        </div>

        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831]">
          <div className="text-xs text-slate-400">Total Leads Generated</div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">{totalSignups}</div>
          <div className="text-xs text-slate-500 mt-1">Accounts created with a code</div>
        </div>

        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831]">
          <div className="text-xs text-slate-400">Enrolled From Referrals</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{totalEnrolled}</div>
          <div className="text-xs text-emerald-400 mt-1 font-semibold">{overallConversion}% Conversion Rate</div>
        </div>

        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831]">
          <div className="text-xs text-slate-400">Top Referrer</div>
          <div className="text-lg font-bold text-slate-100 mt-1 truncate">{topReferrer && topReferrer.signups > 0 ? topReferrer.userName : '—'}</div>
          <div className="text-xs text-slate-500 mt-1">{topReferrer && topReferrer.signups > 0 ? `${topReferrer.signups} sign-ups · ${topReferrer.enrolled} enrolled` : 'No sign-ups yet'}</div>
        </div>
      </div>

      <DataTable columns={columns} data={referrals} />
    </div>
  );
};
