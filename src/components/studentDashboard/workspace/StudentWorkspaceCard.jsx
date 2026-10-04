import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectStudent } from "../../../store/slices/studentDashboardSlice";
import { profileUpdated } from "../../../store/slices/authSlice";
import { authService } from "../../../services/authService";
import { toastManager } from "../../../utils/toastManager";
import { getDisplayName } from "../../../utils/userDisplay";
import { getStorageUrl } from "../../../utils/storageUrl";
import { getTimezoneAbbr } from "../../../utils/validation";

const StudentWorkspaceCard = ({ onOpenTimezone }) => {
  const dispatch = useDispatch();
  const student = useSelector(selectStudent);
  const authProfile = useSelector((s) => s.auth.profile);

  const displayName = getDisplayName(student) || getDisplayName(authProfile) || "Scholar";
  const rollNo = authProfile?.student_profile?.roll_no;
  const gradeLevel = authProfile?.student_profile?.grade_level || "Grade Level";

  // Avatar upload handling
  const avatarInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarUrl = authProfile?.avatar ? getStorageUrl(authProfile.avatar) : null;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "S";

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toastManager.error("Picture size must be under 5MB");
      return;
    }
    const fd = new FormData();
    fd.append("avatar", file);
    setIsUploadingAvatar(true);
    try {
      await authService.updateProfile(fd);
      const fresh = await authService.getMe();
      dispatch(profileUpdated(fresh));
      toastManager.success("Profile photo updated successfully!");
    } catch (err) {
      toastManager.error(err?.message || "Failed to upload profile photo");
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // Timezone information with fallback to localStorage
  const storeTimezone = useSelector((s) => s.auth.profile?.timezone);
  const timezone = storeTimezone || (typeof window !== "undefined" ? localStorage.getItem("vcs_user_timezone") : null) || undefined;
  const timezoneAbbr = getTimezoneAbbr(timezone) || "LOCAL";
  const displayTz = timezone ? timezone.split("/").pop().replace(/_/g, " ") : "Auto-Detected";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-white/10 p-5 shadow-xl flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-4">
        {/* Student Profile Picture with Upload Camera Overlay */}
        <div className="relative shrink-0 group/avatar">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 overflow-hidden border-2 border-white/10">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-xl font-black">{initials}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()}
            title="Click to add or change your student photo"
            className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all ${
              isUploadingAvatar
                ? "bg-black/80 opacity-100 cursor-wait"
                : "bg-black/60 opacity-0 group-hover/avatar:opacity-100 cursor-pointer"
            }`}
          >
            {isUploadingAvatar ? (
              <i className="fas fa-spinner fa-spin text-white text-sm" />
            ) : (
              <>
                <i className="fas fa-camera text-white text-xs" />
                <span className="text-[8px] font-black uppercase tracking-wider text-white">
                  Photo
                </span>
              </>
            )}
          </button>

          <input
            ref={avatarInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        {/* Greeting, Timezone Switcher & Clean Financial Status Badge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Student Workspace
            </span>
          </div>
          <h2 className="text-base lg:text-lg font-black text-white tracking-tight truncate">
            {displayName}
          </h2>
          <p className="text-[11px] text-indigo-300/80 font-medium truncate">
            {gradeLevel} • Term 2025–26
          </p>

          {/* Timezone pill button & Clean Paid Tuition Status */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onOpenTimezone}
              title="Click to switch your timezone"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white text-[11px] font-semibold transition cursor-pointer"
            >
              <i className="fas fa-globe text-indigo-400 text-xs" />
              <span>{displayTz}</span>
              <span className="text-indigo-400 font-bold">({timezoneAbbr})</span>
              <span className="text-slate-400 text-[10px] ml-0.5">Switch</span>
            </button>

            {/* Clean Tuition Status (Always Paid) */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-[11px] font-bold shadow-sm">
              <i className="fas fa-check-circle text-emerald-400 text-xs" />
              <span>Tuition: Paid ($0.00)</span>
            </span>
          </div>
        </div>
      </div>

      {rollNo && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Roll: <strong className="text-slate-200">{rollNo}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold text-[10px]">
            Active Learner • In Good Standing
          </span>
        </div>
      )}
    </div>
  );
};

export default StudentWorkspaceCard;
