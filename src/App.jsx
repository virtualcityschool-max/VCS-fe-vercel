import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { initializeAuth, logoutUser } from "./store/slices/authSlice";
import { toastManager } from "./utils/toastManager";

// Components
import { SimulatorBar, AIChat, AuthModals, Navbar } from "./components";

// Pages
import {
  PublicHome,
  AdminDashboard,
  StudentPortal,
  TeacherLayout,
  TeacherPortal,
  TeacherClasses,
  TeacherAttendance,
  TeacherGrading,
  ParentPortal,
  Classroom,
  StudentFeed,
  Marketplace,
  CourseDetails,
  TeacherProfile,
  TeacherInternalStudentProfile,
  TeachersDirectory,
} from "./pages";

// Protected Route Component with Role-Based Access Control
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isLoggedIn, isInitialized, role } = useSelector(
    (state) => state.auth,
  );

  // Show loading while auth is initializing
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

  // Redirect to home if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect authenticated users to appropriate dashboard based on their role
    const roleRedirects = {
      student: "/student",
      teacher: "/teacher",
      parent: "/parent",
      admin: "/admin",
    };

    const redirectPath = roleRedirects[role] || "/";
    return <Navigate to={redirectPath} replace />;
  }

  // CRITICAL: Must return Outlet for nested routes to render
  return <Outlet />;
};

const App = () => {
  const { isLoggedIn, role, isInitialized } = useSelector(
    (state) => state.auth,
  );
  const dispatch = useDispatch();

  // Initialize auth on app startup
  React.useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  // Handle token refresh events from axiosInstance
  React.useEffect(() => {
    const handleTokenRefreshed = (event) => {
      const { token } = event.detail;
      console.log("🔄 App: Token refreshed via event");
      // Update Redux store with new token
      dispatch({ type: "auth/updateToken", payload: token });
    };

    const handleAuthLogout = () => {
      console.log("🔄 App: Logout via event");
      dispatch(logoutUser());
    };

    const handleAuthExpired = (event) => {
      const { message } = event.detail;
      console.log("🔄 App: Session expired via event");

      // Show user-friendly session expired toast
      toastManager.error(
        message || "Your session has expired. Please log in again.",
      );

      // Clear all toasts and redirect after a short delay
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

  // Debug authentication state
  React.useEffect(() => {
    console.log("🔐 App: Auth state updated:", {
      isLoggedIn,
      role,
      isInitialized,
    });
  }, [isLoggedIn, role, isInitialized]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 selection:bg-indigo-500/30 overflow-x-hidden">
        {/* Header with Navigation */}
        <header className="relative z-50">
          <Navbar variant={isLoggedIn ? "default" : "public"} />
        </header>

        {/* Main Content Area */}
        <main className="relative z-10">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicHome />} />
            <Route path="/courses" element={<Marketplace />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/teachers" element={<TeachersDirectory />} />
            <Route path="/teachers/:id" element={<TeacherProfile />} />

            {/* Student-Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route path="/student" element={<StudentPortal />} />
              <Route path="/feed" element={<StudentFeed />} />
            </Route>

            {/* Shared Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/classroom" element={<Classroom />} />
            </Route>

            {/* Teacher-Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
              <Route path="/teacher" element={<TeacherLayout />}>
                <Route index element={<TeacherPortal />} />
                <Route path="classes" element={<TeacherClasses />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="grading" element={<TeacherGrading />} />
              </Route>

              <Route
                path="/student/:id"
                element={<TeacherInternalStudentProfile />}
              />
            </Route>

            {/* Parent-Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={["parent"]} />}>
              <Route path="/parent" element={<ParentPortal />} />
            </Route>

            {/* Admin-Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Overlays and Modals */}
        <section className="relative z-50">
          <AuthModals />
          <AIChat />
          <SimulatorBar />
          <Toaster position="top-center" />
        </section>
      </div>
    </BrowserRouter>
  );
};

export default App;
