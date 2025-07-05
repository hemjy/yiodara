import { api } from '../client';
import { jwtDecode } from 'jwt-decode';

// Constants
const AUTH_ENDPOINTS = {
  LOGIN: '/api/Auth/login',
  REFRESH_TOKEN: '/api/Auth/refreshToken',
  CHANGE_PASSWORD: '/api/Auth/changePassword',
  SIGNUP: '/api/Auth/signup',
};

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'yiodara_access_token',
  REFRESH_TOKEN: 'yiodara_refresh_token',
  USER_INFO: 'yiodara_user_info',
};

// Types
interface LoginRequest {
  email: string;
  password: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    fullName: string;
  } | null;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

// Service implementation
export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
      const data = response.data;
      
      if (data.succeeded && data.data) {
        authService.setTokens(data.data.accessToken, data.data.refreshToken);
        authService.setUserInfo(data.data);
        return data;
      }
      
      return {
        ...data,
        succeeded: false,
      };
    } catch (error: any) {
      console.error('Login error occurred:', error);
      const errorResponse = error.response?.data || {};
      return {
        succeeded: false,
        message: errorResponse.message || 'An error occurred during login',
        errors: errorResponse.errors || [error.toString()],
        data: null,
      };
    }
  },
  
  /**
   * Set tokens in localStorage with expiration tracking
   */
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    
    // Store token expiration time for additional validation
    try {
      const decoded = jwtDecode<DecodedToken>(accessToken);
      if (decoded.exp) {
        // Store expiration as a timestamp in milliseconds
        localStorage.setItem('token_expiration', (decoded.exp * 1000).toString());
      }
    } catch (error) {
      console.error('Error decoding token during storage:', error);
    }
  },
  
  /**
   * Store user info in localStorage
   */
  setUserInfo: (userInfo: object) => {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
  },
  
  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      console.error('No refresh token available');
      return false;
    }
    
    try {
      // Use fetch to avoid interceptor loop
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://yiodara.onrender.com'}${AUTH_ENDPOINTS.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }), // Make sure this matches your API's expected format
      });
      
      if (!response.ok) {
        console.error(`Failed to refresh token: ${response.status} ${response.statusText}`);
        // Clear tokens on 401/403 to force re-login
        if (response.status === 401 || response.status === 403) {
          authService.clearTokens();
        }
        return false;
      }
      
      const data = await response.json();
      console.log('Refresh token response:', data);
      
      if (data.succeeded && data.data) {
        authService.setTokens(data.data.accessToken, data.data.refreshToken);
        // Assuming the refresh response also contains user info
        if (data.data.user) {
          authService.setUserInfo(data.data.user);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on failure to avoid login loops
      authService.clearTokens();
      return false;
    }
  },
  
  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired: (): boolean => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return true;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      // Check if token will expire in the next 60 seconds
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime + 60;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },
  
  /**
   * Logout user
   */
  logout: (): void => {
    authService.clearTokens();
    // Redirect to login page
    window.location.href = '/login';
  },
  
  /**
   * Clear tokens from localStorage
   */
  clearTokens: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem('token_expiration');
  },
  
  /**
   * Get current access token
   * Now returns a promise to support auto-refresh
   */
  getAccessToken: async (): Promise<string | null> => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return null;
    
    // If token is expired or about to expire, try to refresh it first
    if (authService.isTokenExpired()) {
      const refreshed = await authService.refreshToken();
      if (!refreshed) {
        // If refresh failed, clear tokens and return null
        authService.clearTokens();
        return null;
      }
      // Return the new token after successful refresh
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
    
    return token;
  },
  
  /**
   * Get current refresh token
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return false;
    
    // Check if token is valid and not expired
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error validating authentication status:', error);
      return false;
    }
  },
  
  /**
   * Get user info from token
   */
  getUserInfo: () => {
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (!userInfo) return null;
    
    try {
      return JSON.parse(userInfo);
    } catch (error) {
      console.error('Error parsing user info from storage:', error);
      return null;
    }
  },
  
  /**
   * Debug function to help diagnose token issues
   */
  debugAuth: () => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    console.log('Access token exists:', !!accessToken);
    console.log('Refresh token exists:', !!refreshToken);
    
    if (accessToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(accessToken);
        const currentTime = Date.now() / 1000;
        console.log('Token expired:', decoded.exp < currentTime, 
                   'Time remaining:', Math.floor(decoded.exp - currentTime), 'seconds');
      } catch (e) {
        console.error('Invalid access token:', e);
      }
    }
  },

  /**
   * Change user password
   */
  changePassword: async (passwordData: any): Promise<any> => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      return response.data;
    } catch (error: any) {
      console.error('Change password error occurred:', error);
      return {
        succeeded: false,
        message: error.response?.data?.message || 'An error occurred while changing password',
        errors: error.response?.data?.errors || [error.toString()],
      };
    }
  },

  /**
   * Sign up a new admin user
   */
  signup: async (userData: any): Promise<any> => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.SIGNUP, { ...userData, role: 'Admin' });
      return response.data;
    } catch (error: any) {
      console.error('Signup error occurred:', error);
      return {
        succeeded: false,
        message: error.response?.data?.message || 'An error occurred during signup',
        errors: error.response?.data?.errors || [error.toString()],
      };
    }
  },
};