import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeachers } from "../../store/slices/teacherSlice";
import { setAuthModal } from "../../store/slices/uiSlice";
import { SearchInput } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import HireTutorModal from "../../components/public/HireTutorModal";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import { getStorageUrl } from "../../utils/storageUrl";

const HIRE_INTENT_KEY = "vcs_hire_intent";

const TeachersDirectory = () => {
  const [hasFetched, setHasFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hireModal, setHireModal] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const { isAuthenticated, isStudent } = useAuth();

  const dispatch = useDispatch();
  const { teachers, loading, error } = useSelector((state) => state.teachers);

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

  return (
    <section id="teachers-view" className="bg-slate-950 text-white font-inter animate-fadeIn">
      {hireModal && (
        <HireTutorModal teacher={hireModal} onClose={() => setHireModal(null)} />
      )}
      <div className="relative overflow-hidden border-b border-slate-800/50 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-6 py-5 relative z-10">
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-black font-poppins leading-tight tracking-tight animate-scaleIn">
              Find your <span className="text-indigo-500">Tutor</span>
            </h1>
          </div>
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-16">
        <div>
          {loading ? (
            // Loader
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {teachers.map((teacher, index) => (
                <div
                  key={teacher.id}
                  style={{ animationDelay: `${0.1 + index * 0.07}s` }}
                  onClick={() => navigate(`/teachers/${teacher.id}`)}
                  className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:border-slate-600 hover:shadow-lg cursor-pointer animate-springyReveal opacity-0"
                >
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full shrink-0 overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {teacher.avatar ? (
                        <img src={getStorageUrl(teacher.avatar)} alt={teacher.teacher_name} className="w-full h-full object-cover" />
                      ) : (
                        teacher.teacher_name?.[0]?.toUpperCase() || "T"
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">
                        {teacher.teacher_name || "Unnamed Tutor"}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {teacher.expertise || "General Tutor"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <i className="fas fa-briefcase text-[9px]" />
                        {teacher.experience ?? 0} yrs experience
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-800" />

                  {/* Courses */}
                  <div className="flex-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Courses</p>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.courses?.length ? (
                        <>
                          {teacher.courses.slice(0, 2).map((course) => (
                            <span key={course.id} className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium truncate max-w-full">
                              {course.course_name}
                            </span>
                          ))}
                          {teacher.courses.length > 2 && (
                            <span className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 font-medium">
                              +{teacher.courses.length - 2} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-600">No courses yet</span>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-2 mt-auto">
                    {isAuthenticated && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/teachers/${teacher.id}`); }}
                        className="w-full py-2.5 rounded-xl border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-indigo-400 font-bold text-xs tracking-wide transition-all"
                      >
                        View Profile
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleHireClick(teacher); }}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide transition-all shadow-sm"
                    >
                      Hire Tutor
                    </button>
                  </div>
                </div>
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

