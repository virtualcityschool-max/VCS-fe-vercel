import React from "react";

const ApprovalsTab = ({
  pendingApprovals,
  approvalsLoading,
  approvalsError,
  isProcessing,
  onApprove,
  onReject,
  onRefresh,
}) => {
  // Compute approved and rejected counts (0 for now since backend doesn't provide this data)
  const approvedToday = 0;
  const rejectedToday = 0;

  const handleApprove = (userId) => {
    onApprove(userId);
  };

  const handleReject = (userId) => {
    onReject(userId);
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">
                Pending Approvals
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {pendingApprovals?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-clock text-blue-400 text-lg"></i>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400 text-sm font-medium">
                Approved Today
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {approvedToday}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-500/20 to-rose-600/20 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-400 text-sm font-medium">
                Rejected Today
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {rejectedToday}
              </p>
            </div>
            <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-times-circle text-rose-400 text-lg"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm animate-fadeIn">
        <div className="p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h3 className="text-xl font-bold font-poppins text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-check text-indigo-400 text-sm"></i>
                </div>
                Pending User Approvals
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                Review and approve user registration requests
              </p>
            </div>
            <button
              onClick={onRefresh}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-all duration-200 flex items-center gap-2"
              disabled={approvalsLoading}
            >
              <i
                className={`fas ${approvalsLoading ? "fa-spinner fa-spin" : "fa-refresh"}`}
              ></i>
              {approvalsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

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
          <div className="space-y-4">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 bg-slate-700 rounded w-24 mb-2"></div>
                      <div className="h-8 bg-slate-700 rounded w-12"></div>
                    </div>
                    <div className="w-12 h-12 bg-slate-700 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Approval Cards Skeleton */}
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
        {!approvalsLoading &&
          !approvalsError &&
          pendingApprovals.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-check-circle text-emerald-400 text-3xl"></i>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                All Caught Up!
              </h4>
              <p className="text-slate-400 text-sm text-center max-w-md">
                There are no pending user approvals at the moment. All
                registration requests have been processed.
              </p>
            </div>
          )}

        {/* Approvals List */}
        {!approvalsLoading &&
          !approvalsError &&
          pendingApprovals.length > 0 && (
            <div className="overflow-x-auto">
              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-800/50">
                {pendingApprovals.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 sm:p-6 hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <img
                        src={
                          user.profile_image ||
                          `https://i.pravatar.cc/150?u=${user.email}`
                        }
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-700 shadow-md shrink-0"
                        alt={user.username || user.email}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm sm:text-base mb-1">
                          {user.username ||
                            user.first_name + " " + user.last_name ||
                            "Unknown User"}
                        </p>
                        <p className="text-[9px] sm:text-xs text-slate-500 uppercase break-all">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-700/50 text-slate-300 px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-xs font-black uppercase border border-slate-600">
                          {user.role || "user"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-slate-400 text-xs">
                          {user.date_joined
                            ? new Date(user.date_joined).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "Unknown"}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={isProcessing[user.id] === "approving"}
                            className="bg-emerald-600/10 text-emerald-400 px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 flex-1 justify-center"
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
                            onClick={() => handleReject(user.id)}
                            disabled={isProcessing[user.id] === "rejecting"}
                            className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 flex-1 justify-center"
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
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pendingApprovals.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-800/30 transition group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              user.profile_image ||
                              `https://i.pravatar.cc/150?u=${user.email}`
                            }
                            className="w-10 h-10 rounded-xl border border-slate-700 shadow-md"
                            alt={user.username || user.email}
                          />
                          <div>
                            <p className="font-bold text-white group-hover:text-indigo-400 transition">
                              {user.username ||
                                user.first_name + " " + user.last_name ||
                                "Unknown User"}
                            </p>
                            <p className="text-[9px] text-slate-500 uppercase">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-slate-600">
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-slate-400 text-sm">
                          {user.date_joined
                            ? new Date(user.date_joined).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "Unknown"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={isProcessing[user.id] === "approving"}
                            className="bg-emerald-600/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                            onClick={() => handleReject(user.id)}
                            disabled={isProcessing[user.id] === "rejecting"}
                            className="bg-red-600/10 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </>
  );
};

export default ApprovalsTab;
