import React, { useMemo, useState } from "react";
import { toastManager } from "../../utils/toastManager";
import ConfirmDialog from "../common/ConfirmDialog";

const STATUS_STYLES = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  partial: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
      STATUS_STYLES[status] || STATUS_STYLES.pending
    }`}
  >
    {status}
  </span>
);

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "-";

const initials = (name) =>
  (name || "?")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const DetailField = ({ icon, label, value, className = "" }) => (
  <div className={`min-w-0 ${className}`}>
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
      <i className={`fas ${icon} mr-1.5 text-slate-600`}></i>
      {label}
    </p>
    <p className="text-sm text-white break-words">{value}</p>
  </div>
);

/**
 * Full-request review dialog. Admin reviews the application and decides each
 * course (Approve = enroll free / Reject). A pending request must have every
 * course decided before it can be granted.
 */
const ReviewModal = ({ request, processing, onClose, onResolve }) => {
  const isDecided = request.status !== "pending";
  const [decisions, setDecisions] = useState({}); // { courseId: "approve" | "reject" }
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const pendingCourses = request.courses.filter((c) => c.status === "pending");

  const setAll = (action) =>
    setDecisions(Object.fromEntries(pendingCourses.map((c) => [c.course.id, action])));

  const buildList = () =>
    pendingCourses
      .filter((c) => decisions[c.course.id])
      .map((c) => ({ course_id: c.course.id, action: decisions[c.course.id] }));

  // Step 1 - validate then ask the admin to confirm.
  const apply = () => {
    if (buildList().length !== pendingCourses.length) {
      toastManager.error("Choose Approve or Reject for every course first.");
      return;
    }
    setConfirmOpen(true);
  };

  // Step 2 - on confirm, call the API. Parent closes the modal on success.
  const doConfirm = async () => {
    const ok = await onResolve(request.id, buildList(), note.trim());
    if (!ok) setConfirmOpen(false);
  };

  const approveCount = buildList().filter((d) => d.action === "approve").length;
  const rejectCount = buildList().filter((d) => d.action === "reject").length;
  const confirmMessage =
    approveCount && rejectCount
      ? `Approve & grant free access to ${approveCount} course(s) and reject ${rejectCount} course(s)?`
      : approveCount
        ? `Approve and grant ${request.full_name} free access to ${approveCount} course(s)?`
        : `Reject all ${rejectCount} requested course(s) for ${request.full_name}?`;
  const willCreateAccount = !request.applicant && approveCount > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {initials(request.full_name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{request.full_name}</h3>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{request.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition" aria-label="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Applicant details - full info for a thorough review */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Applicant details
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 rounded-xl bg-slate-800/40 border border-slate-700/50 p-3.5">
              <DetailField icon="fa-user" label="Full name" value={request.full_name} />
              <DetailField icon="fa-envelope" label="Email" value={request.email} className="col-span-2 sm:col-span-1" />
              <DetailField icon="fa-globe" label="Country" value={request.country} />
              <DetailField icon="fa-briefcase" label="Occupation" value={request.occupation || "-"} />
              <DetailField icon="fa-calendar" label="Applied" value={formatDate(request.created_at)} />
              <DetailField
                icon="fa-id-badge"
                label="Account"
                value={request.applicant ? "Existing student" : "New applicant"}
              />
            </div>
          </div>

          {request.applicant && (
            <div className="text-[11px] text-slate-400 bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-2">
              <i className="fas fa-circle-info mr-1.5 text-indigo-400"></i>
              Existing student account - approved courses are added straight to their enrolled courses.
            </div>
          )}

          {/* Statements */}
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                Why eligible for free access
              </p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-2">
                {request.eligibility_statement}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                How it helps their goals
              </p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-2">
                {request.goals_statement}
              </p>
            </div>
          </div>

          {/* Courses */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Requested courses
              </p>
              {!isDecided && pendingCourses.length > 1 && (
                <div className="flex items-center gap-1.5 px-3">
                  <button
                    onClick={() => setAll("approve")}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
                  >
                    Approve all
                  </button>
                  <button
                    onClick={() => setAll("reject")}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition"
                  >
                    Reject all
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {request.courses.map((c) => {
                const decided = c.status !== "pending";
                const pick = decisions[c.course.id];
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-slate-800/40 border border-slate-700/40 px-3 py-2"
                  >
                    <span className="text-sm text-white min-w-0 truncate">
                      {c.course.title}
                      {c.course.is_paid && (
                        <span className="text-[10px] text-slate-500 ml-1">(${c.course.price})</span>
                      )}
                    </span>
                    {decided ? (
                      <StatusBadge status={c.status} />
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setDecisions((p) => ({ ...p, [c.course.id]: "approve" }))}
                          className={`w-[76px] py-1 rounded-md text-xs font-semibold transition ${
                            pick === "approve" ? "bg-emerald-600 text-white" : "bg-slate-700/60 text-emerald-300 hover:bg-slate-700"
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setDecisions((p) => ({ ...p, [c.course.id]: "reject" }))}
                          className={`w-[76px] py-1 rounded-md text-xs font-semibold transition ${
                            pick === "reject" ? "bg-rose-600 text-white" : "bg-slate-700/60 text-rose-300 hover:bg-slate-700"
                          }`}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note + action (only while pending) */}
          {!isDecided ? (
            <>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Optional message included in the applicant's email…"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={apply}
                  disabled={processing}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-xs"></i> Granting…
                    </>
                  ) : (
                    <>Grant Access</>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-500">
                Reviewed {formatDate(request.reviewed_at)}
                {request.review_note ? ` · Note: “${request.review_note}”` : ""}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        variant={approveCount ? "primary" : "danger"}
        title={approveCount ? "Grant free access?" : "Reject request?"}
        message={
          willCreateAccount
            ? `${confirmMessage} A student account will be created and the login details emailed to ${request.email}.`
            : `${confirmMessage} The applicant will be notified by email.`
        }
        confirmLabel={approveCount ? "Yes, Grant Access" : "Yes, Reject"}
        cancelLabel="Cancel"
        loading={processing}
        onConfirm={doConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

const FreeAccessRequestsTab = ({ requests = [], loading, error, processing, onResolve, onRefresh, search = "" }) => {
  const [reviewing, setReviewing] = useState(null);

  // This is a review queue - only PENDING requests are shown here. Once a
  // request is approved/rejected it leaves the queue (the resolve response
  // patches its status, so it drops out immediately).
  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pendingRequests;
    return pendingRequests.filter(
      (r) =>
        (r.full_name || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        (r.country || "").toLowerCase().includes(q),
    );
  }, [pendingRequests, search]);

  // Keep the reviewing request in sync with the latest data after a resolve.
  const reviewingLive = reviewing ? requests.find((r) => r.id === reviewing.id) || reviewing : null;

  const handleResolve = async (id, decisions, note) => {
    const ok = await onResolve(id, decisions, note);
    if (ok) setReviewing(null);
    return ok;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-800 rounded w-1/3" />
                <div className="h-2.5 bg-slate-800 rounded w-1/2" />
              </div>
              <div className="w-24 h-8 bg-slate-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 bg-rose-500/20 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-triangle-exclamation text-rose-400 text-xl"></i>
        </div>
        <p className="text-slate-400 text-sm mb-3">
          {typeof error === "string" ? error : "Failed to load free-access requests."}
        </p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!pendingRequests.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-hand-holding-heart text-indigo-400 text-xl"></i>
        </div>
        <p className="text-slate-400 text-sm">No pending free access requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-search text-slate-500 text-xl"></i>
          </div>
          <p className="text-slate-400 text-sm">No requests match “{search}”.</p>
        </div>
      ) : (
        filtered.map((req) => {
          const pendingCourses = req.courses.filter((c) => c.status === "pending").length;
          return (
            <div
              key={req.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Identity */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initials(req.full_name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{req.full_name}</p>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {req.email} · {req.country}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-slate-400 sm:justify-end">
                  <span className="inline-flex items-center gap-1.5">
                    <i className="fas fa-book text-slate-500"></i>
                    {req.courses.length} course{req.courses.length !== 1 ? "s" : ""}
                  </span>
                  <span className="hidden sm:inline">{formatDate(req.created_at)}</span>
                  <button
                    onClick={() => setReviewing(req)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                      req.status === "pending"
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600"
                    }`}
                  >
                    <i className={`fas ${req.status === "pending" ? "fa-clipboard-check" : "fa-eye"}`}></i>
                    {req.status === "pending" ? `Review${pendingCourses ? "" : ""}` : "View"}
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {reviewingLive && (
        <ReviewModal
          request={reviewingLive}
          processing={processing === reviewingLive.id}
          onClose={() => setReviewing(null)}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
};

export default FreeAccessRequestsTab;
