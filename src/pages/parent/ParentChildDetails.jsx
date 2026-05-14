import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchParentChildDetail, selectParentChildDetail } from "../../store/slices/parentSlice";
import { LoadingSpinner, ErrorMessage } from "../../components/ui";
import AttendanceMatrix from "../../components/common/AttendanceMatrix";

const ParentChildDetails = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(selectParentChildDetail);
  const { child, summary, courses } = data || {};
  const sortedCourses = useMemo(() => {
    if (!courses) return [];
    return [...courses].sort((a, b) => {
      const aDone = a.status === 'completed' || a.progress?.percent === 100;
      const bDone = b.status === 'completed' || b.progress?.percent === 100;
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      return 0;
    });
  }, [courses]);
  const location = useLocation();
  const stateCourseId = location.state?.activeCourseId;
  const [activeCourseId, setActiveCourseId] = useState(null);

  useEffect(() => {
    if (childId) {
      dispatch(fetchParentChildDetail(childId));
      setActiveCourseId(null);
    }
  }, [dispatch, childId]);

  // Set initial active course when data loads
  useEffect(() => {
    if (courses?.length > 0) {
      // Priority 1: ID from navigation state
      if (stateCourseId && courses.some(c => c.id === stateCourseId) && activeCourseId === null) {
        setActiveCourseId(stateCourseId);
      } 
      // Priority 2: Current selection validation
      else {
        const currentExists = courses.some(c => c.id === activeCourseId);
        if (!currentExists) {
          setActiveCourseId(courses[0].id);
        }
      }
    }
  }, [courses, activeCourseId, stateCourseId]);

  const activeCourse = useMemo(() => 
    data?.courses?.find(c => c.id === activeCourseId),
    [data, activeCourseId]
  );

  const mappedRecords = useMemo(() => {
    if (!activeCourse || !child) return [];
    return activeCourse.sessions
      .filter(s => s.attendance_status)
      .map(s => ({
        student: child.id,
        student_name: child.username,
        session: s.id,
        status: s.attendance_status,
        joined_at: s.joined_at,
        left_at: s.left_at
      }));
  }, [activeCourse, child]);

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <LoadingSpinner size="xl" color="indigo" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0f172a] p-8">
      <ErrorMessage error={error} message="Failed to load child details" />
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-inter pb-20">
      {/* Header / Profile Summary */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <button 
            onClick={() => navigate("/parent")}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <i className="fas fa-arrow-left text-xs"></i>
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Back to Portal</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative w-24 h-24 rounded-[2rem] bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                  {child.avatar ? (
                    <img src={child.avatar} alt={child.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-indigo-400">
                      {child.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black font-poppins tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  {child.username}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    Grade {child.grade_level}
                  </span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span className="text-slate-500 text-xs font-bold">{summary.courses_count} Enrolled Courses</span>
                </div>
              </div>
            </div>

            {/* Overall Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full lg:w-auto">
              {[
                // { label: "GPA", value: summary.overall_gpa?.toFixed(1), icon: "fa-star", color: "text-amber-400" },
                { label: "Attendance", value: `${Math.round(summary.overall_attendance?.percentage)}%`, icon: "fa-calendar-check", color: "text-emerald-400" },
                { label: "Pending Tasks", value: summary.overdue_assignments + summary.overdue_quizzes, icon: "fa-clock", color: "text-rose-400" },
                { label: "Completed", value: "85%", icon: "fa-check-circle", color: "text-indigo-400" }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 min-w-[140px]">
                  <div className="flex items-center justify-between mb-2">
                    <i className={`fas ${stat.icon} ${stat.color} text-sm`}></i>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                  </div>
                  <div className="text-xl font-black text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course Tabs & Content */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          {/* Tabs Scroller */}
          <div className="bg-slate-900/80 border-b border-white/5 px-8 pt-6">
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6">
               {sortedCourses.map((course) => {
                 const isCompleted = course.status === 'completed' || course.progress?.percent === 100;
                 return (
                   <button
                     key={course.id}
                     onClick={() => setActiveCourseId(course.id)}
                     className={`shrink-0 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all relative flex items-center gap-2 ${
                       activeCourseId === course.id 
                         ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/50" 
                         : "bg-slate-800/50 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-white/5"
                     }`}
                   >
                     {course.title}
                     {isCompleted && (
                       <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[7px] font-black rounded-md border border-emerald-500/20">
                         COMPLETED
                       </span>
                     )}
                   </button>
                 );
               })}
             </div>
          </div>

          {/* Active Course Content */}
          {activeCourse && (
            <div className="p-8 md:p-12 space-y-16 animate-fadeIn">
              {/* Course Info Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <i className="fas fa-graduation-cap text-indigo-400 text-lg"></i>
                    </div>
                    <h2 className="text-2xl font-black font-poppins tracking-tight">{activeCourse.title}</h2>
                  </div>
                  <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <i className="far fa-user-circle"></i>
                      <span>Instructor: <span className="text-white">{activeCourse.instructor}</span></span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/40 rounded-3xl p-6 border border-white/5 flex items-center gap-8 min-w-[300px]">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Course Progress</p>
                      <div className="text-2xl font-black text-white">{activeCourse.progress.percent}%</div>
                   </div>
                   <div className="flex-1">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                          style={{ width: `${activeCourse.progress.percent}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
                        {activeCourse.progress.assignments_submitted} / {activeCourse.progress.assignments_total} Submissions
                      </p>
                   </div>
                </div>
              </div>

              {/* Attendance Section */}
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
                    <h3 className="text-xl font-black uppercase tracking-widest">Attendance History</h3>
                  </div>
                  <div className="flex gap-4">
                     {['Present', 'Late', 'Absent'].map(status => (
                       <div key={status} className="text-center">
                          <p className="text-[10px] font-black uppercase tracking-tighter text-slate-500 mb-1">{status}</p>
                          <p className="text-sm font-black text-white">{activeCourse.attendance_summary[status.toLowerCase()]}</p>
                       </div>
                     ))}
                  </div>
                </div>
                <AttendanceMatrix sessions={activeCourse.sessions} attendanceRecords={mappedRecords} />
              </section>

              {/* Assessments Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Assignments */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-black uppercase tracking-widest">Assignments</h3>
                  </div>
                  <div className="space-y-4">
                    {activeCourse.assignments.length > 0 ? (
                      activeCourse.assignments.map(item => (
                        <AssessmentCard key={item.id} item={item} type="assignment" />
                      ))
                    ) : (
                      <EmptyState icon="fa-file-alt" label="No assignments found" />
                    )}
                  </div>
                </section>

                {/* Quizzes */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-violet-500 rounded-full"></div>
                    <h3 className="text-xl font-black uppercase tracking-widest">Quizzes</h3>
                  </div>
                  <div className="space-y-4">
                    {activeCourse.quizzes.length > 0 ? (
                      activeCourse.quizzes.map(item => (
                        <AssessmentCard key={item.id} item={item} type="quiz" />
                      ))
                    ) : (
                      <EmptyState icon="fa-tasks" label="No quizzes found" />
                    )}
                  </div>
                </section>
              </div>

              {/* Evaluation / Grading Summary */}
              <section className="bg-slate-800/40 border border-white/5 rounded-[2rem] p-10 mt-12">
                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black tracking-tight">Academic Performance</h3>
                       <p className="text-slate-400 text-sm font-medium">Detailed breakdown of grading and evaluation for this course.</p>
                    </div>
                    <div className="bg-indigo-600/10 border border-indigo-500/20 px-6 py-4 rounded-3xl text-center min-w-[140px]">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Final Grade</p>
                        <p className="text-3xl font-black text-white">{activeCourse.evaluation.final_totals.grade || "N/A"}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <EvaluationStat 
                      label="Assignment Marks" 
                      obtained={activeCourse.evaluation.assignment_totals.obtained}
                      total={activeCourse.evaluation.assignment_totals.total}
                      percentage={activeCourse.evaluation.assignment_totals.percentage}
                      color="bg-blue-500"
                    />
                    <EvaluationStat 
                      label="Quiz Marks" 
                      obtained={activeCourse.evaluation.quiz_totals.obtained}
                      total={activeCourse.evaluation.quiz_totals.total}
                      percentage={activeCourse.evaluation.quiz_totals.percentage}
                      color="bg-violet-500"
                    />
                    <EvaluationStat 
                      label="Total Marks" 
                      obtained={activeCourse.evaluation.combined_totals.obtained}
                      total={activeCourse.evaluation.combined_totals.total}
                      percentage={activeCourse.evaluation.combined_totals.percentage}
                      color="bg-indigo-500"
                      highlight
                    />
                 </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Helper Components
const AssessmentCard = ({ item, type }) => {
  const isCompleted = item.status === "submitted" || item.is_completed;
  return (
    <div className={`p-5 rounded-3xl border transition-all ${
      isCompleted ? "bg-slate-800/30 border-white/5" : "bg-indigo-500/5 border-indigo-500/20"
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white leading-snug">{item.title}</h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {type} • {item.due_date ? new Date(item.due_date).toLocaleDateString() : "No due date"}
          </p>
        </div>
        <div className="text-right">
           <div className={`text-xs font-black mb-1 ${isCompleted ? "text-emerald-400" : "text-amber-400"}`}>
              {isCompleted ? "Completed" : "Pending"}
           </div>
           {item.obtained_marks != null && (
             <div className="text-[10px] font-bold text-slate-400">
                {item.obtained_marks} / {item.total_marks}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const EvaluationStat = ({ label, obtained, total, percentage, color, highlight }) => (
  <div className={`p-6 rounded-3xl border ${highlight ? 'bg-indigo-600/5 border-indigo-500/30 shadow-lg shadow-indigo-950/20' : 'bg-slate-800/30 border-white/5'}`}>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{label}</p>
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="text-2xl font-black text-white">{obtained}<span className="text-slate-600 text-lg font-normal">/{total}</span></div>
      <div className="text-lg font-black text-white">{Math.round(percentage)}%</div>
    </div>
    <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
  </div>
);

const EmptyState = ({ icon, label }) => (
  <div className="flex flex-col items-center justify-center py-10 bg-slate-800/20 border border-slate-800/50 border-dashed rounded-[2rem]">
    <i className={`fas ${icon} text-slate-700 text-2xl mb-3`}></i>
    <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">{label}</p>
  </div>
);

export default ParentChildDetails;
