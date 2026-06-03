import React, { useState, useEffect } from "react";

const ADMIN_CONTACT = {
  phone:    "+92 336 1062993",
  whatsapp: "https://wa.me/923361062993",
  email:    "admin@virtualcityschool.com",
  bankName: "HBL (Habib Bank Limited)",
  accountTitle: "Virtual City School",
  accountNumber: "1234-5678-9012-3456",
  iban: "PK36HABB0000123456789012",
};

const EnrollmentTypeModal = ({
  isOpen,
  onClose,
  onConfirm,
  course,
  isEnrolling = false,
}) => {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAgreed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const price = course?.price ? `$${Number(course.price).toLocaleString("en-US")} USD` : "the course fee";
  const title = course?.title || "this course";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2rem] shadow-2xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-white transition z-10"
        >
          <i className="fas fa-times text-lg" />
        </button>

        {/* ── STEP 1: Payment Info ── */}
        {step === 1 && (
          <div className="p-7 sm:p-9">
            {/* Header */}
            <div className="text-center mb-7">
              <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-emerald-500/20">
                <i className="fas fa-credit-card text-emerald-400" />
              </div>
              <h2 className="text-xl font-black font-poppins text-white mb-1">Payment Details</h2>
              <p className="text-slate-400 text-sm">
                Please transfer the course fee to the details below, then proceed to confirm your enrollment.
              </p>
            </div>

            {/* Contact cards */}
            <div className="space-y-3 mb-7">
              {/* Phone / WhatsApp */}
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                  <i className="fas fa-phone text-indigo-400 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Phone</p>
                  <p className="text-white font-semibold text-sm">{ADMIN_CONTACT.phone}</p>
                </div>
                <a
                  href={ADMIN_CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat on WhatsApp"
                  className="w-9 h-9 bg-emerald-600/20 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 rounded-xl flex items-center justify-center transition-all group flex-shrink-0"
                >
                  <i className="fab fa-whatsapp text-emerald-400 group-hover:text-white text-base transition-colors" />
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-sky-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-sky-500/20">
                  <i className="fas fa-envelope text-sky-400 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Email</p>
                  <p className="text-white font-semibold text-sm truncate">{ADMIN_CONTACT.email}</p>
                </div>
                <a
                  href={`mailto:${ADMIN_CONTACT.email}`}
                  title="Send Email"
                  className="w-9 h-9 bg-sky-600/20 hover:bg-sky-500 border border-sky-500/30 hover:border-sky-500 rounded-xl flex items-center justify-center transition-all group flex-shrink-0"
                >
                  <i className="fas fa-envelope text-sky-400 group-hover:text-white text-sm transition-colors" />
                </a>
              </div>

              {/* Bank Details */}
              <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-500/20 mt-0.5">
                  <i className="fas fa-university text-amber-400 text-sm" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Bank Transfer</p>
                  <p className="text-white font-semibold text-sm">{ADMIN_CONTACT.bankName}</p>
                  <p className="text-slate-400 text-xs">
                    <span className="text-slate-500">Account Title: </span>{ADMIN_CONTACT.accountTitle}
                  </p>
                  <p className="text-slate-400 text-xs">
                    <span className="text-slate-500">Account No: </span>{ADMIN_CONTACT.accountNumber}
                  </p>
                  <p className="text-slate-400 text-xs">
                    <span className="text-slate-500">IBAN: </span>{ADMIN_CONTACT.iban}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                Next
                <i className="fas fa-arrow-right text-xs" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Confirm Payment ── */}
        {step === 2 && (
          <div className="p-7 sm:p-9">
            {/* Header */}
            <div className="text-center mb-7">
              <div className="w-16 h-16 bg-indigo-500/15 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-indigo-500/20">
                <i className="fas fa-graduation-cap text-indigo-400" />
              </div>
              <h2 className="text-xl font-black font-poppins text-white mb-1">Confirm Enrollment</h2>
              <p className="text-slate-400 text-sm">
                Please confirm your payment to complete the enrollment request.
              </p>
            </div>

            {/* Course fee info */}
            <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-6 text-center">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Course Fee</p>
              <p className="text-white font-black text-2xl">{price}</p>
              <p className="text-indigo-400 text-xs mt-1 font-medium truncate">{title}</p>
            </div>

            {/* Agreement checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group p-4 bg-slate-800/40 rounded-2xl border border-white/5 hover:bg-slate-800/60 transition-all mb-6">
              <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <div className="absolute inset-0 border-2 border-slate-500 rounded-md bg-slate-900 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600" />
                <svg className="relative w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100 pointer-events-none z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-slate-300 font-semibold leading-snug select-none">
                I agree to pay <span className="text-white font-black">{price}</span> as fee for <span className="text-indigo-400 font-bold">{title}</span>
              </span>
            </label>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/5 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-arrow-left text-xs" />
                Back
              </button>
              <button
                onClick={onConfirm}
                disabled={!agreed || isEnrolling}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  agreed && !isEnrolling
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                {isEnrolling ? (
                  <><i className="fas fa-spinner fa-spin text-xs" /> Enrolling...</>
                ) : (
                  <><i className="fas fa-check text-xs" /> Confirm Enrollment</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentTypeModal;
