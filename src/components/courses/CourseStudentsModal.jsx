import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { coursesService } from "../../services/coursesService";
import { unenrollStudent } from "../../store/slices/adminSlice";
import { toastManager } from "../../utils/toastManager";

const CourseStudentsModal = ({ courseId, courseTitle, onClose, canUnenroll }) => {
  const dispatch = useDispatch();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unenrollingId, setUnenrollingId] = useState(null);
  const [confirmStudent, setConfirmStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await coursesService.getCourseById(courseId);
      setStudents(data.enrolled_students || []);
    } catch {
      toastManager.error("Failed to load enrolled students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  const handleConfirmUnenroll = async () => {
    if (!confirmStudent) return;
    setUnenrollingId(confirmStudent.id);
    try {
      await dispatch(
        unenrollStudent({ courseId, studentId: confirmStudent.id }),
      ).unwrap();
      toastManager.success(`${confirmStudent.username} has been unenrolled`);
      setConfirmStudent(null);
      fetchStudents();
    } catch (err) {
      toastManager.error(
        err?.message || err?.error || "Failed to unenroll student",
      );
    } finally {
      setUnenrollingId(null);
    }
  };

  return (
    <>
      {/* Main modal */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800 flex-shrink-0">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate">
                {courseTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Enrolled Students</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition ml-3 flex-shrink-0"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl"
                  >
                    <div className="w-9 h-9 bg-slate-700 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-700 rounded w-28" />
                      <div className="h-2.5 bg-slate-700 rounded w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-user-graduate text-slate-500 text-xl"></i>
                </div>
                <p className="text-slate-400 text-sm">
                  No students enrolled yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-3">
                  {students.length} student{students.length !== 1 ? "s" : ""}{" "}
                  enrolled
                </p>
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition"
                  >
                    <div className="w-9 h-9 bg-indigo-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-user text-indigo-400 text-xs"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {student.username}
                      </p>
                      <p className="text-slate-400 text-xs truncate">
                        {student.email}
                      </p>
                    </div>
                    {canUnenroll && (
                      <button
                        onClick={() => setConfirmStudent(student)}
                        disabled={unenrollingId === student.id}
                        className="w-7 h-7 bg-red-600/10 hover:bg-red-600/30 text-red-400 rounded-full flex items-center justify-center transition disabled:opacity-50 flex-shrink-0"
                        title={`Unenroll ${student.username}`}
                      >
                        {unenrollingId === student.id ? (
                          <i className="fas fa-spinner fa-spin text-xs"></i>
                        ) : (
                          <i className="fas fa-times text-xs"></i>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unenroll confirmation dialog — rendered above main modal */}
      {confirmStudent && (
        <div
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          onClick={() => setConfirmStudent(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-user-minus text-red-400"></i>
              </div>
              <h4 className="text-white font-bold">Unenroll Student</h4>
            </div>
            <p className="text-slate-300 text-sm mb-1">
              Are you sure you want to unenroll
            </p>
            <p className="text-white font-semibold text-sm">
              {confirmStudent.username}
            </p>
            <p className="text-slate-400 text-xs mt-0.5 mb-5">
              {confirmStudent.email}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmStudent(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnenroll}
                disabled={!!unenrollingId}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                {unenrollingId ? "Unenrolling..." : "Yes, Unenroll"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseStudentsModal;
