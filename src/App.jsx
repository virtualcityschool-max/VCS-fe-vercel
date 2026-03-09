import { useSelector, useDispatch } from "react-redux";
import { navigateTo } from "./store/slices/uiSlice";
import { AppView } from "./types";

// Components
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
  const dispatch = useDispatch();
  const { currentView } = useSelector((state) => state.ui);

  const renderView = () => {
    switch (currentView) {
      case AppView.ADMIN: return <AdminDashboard />;
      case AppView.STUDENT: return <StudentPortal />;
      case AppView.TEACHER: return <TeacherPortal />;
      case AppView.PARENT: return <ParentPortal />;
      case AppView.CLASSROOM: return <Classroom />;
      case AppView.FEED: return <StudentFeed />;
      case AppView.MARKETPLACE: return <Marketplace />;
      case AppView.TEACHER_PROFILE: return <PublicTeacherProfile />;
      case AppView.INTERNAL_STUDENT_PROFILE: return <TeacherInternalStudentProfile />;
      case AppView.INSTRUCTORS_DIRECTORY: return <InstructorsDirectory />;
      case AppView.PUBLIC_HOME:
      default: return <PublicHome />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-indigo-500/30 overflow-x-hidden">
      <main className="pb-32 sm:pb-24">{renderView()}</main>
      <AuthModals />
      <AIChat />
      <SimulatorBar />
    </div>
  );
};

export default App;
