import { getStorageUrl } from "./storageUrl";

export const getCourseImage = (course, index = 0) => {
  if (course?.thumbnail) {
    return getStorageUrl(course.thumbnail);
  }
  return ``;
};

export const getCourseImageWithDimensions = (course, index = 0, width = 800, height = 450) => {
  if (course?.thumbnail) {
    return getStorageUrl(course.thumbnail);
  }
  return ``;
};

export default getCourseImage;
