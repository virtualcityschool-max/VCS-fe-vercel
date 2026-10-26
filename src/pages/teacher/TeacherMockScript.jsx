// /teacher/mocks/:jobId — mark one written mock script: the student's answer beside the official mark scheme,
// a mark (never above the question's printed marks; half marks allowed) and a short comment per question.
// Saves itself; "Return to student" sends it once every question has a mark.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mocksService } from "../../services/mocksService";

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

function MarkPicker({ max, value, onChange, disabled, label }) {
  const chips = max <= 12 ? Array.from({ length: max + 1 }, (_, i) => i) : null;
  return (
    <div>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={label}>{label}</label>
        <input
          id={label}
          type="number"
          inputMode="decimal"
          min={0}
          max={max}
          step={0.5}
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(null);
            const n = Math.round(Number(raw) * 2) / 2;
            if (Number.isFinite(n)) onChange(Math.max(0, Math.min(max, n)));
          }}
          className="h-12 w-24 rounded-xl border border-slate-700 bg-slate-950 px-3 text-center text-xl font-bold text-white tabular-nums focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60"
        />
        <span className="text-lg font-semibold text-slate-300">/ {max}</span>
      </div>
      {chips && !disabled && (
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={`Quick marks for ${label}`}>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              aria-pressed={value === c}
              className={`h-9 min-w-9 rounded-lg border px-2 text-sm font-semibold transition ${value === c ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-700 text-slate-200 hover:border-indigo-500"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const TeacherMockScript = () => {
  const { jobId } = useParams();
  const [script, setScript] = useState(null);
  const [error, setError] = useState(null);
  const [marks, setMarks] = useState({});
  const [comments, setComments] = useState({});
  const [overall, setOverall] = useState("");
  const [save, setSave] = useState("idle");
  const [confirming, setConfirming] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState(null);
  const timer = useRef(null);
  const dirty = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { script: s } = await mocksService.getScript(jobId);
      setScript(s);
      setMarks(Object.fromEntries(s.questions.map((q) => [q.id, q.marks])));
      setComments(Object.fromEntries(s.questions.map((q) => [q.id, q.comment || ""])));
      setOverall(s.teacherComment || "");
    } catch (e) {
      setError(e?.message || "Could not open this script.");
    }
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const readOnly = script?.status === "returned";
  const total = useMemo(() => Object.values(marks).reduce((a, b) => a + (b ?? 0), 0), [marks]);
  const markedCount = useMemo(() => Object.values(marks).filter((m) => m != null).length, [marks]);
  const qCount = script?.questions.length ?? 0;

  const persist = useCallback(async () => {
    if (!script || readOnly) return true;
    dirty.current = false;
    setSave("saving");
    try {
      await mocksService.saveMarks(jobId, {
        comment: overall,
        marks: script.questions.map((q) => ({ questionId: q.id, marks: marks[q.id] ?? null, comment: comments[q.id] ?? "" })),
      });
      setSave(dirty.current ? "saving" : "saved");
      return true;
    } catch (e) {
      setSave("error");
      setReturnError(e?.message || null);
      return false;
    }
  }, [script, readOnly, jobId, overall, marks, comments]);

  // Save a moment after each change.
  useEffect(() => {
    if (!script || readOnly || !dirty.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(persist, 1200);
    return () => clearTimeout(timer.current);
  }, [marks, comments, overall, script, readOnly, persist]);

  const change = (fn) => {
    dirty.current = true;
    setSave("saving");
    fn();
  };

  const doReturn = async () => {
    setReturning(true);
    setReturnError(null);
    clearTimeout(timer.current);
    const ok = await persist();
    if (!ok) { setReturning(false); return; }
    try {
      await mocksService.returnScript(jobId);
      setConfirming(false);
      await load();
    } catch (e) {
      setReturnError(e?.message || "Could not return the script.");
    } finally {
      setReturning(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto py-10 text-center">
        <p role="alert" className="text-base text-rose-200"><i className="fas fa-triangle-exclamation mr-2" aria-hidden="true" />{error}</p>
        <Link to="/teacher/mocks" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700 px-4 text-sm font-semibold text-slate-200 hover:border-indigo-500">Back to Mock Marking</Link>
      </div>
    );
  }
  if (!script) {
    return (
      <div className="max-w-[1440px] mx-auto py-16 text-center" aria-busy="true">
        <span className="mx-auto block h-8 w-8 rounded-full border-2 border-slate-700 border-t-indigo-400 animate-spin" aria-hidden="true" />
        <p className="mt-3 text-base text-slate-300">Opening the script…</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto">
      <Link to="/teacher/mocks" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
        <i className="fas fa-arrow-left" aria-hidden="true" /> Mock Marking
      </Link>

      {/* Script header */}
      <div className="mt-3 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/15 to-slate-900/50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">{script.paper}</p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold text-white">{script.mock}</h1>
            <p className="mt-1 text-sm text-slate-300">
              <i className="fas fa-user-graduate mr-1.5" aria-hidden="true" />{script.student} · handed in {fmt(script.handedInAt)}
              {!readOnly && script.dueAt && <> · <span className={script.overdue ? "font-semibold text-rose-300" : "text-amber-300"}>due {fmt(script.dueAt)}</span></>}
              {readOnly && <> · <span className="font-semibold text-emerald-300">returned {fmt(script.returnedAt)}</span></>}
            </p>
            {script.labTest && <p className="mt-2 text-sm text-amber-200"><i className="fas fa-flask mr-1.5" aria-hidden="true" />Lab test: the student describes the procedure. Credit points that show they would carry it out correctly.</p>}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold text-white tabular-nums">{total}<span className="text-xl text-slate-400">/{script.maxMarks}</span></p>
              <p className="text-xs text-slate-300">{markedCount} of {qCount} questions marked</p>
            </div>
            {!readOnly && (
              <button type="button" onClick={() => { setReturnError(null); setConfirming(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-500 transition">
                <i className="fas fa-paper-plane" aria-hidden="true" /> Return to student
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-valuemin={0} aria-valuemax={qCount} aria-valuenow={markedCount} aria-label="Questions marked">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${qCount ? (markedCount / qCount) * 100 : 0}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-300" aria-live="polite">
          {readOnly ? "Returned: marks can no longer be changed." : save === "saving" ? "Saving…" : save === "saved" ? "All changes saved." : save === "error" ? <span className="text-rose-300">Not saved — check your connection.</span> : "Changes save automatically."}
        </p>
      </div>

      {/* Question jump list */}
      <nav aria-label="Questions" className="sticky top-14 z-20 -mx-4 mt-4 border-b border-slate-800 bg-[#070913]/95 px-4 py-2 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <ol className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {script.questions.map((q) => {
            const m = marks[q.id];
            return (
              <li key={q.id}>
                <a href={`#q${q.n}`} className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition ${m != null ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-slate-700 text-slate-300 hover:border-indigo-500"}`} aria-label={`Question ${q.n}${m != null ? `, ${m} of ${q.maxMarks}` : ", not marked"}`}>
                  {q.n}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <ol className="mt-5 space-y-5">
        {script.questions.map((q) => (
          <li key={q.id} id={`q${q.n}`} className="scroll-mt-32 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-white">Question {q.n}</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200">{q.maxMarks} marks</span>
            </div>

            <div className="mt-4 grid gap-5 xl:grid-cols-2">
              {/* Student's work */}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Student&apos;s answer</p>
                {!q.answerText.trim() && q.photos.length === 0 ? (
                  <p className="mt-2 rounded-xl border border-dashed border-slate-700 px-4 py-3 text-sm italic text-slate-300">Not answered.</p>
                ) : (
                  <>
                    {q.answerText.trim() && <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-950/70 px-4 py-3 text-base leading-relaxed text-slate-100">{q.answerText}</p>}
                    {q.photos.length > 0 && (
                      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {q.photos.map((src, k) => (
                          <li key={src}>
                            <a href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-slate-700 bg-white" aria-label={`Open photo ${k + 1} full size`}>
                              <img src={src} alt={`Handwritten answer, photo ${k + 1}`} className="aspect-[3/4] w-full object-cover" loading="lazy" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
                <details className="group mt-3 rounded-xl border border-slate-800">
                  <summary className="cursor-pointer list-none px-4 py-2.5 text-sm font-semibold text-slate-200">
                    <i className="fas fa-file-lines mr-2 text-cyan-300" aria-hidden="true" />
                    <span className="group-open:hidden">Show the question</span><span className="hidden group-open:inline">Hide the question</span>
                  </summary>
                  <div className="space-y-2 border-t border-slate-800 bg-white p-2">
                    {q.pages.map((src, k) => <img key={src} src={src} alt={`Question ${q.n}, page ${k + 1}`} className="block w-full" loading="lazy" />)}
                  </div>
                </details>
              </div>

              {/* Mark scheme + marking */}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Official mark scheme</p>
                <div className="mt-2 space-y-2 overflow-x-auto rounded-xl border border-slate-800 bg-white p-2">
                  {q.markScheme.length ? q.markScheme.map((src, k) => (
                    <a key={src} href={src} target="_blank" rel="noreferrer" aria-label={`Open mark scheme part ${k + 1} full size`}>
                      <img src={src} alt={`Mark scheme for question ${q.n}${q.markScheme.length > 1 ? `, part ${k + 1}` : ""}`} className="block w-full min-w-[32rem]" loading="lazy" />
                    </a>
                  )) : <p className="px-2 py-3 text-sm text-slate-700">No mark scheme image for this question.</p>}
                </div>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-sm font-semibold text-white">Mark</p>
                  <div className="mt-2">
                    <MarkPicker max={q.maxMarks} value={marks[q.id]} disabled={readOnly} label={`Question ${q.n} mark`} onChange={(v) => change(() => setMarks((m) => ({ ...m, [q.id]: v })))} />
                  </div>
                  <label className="mt-4 block text-sm font-semibold text-white" htmlFor={`c-${q.id}`}>Comment for the student <span className="font-normal text-slate-400">(optional)</span></label>
                  <textarea
                    id={`c-${q.id}`}
                    rows={2}
                    maxLength={2000}
                    disabled={readOnly}
                    value={comments[q.id] ?? ""}
                    onChange={(e) => { const v = e.target.value; change(() => setComments((c) => ({ ...c, [q.id]: v }))); }}
                    placeholder="e.g. (b)(ii): unit missing — always give the unit with the answer."
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-70"
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <label htmlFor="overall" className="text-lg font-semibold text-white">Overall comment</label>
        <p className="mt-1 text-sm text-slate-300">What should the student work on next? Shown at the top of their result.</p>
        <textarea
          id="overall"
          rows={3}
          maxLength={4000}
          disabled={readOnly}
          value={overall}
          onChange={(e) => { const v = e.target.value; change(() => setOverall(v)); }}
          className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-70"
        />
        {!readOnly && (
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={() => { setReturnError(null); setConfirming(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-500 transition">
              <i className="fas fa-paper-plane" aria-hidden="true" /> Return to student
            </button>
          </div>
        )}
      </section>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => !returning && setConfirming(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="ret-h" className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 id="ret-h" className="text-xl font-bold text-white">Return to {script.student}?</h2>
            <p className="mt-2 text-base text-slate-200">Total <strong className="text-emerald-300 font-semibold">{total}/{script.maxMarks}</strong>. {markedCount < qCount ? `${qCount - markedCount} question${qCount - markedCount === 1 ? " has" : "s have"} no mark yet — give 0 where nothing earns a mark.` : "The student will see every mark and comment."}</p>
            {returnError && <p role="alert" className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{returnError}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={returning} onClick={() => setConfirming(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200 hover:border-indigo-500">Keep marking</button>
              <button type="button" disabled={returning || markedCount < qCount} onClick={doReturn} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50">
                {returning ? "Returning…" : <><i className="fas fa-paper-plane" aria-hidden="true" /> Return now</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMockScript;
