import React, { useEffect, useState, useCallback } from "react";
import { trainingService } from "../../services/trainingService";
import { adminService } from "../../services/adminService";
import { toastManager } from "../../utils/toastManager";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const CATEGORIES = [
  { value: "onboarding",  label: "Platform Onboarding"     },
  { value: "teaching",    label: "Teaching Skills"          },
  { value: "curriculum",  label: "Curriculum Updates"       },
  { value: "features",    label: "New Feature Walkthrough"  },
  { value: "delivery",    label: "Delivery Standards"       },
  { value: "other",       label: "Other"                    },
];

const CAT_COLOR = {
  onboarding: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  teaching:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  curriculum: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  features:   "bg-violet-500/15 text-violet-300 border-violet-500/20",
  delivery:   "bg-rose-500/15 text-rose-300 border-rose-500/20",
  other:      "bg-slate-500/15 text-slate-300 border-slate-500/20",
};

const BLANK = {
  title: "", category: "onboarding", learning_objectives: "", trainer_name: "",
  scheduled_at: "", duration_mins: 60, send_to: "all",
  specific_tutor_ids: [], is_mandatory: false, registration_deadline: "",
};

// ── Reusable field ────────────────────────────────────────────────────────────
const F = ({ label, required, children }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);
const inp = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition";

// ── Session Form Modal ────────────────────────────────────────────────────────
const TrainingFormModal = ({ session, tutors, onClose, onSaved }) => {
  const [form, setForm]     = useState(session ? {
    ...BLANK,
    ...session,
    scheduled_at: session.scheduled_at ? session.scheduled_at.slice(0, 16) : "",
    registration_deadline: session.registration_deadline ? session.registration_deadline.slice(0, 16) : "",
  } : BLANK);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleTutor = (id) => {
    setForm(p => ({
      ...p,
      specific_tutor_ids: p.specific_tutor_ids.includes(id)
        ? p.specific_tutor_ids.filter(x => x !== id)
        : [...p.specific_tutor_ids, id],
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.trainer_name || !form.scheduled_at) {
      toastManager.error("Title, Trainer and Date/Time are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        duration_mins: Number(form.duration_mins),
        registration_deadline: form.registration_deadline || null,
        specific_tutor_ids: form.send_to === "specific" ? form.specific_tutor_ids : [],
      };
      if (session) {
        await trainingService.update(session.id, payload);
        toastManager.success("Training session updated.");
      } else {
        await trainingService.create(payload);
        toastManager.success("Training session created.");
      }
      onSaved();
      onClose();
    } catch {
      toastManager.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <h2 className="text-base font-black text-white">{session ? "Edit Training Session" : "Create Training Session"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Session Title" required>
              <input className={inp} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Platform Onboarding Q3" />
            </F>
            <F label="Category" required>
              <select className={inp} value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </F>
          </div>

          {/* Objectives */}
          <F label="Learning Objectives">
            <textarea className={`${inp} resize-none`} rows={3} value={form.learning_objectives}
              onChange={e => set("learning_objectives", e.target.value)}
              placeholder="What tutors will learn from this session…" />
          </F>

          {/* Trainer + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Trainer Name" required>
              <input className={inp} value={form.trainer_name} onChange={e => set("trainer_name", e.target.value)} placeholder="Name of trainer or presenter" />
            </F>
            <F label="Duration (minutes)" required>
              <input type="number" min={15} max={480} className={inp} value={form.duration_mins}
                onChange={e => set("duration_mins", e.target.value)} />
            </F>
          </div>

          {/* Date + Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Date & Start Time" required>
              <input type="datetime-local" className={`${inp} [color-scheme:dark]`} value={form.scheduled_at}
                onChange={e => set("scheduled_at", e.target.value)} />
            </F>
            <F label="Registration Deadline">
              <input type="datetime-local" className={`${inp} [color-scheme:dark]`} value={form.registration_deadline}
                onChange={e => set("registration_deadline", e.target.value)} />
            </F>
          </div>

          {/* Send To + Mandatory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Send To" required>
              <select className={inp} value={form.send_to} onChange={e => set("send_to", e.target.value)}>
                <option value="all">All Tutors</option>
                <option value="specific">Specific Tutors</option>
              </select>
            </F>
            <F label="Attendance">
              <button type="button"
                onClick={() => set("is_mandatory", !form.is_mandatory)}
                className={`w-full py-2.5 rounded-xl border text-sm font-black uppercase tracking-widest transition ${
                  form.is_mandatory
                    ? "bg-rose-600/20 border-rose-500/40 text-rose-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                {form.is_mandatory ? "✓ Mandatory" : "Optional"}
              </button>
            </F>
          </div>

          {/* Specific tutors */}
          {form.send_to === "specific" && (
            <F label="Select Tutors">
              <div className="max-h-40 overflow-y-auto space-y-1.5 bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                {tutors.length === 0 && <p className="text-slate-500 text-xs">No tutors found.</p>}
                {tutors.map(t => {
                  const selected = form.specific_tutor_ids.includes(t.id);
                  return (
                    <button key={t.id} type="button" onClick={() => toggleTutor(t.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left ${
                        selected ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-300" : "hover:bg-slate-700/60 text-slate-300"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center text-[8px] shrink-0 ${selected ? "bg-indigo-600 border-indigo-500" : "border-slate-600"}`}>
                        {selected && <i className="fas fa-check text-white" />}
                      </div>
                      {t.username} <span className="text-slate-500 text-xs">({t.email})</span>
                    </button>
                  );
                })}
              </div>
              {form.specific_tutor_ids.length > 0 && (
                <p className="text-[10px] text-indigo-400 mt-1">{form.specific_tutor_ids.length} tutor(s) selected</p>
              )}
            </F>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-800 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-semibold text-sm transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-sm transition flex items-center gap-2">
            {saving ? <><i className="fas fa-spinner fa-spin text-xs" />Saving…</> : <><i className="fas fa-save text-xs" />{session ? "Update" : "Create"}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Registrations Modal ───────────────────────────────────────────────────────
const RegistrationsModal = ({ session, onClose }) => {
  const { formatDate, formatTime } = useDateFormatters();
  const [regs, setRegs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    trainingService.registrations(session.id)
      .then(setRegs).catch(() => toastManager.error("Failed to load registrations."))
      .finally(() => setLoading(false));
  }, [session.id]);

  const toggle = async (reg) => {
    setToggling(reg.id);
    try {
      const updated = await trainingService.markAttended(session.id, reg.id, !reg.attended);
      setRegs(p => p.map(r => r.id === reg.id ? { ...r, ...updated } : r));
    } catch { toastManager.error("Failed to update."); }
    finally { setToggling(null); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="text-base font-black text-white">Attendance</h2>
            <p className="text-xs text-slate-500 mt-0.5">{session.title} · {regs.length} registered</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition">
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[55vh] overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><i className="fas fa-spinner fa-spin text-slate-600 text-xl" /></div>
          ) : regs.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No tutors have registered yet.</p>
          ) : regs.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-800/60">
              <div>
                <p className="text-sm font-semibold text-white">{r.tutor_name}</p>
                <p className="text-xs text-slate-500">{r.tutor_email}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Registered: {formatDate(r.registered_at)}</p>
              </div>
              <button
                onClick={() => toggle(r)}
                disabled={toggling === r.id}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition border ${
                  r.attended
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-emerald-500/15 hover:border-emerald-500/30 hover:text-emerald-300"
                }`}
              >
                {toggling === r.id ? <i className="fas fa-spinner fa-spin" /> : r.attended ? "✓ Attended" : "Mark Attended"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminTrainingPage = () => {
  const { formatDate, formatTime } = useDateFormatters();
  const [sessions, setSessions] = useState([]);
  const [tutors, setTutors]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | "create" | session obj
  const [viewRegs, setViewRegs] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([
        trainingService.list(),
        adminService.getUsers({ role: "teacher" }).then(r => r.results || r.data || r || []),
      ]);
      setSessions(Array.isArray(s) ? s : []);
      setTutors(Array.isArray(u) ? u : []);
    } catch { toastManager.error("Failed to load training data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await trainingService.remove(deleteTarget.id);
      toastManager.success("Training session deleted.");
      setSessions(p => p.filter(s => s.id !== deleteTarget.id));
    } catch { toastManager.error("Failed to delete."); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div className="text-white space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black font-poppins tracking-tight">Training Centre</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage internal training sessions for tutors.</p>
        </div>
        <button onClick={() => setModal("create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-indigo-900/30 active:scale-95">
          <i className="fas fa-plus text-xs" /> Create Training
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex justify-center py-16"><i className="fas fa-spinner fa-spin text-slate-600 text-2xl" /></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-graduation-cap text-slate-500 text-xl" />
            </div>
            <p className="text-white font-bold mb-1">No training sessions yet</p>
            <p className="text-slate-500 text-sm mb-4">Create the first internal training for your tutors.</p>
            <button onClick={() => setModal("create")}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition">
              <i className="fas fa-plus text-xs" /> Create Training
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  {["Title", "Category", "Trainer", "Date & Time", "Duration", "Audience", "Registered", ""].map((h, i) => (
                    <th key={i} className={`px-5 py-4 text-xs font-black uppercase text-slate-500 ${i === 7 ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white text-sm">{s.title}</p>
                      {s.is_mandatory && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-rose-500/15 text-rose-300 border border-rose-500/20 rounded-full px-1.5 py-0.5">
                          Mandatory
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${CAT_COLOR[s.category] || CAT_COLOR.other}`}>
                        {s.category_display}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300 text-sm">{s.trainer_name}</td>
                    <td className="px-5 py-4">
                      <p className="text-slate-300 text-sm">{formatDate(s.scheduled_at)}</p>
                      <p className="text-slate-500 text-xs">{formatTime(s.scheduled_at)}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{s.duration_mins} min</td>
                    <td className="px-5 py-4 text-slate-400 text-sm capitalize">{s.send_to === "all" ? "All Tutors" : `${(s.specific_tutor_ids||[]).length} specific`}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => setViewRegs(s)} className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition">
                        <i className="fas fa-users text-xs" /> {s.registered_count}
                        {s.attended_count > 0 && <span className="text-emerald-400 text-xs">({s.attended_count} ✓)</span>}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setModal(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition">
                          <i className="fas fa-edit mr-1" />Edit
                        </button>
                        <button onClick={() => setDeleteTarget(s)} className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/20 transition">
                          <i className="fas fa-trash mr-1" />Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <TrainingFormModal
          session={modal === "create" ? null : modal}
          tutors={tutors}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
      {viewRegs && <RegistrationsModal session={viewRegs} onClose={() => setViewRegs(null)} />}
      <ConfirmDialog
        open={!!deleteTarget}
        variant="warning"
        title="Delete Training Session"
        message={`Delete "${deleteTarget?.title}"? All registration records will also be removed.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminTrainingPage;
