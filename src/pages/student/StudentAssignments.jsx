import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchStudentAssignments } from "../../store/slices/studentDashboardSlice";

const StudentAssignments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { assignments, error, isFetchingAssignments } = useSelector(
    (state) => state.studentDashboard,
  );

  useEffect(() => {
    if (!assignments?.length) {
      dispatch(fetchStudentAssignments());
    }
  }, [dispatch, assignments?.length]);

  const getStatusConfig = (assignment) => {
    if (assignment.is_overdue) {
      return {
        color: "text-red-500 bg-red-500/10",
        label: "Overdue",
      };
    }

    if (assignment.is_submitted) {
      return {
        color: "text-blue-500 bg-blue-500/10",
        label: "Submitted",
      };
    }

    return {
      color: "text-yellow-500 bg-yellow-500/10",
      label: "Pending",
    };
  };

  if (isFetchingAssignments && !assignments?.length) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-white">
        <i className="fas fa-spinner animate-spin text-2xl"></i>
      </div>
    );
  }

  if (error && !assignments?.length) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="text-white px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black font-poppins mb-2">
          All Assignments
        </h1>
        <p className="text-slate-400 text-sm">
          View and manage all your assignments in one place.
        </p>
      </div>

      {/* List */}
      <div className="space-y-4">
        {assignments?.length ? (
          assignments.map((assignment) => {
            const config = getStatusConfig(assignment);

            return (
              <div
                key={assignment.id}
                onClick={() =>
                  navigate(`/student/assignments/${assignment.id}`)
                }
                className="cursor-pointer bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500 transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-bold text-white text-lg">
                      {assignment.title}
                    </h2>

                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      {assignment.course_title}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`${config.color} px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest`}
                  >
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-400 text-sm">
            No assignments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;
