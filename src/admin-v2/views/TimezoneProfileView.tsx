import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { Clock, Shield, User, Globe, Save, Check } from 'lucide-react';

export const TimezoneProfileView: React.FC = () => {
  const { timezone, setTimezone, addToast } = useApp();

  const [adminName, setAdminName] = useState('School Principal (Admin)');
  const [adminEmail, setAdminEmail] = useState('admin@virtualcityschool.com');
  const [selectedTz, setSelectedTz] = useState(timezone);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const availableTimezones = [
    { label: 'Asia/Riyadh (AST, UTC+3) — Gulf Standard', value: 'Asia/Riyadh AST' },
    { label: 'Asia/Dubai (GST, UTC+4) — UAE / Oman', value: 'Asia/Dubai GST' },
    { label: 'Asia/Karachi (PKT, UTC+5) — Pakistan Standard', value: 'Asia/Karachi PKT' },
    { label: 'Asia/Qatar (AST, UTC+3) — Doha Desk', value: 'Asia/Qatar AST' },
    { label: 'Europe/London (BST, UTC+1) — Cambridge UK Desk', value: 'Europe/London BST' },
    { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setTimezone(selectedTz);
    addToast(`Preferences updated. Active timezone set to ${selectedTz}.`, 'success');
  };

  return (
    <div className="space-y-6 max-w-[800px] mx-auto animate-in fade-in duration-150 pb-12">
      <PageHeader
        title="Timezone & Administrator Profile"
        subtitle="Manage master regional timing synchronization, notification relays, and school credentials."
      />

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Timezone Configuration Card */}
        <div className="p-6 rounded-2xl border border-[#232D52] bg-[#121831] space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Primary Operating Timezone</h3>
              <p className="text-xs text-slate-400">
                All class times, timetable calendars, and consultation slots display in this timezone.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E2648]">
            <label className="block text-slate-300 font-semibold mb-1.5">Select Timezone</label>
            <select
              value={selectedTz}
              onChange={(e) => setSelectedTz(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {availableTimezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-2xl border border-[#232D52] bg-[#121831] space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Administrator Credentials</h3>
              <p className="text-xs text-slate-400">
                Account identity displayed on notices, approvals, and certificates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#1E2648]">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Administrator Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Notification preferences */}
        <div className="p-6 rounded-2xl border border-[#232D52] bg-[#121831] space-y-3 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100">Immediate Incident Alerts</h3>

          <div className="space-y-3 pt-2 border-t border-[#1E2648]">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="emailCheck"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-[#232D52] bg-[#0E1428] text-indigo-500 focus:ring-0"
              />
              <label htmlFor="emailCheck" className="text-slate-300 cursor-pointer">
                Send instant email when a new student self-registers from Gulf portal
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="smsCheck"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded border-[#232D52] bg-[#0E1428] text-indigo-500 focus:ring-0"
              />
              <label htmlFor="smsCheck" className="text-slate-300 cursor-pointer">
                Send emergency WhatsApp alert if a scheduled class starts with no tutor present
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Timezone</span>
          </button>
        </div>
      </form>
    </div>
  );
};
