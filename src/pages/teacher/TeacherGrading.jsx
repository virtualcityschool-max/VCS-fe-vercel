import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  fetchMyCourses,
  fetchSubmissions,
  gradeSubmission,
  updateSubmissionsGrade,
  fetchSubmissionById,
  clearSelectedSubmission,
} from "../../store/slices/teacherSlice";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { validateFile, ACCEPT_STRING } from "../../utils/fileValidation";
import GradingForm from "../../components/teacher/GradingForm";
import { FilterSelect } from "../../components/ui";
import { coursesService } from "../../services/coursesService";
import { getStorageUrl } from "../../utils/storageUrl";
import FileViewerModal from "../../components/common/FileViewerModal";
import { useDateFormatters } from "../../hooks";

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
      {open && (
        <FileViewerModal filePath={url} handleClose={() => setOpen(false)} />
      )}
    </>
  );
};

const TeacherGrading = ({
  externalFilters,
  onFiltersChange,
  controlsContainerId,
}) => {
  const { formatDate, formatTime, formatDateTime, toDatetimeInput, toPayloadISO } = useDateFormatters();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [internalFilters, setInternalFilters] = useState({
    course: "",
    status: "published",
  });

  const filters = externalFilters || internalFilters;
  const setFilters = onFiltersChange || setInternalFilters;

  const [form, setForm] = useState({
    course: "",
    title: "",
    description: "",
    due_date: "",
    max_score: "",
    status: "published",
    file: null,
    assignmentType: "public",
    private_student_ids: [],
  });
  const [privateStudents, setPrivateStudents] = useState([]);
  const [loadingPrivateStudents, setLoadingPrivateStudents] = useState(false);
  const [pendingAssignmentId, setPendingAssignmentId] = useState(null);
  const [assignmentTotal, setAssignmentTotal] = useState(0);

  const [
    selectedAssignmentForSubmissions,
    setSelectedAssignmentForSubmissions,
  ] = useState(null);
  const isProcessingAssignmentRef = useRef(false);

  // View / Edit / Delete state
  const [viewAssignment, setViewAssignment] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const dispatch = useDispatch();
  const {
    assignments,
    myCourses,
    submissions,
    selectedSubmission,
    loadingSelectedSubmission,
    loadingAssignments,
    errorAssignments,
    loadingSubmissions,
  } = useSelector((state) => state.teachers);

  // Use useEffect to handle assignment selection when submissions arrive
  useEffect(() => {
    if (!isProcessingAssignmentRef.current && pendingAssignmentId) {
      isProcessingAssignmentRef.current = true;

      // Use setTimeout to defer setState calls and avoid lint warning
      setTimeout(() => {
        const assignment = assignments.find(
          (a) => a.id === pendingAssignmentId,
        );
        if (assignment) {
          setSelectedAssignmentForSubmissions(assignment);
          setPendingAssignmentId(null);
        }
        isProcessingAssignmentRef.current = false;
      }, 0);
    }
  }, [submissions, pendingAssignmentId, assignments]);

  useEffect(() => {
    if (!myCourses?.length) {
      dispatch(fetchMyCourses());
    }
  }, [dispatch, myCourses?.length]);

  useEffect(() => {
    dispatch(
      fetchAssignments({
        ...(filters.course ? { course: filters.course } : {}),
        status: filters.status,
      }),
    );
  }, [dispatch, filters.course, filters.status]);

  const headerActions = (
    <>
      <FilterSelect
        value={filters.course}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, course: e.target.value }))
        }
      >
        <option value="">All Courses</option>
        {myCourses?.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </FilterSelect>
      {/* <FilterSelect
        value={filters.status}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, status: e.target.value }))
        }
      >
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </FilterSelect> */}
      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap"
      >
        + Create Assignment
      </button>
    </>
  );

  const controlsContainer = controlsContainerId
    ? document.getElementById(controlsContainerId)
    : null;

  if (loadingAssignments && !assignments?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-white">
        <i className="fas fa-spinner animate-spin text-2xl"></i>
      </div>
    );
  }

  if (errorAssignments && !assignments?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-red-400">
        {errorAssignments}
      </div>
    );
  }

  const fetchPrivateStudents = async (courseId) => {
    setLoadingPrivateStudents(true);
    setPrivateStudents([]);
    try {
      const data = await coursesService.getPrivateStudents(courseId);
      const list = Array.isArray(data) ? data : data?.results || [];
      setPrivateStudents(list);
      if (list.length > 0) {
        setForm((prev) => ({
          ...prev,
          private_student_ids: [list[0].student_id],
        }));
      }
    } catch {
      toastManager.error("Failed to load private students");
    } finally {
      setLoadingPrivateStudents(false);
    }
  };

  const validateForm = () => {
    if (!form.course) return "Please select a course";

    if (!form.title.trim()) return "Title is required";
    if (form.title.trim().length < 3)
      return "Title must be at least 3 characters";

    if (!form.description.trim()) return "Description is required";
    if (form.description.trim().length < 10)
      return "Description must be at least 10 characters";

    if (!form.due_date) return "Due date is required";

    const selectedDate = new Date(toPayloadISO(form.due_date));
    if (selectedDate <= new Date()) return "Due date must be in the future";

    if (!form.max_score) return "Total marks is required";
    if (Number(form.max_score) <= 0)
      return "Total marks must be greater than 0";

    return null;
  };

  const isFormInvalid =
    !form.course ||
    !form.title ||
    !form.description ||
    !form.due_date ||
    !form.max_score;

  return (
    <div className="text-white">
      {controlsContainer &&
        ReactDOM.createPortal(headerActions, controlsContainer)}

      {/* ASSIGNMENTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments?.length ? (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="group relative glass p-6 rounded-[2rem] border-slate-800/60 hover:border-indigo-500/50 hover-lift transition-all duration-500 overflow-hidden flex flex-col h-full"
            >
              {/* Subtle gradient accent on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />

              {/* Card Header: Badges and Action Icons */}
              <div className="relative z-10 flex justify-between items-start mb-5">
                <div className="flex flex-col gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit ${
                      assignment.is_overdue
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${assignment.is_overdue ? "bg-rose-400 animate-pulse" : "bg-emerald-400"}`}
                    ></span>
                    {assignment.is_overdue ? "Overdue" : "Active"}
                  </span>
                  <p className="text-[9px] text-indigo-400/80 uppercase tracking-[0.2em] font-black">
                    {assignment.course_title}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewAssignment(assignment)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-700/50 transition-all duration-300"
                  >
                    <i className="fas fa-eye text-[10px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTarget(assignment);
                      setEditForm({
                        title: assignment.title,
                        description: assignment.description || "",
                        due_date: toDatetimeInput(assignment.due_date),
                        max_score: String(assignment.max_score),
                        status: assignment.status || "published",
                        file: null,
                      });
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-amber-600 text-slate-400 hover:text-white border border-slate-700/50 transition-all duration-300"
                  >
                    <i className="fas fa-pencil text-[10px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(assignment)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700/50 transition-all duration-300"
                  >
                    <i className="fas fa-trash text-[10px]" />
                  </button>
                </div>
              </div>

              {/* Card Body: Title & Meta Info */}
              <div className="relative z-10 mb-auto">
                <h2 className="text-lg font-bold text-white mb-4 group-hover:text-indigo-200 transition-colors line-clamp-2">
                  {assignment.title}
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-3 flex flex-col">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Submissions</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-indigo-400">{assignment.submissions_count}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Students</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-3 flex flex-col">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Marks</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-amber-400">{assignment.max_score}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Points</span>
                    </div>
                  </div>
                </div>

                {assignment.file_url && (
                  <div className="mb-4">
                    <PreviewButton
                      url={getStorageUrl(assignment.file_url)}
                      className="w-full !bg-indigo-600/10 !border-indigo-500/20 !text-indigo-400 hover:!bg-indigo-600 hover:!text-white shadow-sm !rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Card Footer: Due Date & Action */}
              <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/50">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/50 flex items-center justify-center text-rose-400/70 border border-slate-700/50">
                      <i className="far fa-calendar-alt text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Deadline</span>
                      <span className="text-xs text-slate-300 font-bold">
                        {assignment.due_date ? formatDateTime(assignment.due_date) : "No limit"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group/btn"
                  onClick={() => {
                    setPendingAssignmentId(assignment.id);
                    setAssignmentTotal(assignment.max_score);
                    dispatch(fetchSubmissions(assignment.id));
                  }}
                  disabled={loadingSubmissions && pendingAssignmentId === assignment.id}
                >
                  {loadingSubmissions && pendingAssignmentId === assignment.id ? (
                    <i className="fas fa-spinner animate-spin" />
                  ) : (
                    <>
                      <i className="fas fa-tasks text-xs transition-transform group-hover/btn:scale-110" />
                      View Submissions
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-900/50 p-16 rounded-[2.5rem] border border-slate-800 border-dashed text-center">
            <div className="w-20 h-20 bg-slate-800/30 rounded-3xl flex items-center justify-center text-slate-500 mx-auto mb-6">
              <i className="fas fa-clipboard-list text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Assignments Created</h3>
            <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
              Start by creating your first assignment or quiz for this course to begin tracking student progress.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-8 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/20"
            >
              + Create Assignment
            </button>
          </div>
        )}
      </div>

      {selectedAssignmentForSubmissions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-2xl">
            <h2 className="text-lg font-bold mb-4">
              Submissions: {selectedAssignmentForSubmissions.title}
            </h2>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {submissions?.length ? (
                submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-slate-800 p-4 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-bold">{sub.student_name}</p>
                      <p className="text-xs text-slate-400">
                        Submitted at:{" "}
                        {formatDateTime(sub.submitted_at)}
                      </p>
                    </div>

                    <button
                      className={`px-3 py-1 rounded text-xs ${
                        sub.status === "graded"
                          ? "bg-green-600"
                          : "bg-indigo-600"
                      }`}
                      onClick={() => {
                        dispatch(clearSelectedSubmission());
                        dispatch(fetchSubmissionById(sub.id));
                        setSelectedAssignment(sub.id);
                      }}
                    >
                      {sub.status === "graded" ? "Graded" : "Grade"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No submissions yet</p>
              )}
            </div>

            <button
              className="mt-4 text-sm text-slate-400"
              onClick={() => setSelectedAssignmentForSubmissions(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {loadingSelectedSubmission ? (
              <div className="text-center text-white">
                <i className="fas fa-spinner animate-spin"></i>
              </div>
            ) : selectedSubmission ? (
              <>
                {/* HEADER */}
                <h2 className="text-lg font-bold mb-4">
                  Submission by {selectedSubmission.student_name}
                </h2>

                {/* SUBMISSION INFO */}
                <div className="mb-6 text-sm text-slate-400">
                  Submitted at:{" "}
                  {formatDateTime(selectedSubmission.submitted_at)}
                </div>

                {/* TEXT ANSWER */}
                <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-start">
                  <div className="mb-6">
                    <h3 className="text-xs uppercase text-slate-500 mb-2">
                      Answer
                    </h3>
                    <div className="bg-slate-800 p-4 rounded-xl">
                      {selectedSubmission.text_answer || "No text submitted"}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">
                      Student Attachment
                    </label>
                    {selectedSubmission.file_url ? (
                        <PreviewButton 
                          url={getStorageUrl(selectedSubmission.file_url)} 
                          className="!bg-indigo-600/10 !text-indigo-400 !border-indigo-500/20 hover:!bg-indigo-600 hover:!text-white"
                        />
                      ) : (
                        <p className="text-slate-500 text-xs italic py-2">No file submitted</p>
                      )}
                  </div>
                </div>

                {/* GRADE FORM */}
                <GradingForm
                  selectedSubmission={selectedSubmission}
                  onCancel={() => {
                    setSelectedAssignment(null);
                    dispatch(clearSelectedSubmission());
                  }}
                  onSubmit={async ({ score, feedback }) => {
                    try {
                      if (selectedSubmission.grade) {
                        // UPDATE
                        await dispatch(
                          updateSubmissionsGrade({
                            submissionId: selectedSubmission.id,
                            data: {
                              score: Number(score),
                              feedback,
                            },
                          }),
                        ).unwrap();

                        toastManager.success("Grade updated");
                      } else {
                        // CREATE
                        await dispatch(
                          gradeSubmission({
                            submissionId: selectedSubmission.id,
                            data: {
                              score: Number(score),
                              feedback,
                            },
                          }),
                        ).unwrap();

                        toastManager.success("Submission graded");
                      }

                      if (selectedAssignmentForSubmissions?.id) {
                        dispatch(
                          fetchSubmissions(selectedAssignmentForSubmissions.id),
                        );
                      }
                      setSelectedAssignment(null);
                      dispatch(clearSelectedSubmission());
                    } catch (err) {
                      showApiError(err);
                    }
                  }}
                  assignmentMaxScore={assignmentTotal}
                  extraRowContent={
                    selectedSubmission.file_url ? (
                      <PreviewButton 
                        url={getStorageUrl(selectedSubmission.file_url)} 
                        className="!bg-indigo-600/10 !text-indigo-400 !border-indigo-500/20 hover:!bg-indigo-600 hover:!text-white"
                      />
                    ) : (
                      <p className="text-slate-500 text-xs italic py-2">No file submitted</p>
                    )
                  }
                />
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ── */}
      {viewAssignment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="font-bold text-white text-sm">
                Assignment Details
              </h2>
              <button
                onClick={() => setViewAssignment(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Title
                </p>
                <p className="text-white font-semibold">
                  {viewAssignment.title}
                </p>
              </div>

              {/* Course */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Course
                </p>
                <p className="text-slate-300 text-sm">
                  {viewAssignment.course_title}
                </p>
              </div>

              {/* Description */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </p>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">
                  {viewAssignment.description || "—"}
                </p>
              </div>

              {/* Meta row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/60 rounded-2xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    Total
                  </p>
                  <p className="text-white font-bold">
                    {viewAssignment.max_score}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-2xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <p
                    className={`text-xs font-bold capitalize ${viewAssignment.status === "published" ? "text-emerald-400" : "text-slate-400"}`}
                  >
                    {viewAssignment.status}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-2xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    Submissions
                  </p>
                  <p className="text-white font-bold">
                    {viewAssignment.submissions_count}
                  </p>
                </div>
              </div>

              {/* Due date */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Due Date
                </p>
                <p className="text-slate-300 text-sm">
                  {viewAssignment.due_date
                    ? formatDateTime(viewAssignment.due_date)
                    : "—"}
                </p>
              </div>

              {/* File */}
              {viewAssignment.file_url && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                    Attachment
                  </p>
                  <PreviewButton url={getStorageUrl(viewAssignment.file_url)} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editTarget && editForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col gap-1 mb-10 pb-6 border-b border-white/5 relative">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    Edit Assignment
                  </h3>
                  <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">
                    {editTarget.course_title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditTarget(null);
                    setEditForm(null);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Core Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Assignment Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        title: e.target.value.trimStart(),
                      }))
                    }
                    className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Configuration & Media */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      Due Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={editForm.due_date}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, due_date: e.target.value }))
                      }
                      className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      Total Marks <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editForm.max_score}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          max_score: e.target.value,
                        }))
                      }
                      className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Assignment Status
                  </label>
                  <div className="flex gap-2">
                    {["published", "draft"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setEditForm((p) => ({ ...p, status: s }))
                        }
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                          editForm.status === s
                            ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                            : "bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div> */}

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Attachment{" "}
                    <span className="ml-1 text-[10px] normal-case tracking-normal font-medium text-slate-600">
                      (Replace existing — Optional)
                    </span>
                  </label>

                  <div className="space-y-3">
                    {editTarget.file_url && !editForm.file && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                        <i className="fas fa-file-alt text-indigo-400" />
                        <span className="text-xs text-slate-300 flex-1 truncate">
                          Current: {editTarget.file_url.split("/").pop()}
                        </span>
                        <PreviewButton
                          url={getStorageUrl(editTarget.file_url)}
                          className="!bg-indigo-500/10"
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-4 w-full p-3.5 rounded-xl bg-slate-800/40 border border-dashed border-slate-700 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                        <i className="fas fa-paperclip text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm text-slate-400 group-hover:text-slate-200 transition-colors truncate">
                          {editForm.file
                            ? editForm.file.name
                            : "Select new file…"}
                        </span>
                      </div>
                      {editForm.file && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditForm((p) => ({ ...p, file: null }));
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all"
                        >
                          <i className="fas fa-times text-xs" />
                        </button>
                      )}
                      <input
                        type="file"
                        accept={ACCEPT_STRING}
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          e.target.value = "";
                          if (f && validateFile(f))
                            setEditForm((p) => ({ ...p, file: f }));
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end mt-12 pt-8 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setEditTarget(null);
                  setEditForm(null);
                }}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  savingEdit || !editForm.title.trim() || !editForm.max_score
                }
                onClick={async () => {
                  setSavingEdit(true);
                  try {
                    await dispatch(
                      updateAssignment({
                        id: editTarget.id,
                        data: {
                          title: editForm.title.trim(),
                          description: editForm.description.trim(),
                          due_date: toPayloadISO(editForm.due_date),
                          max_score: Number(editForm.max_score),
                          status: editForm.status,
                          ...(editForm.file ? { file: editForm.file } : {}),
                        },
                      }),
                    ).unwrap();
                    toastManager.success("Assignment updated");
                    setEditTarget(null);
                    setEditForm(null);
                  } catch (err) {
                    showApiError(err);
                  } finally {
                    setSavingEdit(false);
                  }
                }}
                className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {savingEdit ? (
                  <>
                    <i className="fas fa-spinner animate-spin text-xs" />{" "}
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-trash text-rose-400 text-sm" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Delete Assignment
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                "{deleteTarget.title}"
              </span>
              ? All submissions linked to it will also be removed.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={!!deletingId}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!deletingId}
                onClick={async () => {
                  setDeletingId(deleteTarget.id);
                  try {
                    await dispatch(deleteAssignment(deleteTarget.id)).unwrap();
                    toastManager.success("Assignment deleted");
                    setDeleteTarget(null);
                  } catch (err) {
                    showApiError(err);
                  } finally {
                    setDeletingId(null);
                  }
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl text-sm font-semibold transition flex items-center gap-2"
              >
                {deletingId && (
                  <i className="fas fa-spinner animate-spin text-xs" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col gap-1 mb-10 pb-6 border-b border-white/5 relative">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Create New Assignment
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setPrivateStudents([]);
                    setForm({
                      course: "",
                      title: "",
                      description: "",
                      due_date: "",
                      max_score: "",
                      status: "published",
                      file: null,
                      assignmentType: "public",
                      private_student_ids: [],
                    });
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
              <p className="text-slate-500 text-[13px] font-medium leading-relaxed max-w-2xl">
                Set up a new assignment by choosing the course, defining its
                scope, and setting a deadline for submissions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Basic Info */}

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Assignment Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a clear, descriptive title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value.trimStart() })
                    }
                    className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Course <span className="text-rose-500">*</span>
                  </label>
                  <FilterSelect
                    value={form.course}
                    onChange={(e) => {
                      const courseId = e.target.value;
                      setForm({
                        ...form,
                        course: courseId,
                        private_student_ids: [],
                      });
                      if (form.assignmentType === "private" && courseId) {
                        fetchPrivateStudents(courseId);
                      }
                    }}
                    className="w-full"
                  >
                    <option value="">Select Course</option>
                    {myCourses?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </FilterSelect>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      Due Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={form.due_date}
                      onChange={(e) =>
                        setForm({ ...form, due_date: e.target.value })
                      }
                      className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      Total Marks <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 100"
                      value={form.max_score}
                      onChange={(e) =>
                        setForm({ ...form, max_score: e.target.value })
                      }
                      className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
                {/* <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Assignment Type
                  </label>
                  <div className="flex gap-2">
                    {["public", "private"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, assignmentType: type, private_student_ids: [] });
                          if (type === "private" && form.course) {
                            fetchPrivateStudents(form.course);
                          }
                        }}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                          form.assignmentType === type
                            ? type === "private"
                              ? "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                              : "bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                            : "bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <i className={`fas fa-${type === "public" ? "users" : "lock"} mr-2 text-[10px]`} />
                        {type}
                      </button>
                    ))}
                  </div>
                </div> */}

                {/* Private students multi-select (only when private) */}
                {form.assignmentType === "private" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      Private Students
                      {form.private_student_ids.length > 0 && (
                        <span className="ml-2 normal-case tracking-normal font-bold text-amber-400">
                          ({form.private_student_ids.length} selected)
                        </span>
                      )}
                    </label>
                    {!form.course ? (
                      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-xs text-slate-500 italic">
                        Select a course first to view students
                      </div>
                    ) : loadingPrivateStudents ? (
                      <div className="h-[50px] bg-slate-800/40 rounded-xl animate-pulse" />
                    ) : privateStudents.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-xs text-slate-500 italic">
                        No private students enrolled in this course
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={form.private_student_ids[0] ?? ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              private_student_ids: [Number(e.target.value)],
                            })
                          }
                          className="w-full p-3.5 rounded-xl bg-slate-800 border border-amber-500/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none transition-all hover:border-amber-500/50"
                        >
                          <option value="" disabled>
                            Select a student
                          </option>
                          {privateStudents.map((s) => (
                            <option key={s.enrollment_id} value={s.student_id}>
                              {s.username}
                              {s.email ? ` — ${s.email}` : ""}
                            </option>
                          ))}
                        </select>
                        <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none text-xs" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Details & Configuration */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    placeholder="Provide clear instructions and learning objectives..."
                    rows={5}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Attachment{" "}
                    <span className="ml-1 text-[10px] normal-case tracking-normal font-medium text-slate-600">
                      (PDF, DOC, ZIP — Optional)
                    </span>
                  </label>
                  <label className="flex items-center gap-4 w-full p-3.5 rounded-xl bg-slate-800/40 border border-dashed border-slate-700 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                      <i className="fas fa-paperclip text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm text-slate-400 group-hover:text-slate-200 transition-colors truncate">
                        {form.file
                          ? form.file.name
                          : "Select a file to attach…"}
                      </span>
                      {!form.file && (
                        <span className="text-[10px] text-slate-600 uppercase font-bold tracking-tighter">
                          Max 10MB
                        </span>
                      )}
                    </div>
                    {form.file && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setForm({ ...form, file: null });
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all"
                      >
                        <i className="fas fa-times text-xs" />
                      </button>
                    )}
                    <input
                      type="file"
                      accept={ACCEPT_STRING}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        e.target.value = "";
                        if (f && validateFile(f)) setForm({ ...form, file: f });
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end mt-12 pt-8 border-t border-white/5">
              <button
                type="button"
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                onClick={() => {
                  setShowCreateModal(false);
                  setPrivateStudents([]);
                  setForm({
                    course: "",
                    title: "",
                    description: "",
                    due_date: "",
                    max_score: "",
                    status: "published",
                    file: null,
                    assignmentType: "public",
                    private_student_ids: [],
                  });
                }}
              >
                Cancel
              </button>

              <button
                disabled={savingCreate}
                className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                onClick={async () => {
                  const error = validateForm();
                  if (error) {
                    toastManager.error(error);
                    return;
                  }

                  setSavingCreate(true);
                  try {
                    await dispatch(
                      createAssignment({
                        course: Number(form.course),
                        title: form.title.trim(),
                        description: form.description.trim(),
                        due_date: toPayloadISO(form.due_date),
                        max_score: Number(form.max_score),
                        status: form.status,
                        ...(form.file ? { file: form.file } : {}),
                        ...(form.assignmentType === "private"
                          ? { private_student_ids: form.private_student_ids }
                          : {}),
                      }),
                    ).unwrap();
                    toastManager.success("Assignment created");
                    setShowCreateModal(false);
                    setPrivateStudents([]);
                    dispatch(
                      fetchAssignments({
                        ...(filters.course ? { course: filters.course } : {}),
                        status: filters.status,
                      }),
                    );
                    setForm({
                      course: "",
                      title: "",
                      description: "",
                      due_date: "",
                      max_score: "",
                      status: "published",
                      file: null,
                      assignmentType: "public",
                      private_student_ids: [],
                    });
                  } catch (err) {
                    showApiError(err);
                  } finally {
                    setSavingCreate(false);
                  }
                }}
              >
                {savingCreate ? (
                  <>
                    <i className="fas fa-spinner animate-spin text-xs" />{" "}
                    Processing…
                  </>
                ) : (
                  "Create Assignment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherGrading;
