import React, { useState } from "react";

const formatRequestedAt = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(/[_\s]/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const Tooltip = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={() => setVisible((v) => !v)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full right-0 mb-2 z-50 w-max max-w-[200px] px-3 py-2 bg-slate-800 border border-rose-500/20 rounded-xl shadow-2xl pointer-events-none">
          <div className="flex items-start gap-2">
            <i className="fas fa-lock text-rose-400 text-[10px] mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-300 leading-snug">{text}</p>
          </div>
          <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
};

const PendingChildLinks = ({ links, rejectedLinks }) => {
  const pending = links ?? [];
  const rejected = rejectedLinks ?? [];

  if (pending.length === 0 && rejected.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* ── Pending section ── */}
      {pending.length > 0 && (
        <div className="bg-[#1e293b]/90 backdrop-blur-xl rounded-[1.5rem] border border-amber-500/20 shadow-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-2">
             <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500/80">
                Awaiting Approval
             </h3>
          </div>
          <div className="p-4 space-y-3">
            {pending.map((link) => (
              <div
                key={link.student_id}
                className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3.5 border border-white/5 hover:border-amber-500/15 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-sm font-black text-amber-400 group-hover:bg-amber-500/15 transition-colors">
                  {getInitials(link.student_name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white truncate">{link.student_name}</p>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-slate-700/60 px-1.5 py-0.5 rounded">
                      Roll #{link.student_roll_no}
                    </span>
                  </div>
                  {link.student_email && (
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                      <i className="fas fa-envelope text-[9px] text-slate-500 shrink-0" />
                      {link.student_email}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <i className="far fa-clock text-[9px]" />
                    Requested {formatRequestedAt(link.requested_at)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">Pending</span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3 flex items-start gap-3">
              <i className="fas fa-info-circle text-amber-500/60 text-xs mt-0.5 shrink-0" />
              <p className="text-[12px] text-slate-500 leading-relaxed">
                These requests are under review by school administration. You'll get access once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Rejected section ── */}
      {rejected.length > 0 && (
        <div className="bg-[#1e293b]/90 backdrop-blur-xl rounded-[1.5rem] border border-rose-500/20 shadow-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-2">
             <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500/80">
                Requests Rejected
             </h3>
          </div>
          <div className="p-4 space-y-3">
            {rejected.map((link) => (
              <div
                key={link.student_id}
                className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3.5 border border-rose-500/10 group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-sm font-black text-rose-400">
                  {getInitials(link.student_name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white truncate">{link.student_name}</p>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-slate-700/60 px-1.5 py-0.5 rounded">
                      Roll #{link.student_roll_no}
                    </span>
                  </div>
                  {link.student_email && (
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                      <i className="fas fa-envelope text-[9px] text-slate-500 shrink-0" />
                      {link.student_email}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <i className="far fa-clock text-[9px]" />
                    Rejected {formatRequestedAt(link.rejected_at)}
                  </p>
                </div>

                <Tooltip text="Only an admin can create this link now. Please contact school administration.">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/10 rounded-xl border border-rose-500/20 shrink-0 cursor-help">
                    <i className="fas fa-lock text-rose-400 text-[9px]" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-rose-400">Rejected</span>
                  </div>
                </Tooltip>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl px-4 py-3 flex items-start gap-3">
              <i className="fas fa-shield-alt text-rose-500/60 text-xs mt-0.5 shrink-0" />
              <p className="text-[12px] text-slate-500 leading-relaxed">
                These requests were declined. To link this student, please contact your school administrator directly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingChildLinks;
