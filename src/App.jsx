import React, { useState, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { initializeAuth, logoutUser } from "./store/slices/authSlice";
import { fetchPlatformSettings } from "./store/slices/platformSettingsSlice";
import { toastManager } from "./utils/toastManager";

// Components
import { AIChat, AuthModals, Navbar, Footer, ScrollToTop } from "./components";
import Sidebar from "./components/layout/Sidebar";

// Routes
import AppRoutes from "./routes/AppRoutes";
import { useOutsideCloseModals } from "./hooks/useOutsideCloseModals";

// Inner app - inside BrowserRouter so useLocation works
const AppInner = () => {
  const { isLoggedIn, role, isInitialized } = useSelector(
    (state) => state.auth,
  );
  const { pendingApprovals, pendingEnrollments } = useSelector((state) => state.approvals);
  const { pendingChildLinks } = useSelector((state) => state.childLinks);
  const pendingHireCount = useSelector((state) =>
    (state.hire?.adminRequests || []).filter((r) => r.status === "pending").length
  );
  const pendingFreeAccessCount = useSelector((state) =>
    (state.freeAccess?.requests || []).filter((r) => r.status === "pending").length
  );
  const location = useLocation();
  // One global handler so clicking the dim backdrop closes any modal.
  useOutsideCloseModals();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebarCollapsed") === "true"; } catch { return false; }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem("sidebarCollapsed", String(next)); } catch {}
      return next;
    });
  };

  const hasSidebar = isLoggedIn && (role === "admin" || role === "teacher" || role === "student" || role === "parent");

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Compute active tab for admin sidebar highlight
  const getActiveTab = () => {
    const p = location.pathname;
    if (p.includes("/admin/overview")) return "overview";
    if (p.includes("/admin/approvals")) return "approvals";
    if (p.includes("/admin/blogs")) return "blogs";
    if (p.includes("/admin/courses")) return "courses";
    if (p.includes("/admin/users") && p.split("/").length <= 4) return "users";
    if (p.includes("/admin/enrollments")) return "enrollments";
    if (p.includes("/admin/sessions")) return "sessions";
    if (p.includes("/admin/attendance")) return "attendance";
    if (p.includes("/admin/evaluations")) return "evaluations";
    if (p.includes("/admin/course-levels")) return "levels";
    return null;
  };

  const totalPendingCount =
    (pendingApprovals?.length || 0) +
    (pendingChildLinks?.length || 0) +
    (pendingEnrollments?.length || 0) +
    pendingHireCount +
    pendingFreeAccessCount;

  // Every role keeps the public navbar too, so they can reach Courses/Tutors/
  // Blog/About without logging out. Its UserProfileDropdown already shows a
  // role label (Administrator/Tutor/Student/Guardian) next to the name, so
  // it's clear at a glance which dashboard is open.
  const showNavbar = true;

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Unified sidebar for admin / teacher / student */}
      {hasSidebar && (
        <Sidebar
          role={role}
          isSidebarOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
          activeTab={getActiveTab()}
          pendingApprovalsCount={totalPendingCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      )}

      {/* Mobile overlay */}
      {hasSidebar && isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Content area - offset by sidebar width on desktop */}
      <div className={hasSidebar ? (isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64") : ""} style={{ transition: "margin-left 0.3s ease" }}>
        {/* Navbar - public variant for everyone (it already swaps
            Login/Register for the profile dropdown once logged in).
            Logo is hidden when a sidebar is present - the sidebar already
            shows the logo, so this avoids showing it twice. */}
        {showNavbar && (
          <header className="relative z-50">
            <Navbar variant="public" hideLogo={hasSidebar} />
          </header>
        )}

        {/* Floating mobile hamburger (sidebar roles only) */}
        {hasSidebar && (
          <button
            className={`lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition shadow-lg ${
              isSidebarOpen ? "hidden" : ""
            }`}
            onClick={() => setIsSidebarOpen(true)}
          >
            <i className="fas fa-bars text-sm"></i>
          </button>
        )}

        <main className="relative">
          <AppRoutes />
        </main>
        {showNavbar && <Footer />}

        {/* Floating WhatsApp support button */}
        <a
          href="https://wa.me/966556687417"
          target="_blank"
          rel="noopener noreferrer"
          title="24/7 Support on WhatsApp"
          className="fixed bottom-6 right-6 z-[9998] group flex items-center gap-0 hover:gap-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.5)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.7)] transition-all duration-300 overflow-hidden w-14 h-14 hover:w-44 hover:px-5"
        >
          <i className="fab fa-whatsapp text-2xl flex-shrink-0 mx-auto group-hover:mx-0 transition-all duration-300" />
          <span className="text-sm font-black tracking-wide whitespace-nowrap max-w-0 group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
            24/7 Support
          </span>
        </a>

        {/* Global Overlays */}
        <section className="relative z-[9999]">
          <AuthModals />
          {/* <AIChat /> */}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={true}
            newestOnTop
            closeOnClick
            draggable
            theme="dark"
            style={{ zIndex: 9999 }}
          />
        </section>
      </div>
    </div>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, role, isInitialized } = useSelector(
    (state) => state.auth,
  );

  React.useEffect(() => {
    if (!isInitialized) dispatch(initializeAuth());
  }, [dispatch, isInitialized]);

  // Fetch platform settings once on startup so form defaults are available
  React.useEffect(() => { dispatch(fetchPlatformSettings()); }, [dispatch]);

  React.useEffect(() => {
    const handleTokenRefreshed = (event) => {
      dispatch({ type: "auth/updateToken", payload: event.detail.token });
    };
    const handleAuthLogout = () => dispatch(logoutUser());
    const handleAuthExpired = (event) => {
      toastManager.error(
        event.detail?.message || "Your session has expired. Please log in again.",
      );
      setTimeout(() => {
        toastManager.clear();
        dispatch(logoutUser());
      }, 2000);
    };

    window.addEventListener("token-refreshed", handleTokenRefreshed);
    window.addEventListener("auth-logout", handleAuthLogout);
    window.addEventListener("auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("token-refreshed", handleTokenRefreshed);
      window.removeEventListener("auth-logout", handleAuthLogout);
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppInner />
    </BrowserRouter>
  );
};

export default App;
