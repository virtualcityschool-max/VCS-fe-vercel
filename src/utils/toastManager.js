import React from "react";
import { toast } from "react-toastify";

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
      autoClose: options.duration || 4000,
      position: options.position || "top-right",
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
      autoClose: options.duration || 6000,
      position: options.position || "top-right",
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

  // For outcomes that succeeded but leave the admin something to act on, the
  // classic being "access is off but Gumroad is still billing them".
  warning: (message, options = {}) => {
    const key = generateToastKey("warning", message);

    if (toastDeduplicationMap.has(key)) {
      return;
    }

    const toastId = toast.warning(message, {
      autoClose: options.duration || 8000,
      position: options.position || "top-right",
      ...options,
    });

    toastDeduplicationMap.set(key, {
      id: toastId,
      timestamp: Date.now(),
    });

    const cleanupTimeout = setTimeout(() => {
      toastDeduplicationMap.delete(key);
    }, 9000);

    toastDeduplicationMap.get(key).cleanupTimeout = cleanupTimeout;

    return toastId;
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: options.position || "top-right",
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

  // Cleanup all timeouts (useful for component unmount)
  cleanupAllTimeouts: () => {
    toastDeduplicationMap.forEach((entry) => {
      if (entry.cleanupTimeout) {
        clearTimeout(entry.cleanupTimeout);
      }
    });
  },
};

// Utility to dismiss all toasts when unmounting components
export const useToastCleanup = () => {
  React.useEffect(() => {
    return () => {
      toastManager.cleanupAllTimeouts();
      toastManager.clear();
    };
  }, []);
};
