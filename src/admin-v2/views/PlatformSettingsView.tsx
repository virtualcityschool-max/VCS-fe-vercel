import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { Sliders, Clock, User, Save, Check } from 'lucide-react';

export const PlatformSettingsView: React.FC = () => {
  const { settings, updateSettings, setTimezone, tzIana, profile } = useApp() as any;
  const [activeTab, setActiveTab] = useState<'defaults' | 'timezone'>('defaults');

  // Form states
  const [defaultsForm, setDefaultsForm] = useState(settings);
  useEffect(() => setDefaultsForm(settings), [settings]);
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [selectedTz, setSelectedTz] = useState(tzIana || browserTz);
  useEffect(() => setSelectedTz(tzIana || browserTz), [tzIana, browserTz]);
  const adminName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.username || '';
  const adminEmail = profile?.email || '';

  const availableTimezones = [
    { label: 'Asia/Riyadh (AST, UTC+3) — Gulf Standard', value: 'Asia/Riyadh' },
    { label: 'Asia/Dubai (GST, UTC+4) — UAE / Oman', value: 'Asia/Dubai' },
    { label: 'Asia/Karachi (PKT, UTC+5) — Pakistan Standard', value: 'Asia/Karachi' },
    { label: 'Asia/Qatar (AST, UTC+3) — Doha Desk', value: 'Asia/Qatar' },
    { label: 'Europe/London (BST, UTC+1) — Cambridge UK Desk', value: 'Europe/London' },
    { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  ];

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(defaultsForm);
  };

  const handleSaveTimezone = (e: React.FormEvent) => {
    e.preventDefault();
    setTimezone(selectedTz);
  };

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto animate-in fade-in duration-150 pb-12">
      <PageHeader
        title="Platform Settings & Regional Timezone"
        subtitle="Configure system-wide academic automation rules, quiz parameters, and master timezone clock."
      />

      {/* Segmented Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#121831] border border-[#232D52] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('defaults')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'defaults' ? 'bg-[#6D5BFF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Operational & Quiz Defaults</span>
        </button>
        <button
          onClick={() => setActiveTab('timezone')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'timezone' ? 'bg-[#6D5BFF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timezone & Admin Profile</span>
        </button>
      </div>

      {activeTab === 'defaults' ? (
        <form onSubmit={handleSaveDefaults} className="space-y-6 text-xs">
          {/* Quiz Defaults Card */}
          <div className="p-6 rounded-2xl border border-[#232D52] bg-[#121831] space-y-5 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Quiz & Assessment Automation Rules</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard behaviors applied when teachers create new topical quizzes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[#1E2648]">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Default Marks Per Question
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={defaultsForm.marksPerQuestion}
                  onChange={(e) =>
                    setDefaultsForm({ ...defaultsForm, marksPerQuestion: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard baseline weight assigned to multiple choice questions.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Submission Window (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={defaultsForm.submissionWindowDays}
                  onChange={(e) =>
                    setDefaultsForm({ ...defaultsForm, submissionWindowDays: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Number of days students have to submit weekly assignment papers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <input
                type="checkbox"
                id="publishCheck"
                checked={defaultsForm.publishImmediately}
                onChange={(e) => setDefaultsForm({ ...defaultsForm, publishImmediately: e.target.checked })}
                className="rounded border-[#232D52] bg-[#0E1428] text-indigo-500 focus:ring-0"
              />
              <label htmlFor="publishCheck" className="text-slate-300 cursor-pointer text-xs">
                <span className="font-semibold block text-slate-200">
                  Publish assessment scores immediately upon completion
                </span>
                <span className="text-slate-500 text-[11px]">
                  If disabled, results require teacher review before parent visibility.
                </span>
              </label>
            </div>
          </div>

          {/* Live Class Session Defaults Card */}
          <div className="p-6 rounded-2xl border border-[#232D52] bg-[#121831] space-y-5 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Live Class Session Defaults</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Scheduling policies and start mode behavior for online classrooms.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[#1E2648]">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Session Start Mode</label>
                <select
                  value={defaultsForm.sessionStartMode}
                  onChange={(e) =>
                    setDefaultsForm({ ...defaultsForm, sessionStartMode: e.target.value as any })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
                >
                  <option value="Scheduled">Scheduled (Auto-open at specified time)</option>
                  <option value="Start now">Manual (Requires teacher 'Start' click)</option>
                  <option value="Delayed">Delayed 5 mins (Buffer for Gulf prayer times)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Controls whether Google Meet room unlocks automatically.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Default Seminar Duration
                </label>
                <input
                  type="number"
                  value={defaultsForm.defaultDurationMinutes}
                  onChange={(e) =>
                    setDefaultsForm({ ...defaultsForm, defaultDurationMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard block length for timetable slots in minutes.
                </p>
              </div>
            </div>

          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Platform Settings</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveTimezone} className="space-y-6 text-xs">
          {/* Timezone Configuration Card */}
          <div className="p-6 rounded-2xl border border-[#232D52] bg-[#121831] space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Primary Operating Timezone</h3>
                <p className="text-xs text-slate-400">
                  All class times, timetable calendars, and PTM slots display in this timezone.
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
                {!availableTimezones.some((tz) => tz.value === selectedTz) && (
                  <option value={selectedTz}>{selectedTz}</option>
                )}
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
                  The account you are signed in with. Change names from Users.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#1E2648]">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  value={adminName}
                  readOnly
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Administrator Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  readOnly
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Timezone</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
