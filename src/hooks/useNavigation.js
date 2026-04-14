import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../constants';

// Custom hook for navigation with auth awareness
export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  
  // Navigation helpers
  const goTo = (path) => navigate(path);
  const goBack = () => navigate(-1);
  const replace = (path) => navigate(path, { replace: true });
  
  // Auth-aware navigation
  const goToLogin = () => navigate('/');
  const goToDashboard = () => {
    if (!isLoggedIn) {
      goToLogin();
      return;
    }
    
    // Route to appropriate dashboard based on role
    switch (role) {
      case 'admin':
        goTo(ROUTES.PROTECTED.ADMIN);
        break;
      case 'student':
        goTo(ROUTES.PROTECTED.STUDENT);
        break;
      case 'teacher':
        goTo(ROUTES.PROTECTED.TEACHER);
        break;
      case 'parent':
        goTo(ROUTES.PROTECTED.PARENT);
        break;
      default:
        goToLogin();
    }
  };
  
  // Protected navigation (redirects to login if not authenticated)
  const goToProtected = (path) => {
    if (isLoggedIn) {
      goTo(path);
    } else {
      goToLogin();
    }
  };
  
  // Current path helpers
  const isActivePath = (path) => location.pathname === path;
  const isCurrentPath = (path) => isActivePath(path);
  const isPublicRoute = Object.values(ROUTES.PUBLIC).some(route => {
    // Handle dynamic routes like /teacher/:id
    const routePattern = route.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(location.pathname);
  });
  const isProtectedRoute = Object.values(ROUTES.PROTECTED).some(route => {
    const routePattern = route.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(location.pathname);
  });
  
  return {
    // Basic navigation
    navigate: goTo,
    goBack,
    replace,
    
    // Auth-aware navigation
    goToLogin,
    goToDashboard,
    goToProtected,
    
    // Path helpers
    isActivePath,
    isCurrentPath,
    isPublicRoute,
    isProtectedRoute,
    
    // Current state
    currentPath: location.pathname,
    location,
  };
};
