import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { parentService } from "../../services/parentService";
import { authService } from "../../services/authService";

// Initial state
const initialState = {
  dashboard: {
    data: null,
    loading: false,
    error: null,
  },
  linkChild: {
    loading: false,
    error: null,
  },
  childGrades: {
    // Key: childId, Value: grades data
    data: {},
    loading: {},
    error: {},
  },
  childAttendance: {
    // Key: childId, Value: attendance data
    data: {},
    loading: {},
    error: {},
  },
};

// Async thunks
export const fetchParentDashboard = createAsyncThunk(
  "parent/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await parentService.getDashboard();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const linkChildren = createAsyncThunk(
  "parent/linkChildren",
  async (studentIds, { rejectWithValue }) => {
    try {
      const response = await authService.linkChild(studentIds);
      return response;
    } catch (error) {
      console.error("Failed to link children:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to link children",
      );
    }
  },
);

export const fetchChildGrades = createAsyncThunk(
  "parent/fetchChildGrades",
  async (childId, { rejectWithValue }) => {
    try {
      const response = await parentService.getChildGrades(childId);
      return { childId, data: response };
    } catch (error) {
      return rejectWithValue({ childId, error });
    }
  },
);

export const fetchChildAttendance = createAsyncThunk(
  "parent/fetchChildAttendance",
  async (childId, { rejectWithValue }) => {
    try {
      const response = await parentService.getChildAttendance(childId);
      return { childId, data: response };
    } catch (error) {
      return rejectWithValue({ childId, error });
    }
  },
);

// Slice
const parentSlice = createSlice({
  name: "parent",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.dashboard.error = null;
    },
    clearLinkChildError: (state) => {
      state.linkChild.error = null;
    },
    clearAllErrors: (state) => {
      state.dashboard.error = null;
      state.linkChild.error = null;
    },
    resetDashboard: (state) => {
      state.dashboard = initialState.dashboard;
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchParentDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchParentDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload;
      })
      .addCase(fetchParentDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload;
      })
      // Link Children
      .addCase(linkChildren.pending, (state) => {
        state.linkChild.loading = true;
        state.linkChild.error = null;
      })
      .addCase(linkChildren.fulfilled, (state) => {
        state.linkChild.loading = false;
        state.linkChild.error = null;
      })
      .addCase(linkChildren.rejected, (state, action) => {
        state.linkChild.loading = false;
        state.linkChild.error = action.payload;
      })
      // Child Grades
      .addCase(fetchChildGrades.pending, (state, action) => {
        const childId = action.meta.arg;
        state.childGrades.loading[childId] = true;
        state.childGrades.error[childId] = null;
      })
      .addCase(fetchChildGrades.fulfilled, (state, action) => {
        const { childId, data } = action.payload;
        state.childGrades.loading[childId] = false;
        state.childGrades.data[childId] = data;
      })
      .addCase(fetchChildGrades.rejected, (state, action) => {
        const { childId, error } = action.payload;
        state.childGrades.loading[childId] = false;
        state.childGrades.error[childId] = error;
      })
      // Child Attendance
      .addCase(fetchChildAttendance.pending, (state, action) => {
        const childId = action.meta.arg;
        state.childAttendance.loading[childId] = true;
        state.childAttendance.error[childId] = null;
      })
      .addCase(fetchChildAttendance.fulfilled, (state, action) => {
        const { childId, data } = action.payload;
        state.childAttendance.loading[childId] = false;
        state.childAttendance.data[childId] = data;
      })
      .addCase(fetchChildAttendance.rejected, (state, action) => {
        const { childId, error } = action.payload;
        state.childAttendance.loading[childId] = false;
        state.childAttendance.error[childId] = error;
      });
  },
});

// Actions
export const {
  clearDashboardError,
  clearLinkChildError,
  clearAllErrors,
  resetDashboard,
} = parentSlice.actions;

// Selectors
export const selectParentDashboard = (state) => state.parent.dashboard;
export const selectParentDashboardLoading = (state) =>
  state.parent.dashboard.loading;
export const selectParentDashboardError = (state) =>
  state.parent.dashboard.error;
export const selectLinkChild = (state) => state.parent.linkChild;
export const selectLinkChildLoading = (state) => state.parent.linkChild.loading;
export const selectLinkChildError = (state) => state.parent.linkChild.error;

// Child grades selectors
export const selectChildGrades = (state) => state.parent.childGrades.data;
export const selectChildGradesLoading = (childId) => (state) =>
  state.parent.childGrades.loading[childId] || false;
export const selectChildGradesError = (childId) => (state) =>
  state.parent.childGrades.error[childId];

// Child attendance selectors
export const selectChildAttendance = (state) =>
  state.parent.childAttendance.data;
export const selectChildAttendanceLoading = (childId) => (state) =>
  state.parent.childAttendance.loading[childId] || false;
export const selectChildAttendanceError = (childId) => (state) =>
  state.parent.childAttendance.error[childId];

export default parentSlice.reducer;
