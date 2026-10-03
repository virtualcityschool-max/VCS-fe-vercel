import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getStorageUrl } from "../../../utils/storageUrl";
import { getDisplayName } from "../../../utils/userDisplay";
import { authService } from "../../../services/authService";
import { profileUpdated } from "../../../store/slices/authSlice";
import { toastManager } from "../../../utils/toastManager";

const FinancialStatusSidebar = ({
  onRequestTranscript,
  onApplyFreeAccess,
  onOpenReferral,
  onOpenTimezone,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authProfile = useSelector((s) => s.auth.profile);
  const studentUser = useSelector((s) => s.auth.user);

  const displayName = getDisplayName(authProfile) || studentUser?.username || "Scholar";
  const rollNo = authProfile?.student_profile?.roll_no;
  const gradeLevel = authProfile?.student_profile?.grade_level || "Grade Level";
  const avatarUrl = authProfile?.avatar ? getStorageUrl(authProfile.avatar) : null;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "S";

  const avatarInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toastManager.error("Picture size must be under 5MB");
      return;
    }
    const fd = new FormData();
    fd.append("avatar", file);
    setIsUploading(true);
    try {
      await authService.updateProfile(fd);
      const fresh = await authService.getMe();
      dispatch(profileUpdated(fresh));
      toastManager.success("Profile photo updated successfully!");
    } catch (err) {
      toastManager.error(err?.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Student Identity Card with Direct Photo Upload */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0 group/photo">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden border border-white/15">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-lg font-black">{initials}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => !isUploading && avatarInputRef.current?.click()}
              title="Upload profile picture"
              className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                isUploading
                  ? "bg-black/80 opacity-100 cursor-wait"
                  : "bg-black/60 opacity-0 group-hover/photo:opacity-100 cursor-pointer"
              }`}
            >
              {isUploading ? (
                <i className="fas fa-spinner fa-spin text-white text-xs" />
              ) : (
                <>
                  <i className="fas fa-camera text-white text-xs" />
                  <span className="text-[7px] font-black uppercase text-white">Upload</span>
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

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate">{displayName}</h4>
            <p className="text-[11px] text-slate-400 truncate">{gradeLevel}</p>
            {rollNo && (
              <p className="text-[10px] text-indigo-400 font-mono mt-0.5">
                Roll #{rollNo}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="mt-3.5 w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <i className="fas fa-camera text-[11px] text-indigo-400" />
          <span>{avatarUrl ? "Change Profile Photo" : "Add Student Photo"}</span>
        </button>
      </div>

      {/* 2. Financial Status Card (ALWAYS PAID as requested) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 border border-emerald-500/20 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Financial Status
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
            PAID IN FULL
          </span>
        </div>

        <div className="text-center py-3 bg-white/[0.02] rounded-xl border border-white/5 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Amount Due
          </p>
          <p className="text-3xl font-black text-emerald-400 tracking-tight mt-1 font-poppins">
            $0.00
          </p>
          <p className="text-[11px] text-slate-300 mt-1 flex items-center justify-center gap-1.5">
            <i className="fas fa-check-circle text-emerald-400 text-xs" />
            <span>All enrolled courses & term tuition covered</span>
          </p>
        </div>

        <div className="py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
          <i className="fas fa-shield-alt text-emerald-400 text-sm" />
          <span>Active Student Membership • Good Standing</span>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
          <span>Billing Status:</span>
          <span className="text-emerald-400 font-medium">Up to Date</span>
        </div>
      </div>

      {/* 3. Quick Actions Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
          Quick Actions
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={onRequestTranscript}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <i className="fas fa-file-alt text-xs" />
            </span>
            <span className="text-xs font-semibold">Request Transcript</span>
          </button>

          <button
            onClick={() => navigate("/student?tab=tutors")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <i className="fas fa-chalkboard-teacher text-xs" />
            </span>
            <span className="text-xs font-semibold">My Tutors & Bookings</span>
          </button>

          <button
            onClick={onOpenTimezone}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <i className="fas fa-globe text-xs" />
            </span>
            <span className="text-xs font-semibold">Switch Timezone</span>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <i className="fas fa-user-cog text-xs" />
            </span>
            <span className="text-xs font-semibold">Update Account Profile</span>
          </button>

          <button
            onClick={onApplyFreeAccess}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <i className="fas fa-hand-holding-heart text-xs" />
            </span>
            <span className="text-xs font-semibold">Apply for Free Access</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialStatusSidebar;
