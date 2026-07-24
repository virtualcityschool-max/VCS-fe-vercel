import axiosInstance from "../utils/axiosInstance";

export const authService = {
  // Get current user profile
  getMe: async (token = null) => {
    try {
      const response = await axiosInstance.get("/auth/me/", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      console.error("Get profile error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const requestData = {
        email: credentials.email,
        password: credentials.password,
        role: credentials.role,
      };

      console.log("Sending request data:", requestData);

      const response = await axiosInstance.post("/auth/login/", requestData);

      console.log("API Response:", response.data);

      return {
        success: true,
        user: {
          username:
            response.data.user?.name || response.data.user?.email || "User",
          email: response.data.user?.email,
          role: response.data.user?.role || credentials.role,
          token: response.data.access,
        },
        refresh_token: response.data.refresh,
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

      // Preserve full backend error response - DO NOT override messages
      throw error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      console.log("Registering user:", userData.email);

      console.log("Full user data being sent:", {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: userData.password ? "[PASSWORD_HIDDEN]" : undefined,
        confirm_password: userData.confirmPassword
          ? "[PASSWORD_HIDDEN]"
          : undefined,
        role: userData.role,
      });

      const requestData = {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: userData.password,
        confirm_password: userData.confirmPassword,
        role: userData.role,
      };
      if (userData.grade_level) {
        requestData.grade_level = userData.grade_level;
      }
      if (userData.referral_code) {
        requestData.referral_code = userData.referral_code;
      }

      console.log("Request data being sent to backend:", requestData);
      console.log(
        "Request URL:",
        `${axiosInstance.defaults.baseURL}/auth/register/`,
      );

      const response = await axiosInstance.post("/auth/register/", requestData);

      console.log("Registration Response:", response.data);

      return {
        success: true,
        email: response.data.email,
        role: response.data.role,
        message: response.data.message || "Registration successful",
      };
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message,
      );

      // Preserve full backend error response - DO NOT override messages
      throw error;
    }
  },

  // OTP Verification
  verifyOtp: async (email, otp) => {
    try {
      const response = await axiosInstance.post("/auth/verify-otp/", { email, otp });
      return {
        success: true,
        message: response.data.message || "Email verified successfully",
      };
    } catch (error) {
      throw error;
    }
  },

  // Token refresh
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("vcs_refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axiosInstance.post("/auth/token/refresh/", {
        refresh: refreshToken,
      });

      return {
        access: response.data.access,
        refresh: response.data.refresh || refreshToken,
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    let backendLogoutSuccess = false;

    try {
      const refreshToken = localStorage.getItem("vcs_refresh_token");
      if (refreshToken) {
        await axiosInstance.post("/auth/logout/", {
          refresh: refreshToken,
        });
        backendLogoutSuccess = true;
      } else {
        backendLogoutSuccess = true; // No token to invalidate
      }
    } catch (error) {
      console.error("Backend logout failed:", error);
      // Continue with local logout even if backend fails
      backendLogoutSuccess = false;
    }

    // Always clear local storage regardless of backend success
    try {
      localStorage.removeItem("vcs_refresh_token");
    } catch (error) {
      console.error("Failed to clear refresh token from localStorage:", error);
    }

    return { backendLogoutSuccess };
  },

  // Resend OTP
  resendOtp: async (email) => {
    try {
      console.log("Resending OTP for email:", email);

      const requestData = {
        email: email,
      };

      console.log("Resend OTP Request data:", requestData);

      const response = await axiosInstance.post(
        "/auth/resend-otp/",
        requestData,
      );

      console.log("Resend OTP Response:", response.data);

      return {
        success: true,
        message: response.data.message || "OTP resent successfully",
        user_id: response.data.user_id,
      };
    } catch (error) {
      console.error("Resend OTP Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        email: email,
      });

      // Preserve full backend error response - DO NOT override messages
      throw error;
    }
  },

  // Update role-specific profile (student / teacher / parent)
  updateRoleProfile: async (role, profileData) => {
    try {
      const response = await axiosInstance.patch(`/auth/me/profile/${role}/`, profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update Profile
  updateProfile: async (profileData) => {
    try {
      console.log("Updating profile:", profileData);

      const response = await axiosInstance.patch("/auth/me/", profileData);

      console.log("Profile Update Response:", response.data);

      return {
        success: true,
        user: response.data,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Profile Update Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 400) {
        const backendError = error.response?.data;
        throw {
          error:
            backendError?.error ||
            "Invalid profile data. Please check your information.",
          status: 400,
        };
      }

      if (error.response?.status === 401) {
        throw {
          error: "Unauthorized. Please log in again.",
          status: 401,
        };
      }

      throw new Error(error.message || "Failed to update profile");
    }
  },

  // Update Student Profile
  updateStudentProfile: async (studentData) => {
    try {
      console.log("Updating student profile:", studentData);

      const response = await axiosInstance.patch(
        "/auth/me/profile/student/",
        studentData,
      );

      console.log("Student Profile Update Response:", response.data);

      return {
        success: true,
        user: response.data,
        message: "Student profile updated successfully",
      };
    } catch (error) {
      console.error("Student Profile Update Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 400) {
        const backendError = error.response?.data;
        throw {
          error: backendError?.error || "Invalid student profile data.",
          status: 400,
        };
      }

      throw new Error(error.message || "Failed to update student profile");
    }
  },

  // Get pending approvals (admin only)
  getPendingApprovals: async () => {
    try {
      console.log("Fetching pending approvals...");

      const response = await axiosInstance.get("/auth/pending-approvals/");
      console.log("Pending Approvals Response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Get pending approvals error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 403) {
        throw {
          error: "You don't have permission to view pending approvals.",
          status: 403,
        };
      }

      if (error.response?.status === 401) {
        throw {
          error: "Please log in to view pending approvals.",
          status: 401,
        };
      }

      throw new Error(error.message || "Failed to fetch pending approvals");
    }
  },

  // Get rejected approvals (admin only)
  getRejectedApprovals: async () => {
    try {
      const response = await axiosInstance.get("/auth/rejected-approvals/");
      return response.data;
    } catch (error) {
      console.error("Get rejected approvals error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 403) {
        throw {
          error: "You don't have permission to view rejected users.",
          status: 403,
        };
      }

      if (error.response?.status === 401) {
        throw {
          error: "Please log in to view rejected users.",
          status: 401,
        };
      }

      throw new Error(error.message || "Failed to fetch rejected users");
    }
  },

  // Approve user (admin only)
  approveUser: async (userId) => {
    try {
      console.log("Approving user:", userId);

      const response = await axiosInstance.patch(`/auth/approve/${userId}/`, {
        action: "approve",
      });
      console.log("Approve User Response:", response.data);

      return {
        success: true,
        message: response.data.message || "User approved successfully",
        user_id: response.data.user_id,
        is_active: response.data.is_active,
      };
    } catch (error) {
      console.error("Approve user error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        userId: userId,
      });

      if (error.response?.status === 403) {
        throw {
          error: "You don't have permission to approve users.",
          status: 403,
        };
      }

      if (error.response?.status === 404) {
        throw {
          error: "User not found or already processed.",
          status: 404,
        };
      }

      if (error.response?.status === 400) {
        const backendError = error.response?.data;
        throw {
          error: backendError?.error || "Invalid approval request.",
          status: 400,
        };
      }

      throw new Error(error.message || "Failed to approve user");
    }
  },

  // Reject user (admin only)
  rejectUser: async (userId) => {
    try {
      console.log("Rejecting user:", userId);

      const response = await axiosInstance.patch(`/auth/approve/${userId}/`, {
        action: "reject",
      });
      console.log("Reject User Response:", response.data);

      return {
        success: true,
        message: response.data.message || "User rejected successfully",
      };
    } catch (error) {
      console.error("Reject user error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        userId: userId,
      });

      if (error.response?.status === 403) {
        throw {
          error: "You don't have permission to reject users.",
          status: 403,
        };
      }

      if (error.response?.status === 404) {
        throw {
          error: "User not found or already processed.",
          status: 404,
        };
      }

      if (error.response?.status === 400) {
        const backendError = error.response?.data;
        throw {
          error: backendError?.error || "Invalid rejection request.",
          status: 400,
        };
      }

      throw new Error(error.message || "Failed to reject user");
    }
  },

  // Forgot Password - Step 1: request OTP
  forgotPasswordRequestOtp: async (email) => {
    const response = await axiosInstance.post("/auth/forgot-password/request-otp/", { email });
    return response.data;
  },

  // Forgot Password - Step 2: verify OTP
  forgotPasswordVerifyOtp: async (email, otp) => {
    const response = await axiosInstance.post("/auth/forgot-password/verify-otp/", { email, otp });
    return response.data;
  },

  // Forgot Password - Step 3: reset password
  forgotPasswordReset: async (email, newPassword, confirmPassword) => {
    const response = await axiosInstance.post("/auth/forgot-password/reset/", {
      email,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return response.data;
  },

  // Link child to parent (parent only) - parents identify children by roll
  // number or email (the backend rejects raw student_ids for parents).
  linkChild: async ({ student_roll_nos = [], student_emails = [] }) => {
    try {
      const body = {};
      if (student_roll_nos.length) body.student_roll_nos = student_roll_nos;
      if (student_emails.length)   body.student_emails   = student_emails;

      const response = await axiosInstance.post("/auth/me/link-child/", body);

      return {
        success: true,
        data: response.data,
        message: response.data.message || "Link request(s) sent successfully",
      };
    } catch (error) {
      throw error?.response;
    }
  },
};
