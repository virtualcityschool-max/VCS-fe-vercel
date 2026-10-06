import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  fetchPendingApprovals,
  fetchPendingEnrollments,
} from "../../store/slices/approvalsSlice";
import { fetchPendingChildLinks } from "../../store/slices/childLinksSlice";
import { fetchFreeAccessRequests } from "../../store/slices/freeAccessSlice";
// import { fetchAdminHireRequests } from "../../store/slices/hireSlice";
import {
  fetchCourses,
  fetchUsers,
  fetchEnrollments,
  fetchSessions,
  fetchTeacherPlannerSessions,
} from "../../store/slices/adminSlice";
import Header from "./Header";

// Pages already on the new design draw their own header.
const REDESIGNED = new Set(["overview", "students", "teachers", "parents", "admins", "courses", "enrollments", "teacher-allocations", "approvals"]);

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
    if (path.includes("/admin/teacher-allocations")) return "teacher-allocations";
    if (path.includes("/admin/users")) {
      const search = location.search;
      if (search.includes("role=teacher")) return "teachers";
      if (search.includes("role=student")) return "students";
      if (search.includes("role=parent")) return "parents";
      if (search.includes("role=admin")) return "admins";
      return "users";
    }
    if (path.includes("/admin/subscriptions")) return "subscriptions";
    if (path.includes("/admin/enrollments")) return "enrollments";
    if (path.includes("/admin/sessions")) return "sessions";
    if (path.includes("/admin/teacher-planner")) return "teacher-planner";
    if (path.includes("/admin/evaluations")) return "evaluations";
    if (path.includes("/admin/attendance")) return "attendance";
    if (path.includes("/admin/course-levels")) return "levels";
    if (path.includes("/admin/referrals")) return "referrals";
    if (path.includes("/admin/testimonials")) return "testimonials";
    // These pages manage their own heading - skip the shared Header
    if (path.includes("/admin/blogs"))    return null;
    if (path.includes("/admin/about"))    return null;
    if (path.includes("/admin/settings")) return null;
    if (path.includes("/admin/training")) return null;
    return "overview";
  };

  const activeTab = getActiveTabFromPath();

  // Fetch all approval counts once on mount so the sidebar badge is always accurate.
  // AdminApprovalsPage reads from this Redux state directly - no duplicate fetches.
  React.useEffect(() => {
    dispatch(fetchPendingApprovals());
    dispatch(fetchPendingChildLinks());
    dispatch(fetchPendingEnrollments());
    dispatch(fetchFreeAccessRequests({ status: "pending" }));
    // dispatch(fetchAdminHireRequests());
  }, [dispatch]);

  React.useEffect(() => {
    if (activeTab === "courses" || activeTab === "teacher-allocations") {
      dispatch(fetchCourses());
      dispatch(fetchUsers({ role: "teacher" }));
    }
  }, [dispatch, activeTab]);

  React.useEffect(() => {
    if (activeTab === "teachers") {
      dispatch(fetchUsers({ role: "teacher" }));
    } else if (activeTab === "students") {
      dispatch(fetchUsers({ role: "student" }));
    } else if (activeTab === "parents") {
      dispatch(fetchUsers({ role: "parent" }));
    } else if (activeTab === "admins") {
      dispatch(fetchUsers({ role: "admin" }));
    } else if (activeTab === "users" && !location.state?.skipFetch) {
      dispatch(fetchUsers());
    }
  }, [dispatch, activeTab, location.state?.skipFetch]);

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
    <section className="min-h-screen bg-[#0B1020] text-white font-inter px-4 sm:px-6 lg:px-8 py-6">
      {/* The dashboard has its own greeting instead of the shared Header */}
      {activeTab !== null && !REDESIGNED.has(activeTab) && <Header activeTab={activeTab} />}
      <Outlet />
    </section>
  );
};

export default AdminLayout;
