import { useState, useCallback } from "react";
import { normalizeApiError } from "../utils/errorHandler";

/**
 * Hook for handling form field errors with backend validation support
 * @param {Object} initialErrors - Initial error state object
 * @returns {Array} - [errors, setErrors, handleApiError, clearFieldErrors, clearAllErrors]
 */
export const useFieldErrors = (initialErrors = {}) => {
  const [errors, setErrors] = useState(initialErrors);
  const [formError, setFormError] = useState(null);

  /**
   * Handle API errors and map them to form fields
   * @param {Error} error - The error object from API call
   * @param {Function} toastFunction - Optional toast function for non-field errors
   * @returns {Object} - Normalized error with type, message, fieldErrors, shouldShowToast
   */
  const handleApiError = useCallback((error, toastFunction = null) => {
    const normalizedError = normalizeApiError(error);

    // Log full error for debugging
    console.error("API Error:", {
      normalized: normalizedError,
      original: error,
    });

    // Handle field-level errors
    if (normalizedError.type === "field" && normalizedError.fieldErrors) {
      setErrors(normalizedError.fieldErrors);

      // Show toast for field errors if toast function provided and shouldShowToast is true
      if (toastFunction && normalizedError.shouldShowToast) {
        toastFunction(normalizedError.message);
      }

      return normalizedError;
    }

    // Handle form-level errors (non_field_errors)
    if (normalizedError.type === "form") {
      setFormError(normalizedError.message);

      // Show toast for form errors if toast function provided and shouldShowToast is true
      if (toastFunction && normalizedError.shouldShowToast) {
        toastFunction(normalizedError.message);
      }

      return normalizedError;
    }

    // Handle general errors
    if (normalizedError.type === "general") {
      // Show toast for general errors if toast function provided
      if (toastFunction && normalizedError.shouldShowToast) {
        toastFunction(normalizedError.message);
      }

      return normalizedError;
    }

    return normalizedError;
  }, []);

  /**
   * Clear error for a specific field
   * @param {string} fieldName - Name of the field to clear error for
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Clear multiple field errors
   * @param {string[]} fieldNames - Array of field names to clear errors for
   */
  const clearFieldErrors = useCallback((fieldNames) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      fieldNames.forEach((fieldName) => {
        delete newErrors[fieldName];
      });
      return newErrors;
    });
  }, []);

  /**
   * Clear all field errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
    setFormError(null);
  }, []);

  /**
   * Get error message for a specific field
   * @param {string} fieldName - Name of the field
   * @returns {string|null} - Error message or null if no error
   */
  const getFieldError = useCallback(
    (fieldName) => {
      const fieldErrors = errors[fieldName];
      if (!fieldErrors) return null;

      // Return first error if array, otherwise return the error string
      return Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
    },
    [errors],
  );

  /**
   * Get all error messages for a specific field
   * @param {string} fieldName - Name of the field
   * @returns {string[]} - Array of error messages
   */
  const getFieldErrors = useCallback(
    (fieldName) => {
      const fieldErrors = errors[fieldName];
      if (!fieldErrors) return [];

      // Return array if already array, otherwise wrap in array
      return Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
    },
    [errors],
  );

  /**
   * Check if a field has an error
   * @param {string} fieldName - Name of the field
   * @returns {boolean} - Whether the field has an error
   */
  const hasFieldError = useCallback(
    (fieldName) => {
      return !!errors[fieldName];
    },
    [errors],
  );

  /**
   * Check if any field has errors
   * @returns {boolean} - Whether any field has errors
   */
  const hasAnyErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    errors,
    formError,
    setErrors,
    handleApiError,
    clearFieldError,
    clearFieldErrors,
    clearAllErrors,
    getFieldError,
    getFieldErrors,
    hasFieldError,
    hasAnyErrors,
  };
};
