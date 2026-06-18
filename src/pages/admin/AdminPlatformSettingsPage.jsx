import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlatformSettings, selectPlatformSettings, setSettings } from "../../store/slices/platformSettingsSlice";
import { platformSettingsService } from "../../services/platformSettingsService";
import { toastManager } from "../../utils/toastManager";

const Row = ({ label, hint, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-5 border-b border-slate-800/60 last:border-0">
    <div className="sm:w-72 shrink-0">
      <p className="text-sm font-semibold text-white">{label}</p>
      {hint && <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-indigo-600" : "bg-slate-700"}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

const AdminPlatformSettingsPage = () => {
  const dispatch  = useDispatch();
  const stored    = useSelector(selectPlatformSettings);
  const [form, setForm] = useState(stored);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(stored); }, [stored]);

  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const validate = () => {
    const e = {};
    const mpq = Number(form.quiz_marks_per_question);
    if (!mpq || mpq < 1 || mpq > 100)
      e.quiz_marks_per_question = "Must be between 1 and 100.";
    const sd = Number(form.quiz_submission_days);
    if (!sd || sd < 1 || sd > 10)
      e.quiz_submission_days = "Must be between 1 and 10 days.";
    // session_duration_mins is fixed at 60 — no validation needed
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); toastManager.error("Please fix the highlighted fields."); return; }
    setSaving(true);
    try {
      const updated = await platformSettingsService.update(form);
      dispatch(setSettings(updated));
      toastManager.success("Platform settings saved.");
    } catch {
      toastManager.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const inp = "bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition w-32 tabular-nums";
  const sel = "bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition";

  return (
    <div className="text-white space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black font-poppins tracking-tight">Platform Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure default values that pre-fill creation forms across the portal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quiz defaults */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center text-violet-400">
            <i className="fas fa-question-circle text-sm" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Quiz Creation Defaults</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Pre-filled values whenever a tutor creates a new quiz.</p>
          </div>
        </div>
        <div className="px-6">
          <Row label="Marks per question" hint="Range: 1 – 100">
            <div>
              <input type="number" min={1} max={100} value={form.quiz_marks_per_question}
                onChange={e => set("quiz_marks_per_question", e.target.value)}
                className={`${inp} ${errors.quiz_marks_per_question ? "border-red-500 focus:border-red-500" : ""}`} />
              {errors.quiz_marks_per_question && <p className="text-red-400 text-xs mt-1">{errors.quiz_marks_per_question}</p>}
            </div>
          </Row>
          <Row label="Publish immediately" hint="If on, published_at is set to now by default.">
            <div className="flex items-center gap-3">
              <Toggle value={form.quiz_publish_immediately} onChange={v => set("quiz_publish_immediately", v)} />
              <span className={`text-sm font-semibold ${form.quiz_publish_immediately ? "text-indigo-400" : "text-slate-500"}`}>
                {form.quiz_publish_immediately ? "Yes — publish now" : "No — set manually"}
              </span>
            </div>
          </Row>
          <Row label="Submission window (days)" hint="Range: 1 – 10 days">
            <div>
              <div className="flex items-center gap-2">
                <input type="number" min={1} max={10} value={form.quiz_submission_days}
                  onChange={e => set("quiz_submission_days", e.target.value)}
                  className={`${inp} ${errors.quiz_submission_days ? "border-red-500 focus:border-red-500" : ""}`} />
                <span className="text-slate-500 text-sm">days from creation</span>
              </div>
              {errors.quiz_submission_days && <p className="text-red-400 text-xs mt-1">{errors.quiz_submission_days}</p>}
            </div>
          </Row>
        </div>
      </div>

      {/* Session defaults */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
            <i className="fas fa-video text-sm" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Session Creation Defaults</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Pre-filled values whenever a tutor or admin creates a new session.</p>
          </div>
        </div>
        <div className="px-6">
          <Row label="Session duration" hint="Fixed at 60 minutes — cannot be changed at this time.">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl w-fit">
              <i className="fas fa-clock text-indigo-400 text-sm" />
              <span className="text-sm font-semibold text-white">60 minutes</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">Locked</span>
            </div>
          </Row>
          <Row label="Default scheduling mode" hint="Which mode is active when the create form opens.">
            <select value={form.session_default_start_type} onChange={e => set("session_default_start_type", e.target.value)} className={sel}>
              <option value="scheduled">Scheduled — pick a date & time</option>
              <option value="now">Start Now — launches immediately</option>
              <option value="delayed">Delayed Start — after X hrs : Y min</option>
            </select>
          </Row>
          <Row label="Meeting platform" hint="Google Meet is the only integrated platform at this time.">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl w-fit">
              <i className="fab fa-google text-blue-400 text-sm" />
              <span className="text-sm font-semibold text-white">Google Meet</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Active</span>
            </div>
          </Row>
        </div>
      </div>

      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black text-sm rounded-xl transition shadow-lg shadow-indigo-900/30 active:scale-95">
          {saving ? <><i className="fas fa-spinner fa-spin text-xs" />Saving…</> : <><i className="fas fa-save text-xs" />Save All Settings</>}
        </button>
      </div>
    </div>
  );
};

export default AdminPlatformSettingsPage;
