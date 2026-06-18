import { axiosInstance } from "../utils";
import { handleApiError } from "../utils/errorHandler";

const adminTeacherSessionService = {
  getSessions: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/classroom/admin-teacher-sessions/", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createSession: async (sessionData) => {
      const response = await axiosInstance.post("/classroom/admin-teacher-sessions/", sessionData);
      return response.data;
  },

  updateSession: async (sessionId, sessionData) => {
    try {
      const response = await axiosInstance.patch(`/classroom/admin-teacher-sessions/${sessionId}/`, sessionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await axiosInstance.delete(`/classroom/admin-teacher-sessions/${sessionId}/`);
      return sessionId;
    } catch (error) {
      throw error;
    }
  },

  cancelFuture: async (sessionId) => {
    try {
      const response = await axiosInstance.patch(`/classroom/admin-teacher-sessions/${sessionId}/cancel-future/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  startSession: async (sessionId) => {
    try {
      const response = await axiosInstance.patch(`/classroom/admin-teacher-sessions/${sessionId}/start/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  endSession: async (sessionId) => {
    try {
      const response = await axiosInstance.patch(`/classroom/admin-teacher-sessions/${sessionId}/end/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllAttendance: async () => {
    try {
      const response = await axiosInstance.get("/classroom/admin-teacher-sessions/attendance/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  joinSession: async (sessionId) => {
    try {
      const response = await axiosInstance.post(`/classroom/admin-teacher-sessions/${sessionId}/join/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  leaveSession: async (sessionId) => {
    try {
      const response = await axiosInstance.post(`/classroom/admin-teacher-sessions/${sessionId}/leave/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export { adminTeacherSessionService };
