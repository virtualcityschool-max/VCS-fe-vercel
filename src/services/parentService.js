import { axiosInstance } from "../utils";

// Parent service endpoints
const PARENT_ENDPOINTS = {
  DASHBOARD: "/classroom/parent-dashboard/",
  CHILD_GRADES: "/assignments/all-grades/",
  CHILD_ATTENDANCE: "/classroom/child-attendance/",
  ATTENDANCE: "/classroom/attendance/",
  CHILD_COURSES: "/courses/",
  UNLINK_CHILDREN: "/child-links/unlink/",
  PARENT_CHILD_DETAIL: "/classroom/parent-child-detail/",
};

export const parentService = {
  // Get parent dashboard data
  getDashboard: async () => {
    {
      const response = await axiosInstance.get(PARENT_ENDPOINTS.DASHBOARD);
      return response.data;
    }
  },

  // Get detailed information for a specific child
  getChildDetail: async (childId) => {
    {
      const response = await axiosInstance.get(PARENT_ENDPOINTS.PARENT_CHILD_DETAIL, {
        params: { child_id: childId },
      });
      return response.data;
    }
  },

  // Get child grades
  getChildGrades: async (childId) => {
    {
      const response = await axiosInstance.get(PARENT_ENDPOINTS.CHILD_GRADES, {
        params: { child_id: childId },
      });
      return response.data;
    }
  },

  // Get child attendance
  getChildAttendance: async (childId) => {
    {
      const response = await axiosInstance.get(
        PARENT_ENDPOINTS.CHILD_ATTENDANCE,
        {
          params: { child_id: childId },
        },
      );
      return response.data;
    }
  },

  // Get child's enrolled courses
  getChildCourses: async (childId) => {
    {
      const response = await axiosInstance.get(PARENT_ENDPOINTS.CHILD_COURSES, {
        params: { student: childId },
      });
      return response.data?.results ?? response.data;
    }
  },

  // Get filtered attendance records for a child (calendar view)
  getChildAttendanceRecords: async ({ childId, courseId, from, to }) => {
    {
      const params = { student: childId, participant_role: "student" };
      if (courseId) params.course = courseId;
      if (from) params.from = from;
      if (to) params.to = to;
      const response = await axiosInstance.get(PARENT_ENDPOINTS.ATTENDANCE, { params });
      return response.data?.results ?? response.data;
    }
  },

  // Unlink children from parent
  unlinkChildren: async (studentIds) => {
    {
      const response = await axiosInstance.delete(
        PARENT_ENDPOINTS.UNLINK_CHILDREN,
        {
          data: {
            student_ids: studentIds,
          },
        },
      );
      return response.data;
    }
  },
};
