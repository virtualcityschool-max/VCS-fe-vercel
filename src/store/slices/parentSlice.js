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

export default parentSlice.reducer;
