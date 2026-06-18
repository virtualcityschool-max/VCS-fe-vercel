import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { platformSettingsService } from "../../services/platformSettingsService";

export const fetchPlatformSettings = createAsyncThunk(
  "platformSettings/fetch",
  async (_, { rejectWithValue }) => {
    try { return await platformSettingsService.get(); }
    catch (e) { return rejectWithValue(e); }
  }
);

const DEFAULTS = {
  quiz_marks_per_question:  1,
  quiz_publish_immediately: true,
  quiz_submission_days:     2,
  session_duration_mins:       60,
  session_default_start_type:  "scheduled",
  session_meeting_platform:    "google_meet",
};

const platformSettingsSlice = createSlice({
  name: "platformSettings",
  initialState: { data: DEFAULTS, loading: false },
  reducers: {
    setSettings(state, action) { state.data = { ...state.data, ...action.payload }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformSettings.pending,   (s) => { s.loading = true; })
      .addCase(fetchPlatformSettings.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchPlatformSettings.rejected,  (s) => { s.loading = false; });
  },
});

export const { setSettings } = platformSettingsSlice.actions;
export const selectPlatformSettings = (state) => state.platformSettings.data;
export default platformSettingsSlice.reducer;
