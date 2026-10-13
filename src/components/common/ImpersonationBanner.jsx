import React from "react";
import authStorage from "../../utils/authStorage";

export const ImpersonationBanner = () => {
  const backupStr = typeof window !== "undefined" ? localStorage.getItem("vcs_impersonator_backup") : null;
  if (!backupStr) return null;

  let backup = null;
  try {
    backup = JSON.parse(backupStr);
  } catch (e) {
    return null;
  }

  const currentUser = authStorage.getStoredAuthUser() || {};
  const displayName = currentUser.first_name || currentUser.username || currentUser.email || "User";
  const roleName = currentUser.role || "student";

  const handleExit = () => {
    try {
      if (backup.access) {
        authStorage.setAccessToken(backup.access);
      }
      if (backup.refresh) {
        localStorage.setItem("vcs_refresh_token", backup.refresh);
      }
      if (backup.user) {
        authStorage.setStoredAuthUser(backup.user);
      }
    } catch (err) {
      console.error("Error restoring admin auth:", err);
    } finally {
      localStorage.removeItem("vcs_impersonator_backup");
      window.location.href = "/admin";
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-lg border-b border-amber-400/40 px-4 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
      <div className="flex items-center gap-2 min-w-0">
        <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-white font-bold text-xs">
          👁
        </span>
        <span className="truncate">
          <strong>Impersonation Mode:</strong> Viewing as{" "}
          <span className="font-bold underline decoration-amber-300">{displayName}</span>{" "}
          <span className="opacity-90 capitalize">({roleName})</span>
        </span>
      </div>

      <button
        type="button"
        onClick={handleExit}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-black/40 hover:bg-black/60 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all border border-white/20 hover:border-white/40 cursor-pointer"
        title="Exit impersonation and switch back to Admin"
      >
        <span>Exit &amp; Return to Admin</span>
        <span>→</span>
      </button>
    </div>
  );
};

export default ImpersonationBanner;
