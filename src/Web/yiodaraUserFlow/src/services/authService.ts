import { jwtDecode } from 'jwt-decode';
import api from './api';

// Constants
const AUTH_ENDPOINTS = {
  LOGIN: '/Auth/login',
  REFRESH_TOKEN: '/Auth/refreshToken',
};

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'user',
  TOKEN_EXPIRATION: 'token_expiration'
};

// Types
export interface SignupRequest {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    token: string;
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiry: string;
    email: string;
    role: string;
    validationErrors: Array<{
      memberNames: string[];
      errorMessage: string;
    }>;
  };
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface RequestOtpRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface GoogleAuthRequest {
  email: string;
  fullName: string;
  googleId: string;
  imageUrl?: string;
}

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

const authService = {
  /**
   * Sign up a new user
   */
  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/Auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/Auth/login', credentials);
    
    // Store tokens in localStorage
    if (response.data.succeeded && response.data.data) {
      // Get the access token
      const token = response.data.data.accessToken;
      authService.setTokens(token, response.data.data.refreshToken);
      
      // Extract role from JWT token
      const decoded = jwtDecode<any>(token);
      // Check for role claim in different possible formats
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                   decoded.role || 
                   'user';
      
      // Derive a temporary username from the email address
      const email = response.data.data.email;
      const derivedUserName = email.substring(0, email.indexOf('@'));
      
      // Store user info with userId from response
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify({
        email: email,
        userId: response.data.data.userId,
        role: role,
        userName: derivedUserName,
        fullName: response.data.data.fullName || derivedUserName, // Use backend fullName if available
        profileImage: null // Will be updated by Google auth if needed
      }));
    }
    
    return response.data;
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
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRATION, (decoded.exp * 1000).toString());
      }
    } catch (error) {
      console.error('Error decoding token during storage:', error);
    }
  },

  /**
   * Check if token is expired or about to expire (within 5 minutes)
   */
  isTokenExpired: (): boolean => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return true;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      // Consider token expired if it expires within 5 minutes (300 seconds)
      return decoded.exp < (currentTime + 300);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshTokenParam?: string): Promise<boolean> => {
    const refreshToken = refreshTokenParam || localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      console.error('No refresh token available');
      return false;
    }
    
    try {
      // Use fetch to avoid interceptor loop
      const response = await fetch(`${api.defaults.baseURL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        console.error(`Failed to refresh token: ${response.status} ${response.statusText}`);
        // Clear tokens on 401/403 to force re-login
        if (response.status === 401 || response.status === 403) {
          authService.clearTokens();
          // Redirect to login page
          window.location.href = '/login?session=expired';
        }
        return false;
      }
      
      const data = await response.json();
      
      if (data.succeeded && data.data) {
        // Get the token (could be named token or accessToken)
        const token = data.data.accessToken || data.data.token;
        authService.setTokens(token, data.data.refreshToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
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
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRATION);
  },

  /**
   * Get current access token (for compatibility - synchronous version)
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get current access token with auto-refresh
   * Now returns a promise to support auto-refresh
   */
  getAccessTokenAsync: async (): Promise<string | null> => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return null;
    
    // If token is expired or about to expire, try to refresh it first
    if (authService.isTokenExpired()) {
      const refreshed = await authService.refreshToken();
      if (!refreshed) {
        // If refresh failed, clear tokens and return null
        authService.clearTokens();
        // Redirect to login page
        window.location.href = '/login?session=expired';
        return null;
      }
      // Return the new token after successful refresh
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
    
    return token;
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
   * Get user info from localStorage
   */
  getUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get user info from token
   */
  getUserInfoFromToken: () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    if (!token) return null;
    
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error('Error decoding token for user info:', error);
      return null;
    }
  },

  /**
   * Request password reset OTP
   */
  requestPasswordResetOtp: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/Auth/getOtpForResetPassword', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (resetData: ResetPasswordRequest): Promise<AuthResponse> => {
    try {
      console.log('Sending reset password request with data:', JSON.stringify(resetData));
      const response = await api.post('/Auth/resetPassword', resetData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Reset password response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  /**
   * Change user's password
   */
  changePassword: async (passwordData: ChangePasswordRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/Auth/changePassword', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
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
   * Get user info from localStorage with proper ID field
   */
  getUserInfo: () => {
    try {
      const userInfoStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      if (!userInfoStr) return null;
      
      const userData = JSON.parse(userInfoStr);
      
      // Make sure we have both id and userId fields for compatibility
      if (userData.userId && !userData.id) {
        userData.id = userData.userId;
      } else if (userData.id && !userData.userId) {
        userData.userId = userData.id;
      }
      
      return userData;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  },

  /**
   * Store user data from login response
   */
  storeUserData: (loginResponse: any, googleProfileImage?: string) => {
    if (loginResponse && loginResponse.succeeded && loginResponse.data) {
      // Store tokens if they exist in the response
      if (loginResponse.data.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, loginResponse.data.accessToken);
      }
      
      if (loginResponse.data.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, loginResponse.data.refreshToken);
      }
      
      // Store user information
      const userData = {
        id: loginResponse.data.userId,
        userId: loginResponse.data.userId, // Store both formats for compatibility
        email: loginResponse.data.email,
        role: loginResponse.data.role || 'user',
        fullName: loginResponse.data.fullName,
        userName: loginResponse.data.email?.split('@')[0] || '',
        profileImage: googleProfileImage || loginResponse.data.profileImage || null
      };
      
      console.log('Storing user data:', userData);
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
      return true;
    } else {
      console.error('Invalid login response for storing user data:', loginResponse);
      return false;
    }
  },

  /**
   * Initialize Google Sign-In
   */
  initializeGoogleAuth: (clientId: string, callback: (response: any) => void) => {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: callback,
        auto_select: false,
        cancel_on_tap_outside: true,
        // Using popup mode for better client-side integration
        ux_mode: 'popup'
      });
    }
  },

  /**
   * Handle Google credential response
   */
  handleGoogleCredential: async (credentialResponse: any, updateUserCallback?: (userData: any) => void): Promise<AuthResponse> => {
    try {
      // Decode the JWT credential from Google
      const decoded = jwtDecode<any>(credentialResponse.credential);
      
      console.log('Google user data:', decoded); // Debug log
      
      // Extract user information from Google JWT
      const googleUserData: GoogleAuthRequest = {
        email: decoded.email,
        fullName: decoded.name,
        googleId: decoded.sub,
        imageUrl: decoded.picture,
      };

      console.log('Processed Google data:', googleUserData); // Debug log

      // Create a password that satisfies common validation rules
      // Format: GoogleAuth123_{googleId} - has uppercase, lowercase, numbers, special char
      const googlePassword = `GoogleAuth123_${googleUserData.googleId}`;
      
      // Try to login first (user might already exist)
      const loginData: LoginRequest = {
        email: googleUserData.email,
        password: googlePassword
      };

      console.log('Attempting login with:', loginData); // Debug log

      try {
        const loginResponse = await authService.login(loginData);
        console.log('Login successful:', loginResponse);
        
        // Store Google profile image and update user data for Google users
        if (loginResponse.succeeded && googleUserData.imageUrl) {
          console.log('Storing Google profile image:', googleUserData.imageUrl);
          
          // Update localStorage immediately
          const existingUserData = authService.getUserInfo();
          console.log('Existing user data before update:', existingUserData);
          if (existingUserData) {
            const updatedData = {
              ...existingUserData,
              profileImage: googleUserData.imageUrl,
              fullName: googleUserData.fullName
            };
            localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(updatedData));
            console.log('Updated user data with profile image:', updatedData);
            
            // Trigger callback with updated data
            if (updateUserCallback) {
              updateUserCallback(updatedData);
            }
          }
        }
        
        return loginResponse;
      } catch (loginError: any) {
        console.log('Login failed, trying signup...', loginError);
        console.log('Login error details:', {
          status: loginError.response?.status,
          statusText: loginError.response?.statusText,
          data: loginError.response?.data,
          message: loginError.message
        });
        console.log('Login error response data:', JSON.stringify(loginError.response?.data, null, 2));
        
        // If login fails, try signup
        const signupData: SignupRequest = {
          fullName: googleUserData.fullName,
          userName: googleUserData.email.split('@')[0], // Use email prefix as username
          email: googleUserData.email,
          password: googlePassword, // Use the same password format for consistency
          role: 'user'
        };

        console.log('Attempting signup with:', signupData); // Debug log

        try {
          const signupResponse = await authService.signup(signupData);
          console.log('Signup successful:', signupResponse);
          
          // Store Google profile image for new Google users  
          if (signupResponse.succeeded && googleUserData.imageUrl) {
            console.log('Storing Google profile image for new user:', googleUserData.imageUrl);
            
            const existingUserData = authService.getUserInfo();
            console.log('New user data before update:', existingUserData);
            if (existingUserData) {
              const updatedData = {
                ...existingUserData,
                profileImage: googleUserData.imageUrl,
                fullName: googleUserData.fullName
              };
              localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(updatedData));
              console.log('Updated new user data with profile image:', updatedData);
              
              // Trigger callback with updated data
              if (updateUserCallback) {
                updateUserCallback(updatedData);
              }
            }
          }
          
          return signupResponse;
        } catch (signupError: any) {
          console.error('Signup also failed:', signupError);
          console.error('Signup error details:', {
            status: signupError.response?.status,
            statusText: signupError.response?.statusText,
            data: signupError.response?.data,
            message: signupError.message
          });
          console.error('Signup error response data:', JSON.stringify(signupError.response?.data, null, 2));
          throw signupError;
        }
      }

    } catch (error: any) {
      console.error('Google auth error:', error);
      console.error('Google auth error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  /**
   * Sign in with Google
   */
  signInWithGoogle: () => {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.prompt();
    }
  },

  /**
   * Render Google Sign-In button
   */
  renderGoogleButton: (elementId: string, options?: any) => {
    if (typeof window !== 'undefined' && window.google) {
      const element = document.getElementById(elementId);
      if (element) {
        window.google.accounts.id.renderButton(element, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          ...options
        });
      }
    }
  }
};

export default authService;