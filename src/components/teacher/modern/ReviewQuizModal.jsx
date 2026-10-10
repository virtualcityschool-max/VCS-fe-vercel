import { useState } from "react";
import {
  X,
  Award
} from "lucide-react";
export const ReviewQuizModal = ({
  quiz,
  submission,
  isOpen,
  onClose,
  onSaveMarking
}) => {
  const [scores, setScores] = useState(() => {
    const map = {};
    if (quiz?.questions && submission?.answers) {
      quiz.questions.forEach((q) => {
        const existing = submission.answers.find((a) => a.questionId === q.id);
        map[q.id] = existing?.scoreAwarded ?? q.marks;
      });
    }
    return map;
  });
  const [comments, setComments] = useState(() => {
    const map = {};
    if (quiz?.questions && submission?.answers) {
      quiz.questions.forEach((q) => {
        const existing = submission.answers.find((a) => a.questionId === q.id);
        map[q.id] = existing?.teacherComment ?? "";
      });
    }
    return map;
  });
  const [overallFeedback, setOverallFeedback] = useState(
    submission?.overallFeedback || "Commendable effort; review specific question annotations."
  );

  if (!isOpen || !quiz || !submission) return null;

  const totalCalculated = Object.values(scores).reduce((a, b) => a + Number(b || 0), 0);
  const handleSubmit = (e) => {
    e.preventDefault();
    const graded = quiz.questions.map((q) => ({
      questionId: q.id,
      scoreAwarded: scores[q.id] ?? 0,
      teacherComment: comments[q.id] ?? ""
    }));
    onSaveMarking(quiz.id, submission.id, graded, overallFeedback);
    onClose();
  };
  return <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-[#1C233D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Review & Mark Quiz Submission</h3>
              <p className="text-xs text-slate-400">
                {submission.studentName} ({submission.studentRoll}) · Submitted {submission.submittedAt}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {
    /* Header Summary */
  }
          <div className="p-4 rounded-xl bg-[#0B0E1A] border border-[#1A223B] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">{quiz.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{quiz.courseTitle}</div>
            </div>
            <div className="text-right">
              <div className="text-base font-extrabold font-mono text-emerald-400 tabular-nums">
                {totalCalculated} / {quiz.marks} Marks
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Score Tally
              </div>
            </div>
          </div>

          {
    /* Question-by-Question Grading */
  }
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => {
    const studentAnswer = submission.answers.find((a) => a.questionId === q.id)?.studentAnswer || "No response recorded";
    const isMatch = q.correctAnswer && studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    return <div
      key={q.id}
      className="p-4 rounded-xl bg-[#0B0E1A] border border-[#1A223B] space-y-3"
    >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          {q.type.replace("_", " ")}
                        </span>
                        {q.correctAnswer && <span
      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${isMatch ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}
    >
                            {isMatch ? "Match" : "Check"}
                          </span>}
                      </div>
                      <div className="text-xs font-bold text-white">{q.questionText}</div>
                    </div>

                    {
      /* Marks Input */
    }
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-slate-400">Award:</span>
                      <input
      type="number"
      min={0}
      max={q.marks}
      value={scores[q.id] ?? 0}
      onChange={(e) => setScores({
        ...scores,
        [q.id]: Math.min(q.marks, Math.max(0, Number(e.target.value)))
      })}
      className="w-14 px-2 py-1 rounded bg-[#121628] border border-[#1E2642] text-xs font-mono font-bold text-emerald-400 tabular-nums text-center"
    />
                      <span className="text-xs text-slate-500">/ {q.marks}</span>
                    </div>
                  </div>

                  {
      /* Student's Answer */
    }
                  <div className="p-2.5 rounded-lg bg-[#121628] border border-[#1E2642] space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">
                      Student's Answer:
                    </div>
                    <div className="text-xs font-medium text-slate-100">{studentAnswer}</div>
                  </div>

                  {
      /* Model Answer / Correct Answer */
    }
                  {q.correctAnswer && <div className="text-[11px] text-slate-400">
                      <span className="text-slate-500">Benchmark Key:</span>{" "}
                      <span className="text-indigo-300 font-mono">{q.correctAnswer}</span>
                    </div>}

                  {
      /* Teacher Feedback Annotation */
    }
                  <div>
                    <input
      type="text"
      value={comments[q.id] ?? ""}
      onChange={(e) => setComments({ ...comments, [q.id]: e.target.value })}
      placeholder="Add teacher note or reason for mark deduction..."
      className="w-full px-3 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
    />
                  </div>
                </div>;
  })}
          </div>

          {
    /* Overall Written Feedback */
  }
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Overall Student Feedback
            </label>
            <textarea
    rows={2}
    value={overallFeedback}
    onChange={(e) => setOverallFeedback(e.target.value)}
    placeholder="Summary notes on student performance..."
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A223B]">
            <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 rounded-xl bg-[#161C30] text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
  >
              Cancel
            </button>
            <button
    type="submit"
    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg cursor-pointer"
  >
              Finalize & Release Score ({totalCalculated}/{quiz.marks})
            </button>
          </div>
        </form>
      </div>
    </div>;
};
