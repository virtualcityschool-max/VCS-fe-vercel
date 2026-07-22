import React from "react";
import { useDispatch } from "react-redux";
import { setAuthModal } from "../../store/slices/uiSlice";

const AuthRequiredModal = ({ isOpen, onClose, title = "Authentication Required", message = "Please sign in to your account to enroll in this course.", onApplyFreeAccess }) => {
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleAction = (type) => {
    dispatch(setAuthModal(type));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-scaleIn overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-inner">
            <i className="fas fa-user-lock text-indigo-400 text-3xl"></i>
          </div>

          <h3 className="text-2xl font-black font-poppins text-white mb-3 tracking-tight">
            {title}
          </h3>
          
          <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 max-w-[280px] mx-auto">
            {message}
          </p>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleAction("login")}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-900/40 active:scale-[0.98]"
            >
              Log In Now
            </button>
            <button
              onClick={() => handleAction("signup")}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
            >
              Create Account
            </button>

            {onApplyFreeAccess && (
              <>
                <div className="flex items-center gap-3 my-1">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    or
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onApplyFreeAccess();
                  }}
                  className="w-full py-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-indigo-400/20 hover:border-indigo-400/40 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <i className="fas fa-hand-holding-heart"></i>
                  Apply for Free Access
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="mt-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
