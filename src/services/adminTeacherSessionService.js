import { axiosInstance } from "../utils";

const adminTeacherSessionService = {
  getSessions: async (params = {}) => {
    {
      const response = await axiosInstance.get("/classroom/admin-teacher-sessions/", { params });
      return response.data;
    }
  },

  createSession: async (sessionData) => {
      const response = await axiosInstance.post("/classroom/admin-teacher-sessions/", sessionData);
      return response.data;
  },

  updateSession: async (sessionId, sessionData) => {
    {
      const response = await axiosInstance.patch(`/classroom/admin-teacher-sessions/${sessionId}/`, sessionData);
      return response.data;
    }
  },

  deleteSession: async (sessionId) => {
    {
      await axiosInstance.delete(`/classroom/admin-teacher-sessions/${sessionId}/`);
      return sessionId;
    }
  },

  cancelFuture: async (sessionId) => {
    {
      const response = await axiosInstance.patch(`/classroom/admin-teacher-sessions/${sessionId}/cancel-future/`);
      return response.data;
    }
  },

  startSession: async (sessionId) => {
    {
      const response = await axiosInstance.patch(`/classroom/admin-teacher-sessions/${sessionId}/start/`);
      return response.data;
    }
  },

  endSession: async (sessionId) => {
    {
      const response = await axiosInstance.patch(`/classroom/admin-teacher-sessions/${sessionId}/end/`);
      return response.data;
    }
  },

  getAllAttendance: async () => {
    {
      const response = await axiosInstance.get("/classroom/admin-teacher-sessions/attendance/");
      return response.data;
    }
  },

  joinSession: async (sessionId) => {
    {
      const response = await axiosInstance.post(`/classroom/admin-teacher-sessions/${sessionId}/join/`);
      return response.data;
    }
  },

  leaveSession: async (sessionId) => {
    {
      const response = await axiosInstance.post(`/classroom/admin-teacher-sessions/${sessionId}/leave/`);
      return response.data;
    }
  },
};

export { adminTeacherSessionService };
