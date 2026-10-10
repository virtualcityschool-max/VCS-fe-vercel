import { useState } from "react";
import {
  X,
  Trash2,
  Clock,
  Calendar,
  Award,
  CheckCircle2,
  FileText,
  UploadCloud
} from "lucide-react";
import {
  FileSpreadsheet,
  Download,
  AlertCircle,
  Code,
  FileUp
} from "lucide-react";
export const CreateAssignmentModal = ({
  isOpen,
  onClose,
  courses,
  onCreateAssignment
}) => {
  const [assignmentMode, setAssignmentMode] = useState("quick_task");
  const [title, setTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState(courses[0]?.title || "University Entry Test Prep");
  const [description, setDescription] = useState("");
  const [submissionMethod, setSubmissionMethod] = useState("online_text");
  const [allowedFormats, setAllowedFormats] = useState(["PDF", "PNG", "DOCX"]);
  const [launchDate, setLaunchDate] = useState("2026-10-10");
  const [launchTime, setLaunchTime] = useState("02:00 PM AST");
  const [dueDate, setDueDate] = useState("2026-10-16");
  const [dueTime, setDueTime] = useState("11:59 PM AST");
  const [maxMarks, setMaxMarks] = useState(20);
  const [rubricCriterion, setRubricCriterion] = useState(
    "Conceptual understanding (10m), Calculation accuracy (10m)"
  );
  const [attachedFileName, setAttachedFileName] = useState(null);
  if (!isOpen) return null;
  const handleApplyPreset = (presetTitle, promptText, marks, method) => {
    setTitle(presetTitle);
    setDescription(promptText);
    setMaxMarks(marks);
    setSubmissionMethod(method);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateAssignment({
      title: title.trim(),
      courseTitle,
      description: description.trim() || "Review textbook reference and complete the questions assigned by instructor.",
      submissionMethod,
      allowedFormats,
      launchDate,
      launchTime,
      dueDate,
      dueTime,
      maxMarks,
      rubricCriterion: rubricCriterion.trim()
    });
    onClose();
  };
  const toggleFormat = (fmt) => {
    if (allowedFormats.includes(fmt)) {
      setAllowedFormats(allowedFormats.filter((f) => f !== fmt));
    } else {
      setAllowedFormats([...allowedFormats, fmt]);
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
                Easily assign a quick text task (few lines, no files needed) or a formal problem sheet with dates & marks.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Quick Mode Toggle */
  }
        <div className="px-6 pt-4 pb-2 bg-[#0C0F1D] border-b border-[#1A223B] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
    type="button"
    onClick={() => {
      setAssignmentMode("quick_task");
      setSubmissionMethod("online_text");
    }}
    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${assignmentMode === "quick_task" ? "bg-indigo-600 text-white shadow-md" : "bg-[#14192E] text-slate-400 hover:text-white border border-[#202848]"}`}
  >
              ⚡ Quick Text Task (No files needed · few lines)
            </button>
            <button
    type="button"
    onClick={() => {
      setAssignmentMode("file_structured");
      setSubmissionMethod("file_upload");
    }}
    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${assignmentMode === "file_structured" ? "bg-indigo-600 text-white shadow-md" : "bg-[#14192E] text-slate-400 hover:text-white border border-[#202848]"}`}
  >
              📄 Structured File / Worksheet Upload
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {
    /* Quick Presets for Teachers */
  }
          {assignmentMode === "quick_task" && <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                1-Click Quick Task Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
    type="button"
    onClick={() => handleApplyPreset(
      "Textbook Practice: Chapter 3 Questions 8 & 9",
      "Solve question 8 and 9 from page 46 of course textbook. Show formula substitution steps clearly.",
      15,
      "online_text"
    )}
    className="px-2.5 py-1 rounded-lg bg-[#161D38] hover:bg-[#1E274A] border border-indigo-500/30 text-indigo-200 text-[11px] cursor-pointer"
  >
                  📖 Solve Textbook Questions (15 Marks)
                </button>
                <button
    type="button"
    onClick={() => handleApplyPreset(
      "Short Concept Summary: Newton Second Law",
      "Write 150 words explaining how net resultant force relates to rate of change of momentum with real-world examples.",
      10,
      "online_text"
    )}
    className="px-2.5 py-1 rounded-lg bg-[#161D38] hover:bg-[#1E274A] border border-indigo-500/30 text-indigo-200 text-[11px] cursor-pointer"
  >
                  ✍️ 150-Word Concept Reflection (10 Marks)
                </button>
                <button
    type="button"
    onClick={() => handleApplyPreset(
      "Past Paper 10-Mark Calculation Drill",
      "Solve the structured kinematics problem posted in class. Calculate final projectile velocity and flight time.",
      20,
      "file_upload"
    )}
    className="px-2.5 py-1 rounded-lg bg-[#161D38] hover:bg-[#1E274A] border border-indigo-500/30 text-indigo-200 text-[11px] cursor-pointer"
  >
                  🎯 Past Paper Problem (20 Marks)
                </button>
              </div>
            </div>}

          {
    /* Assignment Title & Target Course */
  }
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
    placeholder={assignmentMode === "quick_task" ? "e.g. Solve Chapter 3 Exercises 12 to 14" : "e.g. Kinematics Free Body Vectors & Projectile Investigation"}
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Course Cohort
              </label>
              <select
    value={courseTitle}
    onChange={(e) => setCourseTitle(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 focus:outline-none cursor-pointer"
  >
                {courses.map((c) => <option key={c.id} value={c.title}>
                    {c.title}
                  </option>)}
              </select>
            </div>
          </div>

          {
    /* Description / Few Lines Prompt */
  }
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {assignmentMode === "quick_task" ? "Teacher's Task Prompt (just a few lines from teacher):" : "Task Guidelines & Instructions:"}
              </label>
              {assignmentMode === "quick_task" && <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  ✓ No file needed · typed instructions
                </span>}
            </div>
            <textarea
    rows={3}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder={assignmentMode === "quick_task" ? 'Type your task here: e.g. "Read pages 14\u201316 in the textbook and solve questions 3 & 4. Submit your written answer or upload photo of handwritten notebook."' : "Detail step-by-step questions, reference textbook pages, or mandatory formula sheets required for this assignment..."}
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
          </div>

          {
    /* Submission Method & Allowed Formats */
  }
          <div className="p-4 rounded-xl bg-[#0B0E1A] border border-[#1A223B] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Student Submission Method</span>
              <span className="text-[11px] text-slate-400">Select how students turn in their work</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
    { id: "file_upload", label: "File Upload (PDF/Image)" },
    { id: "online_text", label: "Online Text Editor" },
    { id: "google_drive", label: "Google Drive Share" },
    { id: "github_link", label: "GitHub Repository" }
  ].map((m) => <button
    type="button"
    key={m.id}
    onClick={() => setSubmissionMethod(m.id)}
    className={`p-2.5 rounded-xl text-[11px] font-semibold border text-left transition-colors cursor-pointer ${submissionMethod === m.id ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm" : "bg-[#12162A] border-[#1E2642] text-slate-400 hover:text-slate-200"}`}
  >
                  {m.label}
                </button>)}
            </div>

            {submissionMethod === "file_upload" && <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400">Accepted formats:</span>
                {["PDF", "PNG", "JPG", "DOCX", "ZIP"].map((fmt) => <button
    type="button"
    key={fmt}
    onClick={() => toggleFormat(fmt)}
    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold cursor-pointer transition-colors ${allowedFormats.includes(fmt) ? "bg-indigo-500 text-white" : "bg-[#182038] text-slate-400"}`}
  >
                    .{fmt}
                  </button>)}
              </div>}

            {
    /* Teacher File Attachment Simulator */
  }
            <div className="pt-2 border-t border-[#161C33] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                <span>Attach Problem Sheet / Prompt Document (Optional):</span>
              </div>
              <label className="px-3 py-1 rounded-lg bg-[#182038] hover:bg-[#202B4C] text-xs font-semibold text-slate-200 border border-[#273254] cursor-pointer">
                <span>{attachedFileName ? attachedFileName : "Choose File"}</span>
                <input
    type="file"
    className="hidden"
    onChange={(e) => {
      if (e.target.files && e.target.files[0]) {
        setAttachedFileName(e.target.files[0].name);
      }
    }}
  />
              </label>
            </div>
          </div>

          {
    /* Timestamps: Launch Date/Time and Due Date/Time */
  }
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-[#0B0E1A] border border-[#1A223B] space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Launch & Release Schedule</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
    type="date"
    value={launchDate}
    onChange={(e) => setLaunchDate(e.target.value)}
    className="px-2.5 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-white"
  />
                <input
    type="text"
    value={launchTime}
    onChange={(e) => setLaunchTime(e.target.value)}
    placeholder="02:00 PM AST"
    className="px-2.5 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs font-mono text-white"
  />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0E1A] border border-[#1A223B] space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Submission Deadline</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
    type="date"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    className="px-2.5 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-white"
  />
                <input
    type="text"
    value={dueTime}
    onChange={(e) => setDueTime(e.target.value)}
    placeholder="11:59 PM AST"
    className="px-2.5 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs font-mono text-white"
  />
              </div>
            </div>
          </div>

          {
    /* Marks & Rubric */
  }
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Total Max Marks
              </label>
              <input
    type="number"
    min={5}
    max={100}
    value={maxMarks}
    onChange={(e) => setMaxMarks(Number(e.target.value))}
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs font-mono font-bold text-white tabular-nums"
  />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Rubric Breakdown / Scoring Guide
              </label>
              <input
    type="text"
    value={rubricCriterion}
    onChange={(e) => setRubricCriterion(e.target.value)}
    placeholder="e.g. Method (10m), Calculation (10m), Final Answer (5m)"
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white"
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
    className="px-5 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-xs font-bold text-white shadow-lg cursor-pointer"
  >
              Publish Assignment
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export const AdvancedQuizBuilderModal = ({
  isOpen,
  onClose,
  courses,
  onSaveQuiz
}) => {
  const [title, setTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState(courses[0]?.title || "University Entry Test Prep");
  const [description] = useState("Timed diagnostic assessment with multiple question formats.");
  const [durationMins, setDurationMins] = useState(25);
  const [launchDateTime, setLaunchDateTime] = useState("2026-10-10T15:00");
  const [dueDateTime, setDueDateTime] = useState("2026-10-15T22:00");
  const [questions, setQuestions] = useState([
    {
      id: "q-new-1",
      type: "multiple_choice",
      questionText: "What is the SI unit of electric capacitance?",
      options: ["Henry", "Farad", "Coulomb", "Weber"],
      correctAnswer: "Farad",
      marks: 5
    },
    {
      id: "q-new-2",
      type: "yes_no",
      questionText: "Is kinetic energy conserved during an inelastic collision?",
      correctAnswer: "No",
      marks: 5
    },
    {
      id: "q-new-3",
      type: "fill_in_blank",
      questionText: "The derivative of sin(2x) with respect to x is ____.",
      correctAnswer: "2cos(2x)",
      marks: 5
    },
    {
      id: "q-new-4",
      type: "short_answer",
      questionText: "Define Lenz\u2019s Law and explain how it relates to conservation of energy.",
      correctAnswer: "The direction of induced current opposes the change in magnetic flux that produces it.",
      marks: 10
    }
  ]);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  const [bulkImportMode, setBulkImportMode] = useState("csv");
  const [importAppendMode, setImportAppendMode] = useState("append");
  const [bulkImportError, setBulkImportError] = useState(null);
  const [bulkImportSuccess, setBulkImportSuccess] = useState(null);
  if (!isOpen) return null;
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
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
      const marks = parts[2] && !isNaN(Number(parts[2])) ? Number(parts[2]) : 5;
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
      const marks = typeof item.marks === "number" ? item.marks : 5;
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
  const handleAddQuestion = (type) => {
    const newQ = {
      id: `q-new-${Date.now()}`,
      type,
      questionText: type === "multiple_choice" ? "Enter your multiple choice question text here" : type === "yes_no" ? "Enter your yes/no proposition here" : type === "fill_in_blank" ? "Enter your question with a blank ____ here" : "Enter short written essay prompt",
      options: type === "multiple_choice" ? ["Option A", "Option B", "Option C", "Option D"] : void 0,
      correctAnswer: type === "yes_no" ? "Yes" : "Model Answer",
      marks: 5
    };
    setQuestions([...questions, newQ]);
  };
  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };
  const updateQuestion = (id, updates) => {
    setQuestions(questions.map((q) => q.id === id ? { ...q, ...updates } : q));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) return;
    onSaveQuiz({
      title: title.trim(),
      courseTitle,
      description: description.trim(),
      durationMins,
      launchDateTime,
      dueDateTime,
      questions
    });
    onClose();
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
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
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
    value={courseTitle}
    onChange={(e) => setCourseTitle(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 focus:outline-none"
  >
                {courses.map((c) => <option key={c.id} value={c.title}>
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
                Duration (Minutes)
              </label>
              <input
    type="number"
    min={5}
    max={180}
    value={durationMins}
    onChange={(e) => setDurationMins(Number(e.target.value))}
    className="w-full px-3 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs font-mono text-white tabular-nums"
  />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Launch Date & Time
              </label>
              <input
    type="datetime-local"
    value={launchDateTime}
    onChange={(e) => setLaunchDateTime(e.target.value)}
    className="w-full px-3 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-white"
  />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Solve & Submit Deadline
              </label>
              <input
    type="datetime-local"
    value={dueDateTime}
    onChange={(e) => setDueDateTime(e.target.value)}
    className="w-full px-3 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-white"
  />
            </div>
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

            {
    /* Questions Editor Container */
  }
            <div className="space-y-4">
              {questions.map((q, idx) => <div
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

                  {
    /* Question Text */
  }
                  <textarea
    rows={2}
    value={q.questionText}
    onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
    placeholder="Enter question wording..."
    className="w-full px-3 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />

                  {
    /* Multiple Choice Options */
  }
                  {q.type === "multiple_choice" && q.options && <div className="space-y-2 pt-1">
                      <div className="text-[11px] text-slate-400">Options (Click radio to mark correct answer):</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => <div key={oIdx} className="flex items-center gap-2">
                            <input
    type="radio"
    name={`correct-${q.id}`}
    checked={q.correctAnswer === opt}
    onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
    className="accent-indigo-500 cursor-pointer"
  />
                            <input
    type="text"
    value={opt}
    onChange={(e) => {
      const newOpts = [...q.options];
      newOpts[oIdx] = e.target.value;
      updateQuestion(q.id, {
        options: newOpts,
        correctAnswer: q.correctAnswer === opt ? e.target.value : q.correctAnswer
      });
    }}
    className="flex-1 px-2.5 py-1 rounded bg-[#121628] border border-[#1E2642] text-xs text-white"
  />
                          </div>)}
                      </div>
                    </div>}

                  {
    /* Yes / No Options */
  }
                  {q.type === "yes_no" && <div className="flex items-center gap-4 text-xs pt-1">
                      <span className="text-slate-400">Correct Proposition Answer:</span>
                      <label className="flex items-center gap-1.5 text-white cursor-pointer">
                        <input
    type="radio"
    name={`yn-${q.id}`}
    value="Yes"
    checked={q.correctAnswer === "Yes"}
    onChange={() => updateQuestion(q.id, { correctAnswer: "Yes" })}
    className="accent-emerald-500"
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
    className="accent-emerald-500"
  />
                        <span>No</span>
                      </label>
                    </div>}

                  {
    /* Fill in Blank / Short Answer */
  }
                  {(q.type === "fill_in_blank" || q.type === "short_answer") && <div className="space-y-1 pt-1">
                      <label className="block text-[11px] text-slate-400">
                        {q.type === "fill_in_blank" ? "Expected Keyword / Exact Blank Text:" : "Sample Grading Key / Benchmark Answer for Teacher Review:"}
                      </label>
                      <input
    type="text"
    value={q.correctAnswer || ""}
    onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
    placeholder="Expected answer or benchmark..."
    className="w-full px-2.5 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-indigo-300 font-mono"
  />
                    </div>}
                </div>)}
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
    className="px-5 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-xs font-bold text-white shadow-lg cursor-pointer"
  >
              Launch & Publish Quiz ({totalMarks} Marks)
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
