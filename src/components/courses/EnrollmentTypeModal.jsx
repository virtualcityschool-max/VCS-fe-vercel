import React from "react";

const EnrollmentTypeModal = ({
  isOpen,
  onClose,
  onConfirm,
  course,
  isPaid = false,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const price = course?.price ? `$${Number(course.price).toLocaleString("en-US")} USD` : null;
  const title = course?.title || "this course";

  if (isPaid) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2rem] shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-500 hover:text-white transition z-10"
          >
            <i className="fas fa-times text-lg" />
          </button>

          <div className="p-7 sm:p-9">
            <div className="text-center mb-7">
              <div className="w-16 h-16 bg-indigo-500/15 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-indigo-500/20">
                <i className="fas fa-credit-card text-indigo-400" />
              </div>
              <h2 className="text-xl font-black font-poppins text-white mb-1">Proceed with Payment</h2>
              <p className="text-slate-400 text-sm">
                You'll be redirected to Gumroad to complete your payment.
              </p>
            </div>

            <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-6 text-center">
              {price && (
                <p className="text-white font-black text-2xl mb-1">{price}</p>
              )}
              <p className="text-indigo-400 text-sm font-semibold truncate">{title}</p>
              <p className="text-slate-500 text-xs mt-2">
                After successful payment you'll be automatically enrolled.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><i className="fas fa-spinner fa-spin text-xs" /> Redirecting...</>
                ) : (
                  <>Proceed to Payment <i className="fas fa-arrow-right text-xs" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2rem] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-white transition z-10"
        >
          <i className="fas fa-times text-lg" />
        </button>

        <div className="p-7 sm:p-9">
          <div className="text-center mb-7">
            <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-emerald-500/20">
              <i className="fas fa-graduation-cap text-emerald-400" />
            </div>
            <h2 className="text-xl font-black font-poppins text-white mb-1">Confirm Enrollment</h2>
            <p className="text-slate-400 text-sm">
              Are you sure you want to enroll in this course?
            </p>
          </div>

          <div className="p-4 bg-slate-800/50 border border-white/5 rounded-2xl mb-6 text-center">
            <p className="text-white font-bold text-base">{title}</p>
            <p className="text-emerald-400 text-xs font-semibold mt-1 uppercase tracking-widest">Free</p>
            <p className="text-slate-500 text-xs mt-2">
              Your request will be reviewed by an admin.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/5 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin text-xs" /> Enrolling...</>
              ) : (
                <><i className="fas fa-check text-xs" /> Yes, Enroll</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentTypeModal;
