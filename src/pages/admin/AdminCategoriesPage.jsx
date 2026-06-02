import React, { useState, useEffect } from "react";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { Card } from "../../components/ui";

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [newName, setNewName]       = useState("");
  const [editingId, setEditingId]   = useState(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    coursesService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch(() => toastManager.error("Failed to load categories"))
      .finally(() => setLoading(false));
  };

  const sync = async (newList) => {
    setSaving(true);
    try {
      const synced = await coursesService.syncCategories(newList);
      setCategories(synced);
      return true;
    } catch (err) {
      showApiError(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name || saving) return;
    const updated = [...categories, { name }].sort((a, b) => a.name.localeCompare(b.name));
    if (await sync(updated)) {
      setNewName("");
      toastManager.success("Category added");
    }
  };

  const handleEdit = async (id) => {
    const name = editingName.trim();
    if (!name || saving) return;
    const updated = categories.map((c) => (c.id === id ? { ...c, name } : c));
    if (await sync(updated)) {
      setEditingId(null);
      toastManager.success("Category renamed");
    }
  };

  const handleDelete = async (id) => {
    if (saving) return;
    const updated = categories.filter((c) => c.id !== id);
    if (await sync(updated)) {
      setConfirmDeleteId(null);
      toastManager.success("Category removed");
    }
  };

  return (
    <div className="space-y-8 mt-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10 transition duration-1000" />
            <Card variant="dark" padding="none" className="relative overflow-hidden border-slate-800/80 bg-slate-900/40 backdrop-blur-xl rounded-3xl">
              <div className="p-6 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-plus text-indigo-400" />
                  Quick Add
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="relative">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    disabled={saving}
                    placeholder="Enter category name..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-5 pr-14 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm font-medium disabled:opacity-50"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={!newName.trim() || saving}
                    className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20"
                  >
                    {saving ? <i className="fas fa-spinner fa-spin text-xs" /> : <i className="fas fa-plus text-xs" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center px-4 font-medium leading-relaxed">
                  Enter a name and press plus to instantly save to the platform.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Repository List */}
        <div className="lg:col-span-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl blur opacity-5 transition duration-1000" />
            <Card variant="dark" padding="none" className="relative border-slate-800/80 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
                      <i className="fas fa-layer-group text-xs" />
                   </div>
                   <h3 className="text-xs font-black text-white uppercase tracking-widest">
                     Course Levels Repository
                   </h3>
                </div>
                <div className="px-4 py-1.5 bg-slate-950/50 rounded-full text-[10px] font-black text-slate-500 border border-slate-800 uppercase tracking-widest">
                  {categories.length} Items
                </div>
              </div>

              <div className="min-h-[400px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-6">
                     <div className="relative">
                        <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                     </div>
                     <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em]">Loading Repository...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-6 text-center px-10">
                    <div className="w-24 h-24 bg-slate-950/50 rounded-full flex items-center justify-center border border-slate-800 relative">
                       <i className="fas fa-tags text-slate-800 text-4xl" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-white font-black text-xl tracking-tight">Repository Empty</h4>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">
                        Add categories using the form on the left to start organizing your courses.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/30">
                    {categories.map((cat, index) => (
                      <div
                        key={cat.id || `temp-${index}`}
                        className="group flex items-center gap-6 px-8 py-5 hover:bg-white/[0.01] transition-all duration-300"
                      >
                        {/* Status Marker */}
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-indigo-500 transition-all duration-500" />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {editingId === cat.id ? (
                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                              <input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleEdit(cat.id)}
                                disabled={saving}
                                autoFocus
                                className="w-full bg-slate-950 border border-indigo-500/50 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-bold disabled:opacity-50"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEdit(cat.id)}
                                  disabled={saving}
                                  className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                  {saving ? <i className="fas fa-spinner fa-spin text-xs" /> : <i className="fas fa-check text-xs" />}
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  disabled={saving}
                                  className="w-10 h-10 flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
                                >
                                  <i className="fas fa-times text-xs" />
                                </button>
                              </div>
                            </div>
                          ) : confirmDeleteId === cat.id ? (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-red-500/5 border border-red-500/20 px-5 py-3 rounded-2xl animate-in zoom-in-95 duration-200">
                              <div className="flex items-center gap-3">
                                 <i className="fas fa-exclamation-triangle text-red-500 text-xs" />
                                 <span className="text-xs text-red-400 font-black uppercase tracking-widest break-all">Delete "{cat.name}"?</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <button
                                  onClick={() => handleDelete(cat.id)}
                                  disabled={saving}
                                  className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                                >
                                  {saving ? "..." : "Delete"}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  disabled={saving}
                                  className="text-[10px] text-slate-500 hover:text-white font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                               <span className="text-slate-200 font-bold group-hover:text-white transition-colors truncate text-sm">
                                 {cat.name}
                               </span>
                            </div>
                          )}
                        </div>

                        {/* Actions — ALWAYS VISIBLE */}
                        {editingId !== cat.id && confirmDeleteId !== cat.id && (
                          <div className="flex items-center gap-2 transition-all duration-300">
                            <button
                              onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                              disabled={saving}
                              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all disabled:opacity-50"
                              title="Edit"
                            >
                              <i className="fas fa-pencil-alt text-xs" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(cat.id)}
                              disabled={saving}
                              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                              title="Delete"
                            >
                              <i className="fas fa-trash-alt text-xs" />
                            </button>
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
    </div>
  );
};

export default AdminCategoriesPage;
