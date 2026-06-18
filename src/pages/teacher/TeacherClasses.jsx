import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyCourses } from "../../store/slices/teacherSlice";
import CourseCard from "../../components/courses/CourseCard";

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {myCourses?.length ? (
          myCourses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              mode="teacher"
              ctaLabel="Manage Course"
              onClick={() => navigate(`/teacher/courses/${course.id}`)}
            />
          ))
        ) : (
          <div className="col-span-full min-h-[50vh] flex flex-col items-center justify-center p-12 bg-slate-900/30 backdrop-blur-md rounded-[3rem] border border-white/5 border-dashed relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent opacity-50" />
            <div className="relative z-10 text-center flex flex-col items-center max-w-sm">
              <div className="w-24 h-24 bg-slate-800/50 rounded-[2rem] flex items-center justify-center text-slate-600 text-4xl mb-8 border border-white/5 shadow-2xl">
                <i className="fas fa-folder-open" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">No courses available yet</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                You haven't created or been assigned any courses yet. Once assigned, your academic portfolio will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClasses;
