import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeacherSessions, fetchMyCourses } from "../../store/slices/teacherSlice";
import SessionCalendarView from "../../components/common/SessionCalendarView";

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
          <h1 className="text-2xl font-black text-white">My Sessions</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your scheduled classes in calendar view</p>
        </div>

        {/* Course filter */}
        <div className="flex items-center gap-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          {selectedCourse && (
            <button
              onClick={() => setSelectedCourse("")}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition flex items-center gap-1.5"
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
