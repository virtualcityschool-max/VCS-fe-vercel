import React from "react";
import { Link } from "react-router-dom";
import TeacherSessionCard from "../../sessions/TeacherSessionCard";
import { handleJoinSession } from "../../../utils/helper/StartSession";
import { getDisplayName } from "../../../utils/userDisplay";

// The admin's own Meet sessions with teachers. Same cards and Start / Join /
// End behaviour as the previous dashboard.
const TeacherMeetings = ({ sessions = [], loading, actionLoadingIds = new Set(), onStart, onEnd }) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center">
      <h3 className="flex-1 text-sm font-bold text-white">Your meetings with teachers</h3>
      <Link to="/admin/teacher-planner" className="text-xs text-indigo-300 hover:text-indigo-200">All meetings →</Link>
    </div>
    {loading ? (
      <div className="h-20 rounded-xl bg-[#182042] animate-pulse" />
    ) : sessions.length === 0 ? (
      <p className="text-sm text-slate-400">No meetings planned.</p>
    ) : (
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        {sessions.map((session) => (
          <TeacherSessionCard
            key={session.id}
            session={session}
            isLoading={actionLoadingIds.has(session.id)}
            onStart={() => onStart?.(session)}
            onJoin={(s) => handleJoinSession(s.id, s.meeting_link, s.scheduled_at)}
            onEnd={(s) => onEnd?.(s.id)}
            subtitle={
              session.invited_teachers?.length > 0 ? (
                <>
                  <i className="fas fa-users text-indigo-500/50" />
                  {session.invited_teachers.map((t) => getDisplayName(t)).join(", ")}
                </>
              ) : null
            }
          />
        ))}
      </div>
    )}
  </div>
);

export default TeacherMeetings;
