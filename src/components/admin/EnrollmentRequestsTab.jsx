import React, { useMemo, useState } from "react";
import ConfirmDialog from "../common/ConfirmDialog";
import { useDateFormatters } from "../../hooks/useDateFormatters";

const EnrollmentRequestsTab = ({
  enrollments,
  loading,
  error,
  processing,
  onApprove,
  onReject,
  onRefresh,
  search = "",
}) => {
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, enrollmentId: null, studentId: null, label: "" });
  const [deleteUser, setDeleteUser] = useState(false);
  const { timezone } = useDateFormatters();

  const filteredEnrollments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enrollments || [];
    return (enrollments || []).filter((e) =>
      [e.student_name, e.student_email, e.course_title, e.teacher_name, e.course_category]
        .some((f) => (f || "").toLowerCase().includes(q)),
    );
  }, [enrollments, search]);

  const handleApprove = (id, label) => {
    setConfirmDialog({ open: true, type: "approve", enrollmentId: id, studentId: null, label });
  };
  const handleReject = (id, studentId, label) => {
    setDeleteUser(false);
    setConfirmDialog({ open: true, type: "reject", enrollmentId: id, studentId, label });
  };

  const handleConfirm = () => {
    const { type, enrollmentId, studentId } = confirmDialog;
    const shouldDelete = deleteUser;
    setConfirmDialog({ open: false, type: null, enrollmentId: null, studentId: null, label: "" });
    setDeleteUser(false);
    if (type === "approve") onApprove(enrollmentId);
    else if (type === "reject") onReject(enrollmentId, shouldDelete, studentId);
  };
  if (loading && !enrollments?.length) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-800 rounded w-1/3" />
                <div className="h-2.5 bg-slate-800 rounded w-1/2" />
              </div>
              <div className="flex gap-2">
                <div className="w-20 h-8 bg-slate-800 rounded-lg" />
                <div className="w-20 h-8 bg-slate-800 rounded-lg" />
              </div>
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
          <i className="fas fa-exclamation-triangle text-rose-400 text-xl"></i>
        </div>
        <p className="text-slate-400 text-sm mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!enrollments?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-check-circle text-indigo-400 text-xl"></i>
        </div>
        <p className="text-white font-semibold mb-1">All caught up!</p>
        <p className="text-slate-400 text-sm">No pending enrollment requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end text-sm font-semibold">
        <span className="text-amber-300">
          Pending: <span className="text-white font-bold">{enrollments.length}</span>
        </span>
      </div>

      {filteredEnrollments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-search text-slate-500 text-xl"></i>
          </div>
          <p className="text-slate-400 text-sm">
            No enrollment requests match "{search}".
          </p>
        </div>
      )}

      {filteredEnrollments.map((enrollment) => {
        const isProcessing = !!processing[enrollment.id];
        const action = processing[enrollment.id];

        return (
          <div
            key={enrollment.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Student avatar + info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {enrollment.student_name?.[0]?.toUpperCase() || "S"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">
                      {enrollment.student_name}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      enrollment.is_private
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    }`}>
                      {enrollment.is_private ? "Private" : "Standard"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{enrollment.student_email}</p>
                  {enrollment.student_grade_level && (
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <i className="fas fa-layer-group text-slate-600 text-[9px]"></i>
                      Grade: <span className="text-slate-400 font-semibold">{enrollment.student_grade_level}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Course + teacher info */}
              <div className="flex-1 min-w-0 sm:border-l sm:border-slate-800 sm:pl-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-white truncate">
                    <i className="fas fa-book text-indigo-400 mr-1.5 text-xs"></i>
                    {enrollment.course_title}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 ${
                    enrollment.course_is_paid
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {enrollment.course_is_paid ? "Paid" : "Free"}
                  </span>
                  {enrollment.course_is_paid && enrollment.course_price != null && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex-shrink-0">
                      ${Number(enrollment.course_price).toLocaleString("en-US")}
                    </span>
                  )}
                  {enrollment.course_category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40 flex-shrink-0 capitalize">
                      {enrollment.course_category}
                    </span>
                  )}
                </div>
                {enrollment.teacher_name && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    <i className="fas fa-chalkboard-teacher mr-1.5 text-xs text-slate-500"></i>
                    {enrollment.teacher_name}
                  </p>
                )}
                <p className="text-[10px] text-slate-600 mt-1">
                  {new Date(enrollment.enrolled_at).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", ...(timezone ? { timeZone: timezone } : {}) })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleApprove(enrollment.id, `${enrollment.student_name} — ${enrollment.course_title}`)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition"
                >
                  {isProcessing && action === "approve" ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-check"></i>
                  )}
                  Approve
                </button>
                <button
                  onClick={() => handleReject(enrollment.id, enrollment.student, `${enrollment.student_name} — ${enrollment.course_title}`)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 hover:border-rose-500/60 disabled:opacity-50 disabled:cursor-not-allowed text-rose-400 text-xs font-semibold rounded-xl transition"
                >
                  {isProcessing && action === "reject" ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-times"></i>
                  )}
                  Reject
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <ConfirmDialog
        open={confirmDialog.open}
        variant={confirmDialog.type === "approve" ? "primary" : "danger"}
        title={confirmDialog.type === "approve" ? "Approve Enrollment" : "Reject Enrollment"}
        message={
          confirmDialog.type === "approve"
            ? `Approve enrollment for "${confirmDialog.label}"?`
            : `Reject enrollment for "${confirmDialog.label}"? This will deny the student's request.`
        }
        confirmLabel={confirmDialog.type === "approve" ? "Approve" : "Reject"}
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmDialog({ open: false, type: null, enrollmentId: null, studentId: null, label: "" });
          setDeleteUser(false);
        }}
        checkboxLabel={confirmDialog.type === "reject" ? "Permanently delete this user" : ""}
        checkboxChecked={deleteUser}
        onCheckboxChange={setDeleteUser}
      />
    </div>
  );
};

export default EnrollmentRequestsTab;
