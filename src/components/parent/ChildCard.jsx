import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../common/ConfirmDialog";
import { useDispatch, useSelector } from "react-redux";
import { availabilityService } from "../../services/availabilityService";
import { toastManager } from "../../utils/toastManager";
import { unlinkChildLinks } from "../../store/slices/childLinksSlice";
import {
  selectChildLinksUnlinking,
} from "../../store/slices/childLinksSlice";
import { showApiError } from "../../utils/apiErrorHandler";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import TimezoneTag from "../ui/TimezoneTag";


const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};
const fmtDate = (d) => {
  if (!d) return "";
  const [y, mo, day] = d.split("-").map(Number);
  return new Date(y, mo - 1, day).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const isUpcoming = (date) => new Date(date + "T23:59:59") >= new Date();

const ChildCard = ({ child }) => {
  const { formatTime, timezone, timezoneAbbr } = useDateFormatters();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [courseBadgeTooltip, setCourseBadgeTooltip] = useState(null);

  useEffect(() => {
    if (!child.id) return;
    availabilityService.getChildBookedSlots(child.id)
      .then((d) => setBookedSlots(Array.isArray(d) ? d : []))
      .catch(() => setBookedSlots([]));
  }, [child.id]);

  const upcomingSlots = bookedSlots.filter((s) => isUpcoming(s.date));

  const isUnlinking = useSelector(selectChildLinksUnlinking);
  const getInitials = (username) => {
    if (!username) return "?";
    return username
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const BADGE_CONFIG = {
    risk_alert: { label: "Risk Alert",  cls: "bg-red-500/20 text-red-500 border-red-500/20 animate-pulse" },
    on_track:   { label: "On Track",    cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" },
  };

  const fmtPct = (val) => val == null ? "N/A" : `${Math.round(val)}%`;

  const getAttendanceColor = (percentage) => {
    if (percentage == null) return "text-slate-500";
    if (percentage >= 95) return "text-emerald-400";
    if (percentage >= 85) return "text-blue-400";
    if (percentage >= 75) return "text-amber-500";
    return "text-rose-500";
  };

  const getCourseRiskReasons = (course) => {
    const assignMissed = (course.assignments_total || 0) - (course.assignments_submitted || 0);
    const quizMissed = (course.quizzes_total || 0) - (course.quizzes_submitted || 0);
    return { assignMissed, quizMissed };
  };

  const handleUnlink = async () => {
    try {
      await dispatch(unlinkChildLinks([child.id])).unwrap();
      toastManager.success("Child unlinked successfully!");
      window.location.reload();
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-indigo-500/30 transition-all duration-300 flex flex-col h-[450px] group/card">
      <div className="flex-grow flex flex-col min-h-0">
        {/* Header with avatar and badge */}
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          {child.avatar ? (
            <img
              src={child.avatar}
              alt={child.username}
              className="w-16 h-16 rounded-2xl border-2 border-indigo-500/30 shadow-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-indigo-600/10 text-indigo-400 rounded-2xl border-2 border-indigo-500/30 shadow-xl flex items-center justify-center text-xl font-black shrink-0">
              {getInitials(child.username)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-black text-white truncate leading-tight flex-1">{child.username}</h3>
              {child.grade_level && (
                <span className="text-[9px] text-indigo-400 font-black uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-0.5 shrink-0">
                  Grade {child.grade_level}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <p className="text-indigo-400/80 text-[10px] font-black uppercase tracking-[0.2em]">Student</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0 pt-1">
          {/* {BADGE_CONFIG[child.badge] && (
            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border whitespace-nowrap shadow-lg ${BADGE_CONFIG[child.badge].cls}`}>
              {BADGE_CONFIG[child.badge].label}
            </span>
          )} */}

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-white transition-all hover:bg-slate-600"
            >
              <i className="fas fa-ellipsis-v text-xs"></i>
            </button>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setConfirmUnlink(true);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                  >
                    <i className="fas fa-user-minus text-[10px]"></i>
                    Unlink Child Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center justify-between mb-3 px-1 shrink-0">
          <p className="text-[12px] text-white font-black flex items-center gap-1.5">
            Courses
            <span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-1.5 py-0.5 text-[9px]">
              {child.courses?.length || 0}
            </span>
          </p>
          {child.courses?.length > 0 && (
            <button
              onClick={() => navigate(`/parent/child/${child.id}`)}
              className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View Detail <i className="fas fa-arrow-right text-[7px] ml-1"></i>
            </button>
          )}
        </div>

        {/* Scrollable Container */}
        <div className="h-22 overflow-y-auto pr-1 custom-scrollbar space-y-2 pb-2">
          {(child.courses || []).map((course, index) => (
            <div
              key={index}
              className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-3 hover:border-indigo-500/30 transition-all duration-300 group/course"
            >
              {/* Row 1: title + badge + arrow */}
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-[11px] font-black text-slate-200 truncate group-hover/course:text-white transition-colors flex-1">
                  {course.title}
                </p>
                {BADGE_CONFIG[course.badge] && (
                  <span
                    className="relative inline-flex shrink-0 cursor-default"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setCourseBadgeTooltip({ course, rect });
                    }}
                    onMouseLeave={() => setCourseBadgeTooltip(null)}
                  >
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${BADGE_CONFIG[course.badge].cls}`}>
                      {BADGE_CONFIG[course.badge].label}
                    </span>
                  </span>
                )}
                <button
                  onClick={() => navigate(`/parent/child/${child.id}`, { state: { activeCourseId: course.id } })}
                  className="w-5 h-5 flex items-center justify-center rounded-md text-indigo-400 bg-indigo-500/10 transition-all shrink-0"
                >
                  <i className="fas fa-chevron-right text-[9px]"></i>
                </button>
              </div>
              {/* Row 2: attendance · assignments · quizzes */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500 font-black">
                  Attendance: <span className={`font-black ${getAttendanceColor(course.attendance?.percentage ?? null)}`}>{fmtPct(course.attendance?.percentage ?? null)}</span>
                </span>
                <span className="text-slate-700">·</span>
                <span className="text-[11px] text-slate-500 font-black">
                  Assignments: <span className="text-slate-300">{course.assignments_submitted || 0}/{course.assignments_total || 0}</span>
                </span>
                <span className="text-slate-700">·</span>
                <span className="text-[11px] text-slate-500 font-black">
                  Quizzes: <span className="text-slate-300">{course.quizzes_submitted || 0}/{course.quizzes_total || 0}</span>
                </span>
              </div>
            </div>
          ))}
          
          {(!child.courses || child.courses.length === 0) && (
            <p className="text-[10px] text-slate-600 font-black uppercase text-center py-4 border border-dashed border-slate-700 rounded-xl">
              No enrolled courses
            </p>
          )}
        </div>
      </div>

      {/* Personal Tutor(s) Section */}
      <div className="mb-4 shrink-0">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[12px] text-white font-black flex items-center gap-1.5">
              Tutor Booking slot(s)
              <span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-1.5 py-0.5 text-[9px]">
                {upcomingSlots.length}
              </span>
            </p>
            {upcomingSlots.length > 0 && (
              <button
                onClick={() => navigate(`/parent/child/${child.id}`)}
                className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View Detail <i className="fas fa-arrow-right text-[7px] ml-1"></i>
              </button>
            )}
          </div>
          <div className="h-22 overflow-y-auto pr-1 custom-scrollbar space-y-2 pb-2">
            {upcomingSlots.map((s) => (
              <div
                key={s.id}
                className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-3 hover:border-indigo-500/30 transition-all duration-300 group/tutor"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <span className="text-indigo-400 text-[10px] font-black">
                      {s.teacher_name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-200 truncate group-hover/tutor:text-white transition-colors">
                      {s.teacher_name}
                    </p>
                    <p className="text-[9px] text-indigo-400 font-black tabular-nums mt-0.5">
                      {fmtDate(s.date)} · {fmt12(s.start_time)}{" "}<TimezoneTag />
                    </p>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
                </div>
              </div>
            ))}
            {upcomingSlots.length === 0 && (
              <p className="text-[10px] text-slate-600 font-black uppercase text-center py-4 border border-dashed border-slate-700 rounded-xl">
                No tutor booking slots
              </p>
            )}
          </div>
        </div>
      </div>
      {courseBadgeTooltip && (
        <div
          className="fixed z-50 w-48 pointer-events-none"
          style={{
            bottom: window.innerHeight - courseBadgeTooltip.rect.top + 8,
            right: window.innerWidth - courseBadgeTooltip.rect.right,
          }}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl px-3 py-2.5 text-left space-y-1.5">
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black pb-1 border-b border-slate-800">
              Status based on:
            </p>
            <p className="text-[10px] text-white flex items-center gap-1.5">
              <i className="fas fa-calendar-check text-[8px] text-slate-400" />
              Attendance: {fmtPct(courseBadgeTooltip.course.attendance?.percentage ?? null)}
              {(courseBadgeTooltip.course.attendance?.percentage ?? null) !== null &&
                courseBadgeTooltip.course.attendance.percentage < 75 && (
                <span className="text-[8px] text-rose-400 font-black">(below 75%)</span>
              )}
            </p>
            <p className="text-[10px] text-white flex items-center gap-1.5">
              <i className="fas fa-tasks text-[8px] text-slate-400" />
              Missed Assignments: {getCourseRiskReasons(courseBadgeTooltip.course).assignMissed}
            </p>
            <p className="text-[10px] text-white flex items-center gap-1.5">
              <i className="fas fa-question-circle text-[8px] text-slate-400" />
              Missed Quizzes: {getCourseRiskReasons(courseBadgeTooltip.course).quizMissed}
            </p>
          </div>
          <div className="absolute top-full right-3 -mt-px border-4 border-transparent border-t-slate-700" />
        </div>
      )}

      <div className="pt-4 mt-auto border-t border-slate-700/50 shrink-0">
        <button
          onClick={() => navigate(`/parent/child/${child.id}`)}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-2"
        >
          View Full Report
          <i className="fas fa-arrow-right text-[8px]"></i>
        </button>
      </div>

      <ConfirmDialog
        open={confirmUnlink}
        variant="danger"
        title="Unlink Child"
        message={`Are you sure you want to unlink ${child.name || child.username || "this child"}? You will lose access to their dashboard.`}
        confirmLabel="Unlink"
        cancelLabel="Cancel"
        loading={isUnlinking}
        onConfirm={() => { setConfirmUnlink(false); handleUnlink(); }}
        onCancel={() => setConfirmUnlink(false)}
      />
    </div>
  );
};

export default ChildCard;
