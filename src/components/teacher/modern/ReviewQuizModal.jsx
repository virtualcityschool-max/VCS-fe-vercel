import { useEffect, useState } from "react";
import { X, Award } from "lucide-react";
import { teacherService } from "../../../services/teacherService";
import { extractApiErrorMessage } from "../../../utils/apiErrorHandler";

// Teacher marks the written (TEXT_FORMAT) answers of one quiz submission.
// Choice questions were auto-marked by the backend at submit time and are shown read-only.
export const ReviewQuizModal = ({ submissionId, onClose, onGraded }) => {
  const [submission, setSubmission] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!submissionId) return;
    let cancelled = false;
    (async () => {
      try {
        const sub = await teacherService.getQuizSubmissionById(submissionId);
        if (cancelled) return;
        setSubmission(sub);
        const initial = {};
        (sub.answers || []).forEach((a) => {
          if (a.question_type === "TEXT_FORMAT") {
            initial[a.question_id] = a.obtained_marks ?? "";
          }
        });
        setMarks(initial);
        try {
          const q = await teacherService.getQuizById(sub.quiz);
          if (!cancelled) setQuiz(q);
        } catch {
          // option labels fall back to "Option N"
        }
      } catch (err) {
        if (!cancelled) setLoadError(extractApiErrorMessage(err) || "Could not load this submission.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [submissionId]);

  const answers = submission?.answers || [];
  const textAnswers = answers.filter((a) => a.question_type === "TEXT_FORMAT");
  const optionText = (questionId, optionId, position) => {
    const q = (quiz?.questions || []).find((x) => x.id === questionId);
    const opt = (q?.options || []).find((o) => o.id === optionId);
    return opt?.option_text || `Option ${position ?? optionId}`;
  };
  const correctText = (questionId) => {
    const q = (quiz?.questions || []).find((x) => x.id === questionId);
    return (q?.options || []).filter((o) => o.is_correct).map((o) => o.option_text).join(", ");
  };
  const tally = answers.reduce((sum, a) => {
    if (a.question_type === "TEXT_FORMAT") return sum + (Number(marks[a.question_id]) || 0);
    return sum + (Number(a.obtained_marks) || 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const grades = [];
    for (const a of textAnswers) {
      const v = marks[a.question_id];
      if (v === "" || v == null) continue;
      const n = Number(v);
      if (Number.isNaN(n) || n < 0 || n > a.max_marks) {
        setSaveError(`Marks for "${a.question_text}" must be between 0 and ${a.max_marks}.`);
        return;
      }
      grades.push({ question_id: a.question_id, marks: n });
    }
    if (grades.length === 0) {
      setSaveError("Enter marks for at least one written answer.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await teacherService.gradeQuizSubmission(submissionId, grades);
      onGraded?.(updated);
      onClose();
    } catch (err) {
      setSaveError(extractApiErrorMessage(err) || "Could not save the marks. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-[#1C233D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mark Quiz Submission</h3>
              <p className="text-xs text-slate-400">
                {submission ? `${submission.student_name} · ${submission.quiz_title}` : "Loading…"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loadError ? <div className="p-6 text-sm text-rose-300">{loadError}</div> : !submission ? <div className="p-6 text-sm text-slate-400">Loading submission…</div> : <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            <div className="p-4 rounded-xl bg-[#0B0E1A] border border-[#1A223B] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{submission.quiz_title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{submission.course_title}</div>
              </div>
              <div className="text-right">
                <div className="text-base font-extrabold font-mono text-emerald-400 tabular-nums">
                  {tally} / {submission.total_marks_snapshot}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total</div>
              </div>
            </div>

            <div className="space-y-4">
              {answers.map((a, idx) => {
                const isText = a.question_type === "TEXT_FORMAT";
                const chosen = (a.selected_option_ids || []).map((oid, i) => optionText(a.question_id, oid, a.selected_options?.[i]));
                return <div key={a.question_id} className="p-4 rounded-xl bg-[#0B0E1A] border border-[#1A223B] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            {isText ? "Written answer" : "Choice · auto-marked"}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">{a.question_text}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isText ? <input
                    type="number"
                    min={0}
                    max={a.max_marks}
                    step="0.5"
                    value={marks[a.question_id] ?? ""}
                    onChange={(e) => setMarks({ ...marks, [a.question_id]: e.target.value })}
                    className="w-16 px-2 py-1 rounded bg-[#121628] border border-[#1E2642] text-xs font-mono font-bold text-emerald-400 tabular-nums text-center"
                  /> : <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">{Number(a.obtained_marks) || 0}</span>}
                        <span className="text-xs text-slate-500">/ {a.max_marks}</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#121628] border border-[#1E2642] space-y-1">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Student's answer</div>
                      <div className="text-xs font-medium text-slate-100 whitespace-pre-wrap">
                        {isText ? a.text_answer || "No answer given" : chosen.length ? chosen.join(", ") : "No option selected"}
                      </div>
                    </div>
                    {!isText && quiz && <div className="text-[11px] text-slate-400">
                        <span className="text-slate-500">Correct answer:</span>{" "}
                        <span className="text-indigo-300">{correctText(a.question_id)}</span>
                      </div>}
                  </div>;
              })}
            </div>

            {saveError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{saveError}</div>}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A223B]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#161C30] text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              {textAnswers.length > 0 && <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                  {saving ? "Saving…" : `Release Marks (${tally}/${submission.total_marks_snapshot})`}
                </button>}
            </div>
          </form>}
      </div>
    </div>;
};
