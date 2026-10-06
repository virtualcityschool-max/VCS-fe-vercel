import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import {
  DollarSign,
  TrendingUp,
  Download,
  CreditCard,
  PieChart as PieIcon,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { DEPARTMENT_CONFIG } from '../data/mockData';
import { DepartmentName } from '../types';

export const RevenueView: React.FC = () => {
  const { subjects, subscriptions, addToast } = useApp();

  const monthlyHistory = [
    { month: 'Nov 2025', revenue: 8400, students: 34 },
    { month: 'Dec 2025', revenue: 9200, students: 38 },
    { month: 'Jan 2026', revenue: 9800, students: 40 },
    { month: 'Feb 2026', revenue: 10400, students: 42 },
    { month: 'Mar 2026', revenue: 11100, students: 44 },
    { month: 'Apr 2026', revenue: 11800, students: 46 },
    { month: 'May 2026', revenue: 12200, students: 47 },
    { month: 'Jun 2026', revenue: 12600, students: 48 },
    { month: 'Jul 2026', revenue: 13100, students: 49 },
    { month: 'Aug 2026', revenue: 13900, students: 50 },
    { month: 'Sep 2026', revenue: 14800, students: 52 },
    { month: 'Oct 2026', revenue: 15420, students: 53 },
  ];

  // Revenue breakdown by department
  const deptRevenue: Record<string, number> = {};
  subjects.forEach((s) => {
    deptRevenue[s.department] = (deptRevenue[s.department] || 0) + s.studentCount * s.priceUSD;
  });

  const totalMonthlyRunRate = Object.values(deptRevenue).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Revenue & Growth Analytics"
        subtitle="Tracking Gumroad monthly recurring revenue, course yields, and enrollment conversions."
        primaryAction={{
          label: 'Export financial statement',
          onClick: () => addToast('Exported revenue statement (USD).', 'info'),
          icon: Download,
        }}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831]">
          <div className="text-xs text-slate-400">Monthly Run Rate (MRR)</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${totalMonthlyRunRate.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs previous quarter</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831]">
          <div className="text-xs text-slate-400">Average Revenue Per Student (ARPU)</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">$291.00</div>
          <div className="mt-1 text-xs text-slate-400">Across 2.4 avg subjects enrolled</div>
        </div>

        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831]">
          <div className="text-xs text-slate-400">Gumroad Gateway Success Rate</div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">98.4%</div>
          <div className="mt-1 text-xs text-emerald-400">Zero chargebacks this term</div>
        </div>
      </div>

      {/* 12-Month Revenue Trend Line Chart */}
      <div className="rounded-2xl border border-[#232D52] bg-[#121831] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2648]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">12-Month Revenue Growth Curve</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">USD Recurring Billing</span>
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2648" vertical={false} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0E1428',
                  borderColor: '#232D52',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Total Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Department Breakdown */}
      <div className="rounded-2xl border border-[#232D52] bg-[#121831] p-5 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 pb-3 border-b border-[#1E2648]">
          Revenue Contribution by Department
        </h3>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(deptRevenue).map(([deptName, rev]) => {
            const dept = DEPARTMENT_CONFIG[deptName as DepartmentName] || DEPARTMENT_CONFIG.General;
            const pct = Math.round((rev / totalMonthlyRunRate) * 100);

            return (
              <div
                key={deptName}
                className="p-4 rounded-xl border border-[#232D52] bg-[#0E1428] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{deptName}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{pct}%</span>
                </div>
                <div className="text-lg font-bold font-mono text-slate-100">
                  ${rev.toLocaleString()} <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: dept.hex }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
