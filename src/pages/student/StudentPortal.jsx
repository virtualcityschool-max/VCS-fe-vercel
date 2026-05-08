import React, { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchStudentDashboard,
  selectDashboardLoading,
  selectDashboardError,
  clearError,
} from "../../store/slices/studentDashboardSlice";
import {
  DashboardHeader,
  NextSessionCard,
  OverdueAssignmentsCard,
  LiveScheduleList,
  CourseProgressGrid,
  AssignmentOverviewList,
  MyAttendanceList,
} from "../../components/studentDashboard";

const StudentPortal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const [hasMounted, setHasMounted] = useState(false);

  // Ensure component has mounted on client
  useEffect(() => {
    setTimeout(() => setHasMounted(true), 0);
  }, []);

  // Fetch dashboard data on component mount
  useEffect(() => {
    if (hasMounted) {
      console.log("🚀 Student Portal: Fetching dashboard data...");
      dispatch(fetchStudentDashboard());
    }
  }, [dispatch, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;

    // const interval = setInterval(() => {
    //   dispatch(fetchStudentDashboard());
    // }, 3000);

    // return () => clearInterval(interval);
  }, [dispatch, hasMounted]);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    console.log("🔄 Student Portal: Retrying dashboard fetch...");
    dispatch(clearError());
    dispatch(fetchStudentDashboard());
  }, [dispatch]);

  // Show loading state while mounting or loading
  if (!hasMounted || isLoading) {
    return (
      <section
        id="student-view"
        className="min-h-screen bg-[#0f172a] text-white font-inter"
      >
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Loading indicator */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-spinner text-blue-500 text-2xl animate-spin"></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {!hasMounted
                ? "Initializing Dashboard..."
                : "Loading Dashboard..."}
            </h2>
            <p className="text-slate-400 text-sm">
              {!hasMounted
                ? "Setting up your learning environment"
                : "Fetching your latest data"}
            </p>
          </div>

          {/* Loading skeleton for header */}
          <div className="bg-slate-800 p-10 rounded-[2.5rem] border border-slate-700 animate-pulse w-full"></div>

          {/* Loading skeleton for action cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 animate-pulse"
              >
                <div className="h-6 bg-slate-700 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>

          {/* Loading skeleton for main content */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
            <div className="lg:col-span-7 space-y-12">
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 animate-pulse"
                  >
                    <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 space-y-8">
              <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Success state - render dashboard with real data
  console.log("✅ Student Portal: Rendering dashboard with data");
  return (
    <section
      id="student-view"
      className="min-h-screen bg-[#0f172a] text-white font-inter"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Dashboard Header - Full Width */}
        <DashboardHeader />

        {/* Action Cards - 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <NextSessionCard />
          <OverdueAssignmentsCard />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          <div className="xl:col-span-8 space-y-6 lg:space-y-8">
          </div>
        </div>

        {/* Enrolled Courses */}
        <CourseProgressGrid />

        {/* Live Schedule — at the bottom */}
        
      </div>
    </section>
  );
};

export default StudentPortal;
