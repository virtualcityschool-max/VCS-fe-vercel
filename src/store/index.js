import { configureStore, combineReducers } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import authReducer, { logout } from "./slices/authSlice";
import studentDashboardReducer from "./slices/studentDashboardSlice";
import adminReducer from "./slices/adminSlice";
import coursesReducer from "./slices/coursesSlice";
import blogsReducer from "./slices/blogsSlice";
import approvalsReducer from "./slices/approvalsSlice";
import teachersReducer from "./slices/teacherSlice";
import announcementsReducer from "./slices/announcementsSlice";
import parentReducer from "./slices/parentSlice";
import childLinksReducer from "./slices/childLinksSlice";
import hireReducer from "./slices/hireSlice";
import platformSettingsReducer from "./slices/platformSettingsSlice";
import freeAccessReducer from "./slices/freeAccessSlice";
import referralReducer from "./slices/referralSlice";
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

const appReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  studentDashboard: studentDashboardReducer,
  admin: adminReducer,
  courses: coursesReducer,
  blogs: blogsReducer,
  approvals: approvalsReducer,
  teachers: teachersReducer,
  announcements: announcementsReducer,
  parent: parentReducer,
  childLinks: childLinksReducer,
  hire: hireReducer,
  platformSettings: platformSettingsReducer,
  freeAccess: freeAccessReducer,
  referrals: referralReducer,
});

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
