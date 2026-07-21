import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  selectPendingCourses,
  selectExpiredCourses,
} from "../../store/slices/studentDashboardSlice";
import { studentService } from "../../services/studentService";
import { toastManager } from "../../utils/toastManager";
import EnrollmentTypeModal from "../courses/EnrollmentTypeModal";

/**
 * Minimal, single "Payment Required" section for PAID courses the student must
 * (re)pay for. Payment-pending and expired are treated as the SAME case —
 * "you need to pay to (re)gain access" — and rendered identically, one row per
 * course. Admin-approval is intentionally not surfaced here.
 *
 * Action button per course:
 *   • course has a Gumroad link (has_checkout) → go straight to online checkout.
 *   • no link → open EnrollmentTypeModal, which shows the manual-payment steps.
 */
const SubscriptionAlerts = () => {
  const pending = useSelector(selectPendingCourses);
  const expired = useSelector(selectExpiredCourses);

  const paymentPending = pending?.payment_pending || [];
  const expiredCourses = expired || [];

  const [busyCourseId, setBusyCourseId] = useState(null);
  const [modalCourse, setModalCourse] = useState(null);

  // Both states mean the same thing to the student: pay to (re)gain access.
  // Merge into one uniform list, de-duped by course id.
  const seen = new Set();
  const rows = [...paymentPending, ...expiredCourses].filter((course) => {
    if (seen.has(course.id)) return false;
    seen.add(course.id);
    return true;
  });

  if (rows.length === 0) return null;

  const goToCheckout = async (courseId) => {
    if (busyCourseId) return;
    setBusyCourseId(courseId);
    try {
      const { checkout_url } = await studentService.initiateCheckout(courseId);
      if (checkout_url) {
        window.location.assign(checkout_url);
      } else {
        toastManager.error("Could not start checkout. Please try again.");
        setBusyCourseId(null);
      }
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "Could not start checkout. Please try again.";
      toastManager.error(msg);
      setBusyCourseId(null);
    }
  };

  // has_checkout → online checkout; otherwise → manual-steps modal.
  const onAction = (course) => {
    if (course.has_checkout) goToCheckout(course.id);
    else setModalCourse(course);
  };

  return (
    <>
      <div className="rounded-2xl border border-amber-500/20 bg-slate-900/40 backdrop-blur-xl p-4 sm:p-5 shadow-xl animate-fadeInUp">
        <div className="flex items-center gap-2 mb-1">
          <i className="fas fa-credit-card text-amber-400 text-sm" />
          <h3 className="text-white font-bold text-sm tracking-tight">
            Payment Required
          </h3>
        </div>
        <p className="text-slate-400 text-xs mb-3">
          Pay to unlock access to {rows.length === 1 ? "this course" : "these courses"}.
        </p>

        <div className="divide-y divide-white/5">
          {rows.map((course) => {
            const isBusy = busyCourseId === course.id;
            return (
              <div key={course.id} className="flex items-center gap-3 py-3">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-semibold truncate tracking-tight">
                    {course.title}
                  </p>
                  {course.is_paid && course.price ? (
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-0.5">
                      PKR {course.price}
                    </p>
                  ) : null}
                </div>

                <button
                  onClick={() => onAction(course)}
                  disabled={isBusy}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-amber-900/20"
                >
                  {isBusy ? (
                    <i className="fas fa-spinner animate-spin" />
                  ) : (
                    <i className="fas fa-credit-card text-[10px]" />
                  )}
                  {course.has_checkout ? "Pay Now" : "How to Pay"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual-payment steps for courses without an online checkout link */}
      <EnrollmentTypeModal
        isOpen={!!modalCourse}
        onClose={() => setModalCourse(null)}
        onConfirm={() => modalCourse && goToCheckout(modalCourse.id)}
        course={modalCourse}
        isPaid
      />
    </>
  );
};

export default SubscriptionAlerts;
