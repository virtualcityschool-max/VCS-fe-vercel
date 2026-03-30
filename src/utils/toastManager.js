import React from "react";
import toast from "react-hot-toast";

// Toast deduplication map to prevent duplicate notifications
const toastDeduplicationMap = new Map();

// Generate deduplication key for toast notifications
const generateToastKey = (type, message) => {
  return `${type}:${message}`;
};

// Centralized toast manager with deduplication
export const toastManager = {
  success: (message, options = {}) => {
    const key = generateToastKey("success", message);

    // Check if this toast was recently shown
    if (toastDeduplicationMap.has(key)) {
      return;
    }

    // Show toast and store in deduplication map
    const toastId = toast.success(message, {
      duration: options.duration || 4000,
      position: options.position || "top-center",
      ...options,
    });

    // Store in deduplication map with timestamp
    toastDeduplicationMap.set(key, {
      id: toastId,
      timestamp: Date.now(),
    });

    // Clean up old entries after 5 seconds
    const cleanupTimeout = setTimeout(() => {
      toastDeduplicationMap.delete(key);
    }, 5000);

    // Store cleanup timeout for potential early cleanup
    toastDeduplicationMap.get(key).cleanupTimeout = cleanupTimeout;

    return toastId;
  },

  error: (message, options = {}) => {
    const key = generateToastKey("error", message);

    // Check if this toast was recently shown
    if (toastDeduplicationMap.has(key)) {
      return;
    }

    // Show toast and store in deduplication map
    const toastId = toast.error(message, {
      duration: options.duration || 6000,
      position: options.position || "top-center",
      ...options,
    });

    // Store in deduplication map with timestamp
    toastDeduplicationMap.set(key, {
      id: toastId,
      timestamp: Date.now(),
    });

    // Clean up old entries after 7 seconds
    const cleanupTimeout = setTimeout(() => {
      toastDeduplicationMap.delete(key);
    }, 7000);

    // Store cleanup timeout for potential early cleanup
    toastDeduplicationMap.get(key).cleanupTimeout = cleanupTimeout;

    return toastId;
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: options.position || "top-center",
      ...options,
    });
  },

  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
  },

  // Clear all toasts and reset deduplication map
  clear: () => {
    toast.dismiss();
    // Clear all cleanup timeouts
    toastDeduplicationMap.forEach((entry) => {
      if (entry.cleanupTimeout) {
        clearTimeout(entry.cleanupTimeout);
      }
    });
    toastDeduplicationMap.clear();
  },
};

// Utility to dismiss all toasts when unmounting components
export const useToastCleanup = () => {
  React.useEffect(() => {
    return () => {
      toastManager.clear();
    };
  }, []);
};
