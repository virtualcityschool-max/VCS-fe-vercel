import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    to: "/teacher",
    icon: "fa-table-columns",
    end: true,
  },
  {
    label: "My Classes",
    to: "/teacher/classes",
    icon: "fa-book-open",
  },
  {
    label: "Attendance",
    to: "/teacher/attendance",
    icon: "fa-user-check",
  },
  {
    label: "Grading",
    to: "/teacher/grading",
    icon: "fa-clipboard-check",
  },
];

const TeacherSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <aside
      className={`w-72 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-10">
        <div
          className="flex items-center gap-3 mb-16 cursor-pointer shrink-0"
          onClick={() => {
            navigate("/");
            handleCloseSidebar();
          }}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">
            V
          </div>
          <span className="text-lg font-black tracking-tighter whitespace-nowrap">
            VirtualCitySchool
          </span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={handleCloseSidebar}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition ${
                  isActive
                    ? "bg-slate-900 text-white border border-slate-800"
                    : "text-slate-500 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              <i className={`fas ${item.icon} text-sm`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
