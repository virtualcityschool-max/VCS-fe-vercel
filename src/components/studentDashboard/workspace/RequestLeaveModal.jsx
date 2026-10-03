import React, { useState } from "react";
import { toastManager } from "../../../utils/toastManager";

const RequestLeaveModal = ({ onClose, enrolledCourses = [] }) => {
  const [course, setCourse] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("medical");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      toastManager.error("Please specify the date of absence");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toastManager.success(
        "Leave request submitted to your teacher and academic office. An update will reflect on your attendance record."
      );
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-5 animate-scaleUp">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <i className="fas fa-calendar-times text-base" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Request Absence / Leave
              </h3>
              <p className="text-xs text-slate-400">
                Inform tutors in advance to maintain excused attendance standing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <i className="fas fa-times text-xs" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subject / Class
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">All Classes on Date</option>
                {enrolledCourses.map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date of Absence
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reason for Absence
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="medical">Medical / Health appointment</option>
              <option value="family">Family emergency / Event</option>
              <option value="official">Official Cambridge exam / Competition</option>
              <option value="other">Other personal reason</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Explanation & Notes (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any relevant details for your instructor..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Leave Request
                  <i className="fas fa-paper-plane text-xs" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestLeaveModal;
