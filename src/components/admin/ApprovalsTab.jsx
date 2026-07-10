import React, { useMemo, useState } from "react";
import ConfirmDialog from "../common/ConfirmDialog";
import { getStorageUrl } from "../../utils/storageUrl";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import { getDisplayName } from "../../utils/userDisplay";

const ApprovalsTab = ({
  pendingApprovals,
  approvalsLoading,
  approvalsError,
  isProcessing,
  onApprove,
  onReject,
  onRefresh,
  search = "",
  approvedTodayCount = 0,
  rejectedTodayCount = 0,
}) => {
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, userId: null, username: "" });
  const [deleteUser, setDeleteUser] = useState(false);
  const { timezone } = useDateFormatters();

  const filteredApprovals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pendingApprovals;
    return pendingApprovals.filter((user) => {
      const name = (getDisplayName(user) || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const role = (user.role || "").toLowerCase();
      // Match the on-screen label too — the UI shows "Tutor"/"Guardian",
      // not the raw "teacher"/"parent" role values
      const roleLabel = (
        { teacher: "tutor", parent: "guardian" }[role] || role
      );
      return (
        name.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        roleLabel.includes(q)
      );
    });
  }, [pendingApprovals, search]);

  const handleApprove = (userId, username) => {
    setConfirmDialog({ open: true, type: "approve", userId, username });
  };

  const handleReject = (userId, username) => {
    setDeleteUser(false);
    setConfirmDialog({ open: true, type: "reject", userId, username });
  };

  const handleConfirm = () => {
    const { type, userId } = confirmDialog;
    const shouldDelete = deleteUser;
    setConfirmDialog({ open: false, type: null, userId: null, username: "" });
    setDeleteUser(false);
    if (type === "approve") onApprove(userId);
    else if (type === "reject") onReject(userId, shouldDelete);
  };

  return (
    <>
      {/* Stats */}
      {!approvalsLoading && !approvalsError && pendingApprovals.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap justify-end mb-4 text-sm font-semibold">
          <span className="text-amber-300">
            Pending: <span className="text-white font-bold">{pendingApprovals.length}</span>
          </span>
          <span className="text-emerald-300">
            Approved Today: <span className="text-white font-bold">{approvedTodayCount}</span>
          </span>
          <span className="text-rose-300">
            Rejected Today: <span className="text-white font-bold">{rejectedTodayCount}</span>
          </span>
        </div>
      )}

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm animate-fadeIn">

        {/* Other Error State */}
        {approvalsError && !approvalsError.includes("404") && (
          <div className="p-8">
            <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
              </div>
              <h4 className="text-red-400 font-bold mb-2">
                Failed to load approvals
              </h4>
              <p className="text-slate-400 text-sm mb-4">{approvalsError}</p>
              <button
                onClick={onRefresh}
                disabled={approvalsLoading}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i
                  className={`fas ${approvalsLoading ? "fa-spinner fa-spin" : "fa-redo"}`}
                ></i>
                {approvalsLoading ? "Retrying..." : "Try Again"}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {approvalsLoading && !approvalsError && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, index) => (
                  <tr key={index} className="border-b border-slate-800 animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-700 rounded w-32"></div>
                          <div className="h-3 bg-slate-700 rounded w-48"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-slate-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-slate-700 rounded w-36"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 bg-slate-700 rounded w-20"></div>
                        <div className="h-8 bg-slate-700 rounded w-16"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!approvalsLoading &&
          !approvalsError &&
          pendingApprovals.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-check-circle text-indigo-400 text-3xl"></i>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                All Caught Up!
              </h4>
              <p className="text-slate-400 text-sm text-center max-w-md">
                There are no pending account approvals at the moment. All
                registration requests have been processed.
              </p>
            </div>
          )}

        {/* No Search Matches */}
        {!approvalsLoading &&
          !approvalsError &&
          pendingApprovals.length > 0 &&
          filteredApprovals.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-search text-slate-500 text-xl"></i>
              </div>
              <p className="text-slate-400 text-sm">
                No approvals match "{search}".
              </p>
            </div>
          )}

        {/* Approvals List */}
        {!approvalsLoading &&
          !approvalsError &&
          filteredApprovals.length > 0 && (
            <div className="overflow-x-auto">
              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-800/50">
                {filteredApprovals.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 sm:p-6 hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      {user.profile_image?
                      <img
                        src={
                          getStorageUrl(user.profile_image)
                        }
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-700 shadow-md shrink-0"
                        alt={getDisplayName(user) || user.email}
                      />:
                       <i className="fas fa-user text-white"></i>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm sm:text-base mb-1">
                          {getDisplayName(user) || "Unknown User"}
                        </p>
                        <p className="text-[9px] sm:text-xs text-slate-500 break-all">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-700/50 text-slate-300 px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-xs font-black uppercase border border-slate-600">
                          {{ teacher: "Tutor", parent: "Guardian" }[user.role] || user.role || "user"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-slate-400 text-xs">
                          {user.date_joined
                            ? new Date(user.date_joined).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", ...(timezone ? { timeZone: timezone } : {}) })
                            : "Unknown"}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(user.id, getDisplayName(user))}
                            disabled={isProcessing[user.id] === "approving"}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 flex-1 justify-center"
                          >
                            {isProcessing[user.id] === "approving" ? (
                              <React.Fragment key="approving">
                                <i className="fas fa-spinner fa-spin"></i>
                                <span className="hidden sm:inline">
                                  Approving...
                                </span>
                              </React.Fragment>
                            ) : (
                              <React.Fragment key="approve">
                                <i className="fas fa-check"></i>
                                <span className="hidden sm:inline">
                                  Approve
                                </span>
                              </React.Fragment>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(user.id, getDisplayName(user))}
                            disabled={isProcessing[user.id] === "rejecting"}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 flex-1 justify-center"
                          >
                            {isProcessing[user.id] === "rejecting" ? (
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
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="hidden lg:table w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr key="approvals-header">
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">
                      User Information
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">
                      Role
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">
                      Registration Date
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredApprovals.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-800/30 transition group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">

                          {user.profile_image?
                          <img
                            src={
                              getStorageUrl(user.profile_image)
                            }
                            className="w-10 h-10 rounded-xl border border-slate-700 shadow-md"
                            alt={getDisplayName(user) || user.email}
                          />:
                           <i className="fas fa-user text-white"></i>
                          }
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-indigo-400 transition">
                              {getDisplayName(user) || "Unknown User"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-slate-600">
                          {{ teacher: "Tutor", parent: "Guardian" }[user.role] || user.role || "user"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-slate-400 text-sm">
                          {user.date_joined
                            ? new Date(user.date_joined).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", ...(timezone ? { timeZone: timezone } : {}) })
                            : "Unknown"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => handleApprove(user.id, getDisplayName(user))}
                            disabled={isProcessing[user.id] === "approving"}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isProcessing[user.id] === "approving" ? (
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
                            onClick={() => handleReject(user.id, getDisplayName(user))}
                            disabled={isProcessing[user.id] === "rejecting"}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isProcessing[user.id] === "rejecting" ? (
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
        title={confirmDialog.type === "approve" ? "Approve User" : "Reject User"}
        message={
          confirmDialog.type === "approve"
            ? `Are you sure you want to approve "${confirmDialog.username}"? They will gain access to the platform.`
            : `Are you sure you want to reject "${confirmDialog.username}"? This will deny their registration.`
        }
        confirmLabel={confirmDialog.type === "approve" ? "Approve" : "Reject"}
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmDialog({ open: false, type: null, userId: null, username: "" });
          setDeleteUser(false);
        }}
        checkboxLabel={confirmDialog.type === "reject" ? "Permanently delete this user" : ""}
        checkboxChecked={deleteUser}
        onCheckboxChange={setDeleteUser}
      />
    </>
  );
};

export default ApprovalsTab;
