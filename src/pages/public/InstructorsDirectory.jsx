import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeachers } from "../../store/slices/instructorsSlice";

const InstructorsDirectory = () => {
  const [hasFetched, setHasFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { teachers, loading, error } = useSelector(
    (state) => state.instructors,
  );

  useEffect(() => {
    const timer = setTimeout(async () => {
      const query = searchQuery.trim();

      if (!query) {
        await dispatch(fetchTeachers({}));
        setHasFetched(true);
        return;
      }

      const result = await dispatch(fetchTeachers({ teacher: query }));
      const data = result.payload;

      if (!data || data.length === 0) {
        await dispatch(fetchTeachers({ course: query }));
      }

      setHasFetched(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [dispatch, searchQuery]);

  return (
    <section
      id="instructors-view"
      className="min-h-screen bg-slate-950 text-white font-inter"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-black font-poppins mb-6">
          Find your <span className="text-indigo-500">Mentor</span>.
        </h1>
        <p className="text-slate-400 text-base sm:text-lg mb-12 max-w-2xl mx-auto">
          Connect with verified world-class educators for direct mastery
          modules.
        </p>
        <div className="max-w-2xl mx-auto mb-16 sm:mb-20 px-4 sm:px-0">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search instructors or courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition shadow-lg placeholder:text-slate-500"
            />

            {/* subtle glow */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition pointer-events-none bg-indigo-500/5" />
          </div>
        </div>

        <div className="p-6">
          {!hasFetched || loading ? (
            // Loader
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-slate-900 border border-slate-800 rounded-3xl p-6"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl" />
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
                No instructors found matching your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="group relative bg-gradient-to-b from-slate-900/80 to-slate-900 border border-slate-800 rounded-3xl p-6 transition-all duration-300 ease-out hover:border-indigo-500/40 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.35)] hover:-translate-y-[2px]"
                >
                  {/* Top */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none bg-indigo-500/4" />
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-md transition-transform duration-300 group-hover:scale-105">
                      {teacher.teacher_name?.[0]?.toUpperCase() || "T"}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {teacher.teacher_name || "Unnamed instructor"}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        {teacher.expertise || "No expertise specified"}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6 text-sm">
                    <div className="flex items-center gap-1 text-yellow-400 font-medium">
                      ★ {teacher.rating?.toFixed?.(1) ?? "0.0"}
                    </div>

                    <div className="text-slate-400">
                      {teacher.experience ?? 0} yrs experience
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="mb-6">
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

                  {/* CTA */}
                  <button
                    onClick={() => navigate(`/instructors/${teacher.id}`)}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold uppercase tracking-wide transition shadow-md hover:shadow-indigo-500/30"
                  >
                    View Profile
                  </button>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-indigo-500/5" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InstructorsDirectory;
