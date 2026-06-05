import React, { useMemo, useState } from "react";
import { Button, FilterSelect, Input, TimezoneTag } from "../../components/ui";
import SessionCalendarView from "../common/SessionCalendarView";
import { clampDate } from "../../utils/validation";
import { useDateFormatters } from "../../hooks";

/** Why a course is ineligible for a NEW SCHEDULED (recurring) session, or null if eligible. */
const scheduledCourseReason = (c) => {
  if (c.status === "draft")     return "Not published yet";
  if (c.status === "completed") return "Course already completed";
  if (c.status === "archived")  return "Course is archived";
  if (c.status !== "published") return `Status: ${c.status}`;
  if (c.has_session)            return "Already has a recurring session";
  return null;
};

/** Renders grouped <option> list: eligible on top, disabled ineligible below. */
const ScheduledCourseOptions = ({ courses = [] }) => {
  const eligible   = courses.filter(c => scheduledCourseReason(c) === null);
  const ineligible = courses.filter(c => scheduledCourseReason(c) !== null);
  return (
    <>
      <option value="">Select a course</option>
      {eligible.length > 0 && (
        <optgroup label="─── Available ───">
          {eligible.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </optgroup>
      )}
      {ineligible.length > 0 && (
        <optgroup label="─── Unavailable ───">
          {ineligible.map(c => (
            <option key={c.id} value={c.id} disabled>{`${c.title} (${scheduledCourseReason(c)})`}</option>
          ))}
        </optgroup>
      )}
    </>
  );
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const SessionsTab = ({
  sessions,
  courses,
  teachers = [],
  loading,
  loadingSessionIds,
  updatingSessionId,
  isCreatingSession = false,
  editSessionForm,
  setEditSessionForm,
  originalEditForm,
  createSessionForm,
  setCreateSessionForm,
  createSessionErrors,
  clearCreateSessionFieldError,
  editSessionErrors,
  clearEditSessionFieldError,
  onSessionCreate,
  onSessionUpdate,
  onSessionDelete,
  onSessionEdit,
  activeModal,
  setActiveModal,
  showSessionFilters,
  setShowSessionFilters,
  sessionFilters,
  setSessionFilters,
  createMode = "scheduled",
  setCreateMode,
  delayHours = 0,
  setDelayHours,
  delayMins = 30,
  setDelayMins,
}) => {
  const { formatDate, formatTime, timezoneAbbr } = useDateFormatters();
  const [view, setView] = useState("table");
  const [calendarMonth, setCalendarMonth] = useState(null); // { year, month } — null = auto from data

  // ── filtered sessions (search only; teacher filtering is done server-side) ──
  const filteredSessions = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];
    return sessions.filter((session) => {
      if (!sessionFilters.search) return true;
      const q = sessionFilters.search.toLowerCase();
      return (
        session.title?.toLowerCase().includes(q) ||
        (session.course?.title || session.course_title)?.toLowerCase().includes(q) ||
        session.teacher_name?.toLowerCase().includes(q)
      );
    });
  }, [sessions, sessionFilters.search]);

  // ── parent sessions (is_child === false) drive the calendar date range ──
  const parentSessions = useMemo(
    () => filteredSessions.filter((s) => s.is_child === false),
    [filteredSessions],
  );

  // min date = earliest scheduled_at among parents; max date = latest recurrence_end_date among parents
  const { calendarStart, calendarEnd } = useMemo(() => {
    if (parentSessions.length === 0) return { calendarStart: null, calendarEnd: null };

    let minTs = Infinity;
    let maxTs = -Infinity;

    parentSessions.forEach((s) => {
      if (s.scheduled_at) {
        const t = new Date(s.scheduled_at).getTime();
        if (t < minTs) minTs = t;
      }
      const endStr = s.recurrence_end_date || s.scheduled_at;
      if (endStr) {
        const t = new Date(endStr).getTime();
        if (t > maxTs) maxTs = t;
      }
    });

    return {
      calendarStart: minTs !== Infinity ? new Date(minTs) : null,
      calendarEnd: maxTs !== -Infinity ? new Date(maxTs) : null,
    };
  }, [parentSessions]);

  // derive month range to render
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

  // active calendar month index (default to first month in range)
  const activeMonthIdx = useMemo(() => {
    if (monthRange.length === 0) return 0;
    if (calendarMonth === null) return 0;
    const idx = monthRange.findIndex(
      (m) => m.year === calendarMonth.year && m.month === calendarMonth.month,
    );
    return idx >= 0 ? idx : 0;
  }, [monthRange, calendarMonth]);

  const activeMonthData = monthRange[activeMonthIdx] || null;

  // build a dateKey → sessions[] map for quick lookup
  const sessionsByDate = useMemo(() => {
    const map = {};
    filteredSessions.forEach((session) => {
      if (!session.scheduled_at) return;
      const d = new Date(session.scheduled_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(session);
    });
    return map;
  }, [filteredSessions]);

  // build calendar grid for the active month
  const calendarGrid = useMemo(() => {
    if (!activeMonthData) return [];
    const { year, month } = activeMonthData;
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null); // leading blanks
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [activeMonthData]);

  const hasActiveSessionFilters = useMemo(
    () => !!sessionFilters.search,
    [sessionFilters.search],
  );

  // True when the user has only edited the title (no schedule fields changed)
  const onlyTitleChanged = useMemo(() => {
    if (!originalEditForm || Object.keys(originalEditForm).length === 0) return false;
    return (
      editSessionForm.start_date === originalEditForm.start_date &&
      editSessionForm.time === originalEditForm.time &&
      editSessionForm.recurrence_end_date === originalEditForm.recurrence_end_date &&
      String(editSessionForm.course_id) === String(originalEditForm.course_id) &&
      JSON.stringify([...(editSessionForm.recurrence_days || [])].sort()) ===
        JSON.stringify([...(originalEditForm.recurrence_days || [])].sort())
    );
  }, [editSessionForm, originalEditForm]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await onSessionCreate({ ...createSessionForm });
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleUpdateSession = async (e) => {
    e.preventDefault();
    try {
      await onSessionUpdate(editSessionForm);
    } catch (error) {
      console.error("Failed to update session:", error);
    }
  };

  const getDayFromScheduledAt = (dateString) => {
    if (!dateString) return null;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    try {
      return days[new Date(dateString).getDay()];
    } catch {
      return null;
    }
  };

  const getStatusBadge = (status) => {
    const cfg = {
      scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/20",
      live:      "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
      ended:     "bg-slate-500/20 text-slate-400 border-slate-500/20",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/20",
    };
    const cls = cfg[status] || cfg.scheduled;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
        {status || "scheduled"}
      </span>
    );
  };

  // today key for highlighting
  const todayKey = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
  })();

  return (
    <div className="space-y-6">
      {/* ── Header bar ── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* View toggle — hidden on mobile (calendar-only on mobile) */}
        <div className="hidden sm:flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shrink-0">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 ${view === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <i className="fas fa-table text-xs"></i>
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 ${view === "calendar" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <i className="fas fa-calendar-alt text-xs"></i>
            <span className="hidden sm:inline">Calendar</span>
          </button>
        </div>
        <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:ml-auto">

        {/* Month nav — inline, only in calendar view with data */}
        {/* {view === "calendar" && activeMonthData && (
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-1 py-1 shrink-0">
            <button
              onClick={() => setCalendarMonth(monthRange[Math.max(0, activeMonthIdx - 1)])}
              disabled={activeMonthIdx === 0}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <span className="text-sm font-semibold text-white px-2 min-w-[110px] text-center">
              {MONTH_NAMES[activeMonthData.month]} {activeMonthData.year}
            </span>
            <button
              onClick={() => setCalendarMonth(monthRange[Math.min(monthRange.length - 1, activeMonthIdx + 1)])}
              disabled={activeMonthIdx === monthRange.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        )} */}

        {/* Date range — only in calendar view when range is known */}
        {view === "calendar" && calendarStart && calendarEnd && (
          <div className="col-span-2 sm:col-auto flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shrink-0">
            <i className="fas fa-calendar-alt text-indigo-400 text-xs"></i>
            <span className="text-xs font-semibold text-white">
              {calendarStart.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <i className="fas fa-arrow-right text-slate-500 text-xs"></i>
            <span className="text-xs font-semibold text-white">
              {calendarEnd.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        )}

        <FilterSelect
          className="w-full sm:w-auto"
          value={sessionFilters.status}
          onChange={(e) => setSessionFilters({ ...sessionFilters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="ended">Ended</option>
        </FilterSelect>

        <FilterSelect
          className="w-full sm:w-auto"
          value={sessionFilters.course}
          onChange={(e) => setSessionFilters({ ...sessionFilters, course: e.target.value })}
        >
          <option value="">All Courses</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </FilterSelect>

        <FilterSelect
          className="w-full sm:w-auto"
          value={sessionFilters.teacher}
          onChange={(e) => setSessionFilters({ ...sessionFilters, teacher: e.target.value })}
        >
          <option value="">All Tutors</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.username}</option>
          ))}
        </FilterSelect>
      </div>

        {/* Create Class — pushed to the right */}
        <button
          onClick={() => setActiveModal("create-session")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg active:scale-95 transition flex items-center gap-2 shrink-0"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>Create Session</span>
        </button>
      </div>

      {/* ── TABLE VIEW ── (always on mobile, toggled on sm+) */}
      <div className={view === "calendar" ? "sm:hidden" : ""}>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    {["Session", "Course", "Tutor", "Start Date", "Recurrence", "End Date", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-4 text-xs font-black uppercase text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(8)].map((__, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-16 text-center">
              {/* <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className={`fas ${hasActiveSessionFilters ? "fa-search" : "fa-video"} text-slate-400 text-xl`}></i>
              </div> */}
              <p className="text-white font-bold mb-1">No data to show</p>
              {/* <p className="text-slate-400 text-sm mb-4">
                {hasActiveSessionFilters ? "Try adjusting your filters." : "Create your first class to get started."}
              </p> */}
              {/* {hasActiveSessionFilters ? (
                <button onClick={() => setSessionFilters({ ...sessionFilters, search: "" })} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition">Clear Filters</button>
              ) : (
                <button onClick={() => setActiveModal("create-session")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition">Create First Class</button>
              )} */}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-slate-800/50">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="p-4 hover:bg-slate-800/30 transition">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-bold text-white text-sm">{session.title}</p>
                        {!session.is_recurring && (
                          <span className="mt-0.5 inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/20">Special Session</span>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">{session.course?.title || session.course_title || "—"}</p>
                        <p className="text-xs text-slate-500">{session.teacher_name || "—"}</p>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3">
                      <span><i className="fas fa-calendar mr-1 text-indigo-400"></i>{formatDate(session.scheduled_at || session.start_time)}</span>
                      {formatTime(session.scheduled_at || session.start_time) && (
                        <span><i className="fas fa-clock mr-1 text-indigo-400"></i>{formatTime(session.scheduled_at || session.start_time)}{" "}<TimezoneTag /></span>
                      )}
                      {session.recurrence_days?.length > 0 ? (
                        <span><i className="fas fa-repeat mr-1 text-purple-400"></i>{session.recurrence_days.join(", ")}</span>
                      ) : (() => {
                        const derived = getDayFromScheduledAt(session.scheduled_at || session.start_time);
                        return derived ? <span><i className="fas fa-repeat mr-1 text-slate-500"></i>{derived}</span> : null;
                      })()}
                      {session.recurrence_end_date && (
                        <span><i className="fas fa-flag-checkered mr-1 text-slate-500"></i>Until {session.recurrence_end_date}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!session.is_child && (
                        <button
                          onClick={() => onSessionEdit(session.id)}
                          title="Edit session"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium flex-1 flex items-center justify-center gap-1 transition bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                      )}
                      <button onClick={() => onSessionDelete(session.id)} disabled={loadingSessionIds.has(session.id)} className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/20 transition disabled:opacity-50 flex-1 flex items-center justify-center gap-1">
                        <i className="fas fa-trash"></i>
                        {loadingSessionIds.has(session.id) ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <table className="hidden lg:table w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Class</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Course</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Tutor</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Start Date & Time</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">End Date</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Recurrence</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Status</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white text-sm">{session.title}</p>
                        {!session.is_recurring && (
                          <span className="mt-1 inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/20">Special Session</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{session.course?.title || session.course_title || "—"}</td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{session.teacher_name || "—"}</td>
                      <td className="px-5 py-4">
                        <div className="text-slate-300 text-sm">{formatDate(session.scheduled_at || session.start_time)}</div>
                        {formatTime(session.scheduled_at || session.start_time) && (
                          <div className="text-slate-500 text-xs mt-0.5">
                            <i className="fas fa-clock mr-1"></i>{formatTime(session.scheduled_at || session.start_time)}{" "}<TimezoneTag />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{formatDate(session.recurrence_end_date) || "—"}</td>
                      <td className="px-5 py-4">
                        {session.recurrence_days?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {session.recurrence_days.map((d) => (
                              <span key={d} className="px-1.5 py-0.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded text-xs font-medium">{d}</span>
                            ))}
                          </div>
                        ) : (() => {
                          const derived = getDayFromScheduledAt(session.scheduled_at || session.start_time);
                          return derived
                            ? <span className="px-1.5 py-0.5 bg-slate-700/50 text-slate-400 border border-slate-600/40 rounded text-xs font-medium">{derived}</span>
                            : <span className="text-slate-500 text-xs">—</span>;
                        })()}
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(session.status)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {!session.is_child && (
                            <button
                              onClick={() => onSessionEdit(session.id)}
                              title="Edit session"
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                            >
                              <i className="fas fa-edit mr-1"></i>Edit
                            </button>
                          )}
                          <button onClick={() => onSessionDelete(session.id)} disabled={loadingSessionIds.has(session.id)} className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/20 transition disabled:opacity-50">
                            <i className="fas fa-trash mr-1"></i>
                            {loadingSessionIds.has(session.id) ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── CALENDAR VIEW ── (hidden on mobile) */}
      {view === "calendar" && (
        <div className="hidden sm:block">
          <SessionCalendarView sessions={filteredSessions} loading={loading} />
        </div>
      )}

      {/* ── CREATE SESSION MODAL ── */}
      {activeModal === "create-session" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4 sm:p-8 w-full max-w-2xl lg:max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl transition-all duration-300">

            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-5 border-b border-white/5">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Create New Session</h3>
                <p className="text-slate-500 text-[12px] font-medium mt-1">
                  {createMode === "now"     ? "Launches immediately — max 1 hour" :
                   createMode === "delayed" ? "Starts after a set delay — max 1 hour" :
                                             "Schedule a recurring session for a published course"}
                </p>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Scheduling mode tabs */}
            <div className="flex gap-1 bg-slate-800/60 border border-white/5 rounded-xl p-1 mb-6">
              {[
                { key: "now",       icon: "fa-bolt",           label: "Start Now"     },
                { key: "delayed",   icon: "fa-hourglass-half", label: "Delayed Start" },
                { key: "scheduled", icon: "fa-calendar-alt",   label: "Scheduled"     },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCreateMode?.(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                    createMode === key
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <i className={`fas ${icon} text-[9px]`}></i>
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateSession} className="space-y-5">

              {/* ── Start Now / Delayed: Course + Tutor + Title only ── */}
              {(createMode === "now" || createMode === "delayed") && (
                <div className="space-y-5">
                  {/* Course | Tutor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Course <span className="text-red-400">*</span></label>
                      <FilterSelect
                        value={createSessionForm.course}
                        onChange={(e) => {
                          const c = courses?.find((c) => c.id === Number(e.target.value) && c.status === "published");
                          setCreateSessionForm({ ...createSessionForm, course: e.target.value, instructor_id: c?.instructor?.id || "", instructor_username: c?.instructor?.username || "" });
                          clearCreateSessionFieldError("course");
                        }}
                        className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm ${createSessionErrors?.course ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                      >
                        <option value="">Select a course</option>
                        {courses?.filter((c) => c.status === "published").map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </FilterSelect>
                      {createSessionErrors?.course && <p className="text-red-400 text-xs mt-1">{createSessionErrors.course}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tutor</label>
                      <input type="text" value={createSessionForm.instructor_username || ""} disabled placeholder="Auto-filled from course"
                        className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-400 text-sm cursor-not-allowed placeholder-slate-600" />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Session Title <span className="text-red-400">*</span></label>
                    <Input type="text" placeholder="e.g. Python Basics — Live Q&A"
                      value={createSessionForm.title}
                      onChange={(e) => { setCreateSessionForm({ ...createSessionForm, title: e.target.value }); clearCreateSessionFieldError("title"); }}
                      className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm ${createSessionErrors?.title ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                      error={createSessionErrors?.title}
                    />
                  </div>

                  {/* Delay picker */}
                  {createMode === "delayed" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Start After <span className="text-red-400">*</span></label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
                          <input type="number" min={0} max={23} value={delayHours}
                            onChange={(e) => setDelayHours?.(Math.min(23, Math.max(0, Number(e.target.value))))}
                            className="w-12 bg-transparent text-white text-center text-sm font-black outline-none" />
                          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">hrs</span>
                        </div>
                        <span className="text-slate-600 font-black">:</span>
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
                          <input type="number" min={0} max={59} value={delayMins}
                            onChange={(e) => setDelayMins?.(Math.min(59, Math.max(0, Number(e.target.value))))}
                            className="w-12 bg-transparent text-white text-center text-sm font-black outline-none" />
                          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">min</span>
                        </div>
                      </div>
                      {createSessionErrors?.delay && <p className="text-red-400 text-xs mt-1">{createSessionErrors.delay}</p>}
                      {(Number(delayHours) > 0 || Number(delayMins) > 0) && (
                        <p className="text-slate-500 text-xs mt-2 flex items-center gap-1.5">
                          <i className="fas fa-clock text-indigo-400/60"></i>
                          Session starts in {Number(delayHours) > 0 && `${delayHours}h `}{Number(delayMins) > 0 && `${delayMins}m`} from now
                        </p>
                      )}
                    </div>
                  )}

                  {/* Start Now info banner */}
                  {createMode === "now" && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <i className="fas fa-bolt text-emerald-400"></i>
                      <p className="text-emerald-300 text-xs font-semibold">
                        This session will be created and ready to start immediately. Maximum duration is 1 hour.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Scheduled: full form ── */}
              {createMode === "scheduled" && (
                <div className="space-y-5">
                  {/* Hourly chip */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      <i className="fas fa-clock text-[9px]" /> Hourly · Recurring
                    </span>
                  </div>

                  {/* Course | Tutor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Course <span className="text-red-400">*</span></label>
                      <FilterSelect
                        value={createSessionForm.course}
                        onChange={(e) => {
                          const selectedCourse = courses?.find((c) => c.id === Number(e.target.value) && scheduledCourseReason(c) === null);
                          setCreateSessionForm({ ...createSessionForm, course: e.target.value, instructor_id: selectedCourse?.instructor?.id || "", instructor_username: selectedCourse?.instructor?.username || "" });
                          clearCreateSessionFieldError("course");
                        }}
                        className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm ${createSessionErrors?.course ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                      >
                        <option value="">Select a course</option>
                        {(courses || []).filter(c => scheduledCourseReason(c) === null).length > 0 && (
                          <optgroup label="─── Available ───">
                            {(courses || []).filter(c => scheduledCourseReason(c) === null).map(c => (
                              <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                          </optgroup>
                        )}
                        {(courses || []).filter(c => scheduledCourseReason(c) !== null).length > 0 && (
                          <optgroup label="─── Unavailable ───">
                            {(courses || []).filter(c => scheduledCourseReason(c) !== null).map(c => (
                              <option key={c.id} value={c.id} disabled>{`${c.title} (${scheduledCourseReason(c)})`}</option>
                            ))}
                          </optgroup>
                        )}
                      </FilterSelect>
                      {createSessionErrors?.course && <p className="text-red-400 text-xs mt-1">{createSessionErrors.course}</p>}
                      {(courses || []).some(c => scheduledCourseReason(c) !== null) && (
                        <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                          <i className="fas fa-info-circle text-slate-600" />
                          Greyed-out courses are either not published or already have a recurring session.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tutor</label>
                      <input type="text" value={createSessionForm.instructor_username || ""} disabled placeholder="Auto-filled from course"
                        className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-400 text-sm cursor-not-allowed placeholder-slate-600" />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Session Title <span className="text-red-400">*</span></label>
                    <Input type="text" placeholder="e.g. Python Basics - Batch 2"
                      value={createSessionForm.title}
                      onChange={(e) => { setCreateSessionForm({ ...createSessionForm, title: e.target.value }); clearCreateSessionFieldError("title"); }}
                      className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm ${createSessionErrors?.title ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                      error={createSessionErrors?.title}
                    />
                  </div>

                  {/* Start Date | End Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Start Date <span className="text-red-400">*</span></label>
                      <Input type="date" value={createSessionForm.scheduled_date}
                        min={new Date().toISOString().split("T")[0]} max="9999-12-31"
                        onChange={(e) => { const v = clampDate(e.target.value); setCreateSessionForm({ ...createSessionForm, scheduled_date: v }); clearCreateSessionFieldError("scheduled_date"); }}
                        className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm ${createSessionErrors?.scheduled_date ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                        error={createSessionErrors?.scheduled_date}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">End Date <span className="text-red-400">*</span></label>
                      <Input type="date" value={createSessionForm.recurrence_end_date}
                        min={createSessionForm.scheduled_date || new Date().toISOString().split("T")[0]} max="9999-12-31"
                        onChange={(e) => { const v = clampDate(e.target.value); setCreateSessionForm({ ...createSessionForm, recurrence_end_date: v }); clearCreateSessionFieldError("recurrence_end_date"); }}
                        className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm ${createSessionErrors?.recurrence_end_date ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                        error={createSessionErrors?.recurrence_end_date}
                      />
                      {createSessionForm.scheduled_date && createSessionForm.recurrence_end_date && (
                        <p className="text-slate-500 text-xs mt-1">From {createSessionForm.scheduled_date} to {createSessionForm.recurrence_end_date}</p>
                      )}
                    </div>
                  </div>

                  {/* Recurring Days | Session Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Recurring Days <span className="text-red-400">*</span></label>
                      <div className="flex flex-wrap gap-2">
                        {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day) => {
                          const active = (createSessionForm.recurrence_days || []).includes(day);
                          return (
                            <button key={day} type="button"
                              onClick={() => {
                                const days = createSessionForm.recurrence_days || [];
                                const next = active ? days.filter((d) => d !== day) : [...days, day];
                                setCreateSessionForm({ ...createSessionForm, recurrence_days: next });
                                clearCreateSessionFieldError("recurrence_days");
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${active ? "bg-indigo-600/40 border-indigo-500/50 text-indigo-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"}`}
                            >{day}</button>
                          );
                        })}
                      </div>
                      {createSessionErrors?.recurrence_days && <p className="text-red-400 text-xs mt-1">{createSessionErrors.recurrence_days}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Session Time <span className="text-red-400">*</span></label>
                      <input type="time" value={createSessionForm.time}
                        onChange={(e) => { setCreateSessionForm({ ...createSessionForm, time: e.target.value }); clearCreateSessionFieldError("time"); }}
                        className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm [color-scheme:dark] ${createSessionErrors?.time ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                      />
                      {createSessionErrors?.time && <p className="text-red-400 text-xs mt-1">{createSessionErrors.time}</p>}
                      <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
                        <i className="fas fa-globe text-[10px]"></i>
                        Sessions will be scheduled in <TimezoneTag className="text-indigo-400 font-semibold" />
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end gap-4 pt-8 mt-4 border-t border-white/5">
                <button type="button" onClick={() => setActiveModal(null)} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition">Cancel</button>
                <button type="submit" disabled={isCreatingSession}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 flex items-center gap-2">
                  {isCreatingSession
                    ? <><i className="fas fa-spinner fa-spin text-xs"></i>Creating…</>
                    : createMode === "now"     ? "Start Session"
                    : createMode === "delayed" ? "Create Session"
                    :                           "Create Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT SESSION MODAL ── */}
      {activeModal && typeof activeModal === "object" && activeModal.type === "edit-session" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4 sm:p-8 w-full max-w-2xl lg:max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl transition-all duration-300">

            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/5">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Edit Class</h3>
                <p className="text-slate-500 text-[12px] font-medium mt-1">Update class schedule and details</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleUpdateSession} className="space-y-5">

              {/* Course (editable) | Instructor (read-only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Course <span className="text-red-400">*</span>
                  </label>
                  {(() => {
                    const editCourseId = Number(editSessionForm.course_id);
                    const availableOptions = courses.filter(c => c.status === "published");
                    const currentInList = editCourseId && courses.some(c => c.id === editCourseId);
                    return (
                      <FilterSelect
                        value={editSessionForm.course_id || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const selected = courses.find((c) => c.id === Number(val));
                          if (selected) {
                            setEditSessionForm({
                              ...editSessionForm,
                              course_id: val,
                              course_title: selected.title || "",
                              teacher_name: selected.instructor?.username || "",
                              instructor_id: selected.instructor?.id || "",
                            });
                          } else {
                            setEditSessionForm({ ...editSessionForm, course_id: val });
                          }
                          clearEditSessionFieldError?.("course");
                        }}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        <option value="">Select a course</option>
                        {editCourseId && !currentInList && (
                          <option key={`current-${editCourseId}`} value={editCourseId}>
                            {editSessionForm.course_title || `Course #${editCourseId}`}{editSessionForm.teacher_name ? ` — ${editSessionForm.teacher_name}` : ""}
                          </option>
                        )}
                        {availableOptions.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}{c.instructor?.username ? ` — ${c.instructor.username}` : ""}
                          </option>
                        ))}
                      </FilterSelect>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tutor</label>
                  <input type="text" value={editSessionForm.teacher_name || ""} disabled
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-400 text-sm cursor-not-allowed" />
                </div>
              </div>

              {/* Class Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Class Title <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter class title"
                  value={editSessionForm.title || ""}
                  onChange={(e) => { setEditSessionForm({ ...editSessionForm, title: e.target.value }); clearEditSessionFieldError("title"); }}
                  className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm ${editSessionErrors?.title ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                  error={editSessionErrors?.title}
                />
              </div>

              {/* Description */}
              {/* <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  placeholder="Describe this class session..."
                  value={editSessionForm.description || ""}
                  onChange={(e) => setEditSessionForm({ ...editSessionForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div> */}

              {/* Start Date | End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={editSessionForm.start_date || ""}
                    {...(!onlyTitleChanged && { min: new Date().toISOString().split("T")[0], max: "9999-12-31" })}
                    onChange={(e) => { const v = clampDate(e.target.value); setEditSessionForm({ ...editSessionForm, start_date: v }); clearEditSessionFieldError("start_date"); }}
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm [color-scheme:dark] ${editSessionErrors?.start_date ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                  />
                  {editSessionErrors?.start_date && <p className="text-red-400 text-xs mt-1">{editSessionErrors.start_date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={editSessionForm.recurrence_end_date || ""}
                    {...(!onlyTitleChanged && { min: editSessionForm.start_date || new Date().toISOString().split("T")[0], max: "9999-12-31" })}
                    onChange={(e) => { const v = clampDate(e.target.value); setEditSessionForm({ ...editSessionForm, recurrence_end_date: v }); clearEditSessionFieldError("recurrence_end_date"); }}
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm [color-scheme:dark] ${editSessionErrors?.recurrence_end_date ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                  />
                  {editSessionErrors?.recurrence_end_date && <p className="text-red-400 text-xs mt-1">{editSessionErrors.recurrence_end_date}</p>}
                </div>
              </div>

              {/* Recurring Days | Class Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Recurring Days <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day) => {
                      const active = (editSessionForm.recurrence_days || []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = editSessionForm.recurrence_days || [];
                            const next = active ? days.filter((d) => d !== day) : [...days, day];
                            setEditSessionForm({ ...editSessionForm, recurrence_days: next });
                            clearEditSessionFieldError("recurrence_days");
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${active ? "bg-indigo-600/40 border-indigo-500/50 text-indigo-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  {editSessionErrors?.recurrence_days && <p className="text-red-400 text-xs mt-1">{editSessionErrors.recurrence_days}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Class Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={editSessionForm.time || ""}
                    onChange={(e) => { setEditSessionForm({ ...editSessionForm, time: e.target.value }); clearEditSessionFieldError("time"); }}
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm [color-scheme:dark] ${editSessionErrors?.time ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                  />
                  {editSessionErrors?.time && <p className="text-red-400 text-xs mt-1">{editSessionErrors.time}</p>}
                  <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
                    <i className="fas fa-globe text-[10px]"></i>
                    Sessions will be scheduled in <TimezoneTag className="text-indigo-400 font-semibold" />
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-4 pt-8 mt-4 border-t border-white/5">
                <button type="button" onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition">
                  Cancel
                </button>
                <button type="submit" disabled={!!updatingSessionId}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 flex items-center gap-2">
                  {updatingSessionId ? <><i className="fas fa-spinner fa-spin text-xs"></i>Updating…</> : "Update Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsTab;
