// Custom API Error class
export class ApiError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Check if error contains sensitive authentication information
export const isSensitiveAuthError = (error) => {
  if (!error || typeof error !== "string") return false;

  const sensitivePatterns = [
    /registered as .* not .*/i,
    /account type/i,
    /role mismatch/i,
    /this account is registered as/i,
    /please use the .* login screen/i,
  ];

  return sensitivePatterns.some((pattern) => pattern.test(error));
};

// Get safe error message for authentication errors
export const getSafeAuthErrorMessage = (error) => {
  if (isSensitiveAuthError(error)) {
    return "Invalid login credentials. Please check your email and password.";
  }
  return error;
};

// Extract meaningful error message from various error types
export const getErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";

  // Handle ApiError instances
  if (error instanceof ApiError) {
    return error.message;
  }

  // Handle axios error responses
  if (error.response) {
    const { data, status } = error.response;

    // Backend validation errors with details (e.g., {error: "Validation failed", details: {status: ["message"]}})
    if (data?.error && data?.details) {
      // Extract detailed validation messages
      const detailMessages = [];
      Object.values(data.details).forEach((messages) => {
        if (Array.isArray(messages)) {
          detailMessages.push(...messages);
        } else if (typeof messages === "string") {
          detailMessages.push(messages);
        }
      });

      if (detailMessages.length > 0) {
        return detailMessages.join("; ");
      }

      // Fallback to main error message if no details found
      return data.error;
    }

    // Server error with message
    if (data?.message) {
      return data.message;
    }

    // Simple error field
    if (data?.error) {
      return data.error;
    }

    // Validation errors
    if (data?.errors) {
      const firstError = Object.values(data.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }

    // Status-based fallbacks
    switch (status) {
      case 401:
        return "Authentication required. Please log in.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      default:
        // For backend validation errors, try to extract more meaningful message
        if (data?.error && data?.details) {
          return data.error;
        }
        return `Request failed with status ${status}`;
    }
  }

  // Handle network errors
  if (error.request) {
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please check your connection.";
    }
    return "Network error. Please check your internet connection.";
  }

  // Handle plain error messages
  if (error.message) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
};

// Get error message specifically for toast notifications
export const getToastErrorMessage = (error) => {
  const message = getErrorMessage(error);

  // Filter sensitive authentication errors
  if (isSensitiveAuthError(message)) {
    return getSafeAuthErrorMessage(message);
  }

  return message;
};

// Check if a backend message is meaningful enough to show to user
const isMeaningfulBackendMessage = (message) => {
  if (!message || typeof message !== "string") {
    return false;
  }

  // Messages that are NOT meaningful (generic wrappers)
  const genericPatterns = [
    "validation failed",
    "bad request",
    "request failed",
    "invalid request",
    "an error occurred",
    "something went wrong",
    "server error",
    "network error",
    "timeout",
    "<!DOCTYPE",
    "status code",
    "null",
    "undefined",
  ];

  const lowerMessage = message.toLowerCase().trim();

  // Check if message contains generic patterns
  for (const pattern of genericPatterns) {
    if (lowerMessage.includes(pattern)) {
      return false;
    }
  }

  // Check if message is too short to be meaningful
  if (lowerMessage.length < 10) {
    return false;
  }

  // Check if message contains meaningful content indicators
  const meaningfulIndicators = [
    "already exists",
    "invalid email",
    "invalid password",
    "incorrect password",
    "email already",
    "password must",
    "email must",
    "cannot publish",
    "without instructor",
    "enter a valid",
    "field is required",
    "is required",
    "too short",
    "too long",
    "mismatch",
    "expired",
    "not found",
    "unauthorized",
    "forbidden",
    "permission denied",
  ];

  // If message contains any meaningful indicator, it's meaningful
  for (const indicator of meaningfulIndicators) {
    if (lowerMessage.includes(indicator)) {
      return true;
    }
  }

  // If message is longer than 20 chars and doesn't contain generic patterns,
  // it's likely meaningful
  if (lowerMessage.length > 20) {
    return true;
  }

  return false;
};

// Enhanced API error normalization with comprehensive status code handling
export const normalizeApiError = (error) => {
  // Handle different error types
  if (!error) {
    return {
      type: "general",
      message: "An unknown error occurred",
      fieldErrors: null,
      shouldShowToast: true,
    };
  }

  // Check for offline/network issues
  if (!navigator.onLine) {
    return {
      type: "general",
      message:
        "You appear to be offline. Please check your internet connection.",
      fieldErrors: null,
      shouldShowToast: true,
    };
  }

  // Network/Connection errors
  if (!error.response && error.request) {
    return {
      type: "general",
      message:
        "Network error. Please check your internet connection and try again.",
      fieldErrors: null,
      shouldShowToast: true,
    };
  }

  // Request timeout
  if (error.code === "ECONNABORTED") {
    return {
      type: "general",
      message: "Request timeout. Please check your connection and try again.",
      fieldErrors: null,
      shouldShowToast: true,
    };
  }

  // Request setup errors
  if (!error.request && !error.response) {
    return {
      type: "general",
      message: "Failed to send request. Please try again.",
      fieldErrors: null,
      shouldShowToast: true,
    };
  }

  // HTTP Response errors
  const { status, data } = error.response || {};

  // Status code specific handling
  switch (status) {
    case 400:
      return handleBadRequestError(data);
    case 401:
      return {
        type: "form",
        message: "Your session has expired. Please log in again.",
        fieldErrors: null,
        shouldShowToast: false, // Let auth system handle this
      };
    case 403:
      return {
        type: "form",
        message: "You don't have permission to perform this action.",
        fieldErrors: null,
        shouldShowToast: true,
      };
    case 404:
      return {
        type: "general",
        message: "The requested resource was not found.",
        fieldErrors: null,
        shouldShowToast: true,
      };
    case 409:
      return handleConflictError(data);
    case 422:
      return handleValidationError(data);
    case 429:
      return {
        type: "general",
        message: "Too many requests. Please wait a moment and try again.",
        fieldErrors: null,
        shouldShowToast: true,
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: "general",
        message: "Server error. Please try again later.",
        fieldErrors: null,
        shouldShowToast: true,
      };
    default:
      return handleGenericError(data, status);
  }
};

// Handle 400 Bad Request errors
const handleBadRequestError = (data) => {
  // PRIORITY 1: Check for field validation errors with details structure
  if (data?.details && typeof data.details === "object") {
    // Check for non_field_errors first - these should be form-level errors
    if (data.details.non_field_errors) {
      const nonFieldErrors = Array.isArray(data.details.non_field_errors)
        ? data.details.non_field_errors
        : [data.details.non_field_errors];

      return {
        type: "form",
        message: nonFieldErrors[0], // Show first non_field_error as the main message
        fieldErrors: null,
        shouldShowToast: false, // No toast for non_field_errors
      };
    }

    // Check for field-specific errors
    const fieldErrorKeys = Object.keys(data.details).filter(
      (key) => key !== "non_field_errors",
    );
    if (fieldErrorKeys.length > 0) {
      return {
        type: "field",
        message: "Please correct the highlighted fields",
        fieldErrors: normalizeFieldErrors(data.details),
        shouldShowToast: false, // No toast for field validation errors
      };
    }
  }

  // PRIORITY 2: Check if backend already provided a meaningful, user-safe message
  const backendMessage = data?.error || data?.message;
  if (backendMessage && isMeaningfulBackendMessage(backendMessage)) {
    // Determine if this should be field or form error based on content
    if (
      backendMessage.includes("already exists") &&
      backendMessage.includes("email")
    ) {
      return {
        type: "field",
        message: backendMessage, // Preserve full backend message
        fieldErrors: { email: [backendMessage] },
        shouldShowToast: false,
      };
    }

    // Other meaningful messages are form-level
    return {
      type: "form",
      message: backendMessage, // Preserve full backend message
      fieldErrors: null,
      shouldShowToast: false, // No toast for form-level errors
    };
  }

  // PRIORITY 3: Check for specific patterns that need special handling
  // Check for duplicate email (fallback if pattern matching failed above)
  if (
    data?.error?.includes("already exists") ||
    data?.email?.includes("already exists")
  ) {
    return {
      type: "field",
      message: "An account with this email already exists",
      fieldErrors: { email: ["An account with this email already exists"] },
      shouldShowToast: false,
    };
  }

  // PRIORITY 4: Check for other validation errors
  if (data?.error?.includes("Validation failed")) {
    return handleValidationError(data);
  }

  // PRIORITY 5: Final check for field errors that might have been missed
  if (data?.details && typeof data.details === "object") {
    const fieldErrorKeys = Object.keys(data.details).filter(
      (key) => key !== "non_field_errors",
    );
    if (fieldErrorKeys.length > 0) {
      console.log("🔍 Final fallback - found field errors:", data.details);
      return {
        type: "field",
        message: "Please correct the highlighted fields",
        fieldErrors: normalizeFieldErrors(data.details),
        shouldShowToast: false,
      };
    }
  }

  // PRIORITY 6: Generic fallback (only when no meaningful message exists)
  return {
    type: "general",
    message: "Invalid request. Please check your input and try again.",
    fieldErrors: null,
    shouldShowToast: true,
  };
};

// Handle 409 Conflict errors
const handleConflictError = (data) => {
  if (data?.error?.includes("already exists")) {
    return {
      type: "form",
      message: "This resource already exists. Please check your input.",
      fieldErrors: null,
      shouldShowToast: true,
    };
  }

  return {
    type: "form",
    message: "A conflict occurred. Please refresh and try again.",
    fieldErrors: null,
    shouldShowToast: true,
  };
};

// Handle 422 Validation errors
const handleValidationError = (data) => {
  // Extract field-specific errors
  if (data?.details && typeof data.details === "object") {
    return {
      type: "field",
      message: "Please correct the highlighted fields",
      fieldErrors: normalizeFieldErrors(data.details),
      shouldShowToast: false, // No toast for field validation errors
    };
  }

  // Handle specific field errors
  if (data?.email) {
    return {
      type: "field",
      message: Array.isArray(data.email) ? data.email[0] : data.email,
      fieldErrors: {
        email: Array.isArray(data.email) ? data.email : [data.email],
      },
      shouldShowToast: false, // No toast for field validation errors
    };
  }

  if (data?.password) {
    return {
      type: "field",
      message: Array.isArray(data.password) ? data.password[0] : data.password,
      fieldErrors: {
        password: Array.isArray(data.password)
          ? data.password
          : [data.password],
      },
      shouldShowToast: false, // No toast for field validation errors
    };
  }

  if (data?.username) {
    return {
      type: "field",
      message: Array.isArray(data.username) ? data.username[0] : data.username,
      fieldErrors: {
        username: Array.isArray(data.username)
          ? data.username
          : [data.username],
      },
      shouldShowToast: false, // No toast for field validation errors
    };
  }

  // Generic validation error - preserve backend message if meaningful
  return {
    type: "form",
    message:
      data?.error ||
      data?.message ||
      "Validation failed. Please check your input.",
    fieldErrors: null,
    shouldShowToast: true,
  };
};

// Handle generic errors
const handleGenericError = (data, status) => {
  // Try to extract meaningful message from backend
  if (
    data?.message &&
    typeof data.message === "string" &&
    !data.message.includes("<!DOCTYPE")
  ) {
    return {
      type: "general",
      message: data.message,
      fieldErrors: null,
      shouldShowToast: true,
    };
  }

  if (
    data?.error &&
    typeof data.error === "string" &&
    !data.error.includes("<!DOCTYPE")
  ) {
    return {
      type: "general",
      message: data.error,
      fieldErrors: null,
      shouldShowToast: true,
    };
  }

  // Fallback generic message
  return {
    type: "general",
    message:
      data?.error ||
      data?.message ||
      `Request failed${status ? ` with status ${status}` : ""}. Please try again.`,
    fieldErrors: null,
    shouldShowToast: true,
  };
};

// Normalize field errors from backend response
export const normalizeFieldErrors = (details) => {
  if (!details || typeof details !== "object") {
    return null;
  }

  const fieldErrors = {};
  Object.entries(details).forEach(([field, messages]) => {
    // Handle both string and array formats
    if (Array.isArray(messages)) {
      fieldErrors[field] = messages.filter((msg) => typeof msg === "string");
    } else if (typeof messages === "string") {
      fieldErrors[field] = [messages];
    }
    // Ignore non-string messages
  });

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
};

// Get user-friendly message for toast notifications
export const getUserFriendlyMessage = (error) => {
  const normalized = normalizeApiError(error);
  return normalized.message;
};

// Check if error should show toast
export const shouldShowToast = (error) => {
  const normalized = normalizeApiError(error);
  return normalized.shouldShowToast;
};

// Enhanced main error handler utility
export const handleApiError = (error, options = {}) => {
  const {
    showToast = false,
    toastFunction = null,
    logError = true,
    context = "API Error",
  } = options;

  // Normalize the error
  const normalizedError = normalizeApiError(error);

  // Log error for debugging
  if (logError) {
    console.error(`🔴 ${context}:`, {
      normalized: normalizedError,
      original: error,
    });
  }

  // Show toast notification if requested
  if (showToast && toastFunction && normalizedError.shouldShowToast) {
    toastFunction(normalizedError.message);
  }

  // Return the processed error (serializable only)
  return normalizedError;
};

// Common error handler for async operations
export const withErrorHandling = async (asyncFn, options = {}) => {
  try {
    return await asyncFn();
  } catch (error) {
    const processedError = handleApiError(error, options);
    throw processedError;
  }
};
