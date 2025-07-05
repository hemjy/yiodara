import { useEffect, useState } from 'react';
import authService from '@/services/authService';

interface User {
  id: string;
  email: string;
  name?: string;
  // Add other user properties as needed
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = authService.getAccessToken();
        const userInfo = authService.getUserInfo();
        
        setIsAuthenticated(!!token);
        setUser(userInfo);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Listen for storage events (in case user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { 
    isAuthenticated, 
    isLoading,
    user
  };
}; 