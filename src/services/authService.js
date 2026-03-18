import axiosInstance from "../utils/axiosInstance";

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

      console.log("Full user data being sent:", {
        email: userData.email,
        username: userData.username,
        password: userData.password ? "[PASSWORD_HIDDEN]" : undefined,
        confirm_password: userData.confirmPassword
          ? "[PASSWORD_HIDDEN]"
          : undefined,
        role: userData.role,
      });

      const requestData = {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        confirm_password: userData.confirmPassword,
        role: userData.role,
      };

      console.log("Request data being sent to backend:", requestData);
      console.log(
        "Request URL:",
        `${axiosInstance.defaults.baseURL}/auth/register/`,
      );

      const response = await axiosInstance.post(`/auth/register/`, requestData);

      console.log("Registration Response:", response.data);

      // Extract user_id from response for OTP verification
      // Backend should return user_id in the response data
      const userId = response.data.user_id || response.data.id;

      return {
        success: true,
        user: response.data.user,
        user_id: userId, // Include user_id for OTP verification
        message: response.data.message || "Registration successful",
      };
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message,
      );

      // Handle specific backend error responses per API spec
      if (error.response?.status === 400) {
        const backendError = error.response?.data;

        if (backendError?.error?.includes("User already exists")) {
          const errorDetails = {
            error:
              "An account with this email already exists. Please use a different email or try logging in.",
            status: 400,
          };
          throw errorDetails;
        }

        if (backendError?.error?.includes("Validation failed")) {
          // Handle specific validation errors
          if (backendError?.confirm_password) {
            const errorDetails = {
              error:
                "Passwords do not match. Please make sure both passwords are identical.",
              status: 400,
              field: "confirm_password",
            };
            throw errorDetails;
          }

          if (backendError?.password) {
            const errorDetails = {
              error:
                "Password is too weak. Please use a stronger password with at least 8 characters.",
              status: 400,
              field: "password",
            };
            throw errorDetails;
          }

          if (backendError?.email) {
            const errorDetails = {
              error:
                "Invalid email address. Please enter a valid email address.",
              status: 400,
              field: "email",
            };
            throw errorDetails;
          }

          if (backendError?.username) {
            const errorDetails = {
              error: "Invalid username. Please choose a different username.",
              status: 400,
              field: "username",
            };
            throw errorDetails;
          }

          if (backendError?.role) {
            const errorDetails = {
              error: "Invalid role selected. Please select a valid role.",
              status: 400,
              field: "role",
            };
            throw errorDetails;
          }
        }

        // Handle parent-specific errors
        if (backendError?.error?.includes("No student found with email")) {
          const errorDetails = {
            error:
              "No student account found with the provided email address. Please check the email and try again.",
            status: 400,
          };
          throw errorDetails;
        }

        // Generic 400 error
        const errorDetails = {
          error:
            backendError?.error ||
            "Invalid registration data. Please check your information and try again.",
          status: 400,
        };
        throw errorDetails;
      }

      // Handle 500 specifically - backend server error
      if (error.response?.status === 500) {
        const backendError = error.response?.data;
        console.log("Backend 500 error details:", backendError);

        const errorDetails = {
          error: "Backend server error during registration.",
          status: 500,
          suggestion:
            "The registration service is experiencing issues. Please try again in a few minutes or contact support.",
          backendDetails:
            backendError?.error ||
            backendError?.message ||
            "Internal server error",
        };
        throw errorDetails;
      }

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
      console.log("Attempting OTP verification for user ID:", userId);
      console.log("User ID type:", typeof userId);

      // Backend expects only user_id (number) and otp, not email
      const requestData = {
        user_id: parseInt(userId), // Ensure it's a number
        otp: otp,
      };

      console.log("OTP Request data:", {
        user_id: requestData.user_id,
        otp: "[OTP_HIDDEN]",
      });

      const response = await axiosInstance.post(
        `/auth/verify-otp/`,
        requestData,
      );

      console.log("OTP Verification Response:", response.data);

      return {
        success: true,
        message: response.data.message || "Email verified successfully",
      };
    } catch (error) {
      console.error("OTP Verification Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        userId: userId,
        userIdType: typeof userId,
      });

      // Handle specific backend error responses per API spec
      if (error.response?.status === 400) {
        const backendError = error.response?.data;

        if (backendError?.error?.includes("Invalid OTP")) {
          const errorDetails = {
            error: "Invalid OTP. Please check your email and try again.",
            status: 400,
          };
          throw errorDetails;
        }

        if (backendError?.error?.includes("OTP expired")) {
          const errorDetails = {
            error:
              "OTP has expired. Please register again to receive a new OTP.",
            status: 400,
          };
          throw errorDetails;
        }

        // Handle other 400 errors
        const errorDetails = {
          error: backendError?.error || "Invalid OTP request.",
          status: 400,
        };
        throw errorDetails;
      }

      // Handle 404 specifically - user not found
      if (error.response?.status === 404) {
        const errorDetails = {
          error: "User not found. Please register again.",
          status: 404,
          suggestion:
            "The registration may have failed or expired. Please try registering with the same email.",
        };
        throw errorDetails;
      }

      // Handle 500 specifically - backend server error
      if (error.response?.status === 500) {
        const backendError = error.response?.data;
        console.log("Backend 500 error details:", backendError);

        const errorDetails = {
          error: "Backend server error during OTP verification.",
          status: 500,
          suggestion:
            "The OTP verification service is experiencing issues. Please try again in a few minutes or contact support.",
          backendDetails:
            backendError?.error ||
            backendError?.message ||
            "Internal server error",
        };
        throw errorDetails;
      }

      // Preserve structured error objects for field-specific handling
      if (error.response?.data) {
        throw error.response.data;
      }
      throw new Error(error.message || "OTP verification failed");
    }
  },
};
