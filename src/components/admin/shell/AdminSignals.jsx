import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { adminService } from "../../../services/adminService";
import { adminSessionService } from "../../../services/adminSessionService";
import { AdminSignalsContext } from "./adminSignalsContext";

// Live counts shared by the admin sidebar badges and the dashboard's
// Action Center, so both show the same numbers from one set of requests.
// Read-only: nothing here changes data on the server.

const REFRESH_MS = 2 * 60 * 1000;
const EXPIRING_DAYS = 7;

const asList = (data) => (Array.isArray(data) ? data : data?.results || []);

export const AdminSignalsProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState(null);
  const [liveSessions, setLiveSessions] = useState([]);
  // Some admin pages reset the subject list in the store; keep the last
  // known gaps so the menu badge doesn't flicker between pages.
  const [unassigned, setUnassigned] = useState(null);

  const pendingApprovals = useSelector((s) => s.approvals.pendingApprovals);
  const pendingEnrollments = useSelector((s) => s.approvals.pendingEnrollments);
  const pendingChildLinks = useSelector((s) => s.childLinks.pendingChildLinks);
  const freeAccessRequests = useSelector((s) => s.freeAccess.requests);
  const courses = useSelector((s) => s.admin.courses.data);

  const refresh = useCallback(async () => {
    const [subs, live] = await Promise.allSettled([
      adminService.getSubscriptions(),
      adminSessionService.getSessions({ status: "live" }),
    ]);
    if (subs.status === "fulfilled") setSubscriptions(subs.value);
    if (live.status === "fulfilled") setLiveSessions(asList(live.value));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!courses || courses.length === 0) return;
    // Only published subjects count: a draft without a teacher is normal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnassigned(
      courses.filter((c) => c.status === "published" && !(c.instructor?.id || c.instructor_id)),
    );
  }, [courses]);

  const value = useMemo(() => {
    const expiring = (subscriptions?.active || [])
      .filter((r) => r.days_remaining != null && r.days_remaining <= EXPIRING_DAYS)
      .sort((a, b) => a.days_remaining - b.days_remaining);

    const pendingFreeAccess = (freeAccessRequests || []).filter((r) => r.status === "pending");
    // Same total the old sidebar badge showed: the Approvals page has a tab
    // for each of these.
    const approvalsCount =
      (pendingApprovals?.length || 0) +
      (pendingChildLinks?.length || 0) +
      (pendingEnrollments?.length || 0) +
      pendingFreeAccess.length;

    return {
      refresh,
      subscriptionsLoaded: subscriptions !== null,
      expiring,
      liveSessions,
      coursesLoaded: unassigned !== null,
      unassigned: unassigned || [],
      pendingApprovals: pendingApprovals || [],
      pendingChildLinks: pendingChildLinks || [],
      pendingEnrollments: pendingEnrollments || [],
      pendingFreeAccess,
      counts: {
        approvals: approvalsCount,
        requests: (pendingEnrollments?.length || 0) + pendingFreeAccess.length,
        expiring: expiring.length,
        unassigned: unassigned?.length || 0,
        live: liveSessions.length,
      },
    };
  }, [refresh, subscriptions, liveSessions, unassigned, pendingApprovals, pendingChildLinks, pendingEnrollments, freeAccessRequests]);

  return <AdminSignalsContext.Provider value={value}>{children}</AdminSignalsContext.Provider>;
};
