import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createEnrollment,
  fetchUsers,
  fetchCoursesWithSessions,
} from "../../store/slices/adminSlice";
import { useFieldErrors } from "../../hooks";
import CourseSelect from "../../components/common/CourseSelect";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";

const EMPTY_FORM = {
  student_id: "",
  course_id: "",
};

const CreateEnrollmentModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();

  const { users, enrollmentCourses: courses } = useSelector((state) => state.admin);
  const { loading: createLoading } = useSelector((state) => state.admin.enrollments);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentDropPos, setStudentDropPos] = useState({ top: 0, left: 0, width: 0 });
  const studentTriggerRef = useRef(null);

  const { formError, clearAllErrors } = useFieldErrors();

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUsers());
      dispatch(fetchCoursesWithSessions());
    } else {
      setFormData(EMPTY_FORM);
      setStudentDropdownOpen(false);
      setStudentSearch("");
      clearAllErrors();
    }
  }, [isOpen]);

  const publishedCourses = courses.data?.filter((c) => c.status === "published") || [];
  const students = users.data?.filter((u) => u.role === "student" && u.is_active) || [];
  const selectedStudent = students.find((s) => String(s.id) === String(formData.student_id)) ?? null;
  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      s.username?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      String(s.roll_no ?? "").includes(q)
    );
  }, [students, studentSearch]);

  const openStudentDropdown = () => {
    if (!studentTriggerRef.current) return;
    const rect = studentTriggerRef.current.getBoundingClientRect();
    const dropHeight = Math.min(240, students.length * 50 + 60);
    const openBelow = (window.innerHeight - rect.bottom) >= dropHeight || (window.innerHeight - rect.bottom) >= rect.top;
    setStudentDropPos({
      top: openBelow ? rect.bottom + 4 : rect.top - dropHeight - 4,
      left: rect.left,
      width: rect.width,
    });
    setStudentDropdownOpen(true);
  };

  useEffect(() => {
    if (!studentDropdownOpen) return;
    const close = (e) => {
      if (studentTriggerRef.current && !studentTriggerRef.current.contains(e.target)) {
        setStudentDropdownOpen(false);
        setStudentSearch("");
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close, { passive: true });
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [studentDropdownOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAllErrors();

    if (!formData.student_id || !formData.course_id) {
      toastManager.error("Please select both student and course");
      return;
    }

    const payload = {
      course_id: parseInt(formData.course_id),
      student_id: parseInt(formData.student_id),
    };

    try {
      const result = await dispatch(createEnrollment(payload)).unwrap();
      toastManager.success(result.message || "Enrollment created successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      showApiError(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4 sm:p-8 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Create Enrollment</h2>
            <p className="text-slate-500 text-[12px] font-medium mt-1">Enroll a student into a published course</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <i className="fas fa-times text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Student | Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div ref={studentTriggerRef} className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Student <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => studentDropdownOpen ? (setStudentDropdownOpen(false), setStudentSearch("")) : openStudentDropdown()}
                className={`w-full flex items-center justify-between gap-2 bg-slate-900 border rounded-xl pl-3.5 pr-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer
                  ${studentDropdownOpen
                    ? "border-indigo-500/60 ring-2 ring-indigo-500/15"
                    : "border-slate-700/70 hover:border-slate-600 hover:bg-slate-800/70"
                  }`}
              >
                <span className={`truncate ${selectedStudent ? "text-white" : "text-slate-500"}`}>
                  {selectedStudent ? selectedStudent.username : "Select a student"}
                </span>
                <i className={`fas fa-chevron-down text-slate-500 text-[10px] flex-shrink-0 transition-transform duration-150 ${studentDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {typeof document !== "undefined" && createPortal(
                studentDropdownOpen && (
                  <div
                    style={{ position: "fixed", top: studentDropPos.top, left: studentDropPos.left, width: studentDropPos.width, zIndex: 9999 }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="px-2 pt-2 pb-1.5 border-b border-slate-800">
                      <div className="relative">
                        <i className="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] pointer-events-none" />
                        <input
                          autoFocus
                          type="text"
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          placeholder="Search..."
                          style={{ fontSize: 16 }}
                          className="w-full bg-slate-800 border border-slate-700/60 rounded-lg pl-7 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
                      {filteredStudents.length === 0 ? (
                        <li className="px-3 py-2.5 text-xs text-slate-500 text-center">No results</li>
                      ) : (
                        filteredStudents.map((s) => (
                          <li
                            key={s.id}
                            onMouseDown={(e) => { e.preventDefault(); setFormData((p) => ({ ...p, student_id: String(s.id) })); setStudentDropdownOpen(false); setStudentSearch(""); }}
                            onTouchEnd={(e) => { e.preventDefault(); setFormData((p) => ({ ...p, student_id: String(s.id) })); setStudentDropdownOpen(false); setStudentSearch(""); }}
                            className={`px-3 py-2 text-sm transition-colors select-none cursor-pointer
                              ${String(formData.student_id) === String(s.id)
                                ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                              }`}
                          >
                            <p className="font-medium">{s.username}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                              {s.email}
                              {s.roll_no != null && <span className="ml-2 text-slate-600 font-mono">· Roll#: {s.roll_no}</span>}
                            </p>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                ),
                document.body
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Course <span className="text-red-400">*</span>
              </label>
              <CourseSelect
                courses={publishedCourses}
                value={formData.course_id}
                onChange={(c) => setFormData((p) => ({ ...p, course_id: String(c.id) }))}
              />
            </div>
          </div>

          {formError && <p className="text-red-400 text-sm">{formError}</p>}

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-8 mt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 flex items-center gap-2"
            >
              {createLoading
                ? <><i className="fas fa-spinner fa-spin text-xs" /> Creating…</>
                : "Enroll Student"
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateEnrollmentModal;
