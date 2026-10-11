import React from "react";
import { Outlet, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import UserProfileDropdown from "../../components/layout/UserProfileDropdown";

const TAB_TITLES = {
  dashboard: "Faculty Portal",
  courses: "My Courses",
  attendance: "Class Attendance Ledger",
  assignments_quizzes: "Assignments & Quizzes",
  assessments: "Assignments & Quizzes",
  teaching_resources: "Teaching Resources & Desk",
  analytics: "Performance Analytics",
  planner: "Planner",
  slots: "Slots Management",
  evaluations: "Evaluations & Gradebook",
  blogs: "Blogs",
  about: "About Us",
};

const SUBPATH_TITLES = {
  "/teacher/attendance": "Class Attendance Matrix",
  "/teacher/classes": "Live Classes",
  "/teacher/grading": "Homework Grading Queue",
  "/teacher/sessions": "Session Calendar",
  "/teacher/submissions": "Submissions",
  "/teacher/evaluations": "Evaluations & Gradebook",
  "/teacher/availability": "Availability & Slots",
};

const TeacherLayout = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "dashboard";
  const viewTitle = SUBPATH_TITLES[location.pathname] || TAB_TITLES[activeTab] || "Faculty Portal";

  return (
    <div className="min-h-screen bg-[#070913] text-white flex flex-col">
      {/* Top Header Bar matching Google AI Studio */}
      <header className="h-14 px-4 sm:px-6 border-b border-[#14192B] flex items-center justify-between gap-4 bg-[#090B14]/95 backdrop-blur-md sticky top-0 z-30">
        {/* Breadcrumb Context */}
        <div className="text-xs font-semibold text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-1.5">
          <span>Virtual City School</span>
          <span className="text-slate-600">·</span>
          <span className="text-white font-bold">{viewTitle}</span>
        </div>

        {/* User Pill / Profile Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <UserProfileDropdown />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
