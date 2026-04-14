/**
 * Course Image Utility
 * Centralized logic for course thumbnail resolution
 * Ensures consistency between Marketplace listing and Course Details pages
 */

/**
 * Gets the appropriate image source for a course
 * Uses the same logic as Marketplace page for consistency
 * 
 * @param {Object} course - Course object
 * @param {number} index - Fallback index for courses without ID
 * @returns {string} Image URL
 */
export const getCourseImage = (course, index = 0) => {
  // If course has a thumbnail, use it
  if (course?.thumbnail) {
    return course.thumbnail;
  }
  
  // Fallback to Picsum with course-specific seed
  // This matches exactly what Marketplace.jsx uses
  return `https://picsum.photos/seed/course_${course?.id || index}/800/450`;
};

/**
 * Gets the appropriate image source for a course with different dimensions
 * Useful for different UI contexts (e.g., larger hero images)
 * 
 * @param {Object} course - Course object
 * @param {number} index - Fallback index for courses without ID
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Image URL
 */
export const getCourseImageWithDimensions = (course, index = 0, width = 800, height = 450) => {
  // If course has a thumbnail, use it
  if (course?.thumbnail) {
    return course.thumbnail;
  }
  
  // Fallback to Picsum with course-specific seed and custom dimensions
  return `https://picsum.photos/seed/course_${course?.id || index}/${width}/${height}`;
};

/**
 * Default export for backward compatibility
 */
export default getCourseImage;
