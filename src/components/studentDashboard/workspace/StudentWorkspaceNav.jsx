import React from "react";

const TABS = [
  { id: "overview", label: "Overview", icon: "fas fa-th-large" },
  { id: "schedule", label: "Live Schedule", icon: "fas fa-video" },
  { id: "planner", label: "Weekly Planner", icon: "fas fa-calendar-alt" },
  { id: "calendar", label: "Calendar", icon: "fas fa-calendar-days" },
  { id: "attendance", label: "Attendance", icon: "fas fa-user-check" },
  { id: "resources", label: "Resources", icon: "fas fa-folder-open" },
  { id: "assessments", label: "Assignments & Quizzes", icon: "fas fa-clipboard-check" },
];

const StudentWorkspaceNav = ({ activeTab, onSelectTab, counts = {} }) => {
  const currentTabObj = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="border-b border-white/10 pb-3 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              title={tab.label}
              aria-label={tab.label}
              className={`group relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <i
                className={`${tab.icon} ${
                  isActive
                    ? "text-white text-base"
                    : "text-slate-400 group-hover:text-slate-200 text-sm"
                }`}
              />

              {typeof count === "number" && count > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white shadow">
                  {count}
                </span>
              )}

              {/* Instant hover tooltip */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-30 shadow-xl">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View Label Indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10">
        <i className={`${currentTabObj.icon} text-xs text-emerald-400`} />
        <span className="text-xs font-bold text-white tracking-wide">
          {currentTabObj.label}
        </span>
      </div>
    </div>
  );
};

export default StudentWorkspaceNav;
