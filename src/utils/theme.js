// Day / night mode for the whole site (DESIGN.md §5): public pages, portals
// and admin. The choice is stored as "light" or "dark"; with no choice we
// follow the device setting. index.html applies the same rule before the app
// loads so the page never flashes the wrong colours.

const KEY = "vcs_theme";

export const storedTheme = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export const systemTheme = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";

export const currentTheme = () => storedTheme() || systemTheme();

// Kept for callers that ask whether the switch should show: it always applies now.
export const themeApplies = () => true;

export const applyTheme = () => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("theme-light", currentTheme() === "light");
};

export const setTheme = (theme) => {
  try { localStorage.setItem(KEY, theme); } catch { /* private mode: just this page */ }
  applyTheme();
  window.dispatchEvent(new Event("vcs-theme"));
};
