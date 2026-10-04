import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectLiveSchedule,
  selectAssignments,
} from "../../../store/slices/studentDashboardSlice";
import { useDateFormatters } from "../../../hooks/useDateFormatters";
import ReferralLinkCard from "../../common/ReferralLinkCard";
import StudentWorkspaceCard from "./StudentWorkspaceCard";

const TodayAgendaSidebar = ({
  onOpenSubmitModal,
  onRequestLeave,
  onOpenTimezone,
  onViewAllSchedule,
  onViewAllPlanner,
}) => {
  const navigate = useNavigate();
  const liveSchedule = useSelector(selectLiveSchedule) || [];
  const assignments = useSelector(selectAssignments) || [];
  const { timezone, timezoneAbbr, formatTime } = useDateFormatters();

  // Filter actual today's live sessions from Redux (no mock dummy fallbacks)
  const todayStr = new Date().toDateString();
  const sessions = liveSchedule.filter((s) => {
    if (!s.scheduled_at) return false;
    return new Date(s.scheduled_at).toDateString() === todayStr;
  });

  // Filter actual pending & overdue assignments (no mock dummy fallbacks)
  const pendingAssignments = assignments.filter(
    (a) => a.status === "pending" || a.status === "overdue"
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 0. Student Workspace Profile Card */}
      <StudentWorkspaceCard onOpenTimezone={onOpenTimezone} />

      {/* 1. Today's Live Classes Card (Real Data & Clean Empty State) */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <i className="fas fa-video text-xs" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                Today's Live Classes
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Google Meet • {timezoneAbbr}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold">
            {sessions.length} Session{sessions.length === 1 ? "" : "s"}
          </span>
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.slice(0, 3).map((session) => {
              const diffMins = Math.floor(
                (new Date(session.scheduled_at).getTime() - Date.now()) / 60000
              );
              const isJoinable = diffMins <= 30 && diffMins >= -60;
              const unlockDate = new Date(
                new Date(session.scheduled_at).getTime() - 30 * 60000
              );
              const unlockTime = formatTime(unlockDate.toISOString(), timezone);

              return (
                <div
                  key={session.id}
                  className={`p-3 rounded-xl border transition flex flex-col gap-2 ${
                    isJoinable
                      ? "bg-emerald-950/20 border-emerald-500/30 shadow-md shadow-emerald-950/20"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isJoinable ? "bg-emerald-400 animate-pulse" : "bg-blue-400"
                          }`}
                        />
                        <span className="text-[10px] font-mono font-bold text-indigo-300 truncate">
                          {formatTime(session.scheduled_at, timezone)} ({timezoneAbbr})
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">
                        {session.course_title || session.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {session.teacher_name || session.instructor_name || "Assigned Faculty"} • {session.room || "Google Meet"}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isJoinable ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-wider animate-pulse">
                          Join Now
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[9px] font-mono">
                          Opens {unlockTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {isJoinable ? (
                    <a
                      href={session.meeting_link || "https://meet.google.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer"
                    >
                      <i className="fas fa-video text-[10px]" />
                      <span>Enter Google Meet (Starts in {Math.max(0, diffMins)}m)</span>
                    </a>
                  ) : (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <i className="fas fa-lock text-[9px] text-slate-400" />
                      <span>Meet link unlocks 30 min before class ({unlockTime})</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <i className="fas fa-calendar-check text-xs" />
            </div>
            <p className="text-xs font-bold text-white">No Live Classes Today</p>
            <p className="text-[11px] text-slate-400">
              When faculty initiates a session, your Google Meet link unlocks 30 minutes prior.
            </p>
          </div>
        )}

        <div className="pt-1 flex items-center justify-between text-xs">
          {onViewAllSchedule && (
            <button
              onClick={onViewAllSchedule}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              <span>Live Schedule</span>
              <i className="fas fa-arrow-right text-[10px]" />
            </button>
          )}

          {onViewAllPlanner && (
            <button
              onClick={onViewAllPlanner}
              className="text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer text-[11px]"
            >
              <span>Weekly Planner</span>
              <i className="fas fa-calendar-alt text-[10px]" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Upcoming Deadlines Card (Real Pending Assignments & Clean Empty State) */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <i className="fas fa-clock text-xs" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                Upcoming Deadlines
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Pending Submissions
              </p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            pendingAssignments.length > 0
              ? "bg-amber-500/15 text-amber-300"
              : "bg-emerald-500/15 text-emerald-300"
          }`}>
            {pendingAssignments.length} Pending
          </span>
        </div>

        {pendingAssignments.length > 0 ? (
          <div className="space-y-2.5">
            {pendingAssignments.slice(0, 3).map((asg) => (
              <div
                key={asg.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">
                    {asg.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {asg.course_title || "Course"} • Due {asg.due_date || "This Term"}
                  </p>
                </div>

                {onOpenSubmitModal && (
                  <button
                    onClick={() => onOpenSubmitModal(asg)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    <i className="fas fa-upload text-[9px]" />
                    <span>Submit</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <i className="fas fa-check-circle text-xs" />
            </div>
            <p className="text-xs font-bold text-white">All Caught Up!</p>
            <p className="text-[11px] text-slate-400">
              No pending assignments due this week.
            </p>
          </div>
        )}
      </div>

      {/* 3. Financial Status Card (ALWAYS PAID IN FULL - As Requested) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 border border-emerald-500/20 p-5 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-tight leading-none">
              Financial Status
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-black uppercase tracking-wider">
            PAID IN FULL
          </span>
        </div>

        <div className="text-center py-2.5 bg-white/[0.02] rounded-xl border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Amount Due
          </p>
          <p className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5 font-poppins">
            $0.00
          </p>
          <p className="text-[10px] text-slate-300 mt-1 flex items-center justify-center gap-1.5">
            <i className="fas fa-check-circle text-emerald-400 text-xs" />
            <span>All enrolled courses &amp; active term covered</span>
          </p>
        </div>

        <div className="py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-2">
          <i className="fas fa-shield-alt text-emerald-400 text-xs" />
          <span>Active Student Membership • Good Standing</span>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Billing Status:</span>
          <span className="text-emerald-400 font-semibold">Up to Date</span>
        </div>
      </div>

      {/* 4. Quick Actions Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
          Quick Academic Actions
        </h4>

        <div className="space-y-1.5 text-xs">
          {onRequestLeave && (
            <button
              onClick={onRequestLeave}
              className="w-full p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer text-left"
            >
              <span className="flex items-center gap-2.5">
                <i className="fas fa-calendar-times text-amber-400 text-xs w-4 text-center" />
                <span>Request Leave / Absence Notice</span>
              </span>
              <i className="fas fa-chevron-right text-[10px] text-slate-500" />
            </button>
          )}

          {onOpenTimezone && (
            <button
              onClick={onOpenTimezone}
              className="w-full p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer text-left"
            >
              <span className="flex items-center gap-2.5">
                <i className="fas fa-globe text-blue-400 text-xs w-4 text-center" />
                <span>Switch Regional Timezone ({timezoneAbbr})</span>
              </span>
              <i className="fas fa-chevron-right text-[10px] text-slate-500" />
            </button>
          )}

          <button
            onClick={() => navigate("/profile")}
            className="w-full p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer text-left"
          >
            <span className="flex items-center gap-2.5">
              <i className="fas fa-user-gear text-emerald-400 text-xs w-4 text-center" />
              <span>Update Account Profile</span>
            </span>
            <i className="fas fa-chevron-right text-[10px] text-slate-500" />
          </button>

          <button
            onClick={() => navigate("/courses")}
            className="w-full p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer text-left"
          >
            <span className="flex items-center gap-2.5">
              <i className="fas fa-compass text-indigo-400 text-xs w-4 text-center" />
              <span>Browse Course Catalog</span>
            </span>
            <i className="fas fa-chevron-right text-[10px] text-slate-500" />
          </button>
        </div>
      </div>

      {/* 5. Invite & Refer Permanent Link Card */}
      <ReferralLinkCard />
    </div>
  );
};

export default TodayAgendaSidebar;
