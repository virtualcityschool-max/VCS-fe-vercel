import React from "react";
import { useNavigate } from "react-router-dom";
import UserProfileDropdown from "../layout/UserProfileDropdown";

const MOBILE_BREAKPOINT = 1024;

const tabs = [
  { id: "overview",    label: "Overview",    icon: "fas fa-chart-line",    path: "/admin/overview" },
  { id: "approvals",   label: "Approvals",   icon: "fas fa-user-check",    path: "/admin/approvals" },
  { id: "users",       label: "Users",        icon: "fas fa-users",         path: "/admin/users" },
  { id: "courses",     label: "Courses",      icon: "fas fa-book",          path: "/admin/courses" },
  { id: "sessions",    label: "Classes",      icon: "fas fa-chalkboard",    path: "/admin/sessions" },
  { id: "enrollments", label: "Enrollments",  icon: "fas fa-user-graduate", path: "/admin/enrollments" },
];

function NavItem({ tab, isActive, isCollapsed, pendingCount, onClick }) {
  return (
    <div className="relative group/item">
      <button
        onClick={onClick}
        title={isCollapsed ? tab.label : undefined}
        className={`w-full flex items-center rounded-xl font-medium text-sm transition-all duration-200 relative
          ${isCollapsed ? "justify-center px-0 py-3" : "px-3 py-3 gap-3"}
          ${isActive
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
      >
        {isActive && !isCollapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/40 rounded-r-full" />
        )}

        <i className={`${tab.icon} text-base w-5 text-center flex-shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover/item:text-slate-300"}`} />

        <span
          className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isCollapsed ? "w-0 opacity-0" : "flex-1 opacity-100"
          }`}
        >
          {tab.label}
        </span>

        {tab.id === "approvals" && pendingCount > 0 && (
          <span
            className={`bg-rose-500 text-white font-bold rounded-full flex-shrink-0 transition-all duration-300 ${
              isCollapsed
                ? "absolute -top-1 -right-1 w-4 h-4 text-[9px] flex items-center justify-center"
                : "ml-auto text-xs px-2 py-0.5"
            }`}
          >
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>

      {/* Tooltip — collapsed only, uses fixed positioning to escape overflow-hidden */}
      {isCollapsed && (
        <div
          className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[300]
            opacity-0 group-hover/item:opacity-100 translate-x-1 group-hover/item:translate-x-0
            transition-all duration-150"
        >
          <div className="bg-slate-800 border border-slate-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-2">
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-700" />
            {tab.label}
            {tab.id === "approvals" && pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const Sidebar = ({
  activeTab,
  pendingApprovalsCount,
  isSidebarOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();

  const handleTabClick = (path) => {
    navigate(path);
    if (window.innerWidth < MOBILE_BREAKPOINT && onMobileClose) onMobileClose();
  };

  return (
    <aside
      className={`
        bg-slate-950 border-r border-slate-800/80 flex flex-col fixed h-full z-50
        transition-all duration-300 ease-in-out
        lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-20" : "w-72"}
      `}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div
        className={`border-b border-slate-800/80 flex items-center flex-shrink-0 h-20 overflow-hidden
          ${isCollapsed ? "justify-center px-0" : "px-5 gap-3"}`}
      >
        <div className={`flex-shrink-0 transition-all duration-300 ${isCollapsed ? "w-10 h-10" : "w-14 h-14"}`}>
          <img src="/assets/logo.png" alt="VCS" className="w-full h-full object-contain" />
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 min-w-0 ${
            isCollapsed ? "w-0 opacity-0" : "flex-1 opacity-100"
          }`}
        >
          <h1 className="text-base font-black font-poppins text-white leading-tight whitespace-nowrap">
            Virtual City
          </h1>
          <p className="text-[11px] text-slate-500 whitespace-nowrap">Admin Portal</p>
        </div>

        <button
          onClick={onMobileClose}
          className={`lg:hidden text-slate-400 hover:text-white transition p-1 flex-shrink-0 ${
            isCollapsed ? "hidden" : ""
          }`}
        >
          <i className="fas fa-times text-lg" />
        </button>

        <button
          onClick={onToggleCollapse}
          className={`hidden lg:flex items-center justify-center flex-shrink-0 w-7 h-7 rounded-lg
            text-slate-500 hover:text-white hover:bg-slate-800 transition-all duration-200
            ${isCollapsed ? "" : "ml-auto"}`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`fas fa-chevron-${isCollapsed ? "right" : "left"} text-xs`} />
        </button>
      </div>

      {/* ── Nav ─────────────────────────────────────── */}
      {/* overflow-hidden clips label text during width transition; tooltips escape via z-[300] */}
      <div className={`flex-1 py-4 overflow-y-auto overflow-x-hidden ${isCollapsed ? "px-3" : "px-4"}`}>
        {!isCollapsed && (
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-3 mb-3">
            Navigation
          </p>
        )}
        {isCollapsed && <div className="mb-3" />}

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <NavItem
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              isCollapsed={isCollapsed}
              pendingCount={pendingApprovalsCount}
              onClick={() => handleTabClick(tab.path)}
            />
          ))}
        </nav>
      </div>

      {/* ── Footer — UserProfileDropdown ────────────── */}
      {/* overflow-visible so the dropUp popup can escape the sidebar bounds */}
      <div className="border-t border-slate-800/80 flex-shrink-0 p-4 overflow-visible relative">
        <UserProfileDropdown dropUp isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
