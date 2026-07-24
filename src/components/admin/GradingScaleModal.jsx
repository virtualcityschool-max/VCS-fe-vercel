import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";

const GRADE_STYLE = {
  "A+": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "A":  "bg-pink-500/15   text-pink-400   border-pink-500/20",
  "B":  "bg-blue-500/15   text-blue-400   border-blue-500/20",
  "C":  "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  "D":  "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "F":  "bg-red-500/15    text-red-400    border-red-500/20",
};

const GRADE_FIELDS = [
  { grade: "A+", field: "a_plus_min", label: "A+ minimum %" },
  { grade: "A",  field: "a_min",      label: "A minimum %"  },
  { grade: "B",  field: "b_min",      label: "B minimum %"  },
  { grade: "C",  field: "c_min",      label: "C minimum %"  },
  { grade: "D",  field: "d_min",      label: "D minimum %"  },
];

export const GradingScaleModal = ({ onClose, onUpdated }) => {
  const [original, setOriginal] = useState(null);
  const [form, setForm]         = useState({});
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    coursesService.getGradingScale()
      .then((data) => {
        const vals = {
          a_plus_min: data.a_plus_min,
          a_min:      data.a_min,
          b_min:      data.b_min,
          c_min:      data.c_min,
          d_min:      data.d_min,
        };
        setOriginal(vals);
        setForm(vals);
      })
      .catch(() => toastManager.error("Failed to load grading scale"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setErrors({});
    const aPlus = Number(form.a_plus_min);
    const a     = Number(form.a_min);
    const b     = Number(form.b_min);
    const c     = Number(form.c_min);
    const d     = Number(form.d_min);

    const newErrors = {};
    GRADE_FIELDS.forEach(({ field }) => {
      const v = Number(form[field]);
      if (v < 1 || v > 100) {
        newErrors[field] = true;
      }
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      toastManager.error("All thresholds must be between 1 and 100");
      return;
    }

    if (aPlus <= a) {
      setErrors({ a_plus_min: true, a_min: true });
      toastManager.error("A+ threshold must be higher than A threshold");
      return;
    }
    if (a <= b) {
      setErrors({ a_min: true, b_min: true });
      toastManager.error("A threshold must be higher than B threshold");
      return;
    }
    if (b <= c) {
      setErrors({ b_min: true, c_min: true });
      toastManager.error("B threshold must be higher than C threshold");
      return;
    }
    if (c <= d) {
      setErrors({ c_min: true, d_min: true });
      toastManager.error("C threshold must be higher than D threshold");
      return;
    }

    if (d < 1) {
      setErrors({ d_min: true });
      toastManager.error("D threshold must be at least 1%");
      return;
    }

    const changed = {};
    GRADE_FIELDS.forEach(({ field }) => {
      const val = Number(form[field]);
      if (original && val !== Number(original[field])) changed[field] = val;
    });
    if (!Object.keys(changed).length) { onClose(); return; }
    setSaving(true);
    try {
      await coursesService.updateGradingScale(changed);
      toastManager.success("Grading scale updated");
      if (onUpdated) onUpdated();
      onClose();
    } catch(err) {
      showApiError(err)
    } finally {
      setSaving(false);
    }
  };

  // Portal to <body> so the overlay escapes the page header's `relative z-20`
  // stacking context - otherwise the matrix's sticky z-30 "Category"/"Final
  // Results" columns paint above the blur.
  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fas fa-chart-bar text-indigo-400 text-sm" />
              Grading Scale
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Minimum percentage required for each grade</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-12 bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <>
              {GRADE_FIELDS.map(({ grade, field, label }) => (
                <div key={grade} className="flex items-center gap-3">
                  <span className={`w-10 h-10 flex items-center justify-center rounded-xl border text-sm font-black flex-shrink-0 ${GRADE_STYLE[grade]}`}>
                    {grade}
                  </span>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={form[field] ?? ""}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, [field]: e.target.value }));
                          if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
                        }}
                        className={`w-full px-3 py-2 bg-slate-800 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 tabular-nums transition-colors ${
                          errors[field] 
                            ? "border-red-500/50 focus:ring-red-500/30 focus:border-red-500" 
                            : "border-slate-700 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                        }`}
                      />
                      <span className="text-slate-500 text-sm font-medium flex-shrink-0">%</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 flex items-center justify-center rounded-xl border text-sm font-black flex-shrink-0 ${GRADE_STYLE["F"]}`}>
                  F
                </span>
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">F - Below D minimum</label>
                  <div className="px-3 py-2 bg-slate-800/40 border border-slate-700/40 rounded-xl text-slate-500 text-sm italic">
                    Below {form.d_min ?? "-"}%
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            {saving ? <><i className="fas fa-spinner fa-spin text-xs" />Saving…</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export const GradingScaleButton = ({ className = "", onUpdated }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold active:scale-95 transition-all duration-150 ${className}`}
      >
        <i className="fas fa-chart-bar text-xs"></i>
        <span className="hidden sm:inline">Grading Scale</span>
      </button>
      {open && <GradingScaleModal onClose={() => setOpen(false)} onUpdated={onUpdated} />}
    </>
  );
};
