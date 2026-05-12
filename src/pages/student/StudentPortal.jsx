import React, { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchStudentDashboard,
  fetchMyEnrollments,
  selectDashboardLoading,
  selectDashboardError,
  clearError,
  selectEnrolledCourses,
  selectNextSession,
  selectAssignments,
} from "../../store/slices/studentDashboardSlice";
import {
  DashboardHeader,
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
  const enrolledCourses = useSelector(selectEnrolledCourses);
  const nextSession = useSelector(selectNextSession);
  const assignments = useSelector(selectAssignments);

  const [hasMounted, setHasMounted] = useState(false);

  const isDashboardEmpty = 
    (!enrolledCourses || enrolledCourses.length === 0) &&
    (!nextSession) &&
    (!assignments || assignments.length === 0);

  // Ensure component has mounted on client
  useEffect(() => {
    setTimeout(() => setHasMounted(true), 0);
  }, []);

  // Fetch dashboard data on component mount
  useEffect(() => {
    if (hasMounted) {
      dispatch(fetchStudentDashboard());
      dispatch(fetchMyEnrollments());
    }
  }, [dispatch, hasMounted]);

  // Handle retry on error
  const handleRetry = useCallback(() => {
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

  return (
    <section
      id="student-view"
      className="min-h-screen bg-[#0f172a] text-white font-inter"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Dashboard Header */}
        <DashboardHeader />

        {isDashboardEmpty ? (
          <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl p-12 lg:p-20 text-center shadow-2xl transition-all duration-500 hover:border-blue-500/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-blue-600/20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] -ml-48 -mb-48"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] border border-blue-500/20 flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(37,99,235,0.1)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                <i className="fas fa-rocket text-4xl text-blue-400 group-hover:animate-bounce"></i>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 tracking-tight font-poppins">
                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Launch</span> Your Journey?
              </h2>
              <p className="text-slate-400 text-lg lg:text-xl font-medium mb-12 leading-relaxed opacity-80">
                Your personalized learning workspace is set up and ready. <br className="hidden md:block" /> Start by enrolling in a course to unlock your dashboard's full power.
              </p>
              <button
                onClick={() => navigate('/courses')}
                className="inline-flex items-center gap-4 px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-xs lg:text-sm uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-blue-900/40 hover:shadow-blue-500/30 active:scale-95 group/btn"
              >
                <i className="fas fa-compass text-xl group-hover/btn:rotate-45 transition-transform duration-500"></i>
                Explore Courses Now
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12 lg:space-y-16">
            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Primary Column: Learning Activity */}
              <div className="xl:col-span-8 space-y-10 lg:space-y-12">
                <LiveScheduleList />
                <MyAttendanceList />
              </div>

              {/* Sidebar: Alerts & Summaries */}
              <div className="xl:col-span-4 space-y-8 lg:space-y-10">
                <OverdueAssignmentsCard />
                <AssignmentOverviewList />
              </div>
            </div>

            {/* Curriculum Overview */}
            <div className="pt-4 border-t border-white/5">
              <CourseProgressGrid />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StudentPortal;
