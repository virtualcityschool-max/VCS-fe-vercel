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
          title: "Pending Approvals",
          description: "Review and manage pending user registration requests",
        };
      case "courses":
        return {
          title: "Subjects",
          description: "Cambridge IGCSE, O-Level & A-Level curriculum catalog, syllabus outline, and subject settings",
        };
      case "teachers":
        return {
          title: "Teachers",
          description: "Faculty directory, qualification credentials, teaching experience, and contact profiles",
        };
      case "teacher-allocations":
        return {
          title: "Teacher Allocations",
          description: "Curriculum staffing matrix, subject-to-teacher assignments, unassigned subject alerts, and faculty workload",
        };
      case "students":
        return {
          title: "Students",
          description: "Student master directory, roll numbers, grades, linked parents, custom labels, and account records",
        };
      case "enrollments":
        return {
          title: "Student Enrollments",
          description: "Active Cambridge subject enrollments, fee confirmation, and add/drop subject management",
        };
      case "guardians":
      case "parents":
        return {
          title: "Parents",
          description: "Parent directory, WhatsApp contacts, and linked students",
        };
      case "users":
        return {
          title: "All Users",
          description: "Manage system user accounts, roles, and administrative permissions",
        };
      case "sessions":
        return {
          title: "Timetable",
          description: "Create, edit, and manage live class sessions",
        };
      case "evaluations":
        return {
          title: "Evaluations",
          description: "Review student academic performance across subjects",
        };
      case "attendance":
        return {
          title: "Attendance",
          description: "Session-wise attendance matrix across all subjects.",
        };
      case "levels":
        return {
          title: "Levels",
          description: "Manage education levels for organizing your curriculum",
        };
      case "teacher-planner":
        return {
          title: "Teacher Meetings",
          description: "Schedule and manage meetings and consultation slots for teachers",
        };
      case "subscriptions":
        return {
          title: "Subscriptions",
          description: "Track Gumroad student memberships, active course subscriptions, and billing records",
        };
      case "referrals":
        return {
          title: "Referrals",
          description: "Track affiliate referral links, signups, and referral reward earnings",
        };
      case "testimonials":
        return {
          title: "Testimonials",
          description: "Add and publish real student, parent and teacher quotes for the homepage",
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
