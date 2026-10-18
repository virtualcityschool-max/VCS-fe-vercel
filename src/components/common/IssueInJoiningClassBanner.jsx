import React, { useState } from "react";
import { useSelector } from "react-redux";
import { SessionTroubleshootModal } from "./SessionTroubleshootModal";
import { HelpCircle, AlertTriangle, ChevronRight, Wrench } from "lucide-react";

/**
 * Prominent, flashing trigger & banner for "Issue in Joining Class?"
 * Available variants:
 *  - "banner": Full-width prominent card with flashing red beacon (ideal above session lists)
 *  - "button": Flashing pill badge/button (ideal for toolbars & headers)
 *  - "alert": Inline alert card (ideal inside empty states like "No Sessions Scheduled")
 */
export const IssueInJoiningClassBanner = ({
  variant = "banner",
  className = "",
  userEmail,
  userRole,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useSelector((state) => state.auth || {});

  const effectiveEmail = userEmail || auth.user?.email || "";
  const effectiveRole = userRole || auth.role || "student";

  return (
    <>
      {variant === "button" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-lg animate-pulse cursor-pointer group ${className}`}
          title="Troubleshoot Google Meet, Chrome login, 20-min window, or timezone issues"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <span className="font-extrabold tracking-wide">Issue in Joining Class?</span>
          <HelpCircle className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {variant === "banner" && (
        <div
          className={`relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-[#121630] to-amber-950/20 p-4 shadow-xl transition hover:border-rose-500/50 ${className}`}
        >
          {/* Subtle glowing animated backdrop */}
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500" />
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                    Issue in Joining Class?
                  </h4>
                  <span className="animate-pulse px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-500/30">
                    Troubleshoot Guide
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Google Meet permission error, page not refreshing, 20-min wait window, or timezone mismatch? Click to view all 7 instant fixes.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-rose-950/50 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Fix Joining Issues</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>
        </div>
      )}

      {variant === "alert" && (
        <div
          className={`p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="text-rose-200">
              <strong className="text-white font-bold">Issue in Joining Class?</strong> Check Chrome profile login, 20-min lock, or hard reload page.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition cursor-pointer flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Open Checklist</span>
          </button>
        </div>
      )}

      <SessionTroubleshootModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userEmail={effectiveEmail}
        userRole={effectiveRole}
      />
    </>
  );
};

export default IssueInJoiningClassBanner;
