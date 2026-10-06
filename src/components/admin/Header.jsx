import React from "react";

const Header = ({ activeTab, children }) => {
  const getTabInfo = () => {
    switch (activeTab) {
      case "overview":
        return {
          title: "Dashboard",
          description: "Monitor platform performance, enrollment analytics, and key school metrics",
        };
      case "approvals":
        return {
          title: "Pending Approvals",
          description: "Review and approve student admissions, faculty applications, and parent requests",
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
          description: "Admitted student directory, roll numbers, grades, and linked parents",
        };
      case "enrollments":
        return {
          title: "Student Enrollments",
          description: "Active Cambridge subject enrollments, fee confirmation, and add/drop management",
        };
      case "guardians":
      case "parents":
        return {
          title: "Parents",
          description: "Parent directory, WhatsApp contacts, and linked student accounts",
        };
      case "admins":
        return {
          title: "Admin Users",
          description: "Manage system administrators, staff privileges, and platform credentials",
        };
      case "users":
        return {
          title: "All Users",
          description: "Manage system user accounts, roles, and administrative permissions",
        };
      case "sessions":
        return {
          title: "Timetable",
          description: "Cambridge live class timetable, schedule, and session management",
        };
      case "teacher-planner":
        return {
          title: "PTM Meetings",
          description: "Schedule and manage Parent-Teacher Meeting consultation slots and office hours",
        };
      case "attendance":
        return {
          title: "Attendance",
          description: "Session-wise student attendance matrix for classes and PTM reviews",
        };
      case "evaluations":
        return {
          title: "Evaluations",
          description: "Student academic performance, evaluation reports, and grading records",
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
      case "levels":
        return {
          title: "Levels",
          description: "Manage Cambridge education levels for organizing curriculum",
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

  // Same look as the redesign's PageHeader, for pages not rebuilt yet.
  return (
    <header className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 mb-6 border-b border-[#1E2648]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {children && <div className="w-full md:w-auto shrink-0">{children}</div>}
    </header>
  );
};

export default Header;
