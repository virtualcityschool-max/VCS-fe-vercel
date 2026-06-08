import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectPlatformSettings } from "../../store/slices/platformSettingsSlice";
import {
  fetchTeacherSessions,
  fetchMyCourses,
  createTeacherSession,
  updateTeacherSession,
  deleteTeacherSession,
} from "../../store/slices/teacherSlice";
import SessionCalendarView from "../../components/common/SessionCalendarView";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { FilterSelect, Input } from "../../components/ui";
import TimezoneTag from "../../components/ui/TimezoneTag";
import { useDateFormatters } from "../../hooks";
import { toastManager } from "../../utils/toastManager";
import { clampDate } from "../../utils/validation";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/** Why a course is ineligible for a new scheduled session, or null if eligible. */
function scheduledCourseReason(c) {
  if (c.status === "draft")     return "Not published yet";
  if (c.status === "completed") return "Course already completed";
  if (c.status === "archived")  return "Course is archived";
  if (c.status !== "published") return `Status: ${c.status}`;
  if (c.has_session)            return "Already has a recurring session";
  return null;
}

function toggleDay(form, setForm, day) {
  const days = form.recurrence_days ?? [];
  setForm({
    ...form,
    recurrence_days: days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day],
  });
}

function SessionForm({ form, setForm, errors, clearError, isCreate, courses }) {
  return (
    <div className="space-y-5">
      {/* Course */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Course <span className="text-red-400">*</span>
          </label>
          <FilterSelect
            value={isCreate ? form.course : form.course_id}
            onChange={(e) => {
              if (isCreate) {
                setForm({ ...form, course: e.target.value });
              } else {
                const c = courses.find((x) => x.id === Number(e.target.value));
                setForm({ ...form, course_id: e.target.value, course_title: c?.title ?? "" });
              }
              clearError(isCreate ? "course" : "course_id");
            }}
            className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm ${
              (isCreate ? errors.course : errors.course_id)
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-700 focus:ring-indigo-500"
            }`}
          >
            <option value="">Select your course</option>
            {courses.filter(c => scheduledCourseReason(c) === null).length > 0 && (
              <optgroup label="─── Available ───">
                {courses.filter(c => scheduledCourseReason(c) === null).map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </optgroup>
            )}
            {courses.filter(c => scheduledCourseReason(c) !== null).length > 0 && (
              <optgroup label="─── Unavailable ───">
                {courses.filter(c => scheduledCourseReason(c) !== null).map(c => (
                  <option key={c.id} value={c.id} disabled>{`${c.title} (${scheduledCourseReason(c)})`}</option>
                ))}
              </optgroup>
            )}
          </FilterSelect>
          {(isCreate ? errors.course : errors.course_id) && (
            <p className="text-red-400 text-xs mt-1">{isCreate ? errors.course : errors.course_id}</p>
          )}
          {courses.some(c => scheduledCourseReason(c) !== null) && (
            <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
              <i className="fas fa-info-circle text-slate-600" />
              Greyed-out courses are either not published or already have a recurring session.
            </p>
          )}
        </div>

        {!isCreate && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Course</label>
            <input
              type="text"
              value={form.course_title || ""}
              disabled
              className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-400 text-sm cursor-not-allowed"
            />
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Class Title <span className="text-red-400">*</span>
        </label>
        <Input
          type="text"
          placeholder="e.g. Python Basics — Batch 3"
          value={form.title}
          onChange={(e) => { setForm({ ...form, title: e.target.value }); clearError("title"); }}
          className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm ${
            errors.title ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
          }`}
          error={errors.title}
        />
      </div>

      {/* Start date | End date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Start Date {isCreate && <span className="text-red-400">*</span>}
          </label>
          {isCreate ? (
            <Input
              type="date"
              value={form.scheduled_date}
              min={new Date().toISOString().split("T")[0]}
              max="9999-12-31"
              onChange={(e) => {
                const v = clampDate(e.target.value);
                setForm({ ...form, scheduled_date: v });
                clearError("scheduled_date");
              }}
              className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm ${
                errors.scheduled_date ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
              }`}
              error={errors.scheduled_date}
            />
          ) : (
            <input
              type="date"
              value={form.start_date}
              disabled
              className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 text-sm [color-scheme:dark] cursor-not-allowed opacity-60"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            End Date <span className="text-red-400">*</span>
          </label>
          <Input
            type="date"
            value={form.recurrence_end_date}
            min={isCreate ? (form.scheduled_date || new Date().toISOString().split("T")[0]) : form.start_date}
            max="9999-12-31"
            onChange={(e) => {
              const v = clampDate(e.target.value);
              setForm({ ...form, recurrence_end_date: v });
              clearError("recurrence_end_date");
            }}
            className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm ${
              errors.recurrence_end_date ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
            }`}
            error={errors.recurrence_end_date}
          />
        </div>
      </div>

      {/* Recurring days | Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Recurring Days <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const active = (form.recurrence_days ?? []).includes(day);
              return (
                <button
                  key={day} type="button"
                  onClick={() => { toggleDay(form, setForm, day); clearError("recurrence_days"); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    active
                      ? "bg-indigo-600/40 border-indigo-500/50 text-indigo-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {errors.recurrence_days && (
            <p className="text-red-400 text-xs mt-1">{errors.recurrence_days}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Class Time <span className="text-red-400">*</span>
          </label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => { setForm({ ...form, time: e.target.value }); clearError("time"); }}
            className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm [color-scheme:dark] ${
              errors.time ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
            }`}
          />
          {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
          <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
            <i className="fas fa-globe text-[10px]"></i>
            Scheduled in <TimezoneTag className="text-indigo-400 font-semibold ml-1" />
          </p>
        </div>
      </div>

      {errors._general && (
        <p className="text-red-400 text-sm font-medium">{errors._general}</p>
      )}
    </div>
  );
}

const BLANK_FORM = {
  title: "",
  course: "",
  scheduled_date: "",
  time: "",
  recurrence_end_date: "",
  recurrence_days: [],
  is_recurring: true,
};

function extractFieldErrors(err) {
  const data = err?.response?.data ?? err?.data ?? err ?? {};

  if (typeof data === "string") return { _general: data };

  // Django custom format: { error: "Validation failed.", details: { field: [...] } }
  if (data.error && data.details && typeof data.details === "object") {
    const out = { _general: data.error };
    for (const [k, v] of Object.entries(data.details)) {
      out[k] = Array.isArray(v) ? v[0] : String(v);
    }
    return out;
  }

  // DRF detail string: { detail: "..." }
  if (data.detail) return { _general: String(data.detail) };

  // Simple error string: { error: "..." }
  if (data.error && typeof data.error === "string") return { _general: data.error };

  // Field-level errors: { field: ["msg", ...] }
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = Array.isArray(v) ? v[0] : typeof v === "string" ? v : JSON.stringify(v);
  }
  return out;
}

const STATUS_BADGE = {
  scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  live:      "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  ended:     "bg-slate-500/20 text-slate-400 border-slate-500/20",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/20",
};

const TeacherSessionCalendar = () => {
  const dispatch = useDispatch();
  const { formatDate, formatTime, timezoneAbbr, toPayloadISO, toDatetimeInput } = useDateFormatters();

  const {
    sessions,
    loadingSessions,
    myCourses,
    isCreatingSession,
    updatingSessionId,
    deletingSessionIds,
  } = useSelector((state) => state.teachers);
  const ps = useSelector(selectPlatformSettings);

  const [view, setView] = useState("table");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modal, setModal]       = useState(null); // null | "create" | { type:"edit", session }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePast, setDeletePast]     = useState(false);
  const [createForm, setCreateForm] = useState(BLANK_FORM);
  const [editForm, setEditForm]     = useState({});
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors]     = useState({});

  // ── scheduling mode for create form ──────────────────────
  // "now" = Start Now, "delayed" = Delayed Start, "scheduled" = date+time picker
  const [createMode, setCreateMode] = useState(() => ps.session_default_start_type || "scheduled");
  const [delayHours, setDelayHours] = useState(0);
  const [delayMins,  setDelayMins]  = useState(30);

  useEffect(() => {
    dispatch(fetchMyCourses());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (courseFilter) params.course = courseFilter;
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchTeacherSessions(params));
  }, [dispatch, courseFilter, statusFilter]);

  const publishedCourses = (Array.isArray(myCourses) ? myCourses : []).filter(
    (c) => c.status === "published",
  );
  // All courses passed to SessionForm so ineligible ones show as disabled with reason
  const allCourses = Array.isArray(myCourses) ? myCourses : [];

  const sessionList = (Array.isArray(sessions) ? sessions : []).filter((s) => !s.is_child);

  // ── helpers ──────────────────────────────────────────────

  const openEdit = (session) => {
    const localDt = new Date(session.scheduled_at);
    const pad = (n) => String(n).padStart(2, "0");
    setEditForm({
      id:                  session.id,
      title:               session.title || "",
      course_id:           session.course?.id ?? session.course ?? "",
      course_title:        session.course?.title ?? session.course_title ?? "",
      start_date:          `${localDt.getFullYear()}-${pad(localDt.getMonth()+1)}-${pad(localDt.getDate())}`,
      time:                `${pad(localDt.getHours())}:${pad(localDt.getMinutes())}`,
      recurrence_end_date: session.recurrence_end_date ?? "",
      recurrence_days:     session.recurrence_days ?? [],
      is_recurring:        session.is_recurring ?? true,
    });
    setEditErrors({});
    setModal({ type: "edit", session });
  };

  // ── create ────────────────────────────────────────────────

  const localISONow = (offsetMs = 0) => toDatetimeInput(new Date(Date.now() + offsetMs).toISOString());

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErrors({});
    try {
      let payload;
      if (createMode === "now") {
        payload = {
          title:        createForm.title,
          course:       createForm.course,
          scheduled_at: toPayloadISO(localISONow()),
          is_recurring: false,
        };
      } else if (createMode === "delayed") {
        const offsetMs = (Number(delayHours) * 60 + Number(delayMins)) * 60 * 1000;
        payload = {
          title:        createForm.title,
          course:       createForm.course,
          scheduled_at: toPayloadISO(localISONow(offsetMs)),
          is_recurring: false,
        };
      } else {
        payload = {
          title:               createForm.title,
          course:              createForm.course,
          scheduled_at:        toPayloadISO(`${createForm.scheduled_date}T${createForm.time}`),
          recurrence_end_date: createForm.recurrence_end_date,
          recurrence_days:     createForm.recurrence_days,
          is_recurring:        true,
        };
      }
      await dispatch(createTeacherSession(payload)).unwrap();
      toastManager.success("Session created successfully");
      setModal(null);
      setCreateForm(BLANK_FORM);
      dispatch(fetchTeacherSessions(courseFilter ? { course: courseFilter } : {}));
    } catch (err) {
      const errs = extractFieldErrors(err);
      const msg = errs._general || Object.values(errs).find(Boolean) || "Please fix the errors below.";
      toastManager.error(msg);
      setCreateErrors(errs);
    }
  };

  // ── update ────────────────────────────────────────────────

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditErrors({});
    try {
      await dispatch(updateTeacherSession({
        id:   editForm.id,
        data: {
          title:               editForm.title,
          course:              editForm.course_id,
          scheduled_at:        toPayloadISO(`${editForm.start_date}T${editForm.time}`),
          recurrence_end_date: editForm.recurrence_end_date,
          recurrence_days:     editForm.recurrence_days,
          is_recurring:        editForm.is_recurring,
        },
      })).unwrap();
      toastManager.success("Session updated");
      setModal(null);
      dispatch(fetchTeacherSessions(courseFilter ? { course: courseFilter } : {}));
    } catch (err) {
      const errs = extractFieldErrors(err);
      const msg = errs._general || Object.values(errs).find(Boolean) || "Please fix the errors below.";
      toastManager.error(msg);
      setEditErrors(errs);
    }
  };

  // ── delete ────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteTeacherSession({ id: deleteTarget.id, deletePast })).unwrap();
      toastManager.success(
        deletePast ? "Session and all history deleted" : "Future sessions deleted"
      );
    } catch {
      toastManager.error("Failed to delete session");
    } finally {
      setDeleteTarget(null);
      setDeletePast(false);
    }
  };

  // ── render ────────────────────────────────────────────────

  return (
    <div className="space-y-6 text-white">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">My Sessions</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage and schedule your course sessions</p>
        </div>
        <button
          onClick={() => { setCreateForm(BLANK_FORM); setCreateErrors({}); setCreateMode(ps.session_default_start_type || "scheduled"); setDelayHours(0); setDelayMins(30); setModal("create"); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/40 active:scale-95"
        >
          <i className="fas fa-plus text-xs"></i>
          Create Session
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <div className="hidden sm:flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shrink-0">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 ${view === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <i className="fas fa-table text-xs"></i> Table
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 ${view === "calendar" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <i className="fas fa-calendar-alt text-xs"></i> Calendar
          </button>
        </div>

        <div className="flex flex-wrap gap-2 ml-auto">
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-auto"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>

          <FilterSelect
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-auto min-w-[160px]"
          >
            <option value="">All Courses</option>
            {publishedCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </FilterSelect>

          {(courseFilter || statusFilter) && (
            <button
              onClick={() => { setCourseFilter(""); setStatusFilter(""); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-sm transition"
            >
              <i className="fas fa-times text-xs"></i> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── TABLE VIEW ── */}
      <div className={view === "calendar" ? "sm:hidden" : ""}>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {loadingSessions ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    {["Session", "Course", "Start Date", "Recurrence", "End Date", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-4 text-xs font-black uppercase text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {[...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : sessionList.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-times text-slate-500 text-xl"></i>
              </div>
              <p className="text-white font-bold mb-1">No sessions yet</p>
              <p className="text-slate-500 text-sm mb-4">Create your first session to get started.</p>
              <button
                onClick={() => { setCreateForm(BLANK_FORM); setCreateErrors({}); setCreateMode(ps.session_default_start_type || "scheduled"); setDelayHours(0); setDelayMins(30); setModal("create"); }}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition"
              >
                <i className="fas fa-plus text-xs"></i> Create First Class
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-slate-800/50">
                {sessionList.map((s) => (
                  <div key={s.id} className="p-4 hover:bg-slate-800/30 transition">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-white text-sm">{s.title}</p>
                          {!s.is_recurring && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/20">Special Session</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{s.course?.title ?? s.course_title ?? "—"}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[s.status] ?? STATUS_BADGE.scheduled}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3">
                      <span><i className="fas fa-calendar mr-1 text-indigo-400"></i>{formatDate(s.scheduled_at)}</span>
                      <span><i className="fas fa-clock mr-1 text-indigo-400"></i>{formatTime(s.scheduled_at)} <TimezoneTag /></span>
                      {s.recurrence_days?.length > 0 && (
                        <span><i className="fas fa-repeat mr-1 text-purple-400"></i>{s.recurrence_days.join(", ")}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!s.is_child && s.is_recurring && (
                        <button
                          onClick={() => openEdit(s)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium flex-1 flex items-center justify-center gap-1 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition"
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(s)}
                        disabled={deletingSessionIds.includes(s.id)}
                        className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/20 transition disabled:opacity-50 flex-1 flex items-center justify-center gap-1"
                      >
                        <i className="fas fa-trash"></i>
                        {deletingSessionIds.includes(s.id) ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <table className="hidden lg:table w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    {["Session", "Course", "Start Date & Time", "Recurrence", "End Date", "Status", ""].map((h, i) => (
                      <th key={i} className={`px-5 py-4 text-xs font-black uppercase text-slate-500 ${i === 6 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sessionList.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white text-sm">{s.title}</p>
                        {!s.is_recurring && (
                          <span className="mt-1 inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/20">Special Session</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{s.course?.title ?? s.course_title ?? "—"}</td>
                      <td className="px-5 py-4">
                        <div className="text-slate-300 text-sm">{formatDate(s.scheduled_at)}</div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          <i className="fas fa-clock mr-1"></i>{formatTime(s.scheduled_at)} <TimezoneTag />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {s.recurrence_days?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {s.recurrence_days.map((d) => (
                              <span key={d} className="px-1.5 py-0.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded text-xs font-medium">{d}</span>
                            ))}
                          </div>
                        ) : <span className="text-slate-500 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{s.recurrence_end_date ? formatDate(s.recurrence_end_date) : "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[s.status] ?? STATUS_BADGE.scheduled}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {!s.is_child && s.is_recurring && (
                            <button
                              onClick={() => openEdit(s)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition"
                            >
                              <i className="fas fa-edit mr-1"></i>Edit
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteTarget(s)}
                            disabled={deletingSessionIds.includes(s.id)}
                            className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/20 transition disabled:opacity-50"
                          >
                            <i className="fas fa-trash mr-1"></i>
                            {deletingSessionIds.includes(s.id) ? "Deleting…" : "Delete"}
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

      {/* ── CALENDAR VIEW ── */}
      {view === "calendar" && (
        <div className="hidden sm:block">
          <SessionCalendarView sessions={sessionList} loading={loadingSessions} />
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {modal === "create" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-6 sm:p-8 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-5 border-b border-white/5">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Create New Session</h3>
                <p className="text-slate-500 text-xs mt-1">
                  {createMode === "now"     ? "Launches immediately — max 1 hour" :
                   createMode === "delayed" ? "Starts after a set delay — max 1 hour" :
                                             "Schedule a recurring class for one of your courses"}
                </p>
              </div>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition">
                <i className="fas fa-times"></i>
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
                  onClick={() => { setCreateMode(key); setCreateErrors({}); }}
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

            <form onSubmit={handleCreate} className="space-y-5">

              {/* ── Start Now / Delayed: minimal form ── */}
              {(createMode === "now" || createMode === "delayed") && (
                <div className="space-y-5">
                  {/* Course */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Course <span className="text-red-400">*</span>
                    </label>
                    <FilterSelect
                      value={createForm.course}
                      onChange={(e) => { setCreateForm({ ...createForm, course: e.target.value }); setCreateErrors((p) => { const n={...p}; delete n.course; return n; }); }}
                      className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-2 text-sm ${createErrors.course ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                    >
                      <option value="">Select your course</option>
                      {publishedCourses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </FilterSelect>
                    {createErrors.course && <p className="text-red-400 text-xs mt-1">{createErrors.course}</p>}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Session Title <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Python Basics — Live Q&A"
                      value={createForm.title}
                      onChange={(e) => { setCreateForm({ ...createForm, title: e.target.value }); setCreateErrors((p) => { const n={...p}; delete n.title; return n; }); }}
                      className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm ${createErrors.title ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
                      error={createErrors.title}
                    />
                  </div>

                  {/* Delayed-specific: delay picker */}
                  {createMode === "delayed" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Start After <span className="text-red-400">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
                          <input
                            type="number"
                            min={0} max={23}
                            value={delayHours}
                            onChange={(e) => setDelayHours(Math.min(23, Math.max(0, Number(e.target.value))))}
                            className="w-12 bg-transparent text-white text-center text-sm font-black outline-none"
                          />
                          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">hrs</span>
                        </div>
                        <span className="text-slate-600 font-black">:</span>
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
                          <input
                            type="number"
                            min={0} max={59}
                            value={delayMins}
                            onChange={(e) => setDelayMins(Math.min(59, Math.max(0, Number(e.target.value))))}
                            className="w-12 bg-transparent text-white text-center text-sm font-black outline-none"
                          />
                          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">min</span>
                        </div>
                      </div>
                      {(delayHours > 0 || delayMins > 0) && (
                        <p className="text-slate-500 text-xs mt-2 flex items-center gap-1.5">
                          <i className="fas fa-clock text-indigo-400/60"></i>
                          Session will start in{" "}
                          {delayHours > 0 && `${delayHours}h `}{delayMins > 0 && `${delayMins}m`} from now
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

                  {(createErrors._general || createErrors.instructor_id) && (
                    <p className="text-red-400 text-sm font-medium">
                      {createErrors._general || createErrors.instructor_id}
                    </p>
                  )}
                </div>
              )}

              {/* ── Scheduled: full form ── */}
              {createMode === "scheduled" && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      <i className="fas fa-clock text-[9px]" /> Hourly · Recurring
                    </span>
                  </div>
                  <SessionForm
                    form={createForm}
                    setForm={setCreateForm}
                    errors={createErrors}
                    clearError={(k) => setCreateErrors((p) => { const n = { ...p }; delete n[k]; return n; })}
                    isCreate
                    courses={allCourses}
                  />
                </>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">Cancel</button>
                <button type="submit" disabled={isCreatingSession} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 flex items-center gap-2">
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

      {/* ── EDIT MODAL ── */}
      {modal?.type === "edit" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-6 sm:p-8 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/5">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Edit Class</h3>
                <p className="text-slate-500 text-xs mt-1">Update class schedule and details</p>
              </div>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-5">
              <SessionForm
                form={editForm}
                setForm={setEditForm}
                errors={editErrors}
                clearError={(k) => setEditErrors((p) => { const n = { ...p }; delete n[k]; return n; })}
                isCreate={false}
                courses={allCourses}
              />
              <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">Cancel</button>
                <button type="submit" disabled={!!updatingSessionId} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 flex items-center gap-2">
                  {updatingSessionId ? <><i className="fas fa-spinner fa-spin text-xs"></i>Updating…</> : "Update Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        variant="warning"
        title="Delete Session"
        message={`Delete "${deleteTarget?.title}"? Future scheduled sessions in this series will be removed. Past sessions and attendance are kept by default.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteTarget ? deletingSessionIds.includes(deleteTarget.id) : false}
        checkboxLabel="Also delete past sessions & attendance"
        checkboxChecked={deletePast}
        onCheckboxChange={setDeletePast}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deletingSessionIds.includes(deleteTarget?.id)) {
            setDeleteTarget(null);
            setDeletePast(false);
          }
        }}
      />
    </div>
  );
};

export default TeacherSessionCalendar;
