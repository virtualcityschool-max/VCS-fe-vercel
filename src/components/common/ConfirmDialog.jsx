import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const VARIANTS = {
  danger: {
    icon: "fa-exclamation-circle",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
    confirmCls: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20",
  },
  warning: {
    icon: "fa-clock",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    confirmCls: "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20",
  },
  success: {
    icon: "fa-check-circle",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    confirmCls: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20",
  },
  primary: {
    icon: "fa-info-circle",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    confirmCls: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20",
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
  const isConfirmDisabled = loading;

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[200] p-4 flex items-center justify-center animate-fadeIn">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group animate-scaleIn">
        {/* Subtle background glow */}
        <div className={`absolute -right-10 -top-10 w-24 h-24 ${v.iconBg} rounded-full blur-[40px] opacity-50`}></div>
        
        <div className="flex flex-col items-center text-center gap-6 relative z-10">
          <div className={`w-16 h-16 ${v.iconBg} rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
            <i className={`fas ${v.icon} ${v.iconColor} text-2xl`}></i>
          </div>
 
          <div className="w-full">
            <h3 className="text-xl font-black text-white mb-2 tracking-tight">{title}</h3>
            <p className="text-slate-400 text-[13px] font-medium leading-relaxed mb-6">{message}</p>
            
            {checkboxLabel && (
              <label className="flex items-center gap-3 cursor-pointer group py-3 px-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all mt-2 text-left mb-6">
                <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checkboxChecked}
                    onChange={(e) => onCheckboxChange(e.target.checked)}
                  />
                  <div className="absolute inset-0 border-2 border-slate-600 rounded-lg bg-slate-900 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600"></div>
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
                <span className="text-[11px] text-slate-300 select-none font-black uppercase tracking-widest leading-snug">
                  {checkboxLabel}
                </span>
              </label>
            )}
          </div>
 
          <div className="flex gap-3 w-full">
            {cancelLabel && (
              <button
                onClick={onCancel}
                data-modal-close
                disabled={loading}
                className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            )}
            <button
              onClick={onConfirm}
              disabled={isConfirmDisabled}
              className={`flex-1 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${v.confirmCls}`}
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
