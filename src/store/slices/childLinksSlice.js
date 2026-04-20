import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminService } from "../../services/adminService";
import { parentService } from "../../services/parentService";

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
        error.error ||
          error.message ||
          "Failed to load pending child link requests",
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

export const unlinkChildLinks = createAsyncThunk(
  "childLinks/unlinkChildLinks",
  async (studentIds, { rejectWithValue }) => {
    try {
      const result = await parentService.unlinkChildren(studentIds);
      return { studentIds, result };
    } catch (error) {
      console.error("Failed to unlink child links:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to unlink child",
      );
    }
  },
);

export const unlinkChildLinksAdmin = createAsyncThunk(
  "childLinks/unlinkChildLinksAdmin",
  async ({ parentId, studentIds }, { rejectWithValue }) => {
    try {
      const result = await adminService.unlinkChildrenAdmin(
        parentId,
        studentIds,
      );
      return { parentId, studentIds, result };
    } catch (error) {
      console.error("Failed to unlink child links admin:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to unlink child",
      );
    }
  },
);

export const fetchAvailableStudents = createAsyncThunk(
  "childLinks/fetchAvailableStudents",
  async (_, { rejectWithValue }) => {
    try {
      const students = await adminService.getAvailableStudents();
      return students;
    } catch (error) {
      console.error("Failed to fetch available students:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to fetch available students",
      );
    }
  },
);

export const linkChildLinksAdmin = createAsyncThunk(
  "childLinks/linkChildLinksAdmin",
  async ({ parentId, studentIds }, { rejectWithValue }) => {
    try {
      const result = await adminService.linkChildrenAdmin(parentId, studentIds);
      return { parentId, studentIds, result };
    } catch (error) {
      console.error("Failed to link child links admin:", error);
      return rejectWithValue(
        error.error || error.message || "Failed to link child",
      );
    }
  },
);

const initialState = {
  pendingChildLinks: [],
  isLoading: false,
  isProcessing: {}, // Track individual link processing state
  isUnlinking: false,
  error: null,
  availableStudents: [],
  availableStudentsLoading: false,
  availableStudentsError: null,
  isLinking: false,
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
      })
      // Unlink Child Links
      .addCase(unlinkChildLinks.pending, (state) => {
        state.isUnlinking = true;
        state.error = null;
      })
      .addCase(unlinkChildLinks.fulfilled, (state) => {
        state.isUnlinking = false;
        state.error = null;
      })
      .addCase(unlinkChildLinks.rejected, (state, action) => {
        state.isUnlinking = false;
        state.error = action.payload;
      })
      // Unlink Child Links Admin
      .addCase(unlinkChildLinksAdmin.pending, (state) => {
        state.isUnlinking = true;
        state.error = null;
      })
      .addCase(unlinkChildLinksAdmin.fulfilled, (state) => {
        state.isUnlinking = false;
        state.error = null;
      })
      .addCase(unlinkChildLinksAdmin.rejected, (state, action) => {
        state.isUnlinking = false;
        state.error = action.payload;
      })
      // Fetch Available Students
      .addCase(fetchAvailableStudents.pending, (state) => {
        state.availableStudentsLoading = true;
        state.availableStudentsError = null;
      })
      .addCase(fetchAvailableStudents.fulfilled, (state, action) => {
        state.availableStudentsLoading = false;
        state.availableStudents = action.payload;
        state.availableStudentsError = null;
      })
      .addCase(fetchAvailableStudents.rejected, (state, action) => {
        state.availableStudentsLoading = false;
        state.availableStudentsError = action.payload;
      })
      // Link Child Links Admin
      .addCase(linkChildLinksAdmin.pending, (state) => {
        state.isLinking = true;
        state.error = null;
      })
      .addCase(linkChildLinksAdmin.fulfilled, (state) => {
        state.isLinking = false;
        state.error = null;
      })
      .addCase(linkChildLinksAdmin.rejected, (state, action) => {
        state.isLinking = false;
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
export const selectChildLinksUnlinking = (state) =>
  state.childLinks.isUnlinking;
export const selectAvailableStudents = (state) =>
  state.childLinks.availableStudents;
export const selectAvailableStudentsLoading = (state) =>
  state.childLinks.availableStudentsLoading;
export const selectAvailableStudentsError = (state) =>
  state.childLinks.availableStudentsError;
export const selectChildLinksLinking = (state) => state.childLinks.isLinking;

export default childLinksSlice.reducer;
