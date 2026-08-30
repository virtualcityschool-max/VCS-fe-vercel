import React, { Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAuthModal } from "../store/slices/uiSlice";
import { LoadingSpinner } from "../components/ui";

// Public pages load eagerly - anonymous visitors and prerendering hit these directly.
import PublicHome from "../pages/public/PublicHome";
import Marketplace from "../pages/public/Marketplace";
import CourseDetails from "../pages/public/CourseDetails";
import Blogs from "../pages/public/Blogs";
import BlogDetails from "../pages/public/BlogDetails";
import TeachersDirectory from "../pages/public/TeachersDirectory";
import TeacherProfile from "../pages/public/TeacherProfile";
import PrivacyPolicy from "../pages/public/PrivacyPolicy";
import TermsAndConditions from "../pages/public/TermsAndConditions";
import AboutPage from "../pages/public/AboutPage";
import OnlineSchoolHub from "../pages/public/OnlineSchoolHub";
import CountryLandingPage from "../pages/public/CountryLandingPage";
import ExamDatesPage from "../pages/public/ExamDatesPage";

// Authenticated dashboards are code-split so public visitors never download them.
const StudentLayout = React.lazy(() => import("../pages/student/StudentLayout"));
const StudentPortal = React.lazy(() => import("../pages/student/StudentPortal"));
const StudentClasses = React.lazy(() => import("../pages/student/StudentClasses"));
const StudentAssignments = React.lazy(() => import("../pages/student/StudentAssignments"));
const StudentAssignmentDetails = React.lazy(() => import("../pages/student/StudentAssignmentDetails"));
const StudentAssessments = React.lazy(() => import("../pages/student/StudentAssessments"));
const StudentQuizDetail = React.lazy(() => import("../pages/student/StudentQuizDetail"));
const StudentAttendance = React.lazy(() => import("../pages/student/StudentAttendance"));
const StudentEvaluationPage = React.lazy(() => import("../pages/student/StudentEvaluationPage"));
const StudentTutors = React.lazy(() => import("../pages/student/StudentTutors"));

const TeacherLayout = React.lazy(() => import("../pages/teacher/TeacherLayout"));
const TeacherPortal = React.lazy(() => import("../pages/teacher/TeacherPortal"));
const TeacherClasses = React.lazy(() => import("../pages/teacher/TeacherClasses"));
const TeacherCourseDetailPage = React.lazy(() => import("../pages/teacher/TeacherCourseDetailPage"));
const TeacherAttendance = React.lazy(() => import("../pages/teacher/TeacherAttendance"));
const TeacherGrading = React.lazy(() => import("../pages/teacher/TeacherGrading"));
const TeacherAssessments = React.lazy(() => import("../pages/teacher/TeacherAssessments"));
const TeacherSubmissions = React.lazy(() => import("../pages/teacher/TeacherSubmissions"));
const TeacherSessionCalendar = React.lazy(() => import("../pages/teacher/TeacherSessionCalendar"));
const TeacherInternalStudentProfile = React.lazy(() => import("../pages/teacher/TeacherInternalStudentProfile"));
const TeacherEvaluationPage = React.lazy(() => import("../pages/teacher/TeacherEvaluationPage"));
const TeacherHireLeads = React.lazy(() => import("../pages/teacher/TeacherHireLeads"));
const TeacherAvailabilityPage = React.lazy(() => import("../pages/teacher/TeacherAvailabilityPage"));

const AdminLayout = React.lazy(() => import("../components/admin/AdminLayout"));
const AdminOverviewPage = React.lazy(() => import("../pages/admin/AdminOverviewPage"));
const AdminApprovalsPage = React.lazy(() => import("../pages/admin/AdminApprovalsPage"));
const AdminCoursesPage = React.lazy(() => import("../pages/admin/AdminCoursesPage"));
const AdminCourseDetailPage = React.lazy(() => import("../pages/admin/AdminCourseDetailPage"));
const AdminUsersPage = React.lazy(() => import("../pages/admin/AdminUsersPage"));
const AdminEnrollmentsPage = React.lazy(() => import("../pages/admin/AdminEnrollmentsPage"));
const AdminSessionsPage = React.lazy(() => import("../pages/admin/AdminSessionsPage"));
const AdminAttendancePage = React.lazy(() => import("../pages/admin/AdminAttendance"));
const AdminEvaluationPage = React.lazy(() => import("../pages/admin/AdminEvaluationPage"));
const AdminCategoriesPage = React.lazy(() => import("../pages/admin/AdminCategoriesPage"));
const AdminReferralsPage = React.lazy(() => import("../pages/admin/AdminReferralsPage"));
const UserDetailsPage = React.lazy(() => import("../pages/admin/UserDetailsPage"));
const AdminTeacherPlannerPage = React.lazy(() => import("../pages/admin/AdminTeacherPlannerPage"));
const AdminBlogsPage = React.lazy(() => import("../pages/admin/AdminBlogsPage"));
const AdminBlogEditorPage = React.lazy(() => import("../pages/admin/AdminBlogEditorPage"));
const AdminAboutPage = React.lazy(() => import("../pages/admin/AdminAboutPage"));
const AdminPlatformSettingsPage = React.lazy(() => import("../pages/admin/AdminPlatformSettingsPage"));
const AdminSubscriptionsPage = React.lazy(() => import("../pages/admin/AdminSubscriptionsPage"));

const ProfilePage = React.lazy(() => import("../pages/profile/ProfilePage"));

const ParentLayout = React.lazy(() => import("../pages/parent/ParentLayout"));
const ParentPortal = React.lazy(() => import("../pages/parent/ParentPortal"));
const ParentAttendance = React.lazy(() => import("../pages/parent/ParentAttendance"));
const ParentEvaluationPage = React.lazy(() => import("../pages/parent/ParentEvaluationPage"));
const ParentChildDetails = React.lazy(() => import("../pages/parent/ParentChildDetails"));

// Protected Route Component with Role-Based Access Control
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isLoggedIn, isInitialized, role } = useSelector(
    (state) => state.auth,
  );

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-spinner text-blue-500 text-2xl animate-spin"></i>
          </div>
          <p className="text-white text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (allowedRoles.length === 1 && allowedRoles[0] === "admin") {
      return <Navigate to="/?adminLogin=true" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const roleRedirects = {
      student: "/student",
      teacher: "/teacher",
      parent: "/parent",
      admin: "/admin/overview",
    };
    return <Navigate to={roleRedirects[role] || "/"} replace />;
  }

  return <Outlet />;
};

// Gate for /admin routes: keeps URL at /admin, opens admin login modal once if not logged in
const AdminAuthGate = () => {
  const { isLoggedIn, isInitialized, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const hasOpenedRef = React.useRef(false);

  React.useEffect(() => {
    if (isInitialized && !isLoggedIn && !hasOpenedRef.current) {
      hasOpenedRef.current = true;
      dispatch(setAuthModal({ type: "login", adminMode: true }));
    }
  }, [isInitialized, isLoggedIn, dispatch]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-spinner text-blue-500 text-2xl animate-spin"></i>
          </div>
          <p className="text-white text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <PublicHome />;
  }

  if (role !== "admin") {
    const roleRedirects = { student: "/student", teacher: "/teacher", parent: "/parent" };
    return <Navigate to={roleRedirects[role] || "/"} replace />;
  }

  return <Outlet />;
};

// Application route table
const AppRoutes = () => {
  const { isLoggedIn, role } = useSelector((state) => state.auth);

  return (
        <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate
              to={
                role === "student"
                  ? "/student"
                  : role === "teacher"
                    ? "/teacher"
                    : role === "admin"
                      ? "/admin/overview"
                      : role === "parent"
                        ? "/parent"
                        : "/"
              }
              replace
            />
          ) : (
            <PublicHome />
          )
        }
      />
      {/* Referral entry point - AuthModals auto-opens the register form here
          and captures the ?ref=CODE query param. */}
      <Route
        path="/signup"
        element={isLoggedIn ? <Navigate to="/" replace /> : <PublicHome />}
      />
      <Route path="/courses" element={<Marketplace />} />
      <Route path="/courses/:courseId" element={<CourseDetails />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blogs/:slug" element={<BlogDetails />} />
      <Route path="/teachers" element={<TeachersDirectory />} />
      <Route path="/teachers/:id" element={<TeacherProfile />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/online-school" element={<OnlineSchoolHub />} />
      <Route path="/online-school/:countrySlug" element={<CountryLandingPage />} />
      <Route path="/exam-dates" element={<ExamDatesPage />} />

      {/* Student-Only Routes */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentPortal />} />
          <Route path="classes" element={<StudentClasses />} />
          <Route path="assessments" element={<StudentAssessments />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="assignments/:id" element={<StudentAssignmentDetails />} />
          <Route path="quizzes/:id" element={<StudentQuizDetail />} />
          {/* <Route path="exams/:id"  element={<StudentExamDetail />} /> */}
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="evaluations" element={<StudentEvaluationPage />} />
          <Route path="tutors" element={<StudentTutors />} />
        </Route>
      </Route>

      {/* Teacher-Only Routes */}
      <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherPortal />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="assessments" element={<TeacherAssessments />} />
          <Route path="grading" element={<TeacherGrading />} />
          <Route path="sessions" element={<TeacherSessionCalendar />} />
          <Route path="submissions" element={<TeacherSubmissions />} />
          <Route path="evaluations" element={<TeacherEvaluationPage />} />
          <Route path="hire-leads" element={<TeacherHireLeads />} />
          <Route path="availability" element={<TeacherAvailabilityPage />} />
        </Route>
        <Route
          path="/student/:id"
          element={<TeacherInternalStudentProfile />}
        />
        <Route path="/teacher/courses/:courseId" element={<TeacherCourseDetailPage />} />
      </Route>

      {/* Parent-Only Routes */}
      <Route element={<ProtectedRoute allowedRoles={["parent"]} />}>
        <Route path="/parent" element={<ParentLayout />}>
          <Route index element={<ParentPortal />} />
          <Route path="attendance" element={<ParentAttendance />} />
          <Route path="evaluations" element={<ParentEvaluationPage />} />
          <Route path="child/:childId" element={<ParentChildDetails />} />
        </Route>
      </Route>

      {/* Admin-Only Routes */}
      <Route element={<AdminAuthGate />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to="/admin/overview" replace />}
          />
          <Route path="overview" element={<AdminOverviewPage />} />
          <Route path="approvals" element={<AdminApprovalsPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="blogs" element={<AdminBlogsPage key="blogs" />} />
          <Route path="vlogs" element={<AdminBlogsPage key="vlogs" />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="enrollments" element={<AdminEnrollmentsPage />} />
          <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="sessions" element={<AdminSessionsPage />} />
          <Route path="teacher-planner" element={<AdminTeacherPlannerPage />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="evaluations" element={<AdminEvaluationPage />} />
          <Route path="course-levels" element={<AdminCategoriesPage />} />
          <Route path="referrals" element={<AdminReferralsPage />} />
          <Route path="about" element={<AdminAboutPage />} />
          <Route path="settings" element={<AdminPlatformSettingsPage />} />
        </Route>
        <Route path="/admin/users/:id" element={<UserDetailsPage />} />
        <Route path="/admin/courses/:courseId" element={<AdminCourseDetailPage />} />
        <Route path="/admin/blogs/new" element={<AdminBlogEditorPage />} />
        <Route path="/admin/blogs/:slug/edit" element={<AdminBlogEditorPage />} />
      </Route>

      {/* Profile - all authenticated roles */}
      <Route element={<ProtectedRoute allowedRoles={["student", "teacher", "admin", "parent"]} />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
        </Suspense>
  );
};

export default AppRoutes;
