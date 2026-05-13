import React, { useEffect } from "react";

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] p-4" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-14 h-14 ${v.iconBg} rounded-full flex items-center justify-center`}>
            <i className={`fas ${v.icon} ${v.iconColor} text-xl`}></i>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
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
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 ${v.confirmCls}`}
            >
              {loading && <i className="fas fa-spinner fa-spin text-xs"></i>}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
