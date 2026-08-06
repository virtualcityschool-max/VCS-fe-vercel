import React, { useEffect, useMemo, useRef, useState } from "react";
import { adminService } from "../../services/adminService";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { TAG_COLORS, TAG_DOTS, tagStyleFor } from "../../utils/tagColors";
import ConfirmDialog from "../common/ConfirmDialog";

/**
 * Student labels, in the spirit of Gmail labels: an admin creates a label once
 * and then attaches it to any number of students, which makes those students
 * findable by typing the label name into the user search.
 */

/** Small read-only label pill shown on a user row. */
export const TagChip = ({ tag, onClick }) => (
  <span
    onClick={onClick}
    title={onClick ? `Filter by "${tag.name}"` : tag.name}
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold max-w-[140px] ${tagStyleFor(
      tag.color,
    )} ${onClick ? "hover:brightness-125 transition" : ""}`}
  >
    <i className="fas fa-tag text-[7px] shrink-0" />
    <span className="truncate">{tag.name}</span>
  </span>
);

/**
 * Labels filter for the users list, built like the course-level dropdown on the
 * courses page: pick a label to filter by, rename or delete one in place, or
 * add a new one from the bottom of the same menu.
 */
export const LabelFilterDropdown = ({
  tags,
  value,
  onChange,
  onAdd,
  onEdit,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  const activeTag = tags.find((t) => String(t.id) === String(value));

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Matches the SearchInput / FilterSelect trigger exactly so every
          control in the filter row lines up at the same height */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={activeTag ? activeTag.name : "All Labels"}
        className={`w-full flex items-center justify-between gap-2
          bg-slate-900 border rounded-xl pl-3.5 pr-3 py-2.5
          text-sm font-medium transition-all duration-150 cursor-pointer
          ${
            open
              ? "border-indigo-500/60 ring-2 ring-indigo-500/15"
              : "border-slate-700/70 hover:border-slate-600 hover:bg-slate-800/70"
          }`}
      >
        <span className="flex items-center gap-1.5 min-w-0 truncate text-white">
          <i className="fas fa-tags text-xs text-indigo-400 shrink-0" />
          <span className="truncate">{activeTag ? activeTag.name : "All Labels"}</span>
        </span>
        <i
          className={`fas fa-chevron-down text-slate-500 text-[10px] flex-shrink-0 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Menu matches the trigger width exactly - long label names truncate
          inside it rather than widening the control */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 w-full overflow-hidden">
          {/* All Labels - fixed, not scrolled */}
          <button
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-2.5 text-sm transition flex items-center gap-2 ${
              !value
                ? "text-indigo-400 bg-indigo-500/10"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <i className="fas fa-border-all text-xs opacity-60" />
            All Labels
          </button>

          {tags.length > 0 && <div className="border-t border-slate-800" />}

          <div className="max-h-48 overflow-y-auto overscroll-contain">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="relative flex items-center px-2 py-1.5 hover:bg-slate-800 group"
              >
                <button
                  onClick={() => {
                    onChange(String(tag.id));
                    setOpen(false);
                  }}
                  title={tag.name}
                  className={`flex-1 min-w-0 text-left text-sm px-1.5 py-1 rounded-lg transition truncate ${
                    String(tag.id) === String(value)
                      ? "text-indigo-400 font-semibold"
                      : "text-slate-300 group-hover:text-white"
                  }`}
                >
                  {tag.name}
                </button>
                {/* Only rename lives here - it floats over the end of the row
                    so the name keeps the full width for filtering. Deleting a
                    label is done from the manage dialog the pencil opens.
                    Always visible on mobile, hover-only on desktop; the fade
                    keeps the icon legible over whatever text sits under. */}
                <div
                  className="absolute inset-y-0 right-1 flex items-center pl-6
                    bg-gradient-to-r from-transparent via-slate-900 to-slate-900
                    group-hover:via-slate-800 group-hover:to-slate-800
                    opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <button
                    onClick={() => {
                      setOpen(false);
                      onEdit(tag);
                    }}
                    title="Rename or delete"
                    className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-slate-700 transition text-xs shrink-0"
                  >
                    <i className="fas fa-pencil-alt" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800" />

          {/* Add Label - fixed at bottom */}
          <button
            onClick={() => {
              setOpen(false);
              onAdd();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition font-semibold"
          >
            <i className="fas fa-plus text-xs" />
            Add Label
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Modal for attaching labels to one student. The single text box both filters
 * the existing labels and offers to create whatever you typed, so adding a new
 * label never means leaving the dialog.
 */
export const StudentTagsModal = ({
  student,
  tags,
  onClose,
  onSaved,
  onTagsChanged,
  onStudentsStale,
  initialEdit = null,
  initialDelete = null,
}) => {
  // Without a student the dialog is just the label library: create and delete,
  // but nothing to attach them to.
  const manageOnly = !student;
  const [selected, setSelected] = useState(() => (student?.tags || []).map((t) => t.id));
  const [query, setQuery] = useState("");
  const [newColor, setNewColor] = useState("indigo");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(initialDelete);
  // { id, name, color } while a label is being renamed in place
  const [editing, setEditing] = useState(
    initialEdit
      ? { id: initialEdit.id, name: initialEdit.name, color: initialEdit.color }
      : null,
  );
  const [savingEdit, setSavingEdit] = useState(false);

  const trimmed = query.trim();

  const visible = useMemo(() => {
    const q = trimmed.toLowerCase();
    return q ? tags.filter((t) => t.name.toLowerCase().includes(q)) : tags;
  }, [tags, trimmed]);

  // Offer creation only when the typed name isn't already a label
  const canCreate =
    trimmed.length > 0 && !tags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleCreate = async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    try {
      const tag = await adminService.createStudentTag({ name: trimmed, color: newColor });
      onTagsChanged();
      if (!manageOnly) setSelected((prev) => [...prev, tag.id]); // starts attached
      setQuery("");
      toastManager.success(`Label "${tag.name}" created`);
    } catch (error) {
      showApiError(error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    const tag = deleteTarget;
    setDeleteTarget(null);
    try {
      await adminService.deleteStudentTag(tag.id);
      setSelected((prev) => prev.filter((id) => id !== tag.id));
      onTagsChanged();
      onStudentsStale?.(); // the label vanishes from every row that carried it
      toastManager.success(`Label "${tag.name}" deleted`);
    } catch (error) {
      showApiError(error);
    }
  };

  // Rename / recolour an existing label, editing in place on its own row.
  const startEditing = (tag) => setEditing({ id: tag.id, name: tag.name, color: tag.color });

  const handleUpdate = async () => {
    const name = editing.name.trim();
    if (!name) {
      toastManager.error("Label name can't be empty");
      return;
    }
    setSavingEdit(true);
    try {
      await adminService.updateStudentTag(editing.id, {
        name,
        color: editing.color,
      });
      onTagsChanged();
      // Chips already rendered on the user rows still show the old name
      onStudentsStale?.();
      setEditing(null);
      toastManager.success("Label updated");
    } catch (error) {
      showApiError(error);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await adminService.setUserTags(student.id, selected);
      onSaved(student.id, saved);
      toastManager.success("Labels updated");
      onClose();
    } catch (error) {
      showApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-5 sm:p-7 w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-5 pb-4 border-b border-white/5">
            <div className="min-w-0">
              <h3 className="text-lg font-black text-white tracking-tight">
                {manageOnly ? "Labels" : "Manage Labels"}
              </h3>
              <p className="text-slate-500 text-[12px] font-medium mt-0.5 truncate">
                {manageOnly
                  ? "Create and remove the labels available to students"
                  : `${student.name}${student.roll_no != null ? ` (Roll #${student.roll_no})` : ""}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all shrink-0"
            >
              <i className="fas fa-times text-lg" />
            </button>
          </div>

          {/* Filter / create box */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder="Find a label, or type a new name to create one..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 transition"
          />

          {/* Create row */}
          {canCreate && (
            <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/70">
              <div className="flex items-center gap-2 mb-2.5">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    title={c}
                    className={`w-5 h-5 rounded-full ${TAG_DOTS[c]} transition ${
                      newColor === c
                        ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                <i className={`fas ${creating ? "fa-spinner fa-spin" : "fa-plus"} text-[10px]`} />
                Create label "{trimmed}"
              </button>
            </div>
          )}

          {/* Label list */}
          <div className="flex-1 overflow-y-auto mt-4 -mx-1 px-1 space-y-1.5">
            {visible.length === 0 && !canCreate ? (
              <p className="text-slate-500 text-sm text-center py-8">
                No labels yet. Type a name above to create your first one.
              </p>
            ) : (
              visible.map((tag) => {
                const checked = !manageOnly && selected.includes(tag.id);
                const summary = (
                  <>
                    {!manageOnly && (
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                          checked
                            ? "bg-indigo-500 border-indigo-500"
                            : "border-slate-600"
                        }`}
                      >
                        {checked && <i className="fas fa-check text-white text-[8px]" />}
                      </span>
                    )}
                    <TagChip tag={tag} />
                  </>
                );
                // Renaming takes over the whole row so the name field has room
                if (editing?.id === tag.id) {
                  return (
                    <div
                      key={tag.id}
                      className="px-3 py-2.5 rounded-xl bg-slate-800/70 border border-indigo-500/30"
                    >
                      <input
                        value={editing.name}
                        autoFocus
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate();
                          if (e.key === "Escape") setEditing(null);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/60"
                      />
                      <div className="flex items-center gap-2 mt-2.5">
                        {TAG_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setEditing({ ...editing, color: c })}
                            title={c}
                            className={`w-5 h-5 rounded-full ${TAG_DOTS[c]} transition ${
                              editing.color === c
                                ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800"
                                : "opacity-60 hover:opacity-100"
                            }`}
                          />
                        ))}
                        <div className="ml-auto flex items-center gap-1.5">
                          <button
                            onClick={() => setEditing(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-700/70 hover:bg-slate-700 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdate}
                            disabled={savingEdit}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50"
                          >
                            {savingEdit ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={tag.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition ${
                      checked
                        ? "bg-indigo-500/10 border-indigo-500/30"
                        : "bg-slate-800/40 border-transparent hover:bg-slate-800/70"
                    }`}
                  >
                    {manageOnly ? (
                      <div className="flex items-center gap-3 flex-1 min-w-0">{summary}</div>
                    ) : (
                      <button
                        onClick={() => toggle(tag.id)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        {summary}
                      </button>
                    )}
                    <button
                      onClick={() => startEditing(tag)}
                      title="Rename or recolour this label"
                      className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10 transition"
                    >
                      <i className="fas fa-pen text-[10px]" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(tag)}
                      title="Delete this label everywhere"
                      className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <i className="fas fa-trash text-[10px]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-white/5">
            {manageOnly ? (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition"
              >
                Done
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <i className={`fas ${saving ? "fa-spinner fa-spin" : "fa-check"} text-xs`} />
                  {saving ? "Saving..." : "Save Labels"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title="Delete Label"
        message={`Delete "${deleteTarget?.name}"? It will be removed from every student that carries it. The students themselves are not affected.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};
