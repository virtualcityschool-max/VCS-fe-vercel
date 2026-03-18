import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import authReducer, { logout } from "./slices/authSlice";

const AUTH_STORAGE_KEY = "vcs_auth_state";

// Load auth state from localStorage
const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!serializedState) {
      return undefined;
    }

    const parsedState = JSON.parse(serializedState);

    // Only restore valid auth state
    if (parsedState?.isLoggedIn && parsedState?.token) {
      return parsedState;
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
    return undefined;
  } catch (error) {
    console.error("Could not load auth state:", error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return undefined;
  }
};

// Save only the required auth fields
const saveAuthState = (authState) => {
  try {
    if (authState?.isLoggedIn && authState?.token) {
      const persistedAuth = {
        isLoggedIn: authState.isLoggedIn,
        role: authState.role,
        username: authState.username,
        token: authState.token,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(persistedAuth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
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
  },
  preloadedState: preloadedAuthState ? { auth: preloadedAuthState } : undefined,
});

// Persist auth state on every Redux update
store.subscribe(() => {
  const { auth } = store.getState();
  saveAuthState(auth);
});

// Sync logout across tabs
window.addEventListener("storage", (e) => {
  if (e.key === AUTH_STORAGE_KEY) {
    const currentAuth = store.getState().auth;

    // If auth was removed in another tab, log out here too
    if (!e.newValue && currentAuth.isLoggedIn) {
      store.dispatch(logout());
    }
  }
});

export default store;
