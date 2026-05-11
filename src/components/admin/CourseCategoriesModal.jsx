import React, { useState, useEffect } from "react";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";

const CourseCategoriesModal = ({ onClose, onCategoriesChanged, initialEditId, initialDeleteId }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [newName, setNewName]       = useState("");
  const [editingId, setEditingId]   = useState(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [dirty, setDirty]           = useState(false);

  useEffect(() => {
    coursesService.getCategories()
      .then((data) => {
        setCategories(data);
        if (initialEditId) {
          const cat = data.find((c) => c.id === initialEditId);
          if (cat) { setEditingId(initialEditId); setEditingName(cat.name); }
        }
        if (initialDeleteId) {
          setConfirmDeleteId(initialDeleteId);
        }
      })
      .catch(() => toastManager.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }, [initialEditId, initialDeleteId]);

  const applyLocal = (updated) => {
    setCategories(updated);
    setDirty(true);
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const updated = [...categories, { name }].sort((a, b) => a.name.localeCompare(b.name));
    applyLocal(updated);
    setNewName("");
  };

  const handleEdit = (id) => {
    const name = editingName.trim();
    if (!name) return;
    const updated = categories.map((c) => (c.id === id ? { ...c, name } : c));
    applyLocal(updated);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    const updated = categories.filter((c) => c.id !== id);
    applyLocal(updated);
    setConfirmDeleteId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const synced = await coursesService.syncCategories(categories);
      setCategories(synced);
      if (onCategoriesChanged) onCategoriesChanged(synced);
      setDirty(false);
      toastManager.success("Categories saved");
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fas fa-tags text-indigo-400 text-sm" />
              Course Categories
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Add, rename, or delete course categories</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        {/* Category list */}
        <div className="px-6 py-4 space-y-2 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No categories yet. Add one below.</p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id || cat.name}
                className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-700/40"
              >
                {editingId === cat.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEdit(cat.id)}
                      autoFocus
                      className="flex-1 bg-slate-700 text-white text-sm px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <button
                      onClick={() => handleEdit(cat.id)}
                      disabled={saving}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-slate-400 hover:text-slate-300 text-xs px-2 py-1 rounded-lg hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : confirmDeleteId === cat.id ? (
                  <>
                    <i className="fas fa-exclamation-triangle text-amber-400 text-xs flex-shrink-0" />
                    <span className="flex-1 text-slate-300 text-xs">Delete "{cat.name}"?</span>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={saving}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-500/10 transition disabled:opacity-50"
                    >
                      {saving ? <i className="fas fa-spinner fa-spin" /> : "Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-slate-400 hover:text-slate-300 text-xs px-2 py-1 rounded-lg hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <i className="fas fa-tag text-indigo-400 text-xs flex-shrink-0" />
                    <span className="flex-1 text-slate-200 text-sm">{cat.name}</span>
                    <button
                      onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                      className="text-slate-500 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-700 transition"
                      title="Rename"
                    >
                      <i className="fas fa-pencil-alt" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(cat.id)}
                      className="text-slate-500 hover:text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-red-500/10 transition"
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt" />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add new */}
        <div className="px-6 pt-3 pb-4 border-t border-slate-800">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
            Add New Category
          </p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Business & Finance"
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
            >
              <i className="fas fa-plus text-xs" />
              Add
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="px-6 pb-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
          >
            {saving ? <i className="fas fa-spinner fa-spin text-xs" /> : <i className="fas fa-check text-xs" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCategoriesModal;
