import React, { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  fetchStudentDashboard,
  fetchMyEnrollments,
  fetchStudentQuizzes,
  selectDashboardLoading,
  selectDashboardError,
  clearError,
  selectEnrolledCourses,
  selectNextSession,
  selectAssignments,
  selectMyEnrollments,
  selectPendingAssignmentsCount,
  joinLiveSession,
} from "../../store/slices/studentDashboardSlice";
import {
  StudentWorkspaceHeader,
  StudentWorkspaceNav,
  FinancialStatusSidebar,
  OverviewTab,
  CalendarTab,
  ScheduleAttendanceTab,
  ResourcesTab,
  RequestTranscriptModal,
  RequestLeaveModal,
  AssignmentSubmitModal,
} from "../../components/studentDashboard/workspace";
import StudentTutors from "./StudentTutors";
import StudentAssessments from "./StudentAssessments";
import StudentEvaluationPage from "./StudentEvaluationPage";
import TimezoneModal from "../../components/common/TimezoneModal";
import ApplyFreeAccessModal from "../../components/public/ApplyFreeAccessModal";
import ReferralLinkCard from "../../components/common/ReferralLinkCard";
import SubscriptionBanner from "../../components/studentDashboard/SubscriptionBanner";

const VALID_TABS = [
  "overview",
  "calendar",
  "schedule",
  "resources",
  "tutors",
  "assessments",
  "evaluations",
];

const StudentPortal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const enrolledCourses = useSelector(selectEnrolledCourses) || [];
  const nextSession = useSelector(selectNextSession);
  const assignments = useSelector(selectAssignments) || [];
  const myEnrollments = useSelector(selectMyEnrollments) || [];
  const pendingAssignmentsCount = useSelector(selectPendingAssignmentsCount) || 0;

  const [hasMounted, setHasMounted] = useState(false);
  const [freeAccessOpen, setFreeAccessOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    () => searchParams.get("tab") || "overview"
  );
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
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

  // Handle retry on error
  const handleRetry = useCallback(() => {
    dispatch(clearError());
    dispatch(fetchStudentDashboard());
    dispatch(fetchStudentQuizzes());
  }, [dispatch]);

  const handleResolveOverdue = () => {
    handleSelectTab("overview");
    const overdue =
      assignments.find((a) => a.status === "overdue") ||
      assignments.find((a) => a.status === "pending");
    if (overdue) {
      setSubmittingAssignment(overdue);
    }
  };

  const handleJoinNextClass = () => {
    if (nextSession?.meeting_link) {
      window.open(nextSession.meeting_link, "_blank");
    } else if (nextSession?.id) {
      dispatch(joinLiveSession(nextSession.id));
    } else {
      window.open("https://meet.google.com", "_blank");
    }
  };

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

          {/* Loading skeleton for main content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="skeleton p-8 rounded-2xl border border-slate-800 h-56"
                />
              ))}
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="skeleton p-6 rounded-2xl border border-slate-800 h-72" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* 1. Header: 3-Card Workspace Strip (Student Photo Space, Timezone Selector, Next Class Countdown, Action Required) */}
        <div className="animate-fadeInUp">
          <StudentWorkspaceHeader
            onResolveOverdue={handleResolveOverdue}
            onJoinNextClass={handleJoinNextClass}
            onOpenTimezone={() => setIsTimezoneModalOpen(true)}
          />
        </div>

        {/* Monthly Subscription Banner (if any enrollments pending renewal or expiring) */}
        <SubscriptionBanner />

        {/* 2. Navigation Tabs (Overview, Calendar, Schedule & Attendance, Resources, My Tutors, Assessments, Evaluations) */}
        <StudentWorkspaceNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          counts={{
            overview: pendingAssignmentsCount,
          }}
        />

        {/* 3. Main 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Main Column (8 Cols): Dynamic Tab Views */}
          <div className="lg:col-span-8 space-y-6 animate-fadeInUp">
            {activeTab === "overview" && (
              <OverviewTab
                onOpenSubmitModal={(asg) => setSubmittingAssignment(asg)}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarTab
                onOpenSubmitModal={(asg) => setSubmittingAssignment(asg)}
              />
            )}

            {activeTab === "schedule" && (
              <ScheduleAttendanceTab
                onRequestLeave={() => setIsLeaveModalOpen(true)}
              />
            )}

            {activeTab === "resources" && (
              <ResourcesTab
                onRequestTranscript={() => setIsTranscriptModalOpen(true)}
              />
            )}

            {activeTab === "tutors" && (
              <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-xl p-2 sm:p-4">
                <StudentTutors />
              </div>
            )}

            {activeTab === "assessments" && (
              <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-xl p-2 sm:p-4">
                <StudentAssessments />
              </div>
            )}

            {activeTab === "evaluations" && (
              <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-xl p-2 sm:p-4">
                <StudentEvaluationPage />
              </div>
            )}
          </div>

          {/* Right Rail (4 Cols): Persistent Financial Status (Always Paid), Student Photo Card & Quick Actions */}
          <div
            className="lg:col-span-4 space-y-6 animate-fadeInUp"
            style={{ animationDelay: "0.15s" }}
          >
            <FinancialStatusSidebar
              onRequestTranscript={() => setIsTranscriptModalOpen(true)}
              onApplyFreeAccess={() => setFreeAccessOpen(true)}
              onOpenTimezone={() => setIsTimezoneModalOpen(true)}
              onOpenReferral={() => {
                const el = document.getElementById("referral-card");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />

            <div id="referral-card">
              <ReferralLinkCard />
            </div>
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

      {isTranscriptModalOpen && (
        <RequestTranscriptModal
          onClose={() => setIsTranscriptModalOpen(false)}
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

      {freeAccessOpen && (
        <ApplyFreeAccessModal onClose={() => setFreeAccessOpen(false)} />
      )}
    </section>
  );
};

export default StudentPortal;
