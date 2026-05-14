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
          <h2 className="text-xl font-black font-poppins text-white">Hire Leads</h2>
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
        <div className="space-y-3">
          {myLeads.map((lead) => (
            <div key={lead.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {lead.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{lead.full_name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${STATUS_BADGE[lead.status] || STATUS_BADGE.pending}`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{lead.email}</p>
                    {lead.phone && <p className="text-xs text-slate-500">{formatPhoneDisplay(lead.phone)}</p>}
                    {lead.message && (
                      <p className="text-xs text-slate-400 mt-1 italic">"{lead.message}"</p>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-slate-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                  {lead.reviewed_at && (
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Reviewed {new Date(lead.reviewed_at).toLocaleDateString()}
                    </p>
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
