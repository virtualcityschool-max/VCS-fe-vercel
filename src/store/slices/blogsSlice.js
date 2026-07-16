import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { blogsService } from "../../services/blogsService";

// ── Public reads ────────────────────────────────────────────────
export const fetchBlogs = createAsyncThunk(
  "blogs/fetchBlogs",
  async (params, { rejectWithValue }) => {
    try {
      return await blogsService.getAllBlogs(params);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      return rejectWithValue(error);
    }
  },
);

export const fetchBlogBySlug = createAsyncThunk(
  "blogs/fetchBlogBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      return await blogsService.getBlogBySlug(slug);
    } catch (error) {
      console.error("Failed to fetch blog:", error);
      return rejectWithValue(error);
    }
  },
);

// ── Admin writes ────────────────────────────────────────────────
export const createBlog = createAsyncThunk(
  "blogs/createBlog",
  async (formData, { rejectWithValue }) => {
    try {
      return await blogsService.createBlog(formData);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateBlog = createAsyncThunk(
  "blogs/updateBlog",
  async ({ slug, formData }, { rejectWithValue }) => {
    try {
      return await blogsService.updateBlog(slug, formData);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteBlog = createAsyncThunk(
  "blogs/deleteBlog",
  async (slug, { rejectWithValue }) => {
    try {
      await blogsService.deleteBlog(slug);
      return slug;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  blogs: [],
  currentBlog: null,
  isLoading: false,
  saving: false,
  error: null,
};

const blogsSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    clearBlogsError: (state) => {
      state.error = null;
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch blog by slug
      .addCase(fetchBlogBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBlog = action.payload || null;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create / update / delete (admin)
      .addCase(createBlog.pending, (state) => {
        state.saving = true;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) state.blogs.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateBlog.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload;
        if (updated) {
          state.currentBlog = updated;
          const idx = state.blogs.findIndex((b) => b.id === updated.id);
          if (idx !== -1) state.blogs[idx] = { ...state.blogs[idx], ...updated };
        }
      })
      .addCase(updateBlog.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((b) => b.slug !== action.payload);
      });
  },
});

export const { clearBlogsError, clearCurrentBlog } = blogsSlice.actions;
export default blogsSlice.reducer;
