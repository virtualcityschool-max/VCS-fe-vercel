const BASE = (import.meta.env.VITE_STORAGE_BASE_URL || "").replace(/\/$/, "");

export const getStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return BASE + "/" + path.replace(/^\//, "");
};
