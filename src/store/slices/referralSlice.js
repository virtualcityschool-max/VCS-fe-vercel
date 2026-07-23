import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { referralService } from "../../services/referralService";

// Logged-in student/teacher: their own permanent referral code + link.
export const fetchMyReferral = createAsyncThunk(
  "referrals/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      return await referralService.getMyReferral();
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load referral link");
    }
  },
);

// Admin: paginated referral performance list.
export const fetchReferralStats = createAsyncThunk(
  "referrals/fetchStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await referralService.getReferralStats(params);
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load referral stats");
    }
  },
);

// Admin: users who signed up through one referrer.
export const fetchReferralDetail = createAsyncThunk(
  "referrals/fetchDetail",
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const data = await referralService.getReferralDetail(userId, params);
      return { userId, data };
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load referred users");
    }
  },
);

const initialState = {
  // student/teacher self view
  mine: null, // { code, referral_link }
  mineLoading: false,
  mineError: null,
  // admin list
  stats: [],
  statsCount: 0,
  statsLoading: false,
  statsError: null,
  // admin detail (referred users for one referrer)
  detail: [],
  detailUserId: null,
  detailLoading: false,
  detailError: null,
};

// Both paginated (DRF PageNumberPagination → {results,count}) and plain-array
// responses are tolerated.
const asList = (payload) => (Array.isArray(payload) ? payload : payload?.results || []);
const asCount = (payload) =>
  Array.isArray(payload) ? payload.length : payload?.count ?? 0;

const referralSlice = createSlice({
  name: "referrals",
  initialState,
  reducers: {
    clearReferralDetail: (state) => {
      state.detail = [];
      state.detailUserId = null;
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // mine
      .addCase(fetchMyReferral.pending, (state) => {
        state.mineLoading = true;
        state.mineError = null;
      })
      .addCase(fetchMyReferral.fulfilled, (state, action) => {
        state.mineLoading = false;
        state.mine = action.payload;
      })
      .addCase(fetchMyReferral.rejected, (state, action) => {
        state.mineLoading = false;
        state.mineError = action.payload;
      })
      // admin list
      .addCase(fetchReferralStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchReferralStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = asList(action.payload);
        state.statsCount = asCount(action.payload);
      })
      .addCase(fetchReferralStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })
      // admin detail
      .addCase(fetchReferralDetail.pending, (state, action) => {
        state.detailLoading = true;
        state.detailError = null;
        state.detailUserId = action.meta.arg?.userId ?? null;
      })
      .addCase(fetchReferralDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = asList(action.payload.data);
        state.detailUserId = action.payload.userId;
      })
      .addCase(fetchReferralDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });
  },
});

export const { clearReferralDetail } = referralSlice.actions;

export const selectMyReferral = (state) => state.referrals.mine;
export const selectMyReferralLoading = (state) => state.referrals.mineLoading;
export const selectReferralStats = (state) => state.referrals.stats;
export const selectReferralStatsLoading = (state) => state.referrals.statsLoading;
export const selectReferralDetail = (state) => state.referrals.detail;
export const selectReferralDetailLoading = (state) => state.referrals.detailLoading;

export default referralSlice.reducer;
