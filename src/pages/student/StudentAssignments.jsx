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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments?.length ? (
          [...assignments]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((assignment) => {
            const config = getStatusConfig(assignment);

            return (
              <div
                key={assignment.id}
                onClick={() =>
                  navigate(`/student/assignments/${assignment.id}`)
                }
                className="group relative cursor-pointer glass p-5 rounded-3xl border-slate-800 hover:border-indigo-500/50 hover-lift transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative flex flex-col h-full z-10">
                  {/* Card Header: Type Icon & Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                      <i className="fas fa-file-alt text-lg" />
                    </div>
                    <span
                      className={`${config.color} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md border border-white/5`}
                    >
                      {config.label}
                    </span>
                  </div>

                  {/* Card Body: Title & Course */}
                  <div className="mb-auto">
                    <p className="text-[9px] text-indigo-400/80 uppercase tracking-[0.2em] font-black mb-1">
                      {assignment.course_title}
                    </p>
                    <h2 className="font-bold text-white text-base leading-snug group-hover:text-indigo-200 transition-colors">
                      {assignment.title}
                    </h2>
                  </div>

                  {/* Card Footer: Metadata */}
                  <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-indigo-400/70">
                        <i className="far fa-calendar-alt text-xs" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 uppercase font-black leading-none mb-0.5">Due</span>
                        <span className="text-[11px] text-slate-300 font-bold">
                          {new Date(assignment.due_date).toLocaleDateString(undefined, { 
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
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full glass p-12 rounded-[2rem] border-slate-800 text-center">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-500 mx-auto mb-4">
              <i className="fas fa-clipboard-list text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Assignments Found</h3>
            <p className="text-slate-400 max-w-xs mx-auto">
              You're all caught up! There are no assignments for this course at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;
