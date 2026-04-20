import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import OverviewTab from "../../components/admin/OverviewTab";

const AdminOverviewPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

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
  }, []);

  return (
    <OverviewTab
      analytics={analytics}
      analyticsLoading={analyticsLoading}
      analyticsError={analyticsError}
    />
  );
};

export default AdminOverviewPage;
