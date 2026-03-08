import React, { useState } from "react";
import { AppView } from "./types";
import SimulatorBar from "./components/SimulatorBar";
import AIChat from "./components/AIChat";
import AuthModals from "./components/AuthModals";

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

const App = () => {
  const [currentView, setCurrentView] = useState(AppView.PUBLIC_HOME);

  const [auth, setAuth] = useState({
    isLoggedIn: false,
    role: null,
    username: null,
  });

  const [authModal, setAuthModal] = useState(null);

  const handleSetView = (view) => {
    const secureViews = [
      AppView.ADMIN,
      AppView.STUDENT,
      AppView.TEACHER,
      AppView.PARENT,
      AppView.CLASSROOM,
      AppView.FEED,
      AppView.INTERNAL_STUDENT_PROFILE,
    ];

    if (secureViews.includes(view) && !auth.isLoggedIn) {
      setAuthModal("login");
      return;
    }

    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (role) => {
    const names = {
      student: "Sarah Khan",
      teacher: "Dr. Elena Petrova",
      admin: "Root Admin",
      parent: "Mr. Khan",
    };

    setAuth({
      isLoggedIn: true,
      role: role,
      username: names[role] || "User",
    });

    if (role === "student") {
      setCurrentView(AppView.FEED);
    } else if (role === "teacher") {
      setCurrentView(AppView.TEACHER);
    } else if (role === "admin") {
      setCurrentView(AppView.ADMIN);
    } else if (role === "parent") {
      setCurrentView(AppView.PARENT);
    }
  };

  const handleLogout = () => {
    setAuth({
      isLoggedIn: false,
      role: null,
      username: null,
    });

    setCurrentView(AppView.PUBLIC_HOME);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.ADMIN:
        return <AdminDashboard />;

      case AppView.STUDENT:
        return <StudentPortal setView={handleSetView} />;

      case AppView.TEACHER:
        return <TeacherPortal setView={handleSetView} />;

      case AppView.PARENT:
        return <ParentPortal setView={handleSetView} />;

      case AppView.CLASSROOM:
        return <Classroom setView={handleSetView} />;

      case AppView.FEED:
        return (
          <StudentFeed
            setView={handleSetView}
            auth={auth}
            onLogout={handleLogout}
          />
        );

      case AppView.MARKETPLACE:
        return <Marketplace setView={handleSetView} />;

      case AppView.TEACHER_PROFILE:
        return <PublicTeacherProfile setView={handleSetView} />;

      case AppView.INTERNAL_STUDENT_PROFILE:
        return <TeacherInternalStudentProfile setView={handleSetView} />;

      case AppView.INSTRUCTORS_DIRECTORY:
        return <InstructorsDirectory setView={handleSetView} />;

      case AppView.PUBLIC_HOME:
      default:
        return (
          <PublicHome
            setView={handleSetView}
            setAuthModal={setAuthModal}
            auth={auth}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-indigo-500/30 overflow-x-hidden">
      <main className="pb-32 sm:pb-24">{renderView()}</main>

      <AuthModals
        isOpen={authModal}
        onClose={() => setAuthModal(null)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AIChat currentView={currentView} />
      <SimulatorBar currentView={currentView} setView={handleSetView} />
    </div>
  );
};

export default App;
