import React, { useEffect, useState } from "react";
import { PageHeader, SegmentedTabs } from "../../components/admin/ui";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingApprovals,
  fetchRejectedApprovals,
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
import {
  // fetchAdminHireRequests,
  actionHireRequest,
} from "../../store/slices/hireSlice";
import {
  fetchFreeAccessRequests,
  resolveFreeAccessRequest,
} from "../../store/slices/freeAccessSlice";
import { toastManager } from "../../utils/toastManager";
import ApprovalsTab from "../../components/admin/ApprovalsTab";
import ChildLinksTab from "../../components/admin/ChildLinksTab";
import EnrollmentRequestsTab from "../../components/admin/EnrollmentRequestsTab";
import FreeAccessRequestsTab from "../../components/admin/FreeAccessRequestsTab";
import HireRequestsTab from "../../components/admin/HireRequestsTab";
import { showApiError } from "../../utils/apiErrorHandler";
import { adminService } from "../../services/adminService";
import { SearchInput } from "../../components/ui";

const AdminApprovalsPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("users");
  // Enrollment tab has two request types: standard (paid/normal) and free-access.
  const [enrollmentSubTab, setEnrollmentSubTab] = useState("standard");

  // Search is independent per tab
  const [usersSearch, setUsersSearch] = useState("");
  const [enrollmentsSearch, setEnrollmentsSearch] = useState("");
  const [childLinksSearch, setChildLinksSearch] = useState("");
  const [freeAccessSearch, setFreeAccessSearch] = useState("");

  const {
    pendingApprovals,
    isLoading: approvalsLoading,
    error: approvalsError,
    isProcessing,
    rejectedApprovals,
    rejectedLoading,
    rejectedError,
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

  const {
    adminRequests: hireRequests,
    adminLoading: hireLoading,
    adminError: hireError,
    adminProcessing: hireProcessing,
  } = useSelector((state) => state.hire);
  const [hireStatusFilter, setHireStatusFilter] = useState(undefined);

  const {
    requests: freeAccessRequests,
    loading: freeAccessLoading,
    error: freeAccessError,
    processingId: freeAccessProcessing,
  } = useSelector((state) => state.freeAccess);
  const freeAccessPendingCount = (freeAccessRequests || []).filter(
    (r) => r.status === "pending",
  ).length;

  // Re-fetch all 4 APIs every time this page is visited.
  // AdminLayout only fetches once on mount; navigating away and back
  // would otherwise show stale data.
  useEffect(() => {
    dispatch(fetchPendingApprovals());
    dispatch(fetchRejectedApprovals());
    dispatch(fetchPendingChildLinks());
    dispatch(fetchPendingEnrollments());
    dispatch(fetchFreeAccessRequests({ status: "pending" }));
    // dispatch(fetchAdminHireRequests(hireStatusFilter));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (userId, approveChildLinks = true) => {
    try {
      const { result } = await dispatch(
        approveUser({ userId, approveChildLinks }),
      ).unwrap();
      // Approving a guardian can resolve the child links they requested at
      // signup, so that tab's list needs a refresh too
      dispatch(fetchPendingChildLinks());
      toastManager.success(result?.message || "User approved successfully");
    } catch (error) {
      showApiError(error);
    }
  };

  const handleReject = async (userId, shouldDeleteUser, skipReject = false) => {
    try {
      if (!skipReject) {
        // Already-rejected users skip this so they don't get a second
        // rejection email before deletion
        await dispatch(rejectUser(userId)).unwrap();
      }
      if (shouldDeleteUser) {
        await adminService.purgeUser(userId);
        dispatch(fetchPendingApprovals());
        dispatch(fetchRejectedApprovals());
        toastManager.success(
          skipReject ? "User permanently deleted" : "User rejected and permanently deleted"
        );
      } else {
        toastManager.success("User rejected successfully");
      }
      // A rejected guardian's link requests are no longer actionable
      dispatch(fetchPendingChildLinks());
    } catch (error) {
      showApiError(error);
    }
  };

  const handleRefreshApprovals = () => {
    dispatch(fetchPendingApprovals());
    dispatch(fetchRejectedApprovals());
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
      await dispatch(
        actionEnrollment({ enrollmentId, action: "approve" }),
      ).unwrap();
      toastManager.success("Enrollment approved successfully");
    } catch (error) {
      showApiError(error);
    }
  };

  const handleRejectEnrollment = async (enrollmentId, shouldDeleteUser, studentId) => {
    try {
      await dispatch(
        actionEnrollment({ enrollmentId, action: "reject" }),
      ).unwrap();
      toastManager.success("Enrollment rejected successfully");
      if (shouldDeleteUser && studentId) {
        await adminService.purgeUser(studentId);
        toastManager.success("User permanently deleted");
      }
    } catch (error) {
      showApiError(error);
    }
  };

  const handleRefreshEnrollments = () => {
    dispatch(fetchPendingEnrollments());
  };

  const handleApproveHireRequest = async (id) => {
    try {
      await dispatch(actionHireRequest({ id, action: "approve" })).unwrap();
      toastManager.success("Hire request approved");
    } catch (error) {
      showApiError(error);
    }
  };

  const handleRejectHireRequest = async (id) => {
    try {
      await dispatch(actionHireRequest({ id, action: "reject" })).unwrap();
      toastManager.success("Hire request rejected");
    } catch (error) {
      showApiError(error);
    }
  };

  const handleRefreshHireRequests = () => {
    // dispatch(fetchAdminHireRequests(hireStatusFilter));
  };

  const handleRefreshFreeAccess = () => {
    dispatch(fetchFreeAccessRequests({ status: "pending" }));
  };

  // Returns true on success so the review modal can close itself.
  const handleResolveFreeAccess = async (id, decisions, note) => {
    try {
      await dispatch(resolveFreeAccessRequest({ id, decisions, note })).unwrap();
      toastManager.success("Decision applied and applicant notified.");
      return true;
    } catch (error) {
      showApiError(error);
      return false;
    }
  };

  const isActiveTabLoading =
    activeTab === "users"
      ? approvalsLoading
      : activeTab === "childLinks"
        ? childLinksLoading
        : activeTab === "enrollments"
          ? enrollmentsLoading || freeAccessLoading
          : hireLoading;

  const handleRefreshEnrollmentsTab = () => {
    handleRefreshEnrollments();
    handleRefreshFreeAccess();
  };

  const activeRefreshHandler =
    activeTab === "users"
      ? handleRefreshApprovals
      : activeTab === "childLinks"
        ? handleRefreshChildLinks
        : activeTab === "enrollments"
          ? handleRefreshEnrollmentsTab
          : handleRefreshHireRequests;

  // Placeholder counts until backend provides processed-today metrics.
  const approvedTodayCount = 0;
  const rejectedTodayCount = 0;

  const enrollmentTabSearch =
    enrollmentSubTab === "free" ? freeAccessSearch : enrollmentsSearch;
  const setEnrollmentTabSearch =
    enrollmentSubTab === "free" ? setFreeAccessSearch : setEnrollmentsSearch;

  const activeSearch =
    activeTab === "users"
      ? usersSearch
      : activeTab === "enrollments"
        ? enrollmentTabSearch
        : activeTab === "childLinks"
          ? childLinksSearch
          : "";

  const setActiveSearch =
    activeTab === "users"
      ? setUsersSearch
      : activeTab === "enrollments"
        ? setEnrollmentTabSearch
        : activeTab === "childLinks"
          ? setChildLinksSearch
          : () => {};

  const activeSearchPlaceholder =
    activeTab === "users"
      ? "Search by name, email, or role..."
      : activeTab === "enrollments"
        ? enrollmentSubTab === "free"
          ? "Search by name, email, or country..."
          : "Search by student, course, or tutor..."
        : activeTab === "childLinks"
          ? "Search by guardian or student..."
          : "Search...";

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Approvals"
        subtitle={`${(pendingApprovals?.length || 0) + (pendingEnrollments?.length || 0) + freeAccessPendingCount + (pendingChildLinks?.length || 0)} waiting · new accounts, enrollment and free-access requests, parent-child links`}
        onRefresh={activeRefreshHandler}
      />
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <SegmentedTabs
          tabs={[
            { id: "users", label: "New accounts", count: pendingApprovals?.length || 0 },
            { id: "enrollments", label: "Enrollment requests", count: (pendingEnrollments?.length || 0) + freeAccessPendingCount },
            { id: "childLinks", label: "Parent-child links", count: pendingChildLinks?.length || 0 },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
        <label className="relative w-full sm:w-80">
          <span className="sr-only">Search</span>
          <i className="fas fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={activeSearch}
            onChange={(e) => setActiveSearch(e.target.value)}
            placeholder={activeSearchPlaceholder}
            className="w-full h-10 pl-10 pr-3 text-sm rounded-xl border border-[#232D52] bg-[#121831] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </label>
      </div>
      {isActiveTabLoading && <p className="text-xs text-slate-400"><i className="fas fa-spinner fa-spin mr-2" aria-hidden="true" />Refreshing…</p>}

      {/* Tab Content */}
      {activeTab === "users" && (
        <ApprovalsTab
          pendingApprovals={pendingApprovals}
          approvalsLoading={approvalsLoading}
          approvalsError={approvalsError}
          rejectedApprovals={rejectedApprovals}
          rejectedLoading={rejectedLoading}
          rejectedError={rejectedError}
          isProcessing={isProcessing}
          onApprove={handleApprove}
          onReject={handleReject}
          onRefresh={handleRefreshApprovals}
          search={usersSearch}
          approvedTodayCount={approvedTodayCount}
          rejectedTodayCount={rejectedTodayCount}
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
          search={childLinksSearch}
        />
      )}

      {activeTab === "enrollments" && (
        <div className="space-y-5">
          {/* Sub-tabs: Standard vs Free Access enrollment requests */}
          <div className="inline-flex items-center gap-1 bg-slate-900/50 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setEnrollmentSubTab("standard")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                enrollmentSubTab === "standard"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <i className="fas fa-user-graduate"></i>
              Standard Enrollment
              {pendingEnrollments?.length > 0 && (
                <span className="bg-slate-700 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {pendingEnrollments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setEnrollmentSubTab("free")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                enrollmentSubTab === "free"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <i className="fas fa-hand-holding-heart"></i>
              Free Access
              {freeAccessPendingCount > 0 && (
                <span className="bg-slate-700 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {freeAccessPendingCount}
                </span>
              )}
            </button>
          </div>

          {enrollmentSubTab === "standard" ? (
            <EnrollmentRequestsTab
              enrollments={pendingEnrollments}
              loading={enrollmentsLoading}
              error={enrollmentsError}
              processing={enrollmentsProcessing}
              onApprove={handleApproveEnrollment}
              onReject={handleRejectEnrollment}
              onRefresh={handleRefreshEnrollments}
              search={enrollmentsSearch}
            />
          ) : (
            <FreeAccessRequestsTab
              requests={freeAccessRequests}
              loading={freeAccessLoading}
              error={freeAccessError}
              processing={freeAccessProcessing}
              onResolve={handleResolveFreeAccess}
              onRefresh={handleRefreshFreeAccess}
              search={freeAccessSearch}
            />
          )}
        </div>
      )}

      {activeTab === "hireRequests" && (
        <HireRequestsTab
          requests={hireRequests}
          loading={hireLoading}
          error={hireError}
          processing={hireProcessing}
          onApprove={handleApproveHireRequest}
          onReject={handleRejectHireRequest}
          onRefresh={handleRefreshHireRequests}
          statusFilter={hireStatusFilter}
          onStatusFilterChange={setHireStatusFilter}
        />
      )}
    </div>
  );
};

export default AdminApprovalsPage;
