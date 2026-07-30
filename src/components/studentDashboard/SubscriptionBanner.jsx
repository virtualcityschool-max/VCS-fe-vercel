import React from "react";
import { useSelector } from "react-redux";
import {
  selectExpiredEnrollments,
  selectExpiringEnrollments,
} from "../../store/slices/studentDashboardSlice";

/**
 * Access notices for monthly paid courses.
 *
 * Wording is deliberately "Access valid until ..." rather than "Renews on ...".
 * On a ping-only Gumroad setup we are never told when a student cancels, so we
 * cannot promise a renewal. "Valid until" is true either way.
 */
const SubscriptionBanner = () => {
  const expired = useSelector(selectExpiredEnrollments);
  const expiring = useSelector(selectExpiringEnrollments);

  if (expired.length === 0 && expiring.length === 0) return null;

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "";

  return (
    <div className="space-y-3 mb-8">
      {expired.length > 0 && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl">
          <i className="fas fa-lock text-amber-400 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-amber-300">
              {expired.length === 1
                ? `Access to ${expired[0].course?.title || "a course"} is pending renewal`
                : `Access to ${expired.length} courses is pending renewal`}
            </p>
            <p className="text-xs text-amber-200/70 mt-1">
              You are still enrolled and nothing has been lost. Sessions, quizzes
              and assignments unlock again as soon as your next payment goes
              through.
            </p>
          </div>
        </div>
      )}

      {expiring.length > 0 && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl">
          <i className="fas fa-clock text-blue-400 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-blue-300">
              {expiring.length === 1
                ? `Access to ${expiring[0].course?.title || "a course"} is valid until ${formatDate(expiring[0].access_expires_at)}`
                : `${expiring.length} courses have access ending soon`}
            </p>
            <p className="text-xs text-blue-200/70 mt-1">
              If your monthly membership is active, it renews automatically and
              there is nothing to do.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionBanner;
