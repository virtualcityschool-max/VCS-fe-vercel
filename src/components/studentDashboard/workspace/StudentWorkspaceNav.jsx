import React from "react";

const TABS = [
  { id: "overview", label: "Overview", icon: "fas fa-th-large" },
  { id: "calendar", label: "Calendar", icon: "fas fa-calendar-alt" },
  { id: "schedule", label: "Schedule & Attendance", icon: "fas fa-clock" },
  { id: "resources", label: "Resources", icon: "fas fa-folder-open" },
  { id: "tutors", label: "My Tutors", icon: "fas fa-chalkboard-teacher" },
  { id: "assessments", label: "Assessments", icon: "fas fa-clipboard-list" },
  { id: "evaluations", label: "Evaluations", icon: "fas fa-chart-bar" },
];

const StudentWorkspaceNav = ({ activeTab, onSelectTab, counts = {} }) => {
  return (
    <div className="border-b border-white/10 pb-1">
      <div className="flex items-center gap-1 sm:gap-2.5 overflow-x-auto no-scrollbar py-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <i className={`${tab.icon} text-xs ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {typeof count === "number" && count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-300"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StudentWorkspaceNav;
