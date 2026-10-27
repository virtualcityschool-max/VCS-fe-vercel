// /teacher/mocks/review/:reviewId — a past paper Mock Admin asked this teacher to review (VCS Mock Exams).
// The teacher checks each question's marks against the official paper and mark scheme, writes a note where
// something is wrong, and sends the review back. "Can edit": a changed mark is applied at once.
// The HOD also sees every other teacher's review, and writes the final decision.
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mocksService } from "../../services/mocksService";

function Fold({ label, children, open = false }) {
  return (
    <details className="group mt-3 rounded-xl border border-slate-800" open={open}>
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-200">
        <span className="group-open:hidden">Show {label}</span>
        <span className="hidden group-open:inline">Hide {label}</span>
      </summary>
      <div className="space-y-2 border-t border-slate-800 bg-white p-2">{children}</div>
    </details>
  );
}

const TeacherPaperReview = () => {
  const { reviewId } = useParams();
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState({});
  const [feedback, setFeedback] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(null); // "send" | "save" | null

  useEffect(() => {
    setReview(null);
    setError(null);
    setMsg(null);
    mocksService
      .getReview(reviewId)
      .then((res) => {
        const r = res.review;
        setReview(r);
        setFeedback(r.feedback || "");
        setNotes(Object.fromEntries((r.questions ?? []).map((q) => [q.id, { comment: q.comment || "", marks: q.suggestedMarks == null ? "" : String(q.suggestedMarks) }])));
      })
      .catch((e) => setError(e?.message || "Could not load this paper."));
  }, [reviewId]);

  const save = async (submit) => {
    setMsg(null);
    const payload = {
      feedback,
      submit,
      notes: review.questions.map((q) => {
        const n = notes[q.id] || {};
        const v = String(n.marks ?? "").trim();
        return { questionId: q.id, comment: n.comment || "", suggestedMarks: v === "" ? null : /^\d{1,3}$/.test(v) ? Number(v) : NaN };
      }),
    };
    if (payload.notes.some((n) => n.suggestedMarks != null && !(n.suggestedMarks >= 0 && n.suggestedMarks <= 100))) {
      setMsg({ ok: false, text: "Marks must be whole numbers from 0 to 100." });
      return;
    }
    setBusy(submit ? "send" : "save");
    try {
      const r = await mocksService.saveReview(reviewId, payload);
      if (submit) {
        // Show the marks now on the paper (changes apply only when the review is sent).
        const byId = new Map(payload.notes.map((n) => [n.questionId, n.suggestedMarks]));
        setReview((x) => ({
          ...x,
          status: "done",
          questions: x.canEdit ? x.questions.map((q) => (q.written && byId.get(q.id) != null ? { ...q, marks: byId.get(q.id) } : q)) : x.questions,
        }));
      }
      setMsg({ ok: true, text: submit ? `Review sent to Mock Admin.${r.applied ? ` ${r.applied} mark change${r.applied === 1 ? "" : "s"} applied.` : ""}` : `Saved.${r.applied ? ` ${r.applied} mark change${r.applied === 1 ? "" : "s"} applied.` : ""}` });
    } catch (e) {
      setMsg({ ok: false, text: e?.message || "Could not save." });
    } finally {
      setBusy(null);
    }
  };

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto p-10 text-center">
        <p role="alert" className="text-rose-200">{error}</p>
        <Link to="/teacher/mocks" className="mt-4 inline-block text-cyan-300 underline">Back to Mock Marking</Link>
      </div>
    );
  }
  if (!review) return <div className="max-w-[1440px] mx-auto p-10 text-slate-300" aria-busy="true">Loading the paper…</div>;

  const done = review.status === "done";
  const hod = review.role === "hod";

  return (
    <div className="max-w-[1440px] mx-auto">
      <Link to="/teacher/mocks" className="text-sm font-semibold text-slate-300 hover:text-white"><i className="fas fa-arrow-left mr-2" aria-hidden="true" />Mock Marking</Link>
      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">{hod ? "Final decision (HOD)" : "Paper review"} · {review.canEdit ? "you can edit marks" : "feedback only"}</p>
        <h1 className="mt-2 text-3xl md:text-5xl font-bold text-white">{review.paper}</h1>
        <p className="mt-3 max-w-3xl text-base text-slate-300">
          {hod
            ? "Read the other teachers' reviews below, check the questions, and write the final decision: what should change and what should stay."
            : "Check each question's marks against the official paper and mark scheme. Write a note where something is wrong, or suggest the right marks."}
          {review.canEdit ? " Your mark changes are applied to the paper when you send the review. Saving to finish later changes nothing." : " Mock Admin decides on your suggestions."}
        </p>
        {review.note && <p className="mt-3 rounded-lg bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100"><strong>Mock Admin:</strong> {review.note}</p>}
        {review.rule && <p className="mt-2 text-sm text-slate-300">{review.rule}</p>}
      </section>

      {hod && (review.otherReviews ?? []).length > 0 && (
        <section className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="text-lg font-semibold text-white">Teachers' reviews ({review.otherReviews.length})</h2>
          <ul className="mt-3 space-y-3">
            {review.otherReviews.map((o, k) => (
              <li key={k} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-white">{o.teacher} <span className="font-normal text-slate-400">· {o.status === "done" ? "sent" : "not sent yet"}</span></p>
                {o.feedback && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200">{o.feedback}</p>}
                {(o.notes ?? []).map((n) => (
                  <p key={n.questionId} className="mt-1 text-sm text-slate-300"><a href={`#q${n.n}`} className="font-semibold text-cyan-300">Q{n.n}</a> {n.comment}{n.suggestedMarks != null && <span className="ml-2 text-xs text-slate-400">marks → {n.suggestedMarks}{n.applied ? " (changed)" : ""}</span>}</p>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(review.insertPages ?? []).length > 0 && <Fold label="the Insert">{review.insertPages.map((src, k) => <img key={src} src={src} alt={`Insert page ${k + 1}`} className="block h-auto w-full" loading="lazy" />)}</Fold>}
      {(review.levelGuide ?? []).length > 0 && <Fold label="the levels of response">{review.levelGuide.map((src, k) => <img key={src} src={src} alt={`Levels of response, page ${k + 1}`} className="block h-auto w-full" loading="lazy" />)}</Fold>}

      <ol className="mt-5 space-y-4">
        {(review.questions ?? []).map((q) => {
          const n = notes[q.id] || { comment: "", marks: "" };
          return (
            <li key={q.id} id={`q${q.n}`} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-white">Question {q.n}</h2>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200">{q.written ? `${q.marks} marks` : `Answer key: ${(q.answerKey ?? []).join(", ") || "—"}`}</span>
              </div>
              <Fold label="the question" open>{(q.pages ?? []).map((src) => <img key={src} src={src} alt={`Question ${q.n}`} className="mx-auto block h-auto w-full max-w-4xl" loading="lazy" />)}</Fold>
              {(q.markScheme ?? []).length > 0 && <Fold label="the official mark scheme">{q.markScheme.map((src) => <img key={src} src={src} alt={`Mark scheme for question ${q.n}`} className="block h-auto w-full" loading="lazy" />)}</Fold>}
              <div className="mt-4 grid gap-3 md:grid-cols-[10rem_minmax(0,1fr)]">
                {q.written ? (
                  <label className="text-sm font-semibold text-slate-200">
                    {review.canEdit ? "Correct marks" : "Suggested marks"}
                    <input inputMode="numeric" disabled={done} value={n.marks} onChange={(e) => setNotes((x) => ({ ...x, [q.id]: { ...n, marks: e.target.value } }))}
                      placeholder={String(q.marks)} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 font-mono text-white" />
                  </label>
                ) : <span />}
                <label className="text-sm font-semibold text-slate-200">
                  Note <span className="font-normal text-slate-400">(leave empty if correct)</span>
                  <input disabled={done} value={n.comment} maxLength={2000} onChange={(e) => setNotes((x) => ({ ...x, [q.id]: { ...n, comment: e.target.value } }))}
                    placeholder="e.g. Part (b) is worth 3 marks, not 2" className="mt-1 block min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-white" />
                </label>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <label className="block text-sm font-semibold text-slate-200">
          {hod ? "Final decision" : "Overall feedback"}
          <textarea disabled={done} rows={4} maxLength={8000} value={feedback} onChange={(e) => setFeedback(e.target.value)}
            placeholder={hod ? "What should change, and what should stay as it is." : "Anything about the whole paper: missing pages, wrong mark scheme, timing…"}
            className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
        </label>
        {!done ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={busy} onClick={() => save(true)} className="inline-flex min-h-11 items-center rounded-lg bg-cyan-700 px-5 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-60">{busy === "send" ? "Sending…" : hod ? "Send final decision" : "Send review"}</button>
            <button type="button" disabled={busy} onClick={() => save(false)} className="inline-flex min-h-11 items-center rounded-lg border border-slate-700 px-5 text-sm font-semibold text-slate-200 hover:border-cyan-500 disabled:opacity-60">{busy === "save" ? "Saving…" : "Save and finish later"}</button>
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold text-emerald-300">Sent to Mock Admin. Thank you.</p>
        )}
        {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-3 text-sm ${msg.ok ? "text-emerald-300" : "text-rose-300"}`}>{msg.text}</p>}
      </section>
    </div>
  );
};

export default TeacherPaperReview;
