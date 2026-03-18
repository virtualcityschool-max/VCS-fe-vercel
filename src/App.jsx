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

// Components
import { SimulatorBar, AIChat, AuthModals, Navbar } from "./components";

// Pages
import {
  PublicHome,
  AdminDashboard,
  StudentPortal,
  TeacherPortal,
  ParentPortal,
  Classroom,
  StudentFeed,
  Marketplace,
  PublicTeacherProfile,
  TeacherInternalStudentProfile,
  InstructorsDirectory,
} from "./pages";

// Protected Route Component
const ProtectedRoute = () => {
  const { isLoggedIn, isInitialized } = useSelector((state) => state.auth);

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <i className="fas fa-spinner text-blue-500 text-2xl"></i>
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

    window.addEventListener("token-refreshed", handleTokenRefreshed);
    window.addEventListener("auth-logout", handleAuthLogout);

    return () => {
      window.removeEventListener("token-refreshed", handleTokenRefreshed);
      window.removeEventListener("auth-logout", handleAuthLogout);
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
        {/* Show Navbar with appropriate variant */}
        {isLoggedIn ? (
          <Navbar variant="default" />
        ) : (
          <Navbar variant="public" />
        )}

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/courses" element={<Marketplace />} />
          <Route path="/instructors" element={<InstructorsDirectory />} />
          <Route path="/teacher/:id" element={<PublicTeacherProfile />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/student" element={<StudentPortal />} />
            <Route path="/teacher" element={<TeacherPortal />} />
            <Route path="/parent" element={<ParentPortal />} />
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/feed" element={<StudentFeed />} />
            <Route
              path="/student/:id"
              element={<TeacherInternalStudentProfile />}
            />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <AuthModals />
        <AIChat />
        <SimulatorBar />
        <Toaster position="top-center" />
      </div>
    </BrowserRouter>
  );
};

export default App;
