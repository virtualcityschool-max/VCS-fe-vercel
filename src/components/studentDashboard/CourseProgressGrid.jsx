import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectEnrolledCourses } from "../../store/slices/studentDashboardSlice";
import { getStorageUrl } from "../../utils/storageUrl";

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

  return (
    <section>
      <h2 className="text-xl lg:text-2xl font-black font-poppins mb-6 border-b border-white/5 pb-4 text-white/90">
        Enrolled Courses
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {enrolledCourses && enrolledCourses.map((course) => (
          <div
            key={course.id}
            className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden group shadow-2xl hover:border-blue-500/20 transition-all duration-500 flex flex-col h-full"
          >
            {/* Course Thumbnail */}
            <div className="h-32 lg:h-36 bg-slate-800 relative overflow-hidden shrink-0">
              {course.thumbnail ? (
                <img
                  src={getStorageUrl(course.thumbnail)}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition duration-700"
                />
              ) : (
                <div className="w-full h-full bg-slate-900/50 flex items-center justify-center">
                  <i className="fas fa-book-open text-slate-700 text-3xl"></i>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            </div>

            {/* Course Info */}
            <div className="p-6 flex flex-col flex-1 min-w-0">
              <h4 className="text-base font-black mb-2 text-white/90 line-clamp-1 tracking-tight">
                {course.title}
              </h4>
              <p className="text-[11px] text-slate-500 mb-6 line-clamp-2 font-medium leading-relaxed">
                {course.description}
              </p>

              {/* Progress Section */}
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                  <span className="text-[10px] font-black text-white">
                    {course.progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-5">
                  <div
                    className={`h-full ${getProgressColor(
                      course.progress
                    )} transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.3)]`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>

                <button
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 active:scale-95"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Always Show Explore Courses Card */}
        <div
          onClick={handleExploreCourses}
          className="bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 min-h-[280px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-blue-500/20 group-hover:bg-blue-500/10 transition-all duration-500 text-slate-500 group-hover:text-blue-400">
            <i className="fas fa-plus text-xl"></i>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-400/80 text-center transition-colors">
            Explore Courses
          </p>
          <p className="text-[10px] text-slate-600 mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
            Discover new learning paths
          </p>
        </div>
      </div>
    </section>
  );
};

export default CourseProgressGrid;
