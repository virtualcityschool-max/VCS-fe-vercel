import React, { useMemo, useState } from "react";
import { TuitionCard } from "./Tuition";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectLiveSchedule,
  selectSessions,
  selectAssignments,
  joinLiveSession,
} from "../../../store/slices/studentDashboardSlice";
import { useDateFormatters } from "../../../hooks/useDateFormatters";
import ReferralLinkCard from "../../common/ReferralLinkCard";
import StudentWorkspaceCard from "./StudentWorkspaceCard";
import { toastManager } from "../../../utils/toastManager";
import DigitalSessionClock from "../../common/DigitalSessionClock";

const TodayAgendaSidebar = ({
  onOpenSubmitModal,
  onRequestLeave,
  onOpenTimezone,
  onViewAllSchedule,
  onViewAllPlanner,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const liveSchedule = useSelector(selectLiveSchedule) || [];
  const allSessions = useSelector(selectSessions) || [];
  const assignments = useSelector(selectAssignments) || [];
  const { timezone, timezoneAbbr, formatTime } = useDateFormatters();

  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [joiningId, setJoiningId] = useState(null);

  React.useEffect(() => {
    const id = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const todayStr = new Date(currentTime).toDateString();

  // Merge sessions from /classroom/sessions/ and live_schedule for today
  const sessions = useMemo(() => {
    const map = new Map();
    (allSessions || []).forEach((s) => {
      const id = s.id || s.session_id;
      if (id) map.set(id, s);
    });
    (liveSchedule || []).forEach((s) => {
      const id = s.id || s.session_id;
      if (id) map.set(id, { ...(map.get(id) || {}), ...s });
    });
    const list = Array.from(map.values()).filter((s) => {
      if (!s.scheduled_at) return false;
      return new Date(s.scheduled_at).toDateString() === todayStr;
    });
    return list.sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      return new Date(a.scheduled_at) - new Date(b.scheduled_at);
    });
  }, [allSessions, liveSchedule, todayStr]);

  const handleJoinSession = async (sessionToJoin) => {
    if (!sessionToJoin) return;
    const sId = sessionToJoin.id || sessionToJoin.session_id;
    if (!sId) {
      toastManager.error("Invalid session identifier");
      return;
    }

    setJoiningId(sId);
    try {
      const result = await dispatch(joinLiveSession(sId)).unwrap();
      const link = result?.meeting_link || sessionToJoin.meeting_link;
      if (link && typeof link === "string" && link.startsWith("http")) {
        window.open(link, "_blank", "noopener,noreferrer");
      } else {
        toastManager.error("Google Meet link not available yet. Please notify admin or faculty.");
      }
    } catch (err) {
      const fallbackLink = sessionToJoin.meeting_link;
      if (fallbackLink && typeof fallbackLink === "string" && fallbackLink.startsWith("http")) {
        window.open(fallbackLink, "_blank", "noopener,noreferrer");
      } else {
        toastManager.error(
          typeof err === "string" ? err : err?.message || "Failed to join session. Meet link unavailable."
        );
      }
    } finally {
      setJoiningId(null);
    }
  };

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
              const sId = session.id || session.session_id;
              const diffMins = Math.floor(
                (new Date(session.scheduled_at).getTime() - currentTime) / 60000
              );
              const isJoinable = Boolean(
                session.status === "live" ||
                session.can_join === true ||
                (diffMins <= 30 && diffMins >= -90)
              );
              const unlockDate = new Date(
                new Date(session.scheduled_at).getTime() - 30 * 60000
              );
              const unlockTime = formatTime(unlockDate.toISOString(), timezone);

              return (
                <div
                  key={sId}
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
                        {session.title || session.course_title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {session.teacher_name || session.instructor_name || "Assigned Faculty"} • {session.room || "Google Meet"}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {!isJoinable && session.scheduled_at && (
                        <DigitalSessionClock
                          scheduledAt={session.scheduled_at}
                          status={session.status}
                          variant="inline"
                        />
                      )}
                      {isJoinable ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-wider animate-pulse">
                          {session.status === "live" ? "Live Now" : "Join Now"}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[9px] font-mono">
                          Opens {unlockTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {isJoinable ? (
                    <button
                      onClick={() => handleJoinSession(session)}
                      disabled={joiningId === sId}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer"
                    >
                      <i className="fas fa-video text-[10px]" />
                      <span>
                        {joiningId === sId
                          ? "Entering Room..."
                          : session.status === "live"
                          ? "Enter Google Meet (Live Now)"
                          : `Enter Google Meet (Starts in ${Math.max(0, diffMins)}m)`}
                      </span>
                    </button>
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

      {/* Fees: real figures from the student's enrolments */}
      <TuitionCard />

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
