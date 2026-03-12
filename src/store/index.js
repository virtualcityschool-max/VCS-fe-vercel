import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";

// Function to load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("vcs_auth_state");
    if (serializedState === null) {
      return undefined; // If nothing is saved, let Redux use its initialState
    }
    const parsedState = JSON.parse(serializedState);
    
    // Validate token exists - if no token, treat as logged out
    if (parsedState && parsedState.token) {
      return parsedState;
    } else {
      // Clear invalid state and return undefined to trigger logout
      localStorage.removeItem("vcs_auth_state");
      return undefined;
    }
  } catch (error) {
    console.error("Could not load state", error);
    localStorage.removeItem("vcs_auth_state"); // Clear corrupted data
    return undefined;
  }
};

// Function to save state to localStorage
const saveState = (state) => {
  try {
    // Only save if user is logged in AND has a token
    if (state && state.isLoggedIn && state.token) {
      const serializedState = JSON.stringify(state);
      localStorage.setItem("vcs_auth_state", serializedState);
      console.log('State saved to localStorage');
    } else {
      // If user is not logged in or no token, remove from localStorage
      localStorage.removeItem("vcs_auth_state");
      console.log('State removed from localStorage - user logged out');
    }
  } catch (err) {
    console.error("Could not save state", err);
  }
};

// 1. Load the saved state from the browser
const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
  },
  // 2. Tell Redux to start with this saved state!
  preloadedState: preloadedState ? { auth: preloadedState } : undefined,
});

// 3. Listen for changes. Anytime ANY action is dispatched, save the new auth state!
store.subscribe(() => {
  const currentState = store.getState().auth;
  // Don't save state if we're in the middle of a logout operation
  if (!isLoggingOut) {
    saveState(currentState);
  }
});

// 4. Token validation system - monitor localStorage for token changes
let lastKnownToken = null;
let isLoggingOut = false; // Flag to prevent saveState during logout

// Function to check token validity and logout if needed
const validateToken = () => {
  const currentState = store.getState().auth;
  
  // Direct localStorage check (more reliable than loadState function)
  const directStoredState = localStorage.getItem("vcs_auth_state");
  let parsedStoredState = null;
  
  try {
    parsedStoredState = directStoredState ? JSON.parse(directStoredState) : null;
  } catch (error) {
    console.error("Error parsing stored state", error);
    parsedStoredState = null;
  }
  
  // If user is logged in but token is missing from localStorage
  if (currentState.isLoggedIn && (!parsedStoredState || !parsedStoredState.token)) {
    console.warn('Token removed from localStorage - logging out user immediately');
    isLoggingOut = true; // Set flag to prevent saveState
    store.dispatch({ type: 'auth/logoutUser' });
    // Reset flag after a short delay
    setTimeout(() => {
      isLoggingOut = false;
    }, 1000);
    return;
  }
  
  // Update last known token
  if (parsedStoredState && parsedStoredState.token) {
    lastKnownToken = parsedStoredState.token;
  }
};

// Check token every 500ms for faster response
const tokenCheckInterval = setInterval(validateToken, 500);

// Also listen to storage events from other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'vcs_auth_state') {
    validateToken();
  }
});

// Immediate check on store creation
setTimeout(validateToken, 100);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  clearInterval(tokenCheckInterval);
});

export default store;
