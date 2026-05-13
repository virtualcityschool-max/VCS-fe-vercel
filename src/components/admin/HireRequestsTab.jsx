import { useState } from "react";
import ConfirmDialog from "../common/ConfirmDialog";

const STATUS_BADGE = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3.5">
    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
      <i className={`fas fa-${icon} text-slate-400 text-xs`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-white font-medium break-words whitespace-pre-wrap leading-relaxed">
        {value || <span className="text-slate-600 italic font-normal">Not provided</span>}
      </p>
    </div>
  </div>
);

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
  const [detailReq, setDetailReq] = useState(null);

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
      {/* <div className="flex flex-wrap gap-2">
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
      </div> */}

      {!requests?.length ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-check-circle text-indigo-400 text-xl"></i>
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
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* 1. Requester info (Col 1-5) */}
                <div className="lg:col-span-5 flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg shadow-indigo-500/10">
                    {req.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-black text-white truncate">{req.full_name}</p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-[0.1em] shrink-0 ${STATUS_BADGE[req.status] || STATUS_BADGE.pending}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mb-1">{req.email}</p>
                    <div className="flex items-center gap-3">
                      {req.phone && <p className="text-[10px] text-slate-500 flex items-center gap-1"><i className="fas fa-phone-alt text-[8px]"></i> {req.phone}</p>}
                    </div>
                    {req.message && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                          <i className="fas fa-quote-left text-[8px] mr-1.5 opacity-50"></i>
                          {req.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Teacher info (Col 6-9) */}
                <div className="lg:col-span-4 min-w-0 lg:border-l lg:border-slate-800 lg:pl-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <i className="fas fa-chalkboard-teacher text-indigo-400 text-[10px]"></i>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-200 truncate">
                          {req.teacher?.username || `Teacher #${req.teacher?.id}`}
                        </p>
                        {req.teacher?.email && (
                          <p className="text-[10px] text-slate-500 truncate">{req.teacher.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        <i className="far fa-clock text-[8px]"></i>
                        Submitted: {new Date(req.created_at).toLocaleString()}
                      </p>
                      {req.reviewed_at && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                          <i className="fas fa-user-check text-[8px]"></i>
                          By {req.reviewed_by_name} · {new Date(req.reviewed_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Actions (Col 10-12) */}
                <div className="lg:col-span-3 flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => setDetailReq(req)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    <i className="fas fa-eye text-[10px]"></i>
                    View
                  </button>
                  {req.status === "pending" ? (
                    <>
                      <button
                        onClick={() => setConfirm({ open: true, type: "approve", id: req.id, label: req.full_name })}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/10"
                      >
                        {isProcessing && action === "approve" ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                        Approve
                      </button>
                      <button
                        onClick={() => setConfirm({ open: true, type: "reject", id: req.id, label: req.full_name })}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 hover:border-rose-500/50 disabled:opacity-50 text-rose-400 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        {isProcessing && action === "reject" ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-times"></i>}
                        Reject
                      </button>
                    </>
                  ) : req.status === "approved" ? (
                    <div className="flex items-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-widest rounded-xl">
                      <i className="fas fa-check-circle text-[10px]"></i>
                      Approved
                    </div>
                  ) : req.status === "rejected" ? (
                    <div className="flex items-center gap-2 px-5 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-black uppercase tracking-widest rounded-xl">
                      <i className="fas fa-times-circle text-[10px]"></i>
                      Rejected
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })
      )}

      <ConfirmDialog
        open={confirm.open}
        variant={confirm.type === "approve" ? "primary" : "danger"}
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

      {/* Detail modal — wide horizontal layout */}
      {detailReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailReq(null)} />
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

            {/* Sticky header */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-2xl z-10">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                {detailReq.full_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white truncate">{detailReq.full_name}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-widest shrink-0 ${STATUS_BADGE[detailReq.status] || STATUS_BADGE.pending}`}>
                    {detailReq.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">{detailReq.email}</p>
              </div>
              <button
                onClick={() => setDetailReq(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition shrink-0"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>

            {/* Two-column body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 min-h-0">

                {/* Left — info details */}
                <div className="px-6 py-5 space-y-0 divide-y divide-slate-800/60">
                  <DetailRow icon="phone"              label="Phone"             value={detailReq.phone} />
                  <DetailRow icon="chalkboard-teacher" label="Teacher Requested" value={detailReq.teacher?.username || `Teacher #${detailReq.teacher?.id}`} />
                  {detailReq.teacher?.email && (
                    <DetailRow icon="envelope" label="Teacher Email" value={detailReq.teacher.email} />
                  )}
                  <DetailRow icon="calendar-alt"       label="Submitted"         value={detailReq.created_at ? new Date(detailReq.created_at).toLocaleString() : null} />
                  {detailReq.reviewed_at && (
                    <>
                      <DetailRow icon="user-check" label="Reviewed By" value={detailReq.reviewed_by_name} />
                      <DetailRow icon="clock"      label="Reviewed At" value={new Date(detailReq.reviewed_at).toLocaleString()} />
                    </>
                  )}
                </div>

                {/* Right — message */}
                <div className="px-6 py-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <i className="fas fa-comment-alt text-slate-400 text-xs"></i>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Message</p>
                  </div>
                  <div className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 min-h-[140px]">
                    {detailReq.message
                      ? <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words">{detailReq.message}</p>
                      : <p className="text-slate-600 italic text-sm">No message provided</p>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="px-6 py-5 border-t border-slate-800 sticky bottom-0 bg-slate-900 rounded-b-2xl">
              {detailReq.status === "pending" ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setDetailReq(null); setConfirm({ open: true, type: "approve", id: detailReq.id, label: detailReq.full_name }); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition active:scale-95"
                  >
                    <i className="fas fa-check text-xs"></i> Approve
                  </button>
                  <button
                    onClick={() => { setDetailReq(null); setConfirm({ open: true, type: "reject", id: detailReq.id, label: detailReq.full_name }); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-400 text-sm font-semibold rounded-xl transition active:scale-95"
                  >
                    <i className="fas fa-times text-xs"></i> Reject
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDetailReq(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HireRequestsTab;
