// Backend CATEGORY_CHOICES - must match exactly with backend
export const BACKEND_CATEGORIES = [
  "tech",
  "test_prep", 
  "arts",
  "stem",
  "languages",
  "humanities",
];

// Format category label for display
export const formatCategoryLabel = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
};
