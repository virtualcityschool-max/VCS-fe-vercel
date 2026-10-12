import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSessions,
  selectLiveSchedule,
  selectAssignments,
  selectDashboardQuizzes,
  joinLiveSession,
} from "../../../store/slices/studentDashboardSlice";
import { useDateFormatters } from "../../../hooks/useDateFormatters";
import { toastManager } from "../../../utils/toastManager";

const WeeklyPlannerTab = ({ onOpenLiveSchedule }) => {
  const dispatch = useDispatch();
  const allSessions = useSelector(selectSessions) || [];
  const liveSchedule = useSelector(selectLiveSchedule) || [];
  const assignments = useSelector(selectAssignments) || [];
  const quizzes = useSelector(selectDashboardQuizzes) || [];
  const [nowMs] = useState(() => Date.now());
  const { timezone, timezoneAbbr, formatTime, formatDate } = useDateFormatters();

  const [joiningId, setJoiningId] = useState(null);

  // Determine current day of week (0 = Sunday, 1 = Monday ... 6 = Saturday)
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = new Date().getDay();
  const initialDay = DAY_NAMES[currentDayIndex] || "Sunday";

  const [selectedDay, setSelectedDay] = useState(initialDay);

  // Merge real sessions from /classroom/sessions/ and live_schedule
  const realSessions = useMemo(() => {
    const map = new Map();
    (allSessions || []).forEach((s) => {
      const id = s.id || s.session_id;
      if (id) map.set(id, s);
    });
    (liveSchedule || []).forEach((s) => {
      const id = s.id || s.session_id;
      if (id) map.set(id, { ...(map.get(id) || {}), ...s });
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      return new Date(b.scheduled_at) - new Date(a.scheduled_at);
    });
  }, [allSessions, liveSchedule]);

  const handleJoinClass = async (sessionToJoin) => {
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

  // Map real sessions into weekly timetable rows
  const mappedSchedule = useMemo(() => {
    if (!realSessions.length) return [];
    return realSessions.map((s) => {
      const dateObj = new Date(s.scheduled_at);
      let dayName = "Sunday";
      try {
        dayName = new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          timeZone: timezone || undefined,
        }).format(dateObj);
      } catch (e) {
        dayName = DAY_NAMES[dateObj.getDay()] || "Sunday";
      }

      const diffMins = s.scheduled_at
        ? Math.floor((dateObj.getTime() - Date.now()) / 60000)
        : null;
      const canJoin = Boolean(
        s.meeting_link ||
        s.status === "live" ||
        s.can_join === true
      );

      return {
        id: s.id || s.session_id,
        rawSession: s,
        day: dayName,
        time: s.scheduled_at ? formatTime(s.scheduled_at, timezone) : "TBD",
        dateFormatted: s.scheduled_at ? formatDate(s.scheduled_at, timezone) : "",
        subject: s.course_title || (s.course && s.course.title) || s.title || "Live Class",
        code: s.category || (s.course && s.course.code) || "Curriculum",
        tutor: s.teacher_name || s.instructor_name || "Faculty Instructor",
        room: s.room || "Google Meet",
        topic: s.title || s.description || s.course_title || "Class Session",
        status: s.status,
        canJoin,
        diffMins,
        meeting_link: s.meeting_link,
      };
    });
  }, [realSessions, timezone, formatTime, formatDate]);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "All Days"];

  const filteredSchedule =
    selectedDay === "All Days"
      ? mappedSchedule
      : mappedSchedule.filter((item) => item.day === selectedDay);

  // Next real deadlines: unsubmitted assignments and unattempted quizzes that are still open
  const upcomingDeadlines = [
    ...assignments
      .filter((a) => a.due_date && (a.status === "pending" || !a.status))
      .map((a) => ({ id: `a-${a.id}`, due: a.due_date, title: a.title, kind: "Assignment", course: a.course_title, border: "border-l-indigo-500" })),
    ...quizzes
      .filter((q) => q.due_date && !q.is_overdue && (!q.my_submission || q.my_submission.status === "pending"))
      .map((q) => ({ id: `q-${q.id}`, due: q.due_date, title: q.title, kind: "Quiz", course: q.course_title, border: "border-l-emerald-500" })),
  ]
    .filter((d) => new Date(d.due).getTime() >= nowMs)
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Weekly Curriculum Planner &amp; Timetable
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold">
              Gulf &amp; Global 7-Day Timetable
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recurring academic curriculum across Sunday to Saturday (Gulf Sunday start &amp; Friday prayer breaks included). Times shown in your local timezone ({timezoneAbbr}).
          </p>
        </div>

        {onOpenLiveSchedule && (
          <button
            onClick={onOpenLiveSchedule}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 self-start sm:self-center"
          >
            <i className="fas fa-video text-xs" />
            <span>Join Live Google Meet &rarr;</span>
          </button>
        )}
      </div>

      {/* 2. Day Selector Strip */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
        {days.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = day === DAY_NAMES[currentDayIndex];

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold uppercase">
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Timetable Grid */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <i className="fas fa-clock text-indigo-400 text-sm" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              {selectedDay === "All Days" ? "Full Week Curriculum Timetable" : `${selectedDay} Timetable`} ({filteredSchedule.length} Periods)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-indigo-300">
            Timezone: {timezoneAbbr}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase font-bold text-slate-400">
                {selectedDay === "All Days" && <th className="py-3 px-3">Day</th>}
                <th className="py-3 px-3">Time Slot</th>
                <th className="py-3 px-3">Subject &amp; Syllabus</th>
                <th className="py-3 px-3">Weekly Curriculum Topic</th>
                <th className="py-3 px-3">Assigned Faculty</th>
                <th className="py-3 px-3 text-right">Classroom / Lab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSchedule.length > 0 ? (
                filteredSchedule.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-white/[0.02] transition">
                    {selectedDay === "All Days" && (
                      <td className="py-3.5 px-3 font-bold text-indigo-400 whitespace-nowrap">
                        {row.day}
                      </td>
                    )}
                    <td className="py-3.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      {row.time}
                      {row.dateFormatted && (
                        <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                          {row.dateFormatted}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-white block">{row.subject}</span>
                      <span className="text-[10px] font-mono text-indigo-400">{row.code}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 text-xs max-w-xs">
                      {row.topic}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                      <i className="fas fa-chalkboard-teacher text-slate-500 mr-1.5" />
                      {row.tutor}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      {row.canJoin ? (
                        <button
                          onClick={() => handleJoinClass(row.rawSession)}
                          disabled={joiningId === row.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] inline-flex items-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
                        >
                          <i className="fas fa-video text-[10px]" />
                          <span>{joiningId === row.id ? "Entering..." : "Join Now"}</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                          {row.room}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={selectedDay === "All Days" ? 6 : 5} className="py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
                      <i className="fas fa-calendar-times text-xl" />
                    </div>
                    <p className="text-white font-bold text-sm">No Live Classes Scheduled for {selectedDay}</p>
                    <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
                      Classes planned on the admin dashboard will automatically appear here in your weekly planner. Select &quot;All Days&quot; to inspect all scheduled sessions.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Upcoming deadlines (real assignments & quizzes) */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-hourglass-half text-indigo-400 text-sm" />
          <h3 className="text-sm font-bold text-white tracking-tight">Upcoming Deadlines</h3>
        </div>
        {upcomingDeadlines.length === 0 ? (
          <p className="text-xs text-slate-400">No assignment or quiz deadlines coming up.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingDeadlines.map((d) => (
              <div
                key={d.id}
                className={`p-4 rounded-xl bg-white/[0.02] border border-white/5 border-l-4 ${d.border} flex flex-col justify-between space-y-2`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {formatDate(d.due)} · {formatTime(d.due)}
                  </span>
                  <h4 className="font-bold text-xs text-white mt-1">{d.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400">{d.kind}{d.course ? ` · ${d.course}` : ""}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyPlannerTab;
