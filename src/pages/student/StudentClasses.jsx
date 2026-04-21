import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudentSessions,
  fetchStudentDashboard,
} from "../../store/slices/studentDashboardSlice";
import SessionCalendarView from "../../components/common/SessionCalendarView";
import axiosInstance from "../../utils/axiosInstance";

const StudentClasses = () => {
  const dispatch = useDispatch();
  const { sessions, isFetchingSessions, enrolledCourses } = useSelector(
    (state) => state.studentDashboard,
  );

  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Fetch courses from /courses/ for the dropdown
  useEffect(() => {
    setCoursesLoading(true);
    axiosInstance
      .get("/courses/")
      .then((res) => {
        const data = res.data?.results || res.data?.data || res.data;
        const all = Array.isArray(data) ? data : [];
        setCourses(all.filter((c) => c.is_enrolled === true));
      })
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  // Re-fetch sessions whenever course filter changes
  useEffect(() => {
    const params = selectedCourse ? { course: selectedCourse } : {};
    dispatch(fetchStudentSessions(params));
  }, [dispatch, selectedCourse]);

  const sessionList = Array.isArray(sessions) ? sessions : [];

  return (
    <div className="p-6 lg:p-12 space-y-6">
      {/* Header + filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">My Classes</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your scheduled sessions</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={coursesLoading}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px] disabled:opacity-50"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
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

      <SessionCalendarView sessions={sessionList} loading={!!isFetchingSessions} />
    </div>
  );
};

export default StudentClasses;
