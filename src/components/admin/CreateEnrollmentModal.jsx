import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createEnrollment,
  fetchUsers,
  fetchCoursesWithSessions,
} from "../../store/slices/adminSlice";
import { useFieldErrors } from "../../hooks";
import { Button, FilterSelect } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";
import TeacherPrivateAvailableSlots from "../TeacherPrivateAvailableSlots";

const CreateEnrollmentModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();

  const { users, enrollmentCourses: courses } = useSelector((state) => state.admin);
  const { loading: createLoading, error: createError } = useSelector(
    (state) => state.admin.enrollments,
  );

  const [formData, setFormData] = useState({
    student_id: "",
    course_id: "",
    enrollment_type: "normal",
    teacher_id: "",
  });

  const [selectedSlot, setSelectedSlot] = useState(null);

  const { formError, handleApiError, clearAllErrors, getFieldError, hasFieldError } =
    useFieldErrors();

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUsers());
      dispatch(fetchCoursesWithSessions());
    }
  }, [dispatch, isOpen]);

  // Auto set teacher when course selected
  useEffect(() => {
    // debugger
    if (formData.course_id) {
      const selectedCourse = courses.data?.find(
        (c) => c.id === parseInt(formData.course_id),
      );

      if (selectedCourse?.instructor?.id) {
        setFormData((prev) => ({
          ...prev,
          teacher_id: selectedCourse.instructor.id,
        }));
      }
    }
  }, [formData.course_id, courses.data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAllErrors();

    if (!formData.student_id || !formData.course_id) {
      toastManager.error("Please select both student and course");
      return;
    }

    if (formData.enrollment_type === "private") {
      if (!formData.teacher_id) {
        toastManager.error("Teacher missing");
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
      payload.teacher_id = parseInt(formData.teacher_id);
      payload.preferred_slots = [
        {
          days: selectedSlot.days,
          time: selectedSlot.time,
        },
      ];
    }

    try {
      const result = await dispatch(createEnrollment(payload)).unwrap();

      toastManager.success(result.message || "Enrollment created successfully");

      onSuccess && onSuccess();
      onClose();

      setFormData({
        student_id: "",
        course_id: "",
        enrollment_type: "normal",
        teacher_id: "",
      });
      setSelectedSlot(null);
    } catch (error) {
      handleApiError(error, toastManager.error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "enrollment_type" && value !== prev.enrollment_type) {
        // next.teacher_id = "";
        setSelectedSlot(null);
      }

      if (name === "course_id") {
        // next.teacher_id = "";
        setSelectedSlot(null);
      }

      return next;
    });

    if (hasFieldError(name)) clearAllErrors();
  };

  const students = users.data?.filter((u) => u.role === "student") || [];

  const selectedCourse = courses.data?.find(
    (c) => c.id === parseInt(formData.course_id),
  );

  const availableTeachers = selectedCourse?.instructor?.id
    ? users.data?.filter(
        (u) =>
          u.role === "teacher" &&
          u.is_active &&
          u.id === selectedCourse.instructor.id,
      ) || []
    : [];

  const selectedTeacher = users.data?.find(
    (u) => u.id === parseInt(formData.teacher_id),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Create New Enrollment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Student + Course */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Student *</label>
              <FilterSelect
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.username}
                  </option>
                ))}
              </FilterSelect>
            </div>

            <div>
              <label className="text-sm text-slate-300">Course *</label>
              <FilterSelect
                name="course_id"
                value={formData.course_id}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                {courses.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </FilterSelect>
            </div>
          </div>

          {/* Enrollment Type */}
          <div>
            <label className="text-sm text-slate-300">Enrollment Type</label>
            <div className="flex gap-4">
              {["normal", "private"].map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="enrollment_type"
                    value={type}
                    checked={formData.enrollment_type === type}
                    onChange={handleInputChange}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          {/* Private Section */}
          {formData.enrollment_type === "private" && formData.course_id && (
            <>
              {/* Teacher (locked) */}
              {availableTeachers.length > 0 && (
                <FilterSelect disabled value={availableTeachers[0].id}>
                  <option>
                    {availableTeachers[0].username}
                  </option>
                </FilterSelect>
              )}
              {/* ✅ NEW COMPONENT */}
              <TeacherPrivateAvailableSlots
                teacher={selectedTeacher}
                teacherId={formData.teacher_id}
                studentId={formData.student_id}
                onSlotSelect={setSelectedSlot}
              />
            </>
          )}

          {/* Errors */}
          {formError && <p className="text-red-400">{formError}</p>}
          {createError && <p className="text-red-400">{createError}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createLoading}>
              Create
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateEnrollmentModal;