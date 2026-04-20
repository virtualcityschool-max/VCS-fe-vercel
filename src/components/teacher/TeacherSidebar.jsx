import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    to: "/teacher",
    icon: "fa-table-columns",
    end: true,
  },
  {
    label: "My Courses",
    to: "/teacher/classes",
    icon: "fa-book-open",
  },
  {
    label: "Attendance",
    to: "/teacher/attendance",
    icon: "fa-user-check",
  },
  {
    label: "My Assignments",
    to: "/teacher/grading",
    icon: "fa-clipboard-check",
  },
];

const TeacherSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
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
