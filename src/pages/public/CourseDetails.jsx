import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseById } from "../../store/slices/coursesSlice";
import {
  enrollInCourseNormal,
  enrollInCoursePrivate,
  unenrollFromCourse,
  fetchStudentDashboard,
} from "../../store/slices/studentDashboardSlice";
import {
  Button,
  Card,
  LoadingSpinner,
  ErrorMessage,
} from "../../components/ui";
import BreadcrumbNavigation from "../../components/ui/BreadcrumbNavigation";
import BackButton from "../../components/ui/BackButton";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { useSubmissionGuard } from "../../utils/requestDeduplicator";
import {
  useDateFormat,
  useNumberFormat,
  useTextFormat,
} from "../../hooks/useFormat";
import { getCourseImage } from "../../utils/courseImageUtils";
import { setAuthModal, setEnrollmentIntent } from "../../store/slices/uiSlice";
import EnrollmentTypeModal from "../../components/courses/EnrollmentTypeModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { getStorageUrl } from "../../utils/storageUrl";
import FileViewerModal from "../../components/common/FileViewerModal";
import { studentService } from "../../services/studentService";

const CourseDetails = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const [imageError, setImageError] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [viewerUrl, setViewerUrl] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const submissionGuard = useSubmissionGuard();
  // Get auth state from Redux store
  const auth = useSelector((state) => state.auth);

  // Get course data from Redux store
  const {
    currentCourse: course,
    isLoading,
    error,
  } = useSelector((state) => state.courses);

  // Get student dashboard state for enrollment tracking
  const { enrollingCourseIds, unenrollingCourseIds, enrolledCourses } =
    useSelector((state) => state.studentDashboard);

  const { enrollmentIntent } = useSelector((state) => state.ui);

  // Formatting hooks
  const { formatDate } = useDateFormat();
  const { formatCurrency } = useNumberFormat();
  const { capitalize, truncate } = useTextFormat();

  // Fetch course details on component mount
  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
    }

    // Fetch student dashboard if user is logged in as student
    if (auth.isLoggedIn && auth.role === "student") {
      dispatch(fetchStudentDashboard());
    }
  }, [dispatch, courseId, auth.isLoggedIn, auth.role]);

  // Reset image error when course changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageError(false);
  }, [courseId]);



  // Normalize course data for safe rendering
  const normalizedCourse = React.useMemo(() => {
    if (!course) return null;

    return {
      id: course.id || courseId,
      title: course.title || "Untitled Course",
      description: course.description || "No description available.",
      thumbnail: course.thumbnail,
      category: (typeof course.category === "object" && course.category !== null ? course.category.name : course.category) || "general",
      price: course.price || "0.00",
      status: course.status || "draft",
      instructor_id: course.instructor_id,
      instructor: course.instructor || null,
      schedule: course.schedule,
      created_at: course.created_at,
      updated_at: course.updated_at,
      outline: course.outline || null,
      attachment: course.attachment || null,
      has_session: course.has_session ?? true,
      enrollment_status: course.enrollment_status,
      gumroad_product_permalink: course.gumroad_product_permalink || null,
    };
  }, [course, courseId]);

  // Check if course is enrolled
  const isCourseEnrolled = (courseData) => {
    if (!courseData || !auth.isLoggedIn || auth.role !== "student") {
      return false;
    }

    // Check if enrolledCourses contains this course
    if (enrolledCourses && Array.isArray(enrolledCourses)) {
      return enrolledCourses.some((enrolled) => enrolled.id === courseData.id);
    }

    return false;
  };

  // Poll backend after Gumroad checkout opens — webhook may take a few seconds.
  // Only fetches student dashboard (not fetchCourseById) to avoid triggering
  // the page-level isLoading state which causes the whole page to re-render.
  const startEnrollmentPolling = (courseId) => {
    toastManager.success("Checkout opened! Complete your payment — this page will update automatically.");
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      dispatch(fetchStudentDashboard());
      if (attempts >= 10) clearInterval(poll); // poll for ~30 seconds
    }, 3000);
  };

  // Handle course enrollment
  const handleEnrollCourse = async () => {
    if (!auth.isLoggedIn) {
      dispatch(setAuthModal("login"));
      return;
    }

    if (auth.role !== "student") {
      toastManager.error("Only students can enroll in courses");
      return;
    }

    // Paid course — open Gumroad checkout in a centered popup
    if (normalizedCourse?.gumroad_product_permalink) {
      // Open popup synchronously BEFORE the await — browsers block popups
      // opened after async calls since they're no longer inside a user gesture
      const w = 700, h = 620;
      const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
      const top  = Math.round(window.screenY + (window.outerHeight - h) / 2);
      const popup = window.open("about:blank", "gumroad_checkout", `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`);
      try {
        setIsCheckingOut(true);
        const data = await studentService.initiateCheckout(normalizedCourse.id);
        if (popup) popup.location.href = data.checkout_url;
        startEnrollmentPolling(normalizedCourse.id);
      } catch (error) {
        if (popup) popup.close();
        showApiError(error);
      } finally {
        setIsCheckingOut(false);
      }
      return;
    }

    // Free course — show enrollment modal
    setEnrollmentModalOpen(true);
  };

  // Handle post-login enrollment intent
  useEffect(() => {
    if (auth.isLoggedIn && auth.role === "student" && enrollmentIntent && normalizedCourse) {
      if (enrollmentIntent.courseId === normalizedCourse.id) {
        // Automatically open enrollment modal
        handleEnrollCourse();
        // Clear intent
        dispatch(setEnrollmentIntent(null));
      }
    }
  }, [auth.isLoggedIn, auth.role, enrollmentIntent, normalizedCourse, dispatch]);

  // Handle enrollment type selection
  const handleEnrollmentTypeSelect = async (type) => {
    if (!normalizedCourse) return;

    const courseId = normalizedCourse.id;
    const courseTitle = normalizedCourse.title;

    await submissionGuard.guard(async () => {
      try {
        let response;

        if (type === "normal") {
          response = await dispatch(enrollInCourseNormal(courseId)).unwrap();
        } 
        else if (type === "private") {
          const instructorId =
            normalizedCourse.instructor?.id || normalizedCourse.instructor_id;
          if (!instructorId) {
            toastManager.error(
              "Private enrollment not available - no instructor assigned",
            );
            return;
          }
          response = await dispatch(
            enrollInCoursePrivate({
              courseId,
              teacherId: instructorId,
            }),
          ).unwrap();
        }

        // Show success message (use backend message if available)
        const successMessage =
          response?.message || `Successfully made enrollment request for ${courseTitle}`;
        toastManager.success(successMessage);

        // Close modal
        setEnrollmentModalOpen(false);
        setPaymentSubmitted(false);

        // Refresh course data to update enrollment status
        dispatch(fetchCourseById(courseId));

        // Refresh student dashboard to sync enrollment state
        if (auth.role === "student") {
          dispatch(fetchStudentDashboard());
        }
      } catch (error) {
        showApiError(error);
      }
    });
  };
  const callPrivateEnrollmentCall = async (slot) => {
    if (!slot || !normalizedCourse) return;

    const courseId = normalizedCourse.id;
    const courseTitle = normalizedCourse.title;

    await submissionGuard.guard(async () => {
      try {
        const instructorId =
          normalizedCourse.instructor?.id || normalizedCourse.instructor_id;
        if (!instructorId) {
          toastManager.error(
            "Private enrollment not available - no instructor assigned",
          );
          return;
        }

        const response = await dispatch(
          enrollInCoursePrivate({
            courseId,
            teacherId: instructorId,
            preferred_slots: [{ days: slot.days, time: slot.time }],
          }),
        ).unwrap();

        const successMessage =
          response?.message || `Successfully made enrollment request for ${courseTitle}`;
        toastManager.success(successMessage);

        setEnrollmentModalOpen(false);
        setPaymentSubmitted(false);

        dispatch(fetchCourseById(courseId));

        if (auth.role === "student") {
          dispatch(fetchStudentDashboard());
        }
      } catch (error) {
        showApiError(error);
      }
    });
  };

  // Close enrollment modal
  const closeEnrollmentModal = () => {
    setEnrollmentModalOpen(false);
    setPaymentSubmitted(false);
  };

  // Handle course unenrollment
  const handleUnenrollCourse = async (courseData) => {
    if (!auth.isLoggedIn) {
      dispatch(setAuthModal("login"));
      return;
    }

    if (auth.role !== "student") {
      toastManager.error("Only students can unenroll from courses");
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to unenroll from "${courseData.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    await submissionGuard.guard(async () => {
      try {
        await dispatch(unenrollFromCourse(courseData.id)).unwrap();
        toastManager.success(
          `Successfully unenrolled from ${courseData.title}`,
        );

        // Refresh course data to update enrollment status
        dispatch(fetchCourseById(courseData.id));

        // Refresh student dashboard to sync enrollment state
        if (auth.role === "student") {
          dispatch(fetchStudentDashboard());
        }
      } catch (error) {
        showApiError(error);
      }
    });
  };

  // Handle image error
  const handleImageError = (e) => {
    // If the image fails to load, try the fallback
    if (normalizedCourse.thumbnail) {
      // If we were trying to load the thumbnail and it failed, use the fallback
      e.target.src = `https://picsum.photos/seed/course_${normalizedCourse.id || 0}/800/450`;
    } else {
      // If even the fallback fails, show a placeholder
      setImageError(true);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="min-h-screen bg-[#0f172a] text-white font-inter relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-blue-500/20">
                  <i className="fas fa-spinner text-blue-400 text-3xl animate-spin"></i>
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-blue-600/20 rounded-full animate-ping mx-auto"></div>
              </div>
              <p className="text-white text-xl font-medium mb-2">
                Loading course details...
              </p>
              <p className="text-slate-400 text-sm">
                Please wait while we prepare your content
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="min-h-screen bg-[#0f172a] text-white font-inter relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-red-500/20">
                <i className="fas fa-exclamation-triangle text-red-400 text-3xl"></i>
              </div>
              <h2 className="text-white text-2xl font-bold mb-4">
                Unable to load course
              </h2>
              <p className="text-slate-400 text-sm mb-8">
                {typeof error === "string"
                  ? error
                  : "Failed to load course details"}
              </p>
              <Link to="/courses">
                <Button variant="outline" size="lg" className="group">
                  <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
                  Back to Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Course not found state
  if (!normalizedCourse) {
    return (
      <section className="min-h-screen bg-[#0f172a] text-white font-inter relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-slate-600/10 blur-[120px] rounded-full animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-slate-500/20">
                <i className="fas fa-book text-slate-400 text-3xl"></i>
              </div>
              <h2 className="text-white text-2xl font-bold mb-4">
                Course Not Found
              </h2>
              <p className="text-slate-400 text-sm mb-8">
                The course you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/courses">
                <Button variant="outline" size="lg" className="group">
                  <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
                  Back to Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const enrolled = isCourseEnrolled(normalizedCourse);
  const isEnrolling = enrollingCourseIds.includes(normalizedCourse.id);
  const isUnenrolling = unenrollingCourseIds.includes(normalizedCourse.id);
  const isPending = normalizedCourse.enrollment_status === "pending";
  const isRejected = normalizedCourse.enrollment_status === "rejected";
  const noSessions = !normalizedCourse.has_session;

  return (
    <section className="min-h-screen bg-[#0f172a] text-white font-inter relative overflow-hidden animate-fadeIn">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-teal-600/5 blur-[100px] rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10 animate-springyReveal">
        <BreadcrumbNavigation
          items={[
            { label: "Home", to: "/", icon: "fas fa-home" },
            { label: "Courses", to: "/courses" },
            { label: truncate(normalizedCourse.title, 25) },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10 animate-springyReveal" style={{ animationDelay: '0.15s' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header Card */}
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] overflow-hidden border border-slate-700/50 shadow-2xl glass-shine transition-all duration-500">
              {/* Course Thumbnail */}
              <div className="relative h-[200px] sm:h-[280px] lg:h-[320px] overflow-hidden bg-slate-900/50">
                {imageError || !getCourseImage(normalizedCourse) ? (
                  <div className="w-full h-full bg-slate-800" />
                ) : (
                  <img
                    src={getCourseImage(normalizedCourse)}
                    alt={normalizedCourse.title || "Course"}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    onError={handleImageError}
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none"></div>

                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  {normalizedCourse.status === "published" ? (
                    <span className="bg-green-500/20 backdrop-blur-sm text-green-400 px-4 py-2 rounded-full text-xs font-bold border border-green-500/30 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Published
                    </span>
                  ) : (
                    <span className="bg-slate-600/20 backdrop-blur-sm text-slate-400 px-4 py-2 rounded-full text-xs font-bold border border-slate-500/30 flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      Draft
                    </span>
                  )}
                </div>

                {/* Floating action buttons */}
                {/* <div className="absolute bottom-6 left-6 flex gap-3">
                  <button className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-110">
                    <i className="fas fa-heart text-white"></i>
                  </button>
                  <button className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-110">
                    <i className="fas fa-share-alt text-white"></i>
                  </button>
                </div> */}
              </div>

              {/* Course Content */}
              <div className="p-8 lg:p-10">
                {/* Course Title and Meta */}
                <div className="mb-8">
                  <h1 className="text-3xl md:text-5xl font-black font-poppins mb-6 leading-tight bg-linear-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {normalizedCourse.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    {normalizedCourse.category && (
                      <div className="flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/20">
                        <i className="fas fa-tag text-blue-400 text-xs"></i>
                        <span className="text-blue-300 font-medium">
                          {capitalize(normalizedCourse.category)}
                        </span>
                      </div>
                    )}

                    {(normalizedCourse.instructor?.id || normalizedCourse.instructor_id) && (
                      <Link
                        to={`/teachers/${normalizedCourse.instructor?.id || normalizedCourse.instructor_id}`}
                        className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-colors"
                      >
                        <i className="fas fa-chalkboard-teacher text-indigo-400 text-xs" />
                        <span className="text-slate-300 font-medium">
                          {normalizedCourse.instructor?.username || `Instructor #${normalizedCourse.instructor_id}`}
                        </span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Course Description */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold font-poppins mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-info-circle text-blue-400 text-sm"></i>
                    </div>
                    About this course
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      {normalizedCourse.description}
                    </p>
                  </div>
                </div>

                {/* Course Outline */}
                {normalizedCourse.outline &&
                  normalizedCourse.outline.replace(/<[^>]*>/g, "").trim() && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold font-poppins mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-list-alt text-indigo-400 text-sm"></i>
                      </div>
                      Course Outline
                    </h2>
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div
                        className="course-outline-content"
                        dangerouslySetInnerHTML={{ __html: normalizedCourse.outline }}
                      />
                    </div>
                  </div>
                )}

                {/* Attachment */}
                {normalizedCourse.attachment && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold font-poppins mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-paperclip text-amber-400 text-sm"></i>
                      </div>
                      Course Attachment
                    </h2>
                    <button
                      onClick={() => setViewerUrl(getStorageUrl(normalizedCourse.attachment))}
                      className="inline-flex items-center gap-4 px-6 py-4 bg-slate-800/40 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-700/50 hover:border-indigo-500/30 rounded-2xl text-white font-medium transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 bg-indigo-500/20 group-hover:bg-indigo-500/30 rounded-xl flex items-center justify-center transition-colors">
                        <i className="fas fa-eye text-indigo-400"></i>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Click to preview course material</p>
                      </div>
                      <i className="fas fa-arrow-right text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all ml-auto"></i>
                    </button>
                  </div>
                )}

                {/* Course Schedule */}
                {normalizedCourse.schedule && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold font-poppins mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-calendar-alt text-purple-400 text-sm"></i>
                      </div>
                      Schedule
                    </h2>
                    <div className="bg-linear-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                          <i className="fas fa-clock text-purple-400"></i>
                        </div>
                        <div>
                          <p className="text-slate-300 leading-relaxed">
                            {typeof normalizedCourse.schedule === "string"
                              ? normalizedCourse.schedule
                              : JSON.stringify(normalizedCourse.schedule)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Price and CTA Card */}
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] overflow-hidden border border-slate-700/50 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 sticky top-6">
              <div className="p-8">
                {/* Price Display */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                    <div className="relative text-3xl lg:text-4xl font-black bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent wrap-break-word max-w-full">
                      {formatCurrency(
                        parseFloat(normalizedCourse.price) || 0,
                        "USD",
                      )}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mt-3 font-medium">
                    One-time payment
                  </p>
                </div>

                {/* CTA Button */}
                {auth.isLoggedIn && auth.role === "student" ? (
                  <div className={`relative mb-6 ${(noSessions && !enrolled) || isRejected ? "group/tooltip" : ""}`}>
                    <button
                      onClick={() =>
                        enrolled
                          ? handleUnenrollCourse(normalizedCourse)
                          : !isPending && !isRejected && handleEnrollCourse()
                      }
                      disabled={isEnrolling || isUnenrolling || isPending || isRejected || isCheckingOut || (noSessions && !enrolled)}
                      className={`w-full py-4 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 ${
                        enrolled
                          ? isUnenrolling
                            ? "bg-red-600/50 text-red-400 cursor-not-allowed"
                            : "bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600 hover:text-white"
                          : isRejected
                            ? "bg-rose-600/10 border border-rose-500/20 text-rose-400 cursor-not-allowed"
                            : isPending
                              ? "bg-amber-600/10 border border-amber-500/20 text-amber-400 cursor-not-allowed"
                              : noSessions
                                ? "bg-linear-to-r from-blue-600/40 to-cyan-600/40 text-white/40 cursor-not-allowed"
                                : isEnrolling || isCheckingOut
                                  ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                                  : "bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] text-white"
                      }`}
                    >
                      {enrolled
                        ? isUnenrolling
                          ? "Unenrolling..."
                          : "Unenroll"
                        : isRejected
                          ? "Request Rejected"
                          : isPending
                            ? "Approval Pending"
                            : isCheckingOut
                              ? <><i className="fas fa-spinner fa-spin mr-1" />Opening Checkout...</>
                              : isEnrolling
                                ? "Enrolling..."
                                : normalizedCourse?.gumroad_product_permalink
                                  ? <><i className="fas fa-lock-open mr-1.5" />Pay & Enroll</>
                                  : "Enroll Now"}
                    </button>
                    {isRejected && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-2 bg-slate-800 border border-rose-500/30 text-white text-[11px] font-medium rounded-lg text-center max-w-[220px] opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 shadow-xl z-10">
                        <i className="fas fa-lock text-rose-400 mr-1.5"></i>
                        Your enrollment request was rejected. Please contact school administration.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></div>
                      </div>
                    )}
                    {/* {noSessions && !enrolled && !isRejected && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 shadow-xl z-10">
                        No sessions available for this course
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-700"></div>
                      </div>
                    )} */}
                  </div>
                ) : auth.isLoggedIn ? (
                  <div className="text-center py-4 mb-6">
                    <p className="text-slate-400 text-sm mb-4">
                      Only students can enroll in courses
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500/50 hover:text-white cursor-not-allowed opacity-75"
                      disabled
                    >
                      Enrollment Restricted
                    </Button>
                  </div>
                ) : (
                  <div className={`mb-6 relative ${noSessions ? "group/tooltip" : ""}`}>
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={noSessions}
                      className={`w-full border-0 shadow-lg transition-all duration-300 group ${
                        noSessions
                          ? "bg-linear-to-r from-blue-600/40 to-cyan-600/40 text-white/40 cursor-not-allowed shadow-none"
                          : "bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
                      }`}
                      onClick={() => {
                        if (!noSessions) {
                          dispatch(setEnrollmentIntent({ 
                            courseId: normalizedCourse.id, 
                            courseTitle: normalizedCourse.title 
                          }));
                          dispatch(setAuthModal("login"));
                        }
                      }}
                    >
                      <i className={`fas fa-sign-in-alt mr-2 ${!noSessions ? "group-hover:translate-x-1 transition-transform" : ""}`}></i>
                      Login to Enroll
                    </Button>
                    {/* {noSessions && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 shadow-xl z-10">
                        No sessions available for this course
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-700"></div>
                      </div>
                    )} */}
                  </div>
                )}

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-6 mb-8 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-shield-alt text-green-400"></i>
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-certificate text-blue-400"></i>
                    <span>Certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-infinity text-purple-400"></i>
                    <span>Lifetime</span>
                  </div>
                </div>

                {/* Course Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-slate-700/50">
                    <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                      <i className="fas fa-tag text-blue-400 text-xs"></i>
                      Category
                    </span>
                    <span className="text-white font-medium">
                      {capitalize(normalizedCourse.category)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-slate-700/50">
                    <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                      <i className="fas fa-toggle-on text-green-400 text-xs"></i>
                      Status
                    </span>
                    <span className="text-white font-medium">
                      {capitalize(normalizedCourse.status)}
                    </span>
                  </div>

                  {normalizedCourse.instructor_id && (
                    <div className="flex justify-between items-center py-4 border-b border-slate-700/50">
                      <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                        <i className="fas fa-user-tie text-purple-400 text-xs"></i>
                        Tutor
                      </span>
                      <span className="text-white font-medium">
                        #{normalizedCourse.instructor_id}
                      </span>
                    </div>
                  )}

                  {normalizedCourse.created_at && (
                    <div className="flex justify-between items-center py-4 border-b border-slate-700/50">
                      <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                        <i className="fas fa-calendar text-teal-400 text-xs"></i>
                        Created
                      </span>
                      <span className="text-white font-medium">
                        {formatDate(normalizedCourse.created_at)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-4">
                    <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                      <i className="fas fa-clock text-orange-400 text-xs"></i>
                      Schedule
                    </span>
                    <span className="text-white font-medium">
                      {normalizedCourse.schedule
                        ? "Available"
                        : "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <BackButton
              to="/courses"
              label="Back to Courses"
              variant="ghost"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Enrollment Type Modal */}
      <EnrollmentTypeModal
        isOpen={enrollmentModalOpen}
        course={normalizedCourse}
        isEnrolling={isEnrolling}
        onConfirm={() => handleEnrollmentTypeSelect("normal")}
        onClose={closeEnrollmentModal}
      />
      {viewerUrl && (
        <FileViewerModal filePath={viewerUrl} handleClose={() => setViewerUrl(null)} />
      )}
    </section>
  );
};

export default CourseDetails;
