import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../../store/slices/testimonialsSlice";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { Card } from "../../components/ui";

const EMPTY_FORM = { quote: "", name: "", role: "", published: true };

const AdminTestimonialsPage = () => {
  const dispatch = useDispatch();
  const { testimonials, isLoading, saving } = useSelector((state) => state.testimonials);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchTestimonials());
  }, [dispatch]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setForm({ quote: t.quote || "", name: t.name || "", role: t.role || "", published: !!t.published });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.quote.trim() || !form.name.trim() || !form.role.trim() || saving) return;
    try {
      if (editingId) {
        await dispatch(updateTestimonial({ id: editingId, data: form })).unwrap();
        toastManager.success("Testimonial updated");
      } else {
        await dispatch(createTestimonial(form)).unwrap();
        toastManager.success("Testimonial added");
      }
      resetForm();
    } catch (err) {
      showApiError(err);
    }
  };

  const handleTogglePublished = async (t) => {
    try {
      await dispatch(updateTestimonial({ id: t.id, data: { published: !t.published } })).unwrap();
      toastManager.success(t.published ? "Hidden from homepage" : "Now visible on homepage");
    } catch (err) {
      showApiError(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteTestimonial(id)).unwrap();
      setConfirmDeleteId(null);
      toastManager.success("Testimonial removed");
    } catch (err) {
      showApiError(err);
    }
  };

  const inputCls =
    "w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm font-medium disabled:opacity-50";

  return (
    <div className="space-y-8 mt-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Add / Edit form */}
        <div className="lg:col-span-4 space-y-6">
          <Card
            variant="dark"
            padding="none"
            className="relative overflow-hidden border-slate-800/80 bg-slate-900/40 backdrop-blur-xl rounded-3xl"
          >
            <div className="p-6 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <i className={`fas ${editingId ? "fa-pencil-alt" : "fa-plus"} text-indigo-400`} />
                {editingId ? "Edit Testimonial" : "Add Testimonial"}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[10px] text-slate-500 hover:text-white font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Quote
                </label>
                <textarea
                  value={form.quote}
                  onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                  disabled={saving}
                  rows={4}
                  placeholder="What they actually said - paraphrase for clarity, keep the substance real."
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  disabled={saving}
                  placeholder="Zainab R."
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Role
                </label>
                <input
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  disabled={saving}
                  placeholder="O Level Student, Dubai"
                  className={inputCls}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  disabled={saving}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-300">Visible on homepage</span>
              </label>
              <button
                type="submit"
                disabled={!form.quote.trim() || !form.name.trim() || !form.role.trim() || saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl py-3 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <i className="fas fa-spinner fa-spin text-xs" /> Saving...
                  </span>
                ) : editingId ? (
                  "Save Changes"
                ) : (
                  "Add Testimonial"
                )}
              </button>
            </form>
          </Card>
        </div>

        {/* Right: List */}
        <div className="lg:col-span-8">
          <Card
            variant="dark"
            padding="none"
            className="relative border-slate-800/80 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
                  <i className="fas fa-quote-left text-xs" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Testimonials</h3>
              </div>
              <div className="px-4 py-1.5 bg-slate-950/50 rounded-full text-[10px] font-black text-slate-500 border border-slate-800 uppercase tracking-widest">
                {testimonials.length} Items
              </div>
            </div>

            <div className="min-h-[300px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em]">Loading...</p>
                </div>
              ) : testimonials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 text-center px-10">
                  <div className="w-24 h-24 bg-slate-950/50 rounded-full flex items-center justify-center border border-slate-800">
                    <i className="fas fa-quote-left text-slate-800 text-4xl" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-black text-xl tracking-tight">No testimonials yet</h4>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">
                      Add one using the form on the left. Only published ones show on the homepage.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/30">
                  {testimonials.map((t) => (
                    <div key={t.id} className="group px-6 py-4 hover:bg-white/[0.01] transition-all duration-300">
                      {confirmDeleteId === t.id ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-red-500/5 border border-red-500/20 px-5 py-3 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-exclamation-triangle text-red-500 text-xs" />
                            <span className="text-xs text-red-400 font-black uppercase tracking-widest">
                              Delete this testimonial?
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl font-black uppercase tracking-widest transition-all"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] text-slate-500 hover:text-white font-black uppercase tracking-widest transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-300 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                            <p className="mt-2 text-white font-bold text-xs">
                              {t.name}{" "}
                              <span className="text-slate-500 font-medium">- {t.role}</span>
                            </p>
                            <span
                              className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                t.published
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-slate-800 text-slate-500 border border-slate-700"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${t.published ? "bg-emerald-400" : "bg-slate-600"}`} />
                              {t.published ? "Live on homepage" : "Hidden"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleTogglePublished(t)}
                              title={t.published ? "Hide from homepage" : "Show on homepage"}
                              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                            >
                              <i className={`fas ${t.published ? "fa-eye-slash" : "fa-eye"} text-xs`} />
                            </button>
                            <button
                              onClick={() => startEdit(t)}
                              title="Edit"
                              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                            >
                              <i className="fas fa-pencil-alt text-xs" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(t.id)}
                              title="Delete"
                              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                              <i className="fas fa-trash-alt text-xs" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminTestimonialsPage;
