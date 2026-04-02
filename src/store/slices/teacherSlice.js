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

const initialState = {
  teachers: [],
  teacherDetails: null,

  dashboard: null,
  myCourses: [],
  assignments: [],

  // keep old fields for TeachersDirectory / TeacherProfile
  loading: false,
  error: null,

  // new granular teacher dashboard fields
  loadingDashboard: false,
  loadingCourses: false,
  loadingAssignments: false,

  errorDashboard: null,
  errorCourses: null,
  errorAssignments: null,
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
      });
  },
});

export default teacherSlice.reducer;
