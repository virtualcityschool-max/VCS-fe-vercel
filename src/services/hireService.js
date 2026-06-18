import axiosInstance from "../utils/axiosInstance";
import { handleApiError } from "../utils/errorHandler";

const HIRE_ENDPOINTS = {
  SUBMIT: "/hire/",
  ADMIN_LIST: "/admin/hire-requests/",
  ADMIN_ACTION: (id) => `/admin/hire-requests/${id}/`,
  MY_LEADS: "/hire/my-leads/",
};

export const hireService = {
  submitHireRequest: async (payload) => {
    try {
      const response = await axiosInstance.post(HIRE_ENDPOINTS.SUBMIT, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAdminHireRequests: async (status) => {
    try {
      const params = status ? { status } : {};
      const response = await axiosInstance.get(HIRE_ENDPOINTS.ADMIN_LIST, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  actionHireRequest: async (id, action) => {
    try {
      const response = await axiosInstance.patch(HIRE_ENDPOINTS.ADMIN_ACTION(id), { action });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMyLeads: async (status) => {
    try {
      const params = status ? { status } : {};
      const response = await axiosInstance.get(HIRE_ENDPOINTS.MY_LEADS, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
