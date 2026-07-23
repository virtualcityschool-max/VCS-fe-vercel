import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAllCourses, fetchCategories } from "../../store/slices/coursesSlice";
import {
  enrollInCourseNormal,
  enrollInCoursePrivate,
  unenrollFromCourse,
  withdrawEnrollment,
  fetchStudentDashboard,
} from "../../store/slices/studentDashboardSlice";
import { Button, Input, FilterSelect, SearchInput } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";
import { formatCategoryLabel } from "../../constants";
import { useSubmissionGuard } from "../../utils/requestDeduplicator";
import { getCourseImage } from "../../utils/courseImageUtils";
import { setAuthModal, setEnrollmentIntent } from "../../store/slices/uiSlice";
import EnrollmentTypeModal from "../../components/courses/EnrollmentTypeModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showApiError } from "../../utils/apiErrorHandler";
import { getDisplayName } from "../../utils/userDisplay";
import { getStorageUrl } from "../../utils/storageUrl";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import ApplyFreeAccessModal from "../../components/public/ApplyFreeAccessModal";
import PublicCourseCard from "../../components/courses/PublicCourseCard";
import { studentService } from "../../services/studentService";

const PREVIEW_LIMIT = 8;

const getCategoryName = (course) =>
  typeof course.category === "object" ? course.category?.name : course.category;

const Marketplace = () => {
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priceRange: "",
    instructor: "",
  });
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [freeAccessOpen, setFreeAccessOpen] = useState(false);
  const [freeAccessPreselect, setFreeAccessPreselect] = useState([]);
  const [pendingEnrollCourseId, setPendingEnrollCourseId] = useState(null);

  const openFreeAccess = (courseIds = []) => {
    setFreeAccessPreselect(courseIds);
    setFreeAccessOpen(true);
  };
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [withdrawConfirm, setWithdrawConfirm] = useState({ open: false, courseId: null, courseTitle: "" });
  const [unenrollConfirm, setUnenrollConfirm] = useState({ open: false, courseId: null, courseTitle: "" });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const submissionGuard = useSubmissionGuard();
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });

  // Get auth state from Redux store
  const auth = useSelector((state) => state.auth);

  // Get courses data from Redux store
  const { courses, isLoading, error, categories } = useSelector((state) => state.courses);

  // Get student dashboard state for enrollment tracking
  const { enrollingCourseIds, unenrollingCourseIds, withdrawingCourseIds, enrolledCourses } =
    useSelector((state) => state.studentDashboard);

  const { enrollmentIntent } = useSelector((state) => state.ui);

  useEffect(() => {
    dispatch(fetchAllCourses());
    dispatch(fetchCategories());
    if (auth.isLoggedIn && auth.role === "student") dispatch(fetchStudentDashboard());
  }, [dispatch, auth.isLoggedIn, auth.role]);



  const filterOptions = useMemo(() => {
    const instructors = courses ? [
      ...new Set(
        courses.map((course) => getDisplayName(course.instructor)).filter(Boolean),
      ),
    ] : [];

    // Dynamic price ranges based on course prices
    const prices = (courses || []).map((c) => parseFloat(c.price) || 0);
    const maxPrice = Math.max(...prices, 0);
    
    let priceRanges = [];
    if (maxPrice === 0) {
      priceRanges = [{ value: "0-0", label: "Free" }];
    } else {
      // Determine a reasonable step based on max price, ensuring it ends with 0
      // We aim for approximately 5 ranges
      let step = Math.ceil(maxPrice / 5 / 10) * 10;
      if (step === 0) step = 10;
      
      for (let i = 0; i < maxPrice; i += step) {
        const lower = i;
        const upper = i + step;
        priceRanges.push({
          value: `${lower}-${upper}`,
          label: `$${lower.toFixed(0)} – $${upper.toFixed(0)} USD`,
        });
      }
    }

    return {
      instructors: instructors.sort(),
      priceRanges,
    };
  }, [courses]);

  // Filter courses (category handled by tabs, not here)
  const filteredCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];
    return courses.filter((course) => {
      const matchesSearch =
        searchTerm === "" ||
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDisplayName(course.instructor)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (getCategoryName(course) ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPrice =
        filters.priceRange === "" ||
        (() => {
          const price = parseFloat(course.price) || 0;
          const [min, max] = filters.priceRange.split("-").map(parseFloat);
          if (min === 0) return price >= 0 && price <= max;
          return price > min && price <= max;
        })();

      const matchesInstructor =
        filters.instructor === "" ||
        getDisplayName(course.instructor) === filters.instructor;

      return matchesSearch && matchesPrice && matchesInstructor;
    });
  }, [courses, searchTerm, filters]);

  // Courses visible in the active tab
  const visibleCourses = useMemo(() => {
    if (activeCategory === "all") return filteredCourses;
    const cat = categories.find((c) => String(c.id) === String(activeCategory));
    if (!cat) return filteredCourses;
    return filteredCourses.filter((c) => getCategoryName(c) === cat.name);
  }, [filteredCourses, activeCategory, categories]);

  // Categories that have at least one visible course (for tabs)
  const activeCats = useMemo(() =>
    categories.filter((cat) =>
      filteredCourses.some((c) => getCategoryName(c) === cat.name)
    ), [categories, filteredCourses]);

  const hasActiveFilters = useMemo(() =>
    searchTerm !== "" || Object.values(filters).some((v) => v !== ""),
  [searchTerm, filters]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({ priceRange: "", instructor: "" });
    setActiveCategory("all");
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  // Derive enrollment state using both course.is_enrolled and enrolledCourses
  const isCourseEnrolled = (course) => {
    // Check if course.is_enrolled is truthy
    if (course.is_enrolled) {
      return true;
    }

    // Check if enrolledCourses contains this course
    if (enrolledCourses && Array.isArray(enrolledCourses)) {
      return enrolledCourses.some((enrolled) => enrolled.id === course.id);
    }

    return false;
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the filteredCourses computed above
  };

  // Handle course enrollment
  const handleEnrollCourse = async (course) => {
    if (!auth.isLoggedIn) {
      dispatch(setEnrollmentIntent({
        courseId: course.id,
        courseTitle: course.title
      }));
      setPendingEnrollCourseId(course.id);
      setAuthModalOpen(true);
      return;
    }

    if (auth.role !== "student") {
      toastManager.error("Only students can enroll in courses");
      return;
    }

    // Always show confirmation modal first (paid or free)
    setSelectedCourse(course);
    setEnrollmentModalOpen(true);
  };

  // Called when student confirms on paid modal — redirect to Gumroad
  const handleCheckout = async () => {
    if (!selectedCourse) return;
    try {
      setIsCheckingOut(true);
      const data = await studentService.initiateCheckout(selectedCourse.id);
      window.location.href = data.checkout_url;
    } catch (error) {
      showApiError(error);
      setIsCheckingOut(false);
      setSelectedCourse(null);
    }
  };

  // Handle post-login enrollment intent
  useEffect(() => {
    if (auth.isLoggedIn && auth.role === "student" && enrollmentIntent) {
      const course = courses.find(c => c.id === enrollmentIntent.courseId);
      if (course) {
        handleEnrollCourse(course);
        dispatch(setEnrollmentIntent(null));
      }
    }
  }, [auth.isLoggedIn, auth.role, enrollmentIntent, courses, dispatch]);

  // Handle normal enrollment type selection only — private is handled by callPrivateEnrollmentCall
  const handleEnrollmentTypeSelect = async (type) => {
    if (type !== "normal" || !selectedCourse) return;

    const courseId = selectedCourse.id;
    const courseTitle = selectedCourse.title;

    await submissionGuard.guard(async () => {
      try {
        const response = await dispatch(enrollInCourseNormal(courseId)).unwrap();
        const successMessage =
          response?.message || `Enrolment request sent`;
        toastManager.success(successMessage);
        setEnrollmentModalOpen(false);
        setPaymentSubmitted(false);
        setSelectedCourse(null);
        dispatch(fetchAllCourses());

        if (auth.role === "student") {
          dispatch(fetchStudentDashboard());
        }
      } catch (error) {
        showApiError(error);
      }
    });
  };

  // Handle private enrollment after a slot is selected in the modal
  const callPrivateEnrollmentCall = async (slot) => {
    if (!slot || !selectedCourse) return;

    const courseId = selectedCourse.id;
    const courseTitle = selectedCourse.title;
    const instructorId =
      selectedCourse.instructor?.id || selectedCourse.instructor_id;

    if (!instructorId) {
      toastManager.error("Private enrollment not available - no instructor assigned");
      return;
    }

    await submissionGuard.guard(async () => {
      try {
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
        setSelectedCourse(null);

        dispatch(fetchAllCourses());

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
    setSelectedCourse(null);
  };

  // Handle course unenrollment
  const handleUnenrollCourse = (courseId, courseTitle) => {
    if (!auth.isLoggedIn) {
      dispatch(setAuthModal("login"));
      return;
    }

    if (auth.role !== "student") {
      toastManager.error("Only students can unenroll from courses");
      return;
    }

    setUnenrollConfirm({ open: true, courseId, courseTitle });
  };

  const confirmUnenrollCourse = async () => {
    const { courseId, courseTitle } = unenrollConfirm;
    setUnenrollConfirm({ open: false, courseId: null, courseTitle: "" });

    await submissionGuard.guard(async () => {
      try {
        await dispatch(unenrollFromCourse(courseId)).unwrap();
        toastManager.success(`Successfully unenrolled from course ${courseTitle}`);

        dispatch(fetchAllCourses());
        dispatch(fetchStudentDashboard());
      } catch (error) {
        showApiError(error);
      }
    });
  };

  // Handle withdraw enrollment request
  const handleWithdrawEnrollment = (courseId, courseTitle) => {
    setWithdrawConfirm({ open: true, courseId, courseTitle });
  };

  const confirmWithdrawEnrollment = async () => {
    const { courseId } = withdrawConfirm;
    setWithdrawConfirm({ open: false, courseId: null, courseTitle: "" });
    try {
      await dispatch(withdrawEnrollment(courseId)).unwrap();
      toastManager.success("Enrollment request cancelled");
      dispatch(fetchAllCourses());
    } catch (error) {
      showApiError(error);
    }
  };

  // Loading state — skeleton grid mirrors the real layout
  if (isLoading) {
    return (
      <section className="min-h-screen bg-[#0f172a] text-white font-inter">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="max-w-4xl mx-auto mb-10 space-y-3">
            <div className="skeleton h-9 w-72 mx-auto rounded-xl" />
            <div className="skeleton h-11 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="skeleton rounded-2xl aspect-[3/4] border border-white/5" style={{ animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!isLoading && courses.length === 0) {
    return (
      <section className="min-h-screen bg-[#0f172a] text-white font-inter">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center animate-scaleIn">
              <div className="w-20 h-20 icon-chip rounded-3xl mx-auto mb-6">
                <i className="fas fa-book text-2xl"></i>
              </div>
              <p className="text-white text-xl font-bold mb-2">No courses available</p>
              <p className="text-slate-400 text-sm">
                Check back later for new courses
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="classes-view"
      className="min-h-screen bg-[#0f172a] text-white font-inter animate-fadeIn"
    >
      {/* Search + Filters Bar */}
      <div className="relative overflow-hidden border-b border-slate-800/50 animate-fadeIn">
        {/* Ambient glow behind the header */}
        <div className="absolute top-[-60%] left-1/2 -translate-x-1/2 w-[70%] h-[160%] bg-indigo-600/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
          <div className="text-center mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2 animate-fadeInUp">
              Course Catalog
            </p>
            <h1 className="text-2xl md:text-4xl font-black font-poppins leading-tight tracking-tight animate-fadeInUp" style={{ animationDelay: "0.08s" }}>
              Expand your <span className="text-gradient">potential</span>.
            </h1>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 max-w-5xl mx-auto animate-springyReveal">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-8 gap-3 flex-1">
            <div className="md:col-span-4">
              <SearchInput
                id="course-search"
                name="course-search"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                className="w-full"
                inputClassName="h-11"
              />
            </div>
            <div className="md:col-span-2">
              <FilterSelect value={filters.priceRange} onChange={(e) => handleFilterChange("priceRange", e.target.value)} className="w-full h-11">
                <option value="">All Prices</option>
                {filterOptions.priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </FilterSelect>
            </div>
            <div className="md:col-span-2">
              <FilterSelect value={filters.instructor} onChange={(e) => handleFilterChange("instructor", e.target.value)} className="w-full h-11">
                <option value="">All Tutors</option>
                {filterOptions.instructors.map((instructor) => (
                  <option key={instructor} value={instructor}>{instructor}</option>
                ))}
              </FilterSelect>
            </div>
            </form>
            <button
              type="button"
              onClick={() => openFreeAccess()}
              className="btn-glow flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-white font-bold text-sm whitespace-nowrap shrink-0"
              title="Apply for free access."
            >
              <i className="fas fa-hand-holding-heart"></i>
              <span className="hidden sm:inline">Apply for Free Access</span>
              <span className="sm:hidden">Free Access</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="border-b border-slate-800/50 sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-blue py-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex-shrink-0 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer border ${
                activeCategory === "all"
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent shadow-md shadow-indigo-900/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800 border-transparent hover:border-slate-700"
              }`}
            >
              All
            </button>
            {activeCats.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(String(cat.id))}
                onMouseEnter={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setTooltip({ visible: true, text: cat.name, x: r.left + r.width / 2, y: r.top - 8 });
                }}
                onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
                className={`flex-shrink-0 max-w-[120px] truncate px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer border ${
                  activeCategory === String(cat.id)
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent shadow-md shadow-indigo-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800 border-transparent hover:border-slate-700"
                }`}
              >
                {formatCategoryLabel(cat.name)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-4 pb-16">
        <main>

          {/* No results */}
          {visibleCourses.length === 0 && (
            <div className="text-center py-16 animate-scaleIn">
              <div className="w-20 h-20 icon-chip rounded-3xl mx-auto mb-6">
                <i className="fas fa-search text-2xl"></i>
              </div>
              <p className="text-white text-lg font-bold mb-1">No courses found</p>
              <p className="text-slate-500 text-sm mb-4">Try adjusting your search or filters</p>
              {hasActiveFilters && (
                <Button variant="outline" size="md" onClick={resetFilters} className="mt-2">
                  <i className="fas fa-redo mr-2"></i>Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* ── All tab: grouped by category ── */}
          {activeCategory === "all" && visibleCourses.length > 0 && (
            <div className="space-y-6">
              {activeCats.map((cat) => {
                const catCourses = filteredCourses.filter((c) => getCategoryName(c) === cat.name);
                if (!catCourses.length) return null;
                const preview = catCourses.slice(0, PREVIEW_LIMIT);
                const hasMore = catCourses.length > PREVIEW_LIMIT;
                return (
                  <section key={cat.id} className="mb-2">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2.5">
                        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-blue-500 inline-block" />
                        {formatCategoryLabel(cat.name)}
                        <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                          {catCourses.length}
                        </span>
                      </h2>
                      {hasMore && (
                        <button
                          onClick={() => { setActiveCategory(String(cat.id)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors flex-shrink-0"
                        >
                          Show all {catCourses.length}
                          <i className="fas fa-arrow-right text-xs" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                      {preview.map((course, idx) => (
                        <PublicCourseCard
                          key={course.id || idx}
                          course={course}
                          index={idx}
                          enrolled={isCourseEnrolled(course)}
                          isEnrolling={enrollingCourseIds.includes(course.id)}
                          isUnenrolling={unenrollingCourseIds.includes(course.id)}
                          isWithdrawing={withdrawingCourseIds.includes(course.id)}
                          onEnroll={handleEnrollCourse}
                          onUnenroll={handleUnenrollCourse}
                          onWithdraw={handleWithdrawEnrollment}
                        />
                      ))}
                    </div>
                    <hr className="mt-4 border-slate-800/60" />
                  </section>
                );
              })}
            </div>
          )}

          {/* ── Single category tab ── */}
          {activeCategory !== "all" && visibleCourses.length > 0 && (() => {
            const cat = categories.find((c) => String(c.id) === activeCategory);
            return (
              <section>
                <h2 className="text-lg font-black text-white tracking-tight mb-6 flex items-center gap-2.5">
                  <span className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-blue-500 inline-block" />
                  {formatCategoryLabel(cat?.name || "")}
                  <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    {visibleCourses.length}
                  </span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {visibleCourses.map((course, idx) => (
                    <PublicCourseCard
                      key={course.id || idx}
                      course={course}
                      index={idx}
                      enrolled={isCourseEnrolled(course)}
                      isEnrolling={enrollingCourseIds.includes(course.id)}
                      isUnenrolling={unenrollingCourseIds.includes(course.id)}
                      isWithdrawing={withdrawingCourseIds.includes(course.id)}
                      onEnroll={handleEnrollCourse}
                      onUnenroll={handleUnenrollCourse}
                      onWithdraw={handleWithdrawEnrollment}
                    />
                  ))}
                </div>
              </section>
            );
          })()}

        </main>
      </div>

      {/* Enrollment Type Modal */}
      <EnrollmentTypeModal
        isOpen={enrollmentModalOpen}
        course={selectedCourse}
        isPaid={selectedCourse?.is_paid || false}
        isLoading={selectedCourse?.is_paid ? isCheckingOut : (selectedCourse ? enrollingCourseIds.includes(selectedCourse.id) : false)}
        onConfirm={selectedCourse?.is_paid ? handleCheckout : () => handleEnrollmentTypeSelect("normal")}
        onClose={closeEnrollmentModal}
        onApplyFreeAccess={
          selectedCourse
            ? () => {
                const cid = selectedCourse.id;
                closeEnrollmentModal();
                openFreeAccess([cid]);
              }
            : undefined
        }
      />

      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        message="Please sign in or create an account to enroll in courses and track your progress."
        onApplyFreeAccess={() =>
          openFreeAccess(pendingEnrollCourseId ? [pendingEnrollCourseId] : [])
        }
      />

      {freeAccessOpen && (
        <ApplyFreeAccessModal
          preselectedCourseIds={freeAccessPreselect}
          onClose={() => {
            setFreeAccessOpen(false);
            setFreeAccessPreselect([]);
          }}
        />
      )}

      <ConfirmDialog
        open={withdrawConfirm.open}
        variant="danger"
        title="Cancel Enrollment Request"
        message={`Are you sure you want to cancel your enrollment request for "${withdrawConfirm.courseTitle}"?`}
        confirmLabel="Yes, Cancel Request"
        cancelLabel="Keep Request"
        loading={withdrawingCourseIds.includes(withdrawConfirm.courseId)}
        onConfirm={confirmWithdrawEnrollment}
        onCancel={() => setWithdrawConfirm({ open: false, courseId: null, courseTitle: "" })}
      />

      <ConfirmDialog
        open={unenrollConfirm.open}
        variant="danger"
        title="Unenroll from Course"
        message={`Are you sure you want to unenroll from "${unenrollConfirm.courseTitle}"?`}
        confirmLabel="Yes, Unenroll"
        cancelLabel="Keep Enrolled"
        loading={unenrollingCourseIds.includes(unenrollConfirm.courseId)}
        onConfirm={confirmUnenrollCourse}
        onCancel={() => setUnenrollConfirm({ open: false, courseId: null, courseTitle: "" })}
      />
      {/* Fixed category tooltip — escapes overflow-x-auto boundary */}
      {tooltip.visible && (
        <div
          className="fixed z-[9999] pointer-events-none px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-white text-[11px] font-medium rounded-lg whitespace-nowrap shadow-xl -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700" />
        </div>
      )}
    </section>
  );
};

export default Marketplace;
