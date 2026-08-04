import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { TimezoneTag } from "../../components/ui";
import { useDateFormatters } from "../../hooks";
import SessionCalendarView from "../common/SessionCalendarView";
import { getDisplayName } from "../../utils/userDisplay";

const StatusHeaderTooltip = () => {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const show = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.top, left: r.left + r.width / 2 });
    }
  };
  return (
    <>
       <i
        ref={ref}
        className="fas fa-info-circle text-slate-600 text-[10px] cursor-default"
        onMouseEnter={show}
        onMouseLeave={() => setPos(null)}
      />
      {pos && createPortal(
         <div
          className="fixed z-[9999] w-64 pointer-events-none"
          style={{ top: pos.top, left: pos.left, transform: "translate(-50%, calc(-100% - 10px))" }}
        >
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-3 py-2.5 text-[11px] text-slate-300 leading-relaxed">
            For recurring sessions, this is the first occurrence's status - not the overall series status.
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700 -mt-px" />
        </div>,
        document.body
      )}
    </>
  );
};

const RECURRENCE_DAYS = [
  { key: "MON", label: "Mon" },
  { key: "TUE", label: "Tue" },
  { key: "WED", label: "Wed" },
  { key: "THU", label: "Thu" },
  { key: "FRI", label: "Fri" },
  { key: "SAT", label: "Sat" },
  { key: "SUN", label: "Sun" },
];
const DAY_ORDER = RECURRENCE_DAYS.map((d) => d.key);
const sortDays = (days) => [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

const getStatusBadge = (status) => {
  const cfg = {
    scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    live: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    ended: "bg-slate-500/20 text-slate-400 border-slate-500/20",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/20",
  };
  const cls = cfg[status] || cfg.scheduled;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status || "scheduled"}
    </span>
  );
};

// Searchable multi-select tutor dropdown. Selected tutors show as removable
// chips; the dropdown filters by name or email as you type.
const TeacherMultiSelect = ({ teachers = [], selectedIds = [], onChange, error }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus the search box the moment the list opens so admins can just type.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const selected = teachers.filter((t) => selectedIds.includes(t.id));

  const q = query.trim().toLowerCase();
  const filtered = q
    ? teachers.filter((t) =>
        [getDisplayName(t), t.email, t.username]
          .some((field) => (field || "").toLowerCase().includes(q)),
      )
    : teachers;

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Control - chips of the chosen tutors */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open ? close() : setOpen(true);
          }
          if (e.key === "Escape") close();
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 pr-9 min-h-[42px] bg-slate-800/60 border ${
          error ? "border-red-500/60" : "border-slate-700/60"
        } rounded-xl text-sm text-left transition hover:border-slate-600 cursor-pointer relative`}
      >
        {selected.length === 0 ? (
          <span className="text-slate-500 py-0.5">Search and select tutors...</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 bg-indigo-600/90 text-white text-xs pl-2.5 pr-1.5 py-1 rounded-lg"
              >
                {getDisplayName(t)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(t.id);
                  }}
                  title={`Remove ${getDisplayName(t)}`}
                  className="hover:text-red-300 transition"
                >
                  <i className="fas fa-times text-[10px]"></i>
                </button>
              </span>
            ))}
          </div>
        )}
        <i
          className={`fas fa-chevron-down text-slate-500 text-xs absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        ></i>
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-slate-700/70">
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && close()}
                placeholder="Search tutors by name or email..."
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-8 py-2 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              <i className="fas fa-search text-slate-500 text-xs absolute left-3 top-1/2 -translate-y-1/2"></i>
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                  title="Clear search"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              )}
            </div>
          </div>

          {/* Selection summary */}
          {selected.length > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/40 border-b border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                {selected.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-red-400 transition"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {teachers.length === 0 ? (
              <p className="text-slate-500 text-sm px-3 py-4 text-center">
                No tutors available
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-slate-500 text-sm px-3 py-4 text-center">
                No tutors match "{query}"
              </p>
            ) : (
              filtered.map((t) => {
                const isSelected = selectedIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition ${
                      isSelected ? "bg-indigo-600/15" : "hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(t.id)}
                      className="w-4 h-4 accent-indigo-500 rounded shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {getDisplayName(t)}
                      </p>
                      {t.email && (
                        <p className="text-slate-500 text-xs truncate">{t.email}</p>
                      )}
                    </div>
                    {isSelected && (
                      <i className="fas fa-check text-indigo-400 text-xs ml-auto shrink-0"></i>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const emptyForm = {
  title: "",
  teacher_ids: [],
  scheduled_date: "",
  time: "",
  recurrence_days: [],
  recurrence_end_date: "",
};

const TeacherPlannerTab = ({
  sessions = [],
  teachers = [],
  loading = false,
  loadingSessionIds = new Set(),
  onSessionCreate,
  onSessionUpdate,
  onSessionDelete,
  isCreating = false,
}) => {
  const { formatDate, formatTime, timezoneAbbr, toPayloadISO, toDatetimeInput } = useDateFormatters();
  const [activeModal, setActiveModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
  };

  const openCreate = () => {
    resetForm();
    setActiveModal("create");
  };

  const openEdit = (session) => {
    let startDate = "";
    let startTime = "";
    const raw = session.scheduled_at;
    if (raw) {
      const local = toDatetimeInput(raw); // converts ISO → YYYY-MM-DDTHH:mm in user's timezone
      if (local?.includes("T")) {
        [startDate, startTime] = local.split("T");
      }
    }
    setForm({
      title: session.title || "",
      teacher_ids: (session.invited_teachers || []).map((t) => t.id),
      scheduled_date: startDate,
      time: startTime,
      recurrence_days: session.recurrence_days || [],
      recurrence_end_date: session.recurrence_end_date || "",
    });
    setErrors({});
    setActiveModal({ type: "edit", session });
  };

  const validate = (f) => {
    const e = {};
    if (!f.title?.trim()) e.title = "Title is required";
    else if (f.title.trim().length < 3) e.title = "Title must be at least 3 characters";
    if (f.teacher_ids.length === 0) e.teacher_ids = "Select at least one tutor";
    if (!f.scheduled_date) e.scheduled_date = "Start date is required";
    if (!f.time) e.time = "Start time is required";
    if (f.recurrence_days.length === 0) e.recurrence_days = "Select at least one recurring day";
    if (!f.recurrence_end_date) e.recurrence_end_date = "End date is required";
    else if (f.scheduled_date && f.recurrence_end_date < f.scheduled_date)
      e.recurrence_end_date = "End date must be on or after start date";
    return e;
  };

  const toggleDay = (day) => {
    const days = form.recurrence_days.includes(day)
      ? form.recurrence_days.filter((d) => d !== day)
      : [...form.recurrence_days, day];
    setForm({ ...form, recurrence_days: days });
    if (errors.recurrence_days) setErrors({ ...errors, recurrence_days: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      title: form.title.trim(),
      teacher_ids: form.teacher_ids,
      scheduled_at: toPayloadISO(`${form.scheduled_date}T${form.time}`),
      is_recurring: true,
      recurrence_days: form.recurrence_days,
      recurrence_end_date: form.recurrence_end_date,
    };

    if (activeModal === "create") {
      await onSessionCreate(payload, () => {
        setActiveModal(null);
        resetForm();
      });
    } else if (activeModal?.type === "edit") {
      await onSessionUpdate(activeModal.session.id, payload, () => {
        setActiveModal(null);
        resetForm();
      });
    }
  };

  const isModalOpen = activeModal !== null;
  const isEditMode = activeModal?.type === "edit";
  const [view, setView] = useState("table");

  return (
    <div className="space-y-6">
      {/* Header bar - view toggle left, create button right */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* View toggle */}
        <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shrink-0">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 ${view === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <i className="fas fa-table text-xs" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 ${view === "calendar" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <i className="fas fa-calendar-alt text-xs" />
            <span className="hidden sm:inline">Calendar</span>
          </button>
        </div>

        {/* Create button */}
        <button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg active:scale-95 transition flex items-center gap-2 shrink-0 ml-auto"
        >
          <i className="fas fa-plus text-xs" />
          <span>Create Session</span>
        </button>
      </div>

      {/* Calendar view */}
      {view === "calendar" && (
        <SessionCalendarView sessions={sessions} loading={loading} />
      )}

      {/* Sessions table */}
      {view === "table" && <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  {["Session", "Tutors", "Date & Time", "Recurrence", "End Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-4 text-xs font-black uppercase text-slate-500">
                      {h === "Status" ? (
                        <div className="flex items-center gap-1">
                          Status
                          <StatusHeaderTooltip />
                        </div>
                      ) : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-white font-bold mb-1">No sessions yet</p>
            <p className="text-slate-400 text-sm">Create your first tutor planner session to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-slate-800/50">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 hover:bg-slate-800/30 transition">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-white text-sm">{session.title}</p>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3">
                    <span><i className="fas fa-calendar mr-1 text-indigo-400"></i>{formatDate(session.scheduled_at)}</span>
                    {formatTime(session.scheduled_at) && (
                      <span><i className="fas fa-clock mr-1 text-indigo-400"></i>{formatTime(session.scheduled_at)} <TimezoneTag /></span>
                    )}
                    {session.recurrence_days?.length > 0 && (
                      <span><i className="fas fa-repeat mr-1 text-purple-400"></i>{sortDays(session.recurrence_days).join(", ")}</span>
                    )}
                    {session.invited_teachers?.length > 0 && (
                      <span><i className="fas fa-users mr-1 text-amber-400"></i>{session.invited_teachers.map((t) => getDisplayName(t)).join(", ")}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!session.is_child && (
                      <button onClick={() => openEdit(session)}
                        className="w-7 h-7 flex items-center justify-center bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition">
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                    )}
                    <button onClick={() => onSessionDelete(session.id)} disabled={loadingSessionIds.has(session.id)}
                      className="w-7 h-7 flex items-center justify-center bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600/20 transition disabled:opacity-50">
                      {loadingSessionIds.has(session.id) ? (
                        <i className="fas fa-spinner fa-spin text-xs"></i>
                      ) : (
                        <i className="fas fa-trash text-xs"></i>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <table className="hidden lg:table w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Session</th>
                  <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Tutors</th>
                  <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Date & Time</th>
                  <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Recurrence</th>
                  <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">End Date</th>
                  <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">
                    <div className="relative flex items-center gap-1 group/statushdr">
                     <div className="flex items-center gap-1">
                        Status
                        <StatusHeaderTooltip />
                      </div>
                    </div>
                  </th>
                  <th className="px-5 py-4 text-xs font-black uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white text-sm">{session.title}</p>
                      {session.is_child && (
                        <span className="mt-1 inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-700/60 text-slate-400 border border-slate-600/30">
                          Child
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {session.invited_teachers?.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {session.invited_teachers.map((t) => (
                            <span key={t.id} className="text-slate-300 text-xs">{getDisplayName(t)}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-300 text-sm">{formatDate(session.scheduled_at)}</div>
                      {formatTime(session.scheduled_at) && (
                        <div className="text-slate-500 text-xs mt-0.5">
                          <i className="fas fa-clock mr-1"></i>{formatTime(session.scheduled_at)} <TimezoneTag />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {session.recurrence_days?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sortDays(session.recurrence_days).map((d) => (
                            <span key={d} className="px-1.5 py-0.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded text-xs font-medium">{d}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-300 text-sm">
                      {session.recurrence_end_date ? formatDate(session.recurrence_end_date) : "-"}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(session.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {!session.is_child && (
                          <button onClick={() => openEdit(session)} title="Edit session"
                            className="w-8 h-8 flex items-center justify-center bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition">
                            <i className="fas fa-edit text-xs"></i>
                          </button>
                        )}
                        <button onClick={() => onSessionDelete(session.id)} disabled={loadingSessionIds.has(session.id)}
                          title="Delete session"
                          className="w-8 h-8 flex items-center justify-center bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600/20 transition disabled:opacity-50">
                          {loadingSessionIds.has(session.id) ? (
                            <i className="fas fa-spinner fa-spin text-xs"></i>
                          ) : (
                            <i className="fas fa-trash text-xs"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4 sm:p-8 w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-5 border-b border-white/5">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  {isEditMode ? "Edit Session" : "Create Teacher Session"}
                </h3>
                <p className="text-slate-500 text-[12px] font-medium mt-1">
                  Schedule a recurring meeting for teachers
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setActiveModal(null); resetForm(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Staff Sync"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: undefined });
                  }}
                  className={`w-full px-3 py-2.5 bg-slate-800/60 border ${
                    errors.title ? "border-red-500/60" : "border-slate-700/60"
                  } rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition`}
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Teachers multiselect */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tutors <span className="text-red-400">*</span>
                </label>
                <TeacherMultiSelect
                  teachers={teachers}
                  selectedIds={form.teacher_ids}
                  onChange={(ids) => {
                    setForm({ ...form, teacher_ids: ids });
                    if (errors.teacher_ids) setErrors({ ...errors, teacher_ids: undefined });
                  }}
                  error={errors.teacher_ids}
                />
                {errors.teacher_ids && <p className="text-red-400 text-xs mt-1">{errors.teacher_ids}</p>}
              </div>

              {/* Start date | End date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.scheduled_date}
                    onChange={(e) => {
                      setForm({ ...form, scheduled_date: e.target.value });
                      if (errors.scheduled_date) setErrors({ ...errors, scheduled_date: undefined });
                    }}
                    className={`w-full px-3 py-2.5 bg-slate-800/60 border ${
                      errors.scheduled_date ? "border-red-500/60" : "border-slate-700/60"
                    } rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition`}
                  />
                  {errors.scheduled_date && <p className="text-red-400 text-xs mt-1">{errors.scheduled_date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.recurrence_end_date}
                    min={form.scheduled_date || undefined}
                    onChange={(e) => {
                      setForm({ ...form, recurrence_end_date: e.target.value });
                      if (errors.recurrence_end_date) setErrors({ ...errors, recurrence_end_date: undefined });
                    }}
                    className={`w-full px-3 py-2.5 bg-slate-800/60 border ${
                      errors.recurrence_end_date ? "border-red-500/60" : "border-slate-700/60"
                    } rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition`}
                  />
                  {errors.recurrence_end_date && <p className="text-red-400 text-xs mt-1">{errors.recurrence_end_date}</p>}
                </div>
              </div>

              {/* Time | Recurring days */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Time <span className="text-red-400">*</span>{" "}
                    <span className="text-slate-500 text-xs">({timezoneAbbr})</span>
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => {
                      setForm({ ...form, time: e.target.value });
                      if (errors.time) setErrors({ ...errors, time: undefined });
                    }}
                    className={`w-full px-3 py-2.5 bg-slate-800/60 border ${
                      errors.time ? "border-red-500/60" : "border-slate-700/60"
                    } rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition`}
                  />
                  {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Recurring Days <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {RECURRENCE_DAYS.map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleDay(key)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                          form.recurrence_days.includes(key)
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors.recurrence_days && <p className="text-red-400 text-xs mt-1">{errors.recurrence_days}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveModal(null); resetForm(); }}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <><i className="fas fa-spinner fa-spin text-xs"></i> Saving...</>
                  ) : isEditMode ? (
                    "Save Changes"
                  ) : (
                    "Create Session"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPlannerTab;
