import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { authService } from "../../services/authService";
import { profileUpdated } from "../../store/slices/authSlice";
import { toastManager } from "../../utils/toastManager";
import { TIMEZONES } from "../../utils/timezones";
import { getTimezoneAbbr } from "../../utils/validation";

const TimezoneModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const authProfile = useSelector((s) => s.auth.profile);
  const currentTimezone = authProfile?.timezone || localStorage.getItem("vcs_user_timezone") || "";

  const [selectedTz, setSelectedTz] = useState(currentTimezone);
  const [isSaving, setIsSaving] = useState(false);

  // Sync selected timezone whenever modal opens or profile changes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedTz(authProfile?.timezone || localStorage.getItem("vcs_user_timezone") || "");
    }
  }, [isOpen, authProfile?.timezone]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      // 1. Immediately persist to localStorage for instant client-side reactivity
      if (selectedTz) {
        localStorage.setItem("vcs_user_timezone", selectedTz);
      } else {
        localStorage.removeItem("vcs_user_timezone");
      }

      // 2. Immediately update Redux store so all hooks and components re-render instantly
      const updatedProfile = { ...(authProfile || {}), timezone: selectedTz };
      dispatch(profileUpdated(updatedProfile));

      // 3. Attempt backend update (non-blocking if backend ignores or fails)
      try {
        await authService.updateProfile({ timezone: selectedTz });
      } catch (backendErr) {
        console.warn("Backend updateProfile timezone warning:", backendErr);
      }

      const label = TIMEZONES.find((t) => t.value === selectedTz)?.label || selectedTz || "Auto-Detected (System Local)";
      toastManager.success(`Timezone updated to ${label}`);
      onClose();
    } catch (err) {
      toastManager.error(err?.message || "Failed to update timezone");
    } finally {
      setIsSaving(false);
    }
  };

  const previewTime = (tz) => {
    try {
      const opts = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      };
      if (tz) opts.timeZone = tz;
      return new Date().toLocaleTimeString("en-US", opts);
    } catch {
      return new Date().toLocaleTimeString();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <i className="fas fa-globe text-base" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select Your Timezone</h3>
              <p className="text-xs text-slate-400">
                Adjusts all class times, countdowns, and schedule deadlines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <i className="fas fa-times text-xs" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Preview Time
            </span>
            <p className="text-xl font-black text-white font-mono mt-0.5">
              {previewTime(selectedTz)}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs">
            {getTimezoneAbbr(selectedTz) || "LOCAL"}
          </span>
        </div>

        {/* Form Selection */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Regional Timezone
            </label>
            <select
              value={selectedTz}
              onChange={(e) => setSelectedTz(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedTz("")}
              className="text-xs text-slate-400 hover:text-white underline transition"
            >
              Reset to Browser Local
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                {isSaving && <i className="fas fa-spinner fa-spin" />}
                <span>Save Timezone</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimezoneModal;
