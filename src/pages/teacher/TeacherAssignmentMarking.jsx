// /teacher/assignments/:assignmentId/mark — mark one assignment's hand-ins (founder, 2026-11-01): every student who
// handed it in, their answer and file, marks from a dropdown (0 to the assignment's marks), remarks, "Return to
// student". The student sees the marks and remarks on their assignment page. Server: assignments/views.py
// grade_submission (POST first time, PATCH to change; it refuses more than the assignment's marks).
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { teacherService } from "../../services/teacherService";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { getStorageUrl } from "../../utils/storageUrl";
import { safeHtml } from "../../utils/safeHtml";
import { useDateFormatters } from "../../hooks";

const asList = (d) => (Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : []);
const isImage = (url) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url || "");
const fileName = (url) => decodeURIComponent((url || "").split("?")[0].split("/").pop() || "file");

const TeacherAssignmentMarking = () => {
  const { assignmentId } = useParams();
  const [params, setParams] = useSearchParams();
  const { formatDateTime } = useDateFormatters();

  const [assignment, setAssignment] = useState(null);
  const [subs, setSubs] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [score, setScore] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [showTask, setShowTask] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const [a, s] = await Promise.all([teacherService.getAssignmentById(assignmentId), teacherService.getSubmissions(assignmentId)]);
      setAssignment(a);
      setSubs(asList(s).sort((x, y) => Number(x.is_graded) - Number(y.is_graded) || new Date(x.submitted_at) - new Date(y.submitted_at)));
    } catch (e) {
      setLoadError(e?.response?.data?.detail || e?.message || "Could not load this assignment.");
    }
  }, [assignmentId]);

  useEffect(() => {
    load();
  }, [load]);

  // The open hand-in: ?s=<id>, else the first one still to mark, else the first.
  const selectedId = useMemo(() => {
    if (!subs?.length) return null;
    const asked = params.get("s");
    if (asked && subs.some((s) => String(s.id) === asked)) return asked;
    return String((subs.find((s) => !s.is_graded) ?? subs[0]).id);
  }, [subs, params]);

  useEffect(() => {
    if (!selectedId) return undefined;
    let live = true;
    setDetail(null);
    setDetailError(null);
    teacherService
      .getSubmissionById(selectedId)
      .then((d) => {
        if (!live) return;
        setDetail(d);
        setScore(d?.grade?.score != null ? String(d.grade.score) : "");
        setRemarks(d?.grade?.feedback || "");
      })
      .catch((e) => live && setDetailError(e?.response?.data?.detail || e?.message || "Could not load this hand-in."));
    return () => {
      live = false;
    };
  }, [selectedId]);

  const max = Number(assignment?.max_score ?? detail?.assignment_max_score ?? 0);
  const toMark = (subs ?? []).filter((s) => !s.is_graded).length;
  const returned = (subs ?? []).length - toMark;
  const open = (id) => setParams(id ? { s: String(id) } : {});

  const save = async (e) => {
    e.preventDefault();
    if (!detail || score === "") return;
    setSaving(true);
    const data = { score: Number(score), feedback: remarks.trim() };
    try {
      if (detail.grade) await teacherService.updateSubmissionGrade(detail.id, data);
      else await teacherService.gradeSubmission(detail.id, data);
      toastManager.success(detail.grade ? "Marks updated. The student sees the change." : `Returned to ${detail.student_name || "the student"}.`);
      const next = (subs ?? []).map((s) => (String(s.id) === String(detail.id) ? { ...s, is_graded: true, score: data.score, status: "graded" } : s));
      setSubs(next);
      setDetail((d) => ({ ...d, is_graded: true, grade: { ...(d.grade || {}), score: data.score, feedback: data.feedback } }));
      // On to the next hand-in still to mark, if any.
      const nextOpen = next.find((s) => !s.is_graded);
      if (nextOpen) open(nextOpen.id);
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <div className="max-w-[1440px] mx-auto p-6">
        <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-base text-rose-200">
          <i className="fas fa-triangle-exclamation mr-2" aria-hidden="true" />{loadError}{" "}
          <button type="button" onClick={load} className="font-semibold underline">Try again</button>
        </p>
        <BackLink />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <BackLink />

      {/* The assignment */}
      <section className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-600/15 via-slate-900/60 to-slate-900/40 p-5 sm:p-6">
        {!assignment ? (
          <div className="h-16 animate-pulse rounded-xl bg-slate-800/60" aria-busy="true" />
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">{assignment.course_title}</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{assignment.title}</h1>
                <p className="mt-1 text-sm text-slate-300">
                  Out of <strong className="font-semibold text-white">{max} marks</strong>
                  {assignment.due_date && <> · deadline {formatDateTime(assignment.due_date)}</>}
                </p>
              </div>
              <div className="flex gap-2">
                <Stat n={subs?.length} label="Handed in" tone="text-indigo-300 bg-indigo-500/15" />
                <Stat n={subs ? toMark : null} label="To mark" tone="text-amber-300 bg-amber-500/15" />
                <Stat n={subs ? returned : null} label="Returned" tone="text-emerald-300 bg-emerald-500/15" />
              </div>
            </div>
            {assignment.description && (
              <div className="mt-4">
                <button type="button" onClick={() => setShowTask((v) => !v)} aria-expanded={showTask} className="text-sm font-semibold text-indigo-300 hover:text-white">
                  <i className={`fas fa-chevron-${showTask ? "up" : "down"} mr-2 text-xs`} aria-hidden="true" />
                  {showTask ? "Hide the task" : "Show the task"}
                </button>
                {showTask && <p className="mt-2 max-w-3xl whitespace-pre-wrap text-base text-slate-200">{assignment.description}</p>}
              </div>
            )}
          </>
        )}
      </section>

      {subs && subs.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-14 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/15 text-xl text-indigo-300"><i className="fas fa-inbox" aria-hidden="true" /></span>
          <p className="mt-4 text-lg font-semibold text-white">No one has handed this in yet</p>
          <p className="mt-1 text-base text-slate-300">Hand-ins appear here as students submit them.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Students */}
          <nav aria-label="Students who handed in" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-2 lg:sticky lg:top-24 lg:self-start">
            <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Students</p>
            {!subs ? (
              <div className="space-y-2 p-2" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-800/60" />)}</div>
            ) : (
              <ul className="space-y-1">
                {subs.map((s) => {
                  const active = String(s.id) === selectedId;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => open(s.id)}
                        aria-current={active ? "true" : undefined}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${active ? "bg-indigo-600 text-white" : "text-slate-200 hover:bg-slate-800/70"}`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{s.student_name || "Student"}</span>
                          <span className={`block text-xs ${active ? "text-white/85" : "text-slate-400"}`}>{s.submitted_at ? formatDateTime(s.submitted_at) : ""}{s.status === "late" ? " · late" : ""}</span>
                        </span>
                        {s.is_graded ? (
                          <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${active ? "bg-white/20 text-white" : "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"}`}>{s.score}/{max}</span>
                        ) : (
                          <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${active ? "bg-white/20 text-white" : "border border-amber-500/30 bg-amber-500/15 text-amber-300"}`}>To mark</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          {/* The open hand-in */}
          <section aria-live="polite" className="min-w-0 space-y-5">
            {detailError ? (
              <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-base text-rose-200">{detailError}</p>
            ) : !detail ? (
              <div className="h-64 animate-pulse rounded-2xl bg-slate-900/60" aria-busy="true" />
            ) : (
              <>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{detail.student_name || "Student"}</h2>
                      <p className="text-sm text-slate-400">
                        Handed in {detail.submitted_at ? formatDateTime(detail.submitted_at) : "—"}
                        {detail.status === "late" && <span className="ml-2 rounded-md border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-300">Late</span>}
                      </p>
                    </div>
                    {detail.is_graded && (
                      <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-sm font-bold text-emerald-300">
                        <i className="fas fa-circle-check mr-1.5" aria-hidden="true" />Returned · {detail.grade?.score}/{max}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-400">Their answer</h3>
                  {detail.text_answer ? (
                    <div
                      className="submission-content mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/50 p-5 text-base leading-relaxed text-slate-100"
                      dangerouslySetInnerHTML={{ __html: safeHtml(detail.text_answer) }}
                    />
                  ) : (
                    <p className="mt-2 text-base text-slate-400">No typed answer{detail.file_url ? ": see the attached file." : "."}</p>
                  )}

                  {detail.file_url && (
                    <div className="mt-4">
                      {isImage(detail.file_url) && (
                        <a href={getStorageUrl(detail.file_url)} target="_blank" rel="noopener noreferrer">
                          <img src={getStorageUrl(detail.file_url)} alt={`${detail.student_name || "Student"}'s handed-in work`} className="max-h-[70vh] w-auto rounded-xl border border-slate-800" />
                        </a>
                      )}
                      <a
                        href={getStorageUrl(detail.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-600/20 px-4 text-sm font-semibold text-indigo-300 hover:bg-indigo-600/40"
                      >
                        <i className="fas fa-paperclip" aria-hidden="true" /> Open {fileName(detail.file_url)}
                      </a>
                    </div>
                  )}
                </div>

                {/* Marks and remarks */}
                <form onSubmit={save} className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 sm:p-6">
                  <h3 className="text-lg font-semibold text-white">Marks and remarks</h3>
                  <div className="mt-4 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div>
                      <label htmlFor="marks" className="block text-sm font-semibold text-slate-200">Marks (out of {max})</label>
                      <select
                        id="marks"
                        required
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="mt-2 w-full min-h-12 rounded-xl border border-slate-700 bg-slate-950 px-3 text-lg font-bold text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="" disabled>Choose…</option>
                        {Array.from({ length: max + 1 }, (_, i) => max - i).map((n) => (
                          <option key={n} value={n}>{n} / {max}</option>
                        ))}
                      </select>
                      {score !== "" && max > 0 && (
                        <p className="mt-2 text-sm text-slate-300"><strong className="font-semibold text-emerald-300">{Math.round((Number(score) / max) * 100)}%</strong></p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="remarks" className="block text-sm font-semibold text-slate-200">Remarks for the student</label>
                      <textarea
                        id="remarks"
                        rows={6}
                        maxLength={4000}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="What they did well, what lost marks, and what to do next time."
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving || score === ""}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-base font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <i className={`fas ${saving ? "fa-spinner fa-spin" : "fa-paper-plane"}`} aria-hidden="true" />
                      {saving ? "Saving…" : detail.is_graded ? "Update marks" : "Return to student"}
                    </button>
                    <p className="text-sm text-slate-400">The student sees the marks and your remarks on their assignment page.</p>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

const BackLink = () => (
  <Link to="/teacher?tab=assignments_quizzes" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
    <i className="fas fa-arrow-left" aria-hidden="true" /> Assignments &amp; Quizzes
  </Link>
);

const Stat = ({ n, label, tone }) => (
  <div className="flex min-w-[88px] flex-col items-center rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
    <span className={`rounded-full px-2 text-xl font-bold tabular-nums ${tone}`}>{n ?? "–"}</span>
    <span className="mt-0.5 text-xs text-slate-300">{label}</span>
  </div>
);

export default TeacherAssignmentMarking;
