import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminService } from "../../services/adminService";

// Async thunks
export const fetchPendingChildLinks = createAsyncThunk(
  "childLinks/fetchPendingChildLinks",
  async (_, { rejectWithValue }) => {
    try {
      const childLinks = await adminService.getPendingChildLinks();
      return childLinks;
    } catch (error) {
      console.error("Failed to fetch pending child links:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to load pending child link requests",
      );
    }
  },
);

export const approveChildLink = createAsyncThunk(
  "childLinks/approveChildLink",
  async (linkId, { rejectWithValue, dispatch }) => {
    try {
      const result = await adminService.approveChildLink(linkId);
      // Refresh the child links list after successful approval
      dispatch(fetchPendingChildLinks());
      return { linkId, result };
    } catch (error) {
      console.error("Failed to approve child link:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to approve child link request",
      );
    }
  },
);

export const rejectChildLink = createAsyncThunk(
  "childLinks/rejectChildLink",
  async (linkId, { rejectWithValue, dispatch }) => {
    try {
      const result = await adminService.rejectChildLink(linkId);
      // Refresh the child links list after successful rejection
      dispatch(fetchPendingChildLinks());
      return { linkId, result };
    } catch (error) {
      console.error("Failed to reject child link:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to reject child link request",
      );
    }
  },
);

const initialState = {
  pendingChildLinks: [],
  isLoading: false,
  isProcessing: {}, // Track individual link processing state
  error: null,
};

const childLinksSlice = createSlice({
  name: "childLinks",
  initialState,
  reducers: {
    clearChildLinksError: (state) => {
      state.error = null;
    },
    clearProcessingState: (state, action) => {
      const linkId = action.payload;
      if (state.isProcessing[linkId]) {
        delete state.isProcessing[linkId];
      }
    },
    setChildLinksLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pending Child Links
      .addCase(fetchPendingChildLinks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingChildLinks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingChildLinks = action.payload;
        state.error = null;
      })
      .addCase(fetchPendingChildLinks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Approve Child Link
      .addCase(approveChildLink.pending, (state, action) => {
        const linkId = action.meta.arg;
        state.isProcessing[linkId] = "approving";
        state.error = null;
      })
      .addCase(approveChildLink.fulfilled, (state, action) => {
        const linkId = action.meta.arg;
        delete state.isProcessing[linkId];
        state.error = null;
      })
      .addCase(approveChildLink.rejected, (state, action) => {
        const linkId = action.meta.arg;
        delete state.isProcessing[linkId];
        state.error = action.payload;
      })
      // Reject Child Link
      .addCase(rejectChildLink.pending, (state, action) => {
        const linkId = action.meta.arg;
        state.isProcessing[linkId] = "rejecting";
        state.error = null;
      })
      .addCase(rejectChildLink.fulfilled, (state, action) => {
        const linkId = action.meta.arg;
        delete state.isProcessing[linkId];
        state.error = null;
      })
      .addCase(rejectChildLink.rejected, (state, action) => {
        const linkId = action.meta.arg;
        delete state.isProcessing[linkId];
        state.error = action.payload;
      });
  },
});

export const {
  clearChildLinksError,
  clearProcessingState,
  setChildLinksLoading,
} = childLinksSlice.actions;

// Selectors
export const selectPendingChildLinks = (state) =>
  state.childLinks.pendingChildLinks;
export const selectChildLinksLoading = (state) => state.childLinks.isLoading;
export const selectChildLinksError = (state) => state.childLinks.error;
export const selectChildLinkProcessingState = (state, linkId) =>
  state.childLinks.isProcessing[linkId];

export default childLinksSlice.reducer;
