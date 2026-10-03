import React from "react";
import { useSelector } from "react-redux";
import {
  selectLiveSchedule,
  selectAssignments,
  selectNextSession,
} from "../../../store/slices/studentDashboardSlice";
import { useDateFormatters } from "../../../hooks/useDateFormatters";

const TodayAgendaSidebar = ({
  onOpenSubmitModal,
  onRequestTranscript,
  onRequestLeave,
  onOpenTimezone,
  onViewAllSchedule,
  onViewAllPlanner,
}) => {
  const liveSchedule = useSelector(selectLiveSchedule) || [];
  const assignments = useSelector(selectAssignments) || [];
  const nextSession = useSelector(selectNextSession);
  const { timezone, timezoneAbbr, formatTime } = useDateFormatters();

  // Fallback today's classes
  const fallbackTodaySessions = [
    {
      id: "agenda-math-1",
      title: "Derivatives & Rate of Change",
      course_title: "Cambridge Mathematics",
      teacher_name: "Dr. A. Vance",
      scheduled_at: new Date(Date.now() + 18 * 60000).toISOString(), // 18m from now
      meeting_link: "https://meet.google.com/abc-vcs-math",
      room: "Room 204",
      status: "scheduled",
    },
    {
      id: "agenda-phys-2",
      title: "Electromagnetism Problem Solving",
      course_title: "IGCSE Physics (0625)",
      teacher_name: "Prof. Einstein",
      scheduled_at: new Date(Date.now() + 120 * 60000).toISOString(), // 2h from now
      meeting_link: "https://meet.google.com/xyz-vcs-phys",
      room: "Lab 1",
      status: "scheduled",
    },
    {
      id: "agenda-eng-3",
      title: "Macbeth: Analysis of Act III",
      course_title: "English Language & Lit",
      teacher_name: "Ms. Shakespeare",
      scheduled_at: new Date(Date.now() + 240 * 60000).toISOString(), // 4h from now
      meeting_link: "https://meet.google.com/eng-vcs-lit",
      room: "Hall A",
      status: "scheduled",
    },
  ];

  const sessions = liveSchedule.length > 0 ? liveSchedule : fallbackTodaySessions;

  // Pending assignments
  const pendingAssignments = assignments.filter(
    (a) => a.status === "pending" || a.status === "overdue"
  );

  const fallbackPending = [
    {
      id: "asg-fall-1",
      title: "Calculus Problem Set 4",
      course_title: "Cambridge Mathematics",
      due_date: "2025-12-01",
      status: "pending",
    },
    {
      id: "asg-fall-2",
      title: "Lab Report: Acid-Base Titration",
      course_title: "Cambridge Chemistry",
      due_date: "2025-12-05",
      status: "pending",
    },
  ];

  const displayPending =
    pendingAssignments.length > 0 ? pendingAssignments : fallbackPending;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Today's Live Classes Card (LinkedIn-style List) */}
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
            {sessions.length} Sessions
          </span>
        </div>

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
                      {session.teacher_name || "Assigned Faculty"} • {session.room || "Meet Room"}
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

      {/* 2. Upcoming Deadlines Card (LinkedIn-style Tasks) */}
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
                Assignments &amp; Submissions
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold">
            {displayPending.length} Pending
          </span>
        </div>

        <div className="space-y-2.5">
          {displayPending.slice(0, 3).map((asg) => (
            <div
              key={asg.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">
                  {asg.title}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">
                  {asg.course_title} • Due {asg.due_date || "This Week"}
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
      </div>

      {/* 3. Quick Academic Links (LinkedIn-style Compact Actions) */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
          Quick Academic Actions
        </h4>

        <div className="space-y-1.5 text-xs">
          {onRequestTranscript && (
            <button
              onClick={onRequestTranscript}
              className="w-full p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer text-left"
            >
              <span className="flex items-center gap-2.5">
                <i className="fas fa-file-alt text-indigo-400 text-xs w-4 text-center" />
                <span>Request Official Transcript</span>
              </span>
              <i className="fas fa-chevron-right text-[10px] text-slate-500" />
            </button>
          )}

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
        </div>
      </div>
    </div>
  );
};

export default TodayAgendaSidebar;
