import { API_CONFIG, buildApiUrl, addQueryParams } from '../utils/config';
import { getAuthToken, logout } from '../utils/auth';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  async verifyOtp(data) {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {
      method: 'POST',
      body: data,
      includeAuth: false,
    });
  }

  async googleLogin(data) {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.GOOGLE, {
      method: 'POST',
      body: data,
      includeAuth: false,
    });
  }

  async facebookLogin(data) {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.FACEBOOK, {
      method: 'POST',
      body: data,
      includeAuth: false,
    });
  }

  // ...existing methods...
}

export const apiService = new ApiService();
