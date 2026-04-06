import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
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
  selectCourses,
  selectUsers,
} from "../../store/slices/adminSlice";
import { coursesService } from "../../services/coursesService";
import { adminService } from "../../services/adminService";
import { Button, Input, Card } from "../../components/ui";
import { useFieldErrors } from "../../hooks";
import { normalizeApiError } from "../../utils/errorHandler";
import { BACKEND_CATEGORIES, formatCategoryLabel } from "../../constants";
import { toastManager } from "../../utils/toastManager";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateRole,
} from "../../utils/validation";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeModal, setActiveModal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loadingCourseIds, setLoadingCourseIds] = useState(new Set());
  const [updatingCourseId, setUpdatingCourseId] = useState(null);
  const [editCourseForm, setEditCourseForm] = useState({});
  const [createUserForm, setCreateUserForm] = useState({
    email: "",
    username: "",
    password: "",
    confirm_password: "",
    role: "student",
    student_emails: "",
  });

  const [createUserErrors, setCreateUserErrors] = useState({});
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [showCreateUserPassword, setShowCreateUserPassword] = useState(false);
  const [showCreateUserConfirmPassword, setShowCreateUserConfirmPassword] =
    useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Use field errors hook for edit course form
  const {
    errors: editCourseErrors,
    setErrors: setEditCourseErrors,
    handleApiError: handleEditCourseApiError,
    clearFieldError: clearEditCourseFieldError,
  } = useFieldErrors({});

  // Create course form state
  const [createCourseForm, setCreateCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    status: "draft",
    instructor_id: "",
  });

  // Use field errors hook for create course form only
  const {
    errors: createCourseErrors,
    setErrors: setCreateCourseErrors,
    handleApiError: handleCourseApiError,
    clearFieldError: clearCreateCourseFieldError,
    clearAllErrors: clearAllCourseErrors,
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

  // Get courses and users data from Redux store
  const courses = useSelector(selectCourses);
  const users = useSelector(selectUsers);

  // Set loading state immediately before first render if approvals tab is active
  useLayoutEffect(() => {
    if (activeTab === "approvals") {
      console.log(
        "🔍 Hard refresh detection - setting loading state before paint",
      );
      dispatch(setApprovalsLoading(true));
    }
  }, [dispatch, activeTab]);

  // Fetch pending approvals when component mounts or when approvals tab is active
  useEffect(() => {
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
      clearAllCourseErrors();
    }
  }, [activeModal, clearAllCourseErrors]);

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
      setEditCourseErrors({});
    } else {
      // Clear edit form when modal closes
      setEditCourseForm({});
      setEditCourseErrors({});
    }
  }, [activeModal, editingCourse, setEditCourseErrors]);

  useEffect(() => {
    if (activeTab === "users") {
      handleFetchUsers();
    }
  }, [dispatch, activeTab, handleFetchUsers]);

  useEffect(() => {
    if (activeTab === "users") {
      handleFetchUsers();
    }
  }, [userRoleFilter, handleFetchUsers, activeTab]);

  useEffect(() => {
    if (activeModal === "create-user") {
      setCreateUserForm({
        email: "",
        username: "",
        password: "",
        confirm_password: "",
        role: "student",
        student_emails: "",
      });
      setCreateUserErrors({});
    }
  }, [activeModal]);

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

  // Get unique values for course filter options
  const courseFilterOptions = useMemo(() => {
    const instructors =
      courses.data && courses.data.length > 0
        ? [
            ...new Set(
              courses.data
                .map((course) => course.instructor?.username)
                .filter(Boolean),
            ),
          ].sort()
        : [];

    const statuses =
      courses.data && courses.data.length > 0
        ? [
            ...new Set(
              courses.data.map((course) => course.status).filter(Boolean),
            ),
          ].sort()
        : [];

    // Use backend categories - these are the only valid choices
    const categories = BACKEND_CATEGORIES;

    console.log("🔍 Backend categories available:", {
      backendCategories: BACKEND_CATEGORIES,
      categoriesInUse: courses.data
        ?.map((course) => course.category)
        .filter(Boolean),
      finalCategories: categories,
    });

    return {
      categories, // Keep as simple strings for consistency
      instructors,
      statuses,
      priceRanges: [
        { value: "0-50", label: "Free - PKR 50" },
        { value: "51-100", label: "PKR 51 - 100" },
        { value: "101-500", label: "PKR 101 - 500" },
        { value: "501-1000", label: "PKR 501 - 1000" },
        { value: "1000+", label: "PKR 1000+" },
      ],
    };
  }, [courses.data]);

  // Filter courses based on search term and filters
  const filteredCourses = useMemo(() => {
    if (!courses.data || courses.data.length === 0) return [];

    const filtered = courses.data.filter((course) => {
      // Search filter (title, instructor, category, description)
      const matchesSearch =
        courseFilters.search === "" ||
        course.title
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase()) ||
        course.instructor?.username
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase()) ||
        course.category
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase()) ||
        course.description
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase());

      // Category filter
      const matchesCategory =
        courseFilters.category === "" ||
        course.category === courseFilters.category;

      // Price range filter
      const matchesPrice =
        courseFilters.priceRange === "" ||
        (() => {
          const price = parseFloat(course.price) || 0;
          switch (courseFilters.priceRange) {
            case "0-50":
              return price >= 0 && price <= 50;
            case "51-100":
              return price >= 51 && price <= 100;
            case "101-500":
              return price >= 101 && price <= 500;
            case "501-1000":
              return price >= 501 && price <= 1000;
            case "1000+":
              return price >= 1000;
            default:
              return true;
          }
        })();

      // Status filter
      const matchesStatus =
        courseFilters.status === "" || course.status === courseFilters.status;

      // Instructor filter
      const matchesInstructor =
        courseFilters.instructor === "" ||
        course.instructor?.username === courseFilters.instructor;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesStatus &&
        matchesInstructor
      );
    });

    return filtered;
  }, [courses.data, courseFilters]);

  // Check if any course filters are active
  const hasActiveCourseFilters = useMemo(() => {
    return Object.values(courseFilters).some((value) => value !== "");
  }, [courseFilters]);

  // Reset all course filters
  const resetCourseFilters = () => {
    setCourseFilters({
      search: "",
      category: "",
      priceRange: "",
      status: "",
      instructor: "",
    });
  };

  // Handle course filter changes
  const handleCourseFilterChange = (filterName, value) => {
    setCourseFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

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

  // Handle course creation
  const handleCreateCourse = async (courseData) => {
    // Frontend validation
    const errors = validateCreateCourseForm(courseData);
    setCreateCourseErrors(errors);

    if (Object.keys(errors).length > 0) {
      toastManager.error("Please fix highlighted fields");
      return;
    }

    try {
      await dispatch(createCourse(courseData)).unwrap();
      toastManager.success("Course created successfully");
      setActiveModal(null);
      // Refresh courses to get complete instructor data
      dispatch(fetchCourses());
      // Reset form
      setCreateCourseForm({
        title: "",
        description: "",
        category: "",
        price: "",
        status: "draft",
        instructor_id: "",
      });
      clearAllCourseErrors();
    } catch (error) {
      // Use enhanced error handling with field-level support
      const hadFieldErrors = handleCourseApiError(error, toastManager.error);

      // If no field errors were handled, show a generic toast
      if (!hadFieldErrors) {
        const normalizedError = normalizeApiError(error);
        toastManager.error(normalizedError.message);
      }
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
      const hadFieldErrors = handleCourseApiError(error, toastManager.error);

      // If no field errors were handled, show a generic toast
      if (!hadFieldErrors) {
        const normalizedError = normalizeApiError(error);
        toastManager.error(normalizedError.message);
      }
    }
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

  // Handle course update
  const handleUpdateCourse = async (courseId, courseData) => {
    // Frontend validation
    const errors = validateEditCourseForm(courseData);
    setEditCourseErrors(errors);

    if (Object.keys(errors).length > 0) {
      toastManager.error("Please fix highlighted fields");
      return;
    }

    setUpdatingCourseId(courseId);
    try {
      await dispatch(updateCourse({ courseId, courseData })).unwrap();
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

  // Handle course deletion
  const handleDeleteCourse = async (courseId, courseTitle) => {
    console.log("Delete course called with:", { courseId, courseTitle });

    const confirmed = window.confirm(
      `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await dispatch(deleteCourse(courseId)).unwrap();
      toastManager.success("Course deleted successfully");
      // Refresh courses to update the list
      dispatch(fetchCourses());
    } catch (error) {
      toastManager.error(error || "Failed to delete course");
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

  // Clear error when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (approvalsError) {
      dispatch(clearApprovalsError());
    }
    setIsSidebarOpen(false);
  };

  const handleFetchUsers = useCallback(() => {
    if (userRoleFilter) {
      dispatch(fetchUsers({ role: userRoleFilter }));
    } else {
      dispatch(fetchUsers());
    }
  }, [dispatch, userRoleFilter]);

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
    if (!formData.confirm_password) {
      errors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    // Role validation
    const roleValidation = validateRole(formData.role);
    if (!roleValidation.isValid) {
      errors.role = roleValidation.error;
    }

    return errors;
  };

  const handleCreateUser = async () => {
    const errors = validateCreateUserForm(createUserForm);
    setCreateUserErrors(errors);

    if (Object.keys(errors).length > 0) {
      toastManager.error("Please fix highlighted fields");
      return;
    }

    const payload = {
      email: createUserForm.email.trim(),
      username: createUserForm.username.trim(),
      password: createUserForm.password,
      confirm_password: createUserForm.confirm_password,
      role: createUserForm.role,
    };

    if (
      createUserForm.role === "parent" &&
      createUserForm.student_emails.trim()
    ) {
      payload.student_emails = createUserForm.student_emails
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
        student_emails: "",
      });
      setCreateUserErrors({});
      handleFetchUsers();
    } catch (error) {
      toastManager.error(error?.message || error || "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const StatCard = ({ label, value, icon, trend, color = "indigo" }) => {
    const colorClasses = {
      indigo:
        "from-indigo-500/20 to-indigo-600/20 border-indigo-500/20 text-indigo-400",
      emerald:
        "from-emerald-500/20 to-emerald-600/20 border-emerald-500/20 text-emerald-400",
      amber:
        "from-amber-500/20 to-amber-600/20 border-amber-500/20 text-amber-400",
      purple:
        "from-purple-500/20 to-purple-600/20 border-purple-500/20 text-purple-400",
      rose: "from-rose-500/20 to-rose-600/20 border-rose-500/20 text-rose-400",
      blue: "from-blue-500/20 to-blue-600/20 border-blue-500/20 text-blue-400",
    };

    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <i className={`${icon} text-lg`}></i>
              </div>
              <p className="text-xs uppercase tracking-widest opacity-80">
                {label}
              </p>
            </div>
            {trend && (
              <div
                className={`flex items-center gap-1 text-xs ${trend > 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                <i className={`fas fa-arrow-${trend > 0 ? "up" : "down"}`}></i>
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
      </div>
    );
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
      <aside
        className={`w-72 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-graduation-cap text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-black font-poppins text-white">
                Virtual City
              </h1>
              <p className="text-xs text-slate-400">Admin Portal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <nav className="space-y-2">
            {[
              { id: "overview", label: "Overview", icon: "fas fa-chart-line" },
              {
                id: "approvals",
                label: "Approvals",
                icon: "fas fa-user-check",
              },
              { id: "courses", label: "Courses", icon: "fas fa-book" },
              { id: "users", label: "Users", icon: "fas fa-users" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-3 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <i
                  className={`${tab.icon} ${activeTab === tab.id ? "text-white" : "text-slate-500"}`}
                ></i>
                <span>{tab.label}</span>
                {tab.id === "approvals" && pendingApprovals?.length > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-slate-400">admin@virtualcity.edu</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-72 p-6 md:p-12 pt-24 lg:pt-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black font-poppins text-white capitalize mb-2">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "approvals" && "User Approvals"}
              {activeTab === "courses" && "Course Management"}
              {activeTab === "users" && "User Management"}
            </h2>
            <p className="text-slate-400 text-sm">
              {activeTab === "overview" &&
                "Monitor your platform's performance and key metrics"}
              {activeTab === "approvals" &&
                "Review and manage pending user registration requests"}
              {activeTab === "courses" &&
                "Create, edit, and manage educational courses"}
              {activeTab === "users" && "Manage user accounts and permissions"}
            </p>
          </div>
        </header>

        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Loading */}
            {analyticsLoading && (
              <div className="flex flex-col items-center justify-center p-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-500 rounded-full animate-spin animation-delay-150"></div>
                </div>
                <p className="mt-6 text-slate-400 text-lg font-medium">
                  Loading dashboard data...
                </p>
                <p className="mt-2 text-slate-500 text-sm">
                  Please wait while we fetch the latest analytics
                </p>
              </div>
            )}

            {/* Error */}
            {analyticsError && (
              <div className="flex flex-col items-center justify-center p-16">
                <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-exclamation-triangle text-rose-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Unable to Load Dashboard
                </h3>
                <p className="text-slate-400 text-center mb-6 max-w-md">
                  {analyticsError}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  Try Again
                </button>
              </div>
            )}

            {/* Data */}
            {analytics && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    label="Total Users"
                    value={analytics.users.total}
                    icon="fas fa-users"
                    trend={12}
                    color="indigo"
                  />
                  <StatCard
                    label="Active Students"
                    value={analytics.users.students}
                    icon="fas fa-graduation-cap"
                    trend={8}
                    color="emerald"
                  />
                  <StatCard
                    label="Total Courses"
                    value={analytics.courses.total}
                    icon="fas fa-book"
                    trend={15}
                    color="purple"
                  />
                  <StatCard
                    label="Revenue"
                    value={`PKR ${analytics.revenue.estimated}`}
                    icon="fas fa-chart-line"
                    trend={23}
                    color="amber"
                  />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Distribution Chart */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-chart-pie text-indigo-400 text-sm"></i>
                      </div>
                      User Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Students",
                              value: analytics.users.students,
                              color: "#10b981",
                            },
                            {
                              name: "Teachers",
                              value: analytics.users.teachers,
                              color: "#8b5cf6",
                            },
                            {
                              name: "Parents",
                              value: analytics.users.parents,
                              color: "#f59e0b",
                            },
                            {
                              name: "Admins",
                              value: analytics.users.admins,
                              color: "#ef4444",
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {[
                            {
                              name: "Students",
                              value: analytics.users.students,
                              color: "#10b981",
                            },
                            {
                              name: "Teachers",
                              value: analytics.users.teachers,
                              color: "#8b5cf6",
                            },
                            {
                              name: "Parents",
                              value: analytics.users.parents,
                              color: "#f59e0b",
                            },
                            {
                              name: "Admins",
                              value: analytics.users.admins,
                              color: "#ef4444",
                            },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#e2e8f0" }}
                        />
                        <Legend
                          wrapperStyle={{ color: "#94a3b8" }}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Course Status Chart */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-chart-bar text-purple-400 text-sm"></i>
                      </div>
                      Course Status
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          {
                            name: "Published",
                            value: analytics.courses.published,
                            color: "#10b981",
                          },
                          {
                            name: "Draft",
                            value: analytics.courses.draft,
                            color: "#6b7280",
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#e2e8f0" }}
                          itemStyle={{ color: "#e2e8f0" }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {[
                            {
                              name: "Published",
                              value: analytics.courses.published,
                              color: "#10b981",
                            },
                            {
                              name: "Draft",
                              value: analytics.courses.draft,
                              color: "#6b7280",
                            },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <StatCard
                    label="Teachers"
                    value={analytics.users.teachers}
                    icon="fas fa-chalkboard-teacher"
                    color="blue"
                  />
                  <StatCard
                    label="Parents"
                    value={analytics.users.parents}
                    icon="fas fa-user-friends"
                    color="rose"
                  />
                  <StatCard
                    label="Active Users"
                    value={analytics.users.active}
                    icon="fas fa-user-check"
                    trend={5}
                    color="emerald"
                  />
                  <StatCard
                    label="Enrollments"
                    value={analytics.enrollments.total}
                    icon="fas fa-user-plus"
                    trend={18}
                    color="purple"
                  />
                </div>

                {/* Enrollment Activity Chart */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-chart-area text-emerald-400 text-sm"></i>
                    </div>
                    Enrollment Overview
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={[
                        { month: "Jan", enrollments: 45, active: 38 },
                        { month: "Feb", enrollments: 52, active: 45 },
                        { month: "Mar", enrollments: 48, active: 42 },
                        { month: "Apr", enrollments: 65, active: 58 },
                        { month: "May", enrollments: 72, active: 65 },
                        { month: "Jun", enrollments: 68, active: 62 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Legend wrapperStyle={{ color: "#94a3b8" }} />
                      <Area
                        type="monotone"
                        dataKey="enrollments"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="active"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "approvals" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">
                      Pending Approvals
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {pendingApprovals?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-clock text-blue-400 text-lg"></i>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-400 text-sm font-medium">
                      Approved Today
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">12</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-rose-500/20 to-rose-600/20 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-rose-400 text-sm font-medium">
                      Rejected Today
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">3</p>
                  </div>
                  <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-times-circle text-rose-400 text-lg"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm animate-fadeIn">
              <div className="p-6 border-b border-slate-800 bg-slate-950/40">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold font-poppins text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-user-check text-indigo-400 text-sm"></i>
                      </div>
                      Pending User Approvals
                    </h3>
                    <p className="text-slate-500 text-sm mt-2">
                      Review and approve user registration requests
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch(fetchPendingApprovals())}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-all duration-200 flex items-center gap-2"
                    disabled={approvalsLoading}
                  >
                    <i
                      className={`fas ${approvalsLoading ? "fa-spinner fa-spin" : "fa-refresh"}`}
                    ></i>
                    {approvalsLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {/* Other Error State */}
              {approvalsError && !approvalsError.includes("404") && (
                <div className="p-8">
                  <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                    </div>
                    <h4 className="text-red-400 font-bold mb-2">
                      Failed to load approvals
                    </h4>
                    <p className="text-slate-400 text-sm mb-4">
                      {approvalsError}
                    </p>
                    <button
                      onClick={() => dispatch(fetchPendingApprovals())}
                      disabled={approvalsLoading}
                      className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i
                        className={`fas ${approvalsLoading ? "fa-spinner fa-spin" : "fa-redo"}`}
                      ></i>
                      {approvalsLoading ? "Retrying..." : "Try Again"}
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {approvalsLoading && !approvalsError && (
                <div className="flex flex-col items-center justify-center p-16">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-500 rounded-full animate-spin animation-delay-150"></div>
                  </div>
                  <p className="mt-6 text-slate-400 text-lg font-medium">
                    Loading pending approvals...
                  </p>
                  <p className="mt-2 text-slate-500 text-sm">
                    Please wait while we fetch the latest requests
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!approvalsLoading &&
                !approvalsError &&
                pendingApprovals.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-16">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                      <i className="fas fa-check-circle text-emerald-400 text-3xl"></i>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      All Caught Up!
                    </h4>
                    <p className="text-slate-400 text-sm text-center max-w-md">
                      There are no pending user approvals at the moment. All
                      registration requests have been processed.
                    </p>
                  </div>
                )}

              {/* Approvals List */}
              {!approvalsLoading &&
                !approvalsError &&
                pendingApprovals.length > 0 && (
                  <div className="overflow-x-auto">
                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-slate-800/50">
                      {pendingApprovals.map((user) => (
                        <div
                          key={user.id}
                          className="p-4 sm:p-6 hover:bg-slate-800/30 transition"
                        >
                          <div className="flex items-start gap-3 sm:gap-4 mb-4">
                            <img
                              src={
                                user.profile_image ||
                                `https://i.pravatar.cc/150?u=${user.email}`
                              }
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-700 shadow-md shrink-0"
                              alt={user.username || user.email}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white text-sm sm:text-base mb-1">
                                {user.username ||
                                  user.first_name + " " + user.last_name ||
                                  "Unknown User"}
                              </p>
                              <p className="text-[9px] sm:text-xs text-slate-500 uppercase break-all">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-700/50 text-slate-300 px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-xs font-black uppercase border border-slate-600">
                                {user.role || "user"}
                              </span>
                            </div>

                            <div className="flex flex-col gap-2">
                              <span className="text-slate-400 text-xs">
                                {user.date_joined
                                  ? new Date(user.date_joined).toLocaleString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : "Unknown"}
                              </span>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(user.id)}
                                  disabled={
                                    isProcessing[user.id] === "approving"
                                  }
                                  className="bg-emerald-600/10 text-emerald-400 px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 flex-1 justify-center"
                                >
                                  {isProcessing[user.id] === "approving" ? (
                                    <React.Fragment key="approving">
                                      <i className="fas fa-spinner fa-spin"></i>
                                      <span className="hidden sm:inline">
                                        Approving...
                                      </span>
                                      <span className="sm:hidden">...</span>
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment key="approve">
                                      <i className="fas fa-check"></i>
                                      <span className="hidden sm:inline">
                                        Approve
                                      </span>
                                      <span className="sm:hidden">✓</span>
                                    </React.Fragment>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleReject(user.id)}
                                  disabled={
                                    isProcessing[user.id] === "rejecting"
                                  }
                                  className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 flex-1 justify-center"
                                >
                                  {isProcessing[user.id] === "rejecting" ? (
                                    <React.Fragment key="rejecting">
                                      <i className="fas fa-spinner fa-spin"></i>
                                      <span className="hidden sm:inline">
                                        Rejecting...
                                      </span>
                                      <span className="sm:hidden">...</span>
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment key="reject">
                                      <i className="fas fa-times"></i>
                                      <span className="hidden sm:inline">
                                        Reject
                                      </span>
                                      <span className="sm:hidden">✕</span>
                                    </React.Fragment>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <table className="hidden lg:table w-full text-left">
                      <thead className="bg-slate-950/60 border-b border-slate-800">
                        <tr key="approvals-header">
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">
                            User Information
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">
                            Role
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">
                            Registration Date
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {pendingApprovals.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-slate-800/30 transition group"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <img
                                  src={
                                    user.profile_image ||
                                    `https://i.pravatar.cc/150?u=${user.email}`
                                  }
                                  className="w-10 h-10 rounded-xl border border-slate-700 shadow-md"
                                  alt={user.username || user.email}
                                />
                                <div>
                                  <p className="font-bold text-white group-hover:text-indigo-400 transition">
                                    {user.username ||
                                      user.first_name + " " + user.last_name ||
                                      "Unknown User"}
                                  </p>
                                  <p className="text-[9px] text-slate-500 uppercase">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-slate-600">
                                {user.role || "user"}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-slate-400 text-sm">
                                {user.date_joined
                                  ? new Date(user.date_joined).toLocaleString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : "Unknown"}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => handleApprove(user.id)}
                                  disabled={
                                    isProcessing[user.id] === "approving"
                                  }
                                  className="bg-emerald-600/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {isProcessing[user.id] === "approving" ? (
                                    <React.Fragment key="approving">
                                      <i className="fas fa-spinner fa-spin"></i>
                                      Approving...
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment key="approve">
                                      <i className="fas fa-check"></i>
                                      Approve
                                    </React.Fragment>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleReject(user.id)}
                                  disabled={
                                    isProcessing[user.id] === "rejecting"
                                  }
                                  className="bg-red-600/10 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {isProcessing[user.id] === "rejecting" ? (
                                    <React.Fragment key="rejecting">
                                      <i className="fas fa-spinner fa-spin"></i>
                                      Rejecting...
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment key="reject">
                                      <i className="fas fa-times"></i>
                                      Reject
                                    </React.Fragment>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </>
        )}

        {activeTab === "courses" && (
          <>
            {/* Course Management Header */}
            <div className="mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-fadeIn">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold font-poppins text-white mb-2">
                      Course Management
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Create and manage courses, assign teachers, and track
                      course status
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                    <button
                      onClick={() => setShowCourseFilters(!showCourseFilters)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <i
                        className={`fas ${showCourseFilters ? "fa-times" : "fa-filter"} text-sm`}
                      ></i>
                      <span>
                        {showCourseFilters ? "Hide Filters" : "Filters"}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveModal("create-course")}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 min-w-35"
                    >
                      <i className="fas fa-plus text-sm"></i>
                      <span>Create Course</span>
                    </button>
                    <button
                      onClick={() => dispatch(fetchCourses())}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 min-w-25 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                      disabled={courses.loading}
                    >
                      <i
                        className={`fas ${courses.loading ? "fa-spinner fa-spin" : "fa-refresh"} text-sm`}
                      ></i>
                      <span>{courses.loading ? "Loading" : "Refresh"}</span>
                    </button>
                  </div>
                </div>

                {/* Course Filters */}
                {showCourseFilters && (
                  <div className="mt-6 p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-white">
                        Course Filters
                      </h4>
                      {hasActiveCourseFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetCourseFilters}
                          className="text-xs"
                        >
                          <i className="fas fa-times mr-1"></i>
                          Clear All
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Search Filter */}
                      <div>
                        <Input
                          type="text"
                          placeholder="Search courses..."
                          value={courseFilters.search}
                          onChange={(e) =>
                            handleCourseFilterChange("search", e.target.value)
                          }
                          variant="default"
                          size="sm"
                          className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                        />
                      </div>

                      {/* Category Filter */}
                      <div>
                        <select
                          value={courseFilters.category}
                          onChange={(e) =>
                            handleCourseFilterChange("category", e.target.value)
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none focus:border-indigo-500 transition"
                        >
                          <option value="">All Categories</option>
                          {courseFilterOptions.categories.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price Range Filter */}
                      <div>
                        <select
                          value={courseFilters.priceRange}
                          onChange={(e) =>
                            handleCourseFilterChange(
                              "priceRange",
                              e.target.value,
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none focus:border-indigo-500 transition"
                        >
                          <option value="">All Prices</option>
                          {courseFilterOptions.priceRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <select
                          value={courseFilters.status}
                          onChange={(e) =>
                            handleCourseFilterChange("status", e.target.value)
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none focus:border-indigo-500 transition"
                        >
                          <option value="">All Statuses</option>
                          {courseFilterOptions.statuses.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Instructor Filter */}
                      <div>
                        <select
                          value={courseFilters.instructor}
                          onChange={(e) =>
                            handleCourseFilterChange(
                              "instructor",
                              e.target.value,
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none focus:border-indigo-500 transition"
                        >
                          <option value="">All Teachers</option>
                          {courseFilterOptions.instructors.map((instructor) => (
                            <option key={instructor} value={instructor}>
                              {instructor}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {hasActiveCourseFilters && (
                      <div className="mt-4 text-sm text-slate-400">
                        Showing {filteredCourses.length} of{" "}
                        {courses.data.length} courses
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Course List Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
              <div className="px-8 py-6 border-b border-slate-800 bg-slate-950/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold font-poppins text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-graduation-cap text-indigo-400 text-sm"></i>
                      </div>
                      All Courses
                    </h4>
                    <p className="text-slate-500 text-sm mt-1">
                      {filteredCourses.length > 0
                        ? `${filteredCourses.length} of ${courses.data.length} course${filteredCourses.length !== 1 ? "s" : ""} found`
                        : "No courses available"}
                      {hasActiveCourseFilters && " (filtered)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Courses Error State */}
              {courses.error && (
                <div className="p-8">
                  <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
                    </div>
                    <h4 className="text-red-400 font-bold text-lg mb-2">
                      Unable to Load Courses
                    </h4>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      {courses.error}
                    </p>
                    <button
                      onClick={() => dispatch(fetchCourses())}
                      className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                    >
                      <i className="fas fa-redo mr-2"></i>
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Courses Loading State */}
              {courses.loading && !courses.error && (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-spinner text-blue-500 text-3xl animate-spin"></i>
                  </div>
                  <h4 className="text-white text-xl font-bold mb-2">
                    Loading Courses
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Please wait while we fetch your courses...
                  </p>
                </div>
              )}

              {/* Courses Empty State */}
              {!courses.loading &&
                !courses.error &&
                courses.data.length === 0 && (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="fas fa-book-open text-slate-400 text-3xl"></i>
                    </div>
                    <h4 className="text-white text-xl font-bold mb-2">
                      No Courses Yet
                    </h4>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-md mx-auto">
                      Start by creating your first course. You can add content,
                      set pricing, and assign teachers.
                    </p>
                    <button
                      onClick={() => setActiveModal("create-course")}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg active:scale-95"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Create Your First Course
                    </button>
                  </div>
                )}

              {/* No Filter Results */}
              {!courses.loading &&
                !courses.error &&
                courses.data.length > 0 &&
                filteredCourses.length === 0 &&
                hasActiveCourseFilters && (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="fas fa-search text-slate-400 text-3xl"></i>
                    </div>
                    <h4 className="text-white text-xl font-bold mb-2">
                      No Courses Found
                    </h4>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-md mx-auto">
                      No courses match your current filter criteria.
                    </p>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={resetCourseFilters}
                    >
                      <i className="fas fa-redo mr-2"></i>
                      Clear Filters
                    </Button>
                  </div>
                )}

              {/* Courses List */}
              {!courses.loading &&
                !courses.error &&
                courses.data.length > 0 && (
                  <div className="overflow-x-auto">
                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-slate-800/30">
                      {filteredCourses.map((course, index) => (
                        <div
                          key={course.id || `course-${index}`}
                          className="p-4 sm:p-6 hover:bg-slate-800/20 transition-all duration-200"
                        >
                          {/* Course Header */}
                          <div className="flex items-start gap-3 sm:gap-4 mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-indigo-600/20 to-purple-600/20 rounded-xl flex items-center justify-center shrink-0">
                              <i className="fas fa-book text-indigo-400 text-sm sm:text-base"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h5 className="font-bold text-white text-sm sm:text-base truncate flex-1">
                                  {course.title}
                                </h5>
                                {(course.updated_at || course.modified_at) &&
                                  (() => {
                                    const updatedTime = new Date(
                                      course.updated_at || course.modified_at,
                                    );
                                    const now = new Date();
                                    const diffInMinutes =
                                      (now - updatedTime) / (1000 * 60);

                                    if (diffInMinutes <= 5) {
                                      return (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] font-bold uppercase bg-blue-600/20 text-blue-400 border border-blue-600/30 animate-pulse shrink-0">
                                          <i className="fas fa-clock mr-1 text-xs"></i>
                                          {diffInMinutes <= 1
                                            ? "Just Now"
                                            : "Recently"}
                                        </span>
                                      );
                                    }

                                    if (diffInMinutes <= 1440) {
                                      return (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] font-bold uppercase bg-slate-700/40 text-slate-400 border border-slate-600/50 shrink-0">
                                          <i className="fas fa-clock mr-1 text-xs"></i>
                                          Updated
                                        </span>
                                      );
                                    }

                                    return null;
                                  })()}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <span className="font-mono">
                                  ID: {course.id}
                                </span>
                              </div>
                              {course.description && (
                                <p className="text-xs text-slate-400 line-clamp-2">
                                  {course.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Course Details Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {/* Category */}
                            <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                              <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase font-medium mb-1">
                                Category
                              </p>
                              <div className="flex items-center gap-1.5">
                                <i className="fas fa-tag text-slate-400 text-xs"></i>
                                <span className="text-xs sm:text-sm text-slate-300 truncate">
                                  {course.category}
                                </span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                              <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase font-medium mb-1">
                                Price
                              </p>
                              <p className="text-xs sm:text-sm text-white font-bold">
                                PKR {parseFloat(course.price).toFixed(2)}
                              </p>
                            </div>

                            {/* Status */}
                            <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                              <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase font-medium mb-1">
                                Status
                              </p>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium border ${
                                  course.status === "published"
                                    ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30"
                                    : course.status === "draft"
                                      ? "bg-amber-600/20 text-amber-400 border-amber-600/30"
                                      : "bg-slate-600/20 text-slate-400 border-slate-600/30"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                    course.status === "published"
                                      ? "bg-emerald-400"
                                      : course.status === "draft"
                                        ? "bg-amber-400"
                                        : "bg-slate-400"
                                  }`}
                                ></span>
                                {course.status}
                              </span>
                            </div>

                            {/* Instructor */}
                            <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                              <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase font-medium mb-1">
                                Instructor
                              </p>
                              {course.instructor ? (
                                <div className="flex items-center gap-1.5">
                                  <img
                                    src={
                                      course.instructor.avatar ||
                                      `https://i.pravatar.cc/150?u=${course.instructor.username}`
                                    }
                                    className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-slate-600 object-cover"
                                    alt={course.instructor.username}
                                  />
                                  <span className="text-xs sm:text-sm text-slate-300 truncate">
                                    {course.instructor.username}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500 italic">
                                  Not assigned
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() =>
                                  fetchCourseDetailsForEdit(course.id)
                                }
                                disabled={loadingCourseIds.has(course.id)}
                                className="bg-blue-600/10 text-blue-400 px-2 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                              >
                                <i
                                  className={`fas ${loadingCourseIds.has(course.id) ? "fa-spinner fa-spin" : "fa-edit"} text-xs`}
                                ></i>
                                <span className="hidden xs:inline">Edit</span>
                              </button>

                              <button
                                onClick={() =>
                                  setActiveModal({
                                    type: "assign-instructor",
                                    courseId: course.id,
                                  })
                                }
                                className={`px-2 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1 ${
                                  course.instructor
                                    ? "bg-slate-700/50 text-slate-400 hover:bg-indigo-600/50 hover:text-indigo-300 border border-slate-600/50 hover:border-indigo-600/50"
                                    : "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-600/30 hover:border-indigo-600"
                                }`}
                              >
                                <i
                                  className={`fas ${course.instructor ? "fa-user-edit" : "fa-user-plus"} text-xs`}
                                ></i>
                                <span className="hidden xs:inline">
                                  {course.instructor ? "Change" : "Assign"}
                                </span>
                              </button>

                              <button
                                onClick={() => {
                                  console.log(
                                    "Delete button clicked, course data:",
                                    course,
                                  );
                                  handleDeleteCourse(course.id, course.title);
                                }}
                                className="bg-red-600/10 text-red-400 px-2 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-1"
                              >
                                <i className="fas fa-trash text-xs"></i>
                                <span className="hidden xs:inline">Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <table className="hidden lg:table w-full text-left">
                      <thead className="bg-slate-950/60 border-b border-slate-800">
                        <tr key="courses-header">
                          <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">
                            Course
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                            Category
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                            Price
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                            Status
                          </th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">
                            Instructor
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/30">
                        {filteredCourses.map((course, index) => (
                          <tr
                            key={course.id || `course-${index}`}
                            className="hover:bg-slate-800/20 transition-all duration-200 group"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-linear-to-br from-indigo-600/20 to-purple-600/20 rounded-xl flex items-center justify-center shrink-0 group-hover:from-indigo-600/30 group-hover:to-purple-600/30 transition-all duration-200">
                                  <i className="fas fa-book text-indigo-400 text-sm group-hover:text-indigo-300 transition-colors"></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors truncate">
                                      {course.title}
                                    </h5>
                                    {(course.updated_at ||
                                      course.modified_at) &&
                                      (() => {
                                        const updatedTime = new Date(
                                          course.updated_at ||
                                            course.modified_at,
                                        );
                                        const now = new Date();
                                        const diffInMinutes =
                                          (now - updatedTime) / (1000 * 60);

                                        // Show "Just Updated" badge for first 5 minutes (with animation)
                                        if (diffInMinutes <= 5) {
                                          return (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-blue-600/20 text-blue-400 border border-blue-600/30 animate-pulse">
                                              <i className="fas fa-clock mr-1"></i>
                                              {diffInMinutes <= 1
                                                ? "Just Updated"
                                                : "Recently Updated"}
                                            </span>
                                          );
                                        }

                                        // Show subtle "Recently Updated" badge after 5 minutes (no animation)
                                        if (diffInMinutes <= 1440) {
                                          // Up to 24 hours
                                          return (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-slate-700/40 text-slate-400 border border-slate-600/50">
                                              <i className="fas fa-clock mr-1"></i>
                                              Updated
                                            </span>
                                          );
                                        }

                                        return null;
                                      })()}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="font-mono">
                                      ID: {course.id}
                                    </span>
                                    {course.description && (
                                      <span className="truncate max-w-xs">
                                        {course.description.substring(0, 60)}...
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-slate-700/40 text-slate-300 border border-slate-600/50">
                                <i className="fas fa-tag mr-1.5 text-slate-400"></i>
                                {course.category}
                              </span>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold text-lg">
                                  PKR {parseFloat(course.price).toFixed(2)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
                                  course.status === "published"
                                    ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30"
                                    : course.status === "draft"
                                      ? "bg-amber-600/20 text-amber-400 border-amber-600/30"
                                      : "bg-slate-600/20 text-slate-400 border-slate-600/30"
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    course.status === "published"
                                      ? "bg-emerald-400"
                                      : course.status === "draft"
                                        ? "bg-amber-400"
                                        : "bg-slate-400"
                                  }`}
                                ></span>
                                {course.status}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              {course.instructor ? (
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                  <img
                                    src={
                                      course.instructor.avatar ||
                                      `https://i.pravatar.cc/150?u=${course.instructor.username}`
                                    }
                                    className="w-10 h-10 rounded-lg border border-slate-600 object-cover"
                                    alt={course.instructor.username}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">
                                      {course.instructor.username}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {course.instructor.expertise ||
                                        "Instructor"}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  <span className="text-xs text-slate-500 italic">
                                    No instructor assigned
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-6 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() =>
                                    fetchCourseDetailsForEdit(course.id)
                                  }
                                  disabled={loadingCourseIds.has(course.id)}
                                  className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <i
                                    className={`fas ${loadingCourseIds.has(course.id) ? "fa-spinner fa-spin" : "fa-edit"} mr-2`}
                                  ></i>
                                  {loadingCourseIds.has(course.id)
                                    ? "Loading..."
                                    : "Edit"}
                                </button>
                                <button
                                  onClick={() =>
                                    setActiveModal({
                                      type: "assign-instructor",
                                      courseId: course.id,
                                    })
                                  }
                                  className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                                    course.instructor
                                      ? "bg-slate-700/50 text-slate-400 hover:bg-indigo-600/50 hover:text-indigo-300 border border-slate-600/50 hover:border-indigo-600/50"
                                      : "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-600/30 hover:border-indigo-600"
                                  }`}
                                >
                                  <i
                                    className={`fas ${course.instructor ? "fa-user-edit" : "fa-user-plus"} mr-2`}
                                  ></i>
                                  {course.instructor ? "Change" : "Assign"}
                                </button>
                                <button
                                  onClick={() => {
                                    console.log(
                                      "Delete button clicked, course data:",
                                      course,
                                    );
                                    handleDeleteCourse(course.id, course.title);
                                  }}
                                  className="bg-red-600/10 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition flex items-center gap-2"
                                >
                                  <i className="fas fa-trash mr-2"></i>
                                  Delete Course
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </>
        )}

        {activeTab === "users" && (
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold font-poppins text-white">
                  User Management
                </h3>
                <p className="text-slate-500 text-sm">
                  Manage all platform users
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                >
                  <option value="">All Roles</option>
                  <option value="teacher">Teachers</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                  <option value="admin">Admins</option>
                </select>

                <button
                  onClick={handleFetchUsers}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2"
                >
                  <i className="fas fa-refresh"></i>
                  Refresh
                </button>

                <button
                  onClick={() => setActiveModal("create-user")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Add User
                </button>
              </div>
            </div>

            {/* Content */}
            {users.loading ? (
              <div className="p-16 text-center">
                <i className="fas fa-spinner animate-spin text-2xl text-slate-400"></i>
                <p className="text-slate-400 mt-3">Loading users...</p>
              </div>
            ) : users.data?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/60 border-b border-slate-800">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">
                        User
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                        Role
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                        Status
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">
                        Joined
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/50">
                    {users.data.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-800/30 transition group"
                      >
                        {/* User */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                user.profile_image ||
                                `https://i.pravatar.cc/150?u=${user.email}`
                              }
                              className="w-10 h-10 rounded-xl border border-slate-700"
                              alt={user.username}
                            />
                            <div>
                              <p className="font-bold text-white group-hover:text-indigo-400 transition">
                                {user.username || "No Username"}
                              </p>
                              <p className="text-[10px] text-slate-500 uppercase">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-5">
                          <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-slate-600">
                            {user.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              user.is_active
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-8 py-5 text-sm text-slate-400">
                          {user.date_joined
                            ? new Date(user.date_joined).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400">
                No users found
              </div>
            )}
          </div>
        )}
        {/* Modals Overlay */}
        {activeModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-fadeIn">
              {/* Create Course Modal */}
              {activeModal === "create-course" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                      <i className="fas fa-plus text-indigo-400"></i>
                    </div>
                    <h3 className="text-2xl font-black font-poppins text-white">
                      Create New Course
                    </h3>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const courseData = {
                        title: createCourseForm.title,
                        description: createCourseForm.description,
                        category: createCourseForm.category,
                        price: parseInt(createCourseForm.price, 10) || 0,
                        status: createCourseForm.status,
                        instructor_id: createCourseForm.instructor_id || null,
                      };
                      handleCreateCourse(courseData);
                    }}
                    className="space-y-5"
                  >
                    {/* Course Title */}
                    <div>
                      <label
                        htmlFor="title"
                        className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                      >
                        <i className="fas fa-heading text-slate-600 text-xs"></i>
                        Course Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={createCourseForm.title}
                        onChange={(e) => {
                          setCreateCourseForm({
                            ...createCourseForm,
                            title: e.target.value,
                          });
                          // Clear error for this field when user starts typing
                          clearCreateCourseFieldError("title");
                        }}
                        className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:ring-2 transition-all duration-200 ${
                          createCourseErrors.title
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                        }`}
                        placeholder="Enter course title"
                      />
                      {createCourseErrors.title && (
                        <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                          <i className="fas fa-exclamation-circle text-xs"></i>
                          {createCourseErrors.title}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="description"
                        className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                      >
                        <i className="fas fa-align-left text-slate-600 text-xs"></i>
                        Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        value={createCourseForm.description}
                        onChange={(e) => {
                          setCreateCourseForm({
                            ...createCourseForm,
                            description: e.target.value,
                          });
                          // Clear error for this field when user starts typing
                          clearCreateCourseFieldError("description");
                        }}
                        className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:ring-2 transition-all duration-200 resize-none ${
                          createCourseErrors.description
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                        }`}
                        placeholder="Describe what students will learn in this course..."
                      />
                      {createCourseErrors.description && (
                        <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                          <i className="fas fa-exclamation-circle text-xs"></i>
                          {createCourseErrors.description}
                        </p>
                      )}
                    </div>

                    {/* Category and Price Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="category"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-tag text-slate-600 text-xs"></i>
                          Category <span className="text-red-400">*</span>
                        </label>
                        <select
                          id="category"
                          name="category"
                          required
                          value={createCourseForm.category}
                          onChange={(e) => {
                            setCreateCourseForm({
                              ...createCourseForm,
                              category: e.target.value,
                            });
                            // Clear error for this field when user makes selection
                            clearCreateCourseFieldError("category");
                          }}
                          className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer ${
                            createCourseErrors.category
                              ? "border-red-500 focus:ring-red-500/20"
                              : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                          }`}
                        >
                          <option value="">Select category</option>
                          {courseFilterOptions.categories.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </option>
                          ))}
                        </select>
                        {createCourseErrors.category && (
                          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                            <i className="fas fa-exclamation-circle text-xs"></i>
                            {createCourseErrors.category}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="price"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-rupee-sign text-slate-600 text-xs"></i>
                          Price <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                            PKR
                          </span>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            step="1"
                            inputMode="numeric"
                            max="999999"
                            value={createCourseForm.price}
                            onChange={(e) => {
                              const value = e.target.value;

                              // Remove decimals
                              if (value.includes(".")) return;

                              // Limit to 6 digits
                              if (value.length > 6) return;

                              setCreateCourseForm({
                                ...createCourseForm,
                                price: value,
                              });
                              // Clear error for this field when user starts typing
                              clearCreateCourseFieldError("price");
                            }}
                            className={`w-full bg-slate-950 border rounded-2xl pl-14 pr-5 py-4 text-white placeholder-slate-600 outline-none focus:ring-2 transition-all duration-200 ${
                              createCourseErrors.price
                                ? "border-red-500 focus:ring-red-500/20"
                                : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                            }`}
                            placeholder="0"
                          />
                        </div>
                        {createCourseErrors.price && (
                          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                            <i className="fas fa-exclamation-circle text-xs"></i>
                            {createCourseErrors.price}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status and Instructor Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="status"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-toggle-on text-slate-600 text-xs"></i>
                          Status <span className="text-red-400">*</span>
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={createCourseForm.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            setCreateCourseForm({
                              ...createCourseForm,
                              status: newStatus,
                            });
                            // Clear instructor error if switching away from published
                            if (
                              newStatus !== "published" &&
                              createCourseErrors.instructor_id
                            ) {
                              clearCreateCourseFieldError("instructor_id");
                            }
                            // Clear status error when user makes selection
                            clearCreateCourseFieldError("status");
                          }}
                          className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer ${
                            createCourseErrors.status
                              ? "border-red-500 focus:ring-red-500/20"
                              : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                          }`}
                        >
                          <option value="published">📚 Published</option>
                          <option value="draft">📝 Draft</option>
                          <option value="archived">📦 Archived</option>
                        </select>
                        {createCourseErrors.status && (
                          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                            <i className="fas fa-exclamation-circle text-xs"></i>
                            {createCourseErrors.status}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="instructor_id"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-user-tie text-slate-600 text-xs"></i>
                          Instructor
                          {createCourseForm.status === "published" && (
                            <span className="text-red-400">*</span>
                          )}
                        </label>
                        <select
                          id="instructor_id"
                          name="instructor_id"
                          value={createCourseForm.instructor_id}
                          onChange={(e) => {
                            setCreateCourseForm({
                              ...createCourseForm,
                              instructor_id: e.target.value,
                            });
                            // Clear error for this field when user makes selection
                            clearCreateCourseFieldError("instructor_id");
                          }}
                          className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer ${
                            createCourseErrors.instructor_id
                              ? "border-red-500 focus:ring-red-500/20"
                              : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                          }`}
                        >
                          <option value="">No instructor assigned</option>
                          {users.data
                            .filter((user) => user.role === "teacher")
                            .map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                👩‍🏫{" "}
                                {teacher.username ||
                                  teacher.first_name + " " + teacher.last_name}
                              </option>
                            ))}
                        </select>
                        {createCourseErrors.instructor_id && (
                          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                            <i className="fas fa-exclamation-circle text-xs"></i>
                            {createCourseErrors.instructor_id}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModal(null);
                          setCreateCourseForm({
                            title: "",
                            description: "",
                            category: "",
                            price: "",
                            status: "draft",
                            instructor_id: "",
                          });
                          setCreateCourseErrors({});
                        }}
                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all duration-200 active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg transition-all duration-200 active:scale-95"
                      >
                        <i className="fas fa-plus"></i>
                        Create Course
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Edit Course Modal */}
              {activeModal &&
                typeof activeModal === "object" &&
                activeModal.type === "edit-course" && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                        <i className="fas fa-edit text-blue-400"></i>
                      </div>
                      <h3 className="text-2xl font-black font-poppins text-white">
                        Edit Course
                      </h3>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const courseData = {
                          title: editCourseForm.title,
                          description: editCourseForm.description,
                          category: editCourseForm.category,
                          price: parseInt(editCourseForm.price, 10) || 0,
                          status: editCourseForm.status,
                          instructor_id: editCourseForm.instructor_id || null,
                        };
                        // Safety check: ensure courseId exists
                        const courseId = activeModal?.courseId;
                        if (!courseId) {
                          console.error(
                            "Edit course error: courseId is undefined",
                            { activeModal },
                          );
                          toastManager.error("Error: Course ID is missing");
                          return;
                        }
                        handleUpdateCourse(courseId, courseData);
                      }}
                      className="space-y-5"
                    >
                      {/* Course Title */}
                      <div>
                        <label
                          htmlFor="title"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-heading text-slate-600 text-xs"></i>
                          Course Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          required
                          value={
                            editCourseForm.title || editingCourse?.title || ""
                          }
                          onChange={(e) => {
                            setEditCourseForm({
                              ...editCourseForm,
                              title: e.target.value,
                            });
                            clearEditCourseFieldError("title");
                          }}
                          className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:ring-2 transition-all duration-200 ${
                            editCourseErrors.title
                              ? "border-red-500 focus:ring-red-500/20"
                              : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter course title"
                        />
                        {editCourseErrors.title && (
                          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                            <i className="fas fa-exclamation-circle text-xs"></i>
                            {editCourseErrors.title}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label
                          htmlFor="description"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-align-left text-slate-600 text-xs"></i>
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          required
                          rows="3"
                          value={
                            editCourseForm.description ||
                            editingCourse?.description ||
                            ""
                          }
                          onChange={(e) => {
                            setEditCourseForm({
                              ...editCourseForm,
                              description: e.target.value,
                            });
                            clearEditCourseFieldError("description");
                          }}
                          className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:ring-2 transition-all duration-200 resize-none ${
                            editCourseErrors.description
                              ? "border-red-500 focus:ring-red-500/20"
                              : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Describe what students will learn in this course..."
                        />
                        {editCourseErrors.description && (
                          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                            <i className="fas fa-exclamation-circle text-xs"></i>
                            {editCourseErrors.description}
                          </p>
                        )}
                      </div>

                      {/* Category and Price Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="category"
                            className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                          >
                            <i className="fas fa-tag text-slate-600 text-xs"></i>
                            Category
                          </label>
                          <select
                            id="category"
                            name="category"
                            required
                            value={
                              editCourseForm.category ||
                              editingCourse?.category ||
                              ""
                            }
                            onChange={(e) => {
                              setEditCourseForm({
                                ...editCourseForm,
                                category: e.target.value,
                              });
                              clearEditCourseFieldError("category");
                            }}
                            className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer ${
                              editCourseErrors.category
                                ? "border-red-500 focus:ring-red-500/20"
                                : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                            }`}
                          >
                            <option value="">Select category</option>
                            {courseFilterOptions.categories.map((category) => (
                              <option key={category} value={category}>
                                {formatCategoryLabel(category)}
                              </option>
                            ))}
                          </select>
                          {editCourseErrors.category && (
                            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                              <i className="fas fa-exclamation-circle text-xs"></i>
                              {editCourseErrors.category}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="price"
                            className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                          >
                            <i className="fas fa-dollar-sign text-slate-600 text-xs"></i>
                            Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                              $
                            </span>
                            <input
                              type="number"
                              id="price"
                              name="price"
                              step="1"
                              inputMode="numeric"
                              max="999999"
                              value={
                                editCourseForm.price ||
                                editingCourse?.price ||
                                ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;

                                // Remove decimals
                                if (value.includes(".")) return;

                                // Limit to 6 digits
                                if (value.length > 6) return;

                                setEditCourseForm({
                                  ...editCourseForm,
                                  price: value,
                                });
                                clearEditCourseFieldError("price");
                              }}
                              className={`w-full bg-slate-950 border rounded-2xl pl-10 pr-5 py-4 text-white placeholder-slate-600 outline-none focus:ring-2 transition-all duration-200 ${
                                editCourseErrors.price
                                  ? "border-red-500 focus:ring-red-500/20"
                                  : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                              }`}
                              placeholder="0"
                            />
                          </div>
                          {editCourseErrors.price && (
                            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                              <i className="fas fa-exclamation-circle text-xs"></i>
                              {editCourseErrors.price}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status and Instructor Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="status"
                            className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                          >
                            <i className="fas fa-toggle-on text-slate-600 text-xs"></i>
                            Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            required
                            value={
                              editCourseForm.status ||
                              editingCourse?.status ||
                              "draft"
                            }
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setEditCourseForm({
                                ...editCourseForm,
                                status: newStatus,
                              });
                              // Clear instructor error if switching away from published
                              if (
                                newStatus !== "published" &&
                                editCourseErrors.instructor_id
                              ) {
                                clearEditCourseFieldError("instructor_id");
                              }
                              // Clear status error when user makes selection
                              clearEditCourseFieldError("status");
                            }}
                            className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer ${
                              editCourseErrors.status
                                ? "border-red-500 focus:ring-red-500/20"
                                : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                            }`}
                          >
                            <option value="published">📚 Published</option>
                            <option value="draft">📝 Draft</option>
                            <option value="archived">📦 Archived</option>
                          </select>
                          {editCourseErrors.status && (
                            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                              <i className="fas fa-exclamation-circle text-xs"></i>
                              {Array.isArray(editCourseErrors.status)
                                ? editCourseErrors.status[0]
                                : editCourseErrors.status}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="instructor_id"
                            className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                          >
                            <i className="fas fa-user-tie text-slate-600 text-xs"></i>
                            Instructor
                            {(editCourseForm.status === "published" ||
                              editingCourse?.status === "published") && (
                              <span className="text-red-400">*</span>
                            )}
                          </label>
                          <select
                            id="instructor_id"
                            name="instructor_id"
                            value={
                              editCourseForm.instructor_id !== undefined
                                ? editCourseForm.instructor_id
                                : editingCourse?.instructor?.id ||
                                  editingCourse?.instructor_id ||
                                  ""
                            }
                            onChange={(e) => {
                              setEditCourseForm({
                                ...editCourseForm,
                                instructor_id: e.target.value,
                              });
                              // Clear error for this field when user makes selection
                              clearEditCourseFieldError("instructor_id");
                            }}
                            className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer ${
                              editCourseErrors.instructor_id
                                ? "border-red-500 focus:ring-red-500/20"
                                : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                            }`}
                          >
                            <option value="">No instructor assigned</option>
                            {users.data
                              .filter((user) => user.role === "teacher")
                              .map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                  👩‍🏫{" "}
                                  {teacher.username ||
                                    teacher.first_name +
                                      " " +
                                      teacher.last_name}
                                </option>
                              ))}
                          </select>
                          {editCourseErrors.instructor_id && (
                            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                              <i className="fas fa-exclamation-circle text-xs"></i>
                              {Array.isArray(editCourseErrors.instructor_id)
                                ? editCourseErrors.instructor_id[0]
                                : editCourseErrors.instructor_id}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-4 pt-6 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setActiveModal(null)}
                          className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all duration-200 active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={updatingCourseId === activeModal.courseId}
                          className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                          <i
                            className={`fas ${updatingCourseId === activeModal.courseId ? "fa-spinner fa-spin" : "fa-save"}`}
                          ></i>
                          {updatingCourseId === activeModal.courseId
                            ? "Updating..."
                            : "Update Course"}
                        </button>
                      </div>
                    </form>
                  </>
                )}

              {/* Assign Instructor Modal */}
              {activeModal &&
                typeof activeModal === "object" &&
                activeModal.type === "assign-instructor" && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                        <i className="fas fa-user-tie text-indigo-400"></i>
                      </div>
                      <h3 className="text-2xl font-black font-poppins text-white">
                        Assign Instructor
                      </h3>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const instructorId = formData.get("instructor_id");
                        handleAssignInstructor(
                          activeModal.courseId,
                          instructorId,
                        );
                      }}
                      className="space-y-5"
                    >
                      <div>
                        <label
                          htmlFor="instructor_id"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-user-tie text-slate-600 text-xs"></i>
                          Select Instructor
                        </label>
                        <select
                          id="instructor_id"
                          name="instructor_id"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="">Choose an instructor...</option>
                          {users.data
                            .filter((user) => user.role === "teacher")
                            .map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                👩‍🏫{" "}
                                {teacher.username ||
                                  teacher.first_name + " " + teacher.last_name}
                                {teacher.email && ` (${teacher.email})`}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="flex gap-4 pt-6 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setActiveModal(null)}
                          className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all duration-200 active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-user-plus"></i>
                          Assign Instructor
                        </button>
                      </div>
                    </form>
                  </>
                )}

              {/* Create User Modal */}
              {activeModal === "create-user" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                      <i className="fas fa-user-plus text-indigo-400"></i>
                    </div>
                    <h3 className="text-2xl font-black font-poppins text-white">
                      Create User
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-500 mb-2 block">
                        Email
                      </label>
                      <input
                        type="email"
                        value={createUserForm.email}
                        onChange={(e) =>
                          setCreateUserForm({
                            ...createUserForm,
                            email: e.target.value,
                          })
                        }
                        className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white outline-none ${
                          createUserErrors.email
                            ? "border-red-500"
                            : "border-slate-800"
                        }`}
                        placeholder="user@example.com"
                      />
                      {createUserErrors.email && (
                        <p className="mt-2 text-xs text-red-400">
                          {createUserErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-500 mb-2 block">
                        Username
                      </label>
                      <input
                        type="text"
                        value={createUserForm.username}
                        onChange={(e) =>
                          setCreateUserForm({
                            ...createUserForm,
                            username: e.target.value,
                          })
                        }
                        className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-white outline-none ${
                          createUserErrors.username
                            ? "border-red-500"
                            : "border-slate-800"
                        }`}
                        placeholder="Enter username"
                      />
                      {createUserErrors.username && (
                        <p className="mt-2 text-xs text-red-400">
                          {createUserErrors.username}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-500 mb-2 block">
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="parent">Parent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {createUserForm.role === "parent" && (
                      <div>
                        <label className="text-[11px] font-black uppercase text-slate-500 mb-2 block">
                          Student Emails (optional)
                        </label>
                        <textarea
                          rows="3"
                          value={createUserForm.student_emails}
                          onChange={(e) =>
                            setCreateUserForm({
                              ...createUserForm,
                              student_emails: e.target.value,
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none"
                          placeholder="student1@example.com, student2@example.com"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-black uppercase text-slate-500 mb-2 block">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCreateUserPassword ? "text" : "password"}
                            value={createUserForm.password}
                            onChange={(e) =>
                              setCreateUserForm({
                                ...createUserForm,
                                password: e.target.value,
                              })
                            }
                            className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 pr-12 text-white outline-none ${
                              createUserErrors.password
                                ? "border-red-500"
                                : "border-slate-800"
                            }`}
                            placeholder="StrongPass123!"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCreateUserPassword(!showCreateUserPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            tabIndex="-1"
                          >
                            <i
                              className={`fas ${showCreateUserPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}
                            ></i>
                          </button>
                        </div>
                        {createUserErrors.password && (
                          <p className="mt-2 text-xs text-red-400">
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
                        <label className="text-[11px] font-black uppercase text-slate-500 mb-2 block">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={
                              showCreateUserConfirmPassword
                                ? "text"
                                : "password"
                            }
                            value={createUserForm.confirm_password}
                            onChange={(e) =>
                              setCreateUserForm({
                                ...createUserForm,
                                confirm_password: e.target.value,
                              })
                            }
                            className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 pr-12 text-white outline-none ${
                              createUserErrors.confirm_password
                                ? "border-red-500"
                                : "border-slate-800"
                            }`}
                            placeholder="Repeat password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCreateUserConfirmPassword(
                                !showCreateUserConfirmPassword,
                              )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            tabIndex="-1"
                          >
                            <i
                              className={`fas ${showCreateUserConfirmPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}
                            ></i>
                          </button>
                        </div>
                        {createUserErrors.confirm_password && (
                          <p className="mt-2 text-xs text-red-400">
                            {createUserErrors.confirm_password}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl text-sm font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateUser}
                        disabled={isCreatingUser}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-50"
                      >
                        {isCreatingUser ? "Creating..." : "Create User"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

export default AdminDashboard;
