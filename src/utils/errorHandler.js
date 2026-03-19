// Custom API Error class
export class ApiError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Check if error contains sensitive authentication information
export const isSensitiveAuthError = (error) => {
  if (!error || typeof error !== 'string') return false;
  
  const sensitivePatterns = [
    /registered as .* not .*/i,
    /account type/i,
    /role mismatch/i,
    /this account is registered as/i,
    /please use the .* login screen/i
  ];
  
  return sensitivePatterns.some(pattern => pattern.test(error));
};

// Get safe error message for authentication errors
export const getSafeAuthErrorMessage = (error) => {
  if (isSensitiveAuthError(error)) {
    return 'Invalid login credentials. Please check your email and password.';
  }
  return error;
};

// Extract meaningful error message from various error types
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return error.message;
  }
  
  // Handle axios error responses
  if (error.response) {
    const { data, status } = error.response;
    
    // Server error with message
    if (data?.message) {
      return data.message;
    }
    
    // Validation errors
    if (data?.errors) {
      const firstError = Object.values(data.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }
    
    // Status-based fallbacks
    switch (status) {
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Request failed with status ${status}`;
    }
  }
  
  // Handle network errors
  if (error.request) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your connection.';
    }
    return 'Network error. Please check your internet connection.';
  }
  
  // Handle plain error messages
  if (error.message) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
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

// Main error handler utility
export const handleApiError = (error, options = {}) => {
  const { 
    showToast = false, 
    toastFunction = null, 
    logError = true,
    context = 'API Error'
  } = options;
  
  // Log error for debugging
  if (logError) {
    console.error(`🔴 ${context}:`, error);
    
    // Log additional details for axios errors
    if (error.response) {
      console.error('Response details:', {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
  
  // Show toast notification if requested
  if (showToast && toastFunction) {
    const message = getToastErrorMessage(error);
    toastFunction(message);
  }
  
  // Return the processed error
  return {
    message: getErrorMessage(error),
    originalError: error,
    isAuthError: error.response?.status === 401,
    isNetworkError: !!error.request && !error.response,
    isServerError: error.response?.status >= 500
  };
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
