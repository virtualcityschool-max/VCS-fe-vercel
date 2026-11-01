import axiosInstance from "../utils/axiosInstance";

const FREE_ACCESS_ENDPOINTS = {
  APPLY: "/free-access/apply/",
  ADMIN_LIST: "/free-access/requests/",
  RESOLVE: (id) => `/free-access/requests/${id}/resolve/`,
};

export const freeAccessService = {
  // Public / student submission
  apply: async (payload) => {
    {
      const response = await axiosInstance.post(FREE_ACCESS_ENDPOINTS.APPLY, payload);
      return response.data;
    }
  },

  // Admin review queue (optional ?status= filter)
  getRequests: async (params = {}) => {
    {
      const response = await axiosInstance.get(FREE_ACCESS_ENDPOINTS.ADMIN_LIST, { params });
      return response.data;
    }
  },

  // Admin per-course approve/reject
  // decisions: [{ course_id, action: "approve" | "reject" }]
  resolve: async (id, decisions, note = "") => {
    {
      const response = await axiosInstance.post(FREE_ACCESS_ENDPOINTS.RESOLVE(id), {
        decisions,
        note,
      });
      return response.data;
    }
  },
};
