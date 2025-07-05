import React, { createContext, useState, useEffect, useContext } from 'react';
import { CredentialResponse } from '../types/google';
import authService, {
  SignupRequest,
  LoginRequest,
  ResetPasswordRequest,
  AuthResponse,
  ChangePasswordRequest,
} from '../services/authService';

interface User {
  userId: string;
  email: string;
  role: string;
  userName: string;
  fullName: string;
  profileImage?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest, redirectTo?: string) => Promise<void>;
  signup: (userData: SignupRequest, redirectTo?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  requestPasswordResetOtp: (email: string) => Promise<AuthResponse>;
  resetPassword: (resetData: ResetPasswordRequest) => Promise<AuthResponse>;
  changePassword: (passwordData: ChangePasswordRequest) => Promise<AuthResponse>;
  loginWithGoogle: (credentialResponse: CredentialResponse, redirectTo?: string) => Promise<void>;
  initializeGoogleAuth: (clientId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = () => {
      const user = authService.getUserInfo();
      const isAuth = authService.isAuthenticated();
      
      console.log('AuthContext initializing - user data from localStorage:', user);
      console.log('Profile image in user data:', user?.profileImage);
      
      setCurrentUser(user);
      setIsAuthenticated(isAuth);
      setIsLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginRequest, redirectTo: string = '/') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      if (response.succeeded) {
        const user = authService.getUserInfo();
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Re-enable redirect after successful login
        window.location.href = redirectTo;
        console.log('Regular login successful! Redirecting to:', redirectTo);
      } else {
        const errorMessage = response.message || 'Login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during login';
      setError(errorMessage);
      throw error; // Re-throw the original error
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupRequest, redirectTo: string = '/') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.signup(userData);
      
      if (response.succeeded) {
        // After signup, automatically log in the user
        await login({
          email: userData.email,
          password: userData.password
        }, redirectTo);
      } else {
        const errorMessage = response.message || 'Signup failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during signup';
      setError(errorMessage);
      throw error; // Re-throw the original error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const clearError = () => {
    setError(null);
  };

  const requestPasswordResetOtp = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.requestPasswordResetOtp(email);
      
      console.log("responseData", response);
      if (!response.succeeded) {
        setError(response.message || 'Failed to send OTP');
      }
      
      return response;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'An error occurred while requesting OTP');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (resetData: ResetPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.resetPassword(resetData);
      console.log("responseData", response);
      
      if (!response.succeeded) {
        setError(response.message || 'Failed to reset password');
      }
      
      return response;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'An error occurred while resetting password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (passwordData: ChangePasswordRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.changePassword(passwordData);
      
      if (!response.succeeded) {
        setError(response.message || 'Failed to change password');
      }
      
      return response;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'An error occurred while changing password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credentialResponse: CredentialResponse, redirectTo: string = '/') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.handleGoogleCredential(
        credentialResponse, 
        (updatedUserData) => {
          // Callback when profile image is stored
          console.log('Callback: Profile image stored, updating user state:', updatedUserData);
          setCurrentUser(updatedUserData);
        }
      );
      
      if (response.succeeded) {
        const user = authService.getUserInfo();
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Re-enable redirect after successful authentication
        window.location.href = redirectTo;
        console.log('Google login successful! Redirecting to:', redirectTo);
      } else {
        const errorMessage = response.message || 'Google login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during Google login';
      setError(errorMessage);
      throw error; // Re-throw the original error
    } finally {
      setIsLoading(false);
    }
  };

  const initializeGoogleAuth = (clientId: string) => {
    authService.initializeGoogleAuth(clientId, (credentialResponse: CredentialResponse) => 
      loginWithGoogle(credentialResponse, '/')
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        error,
        login,
        signup,
        logout,
        clearError,
        requestPasswordResetOtp,
        resetPassword,
        changePassword,
        loginWithGoogle,
        initializeGoogleAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
