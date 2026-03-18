// Centralized localStorage management for authentication
const ACCESS_TOKEN_KEY = 'vcs_access_token';
const AUTH_USER_KEY = 'vcs_auth_user';

export const authStorage = {
  // Token management
  getAccessToken: () => {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error accessing access token from localStorage:', error);
      return null;
    }
  },

  setAccessToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error setting access token in localStorage:', error);
    }
  },

  removeAccessToken: () => {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing access token from localStorage:', error);
    }
  },

  // User data management
  getStoredAuthUser: () => {
    try {
      const userStr = localStorage.getItem(AUTH_USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored auth user:', error);
      return null;
    }
  },

  setStoredAuthUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    } catch (error) {
      console.error('Error setting stored auth user in localStorage:', error);
    }
  },

  removeStoredAuthUser: () => {
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
      console.error('Error removing stored auth user from localStorage:', error);
    }
  },

  // Clear all auth data
  clearAuthStorage: () => {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  },

  // Check if user is authenticated (has valid token)
  isAuthenticated: () => {
    const token = authStorage.getAccessToken();
    return !!token;
  },

  // Get complete auth state
  getAuthState: () => {
    const token = authStorage.getAccessToken();
    const user = authStorage.getStoredAuthUser();
    
    return {
      isLoggedIn: !!token,
      token,
      user,
      role: user?.role || null,
      username: user?.username || null,
    };
  },

  // Set complete auth state
  setAuthState: (token, user) => {
    authStorage.setAccessToken(token);
    authStorage.setStoredAuthUser(user);
  },
};

export default authStorage;
