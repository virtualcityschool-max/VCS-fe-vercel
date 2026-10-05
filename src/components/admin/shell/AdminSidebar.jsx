import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import UserProfileDropdown from "../../layout/UserProfileDropdown";
import TimezoneModal from "../../common/TimezoneModal";
import { getTimezoneAbbr } from "../../../utils/validation";
import { ADMIN_NAV, getActiveNavId } from "./adminNav";
import { useAdminSignals } from "./adminSignalsContext";

const BADGE_TONE = {
  red: "bg-red-600 text-white",
  amber: "bg-amber-400 text-amber-950",
  live: "bg-emerald-700 text-white tracking-wider",
};

// The badge each menu item shows, or null. Counts come from AdminSignals.
const badgeFor = (signal, counts) => {
  switch (signal) {
    case "approvals":
      return counts.approvals > 0 ? { text: counts.approvals, tone: "red" } : null;
    case "expiring":
      return counts.expiring > 0 ? { text: counts.expiring, tone: "amber" } : null;
    case "unassigned":
      return counts.unassigned > 0 ? { text: counts.unassigned, tone: "amber" } : null;
    case "live":
      return counts.live > 0 ? { text: "LIVE", tone: "live" } : null;
    default:
      return null;
  }
};

const ClockButton = ({ isCollapsed, onClick }) => {
  const timezone = useSelector((s) => s.auth.profile?.timezone) || undefined;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    ...(timezone ? { timeZone: timezone } : {}),
  });
  const abbr = getTimezoneAbbr(timezone);

  return (
    <button
      type="button"
      onClick={onClick}
      title="Change timezone"
      className={`w-full flex items-center rounded-xl border border-[#1E294B] bg-[#121831] hover:border-indigo-500/40 transition cursor-pointer min-h-[40px]
        ${isCollapsed ? "justify-center px-0" : "justify-between gap-2 px-3"}`}
    >
      <i className="fas fa-globe text-indigo-300 text-xs" aria-hidden="true" />
      {!isCollapsed && (
        <>
          <span className="text-slate-300 text-xs truncate">Timezone {abbr}</span>
          <span className="text-white text-xs font-semibold tabular-nums">{time}</span>
        </>
      )}
    </button>
  );
};

const AdminSidebar = ({ isOpen, onMobileClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const signals = useAdminSignals();
  const [tzOpen, setTzOpen] = useState(false);
  const activeId = getActiveNavId(location.pathname, location.search);

  return (
    <aside
      aria-label="Admin menu"
      className={`bg-[#0E1428] border-r border-[#1E294B] flex flex-col fixed h-full z-50
        transition-all duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Brand + collapse */}
      <div className={`flex items-center border-b border-[#1E294B] flex-shrink-0 ${isCollapsed ? "h-16 justify-center px-2" : "h-[68px] gap-3 px-4"}`}>
        <Link to="/admin/overview" className="flex items-center gap-3 min-w-0" title="Dashboard">
          {isCollapsed ? (
            <span className="w-10 h-10 rounded-xl bg-[#6D5BFF] text-white text-xs font-extrabold flex items-center justify-center">VCS</span>
          ) : (
            <>
              <img src="/assets/logo.png" alt="Virtual City School" className="h-10 w-auto max-w-[130px] object-contain" />
              <span className="text-[10px] font-bold tracking-[0.14em] text-indigo-200 bg-[#6D5BFF]/20 px-2 py-0.5 rounded">ADMIN</span>
            </>
          )}
        </Link>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
          className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition ${isCollapsed ? "absolute -right-4 top-4 bg-[#0E1428] border border-[#1E294B]" : "ml-auto"}`}
        >
          <i className={`fas fa-chevron-${isCollapsed ? "right" : "left"} text-xs`} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Close menu"
          className="lg:hidden ml-auto w-10 h-10 rounded-lg text-slate-300 hover:bg-white/5"
        >
          <i className="fas fa-xmark" aria-hidden="true" />
        </button>
      </div>

      {/* Sections */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar [color-scheme:dark] py-3 ${isCollapsed ? "px-2" : "px-3"} space-y-3`}>
        {ADMIN_NAV.map((group) => (
          <div key={group.section || "home"} className="space-y-0.5">
            {group.section && !isCollapsed && (
              <p className="px-3 pt-1 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {group.section}
              </p>
            )}
            {group.section && isCollapsed && <div className="mx-3 my-2 border-t border-[#1E294B]" />}
            {group.items.map((item) => {
              const active = item.id === activeId;
              const badge = signals ? badgeFor(item.signal, signals.counts) : null;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center rounded-xl min-h-[40px] text-[13.5px] transition
                    ${isCollapsed ? "justify-center" : "gap-3 px-3"}
                    ${active ? "bg-[#6D5BFF] text-white font-semibold" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                >
                  <i className={`${item.icon} w-4 text-center text-[13px] ${active ? "text-white" : "text-slate-400"}`} aria-hidden="true" />
                  {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {badge && !isCollapsed && (
                    <span className={`text-[11px] font-bold px-2 py-px rounded-full ${BADGE_TONE[badge.tone]}`}>
                      {typeof badge.text === "number" && badge.text > 99 ? "99+" : badge.text}
                    </span>
                  )}
                  {badge && isCollapsed && (
                    <span className={`absolute top-1.5 right-2.5 w-2.5 h-2.5 rounded-full ${BADGE_TONE[badge.tone].split(" ")[0]}`} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t border-[#1E294B] flex-shrink-0 space-y-2 ${isCollapsed ? "p-2" : "p-3"}`}>
        {!isCollapsed && (
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-1 text-xs text-indigo-300 hover:text-indigo-200">
            <i className="fas fa-arrow-up-right-from-square text-[10px]" aria-hidden="true" />
            View public website
          </a>
        )}
        <ClockButton isCollapsed={isCollapsed} onClick={() => setTzOpen(true)} />
        <UserProfileDropdown dropUp isCollapsed={isCollapsed} />
      </div>

      <TimezoneModal isOpen={tzOpen} onClose={() => setTzOpen(false)} />
    </aside>
  );
};

export default AdminSidebar;
