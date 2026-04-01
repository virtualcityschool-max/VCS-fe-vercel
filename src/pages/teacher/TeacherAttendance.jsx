import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeacherDashboard } from "../../store/slices/teacherSlice";

const TeacherAttendance = () => {
  const dispatch = useDispatch();
  const { dashboard, loading, error } = useSelector((state) => state.teachers);

  useEffect(() => {
    if (!dashboard) {
      dispatch(fetchTeacherDashboard());
    }
  }, [dispatch, dashboard]);

  if (loading && !dashboard) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-white">
        <i className="fas fa-spinner animate-spin text-2xl"></i>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-black font-poppins mb-2">
          Attendance Insights
        </h1>
        <p className="text-slate-400 text-sm">
          Monitor attendance trends and identify at-risk students.
        </p>
      </div>

      {/* Risk Alerts */}
      <div className="space-y-4">
        {dashboard?.risk_alerts?.length ? (
          dashboard.risk_alerts.map((alert, i) => (
            <div
              key={`${alert.student_id}-${i}`}
              className="bg-slate-900 p-6 rounded-3xl border border-rose-500/20 hover:border-rose-500 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{alert.student_name}</p>
                  <p className="text-xs text-rose-400 uppercase tracking-widest">
                    {alert.alert_type.replaceAll("_", " ")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {alert.course_title}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-rose-500 font-bold text-sm">
                    {alert.attendance_percentage}%
                  </p>
                  <p className="text-[10px] text-slate-500">Attendance</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-400 text-sm">
            No attendance risks detected (Attendence API Integration Pending)
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
