import { configureStore, combineSlices } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import authReducer, { logout } from "./slices/authSlice";
import studentDashboardReducer from "./slices/studentDashboardSlice";
import coursesReducer from "./slices/coursesSlice";
import blogsReducer from "./slices/blogsSlice";
import teachersReducer from "./slices/teacherSlice";
import announcementsReducer from "./slices/announcementsSlice";
import platformSettingsReducer from "./slices/platformSettingsSlice";
import freeAccessReducer from "./slices/freeAccessSlice";
import referralReducer from "./slices/referralSlice";
import testimonialsReducer from "./slices/testimonialsSlice";
import { authStorage } from "../utils/authStorage";

// Load auth state from localStorage using authStorage utilities
const loadAuthState = () => {
  try {
    const authState = authStorage.getAuthState();

    // Only restore valid auth state
    if (authState?.isLoggedIn && authState?.token) {
      console.log(
        "🔄 Store: Bootstrapping auth state from localStorage:",
        authState,
      );
      return authState;
    }

    console.log("🔄 Store: No valid auth state found in localStorage");
    return undefined;
  } catch (error) {
    console.error("Could not load auth state:", error);
    authStorage.clearAuthStorage();
    return undefined;
  }
};

// Save auth state using authStorage utilities
const saveAuthState = (authState) => {
  try {
    if (authState?.isLoggedIn && authState?.token) {
      const user = {
        username: authState.username,
        email: authState.user?.email,
        role: authState.role,
        timezone: authState.user?.timezone || authState.profile?.timezone || null,
      };

      authStorage.setAuthState(authState.token, user);
      console.log("💾 Store: Saved auth state to localStorage");
    } else {
      authStorage.clearAuthStorage();
      console.log("💾 Store: Cleared auth state from localStorage");
    }
  } catch (error) {
    console.error("Could not save auth state:", error);
  }
};

const preloadedAuthState = loadAuthState();

// Slices used by every visitor. The admin, parent, approvals, child-links and
// hire slices are only needed inside the admin/parent/teacher areas: they add
// themselves (injectReducer below) when that area's code loads, so public
// visitors don't download them.
const appReducer = combineSlices({
  ui: uiReducer,
  auth: authReducer,
  studentDashboard: studentDashboardReducer,
  courses: coursesReducer,
  blogs: blogsReducer,
  teachers: teachersReducer,
  announcements: announcementsReducer,
  platformSettings: platformSettingsReducer,
  freeAccess: freeAccessReducer,
  referrals: referralReducer,
  testimonials: testimonialsReducer,
}).withLazyLoadedSlices();

// Reset all slices to their initial state when the user logs out
const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: preloadedAuthState ? { auth: preloadedAuthState } : undefined,
});

// Add a slice when its area's code loads. The no-op action gives the new slice
// its initial state straight away, so components can read it on first render.
export const injectReducer = (reducerPath, reducer) => {
  appReducer.inject({ reducerPath, reducer });
  store.dispatch({ type: `@@vcs/inject/${reducerPath}` });
};

// Persist auth state on every Redux update
store.subscribe(() => {
  const { auth } = store.getState();
  saveAuthState(auth);
});

// Sync logout across tabs using authStorage
window.addEventListener("storage", (e) => {
  const currentAuth = store.getState().auth;

  // Check if token was removed in another tab
  if (e.key === "vcs_access_token" && !e.newValue && currentAuth.isLoggedIn) {
    console.log("🔄 Store: Token removed in another tab, logging out...");
    store.dispatch(logout());
  }
});

export default store;
