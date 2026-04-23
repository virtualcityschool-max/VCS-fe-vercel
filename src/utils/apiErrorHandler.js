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

  const data = error?.response?.data;

  if (data?.details && typeof data.details === "object") {
    const messages = [];
    Object.values(data.details).forEach((v) => {
      if (Array.isArray(v)) {
        v.forEach((m) => { if (typeof m === "string") messages.push(m); });
      } else if (typeof v === "string") {
        messages.push(v);
      }
    });
    if (messages.length > 0) return messages.join(" ");
  }

  if (data?.error) return data.error;

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
