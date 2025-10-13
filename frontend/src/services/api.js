import { API_CONFIG, buildApiUrl, addQueryParams } from '../utils/config';
import { getAuthToken, logout } from '../utils/auth';

// API service class
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Get headers for API requests
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      params = {},
      queryParams = {},
      includeAuth = true,
      ...restOptions
    } = options;

    let url = buildApiUrl(endpoint, params);
    
    if (Object.keys(queryParams).length > 0) {
      url = addQueryParams(url, queryParams);
    }

    const config = {
      method,
      headers: this.getHeaders(includeAuth),
      ...restOptions,
    };

    if (body) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle authentication errors
      if (response.status === 401) {
        logout();
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth API methods
  async register(userData) {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: userData,
      includeAuth: false,
    });
  }

  async login(credentials) {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: credentials,
      includeAuth: false,
    });
  }

  async getProfile() {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  }

  async updateProfile(profileData) {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, {
      method: 'PUT',
      body: profileData,
    });
  }

  async changePassword(passwordData) {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: 'PUT',
      body: passwordData,
    });
  }

  // User API methods
  async getUserStats() {
    return this.request(API_CONFIG.ENDPOINTS.USERS.STATS);
  }

  async getAdminStats() {
    return this.request(API_CONFIG.ENDPOINTS.USERS.ADMIN_STATS);
  }

  async createUser(userData) {
    return this.request(API_CONFIG.ENDPOINTS.USERS.CREATE, {
      method: 'POST',
      body: userData,
    });
  }

  async getAllUsers(queryParams = {}) {
    return this.request(API_CONFIG.ENDPOINTS.USERS.GET_ALL, {
      queryParams,
    });
  }

  async getUserById(id) {
    alert(id);
    return this.request(`${API_CONFIG.ENDPOINTS.USERS.GET_BY_ID}/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`${API_CONFIG.ENDPOINTS.USERS.UPDATE}/${id}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.USERS.DELETE}/${id}`, {
      method: 'DELETE',
    });
  }

  // Post API methods
  async createPost(postData) {
    return this.request(API_CONFIG.ENDPOINTS.POSTS.CREATE, {
      method: 'POST',
      body: postData,
    });
  }

  async getAllPosts(queryParams = {}) {
    return this.request(API_CONFIG.ENDPOINTS.POSTS.GET_ALL, {
      queryParams,
    });
  }

  async getPostById(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.POSTS.GET_BY_ID}/${id}`);
  }

  async updatePost(id, postData) {
    return this.request(`${API_CONFIG.ENDPOINTS.POSTS.UPDATE}/${id}`, {
      method: 'PUT',
      body: postData,
    });
  }

  async deletePost(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.POSTS.DELETE}/${id}`, {
      method: 'DELETE',
    });
  }

  async generateAIPost(aiData) {
    return this.request(API_CONFIG.ENDPOINTS.POSTS.GENERATE_AI, {
      method: 'POST',
      body: aiData,
    });
  }

  async publishPost(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.POSTS.PUBLISH}/${id}/publish`, {
      method: 'POST',
    });
  }

  // Plan API methods
  async getActivePlans() {
    return this.request(API_CONFIG.ENDPOINTS.PLANS.GET_ACTIVE);
  }

  async getAllPlans(queryParams = {}) {
    return this.request(API_CONFIG.ENDPOINTS.PLANS.GET_ALL, {
      queryParams,
    });
  }

  async getPlanById(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.PLANS.GET_BY_ID}/${id}`);
  }

  async createPlan(planData) {
    return this.request(API_CONFIG.ENDPOINTS.PLANS.CREATE, {
      method: 'POST',
      body: planData,
    });
  }

  async updatePlan(id, planData) {
    return this.request(`${API_CONFIG.ENDPOINTS.PLANS.UPDATE}/${id}`, {
      method: 'PUT',
      body: planData,
    });
  }

  async deletePlan(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.PLANS.DELETE}/${id}`, {
      method: 'DELETE',
    });
  }

  async togglePlanStatus(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.PLANS.TOGGLE_STATUS}/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // Subscription API methods
  async getMySubscription() {
    return this.request(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.GET_MY);
  }

  async getAllSubscriptions(queryParams = {}) {
    return this.request(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.GET_ALL, {
      queryParams,
    });
  }

  async getSubscriptionById(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.GET_BY_ID}/${id}`);
  }

  async createSubscription(subscriptionData) {
    return this.request(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.CREATE, {
      method: 'POST',
      body: subscriptionData,
    });
  }

  async updateSubscription(id, subscriptionData) {
    return this.request(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.UPDATE}/${id}`, {
      method: 'PUT',
      body: subscriptionData,
    });
  }

  async cancelSubscription(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.CANCEL}/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async renewSubscription(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.RENEW}/${id}/renew`, {
      method: 'PUT',
    });
  }

  // Social Account API methods
  async getMySocialAccounts() {
    return this.request(API_CONFIG.ENDPOINTS.SOCIAL_ACCOUNTS.GET_MY);
  }

  async getAllSocialAccounts(queryParams = {}) {
    return this.request(API_CONFIG.ENDPOINTS.SOCIAL_ACCOUNTS.GET_ALL, {
      queryParams,
    });
  }

  async getSocialAccountById(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.SOCIAL_ACCOUNTS.GET_BY_ID}/${id}`);
  }

  async createSocialAccount(socialAccountData) {
    return this.request(API_CONFIG.ENDPOINTS.SOCIAL_ACCOUNTS.CREATE, {
      method: 'POST',
      body: socialAccountData,
    });
  }

  async updateSocialAccount(id, socialAccountData) {
    return this.request(`${API_CONFIG.ENDPOINTS.SOCIAL_ACCOUNTS.UPDATE}/${id}`, {
      method: 'PUT',
      body: socialAccountData,
    });
  }

  async deleteSocialAccount(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.SOCIAL_ACCOUNTS.DELETE}/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleSocialAccountStatus(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.SOCIAL_ACCOUNTS.TOGGLE_STATUS}/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async refreshSocialAccountToken(id, tokenData) {
    return this.request(`${API_CONFIG.ENDPOINTS.SOCIAL_ACCOUNTS.REFRESH_TOKEN}/${id}/refresh-token`, {
      method: 'PUT',
      body: tokenData,
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
