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
    isLoading: false,
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

      // Token exists, fetch profile
      const profile = await dispatch(fetchUserProfile()).unwrap();
      return {
        initialized: true,
        authenticated: true,
        profile,
      };
    } catch (error) {
      // Token invalid, clear storage
      authStorage.clearAuthStorage();
      return rejectWithValue(
        error.response?.data?.message || "Auth initialization failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.login(credentials);

      // Store tokens
      const accessToken = response.user.token;
      const refreshToken = response.refresh_token; // Extract from response

      console.log("🔐 Storing tokens:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        tokenLength: accessToken?.length,
      });

      authStorage.setAccessToken(accessToken);
      if (refreshToken) {
        localStorage.setItem("vcs_refresh_token", refreshToken);
      }

      // Verify token is stored
      const storedToken = authStorage.getAccessToken();
      console.log("🔍 Token verification:", {
        storedToken: !!storedToken,
        matchesOriginal: storedToken === accessToken,
      });

      // Prepare user data
      const user = {
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
      };

      // Store user data
      authStorage.setStoredAuthUser(user);

      // Small delay to ensure token is set in axios interceptor
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Fetch complete profile after login
      try {
        console.log("👤 Fetching user profile after login...");
        const profile = await authService.getMe(); // Direct call instead of dispatch
        console.log("✅ Profile fetched successfully:", profile);
        return {
          ...response.user,
          user,
          profile,
        };
      } catch (profileError) {
        console.warn(
          "⚠️ Profile fetch failed after login, using basic user data:",
          profileError,
        );
        // Return login data even if profile fetch fails
        return {
          ...response.user,
          user,
          profile: null,
        };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      return rejectWithValue(error.message || "Login failed");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      // Call backend logout
      await authService.logout();
    } catch (error) {
      console.warn("Backend logout failed:", error);
    }

    // Always clear local storage
    authStorage.clearAuthStorage();
    localStorage.removeItem("vcs_refresh_token");

    return { success: true };
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      // Convert Error objects to serializable format
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      // Handle structured error objects
      if (typeof err === "object" && err !== null) {
        return rejectWithValue(err);
      }
      return rejectWithValue(String(err));
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
      // Convert Error objects to serializable format
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      // Handle structured error objects
      if (typeof err === "object" && err !== null) {
        return rejectWithValue(err);
      }
      return rejectWithValue(String(err));
    }
  },
);

const initialState = {
  isLoggedIn: false,
  role: null,
  username: null,
  token: null,
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

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
      // Initialize Auth
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
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isLoggedIn = false;
      })
      // Fetch User Profile
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
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
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
      // Logout User
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
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        // Don't auto-login on registration, just show success
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify OTP
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
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
