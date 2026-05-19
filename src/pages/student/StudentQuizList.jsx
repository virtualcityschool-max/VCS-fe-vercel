import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchStudentQuizzes } from "../../store/slices/studentDashboardSlice";
import { FilterSelect } from "../../components/ui";
import { useDateFormatters } from "../../hooks";

const statusConfig = (sub) => {
  if (!sub || sub.status === "pending") return { label: "Pending",    color: "text-yellow-400 bg-yellow-500/10" };
  if (sub.status === "missed")          return { label: "overdue",     color: "text-red-400 bg-red-500/10" };
  if (sub.status === "submitted")       return { label: "Submitted",  color: "text-blue-400 bg-blue-500/10" };
  if (sub.status === "auto_graded")     return { label: "Graded",     color: "text-emerald-400 bg-emerald-500/10" };
  if (sub.status === "graded")          return { label: "Graded",     color: "text-emerald-400 bg-emerald-500/10" };
  return { label: sub.status, color: "text-slate-400 bg-slate-500/10" };
};

const StudentQuizList = ({ hideHeader = false, filterCourse: externalFilterCourse }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatTime } = useDateFormatters();
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

      {/* Sections Layout */}
      <div className="space-y-12">
        {/* ── Pending Section ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
              <i className="fas fa-hourglass-half text-xs"></i>
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Pending & Overdue Quizzes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes?.filter(q => !q.my_submission || (q.my_submission.status !== "submitted" && q.my_submission.status !== "graded" && q.my_submission.status !== "auto_graded")).length > 0 ? (
              [...quizzes]
                .filter(q => !q.my_submission || (q.my_submission.status !== "submitted" && q.my_submission.status !== "graded" && q.my_submission.status !== "auto_graded"))
                .sort((a, b) => {
                  const aStatus = a.my_submission?.status || "pending";
                  const bStatus = b.my_submission?.status || "pending";
                  
                  // Primary sort: 'pending' before 'missed'
                  if (aStatus === "pending" && bStatus !== "pending") return -1;
                  if (aStatus !== "pending" && bStatus === "pending") return 1;
                  
                  // Secondary sort: created_at desc
                  return new Date(b.created_at) - new Date(a.created_at);
                })
                .map((quiz) => {
                  const { label, color } = statusConfig(quiz.my_submission);
                  return (
                    <div
                      key={quiz.id}
                      onClick={() => navigate(`/student/quizzes/${quiz.id}`)}
                      className="group relative cursor-pointer glass p-5 rounded-3xl border-slate-800 hover:border-indigo-500/50 hover-lift transition-all duration-300 overflow-hidden flex flex-col h-full"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex flex-col h-full z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                            <i className="fas fa-question-circle text-lg" />
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <span className={`${color} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md border border-white/5`}>
                              {label}
                            </span>
                          </div>
                        </div>
                        <div className="mb-auto">
                          <p className="text-[9px] text-indigo-400/80 uppercase tracking-[0.2em] font-black mb-1">
                            {quiz.course_title}
                          </p>
                          <h2 className="font-bold text-white text-base leading-snug group-hover:text-indigo-200 transition-colors">
                            {quiz.title}
                          </h2>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-indigo-400/70">
                                <i className="fas fa-star text-[10px]" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] text-slate-500 uppercase font-black leading-none mb-0.5">Marks</span>
                                <span className="text-[11px] text-slate-300 font-bold">{quiz.total_marks}</span>
                              </div>
                            </div>
                          </div>
                          {quiz.due_date && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-rose-400/70">
                                  <i className="far fa-calendar-alt text-[10px]" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[8px] text-slate-500 uppercase font-black leading-none mb-0.5">Due</span>
                                  <span className="text-[11px] font-bold">
                                    {new Date(quiz.due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {formatTime(quiz.due_date)}
                                  </span>
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-indigo-600 transition-all duration-300">
                                <i className="fas fa-arrow-right text-[10px]" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="col-span-full glass p-10 rounded-[2rem] border-slate-800/50 text-center bg-emerald-500/[0.02]">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-4">
                  <i className="fas fa-check-circle text-xl" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">All Caught Up!</h3>
                <p className="text-slate-500 text-xs max-w-xs mx-auto">
                  You've attempted all available quizzes. Great job!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Submitted Section ── */}
        <div className="space-y-6 opacity-80 hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <i className="fas fa-check-double text-xs"></i>
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Completed Quizzes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes?.filter(q => q.my_submission && (q.my_submission.status === "submitted" || q.my_submission.status === "graded" || q.my_submission.status === "auto_graded")).length > 0 ? (
              [...quizzes]
                .filter(q => q.my_submission && (q.my_submission.status === "submitted" || q.my_submission.status === "graded" || q.my_submission.status === "auto_graded"))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((quiz) => {
                  const { label, color } = statusConfig(quiz.my_submission);
                  const sub = quiz.my_submission;
                  const hasScore = (sub.status === "graded" || sub.status === "auto_graded") && sub.obtained_marks != null;
                  return (
                    <div
                      key={quiz.id}
                      onClick={() => navigate(`/student/quizzes/${quiz.id}`)}
                      className="group relative cursor-pointer glass p-5 rounded-3xl border-slate-800 hover:border-indigo-500/50 hover-lift transition-all duration-300 overflow-hidden flex flex-col h-full grayscale-[0.3] hover:grayscale-0"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex flex-col h-full z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                            <i className="fas fa-check text-lg" />
                          </div>
                          <span className={`${color} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md border border-white/5`}>
                            {label}
                          </span>
                        </div>
                        <div className="mb-auto">
                          <p className="text-[9px] text-indigo-400/80 uppercase tracking-[0.2em] font-black mb-1">
                            {quiz.course_title}
                          </p>
                          <h2 className="font-bold text-white text-base leading-snug group-hover:text-indigo-200 transition-colors">
                            {quiz.title}
                          </h2>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-500">
                                <i className="fas fa-star text-[10px]" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] text-slate-600 uppercase font-black leading-none mb-0.5">Marks</span>
                                <span className="text-[11px] text-slate-400 font-bold">{quiz.total_marks}</span>
                              </div>
                            </div>
                            {hasScore && (
                              <div className="flex items-center gap-2 text-emerald-400">
                                <div className="flex flex-col items-end">
                                  <span className="text-[8px] text-emerald-500/70 uppercase font-black leading-none mb-0.5">Score</span>
                                  <span className="text-[11px] font-black">
                                    {sub.obtained_marks}/{sub.total_marks ?? quiz.total_marks}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-500">
                              <i className="far fa-calendar-check text-[10px]" />
                              <span className="text-[11px] font-bold">Completed</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-indigo-600 transition-all duration-300">
                              <i className="fas fa-arrow-right text-[10px]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="col-span-full border border-dashed border-slate-800 p-8 rounded-[2rem] text-center">
                <p className="text-slate-600 text-[10px] uppercase font-black tracking-widest">No Completed Quizzes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizList;
