import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { coursesService } from "../../services/coursesService";

// Async thunks
export const fetchAllCourses = createAsyncThunk(
  "courses/fetchAllCourses",
  async (_, { rejectWithValue }) => {
    try {
      const courses = await coursesService.getAllCourses();
      return courses;
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to load courses"
      );
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  "courses/fetchCourseById",
  async (courseId, { rejectWithValue }) => {
    try {
      const course = await coursesService.getCourseById(courseId);
      return course;
    } catch (error) {
      console.error("Failed to fetch course:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to load course"
      );
    }
  }
);

const initialState = {
  courses: [],
  currentCourse: null,
  isLoading: false,
  error: null,
  stats: null,
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearCoursesError: (state) => {
      state.error = null;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Courses
      .addCase(fetchAllCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload;
        state.error = null;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCoursesError, clearCurrentCourse } = coursesSlice.actions;
export default coursesSlice.reducer;
