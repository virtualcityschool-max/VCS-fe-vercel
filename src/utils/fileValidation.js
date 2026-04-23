import { toastManager } from "./toastManager";

export const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".zip"];
export const MAX_FILE_SIZE_MB = 10;

/**
 * Validates a File object against allowed extensions and max size.
 * Shows a toast and returns false if invalid, true if valid.
 */
export const validateFile = (file) => {
  if (!file) return false;

  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    toastManager.error(
      `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`
    );
    return false;
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    toastManager.error(`File must be less than ${MAX_FILE_SIZE_MB}MB`);
    return false;
  }

  return true;
};

export const ACCEPT_STRING = ALLOWED_EXTENSIONS.join(",");
