import axios from "axios";
import { API_BASE_URL } from "../constants";
import { authStorage } from "./authStorage";

const baseURL = API_BASE_URL;

console.log("🔧 Axios Instance Base URL:", baseURL);
console.log("🔧 Environment API_BASE_URL:", API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Track ongoing refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add request interceptor for authentication and debugging
axiosInstance.interceptors.request.use(
  (config) => {
    // Add Authorization header if token exists
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Enhanced debugging for auth endpoints
    if (config.url?.includes("auth/me")) {
      console.log("🔍 AUTH DEBUG - Request to /auth/me:", {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
        authorizationHeader: config.headers.Authorization
          ? "[SET]"
          : "[NOT_SET]",
        fullURL: `${config.baseURL}${config.url}`,
      });
    }

    console.log("🚀 Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization
          ? "[TOKEN_HIDDEN]"
          : undefined,
      },
    });
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for debugging and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error("❌ Response Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
      // Add full error details for 500 errors
      fullError: error.response?.status === 500 ? error.response : undefined,
    });

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("vcs_refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axiosInstance.post("/auth/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        authStorage.setAccessToken(newAccessToken);

        // Dispatch token update event instead of direct store access
        window.dispatchEvent(
          new CustomEvent("token-refreshed", {
            detail: { token: newAccessToken },
          }),
        );

        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed, clear auth and redirect to login
        authStorage.clearAuthStorage();
        localStorage.removeItem("vcs_refresh_token");

        // Dispatch session expired event
        window.dispatchEvent(
          new CustomEvent("auth-expired", {
            detail: {
              message: "Your session has expired. Please log in again.",
            },
          }),
        );

        // Dispatch logout event
        window.dispatchEvent(new CustomEvent("auth-logout"));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
