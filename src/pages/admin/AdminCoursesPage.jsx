import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCourses,
  fetchUsers,
  createCourse,
  assignInstructor,
  updateCourse,
  deleteCourse,
  selectCourses,
  selectUsers,
} from "../../store/slices/adminSlice";
import { coursesService } from "../../services/coursesService";
import { Button, Input, Card } from "../../components/ui";
import { useFieldErrors } from "../../hooks";
import { normalizeApiError } from "../../utils/errorHandler";
import { toastManager } from "../../utils/toastManager";
import CoursesTab from "../../components/admin/CoursesTab";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showApiError } from "../../utils/apiErrorHandler";

const AdminCoursesPage = () => {
  const dispatch = useDispatch();

  const [categories, setCategories] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loadingCourseIds, setLoadingCourseIds] = useState(new Set());
  const [updatingCourseId, setUpdatingCourseId] = useState(null);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, courseId: null, courseTitle: "" });

  // Course form states
  const [createCourseForm, setCreateCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    status: "draft",
    instructor_id: "",
    days_of_recurring: [],
    time: "",
    outline: "",
    attachment: null,
    thumbnail: null,
  });

  const [editCourseForm, setEditCourseForm] = useState({});
  const [showCourseFilters, setShowCourseFilters] = useState(false);
  const [courseFilters, setCourseFilters] = useState({
    search: "",
    category: "",
    priceRange: "",
    status: "",
    instructor: "",
  });

  // Get data from Redux store
  const courses = useSelector(selectCourses);
  const users = useSelector(selectUsers);

  // Error handling
  const {
    errors: createCourseErrors,
    setErrors: setCreateCourseErrors,
    handleApiError: handleCreateCourseApiError,
    clearFieldError: clearCreateCourseFieldError,
    clearAllErrors: clearAllCreateCourseErrors,
  } = useFieldErrors({});

  const {
    errors: editCourseErrors,
    setErrors: setEditCourseErrors,
    handleApiError: handleEditCourseApiError,
    clearFieldError: clearEditCourseFieldError,
    clearAllErrors: clearAllEditCourseErrors,
  } = useFieldErrors({});

  // Fetch categories on mount (courses + teachers are handled by AdminLayout on tab switch)
  useEffect(() => {
    coursesService.getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Reset create course form when modal opens/closes
  useEffect(() => {
    if (activeModal === "create-course") {
      setCreateCourseForm({
        title: "",
        description: "",
        category: "",
        price: "",
        status: "draft",
        instructor_id: "",
        days_of_recurring: [],
        time: "",
        outline: "",
        attachment: null,
        thumbnail: null,
      });
      clearAllCreateCourseErrors();
    } else if (activeModal === null) {
      clearAllCreateCourseErrors();
    }
  }, [activeModal, clearAllCreateCourseErrors]);

  // Reset edit course form when edit modal opens/closes
  useEffect(() => {
    if (
      activeModal &&
      typeof activeModal === "object" &&
      activeModal.type === "edit-course"
    ) {
      if (editingCourse) {
        setEditCourseForm({
          title: editingCourse.title || "",
          description: editingCourse.description || "",
          category: editingCourse.category?.id?.toString() || editingCourse.category || "",
          price: editingCourse.price || "",
          status: editingCourse.status || "draft",
          instructor_id:
            editingCourse.instructor?.id || editingCourse.instructor_id || "",
          instructor: editingCourse.instructor || null,
          days_of_recurring:
            editingCourse.schedule?.days || editingCourse.days_of_recurring || [],
          time: editingCourse.schedule?.time || editingCourse.time || "",
          outline: editingCourse.outline || "",
          attachment: null,
          attachment_url: editingCourse.attachment || null,
          thumbnail: null,
          thumbnail_url: editingCourse.thumbnail || null,
          has_session: editingCourse.has_session ?? false,
        });
      }
    } else {
      setEditCourseForm({});
    }
  }, [activeModal, editingCourse, setEditCourseErrors]);

  // Fetch detailed course data for editing
  const fetchCourseDetailsForEdit = async (courseId) => {
    try {
      const courseDetails = await coursesService.getCourseById(courseId);
      setEditingCourse(courseDetails);
      setActiveModal({
        type: "edit-course",
        courseId: courseId,
      });
    } catch (error) {
      console.error("Error fetching course details:", error);
      toastManager.error("Failed to load course details");
    }
  };

  const validateCourseForm = (formData) => {
    const errors = {};

    if (!formData.title?.trim()) {
      errors.title = "Course title is required";
    } else if (formData.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters";
    }

    if (!formData.description?.trim()) {
      errors.description = "Course description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    if (!formData.category) {
      errors.category = "Course category is required";
    }

    const price = Number(formData.price);
    if (formData.price === "" || !Number.isInteger(price) || price < 0) {
      errors.price = "Price must be a valid non-decimal positive number";
    }

    if (!formData.status) {
      errors.status = "Course status is required";
    }

    if (!formData.instructor_id) {
      errors.instructor_id = "Instructor is required";
    }

    // if (!Array.isArray(formData.days_of_recurring) || !formData.days_of_recurring.length) {
    //   errors.days_of_recurring = "Please select at least one recurring day";
    // }

    // if (!formData.time) {
    //   errors.time = "Time is required";
    // }

    return errors;
  };

  const buildCoursePayload = (formData) => {
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    if (formData.category) fd.append("category", Number(formData.category));
    fd.append("price", Number(formData.price));
    fd.append("status", formData.status);
    fd.append("instructor_id", Number(formData.instructor_id));
    fd.append("schedule", JSON.stringify({ days: formData.days_of_recurring, time: formData.time }));
    if (formData.outline) fd.append("outline", formData.outline);
    if (formData.attachment instanceof File) fd.append("attachment", formData.attachment);
    if (formData.thumbnail instanceof File) fd.append("thumbnail", formData.thumbnail);
    return fd;
  };

  // Handle course creation
  const handleCreateCourse = async (courseData) => {
    clearAllCreateCourseErrors();

    const validationErrors = validateCourseForm(courseData);
    if (Object.keys(validationErrors).length > 0) {
      setCreateCourseErrors(validationErrors);
      toastManager.error("Please fix highlighted fields");
      return;
    }

    setIsCreatingCourse(true);
    try {
      await dispatch(createCourse(buildCoursePayload(courseData))).unwrap();
      toastManager.success("Course created successfully");
      setActiveModal(null);
      setCreateCourseForm({
        title: "",
        description: "",
        category: "",
        price: "",
        status: "draft",
        instructor_id: "",
        days_of_recurring: [],
        time: "",
        outline: "",
        attachment: null,
        thumbnail: null,
      });
      clearAllCreateCourseErrors();
    } catch (error) {
      showApiError(error);
    } finally {
      setIsCreatingCourse(false);
    }
  };

  // Handle course update
  const handleUpdateCourse = async (courseData) => {
    if (!editingCourse) {
      toastManager.error("Error: Course ID is missing");
      return;
    }

    const errors = validateCourseForm(courseData);
    setEditCourseErrors(errors);

    if (Object.keys(errors).length > 0) {
      toastManager.error("Please fix highlighted fields");
      return;
    }

    setUpdatingCourseId(editingCourse.id);
    try {
      await dispatch(
        updateCourse({ courseId: editingCourse.id, courseData: buildCoursePayload(courseData) }),
      ).unwrap();
      toastManager.success("Course updated successfully");
      setActiveModal(null);
    } catch (error) {
      showApiError(error)
    } finally {
      setUpdatingCourseId(null);
    }
  };

  // Handle instructor assignment
  const handleAssignInstructor = async (courseId, instructorId) => {
    if (!instructorId) {
      toastManager.error("Please select an instructor");
      return;
    }

    try {
      await dispatch(assignInstructor({ courseId, instructorId })).unwrap();
      toastManager.success("Tutor assigned successfully");
      setActiveModal(null);
    } catch (error) {
      showApiError(error);
      // const hadFieldErrors = handleEditCourseApiError(
      //   error,
      //   toastManager.error,
      // );
      // if (!hadFieldErrors) {
      //   const normalizedError = normalizeApiError(error);
      //   toastManager.error(normalizedError.message);
      // }
    }
  };

  // Handle course deletion
  const handleDeleteCourse = (courseId) => {
    const course = courses?.data?.find((c) => c.id === courseId);
    const courseTitle = course?.title || "this course";
    setConfirmDialog({ open: true, courseId, courseTitle });
  };

  const confirmDeleteCourse = async () => {
    const { courseId } = confirmDialog;
    setConfirmDialog({ open: false, courseId: null, courseTitle: "" });

    setLoadingCourseIds((prev) => new Set(prev).add(courseId));
    try {
      await dispatch(deleteCourse(courseId)).unwrap();
      toastManager.success("Course deleted successfully");
    } catch (error) {
      showApiError(error);
    } finally {
      setLoadingCourseIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  return (
    <>
    <CoursesTab
      courses={courses?.data || []}
      users={users?.data || []}
      categories={categories}
      onCategoriesChanged={setCategories}
      loading={courses?.loading || false}
      loadingCourseIds={loadingCourseIds}
      updatingCourseId={updatingCourseId}
      isCreatingCourse={isCreatingCourse}
      editCourseForm={editCourseForm}
      setEditCourseForm={setEditCourseForm}
      createCourseForm={createCourseForm}
      setCreateCourseForm={setCreateCourseForm}
      createCourseErrors={createCourseErrors}
      clearCreateCourseFieldError={clearCreateCourseFieldError}
      editCourseErrors={editCourseErrors}
      clearEditCourseFieldError={clearEditCourseFieldError}
      clearAllEditCourseErrors={clearAllEditCourseErrors}
      onCourseCreate={handleCreateCourse}
      onCourseUpdate={handleUpdateCourse}
      onCourseDelete={handleDeleteCourse}
      onCourseEdit={fetchCourseDetailsForEdit}
      onAssignInstructor={handleAssignInstructor}
      activeModal={activeModal}
      setActiveModal={setActiveModal}
      showCourseFilters={showCourseFilters}
      setShowCourseFilters={setShowCourseFilters}
      courseFilters={courseFilters}
      setCourseFilters={setCourseFilters}
    />

    <ConfirmDialog
      open={confirmDialog.open}
      variant="danger"
      title="Delete Course"
      message={`Are you sure you want to delete "${confirmDialog.courseTitle}"? This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={confirmDeleteCourse}
      onCancel={() => setConfirmDialog({ open: false, courseId: null, courseTitle: "" })}
    />
    </>
  );
};

export default AdminCoursesPage;
