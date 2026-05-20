import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { adminService } from "../../services/adminService";
import { toastManager } from "../../utils/toastManager";

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

const TeacherSlotsSection = ({ teacherId }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmSlot, setConfirmSlot] = useState(null); // slot object to delete
  const [deleting, setDeleting] = useState(null); // slot id being deleted

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getTeacherSlots(teacherId);
      setSlots(Array.isArray(data) ? data : []);
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

  // Group by date
  const grouped = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const availableCount = slots.filter((s) => s.status === "available").length;
  const bookedCount = slots.filter((s) => s.status === "booked").length;

  return (
    <div className="mt-8">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
            <i className="fas fa-calendar-check text-sm" />
          </div>
          <h3 className="text-base font-semibold text-white">Availability Slots</h3>
        </div>
        {!loading && !error && slots.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[10px] font-black text-slate-300 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {availableCount} open
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[10px] font-black text-slate-300 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {bookedCount} booked
            </span>
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
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, daySlots], gi) => {
              const upcoming = isUpcoming(date);
              return (
                <div key={date}>
                  {/* Date row */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 ${gi > 0 ? "border-t border-slate-700/50" : ""} bg-slate-800/60`}>
                    <i className={`fas fa-calendar-day text-[9px] ${upcoming ? "text-indigo-400" : "text-slate-600"}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${upcoming ? "text-slate-300" : "text-slate-600"}`}>
                      {fmtDate(date)}
                    </span>
                    {!upcoming && (
                      <span className="text-[8px] font-black bg-slate-700 text-slate-500 rounded px-1.5 py-0.5 uppercase tracking-widest">past</span>
                    )}
                    <span className="ml-auto text-[9px] text-slate-600 tabular-nums">{daySlots.length} slot{daySlots.length !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Slot rows */}
                  {daySlots.map((slot) => {
                    const isBooked = slot.status === "booked";
                    const isDel = deleting === slot.id;
                    return (
                      <div
                        key={slot.id}
                        className={`flex items-center gap-3 px-3 py-2 border-t border-slate-700/30 ${isBooked ? "bg-amber-500/[0.03]" : ""}`}
                      >
                        {/* Time */}
                        <span className="text-xs font-bold text-white tabular-nums w-36 shrink-0">
                          {fmt12(slot.start_time)}<span className="text-slate-600 mx-1">–</span>{fmt12(slot.end_time)}
                        </span>

                        {/* Status dot */}
                        {isBooked ? (
                          <span className="flex items-center gap-1 text-[9px] font-black text-amber-400 uppercase tracking-widest shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            Booked
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase tracking-widest shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                            Open
                          </span>
                        )}

                        {/* Booked-by info */}
                        {isBooked && slot.booked_by_name && (
                          <span className="text-[11px] text-slate-500 truncate flex-1">
                            <i className="fas fa-user text-[9px] mr-1" />
                            {slot.booked_by_name}
                            {slot.booked_by_email && <span className="text-slate-600 ml-1">· {slot.booked_by_email}</span>}
                          </span>
                        )}
                        {!isBooked && <span className="flex-1" />}

                        {/* Delete */}
                        <button
                          onClick={() => setConfirmSlot(slot)}
                          disabled={isDel}
                          title="Delete slot"
                          className="shrink-0 w-6 h-6 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 transition flex items-center justify-center disabled:opacity-40"
                        >
                          {isDel
                            ? <i className="fas fa-spinner fa-spin text-[9px]" />
                            : <i className="fas fa-trash-alt text-[9px]" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
      )}

      {/* Confirm dialog — portalled to body so fixed positioning is always viewport-relative */}
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
                  {fmt12(confirmSlot.start_time)} – {fmt12(confirmSlot.end_time)}
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
