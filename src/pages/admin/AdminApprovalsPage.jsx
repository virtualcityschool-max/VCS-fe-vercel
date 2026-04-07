import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingApprovals,
  approveUser,
  rejectUser,
} from "../../store/slices/approvalsSlice";
import { toastManager } from "../../utils/toastManager";
import ApprovalsTab from "../../components/admin/ApprovalsTab";

const AdminApprovalsPage = () => {
  const dispatch = useDispatch();

  const {
    pendingApprovals,
    isLoading: approvalsLoading,
    error: approvalsError,
    isProcessing,
  } = useSelector((state) => state.approvals);

  // Fetch pending approvals when component mounts
  useEffect(() => {
    dispatch(fetchPendingApprovals());
  }, [dispatch]);

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

  return (
    <ApprovalsTab
      pendingApprovals={pendingApprovals}
      approvalsLoading={approvalsLoading}
      approvalsError={approvalsError}
      isProcessing={isProcessing}
      onApprove={handleApprove}
      onReject={handleReject}
      onRefresh={handleRefreshApprovals}
    />
  );
};

export default AdminApprovalsPage;
