import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { studentService } from "../../services/studentService";
import { logoutUser } from "./authSlice";
import { extractApiErrorMessage } from "../../utils/apiErrorHandler";

// Async thunks
export const fetchStudentDashboard = createAsyncThunk(
  "studentDashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const dashboardData = await studentService.getDashboard();
      return dashboardData;
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
    }
  },
);

// export const joinLiveSession = createAsyncThunk(
//   "studentDashboard/joinLiveSession",
//   async (sessionId, { rejectWithValue }) => {
//     try {
//       const response = await studentService.joinLiveSession(sessionId);
//       return { sessionId, response };
//     } catch (error) {
//       return rejectWithValue(
//         typeof error === "string"
//           ? error
//           : error?.message || "An error occurred",
//       );
//     }
//   },
// );

export const joinLiveSession = createAsyncThunk(
  "studentDashboard/joinLiveSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await studentService.joinLiveSession(sessionId);
      return { sessionId, ...response };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
    }
  },
);

export const startStudentSession = createAsyncThunk(
  "studentDashboard/startSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      return await studentService.startSession(sessionId);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || "Failed to start session",
      );
    }
  },
);

export const endStudentSession = createAsyncThunk(
  "studentDashboard/endSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      return await studentService.endSession(sessionId);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || "Failed to end session",
      );
    }
  },
);

export const submitAssignment = createAsyncThunk(
  "studentDashboard/submitAssignment",
  async ({ assignmentId, submissionData }, { rejectWithValue }) => {
    try {
      const response = await studentService.submitAssignment(
        assignmentId,
        submissionData,
      );
      return { assignmentId, response };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
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
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
    }
  },
);

export const enrollInCourseNormal = createAsyncThunk(
  "studentDashboard/enrollInCourseNormal",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await studentService.enrollInCourseNormal(courseId);
      return { courseId, response };
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error));
    }
  },
);

export const enrollInCoursePrivate = createAsyncThunk(
  "studentDashboard/enrollInCoursePrivate",
  async ({ courseId, teacherId, preferred_slots }, { rejectWithValue }) => {
    try {
      const response = await studentService.enrollInCoursePrivate({
        courseId,
        teacherId,
        preferred_slots,
      });
      return { courseId, response };
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error));
    }
  },
);

export const unenrollFromCourse = createAsyncThunk(
  "studentDashboard/unenrollFromCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await studentService.unenrollFromCourse(courseId);
      return { courseId, response };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
    }
  },
);

export const getCourseProgress = createAsyncThunk(
  "studentDashboard/getCourseProgress",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await studentService.getCourseProgress(courseId);
      return { courseId, response };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
    }
  },
);

export const fetchStudentAssignments = createAsyncThunk(
  "studentDashboard/fetchAssignments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const assignments = await studentService.getAssignments(params);
      return assignments;
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
    }
  },
);

export const fetchStudentGrades = createAsyncThunk(
  "studentDashboard/fetchGrades",
  async (params = {}, { rejectWithValue }) => {
    try {
      const grades = await studentService.getMyGrades(params);
      return grades;
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
    }
  },
);

export const fetchStudentSubmission = createAsyncThunk(
  "studentDashboard/fetchSubmission",
  async (assignmentId, { rejectWithValue }) => {
    try {
      const submission = await studentService.getMySubmission(assignmentId);
      return { assignmentId, submission };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
    }
  },
);

export const fetchStudentSessions = createAsyncThunk(
  "studentDashboard/fetchSessions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const sessions = await studentService.getStudentSessions(params);
      return sessions;
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
    }
  },
);

export const fetchSessionAttendance = createAsyncThunk(
  "studentDashboard/fetchAttendance",
  async (sessionId, { rejectWithValue }) => {
    try {
      const attendance = await studentService.getSessionAttendance(sessionId);
      return { sessionId, attendance };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
    }
  },
);

export const fetchMyAttendance = createAsyncThunk(
  "studentDashboard/fetchMyAttendance",
  async (params = {}, { rejectWithValue }) => {
    try {
      const attendance = await studentService.getMyAttendance(params);
      return attendance;
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
    }
  },
);

export const fetchStudentQuizzes = createAsyncThunk(
  "studentDashboard/fetchStudentQuizzes",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await studentService.getStudentQuizzes(params);
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch quizzes");
    }
  },
);

export const fetchStudentQuizById = createAsyncThunk(
  "studentDashboard/fetchStudentQuizById",
  async (id, { rejectWithValue }) => {
    try {
      return await studentService.getStudentQuizById(id);
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch quiz");
    }
  },
);

export const fetchMyEnrollments = createAsyncThunk(
  "studentDashboard/fetchMyEnrollments",
  async (_, { rejectWithValue }) => {
    try {
      return await studentService.getMyEnrollments();
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load enrollments");
    }
  },
);

export const submitStudentQuiz = createAsyncThunk(
  "studentDashboard/submitStudentQuiz",
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      return await studentService.submitQuiz(quizId, answers);
    } catch (error) {
      return rejectWithValue(error?.response?.data || error?.message || "Failed to submit quiz");
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
  grades: [],
  myAttendance: [],
  isLoading: false,
  error: null,
  enrollingCourseIds: [],
  unenrollingCourseIds: [],
  sessions: [],
  attendance: {},
  isFetchingAttendance: false,
  isFetchingMyAttendance: false,
  lastFetched: null,
  submissions: {},

  // Pagination and filtering
  filters: {
    status: "all", // all, overdue, pending, submitted, graded
    course: "all",
  },

  // My enrollments (active + pending from /courses/my-enrollments/)
  myEnrollments: [],
  myEnrollmentsLoading: false,

  // Quiz state
  quizzes: [],
  isFetchingQuizzes: false,
  currentQuiz: null,
  isFetchingCurrentQuiz: false,
  isSubmittingQuiz: false,
  quizSubmitError: null,

  // Specific error states for isolation
  myAttendanceError: null,
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
      const session = state.liveSchedule.find(
        (s) => s.id === sessionId || s.session_id === sessionId,
      );
      if (session) {
        session.status = status;
      }
    },

    updateAssignmentStatus: (state, action) => {
      const { assignmentId, status } = action.payload;
      const assignment = state.assignments.find((a) => a.id === assignmentId);
      if (assignment) {
        assignment.status = status;
      }
    },

    updateCourseProgress: (state, action) => {
      const { courseId, progressPercent, progressLabel } = action.payload;
      const course = state.enrolledCourses.find((c) => c.id === courseId);
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
      .addCase(joinLiveSession.fulfilled, (state) => {
        state.isJoiningSession = false;
        state.error = null;
      })
      .addCase(joinLiveSession.rejected, (state, action) => {
        state.isJoiningSession = false;
        // Don't set global error, let component handle it via toast
      })

      // Start Student Session
      .addCase(startStudentSession.pending, (state) => {
        state.isJoiningSession = true;
      })
      .addCase(startStudentSession.fulfilled, (state) => {
        state.isJoiningSession = false;
      })
      .addCase(startStudentSession.rejected, (state, action) => {
        state.isJoiningSession = false;
        // Handled via toast in component
      })

      // End Student Session
      .addCase(endStudentSession.pending, (state) => {
        state.isJoiningSession = true;
      })
      .addCase(endStudentSession.fulfilled, (state) => {
        state.isJoiningSession = false;
      })
      .addCase(endStudentSession.rejected, (state, action) => {
        state.isJoiningSession = false;
        // Handled via toast in component
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
        const assignment = state.assignments.find((a) => a.id === assignmentId);
        if (assignment) {
          assignment.status = "submitted";
          assignment.is_submitted = true;
        }
      })
      .addCase(submitAssignment.rejected, (state, action) => {
        state.isSubmittingAssignment = false;
        state.error = action.payload;
      })

      // Enroll in Course
      .addCase(enrollInCourse.pending, (state, action) => {
        const courseId = action.meta.arg;
        state.enrollingCourseIds.push(courseId);
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        const courseId = action.meta.arg;
        state.enrollingCourseIds = state.enrollingCourseIds.filter(
          (id) => id !== courseId,
        );
        state.error = null;
        // Refresh dashboard data to show newly enrolled course
        // This will be handled by the component calling fetchStudentDashboard
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        const courseId = action.meta.arg;
        state.enrollingCourseIds = state.enrollingCourseIds.filter(
          (id) => id !== courseId,
        );
        state.error = action.payload;
      })

      // Enroll in Course Normal
      .addCase(enrollInCourseNormal.pending, (state, action) => {
        const courseId = action.meta.arg;
        state.enrollingCourseIds.push(courseId);
        state.error = null;
      })
      .addCase(enrollInCourseNormal.fulfilled, (state, action) => {
        const courseId = action.meta.arg;
        state.enrollingCourseIds = state.enrollingCourseIds.filter(
          (id) => id !== courseId,
        );
        state.error = null;
        // Refresh dashboard data to show newly enrolled course
        // This will be handled by the component calling fetchStudentDashboard
      })
      .addCase(enrollInCourseNormal.rejected, (state, action) => {
        const courseId = action.meta.arg;
        state.enrollingCourseIds = state.enrollingCourseIds.filter(
          (id) => id !== courseId,
        );
        state.error = action.payload;
      })

      // Enroll in Course Private
      .addCase(enrollInCoursePrivate.pending, (state, action) => {
        const courseId = action.meta.arg.courseId;
        state.enrollingCourseIds.push(courseId);
        state.error = null;
      })
      .addCase(enrollInCoursePrivate.fulfilled, (state, action) => {
        const courseId = action.meta.arg.courseId;
        state.enrollingCourseIds = state.enrollingCourseIds.filter(
          (id) => id !== courseId,
        );
        state.error = null;
        // Refresh dashboard data to show newly enrolled course
        // This will be handled by the component calling fetchStudentDashboard
      })
      .addCase(enrollInCoursePrivate.rejected, (state, action) => {
        const courseId = action.meta.arg.courseId;
        state.enrollingCourseIds = state.enrollingCourseIds.filter(
          (id) => id !== courseId,
        );
        state.error = action.payload;
      })

      // Unenroll from Course
      .addCase(unenrollFromCourse.pending, (state, action) => {
        const courseId = action.meta.arg;
        state.unenrollingCourseIds.push(courseId);
        state.error = null;
      })
      .addCase(unenrollFromCourse.fulfilled, (state, action) => {
        const courseId = action.meta.arg;
        state.unenrollingCourseIds = state.unenrollingCourseIds.filter(
          (id) => id !== courseId,
        );
        state.error = null;
      })
      .addCase(unenrollFromCourse.rejected, (state, action) => {
        const courseId = action.meta.arg;
        state.unenrollingCourseIds = state.unenrollingCourseIds.filter(
          (id) => id !== courseId,
        );
        state.error = action.payload;
      })

      // Fetch Student Assignments
      .addCase(fetchStudentAssignments.pending, (state) => {
        state.isFetchingAssignments = true;
        state.error = null;
      })
      .addCase(fetchStudentAssignments.fulfilled, (state, action) => {
        state.isFetchingAssignments = false;
        state.error = null;
        state.assignments = action.payload.results || action.payload;
      })
      .addCase(fetchStudentAssignments.rejected, (state, action) => {
        state.isFetchingAssignments = false;
        state.error = action.payload;
      })

      // Fetch Student Grades
      .addCase(fetchStudentGrades.pending, (state) => {
        state.isFetchingGrades = true;
        state.error = null;
      })
      .addCase(fetchStudentGrades.fulfilled, (state, action) => {
        state.isFetchingGrades = false;
        state.error = null;
        state.grades = action.payload.results || action.payload;
      })
      .addCase(fetchStudentGrades.rejected, (state, action) => {
        state.isFetchingGrades = false;
        state.error = action.payload;
      })

      // Fetch Student Submission
      .addCase(fetchStudentSubmission.pending, (state) => {
        state.isFetchingSubmissions = true;
        state.error = null;
      })
      .addCase(fetchStudentSubmission.fulfilled, (state, action) => {
        state.isFetchingSubmissions = false;
        state.error = null;
        const { assignmentId, submission } = action.payload;
        state.submissions[assignmentId] = submission;
      })
      .addCase(fetchStudentSubmission.rejected, (state, action) => {
        state.isFetchingSubmissions = false;
        state.error = action.payload;
      })

      // Fetch Student Sessions
      .addCase(fetchStudentSessions.pending, (state) => {
        state.isFetchingSessions = true;
        state.error = null;
      })
      .addCase(fetchStudentSessions.fulfilled, (state, action) => {
        state.isFetchingSessions = false;
        state.error = null;
        state.sessions = action.payload.results || action.payload;
      })
      .addCase(fetchStudentSessions.rejected, (state, action) => {
        state.isFetchingSessions = false;
        state.error = action.payload;
      })

      // Fetch Session Attendance
      .addCase(fetchSessionAttendance.pending, (state) => {
        state.isFetchingAttendance = true;
        state.error = null;
      })
      .addCase(fetchSessionAttendance.fulfilled, (state, action) => {
        state.isFetchingAttendance = false;
        state.error = null;
        const { sessionId, attendance } = action.payload;
        state.attendance[sessionId] = attendance;
      })
      .addCase(fetchSessionAttendance.rejected, (state, action) => {
        state.isFetchingAttendance = false;
        state.error = action.payload;
      })

      // Fetch My Attendance
      .addCase(fetchMyAttendance.pending, (state) => {
        state.isFetchingMyAttendance = true;
        state.myAttendanceError = null;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.isFetchingMyAttendance = false;
        state.myAttendanceError = null;
        state.myAttendance = action.payload.results || action.payload;
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.isFetchingMyAttendance = false;
        state.myAttendanceError = action.payload;
      })

      // QUIZZES
      .addCase(fetchStudentQuizzes.pending, (state) => {
        state.isFetchingQuizzes = true;
      })
      .addCase(fetchStudentQuizzes.fulfilled, (state, action) => {
        state.isFetchingQuizzes = false;
        state.quizzes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStudentQuizzes.rejected, (state) => {
        state.isFetchingQuizzes = false;
      })
      .addCase(fetchStudentQuizById.pending, (state) => {
        state.isFetchingCurrentQuiz = true;
        state.currentQuiz = null;
      })
      .addCase(fetchStudentQuizById.fulfilled, (state, action) => {
        state.isFetchingCurrentQuiz = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchStudentQuizById.rejected, (state) => {
        state.isFetchingCurrentQuiz = false;
      })
      .addCase(submitStudentQuiz.pending, (state) => {
        state.isSubmittingQuiz = true;
        state.quizSubmitError = null;
      })
      .addCase(submitStudentQuiz.fulfilled, (state, action) => {
        state.isSubmittingQuiz = false;
        if (state.currentQuiz) {
          state.currentQuiz = {
            ...state.currentQuiz,
            my_submission: action.payload,
          };
        }
      })
      .addCase(submitStudentQuiz.rejected, (state, action) => {
        state.isSubmittingQuiz = false;
        state.quizSubmitError = action.payload;
      })

      // Fetch My Enrollments
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.myEnrollmentsLoading = true;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.myEnrollmentsLoading = false;
        state.myEnrollments = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyEnrollments.rejected, (state) => {
        state.myEnrollmentsLoading = false;
      })

      // Handle logout - clear all student-specific data
      .addCase(logoutUser.fulfilled, (state) => {
        state.student = null;
        state.nextSession = null;
        state.overdueAssignments = null;
        state.liveSchedule = [];
        state.enrolledCourses = [];
        state.assignments = [];
        state.sessions = [];
        state.grades = [];
        state.myAttendance = [];
        state.submissions = {};
        state.attendance = {};
        state.lastFetched = null;
        state.error = null;
        state.isLoading = false;
        state.isJoiningSession = false;
        state.isSubmittingAssignment = false;
        state.isFetchingAssignments = false;
        state.isFetchingGrades = false;
        state.isFetchingSubmissions = false;
        state.isFetchingSessions = false;
        state.isFetchingAttendance = false;
        state.isFetchingMyAttendance = false;
        state.enrollingCourseIds = [];
        state.unenrollingCourseIds = [];
        state.myEnrollments = [];
        state.myEnrollmentsLoading = false;
      });
  },
});

// Selectors
export const selectStudentDashboard = (state) => state.studentDashboard;
export const selectStudent = (state) => state.studentDashboard.student;
export const selectNextSession = (state) => state.studentDashboard.nextSession;
export const selectOverdueAssignments = (state) =>
  state.studentDashboard.overdueAssignments;
export const selectLiveSchedule = (state) =>
  state.studentDashboard.liveSchedule;
export const selectEnrolledCourses = (state) =>
  state.studentDashboard.enrolledCourses;
export const selectAssignments = (state) => state.studentDashboard.assignments;
export const selectGrades = (state) => state.studentDashboard.grades;
export const selectSubmissions = (state) => state.studentDashboard.submissions;
export const selectSessions = (state) => state.studentDashboard.sessions;
export const selectAttendance = (state) => state.studentDashboard.attendance;
export const selectDashboardLoading = (state) =>
  state.studentDashboard.isLoading;
export const selectDashboardError = (state) => state.studentDashboard.error;

// Loading selectors
export const selectAssignmentsLoading = (state) =>
  state.studentDashboard.isFetchingAssignments;
export const selectGradesLoading = (state) =>
  state.studentDashboard.isFetchingGrades;
export const selectSubmissionsLoading = (state) =>
  state.studentDashboard.isFetchingSubmissions;
export const selectSessionsLoading = (state) =>
  state.studentDashboard.isFetchingSessions;
export const selectAttendanceLoading = (state) =>
  state.studentDashboard.isFetchingAttendance;
export const selectMyAttendance = (state) =>
  state.studentDashboard.myAttendance;
export const selectMyAttendanceLoading = (state) => state.studentDashboard.isFetchingMyAttendance;
export const selectMyAttendanceError = (state) => state.studentDashboard.myAttendanceError;
export const selectMyEnrollments = (state) => state.studentDashboard.myEnrollments;
export const selectMyEnrollmentsLoading = (state) => state.studentDashboard.myEnrollmentsLoading;
export const selectPendingEnrollments = (state) =>
  (state.studentDashboard.myEnrollments || []).filter((e) => e.status === "pending");

// Filtered selectors
export const selectFilteredAssignments = createSelector(
  [
    (state) => state.studentDashboard.assignments,
    (state) => state.studentDashboard.filters,
  ],
  (assignments, filters) => {
    if (filters?.status === "all") return assignments || [];
    return (assignments || []).filter(
      (assignment) => assignment.status === filters?.status,
    );
  },
);

export const selectOverdueAssignmentsCount = (state) => {
  return state.studentDashboard.assignments.filter(
    (a) => a.status === "overdue",
  ).length;
};

export const selectPendingAssignmentsCount = (state) => {
  return state.studentDashboard.assignments.filter(
    (a) => a.status === "pending",
  ).length;
};

export const selectUpcomingLiveSessions = createSelector(
  [(state) => state.studentDashboard.liveSchedule],
  (liveSchedule) => {
    return (liveSchedule || []).filter(
      (session) => session.status === "scheduled" && session.can_join,
    );
  },
);

export const selectDashboardStats = createSelector(
  [
    (state) => state.studentDashboard.enrolledCourses,
    (state) => state.studentDashboard.assignments,
    (state) => state.studentDashboard.liveSchedule,
  ],
  (enrolledCourses, assignments, liveSchedule) => {
    return {
      enrolledCoursesCount: enrolledCourses?.length || 0,
      overdueAssignmentsCount:
        assignments?.filter((a) => a.status === "overdue").length || 0,
      pendingAssignmentsCount:
        assignments?.filter((a) => a.status === "pending").length || 0,
      liveSessionsCount:
        liveSchedule?.filter((s) => s.status === "scheduled").length || 0,
    };
  },
);

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
