import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

// Async thunks
export const fetchPendingApprovals = createAsyncThunk(
  "approvals/fetchPendingApprovals",
  async (_, { rejectWithValue }) => {
    try {
      const approvals = await authService.getPendingApprovals();
      return approvals;
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to load pending approvals"
      );
    }
  }
);

export const approveUser = createAsyncThunk(
  "approvals/approveUser",
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const result = await authService.approveUser(userId);
      // Refresh the approvals list after successful approval
      dispatch(fetchPendingApprovals());
      return { userId, result };
    } catch (error) {
      console.error("Failed to approve user:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to approve user"
      );
    }
  }
);

export const rejectUser = createAsyncThunk(
  "approvals/rejectUser",
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const result = await authService.rejectUser(userId);
      // Refresh the approvals list after successful rejection
      dispatch(fetchPendingApprovals());
      return { userId, result };
    } catch (error) {
      console.error("Failed to reject user:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to reject user"
      );
    }
  }
);

const initialState = {
  pendingApprovals: [],
  isLoading: false,
  isProcessing: {}, // Track individual user processing state
  error: null,
};

const approvalsSlice = createSlice({
  name: "approvals",
  initialState,
  reducers: {
    clearApprovalsError: (state) => {
      state.error = null;
    },
    clearProcessingState: (state, action) => {
      const userId = action.payload;
      if (state.isProcessing[userId]) {
        delete state.isProcessing[userId];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pending Approvals
      .addCase(fetchPendingApprovals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingApprovals = action.payload;
        state.error = null;
      })
      .addCase(fetchPendingApprovals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Approve User
      .addCase(approveUser.pending, (state, action) => {
        const userId = action.meta.arg;
        state.isProcessing[userId] = 'approving';
        state.error = null;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        delete state.isProcessing[userId];
        state.error = null;
      })
      .addCase(approveUser.rejected, (state, action) => {
        const userId = action.meta.arg;
        delete state.isProcessing[userId];
        state.error = action.payload;
      })
      // Reject User
      .addCase(rejectUser.pending, (state, action) => {
        const userId = action.meta.arg;
        state.isProcessing[userId] = 'rejecting';
        state.error = null;
      })
      .addCase(rejectUser.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        delete state.isProcessing[userId];
        state.error = null;
      })
      .addCase(rejectUser.rejected, (state, action) => {
        const userId = action.meta.arg;
        delete state.isProcessing[userId];
        state.error = action.payload;
      });
  },
});

export const { clearApprovalsError, clearProcessingState } = approvalsSlice.actions;

// Selectors
export const selectPendingApprovals = (state) => state.approvals.pendingApprovals;
export const selectApprovalsLoading = (state) => state.approvals.isLoading;
export const selectApprovalsError = (state) => state.approvals.error;
export const selectUserProcessingState = (state, userId) => state.approvals.isProcessing[userId];

export default approvalsSlice.reducer;
