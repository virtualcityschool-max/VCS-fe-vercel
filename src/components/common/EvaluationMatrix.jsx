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

const GRADE_W      = 90;
const OBTAINED_W   = 85;
const PERCENTAGE_W = 75;

const EvaluationMatrix = ({ students = [], courseStatus }) => {
  const isCompleted = courseStatus === "completed";
  const [gradingScale, setGradingScale] = useState([]);

  useEffect(() => {
    coursesService.getGradingScale()
      .then((data) => setGradingScale(data?.scales || []))
      .catch(() => {});
  }, []);

  const allAssignments = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      const all = [...(s.assignments?.public || []), ...(s.assignments?.private || [])];
      all.forEach((a) => {
        if (!map.has(a.assignment_id)) {
          map.set(a.assignment_id, { id: a.assignment_id, title: a.title, max_score: a.max_score });
        }
      });
    });
    return Array.from(map.values());
  }, [students]);

  const allQuizzes = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      (s.quizzes?.items || []).forEach((q) => {
        if (!map.has(q.quiz_id)) {
          map.set(q.quiz_id, { id: q.quiz_id, title: q.title, max_score: q.total_marks });
        }
      });
    });
    return Array.from(map.values());
  }, [students]);

  const totalCourseMarks = useMemo(() => {
    const aSum = allAssignments.reduce((sum, a) => sum + (Number(a.max_score) || 0), 0);
    const qSum = allQuizzes.reduce((sum, q) => sum + (Number(q.max_score) || 0), 0);
    return aSum + qSum;
  }, [allAssignments, allQuizzes]);

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

      {/* ── Mobile card view (< md) ────────────────────────────────────────── */}
      <div className="md:hidden space-y-2">
        {students.map((s, idx) => {
          const allStudentAssignments = [
            ...(s.assignments?.public  || []),
            ...(s.assignments?.private || []),
          ];
          const assignmentMap = Object.fromEntries(allStudentAssignments.map((a) => [a.assignment_id, a]));
          const quizMap       = Object.fromEntries((s.quizzes?.items || []).map((q) => [q.quiz_id, q]));
          const pct           = s.combined_totals?.computed_percentage ?? s.final_totals?.percentage ?? null;
          const obtained      = s.combined_totals?.computed_obtained ?? s.assignment_totals?.computed_obtained ?? null;

          return (
            <div key={s.enrollment_id ?? s.student?.id ?? idx} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">

              {/* Student header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border-b border-slate-700/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-400 text-sm font-bold">
                      {s.student?.username?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{s.student?.username}</p>
                    <p className="text-slate-500 text-[11px] truncate">{s.student?.email}</p>
                  </div>
                </div>
                <div className="shrink-0 ml-3">
                  {isCompleted ? <GradeBadge grade={s.final_totals?.grade} /> : <PendingBadge />}
                </div>
              </div>

              {/* Summary stats */}
              <div className="flex divide-x divide-slate-700/50 border-b border-slate-700/50">
                <div className="flex-1 px-3 py-2.5 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Obtained</p>
                  <p className="text-white font-bold text-sm tabular-nums">
                    {obtained ?? "—"} <span className="text-slate-600 font-normal text-xs">/ {totalCourseMarks}</span>
                  </p>
                </div>
                <div className="flex-1 px-3 py-2.5 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Percentage</p>
                  <p className={`font-bold text-sm tabular-nums ${pct != null ? (pct >= 75 ? "text-emerald-400" : "text-rose-400") : "text-slate-600"}`}>
                    {pct != null ? `${pct}%` : "—"}
                  </p>
                </div>
              </div>

              {/* Assignments */}
              {allAssignments.length > 0 && (
                <div className={`px-4 py-3 ${allQuizzes.length > 0 ? "border-b border-slate-700/50" : ""}`}>
                  <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-2.5 flex items-center gap-1.5">
                    <i className="fas fa-file-alt text-[10px]" /> Assignments
                  </p>
                  <div className="space-y-2">
                    {allAssignments.map((a) => {
                      const sa = assignmentMap[a.id];
                      return (
                        <div key={a.id} className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs truncate flex-1">{a.title}</span>
                          <span className="text-slate-600 text-[10px] shrink-0">/ {a.max_score}</span>
                          <span className={`text-xs font-bold tabular-nums w-8 text-right shrink-0 ${sa?.is_graded ? "text-white" : "text-slate-600"}`}>
                            {sa?.is_graded ? sa.score : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quizzes */}
              {allQuizzes.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-2.5 flex items-center gap-1.5">
                    <i className="fas fa-question-circle text-[10px]" /> Quizzes
                  </p>
                  <div className="space-y-2">
                    {allQuizzes.map((q) => {
                      const sq = quizMap[q.id];
                      return (
                        <div key={q.id} className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs truncate flex-1">{q.title}</span>
                          <span className="text-slate-600 text-[10px] shrink-0">/ {q.max_score}</span>
                          <span className={`text-xs font-bold tabular-nums w-8 text-right shrink-0 ${sq?.is_graded ? "text-white" : "text-slate-600"}`}>
                            {sq?.is_graded ? (sq.obtained_marks ?? sq.score) : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop table (md+) ───────────────────────────────────────────── */}
      <div className="hidden md:block bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            {/* ── Grouped top header ── */}
            <thead>
              <tr className="border-b border-slate-800">
                <th
                  className="sticky left-0 z-30 bg-slate-900 px-5 py-2 text-left text-[9px] uppercase tracking-[0.2em] text-slate-600 font-black border-r border-slate-800"
                  style={leftShadow}
                >
                  Category
                </th>

                {allAssignments.length > 0 && (
                  <th
                    colSpan={allAssignments.length}
                    className="px-4 py-2 text-center text-[9px] uppercase tracking-[0.2em] text-indigo-400 font-black bg-indigo-500/5 border-r border-slate-800"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <i className="fas fa-file-alt text-[10px]"></i>
                      Assignments
                    </div>
                  </th>
                )}

                {allQuizzes.length > 0 && (
                  <th
                    colSpan={allQuizzes.length}
                    className="px-4 py-2 text-center text-[9px] uppercase tracking-[0.2em] text-purple-400 font-black bg-purple-500/5 border-r border-slate-800"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <i className="fas fa-question-circle text-[10px]"></i>
                      Quizzes
                    </div>
                  </th>
                )}

                <th
                  colSpan={3}
                  className="sticky right-0 z-30 bg-slate-900 px-4 py-2 text-center text-[9px] uppercase tracking-[0.2em] text-emerald-400 font-black border-l border-slate-800"
                  style={rightShadow}
                >
                  <div className="flex items-center justify-center gap-2">
                    <i className="fas fa-chart-line text-[10px]"></i>
                    Final Results
                  </div>
                </th>
              </tr>

              {/* ── Column headers ── */}
              <tr className="border-b border-slate-800">
                <th
                  className="sticky left-0 z-20 bg-slate-900 px-5 py-4 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[190px] border-r border-slate-800"
                  style={leftShadow}
                >
                  Student
                </th>

                {allAssignments.map((a) => (
                  <th
                    key={`a-${a.id}`}
                    className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[130px] border-r border-slate-800/30"
                  >
                    <div className="truncate max-w-[120px] mx-auto text-slate-300 normal-case tracking-normal text-[14px]" title={a.title}>
                      {a.title}
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5 tracking-normal normal-case font-normal">
                      Total: {a.max_score}
                    </div>
                  </th>
                ))}

                {allQuizzes.map((q) => (
                  <th
                    key={`q-${q.id}`}
                    className="px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold min-w-[130px] border-r border-slate-800/30"
                  >
                    <div className="truncate max-w-[120px] mx-auto text-slate-300 normal-case tracking-normal" title={q.title}>
                      {q.title}
                    </div>
                    <div className="text-slate-600 text-[9px] mt-0.5 tracking-normal normal-case font-normal">
                      Total: {q.max_score}
                    </div>
                  </th>
                ))}

                <th
                  className="sticky z-20 bg-slate-900 px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-l border-slate-800"
                  style={{ right: GRADE_W + OBTAINED_W, minWidth: PERCENTAGE_W, ...rightShadow }}
                >
                  Percentage
                </th>

                <th
                  className="sticky z-20 bg-slate-900 px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-l border-slate-800"
                  style={{ right: GRADE_W, minWidth: OBTAINED_W }}
                >
                  Obtained <span className="text-slate-600 normal-case ml-0.5">/ {totalCourseMarks}</span>
                </th>

                <th
                  className="sticky right-0 z-20 bg-slate-900 px-4 py-4 text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold"
                  style={{ minWidth: GRADE_W }}
                >
                  Grade
                </th>
              </tr>
            </thead>

            <tbody>
              {students.map((s, idx) => {
                const allStudentAssignments = [
                  ...(s.assignments?.public  || []),
                  ...(s.assignments?.private || []),
                ];
                const assignmentMap = Object.fromEntries(
                  allStudentAssignments.map((a) => [a.assignment_id, a])
                );
                const quizMap = Object.fromEntries(
                  (s.quizzes?.items || []).map((q) => [q.quiz_id, q])
                );

                const pct = s.combined_totals?.computed_percentage
                  ?? s.final_totals?.percentage
                  ?? null;

                return (
                  <tr
                    key={s.enrollment_id ?? s.student?.id ?? idx}
                    className="border-b border-slate-800/40 last:border-0 group"
                  >
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
                          <p className="text-white text-xs font-semibold truncate">{s.student?.username}</p>
                          <p className="text-slate-500 text-[10px] truncate">{s.student?.email}</p>
                        </div>
                      </div>
                    </td>

                    {allAssignments.map((a) => {
                      const sa = assignmentMap[a.id];
                      return (
                        <td key={`a-${a.id}`} className="px-4 py-3.5 text-center group-hover:bg-slate-800/30 transition-colors">
                          {sa?.is_graded
                            ? <span className="text-white font-bold tabular-nums">{sa.score}</span>
                            : <span className="text-slate-600 text-xs">—</span>
                          }
                        </td>
                      );
                    })}

                    {allQuizzes.map((q) => {
                      const sq = quizMap[q.id];
                      return (
                        <td key={`q-${q.id}`} className="px-4 py-3.5 text-center group-hover:bg-slate-800/30 transition-colors">
                          {sq?.is_graded
                            ? <span className="text-white font-bold tabular-nums">{sq.obtained_marks ?? sq.score}</span>
                            : <span className="text-slate-600 text-xs">—</span>
                          }
                        </td>
                      );
                    })}

                    <td
                      className="sticky z-10 bg-slate-900 group-hover:bg-slate-800 px-4 py-3.5 text-center border-l border-slate-800/50 transition-colors"
                      style={{ right: GRADE_W + OBTAINED_W, minWidth: PERCENTAGE_W, ...rightShadow }}
                    >
                      {pct != null ? (
                        <span className={`font-bold tabular-nums text-sm ${pct >= 75 ? "text-emerald-400" : "text-rose-400"}`}>
                          {pct}%
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>

                    <td
                      className="sticky z-10 bg-slate-900 group-hover:bg-slate-800 px-4 py-3.5 text-center border-l border-slate-800/50 transition-colors"
                      style={{ right: GRADE_W, minWidth: OBTAINED_W }}
                    >
                      <span className="text-white font-bold tabular-nums">
                        {s.combined_totals?.computed_obtained ?? s.assignment_totals?.computed_obtained ?? "—"}
                      </span>
                    </td>

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
