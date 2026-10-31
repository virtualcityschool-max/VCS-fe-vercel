// /teacher/mocks — written mock scripts Mock Admin assigned to this teacher (VCS Mock Exams).
// "Mock Exams" in the teacher menu (red number = scripts and papers waiting).
import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { mocksService } from "../../services/mocksService";

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

/** `now` = when the list was loaded (render stays pure). */
function dueText(s, now) {
  if (s.status === "returned") return `Finished ${fmt(s.returnedAt)}`;
  if (s.status === "in_review") return `Sent to Mock Admin ${fmt(s.sentAt)}`;
  if (!s.dueAt) return "No deadline";
  const h = Math.round((new Date(s.dueAt).getTime() - now) / 3_600_000);
  if (h < 0) return `Overdue by ${Math.abs(h) < 24 ? `${Math.abs(h)} h` : `${Math.round(Math.abs(h) / 24)} days`}`;
  return h < 24 ? `Due in ${h} h` : `Due ${fmt(s.dueAt)}`;
}

const STATUS = {
  assigned: { label: "To mark", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  marked: { label: "Draft saved", cls: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  in_review: { label: "With Mock Admin", cls: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  returned: { label: "Released", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
};
// Read-only once sent: Mock Admin checks it, then releases it to the student (or sends it back with a note).
const isDone = (s) => s.status === "returned" || s.status === "in_review";

const TeacherMockMarking = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  // Past papers Mock Admin asked me to review (feedback, or changes when allowed).
  const [reviews, setReviews] = useState(null);

  const [reviewsError, setReviewsError] = useState(null);

  const loadReviews = useCallback(async () => {
    setReviewsError(null);
    try {
      const res = await mocksService.listReviews();
      setReviews(res?.reviews ?? []);
    } catch (e) {
      setReviewsError(e?.message || "Could not load the papers Mock Admin asked you to review.");
    }
  }, []);

  // Refresh reloads both the scripts and the papers to review.
  const load = useCallback(async () => {
    setError(null);
    loadReviews();
    try {
      const res = await mocksService.listScripts();
      setData({ ...res, at: Date.now() });
    } catch (e) {
      setError(e?.message || "Could not load your scripts.");
    }
  }, [loadReviews]);

  useEffect(() => {
    mocksService
      .listReviews()
      .then((res) => setReviews(res?.reviews ?? []))
      .catch((e) => setReviewsError(e?.message || "Could not load the papers Mock Admin asked you to review."));
    mocksService
      .listScripts()
      .then((res) => setData({ ...res, at: Date.now() }))
      .catch((e) => setError(e?.message || "Could not load your scripts."));
  }, []);

  // Two things only (founder, 2026-10-31): scripts to mark and send back, and papers Mock Admin sent to review.
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "reviews" ? "reviews" : "scripts";
  const scripts = data?.scripts ?? [];
  const reviewsOpen = (reviews ?? []).filter((r) => r.status !== "done").length;
  const open = scripts.filter((s) => !isDone(s));
  const overdue = open.filter((s) => s.overdue).length;
  const soon = open.filter((s) => !s.overdue && s.dueAt && new Date(s.dueAt).getTime() - data.at < 86_400_000).length;
  const returned = scripts.length - open.length;
  const tiles = [
    { label: "To mark", value: open.length, icon: "fa-pen-to-square", tone: "text-indigo-300 bg-indigo-500/15" },
    { label: "Due within 24 h", value: soon, icon: "fa-hourglass-half", tone: "text-amber-300 bg-amber-500/15" },
    { label: "Overdue", value: overdue, icon: "fa-triangle-exclamation", tone: "text-rose-300 bg-rose-500/15" },
    { label: "Sent (30 days)", value: returned, icon: "fa-circle-check", tone: "text-emerald-300 bg-emerald-500/15" },
  ];

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Mock Exams</h1>
          <p className="mt-2 max-w-3xl text-base text-slate-300">
            {tab === "scripts"
              ? <>Papers students have sat and submitted. Mark each question against the official mark scheme, add your observations, and send it back within 72 hours.</>
              : <>Past papers Mock Admin asked you to check. Do what Mock Admin allowed: edit the marks, or add remarks only.</>}
          </p>
        </div>
        <button type="button" onClick={load} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700 px-4 text-sm font-semibold text-slate-200 hover:border-indigo-500 transition">
          <i className="fas fa-rotate-right" aria-hidden="true" /> Refresh
        </button>
      </div>

      <div role="tablist" aria-label="Mock Exams" className="mt-6 flex gap-2 border-b border-slate-800">
        {[
          { id: "scripts", label: "Scripts to mark", icon: "fa-pen-to-square", n: data ? open.length : null },
          { id: "reviews", label: "Papers to review", icon: "fa-clipboard-check", n: reviews ? reviewsOpen : null },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setParams(t.id === "scripts" ? {} : { tab: t.id })}
            className={`-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition ${tab === t.id ? "border-indigo-400 text-white" : "border-transparent text-slate-400 hover:text-white"}`}
          >
            <i className={`fas ${t.icon}`} aria-hidden="true" />{t.label}
            {t.n > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">{t.n}</span>}
          </button>
        ))}
      </div>

      {tab === "scripts" && <>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${t.tone}`}><i className={`fas ${t.icon}`} aria-hidden="true" /></span>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{data ? t.value : "–"}</p>
              <p className="text-xs text-slate-300">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
        {error ? (
          <div className="p-10 text-center">
            <p role="alert" className="text-base text-rose-200"><i className="fas fa-triangle-exclamation mr-2" aria-hidden="true" />{error}</p>
            <button type="button" onClick={load} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500">Try again</button>
          </div>
        ) : !data ? (
          <div className="divide-y divide-slate-800/60" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 p-5">
                <div className="h-4 w-1/3 rounded bg-slate-700" /><div className="h-4 w-1/5 rounded bg-slate-800" /><div className="ml-auto h-9 w-28 rounded-lg bg-slate-800" />
              </div>
            ))}
          </div>
        ) : scripts.length === 0 ? (
          <div className="p-14 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300 text-xl"><i className="fas fa-inbox" aria-hidden="true" /></span>
            <p className="mt-4 text-lg font-semibold text-white">Currently there are no mocks for you to check</p>
            <p className="mt-1 text-base text-slate-300">When Mock Admin sends you a script to mark, it appears here and a red number shows on <strong className="text-cyan-300 font-semibold">Mock Exams</strong> in your menu.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/60">
            {scripts.map((s) => {
              const st = STATUS[s.status] ?? STATUS.assigned;
              return (
                <li key={s.id} className="flex flex-col gap-3 p-5 transition hover:bg-slate-800/30 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${st.cls}`}>{st.label}</span>
                      {s.secondMarking && <span className="rounded-md border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-xs font-bold text-violet-300">Second marking</span>}
                      {s.adminNote && !isDone(s) && <span className="rounded-md border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-300">Sent back</span>}
                      <p className="text-base font-semibold text-white">{s.paper}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{s.mock}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      <i className="fas fa-user-graduate mr-1.5" aria-hidden="true" />{s.student} · handed in {fmt(s.handedInAt)} ·{" "}
                      <span className={s.overdue ? "font-semibold text-rose-300" : ""}>{dueText(s, data.at)}</span>
                      {isDone(s) && s.total != null && <> · <span className="font-semibold text-emerald-300">{s.total}/{s.maxMarks}</span></>}
                    </p>
                  </div>
                  <Link
                    to={`/teacher/mocks/${s.id}`}
                    className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-white transition ${isDone(s) ? "bg-emerald-700 hover:bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-500"}`}
                  >
                    <i className={`fas ${isDone(s) ? "fa-eye" : "fa-pen"}`} aria-hidden="true" />
                    {isDone(s) ? "View" : s.adminNote ? "Fix and resend" : s.status === "marked" ? "Continue marking" : "Mark script"}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      </>}

      {tab === "reviews" && <>
      {reviewsError && (
        <p role="alert" className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {reviewsError}{" "}
          <button type="button" onClick={loadReviews} className="font-semibold underline">Try again</button>
        </p>
      )}

      {!reviews && !reviewsError && <p className="mt-6 text-sm text-slate-400" aria-busy="true">Loading…</p>}
      {reviews && reviews.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-14 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 text-xl"><i className="fas fa-clipboard-check" aria-hidden="true" /></span>
          <p className="mt-4 text-lg font-semibold text-white">Currently there are no papers for you to review</p>
          <p className="mt-1 text-base text-slate-300">When Mock Admin sends you a paper to check, it appears here with a red number.</p>
        </div>
      )}
      {reviews && reviews.length > 0 && (
        <section className="mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5">
          <h2 className="text-lg font-semibold text-white"><i className="fas fa-clipboard-check mr-2 text-cyan-300" aria-hidden="true" />Papers to review</h2>
          <p className="mt-1 text-sm text-slate-300">Mock Admin asked you to check these past papers: the question marks and the mark scheme. Add a note where something is wrong.</p>
          <ul className="mt-3 divide-y divide-slate-800/60">
            {reviews.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${r.status === "done" ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300" : "border-amber-500/30 bg-amber-500/15 text-amber-300"}`}>{r.status === "done" ? "Sent back" : r.role === "hod" ? "To finalise (HOD)" : "To review"}</span>
                    <span className="rounded-md border border-slate-700 px-2 py-0.5 text-xs text-slate-300">{r.canEdit ? "You can edit marks" : "Feedback only"}</span>
                    <p className="text-base font-semibold text-white">{r.paper}</p>
                  </div>
                  {r.note && <p className="mt-1 text-sm text-slate-300">“{r.note}”</p>}
                  <p className="mt-1 text-xs text-slate-400">Sent {fmt(r.sentAt)}</p>
                </div>
                <Link to={`/teacher/mocks/review/${r.id}`} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-bold text-white hover:bg-cyan-600">
                  <i className={`fas ${r.status === "done" ? "fa-eye" : "fa-magnifying-glass"}`} aria-hidden="true" />{r.status === "done" ? "View" : "Review paper"}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      </>}
    </div>
  );
};

export default TeacherMockMarking;
