import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { coursesService } from "../../services/coursesService";
import { unenrollStudent } from "../../store/slices/adminSlice";
import { toastManager } from "../../utils/toastManager";
import { formatCategoryLabel } from "../../constants";
import { handleDownload } from "../../utils/courseImageUtils";
import { getStorageUrl } from "../../utils/storageUrl";

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    slate: "bg-slate-700/50 text-slate-300 border-slate-600/30",
    indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
};

const MetaTile = ({ icon, label, value, valueClass = "text-white" }) => (
  <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/40">
    <div className="flex items-center gap-2 mb-1.5">
      <i className={`fas fa-${icon} text-slate-500 text-xs`}></i>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
    </div>
    <p className={`text-sm font-semibold truncate ${valueClass}`}>{value}</p>
  </div>
);

const ConfirmUnenroll = ({ student, onConfirm, onCancel, loading }) => (
  <div
    className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
    onClick={onCancel}
  >
    <div
      className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
          <i className="fas fa-user-minus text-red-400"></i>
        </div>
        <h4 className="text-white font-bold">Unenroll Student</h4>
      </div>
      <p className="text-slate-300 text-sm mb-1">Remove from this course:</p>
      <p className="text-white font-semibold text-sm">{student.username}</p>
      <p className="text-slate-400 text-xs mt-0.5 mb-5">{student.email}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-sm font-medium transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? "Removing..." : "Yes, Remove"}
        </button>
      </div>
    </div>
  </div>
);

const AdminCourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unenrollingId, setUnenrollingId] = useState(null);
  const [confirmStudent, setConfirmStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

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

  useEffect(() => { fetchCourse(); }, [courseId]);

  const handleUnenroll = async () => {
    if (!confirmStudent) return;
    setUnenrollingId(confirmStudent.id);
    try {
      await dispatch(unenrollStudent({ courseId, studentId: confirmStudent.id })).unwrap();
      toastManager.success(`${confirmStudent.username} removed from course`);
      setConfirmStudent(null);
      fetchCourse();
    } catch (err) {
      toastManager.error(err?.message || "Failed to unenroll student");
    } finally {
      setUnenrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
          <div className="h-6 bg-slate-800 rounded w-56"></div>
          <div className="h-40 bg-slate-800 rounded-3xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="h-32 bg-slate-800 rounded-3xl"></div>
              <div className="h-48 bg-slate-800 rounded-3xl"></div>
            </div>
            <div className="lg:col-span-2 h-80 bg-slate-800 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Course not found.
      </div>
    );
  }

  const hasOutline = course.outline && course.outline.replace(/<[^>]*>/g, "").trim().length > 0;
  const hasAttachment = !!course.attachment;

  return (
    <div className="min-h-screen text-white p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate("/admin/courses")}
            className="text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            <i className="fas fa-arrow-left text-xs"></i>
            Courses
          </button>
          <i className="fas fa-chevron-right text-slate-600 text-xs"></i>
          <span className="text-white font-medium truncate max-w-xs">{course.title}</span>
        </nav>

        {/* Hero header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800/60 border border-slate-700/50 rounded-3xl p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
              <i className="fas fa-graduation-cap text-indigo-400 text-2xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-2xl font-black font-poppins text-white leading-tight">{course.title}</h1>
                <Badge color={course.status === "published" ? "green" : "slate"}>
                  {course.status}
                </Badge>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-2xl">
                {course.description}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetaTile icon="user" label="Instructor" value={course.instructor?.username || "—"} />
                <MetaTile icon="tag" label="Category" value={formatCategoryLabel(course.category) || "—"} />
                <MetaTile
                  icon="rupee-sign"
                  label="Price"
                  value={course.price ? `PKR ${Number(course.price).toLocaleString()}` : "Free"}
                  valueClass="text-emerald-400"
                />
                <MetaTile
                  icon="users"
                  label="Enrolled"
                  value={`${students.length} student${students.length !== 1 ? "s" : ""}`}
                  valueClass="text-indigo-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile tab switcher */}
        <div className="flex lg:hidden gap-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-1">
          {["details", "students"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition capitalize ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "students" ? `Students (${students.length})` : "Details"}
            </button>
          ))}
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT: Course details */}
          <div className={`lg:col-span-3 space-y-5 ${activeTab === "students" ? "hidden lg:block" : ""}`}>

            {/* Outline */}
            {hasOutline && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-indigo-600/15 rounded-xl flex items-center justify-center">
                    <i className="fas fa-list-alt text-indigo-400 text-xs"></i>
                  </div>
                  <h2 className="text-base font-bold text-white">Course Outline</h2>
                </div>
                <div
                  className="course-outline-content"
                  dangerouslySetInnerHTML={{ __html: course.outline }}
                />
              </div>
            )}

            {/* Attachment */}
            {hasAttachment && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-amber-500/15 rounded-xl flex items-center justify-center">
                    <i className="fas fa-paperclip text-amber-400 text-xs"></i>
                  </div>
                  <h2 className="text-base font-bold text-white">Course Attachment</h2>
                </div>
                <button
                  onClick={() => handleDownload(getStorageUrl(course.attachment))}
                  className="inline-flex items-center gap-3 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-2xl text-sm text-white font-medium transition group"
                >
                  <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500/30 transition">
                    <i className="fas fa-download text-amber-400 text-xs"></i>
                  </div>
                  <span>Download Attachment</span>
                </button>
              </div>
            )}

            {/* Empty state */}
            {!hasOutline && !hasAttachment && (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-10 text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-info-circle text-slate-500 text-xl"></i>
                </div>
                <p className="text-slate-400 text-sm">No outline or attachment added yet.</p>
              </div>
            )}
          </div>

          {/* RIGHT: Enrolled Students */}
          <div className={`lg:col-span-2 ${activeTab === "details" ? "hidden lg:block" : ""}`}>
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
              {/* Students header */}
              <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600/15 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user-graduate text-indigo-400 text-xs"></i>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Enrolled Students</h2>
                  <p className="text-xs text-slate-500">{students.length} enrolled</p>
                </div>
              </div>

              {/* Students list */}
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {students.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-user-slash text-slate-500 text-lg"></i>
                    </div>
                    <p className="text-slate-400 text-sm">No students enrolled yet</p>
                  </div>
                ) : (
                  students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-slate-800/70 rounded-2xl border border-slate-700/40 hover:border-slate-600/60 transition"
                    >
                      <div className="w-9 h-9 bg-indigo-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 text-xs font-bold">
                          {student.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{student.username}</p>
                        <p className="text-slate-400 text-xs truncate">{student.email}</p>
                      </div>
                      <button
                        onClick={() => setConfirmStudent(student)}
                        disabled={unenrollingId === student.id}
                        title="Remove student"
                        className="w-7 h-7 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-full flex items-center justify-center transition disabled:opacity-40 flex-shrink-0"
                      >
                        {unenrollingId === student.id ? (
                          <i className="fas fa-spinner fa-spin text-xs"></i>
                        ) : (
                          <i className="fas fa-user-minus text-xs"></i>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unenroll confirmation */}
      {confirmStudent && (
        <ConfirmUnenroll
          student={confirmStudent}
          loading={!!unenrollingId}
          onConfirm={handleUnenroll}
          onCancel={() => setConfirmStudent(null)}
        />
      )}
    </div>
  );
};

export default AdminCourseDetailPage;
