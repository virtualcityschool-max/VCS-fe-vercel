import { axiosInstance } from "../utils";
import { handleApiError } from "../utils/errorHandler";

const adminTeacherSessionService = {
  getSessions: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/classroom/admin-teacher-sessions/", { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Teacher Planner Sessions" });
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
      throw handleApiError(error, { context: "Update Teacher Planner Session" });
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await axiosInstance.delete(`/classroom/admin-teacher-sessions/${sessionId}/`);
      return sessionId;
    } catch (error) {
      throw handleApiError(error, { context: "Delete Teacher Planner Session" });
    }
  },

  cancelFuture: async (sessionId) => {
    try {
      const response = await axiosInstance.patch(`/classroom/admin-teacher-sessions/${sessionId}/cancel-future/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Cancel Future Teacher Planner Sessions" });
    }
  },

  startSession: async (sessionId) => {
    try {
      const response = await axiosInstance.patch(`/classroom/admin-teacher-sessions/${sessionId}/start/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Start Teacher Planner Session" });
    }
  },

  endSession: async (sessionId) => {
    try {
      const response = await axiosInstance.patch(`/classroom/admin-teacher-sessions/${sessionId}/end/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "End Teacher Planner Session" });
    }
  },

  getAllAttendance: async () => {
    try {
      const response = await axiosInstance.get("/classroom/admin-teacher-sessions/attendance/");
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Admin Sessions Attendance" });
    }
  },

  joinSession: async (sessionId) => {
    try {
      const response = await axiosInstance.post(`/classroom/admin-teacher-sessions/${sessionId}/join/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Join Admin Session" });
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
