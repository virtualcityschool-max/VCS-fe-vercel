import React, { useState } from "react";
import { toastManager } from "../../../utils/toastManager";

const RequestTranscriptModal = ({ onClose }) => {
  const [docType, setDocType] = useState("official");
  const [deliveryMethod, setDeliveryMethod] = useState("email");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toastManager.success(
        "Transcript request submitted! The academic office will process it within 24-48 hours."
      );
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-5 animate-scaleUp">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <i className="fas fa-file-signature text-base" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Request Academic Transcript
              </h3>
              <p className="text-xs text-slate-400">
                Official documents issued by Virtual City School
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Document Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="official">Official Cambridge Transcript (Signed & Stamped)</option>
              <option value="unofficial">Unofficial Grade Report (PDF)</option>
              <option value="enrollment">Certificate of Enrollment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Delivery Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod("email")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  deliveryMethod === "email"
                    ? "border-indigo-500 bg-indigo-500/10 text-white"
                    : "border-slate-800 bg-slate-800/40 text-slate-400"
                }`}
              >
                <i className="fas fa-envelope text-sm mb-1 block" />
                <span className="text-xs font-bold block">Digital PDF (Email)</span>
                <span className="text-[10px] text-slate-400">Sent within 24h</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod("courier")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  deliveryMethod === "courier"
                    ? "border-indigo-500 bg-indigo-500/10 text-white"
                    : "border-slate-800 bg-slate-800/40 text-slate-400"
                }`}
              >
                <i className="fas fa-shipping-fast text-sm mb-1 block" />
                <span className="text-xs font-bold block">Physical Courier</span>
                <span className="text-[10px] text-slate-400">Postal delivery</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Special Instructions / Destination Institution (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. For Cambridge Assessment submission or university admission..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
                  <i className="fas fa-check text-xs" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestTranscriptModal;
