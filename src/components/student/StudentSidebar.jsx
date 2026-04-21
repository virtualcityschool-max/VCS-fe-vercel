import { NavLink } from "react-router-dom";
import UserProfileDropdown from "../layout/UserProfileDropdown";

const navItems = [
  { label: "Dashboard", to: "/student", icon: "fa-table-columns", end: true },
  { label: "My Classes", to: "/student/classes", icon: "fa-calendar-alt" },
];

const StudentSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
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

      {/* User profile at bottom */}
      <div className="p-4 border-t border-slate-800 relative">
        <UserProfileDropdown dropUp />
      </div>
    </aside>
  );
};

export default StudentSidebar;
