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
  onEnroll, 
  onUnenroll 
}) => {
  const isPending = course.enrollment_status === "pending";
  const isRejected = course.enrollment_status === "rejected";
  const noSessions = !course.has_session;

  const renderCTA = () => {
    let cls = "w-full py-3.5 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-xl ";
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
      label = "Approval Pending";
      disabled = true;
      cls += "bg-amber-600/10 border border-amber-500/20 text-amber-400 cursor-not-allowed";
    } else if (noSessions) {
      label = "Enroll Now";
      disabled = true;
      cls += "bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-white/40 cursor-not-allowed";
      tooltip = "No sessions available for this course";
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
          else if (!isPending && !isRejected && !noSessions && !isEnrolling) onEnroll(course);
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
      style={{ animationDelay: `${index * 0.08}s` }}
      className="bg-[#1a2235]/60 backdrop-blur-xl rounded-[1.5rem] overflow-hidden border border-white/5 shadow-2xl group flex flex-col animate-springyReveal opacity-0 glass-shine hover-lift"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900/50">
        <Link to={`/courses/${course.id}`} className="block h-full">
          {getCourseImage(course, index) ? (
            <img
              src={getCourseImage(course, index)}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 opacity-70 group-hover:opacity-100"
              alt={course.title || "Course"}
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <i className="fas fa-book-open text-slate-700 text-3xl"></i>
            </div>
          )}
        </Link>
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-slate-900/80 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.15em] text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 shadow-xl">
            {typeof course.category === "object" ? course.category?.name : course.category || "General"}
          </span>
        </div>

        {/* Live Indicator */}
        {course.status === "published" && (
          <div className="absolute top-4 right-4 z-10 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <Link to={`/courses/${course.id}`}>
            <h3 className="text-[17px] font-black font-poppins mb-2 leading-tight group-hover:text-blue-400 transition-colors cursor-pointer min-h-[42px] line-clamp-2 tracking-tight">
              {course.title || "Untitled Course"}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
              {course.instructor?.avatar ? (
                <img
                  src={getStorageUrl(course.instructor?.avatar)}
                  className="w-full h-full object-cover"
                  alt={course.instructor?.username}
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <i className="fas fa-user text-[10px] text-slate-500"></i>
                </div>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-bold tracking-tight">
              {course.instructor?.username || "Instructor"}
            </span>
          </div>
        </div>

        <div className="mt-auto space-y-4">
          {/* Price and Rating Row */}
          <div className="flex items-center justify-between py-3 border-y border-white/5">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Price</span>
              <span className="text-sm font-black text-white">
                PKR {course.price || "0.00"}
              </span>
            </div>
            {/* <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Rating</span>
              <div className="flex items-center gap-1">
                <i className="fas fa-star text-yellow-500 text-[10px]"></i>
                <span className="text-xs font-black text-white">
                  {course.rating || "5.0"}
                </span>
              </div>
            </div> */}
          </div>

          {/* CTA Button */}
          {renderCTA()}
        </div>
      </div>
    </div>
  );
};

export default PublicCourseCard;
