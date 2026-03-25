import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { fetchAllCourses } from "../../store/slices/coursesSlice";
import {
  enrollInCourse,
  unenrollFromCourse,
  fetchStudentDashboard,
} from "../../store/slices/studentDashboardSlice";
import toast from "react-hot-toast";

const Marketplace = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Get auth state from Redux store
  const auth = useSelector((state) => state.auth);

  // Get courses data from Redux store
  const { courses, isLoading, error } = useSelector((state) => state.courses);

  // Get student dashboard state for enrollment tracking
  const { enrollingCourseIds, unenrollingCourseIds, enrolledCourses } =
    useSelector((state) => state.studentDashboard);

  // Fetch courses on component mount
  useEffect(() => {
    dispatch(fetchAllCourses());

    // Fetch student dashboard if user is logged in as student
    if (auth.isLoggedIn && auth.role === "student") {
      dispatch(fetchStudentDashboard());
    }
  }, [dispatch, auth.isLoggedIn, auth.role]);

  // Filter courses based on search term
  const filteredCourses =
    courses?.filter(
      (course) =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.username
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

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
  const handleEnrollCourse = async (courseId, courseTitle) => {
    if (!auth.isLoggedIn) {
      toast.error("Please log in to enroll in courses");
      navigate("/");
      return;
    }

    if (auth.role !== "student") {
      toast.error("Only students can enroll in courses");
      return;
    }

    try {
      await dispatch(enrollInCourse(courseId)).unwrap();
      toast.success(`Successfully enrolled in ${courseTitle}`);

      // Refresh courses to update enrollment status
      dispatch(fetchAllCourses());

      // Always refresh student dashboard to sync enrollment state
      if (auth.role === "student") {
        dispatch(fetchStudentDashboard());
      }
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to enroll in course",
      );
    }
  };

  // Handle course unenrollment
  const handleUnenrollCourse = async (courseId, courseTitle) => {
    if (!auth.isLoggedIn) {
      toast.error("Please log in to unenroll from courses");
      navigate("/");
      return;
    }

    if (auth.role !== "student") {
      toast.error("Only students can unenroll from courses");
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to unenroll from "${courseTitle}"?`,
    );

    if (!confirmed) {
      return;
    }

    console.log("unenroll debug", {
      courseId,
      user: auth?.user,
      enrolledCourses,
    });

    try {
      await dispatch(unenrollFromCourse(courseId)).unwrap();
      toast.success(`Successfully unenrolled from ${courseTitle}`);

      // Refresh courses to update enrollment status
      dispatch(fetchAllCourses());

      // Always refresh student dashboard to sync enrollment state
      if (auth.role === "student") {
        dispatch(fetchStudentDashboard());
      }
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to unenroll from course",
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="min-h-screen bg-[#0f172a] text-white font-inter">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                <i className="fas fa-spinner text-blue-500 text-2xl"></i>
              </div>
              <p className="text-white text-lg">Loading courses...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="min-h-screen bg-[#0f172a] text-white font-inter">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
              </div>
              <p className="text-white text-lg mb-4">Unable to load courses</p>
              <p className="text-slate-400 text-sm mb-6">
                {typeof error === "string"
                  ? error
                  : error?.message || "Failed to load courses"}
              </p>
              <button
                onClick={() => dispatch(fetchAllCourses())}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition"
              >
                Try Again
              </button>
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
      className="min-h-screen bg-[#0f172a] text-white font-inter"
    >
      {/* Hero Search Section */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-900/30 via-[#0f172a] to-purple-900/30 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black font-poppins mb-6 leading-tight tracking-tight">
            Expand your <span className="text-blue-500">potential</span>.
          </h1>
          <p className="text-slate-400 text-lg mb-14 max-w-2xl mx-auto font-medium">
            Unlock your future with industry-leading courses designed for the
            ambitious <span className="text-white">VirtualCity</span> student.
          </p>
          <form
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto relative mb-10 group px-4 sm:px-0"
          >
            <i className="fas fa-search absolute left-12 sm:left-8 top-1/2 -translate-y-1/2 text-slate-500 text-lg sm:text-xl"></i>
            <input
              type="text"
              id="course-search"
              name="course-search"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-3xl sm:rounded-[2.5rem] pl-16 sm:pl-20 pr-10 sm:pr-44 py-5 sm:py-7 focus:ring-4 focus:ring-blue-500/20 outline-none text-sm sm:text-base transition-all group-hover:bg-slate-800 shadow-2xl"
            />
            <button
              type="submit"
              className="mt-4 sm:mt-0 sm:absolute sm:right-3 sm:top-3 sm:bottom-3 w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 sm:px-12 py-4 sm:py-0 rounded-2xl sm:rounded-4xl font-bold text-sm transition active:scale-95 shadow-xl shadow-blue-600/30"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-16">
          <aside className="lg:w-80 shrink-0 space-y-12">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center justify-between cursor-pointer group">
                Category
              </h3>
              <ul className="space-y-5">
                {[
                  "STEM",
                  "Languages",
                  "Arts & Design",
                  "Humanities",
                  "Test Prep",
                ].map((cat) => (
                  <li key={cat}>
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-blue-500 transition shadow-inner"></div>
                      <span className="text-sm text-slate-400 group-hover:text-slate-100 transition font-medium">
                        {cat}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="flex-1">
            {filteredCourses.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">
                  No courses found matching "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-blue-400 hover:text-blue-300 transition"
                >
                  Clear search
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {filteredCourses.map((course, idx) => (
                <div
                  key={course.id || idx}
                  className="bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-slate-700/50 shadow-2xl group hover:border-blue-500/40 transition-all flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={
                        course.thumbnail ||
                        `https://picsum.photos/seed/course_${course.id || idx}/800/450`
                      }
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-80 group-hover:opacity-100"
                      alt={course.title || "Course"}
                    />
                    {course.status === "published" && (
                      <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Published
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold font-poppins mb-4 leading-tight group-hover:text-blue-400 transition cursor-pointer min-h-12">
                      {course.title || "Untitled Course"}
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={
                          course.instructor?.avatar ||
                          `https://i.pravatar.cc/150?u=${course.instructor?.username || idx}`
                        }
                        className="w-9 h-9 rounded-full border border-slate-700 shadow-md"
                        alt={course.instructor?.username || "Instructor"}
                      />
                      <span className="text-xs text-slate-400 font-bold group-hover:text-slate-200 transition">
                        {course.instructor?.username || "Unknown Instructor"}
                      </span>
                    </div>
                    {course.category && (
                      <div className="mb-4">
                        <span className="text-xs text-slate-500 uppercase tracking-widest">
                          {course.category}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-blue-400">
                        ${course.price || "0.00"}
                      </span>
                      <div className="flex items-center gap-1">
                        <i className="fas fa-star text-yellow-400 text-xs"></i>
                        <span className="text-xs text-slate-400">
                          {course.rating || "0.00"}
                        </span>
                      </div>
                    </div>
                    {course.instructor?.expertise && (
                      <div className="mb-4">
                        <span className="text-xs text-slate-500">
                          Expertise: {course.instructor.expertise}
                        </span>
                      </div>
                    )}
                    {(() => {
                      const enrolled = isCourseEnrolled(course);
                      return (
                        <button
                          onClick={() =>
                            enrolled
                              ? handleUnenrollCourse(course.id, course.title)
                              : handleEnrollCourse(course.id, course.title)
                          }
                          disabled={
                            enrollingCourseIds.includes(course.id) ||
                            unenrollingCourseIds.includes(course.id)
                          }
                          className={`w-full mt-auto py-4 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 ${
                            enrolled
                              ? unenrollingCourseIds.includes(course.id)
                                ? "bg-red-600/50 text-red-400 cursor-not-allowed"
                                : "bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600 hover:text-white"
                              : enrollingCourseIds.includes(course.id)
                                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                                : "bg-slate-900 border border-blue-600/30 text-blue-500 hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          {enrolled
                            ? unenrollingCourseIds.includes(course.id)
                              ? "Unenrolling..."
                              : "Unenroll"
                            : enrollingCourseIds.includes(course.id)
                              ? "Enrolling..."
                              : "Enroll Now"}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default Marketplace;
