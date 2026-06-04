// Authentication utilities for localStorage management
export const AUTH_STORAGE_KEY = "social_lovable_auth";
import socket from "@/utils/socket";
// Get auth data from localStorage
export const getAuthData = () => {
  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    return authData ? JSON.parse(authData) : null;
  } catch (error) {
    return null;
  }
};

// Set auth data in localStorage
export const setAuthData = (authData) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } catch (error) {
  }
};

// Remove auth data from localStorage
export const removeAuthData = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
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

// Decode JWT without library
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return (decoded.exp * 1000) < Date.now();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const authData = getAuthData();
  if (!authData?.token || !authData?.user) return false;

  if (isTokenExpired(authData.token)) {
    removeAuthData();
    return false;
  }

  return true;
};

// Check if user is admin
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.user_type === "admin";
};

// Check if user is client
export const isClient = () => {
  const user = getCurrentUser();
  return user?.user_type === "client";
};

// Get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.user_type || "client";
};

// Logout user
export const logout = () => {
  removeAuthData();
  // Redirect to auth page
  socket.disconnect(); // IMPORTANT

  localStorage.clear();
  window.location.href = "/auth";
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

  window.addEventListener("storage", handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
};
