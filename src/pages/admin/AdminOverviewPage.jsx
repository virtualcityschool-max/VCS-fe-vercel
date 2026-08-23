import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { adminService } from "../../services/adminService";
import { adminTeacherSessionService } from "../../services/adminTeacherSessionService";
import OverviewTab from "../../components/admin/OverviewTab";
import { toastManager } from "../../utils/toastManager";
import { showApiError, extractApiErrorMessage } from "../../utils/apiErrorHandler";
import { isSessionExpired, isWithinSessionWindow } from "../../utils/helper/StartSession";
import { getDisplayName } from "../../utils/userDisplay";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const ROLE_LABEL = { teacher: "tutor", parent: "guardian", student: "student", admin: "admin" };

// Builds the "Recent Activity" feed from data already fetched app-wide by
// AdminLayout on mount (pending approvals/enrollments/free-access/child
// links) - no new API calls. Only pending/unresolved items are available
// with reliable timestamps, so this shows what's newly waiting on you,
// newest first, rather than a full history of past decisions.
const useRecentActivity = (limit = 6) => {
  // Each slice's initialState already defaults these to [], so no `|| []`
  // fallback is needed here (that would create a fresh array every render).
  const pendingApprovals = useSelector((s) => s.approvals.pendingApprovals);
  const pendingEnrollments = useSelector((s) => s.approvals.pendingEnrollments);
  const freeAccessRequests = useSelector((s) => s.freeAccess.requests);
  const pendingChildLinks = useSelector((s) => s.childLinks.pendingChildLinks);

  return useMemo(() => {
    const items = [
      ...pendingApprovals.map((u) => ({
        id: `approval-${u.id}`,
        kind: "approval",
        timestamp: u.date_joined,
        text: `${getDisplayName(u) || "Someone"} registered as a ${ROLE_LABEL[u.role] || u.role} and is awaiting approval`,
      })),
      ...pendingEnrollments.map((e) => ({
        id: `enrollment-${e.id}`,
        kind: "enrollment",
        timestamp: e.enrolled_at,
        text: `${e.student_name || "A student"} requested enrollment in ${e.course_title || "a course"}`,
      })),
      ...freeAccessRequests
        .filter((r) => r.status === "pending")
        .map((r) => ({
          id: `free-access-${r.id}`,
          kind: "free-access",
          timestamp: r.created_at,
          text: `${r.full_name || "Someone"} applied for free access to ${r.courses?.length || 0} course${r.courses?.length === 1 ? "" : "s"}`,
        })),
      ...pendingChildLinks.map((l) => ({
        id: `child-link-${l.link_id}`,
        kind: "child-link",
        timestamp: l.requested_at,
        text: `${l.parent || "A guardian"} requested to link with ${l.student || "a student"}`,
      })),
    ];

    return items
      .filter((item) => item.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }, [pendingApprovals, pendingEnrollments, freeAccessRequests, pendingChildLinks, limit]);
};

const AdminOverviewPage = () => {
  const recentActivity = useRecentActivity();
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
        recentActivity={recentActivity}
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
