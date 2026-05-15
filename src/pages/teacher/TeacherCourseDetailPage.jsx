import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import { formatCategoryLabel } from "../../constants";
import { getCourseImage } from "../../utils/courseImageUtils";

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]",
    slate: "bg-slate-800/50 text-slate-300 border-slate-700/50",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[color]} backdrop-blur-md animate-fadeIn`}>
      {children}
    </span>
  );
};

const MetaTile = ({ icon, label, value, valueClass = "text-white", delay = "0s" }) => (
  <div 
    style={{ animationDelay: delay }}
    className="glass hover-lift rounded-2xl p-4 border border-white/5 group relative overflow-hidden animate-springyReveal opacity-0"
  >
    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
          <i className={`fas fa-${icon} text-slate-500 text-[10px] group-hover:text-indigo-400 transition-colors`}></i>
        </div>
        <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 font-bold">{label}</p>
      </div>
      <p className={`text-sm font-bold truncate tracking-tight ${valueClass}`}>{value}</p>
    </div>
  </div>
);

const TeacherCourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
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
          <div className="h-6 bg-slate-800/50 rounded-lg w-48 animate-pulse"></div>
          <div className="h-64 glass rounded-[2rem] animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="h-48 glass rounded-[2rem] animate-pulse"></div>
              <div className="h-32 glass rounded-[2rem] animate-pulse"></div>
            </div>
            <div className="lg:col-span-2 h-[500px] glass rounded-[2rem] animate-pulse"></div>
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

  const hasOutline = course.outline && course.outline.replace(/<[^>]*>/g, "").trim().length > 0;
  const hasAttachment = !!course.attachment;

  return (
    <div className="min-h-screen text-white p-6 lg:p-8 relative overflow-hidden bg-[#020617]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full animate-pulse delay-1000"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-3 text-sm animate-fadeIn">
          <button
            onClick={() => navigate("/teacher/classes")}
            className="text-slate-500 hover:text-white transition-all flex items-center gap-2 group bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5"
          >
            <i className="fas fa-arrow-left text-[10px] group-hover:-translate-x-1 transition-transform"></i>
            <span className="font-semibold tracking-tight">My Courses</span>
          </button>
          <i className="fas fa-chevron-right text-slate-700 text-[10px]"></i>
          <span className="text-white/60 font-medium truncate max-w-xs">{course.title}</span>
        </nav>

        {/* Hero header */}
        <div className="glass glass-shine rounded-[2.5rem] p-8 lg:p-12 border border-white/10 relative overflow-hidden animate-springyReveal">
          {/* Subtle mesh background for hero */}
          <div className="absolute inset-0 bg-linear-to-br from-indigo-600/10 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 relative z-10">
            {/* Thumbnail */}
            <div className="w-full lg:w-72 h-48 lg:h-44 rounded-2xl overflow-hidden flex-shrink-0 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.35)] border border-white/10 relative group/thumb">
              {getCourseImage(course) ? (
                <img
                  src={getCourseImage(course)}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center">
                  <i className="fas fa-book text-white text-4xl opacity-80"></i>
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
            </div>
            
            <div className="flex-1 min-w-0 lg:pt-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge color={course.status === "published" ? "green" : "slate"}>
                  {course.status}
                </Badge>
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">
                  {formatCategoryLabel(course.category)}
                </span>
              </div>
              <div className="flex flex-wrap items-start gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-black font-poppins text-white leading-tight tracking-tight drop-shadow-sm">
                  {course.title}
                </h1>
              </div>
              
              <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-3xl font-medium">
                {course.description}
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <MetaTile
                  icon="wallet"
                  label="Price"
                  value={course.price ? `PKR ${Number(course.price).toLocaleString()}` : "Free"}
                  valueClass="text-emerald-400"
                  delay="0.1s"
                />
                <MetaTile
                  icon="users"
                  label="Enrolled"
                  value={`${students.length} student${students.length !== 1 ? "s" : ""}`}
                  valueClass="text-indigo-400"
                  delay="0.2s"
                />
                <MetaTile
                  icon="calendar-alt"
                  label="Status"
                  value={course.status === "published" ? "Live" : "Draft"}
                  valueClass={course.status === "published" ? "text-green-400" : "text-slate-400"}
                  delay="0.3s"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile tab switcher */}
        <div className="flex lg:hidden gap-2 glass border border-white/5 rounded-2xl p-1.5 animate-fadeIn">
          {["details", "students"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {tab === "students" ? `Students (${students.length})` : "Details"}
            </button>
          ))}
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT: Course details */}
          <div className={`lg:col-span-3 space-y-8 ${activeTab === "students" ? "hidden lg:block" : ""}`}>

            {hasOutline && (
              <div className="glass rounded-[2rem] p-8 border border-white/5 animate-springyReveal" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                    <i className="fas fa-list-alt text-indigo-400 text-sm"></i>
                  </div>
                  <h2 className="text-xl font-black font-poppins text-white tracking-tight">Course Outline</h2>
                </div>
                <div
                  className="course-outline-content premium-outline"
                  dangerouslySetInnerHTML={{ __html: course.outline }}
                />
              </div>
            )}

            {hasAttachment && (
              <div className="glass rounded-[2rem] p-8 border border-white/5 animate-springyReveal" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/20">
                    <i className="fas fa-paperclip text-amber-400 text-sm"></i>
                  </div>
                  <h2 className="text-xl font-black font-poppins text-white tracking-tight">Course Attachment</h2>
                </div>
                
                <a
                  href={course.attachment}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="group flex items-center gap-6 p-6 glass rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:scale-[1.01]"
                >
                  <div className="w-14 h-14 bg-linear-to-br from-amber-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/5">
                    <i className="fas fa-download text-amber-400 text-xl group-hover:animate-bounce"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-lg mb-1 group-hover:text-amber-400 transition-colors">Download Attachment</p>
                    <p className="text-slate-500 text-xs font-medium tracking-wide uppercase">Click to save material locally</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300">
                    <i className="fas fa-chevron-right text-slate-600 group-hover:text-white text-xs"></i>
                  </div>
                </a>
              </div>
            )}

            {!hasOutline && !hasAttachment && (
              <div className="glass border-dashed border-2 border-white/5 rounded-[2.5rem] p-16 text-center animate-springyReveal">
                <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <i className="fas fa-info-circle text-slate-700 text-3xl"></i>
                </div>
                <p className="text-slate-400 text-lg font-medium font-poppins">No outline or attachment added yet.</p>
              </div>
            )}
          </div>

          {/* RIGHT: Enrolled Students */}
          <div className={`lg:col-span-2 ${activeTab === "details" ? "hidden lg:block" : ""}`}>
            <div className="glass rounded-[2rem] overflow-hidden border border-white/5 flex flex-col h-full animate-springyReveal" style={{ animationDelay: '0.4s' }}>
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                    <i className="fas fa-user-graduate text-indigo-400 text-sm"></i>
                  </div>
                  <div>
                    <h2 className="text-lg font-black font-poppins text-white tracking-tight">Enrolled Students</h2>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{students.length} Total Enrolled</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3 overflow-y-auto custom-scrollbar max-h-[70vh]">
                {students.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <i className="fas fa-user-slash text-slate-700 text-2xl"></i>
                    </div>
                    <p className="text-slate-500 font-medium font-poppins">No students enrolled yet</p>
                  </div>
                ) : (
                  students.map((student, idx) => (
                    <div
                      key={student.id}
                      style={{ animationDelay: `${0.5 + idx * 0.05}s` }}
                      className="flex items-center gap-4 p-4 glass hover-lift rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group animate-fadeIn opacity-0"
                    >
                      <div className="w-12 h-12 bg-linear-to-br from-indigo-600/20 to-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-500">
                        <span className="text-indigo-400 text-sm font-black font-poppins">
                          {student.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-black font-poppins truncate group-hover:text-indigo-400 transition-colors leading-none mb-1.5">{student.username}</p>
                        <p className="text-slate-500 text-[11px] font-medium truncate tracking-tight">{student.email}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <i className="fas fa-arrow-right text-[10px] text-indigo-400"></i>
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
  );
};

export default TeacherCourseDetailPage;
