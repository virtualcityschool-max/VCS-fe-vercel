import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.user;
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
    // Clear localStorage
    localStorage.removeItem("vcs_auth_state");

    // Return success to trigger state update
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
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem("vcs_auth_state");
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
