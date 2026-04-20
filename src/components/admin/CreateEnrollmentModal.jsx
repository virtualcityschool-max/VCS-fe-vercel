import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createEnrollment } from "../../store/slices/adminSlice";
import { fetchUsers } from "../../store/slices/adminSlice";
import { fetchCourses } from "../../store/slices/adminSlice";
import { useFieldErrors } from "../../hooks";
import { Button, Input } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";

const CreateEnrollmentModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { users, courses } = useSelector((state) => state.admin);
  const { loading: createLoading, error: createError } = useSelector(
    (state) => state.admin.enrollments,
  );

  const [formData, setFormData] = useState({
    student_id: "",
    course_id: "",
    enrollment_type: "normal",
    teacher_id: "",
  });

  const {
    formError,
    handleApiError,
    clearAllErrors,
    getFieldError,
    hasFieldError,
  } = useFieldErrors();

  // Fetch users and courses when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUsers());
      dispatch(fetchCourses());
    }
  }, [dispatch, isOpen]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAllErrors();

    // Validate form data
    if (!formData.student_id || !formData.course_id) {
      toastManager.error("Please select both student and course");
      return;
    }

    if (formData.enrollment_type === "private" && !formData.teacher_id) {
      toastManager.error("Please select a teacher for private enrollment");
      return;
    }

    // Prepare payload based on enrollment type
    const payload = {
      course_id: parseInt(formData.course_id),
      student_id: parseInt(formData.student_id),
    };

    if (formData.enrollment_type === "private") {
      payload.teacher_id = parseInt(formData.teacher_id);
    }

    try {
      const result = await dispatch(createEnrollment(payload)).unwrap();

      // Success
      toastManager.success(result.message || "Enrollment created successfully");
      onSuccess && onSuccess();
      onClose();

      // Reset form
      setFormData({
        student_id: "",
        course_id: "",
        enrollment_type: "normal",
        teacher_id: "",
      });
    } catch (error) {
      // Handle error through useFieldErrors hook
      handleApiError(error, toastManager.error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Clear teacher selection when switching enrollment type or course
      if (name === "enrollment_type" && value !== prev.enrollment_type) {
        newData.teacher_id = "";
      }
      if (name === "course_id") {
        newData.teacher_id = "";
      }

      return newData;
    });

    // Clear field error when user starts typing
    if (hasFieldError(name)) {
      clearAllErrors();
    }
  };

  // Filter students only
  const students = users.data?.filter((user) => user.role === "student") || [];

  // Filter teachers for the selected course
  const selectedCourse = courses.data?.find(
    (course) => course.id === parseInt(formData.course_id),
  );

  // Filter teachers for selected course - ONLY show active teachers assigned to this course
  const availableTeachers = selectedCourse?.instructor?.id
    ? users.data?.filter(
        (user) =>
          user.role === "teacher" &&
          user.is_active === true &&
          user.id === selectedCourse.instructor.id,
      ) || []
    : []; // NO fallback to all teachers for private enrollment

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            Create New Enrollment
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                hasFieldError("student_id")
                  ? "border-red-500 text-red-400"
                  : "border-slate-600"
              }`}
              disabled={users.loading}
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.username} ({student.email})
                </option>
              ))}
            </select>
            {getFieldError("student_id") && (
              <p className="mt-1 text-xs text-red-400">
                {getFieldError("student_id")}
              </p>
            )}
            {users.loading && (
              <p className="mt-1 text-xs text-slate-400">Loading students...</p>
            )}
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              name="course_id"
              value={formData.course_id}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                hasFieldError("course_id")
                  ? "border-red-500 text-red-400"
                  : "border-slate-600"
              }`}
              disabled={courses.loading}
            >
              <option value="">Select a course</option>
              {courses.data?.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} - {course.category}
                </option>
              ))}
            </select>
            {getFieldError("course_id") && (
              <p className="mt-1 text-xs text-red-400">
                {getFieldError("course_id")}
              </p>
            )}
            {courses.loading && (
              <p className="mt-1 text-xs text-slate-400">Loading courses...</p>
            )}
          </div>

          {/* Enrollment Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Enrollment Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="enrollment_type"
                  value="normal"
                  checked={formData.enrollment_type === "normal"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-300">Normal</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="enrollment_type"
                  value="private"
                  checked={formData.enrollment_type === "private"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-300">Private</span>
              </label>
            </div>
          </div>

          {/* Teacher Selection (only for private enrollment) */}
          {formData.enrollment_type === "private" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Teacher <span className="text-red-500">*</span>
              </label>
              <select
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  hasFieldError("teacher_id")
                    ? "border-red-500 text-red-400"
                    : "border-slate-600"
                }`}
                disabled={!selectedCourse || availableTeachers.length === 0}
              >
                <option value="">Select a teacher</option>
                {availableTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.username} ({teacher.email})
                  </option>
                ))}
              </select>
              {getFieldError("teacher_id") && (
                <p className="mt-1 text-xs text-red-400">
                  {getFieldError("teacher_id")}
                </p>
              )}
              {selectedCourse && availableTeachers.length === 0 && (
                <p className="mt-1 text-xs text-amber-400">
                  No active teacher available for this course
                </p>
              )}
              {formData.enrollment_type === "private" &&
              selectedCourse?.instructor ? (
                <p className="mt-1 text-xs text-slate-400">
                  Note: Only the assigned course instructor can teach private
                  enrollments
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  Please Select a Course to enable private teacher selection
                </p>
              )}
            </div>
          )}

          {/* Form Error */}
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{formError}</p>
            </div>
          )}

          {/* Backend Error */}
          {createError && !formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">
                {typeof createError === "string"
                  ? createError
                  : typeof createError === "object" && createError !== null
                    ? createError.message ||
                      createError.error ||
                      "Failed to create enrollment"
                    : "Failed to create enrollment"}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-700">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createLoading || users.loading || courses.loading}
              loading={createLoading}
            >
              {createLoading ? "Creating..." : "Create Enrollment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEnrollmentModal;
