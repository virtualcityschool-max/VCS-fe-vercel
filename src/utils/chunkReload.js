// After a new deploy, old tabs ask for code files (chunks) that no longer
// exist and the dynamic import fails. Reload once to pick up the new version.
const KEY = "vcs-chunk-reload-at";
const WINDOW_MS = 30000;

export function isChunkLoadError(error) {
  const msg = String(error?.message || error || "");
  return (
    error?.name === "ChunkLoadError" ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /Unable to preload CSS/i.test(msg) ||
    /Loading (CSS )?chunk [\w-]+ failed/i.test(msg)
  );
}

// Returns true when a reload was started. Only one reload per 30 s, so a
// genuinely missing file can't put the tab into a reload loop.
export function reloadOnceForNewVersion() {
  let last = 0;
  try {
    last = Number(sessionStorage.getItem(KEY) || 0);
  } catch {
    /* storage blocked */
  }
  if (Date.now() - last < WINDOW_MS) return false;
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

export function installChunkReloadHandlers() {
  // Vite fires this when a preloaded chunk fails.
  window.addEventListener("vite:preloadError", (event) => {
    if (reloadOnceForNewVersion()) event.preventDefault();
  });
  window.addEventListener("unhandledrejection", (event) => {
    if (isChunkLoadError(event.reason) && reloadOnceForNewVersion()) event.preventDefault();
  });
}
