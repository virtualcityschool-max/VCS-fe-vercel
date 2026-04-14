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
      const response = await axiosInstance.get("/courses/");
      return response.data;
    } catch (error) {
      console.error("Error fetching student courses:", error);
      throw new Error("Failed to load courses");
    }
  },

  // Get all enrollments
  getAllEnrollments: async () => {
    try {
      const response = await axiosInstance.get(`/courses/all-enrollments/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      throw new Error("Failed to load enrollments");
    }
  },

  // Get student live sessions
  getLiveSessions: async () => {
    try {
      const response = await axiosInstance.get("/classroom/sessions/");
      return response.data;
    } catch (error) {
      console.error("Error fetching student live sessions:", error);
      throw new Error("Failed to load live sessions");
    }
  },

  // Get student grades
  getGrades: async () => {
    try {
      const response = await axiosInstance.get("/assignments/my-grades/");
      return response.data;
    } catch (error) {
      console.error("Error fetching student grades:", error);
      throw new Error("Failed to load grades");
    }
  },

  // Join live session
  joinLiveSession: async (sessionId) => {
    try {
      const response = await axiosInstance.post(
        `/student/live-sessions/${sessionId}/join/`,
      );
      return response.data;
    } catch (error) {
      console.error("Error joining live session:", error);
      throw new Error("Failed to join live session");
    }
  },

  // Submit assignment
  submitAssignment: async (assignmentId, submissionData) => {
    try {
      console.log("Submitting assignment:", assignmentId, submissionData);

      // Handle file upload if present
      const formData = new FormData();

      // Add text data
      if (submissionData.text_answer) {
        formData.append("text_answer", submissionData.text_answer);
      }

      // Add file if present
      if (submissionData.file) {
        formData.append("file", submissionData.file);
      }

      // Add any other metadata
      if (submissionData.metadata) {
        Object.keys(submissionData.metadata).forEach((key) => {
          formData.append(key, submissionData.metadata[key]);
        });
      }

      console.log("Submission FormData prepared");

      const response = await axiosInstance.post(
        `/assignments/${assignmentId}/submit/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Assignment submission response:", response.data);

      return {
        success: true,
        submission: response.data,
        message: "Assignment submitted successfully",
      };
    } catch (error) {
      console.error("Assignment submission error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        assignmentId,
      });

      // Handle specific error cases
      if (error.response?.status === 400) {
        const backendError = error.response?.data;

        if (backendError?.error?.includes("Assignment not found")) {
          const errorDetails = {
            error: "Assignment not found. Please check the assignment ID.",
            status: 400,
          };
          throw errorDetails;
        }

        if (backendError?.error?.includes("Deadline passed")) {
          const errorDetails = {
            error:
              "Assignment deadline has passed. Submissions are no longer accepted.",
            status: 400,
          };
          throw errorDetails;
        }

        if (backendError?.error?.includes("Already submitted")) {
          const errorDetails = {
            error:
              "You have already submitted this assignment. You can only submit once.",
            status: 400,
          };
          throw errorDetails;
        }

        // Handle file upload errors
        if (backendError?.file) {
          const errorDetails = {
            error: `File upload error: ${backendError.file[0]}`,
            status: 400,
          };
          throw errorDetails;
        }

        // Generic 400 error
        const errorDetails = {
          error:
            backendError?.error ||
            "Invalid submission data. Please check your submission and try again.",
          status: 400,
        };
        throw errorDetails;
      }

      if (error.response?.status === 401) {
        const errorDetails = {
          error: "Unauthorized. Please log in again.",
          status: 401,
        };
        throw errorDetails;
      }

      if (error.response?.status === 403) {
        const errorDetails = {
          error:
            "Access denied. You can only submit assignments for courses you're enrolled in.",
          status: 403,
        };
        throw errorDetails;
      }

      if (error.response?.status === 413) {
        const errorDetails = {
          error: "File too large. Please upload a smaller file.",
          status: 413,
        };
        throw errorDetails;
      }

      // Handle 500 specifically - backend server error
      if (error.response?.status === 500) {
        const errorDetails = {
          error: "Backend server error during assignment submission.",
          status: 500,
          suggestion: "Please try again in a few minutes or contact support.",
        };
        throw errorDetails;
      }

      throw new Error(error.message || "Failed to submit assignment");
    }
  },

  // Get submitted assignment details
  getSubmittedAssignmentDetails: async (assignmentId) => {
    try {
      const response = await axiosInstance.get(
        `/assignments/${assignmentId}/submissions/`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching assignment details:", error);
      throw new Error("Failed to load assignment details");
    }
  },

  // Enroll in course
  enrollInCourse: async (courseId) => {
    try {
      const response = await axiosInstance.post(`/courses/enroll/`, {
        course_id: courseId,
      });
      return response.data;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw new Error("Failed to enroll in course");
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
      console.error("Error unenrolling from course:", error);
      throw new Error("Failed to unenroll from course");
    }
  },

  // Get course progress
  getCourseProgress: async () => {
    try {
      const response = await axiosInstance.get(`/courses/stats/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course progress:", error);
      throw new Error("Failed to load course progress");
    }
  },

  // Get all assignments for enrolled courses
  getAssignments: async (params = {}) => {
    try {
      console.log("Fetching student assignments...");

      const response = await axiosInstance.get("/assignments/", { params });

      console.log("Student assignments response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error fetching student assignments:", {
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
        throw new Error("No assignments found. Please contact support.");
      } else if (error.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      }

      throw new Error(error.message || "Failed to load assignments");
    }
  },

  getAssignmentById: async (assignmentId) => {
    try {
      const response = await axiosInstance.get(`/assignments/${assignmentId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching assignment details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        assignmentId,
      });

      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied.");
      } else if (error.response?.status === 404) {
        throw new Error("Assignment not found.");
      }

      throw new Error(error.message || "Failed to load assignment details");
    }
  },

  // Get student's graded submissions
  getMyGrades: async (params = {}) => {
    try {
      console.log("Fetching student grades...");

      const response = await axiosInstance.get("/assignments/my-grades/", {
        params,
      });

      console.log("Student grades response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error fetching student grades:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      } else if (error.response?.status === 404) {
        throw new Error("No graded submissions found.");
      }

      throw new Error(error.message || "Failed to load grades");
    }
  },

  // Get student's own submission for a specific assignment
  getMySubmission: async (assignmentId) => {
    try {
      console.log("Fetching student submission for assignment:", assignmentId);

      const response = await axiosInstance.get(
        `/assignments/${assignmentId}/submissions/`,
      );

      console.log("Student submission response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error fetching student submission:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        assignmentId,
      });

      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error(
          "Access denied. You can only view your own submissions.",
        );
      } else if (error.response?.status === 404) {
        throw new Error("Assignment not found or no submission exists.");
      }

      throw new Error(error.message || "Failed to load submission");
    }
  },

  // Get all sessions for enrolled courses
  getStudentSessions: async (params = {}) => {
    try {
      console.log("Fetching student sessions...");

      const response = await axiosInstance.get("/classroom/sessions/", {
        params,
      });

      console.log("Student sessions response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error fetching student sessions:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied. Student privileges required.");
      } else if (error.response?.status === 404) {
        throw new Error("No sessions found. Please contact support.");
      }

      throw new Error(error.message || "Failed to load sessions");
    }
  },

  // Get student's attendance for a specific session
  getSessionAttendance: async (sessionId) => {
    try {
      console.log("Fetching attendance for session:", sessionId);

      const response = await axiosInstance.get(
        `/classroom/sessions/${sessionId}/attendance/`,
      );

      console.log("Session attendance response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error fetching session attendance:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        sessionId,
      });

      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error(
          "Access denied. You can only view your own attendance.",
        );
      } else if (error.response?.status === 404) {
        throw new Error("Session not found or attendance not available.");
      }

      throw new Error(error.message || "Failed to load attendance");
    }
  },

  // Announcements
  getUnreadAnnouncementsCount: async () => {
    const response = await axiosInstance.get(
      "/messaging/announcements/unread-count/",
    );
    return response.data;
  },

  getMyAnnouncements: async () => {
    const response = await axiosInstance.get("/messaging/announcements/my/");
    return response.data;
  },
};

export default studentService;
