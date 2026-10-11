import { useSelector } from "react-redux";
import {
  selectMyEnrollments,
  selectMyEnrollmentsLoading,
} from "../../../store/slices/studentDashboardSlice";

export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const TONES = {
  ok: { pill: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300", text: "text-emerald-400", icon: "fa-check-circle" },
  warn: { pill: "bg-amber-500/15 border-amber-500/25 text-amber-300", text: "text-amber-400", icon: "fa-clock" },
  bad: { pill: "bg-rose-500/15 border-rose-500/25 text-rose-300", text: "text-rose-400", icon: "fa-exclamation-circle" },
  none: { pill: "bg-white/5 border-white/10 text-slate-300", text: "text-slate-300", icon: "fa-info-circle" },
};

// The student's real fee picture, from their own enrolments (the same records
// the admin Subscriptions page shows). Nothing is assumed: no enrolments means
// an empty state, not "paid".
export function useTuition() {
  const enrollments = useSelector(selectMyEnrollments) || [];
  const loading = useSelector(selectMyEnrollmentsLoading);

  const active = enrollments.filter((e) => e.status === "active");
  const isBilled = (e) =>
    e.course?.is_paid && Number(e.course?.price) > 0 && !["free", "free_access"].includes(e.enrollment_source);
  const billed = active.filter(isBilled);
  const free = active.filter((e) => !isBilled(e));
  const monthly = billed.reduce((sum, e) => sum + Number(e.course?.price || 0), 0);
  const overdue = billed.filter((e) => e.has_access === false);
  const dueSoon = billed.filter(
    (e) => e.has_access !== false && e.days_remaining !== null && e.days_remaining !== undefined && e.days_remaining <= 7,
  );
  const nextRenewal = billed
    .filter((e) => e.has_access !== false && e.access_expires_at)
    .map((e) => e.access_expires_at)
    .sort()[0];

  let status = "none";
  let label = "No subjects yet";
  if (loading && !enrollments.length) label = "Checking…";
  else if (overdue.length) {
    status = "bad";
    label = "Payment overdue";
  } else if (dueSoon.length) {
    status = "warn";
    const d = Math.max(0, Math.min(...dueSoon.map((e) => e.days_remaining)));
    label = d === 0 ? "Renewal due today" : `Renewal due in ${d} day${d === 1 ? "" : "s"}`;
  } else if (billed.length) {
    status = "ok";
    label = "Paid";
  } else if (free.length) {
    status = "ok";
    label = "Free access";
  }

  return {
    loading, active, billed, free, monthly, overdue, dueSoon, nextRenewal, status, label,
    tone: TONES[status],
    amount: billed.length ? `${money(monthly)}/month` : free.length ? "No fee" : "",
  };
}
