import React, { useState, useEffect } from "react";
import { STATUS_OPTIONS, StatusPill } from "./attendanceShared";

const AttendanceEditModal = ({ record, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ status: "present", note: "" });

  useEffect(() => {
    if (record) setForm({ status: record.status || "present", note: record.note || "" });
  }, [record]);

  if (!record) return null;

  const personName = record.student_name || record.teacher_name || null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Edit Attendance</h3>
            {record.session_title && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{record.session_title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {personName && (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <i className="fas fa-user text-indigo-400 text-xs w-4 text-center" />
              <p className="text-sm font-semibold text-white">{personName}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <StatusPill
                  key={s}
                  value={s}
                  active={form.status === s}
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Note
            </label>
            <textarea
              rows={3}
              placeholder="Optional note"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><i className="fas fa-spinner fa-spin text-xs" /> Saving…</>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceEditModal;
