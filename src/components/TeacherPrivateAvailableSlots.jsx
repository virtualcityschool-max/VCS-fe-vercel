import React, { useEffect, useState, useCallback } from "react";
import { adminService } from "../services/adminService";
import { toastManager } from "../utils/toastManager";

function formatTime(t) {
  const [h] = t.split(":").map(Number);
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function dayPairKey(days) {
  return [...days].sort().join("+");
}

function dayPairLabel(days) {
  const short = { MON: "Mon", TUE: "Tue", WED: "Wed", THU: "Thu", FRI: "Fri", SAT: "Sat", SUN: "Sun" };
  return days.map((d) => short[d] || d).join(" + ");
}

function buildGrid(slots) {
  const pairOrder = [];
  const pairSet = new Set();
  const timeSet = new Set();
  const map = {};

  slots.forEach((slot, idx) => {
    const key = dayPairKey(slot.days);

    if (!pairSet.has(key)) {
      pairSet.add(key);
      pairOrder.push({ key, days: slot.days });
    }

    timeSet.add(slot.time);

    if (!map[key]) map[key] = {};
    map[key][slot.time] = idx;
  });

  const times = [...timeSet].sort();
  return { pairOrder, times, map };
}

// fetchSlotsFn prop lets callers override the API (student vs admin endpoint).
// Defaults to adminService.getTeacherPrivateSlots.
const TeacherPrivateAvailableSlots = ({
  teacher,
  teacherId,
  onSlotSelect,
  fetchSlotsFn,
}) => {
  const [slotsData, setSlotsData] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(null);

  const loadSlots = useCallback(async () => {
    if (!teacherId) return;
    setSlotsLoading(true);
    setSlotsData(null);
    try {
      const fn = fetchSlotsFn || adminService.getTeacherPrivateSlots;
      const data = await fn(teacherId);
      setSlotsData(data);
    } catch {
      toastManager.error("Failed to load teacher availability");
    } finally {
      setSlotsLoading(false);
    }
  }, [teacherId, fetchSlotsFn]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    setSelectedSlotIdx(null);
  }, [teacherId]);

  const slots = slotsData?.available_slots || [];
  const { pairOrder, times, map } = buildGrid(slots);

  const handleSlotClick = (idx, isSelected) => {
    const newIdx = isSelected ? null : idx;
    setSelectedSlotIdx(newIdx);
    if (onSlotSelect) {
      onSlotSelect(newIdx !== null ? slots[newIdx] : null);
    }
  };

  if (!teacherId) return null;

  return (
    <>
      {/* Teacher card — only shown when teacher object is available */}
      {teacher && (
        <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
            {teacher.username?.[0]?.toUpperCase() || "T"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {teacher.username}
            </p>
            <p className="text-xs text-slate-400 truncate">{teacher.email}</p>
          </div>
          {slotsData && (
            <span className="ml-auto text-xs text-slate-400">
              {slotsData.total_slots} slots available
            </span>
          )}
        </div>
      )}

      {/* Slots grid */}
      <div className={teacher ? "mt-4" : ""}>
        {slotsLoading && (
          <div className="text-center py-6 text-slate-400">
            Loading availability...
          </div>
        )}

        {!slotsLoading && slots.length > 0 && (
          <div className="overflow-x-auto border border-slate-700 rounded-xl">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left text-slate-400">Day Pair</th>
                  {times.map((t) => (
                    <th key={t} className="p-2 text-center text-slate-400">
                      {formatTime(t)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pairOrder.map(({ key, days }) => (
                  <tr key={key}>
                    <td className="p-2 text-slate-300 font-medium">
                      {dayPairLabel(days)}
                    </td>
                    {times.map((t) => {
                      const idx = map[key]?.[t];
                      const isSelected = selectedSlotIdx === idx;
                      return (
                        <td key={t} className="text-center">
                          {idx !== undefined ? (
                            <button
                              type="button"
                              onClick={() => handleSlotClick(idx, isSelected)}
                              className={`w-8 h-6 rounded transition ${
                                isSelected
                                  ? "bg-indigo-500 text-white"
                                  : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40"
                              }`}
                            >
                              {isSelected ? "✓" : "•"}
                            </button>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!slotsLoading && slotsData && slots.length === 0 && (
          <div className="text-center py-6 text-slate-400">
            No available slots
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherPrivateAvailableSlots;
