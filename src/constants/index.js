// Application Constants
export const APP_NAME = "Virtual City School";
export const APP_VERSION = "1.0.0";

// API Constants
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://virtualschool.grayphite.com/api/v1";

// Role Constants
export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
  PARENT: "parent",
};

// Route Constants
export const ROUTES = {
  PUBLIC: {
    HOME: "/",
    COURSES: "/courses",
    INSTRUCTORS: "/instructors",
    TEACHER_PROFILE: "/teacher/:id",
  },
  PROTECTED: {
    ADMIN: "/admin",
    STUDENT: "/student",
    TEACHER: "/teacher",
    PARENT: "/parent",
    CLASSROOM: "/classroom",
    FEED: "/feed",
    STUDENT_PROFILE: "/student/:id",
  },
};

// UI Constants
export const UI_CONSTANTS = {
  TOAST_POSITION: "top-center",
  DEFAULT_AVATAR: "https://i.pravatar.cc/150?u=default",
};

// Export categories from separate file
export { BACKEND_CATEGORIES, formatCategoryLabel } from "./categories";
