import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectEnrolledCourses,
  selectAssignments,
  selectDashboardQuizzes,
} from "../../../store/slices/studentDashboardSlice";
import { getCourseImage } from "../../../utils/courseImageUtils";

const OverviewTab = ({ onOpenSubmitModal }) => {
  const navigate = useNavigate();
  const enrolledCourses = useSelector(selectEnrolledCourses) || [];
  const assignments = useSelector(selectAssignments) || [];
  const quizzes = useSelector(selectDashboardQuizzes) || [];

  const [quizFilter, setQuizFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");

  // Sample or real quizzes
  const displayQuizzes = quizzes.length > 0 ? quizzes : [
    {
      id: 101,
      title: "Thermodynamics & Heat Capacity",
      course_title: "Physics",
      score: 18,
      max_score: 20,
      status: "pass",
    },
    {
      id: 102,
      title: "Calculus & Integration Methods",
      course_title: "Mathematics",
      score: 42,
      max_score: 50,
      status: "pass",
    },
    {
      id: 103,
      title: "World War I & Modern Treaties",
      course_title: "History",
      score: 65,
      max_score: 100,
      status: "fail",
    },
    {
      id: 104,
      title: "Organic Chemistry Nomenclature",
      course_title: "Chemistry",
      score: 28,
      max_score: 30,
      status: "pass",
    },
    {
      id: 105,
      title: "Grammar & Composition Test 2",
      course_title: "English",
      score: 19,
      max_score: 20,
      status: "pass",
    },
  ];

  const filteredQuizzes = displayQuizzes.filter((q) => {
    if (quizFilter === "all") return true;
    if (quizFilter === "pass") return q.status === "pass" || (q.score && q.score / q.max_score >= 0.7);
    if (quizFilter === "fail") return q.status === "fail" || (q.score && q.score / q.max_score < 0.7);
    if (quizFilter === "pending") return q.status === "pending" || !q.score;
    return true;
  });

  // Sample or real assignments
  const displayAssignments = assignments.length > 0 ? assignments : [
    {
      id: 201,
      title: "Quantum Mechanics Essay",
      course_title: "Physics",
      due_date: "2025-11-20",
      status: "submitted",
      grade: "A-",
    },
    {
      id: 202,
      title: "Calculus Problem Set 4",
      course_title: "Mathematics",
      due_date: "2025-12-01",
      status: "pending",
    },
    {
      id: 203,
      title: "Industrial Revolution Analysis",
      course_title: "History",
      due_date: "2025-11-15",
      status: "overdue",
    },
    {
      id: 204,
      title: "Lab Report: Acid-Base Titration",
      course_title: "Chemistry",
      due_date: "2025-12-05",
      status: "pending",
    },
    {
      id: 205,
      title: "Cold War Historiography Essay",
      course_title: "History",
      due_date: "2025-12-12",
      status: "pending",
    },
    {
      id: 206,
      title: "Classical Poetry Analysis",
      course_title: "Urdu",
      due_date: "2025-12-18",
      status: "pending",
    },
  ];

  const sampleCourses = [
    {
      id: "crs-1",
      title: "Cambridge IGCSE Mathematics",
      teacher: { username: "Dr. A. Vance" },
      progress_percent: 78,
    },
    {
      id: "crs-2",
      title: "IGCSE Physics (0625)",
      teacher: { username: "Prof. Einstein" },
      progress_percent: 85,
    },
    {
      id: "crs-3",
      title: "Cambridge Chemistry (0620)",
      teacher: { username: "Dr. Curie" },
      progress_percent: 64,
    },
    {
      id: "crs-4",
      title: "English Language & Literature",
      teacher: { username: "Ms. Shakespeare" },
      progress_percent: 92,
    },
  ];

  const displayCourses = enrolledCourses.length > 0 ? enrolledCourses : sampleCourses;

  const filteredAssignments = displayAssignments.filter((a) => {
    if (assignmentFilter === "all") return true;
    return a.status === assignmentFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top 2 Cards: Current Standing + All Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Current Standing Card */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Current Standing
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
              Term 1 Status
            </span>
          </div>

          <div className="flex items-center gap-6 my-2">
            {/* Circular Gauge Ring */}
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
                  strokeDasharray="90, 100"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-white font-poppins leading-none">
                  4.5
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  GPA
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">Academic Progress</span>
                  <span className="text-indigo-400 font-bold">Top 10%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full w-[90%]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Credits</p>
                  <p className="text-sm font-black text-white mt-0.5">42 / 120</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Ranking</p>
                  <p className="text-sm font-black text-indigo-400 mt-0.5">5th in Cohort</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Quizzes & Tests (ALL Quizzes Displayed) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Quizzes & Tests Performance ({filteredQuizzes.length})
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg text-[10px] font-bold">
              {["all", "pass", "fail"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setQuizFilter(filter)}
                  className={`px-2 py-0.5 rounded-md uppercase transition cursor-pointer ${
                    quizFilter === filter ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
            {filteredQuizzes.map((q) => {
              const isPass = q.status === "pass" || (q.score && q.score / q.max_score >= 0.7);
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <h4 className="text-xs font-bold text-white truncate">{q.title}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{q.course_title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {q.score !== undefined && q.max_score ? `${q.score}/${q.max_score}` : "Pending"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isPass ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {isPass ? "Pass" : "Fail"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assignment Tracker Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fas fa-clipboard-list text-indigo-400" />
              Assignment Tracker
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any assignment to view rubric, upload work, or inspect submitted feedback.
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-slate-500">
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssignments.map((a) => {
                const isOverdue = a.status === "overdue";
                const isSubmitted = a.status === "submitted";

                return (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-file-alt text-slate-400 text-xs" />
                        <span>{a.title}</span>
                      </div>
                      {a.grade && (
                        <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                          Grade: {a.grade}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">{a.course_title}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{a.due_date}</td>
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
                          onClick={() => onOpenSubmitModal(a)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                        >
                          View Work
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
                          Submit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Courses Section */}
      <div id="courses" className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fas fa-graduation-cap text-indigo-400" />
              My Enrolled Courses ({displayCourses.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current curriculum frameworks and syllabus completion progress
            </p>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition"
          >
            <span>Explore More</span>
            <i className="fas fa-arrow-right text-[10px]" />
          </button>
        </div>

        {displayCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayCourses.map((c, i) => {
              const imgUrl = getCourseImage(c, i);
              const progress = c.progress_percent ?? (60 + (i * 10) % 35);

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
          <div className="text-center py-8 bg-white/[0.02] rounded-xl border border-white/5">
            <i className="fas fa-book-reader text-2xl text-slate-500 mb-2" />
            <p className="text-xs text-slate-400">No course enrollments active yet.</p>
            <button
              onClick={() => navigate("/courses")}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
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
