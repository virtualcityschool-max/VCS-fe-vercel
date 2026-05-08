import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { coursesService } from "../../services/coursesService";
import { logoutUser } from "./authSlice";

const normalizeCategoryField = (obj) => ({
  ...obj,
  category: typeof obj?.category === "object" && obj?.category !== null
    ? obj.category.name ?? null
    : obj?.category ?? null,
});

// Async thunks
export const fetchAllCourses = createAsyncThunk(
  "courses/fetchAllCourses",
  async (_, { rejectWithValue }) => {
    try {
      const courses = await coursesService.getAllCourses();
      return courses;
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

export const fetchCategories = createAsyncThunk(
  "courses/fetchCategories",
  async (_, { getState, rejectWithValue }) => {
    // Skip if already loaded
    if (getState().courses.categories.length > 0) return null;
    try {
      return await coursesService.getCategories();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load categories");
    }
  },
);

export const fetchCourseById = createAsyncThunk(
  "courses/fetchCourseById",
  async (courseId, { rejectWithValue }) => {
    try {
      const course = await coursesService.getCourseById(courseId);
      return course;
    } catch (error) {
      console.error("Failed to fetch course:", error);
      return rejectWithValue(error); // Preserve full error object
    }
  },
);

const initialState = {
  courses: [],
  currentCourse: null,
  isLoading: false,
  error: null,
  stats: null,
  categories: [],
  categoriesLoading: false,
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
        state.courses = Array.isArray(action.payload)
          ? action.payload.map(normalizeCategoryField)
          : action.payload;
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
        state.currentCourse = action.payload ? normalizeCategoryField(action.payload) : null;
        state.error = null;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        if (action.payload !== null) {
          state.categories = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesLoading = false;
      })

      // Handle logout - clear course enrollment flags
      .addCase(logoutUser.fulfilled, (state) => {
        // Reset courses to remove any enrollment flags from previous session
        state.courses = state.courses.map((course) => ({
          ...course,
          is_enrolled: false,
        }));
        state.currentCourse = state.currentCourse
          ? {
              ...state.currentCourse,
              is_enrolled: false,
            }
          : null;
      });
  },
});

export const { clearCoursesError, clearCurrentCourse } = coursesSlice.actions;
export default coursesSlice.reducer;
