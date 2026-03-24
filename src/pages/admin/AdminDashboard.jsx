import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchPendingApprovals,
  approveUser,
  rejectUser,
  clearApprovalsError,
} from "../../store/slices/approvalsSlice";
import {
  fetchCourses,
  createCourse,
  assignInstructor,
  fetchUsers,
  selectCourses,
  selectUsers,
} from "../../store/slices/adminSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("approvals");
  const [activeModal, setActiveModal] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get approvals data from Redux store
  const {
    pendingApprovals,
    isLoading: approvalsLoading,
    error: approvalsError,
    isProcessing,
  } = useSelector((state) => state.approvals);

  // Get courses and users data from Redux store
  const courses = useSelector(selectCourses);
  const users = useSelector(selectUsers);

  // Fetch pending approvals when component mounts or when approvals tab is active
  useEffect(() => {
    if (activeTab === "approvals") {
      dispatch(fetchPendingApprovals());
    }
  }, [dispatch, activeTab]);

  // Fetch courses when courses tab is active
  useEffect(() => {
    if (activeTab === "courses") {
      dispatch(fetchCourses());
    }
  }, [dispatch, activeTab]);

  // Fetch users (for instructor assignment) when courses tab is active
  useEffect(() => {
    if (activeTab === "courses") {
      dispatch(fetchUsers({ role: "teacher" }));
    }
  }, [dispatch, activeTab]);

  // Handle approval actions
  const handleApprove = async (userId) => {
    try {
      await dispatch(approveUser(userId)).unwrap();
      setShowToast("User approved successfully");
    } catch (error) {
      setShowToast(error || "Failed to approve user");
    }
  };

  const handleReject = async (userId) => {
    try {
      await dispatch(rejectUser(userId)).unwrap();
      setShowToast("User rejected successfully");
    } catch (error) {
      setShowToast(error || "Failed to reject user");
    }
  };

  // Handle course creation
  const handleCreateCourse = async (courseData) => {
    try {
      await dispatch(createCourse(courseData)).unwrap();
      setShowToast("Course created successfully");
      setActiveModal(null);
    } catch (error) {
      setShowToast(error || "Failed to create course");
    }
  };

  // Handle instructor assignment
  const handleAssignInstructor = async (courseId, instructorId) => {
    try {
      await dispatch(assignInstructor({ courseId, instructorId })).unwrap();
      setShowToast("Instructor assigned successfully");
      setActiveModal(null);
    } catch (error) {
      setShowToast(error || "Failed to assign instructor");
    }
  };

  // Clear error when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (approvalsError) {
      dispatch(clearApprovalsError());
    }
    setIsSidebarOpen(false);
  };

  // Mock schedule data - DISABLED until backend integration
  // const scheduleData = [
  //   {
  //     day: "Monday",
  //     start: 9,
  //     end: 11,
  //     title: "Physics 101",
  //     teacher: "Dr. Samuel",
  //     color: "bg-blue-600",
  //   },
  //   {
  //     day: "Monday",
  //     start: 13,
  //     end: 15,
  //     title: "Calculus",
  //     teacher: "Dr. Okoro",
  //     color: "bg-indigo-600",
  //   },
  //   {
  //     day: "Tuesday",
  //     start: 14,
  //     end: 15.5,
  //     title: "Urdu Lit",
  //     teacher: "Mr. Iqbal",
  //     color: "bg-emerald-600",
  //   },
  //   {
  //     day: "Wednesday",
  //     start: 10,
  //     end: 12,
  //     title: "Bio Science",
  //     teacher: "Dr. Sarah",
  //     color: "bg-teal-600",
  //   },
  //   {
  //     day: "Friday",
  //     start: 20,
  //     end: 22,
  //     title: "AI Ethics",
  //     teacher: "Lab TA",
  //     color: "bg-rose-600",
  //   },
  // ];

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const renderScheduler = () => {
    // Scheduler disabled - no backend integration yet
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeIn p-16 text-center">
        <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-calendar-alt text-slate-400 text-2xl"></i>
        </div>
        <h3 className="text-white text-lg font-bold mb-2">
          Scheduler Not Integrated Yet
        </h3>
        <p className="text-slate-400 text-sm">
          Academic scheduling functionality will be available once backend
          integration is complete
        </p>
      </div>
    );
  };

  return (
    <section
      id="admin-view"
      className="min-h-screen bg-slate-950 text-white flex font-inter"
    >
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 z-100 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-xs">
            V
          </div>
          <span className="text-[10px] sm:text-sm font-black font-poppins tracking-tighter whitespace-nowrap">
            VirtualCitySchool
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-slate-400 hover:text-white transition"
        >
          <i
            className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"} text-xl`}
          ></i>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-72 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-10">
          <div
            className="flex items-center gap-3 mb-16 shrink-0 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white">
              V
            </div>
            <span className="text-xl font-black font-poppins tracking-tighter whitespace-nowrap">
              VirtualCitySchool
            </span>
          </div>
          <nav className="space-y-2">
            {["approvals", "courses"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition ${activeTab === tab ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-slate-300"}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-72 p-6 md:p-12 pt-24 lg:pt-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <h2 className="text-3xl md:text-4xl font-black font-poppins text-white uppercase">
            {activeTab}
          </h2>
          {/* <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <i className="far fa-bell"></i>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black">
              AD
            </div>
          </div> */}
        </header>

        {showToast && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-200 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold text-sm animate-slideDown flex items-center gap-4">
            <i className="fas fa-check-circle"></i> {showToast}
          </div>
        )}

        {activeTab === "overview" && (
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeIn p-16 text-center">
            <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-chart-line text-slate-400 text-2xl"></i>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">
              Analytics Not Integrated Yet
            </h3>
            <p className="text-slate-400 text-sm">
              Dashboard analytics and overview statistics will be available once
              backend integration is complete
            </p>
          </div>
        )}

        {activeTab === "academics" && renderScheduler()}

        {activeTab === "approvals" && (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                <div>
                  <h3 className="text-xl font-bold font-poppins text-white">
                    Pending Approvals
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Review and approve user registration requests
                  </p>
                </div>
                <button
                  onClick={() => dispatch(fetchPendingApprovals())}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition flex items-center gap-2"
                  disabled={approvalsLoading}
                >
                  <i
                    className={`fas ${approvalsLoading ? "fa-spinner fa-spin" : "fa-refresh"}`}
                  ></i>
                  Refresh
                </button>
              </div>

              {/* Other Error State */}
              {approvalsError && !approvalsError.includes("404") && (
                <div className="p-8">
                  <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                    </div>
                    <h4 className="text-red-400 font-bold mb-2">
                      Failed to load approvals
                    </h4>
                    <p className="text-slate-400 text-sm mb-4">
                      {approvalsError}
                    </p>
                    <button
                      onClick={() => dispatch(fetchPendingApprovals())}
                      className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {approvalsLoading && !approvalsError && (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                    <i className="fas fa-spinner text-blue-500 text-2xl"></i>
                  </div>
                  <p className="text-white text-lg">
                    Loading pending approvals...
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!approvalsLoading &&
                !approvalsError &&
                pendingApprovals.length === 0 && (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-check-circle text-slate-400 text-2xl"></i>
                    </div>
                    <h4 className="text-white text-lg font-bold mb-2">
                      No pending approvals
                    </h4>
                    <p className="text-slate-400 text-sm">
                      All user registrations have been processed
                    </p>
                  </div>
                )}

              {/* Approvals List */}
              {!approvalsLoading &&
                !approvalsError &&
                pendingApprovals.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950/60 border-b border-slate-800">
                        <tr>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">
                            User Information
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">
                            Role
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">
                            Registration Date
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {pendingApprovals.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-slate-800/30 transition group"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <img
                                  src={
                                    user.profile_image ||
                                    `https://i.pravatar.cc/150?u=${user.email}`
                                  }
                                  className="w-10 h-10 rounded-xl border border-slate-700 shadow-md"
                                  alt={user.username || user.email}
                                />
                                <div>
                                  <p className="font-bold text-white group-hover:text-indigo-400 transition">
                                    {user.username ||
                                      user.first_name + " " + user.last_name ||
                                      "Unknown User"}
                                  </p>
                                  <p className="text-[9px] text-slate-500 uppercase">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-slate-600">
                                {user.role || "user"}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-slate-400 text-sm">
                                {user.date_joined
                                  ? new Date(user.date_joined).toLocaleString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : "Unknown"}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => handleApprove(user.id)}
                                  disabled={
                                    isProcessing[user.id] === "approving"
                                  }
                                  className="bg-emerald-600/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {isProcessing[user.id] === "approving" ? (
                                    <React.Fragment key="approving">
                                      <i className="fas fa-spinner fa-spin"></i>
                                      Approving...
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment key="approve">
                                      <i className="fas fa-check"></i>
                                      Approve
                                    </React.Fragment>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleReject(user.id)}
                                  disabled={
                                    isProcessing[user.id] === "rejecting"
                                  }
                                  className="bg-red-600/10 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {isProcessing[user.id] === "rejecting" ? (
                                    <React.Fragment key="rejecting">
                                      <i className="fas fa-spinner fa-spin"></i>
                                      Rejecting...
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment key="reject">
                                      <i className="fas fa-times"></i>
                                      Reject
                                    </React.Fragment>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </>
        )}

        {activeTab === "courses" && (
          <>
            {/* Course Management Header */}
            <div className="mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-fadeIn">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold font-poppins text-white mb-2">
                      Course Management
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Create and manage courses, assign instructors, and track
                      course status
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                    <button
                      onClick={() => setActiveModal("create-course")}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 min-w-35"
                    >
                      <i className="fas fa-plus text-sm"></i>
                      <span>Create Course</span>
                    </button>
                    <button
                      onClick={() => dispatch(fetchCourses())}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 min-w-25 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                      disabled={courses.loading}
                    >
                      <i
                        className={`fas ${courses.loading ? "fa-spinner fa-spin" : "fa-refresh"} text-sm`}
                      ></i>
                      <span>{courses.loading ? "Loading" : "Refresh"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Course List Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
              <div className="px-8 py-6 border-b border-slate-800 bg-slate-950/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold font-poppins text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-graduation-cap text-indigo-400 text-sm"></i>
                      </div>
                      All Courses
                    </h4>
                    <p className="text-slate-500 text-sm mt-1">
                      {courses.data.length > 0
                        ? `${courses.data.length} course${courses.data.length !== 1 ? "s" : ""} found`
                        : "No courses available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Courses Error State */}
              {courses.error && (
                <div className="p-8">
                  <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
                    </div>
                    <h4 className="text-red-400 font-bold text-lg mb-2">
                      Unable to Load Courses
                    </h4>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      {courses.error}
                    </p>
                    <button
                      onClick={() => dispatch(fetchCourses())}
                      className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg active:scale-95"
                    >
                      <i className="fas fa-redo mr-2"></i>
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Courses Loading State */}
              {courses.loading && !courses.error && (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-spinner text-blue-500 text-3xl animate-spin"></i>
                  </div>
                  <h4 className="text-white text-xl font-bold mb-2">
                    Loading Courses
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Please wait while we fetch your courses...
                  </p>
                </div>
              )}

              {/* Courses Empty State */}
              {!courses.loading &&
                !courses.error &&
                courses.data.length === 0 && (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="fas fa-book-open text-slate-400 text-3xl"></i>
                    </div>
                    <h4 className="text-white text-xl font-bold mb-2">
                      No Courses Yet
                    </h4>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-md mx-auto">
                      Start by creating your first course. You can add content,
                      set pricing, and assign instructors.
                    </p>
                    <button
                      onClick={() => setActiveModal("create-course")}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg active:scale-95"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Create Your First Course
                    </button>
                  </div>
                )}

              {/* Courses List */}
              {!courses.loading &&
                !courses.error &&
                courses.data.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950/60 border-b border-slate-800">
                        <tr>
                          <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">
                            Course
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                            Category
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                            Price
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                            Status
                          </th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">
                            Instructor
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/30">
                        {courses.data.map((course) => (
                          <tr
                            key={course.id}
                            className="hover:bg-slate-800/20 transition-all duration-200 group"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-linear-to-br from-indigo-600/20 to-purple-600/20 rounded-xl flex items-center justify-center shrink-0 group-hover:from-indigo-600/30 group-hover:to-purple-600/30 transition-all duration-200">
                                  <i className="fas fa-book text-indigo-400 text-sm group-hover:text-indigo-300 transition-colors"></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors truncate">
                                    {course.title}
                                  </h5>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="font-mono">
                                      ID: {course.id}
                                    </span>
                                    {course.description && (
                                      <span className="truncate max-w-xs">
                                        {course.description.substring(0, 60)}...
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-slate-700/40 text-slate-300 border border-slate-600/50">
                                <i className="fas fa-tag mr-1.5 text-slate-400"></i>
                                {course.category}
                              </span>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold text-lg">
                                  ${parseFloat(course.price).toFixed(2)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
                                  course.status === "published"
                                    ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30"
                                    : course.status === "draft"
                                      ? "bg-amber-600/20 text-amber-400 border-amber-600/30"
                                      : "bg-slate-600/20 text-slate-400 border-slate-600/30"
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    course.status === "published"
                                      ? "bg-emerald-400"
                                      : course.status === "draft"
                                        ? "bg-amber-400"
                                        : "bg-slate-400"
                                  }`}
                                ></span>
                                {course.status}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              {course.instructor ? (
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                  <img
                                    src={
                                      course.instructor.avatar ||
                                      `https://i.pravatar.cc/150?u=${course.instructor.username}`
                                    }
                                    className="w-10 h-10 rounded-lg border border-slate-600 object-cover"
                                    alt={course.instructor.username}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">
                                      {course.instructor.username}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {course.instructor.expertise ||
                                        "Instructor"}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  <span className="text-xs text-slate-500 italic">
                                    No instructor assigned
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-6 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() =>
                                    setActiveModal({
                                      type: "assign-instructor",
                                      courseId: course.id,
                                    })
                                  }
                                  className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                                    course.instructor
                                      ? "bg-slate-700/50 text-slate-400 hover:bg-indigo-600/50 hover:text-indigo-300 border border-slate-600/50 hover:border-indigo-600/50"
                                      : "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-600/30 hover:border-indigo-600"
                                  }`}
                                >
                                  <i
                                    className={`fas ${course.instructor ? "fa-user-edit" : "fa-user-plus"} mr-2`}
                                  ></i>
                                  {course.instructor ? "Change" : "Assign"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </>
        )}

        {activeTab === "users" && (
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeIn p-16 text-center">
            <div className="w-16 h-16 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-slate-400 text-2xl"></i>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">
              User Management Not Integrated Yet
            </h3>
            <p className="text-slate-400 text-sm">
              User management functionality will be available once backend
              integration is complete
            </p>
          </div>
        )}

        {/* Modals Overlay */}
        {activeModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-fadeIn">
              {/* Create Course Modal */}
              {activeModal === "create-course" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                      <i className="fas fa-plus text-indigo-400"></i>
                    </div>
                    <h3 className="text-2xl font-black font-poppins text-white">
                      Create New Course
                    </h3>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const courseData = {
                        title: formData.get("title"),
                        description: formData.get("description"),
                        category: formData.get("category"),
                        price: formData.get("price"),
                        status: formData.get("status"),
                        instructor_id: formData.get("instructor_id") || null,
                      };
                      handleCreateCourse(courseData);
                    }}
                    className="space-y-5"
                  >
                    {/* Course Title */}
                    <div>
                      <label
                        htmlFor="title"
                        className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                      >
                        <i className="fas fa-heading text-slate-600 text-xs"></i>
                        Course Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                        placeholder="Enter course title"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="description"
                        className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                      >
                        <i className="fas fa-align-left text-slate-600 text-xs"></i>
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        required
                        rows="3"
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
                        placeholder="Describe what students will learn in this course..."
                      />
                    </div>

                    {/* Category and Price Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="category"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-tag text-slate-600 text-xs"></i>
                          Category
                        </label>
                        <input
                          type="text"
                          id="category"
                          name="category"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                          placeholder="e.g., tech, arts, science"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="price"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-dollar-sign text-slate-600 text-xs"></i>
                          Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                            $
                          </span>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            required
                            step="0.01"
                            min="0"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-5 py-4 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status and Instructor Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="status"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-toggle-on text-slate-600 text-xs"></i>
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="published">📚 Published</option>
                          <option value="draft">📝 Draft</option>
                          <option value="archived">📦 Archived</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="instructor_id"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-user-tie text-slate-600 text-xs"></i>
                          Instructor
                        </label>
                        <select
                          id="instructor_id"
                          name="instructor_id"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="">No instructor assigned</option>
                          {users.data
                            .filter((user) => user.role === "teacher")
                            .map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                👩‍🏫{" "}
                                {teacher.username ||
                                  teacher.first_name + " " + teacher.last_name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all duration-200 active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-plus"></i>
                        Create Course
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Assign Instructor Modal */}
              {typeof activeModal === "object" &&
                activeModal.type === "assign-instructor" && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                        <i className="fas fa-user-tie text-indigo-400"></i>
                      </div>
                      <h3 className="text-2xl font-black font-poppins text-white">
                        Assign Instructor
                      </h3>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const instructorId = formData.get("instructor_id");
                        handleAssignInstructor(
                          activeModal.courseId,
                          instructorId,
                        );
                      }}
                      className="space-y-5"
                    >
                      <div>
                        <label
                          htmlFor="instructor_id"
                          className="text-[11px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"
                        >
                          <i className="fas fa-user-tie text-slate-600 text-xs"></i>
                          Select Instructor
                        </label>
                        <select
                          id="instructor_id"
                          name="instructor_id"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="">Choose an instructor...</option>
                          {users.data
                            .filter((user) => user.role === "teacher")
                            .map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                👩‍🏫{" "}
                                {teacher.username ||
                                  teacher.first_name + " " + teacher.last_name}
                                {teacher.email && ` (${teacher.email})`}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="flex gap-4 pt-6 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setActiveModal(null)}
                          className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all duration-200 active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-user-plus"></i>
                          Assign Instructor
                        </button>
                      </div>
                    </form>
                  </>
                )}
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

export default AdminDashboard;
