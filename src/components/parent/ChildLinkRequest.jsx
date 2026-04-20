import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { linkChildren } from "../../store/slices/parentSlice";
import { toastManager } from "../../utils/toastManager";

const ChildLinkRequest = () => {
  const dispatch = useDispatch();
  const [studentInput, setStudentInput] = useState("");
  const [studentIds, setStudentIds] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const { loading: linkLoading } = useSelector(
    (state) => state.parent.linkChild,
  );

  const handleAddStudent = () => {
    const trimmedInput = studentInput.trim();
    if (!trimmedInput) {
      toastManager.error("Please enter a student ID");
      return;
    }

    // Only accept numeric student IDs
    const studentId = parseInt(trimmedInput);

    if (isNaN(studentId)) {
      toastManager.error("Please enter a valid numeric student ID");
      return;
    }

    if (studentIds.includes(studentId)) {
      toastManager.error("This student ID is already in the list");
      return;
    }

    setStudentIds([...studentIds, studentId]);
    setStudentInput("");
  };

  const handleRemoveStudent = (studentToRemove) => {
    setStudentIds(studentIds.filter((id) => id !== studentToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (studentIds.length === 0) {
      toastManager.error("Please add at least one student to link");
      return;
    }

    try {
      const result = await dispatch(linkChildren(studentIds)).unwrap();

      // Show success state with backend response
      setSuccessData(result.data);
      setShowSuccess(true);
      setStudentIds([]);
      setStudentInput("");

      // Show success toast
      toastManager.success(
        result.message || "Link request(s) sent successfully",
      );

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessData(null);
      }, 5000);
    } catch (error) {
      toastManager.error(error || "Failed to send link request(s)");
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-poppins text-white mb-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-link text-purple-400 text-sm"></i>
          </div>
          Request Child Links
        </h2>
        <p className="text-slate-400">
          Enter student IDs to link them to your parent account. Your request
          will be sent to the school administration for approval.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && successData && (
        <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center shrink-0">
              <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
            </div>
            <div className="flex-1">
              <h4 className="text-emerald-400 font-bold mb-2">
                Link Request(s) Sent Successfully
              </h4>
              <p className="text-slate-300 text-sm mb-3">
                {successData.message}
              </p>

              {successData.requested && successData.requested.length > 0 && (
                <div className="mb-2">
                  <span className="text-emerald-400 font-medium text-sm">
                    Requested:{" "}
                  </span>
                  <span className="text-slate-300 text-sm">
                    {successData.requested.join(", ")}
                  </span>
                </div>
              )}

              {successData.already_linked &&
                successData.already_linked.length > 0 && (
                  <div>
                    <span className="text-yellow-400 font-medium text-sm">
                      Already linked:{" "}
                    </span>
                    <span className="text-slate-300 text-sm">
                      {successData.already_linked.join(", ")}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-4">
            Add Student ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              placeholder="Enter student ID (e.g., 5, 6, 12)"
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddStudent();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddStudent}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Add
            </button>
          </div>
        </div>

        {/* Students List */}
        {studentIds.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-4">
              Students to Link
            </label>
            <div className="space-y-3">
              {studentIds.map((studentId, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-700/50 border border-slate-600 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-user-graduate text-purple-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        Student ID: {studentId}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(studentId)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-slate-700/50 border border-slate-600 rounded-xl p-4">
              <p className="text-sm text-slate-300">
                <span className="font-medium text-purple-400">
                  {studentIds.length} student{studentIds.length > 1 ? "s" : ""}{" "}
                  to be linked
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={linkLoading || studentIds.length === 0}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            {linkLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Sending Request...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Send Link Request{studentIds.length > 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChildLinkRequest;
