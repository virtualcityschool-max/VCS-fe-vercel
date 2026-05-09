import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createEnrollment,
  fetchUsers,
  fetchCoursesWithSessions,
} from "../../store/slices/adminSlice";
import { useFieldErrors } from "../../hooks";
import { FilterSelect } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";
import TeacherPrivateAvailableSlots from "../TeacherPrivateAvailableSlots";
import { showApiError } from "../../utils/apiErrorHandler";

const EMPTY_FORM = {
  student_id: "",
  course_id: "",
  enrollment_type: "normal",
};

const CreateEnrollmentModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();

  const { users, enrollmentCourses: courses } = useSelector((state) => state.admin);
  const { loading: createLoading } = useSelector((state) => state.admin.enrollments);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { formError, clearAllErrors } = useFieldErrors();

  // Load data when modal opens; reset when it closes
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUsers());
      dispatch(fetchCoursesWithSessions());
    } else {
      setFormData(EMPTY_FORM);
      setSelectedSlot(null);
      clearAllErrors();
    }
  }, [isOpen]);

  const publishedCourses = courses.data?.filter((c) => c.status === "published") || [];
  const selectedCourse = publishedCourses.find((c) => c.id === parseInt(formData.course_id));
  const teacherId = selectedCourse?.instructor?.id ?? null;
  const teacher = users.data?.find((u) => u.id === teacherId) ?? null;
  const students = users.data?.filter((u) => u.role === "student" && u.is_active) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAllErrors();

    if (!formData.student_id || !formData.course_id) {
      toastManager.error("Please select both student and course");
      return;
    }

    if (formData.enrollment_type === "private") {
      if (!teacherId) {
        toastManager.error("This course has no instructor assigned");
        return;
      }
      if (!selectedSlot) {
        toastManager.error("Please select a time slot");
        return;
      }
    }

    const payload = {
      course_id: parseInt(formData.course_id),
      student_id: parseInt(formData.student_id),
    };

    if (formData.enrollment_type === "private") {
      payload.teacher_id = teacherId;
      payload.preferred_slots = [{ days: selectedSlot.days, time: selectedSlot.time }];
    }

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Create Enrollment</h2>
            <p className="text-xs text-slate-400 mt-0.5">Enroll a student into a course</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Student <span className="text-red-400">*</span>
            </label>
            <FilterSelect
              name="student_id"
              value={formData.student_id}
              onChange={(e) => setFormData((p) => ({ ...p, student_id: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.username}</option>
              ))}
            </FilterSelect>
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Course <span className="text-red-400">*</span>
            </label>
            <FilterSelect
              name="course_id"
              value={formData.course_id}
              onChange={(e) => {
                setFormData((p) => ({ ...p, course_id: e.target.value }));
                setSelectedSlot(null);
              }}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">Select a course</option>
              {publishedCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </FilterSelect>
          </div>

          {/* Enrollment Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Enrollment Type</label>
            <div className="flex gap-2">
              {["normal", "private"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFormData((p) => ({ ...p, enrollment_type: type }));
                    setSelectedSlot(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition capitalize ${
                    formData.enrollment_type === type
                      ? "bg-indigo-600/30 border-indigo-500/60 text-indigo-300"
                      : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Private section */}
          {formData.enrollment_type === "private" && formData.course_id && (
            <div className="space-y-4">
              {/* Instructor info */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <i className="fas fa-chalkboard-teacher text-indigo-400 text-xs" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Instructor</p>
                  <p className="text-sm font-semibold text-white truncate">
                    {teacher ? teacher.username : <span className="text-slate-500 italic">No instructor assigned</span>}
                  </p>
                </div>
              </div>

              {teacher && (
                <TeacherPrivateAvailableSlots
                  teacher={teacher}
                  teacherId={teacherId}
                  studentId={formData.student_id}
                  onSlotSelect={setSelectedSlot}
                />
              )}
            </div>
          )}

          {formError && <p className="text-red-400 text-sm">{formError}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createLoading
                ? <><i className="fas fa-spinner fa-spin text-xs" /> Creating…</>
                : "Create Enrollment"
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateEnrollmentModal;
