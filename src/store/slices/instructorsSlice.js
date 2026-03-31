import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { teacherService } from "../../services/teacherService";

export const fetchTeachers = createAsyncThunk(
  "instructors/fetchTeachers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await teacherService.getTeachers(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch instructors",
      );
    }
  },
);

const initialState = {
  teachers: [],
  loading: false,
  error: null,
};

const instructorsSlice = createSlice({
  name: "instructors",
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
        state.error = action.payload || "Failed to load instructors";
      });
  },
});

export default instructorsSlice.reducer;
