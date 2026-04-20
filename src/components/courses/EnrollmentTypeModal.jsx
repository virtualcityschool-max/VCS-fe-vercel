import React from "react";

const EnrollmentTypeModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden glass relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="p-6 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-500/20 text-indigo-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-poppins text-white mb-2">
              Select Enrollment Type
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Choose how you want to enroll in this course
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => onSelect("normal")}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-2xl p-6 text-left transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition">
                  <i className="fas fa-globe text-lg"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">
                    Normal Enrollment
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Enroll directly in the course through the public marketplace
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onSelect("private")}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-2xl p-6 text-left transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition">
                  <i className="fas fa-user-tie text-lg"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">
                    Private Enrollment
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Enroll directly with the course instructor
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentTypeModal;
