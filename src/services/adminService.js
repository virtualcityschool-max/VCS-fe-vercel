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
