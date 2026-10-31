// /student/mocks — opens VCS Mock Exams signed in with this VCS account (no second password).
// "Mock Exams" in the student menu.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { mocksService } from "../../services/mocksService";

const POINTS = [
  { icon: "fa-file-lines", tone: "bg-indigo-500/15 text-indigo-300", title: "Real Cambridge past papers", body: "Every mock is a complete official paper on its real time limit." },
  { icon: "fa-check-double", tone: "bg-emerald-500/15 text-emerald-300", title: "Marked properly", body: "Multiple choice is marked instantly; written papers are marked by VCS teachers against the official mark scheme." },
  { icon: "fa-chart-line", tone: "bg-cyan-500/15 text-cyan-300", title: "See where marks are lost", body: "Scores, timing and teacher comments on every question." },
];

const StudentMocks = () => {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(true);
  const started = useRef(false);

  const go = useCallback(() => {
    mocksService
      .openSession()
      .then((url) => window.location.assign(url))
      .catch((e) => {
        setError(e?.message || "Could not open Mock Exams. Please try again.");
        setBusy(false);
      });
  }, []);

  const open = () => {
    setBusy(true);
    setError(null);
    go();
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    go();
  }, [go]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-slate-900/60 to-slate-900/40 p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">VCS Mock Exams</p>
        <h1 className="mt-2 text-3xl md:text-5xl font-bold text-white">Your Cambridge mocks</h1>
        <p className="mt-3 max-w-3xl text-base text-slate-200">
          Sit <strong className="text-emerald-300 font-semibold">official past papers</strong> on the real clock with your VCS account — no new password.
        </p>

        <div className="mt-6" aria-live="polite">
          {busy ? (
            <div className="inline-flex items-center gap-3 rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-base text-slate-200">
              <span className="h-5 w-5 rounded-full border-2 border-slate-600 border-t-indigo-400 animate-spin" aria-hidden="true" />
              Opening Mock Exams…
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-base text-rose-200">
                <i className="fas fa-triangle-exclamation mr-2" aria-hidden="true" />{error}
              </p>
              <button type="button" onClick={open} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-base font-semibold text-white hover:bg-indigo-500 transition">
                <i className="fas fa-rotate-right" aria-hidden="true" /> Try again
              </button>
              <Link to="/student" className="text-sm font-semibold text-slate-300 hover:text-white">Back to dashboard</Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {POINTS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${p.tone}`}><i className={`fas ${p.icon}`} aria-hidden="true" /></span>
            <h2 className="mt-3 text-lg font-semibold text-white">{p.title}</h2>
            <p className="mt-1 text-sm text-slate-300">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentMocks;
