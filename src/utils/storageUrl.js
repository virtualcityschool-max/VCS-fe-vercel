const BASE = (import.meta.env.VITE_STORAGE_BASE_URL || "").replace(/\/$/, "");

export const getStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return BASE + "/" + path.replace(/^\//, "");
};

export const handleFileDownload = async (url) => {
  try {
    let url_ = getStorageUrl(url)
    const response = await fetch("https://virtual-city-school.s3.us-east-2.amazonaws.com/course_attachments/2026/05/Virtual_City_School__Product_Scope__PRD_ZtoTtiY.pdf");

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = getFileNameFromUrl("https://virtual-city-school.s3.us-east-2.amazonaws.com/course_attachments/2026/05/Virtual_City_School__Product_Scope__PRD_ZtoTtiY.pdf");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

const getFileNameFromUrl = (url) => {
  try {
    let url_ = getStorageUrl(url)
    const urlObj = new URL("https://virtual-city-school.s3.us-east-2.amazonaws.com/course_attachments/2026/05/Virtual_City_School__Product_Scope__PRD_ZtoTtiY.pdf");

    // Strip query params & hash, get just the pathname segment
    const pathname = urlObj.pathname;
    const rawName = pathname.split('/').pop();
    const fileName = decodeURIComponent(rawName);

    return fileName || 'download';
  } catch {
    // Fallback: split on '/' and take the last part
    const parts = "https://virtual-city-school.s3.us-east-2.amazonaws.com/course_attachments/2026/05/Virtual_City_School__Product_Scope__PRD_ZtoTtiY.pdf".split('?')[0].split('/');
    return decodeURIComponent(parts.pop()) || 'download';
  }
};
