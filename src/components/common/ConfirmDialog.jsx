import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const VARIANTS = {
  danger: {
    icon: "fa-trash-alt",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    confirmCls: "bg-red-600 hover:bg-red-500 text-white",
  },
  warning: {
    icon: "fa-exclamation-triangle",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    confirmCls: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  success: {
    icon: "fa-check-circle",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    confirmCls: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  primary: {
    icon: "fa-check-circle",
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
    confirmCls: "bg-indigo-600 hover:bg-indigo-500 text-white",
  },
};

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
  checkboxLabel = "",
  checkboxChecked = false,
  onCheckboxChange = () => {},
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const v = VARIANTS[variant] || VARIANTS.danger;
  const isConfirmDisabled = loading || (checkboxLabel && !checkboxChecked);

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] p-4 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-14 h-14 ${v.iconBg} rounded-full flex items-center justify-center`}>
            <i className={`fas ${v.icon} ${v.iconColor} text-xl`}></i>
          </div>

          <div className="w-full">
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">{message}</p>
            
            {checkboxLabel && (
              <label className="flex items-center gap-3 cursor-pointer group py-3 px-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-all mt-2 text-left">
                <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checkboxChecked}
                    onChange={(e) => onCheckboxChange(e.target.checked)}
                  />
                  <div className="absolute inset-0 border-2 border-slate-500 rounded-lg bg-slate-900 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600"></div>
                  <svg 
                    className="relative w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100 pointer-events-none z-10" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-slate-300 select-none font-semibold leading-snug">
                  {checkboxLabel}
                </span>
              </label>
            )}
          </div>

          <div className="flex gap-3 w-full pt-1">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isConfirmDisabled}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 ${v.confirmCls}`}
            >
              {loading && <i className="fas fa-spinner fa-spin text-xs"></i>}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
