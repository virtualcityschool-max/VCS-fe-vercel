import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { studentService } from "../../services/studentService";
import { submitAssignment } from "../../store/slices/studentDashboardSlice";
import { toastManager } from "../../utils/toastManager";
import { validateFile, ACCEPT_STRING } from "../../utils/fileValidation";

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
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition border border-indigo-500/30 ${className}`}
  >
    <i className="fas fa-download"></i>
    {label}
  </a>
);

const StudentAssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const { isSubmittingAssignment } = useSelector(
    (state) => state.studentDashboard,
  );

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (validateFile(selectedFile)) setFile(selectedFile);
  };

  useEffect(() => {
    const loadAssignment = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await studentService.getAssignmentById(id);
        setAssignment(data);
      } catch (err) {
        setError(err?.message || "Failed to load assignment details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAssignment();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!answer.trim() && !file) {
      toastManager.error("Provide text or upload a file");
      return;
    }

    try {
      await dispatch(
        submitAssignment({
          assignmentId: assignment.id,
          submissionData: { text_answer: answer.trim(), file: file },
        }),
      ).unwrap();

      toastManager.success("Assignment submitted successfully");
      setAssignment((prev) =>
        prev
          ? {
              ...prev,
              is_submitted: true,
              my_submission: {
                text_answer: answer.trim(),
                file: null,
                submitted_at: new Date().toISOString(),
                is_graded: false,
                score: null,
                feedback: null,
              },
            }
          : prev,
      );
      setAnswer("");
      setFile(null);
    } catch (err) {
      showApiError(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-white">
        <i className="fas fa-spinner animate-spin text-2xl"></i>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
        <p className="text-red-400 mb-4">{error || "Assignment not found."}</p>
        <button
          type="button"
          onClick={() => navigate("/student/assignments")}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl"
        >
          Back to Assignments
        </button>
      </div>
    );
  }

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isOverdue = assignment.is_overdue;
  const isSubmitted = assignment.is_submitted;

  return (
    <div className="text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/student/assignments")}
          className="mb-6 text-sm text-slate-400 hover:text-white transition"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Assignments
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-black font-poppins mb-2">
                {assignment.title}
              </h1>
              <p className="text-slate-400 text-sm">
                {assignment.course_title}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  isOverdue
                    ? "bg-red-500/10 text-red-400"
                    : isSubmitted
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {isOverdue ? "Overdue" : isSubmitted ? "Submitted" : "Pending"}
              </span>

              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-300">
                Total marks: {assignment.max_score}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">
                Description
              </h2>
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 text-slate-300 leading-relaxed whitespace-pre-wrap">
                {assignment.description}
              </div>
              {assignment.file && (
                <div className="mt-3">
                  <DownloadButton url={assignment.file} label="Download Assignment File" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                  Due Date
                </p>
                <p className="text-sm text-white">
                  {new Date(assignment.due_date).toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                  Posted By
                </p>
                <p className="text-sm text-white">
                  {assignment.created_by_name}
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                  Course
                </p>
                <p className="text-sm text-white">{assignment.course_title}</p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">
                Submission
              </h2>

              {isSubmitted ? (
                <div className="space-y-4">
                  {/* Submission content */}
                  <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Your Submission</h3>
                      <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400">
                        Submitted
                      </span>
                    </div>

                    {assignment.my_submission?.text_answer ? (
                      <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {assignment.my_submission.text_answer}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm italic">No text submitted</p>
                    )}

                    {assignment.my_submission?.file && (
                      <DownloadButton
                        url={assignment.my_submission.file}
                        label="Download My Submission"
                      />
                    )}

                    {assignment.my_submission?.submitted_at && (
                      <p className="text-xs text-slate-500">
                        <i className="fas fa-clock mr-1"></i>
                        Submitted on{" "}
                        {new Date(assignment.my_submission.submitted_at).toLocaleString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>

                  {/* Grade result */}
                  {assignment.my_submission?.is_graded ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-check-circle text-emerald-400"></i>
                        <h3 className="text-sm font-bold text-emerald-400">Graded</h3>
                        {assignment.my_submission.score != null && (
                          <span className="ml-auto text-white font-black text-lg">
                            {assignment.my_submission.score}
                            <span className="text-slate-400 font-normal text-sm">/{assignment.max_score}</span>
                          </span>
                        )}
                      </div>
                      {assignment.my_submission.feedback && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Feedback</p>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {assignment.my_submission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3 text-yellow-300 text-sm">
                      <i className="fas fa-hourglass-half"></i>
                      Awaiting grade from your teacher.
                    </div>
                  )}
                </div>
              ) : isOverdue ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-300">
                  This assignment is overdue. Submissions are closed.
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                    placeholder="Write your submission here..."
                  />
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPT_STRING}
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-300 cursor-pointer hover:bg-slate-700 transition">
                      Choose File
                    </div>
                  </div>
                  {file && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="shrink-0 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmittingAssignment}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingAssignment
                        ? "Submitting..."
                        : "Submit Assignment"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentDetails;
