import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingApprovals,
  setApprovalsLoading,
} from "../../store/slices/approvalsSlice";
import { fetchPendingChildLinks } from "../../store/slices/childLinksSlice";
import {
  fetchCourses,
  fetchUsers,
  fetchEnrollments,
  fetchSessions,
} from "../../store/slices/adminSlice";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get data from Redux store - always call hooks in same order
  const { pendingApprovals } = useSelector((state) => state.approvals);
  const { pendingChildLinks } = useSelector((state) => state.childLinks);

  // Get active tab from current route
  const getActiveTabFromPath = () => {
    const path = location.pathname;

    // Exclude user detail routes
    if (path.includes("/admin/users/") && path.split("/").length > 4) {
      return null; // Not a tab route, it's a user detail page
    }

    if (path.includes("/admin/overview")) return "overview";
    if (path.includes("/admin/approvals")) return "approvals";
    if (path.includes("/admin/courses")) return "courses";
    if (path.includes("/admin/users")) return "users";
    if (path.includes("/admin/enrollments")) return "enrollments";
    if (path.includes("/admin/sessions")) return "sessions";
    return "overview"; // default
  };

  const activeTab = getActiveTabFromPath();

  // All useEffect hooks must be called unconditionally at the top
  React.useEffect(() => {
    // Initial fetch on mount to populate sidebar count
    dispatch(fetchPendingApprovals());
    dispatch(fetchPendingChildLinks());
  }, [dispatch]);

  React.useEffect(() => {
    // Additional fetch when approvals tab is active or set loading state
    if (activeTab === "approvals") {
      dispatch(fetchPendingApprovals());
      dispatch(fetchPendingChildLinks());
      dispatch(setApprovalsLoading(true));
    }
  }, [dispatch, activeTab]);

  React.useEffect(() => {
    // Fetch courses when courses tab is active
    if (activeTab === "courses") {
      dispatch(fetchCourses());
      // Fetch users for instructor assignment
      dispatch(fetchUsers({ role: "teacher" }));
    }
  }, [dispatch, activeTab]);

  React.useEffect(() => {
    // Fetch users when users tab is active
    if (activeTab === "users") {
      dispatch(fetchUsers());
    }
  }, [dispatch, activeTab]);

  React.useEffect(() => {
    // Fetch enrollments when enrollments tab is active
    if (activeTab === "enrollments") {
      dispatch(fetchEnrollments());
    }
  }, [dispatch, activeTab]);

  React.useEffect(() => {
    // Fetch sessions when sessions tab is active
    if (activeTab === "sessions") {
      dispatch(fetchSessions());
    }
  }, [dispatch, activeTab]);

  // Calculate total pending approvals count
  const totalPendingCount =
    (pendingApprovals?.length || 0) + (pendingChildLinks?.length || 0);

  // Don't render layout if it's a user detail page
  if (activeTab === null) {
    return <Outlet />;
  }

  return (
    <section
      id="admin-view"
      className="min-h-screen bg-slate-950 text-white flex font-inter"
    >
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            data-sidebar-toggle
            className="text-white hover:text-indigo-400 transition-colors"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <i className="fas fa-graduation-cap text-white text-xs"></i>
          </div>
          <span className="text-sm font-black font-poppins text-white">
            Virtual City Admin
          </span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        pendingApprovalsCount={totalPendingCount}
        isSidebarOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-72 p-6 md:p-12 pt-24 lg:pt-12">
        <Header activeTab={activeTab} />

        {/* Nested Routes Outlet */}
        <Outlet />
      </main>
    </section>
  );
};

export default AdminLayout;
