import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { adminService } from "../../services/adminService";
import { toastManager } from "../../utils/toastManager";
import TimezoneTag from "../ui/TimezoneTag";

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

const isUpcoming = (date) => new Date(date + "T23:59:59") >= new Date();

// ── Compact slot card ─────────────────────────────────────────────────────────
const SlotCard = ({ slot, onDelete, deleting, timezone }) => {
  const isBooked = slot.status === "booked";
  const isDel = deleting === slot.id;

  return (
    <div
      className={`relative rounded-xl border overflow-hidden transition ${
        isBooked
          ? "bg-gradient-to-b from-amber-500/[0.06] to-slate-900/80 border-amber-500/20"
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

      <div className="p-3">
        {/* Time + delete */}
        <div className="flex items-start justify-between gap-1.5 mb-2">
          <div>
            <p className="text-xs font-bold text-white tabular-nums leading-tight">
              {fmt12(slot.start_time)}
              <span className="text-slate-500 font-normal mx-1">–</span>
              {fmt12(slot.end_time)}
            </p>
            {timezone && (
              <p className="text-[9px] text-indigo-400/70 mt-0.5 font-bold uppercase tracking-widest">{timezone}</p>
            )}
            <p className="text-[9px] text-slate-600 mt-0.5 font-medium">1 hr</p>
          </div>
          <button
            onClick={() => !isBooked && onDelete(slot)}
            disabled={isBooked || isDel}
            title={isBooked ? "Cannot delete a booked slot" : "Delete slot"}
            className={`shrink-0 w-6 h-6 rounded-lg border transition flex items-center justify-center disabled:opacity-40 ${
              isBooked
                ? "bg-slate-800/40 border-slate-700/30 text-slate-700 cursor-not-allowed"
                : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/10 hover:border-rose-500/30 text-rose-400"
            }`}
          >
            {isDel
              ? <i className="fas fa-spinner fa-spin text-[9px]" />
              : <i className="fas fa-trash-alt text-[9px]" />}
          </button>
        </div>

        {/* Status badge */}
        {isBooked ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[8px] font-black uppercase tracking-widest">
            <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
            Booked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[8px] font-black uppercase tracking-widest">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            Open
          </span>
        )}

        {/* Booked-by info */}
        {isBooked && slot.booked_by_name && (
          <div className="flex items-center gap-1.5 mt-2 bg-slate-800/80 rounded-lg px-2 py-1.5">
            <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-300 text-[9px] font-black shrink-0">
              {slot.booked_by_name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-200 truncate">{slot.booked_by_name}</p>
              {slot.booked_by_email && (
                <p className="text-[9px] text-slate-500 truncate">{slot.booked_by_email}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main section ──────────────────────────────────────────────────────────────
const TeacherSlotsSection = ({ teacherId }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmSlot, setConfirmSlot] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState("all"); // all | available | booked

  const [timezone, setTimezone] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getTeacherSlots(teacherId);
      if (Array.isArray(data)) {
        setSlots(data);
      } else {
        setSlots(data.slots || []);
        setTimezone(data.student_timezone || null);
      }
    } catch {
      setError("Failed to load slots.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteConfirm = async () => {
    if (!confirmSlot) return;
    const slot = confirmSlot;
    setConfirmSlot(null);
    setDeleting(slot.id);
    try {
      await adminService.adminDeleteSlot(slot.id);
      setSlots((prev) => prev.filter((s) => s.id !== slot.id));
      toastManager.success(
        slot.booked_by_name
          ? `Slot deleted. Emails sent to teacher and ${slot.booked_by_name}.`
          : "Slot deleted. Email sent to teacher."
      );
    } catch {
      toastManager.error("Failed to delete slot.");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = filter === "all" ? slots : slots.filter((s) => s.status === filter);

  const grouped = filtered.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const availableCount = slots.filter((s) => s.status === "available").length;
  const bookedCount = slots.filter((s) => s.status === "booked").length;

  return (
    <div className="mt-8 pt-8 border-t border-slate-700/60">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <i className="fas fa-calendar-check text-sm" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Availability Slots</h3>
            {!loading && !error && (
              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                {slots.length} total · {availableCount} open · {bookedCount} booked
                {timezone && (
                  <TimezoneTag tz={timezone} className="text-indigo-400/70 font-black" />
                )}
              </p>
            )}
          </div>
        </div>
        {!loading && !error && slots.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter(filter === "available" ? "all" : "available")}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition cursor-pointer border ${
                filter === "available"
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500/30 hover:text-emerald-400"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {availableCount} open
            </button>
            <button
              onClick={() => setFilter(filter === "booked" ? "all" : "booked")}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition cursor-pointer border ${
                filter === "booked"
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-500/30 hover:text-amber-400"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {bookedCount} booked
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <i className="fas fa-spinner fa-spin text-slate-600 text-xl" />
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center text-rose-400">
          <i className="fas fa-exclamation-circle text-xl mb-2 block" />
          <p className="text-sm font-semibold mb-3">{error}</p>
          <button
            onClick={load}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold transition"
          >
            Try again
          </button>
        </div>
      ) : slots.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center">
          <i className="fas fa-calendar-times text-slate-700 text-3xl block mb-3" />
          <p className="text-slate-600 text-sm">No availability slots created yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, daySlots]) => {
              const upcoming = isUpcoming(date);
              const dayOpen = daySlots.filter((s) => s.status === "available").length;
              const dayBooked = daySlots.filter((s) => s.status === "booked").length;
              return (
                <div key={date}>
                  {/* Date header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-px flex-1 bg-slate-800" />
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${upcoming ? "text-slate-400" : "text-slate-600"}`}>
                        {fmtDate(date)}
                      </span>
                      {!upcoming && (
                        <span className="text-[8px] font-black bg-slate-800 text-slate-600 rounded px-1.5 py-0.5 uppercase tracking-widest border border-slate-700">
                          past
                        </span>
                      )}
                      {dayOpen > 0 && (
                        <span className="text-[9px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full px-2 py-0.5">
                          {dayOpen} open
                        </span>
                      )}
                      {dayBooked > 0 && (
                        <span className="text-[9px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full px-2 py-0.5">
                          {dayBooked} booked
                        </span>
                      )}
                    </div>
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>

                  {/* Slot cards grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {daySlots.map((slot) => (
                      <SlotCard
                        key={slot.id}
                        slot={slot}
                        onDelete={setConfirmSlot}
                        deleting={deleting}
                        timezone={timezone}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Confirm delete dialog - portalled to body */}
      {confirmSlot && createPortal(
        <div className="fixed inset-0 z-[950] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <i className="fas fa-trash-alt" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Slot</h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-slate-300">
                You are about to delete the slot on{" "}
                <span className="font-semibold text-white">{fmtDate(confirmSlot.date)}</span>{" "}
                from{" "}
                <span className="font-semibold text-white tabular-nums">
                  {fmt12(confirmSlot.start_time)} – {fmt12(confirmSlot.end_time)}{" "}{timezone && <TimezoneTag tz={timezone} />}
                </span>.
              </p>
              {confirmSlot.booked_by_name ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
                  <i className="fas fa-exclamation-triangle text-amber-400 text-sm mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300">
                    This slot is booked by{" "}
                    <span className="font-bold">{confirmSlot.booked_by_name}</span>.
                    An email will be sent to both the teacher and the student.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 flex items-start gap-2">
                  <i className="fas fa-envelope text-slate-500 text-sm mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-400">
                    An email notification will be sent to the teacher.
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => setConfirmSlot(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition shadow-lg shadow-rose-500/20"
              >
                Delete Slot
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TeacherSlotsSection;
