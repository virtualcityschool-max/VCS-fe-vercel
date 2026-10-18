// Day / night mode for the public website (DESIGN.md §5).
// The choice is stored as "light" or "dark"; with no choice we follow the
// device setting. Day mode applies only on public pages seen with the public
// menu (not the portals, and not to signed-in students/teachers/parents, whose
// pages use the dark portal sidebar). index.html runs the same rule before the
// app loads so the page never flashes the wrong colours.

const KEY = "vcs_theme";

export const PORTAL_PATH = /^\/(admin|teacher|student|parent|profile|feed|classroom)(\/|$)/;

export const storedTheme = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export const systemTheme = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";

export const currentTheme = () => storedTheme() || systemTheme();

const portalUser = () => {
  try {
    const u = JSON.parse(localStorage.getItem("vcs_auth_user") || "null");
    return !!(localStorage.getItem("vcs_access_token") && u && ["teacher", "student", "parent"].includes(u.role));
  } catch { return false; }
};

// Whether day mode can apply on this path for this visitor.
export const themeApplies = (pathname = window.location.pathname) => !PORTAL_PATH.test(pathname) && !portalUser();

export const applyTheme = (pathname) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("light-public", themeApplies(pathname) && currentTheme() === "light");
};

export const setTheme = (theme) => {
  try { localStorage.setItem(KEY, theme); } catch { /* private mode: just this page */ }
  applyTheme();
  window.dispatchEvent(new Event("vcs-theme"));
};
