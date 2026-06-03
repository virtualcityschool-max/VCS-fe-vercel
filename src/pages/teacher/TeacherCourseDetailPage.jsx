import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import { formatCategoryLabel } from "../../constants";
import { getCourseImage } from "../../utils/courseImageUtils";
import { useDateFormatters } from "../../hooks/useDateFormatters";

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    slate:  "bg-slate-800/50 text-slate-300 border-slate-700/50",
    amber:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose:   "bg-rose-500/10 text-rose-400 border-rose-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[color]}`}>
      {children}
    </span>
  );
};

const MetaTile = ({ icon, label, value, valueClass = "text-white", delay = "0s" }) => (
  <div
    style={{ animationDelay: delay }}
    className="glass hover-lift rounded-2xl p-4 border border-white/5 group relative overflow-hidden animate-springyReveal opacity-0"
  >
    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
          <i className={`fas fa-${icon} text-slate-500 text-[10px] group-hover:text-indigo-400 transition-colors`} />
        </div>
        <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 font-bold">{label}</p>
      </div>
      <p className={`text-sm font-bold truncate tracking-tight ${valueClass}`}>{value}</p>
    </div>
  </div>
);

const SectionHeader = ({ icon, iconBg, title, count, action, noMargin }) => (
  <div className={`flex items-center justify-between ${noMargin ? "" : "mb-6"}`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center border border-white/10`}>
        <i className={`${icon} text-sm`} />
      </div>
      <div>
        <h2 className="text-lg font-black font-poppins text-white tracking-tight">{title}</h2>
        {count != null && (
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{count} total</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div className="py-12 text-center">
    <div className="w-14 h-14 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
      <i className={`${icon} text-slate-700 text-xl`} />
    </div>
    <p className="text-slate-500 text-sm font-medium">{message}</p>
  </div>
);

const TABS = ["details", "assignments", "quizzes", "students"];

const TeacherCourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { formatDateTime } = useDateFormatters();

  const [course, setCourse]   = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const data = await coursesService.getCourseById(courseId);
        setCourse(data);
        setStudents(data.enrolled_students || []);
      } catch {
        toastManager.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="h-6 bg-slate-800/50 rounded-lg w-48 animate-pulse" />
          <div className="h-64 glass rounded-[2rem] animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="h-48 glass rounded-[2rem] animate-pulse" />
              <div className="h-32 glass rounded-[2rem] animate-pulse" />
            </div>
            <div className="lg:col-span-2 h-[500px] glass rounded-[2rem] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-poppins font-medium">
        Course not found.
      </div>
    );
  }

  const assignments = course.assignments || [];
  const quizzes     = course.quizzes     || [];
  const hasOutline    = course.outline && course.outline.replace(/<[^>]*>/g, "").trim().length > 0;
  const hasAttachment = !!course.attachment;

  const goToAssignments = () => navigate(`/teacher/assessments?tab=assignments&course=${courseId}`);
  const goToQuizzes     = () => navigate(`/teacher/assessments?tab=quizzes&course=${courseId}`);

  return (
    <div className="min-h-screen text-white p-6 lg:p-8 relative overflow-hidden bg-[#020617]">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* Breadcrumb */}
        <div className="animate-fadeIn">
          <nav className="flex items-center gap-3 text-sm">
            <button
              onClick={() => navigate("/teacher/classes")}
              className="text-slate-500 hover:text-white transition-all flex items-center gap-2 group bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5"
            >
              <i className="fas fa-arrow-left text-[10px] group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold tracking-tight">My Courses</span>
            </button>
            <i className="fas fa-chevron-right text-slate-700 text-[10px]" />
            <span className="text-white/60 font-medium truncate max-w-xs">{course.title}</span>
          </nav>
        </div>

        {/* Hero header */}
        <div className="glass glass-shine rounded-[2.5rem] p-8 lg:p-12 border border-white/10 relative overflow-hidden animate-springyReveal">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-600/10 via-transparent to-transparent pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 relative z-10">
            <div className="w-full lg:w-72 h-48 lg:h-44 rounded-2xl overflow-hidden flex-shrink-0 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.35)] border border-white/10 relative group/thumb">
              {getCourseImage(course) ? (
                <img src={getCourseImage(course)} alt={course.title} className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full bg-linear-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center">
                  <i className="fas fa-book text-white text-4xl opacity-80" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
            </div>

            <div className="flex-1 min-w-0 lg:pt-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge color={course.status === "published" ? "green" : "slate"}>{course.status}</Badge>
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">
                  {formatCategoryLabel(course.category)}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black font-poppins text-white leading-tight tracking-tight drop-shadow-sm mb-4">
                {course.title}
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-3xl font-medium">
                {course.description}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetaTile icon="wallet"          label="Price"       value={course.price ? `$${Number(course.price).toLocaleString("en-US")} USD` : "Free"} valueClass="text-emerald-400" delay="0.1s" />
                <MetaTile icon="users"           label="Enrolled"    value={`${students.length} student${students.length !== 1 ? "s" : ""}`}        valueClass="text-indigo-400" delay="0.2s" />
                <MetaTile icon="clipboard-list"  label="Assignments" value={assignments.length}                                                      valueClass="text-amber-400"  delay="0.3s" />
                <MetaTile icon="question-circle" label="Quizzes"     value={quizzes.length}                                                          valueClass="text-violet-400" delay="0.4s" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile tab switcher */}
        <div className="flex lg:hidden gap-1 glass border border-white/5 rounded-2xl p-1.5 animate-fadeIn overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all capitalize ${
                activeTab === tab ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-slate-500 hover:text-white"
              }`}
            >
              {tab === "students" ? `Students (${students.length})` : tab}
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT col: Course Outline / Attachment */}
          <div className="lg:col-span-3">
            <div className={activeTab !== "details" ? "hidden lg:block" : ""}>
              {hasOutline && (
                <div className="glass rounded-[2rem] p-8 border border-white/5 animate-springyReveal" style={{ animationDelay: "0.2s" }}>
                  <SectionHeader icon="fas fa-list-alt text-indigo-400" iconBg="bg-indigo-600/20" title="Course Outline" />
                  <div className="course-outline-content premium-outline" dangerouslySetInnerHTML={{ __html: course.outline }} />
                </div>
              )}
              {hasAttachment && (
                <div className="glass rounded-[2rem] p-8 border border-white/5 animate-springyReveal mt-8" style={{ animationDelay: "0.3s" }}>
                  <SectionHeader icon="fas fa-paperclip text-amber-400" iconBg="bg-amber-500/20" title="Course Attachment" />
                  <a
                    href={course.attachment}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="group flex items-center gap-6 p-6 glass rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:scale-[1.01]"
                  >
                    <div className="w-14 h-14 bg-linear-to-br from-amber-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/5">
                      <i className="fas fa-download text-amber-400 text-xl group-hover:animate-bounce" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-lg mb-1 group-hover:text-amber-400 transition-colors">Download Attachment</p>
                      <p className="text-slate-500 text-xs font-medium tracking-wide uppercase">Click to save material locally</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300">
                      <i className="fas fa-chevron-right text-slate-600 group-hover:text-white text-xs" />
                    </div>
                  </a>
                </div>
              )}
              {!hasOutline && !hasAttachment && (
                <div className="glass border-dashed border-2 border-white/5 rounded-[2.5rem] p-16 text-center animate-springyReveal">
                  <EmptyState icon="fas fa-info-circle" message="No outline or attachment added yet." />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT col: Enrolled Students → Assignments → Quizzes */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Enrolled Students ── */}
            <div className={activeTab !== "students" ? "hidden lg:block" : ""}>
              <div className="glass rounded-[2rem] overflow-hidden border border-white/5 flex flex-col animate-springyReveal" style={{ animationDelay: "0.4s", maxHeight: "480px" }}>
                <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex-shrink-0 flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                    <i className="fas fa-user-graduate text-indigo-400 text-sm" />
                  </div>
                  <div>
                    <h2 className="text-base font-black font-poppins text-white tracking-tight">Enrolled Students</h2>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{students.length} Total Enrolled</p>
                  </div>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {students.length === 0 ? (
                    <EmptyState icon="fas fa-user-slash" message="No students enrolled yet" />
                  ) : (
                    students.map((student, idx) => (
                      <div
                        key={student.id}
                        style={{ animationDelay: `${0.5 + idx * 0.05}s` }}
                        className="flex items-center gap-3 p-3 glass hover-lift rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group animate-fadeIn opacity-0"
                      >
                        <div className="w-10 h-10 bg-linear-to-br from-indigo-600/20 to-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                          <span className="text-indigo-400 text-sm font-black font-poppins">
                            {student.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-black font-poppins truncate group-hover:text-indigo-400 transition-colors leading-none mb-1">{student.username}</p>
                          <p className="text-slate-500 text-[11px] font-medium truncate tracking-tight">{student.email}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ── Assignments ── */}
            <div className={activeTab !== "assignments" ? "hidden lg:block" : ""}>
              <div className="glass rounded-[2rem] overflow-hidden border border-white/5 flex flex-col animate-springyReveal" style={{ animationDelay: "0.5s", maxHeight: "480px" }}>
                <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex-shrink-0">
                  <SectionHeader
                    icon="fas fa-clipboard-list text-indigo-400"
                    iconBg="bg-indigo-600/20"
                    title="Assignments"
                    count={assignments.length}
                    noMargin
                    action={
                      <button
                        onClick={goToAssignments}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                      >
                        <i className="fas fa-plus text-[9px]" /> Add
                      </button>
                    }
                  />
                </div>
                <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {assignments.length === 0 ? (
                    <EmptyState icon="fas fa-clipboard" message="No assignments created for this course yet." />
                  ) : (
                    assignments.map((a) => (
                      <div key={a.id} className="flex items-start gap-3 p-3 bg-slate-800/40 hover:bg-slate-800/70 border border-white/5 hover:border-indigo-500/20 rounded-2xl transition-all group">
                        <div className="w-9 h-9 bg-indigo-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                          <i className="fas fa-file-alt text-indigo-400 text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="text-white font-bold text-sm truncate">{a.title}</p>
                            {a.is_overdue && <Badge color="rose">Overdue</Badge>}
                            {a.status === "published" && !a.is_overdue && <Badge color="green">Published</Badge>}
                          </div>
                          {a.description && (
                            <p className="text-slate-500 text-xs mb-1.5 line-clamp-1">{a.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <i className="fas fa-calendar-alt text-slate-600" />
                              Due: {formatDateTime(a.due_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="fas fa-star text-slate-600" />
                              {a.max_score} pts
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="fas fa-user-check text-slate-600" />
                              {a.submissions_count} sub{a.submissions_count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ── Quizzes ── */}
            <div className={activeTab !== "quizzes" ? "hidden lg:block" : ""}>
              <div className="glass rounded-[2rem] overflow-hidden border border-white/5 flex flex-col animate-springyReveal" style={{ animationDelay: "0.6s", maxHeight: "480px" }}>
                <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex-shrink-0">
                  <SectionHeader
                    icon="fas fa-question-circle text-violet-400"
                    iconBg="bg-violet-600/20"
                    title="Quizzes"
                    count={quizzes.length}
                    noMargin
                    action={
                      <button
                        onClick={goToQuizzes}
                        className="flex items-center gap-2 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600 border border-violet-500/30 text-violet-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                      >
                        <i className="fas fa-plus text-[9px]" /> Add
                      </button>
                    }
                  />
                </div>
                <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {quizzes.length === 0 ? (
                    <EmptyState icon="fas fa-question" message="No quizzes created for this course yet." />
                  ) : (
                    quizzes.map((q) => (
                      <div key={q.id} className="flex items-start gap-3 p-3 bg-slate-800/40 hover:bg-slate-800/70 border border-white/5 hover:border-violet-500/20 rounded-2xl transition-all group">
                        <div className="w-9 h-9 bg-violet-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-violet-500/20 group-hover:scale-105 transition-transform">
                          <i className="fas fa-question-circle text-violet-400 text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="text-white font-bold text-sm truncate">{q.title}</p>
                            {q.is_overdue && <Badge color="rose">Overdue</Badge>}
                            {q.is_published && !q.is_overdue && <Badge color="green">Published</Badge>}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <i className="fas fa-calendar-alt text-slate-600" />
                              Due: {formatDateTime(q.due_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="fas fa-star text-slate-600" />
                              {q.total_marks} marks
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="fas fa-user-check text-slate-600" />
                              {q.submissions_count} sub{q.submissions_count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCourseDetailPage;
