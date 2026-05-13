import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchParentDashboard,
  fetchChildCourses,
  selectChildCourses,
  selectChildCoursesLoading,
} from "../../store/slices/parentSlice";
import {
  fetchTeacherSessions,
  fetchAllAttendance,
} from "../../store/slices/teacherSlice";
import AttendanceMatrix from "../../components/common/AttendanceMatrix";
import { FilterSelect } from "../../components/ui";

const ParentAttendance = () => {
  const dispatch = useDispatch();

  const { data: dashboardData, loading: dashLoading } = useSelector((s) => s.parent.dashboard);
  const childCoursesMap = useSelector(selectChildCourses);
  const { sessions, loadingSessions, allAttendance, loadingAllAttendance } = useSelector((s) => s.teachers);

  const children = dashboardData?.children ?? [];

  const [childId,  setChildId]  = useState("");
  const [courseId, setCourseId] = useState("");

  const isCoursesLoading = useSelector(selectChildCoursesLoading(childId));

  const courses = childId ? (childCoursesMap[childId] ?? []) : [];
  const isLoading = dashLoading || isCoursesLoading || loadingSessions || loadingAllAttendance;

  // const parentSessions = useMemo(
  //   () => (sessions || []).filter((s) => s.is_child === false || s.is_child == null),
  //   [sessions]
  // );

  useEffect(() => {
    if (!dashboardData) dispatch(fetchParentDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (children.length && !childId) setChildId(String(children[0].id));
  }, [children]);

  useEffect(() => {
    if (!childId) return;
    setCourseId("");
    if (!childCoursesMap[childId]) dispatch(fetchChildCourses(childId));
  }, [childId]);

  useEffect(() => {
    if (courses.length && !courseId) setCourseId(String(courses[0].id));
  }, [courses]);

  useEffect(() => {
    if (!courseId || !childId) return;
    dispatch(fetchTeacherSessions({ course: courseId }));
    dispatch(fetchAllAttendance({ course: courseId, student: childId }));
  }, [dispatch, courseId, childId]);

  const activeChild = children.find((c) => String(c.id) === childId);

  return (
    <div className="text-white px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-poppins">Child Attendance</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor your child's session attendance.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Child</span>
            <FilterSelect
              value={childId}
              onChange={(e) => { setChildId(e.target.value); setCourseId(""); }}
              style={{ width: 300 }}
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {`${c.username || c.name} (ID: ${c.id})`}
                </option>
              ))}
            </FilterSelect>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Course</span>
            <FilterSelect
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={!courses.length}
              style={{ width: 200 }}
            >
              {courses.length === 0
                ? <option value="">No courses</option>
                : courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)
              }
            </FilterSelect>
          </div>
        </div>
      </div>

      {activeChild && (
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/40 rounded-xl border border-white/5 w-fit">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">
            {(activeChild.username || "?")[0].toUpperCase()}
          </div>
          <span className="text-xs font-medium text-slate-400">
            Viewing <span className="text-white font-black ml-1">{activeChild.username || activeChild.name}</span>
          </span>
        </div>
      )}

      {!childId ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <i className="fas fa-user-friends text-slate-600 text-3xl mb-3" />
          <p className="text-slate-300 font-semibold">No children linked</p>
          <p className="text-slate-500 text-sm mt-1">Link a child account to view attendance.</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl" />
        </div>
      ) : (
        <AttendanceMatrix
          sessions={sessions}
          attendanceRecords={allAttendance || []}
          participantRole="student"
        />
      )}
    </div>
  );
};

export default ParentAttendance;
