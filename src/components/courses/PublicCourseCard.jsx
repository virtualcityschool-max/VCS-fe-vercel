import React from "react";
import { Link } from "react-router-dom";
import { getCourseImage } from "../../utils/courseImageUtils";
import { getStorageUrl } from "../../utils/storageUrl";

const PublicCourseCard = ({
  course,
  index,
  enrolled,
  isEnrolling,
  isUnenrolling,
  isWithdrawing,
  onEnroll,
  onUnenroll,
  onWithdraw,
  variant = "compact",
}) => {
  const large = variant === "large";
  const isPending = course.enrollment_status === "pending";
  const isRejected = course.enrollment_status === "rejected";
  const noSessions = !course.has_session;

  const renderCTA = () => {
    let cls = `w-full ${large ? "py-2.5 text-[10px]" : "py-2 text-[9px]"} font-black uppercase tracking-[0.15em] rounded-xl transition-all active:scale-95 `;
    let label = "";
    let disabled = false;
    let tooltip = null;

    if (enrolled) {
      label = isUnenrolling ? "Unenrolling..." : "Unenroll";
      disabled = isUnenrolling;
      cls += isUnenrolling
        ? "bg-red-600/50 text-red-400 cursor-not-allowed"
        : "bg-red-600/10 border border-red-600/20 text-red-400 hover:bg-red-600 hover:text-white";
    } else if (isRejected) {
      label = "Request Rejected";
      disabled = true;
      cls += "bg-rose-600/10 border border-rose-500/20 text-rose-400 cursor-not-allowed";
      tooltip = "Your enrollment request was rejected. Please contact school administration.";
    } else if (isPending) {
      if (isWithdrawing) {
        label = "Cancelling...";
        disabled = true;
        cls += "bg-amber-600/10 border border-amber-500/20 text-amber-400 cursor-not-allowed";
      } else {
        label = "Cancel Request";
        cls += "bg-amber-600/10 border border-amber-500/20 text-amber-400 hover:bg-amber-600 hover:text-white hover:border-transparent";
      }
    } else if (isEnrolling) {
      label = "Enrolling...";
      disabled = true;
      cls += "bg-slate-700 text-slate-400 cursor-not-allowed";
    } else {
      label = "Enroll Now";
      cls += "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/40";
    }

    const btn = (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (enrolled) onUnenroll(course.id, course.title);
          else if (isPending && !isWithdrawing) onWithdraw?.(course.id, course.title);
          else if (!isPending && !isRejected && !isEnrolling) onEnroll(course);
        }}
        disabled={disabled}
        className={cls}
      >
        {label}
      </button>
    );

    if (tooltip) {
      return (
        <div className="relative group/tooltip">
          {btn}
          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-2 bg-slate-800 border border-slate-700 text-white text-[11px] font-medium rounded-lg text-center max-w-[200px] opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 shadow-xl z-10">
            {tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-700"></div>
          </div>
        </div>
      );
    }

    return btn;
  };

  return (
    <div
      style={{ animationDelay: `${index * 0.05}s` }}
      className="bg-[#1a2235]/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5 shadow-lg group flex flex-col animate-springyReveal opacity-0 glass-shine hover-lift"
    >
      {/* Image */}
      <div className={`relative ${large ? "h-36" : "h-20"} overflow-hidden bg-slate-900/50 shrink-0`}>
        <Link to={`/courses/${course.id}`} className="block h-full">
          {getCourseImage(course, index) ? (
            <img
              src={getCourseImage(course, index)}
              className={`w-full h-full object-cover group-hover:scale-105 transition duration-700 ${large ? "opacity-75" : "opacity-70"} group-hover:opacity-100`}
              alt={course.title || "Course"}
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <i className={`fas fa-book-open text-slate-700 ${large ? "text-3xl" : "text-xl"}`}></i>
            </div>
          )}
        </Link>
        {course.status === "published" && (
          <div className={`absolute ${large ? "top-2 right-2 w-2 h-2" : "top-1.5 right-1.5 w-1.5 h-1.5"} z-10 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse`} />
        )}
      </div>

      {/* Content */}
      <div className={`${large ? "p-4 gap-2" : "p-2 gap-1.5"} flex-1 flex flex-col`}>
        <Link to={`/courses/${course.id}`}>
          <h3 className={`${large ? "text-sm" : "text-[10px]"} font-black leading-tight group-hover:text-blue-400 transition-colors line-clamp-2`}>
            {course.title || "Untitled Course"}
          </h3>
        </Link>

        {course.instructor?.id ? (
          <Link
            to={`/teachers/${course.instructor.id}`}
            onClick={(e) => e.stopPropagation()}
            className={`${large ? "text-xs" : "text-[9px]"} text-slate-500 hover:text-blue-400 transition-colors truncate block`}
          >
            {course.instructor.username || "Tutor"}
          </Link>
        ) : (
          <span className={`${large ? "text-xs" : "text-[9px]"} text-slate-500 truncate`}>
            {course.instructor?.username || "Tutor"}
          </span>
        )}

        <div className={`mt-auto ${large ? "pt-3" : "pt-1.5"} border-t border-white/5 space-y-1`}>
          <p className={`${large ? "text-sm" : "text-[9px]"} font-black text-white`}>${(course.price || 0).toLocaleString("en-US")} USD</p>
          {renderCTA()}
        </div>
      </div>
    </div>
  );
};

export default PublicCourseCard;
