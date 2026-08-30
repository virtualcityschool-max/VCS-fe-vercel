import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchAllCourses } from "../../store/slices/coursesSlice";
import { useEffect, useState, useMemo } from "react";
import { setAuthModal, setEnrollmentIntent } from "../../store/slices/uiSlice";
import { fetchStudentDashboard, unenrollFromCourse, withdrawEnrollment } from "../../store/slices/studentDashboardSlice";
import { fetchTeachers } from "../../store/slices/teacherSlice";
import { fetchBlogs } from "../../store/slices/blogsSlice";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import HireTutorModal from "../../components/public/HireTutorModal";
import ApplyFreeAccessModal from "../../components/public/ApplyFreeAccessModal";
import PublicCourseCard from "../../components/courses/PublicCourseCard";
import TutorCard from "../../components/teachers/TutorCard";
import BlogCard from "../../components/blogs/BlogCard";
import FivePillarsSection from "../../components/public/FivePillarsSection";
import GlobalReachSection from "../../components/public/GlobalReachSection"; import FaqSection, { FAQ_ITEMS } from "../../components/public/FaqSection";
import Reveal from "../../components/ui/Reveal";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { getStorageUrl } from "../../utils/storageUrl";
import { useSeo } from "../../hooks/useSeo";

const TESTIMONIALS = [
  {
    quote:
      "Ngl, live classes here actually hit different. Teachers explain it properly and still reply after class ends. Went from hating Physics to lowkey enjoying it.",
    name: "Zainab R.",
    role: "O Level Student, Dubai",
  },
  {
    quote:
      "Study from anywhere, still stay on track. Teachers know the exam stuff inside out, no cap. Flexibility is everything tbh.",
    name: "Hamza A.",
    role: "AS Level Student, Riyadh",
  },
  {
    quote:
      "Distance isn't an issue here. Classes are interactive, students actually show up motivated. Teaching across the Gulf and Pakistan? Love it.",
    name: "Ms. Sana Malik",
    role: "Cambridge O Level Faculty",
  },
  {
    quote:
      "Good communication, schedule that works for us, real progress in my daughter's grades. That's all I need as a parent.",
    name: "Imran H.",
    role: "Parent, Doha",
  },
];

const PublicHome = () => {
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [hireModal, setHireModal] = useState(null);
  const [freeAccessOpen, setFreeAccessOpen] = useState(false);
  const [freeAccessPreselect, setFreeAccessPreselect] = useState([]);
  const [pendingEnrollCourseId, setPendingEnrollCourseId] = useState(null);

  const openFreeAccess = (courseIds = []) => {
    setFreeAccessPreselect(courseIds);
    setFreeAccessOpen(true);
  };
  const [withdrawConfirm, setWithdrawConfirm] = useState({ open: false, courseId: null, courseTitle: "" });
  const [unenrollConfirm, setUnenrollConfirm] = useState({ open: false, courseId: null, courseTitle: "" });

  const { courses, isLoading: coursesLoading } = useSelector((state) => state.courses);
  const { enrolledCourses, enrollingCourseIds, withdrawingCourseIds, unenrollingCourseIds } = useSelector((state) => state.studentDashboard);
  const { enrollmentIntent } = useSelector((state) => state.ui);
  const { teachers, loading: teachersLoading } = useSelector((state) => state.teachers);
  const { blogs, isLoading: blogsLoading } = useSelector((state) => state.blogs);
  const articleBlogs = useMemo(
    () => blogs.filter((b) => (b.post_type || "article") === "article"),
    [blogs],
  );
  const videoBlogs = useMemo(
    () => blogs.filter((b) => b.post_type === "video"),
    [blogs],
  );

  useEffect(() => {
    if (courses.length <= 0) {
      dispatch(fetchAllCourses());
    }
    if (teachers.length <= 0) {
      dispatch(fetchTeachers({}));
    }
    if (blogs.length <= 0) {
      dispatch(fetchBlogs({ ordering: "-published_at" }));
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
      setPendingEnrollCourseId(course.id);
      setAuthModalOpen(true);
      return;
    }
    // Navigate to courses for full enrollment flow if logged in
    navigate(`/courses/${course.id}`);
  };

  // Handle unenrollment
  const handleUnenrollCourse = (courseId, courseTitle) => {
    setUnenrollConfirm({ open: true, courseId, courseTitle });
  };

  const confirmUnenrollCourse = async () => {
    const { courseId, courseTitle } = unenrollConfirm;
    setUnenrollConfirm({ open: false, courseId: null, courseTitle: "" });
    try {
      await dispatch(unenrollFromCourse(courseId)).unwrap();
      toastManager.success(`Unenrolled from ${courseTitle}`);
      dispatch(fetchAllCourses());
      dispatch(fetchStudentDashboard());
    } catch (error) {
      showApiError(error);
    }
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

  useSeo({
      title: "Online Cambridge O & A Level School",
      description: "Online Cambridge O Level and A Level classes based in Saudi Arabia, serving students across the UAE, Qatar, Kuwait, Bahrain, Oman, Pakistan and beyond.",
      url: typeof window !== "undefined" ? window.location.href : undefined,
      jsonLd: {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
                    "@type": "Question",
                    name: item.q,
                    acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
      },
  });
  
  return (
    <main
      id="public-home"
      className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden"
>
      {/* Aurora Background Tints */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }}></div>
        <div className="absolute top-[20%] right-[5%] w-[40%] h-[40%] bg-teal-600/5 blur-[100px] rounded-full animate-aurora" style={{ animationDelay: "-12s" }}></div>
      </div>

      {/* Subtle grid backdrop over the hero */}
      <div className="absolute inset-x-0 top-0 h-[720px] bg-grid pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-[1440px] mx-auto px-6 pt-10 md:pt-20">
        {/* Row 1: Heading + Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-14">
          {/* Left: Badge + Heading */}
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-8 animate-fadeInUp">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Gulf's Premier Online School
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-poppins leading-[1.08] tracking-tight text-white animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              Online <span className="text-gradient">Cambridge O Level and A Level</span> School for the UAE, Saudi Arabia, Qatar and beyond
            </h1>
            <p className="italic text-slate-400 text-sm md:text-base mt-3 animate-fadeInUp" style={{ animationDelay: "0.15s" }}>
              "Your borderless digital classroom starts here."
            </p>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed mt-6 max-w-xl animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              A premium online learning platform for Cambridge students. Cambridge O Level, AS Level, and A2 Level programmes alongside Grade 5-12 curricula, with expert teachers and live classes, across the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Pakistan and beyond — open to students of all nationalities worldwide.
            </p>

            <div className="flex flex-wrap gap-4 mt-9 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={() => navigate("/courses")}
                className="group btn-glow px-8 py-4 text-white rounded-xl font-bold text-sm tracking-wide flex items-center gap-2.5"
              >
                Explore Courses
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition text-xs"></i>
              </button>
              <button
                onClick={() => navigate("/teachers")}
                className="group px-8 py-4 border border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 text-white rounded-xl font-bold text-sm tracking-wide transition-all hover:-translate-y-0.5 flex items-center gap-2.5"
              >
                Meet Our Tutors
                <i className="fas fa-user-graduate group-hover:rotate-12 transition text-xs"></i>
              </button>
            </div>

            {/* Subtle scholarship entry - visible without scrolling */}
            <button
              onClick={() => openFreeAccess()}
              className="group mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition animate-fadeInUp"
              style={{ animationDelay: "0.4s" }}
            >
              <i className="fas fa-hand-holding-heart text-indigo-400"></i>
              <span>
                <span className="font-semibold text-indigo-300 group-hover:text-indigo-200 underline decoration-indigo-500/40 underline-offset-4">
                  Apply for free access
                </span>
              </span>
            </button>
            <p className="mt-6 text-sm text-slate-400 animate-fadeInUp" style={{ animationDelay: "0.45s" }}>
              <span className="text-cyan-400 font-extrabold text-base">125</span> students &middot; <span className="text-cyan-400 font-extrabold text-base">13</span> countries served &middot; <span className="text-cyan-400 font-extrabold text-base">Launched</span> July 2026
            </p>
          </div>

          {/* Right: Image */}
          <div className="relative group perspective-1000 w-full max-w-md lg:ml-auto animate-fadeInRight" style={{ animationDelay: "0.25s" }}>
            <div className="relative z-10 rounded-[2.5rem] border border-cyan-500/30 overflow-hidden bg-slate-900/40 backdrop-blur-3xl aspect-[1.4/1] shadow-2xl shadow-cyan-500/10 group-hover:border-cyan-400/50 transition-all duration-500">
              <img
                src="/assets/digital-learning.jpg"
                alt="Student attending a live online Cambridge class with Virtual City School"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/10 to-transparent pointer-events-none" />
            </div>
            <div className="absolute -inset-4 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none -z-10" />
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-[1440px] mx-auto px-6 py-20 md:py-32">
        <FivePillarsSection />
        {/* Enrolled Courses Section - Only for logged-in students */}
        {auth.isLoggedIn &&
          auth.role === "student" &&
          enrolledList.length > 0 && (
            <div className="mb-24">
              <Reveal className="flex justify-between items-end mb-10">
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
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {enrolledList.slice(0, 3).map((course, i) => (
                  <PublicCourseCard
                    key={course.id}
                    course={course}
                    index={i}
                    enrolled={true}
                    onEnroll={handleEnrollClick}
                    onUnenroll={handleUnenrollCourse}
                    variant="large"
                  />
                ))}
              </div>
            </div>
          )}

        {/* Available Courses Section */}
        <Reveal className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2">
              Discovery
            </p>
            <h2 className="text-3xl md:text-5xl font-black font-poppins tracking-tight">
              {auth.isLoggedIn && auth.role === "student"
                ? "Available Courses"
                : "Trending Courses"}
            </h2>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="hidden md:flex text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition items-center gap-3 border-b border-indigo-500/20 pb-1"
          >
            View All Courses <i className="fas fa-arrow-right text-[8px]"></i>
          </button>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {coursesLoading && courses.length === 0
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="skeleton rounded-2xl overflow-hidden border border-white/5 aspect-[4/5]" />
              ))
            : availableCourses.slice(0, 4).map((course, i) => (
              <PublicCourseCard
                key={course.id}
                course={course}
                index={i}
                enrolled={false}
                isEnrolling={enrollingCourseIds.includes(course.id)}
                isWithdrawing={withdrawingCourseIds.includes(course.id)}
                onEnroll={handleEnrollClick}
                onUnenroll={handleUnenrollCourse}
                onWithdraw={handleWithdrawEnrollment}
                variant="large"
              />
          ))
          }
        </div>

        {/* Free Access - scholarship entry point (compact, under the courses) */}
        <Reveal className="mt-14">
          <div className="group relative overflow-hidden rounded-2xl border border-indigo-500/15 bg-white/[0.03] backdrop-blur-xl px-6 py-5 sm:px-8 sm:py-6 transition-colors duration-300 hover:border-indigo-500/30">
            {/* ambient glow */}
            <div className="pointer-events-none absolute -right-12 -top-12 w-44 h-44 rounded-full bg-indigo-500/20 blur-3xl transition-opacity duration-500 group-hover:bg-indigo-500/30" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <span className="icon-chip shrink-0">
                  <i className="fas fa-hand-holding-heart text-indigo-400"></i>
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-400 mb-1.5">
                    Financial Aid
                  </p>
                  <h3 className="text-lg sm:text-xl font-black font-poppins tracking-tight text-white">
                    Apply for Free Access to a course
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md leading-relaxed">
                    Request free access, our team reviews your request and approved
                    courses are added to your account at no cost.
                  </p>
                </div>
              </div>
              <button
                onClick={() => openFreeAccess()}
                className="btn-glow shrink-0 inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-white font-bold text-sm whitespace-nowrap"
              >
                <i className="fas fa-hand-holding-heart"></i>
                Apply for Free Access
              </button>
            </div>
          </div>
        </Reveal>

        {/* Your Journey to Mastery Section */}
        <div className="mt-32 md:mt-48">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Journey Image */}
            <Reveal className="relative group">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                <img
                  src="/assets/journey.jpg"
                  alt="Cambridge-qualified teacher leading a small-group online class with Virtual City School"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
            </Reveal>

            {/* Right: Steps */}
            <div className="space-y-12">
              <Reveal as="h2" className="text-4xl md:text-5xl font-black font-poppins tracking-tight text-white mb-4">
                Your Journey to Mastery
              </Reveal>

              <div className="space-y-10 relative">
                {/* Connector line between steps */}
                <div className="absolute left-6 top-14 bottom-14 w-px bg-gradient-to-b from-indigo-500/30 via-cyan-500/30 to-slate-700/30 pointer-events-none hidden sm:block" />

                {/* Step 1 */}
                <Reveal delay={0} className="flex gap-6 group relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 font-black text-lg transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 relative z-10 bg-slate-950">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Identify Your Node</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      Choose from hundreds of specialized knowledge paths or take our aptitude assessment to build a custom roadmap.
                    </p>
                  </div>
                </Reveal>

                {/* Step 2 */}
                <Reveal delay={120} className="flex gap-6 group relative">
                  <div className="w-12 h-12 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 font-black text-lg transition-all group-hover:bg-cyan-600 group-hover:text-white group-hover:scale-110 relative z-10 bg-slate-950">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Immersive Engagement</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      Access the 'Lecture Glass' for interactive video content, collaborative projects, and live coding sessions.
                    </p>
                  </div>
                </Reveal>

                {/* Step 3 */}
                <Reveal delay={240} className="flex gap-6 group relative">
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center shrink-0 text-slate-300 font-black text-lg transition-all group-hover:bg-white group-hover:text-slate-900 group-hover:scale-110 relative z-10 bg-slate-950">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Validation & Certification</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      Complete rigorous peer-reviewed assessments and secure blockchain-verified credentials for your portfolio.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>

        {/* Expert Tutors Section */}
        <div className="mt-32 md:mt-48 pb-20">
          <Reveal className="flex justify-between items-end mb-16">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 mb-2">
                Mentorship
              </p>
              <h2 className="text-3xl md:text-5xl font-black font-poppins tracking-tight text-white">
                Expert Tutors at Your Fingertips
              </h2>
            </div>
            <button
              onClick={() => navigate("/teachers")}
              className="hidden md:flex text-cyan-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition items-center gap-3 border-b border-cyan-500/20 pb-1"
            >
              View All Tutors <i className="fas fa-arrow-right text-[8px]"></i>
            </button>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teachersLoading && teachers.length === 0
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton rounded-[2.5rem] p-8 border border-white/5 h-[320px]" />
                ))
              : teachers.slice(0, 4).map((t, i) => (
                  <TutorCard
                    key={t.id}
                    teacher={t}
                    index={i}
                    isAuthenticated={auth.isLoggedIn}
                    onViewProfile={(id) => navigate(`/teachers/${id}`)}
                    onHire={(teacher) => {
                      if (!auth.isLoggedIn) {
                        dispatch(setAuthModal({ type: "login", intendedRole: "student" }));
                        return;
                      }
                      if (auth.role === "student") {
                        navigate(`/teachers/${teacher.id}`);
                        return;
                      }
                      setHireModal(teacher);
                    }}
                  />
                ))}
          </div>
        </div>

        {/* From the Blog Section - articles and vlogs kept separate so a "Latest
            from Our Blog" reader isn't surprised by a video, and vice versa */}
        {(blogsLoading || articleBlogs.length > 0) && (
          <div className="mt-32 md:mt-48 pb-4">
            <Reveal className="flex justify-between items-end mb-16">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2">
                  The Journal
                </p>
                <h2 className="text-3xl md:text-5xl font-black font-poppins tracking-tight text-white">
                  Latest from Our Blog
                </h2>
              </div>
              <button
                onClick={() => navigate("/blogs?type=article")}
                className="hidden md:flex text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition items-center gap-3 border-b border-indigo-500/20 pb-1"
              >
                View All Articles <i className="fas fa-arrow-right text-[8px]"></i>
              </button>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogsLoading && articleBlogs.length === 0
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton rounded-2xl border border-white/5 h-[380px]" />
                  ))
                : articleBlogs.slice(0, 3).map((blog, i) => (
                    <BlogCard key={blog.id} blog={blog} index={i} />
                  ))}
            </div>

            <div className="mt-10 flex justify-center md:hidden">
              <button
                onClick={() => navigate("/blogs?type=article")}
                className="btn-glow px-7 py-3.5 text-white rounded-xl font-bold text-sm flex items-center gap-2.5"
              >
                View All Articles <i className="fas fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        )}

        {/* Latest Vlogs - only appears once a video post actually exists */}
        {(blogsLoading || videoBlogs.length > 0) && (
          <div className="mt-32 md:mt-48 pb-4">
            <Reveal className="flex justify-between items-end mb-16">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400 mb-2">
                  Watch &amp; Learn
                </p>
                <h2 className="text-3xl md:text-5xl font-black font-poppins tracking-tight text-white">
                  Latest Vlogs
                </h2>
              </div>
              <button
                onClick={() => navigate("/blogs?type=video")}
                className="hidden md:flex text-rose-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition items-center gap-3 border-b border-rose-400/20 pb-1"
              >
                View All Vlogs <i className="fas fa-arrow-right text-[8px]"></i>
              </button>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogsLoading && videoBlogs.length === 0
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton rounded-2xl border border-white/5 h-[380px]" />
                  ))
                : videoBlogs.slice(0, 3).map((blog, i) => (
                    <BlogCard key={blog.id} blog={blog} index={i} />
                  ))}
            </div>

            <div className="mt-10 flex justify-center md:hidden">
              <button
                onClick={() => navigate("/blogs?type=video")}
                className="btn-glow px-7 py-3.5 text-white rounded-xl font-bold text-sm flex items-center gap-2.5"
              >
                View All Vlogs <i className="fas fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        )}
        {/* Testimonials Section */}
        <div className="mt-32 md:mt-48 pb-20">
          <Reveal className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">
              Real Voices
            </p>
            <h2 className="text-3xl md:text-5xl font-black font-poppins tracking-tight text-white">
              What Our Community Says
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-[#1a2235]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-7 h-full flex flex-col glass-shine hover-lift"
              >
                <i className="fas fa-quote-left text-blue-500/30 text-2xl mb-4"></i>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 pt-5 border-t border-white/5">
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <GlobalReachSection /> <FaqSection />

      </section>

      {hireModal && (
        <HireTutorModal teacher={hireModal} onClose={() => setHireModal(null)} />
      )}

      {freeAccessOpen && (
        <ApplyFreeAccessModal
          preselectedCourseIds={freeAccessPreselect}
          onClose={() => {
            setFreeAccessOpen(false);
            setFreeAccessPreselect([]);
          }}
        />
      )}


      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        message="Create an account or log in to start your journey with this course and access all features."
        onApplyFreeAccess={() =>
          openFreeAccess(pendingEnrollCourseId ? [pendingEnrollCourseId] : [])
        }
      />

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
    </main>
  );
};

export default PublicHome;
