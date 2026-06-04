import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { availabilityService } from "../../services/availabilityService";
import { toastManager } from "../../utils/toastManager";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import TimezoneTag from "../../components/ui/TimezoneTag";
import { getStorageUrl } from "../../utils/storageUrl";

const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const isUpcoming = (date) => new Date(date + "T23:59:59") >= new Date();

const isSlotJoinable = (slot) => {
  const start = new Date(slot.date + "T" + slot.start_time);
  const now = Date.now();
  return now >= start.getTime() - 30 * 60 * 1000 && now <= start.getTime() + 60 * 60 * 1000;
};

const openMeetLink = (link) => {
  if (!link || !link.startsWith("http")) { toastManager.error("No valid meeting link"); return; }
  try { new URL(link); window.open(link, "_blank", "noopener,noreferrer"); } catch { toastManager.error("Invalid meeting link"); }
};

const StudentTutors = () => {
  const { formatDate, formatTime, timezoneAbbr } = useDateFormatters();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | upcoming | past | cancelled
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [tooEarlyOpen, setTooEarlyOpen] = useState(false);

  // Cancellation state
  const [cancelRequests, setCancelRequests]     = useState([]); // my requests
  const [cancelModal, setCancelModal]           = useState(null); // slot object to cancel
  const [cancelReason, setCancelReason]         = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [withdrawingId, setWithdrawingId]       = useState(null);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [slotsData, reqs] = await Promise.all([
        availabilityService.getMyBookings(),
        availabilityService.getMyCancellationRequests().catch(() => []),
      ]);
      setSlots(Array.isArray(slotsData) ? slotsData : []);
      setCancelRequests(Array.isArray(reqs) ? reqs : []);
    } catch {
      setError("Failed to load your booked slots. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Map slot_id → pending/approved/rejected cancel request
  const cancelBySlot = cancelRequests.reduce((m, r) => {
    if (!m[r.slot_id] || r.status === "pending") m[r.slot_id] = r;
    return m;
  }, {});

  const handleSubmitCancel = async () => {
    if (!cancelModal) return;
    setCancelSubmitting(true);
    try {
      const req = await availabilityService.requestCancellation(cancelModal.id, cancelReason);
      setCancelRequests(p => [...p.filter(r => r.slot_id !== cancelModal.id), req]);
      toastManager.success("Cancellation request submitted. Your guardian will be notified.");
      setCancelModal(null);
      setCancelReason("");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to submit request.";
      toastManager.error(msg);
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleWithdraw = async (reqId) => {
    setWithdrawingId(reqId);
    try {
      await availabilityService.withdrawCancellationRequest(reqId);
      setCancelRequests(p => p.filter(r => r.id !== reqId));
      toastManager.success("Cancellation request withdrawn.");
    } catch {
      toastManager.error("Failed to withdraw request.");
    } finally {
      setWithdrawingId(null);
    }
  };

  // Group slots by teacher
  const filtered = slots.filter((s) => {
    if (filter === "upcoming" && !isUpcoming(s.date)) return false;
    if (filter === "past" && isUpcoming(s.date)) return false;
    if (dateFilter && s.date !== dateFilter) return false;
    if (searchQuery && !(s.teacher_name || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const hasActiveFilters = searchQuery || dateFilter || (filter !== "all" && filter !== "cancelled");

  const grouped = filtered.reduce((acc, slot) => {
    const key = slot.teacher_name || "Unknown Teacher";
    const teacherId = slot.teacher_id || slot.teacher;
    if (!acc[key]) acc[key] = { teacherId, teacherAvatar: slot.teacher_avatar, slots: [] };
    acc[key].slots.push(slot);
    return acc;
  }, {});

  const upcomingCount = slots.filter((s) => isUpcoming(s.date)).length;
  const pastCount = slots.length - upcomingCount;
  const cancelledSlots = cancelRequests.filter(r => r.status === "approved");

  return (
    <div className="text-white px-6 py-4 pb-24 space-y-8 animate-fadeIn">
      {/* Page header — matches StudentClasses/StudentAssignments style */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black font-poppins mb-2">My Tutors</h1>
          <p className="text-slate-400 text-sm">Your booked 1-on-1 tutoring slots</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!loading && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 tabular-nums">{upcomingCount}</span>
                <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">upcoming</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-xs font-bold text-slate-200 tabular-nums">{pastCount}</span>
                <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">past</span>
              </div>
            </div>
          )}
          <Link
            to="/teachers"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/20"
          >
            <i className="fas fa-search text-xs" />
            Browse More Tutors
          </Link>
        </div>
      </div>

      <div>
        {/* Filters */}
        {!loading && !error && (slots.length > 0 || cancelledSlots.length > 0) && (
          <div className="flex flex-wrap items-center gap-3 mb-7">
            {/* Status filter pills */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
              {[
                { key: "all",       label: "All"       },
                { key: "upcoming",  label: "Upcoming"  },
                { key: "past",      label: "Past"      },
                { key: "cancelled", label: "Cancelled" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5 ${
                    filter === key
                      ? key === "cancelled" ? "bg-rose-600 text-white" : "bg-indigo-600 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {label}
                  {key === "cancelled" && cancelledSlots.length > 0 && (
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${filter === "cancelled" ? "bg-white/20 text-white" : "bg-rose-500/20 text-rose-400"}`}>
                      {cancelledSlots.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search + date filter pushed to the end */}
            <div className="ml-auto flex items-center gap-3 flex-wrap">
              {/* Tutor name search */}
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tutor name…"
                  className="h-9 w-52 pl-8 pr-8 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition"
                  >
                    <i className="fas fa-times text-xs" />
                  </button>
                )}
              </div>

              {/* Date filter */}
              <div className="relative shrink-0">
                <i className="fas fa-calendar-alt absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs pointer-events-none" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-9 pl-8 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition appearance-none [color-scheme:dark]"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition"
                  >
                    <i className="fas fa-times text-xs" />
                  </button>
                )}
              </div>

              {/* Clear all */}
              {hasActiveFilters && (filter !== "all" || searchQuery || dateFilter) && (
                <button
                  onClick={() => { setFilter("all"); setSearchQuery(""); setDateFilter(""); }}
                  className="text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-wider transition shrink-0"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-32">
            <i className="fas fa-spinner fa-spin text-2xl text-slate-700 mb-3" />
            <p className="text-slate-600 text-sm">Loading your sessions…</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center text-rose-400">
            <i className="fas fa-exclamation-circle text-2xl mb-3 block" />
            <p className="text-sm font-semibold mb-4">{error}</p>
            <button
              onClick={loadSlots}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold transition"
            >
              Try again
            </button>
          </div>
        ) : filter === "cancelled" ? (
          /* ── Cancelled slots view ── */
          cancelledSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
                <i className="fas fa-ban text-slate-500 text-2xl" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">No cancelled slots</h2>
                <p className="text-slate-500 text-sm">Slots approved for cancellation will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cancelledSlots.map(req => (
                <div key={req.id} className="flex items-center gap-4 bg-slate-900/50 border border-rose-500/10 rounded-2xl px-5 py-4">
                  {/* Date block */}
                  <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border bg-rose-500/10 border-rose-500/20">
                    <span className="text-[10px] font-black text-rose-400">
                      {new Date(req.slot_date + "T00:00:00").toLocaleDateString(undefined, { month: "short" }).toUpperCase()}
                    </span>
                    <span className="text-sm font-black leading-tight text-rose-300">
                      {new Date(req.slot_date + "T00:00:00").getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-300 truncate">
                      {req.tutor_name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {fmt12(req.slot_start)} – {fmt12(req.slot_end)}
                      {" · "}
                      {new Date(req.slot_date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    {req.guardian_note && (
                      <p className="text-xs text-slate-600 italic mt-0.5">Guardian note: "{req.guardian_note}"</p>
                    )}
                  </div>

                  {/* Badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 text-rose-300 shrink-0">
                    <i className="fas fa-ban text-[8px]" />
                    Cancelled
                  </span>
                </div>
              ))}
            </div>
          )
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
              <i className="fas fa-chalkboard-teacher text-indigo-400 text-3xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">No tutoring slots yet</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Browse teachers and book a 1-on-1 tutoring slot to get started.
              </p>
            </div>
            <Link
              to="/teachers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/20"
            >
              <i className="fas fa-search" />
              Browse Tutors
            </Link>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-3xl py-20 text-center">
            <i className="fas fa-calendar-times text-slate-800 text-4xl block mb-3" />
            <p className="text-slate-600 text-sm mb-3">
              {searchQuery
                ? `No Attendance found for "${searchQuery}".`
                : dateFilter
                ? `No sessions on ${new Date(dateFilter + "T00:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}.`
                : `No ${filter !== "all" ? filter : ""} sessions.`}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => { setFilter("all"); setSearchQuery(""); setDateFilter(""); }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Booked Slots</span>
            </div>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(grouped).map(([teacherName, { teacherId, teacherAvatar, slots: teacherSlots }]) => {
              const upcoming = teacherSlots.filter((s) => isUpcoming(s.date));
              const past = teacherSlots.filter((s) => !isUpcoming(s.date));
              const initial = teacherName[0]?.toUpperCase() || "T";
              const avatarUrl = getStorageUrl(teacherAvatar);

              return (
                <div key={teacherName} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                  {/* Top accent line */}
                  <div className="h-[3px] w-full bg-gradient-to-r from-amber-400/70 via-amber-400/30 to-transparent" />
                  {/* Teacher header */}
                  <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={teacherName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-black">
                            {initial}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="font-bold text-white text-base">{teacherName}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {teacherSlots.length} slot{teacherSlots.length !== 1 ? "s" : ""} booked
                          {upcoming.length > 0 && (
                            <span className="ml-2 text-indigo-400 font-semibold">
                              · {upcoming.length} upcoming
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {teacherId && (
                      <Link
                        to={`/teachers/${teacherId}`}
                        state={{ openSlots: true }}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition text-xs font-bold shadow shadow-indigo-500/20"
                      >
                        <i className="fas fa-calendar-plus text-[10px]" />
                        Book More Sessions
                      </Link>
                    )}
                  </div>

                  {/* Slot list */}
                  <div className="divide-y divide-slate-800/60">
                    {teacherSlots
                      .slice()
                      .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time))
                      .map((slot) => {
                        const upcoming = isUpcoming(slot.date);
                        const joinable = upcoming && isSlotJoinable(slot);
                        const hasMeet = !!slot.meeting_link;
                        return (
                          <div key={slot.id} className="flex items-center justify-between gap-3 px-6 py-4 flex-wrap">
                            {/* Left: date badge + time */}
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                                upcoming
                                  ? "bg-indigo-500/10 border-indigo-500/20"
                                  : "bg-slate-800/60 border-slate-700/40"
                              }`}>
                                <span className={`text-[10px] font-black ${upcoming ? "text-indigo-400" : "text-slate-600"}`}>
                                  {new Date(slot.date + "T00:00:00").toLocaleDateString(undefined, { month: "short" }).toUpperCase()}
                                </span>
                                <span className={`text-sm font-black leading-tight ${upcoming ? "text-indigo-300" : "text-slate-500"}`}>
                                  {new Date(slot.date + "T00:00:00").getDate()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {formatTime(slot.date + "T" + slot.start_time)} – {formatTime(slot.date + "T" + slot.end_time)}{" "}<TimezoneTag />
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{formatDate(slot.date + "T" + slot.start_time)}</p>
                              </div>
                            </div>

                            {/* Right: status badge + join button + cancel */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                upcoming
                                  ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                                  : "bg-slate-800/60 border-slate-700/40 text-slate-500"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${upcoming ? "bg-indigo-400 animate-pulse" : "bg-slate-600"}`} />
                                {upcoming ? "Upcoming" : "Completed"}
                              </span>

                              {/* Join Session CTA */}
                              {upcoming && hasMeet && (
                                <div className="relative group/tip">
                                  <button
                                    onClick={() => {
                                      if (!joinable) { setTooEarlyOpen(true); return; }
                                      openMeetLink(slot.meeting_link);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest shadow shadow-blue-900/40 transition-all active:scale-95"
                                  >
                                    <i className="fas fa-video text-[9px]" />
                                    Join
                                  </button>
                                  <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-800 border border-white/10 text-white text-[10px] rounded-xl whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none z-20 shadow-xl">
                                    Available 30 min before the session
                                  </div>
                                </div>
                              )}

                              {/* Cancellation controls — only for upcoming slots */}
                              {upcoming && (() => {
                                const req = cancelBySlot[slot.id];
                                if (req?.status === "pending") {
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-300">
                                        <i className="fas fa-hourglass-half text-[8px]" />
                                        Pending Guardian Approval
                                      </span>
                                      <button
                                        onClick={() => handleWithdraw(req.id)}
                                        disabled={withdrawingId === req.id}
                                        className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 transition px-1.5 py-1 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                                      >
                                        {withdrawingId === req.id ? <i className="fas fa-spinner fa-spin" /> : "Withdraw"}
                                      </button>
                                    </div>
                                  );
                                }
                                if (req?.status === "rejected") {
                                  return (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 text-rose-300">
                                      <i className="fas fa-times-circle text-[8px]" />
                                      Cancellation Rejected
                                    </span>
                                  );
                                }
                                return (
                                  <button
                                    onClick={() => { setCancelModal(slot); setCancelReason(""); }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-700 text-slate-500 hover:border-rose-500/30 hover:text-rose-400 hover:bg-rose-500/5 transition"
                                  >
                                    <i className="fas fa-ban text-[8px]" />
                                    Cancel Slot
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}
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

      {/* ── Cancel Slot Modal ── */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                  <i className="fas fa-ban" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Request Slot Cancellation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(cancelModal.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}
                    {fmt12(cancelModal.start_time)} – {fmt12(cancelModal.end_time)}
                  </p>
                </div>
              </div>
              <button onClick={() => setCancelModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <i className="fas fa-exclamation-triangle text-amber-400 text-sm mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300 leading-relaxed">
                  This request will be sent to your guardian for approval.
                  The slot will only be cancelled after they approve.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Reason <span className="text-slate-600">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Explain why you need to cancel this session…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none transition"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex gap-3">
              <button onClick={() => setCancelModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-semibold text-sm transition">
                Keep Slot
              </button>
              <button onClick={handleSubmitCancel} disabled={cancelSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black text-sm transition flex items-center justify-center gap-2">
                {cancelSubmitting
                  ? <><i className="fas fa-spinner fa-spin text-xs" />Submitting…</>
                  : <><i className="fas fa-paper-plane text-xs" />Send Request</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default StudentTutors;
