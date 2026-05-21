import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { adminService } from "../../services/adminService";
import { toastManager } from "../../utils/toastManager";
import SlotCalendarView from "../common/SlotCalendarView";

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

const TeacherSlotsCalendarSection = ({ teacherId }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [confirmSlot, setConfirmSlot] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDeleteRequest = (slotId) => {
    const slot = slots.find((s) => s.id === slotId);
    if (slot) setConfirmSlot(slot);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmSlot) return;
    const slot = confirmSlot;
    setConfirmSlot(null);
    setDeletingId(slot.id);
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
      setDeletingId(null);
    }
  };

  const availableCount = slots.filter((s) => s.status === "available").length;
  const bookedCount = slots.filter((s) => s.status === "booked").length;

  const filtered = filter === "all" ? slots : slots.filter((s) => s.status === filter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <i className="fas fa-calendar-check text-sm" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Availability Slots</h3>
            {!loading && !error && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                {slots.length} total · {availableCount} open · {bookedCount} booked
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

      {error ? (
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
      ) : (
        <SlotCalendarView
          slots={filtered}
          loading={loading}
          onDelete={handleDeleteRequest}
          deletingId={deletingId}
          allowDeleteBooked
        />
      )}

      {/* Confirm delete dialog */}
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

export default TeacherSlotsCalendarSection;
