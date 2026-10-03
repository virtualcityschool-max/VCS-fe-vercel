import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { submitAssignment } from "../../../store/slices/studentDashboardSlice";
import { toastManager } from "../../../utils/toastManager";

const AssignmentSubmitModal = ({ assignment, onClose, onSubmitted }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!assignment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !textAnswer.trim()) {
      toastManager.error("Please provide a file or text response");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        submitAssignment({
          assignmentId: assignment.id,
          submissionData: {
            text_answer: textAnswer.trim(),
            file: file,
          },
        })
      ).unwrap();

      toastManager.success("Assignment submitted successfully!");
      if (onSubmitted) onSubmitted();
      onClose();
    } catch (err) {
      toastManager.error(err?.message || "Failed to submit assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-5 animate-scaleUp">
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              {assignment.course_title || "Assignment Submission"}
            </span>
            <h3 className="text-lg font-black text-white mt-0.5">
              {assignment.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Due Date: <span className="text-slate-200 font-semibold">{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "Upcoming"}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <i className="fas fa-times text-xs" />
          </button>
        </div>

        {assignment.description && (
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
            <span className="font-bold text-white block mb-1">Instructions:</span>
            {assignment.description}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Upload Work (PDF, Word, or Image)
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-5 text-center transition bg-slate-800/20">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <i className="fas fa-cloud-upload-alt text-2xl text-indigo-400 mb-2" />
                {file ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <i className="fas fa-check" />
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-red-400 ml-2 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-white">
                      Click or drag files here to upload
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Max file size: 25MB • PDF, DOCX, Images, ZIP
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Written Answer / Notes for Instructor (Optional)
            </label>
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer, reflections, or notes for the tutor..."
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
                  Submitting Work...
                </>
              ) : (
                <>
                  Submit Assignment
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

export default AssignmentSubmitModal;
