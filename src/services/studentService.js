import axiosInstance from "../utils/axiosInstance";

export const studentService = {
  // Get student dashboard data
  getDashboard: async () => {
    try {
      console.log("Fetching student dashboard data...");
      
      const response = await axiosInstance.get("/classroom/student-dashboard/");
      
      console.log("Student dashboard response:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching student dashboard:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied. Student privileges required.");
      } else if (error.response?.status === 404) {
        throw new Error("Dashboard data not found. Please contact support.");
      } else if (error.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      }

      throw new Error(error.message || "Failed to load dashboard data");
    }
  },

  // Get student courses
  getCourses: async () => {
    try {
      const response = await axiosInstance.get("/student/courses/");
      return response.data;
    } catch (error) {
      console.error("Error fetching student courses:", error);
      throw new Error("Failed to load courses");
    }
  },

  // Get student assignments
  getAssignments: async () => {
    try {
      const response = await axiosInstance.get("/student/assignments/");
      return response.data;
    } catch (error) {
      console.error("Error fetching student assignments:", error);
      throw new Error("Failed to load assignments");
    }
  },

  // Get student live sessions
  getLiveSessions: async () => {
    try {
      const response = await axiosInstance.get("/student/live-sessions/");
      return response.data;
    } catch (error) {
      console.error("Error fetching student live sessions:", error);
      throw new Error("Failed to load live sessions");
    }
  },

  // Get student grades
  getGrades: async () => {
    try {
      const response = await axiosInstance.get("/student/grades/");
      return response.data;
    } catch (error) {
      console.error("Error fetching student grades:", error);
      throw new Error("Failed to load grades");
    }
  },

  // Join live session
  joinLiveSession: async (sessionId) => {
    try {
      const response = await axiosInstance.post(`/student/live-sessions/${sessionId}/join/`);
      return response.data;
    } catch (error) {
      console.error("Error joining live session:", error);
      throw new Error("Failed to join live session");
    }
  },

  // Submit assignment
  submitAssignment: async (assignmentId, submissionData) => {
    try {
      const response = await axiosInstance.post(`/student/assignments/${assignmentId}/submit/`, submissionData);
      return response.data;
    } catch (error) {
      console.error("Error submitting assignment:", error);
      throw new Error("Failed to submit assignment");
    }
  },

  // Get assignment details
  getAssignmentDetails: async (assignmentId) => {
    try {
      const response = await axiosInstance.get(`/student/assignments/${assignmentId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching assignment details:", error);
      throw new Error("Failed to load assignment details");
    }
  },

  // Enroll in course
  enrollInCourse: async (courseId) => {
    try {
      const response = await axiosInstance.post(`/student/courses/${courseId}/enroll/`);
      return response.data;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw new Error("Failed to enroll in course");
    }
  },

  // Get course progress
  getCourseProgress: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/student/courses/${courseId}/progress/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course progress:", error);
      throw new Error("Failed to load course progress");
    }
  },
};

export default studentService;
