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
  USER_PROFILE: (id) => `/users/${id}/profile/`,

  // Admin Dashboard
  ADMIN_DASHBOARD: "/admin/dashboard/",
  ADMIN_SESSIONS_DASHBOARD: "/classroom/admin-dashboard/",
  ALL_ENROLLMENTS: "/courses/all-enrollments/",

  // Child Link Requests
  CHILD_LINKS_PENDING: "/admin/child-links/pending/",
  CHILD_LINK_ACTION: (id) => `/admin/child-links/${id}/`,

  // Enrollment Management
  ADMIN_ENROLL: "/courses/admin-enroll/",
  PRIVATE_TEACHER_SLOTS: (id) => `/classroom/teachers/${id}/available-slots/`,
  PENDING_ENROLLMENTS: "/courses/enrollments/pending/",
  ENROLLMENT_ACTION: (id) => `/courses/enrollments/${id}/approve/`,

  // Teacher Slot Management (admin)
  ADMIN_TEACHER_SLOTS: (teacherId) => `/availability/slots/admin/teacher/${teacherId}/`,
  ADMIN_DELETE_SLOT: (slotId) => `/availability/slots/admin/${slotId}/`,

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
      throw error;
    }
  },
  getTeacherPrivateSlots: async (teacherId, params = {}) => {
    try {
      const response = await axiosInstance.get(
        ADMIN_ENDPOINTS.PRIVATE_TEACHER_SLOTS(teacherId),
        { params },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(
        ADMIN_ENDPOINTS.USER_DETAIL(userId),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createUser: async (userData) => {
    const response = await axiosInstance.post(
      ADMIN_ENDPOINTS.USER_CREATE,
      userData,
    );
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await axiosInstance.patch(
      ADMIN_ENDPOINTS.USER_UPDATE(userId),
      userData,
    );
    return response.data;
  },

  updateUserAvatar: async (userId, file) => {
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const response = await axiosInstance.patch(
        ADMIN_ENDPOINTS.USER_UPDATE(userId),
        fd,
      );
      return response.data;
    } catch (error) {
      throw error
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(
        ADMIN_ENDPOINTS.USER_DELETE(userId),
      );
      return response.data;
    } catch (error) {
      throw error
    }
  },

  purgeUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(
        ADMIN_ENDPOINTS.USER_DELETE(userId),
        { params: { permanent: true } },
      );
      return response.data;
    } catch (error) {
        throw error    
    }
  },

  // User Profile Management
  getUserProfile: async (userId) => {
    try {
      const response = await axiosInstance.get(
        ADMIN_ENDPOINTS.USER_PROFILE(userId),
      );
      return response.data;
    } catch (error) {
     throw error
    }
  },

  updateUserProfile: async (userId, profileData) => {
    try {
      const response = await axiosInstance.patch(
        ADMIN_ENDPOINTS.USER_PROFILE(userId),
        profileData,
      );
      return response.data;
    } catch (error) {
      throw error
    }
  },

  getDashboardAnalytics: async () => {
    try {
      const response = await axiosInstance.get(ADMIN_ENDPOINTS.ADMIN_DASHBOARD);
      return response.data;
    } catch (error) {
      throw error
    }
  },

  getAdminSessionsDashboard: async () => {
    try {
      const response = await axiosInstance.get(ADMIN_ENDPOINTS.ADMIN_SESSIONS_DASHBOARD);
      return response.data;
    } catch (error) {
      throw error
    }
  },
  
  getEnrollmentAnalytics: async (params = {}) => {
    try {
      const response = await axiosInstance.get(
        ADMIN_ENDPOINTS.ALL_ENROLLMENTS,
        {
          params,
        },
      );

      // Process raw enrollment data into time-series format for the chart
      const enrollments = response.data.results || response.data || [];

      if (!enrollments || enrollments.length === 0) {
        return {
          chartData: [],
          courses: [],
        };
      }

      // Check if enrollments have required fields
      const hasRequiredFields = enrollments.some(
        (e) => e.enrolled_at && e.course && e.course.id,
      );
      if (!hasRequiredFields) {
        return {
          chartData: [],
          courses: [],
        };
      }

      // Group enrollments by course and month
      const courseMonthlyData = {};
      const currentYear = new Date().getFullYear();
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Process each enrollment record
      enrollments.forEach((enrollment) => {
        if (
          enrollment.enrolled_at &&
          enrollment.course &&
          enrollment.course.id
        ) {
          const enrollmentDate = new Date(enrollment.enrolled_at);
          const enrollmentYear = enrollmentDate.getFullYear();

          // Only count current year enrollments
          if (enrollmentYear === currentYear) {
            const monthName = months[enrollmentDate.getMonth()];
            const courseId = enrollment.course.id;
            const courseTitle = enrollment.course.title || `Course ${courseId}`;

            // Initialize course data if not exists
            if (!courseMonthlyData[courseTitle]) {
              courseMonthlyData[courseTitle] = {};
              months.forEach((month) => {
                courseMonthlyData[courseTitle][month] = {
                  enrollments: 0,
                  active: 0,
                };
              });
            }

            // Increment counts
            courseMonthlyData[courseTitle][monthName].enrollments += 1;

            // Count as active if status is active (or default to active)
            if (enrollment.status === "active" || !enrollment.status) {
              courseMonthlyData[courseTitle][monthName].active += 1;
            }
          }
        }
      });

      // Convert to array format for the chart - show top 5 courses by total enrollments
      const courseTotals = Object.keys(courseMonthlyData)
        .map((courseTitle) => {
          const totalEnrollments = months.reduce(
            (sum, month) =>
              sum + courseMonthlyData[courseTitle][month].enrollments,
            0,
          );
          return { courseTitle, totalEnrollments };
        })
        .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
        .slice(0, 5);

      // Create chart data for top courses
      const chartData = months.map((month) => {
        const monthData = { month };

        courseTotals.forEach(({ courseTitle }) => {
          monthData[courseTitle] =
            courseMonthlyData[courseTitle][month].enrollments;
        });

        return monthData;
      });

      // Also return course list for legend
      const result = {
        chartData,
        courses: courseTotals.map(({ courseTitle }) => courseTitle),
      };

      return result;
    } catch (error) {
      throw error
    }
  },

  // Course Management
  updateCourse: async (courseId, courseData) => {

      const response = await axiosInstance.patch(
        `/courses/${courseId}/`,
        courseData,
      );
      return response.data;
    
  },

  deleteCourse: async (courseId) => {
    try {
      const response = await axiosInstance.delete(`/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      throw error
    }
  },

  // Enrollment Management
  createEnrollment: async (enrollmentData) => {
    try {
      const response = await axiosInstance.post(
        ADMIN_ENDPOINTS.ADMIN_ENROLL,
        enrollmentData,
      );
      return response.data;
    } catch (error) {
      throw error
    }
  },

  // Unenroll student from course (Admin only)
  unenrollStudent: async (courseId, studentId) => {
    try {
      const response = await axiosInstance.delete(
        `/courses/${courseId}/unenroll/`,
        {
          data: {
            student_id: studentId,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error
    }
  },

  // Child Link Requests
  getPendingChildLinks: async () => {
    try {
      const response = await axiosInstance.get(
        ADMIN_ENDPOINTS.CHILD_LINKS_PENDING,
      );
      return response.data;
    } catch (error) {
      throw error
    }
  },

  approveChildLink: async (linkId) => {
    try {
      const response = await axiosInstance.patch(
        ADMIN_ENDPOINTS.CHILD_LINK_ACTION(linkId),
        { action: "approve" },
      );
      return response.data;
    } catch (error) {
      throw error
    }
  },

  rejectChildLink: async (linkId) => {
    try {
      const response = await axiosInstance.patch(
        ADMIN_ENDPOINTS.CHILD_LINK_ACTION(linkId),
        { action: "reject" },
      );
      return response.data;
    } catch (error) {
      throw error
    }
  },

  unlinkChildrenAdmin: async (parentId, studentIds) => {
    console.log("firstparentId", parentId);
    try {
      const response = await axiosInstance.delete("/child-links/unlink/", {
        data: {
          parent_id: parentId,
          student_ids: studentIds,
        },
      });
      return response.data;
    } catch (error) {
      throw error
    }
  },

  getAvailableStudents: async () => {
    try {
      const response = await axiosInstance.get("/admin/students/available/");
      return response.data;
    } catch (error) {
      throw error
    }
  },

  linkChildrenAdmin: async (parentId, studentIds) => {
    console.log("first parent Id: ", parentId);
    try {
      const response = await axiosInstance.post("/auth/me/link-child/", {
        student_ids: studentIds,
        parent_id: parentId,
      });
      return response.data;
    } catch (error) {
      throw error
    }
  },

  getPendingEnrollments: async () => {
    try {
      const response = await axiosInstance.get(ADMIN_ENDPOINTS.PENDING_ENROLLMENTS);
      return response.data;
    } catch (error) {
      throw error
    }
  },

  actionEnrollment: async (enrollmentId, action) => {
    try {
      const response = await axiosInstance.patch(
        ADMIN_ENDPOINTS.ENROLLMENT_ACTION(enrollmentId),
        { action },
      );
      return response.data;
    } catch (error) {
      throw error
    }
  },

  getTeacherSlots: async (teacherId) => {
    try {
      const response = await axiosInstance.get(ADMIN_ENDPOINTS.ADMIN_TEACHER_SLOTS(teacherId));
      return response.data;
    } catch (error) {
      throw error
    }
  },

  adminDeleteSlot: async (slotId) => {
    try {
      const response = await axiosInstance.delete(ADMIN_ENDPOINTS.ADMIN_DELETE_SLOT(slotId));
      return response.data;
    } catch (error) {
      throw error
    }
  },
};
