import axiosInstance from "../utils/axiosInstance";

const FREE_ACCESS_ENDPOINTS = {
  APPLY: "/free-access/apply/",
  ADMIN_LIST: "/free-access/requests/",
  RESOLVE: (id) => `/free-access/requests/${id}/resolve/`,
};

export const freeAccessService = {
  // Public / student submission
  apply: async (payload) => {
    try {
      const response = await axiosInstance.post(FREE_ACCESS_ENDPOINTS.APPLY, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin review queue (optional ?status= filter)
  getRequests: async (params = {}) => {
    try {
      const response = await axiosInstance.get(FREE_ACCESS_ENDPOINTS.ADMIN_LIST, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin per-course approve/reject
  // decisions: [{ course_id, action: "approve" | "reject" }]
  resolve: async (id, decisions, note = "") => {
    try {
      const response = await axiosInstance.post(FREE_ACCESS_ENDPOINTS.RESOLVE(id), {
        decisions,
        note,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
