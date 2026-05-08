import { useState } from "react";
import ConfirmDialog from "../common/ConfirmDialog";

const STATUS_BADGE = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const HireRequestsTab = ({
  requests,
  loading,
  error,
  processing,
  onApprove,
  onReject,
  onRefresh,
  statusFilter,
  onStatusFilterChange,
}) => {
  const [confirm, setConfirm] = useState({ open: false, type: null, id: null, label: "" });

  const handleConfirm = () => {
    const { type, id } = confirm;
    setConfirm({ open: false, type: null, id: null, label: "" });
    if (type === "approve") onApprove(id);
    else onReject(id);
  };

  if (loading && !requests?.length) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-800 rounded w-1/3" />
                <div className="h-2.5 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 bg-rose-500/20 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-exclamation-triangle text-rose-400 text-xl"></i>
        </div>
        <p className="text-slate-400 text-sm mb-4">{error}</p>
        <button onClick={onRefresh} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => onStatusFilterChange(s === "all" ? undefined : s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              (statusFilter ?? "all") === s
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {!requests?.length ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-check-circle text-slate-500 text-xl"></i>
          </div>
          <p className="text-white font-semibold mb-1">No requests found</p>
          <p className="text-slate-400 text-sm">No hire requests match the selected filter.</p>
        </div>
      ) : (
        requests.map((req) => {
          const isProcessing = !!processing[req.id];
          const action = processing[req.id];

          return (
            <div
              key={req.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Requester info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {req.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{req.full_name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${STATUS_BADGE[req.status] || STATUS_BADGE.pending}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{req.email}</p>
                    {req.phone && <p className="text-xs text-slate-500">{req.phone}</p>}
                    {req.message && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">"{req.message}"</p>
                    )}
                  </div>
                </div>

                {/* Teacher + meta */}
                <div className="flex-1 min-w-0 sm:border-l sm:border-slate-800 sm:pl-4">
                  <p className="text-sm font-medium text-white">
                    <i className="fas fa-chalkboard-teacher text-indigo-400 mr-1.5 text-xs"></i>
                    {req.teacher?.username || `Teacher #${req.teacher?.id}`}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Submitted: {new Date(req.created_at).toLocaleString()}
                  </p>
                  {req.reviewed_at && (
                    <p className="text-[10px] text-slate-500">
                      Reviewed by {req.reviewed_by_name} · {new Date(req.reviewed_at).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Actions — only for pending */}
                {req.status === "pending" && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setConfirm({ open: true, type: "approve", id: req.id, label: req.full_name })}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
                    >
                      {isProcessing && action === "approve" ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                      Approve
                    </button>
                    <button
                      onClick={() => setConfirm({ open: true, type: "reject", id: req.id, label: req.full_name })}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 hover:border-rose-500/60 disabled:opacity-50 text-rose-400 text-xs font-semibold rounded-xl transition"
                    >
                      {isProcessing && action === "reject" ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-times"></i>}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      <ConfirmDialog
        open={confirm.open}
        variant={confirm.type === "approve" ? "success" : "danger"}
        title={confirm.type === "approve" ? "Approve Hire Request" : "Reject Hire Request"}
        message={
          confirm.type === "approve"
            ? `Approve hire request from "${confirm.label}"?`
            : `Reject hire request from "${confirm.label}"?`
        }
        confirmLabel={confirm.type === "approve" ? "Approve" : "Reject"}
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ open: false, type: null, id: null, label: "" })}
      />
    </div>
  );
};

export default HireRequestsTab;
