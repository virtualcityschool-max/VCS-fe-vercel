import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchPendingApprovals,
  approveUser,
  rejectUser,
  clearApprovalsError,
} from "../../store/slices/approvalsSlice";

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

  // Fetch pending approvals when component mounts or when approvals tab is active
  useEffect(() => {
    if (activeTab === "approvals") {
      dispatch(fetchPendingApprovals());
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
            {["approvals"].map((tab) => (
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
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <i className="far fa-bell"></i>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black">
              AD
            </div>
          </div>
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
                                    <>
                                      <i className="fas fa-spinner fa-spin"></i>
                                      Approving...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-check"></i>
                                      Approve
                                    </>
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
                                    <>
                                      <i className="fas fa-spinner fa-spin"></i>
                                      Rejecting...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-times"></i>
                                      Reject
                                    </>
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
              <h3 className="text-2xl font-black font-poppins mb-6">
                {activeModal === "assign-course"
                  ? "Manage Enrollment"
                  : "Timeline Logic"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="target-item"
                    className="text-[10px] font-black uppercase text-slate-500 block mb-2"
                  >
                    Target Item
                  </label>
                  <select
                    id="target-item"
                    name="target-item"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none"
                  >
                    <option>Select Option...</option>
                    <option>Physics Honors</option>
                    <option>Computer Science I</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      triggerToast("Success: Transaction Confirmed");
                    }}
                    className="flex-1 py-4 bg-indigo-600 rounded-2xl font-bold shadow-lg"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

export default AdminDashboard;
