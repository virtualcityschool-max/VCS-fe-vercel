import React from "react";
import { getStorageUrl } from "../../utils/storageUrl";
import { getTeacherTheme } from "../../utils/subjectTheme";

const Star = ({ filled }) => (
  <svg
    viewBox="0 0 20 20"
    className={`w-3 h-3 ${filled ? "text-amber-400" : "text-slate-700"}`}
    fill="currentColor"
  >
    <path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6z" />
  </svg>
);

const TutorCard = ({ teacher, index = 0, isAuthenticated, onViewProfile, onHire }) => {
  const theme = getTeacherTheme(teacher);
  const experience = teacher.experience ?? 0;
  const isExpert = experience >= 10;
  const rating = Number(teacher.rating);
  const hasRating = Number.isFinite(rating) && rating > 0;

  return (
    <div
      key={teacher.id}
      style={{ animationDelay: `${0.1 + index * 0.07}s` }}
      onClick={() => onViewProfile(teacher.id)}
      className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-5 pt-[22px] flex flex-col gap-4 overflow-hidden transition-all duration-200 hover:border-slate-600 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer animate-springyReveal opacity-0"
    >
      {/* Subject accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${theme.accentBar}`} />

      {/* Avatar + name + expertise + experience */}
      <div className="flex items-center gap-3">
        <div
          className={`w-14 h-14 rounded-full shrink-0 overflow-hidden bg-gradient-to-br ${theme.avatarGradient} ${theme.ring} flex items-center justify-center text-white font-bold text-lg shadow-md`}
        >
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
          <p className={`text-xs truncate mt-0.5 font-semibold ${theme.text}`}>
            {teacher.expertise || "General Tutor"}
          </p>
        </div>
      </div>

      {/* Expert badge + rating */}
      {(isExpert || hasRating) && (
        <div className="flex items-center gap-2 flex-wrap -mt-1">
          {isExpert && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wide px-2 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300">
              <i className="fas fa-bolt text-[9px]" />
              Expert
            </span>
          )}
          {hasRating && (
            <span className="inline-flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} filled={n <= Math.round(rating)} />
              ))}
              <span className="text-[11px] text-slate-500 font-semibold ml-1">{rating.toFixed(1)}</span>
            </span>
          )}
        </div>
      )}

      <p className="text-[11px] text-slate-500 -mt-2 flex items-center gap-1">
        <i className="fas fa-briefcase text-[9px]" />
        {experience} yrs experience
      </p>

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
                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium truncate max-w-full ${theme.tagBg} ${theme.tagText} ${theme.tagBorder}`}
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
