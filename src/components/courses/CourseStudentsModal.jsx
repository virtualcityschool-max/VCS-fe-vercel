import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { coursesService } from "../../services/coursesService";
import { unenrollStudent } from "../../store/slices/adminSlice";
import { toastManager } from "../../utils/toastManager";
import { getCourseImage } from "../../utils/courseImageUtils";
import { getDisplayName } from "../../utils/userDisplay";

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    slate: "bg-slate-700/50 text-slate-300 border-slate-600/30",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
};

const CourseStudentsModal = ({ courseId, courseTitle, onClose, canUnenroll }) => {
  const dispatch = useDispatch();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unenrollingId, setUnenrollingId] = useState(null);
  const [confirmStudent, setConfirmStudent] = useState(null);

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

  const handleConfirmUnenroll = async () => {
    if (!confirmStudent) return;
    setUnenrollingId(confirmStudent.id);
    try {
      await dispatch(unenrollStudent({ courseId, studentId: confirmStudent.id })).unwrap();
      toastManager.success(`${confirmStudent.username} has been unenrolled`);
      setConfirmStudent(null);
      fetchCourse();
    } catch (err) {
      toastManager.error(err?.message || err?.error || "Failed to unenroll student");
    } finally {
      setUnenrollingId(null);
    }
  };

  return (
    <>
      {/* Main modal */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-book text-indigo-400 text-sm"></i>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">{courseTitle}</h3>
                <p className="text-xs text-slate-400">Course details & enrolled students</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition ml-3 flex-shrink-0 p-1">
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* Body - two columns */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">

            {/* LEFT - Course details */}
            <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto p-6 flex-shrink-0">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-32 bg-slate-800 rounded-xl" />
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-800 rounded w-5/6" />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-14 bg-slate-800 rounded-xl" />
                    ))}
                  </div>
                </div>
              ) : course ? (
                <div className="space-y-5">
                  {/* Course image placeholder */}
                  <div className="w-full h-32 rounded-xl overflow-hidden border border-indigo-500/20 shadow-lg relative group/image">
                    <img 
                      src={getCourseImage(course)} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent"></div>
                  </div>

                  {/* Title + status */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-white font-bold text-base leading-snug">{course.title}</h4>
                      <Badge color={course.status === "published" ? "green" : "slate"}>
                        {course.status}
                      </Badge>
                    </div>
                    {course.description && (
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Tutor</p>
                      <p className="text-white text-sm font-medium truncate">
                        {getDisplayName(course.instructor) || "-"}
                      </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Level</p>
                      <p className="text-white text-sm font-medium truncate capitalize">
                        {(typeof course.category === "object" ? course.category?.name : course.category)?.replace(/_/g, " ") || "-"}
                      </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Price</p>
                      <p className="text-emerald-400 text-sm font-bold">
                        {course.price ? `$${Number(course.price).toLocaleString("en-US")} USD` : "Free"}
                      </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Enrolled</p>
                      <p className="text-white text-sm font-bold">
                        {students.length} 
                        {/* <span className="text-slate-400 font-normal text-xs">students</span> */}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* RIGHT - Students list */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                      <div className="w-9 h-9 bg-slate-700 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-slate-700 rounded w-28" />
                        <div className="h-2.5 bg-slate-700 rounded w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-user-graduate text-slate-500 text-xl"></i>
                  </div>
                  <p className="text-slate-400 text-sm">No students enrolled yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-3">
                    {students.length} student{students.length !== 1 ? "s" : ""} enrolled
                  </p>
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition"
                    >
                      <div className="w-9 h-9 bg-indigo-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 text-xs font-bold">
                          {student.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{student.username}</p>
                        <p className="text-slate-400 text-xs truncate">{student.email}</p>
                      </div>
                      {canUnenroll && (
                        <button
                          onClick={() => setConfirmStudent(student)}
                          disabled={unenrollingId === student.id}
                          className="w-7 h-7 bg-red-600/10 hover:bg-red-600/30 text-red-400 rounded-full flex items-center justify-center transition disabled:opacity-50 flex-shrink-0"
                          title={`Unenroll ${student.username}`}
                        >
                          {unenrollingId === student.id ? (
                            <i className="fas fa-spinner fa-spin text-xs"></i>
                          ) : (
                            <i className="fas fa-times text-xs"></i>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unenroll confirmation */}
      {confirmStudent && (
        <div
          className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
          onClick={() => setConfirmStudent(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-user-minus text-red-400"></i>
              </div>
              <h4 className="text-white font-bold">Unenroll Student</h4>
            </div>
            <p className="text-slate-300 text-sm mb-1">Are you sure you want to unenroll</p>
            <p className="text-white font-semibold text-sm">{confirmStudent.username}</p>
            <p className="text-slate-400 text-xs mt-0.5 mb-5">{confirmStudent.email}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmStudent(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnenroll}
                disabled={!!unenrollingId}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                {unenrollingId ? "Unenrolling..." : "Yes, Unenroll"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseStudentsModal;
