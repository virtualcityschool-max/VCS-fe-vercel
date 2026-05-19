import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEnrollments } from "../../store/slices/adminSlice";
import EnrollmentsTab from "../../components/admin/EnrollmentsTab";

const AdminEnrollmentsPage = () => {
  const dispatch = useDispatch();

  const enrollments = useSelector((state) => state.admin.enrollments);

  const handleRefreshEnrollments = () => {
    dispatch(fetchEnrollments());
  };

  return (
    <EnrollmentsTab
      enrollments={enrollments?.data || []}
      loading={enrollments?.loading || false}
      error={enrollments?.error}
      onRefresh={handleRefreshEnrollments}
    />
  );
};

export default AdminEnrollmentsPage;
