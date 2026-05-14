import React, { useMemo } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getId = (v) => (v && typeof v === "object") ? v.id : v;

const CELL = {
  present: { letter: "P", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  absent:  { letter: "A", cls: "bg-rose-500/20    text-rose-400    border-rose-500/30"    },
  late:    { letter: "L", cls: "bg-yellow-500/20  text-yellow-400  border-yellow-500/30"  },
};

const leftShadow  = { boxShadow: "4px 0 8px rgba(0,0,0,0.4)" };
const rightShadow = { boxShadow: "-4px 0 8px rgba(0,0,0,0.4)" };
const SUMMARY_W = 110;

// ── AttendanceMatrix ──────────────────────────────────────────────────────────
/**
 * Props:
 *   sessions          – array from GET /classroom/sessions/?course=id (top-level only)
 *   attendanceRecords – array from GET /classroom/attendance/?course=id&participant_role=…
 *   participantRole   – "student" | "teacher"
 *   onEditRecord      – optional (record) => void  (only called for marked cells)
 */
const AttendanceMatrix = ({
  sessions          = [],
  attendanceRecords = [],
  participantRole   = "student",
  onEditRecord,
}) => {
  // Sort sessions chronologically
  const sortedSessions = useMemo(() =>
    [...sessions].sort((a, b) => {
      const da = a.scheduled_at ? new Date(a.scheduled_at) : 0;
      const db = b.scheduled_at ? new Date(b.scheduled_at) : 0;
      return da - db;
    })
  , [sessions]);

  // Group sessions by "Month Year" for the colspan header row
  const monthGroups = useMemo(() => {
    const groups = [];
    sortedSessions.forEach((s) => {
      const d = s.scheduled_at ? new Date(s.scheduled_at) : null;
      const key   = d ? `${d.getFullYear()}-${d.getMonth()}` : "?";
      const label = d ? d.toLocaleDateString([], { month: "long", year: "numeric" }) : "—";
      if (!groups.length || groups[groups.length - 1].key !== key) {
        groups.push({ key, label, count: 0 });
      }
      groups[groups.length - 1].count++;
    });
    return groups;
  }, [sortedSessions]);

  // O(1) lookup: `${participantId}_${sessionId}` → record
  // The backend always stores the participant's ID in r.student regardless of participant_role.
  const lookupMap = useMemo(() => {
    const map = {};
    attendanceRecords.forEach((r) => {
      const pId = getId(r.student);
      const sId = getId(r.session);
      if (pId != null && sId != null) map[`${pId}_${sId}`] = r;
    });
    return map;
  }, [attendanceRecords]);

  // Unique participants — preserve order from records
  const participants = useMemo(() => {
    const map = new Map();
    attendanceRecords.forEach((r) => {
      const id   = getId(r.student);
      const name = participantRole === "student" ? r.student_name : r.teacher_name;
      if (id != null && !map.has(id)) map.set(id, { id, name: name || `#${id}` });
    });
    return Array.from(map.values());
  }, [attendanceRecords, participantRole]);

  // ── Empty states ──────────────────────────────────────────────────────────
  if (!sortedSessions.length) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="fas fa-calendar-times text-slate-500 text-xl" />
        </div>
        <p className="text-slate-400 text-sm">No sessions found for this course</p>
      </div>
    );
  }

  if (!participants.length) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="fas fa-user-slash text-slate-500 text-xl" />
        </div>
        <p className="text-slate-400 text-sm">No attendance records found</p>
      </div>
    );
  }

  const isStudent = participantRole === "student";

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap px-1">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold shrink-0">Legend</span>
        {Object.entries(CELL).map(([status, cfg]) => (
          <span key={status} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${cfg.cls}`}>
            <span>{cfg.letter}</span>
            <span className="font-normal opacity-70 capitalize">{status}</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold bg-slate-800 text-slate-500 border-slate-700">
          <span>—</span>
          <span className="font-normal opacity-70">No record</span>
        </span>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl">
        <div className="rounded-3xl overflow-x-auto">
          <table className="text-sm border-collapse" style={{ minWidth: "100%" }}>
            <thead>
              {/* Row 1: sticky name col (rowspan 2) + month group headers + sticky summary col (rowspan 2) */}
              <tr className="border-b border-slate-800/60 bg-slate-900">
                <th
                  rowSpan={2}
                  className="sticky left-0 z-20 bg-slate-900 px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[185px] border-r border-slate-800"
                  style={leftShadow}
                >
                  {isStudent ? "Student" : "Teacher"}
                </th>

                {monthGroups.map((g) => (
                  <th
                    key={g.key}
                    colSpan={g.count}
                    className="px-2 py-2 text-center text-[11px] font-bold text-slate-300 border-r border-slate-800/50 last:border-r-0 whitespace-nowrap"
                  >
                    {g.label}&nbsp;&nbsp; <span className="text-[12px] font-normal text-slate-400">{' '}Sessions</span>
                  </th>
                ))}

                <th
                  rowSpan={2}
                  className="sticky right-0 z-20 bg-slate-900 px-4 py-3 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-l border-slate-800"
                  style={{ minWidth: SUMMARY_W, ...rightShadow }}
                >
                  Summary
                </th>
              </tr>

              {/* Row 2: per-session day / weekday headers */}
              <tr className="border-b border-slate-800 bg-slate-900">
                {sortedSessions.map((s) => {
                  const d = s.scheduled_at ? new Date(s.scheduled_at) : null;
                  return (
                    <th
                      key={s.id}
                      className="px-1 py-2 text-center min-w-[52px]"
                      title={s.title + (d ? ` — ${d.toLocaleDateString()}` : "")}
                    >
                      {d ? (
                        <>
                          <div className="text-[12px] font-bold text-slate-300 leading-none">{d.getDate()}</div>
                          <div className="text-[9px] text-slate-600 uppercase mt-0.5">{d.toLocaleDateString([], { weekday: "short" })}</div>
                        </>
                      ) : (
                        <span className="text-slate-700 text-[10px]">—</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {participants.map((p) => {
                // Per-row counts
                let attended = 0, absent = 0, late = 0, marked = 0;
                sortedSessions.forEach((s) => {
                  const r = lookupMap[`${p.id}_${s.id}`];
                  if (r) {
                    marked++;
                    if (r.status === "present") attended++;
                    else if (r.status === "absent") absent++;
                    else if (r.status === "late") { late++; attended++; }
                  }
                });
                const total = sortedSessions.length;
                const pct   = marked ? Math.round((attended / marked) * 100) : null;
                const pctColor = pct == null ? "text-slate-600"
                  : pct >= 75 ? "text-emerald-400"
                  : pct >= 50 ? "text-yellow-400"
                  : "text-rose-400";

                return (
                  <tr key={p.id} className="border-b border-slate-800/40 last:border-0 group">
                    {/* Sticky name cell */}
                    <td
                      className="sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800 px-5 py-3 border-r border-slate-800/50 transition-colors"
                      style={leftShadow}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isStudent ? "bg-indigo-600/20" : "bg-violet-600/20"}`}>
                          <span className={`text-xs font-bold ${isStudent ? "text-indigo-400" : "text-violet-400"}`}>
                            {(p.name || "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white text-xs font-semibold truncate max-w-[120px]">{p.name}</p>
                      </div>
                    </td>

                    {/* Per-session cells */}
                    {sortedSessions.map((s) => {
                      const record   = lookupMap[`${p.id}_${s.id}`];
                      const cfg      = record ? CELL[record.status] : null;
                      const editable = !!onEditRecord && !!record;

                      const fmtTime = (ts) => ts
                        ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : null;
                      const joinedStr = fmtTime(record?.joined_at);
                      const leftStr   = fmtTime(record?.left_at);

                      return (
                        <td
                          key={s.id}
                          className={`px-1 py-3 text-center group-hover:bg-slate-800/30 transition-colors ${editable ? "cursor-pointer" : ""}`}
                          onClick={() => editable && onEditRecord(record)}
                        >
                          {cfg ? (
                            <div className="relative inline-flex group/cell">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-bold border select-none ${cfg.cls} ${editable ? "hover:ring-1 hover:ring-white/20" : ""}`}>
                                {cfg.letter}
                              </span>
                              {/* Hover tooltip */}
                              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 opacity-0 group-hover/cell:opacity-100 -translate-y-0.5 group-hover/cell:translate-y-0 transition-all duration-150 whitespace-nowrap">
                                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-3 py-2 text-left text-[11px] space-y-1 min-w-[120px]">
                                  <p className="font-bold capitalize text-white">{record.status}</p>
                                    <p className="text-slate-400 flex items-center gap-1.5">
                                      {/* <i className="fas fa-sign-in-alt text-emerald-400 text-[10px]" /> */}
                                      Joined At: {joinedStr ? joinedStr : "—"}
                                    </p>
                                    <p className="text-slate-400 flex items-center gap-1.5">
                                      {/* <i className="fas fa-sign-out-alt text-rose-400 text-[10px]" /> */}
                                      Left At: {leftStr ? leftStr : "—"}
                                    </p>
                                  {record.note && (
                                    <p className="text-slate-500 italic border-t border-slate-700 pt-1 max-w-[180px] whitespace-normal leading-relaxed">
                                      {record.note}
                                    </p>
                                  )}
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-700" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-700 text-xs select-none">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Sticky summary cell */}
                    <td
                      className="sticky right-0 z-10 bg-slate-900 group-hover:bg-slate-800 px-4 py-3 text-center border-l border-slate-800/50 transition-colors"
                      style={{ minWidth: SUMMARY_W, ...rightShadow }}
                    >
                      <div className="text-xs font-bold text-white tabular-nums leading-none">
                        {attended}<span className="text-slate-500 font-normal">/{total}</span>
                      </div>
                      <div className={`text-[10px] font-semibold tabular-nums mt-1 ${pctColor}`}>
                        {pct != null ? `${pct}%` : "—"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {onEditRecord && (
          <p className="text-[10px] text-slate-600 italic px-5 py-2.5 border-t border-slate-800/50">
            Click a marked cell to edit attendance
          </p>
        )}
      </div>
    </div>
  );
};

export default AttendanceMatrix;
