import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { authStorage } from "../../utils/authStorage";

// Bootstrap auth state from localStorage
const getInitialAuthState = () => {
  const storedAuthState = authStorage.getAuthState();
  return {
    isLoggedIn: storedAuthState.isLoggedIn,
    role: storedAuthState.role,
    username: storedAuthState.username,
    token: storedAuthState.token,
    user: storedAuthState.user,
    profile: storedAuthState.user || null,
    isLoading: false,
    resendOtpLoading: false,
    isInitialized: false,
    error: null,
  };
};

// Get current user profile
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const profile = await authService.getMe();
      return profile;
    } catch (error) {
      console.error("❌ fetchUserProfile: Profile fetch failed:", error);
      console.error(
        "❌ fetchUserProfile: Error response:",
        error.response?.data,
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

// Initialize auth state on app startup
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = authStorage.getAccessToken();
      if (!token) {
        return { initialized: true, authenticated: false };
      }

      const profile = await dispatch(fetchUserProfile()).unwrap();
      return {
        initialized: true,
        authenticated: true,
        profile,
      };
    } catch (error) {
      authStorage.clearAuthStorage();
      localStorage.removeItem("vcs_refresh_token");
      return rejectWithValue(
        error.response?.data?.message || "Auth initialization failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      const accessToken = response.user.token;
      const refreshToken = response.refresh_token;

      console.log("🔐 Storing tokens:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        tokenLength: accessToken?.length,
      });

      authStorage.setAccessToken(accessToken);
      if (refreshToken) {
        localStorage.setItem("vcs_refresh_token", refreshToken);
      }

      const user = {
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
      };

      authStorage.setStoredAuthUser(user);

      try {
        console.log(
          "👤 Fetching user profile after login with explicit token...",
        );
        const profile = await authService.getMe(accessToken);
        console.log("✅ Profile fetched successfully:", profile);

        const normalizedUser = {
          username: profile.username || user.username,
          email: profile.email || user.email,
          role: profile.role || user.role,
        };

        authStorage.setStoredAuthUser(normalizedUser);

        return {
          token: accessToken,
          role: normalizedUser.role,
          username: normalizedUser.username,
          user: normalizedUser,
          profile,
        };
      } catch (profileError) {
        console.warn(
          "⚠️ Profile fetch failed after login, using basic user data:",
          profileError,
        );

        return {
          token: accessToken,
          role: user.role,
          username: user.username,
          user,
          profile: null,
        };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      // Preserve full error object for proper non_field_errors handling
      return rejectWithValue(error);
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.warn("Backend logout failed:", error);
  }

  authStorage.clearAuthStorage();
  localStorage.removeItem("vcs_refresh_token");

  return { success: true };
});

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      // Extract error message to avoid storing non-serializable AxiosError
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Registration failed";
      return rejectWithValue(errorMessage);
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ userId, otp }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOtp(userId, otp);
      return response;
    } catch (err) {
      // Preserve full error object for proper normalization
      return rejectWithValue(err);
    }
  },
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.resendOtp(email);
      return response;
    } catch (err) {
      // Preserve full error object for proper normalization
      return rejectWithValue(err);
    }
  },
);

const initialState = getInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.role = null;
      state.username = null;
      state.token = null;
      state.user = null;
      state.profile = null;
      state.isLoading = false;
      state.resendOtpLoading = false;
      state.error = null;
      state.isInitialized = true;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateToken: (state, action) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;

        if (action.payload.authenticated && action.payload.profile) {
          state.isLoggedIn = true;
          state.profile = action.payload.profile;
          state.role = action.payload.profile.role;
          state.username = action.payload.profile.username;
          state.user = {
            username: action.payload.profile.username,
            email: action.payload.profile.email,
            role: action.payload.profile.role,
          };
          state.token = authStorage.getAccessToken();
        } else {
          state.isLoggedIn = false;
          state.role = null;
          state.username = null;
          state.token = null;
          state.user = null;
          state.profile = null;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isLoggedIn = false;
        state.role = null;
        state.username = null;
        state.token = null;
        state.user = null;
        state.profile = null;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.role = action.payload.role;
        state.username = action.payload.username;
        state.user = {
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role,
        };
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.isInitialized = true;
        state.role = action.payload.role;
        state.username = action.payload.username;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.role = null;
        state.username = null;
        state.token = null;
        state.user = null;
        state.profile = null;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(resendOtp.pending, (state) => {
        state.resendOtpLoading = true;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.resendOtpLoading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.resendOtpLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError, updateToken } = authSlice.actions;
export default authSlice.reducer;
