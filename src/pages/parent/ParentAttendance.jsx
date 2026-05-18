import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchParentDashboard,
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
  const { sessions, loadingSessions, allAttendance, loadingAllAttendance } = useSelector((s) => s.teachers);

  const children = dashboardData?.children ?? [];

  const [childId,  setChildId]  = useState("");
  const [courseId, setCourseId] = useState("");

  const activeChild = children.find((c) => String(c.id) === childId);
  const courses = activeChild?.courses ?? [];
  const isLoading = dashLoading || loadingSessions || loadingAllAttendance;

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
  }, [childId]);

  useEffect(() => {
    if (courses.length && !courseId) setCourseId(String(courses[0].id));
  }, [courses]);

  useEffect(() => {
    if (!courseId || !childId) return;
    dispatch(fetchTeacherSessions({ course: courseId }));
    dispatch(fetchAllAttendance({ course: courseId, student: childId }));
  }, [dispatch, courseId, childId]);

  return (
    <div className="text-white px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-poppins text-white">Child Attendance</h1>
            <p className="text-slate-400 text-sm mt-1">Monitor your child's session attendance.</p>
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Child Account</span>
            <FilterSelect
              value={childId}
              onChange={(e) => { setChildId(e.target.value); setCourseId(""); }}
              style={{ width: 260 }}
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.username || c.name}
                </option>
              ))}
            </FilterSelect>
          </div>
        </div>

      {activeChild && (
        <div className="flex items-center gap-4 flex-wrap">
          {/* Course Tabs - Premium Segmented Control */}
          <div className="flex items-center p-1 bg-slate-900/80 rounded-2xl border border-white/5 shadow-2xl overflow-x-auto custom-scrollbar max-w-full pb-2">
            {courses.length > 0 ? (
              courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCourseId(String(c.id))}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 whitespace-nowrap active:scale-95 shrink-0 ${
                    String(courseId) === String(c.id)
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <i className={`fas fa-book-open text-[11px] transition-opacity ${
                    String(courseId) === String(c.id) ? "opacity-100" : "opacity-40"
                  }`}></i>
                  <span>{c.title}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-slate-600 font-bold italic">
                No courses enrolled
              </div>
            )}
          </div>
        </div>
      )}

      {!childId ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <i className="fas fa-user-friends text-slate-600 text-3xl mb-3" />
          <p className="text-slate-300 font-semibold">No children linked</p>
          <p className="text-slate-500 text-sm mt-1">Link a child account to view attendance.</p>
        </div>
      ) : !courseId ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <i className="fas fa-book-open text-slate-600 text-3xl mb-3" />
          <p className="text-slate-300 font-semibold">No course selected</p>
          <p className="text-slate-500 text-sm mt-1">This student is not enrolled in any courses.</p>
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
