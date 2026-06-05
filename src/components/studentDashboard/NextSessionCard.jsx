import React, { useMemo } from "react";
import GmailNotice from "../common/GmailNotice";
import { useSelector, useDispatch } from "react-redux";
import {
  selectNextSession,
  joinLiveSession,
  fetchStudentDashboard,
} from "../../store/slices/studentDashboardSlice";
import { toastManager } from "../../utils/toastManager";
import { extractApiErrorMessage } from "../../utils/apiErrorHandler";
import ConfirmDialog from "../common/ConfirmDialog";
import SessionCountdown from "../common/SessionCountdown";

const NextSessionCard = () => {
  const dispatch = useDispatch();
  const nextSession = useSelector(selectNextSession);
  const isJoiningSession = useSelector(
    (state) => state.studentDashboard.isJoiningSession,
  );
  const [tooEarlyOpen, setTooEarlyOpen] = React.useState(false);

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

    const meetWin = window.open("", "_blank");
    try {
      const result = await dispatch(joinLiveSession(sessionId)).unwrap();

      const meetingLink = result?.meeting_link;

      if (meetingLink && meetingLink.startsWith("http")) {
        try {
          new URL(meetingLink);
          if (meetWin) meetWin.location.href = meetingLink;
        } catch (urlError) {
          meetWin?.close();
          toastManager.error("Invalid meeting link format");
          console.log("URL Error:", urlError);
        }
      } else {
        meetWin?.close();
        toastManager.error("No valid meeting link found");
      }
    } catch (error) {
      meetWin?.close();
      const msg = extractApiErrorMessage(error);
      if ((msg === "You cannot join before the scheduled time.") || (msg === "You can join up to 30 minutes before the scheduled time.")) {
        setTooEarlyOpen(true);
      } else {
        console.error("Failed to join session:", error);
        toastManager.error("Failed to join session");
      }
    }
  };

  // Derive a stable target datetime from starts_in_mins so the countdown ticks correctly
  const scheduledAt = useMemo(() => {
    if (!nextSession) return null;
    if (nextSession.starts_in_mins == null) return null;
    return new Date(Date.now() + nextSession.starts_in_mins * 60 * 1000).toISOString();
  // Recalculate only when session identity or minute count changes (i.e. after a fresh fetch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextSession?.id ?? nextSession?.session_id, nextSession?.starts_in_mins]);

  const canJoinNow =
    nextSession?.can_join === true || nextSession?.status === "live";

  if (!nextSession) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/5 shadow-2xl flex items-center gap-6 transition-all duration-300 hover:border-blue-500/20 group">
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
    <div className="bg-slate-900/40 backdrop-blur-xl p-4 lg:p-5 rounded-[1.5rem] border border-white/5 shadow-2xl flex items-center gap-4 transition-all duration-300 hover:border-blue-500/20 group relative overflow-hidden">
      {/* Dynamic Glow Effect */}
      <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-[50px] transition-all duration-700 ${canJoinNow ? 'bg-blue-600/20' : 'bg-slate-600/5'}`}></div>
      
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-500 border border-white/5 ${canJoinNow ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'bg-slate-800/50 text-slate-500'}`}>
        <i className={`fas ${canJoinNow ? 'fa-broadcast-tower animate-pulse' : 'fa-clock'} text-lg`}></i>
      </div>

      <div className="min-w-0 flex-1 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] bg-blue-400/10 px-2 py-0.5 rounded-md border border-blue-400/10">
            {nextSession.course_title}
          </span>
          {canJoinNow && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          )}
        </div>
        <h3 className="text-base font-black text-white mb-0.5 truncate tracking-tight">
          {nextSession.title}
        </h3>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
          with {nextSession.teacher_name}
        </p>
        {scheduledAt && (
          <SessionCountdown scheduledAt={scheduledAt} status={nextSession.status} />
        )}
      </div>

      <div className="shrink-0 relative z-10">
        <button
          onClick={handleJoinSession}
          disabled={isJoiningSession || !canJoinNow}
          className={`px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 min-w-[120px] ${
            isJoiningSession || !canJoinNow
              ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-white/5"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 border border-blue-400/30 hover:shadow-blue-500/20"
          }`}
        >
          {isJoiningSession ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <span>Joining...</span>
            </>
          ) : !canJoinNow ? (
            "Session Not Live"
          ) : (
            <>
              <i className="fas fa-play text-[8px]"></i>
              <span>Join Now</span>
            </>
          )}
        </button>
        <div className="mt-2 px-1">
          <GmailNotice compact />
        </div>
      </div>

      <ConfirmDialog
        open={tooEarlyOpen}
        variant="primary"
        title="Too Early to Join"
        message="You can join 30 minutes earlier only."
        confirmLabel="Got it"
        cancelLabel={null}
        onConfirm={() => setTooEarlyOpen(false)}
        onCancel={() => setTooEarlyOpen(false)}
      />
    </div>
  );
};

export default NextSessionCard;
