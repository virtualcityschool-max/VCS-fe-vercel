import { useSelector } from 'react-redux';

// Custom hook for authentication state
export const useAuth = () => {
  const auth = useSelector((state) => state.auth);
  
  return {
    // Auth state
    isLoggedIn: auth.isLoggedIn,
    isInitialized: auth.isInitialized,
    user: auth.user,
    role: auth.role,
    token: auth.token,
    isLoading: auth.isLoading,
    error: auth.error,
    
    // Convenience methods
    isAuthenticated: auth.isLoggedIn && auth.isInitialized,
    isStudent: auth.role === 'student',
    isTeacher: auth.role === 'teacher', 
    isAdmin: auth.role === 'admin',
    isParent: auth.role === 'parent',
    
    // User display info
    displayName: auth.user?.username || auth.user?.email || 'User',
    email: auth.user?.email,
    
    // Auth status checks
    hasToken: !!auth.token,
    needsInitialization: !auth.isInitialized,
  };
};
