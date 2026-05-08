import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { hireService } from "../../services/hireService";

export const fetchAdminHireRequests = createAsyncThunk(
  "hire/fetchAdminHireRequests",
  async (status, { rejectWithValue }) => {
    try {
      return await hireService.getAdminHireRequests(status);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load hire requests");
    }
  }
);

export const actionHireRequest = createAsyncThunk(
  "hire/actionHireRequest",
  async ({ id, action }, { rejectWithValue, dispatch }) => {
    try {
      const result = await hireService.actionHireRequest(id, action);
      dispatch(fetchAdminHireRequests());
      return { id, result };
    } catch (error) {
      return rejectWithValue(error.message || `Failed to ${action} hire request`);
    }
  }
);

export const fetchMyLeads = createAsyncThunk(
  "hire/fetchMyLeads",
  async (status, { rejectWithValue }) => {
    try {
      return await hireService.getMyLeads(status);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load hire leads");
    }
  }
);

const hireSlice = createSlice({
  name: "hire",
  initialState: {
    adminRequests: [],
    adminLoading: false,
    adminError: null,
    adminProcessing: {},
    myLeads: [],
    leadsLoading: false,
    leadsError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminHireRequests.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminHireRequests.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminRequests = action.payload;
      })
      .addCase(fetchAdminHireRequests.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      .addCase(actionHireRequest.pending, (state, action) => {
        state.adminProcessing[action.meta.arg.id] = action.meta.arg.action;
      })
      .addCase(actionHireRequest.fulfilled, (state, action) => {
        delete state.adminProcessing[action.meta.arg.id];
      })
      .addCase(actionHireRequest.rejected, (state, action) => {
        delete state.adminProcessing[action.meta.arg.id];
        state.adminError = action.payload;
      })
      .addCase(fetchMyLeads.pending, (state) => {
        state.leadsLoading = true;
        state.leadsError = null;
      })
      .addCase(fetchMyLeads.fulfilled, (state, action) => {
        state.leadsLoading = false;
        state.myLeads = action.payload;
      })
      .addCase(fetchMyLeads.rejected, (state, action) => {
        state.leadsLoading = false;
        state.leadsError = action.payload;
      });
  },
});

export default hireSlice.reducer;
