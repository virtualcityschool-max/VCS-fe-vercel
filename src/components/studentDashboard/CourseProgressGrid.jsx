import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectEnrolledCourses } from "../../store/slices/studentDashboardSlice";

const CourseProgressGrid = () => {
  const enrolledCourses = useSelector(selectEnrolledCourses);
  const navigate = useNavigate();

  const handleExploreCourses = () => {
    navigate("/courses");
  };

  const getProgressColor = (percent) => {
    if (percent >= 80) return "bg-green-500";
    if (percent >= 60) return "bg-blue-500";
    if (percent >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <section>
        <h2 className="text-xl lg:text-2xl font-bold font-poppins mb-6 border-b border-slate-800 pb-4">
          Enrolled Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div
            onClick={handleExploreCourses}
            className="bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-blue-500/50 transition min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition text-slate-500 group-hover:text-blue-500">
              <i className="fas fa-plus"></i>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-600 group-hover:text-slate-400 text-center">
              Explore Catalog
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-bold font-poppins mb-6 border-b border-slate-800 pb-4">
        Enrolled Courses
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {enrolledCourses.map((course) => (
          <div
            key={course.id}
            className="bg-slate-800 rounded-[2.5rem] border border-slate-700 overflow-hidden group shadow-xl hover:border-blue-500/30 transition flex flex-col h-full"
          >
            {/* Course Thumbnail */}
            <div className="h-32 lg:h-36 bg-slate-700 relative overflow-hidden shrink-0">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <i className="fas fa-book text-3xl lg:text-4xl text-slate-600"></i>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent"></div>
            </div>

            {/* Course Info */}
            <div className="p-6 lg:p-8 flex flex-col flex-1 min-w-0">
              <h4 className="text-lg font-bold mb-2 text-white line-clamp-2">
                {course.title}
              </h4>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Progress Section */}
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500">Progress</span>
                  <span className="text-xs font-bold text-white">
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.progress)}`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>

                <button
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-bold text-sm transition active:scale-95"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CourseProgressGrid;
