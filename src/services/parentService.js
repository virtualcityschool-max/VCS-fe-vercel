import { axiosInstance } from "../utils";
import { handleApiError } from "../utils/errorHandler";

// Parent service endpoints
const PARENT_ENDPOINTS = {
  DASHBOARD: "/classroom/parent-dashboard/",
  CHILD_GRADES: "/assignments/child-grades/",
  CHILD_ATTENDANCE: "/classroom/child-attendance/",
};

export const parentService = {
  // Get parent dashboard data
  getDashboard: async () => {
    try {
      const response = await axiosInstance.get(PARENT_ENDPOINTS.DASHBOARD);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Parent Dashboard" });
    }
  },

  // Get child grades
  getChildGrades: async (childId) => {
    try {
      const response = await axiosInstance.get(PARENT_ENDPOINTS.CHILD_GRADES, {
        params: { child_id: childId },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Child Grades" });
    }
  },

  // Get child attendance
  getChildAttendance: async (childId) => {
    try {
      const response = await axiosInstance.get(
        PARENT_ENDPOINTS.CHILD_ATTENDANCE,
        {
          params: { child_id: childId },
        },
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Child Attendance" });
    }
  },
};
