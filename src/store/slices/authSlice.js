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
    error: null,
  };
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      // Prepare user data
      const user = {
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
      };

      return {
        ...response.user,
        user,
      };
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

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    // Return success to trigger state update
    // Store will handle localStorage cleanup via subscription
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
  isLoading: false,
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
      state.isLoading = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.error = null;
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
