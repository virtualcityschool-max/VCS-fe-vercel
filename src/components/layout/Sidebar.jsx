import React, { useState, useRef, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUnreadAnnouncementsCount,
  fetchMyAnnouncements,
} from "../../store/slices/announcementsSlice";
import UserProfileDropdown from "./UserProfileDropdown";

const MOBILE_BREAKPOINT = 1024;

const NAV_CONFIG = {
  admin: [
    { id: "overview",    label: "Overview",     icon: "fas fa-chart-line",    to: "/admin/overview" },
    { id: "approvals",   label: "Approvals",    icon: "fas fa-user-check",    to: "/admin/approvals" },
    { id: "users",       label: "Users",        icon: "fas fa-users",         to: "/admin/users" },
    { id: "courses",     label: "Courses",      icon: "fas fa-book",          to: "/admin/courses" },
    { id: "sessions",    label: "Classes",      icon: "fas fa-chalkboard",    to: "/admin/sessions" },
    { id: "enrollments", label: "Enrollments",  icon: "fas fa-user-graduate", to: "/admin/enrollments" },
  ],
  teacher: [
    { label: "Dashboard",      to: "/teacher",             icon: "fas fa-table-columns",  end: true },
    { label: "My Courses",     to: "/teacher/classes",     icon: "fas fa-book-open" },
    { label: "Attendance",     to: "/teacher/attendance",  icon: "fas fa-user-check" },
    { label: "My Assignments", to: "/teacher/grading",     icon: "fas fa-clipboard-check" },
    { label: "My Sessions",    to: "/teacher/sessions",    icon: "fas fa-calendar-alt" },
    { label: "Submissions",    to: "/teacher/submissions", icon: "fas fa-inbox" },
  ],
  student: [
    { label: "Dashboard",   to: "/student",             icon: "fas fa-table-columns",  end: true },
    { label: "My Classes",  to: "/student/classes",     icon: "fas fa-calendar-alt" },
    { label: "Assignments", to: "/student/assignments", icon: "fas fa-clipboard-list" },
    { label: "Attendance",  to: "/student/attendance",  icon: "fas fa-user-check" },
  ],
  parent: [
    { label: "Dashboard",        to: "/parent",             icon: "fas fa-table-columns", end: true },
    { label: "Child Attendance", to: "/parent/attendance",  icon: "fas fa-user-check" },
  ],
};

const PORTAL_LABEL = {
  admin:   "Admin Portal",
  teacher: "Teacher Portal",
  student: "Student Portal",
  parent:  "Parent Portal",
};

// ── Unified nav item — works for all roles ────────────────────────────────────
// Pass `to` for NavLink-based (teacher/student), omit for button-based (admin).
function NavItem({ label, icon, isCollapsed, badge, isActive, onClick, to, end }) {
  const itemClass = (active) =>
    `w-full flex items-center rounded-xl font-medium text-sm transition-all duration-200 relative
    ${isCollapsed ? "justify-center px-0 py-3" : "px-3 py-3 gap-3"}
    ${active
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
    }`;

  const inner = (active) => (
    <>
      {active && !isCollapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/40 rounded-r-full" />
      )}
      <i className={`${icon} text-base w-5 text-center flex-shrink-0 ${active ? "text-white" : "text-slate-500 group-hover/item:text-slate-300"}`} />
      <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "flex-1 opacity-100"}`}>
        {label}
      </span>
      {badge > 0 && (
        <span className={`bg-rose-500 text-white font-bold rounded-full flex-shrink-0 transition-all duration-300 ${
          isCollapsed
            ? "absolute -top-1 -right-1 w-4 h-4 text-[9px] flex items-center justify-center"
            : "ml-auto text-xs px-2 py-0.5"
        }`}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );

  return (
    <div className="relative group/item">
      {to ? (
        <NavLink to={to} end={end} className={({ isActive: a }) => itemClass(a)}>
          {({ isActive: a }) => inner(a)}
        </NavLink>
      ) : (
        <button onClick={onClick} className={itemClass(isActive)}>
          {inner(isActive)}
        </button>
      )}

      {/* Tooltip — only when collapsed */}
      {isCollapsed && (
        <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[300]
          opacity-0 group-hover/item:opacity-100 translate-x-1 group-hover/item:translate-x-0
          transition-all duration-150">
          <div className="bg-slate-800 border border-slate-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-2">
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-700" />
            {label}
            {badge > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Unified Sidebar ───────────────────────────────────────────────────────────
const Sidebar = ({
  role,
  isSidebarOpen,
  onMobileClose,
  // collapse
  isCollapsed,
  onToggleCollapse,
  // admin-only
  activeTab,
  pendingApprovalsCount = 0,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Student announcements
  const { unreadCount, items: announcements, loadingItems } = useSelector(
    (state) => state.announcements,
  );
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    if (role !== "student") return;
    dispatch(fetchUnreadAnnouncementsCount());
    const interval = setInterval(() => dispatch(fetchUnreadAnnouncementsCount()), 30000);
    return () => clearInterval(interval);
  }, [dispatch, role]);

  useEffect(() => {
    if (role !== "student") return;
    const handleOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setIsBellOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [role]);

  const toggleBell = () => {
    const next = !isBellOpen;
    setIsBellOpen(next);
    if (next) dispatch(fetchMyAnnouncements());
  };

  const handleAdminNav = (path) => {
    navigate(path);
    if (window.innerWidth < MOBILE_BREAKPOINT && onMobileClose) onMobileClose();
  };

  return (
    <aside className={`
      bg-slate-950 border-r border-slate-800/80 flex flex-col fixed h-full z-50
      transition-all duration-300 ease-in-out
      lg:translate-x-0
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      ${isCollapsed ? "w-20" : "w-72"}
    `}>

      {/* ── Header ── */}
      <div className={`border-b border-slate-800/80 flex items-center flex-shrink-0 h-20 overflow-hidden
        ${isCollapsed ? "justify-center px-0" : "px-5 gap-3"}`}>

        <div className={`flex-shrink-0 transition-all duration-300 ${isCollapsed ? "w-10 h-10" : "w-14 h-14"}`}>
          <img src="/assets/logo.png" alt="VCS" className="w-full h-full object-contain" />
        </div>

        <div className={`overflow-hidden transition-all duration-300 min-w-0 ${isCollapsed ? "w-0 opacity-0" : "flex-1 opacity-100"}`}>
          <h1 className="text-base font-black font-poppins text-white leading-tight whitespace-nowrap">Virtual City</h1>
          <p className="text-[11px] text-slate-500 whitespace-nowrap">{PORTAL_LABEL[role]}</p>
        </div>

        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className={`lg:hidden text-slate-400 hover:text-white transition p-1 flex-shrink-0 ${isCollapsed ? "hidden" : ""}`}
        >
          <i className="fas fa-times text-lg" />
        </button>

        {/* Desktop collapse toggle — all roles */}
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

      {/* ── Nav ── */}
      <div className={`flex-1 py-4 overflow-y-auto overflow-x-hidden ${isCollapsed ? "px-3" : "px-4"}`}>
        {!isCollapsed && (
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-3 mb-3">
            Navigation
          </p>
        )}
        {isCollapsed && <div className="mb-3" />}

        <nav className="space-y-1">
          {role === "admin"
            ? NAV_CONFIG.admin.map((tab) => (
                <NavItem
                  key={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isCollapsed={isCollapsed}
                  isActive={activeTab === tab.id}
                  badge={tab.id === "approvals" ? pendingApprovalsCount : 0}
                  to={tab.to}
                  // onClick={() => handleAdminNav(tab.path)}
                />
              ))
            : NAV_CONFIG[role]?.map((item) => (
                <NavItem
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  isCollapsed={isCollapsed}
                  to={item.to}
                  end={item.end}
                  onClick={onMobileClose}
                />
              ))
          }
        </nav>
      </div>

      {/* ── Student: Announcements bell ── */}
      {role === "student" && (
        <div className="border-t border-slate-800/80 flex-shrink-0 overflow-visible relative" ref={bellRef}>
          <div className={isCollapsed ? "px-3 py-3" : "px-4 py-3"}>
            <button
              type="button"
              onClick={toggleBell}
              title={isCollapsed ? "Announcements" : undefined}
              className={`w-full flex items-center rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-200 relative
                ${isCollapsed ? "justify-center px-0 py-3" : "px-3 py-3 gap-3"}`}
            >
              <span className="relative w-5 text-center flex-shrink-0">
                <i className="fas fa-bell text-slate-500"></i>
                {unreadCount > 0 && (
                  <span className={`bg-rose-500 text-white font-bold rounded-full transition-all duration-300 ${
                    isCollapsed
                      ? "absolute -top-2 -right-2 w-4 h-4 text-[9px] flex items-center justify-center"
                      : "absolute -top-2 -right-2 w-4 h-4 text-[9px] flex items-center justify-center"
                  }`}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "flex-1 opacity-100"}`}>
                Announcements
              </span>
              {!isCollapsed && unreadCount > 0 && (
                <span className="ml-auto text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Collapsed tooltip */}
            {isCollapsed && (
              <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[300]
                opacity-0 group-hover:opacity-100 transition-all duration-150">
                <div className="bg-slate-800 border border-slate-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                  Announcements
                </div>
              </div>
            )}
          </div>

          {/* Announcements dropdown */}
          {isBellOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Announcements</h3>
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  {announcements?.length || 0} items
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {loadingItems ? (
                  <div className="p-4 text-sm text-slate-400">Loading...</div>
                ) : announcements?.length ? (
                  announcements.map((item) => (
                    <div
                      key={item.id}
                      className={`px-4 py-4 border-b border-slate-800 last:border-b-0 ${item.is_read ? "bg-slate-900" : "bg-blue-500/5"}`}
                    >
                      <div className="flex items-start gap-3">
                        {!item.is_read && <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-400 shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${item.is_read ? "text-slate-300" : "text-white font-semibold"}`}>{item.title}</p>
                            <span className="text-[10px] text-slate-500 shrink-0">{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.body}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest text-slate-500">
                            <span>{item.course}</span>
                            {item.course && item.posted_by && <span>•</span>}
                            <span>{item.posted_by}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-sm text-slate-400">No announcements yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Footer: UserProfileDropdown ── */}
      <div className="border-t border-slate-800/80 flex-shrink-0 p-4 overflow-visible relative">
        <UserProfileDropdown dropUp isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
