import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { adminService } from "../../services/adminService";

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
        error.error || error.message || "Failed to load pending approvals",
      );
    }
  },
);

export const fetchRejectedApprovals = createAsyncThunk(
  "approvals/fetchRejectedApprovals",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getRejectedApprovals();
    } catch (error) {
      console.error("Failed to fetch rejected users:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to load rejected users",
      );
    }
  },
);

// Accepts a plain userId, or { userId, approveChildLinks } for guardians whose
// registration named children.
export const approveUser = createAsyncThunk(
  "approvals/approveUser",
  async (arg, { rejectWithValue, dispatch }) => {
    const userId = typeof arg === "object" && arg !== null ? arg.userId : arg;
    const approveChildLinks =
      typeof arg === "object" && arg !== null
        ? arg.approveChildLinks !== false
        : true;
    try {
      const result = await authService.approveUser(userId, approveChildLinks);
      // Refresh both lists - approving may remove the user from either tab
      dispatch(fetchPendingApprovals());
      dispatch(fetchRejectedApprovals());
      return { userId, result };
    } catch (error) {
      console.error("Failed to approve user:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to approve user",
      );
    }
  },
);

export const rejectUser = createAsyncThunk(
  "approvals/rejectUser",
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const result = await authService.rejectUser(userId);
      // Rejecting moves the user from the pending tab to the rejected tab
      dispatch(fetchPendingApprovals());
      dispatch(fetchRejectedApprovals());
      return { userId, result };
    } catch (error) {
      console.error("Failed to reject user:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to reject user",
      );
    }
  },
);

export const fetchPendingEnrollments = createAsyncThunk(
  "approvals/fetchPendingEnrollments",
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getPendingEnrollments();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load pending enrollments");
    }
  },
);

export const actionEnrollment = createAsyncThunk(
  "approvals/actionEnrollment",
  async ({ enrollmentId, action }, { rejectWithValue, dispatch }) => {
    try {
      const result = await adminService.actionEnrollment(enrollmentId, action);
      dispatch(fetchPendingEnrollments());
      return { enrollmentId, result };
    } catch (error) {
      return rejectWithValue(error.message || `Failed to ${action} enrollment`);
    }
  },
);

// approveUser accepts either a userId or { userId, approveChildLinks }
const argUserId = (action) => {
  const arg = action.meta.arg;
  return typeof arg === "object" && arg !== null ? arg.userId : arg;
};

const initialState = {
  pendingApprovals: [],
  isLoading: false,
  isProcessing: {},
  error: null,
  // rejected registrations
  rejectedApprovals: [],
  rejectedLoading: false,
  rejectedError: null,
  // enrollment requests
  pendingEnrollments: [],
  enrollmentsLoading: false,
  enrollmentsProcessing: {},
  enrollmentsError: null,
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
    setApprovalsLoading: (state, action) => {
      state.isLoading = action.payload;
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
      // Fetch Rejected Approvals
      .addCase(fetchRejectedApprovals.pending, (state) => {
        state.rejectedLoading = true;
        state.rejectedError = null;
      })
      .addCase(fetchRejectedApprovals.fulfilled, (state, action) => {
        state.rejectedLoading = false;
        state.rejectedApprovals = action.payload;
      })
      .addCase(fetchRejectedApprovals.rejected, (state, action) => {
        state.rejectedLoading = false;
        state.rejectedError = action.payload;
      })
      // Approve User
      .addCase(approveUser.pending, (state, action) => {
        state.isProcessing[argUserId(action)] = "approving";
        state.error = null;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        delete state.isProcessing[argUserId(action)];
        state.error = null;
      })
      .addCase(approveUser.rejected, (state, action) => {
        delete state.isProcessing[argUserId(action)];
        state.error = action.payload;
      })
      // Reject User
      .addCase(rejectUser.pending, (state, action) => {
        const userId = action.meta.arg;
        state.isProcessing[userId] = "rejecting";
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
      })
      // Fetch Pending Enrollments
      .addCase(fetchPendingEnrollments.pending, (state) => {
        state.enrollmentsLoading = true;
        state.enrollmentsError = null;
      })
      .addCase(fetchPendingEnrollments.fulfilled, (state, action) => {
        state.enrollmentsLoading = false;
        state.pendingEnrollments = action.payload;
      })
      .addCase(fetchPendingEnrollments.rejected, (state, action) => {
        state.enrollmentsLoading = false;
        state.enrollmentsError = action.payload;
      })
      // Action Enrollment (approve/reject)
      .addCase(actionEnrollment.pending, (state, action) => {
        const { enrollmentId } = action.meta.arg;
        state.enrollmentsProcessing[enrollmentId] = action.meta.arg.action;
      })
      .addCase(actionEnrollment.fulfilled, (state, action) => {
        const { enrollmentId } = action.meta.arg;
        delete state.enrollmentsProcessing[enrollmentId];
        state.pendingEnrollments = state.pendingEnrollments.filter(
          (e) => e.id !== enrollmentId,
        );
      })
      .addCase(actionEnrollment.rejected, (state, action) => {
        const { enrollmentId } = action.meta.arg;
        delete state.enrollmentsProcessing[enrollmentId];
        state.enrollmentsError = action.payload;
      });
  },
});

export const {
  clearApprovalsError,
  clearProcessingState,
  setApprovalsLoading,
} = approvalsSlice.actions;

// Selectors
export const selectPendingApprovals = (state) =>
  state.approvals.pendingApprovals;
export const selectRejectedApprovals = (state) =>
  state.approvals.rejectedApprovals;
export const selectRejectedApprovalsLoading = (state) =>
  state.approvals.rejectedLoading;
export const selectRejectedApprovalsError = (state) =>
  state.approvals.rejectedError;
export const selectApprovalsLoading = (state) => state.approvals.isLoading;
export const selectApprovalsError = (state) => state.approvals.error;
export const selectUserProcessingState = (state, userId) =>
  state.approvals.isProcessing[userId];

export const selectPendingEnrollments = (state) => state.approvals.pendingEnrollments;
export const selectEnrollmentsLoading = (state) => state.approvals.enrollmentsLoading;
export const selectEnrollmentsError = (state) => state.approvals.enrollmentsError;
export const selectEnrollmentsProcessing = (state) => state.approvals.enrollmentsProcessing;

export default approvalsSlice.reducer;
