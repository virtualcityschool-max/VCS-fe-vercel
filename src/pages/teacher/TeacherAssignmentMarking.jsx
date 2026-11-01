// /teacher/assignments/:assignmentId/mark — mark one assignment's hand-ins (founder, 2026-11-01): every student who
// handed it in, their answer and file, marks from a dropdown (0 to the assignment's marks), remarks, "Return to
// student". The student sees the marks and remarks on their assignment page. Server: assignments/views.py
// grade_submission (POST first time, PATCH to change; it refuses more than the assignment's marks).
// Checklist (founder, 2026-11-01): ten areas for the subject, each rated Unsatisfactory → Excellent with an optional
// note; a one-or-two-paragraph report is written from the ratings (the teacher can edit it). "Save draft" keeps
// unfinished marking on this computer (the server has no draft state: a saved grade is returned to the student).
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { teacherService } from "../../services/teacherService";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { getStorageUrl } from "../../utils/storageUrl";
import { safeHtml } from "../../utils/safeHtml";
import { useDateFormatters } from "../../hooks";
import MarkingReport from "../../components/common/MarkingReport";
import { LEVELS, LEVEL_ACTIVE, buildFeedback, readFeedback, subjectFor, suggestedMark, writeReport } from "../../utils/markingRubric";

const asList = (d) => (Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : []);
const isImage = (url) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url || "");
const fileName = (url) => decodeURIComponent((url || "").split("?")[0].split("/").pop() || "file");

// Drafts live in this browser only, one per hand-in.
const draftKey = (id) => `vcs-mark-draft:v1:${id}`;
const readDraft = (id) => {
  try {
    return JSON.parse(localStorage.getItem(draftKey(id)) || "null");
  } catch {
    return null;
  }
};
const writeDraft = (id, data) => {
  try {
    localStorage.setItem(draftKey(id), JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};
const dropDraft = (id) => {
  try {
    localStorage.removeItem(draftKey(id));
  } catch {
    /* storage blocked: nothing to remove */
  }
};

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
  const [ratings, setRatings] = useState({});
  const [notes, setNotes] = useState({});
  const [openNotes, setOpenNotes] = useState({});
  const [report, setReport] = useState("");
  const [reportEdited, setReportEdited] = useState(false);
  const [draftAt, setDraftAt] = useState(null);
  const [draftNotice, setDraftNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
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

  // The open hand-in: the one clicked, else ?s=<id>, else the first one still to mark, else the first. The click is
  // kept in state as well as the address: React Router applies address changes as a low-priority update that can
  // sit unapplied, which left the old student on screen.
  const [picked, setPicked] = useState(() => params.get("s"));
  const selectedId = useMemo(() => {
    if (!subs?.length) return null;
    if (picked && subs.some((s) => String(s.id) === picked)) return picked;
    return String((subs.find((s) => !s.is_graded) ?? subs[0]).id);
  }, [subs, picked]);

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
        const draft = readDraft(selectedId);
        const gradedAt = d?.grade?.updated_at || d?.grade?.graded_at;
        const useDraft = draft && (!gradedAt || new Date(draft.savedAt) > new Date(gradedAt));
        if (useDraft) {
          setScore(draft.score ?? "");
          setRatings(draft.ratings || {});
          setNotes(draft.notes || {});
          setOpenNotes(Object.fromEntries(Object.keys(draft.notes || {}).filter((k) => draft.notes[k]).map((k) => [k, true])));
          setReport(draft.report || "");
          setReportEdited(!!draft.reportEdited);
          setRemarks(draft.remarks || "");
          setDraftAt(draft.savedAt);
          setDraftNotice("Your saved draft is back. Carry on where you left off.");
        } else {
          const fb = readFeedback(d?.grade?.feedback);
          const r = Object.fromEntries(fb.areas.map((a) => [a.name, a.level]));
          const n = Object.fromEntries(fb.areas.filter((a) => a.note).map((a) => [a.name, a.note]));
          setScore(d?.grade?.score != null ? String(d.grade.score) : "");
          setRatings(r);
          setNotes(n);
          setOpenNotes(Object.fromEntries(Object.keys(n).map((k) => [k, true])));
          setReport(fb.report);
          setReportEdited(!!fb.report);
          setRemarks(fb.remarks);
          setDraftAt(null);
          setDraftNotice("");
        }
        setDirty(false);
        setPreview(false);
      })
      .catch((e) => live && setDetailError(e?.response?.data?.detail || e?.message || "Could not load this hand-in."));
    return () => {
      live = false;
    };
  }, [selectedId]);

  const max = Number(assignment?.max_score ?? detail?.assignment_max_score ?? 0);
  const toMark = (subs ?? []).filter((s) => !s.is_graded).length;
  const returned = (subs ?? []).length - toMark;
  const goTo = (id) => {
    setPicked(id ? String(id) : null);
    setParams(id ? { s: String(id) } : {}, { replace: true });
  };

  const subject = useMemo(() => subjectFor(assignment?.course_title || assignment?.subject_name || ""), [assignment]);
  const autoReport = useMemo(() => writeReport(subject.areas, ratings), [subject, ratings]);
  const reportText = reportEdited ? report : autoReport;
  const ratedCount = subject.areas.filter((a) => ratings[a]).length;
  const suggestion = suggestedMark(ratings, max);
  const feedback = buildFeedback({ report: reportText, areas: subject.areas, ratings, notes, remarks });

  const change = (fn) => (...args) => {
    fn(...args);
    setDirty(true);
  };
  const rate = change((area, level) => setRatings((r) => ({ ...r, [area]: r[area] === level ? undefined : level })));
  const rateAll = change((level) => setRatings(Object.fromEntries(subject.areas.map((a) => [a, level]))));
  const setNote = change((area, text) => setNotes((n) => ({ ...n, [area]: text })));

  const saveDraft = useCallback(
    (quiet) => {
      if (!detail) return;
      const savedAt = new Date().toISOString();
      const ok = writeDraft(detail.id, { score, ratings, notes, report, reportEdited, remarks, savedAt });
      if (ok) {
        setDraftAt(savedAt);
        setDirty(false);
        if (!quiet) toastManager.success("Draft saved on this computer. Nothing has gone to the student yet.");
      } else if (!quiet) {
        toastManager.error("This browser blocked saving the draft. Return the marks to keep your work.");
      }
    },
    [detail, score, ratings, notes, report, reportEdited, remarks],
  );

  // Keep a draft automatically a moment after each change, so nothing is lost if the page closes.
  const saveDraftRef = useRef(saveDraft);
  saveDraftRef.current = saveDraft;
  useEffect(() => {
    if (!dirty) return undefined;
    const t = setTimeout(() => saveDraftRef.current(true), 1500);
    return () => clearTimeout(t);
  }, [dirty, score, ratings, notes, report, remarks]);

  // Switching student keeps unsaved changes as a draft first.
  const open = (id) => {
    if (dirty) saveDraft(true);
    goTo(id);
  };

  // Closing the tab with changes not yet in a draft: save one and let the browser warn.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      saveDraftRef.current(true);
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const discardDraft = () => {
    if (!detail) return;
    dropDraft(detail.id);
    setDraftAt(null);
    setDraftNotice("");
    // Reload the hand-in as it was last returned (or blank).
    const fb = readFeedback(detail.grade?.feedback);
    setScore(detail.grade?.score != null ? String(detail.grade.score) : "");
    setRatings(Object.fromEntries(fb.areas.map((a) => [a.name, a.level])));
    const n = Object.fromEntries(fb.areas.filter((a) => a.note).map((a) => [a.name, a.note]));
    setNotes(n);
    setOpenNotes(Object.fromEntries(Object.keys(n).map((k) => [k, true])));
    setReport(fb.report);
    setReportEdited(!!fb.report);
    setRemarks(fb.remarks);
    setDirty(false);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!detail || score === "") return;
    setSaving(true);
    const data = { score: Number(score), feedback };
    try {
      if (detail.grade) await teacherService.updateSubmissionGrade(detail.id, data);
      else await teacherService.gradeSubmission(detail.id, data);
      dropDraft(detail.id);
      setDraftAt(null);
      setDraftNotice("");
      setDirty(false);
      toastManager.success(detail.grade ? "Marks updated. The student sees the change." : `Returned to ${detail.student_name || "the student"}.`);
      const next = (subs ?? []).map((s) => (String(s.id) === String(detail.id) ? { ...s, is_graded: true, score: data.score, status: "graded" } : s));
      setSubs(next);
      setDetail((d) => ({ ...d, is_graded: true, grade: { ...(d.grade || {}), score: data.score, feedback: data.feedback, updated_at: new Date().toISOString() } }));
      // On to the next hand-in still to mark, if any.
      const nextOpen = next.find((s) => !s.is_graded);
      if (nextOpen) goTo(nextOpen.id);
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
                        {!s.is_graded && readDraft(s.id) ? (
                          <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${active ? "bg-white/20 text-white" : "border border-sky-500/30 bg-sky-500/15 text-sky-300"}`}>Draft</span>
                        ) : s.is_graded ? (
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

                {/* Marking checklist, report, marks */}
                <form onSubmit={save} className="space-y-5">
                  {draftNotice && (
                    <p role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-base text-sky-200">
                      <i className="fas fa-floppy-disk" aria-hidden="true" />
                      <span className="flex-1">{draftNotice}</span>
                      <button type="button" onClick={discardDraft} className="text-sm font-semibold underline hover:text-white">Discard draft</button>
                    </p>
                  )}

                  <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/5 p-5 sm:p-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Marking checklist</h3>
                        <p className="mt-1 text-sm text-slate-300">
                          {subject.label}: ten areas. Click a level for each area; add a note only where it helps.{" "}
                          <strong className="font-semibold text-indigo-300">{ratedCount} of {subject.areas.length} rated</strong>
                        </p>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-300">
                        Rate all areas as
                        <select
                          value=""
                          onChange={(e) => e.target.value && rateAll(e.target.value)}
                          className="min-h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm font-semibold text-white focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="">Choose…</option>
                          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </label>
                    </div>

                    <ul className="mt-4">
                      {subject.areas.map((area, n) => (
                        <li key={area} className="border-t border-slate-800 py-3 first:border-t-0">
                          <div className="flex items-center justify-between gap-3">
                            <span id={`area-${n}`} className="text-base font-semibold text-slate-100">
                              <span className="mr-2 text-sm tabular-nums text-slate-400">{n + 1}.</span>{area}
                            </span>
                            <button
                              type="button"
                              onClick={() => setOpenNotes((o) => ({ ...o, [area]: !o[area] }))}
                              aria-expanded={!!openNotes[area]}
                              aria-label={`${openNotes[area] ? "Hide" : "Add a"} note on ${area}`}
                              className="min-h-9 shrink-0 rounded-lg px-2 text-sm font-semibold text-indigo-300 hover:text-white"
                            >
                              <i className={`fas ${openNotes[area] ? "fa-minus" : "fa-plus"} mr-1 text-xs`} aria-hidden="true" />
                              {notes[area]?.trim() && !openNotes[area] ? "Note added" : "Note"}
                            </button>
                          </div>
                          <div role="radiogroup" aria-labelledby={`area-${n}`} className="mt-2 flex flex-wrap gap-1.5">
                            {LEVELS.map((level, i) => {
                              const on = ratings[area] === level;
                              return (
                                <button
                                  key={level}
                                  type="button"
                                  role="radio"
                                  aria-checked={on}
                                  onClick={() => rate(area, level)}
                                  className={`min-h-9 rounded-lg border px-2.5 text-sm font-semibold transition ${on ? LEVEL_ACTIVE[i] : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500 hover:text-white"}`}
                                >
                                  {level}
                                </button>
                              );
                            })}
                          </div>
                          {openNotes[area] && (
                            <input
                              type="text"
                              maxLength={300}
                              value={notes[area] || ""}
                              onChange={(e) => setNote(area, e.target.value)}
                              aria-label={`Note on ${area}`}
                              placeholder={`A short note on ${area.toLowerCase()} (optional)`}
                              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 sm:p-6">
                    <h3 className="text-lg font-semibold text-white">Marks, report and remarks</h3>
                    <div className="mt-4 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
                      <div>
                        <label htmlFor="marks" className="block text-sm font-semibold text-slate-200">Marks (out of {max})</label>
                        <select
                          id="marks"
                          required
                          value={score}
                          onChange={(e) => change(setScore)(e.target.value)}
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
                        {suggestion != null && String(suggestion) !== score && (
                          <p className="mt-3 text-sm text-slate-300">
                            The ratings suggest <strong className="font-semibold text-white">{suggestion} / {max}</strong>.{" "}
                            <button type="button" onClick={() => change(setScore)(String(suggestion))} className="font-semibold text-emerald-300 underline hover:text-white">Use it</button>
                          </p>
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label htmlFor="report" className="block text-sm font-semibold text-slate-200">Report for the student</label>
                          {reportEdited && autoReport && (
                            <button type="button" onClick={change(() => setReportEdited(false))} className="text-sm font-semibold text-indigo-300 hover:text-white">
                              <i className="fas fa-rotate mr-1.5 text-xs" aria-hidden="true" />Rewrite from the ratings
                            </button>
                          )}
                        </div>
                        <textarea
                          id="report"
                          rows={9}
                          maxLength={3000}
                          value={reportText}
                          onChange={(e) => {
                            setReport(e.target.value);
                            setReportEdited(true);
                            setDirty(true);
                          }}
                          placeholder="Rate the areas above and the report writes itself here. You can change any word."
                          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base leading-relaxed text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <p className="mt-1 text-sm text-slate-400">
                          {reportEdited ? "You have edited this report; it no longer changes with the ratings." : "Written from your ratings and updated as you change them."}
                        </p>

                        <label htmlFor="remarks" className="mt-4 block text-sm font-semibold text-slate-200">Your own remarks <span className="font-normal text-slate-400">(optional)</span></label>
                        <textarea
                          id="remarks"
                          rows={4}
                          maxLength={4000}
                          value={remarks}
                          onChange={(e) => change(setRemarks)(e.target.value)}
                          placeholder="Anything else you want to tell the student."
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
                      <button
                        type="button"
                        onClick={() => saveDraft(false)}
                        disabled={saving}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-5 text-base font-semibold text-sky-200 transition hover:bg-sky-500/20 disabled:opacity-50"
                      >
                        <i className="fas fa-floppy-disk" aria-hidden="true" /> Save draft
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreview((v) => !v)}
                        aria-expanded={preview}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 px-5 text-base font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                      >
                        <i className={`fas ${preview ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" /> {preview ? "Hide preview" : "Preview for student"}
                      </button>
                      <p className="text-sm text-slate-400" aria-live="polite">
                        {score === ""
                          ? "Choose the marks to return it."
                          : ratedCount < subject.areas.length
                            ? `${subject.areas.length - ratedCount} area${subject.areas.length - ratedCount > 1 ? "s" : ""} not rated yet (they are left out of the report).`
                            : "The student sees the marks, report and remarks on their assignment page."}
                        {draftAt && <> · Draft saved {formatDateTime(draftAt)}</>}
                      </p>
                    </div>

                    {preview && (
                      <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950/60 p-4 sm:p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">What {detail.student_name || "the student"} will see</p>
                          {score !== "" && <p className="text-xl font-bold tabular-nums text-white">{score}<span className="text-base text-slate-300"> / {max}</span></p>}
                        </div>
                        <MarkingReport feedback={feedback} />
                      </div>
                    )}
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
