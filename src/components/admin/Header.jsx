import React from "react";

const Header = ({ activeTab, children }) => {
  const getTabInfo = () => {
    switch (activeTab) {
      case "overview":
        return {
          title: "Dashboard Overview",
          description: "Monitor your platform's performance and key metrics",
        };
      case "approvals":
        return {
          title: "User Approvals",
          description: "Review and manage pending user registration requests",
        };
      case "courses":
        return {
          title: "Course Management",
          description: "Create, edit, and manage educational courses",
        };
      case "users":
        return {
          title: "User Management",
          description: "Manage user accounts and permissions",
        };
      case "enrollments":
        return {
          title: "Enrollment Management",
          description: "View and manage course enrollments",
        };
      case "sessions":
        return {
          title: "Session Management",
          description: "Create, edit, and manage course sessions",
        };
      case "evaluations":
        return {
          title: "Evaluations",
          description: "Review student performance across tutors and courses",
        };
      case "attendance":
        return {
          title: "Attendance",
          description: "Session-wise attendance matrix for all courses.",
        };
      case "levels":
        return {
          title: "Course Levels",
          description: "Manage course levels for organizing your curriculum",
        };
      case "teacher-planner":
        return {
          title: "Tutor Planner",
          description: "Schedule and manage recurring sessions for teachers",
        };
      case "referrals":
        return {
          title: "Referral Management",
          description: "Track referral signups and enrollments across users",
        };
      default:
        return {
          title: activeTab,
          description: "",
        };
    }
  };

  const { title, description } = getTabInfo();

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 animate-fadeInUp">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-400/80 mb-2">
          Admin Portal
        </p>
        <h2 className="text-3xl md:text-4xl font-black font-poppins text-white capitalize mb-2">
          {title}
        </h2>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
      {children && (
        <div className="w-full md:w-auto shrink-0">
          {children}
        </div>
      )}
    </header>
  );
};

export default Header;
