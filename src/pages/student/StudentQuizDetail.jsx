import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudentQuizById,
  submitStudentQuiz,
} from "../../store/slices/studentDashboardSlice";
import studentService from "../../services/studentService";
import { toastManager } from "../../utils/toastManager";
import { useDateFormatters } from "../../hooks";

// ── Timer helpers ─────────────────────────────────────────────────────────────
const formatCountdown = (seconds) => {
  if (seconds == null) return "--:--";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mmss = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
};

// Answers are kept on the device while the clock runs, so a refresh or a closed tab does not lose them
const savedAnswersKey = (userId, quizId) => `vcs-quiz-answers-${userId ?? "me"}-${quizId}`;

const readSavedAnswers = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
};

const errorText = (e) => {
  if (typeof e === "string") return e;
  const first = (v) => (Array.isArray(v) ? v[0] : v);
  return e?.error || e?.detail || first(e?.non_field_errors) || first(e?.answers) || e?.message || "";
};

// ── Status helpers ────────────────────────────────────────────────────────────
const subStatus = (sub) => {
  if (!sub || sub.status === "pending") return "pending";
  return sub.status;
};

const statusBadge = (status) => {
  const map = {
    pending:     { label: "Pending",          color: "text-yellow-400 bg-yellow-500/10" },
    missed:      { label: "Missed",           color: "text-red-400 bg-red-500/10" },
    submitted:   { label: "Submitted",        color: "text-blue-400 bg-blue-500/10" },
    auto_graded: { label: "Graded",           color: "text-emerald-400 bg-emerald-500/10" },
    graded:      { label: "Graded",           color: "text-emerald-400 bg-emerald-500/10" },
  };
  return map[status] ?? { label: status, color: "text-slate-400 bg-slate-500/10" };
};

const StudentQuizDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatDate, formatDateTime } = useDateFormatters();

  const { currentQuiz, isFetchingCurrentQuiz, isSubmittingQuiz } = useSelector(
    (s) => s.studentDashboard
  );
  const userId = useSelector((s) => s.auth?.user?.id);

  // Local answer state: { [questionId]: selectedOptions[] | textAnswer }
  const [answers, setAnswers] = useState({});
  const [isStarting, setIsStarting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [confirmUnanswered, setConfirmUnanswered] = useState(false);
  const [autoSubmitFailed, setAutoSubmitFailed] = useState(false);
  const autoSubmitDone = useRef(false);
  const timerBarRef = useRef(null);
  const [timerBarInView, setTimerBarInView] = useState(true);

  const attempt = currentQuiz?.my_attempt;
  // The clock is running: started, not yet submitted, and the server still accepts answers
  const isRunning = Boolean(attempt && !currentQuiz?.my_submission && !attempt.time_is_up);
  const answersKey = savedAnswersKey(userId, id);

  useEffect(() => {
    dispatch(fetchStudentQuizById(id));
  }, [dispatch, id]);

  // Initialise answer map when quiz loads, restoring anything already answered in this attempt
  useEffect(() => {
    if (!currentQuiz?.questions?.length) return;
    const saved = currentQuiz.my_attempt && !currentQuiz.my_submission ? readSavedAnswers(answersKey) : {};
    const init = {};
    currentQuiz.questions.forEach((q) => {
      if (q.question_type === "TEXT_FORMAT") {
        init[q.id] = typeof saved[q.id] === "string" ? saved[q.id] : "";
      } else {
        init[q.id] = Array.isArray(saved[q.id]) ? saved[q.id] : [];
      }
    });
    setAnswers(init);
  }, [currentQuiz?.id, currentQuiz?.questions?.length, currentQuiz?.my_attempt?.started_at, answersKey]);

  useEffect(() => {
    if (!isRunning || !Object.keys(answers).length) return;
    try {
      localStorage.setItem(answersKey, JSON.stringify(answers));
    } catch {
      // storage unavailable: the quiz still works, answers just are not kept across a refresh
    }
  }, [answers, isRunning, answersKey]);

  // Countdown. Measured against the server's clock, so a wrong clock on the device cannot change the time allowed.
  useEffect(() => {
    if (!isRunning) return undefined;
    const offset = Date.now() - new Date(attempt.server_now).getTime();
    const endsAt = new Date(attempt.ends_at).getTime() + offset;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [isRunning, attempt?.ends_at, attempt?.server_now]);

  // Once the timer bar scrolls out of sight, a small floating clock takes over
  useEffect(() => {
    const bar = timerBarRef.current;
    if (!isRunning || !bar || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setTimerBarInView(entry.isIntersecting));
    observer.observe(bar);
    return () => observer.disconnect();
  }, [isRunning, currentQuiz?.questions?.length]);

  const submitAnswers = async ({ auto = false } = {}) => {
    // Unanswered questions are left out; the server scores them as 0
    const payload = currentQuiz.questions.flatMap((q) => {
      if (q.question_type === "TEXT_FORMAT") {
        const text = (answers[q.id] ?? "").trim();
        return text ? [{ question_id: q.id, text_answer: text }] : [];
      }
      const selected = answers[q.id] ?? [];
      return selected.length ? [{ question_id: q.id, selected_options: selected }] : [];
    });

    try {
      await dispatch(submitStudentQuiz({ quizId: currentQuiz.id, answers: payload })).unwrap();
      try {
        localStorage.removeItem(answersKey);
      } catch {
        // nothing to clear
      }
      toastManager.success(auto ? "Time is up. Your answers were submitted." : "Quiz submitted!");
      dispatch(fetchStudentQuizById(id));
    } catch (e) {
      if (auto) setAutoSubmitFailed(true);
      toastManager.error(errorText(e) || "Failed to submit quiz");
    }
  };

  // Time is up: hand in whatever has been answered
  useEffect(() => {
    if (!isRunning || secondsLeft !== 0 || autoSubmitDone.current) return;
    autoSubmitDone.current = true;
    setConfirmUnanswered(false);
    submitAnswers({ auto: true });
  }, [isRunning, secondsLeft]);

  if (isFetchingCurrentQuiz) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-white">
        <i className="fas fa-spinner animate-spin text-2xl" />
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
        Quiz not found.
      </div>
    );
  }

  const mySubmission = currentQuiz.my_submission;
  const status = subStatus(mySubmission);
  const isOpen = status === "pending";
  const questionsCount = currentQuiz.questions_count ?? currentQuiz.questions?.length ?? 0;
  const timeIsUp = isRunning && secondsLeft === 0;
  const timerTone =
    secondsLeft != null && secondsLeft <= 60
      ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
      : "bg-slate-900/95 border-indigo-500/40 text-white";
  const minutesLabel = `${currentQuiz.duration_minutes} ${currentQuiz.duration_minutes === 1 ? "minute" : "minutes"}`;
  const unansweredCount = (currentQuiz.questions ?? []).filter((q) =>
    q.question_type === "TEXT_FORMAT" ? !(answers[q.id] ?? "").trim() : !(answers[q.id] ?? []).length
  ).length;

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await studentService.startQuiz(currentQuiz.id);
      dispatch(fetchStudentQuizById(id));
    } catch (e) {
      toastManager.error(errorText(e?.response?.data) || "Could not start the quiz. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSingleChoice = (qId, optId) => {
    setAnswers((p) => ({ ...p, [qId]: [optId] }));
  };

  const handleMultipleChoice = (qId, optId) => {
    setAnswers((p) => {
      const current = p[qId] ?? [];
      const next = current.includes(optId)
        ? current.filter((id) => id !== optId)
        : [...current, optId];
      return { ...p, [qId]: next };
    });
  };

  const handleText = (qId, text) => {
    setAnswers((p) => ({ ...p, [qId]: text }));
  };

  const handleSubmit = () => {
    if (unansweredCount > 0 && !confirmUnanswered) {
      setConfirmUnanswered(true);
      return;
    }
    setConfirmUnanswered(false);
    submitAnswers();
  };

  // ── Result view (after submission) ───────────────────────────────────────
  const renderResults = (sub) => {
    const { label, color } = statusBadge(sub.status);
    return (
      <div className="space-y-6">
        {/* Score card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Your Result</h2>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${color}`}>
              {label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 rounded-2xl p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Score</p>
              <p className="text-white font-bold text-lg">
                {(sub.status === "graded" || sub.status === "auto_graded") && sub.obtained_marks != null
                  ? `${sub.obtained_marks} / ${sub.total_marks_snapshot ?? currentQuiz.total_marks}`
                  : `- / ${sub.total_marks_snapshot ?? currentQuiz.total_marks}`}
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-2xl p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Submitted</p>
              <p className="text-white text-xs">{sub.submitted_at ? formatDate(sub.submitted_at) : "-"}</p>
            </div>
          </div>
          {(sub.status === "submitted") && (
            <p className="text-amber-400 text-xs mt-4 text-center">
              Your text answer(s) are pending teacher review.
            </p>
          )}
        </div>

        {/* Answers */}
        {sub.answers?.map((ans, idx) => (
          <div key={ans.question_id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-semibold text-white text-sm">{idx + 1}. {ans.question_text}</p>
              <span className="text-[10px] text-slate-500 flex-shrink-0">{ans.max_marks} marks</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-indigo-400 mb-3 block">
              {ans.question_type?.replace("_", " ")}
            </span>

            {ans.question_type === "TEXT_FORMAT" ? (
              <div className="space-y-2">
                <div className="bg-slate-800 rounded-xl p-3 text-sm text-slate-300 min-h-[60px]">
                  {ans.text_answer || <span className="text-slate-500 italic">No answer provided</span>}
                </div>
                {ans.status === "graded" ? (
                  <p className="text-xs text-slate-400">
                    Marks:{" "}
                    <span className="font-semibold text-emerald-400">{ans.obtained_marks} / {ans.max_marks}</span>
                  </p>
                ) : (
                  <p className="text-xs text-amber-400">Pending teacher review</p>
                )}
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ans.selected_options?.length > 0 ? (
                    ans.selected_options.map((optNum) => (
                      <span key={optNum} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        Option {optNum}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No answer selected</span>
                  )}
                </div>
                {(sub.status === "graded" || sub.status === "auto_graded") && (
                  <p className="text-xs">
                    Marks:{" "}
                    <span className={`font-semibold ${(ans.obtained_marks ?? 0) > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {ans.obtained_marks ?? 0} / {ans.max_marks}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ── Attempt form ─────────────────────────────────────────────────────────
  const renderAttempt = () => (
    <div className="space-y-6">
      <div
        ref={timerBarRef}
        role="timer"
        className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-3 ${timerTone}`}
      >
        <span className="text-xs font-bold uppercase tracking-widest">
          <i className="fas fa-stopwatch mr-2" />
          {timeIsUp ? "Time is up" : "Time left"}
        </span>
        <span className="font-mono text-2xl font-black tabular-nums">{formatCountdown(secondsLeft)}</span>
      </div>

      {!timerBarInView && (
        <div
          aria-hidden="true"
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border px-4 py-2 shadow-xl backdrop-blur-md ${timerTone}`}
        >
          <i className="fas fa-stopwatch text-xs" />
          <span className="font-mono text-base font-black tabular-nums">{formatCountdown(secondsLeft)}</span>
        </div>
      )}

      {timeIsUp && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-center text-amber-300 text-sm">
          {autoSubmitFailed ? (
            <>
              <p className="mb-3">Time is up, but your answers could not be sent. Check your connection and try again now.</p>
              <button
                type="button"
                disabled={isSubmittingQuiz}
                onClick={() => submitAnswers({ auto: true })}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-50 rounded-xl text-xs font-bold transition"
              >
                Send my answers
              </button>
            </>
          ) : (
            "Time is up. Submitting your answers…"
          )}
        </div>
      )}

      <fieldset disabled={timeIsUp} className="space-y-6 min-w-0">
      {currentQuiz.questions?.map((q, idx) => (
        <div key={q.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-white text-sm">{idx + 1}. {q.question_text}</p>
            <span className="text-[10px] text-slate-500 flex-shrink-0">{q.max_marks} marks</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-indigo-400 mb-4 block">
            {q.question_type === "SINGLE_CHOICE" ? "Single Choice" :
             q.question_type === "MULTIPLE_CHOICE" ? "Multiple Choice" : "Text Answer"}
          </span>

          {q.question_type === "SINGLE_CHOICE" && (
            <div className="space-y-2">
              {q.options?.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    answers[q.id]?.includes(opt.id)
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id]?.includes(opt.id) ?? false}
                    onChange={() => handleSingleChoice(q.id, opt.id)}
                    className="accent-indigo-500 w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-sm">{opt.option_text}</span>
                </label>
              ))}
            </div>
          )}

          {q.question_type === "MULTIPLE_CHOICE" && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 mb-2">Select all that apply</p>
              {q.options?.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    answers[q.id]?.includes(opt.id)
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={answers[q.id]?.includes(opt.id) ?? false}
                    onChange={() => handleMultipleChoice(q.id, opt.id)}
                    className="accent-indigo-500 w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-sm">{opt.option_text}</span>
                </label>
              ))}
            </div>
          )}

          {q.question_type === "TEXT_FORMAT" && (
            <textarea
              rows={4}
              placeholder="Write your answer here…"
              value={answers[q.id] ?? ""}
              onChange={(e) => handleText(q.id, e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          )}
        </div>
      ))}

      {confirmUnanswered && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-amber-300 text-sm flex flex-wrap items-center justify-between gap-3">
          <span>
            {unansweredCount === 1
              ? "1 question is not answered and will score 0."
              : `${unansweredCount} questions are not answered and will score 0.`}
          </span>
          <button
            type="button"
            onClick={() => setConfirmUnanswered(false)}
            className="px-4 py-1.5 rounded-xl border border-amber-500/40 text-xs font-bold hover:bg-amber-500/10 transition"
          >
            Keep working
          </button>
        </div>
      )}

      <button
        type="button"
        disabled={isSubmittingQuiz}
        onClick={handleSubmit}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2"
      >
        {isSubmittingQuiz && <i className="fas fa-spinner animate-spin text-xs" />}
        {confirmUnanswered ? "Submit anyway" : "Submit Quiz"}
      </button>
      </fieldset>
    </div>
  );

  // ── Start screen (the clock has not started yet) ─────────────────────────
  const renderStart = () => (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 text-center space-y-4">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
        <i className="fas fa-stopwatch text-2xl" />
      </div>
      <h2 className="font-bold text-white text-lg">
        {questionsCount} {questionsCount === 1 ? "question" : "questions"} · {minutesLabel}
      </h2>
      <p className="text-slate-400 text-sm max-w-md mx-auto">
        The clock starts when you press Start and cannot be paused, even if you close this page.
        When the time runs out, your answers are submitted automatically.
      </p>
      <button
        type="button"
        disabled={isStarting}
        onClick={handleStart}
        className="w-full sm:w-auto px-10 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-2xl text-sm font-bold transition inline-flex items-center justify-center gap-2"
      >
        {isStarting && <i className="fas fa-spinner animate-spin text-xs" />}
        Start Quiz
      </button>
    </div>
  );

  return (
    <div className="p-6 lg:p-12 space-y-6 max-w-2xl mx-auto">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/student/assessments?tab=quizzes")}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition"
      >
        <i className="fas fa-arrow-left text-xs" />
        Back to Quizzes
      </button>

      {/* Quiz header */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 mb-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-xl font-black font-poppins text-white">{currentQuiz.title}</h1>
          {mySubmission && (
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex-shrink-0 ${statusBadge(status).color}`}>
              {statusBadge(status).label}
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">{currentQuiz.course_title}</p>
        {currentQuiz.description && (
          <p className="text-slate-300 text-sm mb-3">{currentQuiz.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          <span><i className="fas fa-star mr-1 text-indigo-400" />{currentQuiz.total_marks} total marks</span>
          {currentQuiz.duration_minutes && (
            <span><i className="fas fa-stopwatch mr-1 text-amber-400" />{currentQuiz.duration_minutes} min time limit</span>
          )}
          {currentQuiz.due_date && (
            <span className={currentQuiz.is_overdue ? "text-rose-400" : ""}>
              <i className="fas fa-clock mr-1" />
              Due {formatDateTime(currentQuiz.due_date)}
              {currentQuiz.is_overdue && " (Overdue)"}
            </span>
          )}
        </div>
      </div>

      {/* Missed */}
      {status === "missed" && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 text-center text-rose-400 text-sm">
          The quiz window has closed and you did not submit.
        </div>
      )}

      {/* Results after submission */}
      {(status === "submitted" || status === "auto_graded" || status === "graded") && renderResults(mySubmission)}

      {/* Start screen */}
      {isOpen && !attempt && !currentQuiz.is_overdue && renderStart()}

      {/* Attempt form, while the clock runs */}
      {isOpen && isRunning && renderAttempt()}

      {/* Started, but the time ran out with nothing submitted */}
      {isOpen && attempt?.time_is_up && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 text-center text-rose-400 text-sm">
          Your time for this quiz ran out and no answers were submitted.
        </div>
      )}

      {/* Overdue and never started */}
      {isOpen && !attempt && currentQuiz.is_overdue && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 text-center text-rose-400 text-sm">
          This quiz is now overdue and can no longer be submitted.
        </div>
      )}
    </div>
  );
};

export default StudentQuizDetail;
