import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudentQuizById,
  submitStudentQuiz,
} from "../../store/slices/studentDashboardSlice";
import { toastManager } from "../../utils/toastManager";
import { formatDate, formatDateTime } from "../../utils/validation";

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

  const { currentQuiz, isFetchingCurrentQuiz, isSubmittingQuiz } = useSelector(
    (s) => s.studentDashboard
  );

  // Local answer state: { [questionId]: selectedOptions[] | textAnswer }
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    dispatch(fetchStudentQuizById(id));
  }, [dispatch, id]);

  // Initialise answer map when quiz loads
  useEffect(() => {
    if (!currentQuiz?.questions) return;
    const init = {};
    currentQuiz.questions.forEach((q) => {
      if (q.question_type === "TEXT_FORMAT") {
        init[q.id] = "";
      } else {
        init[q.id] = [];
      }
    });
    setAnswers(init);
  }, [currentQuiz?.id]);

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

  const handleSubmit = async () => {
    // Validate answers
    for (const q of currentQuiz.questions) {
      if (q.question_type === "SINGLE_CHOICE") {
        if (!answers[q.id]?.length) {
          toastManager.error(`Question ${currentQuiz.questions.indexOf(q) + 1}: please select an answer`);
          return;
        }
      } else if (q.question_type === "MULTIPLE_CHOICE") {
        if (!answers[q.id]?.length) {
          toastManager.error(`Question ${currentQuiz.questions.indexOf(q) + 1}: please select at least one option`);
          return;
        }
      } else if (q.question_type === "TEXT_FORMAT") {
        if (!answers[q.id]?.trim()) {
          toastManager.error(`Question ${currentQuiz.questions.indexOf(q) + 1}: please write an answer`);
          return;
        }
      }
    }

    const payload = currentQuiz.questions.map((q) => {
      if (q.question_type === "TEXT_FORMAT") {
        return { question_id: q.id, text_answer: answers[q.id] };
      }
      return { question_id: q.id, selected_options: answers[q.id] ?? [] };
    });

    try {
      await dispatch(submitStudentQuiz({ quizId: currentQuiz.id, answers: payload })).unwrap();
      toastManager.success("Quiz submitted!");
      setSubmitted(true);
      dispatch(fetchStudentQuizById(id));
    } catch (e) {
      const msg = typeof e === "string" ? e : (e?.detail || e?.answers || JSON.stringify(e));
      toastManager.error(msg || "Failed to submit quiz");
    }
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
                  : `— / ${sub.total_marks_snapshot ?? currentQuiz.total_marks}`}
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-2xl p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Submitted</p>
              <p className="text-white text-xs">{sub.submitted_at ? formatDate(sub.submitted_at) : "—"}</p>
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
                <p className="text-xs text-slate-400 mb-2">Your answer(s): option ID(s) {ans.selected_options?.join(", ") || "none"}</p>
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

      <button
        type="button"
        disabled={isSubmittingQuiz}
        onClick={handleSubmit}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2"
      >
        {isSubmittingQuiz && <i className="fas fa-spinner animate-spin text-xs" />}
        Submit Quiz
      </button>
    </div>
  );

  return (
    <div className="text-white px-6 py-8 max-w-2xl mx-auto">
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

      {/* Attempt form */}
      {isOpen && !currentQuiz.is_overdue && renderAttempt()}

      {/* Overdue and pending */}
      {isOpen && currentQuiz.is_overdue && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 text-center text-rose-400 text-sm">
          This quiz is now overdue and can no longer be submitted.
        </div>
      )}
    </div>
  );
};

export default StudentQuizDetail;
