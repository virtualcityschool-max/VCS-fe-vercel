import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchParentDashboard } from "../../store/slices/parentSlice";
import { ChildCard, RecentActivity, OverviewStats, ParentDashboardHeader, PendingChildLinks } from "../../components";
import { LoadingSpinner, ErrorMessage, Button } from "../../components/ui";
import ChildLinkRequest from "../../components/parent/ChildLinkRequest";
import { getDisplayName } from "../../utils/userDisplay";

const ParentPortal = () => {
  const dispatch = useDispatch();
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const auth = useSelector((state) => state.auth);
  const {
    data: dashboardData,
    loading,
    error,
  } = useSelector((state) => state.parent.dashboard);

  const userName = getDisplayName(auth.user) || "Guardian";

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
        className="min-h-screen bg-[#0f172a] text-white font-inter py-4"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 p-10 mb-12 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2rem] bg-slate-700"></div>
              <div className="space-y-3">
                <div className="h-8 bg-slate-700 rounded w-64"></div>
                <div className="flex gap-3">
                  <div className="h-6 bg-slate-700 rounded w-24"></div>
                  <div className="h-6 bg-slate-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>

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

  // Empty state - no children linked yet AND no pending/rejected links to show
  const hasChildren = dashboardData?.children?.length > 0;
  const hasPending = dashboardData?.pending_child_links?.length > 0;
  const hasRejected = dashboardData?.rejected_child_links?.length > 0;

  if (!dashboardData || (!hasChildren && !hasPending && !hasRejected)) {
    return (
      <section
        id="parent-view"
        className="min-h-screen bg-[#0f172a] text-white font-inter relative overflow-hidden py-8"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black font-poppins mb-4 tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Welcome, {userName}!
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
              Your dashboard is ready, but we need to link your children's profiles to get started.
            </p>
          </header>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
              <i className="fas fa-user-plus text-indigo-400 text-3xl"></i>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Start Your Journey</h2>
            <p className="text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
              To monitor attendance, grades, and course progress, please link your children using their 
              <span className="text-indigo-400 font-bold"> Student ID</span> or 
              <span className="text-indigo-400 font-bold"> Email</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setIsLinkModalOpen(true)}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/40 transition-all hover:scale-[1.02]"
              >
                <i className="fas fa-link mr-2"></i> Request Child Access
              </Button>
              {/* <Button 
                variant="outline"
                onClick={handleRefresh}
                className="px-10 py-4 border-slate-700 text-slate-300 hover:bg-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                <i className="fas fa-sync-alt mr-2"></i> Refresh State
              </Button> */}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: "fa-chart-line", title: "Track Progress", desc: "Monitor academic growth" },
              { icon: "fa-calendar-check", title: "Attendance", desc: "Real-time daily updates" },
              { icon: "fa-bell", title: "Notifications", desc: "Get school announcements" }
            ].map((item, i) => (
              <div key={i} className="p-6">
                <i className={`fas ${item.icon} text-slate-600 text-xl mb-4`}></i>
                <h4 className="text-slate-300 font-bold mb-1">{item.title}</h4>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Link Modal */}
        {isLinkModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-2xl animate-springyReveal">
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setIsLinkModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/5"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <ChildLinkRequest onSuccess={() => {
                setIsLinkModalOpen(false);
                handleRefresh();
              }} />
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      id="parent-view"
      className="min-h-screen bg-[#0f172a] text-white font-inter py-10"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ParentDashboardHeader 
          dashboardData={dashboardData} 
          userName={userName} 
          onLinkRequest={() => setIsLinkModalOpen(true)} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Main Dashboard - Left Column */}
          <div className="lg:col-span-7 space-y-12">
            {dashboardData.children?.length > 0 ? (
              <section>
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-10 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full shadow-lg shadow-indigo-500/20"></div>
                    <div>
                      <h2 className="text-3xl font-black font-poppins tracking-tight text-white">
                        Your Children
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {dashboardData.children.map((child, i) => (
                    <ChildCard key={child.id} child={child} index={i} />
                  ))}
                </div>
              </section>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-white/5">
                  <i className="fas fa-user-plus text-slate-600 text-2xl"></i>
                </div>
                <p className="text-slate-400 font-bold mb-1">No children linked yet</p>
                <p className="text-slate-600 text-sm max-w-xs">Check the panel on the right for the status of your link requests.</p>
              </div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-3 space-y-12">
            {/* Request(s) Status Section */}
            {(dashboardData.pending_child_links?.length > 0 ||
              dashboardData.rejected_child_links?.length > 0) && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full shadow-lg shadow-indigo-500/20"></div>
                      <h2 className="text-3xl font-black font-poppins tracking-tight text-white">
                    Request(s) Status
                  </h2>
                </div>
                <PendingChildLinks
                  links={dashboardData.pending_child_links}
                  rejectedLinks={dashboardData.rejected_child_links}
                  onRequestNew={() => setIsLinkModalOpen(true)}
                />
              </section>
            )}

            {/* Recent Activity Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full shadow-lg shadow-indigo-500/20"></div>
                      <h2 className="text-3xl font-black font-poppins tracking-tight text-white">
                  Recent Activity
                </h2>
              </div>
              <RecentActivity activities={dashboardData.recent_activity} />
            </section>
          </div>
        </div>
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl animate-springyReveal">
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setIsLinkModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/5"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <ChildLinkRequest onSuccess={() => {
              setIsLinkModalOpen(false);
              handleRefresh();
            }} />
          </div>
        </div>
      )}
    </section>
  );
};

export default ParentPortal;
