import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { adminTeacherSessionService } from "../../services/adminTeacherSessionService";
import OverviewTab from "../../components/admin/OverviewTab";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";

const AdminOverviewPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [actionLoadingIds, setActionLoadingIds] = useState(new Set());

  const setActionLoading = (id, on) => {
    setActionLoadingIds((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        const data = await adminService.getDashboardAnalytics();
        setAnalytics(data);
      } catch {
        setAnalyticsError("Failed to load dashboard data");
      } finally {
        setAnalyticsLoading(false);
      }
    };

    const fetchSessionsDashboard = async () => {
      try {
        setSessionsLoading(true);
        const data = await adminService.getAdminSessionsDashboard();
        setUpcomingSessions(data?.upcoming_admin_sessions || []);
      } catch {
        // non-critical — silently ignore
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchAnalytics();
    fetchSessionsDashboard();
  }, []);

  const handleStartSession = async (sessionId) => {
    setActionLoading(sessionId, true);
    try {
      await adminTeacherSessionService.startSession(sessionId);
      toastManager.success("Session started");
      setUpcomingSessions((prev) =>
        prev.map((s) => s.id === sessionId ? { ...s, status: "live" } : s)
      );
    } catch (error) {
      showApiError(error);
    } finally {
      setActionLoading(sessionId, false);
    }
  };

  const handleEndSession = async (sessionId) => {
    setActionLoading(sessionId, true);
    try {
      await adminTeacherSessionService.endSession(sessionId);
      toastManager.success("Session ended");
      setUpcomingSessions((prev) =>
        prev.map((s) => s.id === sessionId ? { ...s, status: "ended" } : s)
      );
    } catch (error) {
      showApiError(error);
    } finally {
      setActionLoading(sessionId, false);
    }
  };

  return (
    <OverviewTab
      analytics={analytics}
      analyticsLoading={analyticsLoading}
      analyticsError={analyticsError}
      upcomingSessions={upcomingSessions}
      sessionsLoading={sessionsLoading}
      actionLoadingIds={actionLoadingIds}
      onStartSession={handleStartSession}
      onEndSession={handleEndSession}
    />
  );
};

export default AdminOverviewPage;
