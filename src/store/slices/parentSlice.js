import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { parentService } from "../../services/parentService";

// Initial state
const initialState = {
  dashboard: {
    data: null,
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

// Slice
const parentSlice = createSlice({
  name: "parent",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.dashboard.error = null;
    },
    clearAllErrors: (state) => {
      state.dashboard.error = null;
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
      });
  },
});

// Actions
export const { clearDashboardError, clearAllErrors, resetDashboard } =
  parentSlice.actions;

// Selectors
export const selectParentDashboard = (state) => state.parent.dashboard;
export const selectParentDashboardLoading = (state) => state.parent.dashboard.loading;
export const selectParentDashboardError = (state) => state.parent.dashboard.error;

export default parentSlice.reducer;
