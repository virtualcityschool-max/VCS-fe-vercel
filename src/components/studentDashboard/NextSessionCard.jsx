import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectNextSession, joinLiveSession } from "../../store/slices/studentDashboardSlice";

const NextSessionCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const nextSession = useSelector(selectNextSession);
  const isJoiningSession = useSelector((state) => state.studentDashboard.isJoiningSession);

  const handleJoinSession = async () => {
    if (!nextSession?.id) return;

    try {
      await dispatch(joinLiveSession(nextSession.id)).unwrap();
      // Navigate to classroom after successful join
      navigate("/classroom");
    } catch (error) {
      console.error("Failed to join session:", error);
    }
  };

  const formatStartsIn = (minutes) => {
    if (minutes < 60) {
      return `Starts in ${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `Starts in ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `Starts in ${hours}h ${remainingMinutes}m`;
  };

  if (!nextSession) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-700 shadow-xl flex items-center gap-6">
        <div className="w-14 h-14 bg-slate-700/50 rounded-2xl flex items-center justify-center text-slate-500">
          <i className="fas fa-calendar-times text-xl"></i>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
            No Upcoming Sessions
          </p>
          <h3 className="text-xl font-bold text-white">Check back later</h3>
          <p className="text-xs text-slate-500">No live sessions scheduled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-700 shadow-xl flex items-center gap-6">
      <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
        <i className="fas fa-broadcast-tower text-xl"></i>
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
          {nextSession.course_title}
        </p>
        <h3 className="text-xl font-bold text-white mb-1">
          {nextSession.title}
        </h3>
        <p className="text-xs text-slate-500 mb-2">
          with {nextSession.teacher_name}
        </p>
        <p className="text-sm font-semibold text-blue-400">
          {formatStartsIn(nextSession.starts_in_mins)}
        </p>
      </div>
      <button
        onClick={handleJoinSession}
        disabled={isJoiningSession || nextSession.starts_in_mins > 15}
        className={`w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-sm transition active:scale-95 ${
          isJoiningSession || nextSession.starts_in_mins > 15
            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40"
        }`}
      >
        {isJoiningSession ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Joining...
          </>
        ) : nextSession.starts_in_mins > 15 ? (
          "Starting Soon"
        ) : (
          "Join Now"
        )}
      </button>
    </div>
  );
};

export default NextSessionCard;
