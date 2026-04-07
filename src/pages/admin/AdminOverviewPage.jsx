import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import OverviewTab from "../../components/admin/OverviewTab";

const AdminOverviewPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const [enrollmentAnalytics, setEnrollmentAnalytics] = useState(null);
  const [enrollmentAnalyticsLoading, setEnrollmentAnalyticsLoading] =
    useState(false);
  const [enrollmentAnalyticsError, setEnrollmentAnalyticsError] =
    useState(null);

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

    const fetchEnrollmentAnalytics = async () => {
      try {
        setEnrollmentAnalyticsLoading(true);
        setEnrollmentAnalyticsError(null);

        const data = await adminService.getEnrollmentAnalytics();
        setEnrollmentAnalytics(data);
      } catch {
        setEnrollmentAnalyticsError("Failed to load enrollment data");
        // Set fallback data if API fails
        setEnrollmentAnalytics([
          { month: "Jan", enrollments: 0, active: 0 },
          { month: "Feb", enrollments: 0, active: 0 },
          { month: "Mar", enrollments: 0, active: 0 },
          { month: "Apr", enrollments: 0, active: 0 },
          { month: "May", enrollments: 0, active: 0 },
          { month: "Jun", enrollments: 0, active: 0 },
        ]);
      } finally {
        setEnrollmentAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
    fetchEnrollmentAnalytics();
  }, []);

  return (
    <OverviewTab
      analytics={analytics}
      analyticsLoading={analyticsLoading}
      analyticsError={analyticsError}
      enrollmentAnalytics={enrollmentAnalytics}
      enrollmentAnalyticsLoading={enrollmentAnalyticsLoading}
      enrollmentAnalyticsError={enrollmentAnalyticsError}
    />
  );
};

export default AdminOverviewPage;
