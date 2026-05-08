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

const Marketplace = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceRange: "",
    instructor: "",
  });
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
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
      dispatch(setAuthModal("login"));
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
                <div
                  key={course.id || idx}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                  className="bg-[#1a2235]/60 backdrop-blur-xl rounded-[1.5rem] overflow-hidden border border-white/5 shadow-2xl group flex flex-col animate-springyReveal opacity-0 glass-shine hover-lift"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900/50">
                    <Link to={`/courses/${course.id}`} className="block h-full">
                      {getCourseImage(course, idx) ? (
                        <img
                          src={getCourseImage(course, idx)}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 opacity-70 group-hover:opacity-100"
                          alt={course.title || "Course"}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <i className="fas fa-book-open text-slate-700 text-3xl"></i>
                        </div>
                      )}
                    </Link>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-slate-900/80 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.15em] text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 shadow-xl">
                        {typeof course.category === "object" ? course.category?.name : course.category || "General"}
                      </span>
                    </div>

                    {/* Published/Draft Indicator */}
                    {course.status === "published" && (
                      <div className="absolute top-4 right-4 z-10 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <Link to={`/courses/${course.id}`}>
                        <h3 className="text-[17px] font-black font-poppins mb-2 leading-tight group-hover:text-blue-400 transition-colors cursor-pointer min-h-[42px] line-clamp-2 tracking-tight">
                          {course.title || "Untitled Course"}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                          {course.instructor?.avatar ? (
                            <img
                              src={getStorageUrl(course.instructor?.avatar)}
                              className="w-full h-full object-cover"
                              alt={course.instructor?.username}
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <i className="fas fa-user text-[10px] text-slate-500"></i>
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-bold tracking-tight">
                          {course.instructor?.username || "Instructor"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-4">
                      {/* Price and Rating Row */}
                      <div className="flex items-center justify-between py-3 border-y border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Price</span>
                          <span className="text-sm font-black text-white">
                            PKR {course.price || "0.00"}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Rating</span>
                          <div className="flex items-center gap-1">
                            <i className="fas fa-star text-yellow-500 text-[10px]"></i>
                            <span className="text-xs font-black text-white">
                              {course.rating || "5.0"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      {(() => {
                        const enrolled = isCourseEnrolled(course);
                        return (
                          <button
                            onClick={() =>
                              enrolled
                                ? handleUnenrollCourse(course.id, course.title)
                                : handleEnrollCourse(course)
                            }
                            disabled={
                              enrollingCourseIds.includes(course.id) ||
                              unenrollingCourseIds.includes(course.id)
                            }
                            className={`w-full py-3.5 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-xl ${
                                enrolled
                                  ? unenrollingCourseIds.includes(course.id)
                                    ? "bg-red-600/50 text-red-400 cursor-not-allowed"
                                    : "bg-red-600/10 border border-red-600/20 text-red-400 hover:bg-red-600 hover:text-white"
                                  : course.enrollment_status === "pending"
                                    ? "bg-amber-600/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white"
                                    : enrollingCourseIds.includes(course.id)
                                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/40"
                                      }`}
                          >
                            {enrolled
                              ? unenrollingCourseIds.includes(course.id)
                                ? "Unenrolling..."
                                : "Unenroll"
                              : enrollingCourseIds.includes(course.id)
                                ? "Enrolling..."
                                :course.enrollment_status == "pending" ? "Approval pending" : "Enroll Now"}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
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
    </section>
  );
};

export default Marketplace;
