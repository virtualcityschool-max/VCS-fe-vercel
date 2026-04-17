import React from "react";

const UserDetailsTabs = ({ activeTab, onTabChange, userRole }) => {
  const tabs = [{ id: "account", label: "Account", icon: "fas fa-user" }];

  // Add profile tab based on user role (not admin)
  if (userRole && userRole !== "admin") {
    tabs.push({
      id: "profile",
      label: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Profile`,
      icon: "fas fa-id-card",
    });
  }

  return (
    <div className="border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm rounded-t-2xl">
      <nav className="flex space-x-1 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-3 ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <i
              className={`${tab.icon} ${
                activeTab === tab.id ? "text-white" : "text-slate-500"
              }`}
            ></i>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default UserDetailsTabs;
