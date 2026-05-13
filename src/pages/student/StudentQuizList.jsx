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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="group relative cursor-pointer glass p-5 rounded-3xl border-slate-800 hover:border-indigo-500/50 hover-lift transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative flex flex-col h-full z-10">
                  {/* Card Header: Icon & Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                      <i className="fas fa-question-circle text-lg" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`${color} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md border border-white/5 flex-shrink-0`}>
                        {label}
                      </span>
                      {(quiz.is_overdue && quiz.my_submission?.status == 'missed') && (
                        <span className="text-[8px] text-rose-400 font-black uppercase tracking-tighter animate-pulse">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Title & Course */}
                  <div className="mb-auto">
                    <p className="text-[9px] text-indigo-400/80 uppercase tracking-[0.2em] font-black mb-1">
                      {quiz.course_title}
                    </p>
                    <h2 className="font-bold text-white text-base leading-snug group-hover:text-indigo-200 transition-colors">
                      {quiz.title}
                    </h2>
                  </div>

                  {/* Card Footer: Metadata (Marks & Score) */}
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

                      {hasScore && (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <i className="fas fa-check-circle text-xs" />
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[8px] text-emerald-500/70 uppercase font-black leading-none mb-0.5">Score</span>
                            <span className="text-[11px] font-black">
                              {sub.obtained_marks}/{sub.total_marks ?? quiz.total_marks}
                            </span>
                          </div>
                        </div>
                      )}
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
                              {new Date(quiz.due_date).toLocaleDateString(undefined, { 
                                day: 'numeric', 
                                month: 'short'
                              })}
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
          <div className="col-span-full glass p-12 rounded-[2rem] border-slate-800 text-center">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-500 mx-auto mb-4">
              <i className="fas fa-question-circle text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Quizzes Available</h3>
            <p className="text-slate-400 max-w-xs mx-auto">
              There are no quizzes for this course at the moment. Keep an eye out for updates!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuizList;
