import React from "react";

const Header = ({ activeTab }) => {
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
          title: "Class Management",
          description: "Create, edit, and manage course classes",
        };
      case "evaluations":
        return {
          title: "Evaluations",
          description: "Review student performance across teachers and courses",
        };
      case "attendance":
        return {
          title: "Attendance",
          description: "Monitor teacher and student attendance across all courses.",
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
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
      <div>
        <h2 className="text-3xl md:text-4xl font-black font-poppins text-white capitalize mb-2">
          {title}
        </h2>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </header>
  );
};

export default Header;
