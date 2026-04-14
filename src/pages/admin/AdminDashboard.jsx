import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingApprovals,
  approveUser,
  rejectUser,
  clearApprovalsError,
  setApprovalsLoading,
} from "../../store/slices/approvalsSlice";
import {
  fetchCourses,
  createCourse,
  assignInstructor,
  updateCourse,
  deleteCourse,
  fetchUsers,
  createUser,
  fetchEnrollments,
  selectCourses,
  selectUsers,
  selectEnrollments,
} from "../../store/slices/adminSlice";
import { coursesService } from "../../services/coursesService";
import { adminService } from "../../services/adminService";
import { Button, Input, Card } from "../../components/ui";
import { useFieldErrors } from "../../hooks";
import { normalizeApiError } from "../../utils/errorHandler";
import { BACKEND_CATEGORIES } from "../../constants";
import { toastManager } from "../../utils/toastManager";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateRole,
} from "../../utils/validation";
import {
  Sidebar,
  Header,
  OverviewTab,
  ApprovalsTab,
  CoursesTab,
  UsersTab,
  EnrollmentsTab,
} from "../../components/admin";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeModal, setActiveModal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});
  const [createUserForm, setCreateUserForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "student",
    first_name: "",
    last_name: "",
    student_emails: "",
  });

  // Create user form error handling
  const {
    errors: createUserErrors,
    setErrors: setCreateUserErrors,
    handleApiError: handleCreateUserApiError,
    clearFieldError: clearCreateUserFieldError,
    clearAllErrors: clearAllCreateUserErrors,
  } = useFieldErrors({});

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showCreateUserPassword, setShowCreateUserPassword] = useState(false);
  const [showCreateUserConfirmPassword, setShowCreateUserConfirmPassword] =
    useState(false);

  const [loadingCourseIds, setLoadingCourseIds] = useState(new Set());
  const [updatingCourseId, setUpdatingCourseId] = useState(null);
  const [editCourseForm, setEditCourseForm] = useState({});

  // Extended Users filter state
  const [usersFilters, setUsersFilters] = useState({
    search: "",
    role: "",
    is_active: "",
    ordering: "-date_joined", // Default: newest first
  });

  // Edit course form error handling
  const {
    errors: editCourseErrors,
    setErrors: setEditCourseErrors,
    handleApiError: handleEditCourseApiError,
    clearFieldError: clearEditCourseFieldError,
    clearAllErrors: clearAllEditCourseErrors,
  } = useFieldErrors({});

  // Enrollment analytics state
  const [enrollmentAnalytics, setEnrollmentAnalytics] = useState(null);
  const [enrollmentAnalyticsLoading, setEnrollmentAnalyticsLoading] =
    useState(false);
  const [enrollmentAnalyticsError, setEnrollmentAnalyticsError] =
    useState(null);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Create course form state
  const [createCourseForm, setCreateCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    status: "draft",
    instructor_id: "",
  });

  // Create course form error handling
  const {
    errors: createCourseErrors,
    setErrors: setCreateCourseErrors,
    handleApiError: handleCreateCourseApiError,
    clearFieldError: clearCreateCourseFieldError,
    clearAllErrors: clearAllCreateCourseErrors,
  } = useFieldErrors({});

  // Course filtering state
  const [courseFilters, setCourseFilters] = useState({
    search: "",
    category: "",
    priceRange: "",
    status: "",
    instructor: "",
  });
  const [showCourseFilters, setShowCourseFilters] = useState(false);

  // Get approvals data from Redux store
  const {
    pendingApprovals,
    isLoading: approvalsLoading,
    error: approvalsError,
    isProcessing,
  } = useSelector((state) => state.approvals);

  // Debug loading state changes
  useEffect(() => {
    console.log("🔍 Approvals loading state changed:", {
      approvalsLoading,
      pendingApprovalsLength: pendingApprovals?.length || 0,
      timestamp: new Date().toISOString(),
    });
  }, [approvalsLoading, pendingApprovals]);

  // Set loading state immediately before first render if approvals tab is active
  useLayoutEffect(() => {
    if (activeTab === "approvals") {
      console.log(
        "🔍 Hard refresh detection - setting loading state before paint",
      );
      dispatch(setApprovalsLoading(true));
    }
  }, [dispatch, activeTab]);

  // Get courses and users data from Redux store
  const courses = useSelector(selectCourses);
  const users = useSelector(selectUsers);
  const enrollments = useSelector(selectEnrollments);

  // Fetch pending approvals when component mounts or when approvals tab is active
  useEffect(() => {
    // Initial fetch on mount to populate sidebar count
    dispatch(fetchPendingApprovals());
  }, [dispatch]);

  useEffect(() => {
    // Additional fetch when approvals tab is active
    if (activeTab === "approvals") {
      dispatch(fetchPendingApprovals());
    }
  }, [dispatch, activeTab]);

  // Fetch courses when courses tab is active
  useEffect(() => {
    if (activeTab === "courses") {
      dispatch(fetchCourses());
    }
  }, [dispatch, activeTab]);

  // Fetch users (for instructor assignment) when courses tab is active
  useEffect(() => {
    if (activeTab === "courses") {
      dispatch(fetchUsers({ role: "teacher" }));
    }
  }, [dispatch, activeTab]);

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
      // Clear all validation errors when modal opens
      clearAllCreateCourseErrors();
    } else if (activeModal === null) {
      // Clear errors when modal is closed (in case it was closed via X or Cancel)
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
      // Initialize edit form with course data
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
      // Clear edit form when modal closes
      setEditCourseForm({});
    }
  }, [activeModal, editingCourse, setEditCourseErrors]);

  useEffect(() => {
    if (activeModal === "create-user") {
      setCreateUserForm({
        email: "",
        username: "",
        password: "",
        confirm_password: "",
        role: "student",
        first_name: "",
        last_name: "",
        student_emails: "",
      });
      setCreateUserErrors({});
    }
  }, [activeModal, setCreateUserErrors]);

  useEffect(() => {
    if (activeTab === "overview") {
      const fetchAnalytics = async () => {
        try {
          setAnalyticsLoading(true);
          setAnalyticsError(null);

          const data = await adminService.getDashboardAnalytics();
          setAnalytics(data);
        } catch {
          setAnalyticsError("Failed to load dashboard data");
        } finally {
          setAnalyticsLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [activeTab]);

  // Define handleFetchUsers before useEffect hooks that reference it
  const handleFetchUsers = useCallback(() => {
    // Build query params from active filters
    const params = {};

    if (usersFilters.search) {
      params.search = usersFilters.search;
    }
    if (usersFilters.role) {
      params.role = usersFilters.role;
    }
    if (usersFilters.is_active !== "") {
      params.is_active = usersFilters.is_active;
    }
    if (usersFilters.ordering) {
      params.ordering = usersFilters.ordering;
    }

    dispatch(fetchUsers(params));
  }, [dispatch, usersFilters]);

  // Fetch users when users tab is active or filters change
  useEffect(() => {
    if (activeTab === "users") {
      handleFetchUsers();
    }
  }, [activeTab, handleFetchUsers]);

  useEffect(() => {
    if (activeTab === "overview") {
      const fetchAnalytics = async () => {
        try {
          setAnalyticsLoading(true);
          setAnalyticsError(null);

          const data = await adminService.getDashboardAnalytics();
          setAnalytics(data);
        } catch {
          setAnalyticsError("Failed to load dashboard data");
        } finally {
          setAnalyticsLoading(false);
        }
      };

      const fetchEnrollmentAnalytics = async () => {
        try {
          setEnrollmentAnalyticsLoading(true);
          setEnrollmentAnalyticsError(null);

          const data = await adminService.getEnrollmentAnalytics();
          setEnrollmentAnalytics(data);
        } catch {
          setEnrollmentAnalyticsError("Failed to load enrollment data");
          // Set fallback data if API fails
          setEnrollmentAnalytics([
            { month: "Jan", enrollments: 0, active: 0 },
            { month: "Feb", enrollments: 0, active: 0 },
            { month: "Mar", enrollments: 0, active: 0 },
            { month: "Apr", enrollments: 0, active: 0 },
            { month: "May", enrollments: 0, active: 0 },
            { month: "Jun", enrollments: 0, active: 0 },
          ]);
        } finally {
          setEnrollmentAnalyticsLoading(false);
        }
      };

      fetchAnalytics();
      fetchEnrollmentAnalytics();
    }
  }, [activeTab]);

  // Fetch courses when courses tab is active
  useEffect(() => {
    if (activeTab === "courses") {
      dispatch(fetchCourses());
    }
  }, [dispatch, activeTab]);

  // Fetch users (for instructor assignment) when courses tab is active
  useEffect(() => {
    if (activeTab === "courses") {
      dispatch(fetchUsers({ role: "teacher" }));
    }
  }, [dispatch, activeTab]);

  // Fetch enrollments when enrollments tab is active
  useEffect(() => {
    if (activeTab === "enrollments") {
      dispatch(fetchEnrollments());
    }
  }, [dispatch, activeTab]);

  // Handle approval actions
  const handleApprove = async (userId) => {
    try {
      await dispatch(approveUser(userId)).unwrap();
      toastManager.success("User approved successfully");
    } catch (error) {
      toastManager.error(error || "Failed to approve user");
    }
  };

  const handleReject = async (userId) => {
    try {
      await dispatch(rejectUser(userId)).unwrap();
      toastManager.success("User rejected successfully");
    } catch (error) {
      toastManager.error(error || "Failed to reject user");
    }
  };

  // Fetch detailed course data for editing
  const fetchCourseDetailsForEdit = async (courseId) => {
    setLoadingCourseIds((prev) => new Set(prev).add(courseId));
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
    } finally {
      setLoadingCourseIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (approvalsError) {
      dispatch(clearApprovalsError());
    }
    setIsSidebarOpen(false);
  };

  const handleRefreshApprovals = () => {
    dispatch(fetchPendingApprovals());
  };

  const handleRefreshEnrollments = () => {
    dispatch(fetchEnrollments());
  };

  // Validate create course form
  const validateCreateCourseForm = (formData) => {
    const errors = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = "Course title is required";
    } else if (formData.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters";
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Course description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    // Category validation
    if (!formData.category.trim()) {
      errors.category = "Course category is required";
    } else if (formData.category.trim().length < 2) {
      errors.category = "Category must be at least 2 characters";
    }

    // Price validation
    const price = Number(formData.price);
    if (formData.price === "" || !Number.isInteger(price) || price < 0) {
      errors.price = "Price must be a valid non-decimal positive number";
    }

    // Status validation
    if (!formData.status) {
      errors.status = "Course status is required";
    }

    // Instructor validation (conditional)
    if (formData.status === "published" && !formData.instructor_id) {
      errors.instructor_id = "Instructor is required for published courses";
    }

    return errors;
  };

  // Validate edit course form
  const validateEditCourseForm = (formData) => {
    const errors = {};

    // Title validation
    if (!formData.title?.trim()) {
      errors.title = "Course title is required";
    } else if (formData.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters";
    }

    // Description validation
    if (!formData.description?.trim()) {
      errors.description = "Course description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    // Category validation
    if (!formData.category?.trim()) {
      errors.category = "Course category is required";
    } else if (formData.category.trim().length < 2) {
      errors.category = "Category must be at least 2 characters";
    }

    // Price validation
    const price = Number(formData.price);

    if (formData.price === "" || !Number.isInteger(price) || price < 0) {
      errors.price = "Price must be a valid non-decimal positive number";
    }

    // Status validation
    if (!formData.status) {
      errors.status = "Course status is required";
    }

    // Instructor validation (conditional) - ONLY for published courses
    if (formData.status === "published" && !formData.instructor_id) {
      errors.instructor_id = "Instructor is required for published courses";
    }

    return errors;
  };

  // Handle course creation
  const handleCreateCourse = async (courseData) => {
    // Clear previous errors
    clearAllCreateCourseErrors();

    // Validate form
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

    // Frontend validation
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
      // No need to refetch - the Redux reducer handles state update and moves course to top
    } catch (error) {
      // Use standardized error handling with field-level support
      const hadFieldErrors = handleEditCourseApiError(
        error,
        toastManager.error,
      );

      // If no field errors were handled, show a generic toast
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
      // Refetch courses to ensure instructor data is synchronized
      dispatch(fetchCourses());
    } catch (error) {
      // Use enhanced error handling with field-level support
      const hadFieldErrors = handleEditCourseApiError(
        error,
        toastManager.error,
      );

      // If no field errors were handled, show a generic toast
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

  // Handle create user
  const handleCreateUser = () => {
    setCreateUserForm({
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "student",
      first_name: "",
      last_name: "",
    });
    setActiveModal("create-user");
  };

  // Validate create user form
  const validateCreateUserForm = (formData) => {
    const errors = {};

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }

    // Username validation
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.error;
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0]; // Show first error
    }

    // Confirm password validation
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    // Role validation
    const roleValidation = validateRole(formData.role);
    if (!roleValidation.isValid) {
      errors.role = roleValidation.error;
    }

    return errors;
  };

  // Handle create user submit
  const handleCreateUserSubmit = async (userData) => {
    // Clear previous errors
    clearAllCreateUserErrors();

    // Validate form
    const validationErrors = validateCreateUserForm(userData);
    if (Object.keys(validationErrors).length > 0) {
      setCreateUserErrors(validationErrors);
      return;
    }

    const payload = {
      email: userData.email.trim(),
      username: userData.username.trim(),
      password: userData.password,
      confirm_password: userData.confirm_password,
      role: userData.role,
      first_name: userData.first_name?.trim() || "",
      last_name: userData.last_name?.trim() || "",
    };

    if (userData.role === "parent" && userData.student_emails?.trim()) {
      payload.student_emails = userData.student_emails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);
    }

    try {
      setIsCreatingUser(true);
      await dispatch(createUser(payload)).unwrap();
      toastManager.success("User created successfully");
      setActiveModal(null);
      setCreateUserForm({
        email: "",
        username: "",
        password: "",
        confirm_password: "",
        role: "student",
        first_name: "",
        last_name: "",
        student_emails: "",
      });
      setCreateUserErrors({});
      clearAllCreateUserErrors();
      handleFetchUsers();
    } catch (error) {
      handleCreateUserApiError(error);
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle user editing
  const handleEditUser = (userId) => {
    const user = users?.data?.find((u) => u.id === userId);
    if (user) {
      setEditingUser(user);
      setEditUserForm({
        username: user.username || "",
        email: user.email || "",
        role: user.role || "student",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      });
      setActiveModal("edit-user");
    }
  };

  // Handle user update
  const handleUpdateUser = async (userData) => {
    if (!editingUser) {
      toastManager.error("Error: User ID is missing");
      return;
    }

    try {
      await adminService.updateUser(editingUser.id, userData);
      toastManager.success("User updated successfully");
      setActiveModal(null);
      handleFetchUsers();
      setEditingUser(null);
      setEditUserForm({});
    } catch (error) {
      toastManager.error(error?.message || "Failed to update user");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      toastManager.success("User deleted successfully");
      handleFetchUsers();
    } catch (error) {
      toastManager.error(error?.message || "Failed to delete user");
    }
  };

  return (
    <section
      id="admin-view"
      className="min-h-screen bg-slate-950 text-white flex font-inter"
    >
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <i className="fas fa-graduation-cap text-white text-xs"></i>
          </div>
          <span className="text-sm font-black font-poppins text-white">
            Virtual City Admin
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-slate-400 hover:text-white transition p-2 rounded-lg hover:bg-slate-800"
        >
          <i
            className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"} text-lg`}
          ></i>
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isSidebarOpen={isSidebarOpen}
        pendingApprovalsCount={pendingApprovals?.length || 0}
      />

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-72 p-6 md:p-12 pt-24 lg:pt-12">
        <Header activeTab={activeTab} />

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <OverviewTab
            analytics={analytics}
            analyticsLoading={analyticsLoading}
            analyticsError={analyticsError}
            enrollmentAnalytics={enrollmentAnalytics}
            enrollmentAnalyticsLoading={enrollmentAnalyticsLoading}
            enrollmentAnalyticsError={enrollmentAnalyticsError}
          />
        )}

        {/* Approvals Tab */}
        {activeTab === "approvals" && (
          <ApprovalsTab
            pendingApprovals={pendingApprovals}
            approvalsLoading={approvalsLoading}
            approvalsError={approvalsError}
            isProcessing={isProcessing}
            onApprove={handleApprove}
            onReject={handleReject}
            onRefresh={handleRefreshApprovals}
          />
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
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
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <UsersTab
            users={users?.data || []}
            loading={users?.loading || false}
            usersFilters={usersFilters}
            setUsersFilters={setUsersFilters}
            onUserDelete={handleDeleteUser}
            onFetchUsers={handleFetchUsers}
            onUserEdit={handleEditUser}
            onCreateUser={handleCreateUser}
          />
        )}

        {/* Enrollments Tab */}
        {activeTab === "enrollments" && (
          <EnrollmentsTab
            enrollments={enrollments?.data || []}
            loading={enrollments?.loading || false}
            error={enrollments?.error}
            onRefresh={handleRefreshEnrollments}
          />
        )}
      </main>

      {/* Edit User Modal */}
      {activeModal === "edit-user" && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Username
                </label>
                <Input
                  value={editUserForm.username}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      username: e.target.value,
                    })
                  }
                  className="w-full"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <Input
                  value={editUserForm.email}
                  onChange={(e) =>
                    setEditUserForm({ ...editUserForm, email: e.target.value })
                  }
                  className="w-full"
                  placeholder="Email"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  First Name
                </label>
                <Input
                  value={editUserForm.first_name}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      first_name: e.target.value,
                    })
                  }
                  className="w-full"
                  placeholder="First Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Last Name
                </label>
                <Input
                  value={editUserForm.last_name}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      last_name: e.target.value,
                    })
                  }
                  className="w-full"
                  placeholder="Last Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={editUserForm.role}
                  onChange={(e) =>
                    setEditUserForm({ ...editUserForm, role: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <p className="text-slate-400 text-sm">
              {activeTab === "overview" &&
                "Monitor your platform's performance and key metrics"}
              {activeTab === "approvals" &&
                "Review and manage pending user registration requests"}
              {activeTab === "courses" &&
                "Create, edit, and manage educational courses"}
              {activeTab === "users" && "Manage user accounts and permissions"}
              {activeTab === "enrollments" &&
                "View and manage course enrollments"}
            </p>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setActiveModal(null);
                  setEditingUser(null);
                  setEditUserForm({});
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateUser(editUserForm)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Update User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {activeModal === "create-user" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create User</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Username
                </label>
                <input
                  value={createUserForm.username}
                  onChange={(e) => {
                    setCreateUserForm({
                      ...createUserForm,
                      username: e.target.value,
                    });
                    clearCreateUserFieldError("username");
                  }}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    createUserErrors.username
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-indigo-500"
                  }`}
                  placeholder="Username"
                />
                {createUserErrors.username && (
                  <p className="text-red-400 text-xs mt-1">
                    {createUserErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) => {
                    setCreateUserForm({
                      ...createUserForm,
                      email: e.target.value,
                    });
                    clearCreateUserFieldError("email");
                  }}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    createUserErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-indigo-500"
                  }`}
                  placeholder="user@example.com"
                />
                {createUserErrors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {createUserErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showCreateUserPassword ? "text" : "password"}
                    value={createUserForm.password}
                    onChange={(e) => {
                      setCreateUserForm({
                        ...createUserForm,
                        password: e.target.value,
                      });
                      clearCreateUserFieldError("password");
                      clearCreateUserFieldError("confirm_password");
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 pr-10 ${
                      createUserErrors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    }`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateUserPassword(!showCreateUserPassword)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <i
                      className={`fas ${
                        showCreateUserPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></i>
                  </button>
                </div>
                {createUserErrors.password && (
                  <p className="text-red-400 text-xs mt-1">
                    {createUserErrors.password}
                  </p>
                )}

                {/* Password Strength Indicator */}
                {createUserForm.password && (
                  <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-3 font-medium">
                      Password must contain:
                    </p>
                    <div className="space-y-2">
                      <div
                        className={`flex items-center gap-2 text-xs ${createUserForm.password.length >= 8 ? "text-green-400" : "text-slate-500"}`}
                      >
                        <i
                          className={`fas ${createUserForm.password.length >= 8 ? "fa-check-circle" : "fa-circle"} text-[8px]`}
                        ></i>
                        At least 8 characters
                      </div>
                      <div
                        className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(createUserForm.password) ? "text-green-400" : "text-slate-500"}`}
                      >
                        <i
                          className={`fas ${/[A-Z]/.test(createUserForm.password) ? "fa-check-circle" : "fa-circle"} text-[8px]`}
                        ></i>
                        One uppercase letter
                      </div>
                      <div
                        className={`flex items-center gap-2 text-xs ${/[a-z]/.test(createUserForm.password) ? "text-green-400" : "text-slate-500"}`}
                      >
                        <i
                          className={`fas ${/[a-z]/.test(createUserForm.password) ? "fa-check-circle" : "fa-circle"} text-[8px]`}
                        ></i>
                        One lowercase letter
                      </div>
                      <div
                        className={`flex items-center gap-2 text-xs ${/[0-9]/.test(createUserForm.password) ? "text-green-400" : "text-slate-500"}`}
                      >
                        <i
                          className={`fas ${/[0-9]/.test(createUserForm.password) ? "fa-check-circle" : "fa-circle"} text-[8px]`}
                        ></i>
                        One number
                      </div>
                      <div
                        className={`flex items-center gap-2 text-xs ${/[!@#$%^&*()_+=[\]{};':"|,.<>/?]/.test(createUserForm.password) ? "text-green-400" : "text-slate-500"}`}
                      >
                        <i
                          className={`fas ${/[!@#$%^&*()_+=[\]{};':"|,.<>/?]/.test(createUserForm.password) ? "fa-check-circle" : "fa-circle"} text-[8px]`}
                        ></i>
                        One special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showCreateUserConfirmPassword ? "text" : "password"}
                    value={createUserForm.confirm_password}
                    onChange={(e) => {
                      setCreateUserForm({
                        ...createUserForm,
                        confirm_password: e.target.value,
                      });
                      clearCreateUserFieldError("confirm_password");
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 pr-10 ${
                      createUserErrors.confirm_password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    }`}
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateUserConfirmPassword(
                        !showCreateUserConfirmPassword,
                      )
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <i
                      className={`fas ${
                        showCreateUserConfirmPassword
                          ? "fa-eye-slash"
                          : "fa-eye"
                      }`}
                    ></i>
                  </button>
                </div>
                {createUserErrors.confirm_password && (
                  <p className="text-red-400 text-xs mt-1">
                    {createUserErrors.confirm_password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  First Name
                </label>
                <input
                  value={createUserForm.first_name}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      first_name: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    createUserErrors.first_name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-indigo-500"
                  }`}
                  placeholder="First Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Last Name
                </label>
                <input
                  value={createUserForm.last_name}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      last_name: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    createUserErrors.last_name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-indigo-500"
                  }`}
                  placeholder="Last Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={createUserForm.role}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      role: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    createUserErrors.role
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-indigo-500"
                  }`}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setActiveModal(null);
                  setCreateUserForm({
                    username: "",
                    email: "",
                    password: "",
                    confirm_password: "",
                    role: "student",
                    first_name: "",
                    last_name: "",
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCreateUserSubmit(createUserForm)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={isCreatingUser}
              >
                {isCreatingUser ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
