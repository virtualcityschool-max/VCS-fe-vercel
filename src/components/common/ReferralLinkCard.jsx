import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyReferral,
  selectMyReferral,
  selectMyReferralLoading,
} from "../../store/slices/referralSlice";

/**
 * Compact "Your referral link" card for Student & Teacher dashboards.
 *
 * Shows the user's permanent shareable link with a copy button. The full URL is
 * composed from the current origin + the user's code. Per spec, no referral
 * analytics are shown to the user - just the link. Kept intentionally low-profile
 * so it doesn't dominate the dashboard.
 */
const ReferralLinkCard = ({ className = "" }) => {
  const dispatch = useDispatch();
  const mine = useSelector(selectMyReferral);
  const loading = useSelector(selectMyReferralLoading);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!mine) dispatch(fetchMyReferral());
  }, [dispatch, mine]);

  const code = mine?.code || "";
  const link = code ? `${window.location.origin}/signup?ref=${code}` : "";

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked - user can still select the text manually */
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-indigo-500/15 bg-white/[0.03] backdrop-blur-xl px-5 py-4 flex flex-col justify-center ${className}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 text-xs">
            <i className="fas fa-share-nodes" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white leading-tight">Invite &amp; refer</h3>
            <p className="text-[11px] text-slate-400 leading-tight truncate">
              Share your link, anyone who joins through it is credited to you.
            </p>
          </div>
        </div>

        {loading && !code ? (
          <div className="h-10 rounded-xl bg-slate-800/60 animate-pulse" />
        ) : code ? (
          <div className="flex items-stretch gap-2">
            <div className="flex-1 min-w-0 flex items-center rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-2">
              <span className="truncate text-xs text-slate-200" title={link}>
                {link}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold transition ${
                copied
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
              aria-label="Copy referral link"
            >
              <i className={`fas ${copied ? "fa-check" : "fa-copy"}`} />
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Referral link unavailable.</p>
        )}
      </div>
    </div>
  );
};

export default ReferralLinkCard;
