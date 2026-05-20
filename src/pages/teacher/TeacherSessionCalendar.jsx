import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeacherSessions, fetchMyCourses } from "../../store/slices/teacherSlice";
import SessionCalendarView from "../../components/common/SessionCalendarView";
import { FilterSelect } from "../../components/ui";

const TeacherSessionCalendar = () => {
  const dispatch = useDispatch();
  const { sessions, loadingSessions, myCourses } = useSelector((state) => state.teachers);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    dispatch(fetchMyCourses());
  }, [dispatch]);

  useEffect(() => {
    const params = selectedCourse ? { course: selectedCourse } : {};
    dispatch(fetchTeacherSessions(params));
  }, [dispatch, selectedCourse]);

  const sessionList = Array.isArray(sessions) ? sessions : [];
  const courses = Array.isArray(myCourses) ? myCourses : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">My Classes</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your scheduled classes in calendar view</p>
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

      <SessionCalendarView sessions={sessionList} loading={!!loadingSessions} />
    </div>
  );
};

export default TeacherSessionCalendar;
