import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { testimonialsService } from "../../services/testimonialsService";

// ── Public read (homepage) + admin read (admin page passes no filter and
// expects drafts included - same convention as fetchBlogs) ───────────────
export const fetchTestimonials = createAsyncThunk(
  "testimonials/fetchTestimonials",
  async (params, { rejectWithValue }) => {
    try {
      return await testimonialsService.getAllTestimonials(params);
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
      return rejectWithValue(error);
    }
  },
);

// ── Admin writes ────────────────────────────────────────────────
export const createTestimonial = createAsyncThunk(
  "testimonials/createTestimonial",
  async (data, { rejectWithValue }) => {
    try {
      return await testimonialsService.createTestimonial(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateTestimonial = createAsyncThunk(
  "testimonials/updateTestimonial",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await testimonialsService.updateTestimonial(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteTestimonial = createAsyncThunk(
  "testimonials/deleteTestimonial",
  async (id, { rejectWithValue }) => {
    try {
      await testimonialsService.deleteTestimonial(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  testimonials: [],
  isLoading: false,
  saving: false,
  error: null,
};

const testimonialsSlice = createSlice({
  name: "testimonials",
  initialState,
  reducers: {
    clearTestimonialsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestimonials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.testimonials = Array.isArray(payload) ? payload : payload?.results || [];
        state.error = null;
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createTestimonial.pending, (state) => {
        state.saving = true;
      })
      .addCase(createTestimonial.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) state.testimonials.unshift(action.payload);
      })
      .addCase(createTestimonial.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateTestimonial.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateTestimonial.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload;
        if (updated) {
          const idx = state.testimonials.findIndex((t) => t.id === updated.id);
          if (idx !== -1) state.testimonials[idx] = { ...state.testimonials[idx], ...updated };
        }
      })
      .addCase(updateTestimonial.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteTestimonial.fulfilled, (state, action) => {
        state.testimonials = state.testimonials.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearTestimonialsError } = testimonialsSlice.actions;
export default testimonialsSlice.reducer;
