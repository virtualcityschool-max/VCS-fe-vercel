import { useEffect, useState } from "react";
import {
  X,
  Trash2,
  Clock,
  Calendar,
  Award,
  CheckCircle2,
  FileText,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Code,
  FileUp,
  RotateCcw
} from "lucide-react";
import { toastManager } from "../../../utils/toastManager";
import { defaultQuizMarks } from "../../../utils/quizDefaults";
import { extractApiErrorMessage } from "../../../utils/apiErrorHandler";
const pad2 = (n) => String(n).padStart(2, "0");
const localDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const localDateTimeStr = (d) => `${localDateStr(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

// Same, but on the clock of the teacher's workspace timezone (the one the entered times are saved in)
const zonedDateTimeStr = (d, timeZone) => {
  if (!timeZone) return localDateTimeStr(d);
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(d);
    const get = (type) => parts.find((p) => p.type === type)?.value;
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
  } catch {
    return localDateTimeStr(d);
  }
};

export const CreateAssignmentModal = ({
  isOpen,
  onClose,
  courses,
  onCreateAssignment
}) => {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => localDateStr(new Date(Date.now() + 7 * 86400000)));
  const [dueTime, setDueTime] = useState("23:59");
  const [maxMarks, setMaxMarks] = useState(20);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  if (!isOpen) return null;
  const selectedCourseId = courseId || courses[0]?.id || "";
  const reset = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setMaxMarks(20);
    setDueDate(localDateStr(new Date(Date.now() + 7 * 86400000)));
    setDueTime("23:59");
    setFormError(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError("Please enter a title and the task instructions.");
      return;
    }
    if (!selectedCourseId) {
      setFormError("You have no course to assign this to.");
      return;
    }
    if (!(Number(maxMarks) > 0)) {
      setFormError("Max marks must be more than 0.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await onCreateAssignment({
        title: title.trim(),
        courseId: selectedCourseId,
        description: description.trim(),
        dueDate,
        dueTime,
        maxMarks: Number(maxMarks),
        file
      });
      reset();
      onClose();
    } catch (err) {
      setFormError(extractApiErrorMessage(err) || "Could not publish the assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 border-b border-[#1C233D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create & Issue Assignment</h3>
              <p className="text-xs text-slate-400">
                Students see it straight away and can answer in text or upload a file.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {formError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Assignment Title <span className="text-rose-400">*</span>
              </label>
              <input
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Solve Chapter 3 Exercises 12 to 14"
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Course
              </label>
              <select
    value={selectedCourseId}
    onChange={(e) => setCourseId(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 focus:outline-none cursor-pointer"
  >
                {courses.length === 0 && <option value="">No courses assigned</option>}
                {courses.map((c) => <option key={c.id} value={c.id}>
                    {c.title}
                  </option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Instructions <span className="text-rose-400">*</span>
            </label>
            <textarea
    rows={4}
    required
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder='e.g. "Read pages 14–16 and solve questions 3 & 4. Type your answer or upload a photo of your notebook."'
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0E1A] border border-[#1A223B] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>Attach worksheet / prompt (optional)</span>
            </div>
            <div className="flex items-center gap-2">
              {file && <button
    type="button"
    onClick={() => setFile(null)}
    className="text-[11px] text-slate-400 hover:text-rose-300 cursor-pointer"
  >
                  Remove
                </button>}
              <label className="px-3 py-1 rounded-lg bg-[#182038] hover:bg-[#202B4C] text-xs font-semibold text-slate-200 border border-[#273254] cursor-pointer max-w-[220px] truncate">
                <span>{file ? file.name : "Choose File"}</span>
                <input
    type="file"
    className="hidden"
    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.txt,.zip"
    onChange={(e) => setFile(e.target.files?.[0] || null)}
  />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#0B0E1A] border border-[#1A223B] space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Submission Deadline</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
    type="date"
    required
    value={dueDate}
    min={localDateStr(new Date())}
    onChange={(e) => setDueDate(e.target.value)}
    className="px-2.5 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-white [color-scheme:dark]"
  />
                <input
    type="time"
    required
    value={dueTime}
    onChange={(e) => setDueTime(e.target.value)}
    className="px-2.5 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs font-mono text-white [color-scheme:dark]"
  />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Marks
              </label>
              <input
    type="number"
    min={1}
    max={1000}
    value={maxMarks}
    onChange={(e) => setMaxMarks(e.target.value)}
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs font-mono font-bold text-white tabular-nums"
  />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A223B]">
            <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 rounded-xl bg-[#161C30] text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
  >
              Cancel
            </button>
            <button
    type="submit"
    disabled={isSubmitting}
    className="px-5 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] disabled:opacity-60 text-xs font-bold text-white shadow-lg cursor-pointer"
  >
              {isSubmitting ? "Publishing…" : "Publish Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>;
};
const createBlankQuestion = (type = "multiple_choice") => {
  const id = `q-new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  if (type === "yes_no") {
    return {
      id,
      type: "yes_no",
      questionText: "",
      options: ["Yes", "No"],
      correctAnswer: "",
      marks: defaultQuizMarks(),
    };
  }
  if (type === "fill_in_blank") {
    return {
      id,
      type: "fill_in_blank",
      questionText: "",
      options: [],
      correctAnswer: "",
      marks: defaultQuizMarks(),
    };
  }
  if (type === "short_answer") {
    return {
      id,
      type: "short_answer",
      questionText: "",
      options: [],
      correctAnswer: "",
      marks: defaultQuizMarks(),
    };
  }
  return {
    id,
    type: "multiple_choice",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: defaultQuizMarks(),
  };
};

const SAMPLE_QUIZ_QUESTIONS = [
  {
    id: "sample-1",
    type: "multiple_choice",
    questionText: "What is the SI unit of electric capacitance?",
    options: ["Henry", "Farad", "Coulomb", "Weber"],
    correctAnswer: "Farad",
    marks: 5,
  },
  {
    id: "sample-2",
    type: "yes_no",
    questionText: "Is kinetic energy conserved during an inelastic collision?",
    options: ["Yes", "No"],
    correctAnswer: "No",
    marks: 5,
  },
  {
    id: "sample-3",
    type: "fill_in_blank",
    questionText: "The derivative of sin(2x) with respect to x is ____.",
    options: [],
    correctAnswer: "2cos(2x)",
    marks: 5,
  },
  {
    id: "sample-4",
    type: "short_answer",
    questionText: "Define Lenz\u2019s Law and explain how it relates to conservation of energy.",
    options: [],
    correctAnswer: "The direction of induced current opposes the change in magnetic flux that produces it.",
    marks: 10,
  },
];

export const AdvancedQuizBuilderModal = ({
  isOpen,
  onClose,
  courses,
  onSaveQuiz,
  timezone
}) => {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [launchDateTime, setLaunchDateTime] = useState(() => localDateTimeStr(new Date()));
  const [dueDateTime, setDueDateTime] = useState(() => localDateTimeStr(new Date(Date.now() + 7 * 86400000)));
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [datesEdited, setDatesEdited] = useState(false);
  const [questions, setQuestions] = useState(() => [createBlankQuestion("multiple_choice")]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  const [bulkImportMode, setBulkImportMode] = useState("csv");
  const [importAppendMode, setImportAppendMode] = useState("append");
  const [bulkImportError, setBulkImportError] = useState(null);
  const [bulkImportSuccess, setBulkImportSuccess] = useState(null);
  // Until the teacher picks dates, "launch" means now, on the workspace clock, each time the form opens
  useEffect(() => {
    if (!isOpen || datesEdited) return;
    setLaunchDateTime(zonedDateTimeStr(new Date(), timezone));
    setDueDateTime(zonedDateTimeStr(new Date(Date.now() + 7 * 86400000), timezone));
  }, [isOpen, datesEdited, timezone]);

  if (!isOpen) return null;
  const selectedCourseId = courseId || courses[0]?.id || "";
  const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
  const CSV_SAMPLE = `type,questionText,marks,options,correctAnswer
multiple_choice,"What is Newton's third law of motion?",5,"F=ma|For every action there is an equal and opposite reaction|v=u+at|E=mc^2","For every action there is an equal and opposite reaction"
yes_no,"Is absolute zero equivalent to 0 Kelvin?",5,"","Yes"
fill_in_blank,"The unit of electrical resistance is the ____.",5,"","Ohm"
short_answer,"State Bernoulli's principle for steady fluid flow.",10,"","As fluid speed increases, internal static pressure decreases simultaneously."
multiple_choice,"Which electromagnetic radiation has the highest frequency?",5,"Radio waves|Microwaves|Gamma rays|Infrared","Gamma rays"`;
  const JSON_SAMPLE = JSON.stringify(
    [
      {
        type: "multiple_choice",
        questionText: "What is the speed of light in a vacuum?",
        marks: 5,
        options: ["3 x 10^8 m/s", "1.5 x 10^6 m/s", "3 x 10^5 km/h", "Infinite"],
        correctAnswer: "3 x 10^8 m/s"
      },
      {
        type: "yes_no",
        questionText: "Does light require a physical medium to propagate?",
        marks: 5,
        correctAnswer: "No"
      },
      {
        type: "fill_in_blank",
        questionText: "The process of splitting a heavy atomic nucleus is nuclear ____.",
        marks: 5,
        correctAnswer: "fission"
      },
      {
        type: "short_answer",
        questionText: "Explain how total internal reflection occurs in optical fibers.",
        marks: 10,
        correctAnswer: "Light strikes the core-cladding boundary at an angle of incidence greater than the critical angle."
      }
    ],
    null,
    2
  );
  const handleDownloadSample = (format) => {
    const content = format === "csv" ? CSV_SAMPLE : JSON_SAMPLE;
    const mime = format === "csv" ? "text/csv;charset=utf-8;" : "application/json;charset=utf-8;";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `quiz_questions_template.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isJson = file.name.endsWith(".json");
    setBulkImportMode(isJson ? "json" : "csv");
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      setBulkImportText(text || "");
      setBulkImportError(null);
    };
    reader.readAsText(file);
  };
  const parseCsvQuestions = (text) => {
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) throw new Error("File is empty.");
    const parsedQuestions = [];
    const startIndex = lines[0].toLowerCase().startsWith("type") ? 1 : 0;
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const parts = [];
      let current = "";
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          parts.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      parts.push(current.trim());
      if (parts.length < 2) continue;
      const rawType = parts[0].toLowerCase().replace(/[\s-]/g, "_");
      let type = "multiple_choice";
      if (rawType.includes("yes") || rawType.includes("no")) type = "yes_no";
      else if (rawType.includes("blank") || rawType.includes("fill")) type = "fill_in_blank";
      else if (rawType.includes("short") || rawType.includes("essay") || rawType.includes("write")) type = "short_answer";
      else type = "multiple_choice";
      const questionText = parts[1]?.replace(/^["']|["']$/g, "").trim();
      if (!questionText) continue;
      const marks = parts[2] && !isNaN(Number(parts[2])) ? Number(parts[2]) : defaultQuizMarks();
      const optionsRaw = parts[3]?.replace(/^["']|["']$/g, "").trim() || "";
      const options = type === "multiple_choice" ? optionsRaw ? optionsRaw.split("|").map((o) => o.trim()).filter(Boolean) : ["Option A", "Option B", "Option C", "Option D"] : void 0;
      const correctAnswer = parts[4]?.replace(/^["']|["']$/g, "").trim() || (type === "yes_no" ? "Yes" : "");
      parsedQuestions.push({
        id: `q-bulk-${Date.now()}-${i}`,
        type,
        questionText,
        marks,
        options,
        correctAnswer
      });
    }
    if (parsedQuestions.length === 0) {
      throw new Error("No valid questions parsed from CSV. Please check formatting.");
    }
    return parsedQuestions;
  };
  const parseJsonQuestions = (text) => {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON format. Please verify brackets, quotes, and commas.");
    }
    const items = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("JSON must contain an array of question objects.");
    }
    const parsedQuestions = items.map((item, idx) => {
      let rawType = String(item.type || "multiple_choice").toLowerCase().replace(/[\s-]/g, "_");
      let type = "multiple_choice";
      if (rawType.includes("yes") || rawType.includes("no")) type = "yes_no";
      else if (rawType.includes("blank") || rawType.includes("fill")) type = "fill_in_blank";
      else if (rawType.includes("short") || rawType.includes("essay") || rawType.includes("write")) type = "short_answer";
      else type = "multiple_choice";
      const questionText = item.questionText || item.question || item.prompt || `Question ${idx + 1}`;
      const marks = typeof item.marks === "number" ? item.marks : defaultQuizMarks();
      const options = type === "multiple_choice" ? Array.isArray(item.options) && item.options.length > 0 ? item.options.map(String) : ["Option A", "Option B", "Option C", "Option D"] : void 0;
      const correctAnswer = item.correctAnswer || item.answer || (type === "yes_no" ? "Yes" : "");
      return {
        id: `q-bulk-json-${Date.now()}-${idx}`,
        type,
        questionText,
        marks,
        options,
        correctAnswer
      };
    });
    return parsedQuestions;
  };
  const handleApplyBulkImport = () => {
    setBulkImportError(null);
    try {
      if (!bulkImportText.trim()) {
        throw new Error("Please paste your CSV/JSON content or upload a file.");
      }
      const imported = bulkImportMode === "json" ? parseJsonQuestions(bulkImportText) : parseCsvQuestions(bulkImportText);
      if (importAppendMode === "replace") {
        setQuestions(imported);
      } else {
        setQuestions((prev) => [...prev, ...imported]);
      }
      setBulkImportSuccess(`Successfully imported ${imported.length} question(s)!`);
      setTimeout(() => {
        setBulkImportSuccess(null);
        setShowBulkImportModal(false);
        setBulkImportText("");
      }, 1200);
    } catch (err) {
      setBulkImportError(err.message || "Error parsing imported questions.");
    }
  };
  const handleResetForm = () => {
    setTitle("");
    setDescription("");
    setLaunchDateTime(zonedDateTimeStr(new Date(), timezone));
    setDueDateTime(zonedDateTimeStr(new Date(Date.now() + 7 * 86400000), timezone));
    setDatesEdited(false);
    setDurationMinutes("30");
    setQuestions([createBlankQuestion("multiple_choice")]);
    setFormError(null);
  };

  const handleLoadSample = () => {
    setTitle("Cambridge Physics Paper 2 Diagnostic Mock");
    setDescription("Diagnostic assessment with multiple question formats.");
    setQuestions(SAMPLE_QUIZ_QUESTIONS);
    setFormError(null);
    toastManager.info("Sample questions loaded");
  };

  const handleAddQuestion = (type) => {
    setQuestions((prev) => [...prev, createBlankQuestion(type)]);
  };

  const handleRemoveQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, updates) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const updateOption = (qId, oIdx, newVal) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const oldVal = q.options[oIdx];
        const newOpts = [...q.options];
        newOpts[oIdx] = newVal;
        return {
          ...q,
          options: newOpts,
          correctAnswer: q.correctAnswer === oldVal ? newVal : q.correctAnswer,
        };
      })
    );
  };

  const validateQuiz = () => {
    if (!title.trim()) return "Please enter a quiz title.";
    if (!questions.length) return "Please add at least one question to the quiz.";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = i + 1;
      if (!q.questionText?.trim()) {
        return `Question ${qNum}: Question text is required.`;
      }
      if (!q.marks || Number(q.marks) <= 0) {
        return `Question ${qNum}: Marks must be a positive number.`;
      }

      if (q.type === "multiple_choice") {
        if (!q.options || q.options.length < 2) {
          return `Question ${qNum}: Multiple choice question must have at least 2 options.`;
        }
        if (q.options.some((o) => !o.trim())) {
          return `Question ${qNum}: All option text fields must be filled in.`;
        }
        const hasCorrect = q.options.some((o) => o && o.trim() === (q.correctAnswer || "").trim());
        if (!q.correctAnswer || !hasCorrect) {
          return `Question ${qNum}: Please select a correct answer from the options.`;
        }
      }

      if (q.type === "yes_no") {
        const ca = (q.correctAnswer || "").trim().toLowerCase();
        if (ca !== "yes" && ca !== "no") {
          return `Question ${qNum}: Please select whether "Yes" or "No" is the correct answer.`;
        }
      }
    }

    if (!selectedCourseId) {
      return "You have no course to publish this quiz to.";
    }
    if (!launchDateTime || !dueDateTime) {
      return "Please set both the launch time and the deadline.";
    }
    if (launchDateTime && dueDateTime) {
      if (new Date(dueDateTime) <= new Date(launchDateTime)) {
        return "The solve & submit deadline must be after the launch date & time.";
      }
    }
    const minutes = Number(durationMinutes);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 300) {
      return "Please set the time limit, between 1 and 300 minutes.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateQuiz();
    if (validationError) {
      setFormError(validationError);
      toastManager.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveQuiz({
        title: title.trim(),
        courseId: selectedCourseId,
        description: description.trim(),
        launchDateTime,
        dueDateTime,
        durationMinutes: Number(durationMinutes),
        questions,
      });
      handleResetForm();
      onClose();
    } catch (err) {
      const msg = extractApiErrorMessage(err) || err?.message || "Failed to publish quiz.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-[#1C233D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Interactive Quiz & Test Authoring</h3>
              <p className="text-xs text-slate-400">
                Author multiple options, yes/no, fill-in-blanks, and short writing questions with release windows.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetForm}
              title="Clear all fields and start fresh"
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-[#242D4C] hover:border-slate-500 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Draft</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Unable to Publish Quiz</p>
                <p className="mt-0.5 whitespace-pre-wrap">{formError}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-rose-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {
    /* Header Metadata */
  }
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Quiz Title <span className="text-rose-400">*</span>
              </label>
              <input
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Cambridge Physics Paper 2 Diagnostic Mock"
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Course Cohort
              </label>
              <select
    value={selectedCourseId}
    onChange={(e) => setCourseId(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 focus:outline-none"
  >
                {courses.length === 0 && <option value="">No courses assigned</option>}
                {courses.map((c) => <option key={c.id} value={c.id}>
                    {c.title}
                  </option>)}
              </select>
            </div>
          </div>

          {
    /* Timing & Windows */
  }
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#0B0E1A] border border-[#1A223B]">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Launch Date & Time
              </label>
              <input
    type="datetime-local"
    value={launchDateTime}
    onChange={(e) => {
      setDatesEdited(true);
      setLaunchDateTime(e.target.value);
    }}
    className="w-full px-3 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-white [color-scheme:dark]"
  />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Solve & Submit Deadline
              </label>
              <input
    type="datetime-local"
    value={dueDateTime}
    onChange={(e) => {
      setDatesEdited(true);
      setDueDateTime(e.target.value);
    }}
    className="w-full px-3 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-white [color-scheme:dark]"
  />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Time Limit (minutes)
              </label>
              <input
    type="number"
    min={1}
    max={300}
    step={1}
    required
    value={durationMinutes}
    onChange={(e) => setDurationMinutes(e.target.value)}
    className="w-full px-3 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-white"
  />
            </div>
            <p className="sm:col-span-3 text-[11px] text-slate-400">
              Each student's clock starts when they press Start and cannot be paused. The quiz submits itself when the time runs out.
            </p>
          </div>

          {
    /* Question List Header & Add Controls */
  }
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Quiz Questions ({questions.length}) · Total {totalMarks} Marks
                </h4>
                <p className="text-xs text-slate-400">
                  Compose questions across multiple choice, yes/no, fill-in-blanks, and written responses.
                </p>
              </div>

              {
    /* Add Question & Bulk Import Buttons */
  }
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  title="Load sample physics quiz template"
                >
                  <span>Load Sample</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkImportModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  title="Import questions in bulk from CSV or JSON file"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Bulk Import (CSV / JSON)</span>
                </button>
                <div className="h-4 w-px bg-[#242D4C] mx-0.5" />
                <button
                  type="button"
                  onClick={() => handleAddQuestion("multiple_choice")}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold cursor-pointer"
                >
                  + Multi Choice
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion("yes_no")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold cursor-pointer"
                >
                  + Yes/No
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion("fill_in_blank")}
                  className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold cursor-pointer"
                >
                  + Fill Blank
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion("short_answer")}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold cursor-pointer"
                >
                  + Short Writing
                </button>
              </div>
            </div>

            {/* Questions Editor Container */}
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-[#0B0E1A] border border-[#1A223B] space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {q.type.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-slate-300">
                        <span>Marks:</span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={q.marks}
                          onChange={(e) => updateQuestion(q.id, { marks: Number(e.target.value) })}
                          className="w-14 px-2 py-0.5 rounded bg-[#121628] border border-[#1E2642] text-xs font-mono font-bold text-white tabular-nums text-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <textarea
                    rows={2}
                    value={q.questionText}
                    onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                    placeholder="Enter question wording..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                  />

                  {/* Multiple Choice Options */}
                  {q.type === "multiple_choice" && q.options && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Options (Select radio for correct answer):</span>
                        {(!q.correctAnswer || !q.options.some((o) => o && o.trim() === (q.correctAnswer || "").trim())) && (
                          <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> No correct answer selected
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const isChecked = Boolean(q.correctAnswer && opt && q.correctAnswer.trim() === opt.trim());
                          return (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={isChecked}
                                onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
                                className="accent-indigo-500 cursor-pointer"
                                title="Mark as correct answer"
                              />
                              <input
                                type="text"
                                value={opt}
                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                                className="flex-1 px-2.5 py-1 rounded bg-[#121628] border border-[#1E2642] text-xs text-white placeholder-slate-500"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Yes / No Options */}
                  {q.type === "yes_no" && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Correct Proposition Answer:</span>
                        {(!q.correctAnswer || (q.correctAnswer !== "Yes" && q.correctAnswer !== "No")) && (
                          <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Select Yes or No
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <label className="flex items-center gap-1.5 text-white cursor-pointer">
                          <input
                            type="radio"
                            name={`yn-${q.id}`}
                            value="Yes"
                            checked={q.correctAnswer === "Yes"}
                            onChange={() => updateQuestion(q.id, { correctAnswer: "Yes" })}
                            className="accent-emerald-500 cursor-pointer"
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-white cursor-pointer">
                          <input
                            type="radio"
                            name={`yn-${q.id}`}
                            value="No"
                            checked={q.correctAnswer === "No"}
                            onChange={() => updateQuestion(q.id, { correctAnswer: "No" })}
                            className="accent-emerald-500 cursor-pointer"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Fill in Blank / Short Answer */}
                  {(q.type === "fill_in_blank" || q.type === "short_answer") && (
                    <div className="space-y-1 pt-1">
                      <label className="block text-[11px] text-slate-400">
                        {q.type === "fill_in_blank"
                          ? "Expected Keyword / Exact Blank Text:"
                          : "Sample Grading Key / Benchmark Answer for Teacher Review:"}
                      </label>
                      <input
                        type="text"
                        value={q.correctAnswer || ""}
                        onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                        placeholder="Expected answer or benchmark..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-indigo-300 font-mono placeholder-slate-600"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A223B]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#161C30] text-xs font-semibold text-slate-300 hover:text-white cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] disabled:opacity-50 text-xs font-bold text-white shadow-lg cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing Quiz...</span>
                </>
              ) : (
                <span>Launch & Publish Quiz ({totalMarks} Marks)</span>
              )}
            </button>
          </div>
        </form>

        {
    /* BULK IMPORT SUB-MODAL */
  }
        {showBulkImportModal && <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[#0F1426] border border-[#2D3860] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {
    /* Header */
  }
              <div className="px-5 py-4 border-b border-[#1E2642] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Bulk-Import Quiz Questions
                    </h3>
                    <p className="text-xs text-slate-400">
                      Upload or paste questions in CSV or JSON format for instant generation.
                    </p>
                  </div>
                </div>
                <button
    type="button"
    onClick={() => setShowBulkImportModal(false)}
    className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
  >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {
    /* Body */
  }
              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {
    /* Format switcher & Sample templates */
  }
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#090D1A] border border-[#1A223B]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-semibold">Format:</span>
                    <button
    type="button"
    onClick={() => setBulkImportMode("csv")}
    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${bulkImportMode === "csv" ? "bg-emerald-600 text-white shadow-sm" : "bg-[#141A2E] text-slate-400 hover:text-white"}`}
  >
                      CSV (Spreadsheet)
                    </button>
                    <button
    type="button"
    onClick={() => setBulkImportMode("json")}
    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${bulkImportMode === "json" ? "bg-indigo-600 text-white shadow-sm" : "bg-[#141A2E] text-slate-400 hover:text-white"}`}
  >
                      JSON
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
    type="button"
    onClick={() => handleDownloadSample(bulkImportMode)}
    className="px-2.5 py-1 rounded-lg bg-[#141A2E] hover:bg-[#1C2542] text-slate-300 border border-[#232D4B] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
  >
                      <Download className="w-3 h-3 text-slate-400" />
                      <span>Download {bulkImportMode.toUpperCase()} Template</span>
                    </button>
                    <button
    type="button"
    onClick={() => {
      setBulkImportText(bulkImportMode === "csv" ? CSV_SAMPLE : JSON_SAMPLE);
      setBulkImportError(null);
    }}
    className="px-2.5 py-1 rounded-lg bg-[#141A2E] hover:bg-[#1C2542] text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
  >
                      <Code className="w-3 h-3" />
                      <span>Load Sample</span>
                    </button>
                  </div>
                </div>

                {
    /* File upload drag/picker */
  }
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Upload .csv or .json File
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-[#2B3556] hover:border-indigo-500/60 bg-[#0B0E1A] cursor-pointer transition-colors group">
                    <FileUp className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 mb-1.5 transition-colors" />
                    <span className="text-xs text-slate-300 font-medium">
                      Click to choose a CSV or JSON file from your computer
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Accepts standard comma-delimited CSV or JSON array of questions
                    </span>
                    <input
    type="file"
    accept=".csv,.json,text/csv,application/json"
    onChange={handleFileUpload}
    className="hidden"
  />
                  </label>
                </div>

                {
    /* Paste / Edit Text Area */
  }
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Or Paste {bulkImportMode.toUpperCase()} Data Directly:
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {bulkImportMode === "csv" ? "Headers: type, questionText, marks, options, correctAnswer" : "[{ type, questionText, marks, options, correctAnswer }]"}
                    </span>
                  </div>
                  <textarea
    rows={8}
    value={bulkImportText}
    onChange={(e) => {
      setBulkImportText(e.target.value);
      setBulkImportError(null);
    }}
    placeholder={bulkImportMode === "csv" ? CSV_SAMPLE : JSON_SAMPLE}
    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D1A] border border-[#1E2642] text-xs font-mono text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
  />
                </div>

                {
    /* Append vs Replace option */
  }
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#090D1A] border border-[#1A223B]">
                  <div className="text-xs text-slate-300 font-semibold">
                    Import Mode:
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                      <input
    type="radio"
    name="appendMode"
    checked={importAppendMode === "append"}
    onChange={() => setImportAppendMode("append")}
    className="accent-emerald-500"
  />
                      <span>Append to existing questions</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                      <input
    type="radio"
    name="appendMode"
    checked={importAppendMode === "replace"}
    onChange={() => setImportAppendMode("replace")}
    className="accent-rose-500"
  />
                      <span>Replace existing questions</span>
                    </label>
                  </div>
                </div>

                {
    /* Error Banner */
  }
                {bulkImportError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="font-semibold">Parse Error: </strong>
                      {bulkImportError}
                    </div>
                  </div>}

                {
    /* Success Banner */
  }
                {bulkImportSuccess && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{bulkImportSuccess}</span>
                  </div>}
              </div>

              {
    /* Footer */
  }
              <div className="px-5 py-3.5 border-t border-[#1E2642] flex items-center justify-between bg-[#0B0E1A]">
                <button
    type="button"
    onClick={() => setShowBulkImportModal(false)}
    className="px-3.5 py-1.5 rounded-xl bg-[#141A2E] text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
  >
                  Cancel
                </button>
                <button
    type="button"
    onClick={handleApplyBulkImport}
    className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg flex items-center gap-2 cursor-pointer transition-all"
  >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Parse & Import Questions</span>
                </button>
              </div>
            </div>
          </div>}
      </div>
    </div>;
};
