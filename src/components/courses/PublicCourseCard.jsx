import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getCourseImage } from "../../utils/courseImageUtils";
import { getStorageUrl } from "../../utils/storageUrl";
import { getDisplayName } from "../../utils/userDisplay";

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
  const [imgFailed, setImgFailed] = useState(false);

  const renderCTA = () => {
    let cls = `w-full ${large ? "py-2.5 text-[12px]" : "py-2 text-[11px]"} font-black uppercase tracking-[0.1em] rounded-xl transition-all active:scale-95 inline-flex items-center justify-center gap-1.5 `;
    let label = "";
    let icon = "";
    let disabled = false;
    let tooltip = null;

    if (enrolled) {
      label = isUnenrolling ? "Unenrolling..." : "Unenroll";
      icon = isUnenrolling ? "fas fa-spinner fa-spin" : "fas fa-user-minus";
      disabled = isUnenrolling;
      cls += isUnenrolling
        ? "bg-red-600/50 text-red-400 cursor-not-allowed"
        : "bg-red-600/10 border border-red-600/20 text-red-400 hover:bg-red-600 hover:text-white";
    } else if (isRejected) {
      label = "Request Rejected";
      icon = "fas fa-circle-exclamation";
      disabled = true;
      cls += "bg-rose-600/10 border border-rose-500/20 text-rose-400 cursor-not-allowed";
      tooltip = "Your enrollment request was rejected. Please contact school administration.";
    } else if (isPending) {
      if (course.is_paid) {
        label = "Approval Pending";
        icon = "fas fa-clock";
        disabled = true;
        cls += "bg-amber-600/10 border border-amber-500/20 text-amber-400 cursor-not-allowed";
      } else if (isWithdrawing) {
        label = "Cancelling...";
        icon = "fas fa-spinner fa-spin";
        disabled = true;
        cls += "bg-amber-600/10 border border-amber-500/20 text-amber-400 cursor-not-allowed";
      } else {
        label = "Cancel Request";
        icon = "fas fa-ban";
        cls += "bg-amber-600/10 border border-amber-500/20 text-amber-400 hover:bg-amber-600 hover:text-white hover:border-transparent";
      }
    } else if (isEnrolling) {
      label = "Enrolling...";
      icon = "fas fa-spinner fa-spin";
      disabled = true;
      cls += "bg-slate-700 text-slate-400 cursor-not-allowed";
    } else {
      label = "Enroll Now";
      icon = "fas fa-graduation-cap";
      cls += "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-600 hover:text-white hover:border-transparent";
    }

    const btn = (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (enrolled) onUnenroll(course.id, course.title);
          else if (isPending && !isWithdrawing && !course.is_paid) onWithdraw?.(course.id, course.title);
          else if (!isPending && !isRejected && !isEnrolling) onEnroll(course);
        }}
        disabled={disabled}
        className={cls}
      >
        {icon && <i className={icon}></i>}
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
      <div className={`relative ${large ? "h-36" : "h-24"} overflow-hidden bg-slate-900/50 shrink-0`}>
        <Link to={`/courses/${course.id}`} className="block h-full">
          {getCourseImage(course, index) && !imgFailed ? (
            <img
              src={getCourseImage(course, index)}
              className={`w-full h-full object-contain group-hover:scale-105 transition duration-700 ${large ? "opacity-75" : "opacity-70"} group-hover:opacity-100`}
              alt={course.title || "Course"}
              onError={() => setImgFailed(true)}
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
      <div className={`${large ? "p-4 gap-2" : "p-3 gap-2"} flex-1 flex flex-col`}>
        <Link to={`/courses/${course.id}`}>
          <h3 className={`${large ? "text-sm" : "text-[13px]"} font-black leading-tight text-white group-hover:text-blue-400 transition-colors line-clamp-2`}>
            {course.title || "Untitled Course"}
          </h3>
        </Link>

        {course.instructor?.id ? (
          <Link
            to={`/teachers/${course.instructor.id}`}
            onClick={(e) => e.stopPropagation()}
            className={`${large ? "text-sm" : "text-[13px]"} font-bold text-[#e8c48f] hover:text-blue-400 transition-colors truncate block`}
          >
            {getDisplayName(course.instructor) || "Tutor"}
          </Link>
        ) : (
          <span className={`${large ? "text-sm" : "text-[13px]"} font-bold text-[#e8c48f] truncate`}>
            {getDisplayName(course.instructor) || "Tutor"}
          </span>
        )}

        <div className={`mt-auto ${large ? "pt-3" : "pt-2"} border-t border-white/5 space-y-1.5`}>
          <p className={`${large ? "text-sm" : "text-[13px]"} font-black ${course.is_paid ? "text-white" : "text-emerald-400"}`}>
            {course.is_paid ? `$${(course.price || 0).toLocaleString("en-US")} USD` : "Free"}
          </p>
          {renderCTA()}
        </div>
      </div>
    </div>
  );
};

export default PublicCourseCard;
