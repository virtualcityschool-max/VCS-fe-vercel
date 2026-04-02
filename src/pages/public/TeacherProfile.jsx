import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { fetchTeacherById } from "../../store/slices/teacherSlice";

const TeacherProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const abortControllerRef = useRef(null);

  const { teacherDetails, loading, error } = useSelector(
    (state) => state.teachers,
  );

  useEffect(() => {
    if (!id) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    dispatch(fetchTeacherById(id));

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id, dispatch]);

  if (loading && !teacherDetails) {
    return (
      <section className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 sm:py-20">
          <div className="animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="w-32 h-32 rounded-3xl bg-slate-800" />
                <div className="flex-1 w-full space-y-4">
                  <div className="h-8 w-64 bg-slate-800 rounded" />
                  <div className="h-4 w-40 bg-slate-800 rounded" />
                  <div className="flex flex-wrap gap-3">
                    <div className="h-8 w-28 bg-slate-800 rounded-xl" />
                    <div className="h-8 w-32 bg-slate-800 rounded-xl" />
                    <div className="h-8 w-36 bg-slate-800 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-80 bg-slate-900 border border-slate-800 rounded-3xl" />
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-slate-900 border border-slate-800 rounded-3xl" />
                  <div className="h-32 bg-slate-900 border border-slate-800 rounded-3xl" />
                </div>
                <div className="h-72 bg-slate-900 border border-slate-800 rounded-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to load teacher</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </section>
    );
  }

  const expertiseList =
    teacherDetails.expertise && typeof teacherDetails.expertise === "string"
      ? teacherDetails.expertise
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const ratingValue = Number(teacherDetails.rating || 0);
  const totalStudents = teacherDetails.total_students ?? 0;
  const totalReviews = teacherDetails.rating_breakdown?.total_reviews ?? 0;
  const activeCourses = teacherDetails.active_courses_count ?? 0;

  // Validate LinkedIn URL with improved security
  const isValidLinkedInUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    try {
      const parsedUrl = new URL(url);
      // More strict validation - exact domain match for linkedin.com
      return (
        parsedUrl.hostname === "linkedin.com" ||
        parsedUrl.hostname === "www.linkedin.com" ||
        parsedUrl.hostname.endsWith(".linkedin.com")
      );
    } catch {
      return false;
    }
  };

  return (
    <section
      id="teacher-profile-view"
      className="min-h-screen bg-slate-950 text-white"
    >
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-14 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-10 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none bg-indigo-500/[0.03]" />
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col xl:flex-row gap-8 xl:items-center">
            {/* Avatar */}
            <div className="shrink-0 mx-auto xl:mx-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-xl border border-indigo-400/20">
                {teacherDetails.teacher_name?.[0]?.toUpperCase() || "T"}
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center xl:text-left">
              <div className="flex flex-col xl:flex-row xl:items-center gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  {teacherDetails.teacher_name || "Unnamed Teacher"}
                </h1>

                <span className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                  <i className="fas fa-check-circle"></i>
                  Verified Teacher
                </span>
              </div>

              <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto xl:mx-0 mb-5">
                {teacherDetails.bio || "No teacher bio available."}
              </p>

              <div className="flex flex-wrap justify-center xl:justify-start gap-3">
                <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300">
                  {teacherDetails.experience_years ?? 0} years experience
                </span>

                <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300">
                  {activeCourses} active course{activeCourses === 1 ? "" : "s"}
                </span>

                <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300">
                  {totalStudents} student{totalStudents === 1 ? "" : "s"}
                </span>

                {expertiseList.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="w-full xl:w-72 flex flex-col gap-3">
              <button className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/20">
                Request Tutor
              </button>

              <button className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-indigo-500/30 hover:text-white">
                Message Instructor
              </button>

              {teacherDetails.linkedin &&
              isValidLinkedInUrl(teacherDetails.linkedin) ? (
                <a
                  href={teacherDetails.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:border-slate-700 hover:text-white"
                >
                  View LinkedIn
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Top Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About / Bio / Expertise */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl h-full">
              <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <i className="fas fa-user-tie text-indigo-400"></i>
                Teacher Profile
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">
                    About
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {teacherDetails.bio || "No bio available for this teacher."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {expertiseList.length ? (
                      expertiseList.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">Not specified</p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-indigo-500/10 bg-indigo-500/[0.04] p-6">
                  <p className="text-slate-300 leading-relaxed italic">
                    “Dedicated to helping learners gain practical mastery
                    through structured teaching, clarity, and real-world
                    guidance.”
                  </p>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-300">
                    Teaching Philosophy
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats + Distinctions */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
                <p className="text-3xl font-semibold text-white mb-2">
                  {totalStudents}
                </p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">
                  Learners
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
                <p className="text-3xl font-semibold text-yellow-400 mb-2 flex items-center justify-center gap-2">
                  {ratingValue.toFixed(1)}
                  <i className="fas fa-star text-sm"></i>
                </p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">
                  Global Rating
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 mb-6">
                Distinctions
              </h3>

              {teacherDetails.distinctions?.length ? (
                <ul className="space-y-5">
                  {teacherDetails.distinctions.map((cert, idx) => (
                    <li
                      key={`${cert.title}-${idx}`}
                      className="flex items-start gap-4"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <i className="fas fa-award"></i>
                      </div>

                      <div>
                        <p className="font-semibold text-slate-200 text-sm">
                          {cert.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-[0.18em]">
                          {cert.org}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm">No distinctions listed</p>
              )}
            </div>
          </div>
        </div>

        {/* Courses + Rating Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl h-full">
              <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                  <i className="fas fa-book-open text-indigo-400"></i>
                  Courses
                </h2>

                <span className="text-xs uppercase tracking-[0.18em] text-slate-500 font-bold">
                  {teacherDetails.courses?.length || 0} total
                </span>
              </div>

              {teacherDetails.courses?.length ? (
                <div className="space-y-4">
                  {teacherDetails.courses.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 transition hover:border-indigo-500/20"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {course.course_name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {course.enrolled_students} enrolled student
                            {course.enrolled_students === 1 ? "" : "s"} • Rating{" "}
                            {Number(course.rating || 0).toFixed(1)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] border ${
                            course.status === "published"
                              ? "border-green-500/20 bg-green-500/10 text-green-300"
                              : "border-slate-700 bg-slate-800 text-slate-400"
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No courses available</p>
              )}
            </div>
          </div>

          {/* Rating breakdown */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 mb-6">
                Rating Breakdown
              </h3>

              <div className="mb-6">
                <p className="text-4xl font-semibold text-white">
                  {ratingValue.toFixed(1)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Based on {totalReviews} review{totalReviews === 1 ? "" : "s"}
                </p>
              </div>

              <div className="space-y-3">
                {teacherDetails.rating_breakdown?.stars?.length ? (
                  teacherDetails.rating_breakdown.stars.map((item) => (
                    <div key={item.star} className="flex items-center gap-3">
                      <span className="w-10 text-xs text-slate-400">
                        {item.star}★
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-slate-500">
                        {item.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No ratings yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <i className="fas fa-comment-dots text-indigo-400"></i>
              Recent Reviews
            </h2>

            <span className="text-xs uppercase tracking-[0.18em] text-slate-500 font-bold">
              {teacherDetails.recent_reviews?.length || 0} shown
            </span>
          </div>

          {teacherDetails.recent_reviews?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teacherDetails.recent_reviews.map((review, idx) => (
                <div
                  key={`${review.student_name}-${idx}`}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-sm font-semibold text-white">
                      {review.student_name}
                    </p>
                    <span className="text-yellow-400 text-sm font-medium">
                      ★ {review.rating}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    {review.comment}
                  </p>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p>{review.course_title}</p>
                    <p>
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : "Date not available"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No reviews available yet</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default TeacherProfile;
