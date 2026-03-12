import axiosInstance from "../utility/axiosInstance";

export const authService = {
  // Login
  login: async (credentials) => {
    try {
      const requestData = {
        email: credentials.email,
        password: credentials.password,
        role: credentials.role,
      };

      console.log("Sending request data:", requestData);

      const response = await axiosInstance.post(`/auth/login/`, requestData);

      console.log("API Response:", response.data);

      return {
        success: true,
        user: {
          username:
            response.data.user?.name || response.data.user?.email || "User",
          email: response.data.user?.email,
          role: response.data.user?.role || credentials.role,
          token: response.data.access || response.data.token,
        },
      };
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        isCORS:
          error.message.includes("CORS") ||
          error.message.includes("Network Error"),
        config: error.config,
        fullError: error,
      });

      let errorMessage = "Login failed. Please try again.";

      if (error.response?.status === 500) {
        errorMessage = `Server error: ${error.response?.data?.message || "Internal server error. Check backend logs."}`;
      } else if (
        error.message.includes("CORS") ||
        error.message.includes("Network Error")
      ) {
        errorMessage =
          "Network error: Backend may not be running or CORS is not configured. Please check the console.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage =
          "Invalid credentials. Please check your email and password.";
      } else if (error.response?.status === 404) {
        errorMessage = "Login endpoint not found. Please check the API URL.";
      } else if (error.response?.status === 400) {
        errorMessage = `Bad request: ${error.response?.data?.message || "Invalid data format"}`;
      }

      throw new Error(errorMessage);
    }
  },

  // Register
  register: async (userData) => {
    try {
      console.log("Registering user:", userData.email);

      const response = await axiosInstance.post(`/auth/register/`, {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        confirm_password: userData.confirmPassword,
        role: userData.role,
      });

      console.log("Registration Response:", response.data);

      return {
        success: true,
        user: response.data.user,
        message: response.data.message || "Registration successful",
      };
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message,
      );
      // Preserve structured error objects for field-specific handling
      if (error.response?.data) {
        throw error.response.data;
      }
      throw new Error(error.message || "Registration failed");
    }
  },

  // OTP Verification
  verifyOtp: async (userId, otp) => {
    try {
      const response = await axiosInstance.post(`/auth/verify-otp/`, {
        user_id: userId,
        otp: otp,
      });

      console.log("OTP Verification Response ", response.data);

      return {
        success: true,
        message: response.data.message || "Email verified successfully",
      };
    } catch (error) {
      console.error(
        "OTP Verification Response:",
        error.response?.data || error.message,
      );
      // Preserve structured error objects for field-specific handling
      if (error.response?.data) {
        throw error.response.data;
      }
      throw new Error(error.message || "OTP verification failed");
    }
  },
};
