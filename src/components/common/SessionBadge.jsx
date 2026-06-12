export const getStatusBadge = (session, is_student = false) => {
  if (session.has_joined && (is_student && session.status?.toLowerCase() !== "live")) {
    return (
      <span className="bg-red-600/10 text-red-400 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-red-500/10 animate-pulse">
        Live Now
      </span>
    );
  }
  if (session.status?.toLowerCase() == "live") {
    return (
      <span className="bg-red-600/10 text-red-400 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-red-500/10 animate-pulse">
        Live Now
      </span>
    );
  }
  if (session.left_at || session.status?.toLowerCase() === "ended") {
    return (
      <span className="bg-slate-800/50 text-slate-500 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-white/5">
        Ended
      </span>
    );
  }
  return (
    <span className="bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-blue-500/10">
      Scheduled
    </span>
  )
}