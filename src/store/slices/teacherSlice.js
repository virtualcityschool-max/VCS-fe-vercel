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

const initialState = {
  teachers: [],
  teacherDetails: null,
  loading: false,
  error: null,
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
      });
  },
});

export default teacherSlice.reducer;
