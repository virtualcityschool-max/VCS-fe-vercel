import { adminService } from '../services/adminService';
import authStorage from './authStorage';

/**
 * Check if impersonation is currently active.
 */
export const isImpersonating = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('vcs_impersonator_backup');
};

/**
 * Restore the backed-up admin session and clear impersonation state.
 */
export const restoreAdminSession = (redirectUrl = null) => {
  if (typeof window === 'undefined') return false;
  const backupStr = localStorage.getItem('vcs_impersonator_backup');
  if (!backupStr) return false;

  try {
    const backup = JSON.parse(backupStr);
    if (backup.access) {
      authStorage.setAccessToken(backup.access);
    }
    if (backup.refresh) {
      localStorage.setItem('vcs_refresh_token', backup.refresh);
    }
    if (backup.user) {
      authStorage.setStoredAuthUser(backup.user);
    }
    localStorage.removeItem('vcs_impersonator_backup');

    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
    return true;
  } catch (err) {
    console.error('Error restoring admin auth:', err);
    localStorage.removeItem('vcs_impersonator_backup');
    return false;
  }
};

/**
 * Log in as a target user (impersonation) and redirect to their workspace.
 * Saves current admin credentials so the admin can safely return anytime.
 */
export const handleImpersonateUser = async (userId, userRole = 'student') => {
  try {
    const data = await adminService.impersonateUser(userId);
    if (!data?.access) {
      throw new Error('Failed to obtain impersonation credentials');
    }

    // Save admin backup to localStorage if not already impersonating
    if (!localStorage.getItem('vcs_impersonator_backup')) {
      const adminBackup = {
        access: authStorage.getAccessToken(),
        refresh: localStorage.getItem('vcs_refresh_token'),
        user: authStorage.getStoredAuthUser(),
      };
      localStorage.setItem('vcs_impersonator_backup', JSON.stringify(adminBackup));
    }

    // Set target user's auth state
    authStorage.setAccessToken(data.access);
    if (data.refresh) {
      localStorage.setItem('vcs_refresh_token', data.refresh);
    }
    authStorage.setStoredAuthUser(data.user);

    // Redirect to the appropriate portal
    const role = (data.user?.role || userRole || '').toLowerCase();
    if (role === 'teacher') {
      window.location.href = '/teacher';
    } else if (role === 'parent') {
      window.location.href = '/parent';
    } else {
      window.location.href = '/student';
    }
  } catch (err) {
    console.error('Impersonation error:', err);
    throw err;
  }
};

export default handleImpersonateUser;

