import { API_BASE_URL } from '../constants';
import { axiosInstance } from '../utils';
import { handleApiError } from '../utils/errorHandler';

// Base admin service configuration
const ADMIN_ENDPOINTS = {
  // User Management
  USERS: '/admin/users',
  USER_DETAIL: (id) => `/admin/users/${id}`,
  USER_CREATE: '/admin/users',
  USER_UPDATE: (id) => `/admin/users/${id}`,
  USER_DELETE: (id) => `/admin/users/${id}`,
  
  // Course Management
  COURSES: '/admin/courses',
  COURSE_DETAIL: (id) => `/admin/courses/${id}`,
  COURSE_CREATE: '/admin/courses',
  COURSE_UPDATE: (id) => `/admin/courses/${id}`,
  COURSE_DELETE: (id) => `/admin/courses/${id}`,
  
  // Analytics
  ANALYTICS_DASHBOARD: '/admin/analytics/dashboard',
  ANALYTICS_USERS: '/admin/analytics/users',
  ANALYTICS_COURSES: '/admin/analytics/courses',
  ANALYTICS_REVENUE: '/admin/analytics/revenue',
  
  // System Settings
  SETTINGS: '/admin/settings',
  SYSTEM_STATUS: '/admin/system/status',
  
  // Reports
  REPORTS: '/admin/reports',
  REPORT_USER_ACTIVITY: '/admin/reports/user-activity',
  REPORT_COURSE_PERFORMANCE: '/admin/reports/course-performance',
};

// User Management endpoints
export const adminService = {
  // Get all users with pagination and filtering
  getUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.USERS}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get Users' });
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.USER_DETAIL(userId)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get User' });
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}${ADMIN_ENDPOINTS.USER_CREATE}`, userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Create User' });
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}${ADMIN_ENDPOINTS.USER_UPDATE(userId)}`, userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Update User' });
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}${ADMIN_ENDPOINTS.USER_DELETE(userId)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Delete User' });
    }
  },

  // Course Management endpoints
  getCourses: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.COURSES}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get Courses' });
    }
  },

  getCourseById: async (courseId) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.COURSE_DETAIL(courseId)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get Course' });
    }
  },

  createCourse: async (courseData) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}${ADMIN_ENDPOINTS.COURSE_CREATE}`, courseData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Create Course' });
    }
  },

  updateCourse: async (courseId, courseData) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}${ADMIN_ENDPOINTS.COURSE_UPDATE(courseId)}`, courseData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Update Course' });
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}${ADMIN_ENDPOINTS.COURSE_DELETE(courseId)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Delete Course' });
    }
  },

  // Analytics endpoints
  getDashboardAnalytics: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.ANALYTICS_DASHBOARD}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get Dashboard Analytics' });
    }
  },

  getUserAnalytics: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.ANALYTICS_USERS}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get User Analytics' });
    }
  },

  getCourseAnalytics: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.ANALYTICS_COURSES}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get Course Analytics' });
    }
  },

  getRevenueAnalytics: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.ANALYTICS_REVENUE}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get Revenue Analytics' });
    }
  },

  // System Settings endpoints
  getSettings: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.SETTINGS}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get Settings' });
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}${ADMIN_ENDPOINTS.SETTINGS}`, settingsData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Update Settings' });
    }
  },

  getSystemStatus: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.SYSTEM_STATUS}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get System Status' });
    }
  },

  // Reports endpoints
  getReports: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.REPORTS}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get Reports' });
    }
  },

  getUserActivityReport: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.REPORT_USER_ACTIVITY}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get User Activity Report' });
    }
  },

  getCoursePerformanceReport: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${ADMIN_ENDPOINTS.REPORT_COURSE_PERFORMANCE}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: 'Get Course Performance Report' });
    }
  },
};
