import { getStorageUrl } from "./storageUrl";

export const getCourseImage = (course, _index = 0) => {
  if (course?.thumbnail) {
    return getStorageUrl(course.thumbnail);
  }
  return ``;
};

export const getCourseImageWithDimensions = (course, _index = 0, _width = 800, _height = 450) => {
  if (course?.thumbnail) {
    return getStorageUrl(course.thumbnail);
  }
  return ``;
};

export const handleDownload = async (url, customFilename) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  
  // Use custom name, or pull from URL, or fallback to 'file'
  const finalName = customFilename || url.split('/').pop().split('?')[0] || 'file';

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = finalName; 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
};
export default getCourseImage;
