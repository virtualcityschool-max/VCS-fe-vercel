import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectEnrolledCourses,
  selectAssignments,
  selectDashboardQuizzes,
} from "../../../store/slices/studentDashboardSlice";
import { getCourseImage } from "../../../utils/courseImageUtils";
import { useDateFormatters } from "../../../hooks/useDateFormatters";

const OverviewTab = ({ onOpenSubmitModal }) => {
  const navigate = useNavigate();
  const { formatDate } = useDateFormatters();
  const enrolledCourses = useSelector(selectEnrolledCourses) || [];
  const assignments = useSelector(selectAssignments) || [];
  const quizzes = useSelector(selectDashboardQuizzes) || [];

  const [quizFilter, setQuizFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");

  // Real quiz statistics & filtering (NO dummy fallback arrays)
  const completedQuizzes = quizzes.filter(
    (q) =>
      q.my_submission &&
      (q.my_submission.status === "submitted" ||
        q.my_submission.status === "graded" ||
        q.my_submission.status === "auto_graded")
  );

  const filteredQuizzes = quizzes.filter((q) => {
    if (quizFilter === "all") return true;
    const sub = q.my_submission;
    if (quizFilter === "completed") {
      return (
        sub &&
        (sub.status === "submitted" ||
          sub.status === "graded" ||
          sub.status === "auto_graded")
      );
    }
    if (quizFilter === "pending") {
      return (
        !sub ||
        (sub.status !== "submitted" &&
          sub.status !== "graded" &&
          sub.status !== "auto_graded")
      );
    }
    return true;
  });

  // Real assignment statistics & filtering (NO dummy fallback arrays)
  const submittedAssignments = assignments.filter(
    (a) => a.status === "submitted" || a.status === "graded"
  );

  const filteredAssignments = assignments.filter((a) => {
    if (assignmentFilter === "all") return true;
    return a.status === assignmentFilter;
  });

  // Calculate real student progress
  const totalTasks = assignments.length + quizzes.length;
  const completedTasks = submittedAssignments.length + completedQuizzes.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top 2 Cards: Real Academic Standing + Real Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Academic Standing Card (Real metrics) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Academic Standing
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
              Active Term
            </span>
          </div>

          <div className="flex items-center gap-5 my-2">
            {/* Circular Gauge Ring showing real task completion */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-white font-poppins leading-none">
                  {progressPercent}%
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Tasks
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">Task Completion</span>
                  <span className="text-indigo-400 font-bold">
                    {completedTasks} / {totalTasks}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-[9px] uppercase font-bold text-slate-500">Enrolled</p>
                  <p className="text-sm font-black text-white mt-0.5">
                    {enrolledCourses.length} Course{enrolledCourses.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-[9px] uppercase font-bold text-slate-500">Membership</p>
                  <p className="text-xs font-black text-emerald-400 mt-1">Good Standing</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Submissions: <strong className="text-white">{submittedAssignments.length} done</strong></span>
            <span>Quizzes: <strong className="text-white">{completedQuizzes.length} done</strong></span>
          </div>
        </div>

        {/* 2. Quizzes & Tests Performance (Real Quizzes & Exact Scores) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Quizzes &amp; Tests ({filteredQuizzes.length})
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg text-[10px] font-bold">
              {["all", "pending", "completed"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setQuizFilter(filter)}
                  className={`px-2 py-0.5 rounded-md uppercase transition cursor-pointer ${
                    quizFilter === filter
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredQuizzes.length > 0 ? (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {filteredQuizzes.map((q) => {
                const sub = q.my_submission;
                const hasScore =
                  sub &&
                  (sub.status === "graded" || sub.status === "auto_graded") &&
                  sub.obtained_marks != null;
                const isSubmitted = sub && sub.status === "submitted";

                return (
                  <div
                    key={q.id}
                    onClick={() => navigate(`/student/quizzes/${q.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 transition cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition">
                        {q.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {q.course_title || "Course Quiz"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {hasScore ? (
                        <div className="text-right">
                          <span className="text-xs font-mono font-black text-emerald-400">
                            {sub.obtained_marks} / {sub.total_marks_snapshot ?? q.total_marks}
                          </span>
                          <span className="block text-[9px] text-slate-400 font-mono">
                            {Math.round(
                              (sub.obtained_marks /
                                (sub.total_marks_snapshot ?? q.total_marks)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {q.total_marks} Marks
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          hasScore
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            : isSubmitted
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                            : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                        }`}
                      >
                        {hasScore ? "Graded" : isSubmitted ? "Submitted" : "Attempt"}
                      </span>

                      <i className="fas fa-chevron-right text-[10px] text-slate-500 group-hover:text-white transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-white/[0.02] rounded-xl border border-white/5 my-auto">
              <i className="fas fa-question-circle text-2xl text-slate-600 mb-2" />
              <p className="text-xs font-bold text-white">No Quizzes Found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {quizFilter === "all"
                  ? "Quizzes published by your teachers will appear here with instant results."
                  : `No ${quizFilter} quizzes at this time.`}
              </p>
            </div>
          )}

          <div className="pt-2 text-right">
            <button
              onClick={() => navigate("/student?tab=assessments&subtab=quizzes")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All Quizzes &amp; Solve</span>
              <i className="fas fa-arrow-right text-[10px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Tracker Table (Real Assignments & Teacher Marking) */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fas fa-clipboard-list text-indigo-400" />
              Assignment Tracker ({filteredAssignments.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect teacher feedback, submit work, or check rubric evaluations.
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white/5 p-1 rounded-xl text-xs font-bold">
            {["all", "pending", "overdue", "submitted"].map((status) => (
              <button
                key={status}
                onClick={() => setAssignmentFilter(status)}
                className={`px-2.5 py-1 rounded-lg uppercase text-[10px] transition cursor-pointer ${
                  assignmentFilter === status
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredAssignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-slate-500">
                  <th className="py-2.5 px-3">Assignment Title</th>
                  <th className="py-2.5 px-3">Course</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Marking &amp; Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAssignments.map((a) => {
                  const isOverdue = a.status === "overdue";
                  const isSubmitted = a.status === "submitted" || a.status === "graded";
                  const hasMark = a.my_score?.score != null;

                  return (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-file-alt text-slate-400 text-xs" />
                          <span>{a.title}</span>
                        </div>
                        {hasMark && (
                          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5 font-mono">
                            Marking: {a.my_score.score} / {a.my_score.max_score}
                          </span>
                        )}
                        {!hasMark && a.grade && (
                          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                            Grade: {a.grade}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">
                        {a.course_title || a.course?.title || "Enrolled Course"}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {a.due_date ? formatDate(a.due_date) : "Open"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isSubmitted
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : isOverdue
                              ? "bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isSubmitted ? (
                          <button
                            onClick={() => navigate(`/student/assignments/${a.id}`)}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <span>View Feedback</span>
                            <i className="fas fa-chevron-right text-[9px]" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenSubmitModal(a)}
                            className={`px-3 py-1 rounded-lg text-white text-xs font-bold transition shadow-sm cursor-pointer ${
                              isOverdue
                                ? "bg-red-600 hover:bg-red-500 shadow-red-900/20"
                                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20"
                            }`}
                          >
                            Submit Work
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-white/5">
            <i className="fas fa-tasks text-2xl text-slate-600 mb-2" />
            <p className="text-xs font-bold text-white">No Assignments Posted Yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Course assignments, rubrics, and deadlines will appear here once published by faculty.
            </p>
          </div>
        )}
      </div>

      {/* My Courses Section (Real Enrolled Courses) */}
      <div id="courses" className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fas fa-graduation-cap text-indigo-400" />
              My Enrolled Courses ({enrolledCourses.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current curriculum frameworks and syllabus completion progress
            </p>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Explore More</span>
            <i className="fas fa-arrow-right text-[10px]" />
          </button>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {enrolledCourses.map((c, i) => {
              const imgUrl = getCourseImage(c, i);
              const progress = c.progress_percent ?? 0;

              return (
                <div
                  key={c.id}
                  className="rounded-xl overflow-hidden bg-slate-800/50 border border-white/5 hover:border-indigo-500/30 transition flex flex-col group"
                >
                  <div className="relative h-28 bg-slate-800 overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 text-indigo-400">
                        <i className="fas fa-book-open text-2xl" />
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white">
                      Progress: {progress}%
                    </span>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-indigo-300 transition">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Tutor: {c.teacher?.username || "Assigned Faculty"}
                      </p>
                    </div>

                    <div>
                      <div className="w-full h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-white/5 space-y-3">
            <i className="fas fa-book-reader text-3xl text-slate-600" />
            <div>
              <p className="text-sm font-bold text-white">No Course Enrollments Active Yet</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore our Cambridge IGCSE &amp; secondary education catalog to enroll.
              </p>
            </div>
            <button
              onClick={() => navigate("/courses")}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Browse Course Catalog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
