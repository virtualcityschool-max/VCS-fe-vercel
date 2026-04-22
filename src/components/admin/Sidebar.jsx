import React from "react";
import { useNavigate } from "react-router-dom";
import UserProfileDropdown from "../layout/UserProfileDropdown";

const MOBILE_BREAKPOINT = 1024;

const Sidebar = ({
  activeTab,
  pendingApprovalsCount,
  isSidebarOpen,
  onMobileClose,
}) => {
  const navigate = useNavigate();

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: "fas fa-chart-line",
      path: "/admin/overview",
    },
    {
      id: "approvals",
      label: "Approvals",
      icon: "fas fa-user-check",
      path: "/admin/approvals",
    },
    { id: "users", label: "Users", icon: "fas fa-users", path: "/admin/users" },
    {
      id: "courses",
      label: "Courses",
      icon: "fas fa-book",
      path: "/admin/courses",
    },
    {
      id: "sessions",
      label: "Classes",
      icon: "fas fa-chalkboard",
      path: "/admin/sessions",
    },
    {
      id: "enrollments",
      label: "Enrollments",
      icon: "fas fa-user-graduate",
      path: "/admin/enrollments",
    },
  ];

  const handleTabClick = (path) => {
    navigate(path);
    if (window.innerWidth < MOBILE_BREAKPOINT && onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={`w-72 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-50 overflow-visible transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo + close button */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="Virtual City School" className=" object-contain" style={{width: "100px",height: "100px"}}/>
          <div>
            <h1 className="text-lg font-black font-poppins text-white">
              Virtual City
            </h1>
            <p className="text-xs text-slate-400">Admin Portal</p>
          </div>
        </div>
        <button
          onClick={onMobileClose}
          className="lg:hidden text-slate-400 hover:text-white transition p-1"
        >
          <i className="fas fa-times text-lg"></i>
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 p-6 overflow-y-auto">
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-3 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i
                className={`${tab.icon} ${activeTab === tab.id ? "text-white" : "text-slate-500"}`}
              ></i>
              <span>{tab.label}</span>
              {tab.id === "approvals" && pendingApprovalsCount > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* User profile at bottom */}
      <div className="p-4 border-t border-slate-800 relative">
        <UserProfileDropdown dropUp />
      </div>
    </aside>
  );
};

export default Sidebar;
