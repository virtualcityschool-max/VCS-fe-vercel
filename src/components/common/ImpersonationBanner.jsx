import React from "react";
import authStorage from "../../utils/authStorage";
import { restoreAdminSession } from "../../utils/impersonate";

export const ImpersonationBanner = () => {
  const backupStr = typeof window !== "undefined" ? localStorage.getItem("vcs_impersonator_backup") : null;
  if (!backupStr) return null;

  const currentUser = authStorage.getStoredAuthUser() || {};
  const displayName = currentUser.first_name || currentUser.username || currentUser.email || "User";
  const roleName = currentUser.role || "student";

  const handleExit = () => {
    restoreAdminSession("/admin");
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[99999] w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl border-b border-amber-400/40 px-4 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
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
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-black/50 hover:bg-black/70 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all border border-white/30 hover:border-white/50 cursor-pointer"
          title="Exit impersonation and switch back to Admin"
        >
          <span>Exit &amp; Return to Admin</span>
          <span>→</span>
        </button>
      </div>
      {/* Spacer to prevent banner from overlapping the top of page content */}
      <div className="h-9 w-full shrink-0" aria-hidden="true" />
    </>
  );
};

export default ImpersonationBanner;
