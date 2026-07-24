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
    const score = sub.score ?? sub.grade?.score ?? sub.grade;
    const max = sub.assignment_max_score || sub.max_score;
    const pct = score != null && max ? Math.round((score / max) * 100) : null;
    const color =
      pct == null
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        : pct >= 80
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          : pct >= 50
            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
            : "bg-red-500/20 text-red-300 border-red-500/30";
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-black border ${color}`}>
        <i className="fas fa-award text-[10px] opacity-80" />
        {score != null ? (max ? `${score}/${max}` : `${score}`) : "Graded"}
        {pct != null && <span className="text-[10px] font-bold opacity-70">({pct}%)</span>}
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
                        {sub.assignment_title || sub.assignment?.title || "-"}
                      </p>
                      <p className="text-xs text-indigo-400 mt-0.5">
                        {sub.course_title || sub.assignment?.course_title || "-"}
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
                        {sub.assignment_title || sub.assignment?.title || "-"}
                      </td>
                      <td className="px-5 py-4 text-indigo-400 text-sm">
                        {sub.course_title || sub.assignment?.course_title || "-"}
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
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
          onClick={closeGradeModal}
        >
          <div
            className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingSelectedSubmission || !selectedSubmission ? (
              <div className="p-16 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <i className="fas fa-spinner animate-spin text-indigo-400 text-lg"></i>
                </div>
                <p className="text-slate-400 text-sm">Loading submission…</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="relative px-6 pt-6 pb-5">
                  <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-br from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-lg font-black text-indigo-300 shrink-0">
                      {(selectedSubmission.student_name || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-bold text-white truncate">
                        {selectedSubmission.student_name || "Student"}'s Submission
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        {selectedSubmission.assignment_title && (
                          <span className="text-xs text-slate-400 flex items-center gap-1.5">
                            <i className="fas fa-file-alt text-indigo-400/70 text-[10px]" />
                            {selectedSubmission.assignment_title}
                          </span>
                        )}
                        {(selectedSubmission.assignment_max_score || selectedSubmission.max_score) && (
                          <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            <i className="fas fa-star text-yellow-500/60 text-[10px]" />
                            {selectedSubmission.assignment_max_score || selectedSubmission.max_score} pts
                          </span>
                        )}
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <i className="fas fa-clock text-[10px]" />
                          {formatDateTime(selectedSubmission.submitted_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {selectedSubmission.is_graded ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-full">
                          <i className="fas fa-check-circle text-[9px]" />
                          {(() => {
                            const score = selectedSubmission.grade?.score ?? selectedSubmission.grade;
                            const max = selectedSubmission.assignment_max_score || selectedSubmission.max_score;
                            return score != null && max
                              ? `${score}/${max} · Graded`
                              : score != null
                                ? `${score} · Graded`
                                : "Graded";
                          })()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px] font-bold rounded-full">
                          <i className="fas fa-hourglass-half text-[9px]" />
                          Pending
                        </span>
                      )}
                      <button
                        onClick={closeGradeModal}
                        aria-label="Close"
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all"
                      >
                        <i className="fas fa-times text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/60" />

                {/* Body */}
                <div className="p-6 space-y-5">
                  {/* Text answer + Attachment */}
                  <div className="space-y-4">
                    {/* Text answer */}
                    <div className="w-full rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/50">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700/50">
                        <div className="w-6 h-6 rounded-md bg-indigo-500/15 flex items-center justify-center">
                          <i className="fas fa-pencil-alt text-indigo-400 text-[10px]" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Text Answer</span>
                      </div>
                      <div className="p-4 min-h-[96px]">
                        {selectedSubmission.text_answer ? (
                          <div
                            className="submission-content text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: selectedSubmission.text_answer }}
                          />
                        ) : (
                          <span className="text-slate-500 italic text-sm">No text submitted</span>
                        )}
                      </div>
                    </div>

                    {/* Attachment */}
                    <div className="w-full rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/50">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700/50">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/15 flex items-center justify-center">
                          <i className="fas fa-paperclip text-emerald-400 text-[10px]" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Attachment</span>
                      </div>
                      <div className="p-4 min-h-[96px] flex items-center">
                        {selectedSubmission.file_url ? (
                          <DownloadButton
                            url={getStorageUrl(selectedSubmission.file_url)}
                            label="Download File"
                          />
                        ) : (
                          <p className="text-slate-500 text-xs italic">No file attached</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Grading section */}
                  <div className="border-t border-slate-800/60 pt-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                      <i className="fas fa-graduation-cap text-indigo-400/70" />
                      {selectedSubmission.grade ? "Update Grade" : "Grade This Submission"}
                    </p>

                    {/* Marks obtained — shown prominently for a graded submission */}
                    {selectedSubmission.is_graded &&
                      (() => {
                        const score =
                          selectedSubmission.grade?.score ?? selectedSubmission.grade;
                        const max =
                          selectedSubmission.assignment_max_score ||
                          selectedSubmission.max_score;
                        const pct =
                          score != null && max ? Math.round((score / max) * 100) : null;
                        return (
                          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                            <span className="inline-flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                              <i className="fas fa-award" />
                              Marks obtained
                            </span>
                            <span className="text-right whitespace-nowrap">
                              <span className="text-xl font-black text-white">
                                {score != null ? score : "-"}
                              </span>
                              <span className="text-sm text-slate-400">
                                {" "}
                                / {max != null ? max : "-"}
                              </span>
                              {pct != null && (
                                <span className="ml-2 text-xs font-bold text-emerald-400">
                                  ({pct}%)
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })()}

                    <GradingForm
                      selectedSubmission={selectedSubmission}
                      onCancel={closeGradeModal}
                      onSubmit={handleGradeSubmit}
                      assignmentMaxScore={selectedSubmission.assignment_max_score || selectedSubmission.max_score}
                      extraRowContent={null}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSubmissions;
