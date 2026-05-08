import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAllCourses, fetchCategories } from "../../store/slices/coursesSlice";
import {
  enrollInCourseNormal,
  enrollInCoursePrivate,
  unenrollFromCourse,
  fetchStudentDashboard,
} from "../../store/slices/studentDashboardSlice";
import { Button, Input, FilterSelect, SearchInput } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";
import { formatCategoryLabel } from "../../constants";
import { useSubmissionGuard } from "../../utils/requestDeduplicator";
import { getCourseImage } from "../../utils/courseImageUtils";
import { setAuthModal } from "../../store/slices/uiSlice";
import EnrollmentTypeModal from "../../components/courses/EnrollmentTypeModal";
import { showApiError } from "../../utils/apiErrorHandler";
import { getStorageUrl } from "../../utils/storageUrl";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import PublicCourseCard from "../../components/courses/PublicCourseCard";

const Marketplace = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceRange: "",
    instructor: "",
  });
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const submissionGuard = useSubmissionGuard();

  // Get auth state from Redux store
  const auth = useSelector((state) => state.auth);

  // Get courses data from Redux store
  const { courses, isLoading, error, categories } = useSelector((state) => state.courses);

  // Get student dashboard state for enrollment tracking
  const { enrollingCourseIds, unenrollingCourseIds, enrolledCourses } =
    useSelector((state) => state.studentDashboard);

  useEffect(() => {
    if (courses?.length <= 0) dispatch(fetchAllCourses());
    dispatch(fetchCategories());
    if (auth.isLoggedIn && auth.role === "student") dispatch(fetchStudentDashboard());
  }, [dispatch, auth.isLoggedIn, auth.role]);

  const filterOptions = useMemo(() => {
    const instructors = courses ? [
      ...new Set(
        courses.map((course) => course.instructor?.username).filter(Boolean),
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
          label: `PKR ${lower.toFixed(0)} - ${upper.toFixed(0)}`,
        });
      }
    }

    return {
      instructors: instructors.sort(),
      priceRanges,
    };
  }, [courses]);

  // Filter courses based on search term and filters
  const filteredCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    return courses.filter((course) => {
      // Search filter (title, instructor, category, description)
      const matchesSearch =
        searchTerm === "" ||
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.username
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (typeof course.category === "string" ? course.category : course.category?.name ?? "")?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        filters.category === "" || (typeof course.category === "object" ? course.category?.name : course.category) === filters.category;

      // Price range filter
      const matchesPrice =
        filters.priceRange === "" ||
        (() => {
          const price = parseFloat(course.price) || 0;
          const [min, max] = filters.priceRange.split("-").map(parseFloat);
          if (min === 0) return price >= 0 && price <= max;
          return price > min && price <= max;
        })();

      // Instructor filter
      const matchesInstructor =
        filters.instructor === "" ||
        course.instructor?.username === filters.instructor;

      return (
        matchesSearch && matchesCategory && matchesPrice && matchesInstructor
      );
    });
  }, [courses, searchTerm, filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== "" || Object.values(filters).some((value) => value !== "")
    );
  }, [searchTerm, filters]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      category: "",
      priceRange: "",
      instructor: "",
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
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
  const handleEnrollCourse = (course) => {
    if (!auth.isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }

    if (auth.role !== "student") {
      toastManager.error("Only students can enroll in courses");
      return;
    }

    // Show enrollment modal
    setSelectedCourse(course);
    setEnrollmentModalOpen(true);
  };

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
    setSelectedCourse(null);
  };

  // Handle course unenrollment
  const handleUnenrollCourse = async (courseId, courseTitle) => {
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
      `Are you sure you want to unenroll from "${courseTitle}"?`,
    );

    if (!confirmed) {
      return;
    }

    await submissionGuard.guard(async () => {
      try {
        await dispatch(unenrollFromCourse(courseId)).unwrap();
        toastManager.success(`Successfully unenrolledfrom course ${courseTitle}`);

        // Refresh courses to update enrollment status
        dispatch(fetchAllCourses());

        // Always refresh student dashboard to sync enrollment state
        if (auth.role === "student") {
          dispatch(fetchStudentDashboard());
        }
      } catch (error) {
        showApiError(error);
      }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="min-h-screen bg-[#0f172a] text-white font-inter">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-spinner text-blue-500 text-2xl animate-spin"></i>
              </div>
              <p className="text-white text-lg">Loading courses...</p>
            </div>
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
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-book text-slate-400 text-2xl"></i>
              </div>
              <p className="text-white text-lg mb-4">No courses available</p>
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
      {/* Compact Search + Filters Bar */}
      <div className="relative overflow-hidden border-b border-slate-800/50 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-6 py-5 relative z-10">
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-black font-poppins leading-tight tracking-tight animate-scaleIn">
              Expand your <span className="text-blue-500">potential</span>.
            </h1>
          </div>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-10 gap-3 max-w-6xl mx-auto animate-springyReveal"
          >
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
              <FilterSelect
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full h-11"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{formatCategoryLabel(cat.name)}</option>
                ))}
              </FilterSelect>
            </div>
            <div className="md:col-span-2">
              <FilterSelect
                value={filters.priceRange}
                onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                className="w-full h-11"
              >
                <option value="">All Prices</option>
                {filterOptions.priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </FilterSelect>
            </div>
            <div className="md:col-span-2">
              <FilterSelect
                value={filters.instructor}
                onChange={(e) => handleFilterChange("instructor", e.target.value)}
                className="w-full h-11"
              >
                <option value="">All Teachers</option>
                {filterOptions.instructors.map((instructor) => (
                  <option key={instructor} value={instructor}>{instructor}</option>
                ))}
              </FilterSelect>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-16">
        <main>
          {hasActiveFilters && (
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-sm text-slate-400">
                Showing {filteredCourses.length} result
                {filteredCourses.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
            {filteredCourses.length === 0 && hasActiveFilters && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-slate-400 text-2xl"></i>
                </div>
                <p className="text-slate-400 text-lg mb-4">
                  No courses found matching your criteria
                </p>
                <Button
                  variant="outline"
                  size="md"
                  onClick={resetFilters}
                  className="mt-2"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Clear Filters
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course, idx) => (
                <PublicCourseCard
                  key={course.id || idx}
                  course={course}
                  index={idx}
                  enrolled={isCourseEnrolled(course)}
                  isEnrolling={enrollingCourseIds.includes(course.id)}
                  isUnenrolling={unenrollingCourseIds.includes(course.id)}
                  onEnroll={handleEnrollCourse}
                  onUnenroll={handleUnenrollCourse}
                />
              ))}
            </div>
        </main>
      </div>

      {/* Enrollment Type Modal */}
      <EnrollmentTypeModal
        isOpen={enrollmentModalOpen}
        onClose={closeEnrollmentModal}
        onSelect={handleEnrollmentTypeSelect}
        instructorId={selectedCourse?.instructor?.id || selectedCourse?.instructor_id}
        teacher={selectedCourse?.instructor}
        onSlotSelect={callPrivateEnrollmentCall}
        isEnrolling={selectedCourse ? enrollingCourseIds.includes(selectedCourse.id) : false}
      />

      <AuthRequiredModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        message="Please sign in or create an account to enroll in courses and track your progress."
      />
    </section>
  );
};

export default Marketplace;
