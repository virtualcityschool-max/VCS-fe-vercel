import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { formatTime } from "../../utils/validation";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getId = (v) => (v && typeof v === "object") ? v.id : v;

const CELL = {
  present: { letter: "P", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  absent:  { letter: "A", cls: "bg-rose-500/20    text-rose-400    border-rose-500/30"    },
  late:    { letter: "L", cls: "bg-yellow-500/20  text-yellow-400  border-yellow-500/30"  },
};

const leftShadow  = { boxShadow: "4px 0 8px rgba(0,0,0,0.4)" };
const rightShadow = { boxShadow: "-4px 0 8px rgba(0,0,0,0.4)" };
const STUDENT_W = 200;
const SUMMARY_W = 200;

// ── AttendanceMatrix ──────────────────────────────────────────────────────────
const AttendanceMatrix = ({
  sessions          = [],
  attendanceRecords = [],
  participantRole   = "student",
  onEditRecord,
}) => {
  const timezone = useSelector((s) => s.auth.profile?.timezone) || undefined;
  const sortedSessions = useMemo(() =>
    [...sessions].sort((a, b) => {
      const da = a.scheduled_at ? new Date(a.scheduled_at) : 0;
      const db = b.scheduled_at ? new Date(b.scheduled_at) : 0;
      return da - db;
    })
  , [sessions]);

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

  const lookupMap = useMemo(() => {
    const map = {};
    attendanceRecords.forEach((r) => {
      const pId = getId(r.student);
      const sId = getId(r.session);
      if (pId != null && sId != null) map[`${pId}_${sId}`] = r;
    });
    return map;
  }, [attendanceRecords]);

  const participants = useMemo(() => {
    const map = new Map();
    attendanceRecords.forEach((r) => {
      const id      = getId(r.student);
      const name    = participantRole === "student" ? r.student_name : r.teacher_name;
      const rollNo  = participantRole === "student" ? r.student_roll_no : undefined;
      if (id != null && !map.has(id)) map.set(id, { id, name: name || `#${id}`, rollNo });
    });
    return Array.from(map.values());
  }, [attendanceRecords, participantRole]);

  if (!sortedSessions.length) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="fas fa-calendar-times text-slate-500 text-xl" />
        </div>
        <p className="text-slate-400 text-sm">No Attendance found for this course</p>
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

  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isPast = (s) => {
    if (!s.scheduled_at) return false;
    const t = new Date(s.scheduled_at);
    const sDate = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    if (sDate < todayDate) return true;
    if (sDate.getTime() === todayDate.getTime()) return now >= t.getTime() + 60 * 60 * 1000;
    return false;
  };

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
          <span className="font-normal opacity-70">Upcoming</span>
        </span>
      </div>

      {/* ── Mobile card view (< md) ────────────────────────────────────────── */}
      <div className="md:hidden space-y-2">
        {participants.map((p) => {
          let attended = 0;
          sortedSessions.forEach((s) => {
            const r = lookupMap[`${p.id}_${s.id}`];
            if (r && (r.status === "present" || r.status === "late")) attended++;
          });
          const total = sortedSessions.filter((s) => isPast(s) || !!lookupMap[`${p.id}_${s.id}`]).length;
          const pct      = total ? Math.round((attended / total) * 100) : null;
          const pctColor = pct == null ? "text-slate-600"
            : pct >= 75 ? "text-emerald-400"
            : pct >= 50 ? "text-yellow-400"
            : "text-rose-400";

          return (
            <div key={p.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">

              {/* Participant header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border-b border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isStudent ? "bg-indigo-600/20" : "bg-violet-600/20"}`}>
                    <span className={`text-sm font-bold ${isStudent ? "text-indigo-400" : "text-violet-400"}`}>
                      {(p.name || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{p.name}</p>
                    {p.rollNo && <p className="text-slate-500 text-[10px] font-mono">Roll: {p.rollNo}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold tabular-nums ${pctColor}`}>
                    {pct != null ? `${pct}%` : "—"}
                  </p>
                  <p className="text-[11px] text-slate-500">{attended}/{total} sessions</p>
                </div>
              </div>

              {/* Session chips grouped by month */}
              <div className="px-4 py-3 space-y-3">
                {monthGroups.map((group, gIdx) => {
                  const startIdx    = monthGroups.slice(0, gIdx).reduce((sum, g) => sum + g.count, 0);
                  const groupSessions = sortedSessions.slice(startIdx, startIdx + group.count);

                  return (
                    <div key={group.key}>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {groupSessions.map((s) => {
                          const record   = lookupMap[`${p.id}_${s.id}`];
                          const cfg      = record ? CELL[record.status] : (isPast(s) ? CELL.absent : null);
                          const d        = s.scheduled_at ? new Date(s.scheduled_at) : null;
                          const editable = !!onEditRecord && !!record;

                          return (
                            <div
                              key={s.id}
                              title={s.title + (d ? ` — ${d.toLocaleDateString()}` : "")}
                              onClick={() => editable && onEditRecord(record)}
                              className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl border select-none
                                ${cfg ? cfg.cls : "bg-slate-800/60 text-slate-600 border-slate-700/50"}
                                ${editable ? "cursor-pointer active:scale-95 transition-transform" : ""}
                              `}
                            >
                              {d ? (
                                <>
                                  <span className="text-[12px] font-black leading-none">{d.getDate()}</span>
                                  <span className="text-[7px] font-bold uppercase opacity-70 mt-0.5">
                                    {d.toLocaleDateString([], { weekday: "short" })}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[10px]">—</span>
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
          );
        })}

        {onEditRecord && (
          <p className="text-[10px] text-slate-600 italic px-1">
            Tap a session chip to edit attendance
          </p>
        )}
      </div>

      {/* ── Desktop table (md+) ───────────────────────────────────────────── */}
      <div className="hidden md:block bg-slate-900/50 border border-slate-800 rounded-3xl">
        <div className="rounded-3xl overflow-x-auto">
          <table className="text-sm border-collapse" style={{ minWidth: "100%" }}>
            <thead>
              {/* Row 1: top-level SESSIONS header */}
              <tr className="border-b border-slate-800/40 bg-slate-900">
                <th
                  rowSpan={3}
                  className="sticky left-0 z-20 bg-slate-900 px-3 py-3 text-center text-[10px] uppercase tracking-widest text-slate-500 font-black border-r border-slate-800"
                  style={{ width: STUDENT_W, minWidth: STUDENT_W, maxWidth: STUDENT_W, ...leftShadow }}
                >
                  {isStudent ? "Student" : "Teacher"}
                </th>

                <th
                  colSpan={sortedSessions.length}
                  className="px-2 py-2 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 border-r border-slate-800/50"
                >
                  Sessions
                </th>

                <th
                  rowSpan={3}
                  className="sticky right-0 z-20 bg-slate-900 px-2 py-3 text-center text-[10px] uppercase tracking-widest text-slate-500 font-black border-l border-slate-800"
                  style={{ width: SUMMARY_W, minWidth: SUMMARY_W, maxWidth: SUMMARY_W, ...rightShadow }}
                >
                  Summary
                </th>
              </tr>

              {/* Row 2: month group headers */}
              <tr className="border-b border-slate-800/60 bg-slate-900">
                {monthGroups.map((g) => (
                  <th
                    key={g.key}
                    colSpan={g.count}
                    className="px-2 py-2 text-center text-[11px] font-black text-slate-400 border-r border-slate-800/50 last:border-r-0 whitespace-nowrap uppercase tracking-widest bg-slate-800/30"
                  >
                    {g.label}
                  </th>
                ))}
              </tr>

              {/* Row 3: per-session day / weekday */}
              <tr className="border-b border-slate-800 bg-slate-900">
                {sortedSessions.map((s) => {
                  const d = s.scheduled_at ? new Date(s.scheduled_at) : null;
                  return (
                    <th
                      key={s.id}
                      className="px-1 py-3 text-center min-w-[52px] border-r border-slate-800/30 last:border-r-0"
                      title={s.title + (d ? ` — ${d.toLocaleDateString()}` : "")}
                    >
                      {d ? (
                        <>
                          <div className="text-[13px] font-black text-white leading-none">{d.getDate()}</div>
                          <div className="text-[8px] text-slate-600 font-black uppercase mt-1 tracking-tighter">
                            {d.toLocaleDateString([], { weekday: "short" })}
                          </div>
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
                let attended = 0;
                sortedSessions.forEach((s) => {
                  const r = lookupMap[`${p.id}_${s.id}`];
                  if (r) {
                    if (r.status === "present") attended++;
                    else if (r.status === "late") attended++;
                  }
                });
                const total = sortedSessions.filter((s) => isPast(s) || !!lookupMap[`${p.id}_${s.id}`]).length;
                const pct      = total ? Math.round((attended / total) * 100) : null;
                const pctColor = pct == null ? "text-slate-600"
                  : pct >= 75 ? "text-emerald-400"
                  : pct >= 50 ? "text-yellow-400"
                  : "text-rose-400";

                return (
                  <tr key={p.id} className="border-b border-slate-800/40 last:border-0 group">
                    <td
                      className="sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800 px-3 py-3 border-r border-slate-800/50 transition-colors"
                      style={{ width: STUDENT_W, minWidth: STUDENT_W, maxWidth: STUDENT_W, ...leftShadow }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isStudent ? "bg-indigo-600/20" : "bg-violet-600/20"}`}>
                          <span className={`text-[10px] font-bold ${isStudent ? "text-indigo-400" : "text-violet-400"}`}>
                            {(p.name || "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-[11px] font-semibold truncate">{p.name}</p>
                          {p.rollNo && <p className="text-slate-500 text-[9px] font-mono">Roll: {p.rollNo}</p>}
                        </div>
                      </div>
                    </td>

                    {sortedSessions.map((s) => {
                      const record   = lookupMap[`${p.id}_${s.id}`];
                      const cfg      = record ? CELL[record.status] : (isPast(s) ? CELL.absent : null);
                      const editable = !!onEditRecord && !!record;

                      const joinedStr = record?.joined_at ? formatTime(record.joined_at, timezone) : null;
                      const leftStr   = record?.left_at   ? formatTime(record.left_at,   timezone) : null;

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
                                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-3 py-2 text-center text-[11px] space-y-1 min-w-[200px]">
                                  <p className="font-bold capitalize text-white">{record?.status ?? "absent"}</p>
                                  <p className="text-slate-400 flex items-center gap-1.5">
                                    Joined At: {joinedStr ?? "—"}
                                  </p>
                                  <p className="text-slate-400 flex items-center gap-1.5">
                                    Left At: {leftStr ?? "—"}
                                  </p>
                                  {record?.note && (
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

                    <td
                      className="sticky right-0 z-10 bg-slate-900 group-hover:bg-slate-800 px-2 py-3 text-center border-l border-slate-800/50 transition-colors"
                      style={{ width: SUMMARY_W, minWidth: SUMMARY_W, maxWidth: SUMMARY_W, ...rightShadow }}
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
