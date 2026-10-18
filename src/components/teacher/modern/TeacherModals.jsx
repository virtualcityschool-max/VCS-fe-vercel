import React, { useState } from "react";
import {
  X,
  Megaphone,
  Video,
  Award,
  Plus
} from "lucide-react";
import { teacherService } from "../../../services/teacherService";
import { getStorageUrl } from "../../../utils/storageUrl";
import { extractApiErrorMessage } from "../../../utils/apiErrorHandler";
export const PostAnnouncementModal = ({
  isOpen,
  onClose,
  courses,
  announcements,
  onPostAnnouncement
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState(courses[0]?.title || "All Enrolled Students");
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onPostAnnouncement(title.trim(), content.trim(), audience);
    setTitle("");
    setContent("");
    onClose();
  };
  return <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1C233D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Broadcast Faculty Announcement</h3>
              <p className="text-xs text-slate-400">
                Pushes live to student sidebar notification bells
              </p>
            </div>
          </div>
          <button
    onClick={onClose}
    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#192038] cursor-pointer"
  >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Cohort
            </label>
            <select
    value={audience}
    onChange={(e) => setAudience(e.target.value)}
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  >
              <option value="All Enrolled Students">All Enrolled Students</option>
              {courses.map((c) => <option key={c.id} value={c.title}>
                  {c.title} ({c.enrolledCount} learners)
                </option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Headline
            </label>
            <input
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Cambridge Physics Paper 4 Past Paper Review Room Open"
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Announcement Details
            </label>
            <textarea
    rows={3}
    required
    value={content}
    onChange={(e) => setContent(e.target.value)}
    placeholder="Include session timings in AST, required formula sheets, or rubric instructions..."
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
          </div>

          {announcements.length > 0 && <div className="pt-2 border-t border-[#1A2138]">
              <div className="text-xs font-semibold text-slate-400 mb-2">
                Recent Broadcasts ({announcements.length})
              </div>
              <div className="max-h-28 overflow-y-auto space-y-2 pr-1">
                {announcements.map((a) => <div
    key={a.id}
    className="p-2.5 rounded-xl bg-[#0B0E1A] border border-[#181F36] text-xs"
  >
                    <div className="font-bold text-slate-200">{a.title}</div>
                    <div className="text-slate-400 mt-0.5 line-clamp-1">{a.content}</div>
                    <div className="text-xs text-indigo-400 mt-1">
                      {a.audience} · {a.postedAt}
                    </div>
                  </div>)}
              </div>
            </div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 rounded-xl bg-[#161C30] text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
  >
              Cancel
            </button>
            <button
    type="submit"
    className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4B36E6] text-xs font-bold text-white cursor-pointer"
  >
              Publish Broadcast
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export const ScheduleSessionModal = ({
  isOpen,
  onClose,
  courses,
  onCreateSession,
  timezone
}) => {
  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tz = timezone || "Asia/Riyadh";
  const todayStr = (() => {
    try {
      return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  })();
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState("19:30");

  const effectiveCourse = courseName || courses[0]?.title || "";

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const ok = await onCreateSession({
        title: title.trim(),
        courseName: effectiveCourse,
        date: scheduledDate,
        time: scheduledTime,
      });
      if (ok) {
        setTitle("");
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1C233D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Schedule Live Google Meet</h3>
              <p className="text-xs text-slate-400">Auto-generates classroom link for students</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Session Topic
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Verbal Reasoning & Critical Reading Drill"
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Course Cohort
            </label>
            <select
              value={effectiveCourse}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white"
            >
              {courses.length === 0 ? (
                <option value="">No Active Courses</option>
              ) : (
                courses.map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.title}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Time
              </label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs font-mono text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 rounded-xl bg-[#161C30] text-xs font-semibold text-slate-300 cursor-pointer"
  >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors ${isSubmitting ? "bg-emerald-800 cursor-not-allowed opacity-70" : "bg-emerald-600 hover:bg-emerald-500 cursor-pointer"}`}
            >
              {isSubmitting ? "Creating Session..." : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>;
};
// Student text answers come from a rich-text editor; show them as plain text (never inject HTML)
const richTextToPlain = (html) => {
  if (!html) return "";
  if (!/<[a-z][\s\S]*>/i.test(html)) return html;
  const withBreaks = html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h[1-6])>/gi, "\n");
  const doc = new DOMParser().parseFromString(withBreaks, "text/html");
  return (doc.body.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
};

export const GradeTaskModal = ({
  task,
  onClose,
  onGradeSubmit
}) => {
  const [detail, setDetail] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  React.useEffect(() => {
    if (!task?.submissionId) return;
    let cancelled = false;
    setDetail(null);
    setLoadError(null);
    teacherService
      .getSubmissionById(task.submissionId)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        // Pre-fill only with a grade that really exists
        setMarks(d?.grade?.score ?? "");
        setFeedback(d?.grade?.feedback ?? "");
      })
      .catch((err) => !cancelled && setLoadError(extractApiErrorMessage(err) || "Could not load this submission."));
    return () => {
      cancelled = true;
    };
  }, [task?.submissionId]);

  if (!task) return null;
  const maxMarks = detail?.assignment_max_score ?? task.maxMarks ?? null;
  const alreadyGraded = Boolean(detail?.grade);
  const fileUrl = detail?.file_url ? getStorageUrl(detail.file_url) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const score = Number(marks);
    if (marks === "" || Number.isNaN(score) || score < 0 || (maxMarks != null && score > maxMarks)) {
      setSaveError(`Enter marks between 0 and ${maxMarks ?? "the maximum"}.`);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await onGradeSubmit({ ...task, maxMarks }, Math.round(score), feedback.trim(), alreadyGraded);
      onClose();
    } catch (err) {
      setSaveError(extractApiErrorMessage(err) || "Could not save the marks. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="px-5 py-4 border-b border-[#1C233D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Grade Submission</h3>
              <p className="text-xs text-slate-400">
                {task.studentName} · {task.studentRoll}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1B223B]">
            <div className="text-xs font-bold text-white">{task.assignmentTitle}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {task.courseTitle}
              {task.submittedAt ? ` · Submitted ${task.submittedAt}` : ""}
              {detail?.status === "late" ? " · Late" : ""}
            </div>
          </div>

          {/* Student's work */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student's answer</div>
            {loadError ? <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{loadError}</div> : !detail ? <div className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1B223B] text-xs text-slate-500">Loading submission…</div> : <>
                {detail.text_answer ? <div className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1B223B] text-xs text-slate-100 whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {richTextToPlain(detail.text_answer)}
                  </div> : null}
                {fileUrl ? <a
    href={fileUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30"
  >
                    Open attached file
                  </a> : null}
                {!detail.text_answer && !fileUrl ? <div className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1B223B] text-xs text-slate-500">No answer content found.</div> : null}
              </>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Marks {maxMarks != null ? `(out of ${maxMarks})` : ""}
            </label>
            <div className="flex items-center gap-2">
              <input
    type="number"
    min={0}
    max={maxMarks ?? undefined}
    step={1}
    required
    value={marks}
    onChange={(e) => setMarks(e.target.value)}
    className="w-24 px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-sm font-mono font-bold text-white tabular-nums focus:outline-none focus:border-indigo-500"
  />
              {maxMarks != null && <span className="text-xs text-slate-400 font-mono">/ {maxMarks}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Feedback for the student (optional)
            </label>
            <textarea
    rows={3}
    value={feedback}
    onChange={(e) => setFeedback(e.target.value)}
    placeholder="What went well, and what to improve…"
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
  />
          </div>

          {saveError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{saveError}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 rounded-xl bg-[#161C30] text-xs font-semibold text-slate-300 cursor-pointer"
  >
              Cancel
            </button>
            <button
    type="submit"
    disabled={saving || !detail}
    className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4B36E6] disabled:opacity-60 text-xs font-bold text-white cursor-pointer"
  >
              {saving ? "Saving…" : alreadyGraded ? "Update Marks & Feedback" : "Release Marks & Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export const CreateCourseModal = ({
  isOpen,
  onClose,
  onCreateCourse
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("CAMBRIDGE \xB7 SCIENCES");
  const [level, setLevel] = useState("AS & A Level");
  const [description, setDescription] = useState("Comprehensive syllabus progression and past paper drills.");
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateCourse(title.trim(), category, level, description);
    setTitle("");
    onClose();
  };
  return <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1C233D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Launch New Academic Course</h3>
              <p className="text-xs text-slate-400">Adds syllabus to your Academic Portfolio</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Course Title
            </label>
            <input
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Cambridge A-Level Chemistry (9701)"
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none"
  />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Department / Category
            </label>
            <input
    type="text"
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white"
  />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Qualification Level
            </label>
            <input
    type="text"
    value={level}
    onChange={(e) => setLevel(e.target.value)}
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white"
  />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Course Summary
            </label>
            <textarea
    rows={2}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white"
  />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 rounded-xl bg-[#161C30] text-xs font-semibold text-slate-300 cursor-pointer"
  >
              Cancel
            </button>
            <button
    type="submit"
    className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4B36E6] text-xs font-bold text-white cursor-pointer"
  >
              Publish Course
            </button>
          </div>
        </form>
      </div>
    </div>;
};
