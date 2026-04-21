import { axiosInstance } from "../utils";

const adminSessionService = {
  // Get all sessions
  getSessions: async (params = {}) => {
    const response = await axiosInstance.get("/classroom/sessions/", {
      params,
    });
    return response.data;
  },

  // Create a new session
  createSession: async (sessionData) => {
    const response = await axiosInstance.post(
      "/classroom/sessions/",
      sessionData,
    );
    return response.data;
  },

  // Update a session
  updateSession: async (sessionId, sessionData) => {
    // Map frontend field names to backend field names
    const mappedData = {
      course: sessionData.course_id,
      title: sessionData.title,
      scheduled_at: sessionData.start_time,
      meeting_link: sessionData.meeting_link,
    };
    const response = await axiosInstance.patch(
      `/classroom/sessions/${sessionId}/`,
      mappedData,
    );
    return response.data;
  },

  // Delete a session
  deleteSession: async (sessionId) => {
    await axiosInstance.delete(`/classroom/sessions/${sessionId}/`);
    return sessionId;
  },

  // Get a single session by ID
  getSessionById: async (sessionId) => {
    const response = await axiosInstance.get(
      `/classroom/sessions/${sessionId}/`,
    );
    return response.data;
  },

  // Get private students for a specific course
  getPrivateStudentsByCourse: async (courseId) => {
    const response = await axiosInstance.get(
      `/courses/${courseId}/private-students/`,
    );
    return response.data;
  },
};

export { adminSessionService };
