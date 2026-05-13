import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchStudentQuizzes } from "../../store/slices/studentDashboardSlice";
import { FilterSelect } from "../../components/ui";

const statusConfig = (sub) => {
  if (!sub || sub.status === "pending") return { label: "Pending",    color: "text-yellow-400 bg-yellow-500/10" };
  if (sub.status === "missed")          return { label: "Missed",     color: "text-red-400 bg-red-500/10" };
  if (sub.status === "submitted")       return { label: "Submitted",  color: "text-blue-400 bg-blue-500/10" };
  if (sub.status === "auto_graded")     return { label: "Graded",     color: "text-emerald-400 bg-emerald-500/10" };
  if (sub.status === "graded")          return { label: "Graded",     color: "text-emerald-400 bg-emerald-500/10" };
  return { label: sub.status, color: "text-slate-400 bg-slate-500/10" };
};

const StudentQuizList = ({ hideHeader = false, filterCourse: externalFilterCourse }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quizzes, isFetchingQuizzes } = useSelector((s) => s.studentDashboard);

  const filterCourse = externalFilterCourse || "";

  useEffect(() => {
    dispatch(fetchStudentQuizzes(filterCourse ? { course: filterCourse } : {}));
  }, [dispatch, filterCourse]);

  const courseOptions = useMemo(() => {
    const map = new Map();
    (quizzes ?? []).forEach((q) => {
      if (q.course && q.course_title) map.set(q.course, q.course_title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [quizzes]);

  if (isFetchingQuizzes && !quizzes?.length) {
    return (
      <div className="flex items-center justify-center py-16 text-white">
        <i className="fas fa-spinner animate-spin text-2xl" />
      </div>
    );
  }

  const filterRow = (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <FilterSelect value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} style={{ minWidth: 160 }}>
        <option value="">All Courses</option>
        {courseOptions.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </FilterSelect>
    </div>
  );

  return (
    <div>
      {!hideHeader && (
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-poppins mb-2">All Quizzes</h1>
            <p className="text-slate-400 text-sm">View and attempt all your quizzes in one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <FilterSelect value={filterCourse} onChange={() => {}} style={{ minWidth: 160 }}>
              <option value="">All Courses</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </FilterSelect>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {quizzes?.length ? (
          quizzes.map((quiz) => {
            const { label, color } = statusConfig(quiz.my_submission);
            const sub = quiz.my_submission;
            const isFullyGraded = sub && (sub.status === "graded" || sub.status === "auto_graded");
            const hasScore = isFullyGraded && sub.obtained_marks != null;

            return (
              <div
                key={quiz.id}
                onClick={() => navigate(`/student/quizzes/${quiz.id}`)}
                className="cursor-pointer bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500 transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-white text-lg">{quiz.title}</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{quiz.course_title}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {quiz.total_marks} marks
                      {quiz.due_date && <> &nbsp;·&nbsp; Due {new Date(quiz.due_date).toLocaleDateString()}</>}
                      {(quiz.is_overdue && quiz.my_submission?.status == 'missed') && <span className="ml-2 text-rose-400 font-semibold">· Overdue</span>}
                    </p>
                    {hasScore && (
                      <p className="text-xs text-emerald-400 mt-1 font-semibold">
                        Score: {sub.obtained_marks} / {sub.total_marks ?? quiz.total_marks}
                        {sub.percentage != null && ` (${sub.percentage}%)`}
                      </p>
                    )}
                  </div>
                  <span className={`${color} px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest flex-shrink-0`}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-400 text-sm">
            No quizzes available yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuizList;
