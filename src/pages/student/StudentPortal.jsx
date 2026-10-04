import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  fetchStudentDashboard,
  fetchMyEnrollments,
  fetchStudentQuizzes,
  selectDashboardLoading,
  selectDashboardError,
  clearError,
  selectEnrolledCourses,
  selectNextSession,
  selectPendingAssignmentsCount,
} from "../../store/slices/studentDashboardSlice";
import {
  StudentWorkspaceNav,
  OverviewTab,
  LiveScheduleTab,
  WeeklyPlannerTab,
  CalendarTab,
  AttendanceTab,
  ResourcesTab,
  TodayAgendaSidebar,
  RequestLeaveModal,
  AssignmentSubmitModal,
} from "../../components/studentDashboard/workspace";
import StudentAssessments from "./StudentAssessments";
import TimezoneModal from "../../components/common/TimezoneModal";

const VALID_TABS = [
  "overview",
  "schedule",
  "planner",
  "calendar",
  "attendance",
  "resources",
  "assessments",
  "evaluations",
  "assignments",
  "quizzes",
];

const StudentPortal = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const enrolledCourses = useSelector(selectEnrolledCourses) || [];
  const nextSession = useSelector(selectNextSession);
  const pendingAssignmentsCount = useSelector(selectPendingAssignmentsCount) || 0;

  const [hasMounted, setHasMounted] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);

  // Directly derive activeTab from URL search parameter
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "overview";

  const handleSelectTab = (tab) => {
    setSearchParams({ tab });
  };

  // Ensure component has mounted on client
  useEffect(() => {
    setTimeout(() => setHasMounted(true), 0);
  }, []);

  // Fetch dashboard data & quizzes on component mount
  useEffect(() => {
    if (hasMounted) {
      dispatch(fetchStudentDashboard());
      dispatch(fetchMyEnrollments());
      dispatch(fetchStudentQuizzes());
    }
  }, [dispatch, hasMounted]);

  // Show loading state while mounting or loading
  if (!hasMounted || isLoading) {
    return (
      <section
        id="student-view"
        className="min-h-screen bg-[#0f172a] text-white font-inter py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Loading indicator */}
          <div className="text-center py-12 animate-fadeIn">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
              <i className="fas fa-spinner text-indigo-400 text-2xl animate-spin"></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {!hasMounted
                ? "Initializing Student Workspace..."
                : "Loading Workspace..."}
            </h2>
            <p className="text-slate-400 text-sm">
              {!hasMounted
                ? "Preparing your personalized dashboard"
                : "Synchronizing timetable, quizzes, and live schedule"}
            </p>
          </div>

          {/* Loading skeleton for 3-card header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton p-6 rounded-2xl border border-slate-800 h-36"
              />
            ))}
          </div>

          {/* Loading skeleton for main content (2-column layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="skeleton p-8 rounded-2xl border border-slate-800 h-72" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="skeleton p-6 rounded-2xl border border-slate-800 h-64" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="student-view"
      className="min-h-screen bg-[#0f172a] text-white font-inter py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Non-blocking sync error banner with retry */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-300 animate-fadeIn">
            <div className="flex items-center gap-3">
              <i className="fas fa-triangle-exclamation text-rose-400 text-lg" />
              <p className="text-xs sm:text-sm font-medium">
                {typeof error === "string" ? error : "A network sync error occurred."}
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  dispatch(clearError());
                  dispatch(fetchStudentDashboard());
                  dispatch(fetchMyEnrollments());
                  dispatch(fetchStudentQuizzes());
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => dispatch(clearError())}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Dismiss"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>
          </div>
        )}
        {/* 2-Column Balanced Workspace Grid: Left Rail (Student Workspace Card & Agenda Stack) / Right Main Learning Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 Columns): Student Workspace Card + Today's Live Classes + Upcoming Deadlines + Financial Status + Quick Actions + Invite & Refer */}
          <div className="lg:col-span-4 space-y-6 animate-fadeInUp">
            <TodayAgendaSidebar
              onOpenSubmitModal={(asg) => setSubmittingAssignment(asg)}
              onRequestLeave={() => setIsLeaveModalOpen(true)}
              onOpenTimezone={() => setIsTimezoneModalOpen(true)}
              onViewAllSchedule={() => handleSelectTab("schedule")}
              onViewAllPlanner={() => handleSelectTab("planner")}
            />
          </div>

          {/* Right Column (8 Columns): Navigation Tabs + Main Learning Canvas */}
          <div className="lg:col-span-8 space-y-6 animate-fadeInUp" style={{ animationDelay: "0.05s" }}>
            {/* Horizontal Workspace Navigation Tabs */}
            <StudentWorkspaceNav
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              counts={{
                assessments: pendingAssignmentsCount,
                schedule: nextSession ? 1 : 0,
              }}
            />

            {/* Active Tab Learning Content */}
            {activeTab === "overview" && (
              <OverviewTab
                onOpenSubmitModal={(asg) => setSubmittingAssignment(asg)}
              />
            )}

            {activeTab === "schedule" && (
              <LiveScheduleTab
                onOpenWeeklyPlanner={() => handleSelectTab("planner")}
              />
            )}

            {activeTab === "planner" && (
              <WeeklyPlannerTab
                onOpenLiveSchedule={() => handleSelectTab("schedule")}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarTab
                onOpenSubmitModal={(asg) => setSubmittingAssignment(asg)}
              />
            )}

            {activeTab === "attendance" && (
              <AttendanceTab
                onRequestLeave={() => setIsLeaveModalOpen(true)}
              />
            )}

            {activeTab === "resources" && <ResourcesTab />}

            {(activeTab === "assessments" ||
              activeTab === "evaluations" ||
              activeTab === "assignments" ||
              activeTab === "quizzes") && (
              <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-xl p-4 sm:p-6">
                <StudentAssessments isEmbedded={true} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      {submittingAssignment && (
        <AssignmentSubmitModal
          assignment={submittingAssignment}
          onClose={() => setSubmittingAssignment(null)}
          onSubmitted={() => dispatch(fetchStudentDashboard())}
        />
      )}

      {isLeaveModalOpen && (
        <RequestLeaveModal
          enrolledCourses={enrolledCourses}
          onClose={() => setIsLeaveModalOpen(false)}
        />
      )}

      {isTimezoneModalOpen && (
        <TimezoneModal
          isOpen={isTimezoneModalOpen}
          onClose={() => setIsTimezoneModalOpen(false)}
        />
      )}
    </section>
  );
};

export default StudentPortal;
