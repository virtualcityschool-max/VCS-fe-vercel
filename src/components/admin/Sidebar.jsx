import React from "react";
import { useNavigate } from "react-router-dom";

// Mobile breakpoint constant
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
    {
      id: "courses",
      label: "Courses",
      icon: "fas fa-book",
      path: "/admin/courses",
    },
    { id: "users", label: "Users", icon: "fas fa-users", path: "/admin/users" },
    {
      id: "enrollments",
      label: "Enrollments",
      icon: "fas fa-user-graduate",
      path: "/admin/enrollments",
    },
  ];

  const handleTabClick = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation using callback
    if (window.innerWidth < MOBILE_BREAKPOINT && onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={`w-72 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-graduation-cap text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-black font-poppins text-white">
              Virtual City
            </h1>
            <p className="text-xs text-slate-400">Admin Portal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
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

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">AD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-slate-400">admin@virtualcity.edu</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
