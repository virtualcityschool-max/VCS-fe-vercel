import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { teacherService } from "../../services/teacherService";

export const fetchTeachers = createAsyncThunk(
  "teachers/fetchTeachers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await teacherService.getTeachers(params);
      return data;
    } catch (error) {
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
    }
  },
);

export const createAssignment = createAsyncThunk(
  "teachers/createAssignment",
  async (payload, { rejectWithValue }) => {
    try {
      return await teacherService.createAssignment(payload);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const updateAssignment = createAsyncThunk(
  "teachers/updateAssignment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await teacherService.updateAssignment(id, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const deleteAssignment = createAsyncThunk(
  "teachers/deleteAssignment",
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.deleteAssignment(id);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchAllSubmissions = createAsyncThunk(
  "teachers/fetchAllSubmissions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await teacherService.getAllSubmissions(params);
      return data;
    } catch (error) {
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(err);
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
      return rejectWithValue(err);
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
      return rejectWithValue(error);
    }
  },
);

export const fetchQuizzes = createAsyncThunk(
  "teachers/fetchQuizzes",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await teacherService.getQuizzes(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const createQuiz = createAsyncThunk(
  "teachers/createQuiz",
  async (data, { rejectWithValue }) => {
    try {
      return await teacherService.createQuiz(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const updateQuiz = createAsyncThunk(
  "teachers/updateQuiz",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await teacherService.updateQuiz(id, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const deleteQuiz = createAsyncThunk(
  "teachers/deleteQuiz",
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.deleteQuiz(id);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchQuizSubmissions = createAsyncThunk(
  "teachers/fetchQuizSubmissions",
  async (quizId, { rejectWithValue }) => {
    try {
      return await teacherService.getQuizSubmissions(quizId);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchQuizSubmissionById = createAsyncThunk(
  "teachers/fetchQuizSubmissionById",
  async (submissionId, { rejectWithValue }) => {
    try {
      return await teacherService.getQuizSubmissionById(submissionId);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const gradeQuizTextAnswers = createAsyncThunk(
  "teachers/gradeQuizTextAnswers",
  async ({ submissionId, grades }, { rejectWithValue }) => {
    try {
      return await teacherService.gradeQuizSubmission(submissionId, grades);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchTeacherSessions = createAsyncThunk(
  "teachers/fetchTeacherSessions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await teacherService.getTeacherSessions(params);
      return data;
    } catch (error) {
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
    }
  },
);

export const startLiveSession = createAsyncThunk(
  "teachers/startLiveSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      return await teacherService.startSession(sessionId);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchAllAttendance = createAsyncThunk(
  "teachers/fetchAllAttendance",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await teacherService.getAllAttendance(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const bulkMarkAttendance = createAsyncThunk(
  "teachers/bulkMarkAttendance",
  async ({ sessionId, records }, { rejectWithValue }) => {
    try {
      return await teacherService.bulkMarkAttendance(sessionId, records);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateStudentAttendance = createAsyncThunk(
  "teachers/updateStudentAttendance",
  async ({ sessionId, studentId, data }, { rejectWithValue }) => {
    try {
      return await teacherService.updateStudentAttendance(sessionId, studentId, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const endLiveSession = createAsyncThunk(
  "teachers/endLiveSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      return await teacherService.endSession(sessionId);
    } catch (error) {
      return rejectWithValue(error);
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

  allSubmissions: [],
  loadingAllSubmissions: false,
  errorAllSubmissions: null,

  allAttendance: [],
  loadingAllAttendance: false,
  errorAllAttendance: null,
  markingBulkAttendance: false,
  patchingStudentAttendance: false,

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

  // quiz state
  quizzes: [],
  loadingQuizzes: false,
  errorQuizzes: null,
  quizSubmissions: [],
  loadingQuizSubmissions: false,
  selectedQuizSubmission: null,
  loadingSelectedQuizSubmission: false,
  errorSelectedQuizSubmission: null,
};

const teacherSlice = createSlice({
  name: "teachers",
  initialState,
  reducers: {
    clearSelectedSubmission(state) {
      state.selectedSubmission = null;
      state.loadingSelectedSubmission = false;
    },
    clearSelectedQuizSubmission(state) {
      state.selectedQuizSubmission = null;
      state.loadingSelectedQuizSubmission = false;
    },
  },
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
        const raw = Array.isArray(action.payload) ? action.payload : [];
        state.myCourses = raw.map((c) => ({
          ...c,
          category: typeof c.category === "object" && c.category !== null
            ? c.category.name ?? null
            : c.category ?? null,
        }));
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

      // UPDATE ASSIGNMENT
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.map((a) =>
          a.id === action.payload.id ? action.payload : a
        );
      })

      // DELETE ASSIGNMENT
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter((a) => a.id !== action.payload);
      })

      // ALL SUBMISSIONS
      .addCase(fetchAllSubmissions.pending, (state) => {
        state.loadingAllSubmissions = true;
        state.errorAllSubmissions = null;
      })
      .addCase(fetchAllSubmissions.fulfilled, (state, action) => {
        state.loadingAllSubmissions = false;
        state.allSubmissions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllSubmissions.rejected, (state, action) => {
        state.loadingAllSubmissions = false;
        state.errorAllSubmissions = action.payload;
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
      })

      // FETCH ALL ATTENDANCE
      .addCase(fetchAllAttendance.pending, (state) => {
        state.loadingAllAttendance = true;
        state.errorAllAttendance = null;
      })
      .addCase(fetchAllAttendance.fulfilled, (state, action) => {
        state.loadingAllAttendance = false;
        state.allAttendance = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchAllAttendance.rejected, (state, action) => {
        state.loadingAllAttendance = false;
        state.errorAllAttendance = action.payload;
      })

      // BULK MARK ATTENDANCE
      .addCase(bulkMarkAttendance.pending, (state) => {
        state.markingBulkAttendance = true;
      })
      .addCase(bulkMarkAttendance.fulfilled, (state) => {
        state.markingBulkAttendance = false;
      })
      .addCase(bulkMarkAttendance.rejected, (state) => {
        state.markingBulkAttendance = false;
      })

      // UPDATE STUDENT ATTENDANCE (PATCH)
      .addCase(updateStudentAttendance.pending, (state) => {
        state.patchingStudentAttendance = true;
      })
      .addCase(updateStudentAttendance.fulfilled, (state, action) => {
        state.patchingStudentAttendance = false;
        const updated = action.payload;
        if (updated?.id) {
          state.allAttendance = state.allAttendance.map((r) =>
            r.id === updated.id ? { ...r, ...updated } : r
          );
        }
      })
      .addCase(updateStudentAttendance.rejected, (state) => {
        state.patchingStudentAttendance = false;
      })

      // QUIZZES
      .addCase(fetchQuizzes.pending, (state) => {
        state.loadingQuizzes = true;
        state.errorQuizzes = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loadingQuizzes = false;
        state.quizzes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loadingQuizzes = false;
        state.errorQuizzes = action.payload;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.quizzes.unshift(action.payload);
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.map((q) =>
          q.id === action.payload.id ? action.payload : q
        );
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter((q) => q.id !== action.payload);
      })
      .addCase(fetchQuizSubmissions.pending, (state) => {
        state.loadingQuizSubmissions = true;
      })
      .addCase(fetchQuizSubmissions.fulfilled, (state, action) => {
        state.loadingQuizSubmissions = false;
        state.quizSubmissions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchQuizSubmissions.rejected, (state) => {
        state.loadingQuizSubmissions = false;
      })
      .addCase(fetchQuizSubmissionById.pending, (state) => {
        state.loadingSelectedQuizSubmission = true;
        state.errorSelectedQuizSubmission = null;
      })
      .addCase(fetchQuizSubmissionById.fulfilled, (state, action) => {
        state.loadingSelectedQuizSubmission = false;
        state.selectedQuizSubmission = action.payload;
      })
      .addCase(fetchQuizSubmissionById.rejected, (state, action) => {
        state.loadingSelectedQuizSubmission = false;
        state.errorSelectedQuizSubmission = action.payload;
      })
      .addCase(gradeQuizTextAnswers.fulfilled, (state, action) => {
        state.selectedQuizSubmission = action.payload;
        if (action.payload?.id) {
          state.quizSubmissions = state.quizSubmissions.map((s) =>
            s.id === action.payload.id ? { ...s, status: action.payload.status, obtained_marks: action.payload.obtained_marks } : s
          );
        }
      });
  },
});

export const { clearSelectedSubmission, clearSelectedQuizSubmission } = teacherSlice.actions;
export default teacherSlice.reducer;
