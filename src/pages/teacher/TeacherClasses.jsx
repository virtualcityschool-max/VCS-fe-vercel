import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyCourses } from "../../store/slices/teacherSlice";
import { formatCategoryLabel } from "../../constants";
import { getCourseImage } from "../../utils/courseImageUtils";

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
      <div className="space-y-8 animate-fadeIn">
        <div className="space-y-3 px-2">
          <div className="w-48 h-10 bg-slate-800/50 rounded-xl animate-pulse" />
          <div className="w-64 h-4 bg-slate-800/30 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-800/30 backdrop-blur-md rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !myCourses?.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border border-rose-500/10">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 text-3xl mb-6 border border-rose-500/20">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3 className="text-2xl font-black text-white mb-2">Sync Error</h3>
        <p className="text-slate-400 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  return (
    <div className="text-white space-y-10 pb-12 animate-fadeIn">
      {/* --- Page Header --- */}
      <div className="relative group px-2">
        <h1 className="text-4xl font-black font-poppins tracking-tight mb-2">My Courses</h1>
        <div className="flex items-center gap-3">
          <span className="w-12 h-1 bg-indigo-500 rounded-full"></span>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            Manage and review the courses you are currently teaching.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {myCourses?.length ? (
          myCourses.map((course) => (
            <div
              key={course.id}
              className="relative group bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 hover:border-indigo-500/40 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl hover:shadow-indigo-500/10"
              onClick={() => navigate(`/teacher/courses/${course.id}`)}
            >
              {/* Thumbnail */}
              <div className="relative w-full h-44 overflow-hidden">
                {getCourseImage(course) ? (
                  <img
                    src={getCourseImage(course)}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-indigo-600/20 via-slate-800 to-slate-900 flex items-center justify-center">
                    <i className="fas fa-graduation-cap text-5xl text-indigo-500/30"></i>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                    {formatCategoryLabel(course.category)}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border ${course.status === 'published' ? 'text-emerald-400 border-emerald-500/20' : 'text-amber-400 border-amber-500/20'}`}>
                    {course.status}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="relative p-6 flex flex-col">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-10 group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />

                <h2 className="relative text-xl font-black font-poppins text-white group-hover:text-indigo-400 transition-colors leading-tight mb-2 line-clamp-1">
                  {course.title}
                </h2>

                <p className="text-slate-400 text-sm leading-relaxed mb-5 line-clamp-2 font-medium">
                  {course.description || "No description available."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-user-graduate text-[10px] text-indigo-500/60"></i>
                    <span className="text-xs font-bold text-slate-300">{course.total_enrolled} Learners</span>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:text-white transition-colors">
                    Manage Course
                    <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="xl:col-span-2 min-h-[50vh] flex flex-col items-center justify-center p-12 bg-slate-900/30 backdrop-blur-md rounded-[3rem] border border-white/5 border-dashed relative overflow-hidden">
             <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent opacity-50"></div>
             
             <div className="relative z-10 text-center flex flex-col items-center max-w-sm">
                <div className="w-24 h-24 bg-slate-800/50 rounded-[2rem] flex items-center justify-center text-slate-600 text-4xl mb-8 border border-white/5 shadow-2xl">
                  <i className="fas fa-folder-open"></i>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">No courses available yet</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                  You haven't created or been assigned any courses yet. Once assigned, your academic portfolio will appear here.
                </p>
                {/* No button added to preserve logic, but layout is prepared for it */}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClasses;
