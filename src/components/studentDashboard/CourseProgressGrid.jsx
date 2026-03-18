import React from "react";
import { useSelector } from "react-redux";
import { selectEnrolledCourses } from "../../store/slices/studentDashboardSlice";

const CourseProgressGrid = () => {
  const enrolledCourses = useSelector(selectEnrolledCourses);

  const getProgressColor = (percent) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 60) return 'bg-blue-500';
    if (percent >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-bold font-poppins mb-6 border-b border-slate-800 pb-4">
          Enrolled Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-blue-500/50 transition">
            <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition text-slate-500 group-hover:text-blue-500">
              <i className="fas fa-plus"></i>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-600 group-hover:text-slate-400">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {enrolledCourses.map((course) => (
          <div 
            key={course.id} 
            className="bg-slate-800 rounded-[2.5rem] border border-slate-700 overflow-hidden group shadow-xl hover:border-blue-500/30 transition"
          >
            {/* Course Thumbnail */}
            <div className="h-36 bg-slate-700 relative overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <i className="fas fa-book text-4xl text-slate-600"></i>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent"></div>
            </div>

            {/* Course Info */}
            <div className="p-8">
              <h4 className="text-lg font-bold mb-6 text-white truncate">
                {course.title}
              </h4>
              
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-3">
                  <span>Course Progress</span>
                  <span className="text-blue-400">{course.progress_percent}% Completed</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${getProgressColor(course.progress_percent)}`}
                    style={{ width: `${course.progress_percent}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full py-4 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm rounded-2xl transition shadow-inner active:scale-95">
                {course.progress_label || "Resume Course"}
              </button>
            </div>
          </div>
        ))}

        {/* Add Course Card */}
        <div className="bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-blue-500/50 transition">
          <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition text-slate-500 group-hover:text-blue-500">
            <i className="fas fa-plus"></i>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-600 group-hover:text-slate-400">
            Explore Catalog
          </p>
        </div>
      </div>
    </section>
  );
};

export default CourseProgressGrid;
