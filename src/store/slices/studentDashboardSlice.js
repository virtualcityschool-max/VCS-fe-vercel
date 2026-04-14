import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { studentService } from "../../services/studentService";

// Async thunks
export const fetchStudentDashboard = createAsyncThunk(
  "studentDashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const dashboardData = await studentService.getDashboard();
      return dashboardData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const joinLiveSession = createAsyncThunk(
  "studentDashboard/joinLiveSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await studentService.joinLiveSession(sessionId);
      return { sessionId, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const submitAssignment = createAsyncThunk(
  "studentDashboard/submitAssignment",
  async ({ assignmentId, submissionData }, { rejectWithValue }) => {
    try {
      const response = await studentService.submitAssignment(assignmentId, submissionData);
      return { assignmentId, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const enrollInCourse = createAsyncThunk(
  "studentDashboard/enrollInCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await studentService.enrollInCourse(courseId);
      return { courseId, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Initial state
const initialState = {
  // Dashboard data
  student: null,
  nextSession: null,
  overdueAssignments: null,
  liveSchedule: [],
  enrolledCourses: [],
  assignments: [],

  // UI state
  isLoading: false,
  isJoiningSession: false,
  isSubmittingAssignment: false,
  isEnrollingCourse: false,
  error: null,
  lastFetched: null,

  // Pagination and filtering
  filters: {
    status: "all", // all, overdue, pending, submitted, graded
    course: "all",
  },
};

// Slice
const studentDashboardSlice = createSlice({
  name: "studentDashboard",
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },

    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset dashboard state
    resetDashboard: (state) => {
      state.student = null;
      state.nextSession = null;
      state.overdueAssignments = null;
      state.liveSchedule = [];
      state.enrolledCourses = [];
      state.assignments = [];
      state.error = null;
      state.lastFetched = null;
    },

    // Update specific sections (for optimistic updates)
    updateLiveSessionStatus: (state, action) => {
      const { sessionId, status } = action.payload;
      const session = state.liveSchedule.find(s => s.session_id === sessionId);
      if (session) {
        session.status = status;
      }
    },

    updateAssignmentStatus: (state, action) => {
      const { assignmentId, status } = action.payload;
      const assignment = state.assignments.find(a => a.id === assignmentId);
      if (assignment) {
        assignment.status = status;
      }
    },

    updateCourseProgress: (state, action) => {
      const { courseId, progressPercent, progressLabel } = action.payload;
      const course = state.enrolledCourses.find(c => c.id === courseId);
      if (course) {
        course.progress_percent = progressPercent;
        course.progress_label = progressLabel;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard
      .addCase(fetchStudentDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.student = action.payload.student;
        state.nextSession = action.payload.next_session;
        state.overdueAssignments = action.payload.overdue_assignments;
        state.liveSchedule = action.payload.live_schedule || [];
        state.enrolledCourses = action.payload.enrolled_courses || [];
        state.assignments = action.payload.assignments || [];
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchStudentDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Join Live Session
      .addCase(joinLiveSession.pending, (state) => {
        state.isJoiningSession = true;
        state.error = null;
      })
      .addCase(joinLiveSession.fulfilled, (state, action) => {
        state.isJoiningSession = false;
        state.error = null;
        // Update session status optimistically
        const { sessionId } = action.payload;
        const session = state.liveSchedule.find(s => s.session_id === sessionId);
        if (session) {
          session.status = "joined";
        }
      })
      .addCase(joinLiveSession.rejected, (state, action) => {
        state.isJoiningSession = false;
        state.error = action.payload;
      })

      // Submit Assignment
      .addCase(submitAssignment.pending, (state) => {
        state.isSubmittingAssignment = true;
        state.error = null;
      })
      .addCase(submitAssignment.fulfilled, (state, action) => {
        state.isSubmittingAssignment = false;
        state.error = null;
        // Update assignment status optimistically
        const { assignmentId } = action.payload;
        const assignment = state.assignments.find(a => a.id === assignmentId);
        if (assignment) {
          assignment.status = "submitted";
        }
      })
      .addCase(submitAssignment.rejected, (state, action) => {
        state.isSubmittingAssignment = false;
        state.error = action.payload;
      })

      // Enroll in Course
      .addCase(enrollInCourse.pending, (state) => {
        state.isEnrollingCourse = true;
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.isEnrollingCourse = false;
        state.error = null;
        // Could add course to enrolled list if needed
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.isEnrollingCourse = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectStudentDashboard = (state) => state.studentDashboard;
export const selectStudent = (state) => state.studentDashboard.student;
export const selectNextSession = (state) => state.studentDashboard.nextSession;
export const selectOverdueAssignments = (state) => state.studentDashboard.overdueAssignments;
export const selectLiveSchedule = (state) => state.studentDashboard.liveSchedule;
export const selectEnrolledCourses = (state) => state.studentDashboard.enrolledCourses;
export const selectAssignments = (state) => state.studentDashboard.assignments;
export const selectDashboardLoading = (state) => state.studentDashboard.isLoading;
export const selectDashboardError = (state) => state.studentDashboard.error;

// Filtered selectors
export const selectFilteredAssignments = (state) => {
  const { assignments, filters } = state.studentDashboard;
  if (filters.status === "all") return assignments;
  return assignments.filter(assignment => assignment.status === filters.status);
};

export const selectOverdueAssignmentsCount = (state) => {
  return state.studentDashboard.assignments.filter(a => a.status === "overdue").length;
};

export const selectPendingAssignmentsCount = (state) => {
  return state.studentDashboard.assignments.filter(a => a.status === "pending").length;
};

export const selectUpcomingLiveSessions = (state) => {
  return state.studentDashboard.liveSchedule.filter(session => 
    session.status === "scheduled" && session.can_join
  );
};

export const selectDashboardStats = (state) => {
  const { enrolledCourses, assignments, liveSchedule } = state.studentDashboard;
  return {
    enrolledCoursesCount: enrolledCourses.length,
    overdueAssignmentsCount: assignments.filter(a => a.status === "overdue").length,
    pendingAssignmentsCount: assignments.filter(a => a.status === "pending").length,
    liveSessionsCount: liveSchedule.filter(s => s.status === "scheduled").length,
  };
};

// Actions
export const {
  clearError,
  updateFilters,
  resetDashboard,
  updateLiveSessionStatus,
  updateAssignmentStatus,
  updateCourseProgress,
} = studentDashboardSlice.actions;

export default studentDashboardSlice.reducer;
