import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingApprovals,
  fetchPendingEnrollments,
} from "../../store/slices/approvalsSlice";
import { fetchPendingChildLinks } from "../../store/slices/childLinksSlice";
import { fetchAdminHireRequests } from "../../store/slices/hireSlice";
import {
  fetchCourses,
  fetchUsers,
  fetchEnrollments,
  fetchSessions,
  fetchTeacherPlannerSessions,
} from "../../store/slices/adminSlice";
import Header from "./Header";

const AdminLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes("/admin/users/") && path.split("/").length > 4)
      return null;
    if (path.includes("/admin/overview")) return "overview";
    if (path.includes("/admin/approvals")) return "approvals";
    if (path.includes("/admin/courses")) return "courses";
    if (path.includes("/admin/users")) return "users";
    if (path.includes("/admin/enrollments")) return "enrollments";
    if (path.includes("/admin/sessions")) return "sessions";
    if (path.includes("/admin/teacher-planner")) return "teacher-planner";
    if (path.includes("/admin/evaluations")) return "evaluations";
    if (path.includes("/admin/attendance")) return "attendance";
    if (path.includes("/admin/course-levels")) return "levels";
    // These pages manage their own heading — skip the shared Header
    if (path.includes("/admin/about"))    return null;
    if (path.includes("/admin/settings")) return null;
    if (path.includes("/admin/training")) return null;
    return "overview";
  };

  const activeTab = getActiveTabFromPath();

  // Fetch all approval counts once on mount so the sidebar badge is always accurate.
  // AdminApprovalsPage reads from this Redux state directly — no duplicate fetches.
  React.useEffect(() => {
    dispatch(fetchPendingApprovals());
    dispatch(fetchPendingChildLinks());
    dispatch(fetchPendingEnrollments());
    dispatch(fetchAdminHireRequests());
  }, [dispatch]);

  React.useEffect(() => {
    if (activeTab === "courses") {
      dispatch(fetchCourses());
      dispatch(fetchUsers({ role: "teacher" }));
    }
  }, [dispatch, activeTab]);

  React.useEffect(() => {
    if (activeTab === "users" && !location.state?.skipFetch) dispatch(fetchUsers());
  }, [dispatch, activeTab]);

  React.useEffect(() => {
    if (activeTab === "enrollments") dispatch(fetchEnrollments());
  }, [dispatch, activeTab]);

  React.useEffect(() => {
    if (activeTab === "sessions") dispatch(fetchSessions({ view: "parent" }));
  }, [dispatch, activeTab]);

  React.useEffect(() => {
    if (activeTab === "teacher-planner") {
      dispatch(fetchTeacherPlannerSessions({ view: "parent" }));
      dispatch(fetchUsers({ role: "teacher" }));
    }
  }, [dispatch, activeTab]);

  return (
    <section className="min-h-screen bg-slate-950 text-white font-inter p-6 md:p-12 pt-16 lg:pt-12">
      {activeTab !== null && <Header activeTab={activeTab} />}
      <Outlet />
    </section>
  );
};

export default AdminLayout;
