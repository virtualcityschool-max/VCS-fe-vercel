import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  selectLiveSchedule,
  selectAssignments,
} from "../../../store/slices/studentDashboardSlice";
import { useDateFormatters } from "../../../hooks/useDateFormatters";

const CalendarTab = ({ onOpenSubmitModal }) => {
  const liveSchedule = useSelector(selectLiveSchedule) || [];
  const assignments = useSelector(selectAssignments) || [];
  const { timezone, timezoneAbbr, formatTime, formatDate } = useDateFormatters();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [eventFilter, setEventFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOffset = new Date(year, month, 1).getDay(); // 0 is Sunday
  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Selected date string for comparison
  const selectedDateObj = new Date(year, month, selectedDay);
  const selectedDateStr = selectedDateObj.toDateString();

  // Filter actual sessions for selected day
  const daySessions = liveSchedule.filter((s) => {
    if (!s.scheduled_at) return false;
    return new Date(s.scheduled_at).toDateString() === selectedDateStr;
  });

  // Filter actual assignments for selected day
  const dayAssignments = assignments.filter((a) => {
    if (!a.due_date) return false;
    return new Date(a.due_date).toDateString() === selectedDateStr;
  });

  // Filter with search & eventFilter
  const filteredDayAssignments = dayAssignments.filter((a) => {
    if (eventFilter === "lectures") return false;
    if (
      searchTerm &&
      !a.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(a.course_title || "").toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredDaySessions = daySessions.filter((s) => {
    if (eventFilter === "assignments") return false;
    if (
      searchTerm &&
      !s.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(s.course_title || "").toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Month stats
  const pendingAssignmentsThisMonth = assignments.filter(
    (a) => a.status === "pending" || a.status === "overdue"
  ).length;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Top Mini-Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Live Classes</span>
            <i className="fas fa-video text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {liveSchedule.length}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Scheduled sessions</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Assignments Due</span>
            <i className="fas fa-clipboard-check text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {pendingAssignmentsThisMonth}
          </p>
          <p className="text-[10px] text-amber-400 mt-0.5">
            {pendingAssignmentsThisMonth} pending submission
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Total Assignments</span>
            <i className="fas fa-tasks text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {assignments.length}
          </p>
          <p className="text-[10px] text-purple-300 mt-0.5">In course syllabi</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Current View</span>
            <i className="fas fa-calendar-alt text-blue-400" />
          </div>
          <p className="text-base font-black text-white mt-1 truncate">
            {monthLabel}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Full Month Grid</p>
        </div>
      </div>

      {/* 2. Interactive Academic Calendar */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
        {/* Calendar Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
              <button
                onClick={prevMonth}
                title="Previous Month"
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition cursor-pointer"
              >
                <i className="fas fa-chevron-left text-xs" />
              </button>
              <button
                onClick={nextMonth}
                title="Next Month"
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition cursor-pointer"
              >
                <i className="fas fa-chevron-right text-xs" />
              </button>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              {monthLabel}
            </h3>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-bold">
              {timezoneAbbr}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl text-xs font-bold">
              {["all", "assignments", "lectures"].map((f) => (
                <button
                  key={f}
                  onClick={() => setEventFilter(f)}
                  className={`px-3 py-1 rounded-lg uppercase text-[10px] transition cursor-pointer ${
                    eventFilter === f
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative">
              <i className="fas fa-search absolute left-3 top-2.5 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Live Class
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Assignment Due
          </span>
        </div>

        {/* Calendar Grid */}
        <div className="border border-white/5 rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-800/50 border-b border-white/5 text-center py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-white/5 bg-slate-900/50">
            {/* Pad leading days */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div
                key={`pad-${idx}`}
                className="h-20 p-2 text-slate-700 text-xs font-mono bg-white/[0.01]"
              />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected = selectedDay === day;
              const loopDate = new Date(year, month, day);
              const loopDateStr = loopDate.toDateString();

              const hasSession = liveSchedule.some(
                (s) =>
                  s.scheduled_at &&
                  new Date(s.scheduled_at).toDateString() === loopDateStr
              );
              const hasAssignment = assignments.some(
                (a) =>
                  a.due_date &&
                  new Date(a.due_date).toDateString() === loopDateStr
              );

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 p-1.5 sm:p-2 text-xs flex flex-col justify-between transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/20 border-2 border-indigo-500"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "text-slate-300"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="flex items-center gap-1">
                      {hasSession && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      )}
                      {hasAssignment && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    {hasSession && (
                      <div className="text-[9px] font-bold text-indigo-300 truncate">
                        • Live Class
                      </div>
                    )}
                    {hasAssignment && (
                      <div className="text-[9px] font-bold text-amber-300 truncate">
                        • Due
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Selected Day Schedule & Events Panel (Pure Real Data) */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fas fa-calendar-day text-indigo-400" />
              Schedule &amp; Deadlines for {selectedDateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {filteredDaySessions.length} Scheduled Lecture{filteredDaySessions.length === 1 ? "" : "s"} • {filteredDayAssignments.length} Assignment{filteredDayAssignments.length === 1 ? "" : "s"} Due
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-indigo-600/20 text-indigo-300 text-xs font-bold self-start sm:self-auto font-mono">
            {selectedDateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>

        {/* Assignments Due on this day */}
        {filteredDayAssignments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assignments Due ({filteredDayAssignments.length})
            </h4>
            {filteredDayAssignments.map((asg) => (
              <div
                key={asg.id}
                className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <i className="fas fa-exclamation text-sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300">
                        {asg.status || "Pending"}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        {asg.course_title || "Course"}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {asg.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Due: {formatDate(asg.due_date, timezone)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {onOpenSubmitModal && (
                    <button
                      onClick={() => onOpenSubmitModal(asg)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      Submit Work
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scheduled Lectures on this day */}
        {filteredDaySessions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Google Meet Classes ({filteredDaySessions.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredDaySessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 hover:border-indigo-500/30 transition flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        {formatTime(session.scheduled_at, timezone)}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] font-bold">
                        {session.room || "Google Meet"}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-white mt-1 group-hover:text-indigo-300 transition truncate">
                      {session.course_title || session.title}
                    </h5>
                    <p className="text-xs text-slate-400 truncate">
                      {session.teacher_name || "Assigned Faculty"}
                    </p>
                  </div>

                  <a
                    href={session.meeting_link || "https://meet.google.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white flex items-center justify-center transition shadow-lg shrink-0 cursor-pointer"
                    title="Join Live Class Session"
                  >
                    <i className="fas fa-video text-sm" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredDaySessions.length === 0 && filteredDayAssignments.length === 0 && (
          <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-1.5">
            <i className="fas fa-calendar-check text-2xl text-slate-600" />
            <p className="text-xs font-bold text-white">No Scheduled Events on this Day</p>
            <p className="text-[11px] text-slate-400">
              No live classes or assignment deadlines scheduled for {selectedDateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarTab;
