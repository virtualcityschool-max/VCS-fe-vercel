const BASE = (import.meta.env.VITE_STORAGE_BASE_URL || "").replace(/\/$/, "");

export const getStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return BASE + "/" + path.replace(/^\//, "");
};

export const handleFileDownload = async (url, customFileName) => {
  if (!url) return;
  try {
    const fullUrl = getStorageUrl(url);
    const fileName = customFileName || getFileNameFromUrl(url);

    // If it's a data URL or blob URL, download directly
    if (fullUrl.startsWith("data:") || fullUrl.startsWith("blob:")) {
      const link = document.createElement("a");
      link.href = fullUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Attempt blob fetch to force download prompt
    try {
      const response = await fetch(fullUrl, { mode: "cors" });
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        return;
      }
    } catch {
      // CORS or network failure fallback
    }

    // Direct browser navigation/download fallback
    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Download failed:", error);
    window.open(getStorageUrl(url), "_blank");
  }
};

export const getFileNameFromUrl = (url) => {
  if (!url) return "resource-file";
  try {
    const fullUrl = getStorageUrl(url);
    if (fullUrl.startsWith("data:")) {
      return "downloaded-file";
    }
    const urlObj = new URL(fullUrl, window.location.origin);
    const pathname = urlObj.pathname;
    const rawName = pathname.split("/").pop();
    const fileName = decodeURIComponent(rawName);
    return fileName || "downloaded-file";
  } catch {
    const parts = String(url).split("?")[0].split("/");
    return decodeURIComponent(parts.pop()) || "downloaded-file";
  }
};
