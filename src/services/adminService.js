import { axiosInstance } from "../utils";
import { handleApiError } from "../utils/errorHandler";

// Base admin service configuration
const ADMIN_ENDPOINTS = {
  // User Management
  USERS: "/users/",
  USER_DETAIL: (id) => `/users/${id}/`,
  USER_CREATE: "/users/",
  USER_UPDATE: (id) => `/users/${id}/`,
  USER_DELETE: (id) => `/users/${id}/`,

  // Admin Dashboard
  ADMIN_DASHBOARD: "/admin/dashboard/",
  ALL_ENROLLMENTS: "/courses/all-enrollments/",
};

// User Management endpoints
export const adminService = {
  getUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get(ADMIN_ENDPOINTS.USERS, {
        params,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Users" });
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(
        ADMIN_ENDPOINTS.USER_DETAIL(userId),
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get User" });
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post(
        ADMIN_ENDPOINTS.USER_CREATE,
        userData,
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Create User" });
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axiosInstance.patch(
        ADMIN_ENDPOINTS.USER_UPDATE(userId),
        userData,
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Update User" });
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(
        ADMIN_ENDPOINTS.USER_DELETE(userId),
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Delete User" });
    }
  },

  getDashboardAnalytics: async () => {
    try {
      const response = await axiosInstance.get(ADMIN_ENDPOINTS.ADMIN_DASHBOARD);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        context: "Get Dashboard Analytics",
      });
    }
  },

  getEnrollmentAnalytics: async (params = {}) => {
    try {
      const response = await axiosInstance.get(
        ADMIN_ENDPOINTS.ALL_ENROLLMENTS,
        {
          params,
        },
      );

      // Process raw enrollment data into time-series format for the chart
      const enrollments = response.data.results || response.data || [];

      // Debug logging
      console.log("🔍 Raw enrollment data:", enrollments);
      console.log("🔍 Response structure:", response.data);

      if (!enrollments || enrollments.length === 0) {
        console.log("⚠️ No enrollment data found");
        return {
          chartData: [],
          courses: [],
        };
      }

      // Check if enrollments have required fields
      const hasRequiredFields = enrollments.some(
        (e) => e.enrolled_at && e.course && e.course.id,
      );
      if (!hasRequiredFields) {
        console.log(
          "⚠️ Enrollment data missing required fields (enrolled_at, course.id)",
        );
        console.log("🔍 Sample enrollment object:", enrollments[0]);
        return {
          chartData: [],
          courses: [],
        };
      }

      // Group enrollments by course and month
      const courseMonthlyData = {};
      const currentYear = new Date().getFullYear();
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Process each enrollment record
      enrollments.forEach((enrollment) => {
        if (
          enrollment.enrolled_at &&
          enrollment.course &&
          enrollment.course.id
        ) {
          const enrollmentDate = new Date(enrollment.enrolled_at);
          const enrollmentYear = enrollmentDate.getFullYear();

          console.log(
            `🔍 Processing enrollment: ${enrollment.course.title}, enrolled_at: ${enrollment.enrolled_at}, year: ${enrollmentYear}, current year: ${currentYear}`,
          );

          // Only count current year enrollments
          if (enrollmentYear === currentYear) {
            const monthName = months[enrollmentDate.getMonth()];
            const courseId = enrollment.course.id;
            const courseTitle = enrollment.course.title || `Course ${courseId}`;

            // Initialize course data if not exists
            if (!courseMonthlyData[courseTitle]) {
              courseMonthlyData[courseTitle] = {};
              months.forEach((month) => {
                courseMonthlyData[courseTitle][month] = {
                  enrollments: 0,
                  active: 0,
                };
              });
            }

            // Increment counts
            courseMonthlyData[courseTitle][monthName].enrollments += 1;

            console.log(
              `✅ Including enrollment for ${courseTitle} in ${monthName}`,
            );

            // Count as active if status is active (or default to active)
            if (enrollment.status === "active" || !enrollment.status) {
              courseMonthlyData[courseTitle][monthName].active += 1;
            }
          } else {
            console.log(
              `❌ Filtering out enrollment from ${enrollmentYear} (not current year ${currentYear})`,
            );
          }
        }
      });

      // Convert to array format for the chart - show top 5 courses by total enrollments
      const courseTotals = Object.keys(courseMonthlyData)
        .map((courseTitle) => {
          const totalEnrollments = months.reduce(
            (sum, month) =>
              sum + courseMonthlyData[courseTitle][month].enrollments,
            0,
          );
          return { courseTitle, totalEnrollments };
        })
        .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
        .slice(0, 5);

      // Create chart data for top courses
      const chartData = months.map((month) => {
        const monthData = { month };

        courseTotals.forEach(({ courseTitle }) => {
          monthData[courseTitle] =
            courseMonthlyData[courseTitle][month].enrollments;
        });

        return monthData;
      });

      // Also return course list for legend
      const result = {
        chartData,
        courses: courseTotals.map(({ courseTitle }) => courseTitle),
      };

      // Debug logging for processed data
      console.log("🔍 Processed chart data:", chartData);
      console.log("🔍 Course list:", result.courses);
      console.log("🔍 Course totals:", courseTotals);

      return result;
    } catch (error) {
      throw handleApiError(error, {
        context: "Get Enrollment Analytics",
      });
    }
  },

  // Course Management
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await axiosInstance.patch(
        `/courses/${courseId}/`,
        courseData,
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Update Course" });
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const response = await axiosInstance.delete(`/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Delete Course" });
    }
  },
};
