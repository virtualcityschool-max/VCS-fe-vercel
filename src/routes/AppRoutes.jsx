import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAuthModal } from "../store/slices/uiSlice";

// Pages
import {
  PublicHome,
  AdminLayout,
  AdminOverviewPage,
  AdminApprovalsPage,
  AdminCoursesPage,
  AdminCourseDetailPage,
  ProfilePage,
  AdminUsersPage,
  AdminEnrollmentsPage,
  AdminSessionsPage,
  AdminTeacherPlannerPage,
  AdminAttendancePage,
  AdminEvaluationPage,
  AdminCategoriesPage,
  AdminReferralsPage,
  UserDetailsPage,
  StudentPortal,
  TeacherLayout,
  TeacherPortal,
  TeacherClasses,
  TeacherCourseDetailPage,
  TeacherAttendance,
  TeacherGrading,
  TeacherAssessments,
  TeacherSubmissions,
  TeacherSessionCalendar,
  StudentLayout,
  StudentClasses,
  ParentPortal,
  Marketplace,
  CourseDetails,
  Blogs,
  BlogDetails,
  AdminBlogsPage,
  AdminBlogEditorPage,
  TeacherProfile,
  TeacherInternalStudentProfile,
  TeacherEvaluationPage,
  TeacherHireLeads,
  TeacherAvailabilityPage,
  TeachersDirectory,
  StudentAssignments,
  StudentAssignmentDetails,
  StudentAssessments,
  StudentQuizDetail,
  StudentAttendance,
  // StudentExamDetail,
  StudentEvaluationPage,
  StudentTutors,
  ParentLayout,
  ParentAttendance,
  ParentEvaluationPage,
  ParentChildDetails,
  PrivacyPolicy,
  TermsAndConditions,
  AboutPage,
} from "../pages";
import AdminAboutPage from "../pages/admin/AdminAboutPage";
import AdminPlatformSettingsPage from "../pages/admin/AdminPlatformSettingsPage";

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
          <Route path="blogs" element={<AdminBlogsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="enrollments" element={<AdminEnrollmentsPage />} />
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
  );
};

export default AppRoutes;
