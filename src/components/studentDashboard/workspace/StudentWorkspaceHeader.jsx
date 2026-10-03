import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectStudent,
  selectNextSession,
  selectOverdueAssignments,
  selectAssignments,
  selectLiveSchedule,
} from "../../../store/slices/studentDashboardSlice";
import { getDisplayName } from "../../../utils/userDisplay";

const StudentWorkspaceHeader = ({ onResolveOverdue, onJoinNextClass }) => {
  const student = useSelector(selectStudent);
  const authProfile = useSelector((s) => s.auth.profile);
  const nextSession = useSelector(selectNextSession);
  const overdueAssignments = useSelector(selectOverdueAssignments);
  const allAssignments = useSelector(selectAssignments);
  const liveSchedule = useSelector(selectLiveSchedule);

  const displayName = getDisplayName(student) || getDisplayName(authProfile) || "Scholar";
  const rollNo = authProfile?.student_profile?.roll_no;
  const gradeLevel = authProfile?.student_profile?.grade_level || "Grade Level";

  // Calculate live next session
  const activeNextSession = nextSession || (liveSchedule || []).find((s) => s.can_join || s.status === "scheduled");

  // Countdown timer calculation
  const [minsRemaining, setMinsRemaining] = useState(
    activeNextSession?.starts_in_mins ?? 15
  );

  useEffect(() => {
    if (!activeNextSession?.scheduled_at) return;
    const calculateDiff = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(activeNextSession.scheduled_at) - new Date()) / 60000)
      );
      setMinsRemaining(diff);
    };
    calculateDiff();
    const interval = setInterval(calculateDiff, 30000);
    return () => clearInterval(interval);
  }, [activeNextSession]);

  const overdueCount = overdueAssignments?.count || 0;
  const pendingCount = (allAssignments || []).filter((a) => a.status === "pending").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-white/10 p-5 shadow-xl flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Student Workspace
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight">
            Welcome back, {displayName}!
          </h2>
          <p className="text-xs text-indigo-300/80 font-medium mt-0.5">
            Fall / Winter Term 2025–2026 • {gradeLevel}
          </p>
        </div>
        {rollNo && (
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Roll: <strong className="text-slate-200">{rollNo}</strong></span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold text-[10px]">
              Active Learner
            </span>
          </div>
        )}
      </div>

      {/* 2. Next Class Live Countdown */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
            <i className="fas fa-clock text-base" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {activeNextSession
                ? minsRemaining <= 60
                  ? `NEXT CLASS (IN ${minsRemaining} MINS)`
                  : "NEXT SCHEDULED CLASS"
                : "NO SESSIONS SCHEDULED TODAY"}
            </div>
            <h3 className="text-base font-black text-white truncate mt-0.5">
              {activeNextSession?.course_title || activeNextSession?.title || "Free Study Block"}
            </h3>
            <p className="text-xs text-slate-400 truncate">
              {activeNextSession?.instructor_name || activeNextSession?.teacher_name
                ? `Tutor: ${activeNextSession.instructor_name || activeNextSession.teacher_name}`
                : "Review notes or prepare upcoming assignments"}
            </p>
          </div>
        </div>

        {activeNextSession?.meeting_link ? (
          <a
            href={activeNextSession.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-900/30"
          >
            <i className="fas fa-video text-xs" />
            Join Live Class
          </a>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <i className="fas fa-calendar-check text-[10px] text-slate-400" />
            <span>Schedule synced with Cambridge term</span>
          </div>
        )}
      </div>

      {/* 3. Action Required Alert Card */}
      {overdueCount > 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/40 via-slate-900/90 to-slate-900 border border-red-500/30 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
              <i className="fas fa-exclamation-triangle text-base animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-red-400">
                ACTION REQUIRED
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                {overdueCount} Assignment{overdueCount > 1 ? "s" : ""} Past Due
              </h3>
              <p className="text-xs text-slate-400">
                Resolve past deadlines to protect your grading standing.
              </p>
            </div>
          </div>
          <button
            onClick={onResolveOverdue}
            className="mt-3 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-900/30"
          >
            View & Resolve
            <i className="fas fa-arrow-right text-[10px]" />
          </button>
        </div>
      ) : pendingCount > 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-900 border border-amber-500/20 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-400">
              <i className="fas fa-tasks text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                TASKS IN PROGRESS
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                {pendingCount} Pending Assignment{pendingCount > 1 ? "s" : ""}
              </h3>
              <p className="text-xs text-slate-400">
                Upcoming deadlines on your calendar this week.
              </p>
            </div>
          </div>
          <button
            onClick={onResolveOverdue}
            className="mt-3 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold transition"
          >
            View Submissions
            <i className="fas fa-arrow-right text-[10px]" />
          </button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900/90 to-slate-900 border border-emerald-500/20 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0 text-emerald-400">
              <i className="fas fa-check-circle text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                ALL CAUGHT UP
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                No Pending Overdue Items
              </h3>
              <p className="text-xs text-slate-400">
                All submissions up to date. Excellent work!
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
            <i className="fas fa-award text-xs" />
            <span>Academic Standing: Exemplary</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentWorkspaceHeader;
