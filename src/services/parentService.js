import { axiosInstance } from "../utils";
import { handleApiError } from "../utils/errorHandler";

// Parent service endpoints
const PARENT_ENDPOINTS = {
  DASHBOARD: "/classroom/parent-dashboard/",
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
};
