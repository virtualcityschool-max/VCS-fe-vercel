import { axiosInstance } from "../utils";
import { handleApiError } from "../utils/errorHandler";

// Parent service endpoints
const PARENT_ENDPOINTS = {
  DASHBOARD: "/classroom/parent-dashboard/",
  CHILD_GRADES: "/assignments/child-grades/",
  CHILD_ATTENDANCE: "/classroom/child-attendance/",
  ATTENDANCE: "/classroom/attendance/",
  CHILD_COURSES: "/courses/",
  UNLINK_CHILDREN: "/child-links/unlink/",
  PARENT_CHILD_DETAIL: "/classroom/parent-child-detail/",
};

export const parentService = {
  // Get parent dashboard data
  getDashboard: async () => {
    try {
      const response = await axiosInstance.get(PARENT_ENDPOINTS.DASHBOARD);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Parent Dashboard" });
    }
  },

  // Get detailed information for a specific child
  getChildDetail: async (childId) => {
    try {
      const response = await axiosInstance.get(PARENT_ENDPOINTS.PARENT_CHILD_DETAIL, {
        params: { child_id: childId },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Child Detail" });
    }
  },

  // Get child grades
  getChildGrades: async (childId) => {
    try {
      const response = await axiosInstance.get(PARENT_ENDPOINTS.CHILD_GRADES, {
        params: { child_id: childId },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Child Grades" });
    }
  },

  // Get child attendance
  getChildAttendance: async (childId) => {
    try {
      const response = await axiosInstance.get(
        PARENT_ENDPOINTS.CHILD_ATTENDANCE,
        {
          params: { child_id: childId },
        },
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Child Attendance" });
    }
  },

  // Get child's enrolled courses
  getChildCourses: async (childId) => {
    try {
      const response = await axiosInstance.get(PARENT_ENDPOINTS.CHILD_COURSES, {
        params: { student: childId },
      });
      return response.data?.results ?? response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Child Courses" });
    }
  },

  // Get filtered attendance records for a child (calendar view)
  getChildAttendanceRecords: async ({ childId, courseId, from, to }) => {
    try {
      const params = { student: childId, participant_role: "student" };
      if (courseId) params.course = courseId;
      if (from) params.from = from;
      if (to) params.to = to;
      const response = await axiosInstance.get(PARENT_ENDPOINTS.ATTENDANCE, { params });
      return response.data?.results ?? response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Get Child Attendance Records" });
    }
  },

  // Unlink children from parent
  unlinkChildren: async (studentIds) => {
    try {
      const response = await axiosInstance.delete(
        PARENT_ENDPOINTS.UNLINK_CHILDREN,
        {
          data: {
            student_ids: studentIds,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: "Unlink Children" });
    }
  },
};
