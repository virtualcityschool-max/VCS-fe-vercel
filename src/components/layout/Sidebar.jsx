import React, { useState, useRef, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnreadAnnouncementsCount, fetchMyAnnouncements } from "../../store/slices/announcementsSlice";
import UserProfileDropdown from "./UserProfileDropdown";
import { getTimezoneAbbr } from "../../utils/validation";

const MOBILE_BREAKPOINT = 1024;

const TimezoneIndicator = ({ isCollapsed }) => {
  const navigate  = useNavigate();
  const timezone  = useSelector((s) => s.auth.profile?.timezone) || undefined;
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const fmt        = (opts) => now.toLocaleString("en-US", { ...(timezone ? { timeZone: timezone } : {}), ...opts });
  const time       = fmt({ hour: "2-digit", minute: "2-digit" });
  const date       = fmt({ weekday: "short", month: "short", day: "numeric" });
  const abbr       = getTimezoneAbbr(timezone);
  // e.g. "Asia/Dubai" → "Dubai", "America/New_York" → "New York"
  const city      = timezone ? timezone.split("/").pop().replace(/_/g, " ") : "Auto-Detected";
  const displayTz = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (isCollapsed) {
    return (
      <div className="flex justify-center pb-3 group/tz relative">
        <button
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all cursor-pointer"
        >
          <i className="fas fa-globe text-indigo-400 text-xs" />
          <span className="text-white text-[9px] font-bold tabular-nums leading-none mt-0.5">{time}</span>
          <span className="text-indigo-400/70 text-[8px] font-bold leading-none">{city}</span>
        </button>

        {/* Tooltip - slides in from the right, clickable */}
        <div
          onClick={() => navigate("/profile")}
          className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-[60]
            opacity-0 group-hover/tz:opacity-100 translate-x-2 group-hover/tz:translate-x-0
            transition-all duration-150 cursor-pointer"
        >
          <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-xl px-3 py-2 whitespace-nowrap">
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-700" />
            <p className="text-indigo-400 text-xs font-semibold">Click here to change timezone</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-3 group/tz relative">
      <button
        onClick={() => navigate("/profile")}
        className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all duration-200 px-3 py-2.5 text-left"
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <i className="fas fa-globe text-indigo-400 text-[10px]" />
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Timezone</span>
          </div>
          <span className="text-[9px] font-bold text-indigo-400/80 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md">
            {city}
          </span>
        </div>

        {/* Timezone ID + offset + live clock */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white text-xs font-bold leading-none">{displayTz}</p>
            <p className="text-slate-500 text-[10px] font-medium mt-0.5">{abbr}</p>
          </div>
          <span className="text-indigo-300 text-sm font-black tabular-nums leading-none">{time}</span>
        </div>
      </button>

      {/* Tooltip - slides up, clickable */}
      <div
        onClick={() => navigate("/profile")}
        className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-[60]
          opacity-0 group-hover/tz:opacity-100 translate-y-2 group-hover/tz:translate-y-0
          transition-all duration-150 cursor-pointer"
      >
        <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-xl px-3 py-2">
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-700" />
          <p className="text-indigo-400 text-xs font-semibold text-center">Click here to change timezone</p>
        </div>
      </div>
    </div>
  );
};

const NAV_CONFIG = {
  admin: [
    { id: "overview",    label: "Overview",     icon: "fas fa-chart-line",    to: "/admin/overview" },

    { id: "approvals",   label: "Approval(s) Pending",    icon: "fas fa-user-check",    to: "/admin/approvals",  section: "People & Approvals" },
    { id: "users",       label: "Users",        icon: "fas fa-users",         to: "/admin/users",      section: "People & Approvals" },
    { id: "referrals",   label: "Referrals",    icon: "fas fa-share-nodes",    to: "/admin/referrals", section: "People & Approvals" },

    { id: "courses",     label: "Courses",      icon: "fas fa-book",          to: "/admin/courses",    section: "Academics" },
    { id: "enrollments",     label: "Class Enrollments", icon: "fas fa-user-graduate",   to: "/admin/enrollments",       section: "Academics" },
    { id: "sessions",        label: "Class Timetable",   icon: "fas fa-chalkboard",      to: "/admin/sessions",         section: "Academics" },
    { id: "teacher-planner", label: "Tutor Meetings",    icon: "fas fa-user-clock",      to: "/admin/teacher-planner",  section: "Academics" },
    { id: "subscriptions",   label: "Subscriptions",    icon: "fas fa-rotate",          to: "/admin/subscriptions",     section: "Academics" },
    { id: "attendance",  label: "Attendance",   icon: "fas fa-calendar-check", to: "/admin/attendance",   section: "Academics" },
    { id: "evaluations", label: "Evaluations",  icon: "fas fa-chart-bar",      to: "/admin/evaluations",  section: "Academics" },

    { id: "blogs",       label: "Blogs",        icon: "fas fa-newspaper",     to: "/admin/blogs", section: "Content" },
    { id: "vlogs",       label: "Vlogs",        icon: "fas fa-circle-play",   to: "/admin/vlogs", section: "Content" },

    { id: "levels",  label: "Levels",   icon: "fas fa-tags",           to: "/admin/course-levels", section: "Settings" },
    { id: "about",    label: "About Us",          icon: "fas fa-info-circle", to: "/admin/about",  section: "Settings" },
    { id: "settings", label: "Platform Settings",  icon: "fas fa-sliders-h",   to: "/admin/settings", section: "Settings" },
  ],
  teacher: [
    { label: "Dashboard",    to: "/teacher",                  icon: "fas fa-table-columns",   end: true },
    { label: "My Courses",   to: "/teacher/classes",          icon: "fas fa-book-open" },
    { label: "Attendance",   to: "/teacher/attendance",       icon: "fas fa-user-check" },
    { label: "Assessments",  to: "/teacher/assessments",      icon: "fas fa-clipboard-check" },
    { label: "Planner",  to: "/teacher/sessions",         icon: "fas fa-calendar-alt" },
    { label: "Slots Management", to: "/teacher/availability",     icon: "fas fa-calendar-plus" },
    { label: "Evaluations",  to: "/teacher/evaluations",      icon: "fas fa-chart-bar" },
    { label: "Blogs",        to: "/blogs",                    icon: "fas fa-newspaper" },
    // { label: "Hire Request", to: "/teacher/hire-leads",       icon: "fas fa-handshake" },
  ],
  student: [
    { label: "Dashboard",   to: "/student",                 icon: "fas fa-table-columns",  end: true },
    { label: "My Sessions", to: "/student/classes",         icon: "fas fa-calendar-alt" },
    { label: "My Tutors",   to: "/student/tutors",          icon: "fas fa-chalkboard-teacher" },
    { label: "Assessments", to: "/student/assessments",     icon: "fas fa-clipboard-list" },
    { label: "Attendance",  to: "/student/attendance",      icon: "fas fa-user-check" },
    { label: "Evaluations", to: "/student/evaluations",     icon: "fas fa-chart-bar" },
    { label: "Explore Courses", to: "/courses",             icon: "fas fa-compass" },
    { label: "Blogs",       to: "/blogs",                   icon: "fas fa-newspaper" },
  ],
  parent: [
    { label: "Dashboard",        to: "/parent",              icon: "fas fa-table-columns", end: true },
    { label: "Child Attendance", to: "/parent/attendance",   icon: "fas fa-user-check" },
    { label: "Evaluations",      to: "/parent/evaluations",  icon: "fas fa-chart-bar" },
  ],
};

const PORTAL_LABEL = {
  admin:   "Admin Portal",
  teacher: "Tutor Portal",
  student: "Student Portal",
  parent:  "Guardian Portal",
};

// ── Unified nav item - works for all roles ────────────────────────────────────
// Pass `to` for NavLink-based (teacher/student), omit for button-based (admin).
function NavItem({ label, icon, isCollapsed, badge, isActive, onClick, to, end }) {
  const itemClass = (active) =>
    `w-full flex items-center rounded-xl font-medium text-sm transition-all duration-200 relative
    ${isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5 gap-2.5"}
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

      {/* Tooltip - only when collapsed */}
      {isCollapsed && (
        <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[60]
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
    (state) => state.auth.role === "student" ? state.announcements : { unreadCount: 0, items: [], loadingItems: false },
  );
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    if (role !== "student") return;
    dispatch(fetchUnreadAnnouncementsCount());
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

  return (
    <aside className={`
      bg-slate-950 border-r border-slate-800/80 flex flex-col fixed h-full z-50
      transition-all duration-300 ease-in-out
      lg:translate-x-0
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      ${isCollapsed ? "w-20" : "w-64"}
    `}>

      {/* ── Header ── */}
      <div className={`
        border-b border-slate-800/80 flex-shrink-0 flex items-center transition-all duration-300 overflow-hidden
        ${isCollapsed ? "px-3 h-16" : "px-4 h-[110px]"}
      `}>
        <div className="relative flex-1 h-full flex items-center min-w-0">
          {/* Full Logo */}
          <div
            className={`
              absolute inset-y-0 left-0 flex items-center transition-all duration-300 ease-in-out cursor-pointer hover:opacity-80
              ${isCollapsed ? "opacity-0 -translate-x-10 pointer-events-none" : "opacity-100 translate-x-0"}
            `}
            style={{ width: "170px" }}
            onClick={() => {
              const dashboardPaths = { admin: "/admin/overview", teacher: "/teacher", student: "/student", parent: "/parent" };
              navigate(dashboardPaths[role] || "/");
            }}
          >
            <img src="/assets/logo.png" alt="VCS" className="w-full h-full object-contain" />
          </div>

          {/* Collapsed Logo (Mini) */}
          <div
            className={`
              absolute inset-y-0 left-0 flex items-center transition-all duration-300 ease-in-out cursor-pointer hover:opacity-80
              ${isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
            `}
            style={{ width: "36px" }}
            onClick={() => {
              const dashboardPaths = { admin: "/admin/overview", teacher: "/teacher", student: "/student", parent: "/parent" };
              navigate(dashboardPaths[role] || "/");
            }}
          >
            <img src="/assets/logo02.png" alt="VCS" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Toggle / Close Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg
              text-slate-500 hover:text-white hover:bg-slate-800 transition-all duration-200"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className={`fas fa-chevron-${isCollapsed ? "right" : "left"} text-xs transition-transform duration-300`} />
          </button>
          
          {!isCollapsed && (
            <button
              onClick={onMobileClose}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg
                text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
            >
              <i className="fas fa-times text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* ── Nav ── */}
      <div className={`flex-1 py-3 overflow-y-auto overflow-x-hidden ${isCollapsed ? "px-3" : "px-4"}`}>
        {!isCollapsed && (
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-3 mb-2">
            Navigation
          </p>
        )}
        {isCollapsed && <div className="mb-2" />}

        <nav className="space-y-1">
          {role === "admin"
            ? NAV_CONFIG.admin.map((tab, i) => {
                const prevSection = NAV_CONFIG.admin[i - 1]?.section;
                const startsNewSection = tab.section && tab.section !== prevSection;
                return (
                  <React.Fragment key={tab.id}>
                    {startsNewSection && (
                      <div className={`pt-3 mt-2 border-t border-slate-800/70 ${isCollapsed ? "px-0" : ""}`}>
                        {!isCollapsed && (
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-3 mb-1.5">
                            {tab.section}
                          </p>
                        )}
                      </div>
                    )}
                    <NavItem
                      label={tab.label}
                      icon={tab.icon}
                      isCollapsed={isCollapsed}
                      isActive={activeTab === tab.id}
                      badge={tab.id === "approvals" ? pendingApprovalsCount : 0}
                      to={tab.to}
                    />
                  </React.Fragment>
                );
              })
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
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "opacity-100"}`}>
                Announcements
              </span>
              {!isCollapsed && unreadCount > 0 && (
                <span className="ml-auto text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

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

      {/* ── Timezone Indicator ── */}
      <TimezoneIndicator isCollapsed={isCollapsed} />

      {/* ── Footer: UserProfileDropdown ── */}
      <div className="border-t border-slate-800/80 flex-shrink-0 p-4 overflow-visible relative">
        <UserProfileDropdown dropUp isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
