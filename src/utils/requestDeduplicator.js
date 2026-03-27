import React from "react";

// Request deduplication utility to prevent duplicate API calls
const pendingRequests = new Map();

// Generate request key for deduplication
const generateRequestKey = (method, url, data = null) => {
  const dataString = data ? JSON.stringify(data) : "";
  return `${method}:${url}:${dataString}`;
};

// Request deduplication utility
export const requestDeduplicator = {
  // Check if request is already pending
  isPending: (method, url, data = null) => {
    const key = generateRequestKey(method, url, data);
    return pendingRequests.has(key);
  },

  // Add request to pending queue
  addPending: (method, url, data = null, promise) => {
    const key = generateRequestKey(method, url, data);
    pendingRequests.set(key, promise);

    // Clean up after request completes (success or failure)
    promise.finally(() => {
      pendingRequests.delete(key);
    });

    return promise;
  },

  // Get existing pending request
  getPending: (method, url, data = null) => {
    const key = generateRequestKey(method, url, data);
    return pendingRequests.get(key);
  },

  // Clear all pending requests
  clear: () => {
    pendingRequests.clear();
  },
};

// Form submission guard to prevent duplicate submissions while allowing immediate retries
export const createSubmissionGuard = () => {
  let isSubmitting = false;

  return {
    isSubmitting: () => isSubmitting,

    guard: async (callback) => {
      // Only block if currently submitting, no time-based debounce
      if (isSubmitting) {
        return; // Prevent parallel duplicate submissions
      }

      isSubmitting = true;

      try {
        const result = await callback();
        return result;
      } finally {
        isSubmitting = false;
        // Allow immediate retry after success or failure
      }
    },
  };
};

// Hook for form submission guard with cleanup on unmount
export const useSubmissionGuard = () => {
  const guardRef = React.useRef(createSubmissionGuard());
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // Cleanup on unmount
      guardRef.current = createSubmissionGuard();
    };
  }, []);

  // Return wrapper that checks if component is still mounted
  return {
    isSubmitting: () => guardRef.current.isSubmitting(),

    guard: async (callback) => {
      if (!isMountedRef.current) {
        return; // Component unmounted, don't execute
      }

      return guardRef.current.guard(callback);
    },
  };
};
