import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeachers } from "../../store/slices/teacherSlice";
import { setAuthModal } from "../../store/slices/uiSlice";
import { SearchInput } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import HireTutorModal from "../../components/public/HireTutorModal";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import TutorCard from "../../components/teachers/TutorCard";
import { useSeo } from "../../hooks/useSeo";
import { SUBJECT_THEMES, SUBJECT_CATEGORY_LIST, getTeacherCategory } from "../../utils/subjectTheme";

const HIRE_INTENT_KEY = "vcs_hire_intent";

const TeachersDirectory = () => {
  const [hasFetched, setHasFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [hireModal, setHireModal] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const { isAuthenticated, isStudent } = useAuth();

  const dispatch = useDispatch();
  const { teachers, loading, error } = useSelector((state) => state.teachers);

  const teachersWithCategory = useMemo(
    () => teachers.map((t) => ({ teacher: t, category: getTeacherCategory(t) })),
    [teachers],
  );

  const visibleTeachers = useMemo(
    () =>
      activeCategory === "all"
        ? teachers
        : teachersWithCategory.filter((t) => t.category === activeCategory).map((t) => t.teacher),
    [teachers, teachersWithCategory, activeCategory],
  );

  const stats = useMemo(() => {
    const subjectSet = new Set();
    let expCount = 0;
    let expSum = 0;
    teachers.forEach((t) => {
      (t.courses || []).forEach((c) => c.course_name && subjectSet.add(c.course_name));
      if (Number.isFinite(t.experience)) {
        expCount += 1;
        expSum += t.experience;
      }
    });
    return {
      tutorCount: teachers.length,
      subjectCount: subjectSet.size,
      avgExperience: expCount ? Math.round((expSum / expCount) * 10) / 10 : 0,
    };
  }, [teachers]);

  const handleHireClick = (teacher) => {
    if (!isAuthenticated) {
      sessionStorage.setItem(HIRE_INTENT_KEY, String(teacher.id));
      setShowAuthModal(true);
      return;
    }
    if (isStudent) {
      navigate(`/teachers/${teacher.id}`, { state: { openSlots: true } });
      return;
    }
    setHireModal(teacher);
  };

  useEffect(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const timer = setTimeout(async () => {
      const query = searchQuery.trim();

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        if (!query) {
          // Only fetch if we don't already have teachers data
          if (teachers.length <= 0) {
            await dispatch(fetchTeachers({}));
            console.log("Fetched teachers when no teacher search:", teachers);
          }
          setHasFetched(true);
          return;
        }
        const result = await dispatch(fetchTeachers({ teacher: query }));
        console.log("Teacher search result:", result);
        const data = result.payload;

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (!data || data.length === 0) {
          // Only fetch by course if the teacher search returned no results
          // and the request wasn't aborted
          await dispatch(fetchTeachers({ course: query }));
          // console.log("Teachers:", );
          
        }

        setHasFetched(true);
      } catch (error) {
        // Ignore AbortError when request is cancelled
        if (error.name !== "AbortError") {
          console.error("Search error:", error);
          setHasFetched(true);
        }
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dispatch, searchQuery]);

  useSeo({
      title: "Meet Our Tutors - Cambridge Teachers Online",
      description: "Meet Virtual City School's expert Cambridge tutors - qualified teachers for O Level, A Level, IGCSE and more, teaching live online across the UAE, Saudi Arabia, Qatar and Pakistan.",
      url: typeof window !== "undefined" ? window.location.href : undefined,
  });
  
  return (
    <section id="teachers-view" className="bg-slate-950 text-white font-inter animate-fadeIn">
      {hireModal && (
        <HireTutorModal teacher={hireModal} onClose={() => setHireModal(null)} />
      )}
      <div className="relative overflow-hidden border-b border-slate-800/50 animate-fadeIn">
        <div className="absolute top-[-60%] left-1/2 -translate-x-1/2 w-[70%] h-[160%] bg-cyan-600/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
          <div className="text-center mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-2 animate-fadeInUp">
              Mentorship
            </p>
            <h1 className="text-2xl md:text-4xl font-black font-poppins leading-tight tracking-tight animate-fadeInUp" style={{ animationDelay: "0.08s" }}>
              Find your <span className="text-gradient">Tutor</span>
            </h1>
          </div>

          {!loading && !error && stats.tutorCount > 0 && (
            <div className="flex justify-center gap-8 sm:gap-14 mb-5 animate-fadeInUp" style={{ animationDelay: "0.09s" }}>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black font-poppins text-indigo-300 tabular-nums">{stats.tutorCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-0.5">Tutors</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black font-poppins text-purple-300 tabular-nums">{stats.subjectCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-0.5">Subjects</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black font-poppins text-amber-300 tabular-nums">{stats.avgExperience}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-0.5">Avg. yrs experience</p>
              </div>
            </div>
          )}

          <div className="max-w-xl mx-auto animate-springyReveal" style={{ animationDelay: '0.1s' }}>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              placeholder="Search tutors or courses..."
              className="w-full"
              inputClassName="h-10 text-xs sm:text-sm"
            />
          </div>

          {!loading && !error && teachers.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-5 animate-fadeInUp" style={{ animationDelay: "0.12s" }}>
              <button
                onClick={() => setActiveCategory("all")}
                className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                  activeCategory === "all"
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-500 border-transparent text-white"
                    : "border-slate-700 text-white hover:border-slate-500"
                }`}
              >
                All Tutors
              </button>
              {SUBJECT_CATEGORY_LIST.map((key) => {
                const theme = SUBJECT_THEMES[key];
                const active = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(active ? "all" : key)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                      active ? theme.chipActive : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${theme.chipSwatch}`} />
                    {theme.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-16">
        <div>
          {loading ? (
            // Loader
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-slate-900 border border-slate-800 rounded-3xl p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-800 rounded w-2/3" />
                      <div className="h-2 bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                No teachers found matching your search.
              </p>
            </div>
          ) : visibleTeachers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                No tutors in this subject yet — try another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {visibleTeachers.map((teacher, index) => (
                <TutorCard
                  key={teacher.id}
                  teacher={teacher}
                  index={index}
                  isAuthenticated={isAuthenticated}
                  onViewProfile={(id) => navigate(`/teachers/${id}`)}
                  onHire={handleHireClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login Required"
        message="Please log in or create a student account to book a tutoring slot with this tutor."
      />
    </section>
  );
};

export default TeachersDirectory;

