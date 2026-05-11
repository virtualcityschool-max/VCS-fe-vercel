import React, { useMemo, useState } from "react";
import { Button, FilterSelect, Input } from "../../components/ui";
import SessionCalendarView from "../common/SessionCalendarView";

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
}) => {
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

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "—";
    try {
      return new Date(dateTimeString).toLocaleDateString([], {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    try {
      return new Date(dateTimeString).toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return "";
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
        {/* View toggle */}
        <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shrink-0">
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
        <div className="flex gap-3 ml-auto">

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
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shrink-0">
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

        {/* View filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Session Type</span>
          <FilterSelect
            style={{ minWidth: "130px" }}
            value={sessionFilters.view}
            onChange={(e) => setSessionFilters({ ...sessionFilters, view: e.target.value })}
          >
            <option value="">All</option>
            <option value="parent">Parent</option>
          </FilterSelect>
        </div>

        {/* Course filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Course</span>
          <FilterSelect
            style={{ minWidth: "180px" }}
            value={sessionFilters.course}
            onChange={(e) => setSessionFilters({ ...sessionFilters, course: e.target.value })}
          >
            <option value="">All Courses</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </FilterSelect>
        </div>

        {/* Instructor filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Instructor</span>
          <FilterSelect
            style={{ minWidth: "160px" }}
            value={sessionFilters.teacher}
            onChange={(e) => setSessionFilters({ ...sessionFilters, teacher: e.target.value })}
          >
            <option value="">All Teachers</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.username}</option>
            ))}
          </FilterSelect>
        </div>
      </div>

        {/* Create Class — pushed to the right */}
        <button
          onClick={() => setActiveModal("create-session")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg active:scale-95 transition flex items-center gap-2 shrink-0"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>Create Class</span>
        </button>
      </div>

      {/* ── TABLE VIEW ── */}
      {view === "table" && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    {["Class", "Course", "Teacher", "Start Date", "Recurrence", "End Date", "Status", "Actions"].map((h) => (
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
              <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className={`fas ${hasActiveSessionFilters ? "fa-search" : "fa-video"} text-slate-400 text-xl`}></i>
              </div>
              <p className="text-white font-bold mb-1">{hasActiveSessionFilters ? "No Classes Found" : "No Classes Created"}</p>
              <p className="text-slate-400 text-sm mb-4">
                {hasActiveSessionFilters ? "Try adjusting your filters." : "Create your first class to get started."}
              </p>
              {hasActiveSessionFilters ? (
                <button onClick={() => setSessionFilters({ ...sessionFilters, search: "" })} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition">Clear Filters</button>
              ) : (
                <button onClick={() => setActiveModal("create-session")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition">Create First Class</button>
              )}
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
                        <p className="text-xs text-slate-400 mt-0.5">{session.course?.title || session.course_title || "—"}</p>
                        <p className="text-xs text-slate-500">{session.teacher_name || "—"}</p>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3">
                      <span><i className="fas fa-calendar mr-1 text-indigo-400"></i>{formatDate(session.scheduled_at || session.start_time)}</span>
                      {session.recurrence_days?.length > 0 && (
                        <span><i className="fas fa-repeat mr-1 text-purple-400"></i>{session.recurrence_days.join(", ")}</span>
                      )}
                      {session.recurrence_end_date && (
                        <span><i className="fas fa-flag-checkered mr-1 text-slate-500"></i>Until {session.recurrence_end_date}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(() => {
                        const isChild = session.is_child === true;
                        const hasEnrollments = (session.enrollment_count ?? 0) >= 1;
                        const blocked = isChild || hasEnrollments;
                        const tip = isChild
                          ? "Child sessions cannot be edited"
                          : hasEnrollments
                          ? "Cannot edit: session has active enrollments"
                          : "Edit session";
                        return (
                          <button
                            onClick={() => !blocked && onSessionEdit(session.id)}
                            disabled={blocked}
                            title={tip}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex-1 flex items-center justify-center gap-1 transition ${blocked ? "bg-slate-800/30 text-slate-600 cursor-not-allowed" : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"}`}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                        );
                      })()}
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
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Teacher</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Start Date</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">End Date</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Recurrence</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Status</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-5 py-4 font-semibold text-white text-sm">{session.title}</td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{session.course?.title || session.course_title || "—"}</td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{session.teacher_name || "—"}</td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{formatDate(session.scheduled_at || session.start_time)}</td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{formatDate(session.recurrence_end_date) || "—"}</td>
                      <td className="px-5 py-4">
                        {session.recurrence_days?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {session.recurrence_days.map((d) => (
                              <span key={d} className="px-1.5 py-0.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded text-xs font-medium">{d}</span>
                            ))}
                          </div>
                        ) : <span className="text-slate-500 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(session.status)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {(() => {
                            const isChild = session.is_child === true;
                            const hasEnrollments = (session.enrollment_count ?? 0) >= 1;
                            const blocked = isChild || hasEnrollments;
                            const tip = isChild
                              ? "Child sessions cannot be edited"
                              : hasEnrollments
                              ? "Cannot edit: session has active enrollments"
                              : "Edit session";
                            return (
                              <button
                                onClick={() => !blocked && onSessionEdit(session.id)}
                                disabled={blocked}
                                title={tip}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${blocked ? "bg-slate-800/30 text-slate-600 cursor-not-allowed" : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"}`}
                              >
                                <i className="fas fa-edit mr-1"></i>Edit
                              </button>
                            );
                          })()}
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
      )}

      {/* ── CALENDAR VIEW ── */}
      {view === "calendar" && (
        <SessionCalendarView sessions={filteredSessions} loading={loading} />
      )}

      {/* ── CREATE CLASS MODAL ── */}
      {activeModal === "create-session" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4 sm:p-8 w-full max-w-2xl lg:max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl transition-all duration-300">

            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/5">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Create New Class</h3>
                <p className="text-slate-500 text-[12px] font-medium mt-1">Schedule a recurring class for a published course</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-5">
              {/* Row 1: Course | Instructor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Course <span className="text-red-400">*</span>
                  </label>
                  <FilterSelect
                    value={createSessionForm.course}
                    onChange={(e) => {
                      const selectedCourse = courses?.find((c) => c.id === Number(e.target.value) && c.status === "published" && !c.has_session);
                      setCreateSessionForm({
                        ...createSessionForm,
                        course: e.target.value,
                        recurrence_end_date: "",
                        instructor_id: selectedCourse?.instructor?.id || "",
                        instructor_username: selectedCourse?.instructor?.username || "",
                      });
                      clearCreateSessionFieldError("course");
                    }}
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm ${createSessionErrors?.course ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                  >
                    <option value="">Select a course</option>
                    {courses?.filter((c) => c.status === "published" && !c.has_session).map((course) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </FilterSelect>
                  {createSessionErrors?.course && <p className="text-red-400 text-xs mt-1">{createSessionErrors.course}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Instructor</label>
                  <input
                    type="text"
                    value={createSessionForm.instructor_username || ""}
                    disabled
                    placeholder="Auto-filled from course"
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-400 text-sm cursor-not-allowed placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Row 2: Class Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Class Title <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Python Basics - Batch 2"
                  value={createSessionForm.title}
                  onChange={(e) => { setCreateSessionForm({ ...createSessionForm, title: e.target.value }); clearCreateSessionFieldError("title"); }}
                  className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm ${createSessionErrors?.title ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                  error={createSessionErrors?.title}
                />
              </div>

              {/* Row 3: Start Date | End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="date"
                    value={createSessionForm.scheduled_date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => { setCreateSessionForm({ ...createSessionForm, scheduled_date: e.target.value }); clearCreateSessionFieldError("scheduled_date"); }}
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm ${createSessionErrors?.scheduled_date ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                    error={createSessionErrors?.scheduled_date}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Date <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="date"
                    value={createSessionForm.recurrence_end_date}
                    min={createSessionForm.scheduled_date || new Date().toISOString().split("T")[0]}
                    onChange={(e) => { setCreateSessionForm({ ...createSessionForm, recurrence_end_date: e.target.value }); clearCreateSessionFieldError("recurrence_end_date"); }}
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm ${createSessionErrors?.recurrence_end_date ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                    error={createSessionErrors?.recurrence_end_date}
                  />
                  {createSessionForm.scheduled_date && createSessionForm.recurrence_end_date && (
                    <p className="text-slate-500 text-xs mt-1">From {createSessionForm.scheduled_date} to {createSessionForm.recurrence_end_date}</p>
                  )}
                </div>
              </div>

              {/* Row 4: Recurring Days | Class Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Recurring Days <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["MON","TUE","WED","THU","FRI"].map((day) => {
                      const active = (createSessionForm.recurrence_days || []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = createSessionForm.recurrence_days || [];
                            const next = active ? days.filter((d) => d !== day) : [...days, day];
                            setCreateSessionForm({ ...createSessionForm, recurrence_days: next });
                            clearCreateSessionFieldError("recurrence_days");
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${active ? "bg-indigo-600/40 border-indigo-500/50 text-indigo-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  {createSessionErrors?.recurrence_days && <p className="text-red-400 text-xs mt-1">{createSessionErrors.recurrence_days}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Class Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={createSessionForm.time}
                    onChange={(e) => { setCreateSessionForm({ ...createSessionForm, time: e.target.value }); clearCreateSessionFieldError("time"); }}
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm [color-scheme:dark] ${createSessionErrors?.time ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                  />
                  {createSessionErrors?.time && <p className="text-red-400 text-xs mt-1">{createSessionErrors.time}</p>}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-4 pt-8 mt-4 border-t border-white/5">
                <button type="button" onClick={() => setActiveModal(null)} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition">Cancel</button>
                <button type="submit" disabled={isCreatingSession}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 flex items-center gap-2">
                  {isCreatingSession ? <><i className="fas fa-spinner fa-spin text-xs"></i>Creating…</> : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT SESSION MODAL ── */}
      {activeModal && typeof activeModal === "object" && activeModal.type === "edit-session" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                  <FilterSelect
                    value={editSessionForm.course_id || ""}
                    onChange={(e) => {
                      const selected = courses.find((c) => c.id === Number(e.target.value));
                      setEditSessionForm({
                        ...editSessionForm,
                        course_id: e.target.value,
                        course_title: selected?.title || "",
                        teacher_name: selected?.instructor?.username || "",
                        instructor_id: selected?.instructor?.id || "",
                      });
                    }}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select a course</option>
                    {courses
                      .filter((c) => c.status === "published" && (!c.has_session || c.id === Number(editSessionForm.course_id)))
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))
                    }
                  </FilterSelect>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Instructor</label>
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  placeholder="Describe this class session..."
                  value={editSessionForm.description || ""}
                  onChange={(e) => setEditSessionForm({ ...editSessionForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              {/* Start Date | End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={editSessionForm.start_date || ""}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => { setEditSessionForm({ ...editSessionForm, start_date: e.target.value }); clearEditSessionFieldError("start_date"); }}
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
                    min={editSessionForm.start_date || new Date().toISOString().split("T")[0]}
                    onChange={(e) => { setEditSessionForm({ ...editSessionForm, recurrence_end_date: e.target.value }); clearEditSessionFieldError("recurrence_end_date"); }}
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
                    {["MON","TUE","WED","THU","FRI"].map((day) => {
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
