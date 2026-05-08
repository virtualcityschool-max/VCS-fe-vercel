import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { initializeAuth, logoutUser } from "./store/slices/authSlice";
import { toastManager } from "./utils/toastManager";

// Components
import { AIChat, AuthModals, Navbar } from "./components";
import Sidebar from "./components/layout/Sidebar";

// Pages
import {
  PublicHome,
  AdminLayout,
  AdminOverviewPage,
  AdminApprovalsPage,
  AdminCoursesPage,
  AdminCourseDetailPage,
  ProfilePage,
  AdminUsersPage,
  AdminEnrollmentsPage,
  AdminSessionsPage,
  AdminAttendancePage,
  AdminEvaluationPage,
  UserDetailsPage,
  StudentPortal,
  TeacherLayout,
  TeacherPortal,
  TeacherClasses,
  TeacherCourseDetailPage,
  TeacherAttendance,
  TeacherGrading,
  TeacherAssessments,
  TeacherSubmissions,
  TeacherSessionCalendar,
  StudentLayout,
  StudentClasses,
  ParentPortal,
  Classroom,
  StudentFeed,
  Marketplace,
  CourseDetails,
  TeacherProfile,
  TeacherInternalStudentProfile,
  TeacherEvaluationPage,
  TeachersDirectory,
  StudentAssignments,
  StudentAssignmentDetails,
  StudentAssessments,
  StudentQuizDetail,
  StudentAttendance,
  // StudentExamDetail,
  StudentEvaluationPage,
  ParentLayout,
  ParentAttendance,
  ParentEvaluationPage,
} from "./pages";

// Protected Route Component with Role-Based Access Control
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isLoggedIn, isInitialized, role } = useSelector(
    (state) => state.auth,
  );

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-spinner text-blue-500 text-2xl animate-spin"></i>
          </div>
          <p className="text-white text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const roleRedirects = {
      student: "/student",
      teacher: "/teacher",
      parent: "/parent",
      admin: "/admin",
    };
    return <Navigate to={roleRedirects[role] || "/"} replace />;
  }

  return <Outlet />;
};

// Inner app — inside BrowserRouter so useLocation works
const AppInner = () => {
  const { isLoggedIn, role, isInitialized } = useSelector(
    (state) => state.auth,
  );
  const { pendingApprovals } = useSelector((state) => state.approvals);
  const { pendingChildLinks } = useSelector((state) => state.childLinks);
  const location = useLocation();
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
    if (p.includes("/admin/courses")) return "courses";
    if (p.includes("/admin/users") && p.split("/").length <= 4) return "users";
    if (p.includes("/admin/enrollments")) return "enrollments";
    if (p.includes("/admin/sessions")) return "sessions";
    if (p.includes("/admin/attendance")) return "attendance";
    if (p.includes("/admin/evaluations")) return "evaluations";
    return null;
  };

  const totalPendingCount =
    (pendingApprovals?.length || 0) + (pendingChildLinks?.length || 0);

  const showNavbar = !isLoggedIn;

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

      {/* Content area — offset by sidebar width on desktop */}
      <div className={hasSidebar ? (isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72") : ""} style={{ transition: "margin-left 0.3s ease" }}>
        {/* Navbar (hidden on /admin and /teacher routes) */}
        {showNavbar && (
          <header className="relative z-50">
            <Navbar variant={isLoggedIn ? "default" : "public"} />
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

        <main className="relative z-10">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Navigate
                    to={
                      role === "student"
                        ? "/student"
                        : role === "teacher"
                          ? "/teacher"
                          : role === "admin"
                            ? "/admin"
                            : role === "parent"
                              ? "/parent"
                              : "/"
                    }
                    replace
                  />
                ) : (
                  <PublicHome />
                )
              }
            />
            <Route path="/courses" element={<Marketplace />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/teachers" element={<TeachersDirectory />} />
            <Route path="/teachers/:id" element={<TeacherProfile />} />

            {/* Student-Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route path="/student" element={<StudentLayout />}>
                <Route index element={<StudentPortal />} />
                <Route path="classes" element={<StudentClasses />} />
                <Route path="assessments" element={<StudentAssessments />} />
                <Route path="assignments" element={<StudentAssignments />} />
                <Route path="assignments/:id" element={<StudentAssignmentDetails />} />
                <Route path="quizzes/:id" element={<StudentQuizDetail />} />
                {/* <Route path="exams/:id"  element={<StudentExamDetail />} /> */}
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="evaluations" element={<StudentEvaluationPage />} />
              </Route>
            </Route>

            {/* Teacher-Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
              <Route path="/teacher" element={<TeacherLayout />}>
                <Route index element={<TeacherPortal />} />
                <Route path="classes" element={<TeacherClasses />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="assessments" element={<TeacherAssessments />} />
                <Route path="grading" element={<TeacherGrading />} />
                <Route path="sessions" element={<TeacherSessionCalendar />} />
                <Route path="submissions" element={<TeacherSubmissions />} />
                <Route path="evaluations" element={<TeacherEvaluationPage />} />
              </Route>
              <Route
                path="/student/:id"
                element={<TeacherInternalStudentProfile />}
              />
              <Route path="/teacher/courses/:courseId" element={<TeacherCourseDetailPage />} />
            </Route>

            {/* Parent-Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={["parent"]} />}>
              <Route path="/parent" element={<ParentLayout />}>
                <Route index element={<ParentPortal />} />
                <Route path="attendance" element={<ParentAttendance />} />
                <Route path="evaluations" element={<ParentEvaluationPage />} />
              </Route>
            </Route>

            {/* Admin-Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route
                  index
                  element={<Navigate to="/admin/overview" replace />}
                />
                <Route path="overview" element={<AdminOverviewPage />} />
                <Route path="approvals" element={<AdminApprovalsPage />} />
                <Route path="courses" element={<AdminCoursesPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="enrollments" element={<AdminEnrollmentsPage />} />
                <Route path="sessions" element={<AdminSessionsPage />} />
                <Route path="attendance" element={<AdminAttendancePage />} />
                <Route path="evaluations" element={<AdminEvaluationPage />} />
              </Route>
              <Route path="/admin/users/:id" element={<UserDetailsPage />} />
              <Route path="/admin/courses/:courseId" element={<AdminCourseDetailPage />} />
            </Route>

            {/* Profile — all authenticated roles */}
            <Route element={<ProtectedRoute allowedRoles={["student", "teacher", "admin", "parent"]} />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Overlays */}
        <section className="relative z-50">
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
      <AppInner />
    </BrowserRouter>
  );
};

export default App;
