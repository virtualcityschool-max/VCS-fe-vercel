import React, { useMemo, useState } from "react";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import TimezoneTag from "../ui/TimezoneTag";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const fmtDate = (d) => {
  if (!d) return "";
  const [y, mo, day] = d.split("-").map(Number);
  return new Date(y, mo - 1, day).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
};

const todayKey = (() => {
  const t = new Date();
  return `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
})();

const todayStr = (() => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
})();

const isSlotJoinable = (slot) => {
  const start = new Date(slot.date + "T" + slot.start_time);
  const now = Date.now();
  return now >= start.getTime() - 30 * 60 * 1000 && now <= start.getTime() + 60 * 60 * 1000;
};

const openMeetLink = (link) => {
  if (!link || !link.startsWith("http")) return;
  try { new URL(link); window.open(link, "_blank", "noopener,noreferrer"); } catch {}
};

// Popup shown when clicking a booked slot on the calendar
const SlotPopup = ({ slot, onClose, timezone }) => {
  const { timezoneAbbr } = useDateFormatters();
  const joinable = isSlotJoinable(slot);
  const hasMeet = !!slot.meeting_link;

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-slate-900 border border-slate-700/70 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500/0" />

        <div className="px-6 py-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <i className="fas fa-calendar-check text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-black text-white">Booked Session</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {fmtDate(slot.date)}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition shrink-0 mt-0.5">
              <i className="fas fa-times text-xs" />
            </button>
          </div>

          {/* Slot details */}
          <div className="bg-slate-800/60 rounded-2xl px-4 py-3 space-y-2 mb-5">
            <div className="flex items-center gap-2 text-sm">
              <i className="fas fa-clock text-indigo-400/70 w-4 text-center" />
              <span className="font-bold text-white">{fmt12(slot.start_time)} – {fmt12(slot.end_time)}{" "}<TimezoneTag tz={timezone} /></span>
            </div>
            {slot.booked_by_name && (
              <div className="flex items-center gap-2 text-sm">
                <i className="fas fa-user-graduate text-indigo-400/70 w-4 text-center" />
                <span className="text-slate-300">{slot.booked_by_name}</span>
              </div>
            )}
            {slot.booked_by_email && (
              <div className="flex items-center gap-2 text-xs">
                <i className="fas fa-envelope text-indigo-400/70 w-4 text-center" />
                <span className="text-slate-500 truncate">{slot.booked_by_email}</span>
              </div>
            )}
          </div>

          {/* CTA */}
          {hasMeet ? (
            joinable ? (
              <button
                onClick={() => { openMeetLink(slot.meeting_link); onClose(); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition shadow-lg shadow-blue-900/40 active:scale-95"
              >
                <i className="fas fa-video" />
                Join Session Now
              </button>
            ) : (
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700/40 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <i className="fas fa-clock text-amber-400 text-sm" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Not yet joinable</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">You can join 30 minutes before the session starts.</p>
                </div>
              </div>
            )
          ) : (
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700/40 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-700/60 border border-slate-600/40 flex items-center justify-center shrink-0">
                <i className="fas fa-link-slash text-slate-500 text-sm" />
              </div>
              <div>
                <p className="text-xs font-black text-white">Meeting link pending</p>
                <p className="text-[10px] text-slate-500 mt-0.5">The Google Meet link will appear once the booking is confirmed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Slot list / table view ────────────────────────────────────────────────────

const SlotListView = ({ slots, onDelete, onEdit, deletingId, allowDeleteBooked, timezone }) => {
  const sorted = [...slots].sort((a, b) =>
    a.date !== b.date ? a.date.localeCompare(b.date) : (a.start_time || "").localeCompare(b.start_time || "")
  );

  if (!sorted.length) return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
      <div className="w-14 h-14 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-calendar text-slate-400 text-xl" />
      </div>
      <p className="text-white font-bold mb-1">No Slots</p>
      <p className="text-slate-400 text-sm">No slots match the current filter.</p>
    </div>
  );

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="divide-y divide-slate-800/40">
        {sorted.map((slot) => {
          const isBooked = slot.status === "booked";
          const isDeleting = deletingId === slot.id;
          const canEdit = !isBooked && !!onEdit;
          const canDelete = (!isBooked || allowDeleteBooked) && !!onDelete;
          return (
            <div key={slot.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/20 transition">
              <div className={`w-0.5 h-10 rounded-full shrink-0 ${isBooked ? "bg-amber-400/70" : "bg-emerald-400/70"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white tabular-nums">
                  {fmt12(slot.start_time)} – {fmt12(slot.end_time)}{" "}<TimezoneTag tz={timezone} />
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{fmtDate(slot.date)}</p>
              </div>
              {isBooked && slot.booked_by_name && (
                <div className="hidden sm:block min-w-0">
                  <p className="text-xs font-semibold text-slate-300 truncate max-w-[140px]">{slot.booked_by_name}</p>
                  {slot.booked_by_email && (
                    <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{slot.booked_by_email}</p>
                  )}
                </div>
              )}
              <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${
                isBooked
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {isBooked ? "Booked" : "Open"}
              </span>
              {(canEdit || canDelete) && (
                <div className="flex items-center gap-1 shrink-0">
                  {canEdit && (
                    <button
                      onClick={() => onEdit(slot)}
                      title="Edit slot"
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/15 text-indigo-400 transition"
                    >
                      <i className="fas fa-pencil-alt text-[10px]" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => !isDeleting && onDelete(slot.id)}
                      disabled={isDeleting}
                      title="Delete slot"
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/15 text-rose-400 transition disabled:opacity-50"
                    >
                      {isDeleting
                        ? <i className="fas fa-spinner fa-spin text-[10px]" />
                        : <i className="fas fa-trash-alt text-[10px]" />}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main calendar component ───────────────────────────────────────────────────

const STATUS_FILTER_LABELS = { all: "All", available: "Available", booked: "Booked" };

const SlotCalendarView = ({ slots = [], loading = false, onDelete, onEdit, deletingId, allowDeleteBooked = false, timezone }) => {
  const { formatTime, timezoneAbbr } = useDateFormatters();
  const [calendarMonth, setCalendarMonth] = useState(null);
  const [popupSlot, setPopupSlot] = useState(null);
  const [view, setView] = useState("table");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSlots = useMemo(
    () => statusFilter === "all" ? slots : slots.filter((s) => s.status === statusFilter),
    [slots, statusFilter]
  );

  const { monthRange } = useMemo(() => {
    if (!filteredSlots.length) return { monthRange: [] };
    const dates = filteredSlots.map((s) => s.date).filter(Boolean).sort();
    const start = new Date(dates[0] + "T00:00:00");
    const end   = new Date(dates[dates.length - 1] + "T00:00:00");
    const months = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cur <= last) {
      months.push({ year: cur.getFullYear(), month: cur.getMonth() });
      cur.setMonth(cur.getMonth() + 1);
    }
    return { monthRange: months };
  }, [filteredSlots]);

  const activeMonthIdx = useMemo(() => {
    if (!monthRange.length) return 0;
    if (!calendarMonth) {
      const now = new Date();
      const idx = monthRange.findIndex(
        (m) => m.year === now.getFullYear() && m.month === now.getMonth()
      );
      return idx >= 0 ? idx : 0;
    }
    const idx = monthRange.findIndex(
      (m) => m.year === calendarMonth.year && m.month === calendarMonth.month
    );
    return idx >= 0 ? idx : 0;
  }, [monthRange, calendarMonth]);

  const activeMonthData = monthRange[activeMonthIdx] || null;

  const slotsByDate = useMemo(() => {
    const map = {};
    filteredSlots.forEach((s) => {
      if (!s.date) return;
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
    );
    return map;
  }, [filteredSlots]);

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
          <i className="fas fa-spinner fa-spin text-indigo-400 text-lg" />
        </div>
        <p className="text-slate-400 text-sm">Loading slots…</p>
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
        <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-calendar text-slate-400 text-xl" />
        </div>
        <p className="text-white font-bold mb-1">No Slots Found</p>
        <p className="text-slate-400 text-sm">No availability slots match the current filter.</p>
      </div>
    );
  }

  const EMPTY_STATE = {
    available: {
      icon: "fa-calendar-times",
      title: "No available slots",
      message: "All your slots are currently booked. Create new slots to open up availability.",
    },
    booked: {
      icon: "fa-user-clock",
      title: "No bookings yet",
      message: "None of your slots have been booked yet.",
    },
    all: {
      icon: "fa-calendar",
      title: "No slots found",
      message: "No availability slots match the current filter.",
    },
  };

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* ── Mobile: filter pills + always table ── */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
          {Object.entries(STATUS_FILTER_LABELS).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
                statusFilter === f ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {filteredSlots.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className={`fas ${EMPTY_STATE[statusFilter].icon} text-slate-400 text-lg`} />
            </div>
            <p className="text-white font-bold mb-1">{EMPTY_STATE[statusFilter].title}</p>
            <p className="text-slate-400 text-sm">{EMPTY_STATE[statusFilter].message}</p>
          </div>
        ) : (
          <SlotListView slots={filteredSlots} onDelete={onDelete} onEdit={onEdit} deletingId={deletingId} allowDeleteBooked={allowDeleteBooked} timezone={timezone} />
        )}
      </div>

      {/* ── md+: view toggle (left) + filter pills + timezone (right) ── */}
      <div className="hidden md:flex items-center justify-between gap-4 flex-wrap">
        <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shrink-0">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 ${view === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <i className="fas fa-list text-xs" /> Table
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 ${view === "calendar" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <i className="fas fa-calendar-alt text-xs" /> Calendar
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {Object.entries(STATUS_FILTER_LABELS).map(([f, label]) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
                  statusFilter === f ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <TimezoneTag tz={timezone} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400" />
        </div>
      </div>

      {/* ── md+: empty state when filter produces no results ── */}
      {filteredSlots.length === 0 && (
        <div className="hidden md:block bg-slate-900/50 border border-slate-800 rounded-2xl p-14 text-center">
          <div className="w-14 h-14 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className={`fas ${EMPTY_STATE[statusFilter].icon} text-slate-400 text-xl`} />
          </div>
          <p className="text-white font-bold mb-1">{EMPTY_STATE[statusFilter].title}</p>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">{EMPTY_STATE[statusFilter].message}</p>
        </div>
      )}

      {/* ── md+: calendar nav (below toggle, only when calendar view and has data) ── */}
      {filteredSlots.length > 0 && view === "calendar" && (
        <div className="hidden md:block">
          <div className="glass flex items-center gap-3 p-2 rounded-xl border border-slate-800 shadow-xl overflow-x-auto">
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
            {monthRange.length > 1 && <div className="w-px self-stretch bg-slate-800 shrink-0" />}
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
          </div>
        </div>
      )}

      {/* ── md+: table view ── */}
      {filteredSlots.length > 0 && view === "table" && (
        <div className="hidden md:block">
          <SlotListView slots={filteredSlots} onDelete={onDelete} onEdit={onEdit} deletingId={deletingId} allowDeleteBooked={allowDeleteBooked} timezone={timezone} />
        </div>
      )}

      {/* ── md+: calendar grid ── */}
      {filteredSlots.length > 0 && activeMonthData && view === "calendar" && <div className="hidden md:block">
      <div className="glass rounded-2xl sm:rounded-[2.5rem] border-slate-800 overflow-hidden shadow-2xl backdrop-blur-2xl">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-slate-800/50 bg-slate-950/40">
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="px-0 py-2 sm:px-4 sm:py-5 text-center text-[8px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-[0.25em] text-slate-500"
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d.slice(0, 2)}</span>
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7">
          {calendarGrid.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`blank-${idx}`}
                  className="min-h-[60px] sm:min-h-[100px] border-b border-r border-slate-800/30 bg-slate-950/20"
                />
              );
            }

            const dateStr = `${activeMonthData.year}-${String(activeMonthData.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const cellKey = `${activeMonthData.year}-${activeMonthData.month}-${day}`;
            const daySlots = slotsByDate[dateStr] || [];
            const isToday = cellKey === todayKey;

            return (
              <div
                key={cellKey}
                className={`min-h-[60px] max-h-[60px] sm:min-h-[100px] sm:max-h-[100px] overflow-y-auto custom-scrollbar border-b border-r border-slate-800/30 p-1 sm:p-1.5 flex flex-col gap-1 sm:gap-1.5 transition-colors duration-300 ${
                  isToday ? "bg-indigo-500/5" : "hover:bg-white/[0.01]"
                }`}
              >
                {/* Date number */}
                <div className="flex justify-between items-center px-1">
                  {isToday && (
                    <span className="text-[7px] font-black uppercase tracking-widest text-indigo-400">
                      Today
                    </span>
                  )}
                  <span
                    className={`text-[9px] sm:text-[10px] font-black w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg ml-auto transition-all duration-300 ${
                      isToday
                        ? "bg-indigo-500 text-white shadow-lg"
                        : daySlots.length > 0
                        ? "text-white bg-slate-800/50"
                        : "text-slate-600"
                    }`}
                  >
                    {day}
                  </span>
                </div>

                {/* Slot cards */}
                <div className="flex flex-col gap-0.5">
                  {daySlots.map((slot) => {
                    const isBooked = slot.status === "booked";
                    const isDeleting = deletingId === slot.id;
                    const isUpcoming = slot.date >= todayStr;
                    const isClickable = isBooked && isUpcoming;

                    return (
                      <div
                        key={slot.id}
                        onClick={isClickable ? () => setPopupSlot(slot) : undefined}
                        className={`group/slot relative overflow-hidden pl-2 pr-1 py-1 rounded-lg border transition-all duration-200 ${
                          isBooked
                            ? `bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 ${isClickable ? "cursor-pointer" : ""}`
                            : "bg-indigo-500/10 border-indigo-500/15 hover:bg-indigo-500/20 hover:border-indigo-500/30"
                        }`}
                      >
                        {/* Left accent bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isBooked ? "bg-amber-400/70" : "bg-indigo-400/70"}`} />

                        {/* Name / Open  +  timezone — top row */}
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          {isBooked && slot.booked_by_name ? (
                            <p className="text-[8px] font-black text-white truncate leading-tight min-w-0">
                              {slot.booked_by_name}
                            </p>
                          ) : !isBooked ? (
                            <p className="text-[8px] font-black text-indigo-300/80 leading-tight min-w-0">
                              Open
                            </p>
                          ) : <span className="min-w-0" />}
                          <TimezoneTag tz={timezone} className={`text-[8px] font-black shrink-0 ${isBooked ? "text-amber-400/90" : "text-indigo-400/90"}`} />
                        </div>

                        {/* Time + badge row */}
                        <div className="flex items-center gap-0.5 overflow-hidden">
                          <div className={`flex items-center gap-0.5 truncate ${isBooked ? "text-amber-400/70" : "text-indigo-400/70"}`}>
                            <i className="far fa-clock text-[6px] shrink-0" />
                            <span className="text-[7px] font-semibold tabular-nums truncate">
                              {fmt12(slot.start_time)}
                            </span>
                          </div>
                          <span className={`ml-auto shrink-0 hidden lg:inline text-[6px] font-black uppercase px-1 py-0.5 rounded border ${
                            isBooked
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                          }`}>
                            {isBooked ? "bkd" : "open"}
                          </span>
                        </div>

                        {/* Clickable hint for upcoming booked slots (when not showing delete) */}
                        {isClickable && !allowDeleteBooked && (
                          <div className="hidden md:flex items-center gap-0.5 mt-0.5 opacity-0 group-hover/slot:opacity-100 transition-opacity duration-150">
                            <i className="fas fa-video text-[7px] text-blue-400" />
                            <span className="text-[7px] text-blue-400 font-bold">Join</span>
                          </div>
                        )}

                        {/* Edit / delete (hover, desktop) — unbooked always; booked when allowDeleteBooked */}
                        {(!isBooked || allowDeleteBooked) && (
                          <div className="hidden md:flex items-center gap-1 mt-1 opacity-0 group-hover/slot:opacity-100 transition-opacity duration-150">
                            {!isBooked && onEdit && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onEdit(slot); }}
                                className="flex-1 flex items-center justify-center h-4 rounded bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-400 transition"
                                title="Edit slot"
                              >
                                <i className="fas fa-pencil-alt text-[7px]" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); onDelete && onDelete(slot.id); }}
                              disabled={isDeleting}
                              className="flex-1 flex items-center justify-center h-4 rounded bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition disabled:opacity-50"
                              title="Delete slot"
                            >
                              {isDeleting
                                ? <i className="fas fa-spinner fa-spin text-[7px]" />
                                : <i className="fas fa-trash-alt text-[7px]" />
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>}  {/* end calendar grid conditional */}

      {popupSlot && <SlotPopup slot={popupSlot} onClose={() => setPopupSlot(null)} timezone={timezone} />}
    </div>
  );
};

export default SlotCalendarView;
