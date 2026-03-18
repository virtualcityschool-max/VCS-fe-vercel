import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

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
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const { isLoggedIn, role } = useSelector((state) => state.auth);

  // Debug authentication state
  React.useEffect(() => {
    console.log("🔐 App: Auth state updated:", { isLoggedIn, role });
  }, [isLoggedIn, role]);

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
