import { useState } from "react";
import {
  FileText,
  Award,
  CheckCircle2,
  Search,
  UploadCloud,
  UserCheck
} from "lucide-react";
export const AssignmentsQuizzesView = ({
  courses,
  assignments,
  quizzes,
  onOpenCreateAssignmentModal,
  onOpenAdvancedQuizBuilderModal,
  onOpenReviewQuizModal,
  onBackToDashboard,
  timezone
}) => {
  const [activeSection, setActiveSection] = useState("assignments");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredAssignments = assignments.filter((a) => {
    const matchCourse = selectedCourseFilter === "all" || a.courseTitle === selectedCourseFilter;
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCourse && matchSearch;
  });
  const filteredQuizzes = quizzes.filter((q) => {
    const matchCourse = selectedCourseFilter === "all" || q.courseTitle === selectedCourseFilter;
    const matchSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.questions.some((ques) => ques.questionText.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCourse && matchSearch;
  });
  const allPendingQuizReviews = [];
  quizzes.forEach((q) => {
    q.submissions.forEach((sub) => {
      if (sub.status === "submitted") {
        allPendingQuizReviews.push({ quiz: q, submission: sub });
      }
    });
  });
  const pendingReviewsCount = allPendingQuizReviews.length;
  return <div className="space-y-6">
      {
    /* Top Banner & Primary Action Suite */
  }
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5 shadow-lg">
        <div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>EXAMINATION & TASK MANAGEMENT</span>
            {timezone && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#1B223C] text-[9px] text-slate-300 font-mono border border-[#283256]">
                {timezone}
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Assignments & Quizzes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Issue quick text tasks (no files required) or formal problem sheets, build interactive timed quizzes, and review & mark student answers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
    onClick={onBackToDashboard}
    className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
  >
            ← Back to Bento Dashboard
          </button>
          <button
    onClick={onOpenCreateAssignmentModal}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E2642] hover:bg-[#283256] text-white border border-[#2C3860] text-xs font-bold transition-all shadow-sm cursor-pointer"
  >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span>+ Create Task / Assignment</span>
          </button>
          <button
    onClick={onOpenAdvancedQuizBuilderModal}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
  >
            <Award className="w-4 h-4" />
            <span>+ Author Interactive Quiz</span>
          </button>
        </div>
      </div>

      {
    /* Segmented Section Switcher & Filter Toolbar */
  }
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0E1220] border border-[#1C233D] rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
    onClick={() => setActiveSection("assignments")}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeSection === "assignments" ? "bg-[#5B46F8] text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-[#161C30]"}`}
  >
            <FileText className="w-3.5 h-3.5" />
            <span>Assignments ({assignments.length})</span>
          </button>
          <button
    onClick={() => setActiveSection("quizzes")}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeSection === "quizzes" ? "bg-[#5B46F8] text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-[#161C30]"}`}
  >
            <Award className="w-3.5 h-3.5" />
            <span>Quizzes & Mocks ({quizzes.length})</span>
          </button>
          <button
    onClick={() => setActiveSection("pending_reviews")}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeSection === "pending_reviews" ? "bg-amber-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-[#161C30]"}`}
  >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Marking Queue ({pendingReviewsCount})</span>
            {pendingReviewsCount > 0 && <span className="px-1.5 py-0.2 rounded-full bg-amber-400/30 text-amber-200 text-[10px] font-mono font-bold tabular-nums">
                {pendingReviewsCount} to Mark
              </span>}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {
    /* Cohort Filter */
  }
          <select
    value={selectedCourseFilter}
    onChange={(e) => setSelectedCourseFilter(e.target.value)}
    className="px-3 py-1.5 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 focus:outline-none"
  >
            <option value="all">All Cohorts</option>
            {courses.map((c) => <option key={c.id} value={c.title}>
                {c.title}
              </option>)}
          </select>

          {
    /* Search Input */
  }
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search by title..."
    className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
  />
          </div>
        </div>
      </div>

      {
    /* ================= SECTION A: ASSIGNMENTS VIEW ================= */
  }
      {activeSection === "assignments" && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredAssignments.map((asg) => <div
    key={asg.id}
    className="p-5 rounded-2xl bg-[#101424] border border-[#1E2540] hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
  >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {asg.courseTitle}
                    </span>
                    <span className="font-mono font-bold text-white text-xs tabular-nums">
                      {asg.maxMarks} Marks
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{asg.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {asg.description}
                  </p>

                  {
    /* Submission Method & Allowed Formats */
  }
                  <div className="mt-3 pt-3 border-t border-[#181F36] space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Method:</span>
                      <span className="text-slate-200 font-semibold capitalize">
                        {asg.submissionMethod.replace("_", " ")}
                      </span>
                    </div>
                    {asg.allowedFormats && <div className="flex items-center justify-between text-slate-400">
                        <span>Formats:</span>
                        <span className="font-mono text-indigo-300 font-semibold">
                          {asg.allowedFormats.join(", ")}
                        </span>
                      </div>}
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Launch Date:</span>
                      <span className="text-slate-300 font-mono">
                        {asg.launchDate} · {asg.launchTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Deadline:</span>
                      <span className="text-rose-400 font-mono font-bold">
                        {asg.dueDate} · {asg.dueTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#181F36] flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    <strong className="text-white tabular-nums font-mono">{asg.submissionsCount}</strong> submissions (
                    {asg.reviewedCount} graded)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
                    {asg.status}
                  </span>
                </div>
              </div>)}
          </div>

          {filteredAssignments.length === 0 && <div className="p-12 text-center rounded-2xl bg-[#101424] border border-[#1E2540]">
              <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">No assignments found</div>
              <p className="text-xs text-slate-400 mt-1">
                Click "+ Upload / Give Assignment" to distribute coursework to students.
              </p>
            </div>}
        </div>}

      {
    /* ================= SECTION B: QUIZZES VIEW ================= */
  }
      {activeSection === "quizzes" && <div className="space-y-5">
          {filteredQuizzes.map((quiz) => <div
    key={quiz.id}
    className="p-5 rounded-2xl bg-[#101424] border border-[#1E2540] space-y-4 shadow-sm"
  >
              {
    /* Quiz Header Bar */
  }
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#181F36] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      {quiz.courseTitle}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs text-slate-400 font-mono">
                      Duration: {quiz.durationMins} mins
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-0.5">{quiz.title}</h3>
                  {quiz.description && <p className="text-xs text-slate-300 mt-1">{quiz.description}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-extrabold font-mono text-emerald-400 tabular-nums">
                      {quiz.marks} Marks
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">
                      {quiz.questionsCount} Questions
                    </div>
                  </div>
                  <span
    className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${quiz.status === "published" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-slate-800 text-slate-400"}`}
  >
                    {quiz.status}
                  </span>
                </div>
              </div>

              {
    /* Questions Preview Strip */
  }
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Configured Questions Breakdown:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {quiz.questions.map((q, qIdx) => <div
    key={q.id}
    className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1A223B] space-y-1.5"
  >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-indigo-400 uppercase">
                          Q{qIdx + 1} · {q.type.replace("_", " ")}
                        </span>
                        <span className="font-mono text-white font-bold tabular-nums">
                          {q.marks}m
                        </span>
                      </div>
                      <div className="text-xs text-slate-200 line-clamp-2">{q.questionText}</div>
                      {q.options && <div className="text-[10px] text-slate-400">
                          {q.options.length} options provided
                        </div>}
                    </div>)}
                </div>
              </div>

              {
    /* Submissions & Teacher Marking Queue */
  }
              <div className="pt-3 border-t border-[#181F36]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Student Submissions ({quiz.submissions.length})</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Solve & Submit Window: <span className="font-mono text-slate-300">{quiz.launchDateTime.replace("T", " ")}</span> to{" "}
                    <span className="font-mono text-rose-400">{quiz.dueDateTime.replace("T", " ")}</span>
                  </span>
                </div>

                {quiz.submissions.length === 0 ? <div className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1A223B] text-xs text-slate-400 text-center">
                    No submissions recorded yet for this quiz.
                  </div> : <div className="space-y-2">
                    {quiz.submissions.map((sub) => <div
    key={sub.id}
    className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1A223B] flex flex-wrap items-center justify-between gap-3"
  >
                        <div>
                          <div className="text-xs font-bold text-white">
                            {sub.studentName} <span className="text-slate-400 font-mono font-normal">({sub.studentRoll})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Turned in {sub.submittedAt} · {sub.answers.length} question responses
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-white tabular-nums">
                              {sub.status === "reviewed" ? `${sub.totalScore} / ${sub.maxScore} Marks` : "Pending Teacher Marking"}
                            </div>
                            <div
    className={`text-[10px] font-bold uppercase ${sub.status === "reviewed" ? "text-emerald-400" : "text-amber-400"}`}
  >
                              {sub.status === "reviewed" ? "\u2713 Marked" : "\u25CF Needs Review"}
                            </div>
                          </div>

                          <button
    onClick={() => onOpenReviewQuizModal(quiz, sub)}
    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sub.status === "reviewed" ? "bg-[#182038] text-slate-300 hover:bg-[#202B4C]" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"}`}
  >
                            {sub.status === "reviewed" ? "Edit Marks" : "Review & Mark"}
                          </button>
                        </div>
                      </div>)}
                  </div>}
              </div>
            </div>)}
        </div>}

      {
    /* ================= SECTION C: PENDING SUBMISSIONS MARKING QUEUE ================= */
  }
      {activeSection === "pending_reviews" && <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Submitted Quizzes & Diagnostic Papers</h3>
              <p className="text-xs text-slate-400">
                Review submitted student answers, score auto/manual questions, write faculty feedback, and release marks.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
              {allPendingQuizReviews.length} Pending Scripts
            </span>
          </div>

          {allPendingQuizReviews.length === 0 ? <div className="p-12 rounded-2xl bg-[#101424] border border-[#1E2540] text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">All Submissions Are Graded!</h4>
              <p className="text-xs text-slate-400">
                No quiz responses currently require teacher review. Newly submitted student tests will appear here.
              </p>
            </div> : <div className="space-y-3">
              {allPendingQuizReviews.map((item, idx) => <div
    key={`${item.quiz.id}-${item.submission.id}-${idx}`}
    className="p-5 rounded-2xl bg-[#101424] border border-[#1E2540] hover:border-amber-500/40 transition-all flex flex-wrap items-center justify-between gap-4"
  >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.submission.studentName}</span>
                      <span className="font-mono text-xs text-slate-400">({item.submission.studentRoll})</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase border border-amber-500/30">
                        Needs Marking
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-indigo-400">{item.quiz.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Course: {item.quiz.courseTitle}</span>
                      <span>·</span>
                      <span>Turned in: {item.submission.submittedAt}</span>
                      <span>·</span>
                      <span className="font-mono">{item.submission.answers.length} Answers</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-white">
                        Max {item.quiz.marks} Marks
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">
                        {item.quiz.questionsCount} Questions
                      </div>
                    </div>

                    <button
    onClick={() => onOpenReviewQuizModal(item.quiz, item.submission)}
    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
  >
                      <Award className="w-3.5 h-3.5" />
                      <span>Review & Award Marks</span>
                    </button>
                  </div>
                </div>)}
            </div>}
        </div>}
    </div>;
};
