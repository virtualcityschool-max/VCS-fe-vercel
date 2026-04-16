import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminService } from "../../services/adminService";
import { coursesService } from "../../services/coursesService";
import { adminSessionService } from "../../services/adminSessionService";
import { handleApiError } from "../../utils/errorHandler";
import { axiosInstance } from "../../utils";

// Initial state
const initialState = {
  // User Management
  users: {
    data: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  },

  // Course Management
  courses: {
    data: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  },

  // Analytics
  analytics: {
    dashboard: null,
    users: null,
    courses: null,
    revenue: null,
    loading: false,
    error: null,
  },

  // System Settings
  settings: {
    data: null,
    loading: false,
    error: null,
  },

  // System Status
  systemStatus: {
    data: null,
    loading: false,
    error: null,
  },

  // Reports
  reports: {
    data: [],
    loading: false,
    error: null,
  },

  // Enrollments
  enrollments: {
    data: [],
    loading: false,
    error: null,
  },

  // Sessions
  sessions: {
    data: [],
    loading: false,
    error: null,
  },

  // Available Students for Parent linking
  availableStudents: {
    data: [],
    loading: false,
    error: null,
  },
};

// User Management Thunks
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getUsers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

export const createUser = createAsyncThunk(
  "admin/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await adminService.createUser(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateUser(userId, userData);
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await adminService.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

// Course Management Thunks
export const fetchCourses = createAsyncThunk(
  "admin/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await coursesService.getAllCourses();
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

export const fetchAllCourses = createAsyncThunk(
  "admin/fetchAllCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await coursesService.getAllCourses();
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

export const createCourse = createAsyncThunk(
  "admin/createCourse",
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await coursesService.createCourse(courseData);
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

export const assignInstructor = createAsyncThunk(
  "admin/assignInstructor",
  async ({ courseId, instructorId }, { rejectWithValue }) => {
    try {
      const response = await coursesService.assignInstructor(
        courseId,
        instructorId,
      );
      return { courseId, instructorId, ...response };
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

export const updateCourse = createAsyncThunk(
  "admin/updateCourse",
  async ({ courseId, courseData }, { rejectWithValue }) => {
    try {
      const response = await coursesService.updateCourse(courseId, courseData);
      return { courseId, ...response };
    } catch (error) {
      const processedError = handleApiError(error, {
        context: "Update Course",
        logError: true,
      });
      return rejectWithValue(processedError);
    }
  },
);

export const deleteCourse = createAsyncThunk(
  "admin/deleteCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      await adminService.deleteCourse(courseId);
      return courseId;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

// Analytics Thunks
export const fetchDashboardAnalytics = createAsyncThunk(
  "admin/fetchDashboardAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getDashboardAnalytics();
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

export const fetchUserAnalytics = createAsyncThunk(
  "admin/fetchUserAnalytics",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getUserAnalytics(params);
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

export const fetchCourseAnalytics = createAsyncThunk(
  "admin/fetchCourseAnalytics",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getCourseAnalytics(params);
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

// Settings Thunks
export const fetchSettings = createAsyncThunk(
  "admin/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getSettings();
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

export const updateSettings = createAsyncThunk(
  "admin/updateSettings",
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await adminService.updateSettings(settingsData);
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

// System Status Thunk
export const fetchSystemStatus = createAsyncThunk(
  "admin/fetchSystemStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getSystemStatus();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch system status");
    }
  },
);

// Reports Thunks
export const fetchReports = createAsyncThunk(
  "admin/fetchReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getReports(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch reports");
    }
  },
);

// Enrollments Thunks
export const fetchEnrollments = createAsyncThunk(
  "admin/fetchEnrollments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/courses/all-enrollments/", {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch enrollments");
    }
  },
);

export const createEnrollment = createAsyncThunk(
  "admin/createEnrollment",
  async (enrollmentData, { rejectWithValue }) => {
    try {
      const response = await adminService.createEnrollment(enrollmentData);
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object for proper error handling
    }
  },
);

export const unenrollStudent = createAsyncThunk(
  "admin/unenrollStudent",
  async ({ courseId, studentId }, { rejectWithValue }) => {
    try {
      const response = await adminService.unenrollStudent(courseId, studentId);
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object for proper error handling
    }
  },
);

// Sessions Thunks
export const fetchSessions = createAsyncThunk(
  "admin/fetchSessions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminSessionService.getSessions(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch sessions");
    }
  },
);

export const createSession = createAsyncThunk(
  "admin/createSession",
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await adminSessionService.createSession(sessionData);
      return response;
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object for proper error handling
    }
  },
);

export const updateSession = createAsyncThunk(
  "admin/updateSession",
  async ({ sessionId, sessionData }, { rejectWithValue }) => {
    try {
      const response = await adminSessionService.updateSession(
        sessionId,
        sessionData,
      );
      return { sessionId, ...response };
    } catch (error) {
      return rejectWithValue(error); // Preserve full error object for proper error handling
    }
  },
);

export const deleteSession = createAsyncThunk(
  "admin/deleteSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      await adminSessionService.deleteSession(sessionId);
      return sessionId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete session");
    }
  },
);

// Available Students Thunk
export const fetchAvailableStudents = createAsyncThunk(
  "admin/fetchAvailableStudents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAvailableStudents();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// Slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    // Clear specific errors
    clearUsersError: (state) => {
      state.users.error = null;
    },
    clearCoursesError: (state) => {
      state.courses.error = null;
    },
    clearAnalyticsError: (state) => {
      state.analytics.error = null;
    },
    clearSettingsError: (state) => {
      state.settings.error = null;
    },
    clearSystemStatusError: (state) => {
      state.systemStatus.error = null;
    },
    clearReportsError: (state) => {
      state.reports.error = null;
    },
    clearEnrollmentsError: (state) => {
      state.enrollments.error = null;
    },
    clearSessionsError: (state) => {
      state.sessions.error = null;
    },
    clearAvailableStudentsError: (state) => {
      state.availableStudents.error = null;
    },

    // Clear all errors
    clearAllErrors: (state) => {
      state.users.error = null;
      state.courses.error = null;
      state.analytics.error = null;
      state.settings.error = null;
      state.systemStatus.error = null;
      state.reports.error = null;
      state.enrollments.error = null;
      state.sessions.error = null;
      state.availableStudents.error = null;
    },

    // Reset specific state
    resetUsers: (state) => {
      state.users = initialState.users;
    },
    resetCourses: (state) => {
      state.courses = initialState.courses;
    },
    resetAnalytics: (state) => {
      state.analytics = initialState.analytics;
    },
  },
  extraReducers: (builder) => {
    // Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.data = action.payload.data || action.payload;
        state.users.pagination =
          action.payload.pagination || initialState.users.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.data.unshift(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.data.findIndex(
          (user) => user.id === action.payload.id,
        );
        if (index !== -1) {
          state.users.data[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users.data = state.users.data.filter(
          (user) => user.id !== action.payload,
        );
      });

    // Courses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.courses.loading = true;
        state.courses.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.courses.loading = false;
        const coursesData =
          action.payload.data?.data || action.payload.data || action.payload;

        // Restore timestamps from localStorage
        const timestamps = JSON.parse(
          localStorage.getItem("courseUpdateTimestamps") || "{}",
        );
        const coursesWithTimestamps = coursesData.map((course) => ({
          ...course,
          updated_at:
            course.updated_at ||
            course.modified_at ||
            timestamps[course.id] ||
            null,
        }));

        state.courses.data = coursesWithTimestamps;
        state.courses.pagination =
          action.payload.pagination || initialState.courses.pagination;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.courses.loading = false;
        state.courses.error = action.payload;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.courses.data.unshift(action.payload);
      })
      .addCase(assignInstructor.fulfilled, (state, action) => {
        const { courseId, instructorId } = action.payload;
        const courseIndex = state.courses.data.findIndex(
          (course) => course.id === courseId,
        );
        if (courseIndex !== -1) {
          state.courses.data[courseIndex].instructor_id = instructorId;
        }
      })
      .addCase(updateCourse.pending, () => {
        // No optimistic update for instructor-related changes to prevent data corruption
        // Let the refetch handle the state update
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        const { courseId } = action.payload;
        const courseIndex = state.courses.data.findIndex(
          (course) => course.id === courseId,
        );

        if (courseIndex !== -1) {
          state.courses.data[courseIndex] = {
            ...state.courses.data[courseIndex],
            ...action.payload,
            updated_at: new Date().toISOString(),
          };
        }
      })
      .addCase(updateCourse.rejected, () => {
        // No optimistic update to revert - error handled via toast notification
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses.data = state.courses.data.filter(
          (course) => course.id !== action.payload,
        );
      });

    // Analytics
    builder
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.dashboard = action.payload;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.analytics.loading = false;
        state.analytics.error = action.payload;
      })
      .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
        state.analytics.users = action.payload;
      })
      .addCase(fetchCourseAnalytics.fulfilled, (state, action) => {
        state.analytics.courses = action.payload;
      });

    // Settings
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.settings.loading = true;
        state.settings.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings.loading = false;
        state.settings.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.settings.loading = false;
        state.settings.error = action.payload;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings.data = action.payload;
      });

    // System Status
    builder
      .addCase(fetchSystemStatus.pending, (state) => {
        state.systemStatus.loading = true;
        state.systemStatus.error = null;
      })
      .addCase(fetchSystemStatus.fulfilled, (state, action) => {
        state.systemStatus.loading = false;
        state.systemStatus.data = action.payload;
      })
      .addCase(fetchSystemStatus.rejected, (state, action) => {
        state.systemStatus.loading = false;
        state.systemStatus.error = action.payload;
      });

    // Reports
    builder
      .addCase(fetchReports.pending, (state) => {
        state.reports.loading = true;
        state.reports.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reports.loading = false;
        state.reports.data = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.reports.loading = false;
        state.reports.error = action.payload;
      });

    // Enrollments
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.enrollments.loading = true;
        state.enrollments.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.enrollments.loading = false;
        state.enrollments.data = action.payload.results || action.payload || [];
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.enrollments.loading = false;
        state.enrollments.error = action.payload;
      })
      .addCase(createEnrollment.pending, (state) => {
        // Don't change loading state here to avoid interfering with list loading
        // Clear previous enrollment errors
        state.enrollments.error = null;
      })
      .addCase(createEnrollment.fulfilled, (state, action) => {
        // Add the new enrollment to the beginning of the list
        if (action.payload && state.enrollments.data) {
          state.enrollments.data.unshift(action.payload);
        }
      })
      .addCase(createEnrollment.rejected, (state, action) => {
        // Store only safe error message for the modal to display
        // This prevents crashes from complex error objects
        if (typeof action.payload === "string") {
          state.enrollments.error = action.payload;
        } else if (action.payload?.message) {
          state.enrollments.error = action.payload.message;
        } else if (action.payload?.error) {
          state.enrollments.error = action.payload.error;
        } else {
          state.enrollments.error = "Failed to create enrollment";
        }
      });

    // Sessions
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.sessions.loading = true;
        state.sessions.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessions.loading = false;
        const sessionsData = action.payload.results || action.payload || [];
        // Map backend field names to frontend field names
        const mappedSessions = sessionsData.map((session) => ({
          ...session,
          course_id: session.course,
          course: {
            title: session.course_title || "Unknown Course",
            id: session.course,
          }, // Create course object for UI
          start_time: session.scheduled_at,
          end_time: session.ends_at || null, // Backend might not return ends_at
        }));
        state.sessions.data = mappedSessions;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        // Add the new session to the beginning of the list with field mapping
        if (action.payload && state.sessions.data) {
          const mappedSession = {
            ...action.payload,
            course_id: action.payload.course,
            course: {
              title: action.payload.course_title || "Unknown Course",
              id: action.payload.course,
            }, // Create course object for UI
            start_time: action.payload.scheduled_at,
            end_time: action.payload.ends_at || null, // Backend might not return ends_at
          };
          state.sessions.data.unshift(mappedSession);
        }
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        const { sessionId } = action.payload;
        const sessionIndex = state.sessions.data.findIndex(
          (session) => session.id === sessionId,
        );

        if (sessionIndex !== -1) {
          const mappedSession = {
            ...action.payload,
            course_id: action.payload.course,
            course: {
              title: action.payload.course_title || "Unknown Course",
              id: action.payload.course,
            }, // Create course object for UI
            start_time: action.payload.scheduled_at,
            end_time: action.payload.ends_at || null, // Backend might not return ends_at
          };
          state.sessions.data[sessionIndex] = {
            ...state.sessions.data[sessionIndex],
            ...mappedSession,
          };
        }
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions.data = state.sessions.data.filter(
          (session) => session.id !== action.payload,
        );
      });

    // Available Students
    builder
      .addCase(fetchAvailableStudents.pending, (state) => {
        state.availableStudents.loading = true;
        state.availableStudents.error = null;
      })
      .addCase(fetchAvailableStudents.fulfilled, (state, action) => {
        state.availableStudents.loading = false;
        state.availableStudents.data = action.payload;
      })
      .addCase(fetchAvailableStudents.rejected, (state, action) => {
        state.availableStudents.loading = false;
        state.availableStudents.error = action.payload;
      });
  },
});

// Actions
export const {
  clearUsersError,
  clearCoursesError,
  clearAnalyticsError,
  clearSettingsError,
  clearSystemStatusError,
  clearReportsError,
  clearEnrollmentsError,
  clearSessionsError,
  clearAvailableStudentsError,
  clearAllErrors,
  resetUsers,
  resetCourses,
  resetAnalytics,
} = adminSlice.actions;

// Selectors
export const selectUsers = (state) => state.admin.users;
export const selectCourses = (state) => state.admin.courses;
export const selectAnalytics = (state) => state.admin.analytics;
export const selectSettings = (state) => state.admin.settings;
export const selectSystemStatus = (state) => state.admin.systemStatus;
export const selectReports = (state) => state.admin.reports;
export const selectEnrollments = (state) => state.admin.enrollments;
export const selectSessions = (state) => state.admin.sessions;
export const selectAvailableStudents = (state) => state.admin.availableStudents;

// Convenience selectors
export const selectUsersLoading = (state) => state.admin.users.loading;
export const selectCoursesLoading = (state) => state.admin.courses.loading;
export const selectAnalyticsLoading = (state) => state.admin.analytics.loading;
export const selectSettingsLoading = (state) => state.admin.settings.loading;
export const selectSystemStatusLoading = (state) =>
  state.admin.systemStatus.loading;
export const selectReportsLoading = (state) => state.admin.reports.loading;
export const selectEnrollmentsLoading = (state) =>
  state.admin.enrollments.loading;
export const selectSessionsLoading = (state) => state.admin.sessions.loading;
export const selectAvailableStudentsLoading = (state) =>
  state.admin.availableStudents.loading;

export default adminSlice.reducer;
