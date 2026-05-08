import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectNextSession,
  joinLiveSession,
  fetchStudentDashboard,
} from "../../store/slices/studentDashboardSlice";
import { toastManager } from "../../utils/toastManager";

const NextSessionCard = () => {
  const dispatch = useDispatch();
  const nextSession = useSelector(selectNextSession);
  const isJoiningSession = useSelector(
    (state) => state.studentDashboard.isJoiningSession,
  );

  const handleJoinSession = async () => {
    const sessionId = nextSession?.id ?? nextSession?.session_id;
    if (!sessionId) {
      toastManager.error("Session information is unavailable");
      return;
    }

    const canJoinNow =
      nextSession?.can_join === true || nextSession?.status === "live";

    if (!canJoinNow) {
      toastManager.error("Session is not available to join at this time");
      return;
    }

    try {
      const result = await dispatch(joinLiveSession(sessionId)).unwrap();

      const meetingLink = result?.meeting_link;

      if (meetingLink && meetingLink.startsWith("http")) {
        // Validate URL format
        try {
          new URL(meetingLink);
          window.open(meetingLink, "_blank", "noopener,noreferrer");
        } catch (urlError) {
          toastManager.error("Invalid meeting link format");
          console.log("URL Error:", urlError);
        }
      } else {
        toastManager.error("No valid meeting link found");
      }
    } catch (error) {
      console.error("Failed to join session:", error);
      toastManager.error("Failed to join session");
    }
  };

  const formatStartsIn = (minutes) => {
    if (minutes < 60) {
      return `Starts in ${minutes} min${minutes !== 1 ? "s" : ""}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `Starts in ${hours} hour${hours !== 1 ? "s" : ""}`;
    }
    return `Starts in ${hours}h ${remainingMinutes}m`;
  };

  const canJoinNow =
    nextSession?.can_join === true || nextSession?.status === "live";

  if (!nextSession) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl flex items-center gap-6 transition-all duration-300 hover:border-blue-500/20 group">
        <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-500 shrink-0 group-hover:scale-110 transition-all duration-500 border border-white/5">
          <i className="fas fa-calendar-alt text-xl opacity-40"></i>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black text-white/90 mb-0.5 tracking-tight">
            No Upcoming Sessions
          </h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em]">
           Check back later for scheduled live sessions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl flex items-center gap-6 transition-all duration-300 hover:border-blue-500/20 group relative overflow-hidden">
      {/* Dynamic Glow Effect */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] transition-all duration-700 ${canJoinNow ? 'bg-blue-600/20' : 'bg-slate-600/5'}`}></div>
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-500 border border-white/5 ${canJoinNow ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-slate-800/50 text-slate-500'}`}>
        <i className={`fas ${canJoinNow ? 'fa-broadcast-tower animate-pulse' : 'fa-clock'} text-xl`}></i>
      </div>

      <div className="min-w-0 flex-1 relative z-10">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] bg-blue-400/10 px-2 py-0.5 rounded-md border border-blue-400/10">
            {nextSession.course_title}
          </span>
          {canJoinNow && (
            <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          )}
        </div>
        <h3 className="text-lg font-black text-white mb-0.5 truncate tracking-tight">
          {nextSession.title}
        </h3>
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {nextSession.teacher_name}
          </p>
          <div className="h-1 w-1 rounded-full bg-slate-700"></div>
          <p className="text-[11px] font-black text-blue-400/90 tracking-wide">
            {formatStartsIn(nextSession.starts_in_mins)}
          </p>
        </div>
      </div>

      <div className="shrink-0 relative z-10">
        <button
          onClick={handleJoinSession}
          disabled={isJoiningSession || !canJoinNow}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-95 ${
            isJoiningSession || !canJoinNow
              ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-white/5"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 border border-blue-400/30 hover:shadow-blue-500/20"
          }`}
        >
          {isJoiningSession ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : !canJoinNow ? (
            "Session Not Live"
          ) : (
            "Join Now"
          )}
        </button>
      </div>
    </div>
  );
};

export default NextSessionCard;
