import React from "react";
import { getStorageUrl } from "../../utils/storageUrl";

const TutorCard = ({ teacher, index = 0, isAuthenticated, onViewProfile, onHire }) => {
  return (
    <div
      key={teacher.id}
      style={{ animationDelay: `${0.1 + index * 0.07}s` }}
      onClick={() => onViewProfile(teacher.id)}
      className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:border-slate-600 hover:shadow-lg cursor-pointer animate-springyReveal opacity-0"
    >
      {/* Avatar + name + expertise + experience */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full shrink-0 overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
          {teacher.avatar ? (
            <img src={getStorageUrl(teacher.avatar)} alt={teacher.teacher_name} className="w-full h-full object-cover" />
          ) : (
            teacher.teacher_name?.[0]?.toUpperCase() || "T"
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-white text-sm truncate">
            {teacher.teacher_name || "Unnamed Tutor"}
          </h3>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {teacher.expertise || "General Tutor"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <i className="fas fa-briefcase text-[9px]" />
            {teacher.experience ?? 0} yrs experience
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-800" />

      {/* Courses */}
      <div className="flex-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Courses</p>
        <div className="flex flex-wrap gap-1.5">
          {teacher.courses?.length ? (
            <>
              {teacher.courses.slice(0, 2).map((course) => (
                <span
                  key={course.id}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium truncate max-w-full"
                >
                  {course.course_name}
                </span>
              ))}
              {teacher.courses.length > 2 && (
                <span className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 font-medium">
                  +{teacher.courses.length - 2} more
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-600">No courses yet</span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 mt-auto">
        {isAuthenticated && (
          <button
            onClick={(e) => { e.stopPropagation(); onViewProfile(teacher.id); }}
            className="w-full py-2.5 rounded-xl border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-indigo-400 font-bold text-xs tracking-wide transition-all"
          >
            View Profile
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onHire(teacher); }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide transition-all shadow-sm active:scale-95"
        >
          Hire Tutor
        </button>
      </div>
    </div>
  );
};

export default TutorCard;
