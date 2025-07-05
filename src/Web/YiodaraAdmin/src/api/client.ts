import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from './services/authService';

const AUTH_ENDPOINTS = {
  LOGIN: '/api/Auth/login',
  REFRESH_TOKEN: '/api/Auth/refreshToken',
};

// Create axios instance with base URL
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://yiodara.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if a token refresh is in progress
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

// Process the queue of failed requests
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(request => {
    if (error) {
      request.reject(error);
    } else {
      // Retry the request with the new token
      if (token && request.config.headers) {
        request.config.headers.Authorization = `Bearer ${token}`;
      }
      request.resolve(api(request.config));
    }
  });
  
  // Reset the queue
  failedQueue = [];
};

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    // Skip auth for login and token refresh requests
    if (config.url === AUTH_ENDPOINTS.LOGIN || config.url === AUTH_ENDPOINTS.REFRESH_TOKEN) {
      return config;
    }

    try {
      // Get token, attempting refresh if needed
      const token = await authService.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (!token) {
        // If no token and not trying to login/refresh, we have a problem
        console.warn('No token available for request:', config.url);
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Check if the error is due to an expired token (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry && 
        originalRequest.url !== AUTH_ENDPOINTS.LOGIN && 
        originalRequest.url !== AUTH_ENDPOINTS.REFRESH_TOKEN) {
      
      // If we're already refreshing, add this request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Attempt to refresh the token
        const refreshed = await authService.refreshToken();
        
        if (refreshed) {
          // If refresh was successful, get the new token
          const newToken = await authService.getAccessToken();
          
          // Process any queued requests with the new token
          processQueue(null, newToken);
          
          // Update the original request with the new token
          if (originalRequest.headers && newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            // Retry the original request
            return api(originalRequest);
          }
        } else {
          // If refresh failed, clear tokens and redirect to login
          authService.clearTokens();
          processQueue(error, null);
          
          // Redirect to login page with expired session indicator
          window.location.href = '/login?session=expired';
          return Promise.reject(new Error('Session expired. Please login again.'));
        }
      } catch (refreshError) {
        // Handle refresh token errors
        authService.clearTokens();
        processQueue(error, null);
        
        // Redirect to login page
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

// Helper methods for API calls with proper typing
export const apiClientInstance = api;

// Run debug on initialization to help troubleshoot
setTimeout(() => {
  if (authService.isAuthenticated()) {
    authService.debugAuth();
  }
}, 0);