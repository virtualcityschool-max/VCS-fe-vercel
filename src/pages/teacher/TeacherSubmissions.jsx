import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSubmissions, fetchMyCourses } from "../../store/slices/teacherSlice";
import { FilterSelect } from "../../components/ui";

const TeacherSubmissions = () => {
  const dispatch = useDispatch();
  const { allSubmissions, loadingAllSubmissions, myCourses } = useSelector(
    (state) => state.teachers,
  );

  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    dispatch(fetchMyCourses());
  }, [dispatch]);

  useEffect(() => {
    const params = selectedCourse ? { course: selectedCourse } : {};
    dispatch(fetchAllSubmissions(params));
  }, [dispatch, selectedCourse]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGradeBadge = (submission) => {
    if (!submission.grade && submission.grade !== 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
          Pending
        </span>
      );
    }
    const score = submission.grade?.score ?? submission.grade;
    const max = submission.assignment_max_score || submission.max_score || 100;
    const pct = Math.round((score / max) * 100);
    const color =
      pct >= 80
        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
        : pct >= 50
          ? "bg-blue-500/20 text-blue-400 border-blue-500/20"
          : "bg-red-500/20 text-red-400 border-red-500/20";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
        {score}/{max}
      </span>
    );
  };

  const courses = Array.isArray(myCourses) ? myCourses : [];
  const submissions = Array.isArray(allSubmissions) ? allSubmissions : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Student Submissions</h1>
          <p className="text-slate-400 text-sm mt-0.5">All submissions across your courses</p>
        </div>

        {/* Course filter */}
        <div className="flex items-center gap-2">
          <FilterSelect
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="min-w-[200px]"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </FilterSelect>
          {selectedCourse && (
            <button
              onClick={() => setSelectedCourse("")}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700/70 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-sm transition-all duration-150"
            >
              <i className="fas fa-times text-xs"></i>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      {!loadingAllSubmissions && submissions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total",
              value: submissions.length,
              icon: "fa-file-alt",
              color: "text-indigo-400",
              bg: "bg-indigo-500/10",
            },
            {
              label: "Graded",
              value: submissions.filter((s) => s.grade !== null && s.grade !== undefined).length,
              icon: "fa-check-circle",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Pending",
              value: submissions.filter((s) => s.grade === null || s.grade === undefined).length,
              icon: "fa-clock",
              color: "text-yellow-400",
              bg: "bg-yellow-500/10",
            },
            {
              label: "Courses",
              value: new Set(submissions.map((s) => s.course_id || s.assignment?.course)).size,
              icon: "fa-book-open",
              color: "text-purple-400",
              bg: "bg-purple-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-3"
            >
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <i className={`fas ${stat.icon} ${stat.color}`}></i>
              </div>
              <div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loadingAllSubmissions ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  {["Student", "Assignment", "Course", "Submitted At", "Grade"].map((h) => (
                    <th key={h} className="px-5 py-4 text-xs font-black uppercase text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-700 rounded w-28"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-inbox text-slate-400 text-xl"></i>
            </div>
            <p className="text-white font-bold mb-1">No Submissions Found</p>
            <p className="text-slate-400 text-sm">
              {selectedCourse
                ? "No submissions for the selected course."
                : "No student submissions yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-slate-800/50">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-4 hover:bg-slate-800/30 transition">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-bold text-white text-sm">
                        {sub.student_name || sub.student?.username || `Student #${sub.student}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sub.assignment_title || sub.assignment?.title || "—"}
                      </p>
                      <p className="text-xs text-indigo-400 mt-0.5">
                        {sub.course_title || sub.assignment?.course_title || "—"}
                      </p>
                    </div>
                    {getGradeBadge(sub)}
                  </div>
                  <p className="text-xs text-slate-500">
                    <i className="fas fa-calendar mr-1"></i>
                    {formatDate(sub.submitted_at || sub.created_at)}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Student</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Assignment</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Course</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Submitted At</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-indigo-600/20 rounded-full flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                            {(sub.student_name || sub.student?.username || "?")[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-white text-sm">
                            {sub.student_name || sub.student?.username || `Student #${sub.student}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm">
                        {sub.assignment_title || sub.assignment?.title || "—"}
                      </td>
                      <td className="px-5 py-4 text-indigo-400 text-sm">
                        {sub.course_title || sub.assignment?.course_title || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-sm">
                        {formatDate(sub.submitted_at || sub.created_at)}
                      </td>
                      <td className="px-5 py-4">{getGradeBadge(sub)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherSubmissions;
