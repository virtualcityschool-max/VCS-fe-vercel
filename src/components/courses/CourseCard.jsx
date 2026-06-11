import React from "react";
import { Link } from "react-router-dom";
import { getCourseImage } from "../../utils/courseImageUtils";

/**
 * Shared course card used across student dashboard (enrolled/pending/rejected)
 * and teacher portal (academic portfolio).
 *
 * mode: "enrolled" | "pending" | "rejected" | "teacher"
 */
const CourseCard = ({ course, index = 0, mode, onClick, onNavigate }) => {
  const isPending  = mode === "pending";
  const isRejected = mode === "rejected";
  const isEnrolled = mode === "enrolled";
  const isTeacher  = mode === "teacher";

  // For pending/rejected the API gives an enrollment object with .course nested
  const courseData = (isPending || isRejected) ? course.course : course;

  const thumbnail = getCourseImage(courseData, index);

  const categoryName = typeof courseData.category === "object"
    ? courseData.category?.name
    : courseData.category;

  const dateLabel = isPending
    ? (course.enrolled_at ? `Applied ${new Date(course.enrolled_at).toLocaleDateString()}` : "Pending")
    : isRejected
    ? (course.updated_at || course.enrolled_at
        ? `Declined ${new Date(course.updated_at || course.enrolled_at).toLocaleDateString()}`
        : "Rejected")
    : null;

  return (
    <div
      style={{ animationDelay: `${index * 0.05}s` }}
      className="bg-[#1a2235]/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5 shadow-lg group flex flex-col animate-springyReveal opacity-0 glass-shine hover-lift"
    >
      {/* Thumbnail */}
      <div className="relative h-32 overflow-hidden bg-slate-900/50 shrink-0">
        {isTeacher || isEnrolled ? (
          <div className="block h-full">
            {thumbnail ? (
              <img
                src={thumbnail}
                className="w-full h-full object-cover opacity-75 group-hover:scale-105 group-hover:opacity-100 transition duration-700"
                alt={courseData.title || "Course"}
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <i className="fas fa-book-open text-slate-700 text-3xl" />
              </div>
            )}
          </div>
        ) : (
          <Link to={`/courses/${courseData.id}`} className="block h-full">
            {thumbnail ? (
              <img
                src={thumbnail}
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-100 transition duration-700"
                alt={courseData.title || "Course"}
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <i className="fas fa-book-open text-slate-700 text-3xl" />
              </div>
            )}
          </Link>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent pointer-events-none" />

        {/* Free / Paid badge — top left */}
        {!isTeacher && (
          <div className="absolute top-2 left-2 z-10">
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wide backdrop-blur-md border ${
              courseData.is_paid
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}>
              {courseData.is_paid ? "Paid" : "Free"}
            </span>
          </div>
        )}

        {/* Category badge — top left (teacher) */}
        {isTeacher && categoryName && (
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest backdrop-blur-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {categoryName}
            </span>
          </div>
        )}

        {/* Status badge — top right */}
        <div className="absolute top-2 right-2 z-10">
          {isTeacher && (
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              courseData.status === "published"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}>
              {courseData.status}
            </span>
          )}
          {isEnrolled && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-md">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              Enrolled
            </span>
          )}
          {isPending && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 backdrop-blur-md">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              Pending
            </span>
          )}
          {isRejected && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 backdrop-blur-md">
              <i className="fas fa-times-circle text-[9px]" />
              Rejected
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 min-w-0">
        {isTeacher || isEnrolled ? (
          <h4 className="text-sm font-black leading-tight text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
            {courseData.title || "Untitled Course"}
          </h4>
        ) : (
          <Link to={`/courses/${courseData.id}`}>
            <h4 className="text-sm font-black leading-tight text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
              {courseData.title || "Untitled Course"}
            </h4>
          </Link>
        )}

        {isTeacher && (
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-2">
            <i className="fas fa-user-graduate text-[10px]" />
            <span className="font-bold">{courseData.total_enrolled ?? 0} Enrolled</span>
          </div>
        )}

        {(isPending || isRejected) && dateLabel && (
          <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${isPending ? "text-amber-400/70" : "text-rose-400/70"}`}>
            {dateLabel}
          </p>
        )}

        {/* Price line for non-teacher */}
        {!isTeacher && (
          <p className={`text-sm font-black mt-auto pt-3 border-t border-white/5 ${courseData.is_paid ? "text-white" : "text-emerald-400"}`}>
            {courseData.is_paid ? `$${(courseData.price || 0).toLocaleString("en-US")} USD` : "Free"}
          </p>
        )}

        {/* CTA */}
        <div className={`${isTeacher ? "mt-auto pt-3 border-t border-white/5" : "mt-2"}`}>
          {isTeacher && (
            <button
              onClick={onClick}
              className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/20 hover:border-transparent text-indigo-400 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <i className="fas fa-users text-[9px]" />
              View Students
            </button>
          )}
          {isEnrolled && (
            <button
              onClick={() => onNavigate(`/courses/${courseData.id}`)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 active:scale-95"
            >
              Continue Learning
            </button>
          )}
          {isPending && (
            <button
              disabled
              className="w-full py-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl font-black text-[9px] uppercase tracking-widest cursor-default"
            >
              Awaiting Approval
            </button>
          )}
          {isRejected && (
            <button
              disabled
              className="w-full py-2.5 bg-slate-800 text-slate-500 border border-white/5 rounded-xl font-black text-[9px] uppercase tracking-widest cursor-not-allowed opacity-50"
            >
              Enrollment Declined
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
