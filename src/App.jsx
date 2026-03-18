import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

// Components
import SimulatorBar from "./components/SimulatorBar";
import AIChat from "./components/AIChat";
import AuthModals from "./components/AuthModals";
import Navbar from "./components/Navbar";

// Views
import PublicHome from "./views/PublicHome";
import AdminDashboard from "./views/AdminDashboard";
import StudentPortal from "./views/StudentPortal";
import TeacherPortal from "./views/TeacherPortal";
import ParentPortal from "./views/ParentPortal";
import Classroom from "./views/Classroom";
import StudentFeed from "./views/StudentFeed";
import Marketplace from "./views/Marketplace";
import PublicTeacherProfile from "./views/PublicTeacherProfile";
import TeacherInternalStudentProfile from "./views/TeacherInternalStudentProfile";
import InstructorsDirectory from "./views/InstructorsDirectory";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const { isLoggedIn } = useSelector((state) => state.auth);

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
