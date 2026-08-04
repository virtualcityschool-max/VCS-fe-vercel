import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "../common/ConfirmDialog";
import { getStorageUrl } from "../../utils/storageUrl";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import { getDisplayName } from "../../utils/userDisplay";

const CHILD_STATUS_STYLE = {
  pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

/**
 * Compact hint that a guardian named children on the signup form. The names
 * themselves live in the preview popup so the row stays scannable.
 */
const RequestedChildrenBadge = ({ user, onPreview }) => {
  const children = user?.requested_children || [];
  if (user?.role !== "parent" || children.length === 0) return null;

  return (
    <button
      type="button"
      onClick={() => onPreview(user)}
      title="View the students this guardian requested"
      className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition text-[10px] font-black uppercase tracking-wider"
    >
      <i className="fas fa-child text-[10px]"></i>
      Requesting access to {children.length} student{children.length > 1 ? "s" : ""}
      <i className="fas fa-eye text-[10px] opacity-80"></i>
    </button>
  );
};

/** Small read-only popup listing the students a guardian asked to be linked to. */
const RequestedChildrenModal = ({ user, onClose }) => {
  // Match the app's other modals: freeze the page behind the popup
  useEffect(() => {
    if (!user) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [user]);

  if (!user) return null;
  const children = user.requested_children || [];

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <i className="fas fa-link text-indigo-400 text-sm"></i>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                {getDisplayName(user) || "Guardian"}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition shrink-0"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Children */}
        <div className="p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
            Requested students
            <span className="ml-2 text-slate-600 normal-case tracking-normal font-bold">
              {children.length} total
            </span>
          </p>

          <div className="space-y-2 max-h-[45vh] overflow-y-auto scrollbar-hide">
            {children.map((child) => (
              <div
                key={child.link_id}
                className="flex items-center gap-3 rounded-xl bg-slate-800/40 border border-slate-700/50 px-3 py-2.5"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                  <i className="fas fa-user-graduate text-slate-400 text-xs"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {child.student_name || child.student}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {child.student_email}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {child.student_roll_no != null && (
                    <span className="text-[10px] font-black text-indigo-400">
                      Roll #{child.student_roll_no}
                    </span>
                  )}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                      CHILD_STATUS_STYLE[child.status] || CHILD_STATUS_STYLE.pending
                    }`}
                  >
                    {child.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            <i className="fas fa-circle-info mr-1.5 text-indigo-400"></i>
            Approving this guardian links these students by default. Untick the
            option in the approve dialog to decide them separately.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const ApprovalsTab = ({
  pendingApprovals,
  approvalsLoading,
  approvalsError,
  rejectedApprovals = [],
  rejectedLoading = false,
  rejectedError = null,
  isProcessing,
  onApprove,
  onReject,
  onRefresh,
  search = "",
  approvedTodayCount = 0,
  rejectedTodayCount = 0,
}) => {
  const [subTab, setSubTab] = useState("pending");
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, userId: null, username: "", children: [] });
  const [deleteUser, setDeleteUser] = useState(false);
  // Guardians name their children at signup — approving the account grants
  // that access unless the admin unticks it
  const [approveChildLinks, setApproveChildLinks] = useState(true);
  // Guardian whose requested students are being previewed
  const [childrenPreview, setChildrenPreview] = useState(null);
  const { timezone } = useDateFormatters();

  const isRejectedTab = subTab === "rejected";
  const activeList = isRejectedTab ? rejectedApprovals : pendingApprovals;
  const activeLoading = isRejectedTab ? rejectedLoading : approvalsLoading;
  const activeError = isRejectedTab ? rejectedError : approvalsError;

  const filteredApprovals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeList;
    return activeList.filter((user) => {
      const name = (getDisplayName(user) || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const role = (user.role || "").toLowerCase();
      // Match the on-screen label too - the UI shows "Tutor"/"Guardian",
      // not the raw "teacher"/"parent" role values
      const roleLabel = (
        { teacher: "tutor", parent: "guardian" }[role] || role
      );
      // Guardians are also findable by the children they asked to be linked to
      const childMatch = (user.requested_children || []).some((c) =>
        [c.student_name, c.student, c.student_email, String(c.student_roll_no ?? "")]
          .some((f) => (f || "").toLowerCase().includes(q)),
      );
      return (
        name.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        roleLabel.includes(q) ||
        childMatch
      );
    });
  }, [activeList, search]);

  // Children a guardian asked to be linked to at registration — pending ones
  // are the decision the admin is making alongside the account itself
  const pendingChildren = (user) =>
    (user?.requested_children || []).filter((c) => c.status === "pending");

  const closeDialog = () => {
    setConfirmDialog({ open: false, type: null, userId: null, username: "", children: [] });
    setDeleteUser(false);
    setApproveChildLinks(true);
  };

  const handleApprove = (user) => {
    setApproveChildLinks(true);
    setConfirmDialog({
      open: true,
      type: "approve",
      userId: user.id,
      username: getDisplayName(user),
      children: pendingChildren(user),
    });
  };

  const handleReject = (user) => {
    setDeleteUser(false);
    setConfirmDialog({
      open: true,
      type: "reject",
      userId: user.id,
      username: getDisplayName(user),
      children: pendingChildren(user),
    });
  };

  const handleDelete = (user) => {
    setConfirmDialog({
      open: true,
      type: "delete",
      userId: user.id,
      username: getDisplayName(user),
      children: [],
    });
  };

  const handleConfirm = () => {
    const { type, userId } = confirmDialog;
    const shouldDelete = deleteUser;
    const withChildLinks = approveChildLinks;
    closeDialog();
    if (type === "approve") onApprove(userId, withChildLinks);
    else if (type === "reject") onReject(userId, shouldDelete);
    else if (type === "delete") onReject(userId, true, true);
  };

  const childSummary = confirmDialog.children
    .map((c) => `${c.student_name}${c.student_roll_no != null ? ` (Roll #${c.student_roll_no})` : ""}`)
    .join(", ");

  const dialogCopy = {
    approve: {
      title: "Approve User",
      message: confirmDialog.children.length
        ? `Approve "${confirmDialog.username}"? They requested access to: ${childSummary}.`
        : `Are you sure you want to approve "${confirmDialog.username}"? They will gain access to the platform.`,
      confirmLabel: "Approve",
    },
    reject: {
      title: "Reject User",
      message: confirmDialog.children.length
        ? `Reject "${confirmDialog.username}"? Their request to access ${childSummary} will be denied too. You can still approve them later from this list.`
        : `Are you sure you want to reject "${confirmDialog.username}"? This will deny their registration. You can still approve them later from this list.`,
      confirmLabel: "Reject",
    },
    delete: {
      title: "Delete User",
      message: `Permanently delete "${confirmDialog.username}"? This cannot be undone - they will be able to register again from scratch.`,
      confirmLabel: "Delete",
    },
  }[confirmDialog.type] || { title: "", message: "", confirmLabel: "" };

  return (
    <>
      {/* Sub-tabs + Stats */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-1 backdrop-blur-sm w-fit">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSubTab("pending")}
              className={`inline-flex items-center gap-1.5 capitalize sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold tracking-wider transition-all duration-200 ${
                !isRejectedTab
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i className="fas fa-hourglass-half"></i>
              Pending
              {pendingApprovals.length > 0 && (
                <span className="bg-amber-500/80 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSubTab("rejected")}
              className={`inline-flex items-center gap-1.5 capitalize sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold tracking-wider transition-all duration-200 ${
                isRejectedTab
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i className="fas fa-user-slash"></i>
              Rejected
              {rejectedApprovals.length > 0 && (
                <span className="bg-rose-500/80 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full">
                  {rejectedApprovals.length}
                </span>
              )}
            </button>
          </div>
        </div>
        {!activeLoading && !activeError && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm font-semibold">
            <span className="text-emerald-300">
              Approved Today: <span className="text-white font-bold">{approvedTodayCount}</span>
            </span>
            <span className="text-rose-300">
              Rejected Today: <span className="text-white font-bold">{rejectedTodayCount}</span>
            </span>
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm animate-fadeIn">

        {/* Other Error State */}
        {activeError && !activeError.includes("404") && (
          <div className="p-8">
            <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
              </div>
              <h4 className="text-red-400 font-bold mb-2">
                Failed to load approvals
              </h4>
              <p className="text-slate-400 text-sm mb-4">{activeError}</p>
              <button
                onClick={onRefresh}
                disabled={activeLoading}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i
                  className={`fas ${activeLoading ? "fa-spinner fa-spin" : "fa-redo"}`}
                ></i>
                {activeLoading ? "Retrying..." : "Try Again"}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {activeLoading && !activeError && (
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
        {!activeLoading &&
          !activeError &&
          activeList.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                <i className={`fas ${isRejectedTab ? "fa-user-slash" : "fa-check-circle"} text-indigo-400 text-3xl`}></i>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                {isRejectedTab ? "No Rejected Users" : "All Caught Up!"}
              </h4>
              <p className="text-slate-400 text-sm text-center max-w-md">
                {isRejectedTab
                  ? "There are no rejected registrations. Users you reject will appear here so you can approve them later or delete them permanently."
                  : "There are no pending account approvals at the moment. All registration requests have been processed."}
              </p>
            </div>
          )}

        {/* No Search Matches */}
        {!activeLoading &&
          !activeError &&
          activeList.length > 0 &&
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
        {!activeLoading &&
          !activeError &&
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

                    <RequestedChildrenBadge user={user} onPreview={setChildrenPreview} />

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
                            onClick={() => handleApprove(user)}
                            disabled={isProcessing[user.id] === "approving"}
                            title="Approve"
                            aria-label="Approve"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-1"
                          >
                            <i
                              className={`fas ${
                                isProcessing[user.id] === "approving"
                                  ? "fa-spinner fa-spin"
                                  : "fa-check"
                              }`}
                            ></i>
                          </button>
                          <button
                            onClick={() =>
                              user.is_rejected
                                ? handleDelete(user)
                                : handleReject(user)
                            }
                            disabled={isProcessing[user.id] === "rejecting"}
                            title={user.is_rejected ? "Delete permanently" : "Reject"}
                            aria-label={user.is_rejected ? "Delete permanently" : "Reject"}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-1"
                          >
                            <i
                              className={`fas ${
                                isProcessing[user.id] === "rejecting"
                                  ? "fa-spinner fa-spin"
                                  : user.is_rejected
                                    ? "fa-trash"
                                    : "fa-times"
                              }`}
                            ></i>
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
                            <RequestedChildrenBadge user={user} onPreview={setChildrenPreview} />
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
                            onClick={() => handleApprove(user)}
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
                            onClick={() =>
                              user.is_rejected
                                ? handleDelete(user)
                                : handleReject(user)
                            }
                            disabled={isProcessing[user.id] === "rejecting"}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isProcessing[user.id] === "rejecting" ? (
                              <React.Fragment key="rejecting">
                                <i className="fas fa-spinner fa-spin"></i>
                                {user.is_rejected ? "Deleting..." : "Rejecting..."}
                              </React.Fragment>
                            ) : (
                              <React.Fragment key="reject">
                                <i className={`fas ${user.is_rejected ? "fa-trash" : "fa-times"}`}></i>
                                {user.is_rejected ? "Delete" : "Reject"}
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
        title={dialogCopy.title}
        message={dialogCopy.message}
        confirmLabel={dialogCopy.confirmLabel}
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={closeDialog}
        checkboxLabel={
          confirmDialog.type === "reject"
            ? "Permanently delete this user"
            : confirmDialog.type === "approve" && confirmDialog.children.length
              ? `Also link the ${confirmDialog.children.length} student(s) they requested`
              : ""
        }
        checkboxChecked={
          confirmDialog.type === "approve" ? approveChildLinks : deleteUser
        }
        onCheckboxChange={
          confirmDialog.type === "approve" ? setApproveChildLinks : setDeleteUser
        }
      />

      <RequestedChildrenModal
        user={childrenPreview}
        onClose={() => setChildrenPreview(null)}
      />
    </>
  );
};

export default ApprovalsTab;
