import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchAllCourses } from "../../store/slices/coursesSlice";
import { useEffect, useState, useMemo } from "react";
import { setAuthModal, setEnrollmentIntent } from "../../store/slices/uiSlice";
import { fetchStudentDashboard, unenrollFromCourse } from "../../store/slices/studentDashboardSlice";
import { fetchTeachers } from "../../store/slices/teacherSlice";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import HireTutorModal from "../../components/public/HireTutorModal";
import PublicCourseCard from "../../components/courses/PublicCourseCard";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";

const PublicHome = () => {
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [hireModal, setHireModal] = useState(null);

  const { courses, isLoading: coursesLoading } = useSelector((state) => state.courses);
  const { enrolledCourses, enrollingCourseIds } = useSelector((state) => state.studentDashboard);
  const { enrollmentIntent } = useSelector((state) => state.ui);
  const { teachers, loading: teachersLoading } = useSelector((state) => state.teachers);

  useEffect(() => {
    if (courses.length <= 0) {
      dispatch(fetchAllCourses());
    }
    if (teachers.length <= 0) {
      dispatch(fetchTeachers({}));
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
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-left animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-8">
              Prestige & Technology
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-poppins mb-6 leading-[1.1] tracking-tight text-white">
              Master the Future <br className="hidden md:block" />
              at our <span className="text-cyan-400">Digital Campus</span>
            </h1>
            
            <p className="text-slate-400 text-base md:text-lg max-w-lg leading-relaxed mb-10">
              Experience a high-performance intellectual environment where cutting-edge technology meets traditional academic excellence. Unlimited discovery starts here.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/courses")}
                className="group px-8 py-4 bg-indigo-200 text-indigo-950 rounded-xl font-bold text-sm tracking-wide transition-all hover:scale-105 shadow-xl shadow-indigo-500/10 flex items-center gap-2"
              >
                Explore Courses
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition text-xs"></i>
              </button>
              <button
                onClick={() => navigate("/teachers")}
                className="group px-8 py-4 border border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 text-white rounded-xl font-bold text-sm tracking-wide transition-all hover:scale-105 flex items-center gap-2"
              >
                Meet Our Tutors
                <i className="fas fa-user-graduate group-hover:rotate-12 transition text-xs"></i>
              </button>
            </div>
          </div>

          {/* Right Visual (Placeholder as requested) */}
          <div className="relative group perspective-1000">
            {/* Main Visual Container */}
            <div className="relative z-10 rounded-[2.5rem] border border-cyan-500/30 overflow-hidden bg-slate-900/40 backdrop-blur-3xl aspect-[1.4/1] shadow-2xl shadow-cyan-500/10 group-hover:border-cyan-400/50 transition-all duration-500">
              <img 
                src="/assets/hero.png" 
                alt="Digital Campus" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              {/* Inner subtle glow effect */}
              <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/10 to-transparent pointer-events-none" />
            </div>

            {/* Floating Stat Card */}
            <div className="absolute -bottom-6 -left-6 z-20 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl animate-float">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <i className="fas fa-bolt text-cyan-400 text-sm" />
                </div>
                <div>
                  <p className="text-2xl font-black text-white leading-none mb-1">98%</p>
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold max-w-[120px] leading-tight">
                    Completion rate in advanced AI tracks
                  </p>
                </div>
              </div>
            </div>

            {/* Background Decorative Glow */}
            <div className="absolute -inset-4 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none -z-10" />
          </div>
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

        {/* Your Journey to Mastery Section */}
        <div className="mt-32 md:mt-48">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Journey Image */}
            <div className="relative group">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                <img 
                  src="/assets/journey.png" 
                  alt="Learning Journey" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
            </div>

            {/* Right: Steps */}
            <div className="space-y-12">
              <h2 className="text-4xl md:text-5xl font-black font-poppins tracking-tight text-white mb-4">
                Your Journey to Mastery
              </h2>

              <div className="space-y-10">
                {/* Step 1 */}
                <div className="flex gap-6 group">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 font-black text-lg transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Identify Your Node</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      Choose from hundreds of specialized knowledge paths or take our aptitude assessment to build a custom roadmap.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-6 group">
                  <div className="w-12 h-12 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 font-black text-lg transition-all group-hover:bg-cyan-600 group-hover:text-white group-hover:scale-110">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Immersive Engagement</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      Access the 'Lecture Glass' for interactive video content, collaborative projects, and live coding sessions.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-6 group">
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center shrink-0 text-slate-300 font-black text-lg transition-all group-hover:bg-white group-hover:text-slate-900 group-hover:scale-110">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Validation & Certification</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      Complete rigorous peer-reviewed assessments and secure blockchain-verified credentials for your portfolio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expert Tutors Section */}
        <div className="mt-32 md:mt-48 pb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-poppins tracking-tight text-white mb-4">
              Expert Tutors at Your Fingertips
            </h2>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
              1-on-1 personalized mentorship from ivy-league professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachersLoading && teachers.length === 0
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-[#1a2235]/60 rounded-[2.5rem] p-8 animate-pulse border border-white/5 h-[320px]" />
                ))
              : teachers.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="group bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[1.5rem] p-8 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 text-center"
                  >
                    {/* Avatar */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute -inset-1 bg-linear-to-tr from-indigo-500 to-cyan-400 rounded-full blur-[2px] opacity-70 group-hover:opacity-100 transition duration-300" />
                      <div className="relative w-full h-full rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800 flex items-center justify-center">
                        {t.avatar ? (
                          <img src={t.avatar} alt={t.teacher_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-indigo-400">
                            {t.teacher_name?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 truncate">{t.teacher_name}</h3>
                    <p className="text-xs text-cyan-400 font-medium mb-4 tracking-wide truncate">{t.expertise || "Tutor"}</p>
                    
                    <button
                      onClick={() => setHireModal(t)}
                      className="w-full py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-slate-950 hover:border-white active:scale-95"
                    >
                      Hire Tutor
                    </button>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {hireModal && (
        <HireTutorModal teacher={hireModal} onClose={() => setHireModal(null)} />
      )}


      <AuthRequiredModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        message="Create an account or log in to start your journey with this course and access all features."
      />
    </main>
  );
};

export default PublicHome;
