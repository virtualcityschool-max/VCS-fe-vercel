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
  async (_, { rejectWithValue }) => {
    try {
      const data = await teacherService.getAssignments();
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
      });
  },
});

export default teacherSlice.reducer;
