import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeachers } from "../../store/slices/teacherSlice";
import { SearchInput } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import HireTutorModal from "../../components/public/HireTutorModal";

const TeachersDirectory = () => {
  const [hasFetched, setHasFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hireModal, setHireModal] = useState(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const { isAuthenticated } = useAuth();

  const dispatch = useDispatch();
  const { teachers, loading, error } = useSelector((state) => state.teachers);

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
    <section id="teachers-view" className="bg-slate-950 text-white font-inter">
      {hireModal && (
        <HireTutorModal teacher={hireModal} onClose={() => setHireModal(null)} />
      )}
      <div className="relative overflow-hidden border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-5 relative z-10">
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-black font-poppins leading-tight tracking-tight">
              Find your <span className="text-indigo-500">Mentor</span>
            </h1>
          </div>
          <div className="max-w-xl mx-auto">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              placeholder="Search teachers or courses..."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="group relative bg-gradient-to-b from-slate-900/80 to-slate-900 border border-slate-800 rounded-3xl p-5 transition-all duration-300 ease-out hover:border-indigo-500/40 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.35)] hover:-translate-y-[2px] flex flex-col"
                >
                  {/* Hover glow overlay */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none bg-indigo-500/4" />

                  {/* Top */}
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-base shadow-md transition-transform duration-300 group-hover:scale-105 shrink-0">
                      {teacher.teacher_name?.[0]?.toUpperCase() || "T"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white truncate">
                        {teacher.teacher_name || "Unnamed teacher"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {teacher.expertise || "No expertise specified"}
                      </p>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="mb-4 relative z-10">
                    <span className="text-xs text-slate-400">
                      <i className="fas fa-briefcase text-slate-600 mr-1.5" />
                      {teacher.experience ?? 0} yrs experience
                    </span>
                  </div>

                  {/* Courses */}
                  <div className="mb-4 relative z-10 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                      Courses
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.courses?.length ? (
                        teacher.courses.slice(0, 3).map((course) => (
                          <span
                            key={course.id}
                            className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hover:border-indigo-500/40 transition"
                          >
                            {course.course_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">
                          No courses available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA — pinned to bottom */}
                  <div className="flex flex-col gap-2 mt-auto relative z-10">
                    {isAuthenticated && (
                      <button
                        onClick={() => navigate(`/teachers/${teacher.id}`)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 border border-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white font-black text-[11px] uppercase tracking-[0.18em] transition-all active:scale-95"
                      >
                        View Profile
                      </button>
                    )}
                    <button
                      onClick={() => setHireModal(teacher)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 border border-blue-600/30 text-blue-500 hover:bg-blue-600 hover:text-white font-black text-[11px] uppercase tracking-[0.18em] transition-all active:scale-95"
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
    </section>
  );
};

export default TeachersDirectory;

