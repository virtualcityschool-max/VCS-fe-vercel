import { toastManager } from "./toastManager";

/**
 * Extracts a user-facing message from any API error shape.
 *
 * Priority:
 *  1. Already a string (e.g. from Redux rejectWithValue) → use as-is
 *  2. response.data.details has entries → join those messages
 *  3. response.data.error → use root error string
 *  4. error.message → plain JS Error fallback
 *  5. Generic fallback
 */
export const extractApiErrorMessage = (error) => {
  if (typeof error === "string") return error;

  // data can be from axios response or passed directly from a rejected thunk
  const data = error?.response?.data || error?.data || error;

  // 1. If data is just a string, return it
  if (typeof data === "string") return data;

  // 2. Check for nested details or just the data object itself
  const details = data?.details || data;

  if (details && typeof details === "object" && !Array.isArray(details)) {
    const messages = [];

    // Ignore meta keys that aren't user-facing errors
    const ignoredKeys = ["status", "statusText", "url", "message", "error_code", "request_id", "timestamp"];

    Object.entries(details).forEach(([key, v]) => {
      if (ignoredKeys.includes(key)) return;

      // Format the key for display (replace underscores with spaces and capitalize)
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      if (Array.isArray(v)) {
        v.forEach((m) => {
          if (typeof m === "string") {
            if (["non_field_errors", "detail", "error", "message"].includes(key)) {
              messages.push(m);
            } else {
              // Changed this line to include the key
              messages.push(`${label}: ${m}`);
            }
          }
        });
      } else if (typeof v === "string") {
        if (["non_field_errors", "detail", "error", "message"].includes(key)) {
          messages.push(v);
        } else {
          // Changed this line to include the key
          messages.push(`${label}: ${v}`);
        }
      }
    });

    if (messages.length > 0) return messages.join(" ");
  }

  // 3. Fallbacks for other structures
  if (data?.error && typeof data.error === "string") return data.error;
  if (data?.message && typeof data.message === "string") return data.message;

  return error?.message || "An unexpected error occurred";
};

/**
 * Extract the error message and show it as a toast in one call.
 *
 * Usage in any catch block:
 *   import { showApiError } from "../../utils/apiErrorHandler";
 *   ...
 *   } catch (error) {
 *     showApiError(error);
 *   }
 */
export const showApiError = (error) => {
  toastManager.error(extractApiErrorMessage(error));
};
