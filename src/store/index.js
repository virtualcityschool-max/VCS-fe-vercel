import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import authReducer, { logout } from "./slices/authSlice";
import studentDashboardReducer from "./slices/studentDashboardSlice";
import adminReducer from "./slices/adminSlice";
import coursesReducer from "./slices/coursesSlice";
import approvalsReducer from "./slices/approvalsSlice";
import teachersReducer from "./slices/teacherSlice";
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

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    studentDashboard: studentDashboardReducer,
    admin: adminReducer,
    courses: coursesReducer,
    approvals: approvalsReducer,
    teachers: teachersReducer,
  },
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
