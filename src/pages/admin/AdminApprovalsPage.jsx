import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingApprovals,
  approveUser,
  rejectUser,
  fetchPendingEnrollments,
  actionEnrollment,
  selectPendingEnrollments,
  selectEnrollmentsLoading,
  selectEnrollmentsError,
  selectEnrollmentsProcessing,
} from "../../store/slices/approvalsSlice";
import {
  fetchPendingChildLinks,
  approveChildLink,
  rejectChildLink,
} from "../../store/slices/childLinksSlice";
import { toastManager } from "../../utils/toastManager";
import ApprovalsTab from "../../components/admin/ApprovalsTab";
import ChildLinksTab from "../../components/admin/ChildLinksTab";
import EnrollmentRequestsTab from "../../components/admin/EnrollmentRequestsTab";
import { showApiError } from "../../utils/apiErrorHandler";

const AdminApprovalsPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("users");

  const {
    pendingApprovals,
    isLoading: approvalsLoading,
    error: approvalsError,
    isProcessing,
  } = useSelector((state) => state.approvals);

  const {
    pendingChildLinks,
    isLoading: childLinksLoading,
    error: childLinksError,
    isProcessing: childLinksProcessing,
  } = useSelector((state) => state.childLinks);

  const pendingEnrollments = useSelector(selectPendingEnrollments);
  const enrollmentsLoading = useSelector(selectEnrollmentsLoading);
  const enrollmentsError = useSelector(selectEnrollmentsError);
  const enrollmentsProcessing = useSelector(selectEnrollmentsProcessing);

  // Fetch all three on initial load so badges show counts on every tab
  useEffect(() => {
    dispatch(fetchPendingApprovals());
    dispatch(fetchPendingChildLinks());
    dispatch(fetchPendingEnrollments());
  }, [dispatch]);

  // Re-fetch the active tab's data when switching (to pick up any changes)
  useEffect(() => {
    if (activeTab === "users") dispatch(fetchPendingApprovals());
    else if (activeTab === "childLinks") dispatch(fetchPendingChildLinks());
    else if (activeTab === "enrollments") dispatch(fetchPendingEnrollments());
  }, [dispatch, activeTab]);

  const handleApprove = async (userId) => {
    try {
      await dispatch(approveUser(userId)).unwrap();
      toastManager.success("User approved successfully");
    } catch (error) {
      showApiError(error);
    }
  };

  const handleReject = async (userId) => {
    try {
      await dispatch(rejectUser(userId)).unwrap();
      toastManager.success("User rejected successfully");
    } catch (error) {
      toastManager.error(error || "Failed to reject user");
    }
  };

  const handleRefreshApprovals = () => {
    dispatch(fetchPendingApprovals());
  };

  const handleApproveChildLink = async (linkId) => {
    try {
      await dispatch(approveChildLink(linkId)).unwrap();
      toastManager.success("Child link approved successfully");
    } catch (error) {
      showApiError(error);
    }
  };

  const handleRejectChildLink = async (linkId) => {
    try {
      await dispatch(rejectChildLink(linkId)).unwrap();
      toastManager.success("Child link rejected successfully");
    } catch (error) {
      showApiError(error);
    }
  };

  const handleRefreshChildLinks = () => {
    dispatch(fetchPendingChildLinks());
  };

  const handleApproveEnrollment = async (enrollmentId) => {
    try {
      await dispatch(actionEnrollment({ enrollmentId, action: "approve" })).unwrap();
      toastManager.success("Enrollment approved successfully");
    } catch (error) {
      showApiError(error);
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    try {
      await dispatch(actionEnrollment({ enrollmentId, action: "reject" })).unwrap();
      toastManager.success("Enrollment rejected successfully");
    } catch (error) {
      showApiError(error);
    }
  };

  const handleRefreshEnrollments = () => {
    dispatch(fetchPendingEnrollments());
  };

  const isActiveTabLoading =
    activeTab === "users" ? approvalsLoading
    : activeTab === "childLinks" ? childLinksLoading
    : enrollmentsLoading;

  const activeRefreshHandler =
    activeTab === "users" ? handleRefreshApprovals
    : activeTab === "childLinks" ? handleRefreshChildLinks
    : handleRefreshEnrollments;

  const activePendingCount =
    activeTab === "users"
      ? pendingApprovals?.length || 0
      : activeTab === "childLinks"
      ? pendingChildLinks?.length || 0
      : pendingEnrollments?.length || 0;

  // Placeholder counts until backend provides processed-today metrics.
  const approvedTodayCount = 0;
  const rejectedTodayCount = 0;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-1 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab("users")}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "users"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i className="fas fa-user-check"></i>
              User Approvals
              {pendingApprovals?.length > 0 && (
                <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("childLinks")}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "childLinks"
                    ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i className="fas fa-link"></i>
              Child Link Requests
              {pendingChildLinks?.length > 0 && (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingChildLinks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("enrollments")}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "enrollments"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i className="fas fa-user-graduate"></i>
              Enrollment Requests
              {pendingEnrollments?.length > 0 && (
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingEnrollments.length}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 flex-wrap">
          {activeTab === "users" ? (
            <div className="flex items-center gap-3 flex-wrap text-sm font-semibold">
              <span className="text-amber-300">
                Pending:{" "}
                <span className="text-white font-bold">{activePendingCount}</span>
              </span>
              <span className="text-emerald-300">
                Approved Today:{" "}
                <span className="text-white font-bold">{approvedTodayCount}</span>
              </span>
              <span className="text-rose-300">
                Rejected Today:{" "}
                <span className="text-white font-bold">{rejectedTodayCount}</span>
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-amber-300">
              Pending:{" "}
              <span className="text-white font-bold">{activePendingCount}</span>
            </span>
          )}
          <button
            onClick={activeRefreshHandler}
            className="text-white px-5 py-2 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500"
            disabled={isActiveTabLoading}
          >
            <i
              className={`fas ${isActiveTabLoading ? "fa-spinner fa-spin" : "fa-refresh"}`}
            ></i>
            {isActiveTabLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "users" && (
        <ApprovalsTab
          pendingApprovals={pendingApprovals}
          approvalsLoading={approvalsLoading}
          approvalsError={approvalsError}
          isProcessing={isProcessing}
          onApprove={handleApprove}
          onReject={handleReject}
          onRefresh={handleRefreshApprovals}
        />
      )}

      {activeTab === "childLinks" && (
        <ChildLinksTab
          pendingChildLinks={pendingChildLinks}
          childLinksLoading={childLinksLoading}
          childLinksError={childLinksError}
          isProcessing={childLinksProcessing}
          onApprove={handleApproveChildLink}
          onReject={handleRejectChildLink}
          onRefresh={handleRefreshChildLinks}
        />
      )}

      {activeTab === "enrollments" && (
        <EnrollmentRequestsTab
          enrollments={pendingEnrollments}
          loading={enrollmentsLoading}
          error={enrollmentsError}
          processing={enrollmentsProcessing}
          onApprove={handleApproveEnrollment}
          onReject={handleRejectEnrollment}
          onRefresh={handleRefreshEnrollments}
        />
      )}
    </div>
  );
};

export default AdminApprovalsPage;
