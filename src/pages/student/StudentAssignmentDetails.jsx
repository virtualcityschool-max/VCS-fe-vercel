import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { studentService } from "../../services/studentService";
import { submitAssignment } from "../../store/slices/studentDashboardSlice";
import { toastManager } from "../../utils/toastManager";
import { validateFile, ACCEPT_STRING } from "../../utils/fileValidation";
import { getStorageUrl } from "../../utils/storageUrl";
import FileViewerModal from "../../components/common/FileViewerModal";

const PreviewButton = ({ url, className = "" }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/40 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition border border-slate-600/30 ${className}`}
      >
        <i className="fas fa-eye text-[10px]" />
        Preview
      </button>
      {open && <FileViewerModal filePath={url} handleClose={() => setOpen(false)} />}
    </>
  );
};

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
      const { response } = await dispatch(
        submitAssignment({
          assignmentId: assignment.id,
          submissionData: { text_answer: answer.trim(), file: file },
        }),
      ).unwrap();

      const sub = response.submission ?? response;
      toastManager.success("Assignment submitted successfully");
      setAssignment((prev) =>
        prev
          ? {
              ...prev,
              is_submitted: true,
              my_submission: {
                text_answer: sub.text_answer ?? answer.trim(),
                file: sub.file ?? null,
                submitted_at: sub.submitted_at ?? new Date().toISOString(),
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
      toastManager.error(err?.message || "Failed to submit assignment");
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
          onClick={() => navigate("/student/assessments?tab=assignments")}
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
    <div className="text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => navigate("/student/assessments?tab=assignments")}
              className="group flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-400 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:bg-indigo-500/10">
                <i className="fas fa-arrow-left text-[10px]"></i>
              </div>
              Back to Assignments
            </button>
            <div>
              <h1 className="text-4xl font-black font-poppins leading-tight">
                {assignment.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-slate-400 font-medium">
                  {assignment.course_title}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
                {/* <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Status</span> */}
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                    isOverdue
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : isSubmitted
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}
                >
                  {isOverdue ? "Overdue" : isSubmitted ? "Submitted" : "Pending"}
                </span>
             </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Description & Submission */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <div className="glass p-8 rounded-[1.5rem] border-slate-800 shadow-2xl relative overflow-hidden group">
              {/* <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                <i className="fas fa-file-alt text-8xl" />
              </div> */}
              
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-indigo-400 mb-6 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                Description
              </h2>
              
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base font-medium">
                {assignment.description}
              </div>
              
              {assignment.file_url && (
                <div className="mt-8 pt-6 border-t border-slate-800/50">
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-3">Attachment</p>
                  <PreviewButton 
                    url={getStorageUrl(assignment.file_url)} 
                    className="!bg-indigo-600/10 !text-indigo-400 !border-indigo-500/20 hover:!bg-indigo-600 hover:!text-white"
                  />
                </div>
              )}
            </div>

            {/* Submission Section */}
            <div className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-indigo-400 px-4 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                Your Submission
              </h2>

              {isSubmitted ? (
                <div className="space-y-6">
                  {/* Submission Card */}
                  <div className="glass p-8 rounded-[1.5rem] border-slate-800/50 space-y-6">
                    {assignment.my_submission?.text_answer ? (
                      <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-6 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {assignment.my_submission.text_answer}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                         <i className="fas fa-comment-slash text-2xl mb-3 opacity-20" />
                         <p className="text-sm italic">No text provided with submission</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {(assignment.my_submission?.file_url || assignment.my_submission?.file) && (
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] text-slate-500 uppercase font-black">Submitted File</span>
                          <PreviewButton
                            url={getStorageUrl(assignment.my_submission.file_url ?? assignment.my_submission.file)}
                            className="!bg-emerald-500/10 !text-emerald-400 !border-emerald-500/20"
                          />
                        </div>
                      )}

                      {assignment.my_submission?.submitted_at && (
                        <div className="flex items-center gap-3 bg-slate-800/30 px-4 py-2 rounded-xl border border-slate-800/50">
                          <i className="fas fa-calendar-check text-indigo-400/70 text-xs"></i>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase font-black">Submitted On</span>
                            <span className="text-xs text-slate-300 font-bold">
                              {new Date(assignment.my_submission.submitted_at).toLocaleDateString(undefined, { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grading Feedback Card */}
                  {assignment.my_submission?.is_graded ? (
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[1.5rem] p-8 space-y-6 shadow-2xl shadow-emerald-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                            <i className="fas fa-award text-2xl"></i>
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-emerald-400 leading-none mb-1">Evaluation Complete</h3>
                            <p className="text-xs text-emerald-500/60 font-bold uppercase tracking-widest">Well done!</p>
                          </div>
                        </div>
                      </div>
                      
                      {assignment.my_submission.feedback && (
                        <div className="bg-slate-950/30 border border-emerald-500/10 rounded-xl p-4 text-slate-300 text-sm leading-relaxed font-medium">
                          {assignment.my_submission.feedback}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-[1.5rem] p-6 flex items-center gap-4 text-indigo-300 shadow-xl">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <i className="fas fa-hourglass-half animate-spin-slow"></i>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-black text-sm uppercase tracking-widest">Pending Grading</p>
                        <p className="text-indigo-400/60 text-xs">Your teacher will review your submission soon.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : isOverdue ? (
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-[1.5rem] p-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto shadow-xl">
                    <i className="fas fa-clock text-3xl animate-pulse"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-2">Submissions Closed</h3>
                    <p className="text-rose-400/70 max-w-sm mx-auto text-sm font-medium leading-relaxed">
                      This assignment is overdue. Unfortunately, the deadline has passed and submissions are no longer accepted.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={8}
                    className="w-full glass bg-slate-900/40 border border-slate-800 rounded-[1.5rem] p-6 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-base"
                    placeholder="Write your submission response here..."
                  />
                  
                  <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                    <div className="flex-1 relative group">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPT_STRING}
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      <div className="h-full min-h-[50px] bg-slate-900/40 border border-dashed border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 transition-all duration-300 group-hover:bg-indigo-500/[0.03] group-hover:border-indigo-500/40 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="flex items-center gap-2.5 relative z-10 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg shrink-0">
                            <i className="fas fa-cloud-upload-alt text-[10px]"></i>
                          </div>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors whitespace-nowrap">
                              {file ? "Change" : "Attach"}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {["pdf", "docx", "zip"].map((type) => (
                                <span key={type} className="text-[7px] font-black px-1 py-0.5 rounded-md bg-slate-950/80 text-slate-500 border border-white/5 uppercase tracking-tighter group-hover:text-indigo-400/70 transition-all">
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {file && (
                          <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 animate-fadeIn relative z-10 truncate max-w-[120px] ml-auto">
                            {file.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmittingAssignment}
                      className="sm:w-36 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 px-6 py-3 shrink-0"
                    >
                      {isSubmittingAssignment ? (
                        <i className="fas fa-spinner animate-spin text-[10px]"></i>
                      ) : (
                        <i className="fas fa-paper-plane text-[9px]"></i>
                      )}
                      <span>{isSubmittingAssignment ? "Wait" : "Submit"}</span>
                    </button>
                  </div>

                  {file && (
                    <div className="animate-scaleIn flex items-center justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-6 py-4 shadow-xl">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                           <i className="fas fa-file-pdf text-xl"></i>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-black uppercase">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="shrink-0 w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        title="Remove file"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Information Sidebar */}
          <div className="space-y-6">
            <div className="glass rounded-[1.5rem] border-slate-800 overflow-hidden divide-y divide-slate-800/50 shadow-2xl">
              {/* Due Date Info */}
              <div className="p-6 flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <i className="far fa-calendar-alt text-xl"></i>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">
                    Due Date
                  </p>
                  <p className="text-sm text-white font-bold leading-none">
                    {new Date(assignment.due_date).toLocaleDateString(undefined, { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(assignment.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Marks Info */}
              <div className="p-6 flex items-center gap-4 group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                  assignment.my_submission?.is_graded ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
                }`}>
                  <i className={`fas ${assignment.my_submission?.is_graded ? "fa-check-double" : "fa-star"} text-xl`}></i>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">
                    {assignment.my_submission?.is_graded ? "Marks Obtained" : "Total Marks"}
                  </p>
                  <p className="text-sm text-white font-bold leading-none">
                    {assignment.my_submission?.is_graded ? (
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-emerald-400 text-lg">{assignment.my_submission.score}</span>
                        <span className="text-slate-600 text-[14px] text-white">/ {assignment.max_score}</span>
                      </span>
                    ) : (
                      `${assignment.max_score} Points`
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {assignment.my_submission?.is_graded ? "Evaluation result" : "Maximum grade"}
                  </p>
                </div>
              </div>

              {/* Posted By Info */}
              <div className="p-6 flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                  <i className="fas fa-user-tie text-xl"></i>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">
                    Posted By
                  </p>
                  <p className="text-sm text-white font-bold leading-none">
                    {assignment.created_by_name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Subject Teacher</p>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6 flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                  <i className="fas fa-book text-xl"></i>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">
                    Subject / Course
                  </p>
                  <p className="text-sm text-white font-bold leading-none">
                    {assignment.course_title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Enrolled Course</p>
                </div>
              </div>
            </div>

            {/* Hint / Helper Card */}
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[1.5rem] p-6 relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Study Tip</h4>
                  <p className="text-xs text-indigo-300/80 leading-relaxed font-medium">
                    Review the description carefully and ensure your file format is correct before submitting. Good luck!
                  </p>
               </div>
               <i className="fas fa-lightbulb absolute -bottom-2 -right-2 text-6xl text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors rotate-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentDetails;
