import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchStudentAssignments } from "../../store/slices/studentDashboardSlice";
import { FilterSelect } from "../../components/ui";

const StudentAssignments = ({ hideHeader = false, filterCourse: externalFilterCourse }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { assignments, error, isFetchingAssignments } = useSelector(
    (state) => state.studentDashboard,
  );

  const filterCourse = externalFilterCourse || "";

  useEffect(() => {
    dispatch(fetchStudentAssignments(filterCourse ? { course: filterCourse } : {}));
  }, [dispatch, filterCourse]);

  // Derive course list from all-assignments baseline (no filter applied)
  const courseOptions = useMemo(() => {
    const map = new Map();
    (assignments ?? []).forEach((a) => {
      if (a.course && a.course_title) map.set(a.course, a.course_title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [assignments]);

  const getStatusConfig = (assignment) => {
    if (assignment.status == "overdue") {
      return {
        color: "text-red-500 bg-red-500/10",
        label: "Overdue",
      };
    }

    if (assignment.status == "submitted" || assignment.status == "graded") {
      return {
        color: "text-blue-500 bg-blue-500/10",
        label: "Submitted",
      };
    }

    return {
      color: "text-yellow-500 bg-yellow-500/10",
      label: "Pending",
    };
  };

  if (isFetchingAssignments && !assignments?.length) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-white">
        <i className="fas fa-spinner animate-spin text-2xl"></i>
      </div>
    );
  }

  if (error && !assignments?.length) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-400">
        {error}
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
    <div className={`text-white ${hideHeader ? "" : "px-6 py-8"}`}>
      {!hideHeader && (
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-poppins mb-2">All Assignments</h1>
            <p className="text-slate-400 text-sm">View and manage all your assignments in one place.</p>
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
              <i className="fas fa-clock text-xs"></i>
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Pending & Overdue Assignments</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments?.filter(a => a.status !== "submitted" && a.status !== "graded").length > 0 ? (
              [...assignments]
                .filter(a => a.status !== "submitted" && a.status !== "graded")
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((assignment) => {
                  const config = getStatusConfig(assignment);
                  return (
                    <div
                      key={assignment.id}
                      onClick={() => navigate(`/student/assignments/${assignment.id}`)}
                      className="group relative cursor-pointer glass p-5 rounded-3xl border-slate-800 hover:border-indigo-500/50 hover-lift transition-all duration-300 overflow-hidden flex flex-col h-full"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex flex-col h-full z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                            <i className="fas fa-file-alt text-lg" />
                          </div>
                          <span className={`${config.color} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md border border-white/5`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="mb-auto">
                          <p className="text-[9px] text-indigo-400/80 uppercase tracking-[0.2em] font-black mb-1">
                            {assignment.course_title}
                          </p>
                          <h2 className="font-bold text-white text-base leading-snug group-hover:text-indigo-200 transition-colors">
                            {assignment.title}
                          </h2>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-indigo-400/70">
                              <i className="far fa-calendar-alt text-xs" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] text-slate-500 uppercase font-black leading-none mb-0.5">Due</span>
                              <span className="text-[11px] text-slate-300 font-bold">
                                {new Date(assignment.due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-indigo-600 transition-all duration-300">
                            <i className="fas fa-arrow-right text-[10px]" />
                          </div>
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
                  You have no pending assignments. Great job staying on top of your work!
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
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Submitted Assignments</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments?.filter(a => a.status === "submitted" || a.status === "graded").length > 0 ? (
              [...assignments]
                .filter(a => a.status === "submitted" || a.status === "graded")
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((assignment) => {
                  const config = getStatusConfig(assignment);
                  return (
                    <div
                      key={assignment.id}
                      onClick={() => navigate(`/student/assignments/${assignment.id}`)}
                      className="group relative cursor-pointer glass p-5 rounded-3xl border-slate-800 hover:border-indigo-500/50 hover-lift transition-all duration-300 overflow-hidden flex flex-col h-full grayscale-[0.3] hover:grayscale-0"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex flex-col h-full z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                            <i className="fas fa-check text-lg" />
                          </div>
                          <span className={`${config.color} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md border border-white/5`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="mb-auto">
                          <p className="text-[9px] text-indigo-400/80 uppercase tracking-[0.2em] font-black mb-1">
                            {assignment.course_title}
                          </p>
                          <h2 className="font-bold text-white text-base leading-snug group-hover:text-indigo-200 transition-colors">
                            {assignment.title}
                          </h2>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-500">
                              <i className="far fa-calendar-check text-xs" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] text-slate-600 uppercase font-black leading-none mb-0.5">Submitted</span>
                              <span className="text-[11px] text-slate-400 font-bold italic">
                                Ready for review
                              </span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-indigo-600 transition-all duration-300">
                            <i className="fas fa-arrow-right text-[10px]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="col-span-full border border-dashed border-slate-800 p-8 rounded-[2rem] text-center">
                <p className="text-slate-600 text-[10px] uppercase font-black tracking-widest">No Submissions Yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;
