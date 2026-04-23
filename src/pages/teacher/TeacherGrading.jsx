import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssignments,
  createAssignment,
  fetchMyCourses,
  fetchSubmissions,
  gradeSubmission,
  updateSubmissionsGrade,
  fetchSubmissionById,
  clearSelectedSubmission,
} from "../../store/slices/teacherSlice";
import { toastManager } from "../../utils/toastManager";
import { validateFile, ACCEPT_STRING } from "../../utils/fileValidation";
import GradingForm from "../../components/teacher/GradingForm";
import { FilterSelect } from "../../components/ui";

const TeacherGrading = () => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    course: "",
    status: "published",
  });
  const [form, setForm] = useState({
    course: "",
    title: "",
    description: "",
    due_date: "",
    max_score: "",
    status: "published",
    file: null,
  });
  const [pendingAssignmentId, setPendingAssignmentId] = useState(null);
  const [
    selectedAssignmentForSubmissions,
    setSelectedAssignmentForSubmissions,
  ] = useState(null);
  const isProcessingAssignmentRef = useRef(false);

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

  const validateForm = () => {
    if (!form.course) return "Please select a course";

    if (!form.title.trim()) return "Title is required";
    if (form.title.trim().length < 3)
      return "Title must be at least 3 characters";

    if (!form.description.trim()) return "Description is required";
    if (form.description.trim().length < 10)
      return "Description must be at least 10 characters";

    if (!form.due_date) return "Due date is required";

    const selectedDate = new Date(form.due_date);
    const now = new Date();

    if (selectedDate <= now) return "Due date must be in the future";

    if (!form.max_score) return "Max score is required";
    if (Number(form.max_score) <= 0) return "Max score must be greater than 0";

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
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black font-poppins mb-2">
            My Assignments
          </h1>
          <p className="text-slate-400 text-sm">
            Review assignments and move into grading workflows.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl text-xs font-bold"
        >
          + Create Assignment
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <FilterSelect
          value={filters.course}
          onChange={(e) => setFilters((prev) => ({ ...prev, course: e.target.value }))}
        >
          <option value="">All Courses</option>
          {myCourses?.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </FilterSelect>
      </div>

      {/* ASSIGNMENTS LIST */}
      <div className="space-y-4">
        {assignments?.length ? (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500 transition transform hover:-translate-y-1 "
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-white">{assignment.title}</h2>

                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                    {assignment.course_title}
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    {assignment.submissions_count} submissions • Max Score{" "}
                    {assignment.max_score}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xs font-bold ${
                      assignment.is_overdue
                        ? "text-rose-500"
                        : "text-emerald-400"
                    }`}
                  >
                    {assignment.is_overdue ? "Overdue" : "Active"}
                  </p>

                  <button
                    type="button"
                    className="mt-3 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-xs font-bold transition"
                    onClick={() => {
                      setPendingAssignmentId(assignment.id);
                      dispatch(fetchSubmissions(assignment.id));
                    }}
                    disabled={
                      loadingSubmissions &&
                      pendingAssignmentId === assignment.id
                    }
                  >
                    {loadingSubmissions &&
                    pendingAssignmentId === assignment.id ? (
                      <i className="fas fa-spinner animate-spin"></i>
                    ) : (
                      "View Submissions"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-400 text-sm">
            No assignments available.
          </div>
        )}
      </div>

      {selectedAssignmentForSubmissions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
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
                        {new Date(sub.submitted_at).toLocaleString()}
                      </p>
                    </div>

                    <button
                      className="bg-indigo-600 px-3 py-1 rounded text-xs"
                      onClick={() => {
                        dispatch(clearSelectedSubmission());
                        dispatch(fetchSubmissionById(sub.id));
                        setSelectedAssignment(sub.id);
                      }}
                    >
                      Grade
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
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
                  {new Date(selectedSubmission.submitted_at).toLocaleString()}
                </div>

                {/* TEXT ANSWER */}
                <div className="mb-6">
                  <h3 className="text-xs uppercase text-slate-500 mb-2">
                    Answer
                  </h3>
                  <div className="bg-slate-800 p-4 rounded-xl">
                    {selectedSubmission.text_answer || "No text submitted"}
                  </div>
                </div>

                {/* FILE */}
                <div className="mb-6">
                  <h3 className="text-xs uppercase text-slate-500 mb-2">
                    Attachment
                  </h3>

                  {selectedSubmission.file ? (
                    <a
                      href={selectedSubmission.file}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 underline text-sm"
                    >
                      View Attachment
                    </a>
                  ) : (
                    <p className="text-slate-500 text-sm">No file submitted</p>
                  )}
                </div>

                {/* GRADE FORM */}
                <GradingForm
                  selectedSubmission={selectedSubmission}
                  onCancel={() => { setSelectedAssignment(null); dispatch(clearSelectedSubmission()); }}
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

                      setSelectedAssignment(null);
                      dispatch(clearSelectedSubmission());
                    } catch (err) {
                      toastManager.error(err?.message || "Failed to grade");
                    }
                  }}
                />
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Create Assignment</h2>

            <FilterSelect
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className="w-full mb-4"
            >
              <option value="">Select Course</option>
              {myCourses?.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </FilterSelect>

            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value.trimStart() })
              }
              className="w-full mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />

            <input
              type="datetime-local"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />

            <input
              type="number"
              min={1}
              placeholder="Max Score"
              value={form.max_score}
              onChange={(e) => setForm({ ...form, max_score: e.target.value })}
              className="w-full mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />

            {/* File attachment */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Attachment <span className="text-slate-600 normal-case tracking-normal font-normal">(PDF or Word — optional)</span>
              </label>
              <label className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:border-indigo-500 transition group">
                <i className="fas fa-paperclip text-slate-500 group-hover:text-indigo-400 transition"></i>
                <span className="text-sm text-slate-400 truncate flex-1">
                  {form.file ? form.file.name : "Click to upload file…"}
                </span>
                {form.file && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setForm({ ...form, file: null }); }}
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <i className="fas fa-times text-xs"></i>
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

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-slate-700 rounded-xl"
                onClick={() => { setShowCreateModal(false); setForm({ course: "", title: "", description: "", due_date: "", max_score: "", status: "published", file: null }); }}
              >
                Cancel
              </button>

              <button
                disabled={isFormInvalid}
                className="px-4 py-2 bg-indigo-600 rounded-xl disabled:opacity-50"
                onClick={async () => {
                  const error = validateForm();

                  if (error) {
                    toastManager.error(error);
                    return;
                  }

                  try {
                    await dispatch(
                      createAssignment({
                        course: Number(form.course),
                        title: form.title.trim(),
                        description: form.description.trim(),
                        due_date: form.due_date,
                        max_score: Number(form.max_score),
                        status: form.status,
                        ...(form.file ? { file: form.file } : {}),
                      }),
                    ).unwrap();

                    toastManager.success("Assignment created");

                    setShowCreateModal(false);
                    setForm({
                      course: "",
                      title: "",
                      description: "",
                      due_date: "",
                      max_score: "",
                      status: "published",
                      file: null,
                    });
                  } catch (err) {
                    toastManager.error(
                      err?.error ||
                        err?.message ||
                        "Failed to create assignment",
                    );
                  }
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherGrading;
