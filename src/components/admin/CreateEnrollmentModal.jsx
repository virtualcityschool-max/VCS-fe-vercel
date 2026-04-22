import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createEnrollment,
  fetchUsers,
  fetchCoursesWithSessions,
} from "../../store/slices/adminSlice";
import { useFieldErrors } from "../../hooks";
import { Button, FilterSelect } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";
import { adminService } from "../../services/adminService";

function formatTime(t) {
  const [h] = t.split(":").map(Number);
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function dayPairKey(days) {
  return [...days].sort().join("+");
}

function dayPairLabel(days) {
  const short = { MON: "Mon", TUE: "Tue", WED: "Wed", THU: "Thu", FRI: "Fri" };
  return days.map((d) => short[d] || d).join(" + ");
}

function buildGrid(slots) {
  // rows = unique day pairs (in appearance order), cols = unique times (sorted)
  const pairOrder = [];
  const pairSet = new Set();
  const timeSet = new Set();
  // map[pairKey][time] = slot index
  const map = {};

  slots.forEach((slot, idx) => {
    const key = dayPairKey(slot.days);
    if (!pairSet.has(key)) {
      pairSet.add(key);
      pairOrder.push({ key, days: slot.days });
    }
    timeSet.add(slot.time);
    if (!map[key]) map[key] = {};
    map[key][slot.time] = idx;
  });

  const times = [...timeSet].sort();
  return { pairOrder, times, map };
}

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

  const [slotsData, setSlotsData] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(null);

  const { formError, handleApiError, clearAllErrors, getFieldError, hasFieldError } =
    useFieldErrors();

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUsers());
      dispatch(fetchCoursesWithSessions());
    }
  }, [dispatch, isOpen]);

  const fetchSlots = useCallback(async (teacherId, studentId) => {
    if (!teacherId || !studentId) return;
    setSlotsLoading(true);
    setSlotsData(null);
    setSelectedSlotIdx(null);
    try {
      const data = await adminService.getTeacherPrivateSlots(teacherId, {
        student_id: studentId,
      });
      setSlotsData(data);
    } catch {
      toastManager.error("Failed to load teacher availability");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if(formData.course_id && !formData.teacher_id) {
      formData.teacher_id = availableTeachers[0].id
    }
    if (
      formData.enrollment_type === "private" &&
      formData.teacher_id &&
      formData.student_id
    ) {
      fetchSlots(formData.teacher_id, formData.student_id);
    } else {
      setSlotsData(null);
      setSelectedSlotIdx(null);
    }
  }, [formData.teacher_id, formData.student_id, formData.enrollment_type, fetchSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAllErrors();

    if (!formData.student_id || !formData.course_id) {
      toastManager.error("Please select both student and course");
      return;
    }
    if (formData.enrollment_type === "private" && !formData.teacher_id) {
      toastManager.error("Please select a teacher for private enrollment");
      return;
    }
    if (formData.enrollment_type === "private" && selectedSlotIdx === null) {
      toastManager.error("Please select a time slot for private enrollment");
      return;
    }

    const payload = {
      course_id: parseInt(formData.course_id),
      student_id: parseInt(formData.student_id),
    };

    if (formData.enrollment_type === "private") {
      const slot = slotsData.available_slots[selectedSlotIdx];
      payload.preferred_slots = [{ days: slot.days, time: slot.time }];
      payload.teacher_id = parseInt(formData.teacher_id);
    }

    try {
      const result = await dispatch(createEnrollment(payload)).unwrap();
      toastManager.success(result.message || "Enrollment created successfully");
      onSuccess && onSuccess();
      onClose();
      setFormData({ student_id: "", course_id: "", enrollment_type: "normal", teacher_id: "" });
      setSlotsData(null);
      setSelectedSlotIdx(null);
    } catch (error) {
      handleApiError(error, toastManager.error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "enrollment_type" && value !== prev.enrollment_type) next.teacher_id = "";
      if (name === "course_id") next.teacher_id = "";
      return next;
    });
    if (hasFieldError(name)) clearAllErrors();
  };

  const students = users.data?.filter((u) => u.role === "student") || [];
  const selectedCourse = courses.data?.find((c) => c.id === parseInt(formData.course_id));
  const availableTeachers = selectedCourse?.instructor?.id
    ? users.data?.filter(
        (u) => u.role === "teacher" && u.is_active && u.id === selectedCourse.instructor.id,
      ) || []
    : [];
  const selectedTeacher = users.data?.find((u) => u.id === parseInt(formData.teacher_id));

  const slots = slotsData?.available_slots || [];
  const { pairOrder, times, map } = buildGrid(slots);
  const selectedSlot = selectedSlotIdx !== null ? slots[selectedSlotIdx] : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Create New Enrollment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student + Course in one row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Student <span className="text-red-500">*</span>
              </label>
              <FilterSelect
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                disabled={users.loading}
                className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${hasFieldError("student_id") ? "border-red-500" : "border-slate-600"}`}
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.username} ({s.email})</option>
                ))}
              </FilterSelect>
              {getFieldError("student_id") && <p className="mt-1 text-xs text-red-400">{getFieldError("student_id")}</p>}
              {users.loading && <p className="mt-1 text-xs text-slate-400">Loading...</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <FilterSelect
                name="course_id"
                value={formData.course_id}
                onChange={handleInputChange}
                disabled={courses.loading}
                className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${hasFieldError("course_id") ? "border-red-500" : "border-slate-600"}`}
              >
                <option value="">Select a course</option>
                {courses.data?.map((c) => (
                  <option key={c.id} value={c.id}>{c.title} - {c.category}</option>
                ))}
              </FilterSelect>
              {getFieldError("course_id") && <p className="mt-1 text-xs text-red-400">{getFieldError("course_id")}</p>}
              {courses.loading && <p className="mt-1 text-xs text-slate-400">Loading...</p>}
            </div>
          </div>

          {/* Enrollment Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Enrollment Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              {["normal", "private"].map((type) => (
                <label key={type} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="enrollment_type"
                    value={type}
                    checked={formData.enrollment_type === type}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600"
                  />
                  <span className="text-sm text-slate-300 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Private section */}
          {(formData.enrollment_type === "private" && formData.course_id) && (
            <>
              {/* Teacher selector */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Teacher <span className="text-red-500">*</span>
                </label>
                <FilterSelect
                  name="teacher_id"
                  value={availableTeachers[0].teacher_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${hasFieldError("teacher_id") ? "border-red-500" : "border-slate-600"}`}
                  disabled
                >
                  <option key={availableTeachers[0].teacher_id} value={availableTeachers[0].teacher_id}>
                    {availableTeachers[0].username} ({availableTeachers[0].email})
                  </option>
                </FilterSelect>
                {getFieldError("teacher_id") && (
                  <p className="mt-1 text-xs text-red-400">{getFieldError("teacher_id")}</p>
                )}
                {selectedCourse && availableTeachers.length === 0 && (
                  <p className="mt-1 text-xs text-amber-400">
                    No active teacher available for this course
                  </p>
                )}
                {!selectedCourse && (
                  <p className="mt-1 text-xs text-slate-400">
                    Select a course first to enable teacher selection
                  </p>
                )}
              </div>

              {/* Selected teacher card */}
              {selectedTeacher && (
                <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {selectedTeacher.username?.[0]?.toUpperCase() || "T"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {selectedTeacher.username}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{selectedTeacher.email}</p>
                  </div>
                  {slotsData && (
                    <span className="ml-auto text-xs text-slate-400 flex-shrink-0">
                      {slotsData.total_slots} slots available
                    </span>
                  )}
                </div>
              )}

              {/* Slot calendar grid */}
              {formData.teacher_id && formData.student_id && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-300">
                      Pick a Schedule <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-slate-500">
                      Click any highlighted cell to select
                    </span>
                  </div>

                  {slotsLoading && (
                    <div className="flex items-center justify-center py-10 text-slate-400 text-sm gap-2">
                      <i className="fas fa-spinner fa-spin"></i>
                      Loading availability...
                    </div>
                  )}

                  {!slotsLoading && slots.length > 0 && (
                    <>
                      <div className="overflow-x-auto rounded-xl border border-slate-700">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-800/80">
                              <th className="px-3 py-2.5 text-left text-slate-400 font-medium border-b border-r border-slate-700 whitespace-nowrap min-w-[90px]">
                                Day Pair
                              </th>
                              {times.map((t) => (
                                <th
                                  key={t}
                                  className="px-2 py-2.5 text-center text-slate-400 font-medium border-b border-slate-700 whitespace-nowrap"
                                >
                                  {formatTime(t)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {pairOrder.map(({ key, days }, rowIdx) => {
                              const isSelectedRow =
                                selectedSlot && dayPairKey(selectedSlot.days) === key;
                              return (
                                <tr
                                  key={key}
                                  className={
                                    isSelectedRow
                                      ? "bg-indigo-500/10"
                                      : rowIdx % 2 === 0
                                        ? "bg-slate-900"
                                        : "bg-slate-800/30"
                                  }
                                >
                                  <td
                                    className={`px-3 py-2 font-medium border-r border-slate-700 whitespace-nowrap ${
                                      isSelectedRow ? "text-indigo-300" : "text-slate-300"
                                    }`}
                                  >
                                    {dayPairLabel(days)}
                                  </td>
                                  {times.map((t) => {
                                    const slotIdx = map[key]?.[t];
                                    const hasSlot = slotIdx !== undefined;
                                    const isSelected =
                                      selectedSlotIdx !== null && selectedSlotIdx === slotIdx;
                                    return (
                                      <td key={t} className="px-2 py-1.5 text-center">
                                        {hasSlot ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setSelectedSlotIdx(
                                                isSelected ? null : slotIdx,
                                              )
                                            }
                                            className={`w-9 h-7 rounded-md text-[11px] font-medium transition-all ${
                                              isSelected
                                                ? "bg-indigo-500 text-white ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900"
                                                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 border border-emerald-500/30 hover:border-emerald-400/60"
                                            }`}
                                            title={slots[slotIdx]?.label}
                                          >
                                            {isSelected ? (
                                              <i className="fas fa-check text-[9px]"></i>
                                            ) : (
                                              <i className="fas fa-circle text-[5px]"></i>
                                            )}
                                          </button>
                                        ) : (
                                          <span className="block w-9 h-7 mx-auto rounded-md bg-slate-800/40 border border-slate-700/40"></span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-5 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30 inline-block"></span>
                          Available
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span>
                          Selected
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-slate-800/40 border border-slate-700/40 inline-block"></span>
                          Unavailable
                        </span>
                      </div>

                      {/* Selected slot summary */}
                      {selectedSlot && (
                        <div className="mt-3 flex items-center gap-3 px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                          <i className="fas fa-calendar-check text-indigo-400"></i>
                          <div>
                            <p className="text-sm font-semibold text-indigo-300">
                              {selectedSlot.label}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Repeats every{" "}
                              {selectedSlot.days
                                .map(
                                  (d) =>
                                    ({ MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday", FRI: "Friday" })[d] || d,
                                )
                                .join(" & ")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedSlotIdx(null)}
                            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {!slotsLoading && slotsData && slots.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No available slots for this teacher
                    </div>
                  )}
                </div>
              )}

              {formData.teacher_id && !formData.student_id && (
                <p className="text-xs text-slate-500 -mt-2">
                  Select a student above to load available time slots
                </p>
              )}
            </>
          )}

          {/* Errors */}
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{formError}</p>
            </div>
          )}
          {createError && !formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">
                {typeof createError === "string"
                  ? createError
                  : createError?.message || createError?.error || "Failed to create enrollment"}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-700">
            <Button type="button" onClick={onClose} variant="secondary" disabled={createLoading}>
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
