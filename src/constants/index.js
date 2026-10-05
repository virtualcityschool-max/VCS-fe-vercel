// Application Constants
export const APP_NAME = "Virtual City School";
export const APP_VERSION = "1.0.0";

// API Constants
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://vcs-be-supabase.vercel.app/api/v1";

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "953842157843-0mifojo7s7nbsq8fhl9e4bo594g9p55h.apps.googleusercontent.com";

// Google Sign-In needs the /auth/google/ endpoints, which only the new
// Supabase backend has. Keep it off until the backend cutover.
export const GOOGLE_AUTH_ENABLED =
  import.meta.env.VITE_ENABLE_GOOGLE_AUTH === "true";


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
    TEACHERS: "/teachers",
    TEACHER_PROFILE: "/teachers/:id",
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
