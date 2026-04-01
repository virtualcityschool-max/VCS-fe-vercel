import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssignments } from "../../store/slices/teacherSlice";

const TeacherGrading = () => {
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

      <div className="space-y-4">
        {assignments?.length ? (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500 transition"
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
                  <p className="text-[10px] text-slate-500 mt-1">
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </p>
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
    </div>
  );
};

export default TeacherGrading;
