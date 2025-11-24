// Backend API Configuration
export const API_CONFIG = {
  // BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:9999/api',
  //BASE_URL: import.meta.env.VITE_API_URL || `${window.location.origin}/backend/api/`,
 // BASE_URL: import.meta.env.VITE_API_URL || `https://socialvibe.tradestreet.in/backend/api/`,

  BASE_URL : window.location.hostname === "localhost" ? 'http://localhost:9999/api' : `${window.location.origin}/backend/api`,

  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      PROFILE: '/auth/profile',
      UPDATE_PROFILE: '/auth/profile',
      CHANGE_PASSWORD: '/auth/change-password'
    },
    // User endpoints
    USERS: {
      STATS: '/users/stats',
      ADMIN_STATS: '/users/admin-stats',
      CREATE: '/users',
      GET_ALL: '/users',
      GET_BY_ID: '/users',
      UPDATE: '/users',
      DELETE: '/users',
      UPDATE_STATUS: '/users/:id/status',
      DELETED_LIST: '/users/deleted/list'
    },
    // Post endpoints
    POSTS: {
      CREATE: '/posts',
      GET_ALL: '/posts',
      GET_BY_ID: '/posts',
      UPDATE: '/posts',
      DELETE: '/posts',
      GENERATE_AI: '/posts/generate-ai',
      PUBLISH: '/posts',
      APPROVE: '/posts/approve'
    },
    // Plan endpoints
    PLANS: {
      GET_ACTIVE: '/plans/active',
      GET_ALL: '/plans',
      GET_BY_ID: '/plans',
      CREATE: '/plans',
      UPDATE: '/plans',
      DELETE: '/plans',
      TOGGLE_STATUS: '/plans'
    },
    // Subscription endpoints
    SUBSCRIPTIONS: {
      GET_MY: '/subscriptions/my-subscription',
      GET_ALL: '/subscriptions',
      GET_BY_ID: '/subscriptions',
      CREATE: '/subscriptions',
      UPDATE: '/subscriptions',
      CANCEL: '/subscriptions',
      RENEW: '/subscriptions',
      CREATE_ORDER: '/subscriptions/razorpay/order',
      VERIFY_PAYMENT: '/subscriptions/razorpay/verify'
    },
    // Social Account endpoints
    SOCIAL_ACCOUNTS: {
      GET_MY: '/social-accounts/my-accounts',
      GET_ALL: '/social-accounts',
      GET_BY_ID: '/social-accounts',
      CREATE: '/social-accounts',
      UPDATE: '/social-accounts',
      DELETE: '/social-accounts',
      TOGGLE_STATUS: '/social-accounts',
      REFRESH_TOKEN: '/social-accounts',
      UPDATE_CREDENTIALS: '/social-accounts/credentials',
      GET_CONNECTED_ACCOUNTS: '/social-accounts/connected-accounts'
    }
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Replace path parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Helper function to add query parameters
export const addQueryParams = (url, params = {}) => {
  const urlObj = new URL(url);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      urlObj.searchParams.append(key, params[key]);
    }
  });
  return urlObj.toString();
};
