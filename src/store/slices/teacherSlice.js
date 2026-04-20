import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { teacherService } from "../../services/teacherService";

export const fetchTeachers = createAsyncThunk(
  "teachers/fetchTeachers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await teacherService.getTeachers(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch teachers",
      );
    }
  },
);

export const fetchTeacherById = createAsyncThunk(
  "teachers/fetchTeacherById",
  async (id, { rejectWithValue }) => {
    // Validate input
    if (!id || typeof id !== "string" || id.trim() === "") {
      return rejectWithValue("Valid teacher ID is required");
    }

    try {
      const data = await teacherService.getTeacherById(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch teacher",
      );
    }
  },
);

export const fetchTeacherDashboard = createAsyncThunk(
  "teachers/fetchTeacherDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const data = await teacherService.getTeacherDashboard();
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch dashboard",
      );
    }
  },
);

export const fetchMyCourses = createAsyncThunk(
  "teachers/fetchMyCourses",
  async (_, { rejectWithValue }) => {
    try {
      const data = await teacherService.getMyCourses();
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch courses",
      );
    }
  },
);

export const fetchAssignments = createAsyncThunk(
  "teachers/fetchAssignments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await teacherService.getAssignments(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch assignments",
      );
    }
  },
);

export const createAssignment = createAsyncThunk(
  "teachers/createAssignment",
  async (payload, { rejectWithValue }) => {
    try {
      return await teacherService.createAssignment(payload);
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to create");
    }
  },
);

export const fetchSubmissions = createAsyncThunk(
  "teachers/fetchSubmissions",
  async (assignmentId, { rejectWithValue }) => {
    try {
      const data = await teacherService.getSubmissions(assignmentId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "Failed to fetch submissions",
      );
    }
  },
);

export const gradeSubmission = createAsyncThunk(
  "teachers/gradeSubmission",
  async ({ submissionId, data }, { rejectWithValue }) => {
    try {
      const result = await teacherService.gradeSubmission(submissionId, data);
      return { submissionId, grade: result };
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to grade");
    }
  },
);

export const updateSubmissionsGrade = createAsyncThunk(
  "teachers/updateSubmissionsGrade",
  async ({ submissionId, data }, { rejectWithValue }) => {
    try {
      const result = await teacherService.updateSubmissionGrade(
        submissionId,
        data,
      );
      return { submissionId, grade: result };
    } catch (err) {
      return rejectWithValue(
        err?.message || "Failed to update submissions grade",
      );
    }
  },
);

export const fetchSubmissionById = createAsyncThunk(
  "teachers/fetchSubmissionById",
  async (submissionId, { rejectWithValue }) => {
    try {
      const data = await teacherService.getSubmissionById(submissionId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch submission details",
      );
    }
  },
);

export const fetchTeacherSessions = createAsyncThunk(
  "teachers/fetchTeacherSessions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await teacherService.getTeacherSessions();
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch sessions",
      );
    }
  },
);

export const fetchSessionAttendance = createAsyncThunk(
  "teachers/fetchSessionAttendance",
  async (sessionId, { rejectWithValue }) => {
    try {
      const data = await teacherService.getSessionAttendance(sessionId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch attendance",
      );
    }
  },
);

export const updateSessionAttendance = createAsyncThunk(
  "teachers/updateSessionAttendance",
  async ({ sessionId, attendanceId, data }, { rejectWithValue }) => {
    try {
      const result = await teacherService.updateSessionAttendance(
        sessionId,
        attendanceId,
        data,
      );
      return { attendanceId, data: result };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to update attendance",
      );
    }
  },
);

export const joinLiveSession = createAsyncThunk(
  "teachers/joinLiveSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const result = await teacherService.joinLiveSession(sessionId);
      return result;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to join live session",
      );
    }
  },
);

export const startLiveSession = createAsyncThunk(
  "teachers/startLiveSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      return await teacherService.startSession(sessionId);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to start session",
      );
    }
  },
);

export const endLiveSession = createAsyncThunk(
  "teachers/endLiveSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      return await teacherService.endSession(sessionId);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to end session",
      );
    }
  },
);

const initialState = {
  teachers: [],
  teacherDetails: null,

  dashboard: null,
  myCourses: [],
  assignments: [],
  createdAssignment: null,

  // keep old fields for TeachersDirectory / TeacherProfile
  loading: false,
  error: null,

  // new granular teacher dashboard fields
  loadingDashboard: false,
  loadingCourses: false,
  loadingAssignments: false,
  loadingCreateAssignment: false,

  errorDashboard: null,
  errorCourses: null,
  errorAssignments: null,
  errorCreateAssignment: null,

  submissions: [],
  loadingSubmissions: false,
  errorSubmissions: null,
  gradingLoading: false,
  gradingError: null,

  selectedSubmission: null,
  loadingSelectedSubmission: false,
  errorSelectedSubmission: null,

  // attendance state
  sessions: [],
  loadingSessions: false,
  errorSessions: null,
  attendanceRecords: [],
  loadingAttendance: false,
  errorAttendance: null,
  updatingAttendanceId: null,
  updatingAttendanceError: null,

  // session joining state
  isJoiningSession: false,
  joiningSessionError: null,
};

const teacherSlice = createSlice({
  name: "teachers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load teachers";
      })
      .addCase(fetchTeacherById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherById.fulfilled, (state, action) => {
        state.loading = false;
        state.teacherDetails = action.payload;
      })
      .addCase(fetchTeacherById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load teacher";
      })

      // DASHBOARD
      .addCase(fetchTeacherDashboard.pending, (state) => {
        state.loadingDashboard = true;
        state.errorDashboard = null;
      })
      .addCase(fetchTeacherDashboard.fulfilled, (state, action) => {
        state.loadingDashboard = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchTeacherDashboard.rejected, (state, action) => {
        state.loadingDashboard = false;
        state.errorDashboard = action.payload;
      })

      // MY COURSES
      .addCase(fetchMyCourses.pending, (state) => {
        state.loadingCourses = true;
        state.errorCourses = null;
      })
      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        state.loadingCourses = false;
        state.myCourses = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyCourses.rejected, (state, action) => {
        state.loadingCourses = false;
        state.errorCourses = action.payload;
      })

      // ASSIGNMENTS
      .addCase(fetchAssignments.pending, (state) => {
        state.loadingAssignments = true;
        state.errorAssignments = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loadingAssignments = false;
        state.assignments = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loadingAssignments = false;
        state.errorAssignments = action.payload;
      })

      // CREATE ASSIGNMENT
      .addCase(createAssignment.pending, (state) => {
        state.loadingCreateAssignment = true;
        state.errorCreateAssignment = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loadingCreateAssignment = false;
        state.assignments.push(action.payload); // replace with unshift instead of shift in case backend doesn't show latest assignment at top
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loadingCreateAssignment = false;
        state.errorCreateAssignment = action.payload;
      })

      // SUBMISSIONS
      .addCase(fetchSubmissions.pending, (state) => {
        state.loadingSubmissions = true;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loadingSubmissions = false;
        state.submissions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loadingSubmissions = false;
        state.errorSubmissions = action.payload;
      })
      .addCase(fetchSubmissionById.pending, (state) => {
        state.loadingSelectedSubmission = true;
        state.errorSelectedSubmission = null;
      })
      .addCase(fetchSubmissionById.fulfilled, (state, action) => {
        state.loadingSelectedSubmission = false;
        state.selectedSubmission = action.payload;
      })
      .addCase(fetchSubmissionById.rejected, (state, action) => {
        state.loadingSelectedSubmission = false;
        state.errorSelectedSubmission = action.payload;
      })
      .addCase(gradeSubmission.pending, (state) => {
        state.gradingLoading = true;
        state.gradingError = null;
      })
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        state.gradingLoading = false;
        state.submissions = state.submissions.map((submission) =>
          submission.id === action.payload.submissionId
            ? { ...submission, grade: action.payload.grade }
            : submission,
        );
      })
      .addCase(gradeSubmission.rejected, (state, action) => {
        state.gradingLoading = false;
        state.gradingError = action.payload;
      })
      .addCase(updateSubmissionsGrade.pending, (state) => {
        state.gradingLoading = true;
        state.gradingError = null;
      })
      .addCase(updateSubmissionsGrade.fulfilled, (state, action) => {
        state.gradingLoading = false;
        state.submissions = state.submissions.map((submission) =>
          submission.id === action.payload.submissionId
            ? { ...submission, grade: action.payload.grade }
            : submission,
        );
      })
      .addCase(updateSubmissionsGrade.rejected, (state, action) => {
        state.gradingLoading = false;
        state.gradingError = action.payload;
      })

      // TEACHER SESSIONS
      .addCase(fetchTeacherSessions.pending, (state) => {
        state.loadingSessions = true;
        state.errorSessions = null;
      })
      .addCase(fetchTeacherSessions.fulfilled, (state, action) => {
        state.loadingSessions = false;
        state.sessions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTeacherSessions.rejected, (state, action) => {
        state.loadingSessions = false;
        state.errorSessions = action.payload;
      })

      // SESSION ATTENDANCE
      .addCase(fetchSessionAttendance.pending, (state) => {
        state.loadingAttendance = true;
        state.errorAttendance = null;
      })
      .addCase(fetchSessionAttendance.fulfilled, (state, action) => {
        state.loadingAttendance = false;
        state.attendanceRecords = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchSessionAttendance.rejected, (state, action) => {
        state.loadingAttendance = false;
        state.errorAttendance = action.payload;
      })

      // UPDATE ATTENDANCE
      .addCase(updateSessionAttendance.pending, (state, action) => {
        state.updatingAttendanceId = action.meta.arg.attendanceId;
        state.updatingAttendanceError = null;
      })
      .addCase(updateSessionAttendance.fulfilled, (state, action) => {
        state.updatingAttendanceId = null;
        state.attendanceRecords = state.attendanceRecords.map((record) =>
          record.id === action.payload.attendanceId
            ? { ...record, ...action.payload.data }
            : record,
        );
      })
      .addCase(updateSessionAttendance.rejected, (state, action) => {
        state.updatingAttendanceId = null;
        state.updatingAttendanceError = action.payload;
      })

      // JOIN LIVE SESSION
      .addCase(joinLiveSession.pending, (state) => {
        state.isJoiningSession = true;
        state.joiningSessionError = null;
      })
      .addCase(joinLiveSession.fulfilled, (state) => {
        state.isJoiningSession = false;
      })
      .addCase(joinLiveSession.rejected, (state, action) => {
        state.isJoiningSession = false;
        state.joiningSessionError = action.payload;
      })

      // START LIVE SESSION
      .addCase(startLiveSession.pending, (state) => {
        state.isJoiningSession = true;
        state.joiningSessionError = null;
      })
      .addCase(startLiveSession.fulfilled, (state, action) => {
        state.isJoiningSession = false;

        if (state.dashboard?.todays_schedule) {
          const session = state.dashboard.todays_schedule.find(
            (s) => s.id === action.meta.arg,
          );
          if (session) {
            session.status = "live";
          }
        }
      })
      .addCase(startLiveSession.rejected, (state, action) => {
        state.isJoiningSession = false;
        state.joiningSessionError = action.payload;
      })

      // END LIVE SESSION
      .addCase(endLiveSession.pending, (state) => {
        state.isJoiningSession = true;
        state.joiningSessionError = null;
      })
      .addCase(endLiveSession.fulfilled, (state, action) => {
        state.isJoiningSession = false;
        // Update session status to 'ended' in dashboard after successful end
        if (state.dashboard?.todays_schedule) {
          const session = state.dashboard.todays_schedule.find(
            (s) => s.id === action.meta.arg,
          );
          if (session) {
            session.status = "ended";
          }
        }
      })
      .addCase(endLiveSession.rejected, (state, action) => {
        state.isJoiningSession = false;
        state.joiningSessionError = action.payload;
      });
  },
});

export default teacherSlice.reducer;
