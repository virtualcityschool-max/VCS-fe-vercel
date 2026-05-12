import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchAllCourses } from "../../store/slices/coursesSlice";
import { useEffect, useState, useMemo } from "react";
import { getCourseImage } from "../../utils/courseImageUtils";
import { getStorageUrl } from "../../utils/storageUrl";
import { setAuthModal, setEnrollmentIntent } from "../../store/slices/uiSlice";
import { fetchStudentDashboard, unenrollFromCourse } from "../../store/slices/studentDashboardSlice";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import PublicCourseCard from "../../components/courses/PublicCourseCard";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";

const PublicHome = () => {
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { courses, isLoading: coursesLoading } = useSelector((state) => state.courses);
  const { enrolledCourses, enrollingCourseIds } = useSelector((state) => state.studentDashboard);
  const { enrollmentIntent } = useSelector((state) => state.ui);

  useEffect(() => {
    if (courses.length <= 0) {
      dispatch(fetchAllCourses());
    }
    if (auth.isLoggedIn && auth.role === "student") {
      dispatch(fetchStudentDashboard());
    }
  }, [dispatch, auth.isLoggedIn, auth.role]);

  // Derive enrollment state
  const isCourseEnrolled = (course) => {
    if (course.is_enrolled) return true;
    if (enrolledCourses && Array.isArray(enrolledCourses)) {
      return enrolledCourses.some((enrolled) => enrolled.id === course.id);
    }
    return false;
  };

  // Handle enrollment button
  const handleEnrollClick = (course) => {
    if (!auth.isLoggedIn) {
      dispatch(setEnrollmentIntent({ 
        courseId: course.id, 
        courseTitle: course.title 
      }));
      setAuthModalOpen(true);
      return;
    }
    // Navigate to courses for full enrollment flow if logged in
    navigate(`/courses/${course.id}`);
  };

  // Handle unenrollment
  const handleUnenrollCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to unenroll from "${courseTitle}"?`)) return;
    try {
      await dispatch(unenrollFromCourse(courseId)).unwrap();
      toastManager.success(`Unenrolled from ${courseTitle}`);
      dispatch(fetchAllCourses());
      dispatch(fetchStudentDashboard());
    } catch (error) {
      showApiError(error);
    }
  };

  // Filter courses based on search term
  const filteredCourses = useMemo(() => 
    courses?.filter(
      (course) =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof course.category === "string" ? course.category : course.category?.name ?? "")?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [], [courses, searchTerm]);

  // Separate enrolled and non-enrolled courses for logged-in students
  const enrolledList = useMemo(() => 
    auth.role === "student"
      ? filteredCourses.filter((course) => isCourseEnrolled(course))
      : [], [filteredCourses, auth.role]);

  const availableCourses = useMemo(() => 
    auth.role === "student"
      ? filteredCourses.filter((course) => !isCourseEnrolled(course))
      : filteredCourses, [filteredCourses, auth.role]);

  return (
    <main
      id="public-home"
      className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden"
    >
      {/* Aurora Background Tints */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-[20%] right-[5%] w-[40%] h-[40%] bg-teal-600/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 md:pt-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-indigo-400 mb-8 animate-fadeIn">
          <i className="fas fa-sparkles"></i>
          Next-Gen Learning Experience
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-poppins mb-8 leading-[1.05] tracking-tight">
          Master Any Subject, <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-blue-400 to-teal-400">
            From Anywhere.
          </span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-5 justify-center mt-12">
          <button
            onClick={() => navigate("/courses")}
            className="group flex items-center justify-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-4xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-2xl shadow-white/10"
          >
            Explore Courses
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition"></i>
          </button>
          <button
            onClick={() => navigate("/teachers")}
            className="group flex items-center justify-center gap-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-4xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-xl"
          >
            Meet Our Tutors
            <i className="fas fa-user-graduate group-hover:rotate-12 transition"></i>
          </button>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
        {/* Enrolled Courses Section - Only for logged-in students */}
        {auth.isLoggedIn &&
          auth.role === "student" &&
          enrolledList.length > 0 && (
            <div className="mb-24">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-500 mb-2">
                    Continuity
                  </p>
                  <h2 className="text-3xl md:text-4xl font-black font-poppins tracking-tight">
                    Your Learning Journey
                  </h2>
                </div>
                <button
                  onClick={() => navigate("/student")}
                  className="text-green-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition flex items-center gap-3 border-b border-green-500/20 pb-1"
                >
                  Dashboard <i className="fas fa-arrow-right text-[8px]"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrolledList.slice(0, 3).map((course, i) => (
                  <PublicCourseCard
                    key={course.id}
                    course={course}
                    index={i}
                    enrolled={true}
                    onEnroll={handleEnrollClick}
                    onUnenroll={handleUnenrollCourse}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Available Courses Section */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2">
              Discovery
            </p>
            <h2 className="text-3xl md:text-5xl font-black font-poppins tracking-tight">
              {auth.isLoggedIn && auth.role === "student"
                ? "Available Courses"
                : "Trending Skills"}
            </h2>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="hidden md:flex text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition items-center gap-3 border-b border-indigo-500/20 pb-1"
          >
            View full Courses <i className="fas fa-arrow-right text-[8px]"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {coursesLoading && courses.length === 0
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#1a2235]/60 rounded-[2rem] overflow-hidden animate-pulse border border-white/5 aspect-[4/5]" />
              ))
            : availableCourses.slice(0, 4).map((course, i) => (
              <PublicCourseCard
                key={course.id}
                course={course}
                index={i}
                enrolled={false}
                isEnrolling={enrollingCourseIds.includes(course.id)}
                onEnroll={handleEnrollClick}
                onUnenroll={handleUnenrollCourse}
              />
          ))
          }
        </div>
      </section>

      {/* Footer Teaser */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 pb-12 pt-10 text-center border-t border-white/5">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} VirtualCitySchool Ecosystem
        </p>
      </footer>

      <AuthRequiredModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        message="Create an account or log in to start your journey with this course and access all features."
      />
    </main>
  );
};

export default PublicHome;
