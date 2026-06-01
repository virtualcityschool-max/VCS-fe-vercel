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
const SlotPopup = ({ slot, onClose }) => {
  const { formatDate, formatTime, timezoneAbbr } = useDateFormatters();
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
                  {formatDate(slot.date + "T" + slot.start_time)}
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
              <span className="font-bold text-white">{formatTime(slot.date + "T" + slot.start_time)} – {formatTime(slot.date + "T" + slot.end_time)}{" "}<TimezoneTag /></span>
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

const SlotCalendarView = ({ slots = [], loading = false, onDelete, onEdit, deletingId, allowDeleteBooked = false }) => {
  const { formatTime, timezoneAbbr } = useDateFormatters();
  const [calendarMonth, setCalendarMonth] = useState(null);
  const [popupSlot, setPopupSlot] = useState(null);

  const { monthRange } = useMemo(() => {
    if (!slots.length) return { monthRange: [] };
    const dates = slots.map((s) => s.date).filter(Boolean).sort();
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
  }, [slots]);

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
    slots.forEach((s) => {
      if (!s.date) return;
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
    );
    return map;
  }, [slots]);

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

  if (!activeMonthData) return null;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Month navigation */}
      <div className="glass flex items-center justify-between p-1.5 rounded-xl border-slate-800 shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <button
          onClick={() => setCalendarMonth(monthRange[Math.max(0, activeMonthIdx - 1)])}
          disabled={activeMonthIdx === 0}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-indigo-500 hover:text-white text-slate-400 disabled:opacity-10 disabled:cursor-not-allowed transition-all duration-300 relative z-10"
        >
          <i className="fas fa-chevron-left text-xs" />
        </button>

        <div className="text-center relative z-10 py-2">
          <h2 className="text-lg font-black text-white tracking-tight">
            {MONTH_NAMES[activeMonthData.month]}&nbsp;&nbsp;
            <span className="text-indigo-400">{activeMonthData.year}</span>
          </h2>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            {activeMonthIdx + 1} of {monthRange.length} Month{monthRange.length !== 1 ? "s" : ""}
          </span>
        </div>

        <button
          onClick={() => setCalendarMonth(monthRange[Math.min(monthRange.length - 1, activeMonthIdx + 1)])}
          disabled={activeMonthIdx === monthRange.length - 1}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-indigo-500 hover:text-white text-slate-400 disabled:opacity-10 disabled:cursor-not-allowed transition-all duration-300 relative z-10"
        >
          <i className="fas fa-chevron-right text-xs" />
        </button>
      </div>

      {/* Month tab pills */}
      {monthRange.length > 1 && (
        <div className="flex gap-2 flex-wrap px-1">
          {monthRange.map((m, idx) => (
            <button
              key={`${m.year}-${m.month}`}
              onClick={() => setCalendarMonth(m)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                idx === activeMonthIdx
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-800/40 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-800"
              }`}
            >
              {MONTH_NAMES[m.month].slice(0, 3)} {m.year}
            </button>
          ))}
        </div>
      )}

      {/* Calendar grid */}
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

                        {/* Student name — prominent, top */}
                        {isBooked && slot.booked_by_name ? (
                          <p className="text-[9px] sm:text-[10px] font-black text-white truncate leading-tight mb-0.5">
                            {slot.booked_by_name}
                          </p>
                        ) : !isBooked && (
                          <p className="text-[9px] sm:text-[10px] font-black text-indigo-300/80 truncate leading-tight mb-0.5">
                            Open
                          </p>
                        )}

                        {/* Time + badge row */}
                        <div className="flex items-center justify-between gap-1">
                          <div className={`flex items-center gap-0.5 ${isBooked ? "text-amber-400/70" : "text-indigo-400/70"}`}>
                            <i className="far fa-clock text-[6px] sm:text-[7px]" />
                            <span className="text-[7px] sm:text-[8px] font-semibold tabular-nums">
                              {formatTime(slot.date + "T" + slot.start_time)}{" "}<TimezoneTag />
                            </span>
                          </div>
                          <span className={`shrink-0 text-[6px] sm:text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded border ${
                            isBooked
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                          }`}>
                            {isBooked ? "booked" : "open"}
                          </span>
                        </div>

                        {/* Clickable hint for upcoming booked slots (when not showing delete) */}
                        {isClickable && !allowDeleteBooked && (
                          <div className="hidden sm:flex items-center gap-0.5 mt-0.5 opacity-0 group-hover/slot:opacity-100 transition-opacity duration-150">
                            <i className="fas fa-video text-[7px] text-blue-400" />
                            <span className="text-[7px] text-blue-400 font-bold">Join</span>
                          </div>
                        )}

                        {/* Edit / delete (hover, desktop) — unbooked always; booked when allowDeleteBooked */}
                        {(!isBooked || allowDeleteBooked) && (
                          <div className="hidden sm:flex items-center gap-1 mt-1 opacity-0 group-hover/slot:opacity-100 transition-opacity duration-150">
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
      {/* Join popup for booked upcoming slots */}
      {popupSlot && <SlotPopup slot={popupSlot} onClose={() => setPopupSlot(null)} />}
    </div>
  );
};

export default SlotCalendarView;
