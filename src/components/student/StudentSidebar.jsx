import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUnreadAnnouncementsCount,
  fetchMyAnnouncements,
} from "../../store/slices/announcementsSlice";
import UserProfileDropdown from "../layout/UserProfileDropdown";

const navItems = [
  { label: "Dashboard", to: "/student", icon: "fa-table-columns", end: true },
  { label: "My Classes", to: "/student/classes", icon: "fa-calendar-alt" },
  { label: "Assignments", to: "/student/assignments", icon: "fa-clipboard-list" },
];

const StudentSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const { unreadCount, items: announcements, loadingItems } = useSelector(
    (state) => state.announcements,
  );

  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    dispatch(fetchUnreadAnnouncementsCount());
    const interval = setInterval(() => {
      dispatch(fetchUnreadAnnouncementsCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleBell = () => {
    const next = !isBellOpen;
    setIsBellOpen(next);
    if (next) dispatch(fetchMyAnnouncements());
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
          <img src="/assets/logo.png" alt="Virtual City School" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-lg font-black font-poppins text-white">Virtual City</h1>
            <p className="text-xs text-slate-400">Student Portal</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white transition p-1"
        >
          <i className="fas fa-times text-lg"></i>
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 p-6 overflow-y-auto">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <i className={`fas ${item.icon} ${isActive ? "text-white" : "text-slate-500"}`}></i>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Announcements bell */}
      <div className="px-4 py-3 border-t border-slate-800 relative" ref={bellRef}>
        <button
          type="button"
          onClick={toggleBell}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
        >
          <span className="relative">
            <i className="fas fa-bell text-slate-500"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
          <span>Announcements</span>
          {unreadCount > 0 && (
            <span className="ml-auto text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown panel — opens upward */}
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
                    className={`px-4 py-4 border-b border-slate-800 last:border-b-0 ${
                      item.is_read ? "bg-slate-900" : "bg-blue-500/5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!item.is_read && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${item.is_read ? "text-slate-300" : "text-white font-semibold"}`}>
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
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

      {/* User profile at bottom */}
      <div className="p-4 border-t border-slate-800 relative">
        <UserProfileDropdown dropUp />
      </div>
    </aside>
  );
};

export default StudentSidebar;
