import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSubmissions,
  fetchMyCourses,
  fetchSubmissionById,
  gradeSubmission,
  updateSubmissionsGrade,
  clearSelectedSubmission,
} from "../../store/slices/teacherSlice";
import { FilterSelect } from "../../components/ui";
import GradingForm from "../../components/teacher/GradingForm";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { getStorageUrl } from "../../utils/storageUrl";
import { useDateFormatters } from "../../hooks";

const getFilename = (url) => {
  if (!url) return "attachment";
  return url.split("/").pop() || "attachment";
};

const DownloadButton = ({ url, label = "Download Attachment", className = "" }) => (
  <a
    href={url}
    download={getFilename(url)}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition border border-indigo-500/30 ${className}`}
  >
    <i className="fas fa-download text-[10px]"></i>
    {label}
  </a>
);

const TeacherSubmissions = () => {
  const dispatch = useDispatch();
  const { formatDateTime } = useDateFormatters();
  const {
    allSubmissions,
    loadingAllSubmissions,
    myCourses,
    selectedSubmission,
    loadingSelectedSubmission,
  } = useSelector((state) => state.teachers);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [gradingId, setGradingId] = useState(null); // submission id whose modal is open

  useEffect(() => {
    dispatch(fetchMyCourses());
  }, [dispatch]);

  useEffect(() => {
    const params = selectedCourse ? { course: selectedCourse } : {};
    dispatch(fetchAllSubmissions(params));
  }, [dispatch, selectedCourse]);

  const openGradeModal = (submissionId) => {
    dispatch(clearSelectedSubmission()); // prevent stale data flash
    setGradingId(submissionId);
    dispatch(fetchSubmissionById(submissionId));
  };

  const closeGradeModal = () => {
    setGradingId(null);
    dispatch(clearSelectedSubmission());
  };

  const handleGradeSubmit = async ({ score, feedback }) => {
    if (!selectedSubmission) return;
    try {
      if (selectedSubmission.grade) {
        await dispatch(
          updateSubmissionsGrade({
            submissionId: selectedSubmission.id,
            data: { score: Number(score), feedback },
          }),
        ).unwrap();
        toastManager.success("Grade updated");
      } else {
        await dispatch(
          gradeSubmission({
            submissionId: selectedSubmission.id,
            data: { score: Number(score), feedback },
          }),
        ).unwrap();
        toastManager.success("Submission graded");
      }
      closeGradeModal();
      // Refresh list so is_graded reflects the change
      const params = selectedCourse ? { course: selectedCourse } : {};
      dispatch(fetchAllSubmissions(params));
    } catch (err) {
      showApiError(err);
    }
  };


  const getGradeBadge = (sub) => {
    if (!sub.is_graded) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
          Pending
        </span>
      );
    }
    const score = sub.grade?.score ?? sub.grade;
    const max = sub.assignment_max_score || sub.max_score || 100;
    const pct = score != null ? Math.round((score / max) * 100) : null;
    const color =
      pct == null
        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
        : pct >= 80
          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
          : pct >= 50
            ? "bg-blue-500/20 text-blue-400 border-blue-500/20"
            : "bg-red-500/20 text-red-400 border-red-500/20";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
        {score != null ? `${score}/${max}` : "Graded"}
      </span>
    );
  };

  const courses = Array.isArray(myCourses) ? myCourses : [];
  const submissions = Array.isArray(allSubmissions) ? allSubmissions : [];
  const gradedCount = submissions.filter((s) => s.is_graded).length;
  const pendingCount = submissions.length - gradedCount;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Student Submissions</h1>
          <p className="text-slate-400 text-sm mt-0.5">All submissions across your courses</p>
        </div>

        <div className="flex items-center gap-2">
          <FilterSelect
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="min-w-[200px]"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </FilterSelect>
          {selectedCourse && (
            <button
              onClick={() => setSelectedCourse("")}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700/70 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-sm transition-all"
            >
              <i className="fas fa-times text-xs"></i>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      {!loadingAllSubmissions && submissions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: submissions.length, icon: "fa-file-alt", color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Graded", value: gradedCount, icon: "fa-check-circle", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Pending", value: pendingCount, icon: "fa-clock", color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Courses", value: new Set(submissions.map((s) => s.course_id || s.assignment?.course)).size, icon: "fa-book-open", color: "text-purple-400", bg: "bg-purple-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <i className={`fas ${stat.icon} ${stat.color}`}></i>
              </div>
              <div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loadingAllSubmissions ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  {["Student", "Assignment", "Course", "Submitted At", "Status", "Action"].map((h) => (
                    <th key={h} className="px-5 py-4 text-xs font-black uppercase text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-700 rounded w-28"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-inbox text-slate-400 text-xl"></i>
            </div>
            <p className="text-white font-bold mb-1">No Submissions Found</p>
            <p className="text-slate-400 text-sm">
              {selectedCourse ? "No submissions for the selected course." : "No student submissions yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-slate-800/50">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-4 hover:bg-slate-800/30 transition">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white text-sm">
                          {sub.student_name || sub.student?.username || `Student #${sub.student}`}
                        </p>
                        {sub.student_id && (
                          <span className="text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded font-bold">
                            #{sub.student_id}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sub.assignment_title || sub.assignment?.title || "—"}
                      </p>
                      <p className="text-xs text-indigo-400 mt-0.5">
                        {sub.course_title || sub.assignment?.course_title || "—"}
                      </p>
                    </div>
                    {getGradeBadge(sub)}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500">
                      <i className="fas fa-calendar mr-1"></i>
                      {formatDateTime(sub.submitted_at || sub.created_at)}
                    </p>
                    <button
                      onClick={() => openGradeModal(sub.id)}
                      className={`px-3 py-1 text-white text-xs font-bold rounded-lg transition ${
                        sub.is_graded ? "bg-emerald-700 hover:bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-500"
                      }`}
                    >
                      <i className={`fas ${sub.is_graded ? "fa-eye" : "fa-pen"} mr-1`}></i>
                      {sub.is_graded ? "View" : "Grade"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Student</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Assignment</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Course</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Submitted At</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Status</th>
                    <th className="px-5 py-4 text-xs font-black uppercase text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-indigo-600/20 rounded-full flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                            {(sub.student_name || sub.student?.username || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-white text-sm">
                              {sub.student_name || sub.student?.username || `Student #${sub.student}`}
                            </span>
                            {sub.student_id && (
                              <p className="text-[10px] text-slate-500 mt-0.5">ID #{sub.student_id}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm">
                        {sub.assignment_title || sub.assignment?.title || "—"}
                      </td>
                      <td className="px-5 py-4 text-indigo-400 text-sm">
                        {sub.course_title || sub.assignment?.course_title || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-sm">
                        {formatDateTime(sub.submitted_at || sub.created_at)}
                      </td>
                      <td className="px-5 py-4">{getGradeBadge(sub)}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openGradeModal(sub.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-lg transition active:scale-95 ${
                            sub.is_graded
                              ? "bg-emerald-700 hover:bg-emerald-600"
                              : "bg-indigo-600 hover:bg-indigo-500"
                          }`}
                        >
                          <i className={`fas ${sub.is_graded ? "fa-eye" : "fa-pen"} text-[10px]`}></i>
                          {sub.is_graded ? "View" : "Grade"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Grade modal */}
      {gradingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {loadingSelectedSubmission || !selectedSubmission ? (
              <div className="p-16 flex flex-col items-center justify-center text-white gap-3">
                <i className="fas fa-spinner animate-spin text-2xl text-indigo-400"></i>
                <p className="text-slate-400 text-sm">Loading submission…</p>
              </div>
            ) : (
              <div className="p-8">
                {/* Modal header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {selectedSubmission.student_name}'s Submission
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedSubmission.assignment_title || "Assignment"} •{" "}
                      Submitted {formatDateTime(selectedSubmission.submitted_at)}
                    </p>
                  </div>
                  <button
                    onClick={closeGradeModal}
                    className="text-slate-500 hover:text-white transition"
                  >
                    <i className="fas fa-times text-lg"></i>
                  </button>
                </div>

                {/* Text answer */}
                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Answer</h3>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.text_answer || (
                      <span className="text-slate-500 italic">No text submitted</span>
                    )}
                  </div>
                </div>

                {/* Grading form */}
                <GradingForm
                  selectedSubmission={selectedSubmission}
                  onCancel={closeGradeModal}
                  onSubmit={handleGradeSubmit}
                  assignmentMaxScore={selectedSubmission.assignment_max_score || selectedSubmission.max_score}
                  extraRowContent={
                    selectedSubmission.file_url ? (
                      <DownloadButton 
                        url={getStorageUrl(selectedSubmission.file_url)} 
                        label="Download File" 
                        className="!bg-indigo-600/10 !text-indigo-400 !border-indigo-500/20 hover:!bg-indigo-600 hover:!text-white"
                      />
                    ) : (
                      <p className="text-slate-500 text-xs italic py-2">No file submitted</p>
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSubmissions;
