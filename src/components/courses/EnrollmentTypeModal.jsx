import React, { useState, useEffect } from "react";
import TeacherPrivateAvailableSlots from "../TeacherPrivateAvailableSlots";
import ConfirmDialog from "../common/ConfirmDialog";
import { studentService } from "../../services/studentService";

const EnrollmentTypeModal = ({
  isOpen,
  onClose,
  onSelect,
  instructorId,
  teacher,
  onSlotSelect,
  isEnrolling = false,
}) => {
  const [enrollmentType, setEnrollmentType] = useState("");
  const [pendingSlot, setPendingSlot] = useState(null);
  const [showNormalConfirm, setShowNormalConfirm] = useState(false);

  // Reset all state whenever the modal closes
  useEffect(() => {
    if (!isOpen) {
      setEnrollmentType("");
      setPendingSlot(null);
      setShowNormalConfirm(false);
    }
  }, [isOpen]);

  const handleNormalClick = () => {
    setEnrollmentType("normal");
    setPendingSlot(null);
    setShowNormalConfirm(true);
  };

  const handleNormalConfirm = () => {
    onSelect("normal");
  };

  const handleNormalCancel = () => {
    setShowNormalConfirm(false);
    setEnrollmentType("");
  };

  const handlePrivateClick = () => {
    setEnrollmentType("private");
    setPendingSlot(null);
    setShowNormalConfirm(false);
    onSelect("private");
  };

  const handleEnrollPrivately = () => {
    if (pendingSlot && onSlotSelect) {
      onSlotSelect(pendingSlot);
    }
  };

  const isPrivate = enrollmentType === "private";

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div
          className={`bg-slate-900 border border-white/10 w-full rounded-[2.5rem] shadow-2xl overflow-y-auto glass relative ${
            isPrivate ? "max-w-2xl max-h-[90vh]" : "max-w-md"
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-500 hover:text-white transition z-10"
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
              {/* Normal enrollment */}
              <button
                onClick={handleNormalClick}
                className={`w-full bg-slate-800 hover:bg-slate-700 border rounded-2xl p-6 text-left transition-all group ${
                  enrollmentType === "normal"
                    ? "border-blue-500/50 ring-1 ring-blue-500/30"
                    : "border-white/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition">
                    <i className="fas fa-globe text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">Standard Enrollment</h3>
                    <p className="text-slate-400 text-sm">
                      Enroll directly in the course through the public marketplace
                    </p>
                  </div>
                </div>
              </button>

              {/* Private enrollment */}
              {/* <button
                onClick={handlePrivateClick}
                className={`w-full bg-slate-800 hover:bg-slate-700 border rounded-2xl p-6 text-left transition-all group ${
                  isPrivate
                    ? "border-emerald-500/50 ring-1 ring-emerald-500/30"
                    : "border-white/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition">
                    <i className="fas fa-user-tie text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">Private Enrollment</h3>
                    <p className="text-slate-400 text-sm">
                      Enroll directly with the course instructor
                    </p>
                  </div>
                </div>
              </button> */}
            </div>

            {/* Slot selection — only shown when Private is active */}
            {isPrivate && (
              <div className="mt-6 space-y-4">
                <p className="text-slate-400 text-sm text-center">
                  Select an available slot to continue
                </p>

                <TeacherPrivateAvailableSlots
                  teacher={teacher}
                  teacherId={instructorId}
                  fetchSlotsFn={studentService.getTeacherAvailableSlots}
                  onSlotSelect={setPendingSlot}
                />

                <button
                  onClick={handleEnrollPrivately}
                  disabled={!pendingSlot}
                  className={`w-full py-4 font-bold rounded-2xl transition-all active:scale-95 ${
                    pendingSlot
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <i className="fas fa-user-lock mr-2"></i>
                  Enroll Privately
                </button>
              </div>
            )}

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

      {/* Normal enrollment confirmation */}
      <ConfirmDialog
        open={showNormalConfirm}
        variant="success"
        title="Confirm Standard Enrollment"
        message="Are you sure you want to enroll in this course publicly through the marketplace?"
        confirmLabel="Yes, Enroll"
        cancelLabel="Cancel"
        loading={isEnrolling}
        onConfirm={handleNormalConfirm}
        onCancel={handleNormalCancel}
      />
    </>
  );
};

export default EnrollmentTypeModal;
