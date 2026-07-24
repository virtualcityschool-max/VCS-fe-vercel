import React, { useMemo, useState } from "react";
import { useDateFormatters } from "../../hooks";
import TimezoneTag from "../ui/TimezoneTag";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAME_TO_NUM = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const todayKey = (() => {
  const t = new Date();
  return `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
})();

const getStatusCls = (status) => {
  const m = {
    scheduled: "bg-blue-100 text-blue-700 border-blue-200",
    live:      "bg-emerald-100 text-emerald-700 border-emerald-200",
    ended:     "bg-slate-100 text-slate-500 border-slate-200",
    cancelled: "bg-red-100 text-red-600 border-red-200",
  };
  return m[status] || m.scheduled;
};

const SessionCalendarView = ({ sessions = [], loading = false }) => {
  const { formatTime, timezoneAbbr } = useDateFormatters();
  const [calendarMonth, setCalendarMonth] = useState(null);

  // Parent sessions (is_child === false) drive the date range when present
  const parentSessions = useMemo(
    () => sessions.filter((s) => s.is_child === false),
    [sessions],
  );

  const { calendarStart, calendarEnd } = useMemo(() => {
    // Use parent sessions for range if available, otherwise fall back to all sessions
    const rangeSessions = parentSessions.length > 0 ? parentSessions : sessions;
    if (!rangeSessions.length) return { calendarStart: null, calendarEnd: null };

    let minTs = Infinity, maxTs = -Infinity;
    rangeSessions.forEach((s) => {
      if (s.scheduled_at) {
        const t = new Date(s.scheduled_at).getTime();
        if (t < minTs) minTs = t;
      }
      // For max: prefer recurrence_end_date, else scheduled_at
      const endStr = s.recurrence_end_date || s.scheduled_at;
      if (endStr) {
        const t = new Date(endStr).getTime();
        if (t > maxTs) maxTs = t;
      }
    });
    return {
      calendarStart: minTs !== Infinity ? new Date(minTs) : null,
      calendarEnd:   maxTs !== -Infinity ? new Date(maxTs) : null,
    };
  }, [parentSessions, sessions]);

  const monthRange = useMemo(() => {
    if (!calendarStart || !calendarEnd) return [];
    const months = [];
    const cur = new Date(calendarStart.getFullYear(), calendarStart.getMonth(), 1);
    const last = new Date(calendarEnd.getFullYear(), calendarEnd.getMonth(), 1);
    while (cur <= last) {
      months.push({ year: cur.getFullYear(), month: cur.getMonth() });
      cur.setMonth(cur.getMonth() + 1);
    }
    return months;
  }, [calendarStart, calendarEnd]);

  const activeMonthIdx = useMemo(() => {
    if (!monthRange.length) return 0;
    if (!calendarMonth) return 0;
    const idx = monthRange.findIndex(
      (m) => m.year === calendarMonth.year && m.month === calendarMonth.month,
    );
    return idx >= 0 ? idx : 0;
  }, [monthRange, calendarMonth]);

  const activeMonthData = monthRange[activeMonthIdx] || null;

  const sessionsByDate = useMemo(() => {
    const map = {};

    sessions.forEach((s) => {
      if (!s.scheduled_at) return;

      const start   = new Date(s.scheduled_at);
      const days    = Array.isArray(s.recurrence_days) ? s.recurrence_days : [];
      const endDate = s.recurrence_end_date
        ? new Date(s.recurrence_end_date.includes("T") ? s.recurrence_end_date : `${s.recurrence_end_date}T23:59:59`)
        : null;

      if (days.length > 0 && endDate) {
        const dayNums = new Set(
          days.map((d) => DAY_NAME_TO_NUM[d.toUpperCase()]).filter((n) => n !== undefined)
        );

        // Walk day by day from start → end, placing a card on each matching weekday
        const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        while (cur <= end) {
          if (dayNums.has(cur.getDay())) {
            const key = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`;
            if (!map[key]) map[key] = [];
            // Avoid duplicate entries for the same session on the same day
            if (!map[key].some((e) => e.id === s.id)) {
              map[key].push(s);
            }
          }
          cur.setDate(cur.getDate() + 1);
        }
      } else {
        // Non-recurring: place on its single scheduled date
        const key = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
        if (!map[key]) map[key] = [];
        if (!map[key].some((e) => e.id === s.id)) {
          map[key].push(s);
        }
      }
    });

    return map;
  }, [sessions]);

  const calendarGrid = useMemo(() => {
    if (!activeMonthData) return [];
    const { year, month } = activeMonthData;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [activeMonthData]);

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
        <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-spinner fa-spin text-indigo-400 text-lg"></i>
        </div>
        <p className="text-slate-400 text-sm">Loading sessions...</p>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
        <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-calendar text-slate-400 text-xl"></i>
        </div>
        <p className="text-white font-bold mb-1">No Classes Found</p>
        <p className="text-slate-400 text-sm">No sessions are available yet.</p>
      </div>
    );
  }

  if (!monthRange.length) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
        <p className="text-slate-400 text-sm">No schedule range could be determined.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Schedule info strip */}
      {/* {calendarStart && calendarEnd && (() => {
        const ref = parentSessions.length > 0 ? parentSessions[0] : sessions[0];
        return (
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-0.5">Schedule Range</p>
              <p className="text-sm text-indigo-300 font-medium">
                {ref?.course?.title || ref?.course_title || ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 ml-auto items-center">
              {ref?.recurrence_days?.length > 0 && (
                <div className="flex gap-1.5">
                  {ref.recurrence_days.map((d) => (
                    <span key={d} className="px-2 py-1 bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold rounded-lg">{d}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-2">
                <i className="fas fa-calendar-alt text-indigo-400 text-xs"></i>
                <span className="text-sm font-semibold text-white">
                  {calendarStart.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <i className="fas fa-arrow-right text-slate-500 text-xs"></i>
                <span className="text-sm font-semibold text-white">
                  {calendarEnd.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              {ref?.teacher_name && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-600/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-indigo-300 text-xs"></i>
                  </div>
                  <span className="text-sm text-slate-300">{ref.teacher_name}</span>
                </div>
    <div className="space-y-4 animate-fadeIn">
      {/* Single-row header: nav left, month tabs right */}
      <div className="glass inline-flex items-center gap-3 p-2 rounded-xl border border-slate-800 shadow-xl">
        {/* Left - prev/next + current month label */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCalendarMonth(monthRange[Math.max(0, activeMonthIdx - 1)])}
            disabled={activeMonthIdx === 0}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-indigo-500 hover:text-white text-slate-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
          >
            <i className="fas fa-chevron-left text-xs" />
          </button>
          <div className="min-w-[110px] text-center">
            <p className="text-sm font-black text-white leading-tight tracking-tight">
              {MONTH_NAMES[activeMonthData.month]}
              <span className="text-indigo-400 ml-1">{activeMonthData.year}</span>
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
              {activeMonthIdx + 1} / {monthRange.length}
            </p>
          </div>
          <button
            onClick={() => setCalendarMonth(monthRange[Math.min(monthRange.length - 1, activeMonthIdx + 1)])}
            disabled={activeMonthIdx === monthRange.length - 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-indigo-500 hover:text-white text-slate-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
          >
            <i className="fas fa-chevron-right text-xs" />
          </button>
        </div>

        {/* Divider */}
        {monthRange.length > 1 && <div className="w-px self-stretch bg-slate-800 shrink-0" />}

        {/* Right - month tabs, vertically scrollable if many */}
        {monthRange.length > 1 && (
          <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-20 custom-scrollbar pr-1">
            {monthRange.map((m, idx) => (
              <button
                key={`${m.year}-${m.month}`}
                onClick={() => setCalendarMonth(m)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-200 shrink-0 ${
                  idx === activeMonthIdx
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-800/60 text-slate-500 hover:bg-slate-700 hover:text-slate-300 border border-slate-700/50"
                }`}
              >
                {MONTH_NAMES[m.month].slice(0, 3)} {String(m.year).slice(2)}
              </button>
            ))}
          </div>
        )}
        <div className="w-px self-stretch bg-slate-800 shrink-0" />
        <TimezoneTag className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400" />
      </div>

      {/* Calendar grid container */}
      <div className="glass rounded-2xl sm:rounded-[2.5rem] border-slate-800 overflow-hidden shadow-2xl backdrop-blur-2xl">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-slate-800/50 bg-slate-950/40">
          {DAY_LABELS.map((d) => (
            <div key={d} className="px-0 py-2 sm:px-4 sm:py-5 text-center text-[8px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-[0.25em] text-slate-500">
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d.slice(0, 2)}</span>
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7">
          {calendarGrid.map((day, idx) => {
            if (!day) {
              return <div key={`blank-${idx}`} className="min-h-[60px] sm:min-h-[100px] border-b border-r border-slate-800/30 bg-slate-950/20" />;
            }
            const cellKey = `${activeMonthData.year}-${activeMonthData.month}-${day}`;
            const daySessions = sessionsByDate[cellKey] || [];
            const isToday = cellKey === todayKey;

            return (
              <div
                key={cellKey}
                className={`min-h-[60px] max-h-[60px] sm:min-h-[100px] sm:max-h-[100px] overflow-y-auto custom-scrollbar border-b border-r border-slate-800/30 p-1 sm:p-1.5 flex flex-col gap-1 sm:gap-1.5 transition-colors duration-300 ${
                  isToday ? "bg-indigo-500/5" : "hover:bg-white/[0.01]"
                }`}
              >
                <div className="flex justify-between items-center px-1">
                  {isToday && (
                    <span className="text-[7px] font-black uppercase tracking-widest text-indigo-400">Today</span>
                  )}
                  <span className={`text-[9px] sm:text-[10px] font-black w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg ml-auto transition-all duration-300 ${
                    isToday 
                      ? "bg-indigo-500 text-white shadow-lg" 
                      : daySessions.length > 0 ? "text-white bg-slate-800/50" : "text-slate-600"
                  }`}>
                    {day}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  {daySessions.map((session) => (
                    <div
                      key={session.id}
                      className="group/session relative bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 pl-2 pr-1 py-1 rounded-lg transition-all duration-200 cursor-pointer"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 opacity-50 group-hover/session:opacity-100 transition-opacity rounded-l-lg" />

                      {/* Time + status row */}
                      <div className="flex items-center gap-0.5 overflow-hidden">
                        <i className="far fa-clock text-[6px] text-indigo-400/80 shrink-0" />
                        <span className="text-[7px] font-semibold tabular-nums text-indigo-400/80 truncate">
                          {formatTime(session.scheduled_at)}
                        </span>
                        <TimezoneTag className="text-[6px] shrink-0 ml-0.5 text-indigo-400/60" />
                        <span className={`ml-auto shrink-0 hidden lg:inline text-[6px] font-black uppercase px-1 py-0.5 rounded border ${
                          session.status === "live"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border-indigo-500/15"
                        }`}>
                          {session.status || "set"}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="text-[8px] font-bold text-slate-100 leading-tight truncate group-hover/session:text-indigo-300 transition-colors mt-0.5">
                        {session.title}
                      </p>

                      {/* Course - large desktop only */}
                      <p className="hidden xl:block text-[7px] text-slate-500 truncate font-medium mt-0.5">
                        {session.course?.title || session.course_title || "General"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SessionCalendarView;
