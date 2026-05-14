import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyLeads } from "../../store/slices/hireSlice";
import { formatPhoneDisplay } from "../../utils/validation";

const STATUS_BADGE = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const TeacherHireLeads = () => {
  const dispatch = useDispatch();
  const { myLeads, leadsLoading, leadsError } = useSelector((state) => state.hire);
  const [statusFilter, setStatusFilter] = useState(undefined);

  useEffect(() => {
    dispatch(fetchMyLeads(statusFilter));
  }, [dispatch, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-black font-poppins text-white">Hire Request</h2>
          <p className="text-sm text-slate-400 mt-0.5">People who want to hire you as a tutor</p>
        </div>
        <button
          onClick={() => dispatch(fetchMyLeads(statusFilter))}
          disabled={leadsLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition"
        >
          <i className={`fas ${leadsLoading ? "fa-spinner fa-spin" : "fa-refresh"}`}></i>
          {leadsLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {[{ label: "All", value: undefined }, { label: "Pending", value: "pending" }, { label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" }].map((opt) => (
          <button
            key={opt.label}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              statusFilter === opt.value
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {leadsLoading && !myLeads?.length ? (
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
      ) : leadsError ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 bg-rose-500/20 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-exclamation-triangle text-rose-400 text-xl"></i>
          </div>
          <p className="text-slate-400 text-sm mb-4">{leadsError}</p>
          <button onClick={() => dispatch(fetchMyLeads(statusFilter))} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition">
            Try Again
          </button>
        </div>
      ) : !myLeads?.length ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-handshake text-slate-500 text-xl"></i>
          </div>
          <p className="text-white font-semibold mb-1">No leads yet</p>
          <p className="text-slate-400 text-sm">Hire requests from potential students will appear here.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {myLeads.map((lead) => (
          <div 
            key={lead.id} 
            className="group relative glass p-5 rounded-3xl border-slate-800/60 hover:border-indigo-500/50 hover-lift transition-all duration-500 overflow-hidden flex flex-col h-full"
          >
            {/* Subtle gradient accent on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
              {/* Card Header: Avatar & Status */}
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-500">
                  {lead.full_name?.[0]?.toUpperCase() || "?"}
                </div>
                <span className={`text-[8px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider shadow-sm ${STATUS_BADGE[lead.status] || STATUS_BADGE.pending}`}>
                  {lead.status}
                </span>
              </div>

              {/* Card Body: User Info */}
              <div className="mb-auto">
                <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-indigo-200 transition-colors truncate">{lead.full_name}</h3>
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <i className="far fa-envelope text-[9px] text-indigo-400/70" />
                    <span className="text-[10px] font-medium truncate">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <i className="fas fa-phone-alt text-[9px] text-emerald-400/70" />
                      <span className="text-[10px] font-medium">{formatPhoneDisplay(lead.phone)}</span>
                    </div>
                  )}
                </div>

                {lead.message && (
                  <div className="bg-slate-800/20 border border-slate-700/20 rounded-xl p-3 relative mb-3">
                    <p className="text-[11px] text-slate-400 leading-snug italic line-clamp-2">
                      "{lead.message}"
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer: Timestamps */}
              <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Received</span>
                  <span className="text-[10px] text-slate-300 font-bold">
                    {new Date(lead.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                
                {lead.reviewed_at && (
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Reviewed</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(lead.reviewed_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default TeacherHireLeads;
