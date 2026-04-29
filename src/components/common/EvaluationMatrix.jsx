import React, { useMemo, useState, useEffect } from "react";
import { coursesService } from "../../services/coursesService";

// ── Badges ────────────────────────────────────────────────────────────────────
const PendingBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-slate-700/50 text-slate-400 border-slate-600/30 whitespace-nowrap">
    <i className="fas fa-clock text-[10px]" />
    Pending
  </span>
);

const GRADE_STYLE = {
  "A+": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "A":  "bg-pink-500/15   text-pink-400   border-pink-500/20",
  "B":  "bg-blue-500/15   text-blue-400   border-blue-500/20",
  "C":  "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  "D":  "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "F":  "bg-red-500/15    text-red-400    border-red-500/20",
};

const GradeBadge = ({ grade }) => {
  const style = GRADE_STYLE[grade] ?? "bg-slate-700/50 text-slate-400 border-slate-600/30";
  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-black border whitespace-nowrap min-w-[40px] ${style}`}>
      {grade ?? "—"}
    </span>
  );
};

// ── Sticky column shadow helpers ──────────────────────────────────────────────
const leftShadow  = { boxShadow: "4px 0 8px rgba(0,0,0,0.4)" };
const rightShadow = { boxShadow: "-4px 0 8px rgba(0,0,0,0.4)" };

// Grade column width — must stay in sync between th and td
const GRADE_W    = 120; // px
const OBTAINED_W = 110; // px

/**
 * EvaluationMatrix
 *
 * Props:
 *   students     — array of student evaluation objects from the API
 *   courseStatus — "published" | "completed" | undefined
 *                  Grade column shows Pending unless courseStatus === "completed"
 */
const EvaluationMatrix = ({ students = [], courseStatus }) => {
  const isCompleted = courseStatus === "completed";

  const [gradingScale, setGradingScale] = useState([]);

  useEffect(() => {
    coursesService.getGradingScale()
      .then((data) => setGradingScale(data?.scales || []))
      .catch(() => {});
  }, []);

  // Collect every unique assignment across all students (preserves insertion order)
  const allAssignments = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      const all = [...(s.assignments?.public || []), ...(s.assignments?.private || [])];
      all.forEach((a) => {
        if (!map.has(a.assignment_id)) {
          map.set(a.assignment_id, {
            id: a.assignment_id,
            title: a.title,
            max_score: a.max_score,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [students]);

  if (students.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="fas fa-user-slash text-slate-500 text-xl" />
        </div>
        <p className="text-slate-400 text-sm">No students found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* ── Grading scale strip ── */}
      {gradingScale.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold shrink-0">Grading Scale</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {gradingScale.map((s) => (
              <div
                key={s.grade}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold whitespace-nowrap ${GRADE_STYLE[s.grade] ?? "bg-slate-700/50 text-slate-400 border-slate-600/30"}`}
              >
                <span>{s.grade}</span>
                <span className="font-normal opacity-70">{s.range}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
      {/* ── Scrollable container ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          {/* ── Header ── */}
          <thead>
            <tr className="border-b border-slate-800">
              {/* Fixed left — Student */}
              <th
                className="sticky left-0 z-20 bg-slate-900 px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[190px] border-r border-slate-800"
                style={leftShadow}
              >
                Student
              </th>

              {/* Scrollable — one column per assignment */}
              {allAssignments.map((a) => (
                <th
                  key={a.id}
                  className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[130px]"
                >
                  <div className="truncate max-w-[120px] mx-auto text-slate-300 normal-case tracking-normal" title={a.title}>
                    {a.title}
                  </div>
                  <div className="text-slate-600 text-[9px] mt-0.5 tracking-normal normal-case font-normal">
                    Max: {a.max_score}
                  </div>
                </th>
              ))}

              {/* Fixed right — Obtained */}
              <th
                className="sticky z-20 bg-slate-900 px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-l border-slate-800"
                style={{ right: GRADE_W, minWidth: OBTAINED_W, ...rightShadow }}
              >
                Obtained
              </th>

              {/* Fixed right — Grade */}
              <th
                className="sticky right-0 z-20 bg-slate-900 px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold"
                style={{ minWidth: GRADE_W }}
              >
                Grade
              </th>
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {students.map((s, idx) => {
              const allStudentAssignments = [
                ...(s.assignments?.public  || []),
                ...(s.assignments?.private || []),
              ];
              const assignmentMap = Object.fromEntries(
                allStudentAssignments.map((a) => [a.assignment_id, a])
              );

              return (
                <tr
                  key={s.enrollment_id ?? s.student?.id ?? idx}
                  className="border-b border-slate-800/40 last:border-0 group"
                >
                  {/* Fixed left — Student */}
                  <td
                    className="sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800 px-5 py-3.5 border-r border-slate-800/50 transition-colors"
                    style={leftShadow}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 text-xs font-bold">
                          {s.student?.username?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate">
                          {s.student?.username}
                        </p>
                        <p className="text-slate-500 text-[10px] truncate">
                          {s.student?.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Scrollable — assignment score cells */}
                  {allAssignments.map((a) => {
                    const sa = assignmentMap[a.id];
                    return (
                      <td
                        key={a.id}
                        className="px-4 py-3.5 text-center group-hover:bg-slate-800/30 transition-colors"
                      >
                        {sa?.is_graded ? (
                          <span className="text-white font-bold tabular-nums">{sa.score}</span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Fixed right — Obtained */}
                  <td
                    className="sticky z-10 bg-slate-900 group-hover:bg-slate-800 px-4 py-3.5 text-center border-l border-slate-800/50 transition-colors"
                    style={{ right: GRADE_W, minWidth: OBTAINED_W, ...rightShadow }}
                  >
                    <span className="text-white font-bold tabular-nums">
                      {s.assignment_totals?.computed_obtained ?? "—"}
                    </span>
                    <span className="text-slate-500 text-xs tabular-nums">
                      /{s.assignment_totals?.computed_total ?? "—"}
                    </span>
                  </td>

                  {/* Fixed right — Grade */}
                  <td
                    className="sticky right-0 z-10 bg-slate-900 group-hover:bg-slate-800 px-4 py-3.5 text-center transition-colors"
                    style={{ minWidth: GRADE_W }}
                  >
                    {isCompleted
                      ? <GradeBadge grade={s.final_totals?.grade} />
                      : <PendingBadge />
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default EvaluationMatrix;
