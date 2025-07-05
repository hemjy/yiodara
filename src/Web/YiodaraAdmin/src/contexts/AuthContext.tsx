import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../api/services/authService';

// Types
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  changePassword: (passwordData: any) => Promise<any>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        setIsAuthenticated(true);
        setUser(authService.getUserInfo());
      } else {
        // Try to refresh token
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          setIsAuthenticated(true);
          setUser(authService.getUserInfo());
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login...');
      const response = await authService.login({ email, password });
      
      // Check if login was successful
      if (response.succeeded) {
        console.log('Login successful');
        setIsAuthenticated(true);
        setUser(authService.getUserInfo());
        setLoading(false);
        return true;
      }
      
      console.error('Login failed:', response.message);
      setError(response.message || 'Login failed');
      setLoading(false);
      return false;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
      return false;
    }
  };
  
  // Change password function
  const changePassword = async (passwordData: any) => {
    // We can add loading/error state for this specific action if needed
    try {
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (error: any) {
      return {
        succeeded: false,
        message: error.response?.data?.message || 'An unexpected error occurred',
      };
    }
  };
  
  // Logout function
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };
  
  // Context value
  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    error,
    changePassword,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 