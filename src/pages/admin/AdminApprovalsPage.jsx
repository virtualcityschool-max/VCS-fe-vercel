import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingApprovals,
  approveUser,
  rejectUser,
} from "../../store/slices/approvalsSlice";
import {
  fetchPendingChildLinks,
  approveChildLink,
  rejectChildLink,
} from "../../store/slices/childLinksSlice";
import { toastManager } from "../../utils/toastManager";
import ApprovalsTab from "../../components/admin/ApprovalsTab";
import ChildLinksTab from "../../components/admin/ChildLinksTab";

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

  // Fetch pending approvals when component mounts or tab changes
  useEffect(() => {
    if (activeTab === "users") {
      dispatch(fetchPendingApprovals());
    } else if (activeTab === "childLinks") {
      dispatch(fetchPendingChildLinks());
    }
  }, [dispatch, activeTab]);

  const handleApprove = async (userId) => {
    try {
      await dispatch(approveUser(userId)).unwrap();
      toastManager.success("User approved successfully");
    } catch (error) {
      toastManager.error(error || "Failed to approve user");
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
      toastManager.error(error || "Failed to approve child link");
    }
  };

  const handleRejectChildLink = async (linkId) => {
    try {
      await dispatch(rejectChildLink(linkId)).unwrap();
      toastManager.success("Child link rejected successfully");
    } catch (error) {
      toastManager.error(error || "Failed to reject child link");
    }
  };

  const handleRefreshChildLinks = () => {
    dispatch(fetchPendingChildLinks());
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-1 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <i className="fas fa-user-check"></i>
            User Approvals
            {pendingApprovals?.length > 0 && (
              <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingApprovals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("childLinks")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "childLinks"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <i className="fas fa-link"></i>
            Child Link Requests
            {pendingChildLinks?.length > 0 && (
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingChildLinks.length}
              </span>
            )}
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
    </div>
  );
};

export default AdminApprovalsPage;
