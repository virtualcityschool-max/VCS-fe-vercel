import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectEnrolledCourses,
  selectExpiringEnrollments,
  selectExpiredEnrollments,
  selectMyEnrollments,
} from "../../../store/slices/studentDashboardSlice";

const FinancialStatusSidebar = ({
  onRequestTranscript,
  onApplyFreeAccess,
  onOpenReferral,
}) => {
  const navigate = useNavigate();
  const enrolledCourses = useSelector(selectEnrolledCourses);
  const myEnrollments = useSelector(selectMyEnrollments);
  const expiringEnrollments = useSelector(selectExpiringEnrollments);
  const expiredEnrollments = useSelector(selectExpiredEnrollments);

  // Compute financial numbers
  const paidCourses = (enrolledCourses || []).filter((c) => c.is_paid && c.price > 0);
  const totalAmountDue = paidCourses.reduce((sum, c) => sum + (c.price || 0), 0);

  const hasExpired = expiredEnrollments.length > 0;
  const hasExpiring = expiringEnrollments.length > 0;

  // Due date calculation
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + (hasExpiring ? 7 : 30));
  const formattedDueDate = nextDueDate.toISOString().split("T")[0];

  const handlePayNow = () => {
    // If student has a paid course, open course renewal or explore courses
    if (paidCourses.length > 0) {
      navigate("/student?tab=overview#courses");
    } else {
      navigate("/courses");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Financial Status Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-white/10 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-bold text-sm">$</span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Financial Status
            </h3>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              hasExpired
                ? "bg-red-500 animate-ping"
                : hasExpiring
                ? "bg-amber-400"
                : "bg-emerald-400"
            }`}
            title={hasExpired ? "Payment Overdue" : "Account in Good Standing"}
          />
        </div>

        <div className="text-center py-3 bg-white/[0.02] rounded-xl border border-white/5 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Amount Due
          </p>
          <p className="text-3xl font-black text-white tracking-tight mt-1 font-poppins">
            ${totalAmountDue > 0 ? totalAmountDue : 450}.00
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Due Date: <span className="text-slate-200 font-semibold">{formattedDueDate}</span>
          </p>
        </div>

        <button
          onClick={handlePayNow}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-900/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <i className="fas fa-credit-card text-xs" />
          Pay Now
        </button>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
          <span>Last Payment:</span>
          <span className="text-slate-400 font-medium">2025-10-15</span>
        </div>
      </div>

      {/* 2. Quick Actions Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
          Quick Actions
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={onRequestTranscript}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <i className="fas fa-file-alt text-xs" />
            </span>
            <span className="text-xs font-semibold">Request Transcript</span>
          </button>

          <button
            onClick={() => navigate("/student/tutors")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <i className="fas fa-calendar-check text-xs" />
            </span>
            <span className="text-xs font-semibold">Book Advisor Meeting</span>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <i className="fas fa-user-cog text-xs" />
            </span>
            <span className="text-xs font-semibold">Update Profile</span>
          </button>

          <button
            onClick={onApplyFreeAccess}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <i className="fas fa-hand-holding-heart text-xs" />
            </span>
            <span className="text-xs font-semibold">Apply for Free Access</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialStatusSidebar;
