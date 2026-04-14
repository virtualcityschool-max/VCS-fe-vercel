import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { studentService } from "../../services/studentService";
import { teacherService } from "../../services/teacherService";

export const fetchUnreadAnnouncementsCount = createAsyncThunk(
  "announcements/fetchUnreadAnnouncementsCount",
  async (_, { rejectWithValue }) => {
    try {
      const data = await studentService.getUnreadAnnouncementsCount();
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch unread announcements count",
      );
    }
  },
);

export const fetchMyAnnouncements = createAsyncThunk(
  "announcements/fetchMyAnnouncements",
  async (_, { rejectWithValue }) => {
    try {
      const data = await studentService.getMyAnnouncements();
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch announcements",
      );
    }
  },
);

export const createAnnouncement = createAsyncThunk(
  "announcements/createAnnouncement",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await teacherService.createAnnouncement(payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to create announcement",
      );
    }
  },
);

const initialState = {
  unreadCount: 0,
  items: [],
  loadingUnreadCount: false,
  loadingItems: false,
  loadingCreate: false,
  errorUnreadCount: null,
  errorItems: null,
  errorCreate: null,
};

const announcementsSlice = createSlice({
  name: "announcements",
  initialState,
  reducers: {
    clearAnnouncementsError: (state) => {
      state.errorUnreadCount = null;
      state.errorItems = null;
      state.errorCreate = null;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadAnnouncementsCount.pending, (state) => {
        state.loadingUnreadCount = true;
        state.errorUnreadCount = null;
      })
      .addCase(fetchUnreadAnnouncementsCount.fulfilled, (state, action) => {
        state.loadingUnreadCount = false;
        state.unreadCount = Number(action.payload?.unread_count || 0);
      })
      .addCase(fetchUnreadAnnouncementsCount.rejected, (state, action) => {
        state.loadingUnreadCount = false;
        state.errorUnreadCount = action.payload;
      })

      .addCase(fetchMyAnnouncements.pending, (state) => {
        state.loadingItems = true;
        state.errorItems = null;
      })
      .addCase(fetchMyAnnouncements.fulfilled, (state, action) => {
        state.loadingItems = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.unreadCount = 0;
      })
      .addCase(fetchMyAnnouncements.rejected, (state, action) => {
        state.loadingItems = false;
        state.errorItems = action.payload;
      })

      .addCase(createAnnouncement.pending, (state) => {
        state.loadingCreate = true;
        state.errorCreate = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.loadingCreate = false;
        state.items.unshift(action.payload);
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.loadingCreate = false;
        state.errorCreate = action.payload;
      });
  },
});

export const { clearAnnouncementsError, resetUnreadCount } =
  announcementsSlice.actions;

export default announcementsSlice.reducer;
