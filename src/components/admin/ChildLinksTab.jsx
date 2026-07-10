import React, { useMemo, useState } from "react";
import ConfirmDialog from "../common/ConfirmDialog";
import { useDateFormatters } from "../../hooks/useDateFormatters";

const ChildLinksTab = ({
  pendingChildLinks,
  childLinksLoading,
  childLinksError,
  isProcessing,
  onApprove,
  onReject,
  onRefresh,
  search = "",
}) => {
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, linkId: null, label: "" });
  const { timezone } = useDateFormatters();

  const filteredChildLinks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pendingChildLinks;
    return pendingChildLinks.filter((link) =>
      [link.parent, link.student, link.parent_email, link.student_email]
        .some((f) => (f || "").toLowerCase().includes(q)),
    );
  }, [pendingChildLinks, search]);

  const handleApprove = (linkId, label) => {
    setConfirmDialog({ open: true, type: "approve", linkId, label });
  };

  const handleReject = (linkId, label) => {
    setConfirmDialog({ open: true, type: "reject", linkId, label });
  };

  const handleConfirm = () => {
    const { type, linkId } = confirmDialog;
    setConfirmDialog({ open: false, type: null, linkId: null, label: "" });
    if (type === "approve") onApprove(linkId);
    else if (type === "reject") onReject(linkId);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...(timezone ? { timeZone: timezone } : {}),
      });
    } catch (error) {
      return error;
    }
  };

  return (
    <>
      {/* Stats */}
      {!childLinksLoading && !childLinksError && pendingChildLinks.length > 0 && (
        <div className="flex justify-end mb-4 text-sm font-semibold">
          <span className="text-amber-300">
            Pending: <span className="text-white font-bold">{pendingChildLinks.length}</span>
          </span>
        </div>
      )}

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm animate-fadeIn">

        {/* Other Error State */}
        {childLinksError && !childLinksError.includes("404") && (
          <div className="p-8">
            <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
              </div>
              <h4 className="text-red-400 font-bold mb-2">
                Failed to load child link requests
              </h4>
              <p className="text-slate-400 text-sm mb-4">{childLinksError}</p>
              <button
                onClick={onRefresh}
                disabled={childLinksLoading}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i
                  className={`fas ${childLinksLoading ? "fa-spinner fa-spin" : "fa-redo"}`}
                ></i>
                {childLinksLoading ? "Retrying..." : "Try Again"}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {childLinksLoading && !childLinksError && (
          <div className="space-y-4">
            {/* Child Link Cards Skeleton */}
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm animate-pulse"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-32"></div>
                        <div className="h-3 bg-slate-700 rounded w-48"></div>
                        <div className="h-3 bg-slate-700 rounded w-40"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 bg-slate-700 rounded w-16"></div>
                      <div className="h-8 bg-slate-700 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!childLinksLoading &&
          !childLinksError &&
          pendingChildLinks.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-check-circle text-indigo-400 text-3xl"></i>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                All Caught Up!
              </h4>
              <p className="text-slate-400 text-sm text-center max-w-md">
                There are no pending child link requests at the moment. All
                parent requests have been processed.
              </p>
            </div>
          )}

        {/* No Search Matches */}
        {!childLinksLoading &&
          !childLinksError &&
          pendingChildLinks.length > 0 &&
          filteredChildLinks.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-search text-slate-500 text-xl"></i>
              </div>
              <p className="text-slate-400 text-sm">
                No child link requests match "{search}".
              </p>
            </div>
          )}

        {/* Child Links List */}
        {!childLinksLoading &&
          !childLinksError &&
          filteredChildLinks.length > 0 && (
            <div className="overflow-x-auto">
              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-800/50">
                {filteredChildLinks.map((link) => (
                  <div
                    key={link.link_id}
                    className="p-4 sm:p-6 hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-indigo-500 flex items-center justify-center shrink-0">
                        <i className="fas fa-link text-indigo-500 text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm sm:text-base mb-1">
                          {link.parent} → {link.student}
                        </p>
                        <p className="text-[9px] sm:text-xs text-slate-500 uppercase break-all">
                          Guardian ID: {link.parent_id} • Student ID: {link.student_id}
                        </p>
                        {link.parent_email && (
                          <p className="text-[9px] sm:text-xs text-slate-500 break-all mt-0.5 flex items-center gap-1">
                            <i className="fas fa-user text-[8px]"></i>
                            {link.parent_email}
                          </p>
                        )}
                        {link.student_email && (
                          <p className="text-[9px] sm:text-xs text-slate-500 break-all mt-0.5 flex items-center gap-1">
                            <i className="fas fa-user-graduate text-[8px]"></i>
                            {link.student_email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">
                          Requested {formatDate(link.requested_at)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(link.link_id, `${link.parent} → ${link.student}`)}
                          disabled={isProcessing[link.link_id] === "approving"}
                          className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 flex-1 justify-center"
                        >
                          {isProcessing[link.link_id] === "approving" ? (
                            <React.Fragment key="approving">
                              <i className="fas fa-spinner fa-spin"></i>
                              <span className="hidden sm:inline">
                                Approving...
                              </span>
                            </React.Fragment>
                          ) : (
                            <React.Fragment key="approve">
                              <i className="fas fa-check"></i>
                              <span className="hidden sm:inline">Approve</span>
                            </React.Fragment>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(link.link_id, `${link.parent} → ${link.student}`)}
                          disabled={isProcessing[link.link_id] === "rejecting"}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 flex-1 justify-center"
                        >
                          {isProcessing[link.link_id] === "rejecting" ? (
                            <React.Fragment key="rejecting">
                              <i className="fas fa-spinner fa-spin"></i>
                              <span className="hidden sm:inline">
                                Rejecting...
                              </span>
                            </React.Fragment>
                          ) : (
                            <React.Fragment key="reject">
                              <i className="fas fa-times"></i>
                              <span className="hidden sm:inline">Reject</span>
                            </React.Fragment>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="hidden lg:table w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr key="child-links-header">
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500  text-start">
                      Link Information
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 text-start">
                      Requested At
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredChildLinks.map((link) => (
                    <tr
                      key={link.link_id}
                      className="hover:bg-slate-800/30 transition group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-start gap-4">
                          <div className="w-10 h-10 rounded-xl border border-indigo-500 flex items-center justify-center">
                            <i className="fas fa-link text-indigo-500 text-sm"></i>
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-purple-400 transition">
                              {link.parent} → {link.student}
                            </p>
                            <p className="text-[9px] text-slate-500 uppercase">
                              Guardian ID: {link.parent_id} • Student ID: {link.student_id}
                            </p>
                            {link.parent_email && (
                              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <i className="fas fa-user text-[9px]"></i>
                                {link.parent_email}
                              </p>
                            )}
                            {link.student_email && (
                              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <i className="fas fa-user-graduate text-[9px]"></i>
                                {link.student_email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-slate-400 text-sm">
                          {formatDate(link.requested_at)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => handleApprove(link.link_id, `${link.parent} → ${link.student}`)}
                            disabled={
                              isProcessing[link.link_id] === "approving"
                            }
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isProcessing[link.link_id] === "approving" ? (
                              <React.Fragment key="approving">
                                <i className="fas fa-spinner fa-spin"></i>
                                Approving...
                              </React.Fragment>
                            ) : (
                              <React.Fragment key="approve">
                                <i className="fas fa-check"></i>
                                Approve
                              </React.Fragment>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(link.link_id, `${link.parent} → ${link.student}`)}
                            disabled={
                              isProcessing[link.link_id] === "rejecting"
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isProcessing[link.link_id] === "rejecting" ? (
                              <React.Fragment key="rejecting">
                                <i className="fas fa-spinner fa-spin"></i>
                                Rejecting...
                              </React.Fragment>
                            ) : (
                              <React.Fragment key="reject">
                                <i className="fas fa-times"></i>
                                Reject
                              </React.Fragment>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        variant={confirmDialog.type === "approve" ? "primary" : "danger"}
        title={confirmDialog.type === "approve" ? "Approve Child Link" : "Reject Child Link"}
        message={
          confirmDialog.type === "approve"
            ? `Approve the parent-child link for "${confirmDialog.label}"?`
            : `Reject the parent-child link for "${confirmDialog.label}"?`
        }
        confirmLabel={confirmDialog.type === "approve" ? "Approve" : "Reject"}
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog({ open: false, type: null, linkId: null, label: "" })}
      />
    </>
  );
};

export default ChildLinksTab;
