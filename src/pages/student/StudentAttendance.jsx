import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyAttendance,
  selectMyAttendance,
  selectMyAttendanceLoading,
} from "../../store/slices/studentDashboardSlice";
import { fetchTeacherSessions } from "../../store/slices/teacherSlice";
import axiosInstance from "../../utils/axiosInstance";
import { FilterSelect } from "../../components/ui";
import AttendanceMatrix from "../../components/common/AttendanceMatrix";

const StudentAttendance = () => {
  const dispatch   = useDispatch();
  const attendance = useSelector(selectMyAttendance);
  const isAttendanceLoading = useSelector(selectMyAttendanceLoading);
  const { sessions, loadingSessions } = useSelector((s) => s.teachers);
  const profile    = useSelector((s) => s.auth.profile);

  const [courses, setCourses]             = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseId, setCourseId]           = useState("");

  // const parentSessions = useMemo(
  //   () => (sessions || []).filter((s) => s.is_child === false || s.is_child == null),
  //   [sessions]
  // );

  const isLoading = isAttendanceLoading || loadingSessions || coursesLoading;

  useEffect(() => {
    setCoursesLoading(true);
    axiosInstance
      .get("/courses/")
      .then((res) => {
        const data = res.data?.results ?? res.data?.data ?? res.data;
        const all  = Array.isArray(data) ? data : [];
        const enrolled = all.filter((c) => c.is_enrolled === true);
        setCourses(enrolled);
        if (enrolled.length) setCourseId(String(enrolled[0].id));
      })
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    if (!courseId) return;
    dispatch(fetchTeacherSessions({ course: courseId }));
    dispatch(fetchMyAttendance({ course: courseId }));
  }, [dispatch, courseId]);

  return (
    <div className="text-white px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-poppins">My Attendance</h1>
          <p className="text-slate-400 text-sm mt-1">Track your session attendance across all courses.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {coursesLoading ? (
            <div className="h-10 w-48 bg-slate-800 rounded-xl animate-pulse" />
          ) : (
            <FilterSelect value={courseId} onChange={(e) => setCourseId(e.target.value)} style={{ minWidth: 160 }}>
              {courses.length === 0
                ? <option value="">No enrolled courses</option>
                : courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)
              }
            </FilterSelect>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl" />
        </div>
      ) : (
        <AttendanceMatrix
          sessions={sessions}
          attendanceRecords={attendance || []}
          enrolledStudents={profile?.id ? [{ id: profile.id, username: profile.username, first_name: profile.first_name, last_name: profile.last_name }] : []}
          participantRole="student"
        />
      )}
    </div>
  );
};

export default StudentAttendance;
