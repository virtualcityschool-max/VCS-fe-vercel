import axiosInstance from "../utils/axiosInstance";

const HIRE_ENDPOINTS = {
  SUBMIT: "/hire/",
  ADMIN_LIST: "/admin/hire-requests/",
  ADMIN_ACTION: (id) => `/admin/hire-requests/${id}/`,
  MY_LEADS: "/hire/my-leads/",
};

export const hireService = {
  submitHireRequest: async (payload) => {
    {
      const response = await axiosInstance.post(HIRE_ENDPOINTS.SUBMIT, payload);
      return response.data;
    }
  },

  getAdminHireRequests: async (status) => {
    {
      const params = status ? { status } : {};
      const response = await axiosInstance.get(HIRE_ENDPOINTS.ADMIN_LIST, { params });
      return response.data;
    }
  },

  actionHireRequest: async (id, action) => {
    {
      const response = await axiosInstance.patch(HIRE_ENDPOINTS.ADMIN_ACTION(id), { action });
      return response.data;
    }
  },

  getMyLeads: async (status) => {
    {
      const params = status ? { status } : {};
      const response = await axiosInstance.get(HIRE_ENDPOINTS.MY_LEADS, { params });
      return response.data;
    }
  },
};
