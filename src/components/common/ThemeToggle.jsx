import React, { useEffect, useState } from "react";
import { currentTheme, setTheme } from "../../utils/theme";

// Sun/moon switch for day and night mode (DESIGN.md §5).
const ThemeToggle = ({ className = "" }) => {
  const [theme, setThemeState] = useState(() => (typeof window !== "undefined" ? currentTheme() : "dark"));
  useEffect(() => {
    const sync = () => setThemeState(currentTheme());
    window.addEventListener("vcs-theme", sync);
    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    mq?.addEventListener?.("change", sync);
    return () => { window.removeEventListener("vcs-theme", sync); mq?.removeEventListener?.("change", sync); };
  }, []);
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
