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

const AdminCoursesPage = () => {
  const dispatch = useDispatch();

  const [activeModal, setActiveModal] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loadingCourseIds, setLoadingCourseIds] = useState(new Set());
  const [updatingCourseId, setUpdatingCourseId] = useState(null);

  // Course form states
  const [createCourseForm, setCreateCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    status: "draft",
    instructor_id: "",
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

  // Fetch courses on component mount
  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchUsers({ role: "teacher" })); // For instructor assignment
  }, [dispatch]);

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
          category: editingCourse.category || "",
          price: editingCourse.price || "",
          status: editingCourse.status || "draft",
          instructor_id:
            editingCourse.instructor?.id || editingCourse.instructor_id || "",
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

  // Validation functions
  const validateCreateCourseForm = (formData) => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Course title is required";
    } else if (formData.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters";
    }

    if (!formData.description.trim()) {
      errors.description = "Course description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    if (!formData.category.trim()) {
      errors.category = "Course category is required";
    }

    const price = Number(formData.price);
    if (formData.price === "" || !Number.isInteger(price) || price < 0) {
      errors.price = "Price must be a valid non-decimal positive number";
    }

    if (!formData.status) {
      errors.status = "Course status is required";
    }

    if (formData.status === "published" && !formData.instructor_id) {
      errors.instructor_id = "Instructor is required for published courses";
    }

    return errors;
  };

  const validateEditCourseForm = (formData) => {
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

    if (!formData.category?.trim()) {
      errors.category = "Course category is required";
    }

    const price = Number(formData.price);
    if (formData.price === "" || !Number.isInteger(price) || price < 0) {
      errors.price = "Price must be a valid non-decimal positive number";
    }

    if (!formData.status) {
      errors.status = "Course status is required";
    }

    if (formData.status === "published" && !formData.instructor_id) {
      errors.instructor_id = "Instructor is required for published courses";
    }

    return errors;
  };

  // Handle course creation
  const handleCreateCourse = async (courseData) => {
    clearAllCreateCourseErrors();

    const validationErrors = validateCreateCourseForm(courseData);
    if (Object.keys(validationErrors).length > 0) {
      setCreateCourseErrors(validationErrors);
      toastManager.error("Please fix highlighted fields");
      return;
    }

    try {
      await dispatch(createCourse(courseData)).unwrap();
      toastManager.success("Course created successfully");
      setActiveModal(null);
      dispatch(fetchCourses());
      setCreateCourseForm({
        title: "",
        description: "",
        category: "",
        price: "",
        status: "draft",
        instructor_id: "",
      });
      clearAllCreateCourseErrors();
    } catch (error) {
      handleCreateCourseApiError(error);
    }
  };

  // Handle course update
  const handleUpdateCourse = async (courseData) => {
    if (!editingCourse) {
      toastManager.error("Error: Course ID is missing");
      return;
    }

    const errors = validateEditCourseForm(courseData);
    setEditCourseErrors(errors);

    if (Object.keys(errors).length > 0) {
      toastManager.error("Please fix highlighted fields");
      return;
    }

    setUpdatingCourseId(editingCourse.id);
    try {
      await dispatch(
        updateCourse({ courseId: editingCourse.id, courseData }),
      ).unwrap();
      toastManager.success("Course updated successfully");
      setActiveModal(null);
    } catch (error) {
      const hadFieldErrors = handleEditCourseApiError(
        error,
        toastManager.error,
      );
      if (!hadFieldErrors) {
        const normalizedError = normalizeApiError(error);
        toastManager.error(normalizedError.message);
      }
    } finally {
      setUpdatingCourseId(null);
    }
  };

  // Handle instructor assignment
  const handleAssignInstructor = async (courseId, instructorId) => {
    try {
      await dispatch(assignInstructor({ courseId, instructorId })).unwrap();
      toastManager.success("Instructor assigned successfully");
      setActiveModal(null);
      dispatch(fetchCourses());
    } catch (error) {
      const hadFieldErrors = handleEditCourseApiError(
        error,
        toastManager.error,
      );
      if (!hadFieldErrors) {
        const normalizedError = normalizeApiError(error);
        toastManager.error(normalizedError.message);
      }
    }
  };

  // Handle course deletion
  const handleDeleteCourse = async (courseId) => {
    const course = courses?.data?.find((c) => c.id === courseId);
    const courseTitle = course?.title || "this course";

    const confirmed = window.confirm(
      `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setLoadingCourseIds((prev) => new Set(prev).add(courseId));
    try {
      await dispatch(deleteCourse(courseId)).unwrap();
      toastManager.success("Course deleted successfully");
      dispatch(fetchCourses());
    } catch (error) {
      toastManager.error(error?.message || "Failed to delete course");
    } finally {
      setLoadingCourseIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  return (
    <CoursesTab
      courses={courses?.data || []}
      users={users?.data || []}
      loading={courses?.loading || false}
      loadingCourseIds={loadingCourseIds}
      updatingCourseId={updatingCourseId}
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
  );
};

export default AdminCoursesPage;
