import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectEnrolledCourses,
  selectPendingEnrollments,
  selectRejectedEnrollments,
} from "../../store/slices/studentDashboardSlice";
import { getStorageUrl } from "../../utils/storageUrl";

const CourseProgressGrid = () => {
  const navigate = useNavigate();
  const enrolledCourses = useSelector(selectEnrolledCourses);
  const pendingEnrollments = useSelector(selectPendingEnrollments);
  const rejectedEnrollments = useSelector(selectRejectedEnrollments);
  const [showPendingModal, setShowPendingModal] = React.useState(false);
  const [showRejectedModal, setShowRejectedModal] = React.useState(false);

  const getProgressColor = (percent) => {
    if (percent >= 80) return "bg-green-500";
    if (percent >= 60) return "bg-blue-500";
    if (percent >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <h2 className="text-xl lg:text-2xl font-black font-poppins text-white/90">
          Enrolled Courses
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {pendingEnrollments.length > 0 && (
            <button
              onClick={() => setShowPendingModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition-all group"
            >
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shrink-0"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                {pendingEnrollments.length} Pending Approval{pendingEnrollments.length !== 1 ? "s" : ""}
              </span>
            </button>
          )}
          {rejectedEnrollments.length > 0 && (
            <button
              onClick={() => setShowRejectedModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all group"
            >
              <i className="fas fa-times-circle text-rose-400 text-[9px] shrink-0"></i>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                {rejectedEnrollments.length} Rejected{rejectedEnrollments.length !== 1 ? "" : ""}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Active course cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {enrolledCourses.map((course) => (
          <div
            key={course.id}
            className="bg-slate-900/40 backdrop-blur-xl rounded-[1.5rem] border border-white/5 overflow-hidden group shadow-2xl hover:border-blue-500/20 transition-all duration-500 flex flex-col h-full"
          >
            <div className="h-32 lg:h-36 bg-slate-800 relative overflow-hidden shrink-0">
              {course.thumbnail ? (
                <img
                  src={getStorageUrl(course.thumbnail)}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition duration-700"
                />
              ) : (
                <div className="w-full h-full bg-slate-900/50 flex items-center justify-center">
                  <i className="fas fa-book-open text-slate-700 text-3xl"></i>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            </div>

            <div className="p-6 flex flex-col flex-1 min-w-0">
              <h4 className="text-base font-black mb-2 text-white/90 line-clamp-1 tracking-tight">
                {course.title}
              </h4>
              <p className="text-[11px] text-slate-500 mb-6 line-clamp-2 font-medium leading-relaxed">
                {course.description}
              </p>

              <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                  <span className="text-[10px] font-black text-white">{course.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-5">
                  <div
                    className={`h-full ${getProgressColor(course.progress)} transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.3)]`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 active:scale-95"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Explore more card */}
        <div
          onClick={() => navigate("/courses")}
          className="bg-slate-900/20 rounded-[1.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 min-h-[280px]"
        >
          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-blue-500/20 group-hover:bg-blue-500/10 transition-all duration-500 text-slate-500 group-hover:text-blue-400">
            <i className="fas fa-plus text-xl"></i>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-400/80 text-center transition-colors">
            Explore Courses
          </p>
          <p className="text-[10px] text-slate-600 mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
            Discover new learning paths
          </p>
        </div>
      </div>

      {/* Rejected Enrollments Modal */}
      {showRejectedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setShowRejectedModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#131c2e] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b border-white/5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <i className="fas fa-times-circle text-rose-400 text-sm shrink-0"></i>
                  <h3 className="text-base font-black text-white font-poppins">Rejected Enrollments</h3>
                </div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  Contact school administration to re-enroll
                </p>
              </div>
              <button
                onClick={() => setShowRejectedModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>

            {/* List */}
            <div className="px-5 py-4 space-y-2.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {rejectedEnrollments.map((enrollment) => {
                const course = enrollment.course || {};
                const rejectedDate = enrollment.updated_at || enrollment.enrolled_at
                  ? new Date(enrollment.updated_at || enrollment.enrolled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : null;

                return (
                  <div
                    key={enrollment.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-rose-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                      {course.thumbnail ? (
                        <img src={getStorageUrl(course.thumbnail)} alt="" className="w-full h-full object-cover opacity-40" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-book text-slate-600 text-sm"></i>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate mb-1">
                        {course.title || "—"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-black uppercase tracking-wider">
                          <i className="fas fa-times text-[8px]"></i> Rejected
                        </span>
                        {enrollment.is_private && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-wider">
                            <i className="fas fa-lock text-[8px]"></i> Private
                          </span>
                        )}
                        {rejectedDate && (
                          <span className="text-[9px] text-slate-500">Declined {rejectedDate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="px-7 pb-6 pt-3">
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl px-4 py-3 flex items-start gap-3">
                <i className="fas fa-shield-alt text-rose-500/60 text-xs mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  These enrollment requests were declined by school administration. Please contact your school administrator directly to request access.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Approvals Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setShowPendingModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#131c2e] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b border-white/5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shrink-0"></span>
                  <h3 className="text-base font-black text-white font-poppins">Pending Approvals</h3>
                </div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  Awaiting administrator review · typically 24–48 hrs
                </p>
              </div>
              <button
                onClick={() => setShowPendingModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>

            {/* List */}
            <div className="px-5 py-4 space-y-2.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {pendingEnrollments.map((enrollment) => {
                const course = enrollment.course || {};
                const enrolledDate = enrollment.enrolled_at
                  ? new Date(enrollment.enrolled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : null;

                return (
                  <div
                    key={enrollment.id}
                    onClick={() => { setShowPendingModal(false); navigate("/courses"); }}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 hover:bg-amber-500/5 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                      {course.thumbnail ? (
                        <img src={getStorageUrl(course.thumbnail)} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-book text-slate-600 text-sm"></i>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate mb-1 group-hover:text-amber-300 transition-colors">
                        {course.title || "—"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                          <i className="fas fa-clock text-[8px]"></i> Pending
                        </span>
                        {enrollment.is_private && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-wider">
                            <i className="fas fa-lock text-[8px]"></i> Private
                          </span>
                        )}
                        {enrolledDate && (
                          <span className="text-[9px] text-slate-500">Applied {enrolledDate}</span>
                        )}
                      </div>
                    </div>

                    <i className="fas fa-arrow-right text-xs text-slate-600 group-hover:text-amber-400 transition-colors shrink-0"></i>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseProgressGrid;
