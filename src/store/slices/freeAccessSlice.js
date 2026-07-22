import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { freeAccessService } from "../../services/freeAccessService";

// Admin: fetch the full free-access review queue (all statuses).
export const fetchFreeAccessRequests = createAsyncThunk(
  "freeAccess/fetchRequests",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await freeAccessService.getRequests(params);
      return Array.isArray(data) ? data : data?.results || [];
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load free-access requests");
    }
  },
);

// Admin: apply per-course approve/reject decisions to one request.
export const resolveFreeAccessRequest = createAsyncThunk(
  "freeAccess/resolveRequest",
  async ({ id, decisions, note }, { rejectWithValue }) => {
    try {
      const updated = await freeAccessService.resolve(id, decisions, note);
      return updated; // full updated request
    } catch (error) {
      return rejectWithValue(error); // preserve full error for showApiError
    }
  },
);

const initialState = {
  requests: [],
  loading: false,
  error: null,
  processingId: null,
};

const freeAccessSlice = createSlice({
  name: "freeAccess",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFreeAccessRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFreeAccessRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchFreeAccessRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resolveFreeAccessRequest.pending, (state, action) => {
        state.processingId = action.meta.arg?.id ?? null;
      })
      .addCase(resolveFreeAccessRequest.fulfilled, (state, action) => {
        state.processingId = null;
        const updated = action.payload;
        if (updated?.id) {
          const idx = state.requests.findIndex((r) => r.id === updated.id);
          if (idx !== -1) state.requests[idx] = updated;
        }
      })
      .addCase(resolveFreeAccessRequest.rejected, (state) => {
        state.processingId = null;
      });
  },
});

// Selectors
export const selectFreeAccessRequests = (state) => state.freeAccess.requests;
export const selectFreeAccessLoading = (state) => state.freeAccess.loading;
export const selectFreeAccessError = (state) => state.freeAccess.error;
export const selectFreeAccessProcessingId = (state) => state.freeAccess.processingId;
export const selectPendingFreeAccessCount = (state) =>
  state.freeAccess.requests.filter((r) => r.status === "pending").length;

export default freeAccessSlice.reducer;
