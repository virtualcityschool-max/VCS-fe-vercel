import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyCourses } from "../../store/slices/teacherSlice";
import { formatCategoryLabel } from "../../constants";

const TeacherClasses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myCourses, loading, error } = useSelector((state) => state.teachers);

  useEffect(() => {
    if (!myCourses?.length) {
      dispatch(fetchMyCourses());
    }
  }, [dispatch, myCourses?.length]);

  if (loading && !myCourses?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-white">
        <i className="fas fa-spinner animate-spin text-2xl"></i>
      </div>
    );
  }

  if (error && !myCourses?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-black font-poppins mb-2">My Courses</h1>
        <p className="text-slate-400 text-sm">
          Manage and review the courses you are currently teaching.
        </p>
      </div>

      {myCourses?.length > 0 && (
        <div className="mb-6 text-xs text-slate-400">
          Showing {myCourses.length} course{myCourses.length > 1 ? "s" : ""}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {myCourses?.length ? (
          myCourses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/60 transition cursor-pointer group"
              onClick={() => navigate(`/teacher/courses/${course.id}`)}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition truncate">
                    {course.title}
                  </h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                    {formatCategoryLabel(course.category)} • {course.status}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-yellow-400 font-bold text-sm">
                    ⭐ {Number(course.rating || 0).toFixed(1)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-5 line-clamp-3">
                {course.description || "No description available."}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{course.total_enrolled} students</span>
                <span className="flex items-center gap-1.5 text-slate-500 group-hover:text-indigo-400 transition">
                  View details
                  <i className="fas fa-arrow-right text-xs"></i>
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 text-center text-slate-400 text-sm">
            <p className="mb-2 font-semibold text-white">No classes yet</p>
            <p>You haven't created or been assigned any courses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClasses;
