import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssignments } from "../../store/slices/teacherSlice";

const TeacherGrading = () => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const dispatch = useDispatch();
  const { assignments, loading, error } = useSelector(
    (state) => state.teachers,
  );

  useEffect(() => {
    if (!assignments?.length) {
      dispatch(fetchAssignments());
    }
  }, [dispatch, assignments?.length]);

  if (loading && !assignments?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-white">
        <i className="fas fa-spinner animate-spin text-2xl"></i>
      </div>
    );
  }

  if (error && !assignments?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-black font-poppins mb-2">Grading</h1>
        <p className="text-slate-400 text-sm">
          Review assignments and move into grading workflows.
        </p>
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
                    onClick={() => setSelectedAssignment(assignment)}
                  >
                    Grade
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

      {/* Grade Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              Grade: {selectedAssignment.title}
            </h2>

            <input
              type="number"
              placeholder="Score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />

            <textarea
              placeholder="Feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-slate-700 rounded-xl"
                onClick={() => {
                  setSelectedAssignment(null);
                  setScore("");
                  setFeedback("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 rounded-xl"
                onClick={() => {
                  console.log("Grade submission:", {
                    assignmentId: selectedAssignment.id,
                    score,
                    feedback,
                  });

                  setSelectedAssignment(null);
                  setScore("");
                  setFeedback("");
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherGrading;
