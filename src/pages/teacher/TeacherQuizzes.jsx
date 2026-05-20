import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  fetchQuizSubmissions,
  fetchQuizSubmissionById,
  gradeQuizTextAnswers,
  fetchMyCourses,
  clearSelectedQuizSubmission,
} from "../../store/slices/teacherSlice";
import { teacherService } from "../../services/teacherService";
import { FilterSelect } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { toLocalDatetimeInput, formatTimezoneISO } from "../../utils/validation";
import { useDateFormatters } from "../../hooks";

// ── Helpers ───────────────────────────────────────────────────────────────────
const defaultOption = () => ({ option_text: "", is_correct: false });
const defaultQuestion = () => ({
  question_text: "",
  question_type: "SINGLE_CHOICE",
  max_marks: "",
  options: [defaultOption(), defaultOption(), defaultOption(), defaultOption()],
});

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE",   label: "Single Choice" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TEXT_FORMAT",     label: "Text / Essay" },
];

const statusColor = (status) => {
  if (status === "graded")      return "text-emerald-400 bg-emerald-500/10";
  if (status === "auto_graded") return "text-blue-400 bg-blue-500/10";
  if (status === "submitted")   return "text-amber-400 bg-amber-500/10";
  return "text-slate-400 bg-slate-500/10";
};

const statusLabel = (status) => {
  if (status === "graded")      return "Graded";
  if (status === "auto_graded") return "Auto Graded";
  if (status === "submitted")   return "Pending Grade";
  return status ?? "—";
};

// ── Question Builder ──────────────────────────────────────────────────────────
const QuestionBuilder = ({ questions, onChange }) => {
  const setQuestion = (idx, patch) =>
    onChange(questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  const setOption = (qIdx, oIdx, patch) => {
    const opts = questions[qIdx].options.map((o, i) => (i === oIdx ? { ...o, ...patch } : o));
    setQuestion(qIdx, { options: opts });
  };

  const pickSingle = (qIdx, oIdx) => {
    const opts = questions[qIdx].options.map((o, i) => ({ ...o, is_correct: i === oIdx }));
    setQuestion(qIdx, { options: opts });
  };

  const toggleMultiple = (qIdx, oIdx) => {
    const opts = questions[qIdx].options.map((o, i) =>
      i === oIdx ? { ...o, is_correct: !o.is_correct } : o
    );
    setQuestion(qIdx, { options: opts });
  };

  const changeType = (qIdx, newType) => {
    const q = questions[qIdx];
    if (newType === "TEXT_FORMAT") {
      setQuestion(qIdx, { question_type: newType, options: [] });
    } else if (q.question_type === "TEXT_FORMAT") {
      setQuestion(qIdx, {
        question_type: newType,
        options: [defaultOption(), defaultOption(), defaultOption(), defaultOption()],
      });
    } else {
      setQuestion(qIdx, { question_type: newType });
    }
  };

  const removeQuestion = (idx) => onChange(questions.filter((_, i) => i !== idx));

  const addQuestion = () => onChange([...questions, defaultQuestion()]);

  return (
    <div className="space-y-5">
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-slate-800/60 rounded-2xl border border-slate-700 p-4">
          {/* Question header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Question {qIdx + 1}
            </span>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(qIdx)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
              >
                <i className="fas fa-times text-xs" />
              </button>
            )}
          </div>

          {/* Question text */}
          <input
            type="text"
            placeholder="Question text"
            value={q.question_text}
            onChange={(e) => setQuestion(qIdx, { question_text: e.target.value })}
            className="w-full mb-3 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />

          {/* Type + Marks row */}
          <div className="flex gap-2 mb-3">
            <select
              value={q.question_type}
              onChange={(e) => changeType(qIdx, e.target.value)}
              className="flex-1 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              placeholder="Marks"
              value={q.max_marks}
              onChange={(e) => setQuestion(qIdx, { max_marks: e.target.value })}
              className="w-24 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Options */}
          {q.question_type === "SINGLE_CHOICE" && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Options — select 1 correct</p>
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`single-${qIdx}`}
                    checked={opt.is_correct}
                    onChange={() => pickSingle(qIdx, oIdx)}
                    className="accent-indigo-500 w-4 h-4 flex-shrink-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder={`Option ${oIdx + 1}`}
                    value={opt.option_text}
                    onChange={(e) => setOption(qIdx, oIdx, { option_text: e.target.value })}
                    className="flex-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>
              ))}
            </div>
          )}

          {q.question_type === "MULTIPLE_CHOICE" && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Options — check all correct</p>
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={opt.is_correct}
                    onChange={() => toggleMultiple(qIdx, oIdx)}
                    className="accent-indigo-500 w-4 h-4 flex-shrink-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder={`Option ${oIdx + 1}`}
                    value={opt.option_text}
                    onChange={(e) => setOption(qIdx, oIdx, { option_text: e.target.value })}
                    className="flex-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>
              ))}
            </div>
          )}

          {q.question_type === "TEXT_FORMAT" && (
            <p className="text-xs text-slate-500 italic">Students will write a text answer for this question.</p>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 text-sm font-semibold transition flex items-center justify-center gap-2"
      >
        <i className="fas fa-plus text-xs" />
        Add Question
      </button>
    </div>
  );
};

// ── Quiz form validation ──────────────────────────────────────────────────────
const validateQuizForm = (form, questions) => {
  if (!form.course)         return "Please select a course";
  if (!form.title.trim())   return "Title is required";
  if (!form.total_marks)    return "Total marks is required";
  if (!form.published_at)   return "Publish date is required";
  if (!form.due_date)       return "Due date is required";

  const now = new Date();
  const pub = new Date(form.published_at);
  const due = new Date(form.due_date);

  if (pub < new Date(Date.now() - 60 * 1000)) return "Publish date cannot be in the past";
  if (due <= pub)  return "Due date must be after publish date";

  if (!questions.length) return "Add at least one question";

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.question_text.trim()) return `Question ${i + 1}: text is required`;
    if (!q.max_marks || Number(q.max_marks) <= 0) return `Question ${i + 1}: marks must be > 0`;

    if (q.question_type === "SINGLE_CHOICE") {
      if (q.options.length !== 4) return `Question ${i + 1}: must have exactly 4 options`;
      if (q.options.some((o) => !o.option_text.trim())) return `Question ${i + 1}: all option texts required`;
      if (q.options.filter((o) => o.is_correct).length !== 1)
        return `Question ${i + 1}: must mark exactly 1 correct option`;
    }
    if (q.question_type === "MULTIPLE_CHOICE") {
      if (q.options.length !== 4) return `Question ${i + 1}: must have exactly 4 options`;
      if (q.options.some((o) => !o.option_text.trim())) return `Question ${i + 1}: all option texts required`;
      if (!q.options.some((o) => o.is_correct))
        return `Question ${i + 1}: must mark at least 1 correct option`;
    }
  }

  const sumMarks = questions.reduce((s, q) => s + Number(q.max_marks || 0), 0);
  if (sumMarks !== Number(form.total_marks))
    return `Total marks (${form.total_marks}) must equal sum of question marks (${sumMarks})`;

  return null;
};

// ── Build payload from form state ─────────────────────────────────────────────
const buildPayload = (form, questions, timezone) => ({
  course: Number(form.course),
  title: form.title.trim(),
  description: form.description.trim(),
  total_marks: Number(form.total_marks),
  published_at: form.published_at ? formatTimezoneISO(form.published_at, timezone) : "",
  due_date: form.due_date ? formatTimezoneISO(form.due_date, timezone) : "",
  questions: questions.map((q) => {
    const base = {
      ...(q.id ? { id: q.id } : {}),
      question_text: q.question_text.trim(),
      question_type: q.question_type,
      max_marks: Number(q.max_marks),
    };
    if (q.question_type !== "TEXT_FORMAT") {
      base.options = q.options.map((o) => ({
        ...(o.id ? { id: o.id } : {}),
        option_text: o.option_text.trim(),
        is_correct: o.is_correct,
      }));
    }
    return base;
  }),
});

// ── Populate form from quiz object (for edit) ─────────────────────────────────
const quizToForm = (quiz, timezone) => ({
  course: String(quiz.course ?? ""),
  title: quiz.title ?? "",
  description: quiz.description ?? "",
  total_marks: String(quiz.total_marks ?? ""),
  published_at: toLocalDatetimeInput(quiz.published_at, timezone),
  due_date: toLocalDatetimeInput(quiz.due_date, timezone),
});

const quizToQuestions = (quiz) =>
  (quiz.questions ?? []).map((q) => ({
    id: q.id,
    question_text: q.question_text ?? "",
    question_type: q.question_type ?? "SINGLE_CHOICE",
    max_marks: String(q.max_marks ?? ""),
    options: q.question_type === "TEXT_FORMAT"
      ? []
      : (q.options ?? []).map((o) => ({
          id: o.id,
          option_text: o.option_text ?? "",
          is_correct: o.is_correct ?? false,
        })),
  }));

// ── Main Component ────────────────────────────────────────────────────────────
const TeacherQuizzes = ({ 
  externalFilters, 
  onFiltersChange, 
  hideHeader = false,
  controlsContainerId 
}) => {
  const dispatch = useDispatch();
  const { formatDateTime, timezone } = useDateFormatters();
  const {
    quizzes,
    loadingQuizzes,
    myCourses,
    quizSubmissions,
    loadingQuizSubmissions,
    selectedQuizSubmission,
    loadingSelectedQuizSubmission,
  } = useSelector((s) => s.teachers);

  const [internalFilters, setInternalFilters] = useState({
    course: "",
  });

  const filterCourse = externalFilters?.course ?? internalFilters.course;
  const setFilterCourse = (val) => {
    if (onFiltersChange) {
      onFiltersChange((prev) => ({ ...prev, course: val }));
    } else {
      setInternalFilters({ course: val });
    }
  };

  // Modal state
  const [showCreate,  setShowCreate]  = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [viewQuiz,    setViewQuiz]    = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);
  const [submissionsQuiz, setSubmissionsQuiz] = useState(null);
  const [gradingSubId, setGradingSubId] = useState(null);
  const [gradeInputs, setGradeInputs] = useState({});
  const [saving, setSaving] = useState(false);

  // Create / Edit form state
  const emptyForm = { course: "", title: "", description: "", total_marks: "", published_at: "", due_date: "" };
  const [form, setForm]           = useState(emptyForm);
  const [questions, setQuestions] = useState([defaultQuestion()]);

  useEffect(() => {
    if (!myCourses?.length) dispatch(fetchMyCourses());
  }, [dispatch, myCourses?.length]);

  useEffect(() => {
    dispatch(fetchQuizzes(filterCourse ? { course: filterCourse } : {}));
  }, [dispatch, filterCourse]);

  const headerActions = (
    <>
      <FilterSelect
        value={filterCourse}
        onChange={(e) => setFilterCourse(e.target.value)}
      >
        <option value="">All Courses</option>
        {myCourses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </FilterSelect>
      <button
        type="button"
        onClick={() => { setShowCreate(true); setForm(emptyForm); setQuestions([defaultQuestion()]); }}
        className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap"
      >
        + Create Quiz
      </button>
    </>
  );

  const controlsContainer = controlsContainerId ? document.getElementById(controlsContainerId) : null;

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    const err = validateQuizForm(form, questions);
    if (err) { toastManager.error(err); return; }
    setSaving(true);
    try {
      await dispatch(createQuiz(buildPayload(form, questions, timezone))).unwrap();
      toastManager.success("Quiz created");
      setShowCreate(false);
      setForm(emptyForm);
      setQuestions([defaultQuestion()]);
    } catch (e) {
      // const msg = typeof e === "string" ? e : (e?.detail || e?.title?.[0] || e?.questions || JSON.stringify(e));
      // toastManager.error(msg || "Failed to create quiz");
      showApiError(e)
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = async (quiz) => {
    setEditTarget(quiz);
    setForm(quizToForm(quiz, timezone));
    setQuestions(quizToQuestions(quiz));
    try {
      const detail = await teacherService.getQuizById(quiz.id);
      setEditTarget(detail);
      setForm(quizToForm(detail, timezone));
      setQuestions(quizToQuestions(detail));
    } catch {
      toastManager.error("Failed to load quiz detail");
    }
  };

  const handleEdit = async () => {
    const err = validateQuizForm(form, questions);
    if (err) { toastManager.error(err); return; }
    setSaving(true);
    try {
      await dispatch(updateQuiz({ id: editTarget.id, data: buildPayload(form, questions, timezone) })).unwrap();
      toastManager.success("Quiz updated");
      setEditTarget(null);
    } catch (e) {
      showApiError(e)
      // const detail = e?.detail || (typeof e === "string" ? e : JSON.stringify(e));
      // toastManager.error(detail || "Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeletingId(deleteTarget.id);
    try {
      await dispatch(deleteQuiz(deleteTarget.id)).unwrap();
      toastManager.success("Quiz deleted");
      setDeleteTarget(null);
    } catch (e) {
      showApiError(e)
      // const detail = e?.detail || (typeof e === "string" ? e : JSON.stringify(e));
      // toastManager.error(detail || "Failed to delete quiz");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Submissions ───────────────────────────────────────────────────────────
  const openSubmissions = (quiz) => {
    setSubmissionsQuiz(quiz);
    dispatch(fetchQuizSubmissions(quiz.id));
  };

  const openGrading = (subId) => {
    setGradingSubId(subId);
    dispatch(clearSelectedQuizSubmission());
    dispatch(fetchQuizSubmissionById(subId));
    setGradeInputs({});
  };

  const handleGrade = async () => {
    if (!selectedQuizSubmission) return;
    const textQuestions = selectedQuizSubmission.answers?.filter(
      (a) => a.question_type === "TEXT_FORMAT"
    ) ?? [];

    const grades = [];
    for (const q of textQuestions) {
      const inputVal = gradeInputs[q.question_id];
      
      // Validation: Marks are compulsory
      if ((inputVal === undefined || inputVal === "") && q.obtained_marks === null) {
        toastManager.error("Please assign marks to all text questions before submitting.");
        return;
      }

      const marks = Number(inputVal ?? q.obtained_marks ?? 0);
      if (isNaN(marks) || marks < 0) {
        toastManager.error("Marks cannot be negative or invalid");
        return;
      }
      if (marks > (q.max_marks ?? 0)) {
        toastManager.error(`Marks for "${q.question_text.slice(0, 20)}..." cannot exceed ${q.max_marks}`);
        return;
      }

      grades.push({
        question_id: q.question_id,
        marks,
      });
    }

    setSaving(true);
    try {
      await dispatch(gradeQuizTextAnswers({ submissionId: selectedQuizSubmission.id, grades })).unwrap();
      toastManager.success("Submission graded");
      
      setGradingSubId(null);
    } catch (e) {
      
    } finally {
      if (submissionsQuiz) dispatch(fetchQuizSubmissions(submissionsQuiz.id));
      setSaving(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderQuizForm = (onSubmit, isEdit = false) => (
    <div className="space-y-10">
      {/* Basic Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          {!isEdit && (
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                Course <span className="text-rose-500">*</span>
              </label>
              <FilterSelect
                value={form.course}
                onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))}
                className="w-full"
              >
                <option value="">Select Course</option>
                {myCourses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </FilterSelect>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
              Quiz Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter a descriptive title for this quiz"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
              Description <span className="text-slate-600 normal-case tracking-normal font-medium ml-1">(Optional)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Briefly describe the purpose or topics covered in this quiz..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
              Total Marks <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              placeholder="e.g. 50"
              value={form.total_marks}
              onChange={(e) => setForm((p) => ({ ...p, total_marks: e.target.value }))}
              className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                Publish At <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => setForm((p) => ({ ...p, published_at: e.target.value }))}
                className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.due_date}
                onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
                className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Builder Section */}
      <div className="pt-10 border-t border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <i className="fas fa-list-ol text-lg" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Question Builder</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Construct your quiz questions below</p>
          </div>
        </div>
        <QuestionBuilder questions={questions} onChange={setQuestions} />
      </div>

      {/* Footer Actions */}
      <div className="flex gap-4 justify-end pt-10 border-t border-white/5">
        <button
          type="button"
          onClick={() => { setShowCreate(false); setEditTarget(null); setForm(emptyForm); setQuestions([defaultQuestion()]); }}
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onSubmit}
          className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          {saving ? (
            <><i className="fas fa-spinner animate-spin text-xs" /> Processing…</>
          ) : (
            isEdit ? "Save Changes" : "Create Quiz"
          )}
        </button>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div>
      {controlsContainer && ReactDOM.createPortal(headerActions, controlsContainer)}

      {!hideHeader && (
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-poppins mb-2">My Quizzes</h1>
            <p className="text-slate-400 text-sm">Review Quizzes and move into grading workflows.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <FilterSelect
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {myCourses?.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </FilterSelect>
            <button
              type="button"
              onClick={() => { setShowCreate(true); setForm(emptyForm); setQuestions([defaultQuestion()]); }}
              className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap"
            >
              + Create Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz list */}
      {loadingQuizzes && !quizzes?.length ? (
        <div className="flex items-center justify-center py-16 text-white">
          <i className="fas fa-spinner animate-spin text-2xl" />
        </div>
      ) : quizzes?.length ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="group relative glass p-6 rounded-[2rem] border-slate-800/60 hover:border-indigo-500/50 hover-lift transition-all duration-500 overflow-hidden flex flex-col h-full"
          >
            {/* Subtle gradient accent on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />

            {/* Card Header: Badges and Action Icons */}
            <div className="relative z-10 flex justify-between items-start mb-5">
              <div className="flex flex-col gap-2">
                {/* <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit ${
                  quiz.is_locked
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : quiz.is_published
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                }`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${quiz.is_published && !quiz.is_locked ? "bg-emerald-400 animate-pulse" : quiz.is_locked ? "bg-rose-400" : "bg-slate-400"}`}></span>
                  {quiz.is_locked ? "Locked" : quiz.is_published ? "Published" : "Draft"}
                </span> */}
                <p className="text-[9px] text-indigo-400/80 uppercase tracking-[0.2em] font-black">
                  {quiz.course_title}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="View quiz"
                  onClick={async () => {
                    setViewQuiz(quiz);
                    try {
                      const detail = await teacherService.getQuizById(quiz.id);
                      setViewQuiz(detail);
                    } catch {
                      toastManager.error("Failed to load quiz detail");
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-700/50 hover:border-indigo-500 transition-all duration-300"
                >
                  <i className="fas fa-eye text-[10px]" />
                </button>
                <button
                  type="button"
                  title="Edit quiz"
                  onClick={() => openEdit(quiz)}
                  disabled={quiz.is_locked}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-amber-600 text-slate-400 hover:text-white border border-slate-700/50 hover:border-amber-500 transition-all duration-300 disabled:opacity-40"
                >
                  <i className="fas fa-pencil text-[10px]" />
                </button>
                <button
                  type="button"
                  title="Delete quiz"
                  onClick={() => setDeleteTarget(quiz)}
                  disabled={quiz.is_locked}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700/50 hover:border-rose-500 transition-all duration-300 disabled:opacity-40"
                >
                  <i className="fas fa-trash text-[10px]" />
                </button>
              </div>
            </div>

            {/* Card Body: Title & Stats */}
            <div className="relative z-10 mb-auto">
              <h2 className="text-lg font-bold text-white mb-4 group-hover:text-indigo-200 transition-colors line-clamp-2">
                {quiz.title}
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-3 flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Submissions</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-indigo-400">{quiz.submissions_count ?? 0}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Students</span>
                  </div>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-3 flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Marks</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-amber-400">{quiz.total_marks}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer: Due Date & Action */}
            <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/50">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800/50 flex items-center justify-center text-rose-400/70 border border-slate-700/50">
                    <i className="far fa-calendar-alt text-xs" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Deadline</span>
                    <span className="text-xs text-slate-300 font-bold">
                      {quiz.due_date ? formatDateTime(quiz.due_date) : "No limit"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group/btn"
                onClick={() => openSubmissions(quiz)}
              >
                <i className="fas fa-tasks text-xs transition-transform group-hover/btn:scale-110" />
                View Submissions
              </button>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-400 text-sm">
          No quizzes found. Create your first quiz above.
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col gap-1 mb-10 pb-6 border-b border-white/5 relative">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white tracking-tight">Create New Quiz</h3>
                <button
                  onClick={() => { setShowCreate(false); setForm(emptyForm); setQuestions([defaultQuestion()]); }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
              <p className="text-slate-500 text-[13px] font-medium leading-relaxed max-w-2xl">
                Initialize a new evaluation quiz by setting its basic parameters and building the question set.
              </p>
            </div>
            <div>{renderQuizForm(handleCreate, false)}</div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col gap-1 mb-10 pb-6 border-b border-white/5 relative">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Edit Quiz</h3>
                  <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">{editTarget.course_title}</p>
                </div>
                <button
                  onClick={() => { setEditTarget(null); setForm(emptyForm); setQuestions([defaultQuestion()]); }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
            </div>
            <div>{renderQuizForm(handleEdit, true)}</div>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ── */}
      {viewQuiz && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="font-bold text-white text-sm">Quiz Details</h2>
              <button
                onClick={() => setViewQuiz(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Title</p>
                <p className="text-white font-semibold">{viewQuiz.title}</p>
              </div>
              {viewQuiz.description && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Description</p>
                  <p className="text-slate-300 text-sm">{viewQuiz.description}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/60 rounded-2xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Marks</p>
                  <p className="text-white font-bold">{viewQuiz.total_marks}</p>
                </div>
                <div className="bg-slate-800/60 rounded-2xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Submissions</p>
                  <p className="text-white font-bold">{viewQuiz.submissions_count ?? 0}</p>
                </div>
                <div className="bg-slate-800/60 rounded-2xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <p className={`text-xs font-bold ${viewQuiz.is_locked ? "text-rose-400" : viewQuiz.is_published ? "text-emerald-400" : "text-slate-400"}`}>
                    {viewQuiz.is_locked ? "Locked" : viewQuiz.is_published ? "Published" : "Draft"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Publish Date</p>
                  <p className="text-slate-300 text-sm">{formatDateTime(viewQuiz.published_at)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Due Date</p>
                  <p className="text-slate-300 text-sm">{formatDateTime(viewQuiz.due_date)}</p>
                </div>
              </div>
              {/* Questions preview */}
              {viewQuiz.questions?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">Questions ({viewQuiz.questions.length})</p>
                  <div className="space-y-3">
                    {viewQuiz.questions.map((q, idx) => (
                      <div key={q.id} className="bg-slate-800/60 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm text-white font-medium">{idx + 1}. {q.question_text}</p>
                          <span className="text-[10px] text-slate-500 flex-shrink-0">{q.max_marks} marks</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-indigo-400">{q.question_type.replace("_", " ")}</span>
                        {q.options?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {q.options.map((o) => (
                              <div key={o.id} className={`flex items-center gap-2 text-xs ${o.is_correct ? "text-emerald-400" : "text-slate-400"}`}>
                                <i className={`fas fa-${o.is_correct ? "check-circle" : "circle"} text-[10px]`} />
                                {o.option_text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-trash text-rose-400 text-sm" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Delete Quiz</h3>
                <p className="text-slate-400 text-xs mt-0.5">This cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              Delete <span className="font-semibold text-white">"{deleteTarget.title}"</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={!!deletingId}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!deletingId}
                onClick={handleDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl text-sm font-semibold transition flex items-center gap-2"
              >
                {deletingId && <i className="fas fa-spinner animate-spin text-xs" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMISSIONS MODAL ── */}
      {submissionsQuiz && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
              <h2 className="font-bold text-white text-sm">Submissions: {submissionsQuiz.title}</h2>
              <button
                onClick={() => setSubmissionsQuiz(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingQuizSubmissions ? (
                <div className="flex items-center justify-center py-8">
                  <i className="fas fa-spinner animate-spin text-white text-xl" />
                </div>
              ) : quizSubmissions?.length ? (
                <div className="space-y-3">
                  {quizSubmissions.map((sub) => (
                    <div key={sub.id} className="bg-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{sub.student_name}</p>
                          {sub.student_id && (
                            <span className="text-[10px] text-slate-500 bg-slate-700 border border-slate-600 px-1.5 py-0.5 rounded font-bold">
                              #{sub.student_id}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {sub.obtained_marks != null ? `${sub.obtained_marks} / ${sub.total_marks_snapshot}` : "Not graded"}
                          {sub.percentage != null ? ` (${sub.percentage}%)` : ""}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(sub.submitted_at)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColor(sub.status)}`}>
                          {statusLabel(sub.status)}
                        </span>
                        <button
                          type="button"
                          onClick={() => openGrading(sub.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            sub.status === "submitted"
                              ? "bg-indigo-600 hover:bg-indigo-500"
                              : "bg-slate-700 hover:bg-slate-600"
                          }`}
                        >
                          {sub.status === "submitted" ? "Grade" : "View"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">No submissions yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── GRADING / VIEW SUBMISSION MODAL ── */}
      {gradingSubId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
              <h2 className="font-bold text-white text-sm">
                {selectedQuizSubmission ? `Submission — ${selectedQuizSubmission.student_name}` : "Loading…"}
              </h2>
              <button
                onClick={() => { setGradingSubId(null); dispatch(clearSelectedQuizSubmission()); }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingSelectedQuizSubmission ? (
                <div className="flex items-center justify-center py-8">
                  <i className="fas fa-spinner animate-spin text-white text-xl" />
                </div>
              ) : selectedQuizSubmission ? (
                <div className="space-y-5">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/60 rounded-2xl p-3">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Score</p>
                      <p className="text-white font-bold">
                        {selectedQuizSubmission.obtained_marks != null ? selectedQuizSubmission.obtained_marks : "—"} / {selectedQuizSubmission.total_marks_snapshot}
                      </p>
                    </div>
                    <div className="bg-slate-800/60 rounded-2xl p-3">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">%</p>
                      <p className="text-white font-bold">{selectedQuizSubmission.percentage != null ? `${selectedQuizSubmission.percentage}%` : "—"}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-2xl p-3">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Status</p>
                      <p className={`text-xs font-bold ${statusColor(selectedQuizSubmission.status).split(" ")[0]}`}>
                        {statusLabel(selectedQuizSubmission.status)}
                      </p>
                    </div>
                  </div>

                  {/* Answers */}
                  {selectedQuizSubmission.answers?.map((ans, idx) => (
                    <div key={ans.question_id} className="bg-slate-800/60 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-white">{idx + 1}. {ans.question_text}</p>
                        <span className="text-[10px] text-slate-500 flex-shrink-0">{ans.max_marks} marks</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-indigo-400 mb-3 block">
                        {ans.question_type?.replace("_", " ")}
                      </span>

                      {ans.question_type === "TEXT_FORMAT" ? (
                        <div>
                          <div className="bg-slate-800 rounded-xl p-3 text-sm text-slate-300 mb-3 min-h-[60px]">
                            {ans.text_answer || <span className="text-slate-500 italic">No answer</span>}
                          </div>
                          {selectedQuizSubmission.status !== "auto_graded" ? (
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-black mb-1.5 block">
                                {selectedQuizSubmission.status === "submitted" ? "Assign Marks" : "Edit Marks"}{" "}
                                <span className="text-rose-500">*</span>{" "}
                                <span className="text-slate-600 font-normal">(Total {ans.max_marks})</span>
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={ans.max_marks}
                                value={gradeInputs[ans.question_id] ?? (ans.obtained_marks ?? "")}
                                onKeyDown={(e) => {
                                  if (["e", "E", "-", "+"].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val !== "" && parseFloat(val) < 0) return;
                                  setGradeInputs((p) => ({ ...p, [ans.question_id]: val }));
                                }}
                                className="w-24 p-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              />
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">
                              Marks: <span className="text-white font-semibold">{ans.obtained_marks ?? "—"}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Selected options: {ans.selected_options?.join(", ") || "none"}</p>
                          <p className="text-xs text-slate-400">
                            Marks: <span className={`font-semibold ${ans.obtained_marks > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {ans.obtained_marks ?? "—"} / {ans.max_marks}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Grade / Re-grade button */}
                  {selectedQuizSubmission.status !== "auto_graded" && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleGrade}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                    >
                      {saving && <i className="fas fa-spinner animate-spin text-xs" />}
                      {selectedQuizSubmission.status === "submitted" ? "Submit Grades" : "Save Grades"}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizzes;
