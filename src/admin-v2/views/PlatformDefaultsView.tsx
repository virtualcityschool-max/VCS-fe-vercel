import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { Sliders, Save, Check } from 'lucide-react';

export const PlatformDefaultsView: React.FC = () => {
  const { settings, updateSettings, addToast } = useApp();
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    addToast('Platform defaults and operational rules updated.', 'success');
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto animate-in fade-in duration-150 pb-12">
      <PageHeader
        title="Platform Defaults & Operational Rules"
        subtitle="Configure default behaviors for automated quiz grading, live class start triggers, and assessment windows."
        primaryAction={{
          label: 'Save defaults',
          onClick: () => {
            updateSettings(formData);
            addToast('Platform defaults updated.', 'success');
          },
          icon: Save,
        }}
      />

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
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
                value={formData.marksPerQuestion}
                onChange={(e) =>
                  setFormData({ ...formData, marksPerQuestion: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Standard baseline weight assigned to single multiple choice questions.
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
                value={formData.submissionWindowDays}
                onChange={(e) =>
                  setFormData({ ...formData, submissionWindowDays: Number(e.target.value) })
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
              checked={formData.publishImmediately}
              onChange={(e) => setFormData({ ...formData, publishImmediately: e.target.checked })}
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
                value={formData.sessionStartMode}
                onChange={(e) =>
                  setFormData({ ...formData, sessionStartMode: e.target.value as any })
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
                value={formData.defaultDurationMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, defaultDurationMinutes: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Standard block length for timetable slots in minutes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <input
              type="checkbox"
              id="recordingCheck"
              checked={formData.recordingAutoPublish}
              onChange={(e) => setFormData({ ...formData, recordingAutoPublish: e.target.checked })}
              className="rounded border-[#232D52] bg-[#0E1428] text-indigo-500 focus:ring-0"
            />
            <label htmlFor="recordingCheck" className="text-slate-300 cursor-pointer text-xs">
              <span className="font-semibold block text-slate-200">
                Auto-process and publish class recordings to student portals
              </span>
              <span className="text-slate-500 text-[11px]">
                Enables absent students to watch session replay within 2 hours.
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Update Platform Defaults</span>
          </button>
        </div>
      </form>
    </div>
  );
};
