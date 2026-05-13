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

      {/* List */}
      <div className="space-y-4">
        {assignments?.length ? (
          assignments.map((assignment) => {
            const config = getStatusConfig(assignment);

            return (
              <div
                key={assignment.id}
                onClick={() =>
                  navigate(`/student/assignments/${assignment.id}`)
                }
                className="cursor-pointer bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500 transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-bold text-white text-lg">
                      {assignment.title}
                    </h2>

                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      {assignment.course_title}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`${config.color} px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest`}
                  >
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-400 text-sm">
            No assignments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;
