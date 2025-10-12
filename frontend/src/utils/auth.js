// Authentication utilities for localStorage management
export const AUTH_STORAGE_KEY = 'social_lovable_auth';

// Get auth data from localStorage
export const getAuthData = () => {
  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    return authData ? JSON.parse(authData) : null;
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};

// Set auth data in localStorage
export const setAuthData = (authData) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error('Error setting auth data:', error);
  }
};

// Remove auth data from localStorage
export const removeAuthData = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing auth data:', error);
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const authData = getAuthData();
  return authData?.user || null;
};

// Get auth token from localStorage
export const getAuthToken = () => {
  const authData = getAuthData();
  return authData?.token || null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const authData = getAuthData();
  return !!(authData?.token && authData?.user);
};

// Check if user is admin
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.user_type === 'admin';
};

// Check if user is client
export const isClient = () => {
  const user = getCurrentUser();
  return user?.user_type === 'client';
};

// Get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.user_type || 'client';
};

// Logout user
export const logout = () => {
  removeAuthData();
  // Redirect to auth page
  window.location.href = '/auth';
};

// Auth state change listener
export const onAuthStateChange = (callback) => {
  // Listen for storage changes (for multi-tab support)
  const handleStorageChange = (e) => {
    if (e.key === AUTH_STORAGE_KEY) {
      const authData = e.newValue ? JSON.parse(e.newValue) : null;
      callback(authData);
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};
