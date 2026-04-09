import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchParentDashboard } from "../../store/slices/parentSlice";
import { ChildCard, RecentActivity, OverviewStats } from "../../components";
import { LoadingSpinner, ErrorMessage } from "../../components/ui";
import ChildLinkRequest from "../../components/parent/ChildLinkRequest";

const ParentPortal = () => {
  const dispatch = useDispatch();
  const {
    data: dashboardData,
    loading,
    error,
  } = useSelector((state) => state.parent.dashboard);

  // Fetch dashboard data on component mount
  useEffect(() => {
    dispatch(fetchParentDashboard());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchParentDashboard());
  };

  // Loading state
  if (loading) {
    return (
      <section
        id="parent-view"
        className="min-h-screen bg-[#0f172a] text-white font-inter"
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <header className="mb-12">
            <div className="h-8 bg-slate-700 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-96 animate-pulse"></div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
            <div className="lg:col-span-7 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-800 p-6 rounded-2xl border border-slate-700 animate-pulse"
                  >
                    <div className="h-4 bg-slate-700 rounded w-32 mb-4"></div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="h-12 bg-slate-700 rounded"></div>
                      <div className="h-12 bg-slate-700 rounded"></div>
                    </div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 animate-pulse h-64"></div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 animate-pulse h-64"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section
        id="parent-view"
        className="min-h-screen bg-[#0f172a] text-white font-inter"
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <ErrorMessage
            error={error}
            message="Unable to load parent dashboard"
            onRetry={handleRefresh}
          />
        </div>
      </section>
    );
  }

  // Empty state
  if (
    !dashboardData ||
    !dashboardData.children ||
    dashboardData.children.length === 0
  ) {
    return (
      <section
        id="parent-view"
        className="min-h-screen bg-[#0f172a] text-white font-inter"
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <header className="mb-12">
            <h1 className="text-4xl font-bold font-poppins mb-2">
              Welcome to Parent Portal
            </h1>
            <p className="text-slate-400 text-lg">
              Monitor your children's progress at the{" "}
              <span className="text-white font-bold">VirtualCitySchool</span>{" "}
              terminal.
            </p>
          </header>

          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-user-graduate text-slate-400 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Children Found
            </h3>
            <p className="text-slate-400 text-center mb-6 max-w-md">
              There are no children associated with your account. Please contact
              the school administration if you believe this is an error.
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
            >
              <i className="fas fa-redo"></i>
              Refresh
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="parent-view"
      className="min-h-screen bg-[#0f172a] text-white font-inter"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold font-poppins mb-2">
            Welcome back!
          </h1>
          <p className="text-slate-400 text-lg">
            Monitor your children's progress at the{" "}
            <span className="text-white font-bold">VirtualCitySchool</span>{" "}
            terminal.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Main Dashboard - Left Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Child Link Requests */}
            <section>
              <ChildLinkRequest />
            </section>

            {/* Children Cards */}
            <section>
              <h2 className="text-xl font-bold font-poppins mb-6">
                Your Children
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboardData.children.map((child) => (
                  <ChildCard key={child.id} child={child} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview Stats */}
            <OverviewStats dashboardData={dashboardData} />

            {/* Recent Activity */}
            <RecentActivity activities={dashboardData.recent_activity} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParentPortal;
