import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { availabilityService } from "../../services/availabilityService";
import { toastManager } from "../../utils/toastManager";
import SlotCalendarView from "../../components/common/SlotCalendarView";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import TimezoneTag from "../../components/ui/TimezoneTag";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const todayInTz = (tz) =>
  new Date().toLocaleDateString("sv-SE", { timeZone: tz || undefined });

const isSlotInPast = (dateStr, timeStr, tz) => {
  const nowStr = new Date().toLocaleString("sv-SE", { timeZone: tz || undefined });
  return `${dateStr} ${timeStr.slice(0, 5)}:00` < nowStr;
};

const calcWindowSlots = (start, end) => {
  if (!start || !end || start >= end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, Math.floor((eh * 60 + em - (sh * 60 + sm)) / 60));
};

const calcEntrySlots = (entry) =>
  entry.time_windows.reduce((n, w) => n + calcWindowSlots(w.start, w.end), 0);

const calcTotalSlots = (entries) =>
  entries.reduce((n, e) => n + calcEntrySlots(e), 0);

const TIME_PRESETS = [
  { label: "Morning", start: "09:00", end: "12:00" },
  { label: "Afternoon", start: "12:00", end: "17:00" },
  { label: "Evening", start: "17:00", end: "20:00" },
  { label: "Full Day", start: "09:00", end: "17:00" },
];

const newEntry = () => ({
  id: crypto.randomUUID(),
  date: "",
  time_windows: [{ id: crypto.randomUUID(), start: "09:00", end: "17:00" }],
});

// ── Time window row ───────────────────────────────────────────────────────────

const TimeWindowRow = ({ window, onChange, onRemove, canRemove }) => {
  const slotCount = calcWindowSlots(window.start, window.end);

  return (
    <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-3">
      <div className={`grid gap-2 items-center ${canRemove ? "grid-cols-[1fr_1fr_auto]" : "grid-cols-2"}`}>
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 shrink-0">From</span>
          <input
            type="time"
            value={window.start}
            onChange={(e) => onChange({ ...window, start: e.target.value })}
            className="bg-transparent text-white text-sm font-semibold outline-none w-full min-w-0 cursor-pointer"
            style={{ colorScheme: "dark" }}
          />
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 shrink-0">Until</span>
          <input
            type="time"
            value={window.end}
            onChange={(e) => onChange({ ...window, end: e.target.value })}
            className="bg-transparent text-white text-sm font-semibold outline-none w-full min-w-0 cursor-pointer"
            style={{ colorScheme: "dark" }}
          />
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 transition flex items-center justify-center shrink-0"
          >
            <i className="fas fa-times text-[10px]" />
          </button>
        )}
      </div>
    </div>
  );
};

// ── Date entry card ───────────────────────────────────────────────────────────

const DateEntryCard = ({ entry, onChange, onRemove, canRemove, index }) => {
  const addWindow = () =>
    onChange({
      ...entry,
      time_windows: [
        ...entry.time_windows,
        { id: crypto.randomUUID(), start: "09:00", end: "12:00" },
      ],
    });

  const updateWindow = (winId, updated) =>
    onChange({
      ...entry,
      time_windows: entry.time_windows.map((w) => (w.id === winId ? updated : w)),
    });

  const removeWindow = (winId) =>
    onChange({
      ...entry,
      time_windows: entry.time_windows.filter((w) => w.id !== winId),
    });

  const totalSlots = calcEntrySlots(entry);

  return (
    <div className="relative bg-slate-800/50 border border-slate-600 rounded-2xl overflow-hidden">
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500/0" />

      <div className="p-5 space-y-4">
        {/* Row 1: index + date + slot count */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <span className="text-indigo-400 text-xs font-black">{index + 1}</span>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 block mb-1">
              Date
            </label>
            <input
              type="date"
              min={today()}
              value={entry.date}
              onChange={(e) => onChange({ ...entry, date: e.target.value })}
              className="bg-slate-700/60 border border-slate-600/60 focus:border-indigo-500/60 rounded-xl px-3 py-1.5 text-white text-sm font-semibold outline-none transition cursor-pointer"
              style={{ colorScheme: "dark" }}
            />
          </div>
          {totalSlots > 0 && (
            <span className="ml-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-1.5 rounded-lg tabular-nums self-end mb-0.5">
              ~{totalSlots} slot{totalSlots !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Row 2: time window actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={addWindow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/10 hover:border-indigo-500/30 text-indigo-400 transition text-[11px] font-bold"
          >
            <i className="fas fa-plus-circle text-[9px]" />
            Add time range
          </button>
          {canRemove && (
            <button
              onClick={onRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 transition text-[11px] font-bold"
            >
              <i className="fas fa-trash-alt text-[9px]" />
              Remove
            </button>
          )}
        </div>

        <div className="h-px bg-slate-700/50" />

        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <i className="fas fa-clock" />
              Time Range
            </p>
            <div className="flex gap-2 flex-wrap items-center">
              {TIME_PRESETS.map((p) => {
                const isActive = entry.time_windows.length === 1 && 
                                 entry.time_windows[0].start === p.start && 
                                 entry.time_windows[0].end === p.end;
                return (
                  <button
                    key={p.label}
                    onClick={() => onChange({
                      ...entry,
                      time_windows: [{ id: entry.time_windows[0]?.id || crypto.randomUUID(), start: p.start, end: p.end }]
                    })}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition border ${
                      isActive
                        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                        : "border-slate-700/50 text-slate-600 hover:text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {entry.time_windows.map((w) => (
            <TimeWindowRow
              key={w.id}
              window={w}
              onChange={(updated) => updateWindow(w.id, updated)}
              onRemove={() => removeWindow(w.id)}
              canRemove={entry.time_windows.length > 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Create Availability Modal ─────────────────────────────────────────────────

// Extract the most specific human-readable message from a DRF error response
const extractApiError = (err) => {
  if (!err?.response) {
    return "Network error. Please check your connection and try again.";
  }
  const d = err.response.data;
  if (!d) return `Server error (${err.response.status}). Please try again.`;
  if (typeof d === "string") return d;
  // DRF field errors — date_ranges is our main field
  if (d.date_ranges) {
    const v = d.date_ranges;
    return Array.isArray(v) ? v[0] : String(v);
  }
  if (d.non_field_errors) {
    const v = d.non_field_errors;
    return Array.isArray(v) ? v[0] : String(v);
  }
  if (d.detail) return String(d.detail);
  if (d.message) return String(d.message);
  // Last resort: first string value in the object
  const first = Object.values(d).find((v) => v);
  if (first) return Array.isArray(first) ? first[0] : String(first);
  return `Server error (${err.response.status}). Please try again.`;
};

const localDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getSundayOfWeek = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - d.getDay());
  return localDateStr(d);
};

const getWeekDates = (sundayStr) => {
  const dates = [];
  const d = new Date(sundayStr + "T00:00:00");
  for (let i = 0; i < 7; i++) {
    dates.push(localDateStr(new Date(d)));
    d.setDate(d.getDate() + 1);
  }
  return dates;
};

const getDatesInRange = (from, to) => {
  const dates = [];
  const cur = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  while (cur <= end && dates.length < 60) {
    dates.push(localDateStr(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

const CreateAvailabilityModal = ({ onClose, onCreated }) => {
  const { timezoneAbbr, timezone } = useDateFormatters();
  const [entries, setEntries] = useState([]);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [inlineError, setInlineError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentWeekSunday, setCurrentWeekSunday] = useState(null);
  const [recurring, setRecurring] = useState(false);

  const previewCount = useMemo(() => calcTotalSlots(entries), [entries]);

  const rangeDatesSet = useMemo(() => new Set(
    rangeFrom && rangeTo && rangeFrom <= rangeTo ? getDatesInRange(rangeFrom, rangeTo) : []
  ), [rangeFrom, rangeTo]);

  const weekDates = useMemo(
    () => (currentWeekSunday ? getWeekDates(currentWeekSunday) : []),
    [currentWeekSunday]
  );

  const weekLabel = useMemo(() => {
    if (!weekDates.length) return "";
    const first = new Date(weekDates[0] + "T00:00:00");
    const last  = new Date(weekDates[6] + "T00:00:00");
    const opts = { month: "short", day: "numeric" };
    return `${first.toLocaleDateString(undefined, opts)} – ${last.toLocaleDateString(undefined, opts)}`;
  }, [weekDates]);

  const canGoPrev = useMemo(() => {
    if (!currentWeekSunday || !rangeDatesSet.size) return false;
    const firstInRange = [...rangeDatesSet].sort()[0];
    return getSundayOfWeek(firstInRange) < currentWeekSunday;
  }, [currentWeekSunday, rangeDatesSet]);

  const canGoNext = useMemo(() => {
    if (!currentWeekSunday || !rangeDatesSet.size) return false;
    const d = new Date(currentWeekSunday + "T00:00:00");
    d.setDate(d.getDate() + 7);
    const nextSunday = localDateStr(d);
    return [...rangeDatesSet].some(date => date >= nextSunday);
  }, [currentWeekSunday, rangeDatesSet]);

  const rangeDates = useMemo(
    () => (rangeFrom && rangeTo && rangeFrom <= rangeTo ? getDatesInRange(rangeFrom, rangeTo) : []),
    [rangeFrom, rangeTo]
  );

  useEffect(() => {
    if (rangeDates.length > 0) {
      const first = rangeDates[0];
      setEntries([{ ...newEntry(), date: first }]); // first day pre-selected with default window
      setSelectedDate(first);
      setInlineError(null);
      setCurrentWeekSunday(getSundayOfWeek(first));
    } else {
      setEntries([]);
      setSelectedDate(null);
      setCurrentWeekSunday(null);
    }
  }, [rangeDates]);

  const addEntry = () => setEntries((prev) => [...prev, newEntry()]);

  const updateEntry = (id, updated) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));

  const removeEntry = (id) =>
    setEntries((prev) => prev.filter((e) => e.id !== id));

  // Recurring-aware update: when recurring ON, propagate time_windows to all same-weekday entries
  const updateEntryRecurring = (id, updated) => {
    if (!recurring) {
      setEntries(prev => prev.map(e => e.id === id ? updated : e));
      return;
    }
    const dow = new Date(updated.date + "T00:00:00").getDay();
    setEntries(prev => prev.map(e => {
      if (e.id === id) return updated;
      if (new Date(e.date + "T00:00:00").getDay() === dow) {
        return { ...e, time_windows: updated.time_windows.map(w => ({ ...w, id: crypto.randomUUID() })) };
      }
      return e;
    }));
  };

  // Recurring-aware remove: when recurring ON, remove all same-weekday entries
  const removeEntryRecurring = (id) => {
    if (!recurring) {
      setEntries(prev => prev.filter(e => e.id !== id));
      setSelectedDate(null);
      return;
    }
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    const dow = new Date(entry.date + "T00:00:00").getDay();
    setEntries(prev => prev.filter(e => new Date(e.date + "T00:00:00").getDay() !== dow));
    setSelectedDate(null);
  };

  // Toggle recurring: when turning ON, immediately expand existing entries to all same-weekday dates
  const handleToggleRecurring = () => {
    const next = !recurring;
    setRecurring(next);
    if (next && rangeDates.length > 0) {
      setEntries(prev => {
        if (!prev.length) return prev;
        const existingDates = new Set(prev.map(e => e.date));
        const toAdd = [];
        prev.forEach(entry => {
          const dow = new Date(entry.date + "T00:00:00").getDay();
          rangeDates.forEach(d => {
            if (!existingDates.has(d) && new Date(d + "T00:00:00").getDay() === dow) {
              existingDates.add(d);
              toAdd.push({
                ...newEntry(),
                date: d,
                time_windows: entry.time_windows.map(w => ({ ...w, id: crypto.randomUUID() })),
              });
            }
          });
        });
        if (!toAdd.length) return prev;
        return [...prev, ...toAdd].sort((a, b) => a.date.localeCompare(b.date));
      });
    }
  };

  const validate = () => {
    if (entries.length === 0) return "Please click at least one day to configure before creating slots.";
    const todayTz = todayInTz(timezone);
    for (const entry of entries) {
      if (!entry.date) return "Please select a date for all entries.";
      if (entry.date < todayTz)
        return `Date ${entry.date} is in the past. Only today or future dates are allowed.`;
      for (const w of entry.time_windows) {
        if (!w.start || !w.end) return "All time ranges need a start and end time.";
        if (w.start >= w.end)
          return `Start time must be before end time (${entry.date}).`;
        if (entry.date === todayTz && isSlotInPast(entry.date, w.start, timezone))
          return `Start time ${fmt12(w.start)} on today has already passed. Please choose a future time.`;
        const [sh, sm] = w.start.split(":").map(Number);
        const [eh, em] = w.end.split(":").map(Number);
        if ((eh * 60 + em) - (sh * 60 + sm) < 60)
          return `Time window on ${entry.date} must be at least 1 hour to create a slot.`;
      }
    }
    return null;
  };

  const handleGenerate = async () => {
    const validationErr = validate();
    if (validationErr) {
      setInlineError({ type: "validation", message: validationErr });
      return;
    }
    setGenerating(true);
    setResult(null);
    setInlineError(null);
    try {
      const payload = entries.map((e) => ({
        date: e.date,
        time_windows: e.time_windows.map(({ start, end }) => ({ start, end })),
      }));
      const data = await availabilityService.generateSlots(payload);
      setResult(data);

      if (data.created > 0) {
        const extras = [];
        if (data.skipped_duplicate > 0)
          extras.push(`${data.skipped_duplicate} already existed`);
        if (data.session_conflicts_count > 0)
          extras.push(`${data.session_conflicts_count} skipped due to class conflicts`);
        toastManager.success(
          `${data.created} slot${data.created > 1 ? "s" : ""} created!` +
            (extras.length ? ` (${extras.join(", ")})` : "")
        );
        onCreated();
        onClose();
        return;
      }

      // created === 0 — explain exactly why with inline feedback
      const dups = data.skipped_duplicate ?? 0;
      const conflicts = data.session_conflicts_count ?? 0;

      if (dups > 0 && conflicts === 0) {
        setInlineError({
          type: "duplicate",
          message: `${dups} slot${dups > 1 ? "s" : ""} already exist${dups === 1 ? "s" : ""} for the times you selected. Choose different dates or times.`,
        });
      } else if (conflicts > 0 && dups === 0) {
        setInlineError({
          type: "conflict",
          message: `All selected times overlap with your scheduled classes (${conflicts} conflict${conflicts > 1 ? "s" : ""}). See the details below.`,
        });
      } else if (dups > 0 || conflicts > 0) {
        setInlineError({
          type: "mixed",
          message: `No new slots created — ${dups > 0 ? `${dups} already exist` : ""}${dups > 0 && conflicts > 0 ? " and " : ""}${conflicts > 0 ? `${conflicts} conflict with your sessions` : ""}. Adjust dates or times and try again.`,
        });
      } else {
        setInlineError({
          type: "unknown",
          message: "No slots were created. Please verify your dates and times and try again.",
        });
      }
    } catch (err) {
      setInlineError({ type: "error", message: extractApiError(err) });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/70 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <i className="fas fa-calendar-plus text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Create Availability</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Set dates &amp; time ranges — hourly slots are generated automatically
                {timezoneAbbr && (
                  <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                    <i className="fas fa-globe text-[8px]" />
                    {timezoneAbbr}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition shrink-0"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* ── Date range picker ── */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4">
            {/* Card header */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-calendar-alt text-indigo-400 text-xs" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Date Range</span>
              </div>
              {rangeDates.length > 0 && (
                <div className="absolute right-0 flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span className="text-indigo-300 text-[10px] font-black tabular-nums">
                    {rangeDates.length} date{rangeDates.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
            {/* Pickers row — centered */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 shrink-0">From</label>
              <input
                type="date"
                min={todayInTz(timezone)}
                value={rangeFrom}
                onChange={(e) => {
                  setRangeFrom(e.target.value);
                  if (rangeTo && e.target.value > rangeTo) setRangeTo("");
                }}
                className="bg-slate-700/60 border border-slate-600/60 focus:border-indigo-500/60 rounded-xl px-3 py-1.5 text-white text-sm font-semibold outline-none transition cursor-pointer"
                style={{ colorScheme: "dark" }}
              />
              <i className="fas fa-arrow-right text-slate-600 text-xs shrink-0" />
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 shrink-0">To</label>
              <input
                type="date"
                min={rangeFrom || todayInTz(timezone)}
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
                className="bg-slate-700/60 border border-slate-600/60 focus:border-indigo-500/60 rounded-xl px-3 py-1.5 text-white text-sm font-semibold outline-none transition cursor-pointer"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          {/* ── Inline error / feedback banner ── */}
          {inlineError && (
            <div
              className={`rounded-2xl border overflow-hidden ${
                inlineError.type === "conflict" || inlineError.type === "mixed"
                  ? "bg-amber-500/10 border-amber-500/20"
                  : "bg-rose-500/10 border-rose-500/20"
              }`}
            >
              {/* Banner header */}
              <div className="flex gap-3 p-4">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    inlineError.type === "conflict" || inlineError.type === "mixed"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  <i
                    className={`fas text-sm ${
                      inlineError.type === "error" || inlineError.type === "validation"
                        ? "fa-exclamation-circle"
                        : inlineError.type === "conflict" || inlineError.type === "mixed"
                        ? "fa-exclamation-triangle"
                        : "fa-info-circle"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold mb-0.5 ${
                      inlineError.type === "conflict" || inlineError.type === "mixed"
                        ? "text-amber-300"
                        : "text-rose-300"
                    }`}
                  >
                    {inlineError.type === "error" || inlineError.type === "validation"
                      ? "Could not create slots"
                      : inlineError.type === "duplicate"
                      ? "Slots already exist"
                      : inlineError.type === "conflict"
                      ? "You already have sessions at these times"
                      : inlineError.type === "mixed"
                      ? "Some times are blocked by existing sessions"
                      : "Nothing was created"}
                  </p>
                  <p
                    className={`text-xs leading-relaxed ${
                      inlineError.type === "conflict" || inlineError.type === "mixed"
                        ? "text-amber-400/80"
                        : "text-rose-400/80"
                    }`}
                  >
                    {inlineError.message}
                  </p>
                </div>
                <button
                  onClick={() => setInlineError(null)}
                  className="shrink-0 text-slate-600 hover:text-slate-400 transition mt-0.5"
                >
                  <i className="fas fa-times text-xs" />
                </button>
              </div>

              {/* Per-conflict rows — only for conflict/mixed types */}
              {(inlineError.type === "conflict" || inlineError.type === "mixed") &&
                result?.session_conflicts?.length > 0 && (
                  <div className="border-t border-amber-500/20 divide-y divide-amber-500/10">
                    {result.session_conflicts.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 flex-wrap"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <i className="fas fa-calendar-times text-amber-400 text-[10px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-amber-200">
                            {fmtDate(c.date)}
                            <span className="text-amber-500 font-normal mx-1.5">·</span>
                            <span className="tabular-nums">{fmt12(c.start_time)} – {fmt12(c.end_time)}{" "}<TimezoneTag /></span>
                          </p>
                          <p className="text-[10px] text-amber-500/70 italic mt-0.5 truncate">
                            Session: &ldquo;{c.session_title}&rdquo;
                          </p>
                        </div>
                        <span className="shrink-0 text-[9px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full px-2 py-0.5">
                          blocked
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* ── Week navigator + day config ── */}
          {rangeDates.length > 0 && currentWeekSunday && (
            <div className="space-y-3">
              {/* Week strip */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 space-y-2">
                {/* Header: label + recurring toggle */}
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                    <i className="fas fa-calendar-week" />
                    Select Days
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className={`text-[12px] font-bold transition-colors ${recurring ? "text-indigo-400" : "text-slate-500"}`}>
                      <i className="fas fa-sync text-[8px] mr-1" />
                      Recurring
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleRecurring}
                      className={`relative inline-flex items-center h-[22px] w-10 rounded-full border-2 border-transparent transition-colors duration-200 shrink-0 cursor-pointer focus:outline-none ${recurring ? "bg-indigo-600" : "bg-slate-700"}`}
                    >
                      <span className={`inline-block h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${recurring ? "translate-x-[18px]" : "translate-x-0"}`} />
                    </button>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  {/* Prev week */}
                  <button
                    onClick={() => {
                      const d = new Date(currentWeekSunday + "T00:00:00");
                      d.setDate(d.getDate() - 7);
                      setCurrentWeekSunday(localDateStr(d));
                    }}
                    disabled={!canGoPrev}
                    className="w-9 h-9 rounded-xl bg-slate-700/60 hover:bg-slate-600 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400 hover:text-white flex items-center justify-center transition shrink-0"
                  >
                    <i className="fas fa-chevron-left text-xs" />
                  </button>

                  {/* Day tiles */}
                  <div className="flex-1 grid grid-cols-7 gap-0.5">
                    {weekDates.map((date) => {
                      const d = new Date(date + "T00:00:00");
                      const dayShort = d.toLocaleDateString("en-US", { weekday: "short" });
                      const dayNum = d.getDate();
                      const inRange = rangeDatesSet.has(date);
                      const isSelected = date === selectedDate;
                      const entry = entries.find(e => e.date === date);
                      const hasEntry = !!entry;
                      const slotCount = entry ? calcEntrySlots(entry) : 0;

                      // Days outside the selected range: visible but disabled
                      if (!inRange) {
                        return (
                          <div key={date} className="flex flex-col items-center py-1.5 px-0.5 rounded-lg cursor-default select-none opacity-25">
                            <span className="text-[9px] font-black uppercase tracking-wide leading-none text-slate-500">
                              {dayShort}
                            </span>
                            <span className="text-sm font-black mt-1 leading-none text-slate-600">
                              {dayNum}
                            </span>
                            <span className="text-[8px] mt-1 leading-none text-transparent">·</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={date}
                          onClick={() => {
                            if (!hasEntry) {
                              if (recurring) {
                                const dow = new Date(date + "T00:00:00").getDay();
                                const sameDayDates = [...rangeDatesSet]
                                  .filter(d => new Date(d + "T00:00:00").getDay() === dow)
                                  .sort();
                                setEntries(prev => {
                                  const existingDates = new Set(prev.map(e => e.date));
                                  const toAdd = sameDayDates
                                    .filter(d => !existingDates.has(d))
                                    .map(d => ({ ...newEntry(), date: d }));
                                  return [...prev, ...toAdd].sort((a, b) => a.date.localeCompare(b.date));
                                });
                              } else {
                                setEntries(prev =>
                                  [...prev, { ...newEntry(), date }].sort((a, b) => a.date.localeCompare(b.date))
                                );
                              }
                              setInlineError(null);
                            }
                            setSelectedDate(date);
                          }}
                          className={`flex flex-col items-center py-1.5 px-0.5 rounded-lg transition-all ${
                            isSelected
                              ? "bg-indigo-600 shadow-lg shadow-indigo-600/25"
                              : hasEntry
                              ? "bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 cursor-pointer"
                              : "bg-slate-700/30 hover:bg-slate-700/60 cursor-pointer"
                          }`}
                        >
                          <span className={`text-[9px] font-black uppercase tracking-wide leading-none ${
                            isSelected ? "text-indigo-200" : hasEntry ? "text-emerald-500/70" : "text-slate-500"
                          }`}>
                            {dayShort}
                          </span>
                          <span className={`text-sm font-black mt-0.5 leading-none ${
                            isSelected ? "text-white" : hasEntry ? "text-emerald-300" : "text-slate-400"
                          }`}>
                            {dayNum}
                          </span>
                          <span className={`text-[8px] font-bold tabular-nums mt-0.5 leading-none ${
                            isSelected ? "text-indigo-200" : hasEntry ? "text-emerald-400" : "text-slate-600"
                          }`}>
                            {hasEntry ? `~${slotCount} slots` : "+"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Next week */}
                  <button
                    onClick={() => {
                      const d = new Date(currentWeekSunday + "T00:00:00");
                      d.setDate(d.getDate() + 7);
                      setCurrentWeekSunday(localDateStr(d));
                    }}
                    disabled={!canGoNext}
                    className="w-9 h-9 rounded-xl bg-slate-700/60 hover:bg-slate-600 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400 hover:text-white flex items-center justify-center transition shrink-0"
                  >
                    <i className="fas fa-chevron-right text-xs" />
                  </button>
                </div>

                {/* Week range label */}
                <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  {weekLabel}
                </p>
              </div>

              {/* Hint when no days selected yet */}
              {entries.length === 0 && !selectedDate && (
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-slate-700/30 rounded-xl">
                  <i className="fas fa-hand-pointer text-indigo-400/60 text-sm shrink-0" />
                  <p className="text-[11px] text-slate-500 font-medium">
                    Click any highlighted day to add it and configure its time range.
                  </p>
                </div>
              )}

              {/* Selected day config panel */}
              {selectedDate && (() => {
                const entry = entries.find(e => e.date === selectedDate);
                if (!entry) return null;
                const slotCount = calcEntrySlots(entry);

                const dow = new Date(entry.date + "T00:00:00").getDay();
                const dowName = new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });

                const addWindow = () =>
                  updateEntryRecurring(entry.id, {
                    ...entry,
                    time_windows: [...entry.time_windows, { id: crypto.randomUUID(), start: "09:00", end: "12:00" }],
                  });

                const updateWindow = (winId, updated) =>
                  updateEntryRecurring(entry.id, {
                    ...entry,
                    time_windows: entry.time_windows.map(w => w.id === winId ? updated : w),
                  });

                const removeWindow = (winId) =>
                  updateEntryRecurring(entry.id, {
                    ...entry,
                    time_windows: entry.time_windows.filter(w => w.id !== winId),
                  });

                return (
                  <div className="relative bg-slate-800/50 border border-slate-600 rounded-2xl overflow-hidden">
                    <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500/0" />
                    <div className="p-5 space-y-4">
                      {/* Day header */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
                            <i className="fas fa-calendar-day text-indigo-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-white">{fmtDate(selectedDate)}</p>
                              {recurring && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-[8px] font-black uppercase tracking-widest">
                                  <i className="fas fa-sync text-[7px]" />
                                  All {dowName}s
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] font-bold mt-0.5 ${slotCount > 0 ? "text-emerald-400" : "text-slate-600"}`}>
                              {slotCount > 0 ? `~${slotCount} slot${slotCount !== 1 ? "s" : ""}` : "No slots yet"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={addWindow}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/10 hover:border-indigo-500/30 text-indigo-400 transition text-[11px] font-bold"
                          >
                            <i className="fas fa-plus-circle text-[9px]" />
                            Add time range
                          </button>
                          <button
                            onClick={() => { removeEntryRecurring(entry.id); setInlineError(null); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 transition text-[11px] font-bold"
                          >
                            <i className="fas fa-trash-alt text-[9px]" />
                            {recurring ? `Remove all ${dowName}s` : "Remove"}
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-slate-700/50" />

                      {/* Presets + time windows */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                            <i className="fas fa-clock" />
                            Time range
                          </p>
                          <div className="flex gap-1.5 flex-wrap">
                            {TIME_PRESETS.map((p) => {
                              const isActive =
                                entry.time_windows.length === 1 &&
                                entry.time_windows[0].start === p.start &&
                                entry.time_windows[0].end === p.end;
                              return (
                                <button
                                  key={p.label}
                                  onClick={() => {
                                    updateEntryRecurring(entry.id, {
                                      ...entry,
                                      time_windows: [{ id: entry.time_windows[0]?.id || crypto.randomUUID(), start: p.start, end: p.end }],
                                    });
                                    setInlineError(null);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition border ${
                                    isActive
                                      ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                                      : "border-slate-700/50 text-slate-600 hover:text-slate-300 hover:border-slate-600"
                                  }`}
                                >
                                  {p.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {entry.time_windows.map((w) => (
                          <TimeWindowRow
                            key={w.id}
                            window={w}
                            onChange={(updated) => { updateWindow(w.id, updated); setInlineError(null); }}
                            onRemove={() => removeWindow(w.id)}
                            canRemove={entry.time_windows.length > 1}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-semibold text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex-[2] flex items-center justify-center gap-3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-sm transition shadow-lg shadow-indigo-500/20"
          >
            {generating ? (
              <>
                <i className="fas fa-spinner fa-spin" />
                Generating…
              </>
            ) : (
              <>
                <i className="fas fa-magic" />
                Create Hourly Slots
                {previewCount > 0 && (
                  <span className="bg-white/15 text-white text-[10px] font-black px-2.5 py-1 rounded-full tabular-nums">
                    ~{previewCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) =>
  status === "booked" ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
      Booked
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      Open
    </span>
  );

// ── Edit slot modal ───────────────────────────────────────────────────────────

const EditSlotModal = ({ slot, onClose, onSaved }) => {
  const { timezone } = useDateFormatters();
  const [date, setDate] = useState(slot.date);
  const [startTime, setStartTime] = useState(slot.start_time.slice(0, 5));
  const [endTime, setEndTime] = useState(slot.end_time.slice(0, 5));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!date) { setError("Date is required."); return; }
    if (!startTime || !endTime) { setError("Both start and end times are required."); return; }
    if (startTime >= endTime) { setError("Start time must be before end time."); return; }
    const todayTz = todayInTz(timezone);
    if (date < todayTz) { setError("Cannot set a slot to a past date."); return; }
    if (date === todayTz && isSlotInPast(date, startTime, timezone)) {
      setError(`Start time ${fmt12(startTime)} has already passed. Please choose a future time.`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await availabilityService.updateSlot(slot.id, {
        date,
        start_time: startTime,
        end_time: endTime,
      });
      toastManager.success("Slot updated.");
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update slot.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/70 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <i className="fas fa-pencil-alt text-indigo-400 text-sm" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Edit Slot</h2>
              <p className="text-slate-500 text-xs mt-0.5">{fmtDate(slot.date)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 block mb-1.5">
              Date
            </label>
            <input
              type="date"
              min={todayInTz(timezone)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500/60 rounded-xl px-3 py-2.5 text-white text-sm font-semibold outline-none transition"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Time range */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 block mb-1.5">
                Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500/60 rounded-xl px-3 py-2.5 text-white text-sm font-semibold outline-none transition"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <i className="fas fa-arrow-right text-slate-600 text-xs mb-3 shrink-0" />
            <div className="flex-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 block mb-1.5">
                End
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500/60 rounded-xl px-3 py-2.5 text-white text-sm font-semibold outline-none transition"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-semibold text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-sm transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Slot card ─────────────────────────────────────────────────────────────────

const SlotCard = ({ slot, onDelete, onEdit, deletingId }) => {
  const { timezoneAbbr } = useDateFormatters();
  const isBooked = slot.status === "booked";
  const isDeleting = deletingId === slot.id;

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden transition ${
        isBooked
          ? "bg-gradient-to-b from-amber-500/[0.05] to-slate-900/80 border-amber-500/20"
          : "bg-slate-900 border-slate-700/50 hover:border-slate-600/70"
      }`}
    >
      <div
        className={`h-[2px] w-full ${
          isBooked
            ? "bg-gradient-to-r from-amber-400/50 to-amber-400/0"
            : "bg-gradient-to-r from-indigo-500/30 to-indigo-500/0"
        }`}
      />

      <div className="p-4">
        {/* Time row + action icons */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-sm font-bold text-white tabular-nums">
              {fmt12(slot.start_time)}
              <span className="text-slate-500 font-normal mx-1">–</span>
              {fmt12(slot.end_time)}{" "}<TimezoneTag />
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5 font-medium">1 hr slot</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Edit button — only for unbooked slots */}
            <button
              onClick={() => !isBooked && onEdit(slot)}
              disabled={isBooked}
              title={isBooked ? "Cannot edit a booked slot" : "Edit slot time"}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition text-xs ${
                isBooked
                  ? "bg-slate-800/40 text-slate-700 cursor-not-allowed"
                  : "bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/10 hover:border-indigo-500/30 text-indigo-400"
              }`}
            >
              <i className="fas fa-pencil-alt text-[10px]" />
            </button>

            {/* Delete button */}
            <button
              onClick={() => !isBooked && onDelete(slot.id)}
              disabled={isBooked || isDeleting}
              title={isBooked ? "Cannot delete a booked slot" : "Delete slot"}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition text-xs ${
                isBooked
                  ? "bg-slate-800/40 text-slate-700 cursor-not-allowed"
                  : "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400"
              }`}
            >
              {isDeleting ? (
                <i className="fas fa-spinner fa-spin text-[10px]" />
              ) : (
                <i className="fas fa-trash-alt text-[10px]" />
              )}
            </button>
          </div>
        </div>

        <StatusBadge status={slot.status} />

        {isBooked && slot.booked_by_name && (
          <div className="flex items-center gap-2.5 bg-slate-800/80 rounded-xl px-3 py-2.5 mt-3">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-black shrink-0">
              {slot.booked_by_name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{slot.booked_by_name}</p>
              {slot.booked_by_email && (
                <p className="text-[10px] text-slate-500 truncate">{slot.booked_by_email}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const TeacherAvailabilityPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const data = await availabilityService.getMySlots();
      setSlots(data);
    } catch {
      setSlotsError("Failed to load your slots. Please refresh.");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleDelete = async (slotId) => {
    setDeletingId(slotId);
    try {
      await availabilityService.deleteSlot(slotId);
      toastManager.success("Slot deleted.");
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err) {
      toastManager.error(err?.response?.data?.error || "Failed to delete slot.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSlotUpdated = (updatedSlot) => {
    setSlots((prev) => prev.map((s) => (s.id === updatedSlot.id ? updatedSlot : s)));
  };

  const availableCount = slots.filter((s) => s.status === "available").length;
  const bookedCount = slots.filter((s) => s.status === "booked").length;

  return (
    <div className="text-white space-y-10 pb-12 animate-fadeIn">
      {/* Page header — matches TeacherClasses style */}
      <div className="relative px-2 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-black font-poppins tracking-tight mb-2">Slots Management</h1>
          <div className="flex items-center gap-3">
            <p className="text-slate-500 text-sm font-medium tracking-wide">
              Manage your tutoring slots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!loadingSlots && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 tabular-nums">{availableCount}</span>
                <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">open</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-slate-200 tabular-nums">{bookedCount}</span>
                <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">booked</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/20"
          >
            <i className="fas fa-plus text-xs" />
            Create Slots
          </button>
        </div>
      </div>

      {/* Page body */}
      <div>

        {/* Empty hero — first time */}
        {!loadingSlots && !slotsError && slots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
              <i className="fas fa-calendar-plus text-indigo-400 text-3xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">No slots yet</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Create your availability and students will be able to book 1-on-1 tutoring slots with you.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/20"
            >
              <i className="fas fa-calendar-plus" />
              Create Availability Slots
            </button>
          </div>
        )}

        {/* Slot calendar */}
        {(loadingSlots || slotsError || slots.length > 0) && (
          <div className="space-y-6">
            {loadingSlots ? (
              <div className="flex flex-col items-center py-32">
                <i className="fas fa-spinner fa-spin text-2xl text-slate-700 mb-3" />
                <p className="text-slate-600 text-sm">Loading your slots…</p>
              </div>
            ) : slotsError ? (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center text-rose-400">
                <i className="fas fa-exclamation-circle text-2xl mb-3 block" />
                <p className="text-sm font-semibold mb-4">{slotsError}</p>
                <button
                  onClick={loadSlots}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold transition"
                >
                  Try again
                </button>
              </div>
            ) : (
              <SlotCalendarView
                slots={slots}
                onDelete={handleDelete}
                onEdit={setEditingSlot}
                deletingId={deletingId}
              />
            )}
          </div>
        )}
        
      </div>

      {/* Create modal — portalled to body to escape layout stacking context */}
      {showCreateModal && createPortal(
        <CreateAvailabilityModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadSlots}
        />,
        document.body
      )}

      {/* Edit slot modal — portalled to body */}
      {editingSlot && createPortal(
        <EditSlotModal
          slot={editingSlot}
          onClose={() => setEditingSlot(null)}
          onSaved={handleSlotUpdated}
        />,
        document.body
      )}
    </div>
  );
};

export default TeacherAvailabilityPage;
