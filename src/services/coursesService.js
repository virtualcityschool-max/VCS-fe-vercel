import axiosInstance from "../utils/axiosInstance";

export const coursesService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      const response = await axiosInstance.get(`/courses/`);
      return response.data;
    } catch (error) {
      console.error("Get courses error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Get courses that have at least one session (for enrollment dropdown)
  getCoursesWithSessions: async () => {
    try {
      const response = await axiosInstance.get(`/courses/`, { params: { has_session: true } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      console.error("Get course error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Create a new course
  createCourse: async (courseData) => {
    try {
      const response = await axiosInstance.post(`/courses/`, courseData);
      return response.data;
    } catch (error) {
      console.error("Create course error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Assign instructor to course
  assignInstructor: async (courseId, instructorId) => {
    try {
      const response = await axiosInstance.patch(
        `/courses/${courseId}/assign-instructor/`,
        {
          instructor_id: instructorId,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Assign instructor error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Get course statistics
  getCourseStats: async () => {
    try {
      const response = await axiosInstance.get(`/courses/stats/`);
      return response.data;
    } catch (error) {
      console.error("Get course stats error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await axiosInstance.patch(
        `/courses/${courseId}/`,
        courseData,
      );
      return response.data;
    } catch (error) {
      console.error("Update course error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Unenroll from course
  unenrollFromCourse: async (courseId) => {
    try {
      const response = await axiosInstance.delete(
        `/courses/${courseId}/unenroll/`,
      );
      return response.data;
    } catch (error) {
      console.error("Unenroll from course error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Get all enrollments
  getAllEnrollments: async () => {
    try {
      const response = await axiosInstance.get(`/courses/all-enrollments/`);
      return response.data;
    } catch (error) {
      console.error("Get enrollments error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};
