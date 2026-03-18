import axios from "axios";
import { authStorage } from "./authStorage";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://virtualschool.grayphite.com/api/v1";

console.log("🔧 Axios Instance Base URL:", baseURL);
console.log(
  "🔧 Environment VITE_API_BASE_URL:",
  import.meta.env.VITE_API_BASE_URL,
);

const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor for authentication and debugging
axiosInstance.interceptors.request.use(
  (config) => {
    // Add Authorization header if token exists
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Only log data for non-sensitive endpoints
      data:
        config.url?.includes("register") || config.url?.includes("login")
          ? "[SENSITIVE_DATA_HIDDEN]"
          : config.data,
    });
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for debugging
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
  (error) => {
    console.error("❌ Response Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
      // Add full error details for 500 errors
      fullError: error.response?.status === 500 ? error.response : undefined,
    });
    return Promise.reject(error);
  },
);

export default axiosInstance;
