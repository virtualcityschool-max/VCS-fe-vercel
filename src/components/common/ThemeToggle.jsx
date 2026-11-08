import React, { useSyncExternalStore } from "react";
import { currentTheme, setTheme } from "../../utils/theme";

// The switch as drawn into pre-built pages (scripts/prerender.js). When the
// app adopts such a page, React first draws the switch this way too (so the
// saved HTML matches) and then straight away in the visitor's own mode.
const PREBUILT_THEME = "dark";

const subscribe = (onChange) => {
  window.addEventListener("vcs-theme", onChange);
  const mq = window.matchMedia?.("(prefers-color-scheme: light)");
  mq?.addEventListener?.("change", onChange);
  return () => { window.removeEventListener("vcs-theme", onChange); mq?.removeEventListener?.("change", onChange); };
};
const getTheme = () => (window.__VCS_PRERENDER__ ? PREBUILT_THEME : currentTheme());
const getPrebuiltTheme = () => PREBUILT_THEME;

// Sun/moon switch for day and night mode (DESIGN.md §5).
const ThemeToggle = ({ className = "" }) => {
  const theme = useSyncExternalStore(subscribe, getTheme, getPrebuiltTheme);
  const light = theme === "light";
  return (
    <button
      type="button"
      onClick={() => setTheme(light ? "dark" : "light")}
      className={`flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition ${className}`}
      aria-label={light ? "Switch to night mode" : "Switch to day mode"}
      title={light ? "Night mode" : "Day mode"}
    >
      <i className={`fas ${light ? "fa-moon" : "fa-sun"} text-base`} />
    </button>
  );
};

export default ThemeToggle;
