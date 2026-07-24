import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { adminTeacherSessionService } from "../../services/adminTeacherSessionService";
import OverviewTab from "../../components/admin/OverviewTab";
import { toastManager } from "../../utils/toastManager";
import { showApiError, extractApiErrorMessage } from "../../utils/apiErrorHandler";
import { isSessionExpired, isWithinSessionWindow } from "../../utils/helper/StartSession";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const AdminOverviewPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [actionLoadingIds, setActionLoadingIds] = useState(new Set());
  const [tooEarlyOpen, setTooEarlyOpen] = useState(false);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);

  const setActionLoading = (id, on) => {
    setActionLoadingIds((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const fetchSessionsDashboard = async () => {
    try {
      setSessionsLoading(true);
      const data = await adminService.getAdminSessionsDashboard();
      setUpcomingSessions(data?.upcoming_admin_sessions || []);
    } catch {
      // non-critical - silently ignore
    } finally {
      setSessionsLoading(false);
    }
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

    fetchAnalytics();
    fetchSessionsDashboard();
  }, []);

  const handleStartSession = async (session) => {
    const scheduleAt = session?.scheduled_at || session?.schedule_at;
    if (isSessionExpired(scheduleAt)) {
      setSessionExpiredOpen(true);
      return;
    }
    if (!isWithinSessionWindow(scheduleAt)) {
      setTooEarlyOpen(true);
      return;
    }
    const sessionId = session?.id ?? session?.session_id;
    const fallbackLink = session?.meeting_link;
    const isMobile = /Mobi|Android|iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const meetWin = isMobile ? null : window.open("", "_blank");
    try {
      const result = await adminTeacherSessionService.startSession(sessionId);
      const meetingLink = result?.meeting_link || fallbackLink;

      if (meetingLink && meetingLink.startsWith("http")) {
        try {
          new URL(meetingLink);
          if (meetWin) meetWin.location.href = meetingLink;
          else window.open(meetingLink, "_blank", "noopener,noreferrer");
        } catch {
          meetWin?.close();
          toastManager.error("Invalid meeting link format");
        }
      } else {
        meetWin?.close();
        toastManager.error("No valid meeting link found");
      }

      await fetchSessionsDashboard();
    } catch (err) {
      meetWin?.close();
      const msg = extractApiErrorMessage(err);
      if (msg === "You cannot join before the scheduled time." || msg === "You can join up to 30 minutes before the scheduled time.") {
        setTooEarlyOpen(true);
      } else {
        showApiError(err);
      }
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
    <>
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

      <ConfirmDialog
        open={tooEarlyOpen}
        variant="primary"
        title="Too Early to Join"
        message="You can join 30 minutes earlier only."
        confirmLabel="Got it"
        cancelLabel={null}
        onConfirm={() => setTooEarlyOpen(false)}
        onCancel={() => setTooEarlyOpen(false)}
      />

      <ConfirmDialog
        open={sessionExpiredOpen}
        variant="warning"
        title="Session Time Has Passed"
        message="This session's time has already passed. The session window (1 hour from the scheduled time) has ended."
        confirmLabel="Got it"
        cancelLabel={null}
        onConfirm={() => setSessionExpiredOpen(false)}
        onCancel={() => setSessionExpiredOpen(false)}
      />
    </>
  );
};

export default AdminOverviewPage;
