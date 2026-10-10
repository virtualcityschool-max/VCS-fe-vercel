import React, { useState } from "react";
import {
  X,
  Megaphone,
  Video,
  Award,
  Plus
} from "lucide-react";
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
              <p className="text-[11px] text-slate-400">
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
              <div className="text-[11px] font-semibold text-slate-400 mb-2">
                Recent Broadcasts ({announcements.length})
              </div>
              <div className="max-h-28 overflow-y-auto space-y-2 pr-1">
                {announcements.map((a) => <div
    key={a.id}
    className="p-2.5 rounded-xl bg-[#0B0E1A] border border-[#181F36] text-[11px]"
  >
                    <div className="font-bold text-slate-200">{a.title}</div>
                    <div className="text-slate-400 mt-0.5 line-clamp-1">{a.content}</div>
                    <div className="text-[10px] text-indigo-400 mt-1">
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
  onCreateSession
}) => {
  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState(courses[0]?.title || "University Entry Test Prep");
  const [category, setCategory] = useState("classes");
  const [timeAST, setTimeAST] = useState("07:30 PM AST");
  const [duration, setDuration] = useState("60 min");
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateSession(title.trim(), courseName, category, timeAST, duration);
    setTitle("");
    onClose();
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
              <p className="text-[11px] text-slate-400">Auto-generates classroom link for students</p>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white"
  >
                <option value="classes">Classes</option>
                <option value="admin_session">Admin Session</option>
                <option value="reserved_slots">Reserved Slots</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Course Cohort
              </label>
              <select
    value={courseName}
    onChange={(e) => setCourseName(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white"
  >
                {courses.map((c) => <option key={c.id} value={c.title}>
                    {c.title}
                  </option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Start Time (AST)
              </label>
              <input
    type="text"
    value={timeAST}
    onChange={(e) => setTimeAST(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs font-mono text-white"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Duration
              </label>
              <input
    type="text"
    value={duration}
    onChange={(e) => setDuration(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs font-mono text-white"
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
    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
  >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export const GradeTaskModal = ({
  task,
  onClose,
  onSaveGrade
}) => {
  const [marks, setMarks] = useState(task?.awardedMarks ?? task?.maxMarks ?? 20);
  const [feedback, setFeedback] = useState(
    task?.feedback ?? "Clear logical deductions and accurate rubric steps."
  );
  React.useEffect(() => {
    if (task) {
      setMarks(task.awardedMarks ?? Math.round(task.maxMarks * 0.9));
      setFeedback(
        task.feedback ?? "Well-structured response; all analytical steps verified."
      );
    }
  }, [task]);
  if (!task) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveGrade(task.id, Math.min(task.maxMarks, Math.max(0, marks)), feedback);
    onClose();
  };
  return <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1C233D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rubric Evaluation</h3>
              <p className="text-[11px] text-slate-400">
                {task.studentName} ({task.studentRoll})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1B223B]">
            <div className="text-xs font-bold text-white">{task.assignmentTitle}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{task.courseTitle}</div>
            {task.rubricCriterion && <div className="text-[10px] text-indigo-400 mt-1">
                Criterion: {task.rubricCriterion}
              </div>}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Awarded Marks</span>
              <span className="font-mono text-indigo-400 tabular-nums">
                {marks} / {task.maxMarks}
              </span>
            </div>
            <input
    type="range"
    min={0}
    max={task.maxMarks}
    value={marks}
    onChange={(e) => setMarks(Number(e.target.value))}
    className="w-full accent-indigo-500"
  />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Written Faculty Feedback
            </label>
            <textarea
    rows={3}
    required
    value={feedback}
    onChange={(e) => setFeedback(e.target.value)}
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
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
              Release Marks & Feedback
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
              <p className="text-[11px] text-slate-400">Adds syllabus to your Academic Portfolio</p>
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
